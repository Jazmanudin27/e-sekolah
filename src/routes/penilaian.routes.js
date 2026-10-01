const express = require('express');
const router = express.Router();
const PenilaianController = require('../controllers/penilaian.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/kategori', PenilaianController.getKategori);
router.get('/komponen', PenilaianController.getKomponen);
router.post('/komponen', PenilaianController.createKomponen);
router.delete('/komponen/:id', PenilaianController.deleteKomponen);
router.get('/matrix', PenilaianController.getMatrix);
router.post('/batch-save', PenilaianController.saveBatchNilai);
router.get('/transkrip-siswa', PenilaianController.getTranskripSiswa);

module.exports = router;
