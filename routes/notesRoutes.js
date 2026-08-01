// noteRoutes.js 
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getAllNotes, getSingleNote, updateNote, deleteNote, createNote, getUserNotesAdmin } = require('../controllers/notesController');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.route('/')
    .get(authMiddleware, getAllNotes)
    .post(authMiddleware, createNote);

router.route('/:id')
    .get(authMiddleware, getSingleNote)
    .put(authMiddleware, updateNote)
    .delete(authMiddleware, deleteNote);
    
router.get('/user/:userid', authMiddleware, requireRole(['admin']), getUserNotesAdmin);

router.delete('/admin-test', authMiddleware, requireRole(['admin']), (req, res) => {
    res.json({
        "message": "You are an admin",
        "userid": req.user.userid,
        "role": req.user.role
    });
});

module.exports = router;