// NoteVault\controllers\authController.js
const argon2 = require('argon2');
const uuidV4 = require('uuid').v4;
const validateUserRequirements = require('../validators/authValidator');
const users = require('../models/User');

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

module.exports = { signupHandler }