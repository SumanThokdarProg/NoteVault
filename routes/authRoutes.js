// NoteVault\routes\authRoutes.js
const express = require('express');
const router = express.Router();
const { signupHandler } = require('../controllers/authController');

router.post('/signup', signupHandler);

module.exports = router;