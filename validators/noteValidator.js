// noteValidator.js
const joi = require('joi');

const schema = joi.object({
    title: joi.string().trim().required(),
    content: joi.string().trim().required()
});

const validateNote = (note) => schema.validate({ title: note.title, content: note.content });

module.exports = validateNote;