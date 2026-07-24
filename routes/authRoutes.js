// NoteVault\routes\authRoutes.js
const express = require('express');
const router = express.Router();
const { signupHandler, loginHandler } = require('../controllers/authController');

router.post('/signup', signupHandler);
router.post('/login', loginHandler);

module.exports = router;