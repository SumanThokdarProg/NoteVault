// Note.js
const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
}, { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);