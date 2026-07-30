// NoteVault\validators\authValidator.js
const joi = require('joi');

const schema = joi.object({
    email: joi.string().trim().email().lowercase().required(),
    password: joi.string().trim().min(8).required()
});

const validateUserRequirements = (user) =>  schema.validate({email: user.email, password: user.password});

module.exports = validateUserRequirements;