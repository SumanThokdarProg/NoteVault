// NoteVault\routes\authRoutes.js
const express = require('express');
const router = express.Router();
const { signupHandler, loginHandler, refreshHandler, logoutHandler } = require('../controllers/authController');

router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);

module.exports = router;