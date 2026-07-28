// noteRoutes.js 
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { notesController } = require('../controllers/notesController');

const router = express.Router();

router.route('/')
    .get(authMiddleware, notesController);


module.exports = router;