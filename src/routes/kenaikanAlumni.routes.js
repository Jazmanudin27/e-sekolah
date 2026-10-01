const express = require('express');
const router = express.Router();
const controller = require('../controllers/kenaikanAlumni.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// Kenaikan Kelas Massal
router.post('/kenaikan-kelas', controller.prosesKenaikan);

// Kelulusan Siswa (Tingkat Akhir -> Alumni)
router.post('/kelulusan', controller.prosesKelulusan);

// Pembatalan status alumni
router.post('/batal-alumni/:id', controller.batalAlumni);

// Daftar data alumni & filter tahun
router.get('/alumni', controller.getAlumniList);
router.get('/tahun-lulus', controller.getTahunLulus);

// Riwayat / log aktivitas mutasi kenaikan & kelulusan
router.get('/riwayat', controller.getRiwayat);

// Statistik ringkasan
router.get('/stats', controller.getStats);

module.exports = router;
