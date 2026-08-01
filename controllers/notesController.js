// notesController.js 
const mongoose = require('mongoose');
const Note = require('../models/Note');
const User = require('../models/User');
const validateNote = require('../validators/noteValidator');

const getAllNotes = async (req, res) => {
    try {
        const result = await Note.find({ owner: req.user.userid }).exec();
        res.json(result);
    } catch(err) {
        res.status(500).json({ "message": err.message });
    }
}

const getSingleNote = async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)) return res.sendStatus(400);
        
        const note = await Note.findById(req.params.id);
        if(!note || note.owner.toString() !== req.user.userid) {
            return res.sendStatus(404);
        }
        
        res.json(note);
    } catch(err) {
        res.status(500).json({ "message": err.message });
    }
}

const updateNote = async (req, res) => {
    const { error, value } = validateNote(req.body);
    if(error) return res.status(400).json({ "message": error.details[0].message});

    try {
        if(!mongoose.isValidObjectId(req.params.id)) return res.sendStatus(400);
        
        const result = await Note.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.userid },
            { title: value.title, content: value.content },
            {
                returnDocument: 'after',
                runValidators: true
            }
        );
        res.json(result);
        
    } catch(err) {
        res.status(500).json({ "message": err.message });
    }
}

const deleteNote = async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)) return res.sendStatus(400);
        const result = await Note.deleteOne({ _id: req.params.id, owner: req.user.userid });
        result.deletedCount === 0 
            ? res.status(404).json({ 'message' : 'No document matched that ID' })
            : res.json({ "message": "Document successfully deleted" });
        
    } catch (err) {
        res.status(500).json({ "message": err.message });
    }
}

const createNote = async (req, res) => {
    const { error, value } = validateNote(req.body);
    if(error) return res.status(400).json({ "message": error.details[0].message});

    try {
        const result = await Note.create({
            owner: req.user.userid,
            title: value.title,
            content: value.content
        });

        res.status(201).json(result);
    } catch(err) {
        res.status(500).json({ "message": err.message });
    }
}

const getUserNotesAdmin = async (req, res) => {
    try {
        if(!mongoose.isValidObjectId(req.params.userid)) return res.sendStatus(400);

        const validUser = await User.findOne({ _id: req.params.userid }).exec();
        if(!validUser) return res.sendStatus(404);

        const result = await Note.find({ owner: validUser._id });
        res.json(result);

    } catch(err) {
        console.log(err.message);
        res.sendStatus(500);
    }
}

module.exports = {
    getAllNotes,
    getSingleNote,
    updateNote,
    deleteNote,
    createNote,
    getUserNotesAdmin
}