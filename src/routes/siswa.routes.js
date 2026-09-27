const express = require('express');
const router = express.Router();
const siswaController = require('../controllers/siswa.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, siswaController.getSiswaByKelas);
router.post('/', authenticateToken, siswaController.createSiswa);
router.put('/:id', authenticateToken, siswaController.updateSiswa);
router.delete('/:id', authenticateToken, siswaController.deleteSiswa);

module.exports = router;
