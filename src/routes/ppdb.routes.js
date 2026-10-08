const express = require('express');
const router = express.Router();
const ppdbController = require('../controllers/ppdb.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes (Calon siswa / Wali Murid)
router.get('/jadwal', ppdbController.getJadwal);
router.post('/register', ppdbController.register);
router.get('/check/:no', ppdbController.checkStatus);
router.post('/daftar-ulang', ppdbController.submitDaftarUlang);

// Admin routes
router.post('/jadwal', authenticateToken, ppdbController.saveJadwal);
router.get('/', authenticateToken, ppdbController.getAll);
router.get('/statistik', authenticateToken, ppdbController.getStatistik);
router.get('/:id', ppdbController.getById);
router.put('/:id/status', authenticateToken, ppdbController.updateStatus);
router.put('/:id/pembayaran-du', authenticateToken, ppdbController.updatePembayaranDU);
router.put('/:id/tes-nilai', authenticateToken, ppdbController.updateTesNilai);
router.post('/:id/transfer', authenticateToken, ppdbController.transferToSiswa);
router.delete('/:id', authenticateToken, ppdbController.delete);

module.exports = router;
