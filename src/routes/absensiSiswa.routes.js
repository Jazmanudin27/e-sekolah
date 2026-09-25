const express = require('express');
const router = express.Router();
const absensiSiswaController = require('../controllers/absensiSiswa.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, absensiSiswaController.getAbsensiSiswa);
router.post('/batch', authenticateToken, absensiSiswaController.saveAbsensiSiswa);

module.exports = router;
