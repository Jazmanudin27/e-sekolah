const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensi.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/today', authenticateToken, presensiController.getTodayStatus);
router.post('/checkin', authenticateToken, presensiController.checkIn);
router.post('/checkout', authenticateToken, presensiController.checkOut);
router.get('/history', authenticateToken, presensiController.getHistory);

module.exports = router;
