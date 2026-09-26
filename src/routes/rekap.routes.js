const express = require('express');
const router = express.Router();
const {
  getRekapSiswa,
  getRekapMapel,
  getRekapGuru,
  getDetailSiswa,
  getDetailMapel,
  getDetailGuru
} = require('../controllers/rekap.controller');

router.get('/siswa', getRekapSiswa);
router.get('/siswa-detail', getDetailSiswa);

router.get('/mapel', getRekapMapel);
router.get('/mapel-detail', getDetailMapel);

router.get('/guru', getRekapGuru);
router.get('/guru-detail', getDetailGuru);

module.exports = router;
