const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  getRekapSiswa,
  getRekapMapel,
  getRekapGuru,
  getDetailSiswa,
  getDetailMapel,
  getDetailGuru
} = require('../controllers/rekap.controller');

router.get('/siswa', authenticateToken, getRekapSiswa);
router.get('/siswa-detail', authenticateToken, getDetailSiswa);

router.get('/mapel', authenticateToken, getRekapMapel);
router.get('/mapel-detail', authenticateToken, getDetailMapel);

router.get('/guru', authenticateToken, getRekapGuru);
router.get('/guru-detail', authenticateToken, getDetailGuru);

module.exports = router;
