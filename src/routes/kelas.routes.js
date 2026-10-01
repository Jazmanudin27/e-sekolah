const express = require('express');
const router = express.Router();
const kelasController = require('../controllers/kelas.controller');
const kelasMapelController = require('../controllers/kelasMapel.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, kelasController.getAllKelas);
router.get('/:id', authenticateToken, kelasController.getKelasById);
router.post('/', authenticateToken, kelasController.createKelas);
router.put('/:id', authenticateToken, kelasController.updateKelas);
router.delete('/:id', authenticateToken, kelasController.deleteKelas);

// Kelas-Mapel relation routes
router.get('/:id/mapel', authenticateToken, kelasMapelController.getMapelByKelas);
router.put('/:id/mapel', authenticateToken, kelasMapelController.syncMapelKelas);

module.exports = router;
