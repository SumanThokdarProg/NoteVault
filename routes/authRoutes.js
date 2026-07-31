// NoteVault\routes\authRoutes.js
const express = require('express');
const router = express.Router();
const { signupHandler, loginHandler, refreshHandler, logoutHandler, deleteAccount } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
router.delete('/account', authMiddleware, deleteAccount);

module.exports = router;