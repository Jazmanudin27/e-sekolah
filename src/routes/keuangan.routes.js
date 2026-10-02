const express = require('express');
const router = express.Router();
const keuanganController = require('../controllers/keuangan.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// --- POS PEMBAYARAN ROUTES ---
router.get('/pos', authenticateToken, keuanganController.getAllPos);
router.post('/pos', authenticateToken, keuanganController.createPos);
router.put('/pos/:id', authenticateToken, keuanganController.updatePos);
router.delete('/pos/:id', authenticateToken, keuanganController.deletePos);

// --- TARIF & OVERRIDE BEASISWA ROUTES ---
router.get('/tarif', authenticateToken, keuanganController.getAllTarif);
router.post('/tarif', authenticateToken, keuanganController.createTarif);
router.put('/tarif/:id', authenticateToken, keuanganController.updateTarif);
router.delete('/tarif/:id', authenticateToken, keuanganController.deleteTarif);
router.post('/tarif/override', authenticateToken, keuanganController.setTarifOverride);

// --- TAGIHAN SISWA ROUTES ---
router.get('/tagihan/siswa/:siswa_id', authenticateToken, keuanganController.getTagihanSiswa);
router.post('/tagihan/generate', authenticateToken, keuanganController.generateTagihan);

// --- TRANSAKSI & KASIR ROUTES ---
router.post('/bayar/cash', authenticateToken, keuanganController.payCash);
router.get('/transaksi', authenticateToken, keuanganController.getAllTransaksi);
router.get('/transaksi/:id', authenticateToken, keuanganController.getTransaksiDetail);

// --- WEBHOOK PAYMENT GATEWAY (Public Endpoint) ---
router.post('/webhook/midtrans', keuanganController.handleWebhookMidtrans);

// --- REKAP & LAPORAN ---
router.get('/rekap/tunggakan', authenticateToken, keuanganController.getRekapTunggakan);

module.exports = router;
