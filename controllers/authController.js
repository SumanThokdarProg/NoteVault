// NoteVault\controllers\authController.js
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const validateUserRequirements = require('../validators/authValidator');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { default: mongoose } = require('mongoose');
const Note = require('../models/Note');

const signupHandler = async (req, res) => {
    try {
        const { error, value } = validateUserRequirements(req.body);
        if(error) {
            return res.status(400).send(error.details[0].message);        // requirements dose not match
        }

        const userExists = await User.findOne({ email: value.email }).exec();
        if(userExists) {
            return res.sendStatus(409);    // email already exists
        }

        const hashPassword = await argon2.hash(value.password);
        const result = await User.create({
            email: value.email,
            password: hashPassword,
        });

        res.status(201).json({
            "userId": result._id,
            "email": result.email
        });
    } catch(error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}

const loginHandler = async (req, res) => {
    try {
        const { error, value } = validateUserRequirements(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        const validUser = await User.findOne({ email: value.email }).exec();
        if(!validUser) return res.sendStatus(404);

        const checkPassword = await argon2.verify(validUser.password, value.password);
        if(!checkPassword) return res.sendStatus(401);
        
        const newAccessToken = jwt.sign(
            { 
                "userid": validUser._id,
                "role": validUser.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m'}
        );
        const newRefreshToken = jwt.sign(
            { 
                "userid": validUser._id,
                "role": validUser.role
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d'}
        );

        const result = await RefreshToken.findOneAndUpdate(
            { user: validUser._id },        // how to find the document 
            {
                $set: { refreshToken: newRefreshToken }       // what data to update or insert
            },
            {
                upsert: true,                   // create document if it dose'n exists
                returnDocument: 'after',        // return the update/inserted document instead of the old one 
                runValidators: true             // enforce schema validation on update 
            }
        );
        // console.log(result);

        res.cookie('jwt', newRefreshToken, { 
            httpOnly: true, 
            sameSite: 'None', 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        res.json({ newAccessToken });

    } catch(error) {
        console.error(error.message);
        res.sendStatus(500);
    }
}

const refreshHandler = async (req, res) => {
    if(!req.cookies.jwt) return res.sendStatus(401);

    try {
        var decoded = jwt.verify(req.cookies.jwt, process.env.REFRESH_TOKEN_SECRET);
        if(!decoded.userid || !decoded.role) throw new Error('decoded userid or role not found');

        const findRefreshToken = await RefreshToken.findOne({ user: decoded.userid, refreshToken: req.cookies.jwt })
        if(!findRefreshToken) throw new Error('user already logout');

    } catch (error) {
        res.clearCookie('jwt');
        console.error(error.message);
        return res.sendStatus(403);
    }

    const newAccessToken = jwt.sign(
        { "userid": decoded.userid, "role": decoded.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m'}
    );
    res.json({ newAccessToken })
}

const logoutHandler = async (req, res) => {
    if(!req.cookies.jwt) return res.sendStatus(401);
    try {
        const deleteToken = await RefreshToken.findOneAndDelete({ refreshToken: req.cookies.jwt });
        // console.log(deleteToken);
        
        res.clearCookie('jwt');
        res.sendStatus(200);
    } catch (error) {
        res.clearCookie('jwt');
        console.error(error.message);
        return res.sendStatus(500);
    }
}

const deleteAccount = async (req, res) => {
    try {
        const currentUser = await User.findOne({ _id: req.user.userid });
        if(!currentUser) return res.sendStatus(404);

        const verify = await argon2.verify(currentUser.password, req.body.password);
        if(!verify) return res.sendStatus(401);

        await Note.deleteMany({ owner: currentUser._id });
        await RefreshToken.deleteMany({ user: currentUser._id });
        await User.deleteOne({ _id: currentUser._id });

        res.clearCookie('jwt');
        res.sendStatus(200);
    } catch(err) {
        res.status(500).json({ "message": err.message });
    }
}

module.exports = { 
    signupHandler,
    loginHandler,
    refreshHandler,
    logoutHandler,
    deleteAccount
}