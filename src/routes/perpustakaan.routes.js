const express = require('express');
const router = express.Router();
const PerpustakaanController = require('../controllers/perpustakaan.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Stats
router.get('/stats', authenticateToken, PerpustakaanController.getStats);

// Master Buku
router.get('/buku', authenticateToken, PerpustakaanController.getAllBuku);
router.get('/buku/:id', authenticateToken, PerpustakaanController.getBukuById);
router.post('/buku', authenticateToken, PerpustakaanController.createBuku);
router.put('/buku/:id', authenticateToken, PerpustakaanController.updateBuku);
router.delete('/buku/:id', authenticateToken, PerpustakaanController.deleteBuku);

// Transaksi Peminjaman
router.get('/peminjaman', authenticateToken, PerpustakaanController.getAllPeminjaman);
router.post('/peminjaman', authenticateToken, PerpustakaanController.createPeminjaman);
router.put('/peminjaman/:id/kembali', authenticateToken, PerpustakaanController.kembalikanBuku);
router.delete('/peminjaman/:id', authenticateToken, PerpustakaanController.deletePeminjaman);

module.exports = router;
