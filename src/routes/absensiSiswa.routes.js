const express = require('express');
const router = express.Router();
const absensiSiswaController = require('../controllers/absensiSiswa.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, absensiSiswaController.getAbsensiSiswa);
router.get('/rapor-summary', authenticateToken, absensiSiswaController.getAbsensiRaporSummary);
router.post('/batch', authenticateToken, absensiSiswaController.saveAbsensiSiswa);
router.post('/send-wa', authenticateToken, absensiSiswaController.sendSingleAbsensiWA);

module.exports = router;
