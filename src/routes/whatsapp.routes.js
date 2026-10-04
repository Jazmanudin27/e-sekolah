const express = require('express');
const router = express.Router();
const controller = require('../controllers/whatsapp.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/status', authenticateToken, controller.getStatus);
router.post('/test', authenticateToken, controller.testSend);

module.exports = router;
