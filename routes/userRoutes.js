// userRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { getAllUsers, getUserNotesAdmin } = require('../controllers/userController');

router.get('/', authMiddleware, requireRole(['admin']), getAllUsers);
router.get('/user/:userid', authMiddleware, requireRole(['admin']), getUserNotesAdmin);

module.exports = router;