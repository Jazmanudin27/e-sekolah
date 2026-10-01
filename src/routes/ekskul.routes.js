const express = require('express');
const router = express.Router();
const ekskulController = require('../controllers/ekskul.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Master Ekskul CRUD
router.get('/', authenticateToken, ekskulController.getAllEkskul);
router.post('/', authenticateToken, ekskulController.createEkskul);
router.put('/:id', authenticateToken, ekskulController.updateEkskul);
router.delete('/:id', authenticateToken, ekskulController.deleteEkskul);

// Anggota Ekskul
router.get('/:id/anggota', authenticateToken, ekskulController.getAnggota);
router.put('/:id/anggota', authenticateToken, ekskulController.syncAnggota);
router.put('/anggota/:anggotaId', authenticateToken, ekskulController.updateAnggota);
router.delete('/anggota/:anggotaId', authenticateToken, ekskulController.removeAnggota);

// Rapor endpoint
router.get('/rapor/siswa', authenticateToken, ekskulController.getRaporSiswa);

module.exports = router;
