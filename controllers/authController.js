// NoteVault\controllers\authController.js
const argon2 = require('argon2');
const uuidV4 = require('uuid').v4;
const jwt = require('jsonwebtoken');
const validateUserRequirements = require('../validators/authValidator');
const users = require('../models/User');
let refreshTokenData = require('../models/RefreshToken');

const signupHandler = async (req, res) => {
    try {
        const { error, value } = validateUserRequirements(req.body);
        if(error) {
            return res.status(400).send(error.details[0].message);        // requirements dose not match
        }

        const userIndex = users.findIndex(u => u.email === value.email);
        if(userIndex !== -1) {
            return res.sendStatus(409);    // email already exists
        }

        const hashPassword = await argon2.hash(value.password);
        const userId = uuidV4();
        const newUser = {
            userid: userId,
            email: value.email,
            password: hashPassword,
            datetime: new Date()
        }
        users.push(newUser);

        res.status(201).json({
            "userId": newUser.userid,
            "email": newUser.email
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

        const validUser = users.find(u => u.email === value.email);
        if(!validUser) return res.sendStatus(404);

        const checkPassword = await argon2.verify(validUser.password, value.password);
        if(!checkPassword) return res.sendStatus(401);
        
        const accessToken = jwt.sign(
            { "userid": validUser.userid },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m'}
        );
        const refreshToken = jwt.sign(
            { "userid": validUser.userid },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d'}
        );

        const userIndex = refreshTokenData.findIndex(rtd => rtd.userid === validUser.userid);
        const newToken = {
            "userid": validUser.userid,
            refreshToken
        }
        if(userIndex !== -1) refreshTokenData.splice(userIndex, 1);
            
        refreshTokenData.push(newToken);


        res.cookie('jwt', refreshToken, { 
            httpOnly: true, 
            sameSite: 'None', 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        res.json({ accessToken });

    } catch(error) {
        console.error(error.message);
        res.sendStatus(500);
    }
}

module.exports = { 
    signupHandler,
    loginHandler
}