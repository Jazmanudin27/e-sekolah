const express = require('express');
const router = express.Router();
const controller = require('../controllers/whatsapp.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/status', authenticateToken, controller.getStatus);
router.get('/qr-status', authenticateToken, controller.getQRStatus);
router.post('/qr-start', authenticateToken, controller.startQR);
router.post('/qr-disconnect', authenticateToken, controller.disconnectQR);
router.post('/test', authenticateToken, controller.testSend);

module.exports = router;
