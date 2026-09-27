const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/debug-users', authController.debugUsers);

module.exports = router;
