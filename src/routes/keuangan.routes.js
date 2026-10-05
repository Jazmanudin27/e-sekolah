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
router.get('/tagihan', authenticateToken, keuanganController.getAllTagihan);
router.get('/tagihan/siswa/:siswa_id', authenticateToken, keuanganController.getTagihanSiswa);
router.post('/tagihan/generate', authenticateToken, keuanganController.generateTagihan);
router.put('/tagihan/:id', authenticateToken, keuanganController.updateTagihan);
router.delete('/tagihan/:id', authenticateToken, keuanganController.deleteTagihan);
router.post('/tagihan/delete-batch', authenticateToken, keuanganController.deleteBatchUnpaidTagihan);

// --- TRANSAKSI & KASIR ROUTES ---
router.post('/bayar/cash', authenticateToken, keuanganController.payCash);
router.post('/bni/create-va', authenticateToken, keuanganController.createBniVa);
router.get('/transaksi', authenticateToken, keuanganController.getAllTransaksi);
router.get('/transaksi/:id', authenticateToken, keuanganController.getTransaksiDetail);
router.put('/transaksi/:id', authenticateToken, keuanganController.updateTransaksi);
router.delete('/transaksi/:id', authenticateToken, keuanganController.cancelTransaksi);

const bniWebhookController = require('../controllers/bniWebhook.controller');
const briWebhookController = require('../controllers/briWebhook.controller');

// --- WEBHOOK PAYMENT GATEWAY (Public Endpoint) ---
router.post('/webhook/midtrans', keuanganController.handleWebhookMidtrans);
router.post('/webhook/bni', bniWebhookController.handleBniWebhook);
router.post('/webhook/bri', briWebhookController.handleBriWebhook);
router.post('/v1.0/transfer-va/payment-notify', bniWebhookController.handleBniWebhook);

// --- REKAP & LAPORAN ---
router.get('/rekap/tunggakan', authenticateToken, keuanganController.getRekapTunggakan);

module.exports = router;
