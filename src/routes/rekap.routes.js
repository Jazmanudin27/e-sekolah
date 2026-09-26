const express = require('express');
const router = express.Router();
const { getRekapSiswa, getRekapMapel, getRekapGuru } = require('../controllers/rekap.controller');

router.get('/siswa', getRekapSiswa);
router.get('/mapel', getRekapMapel);
router.get('/guru', getRekapGuru);

module.exports = router;
