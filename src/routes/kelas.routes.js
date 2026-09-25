const express = require('express');
const router = express.Router();
const kelasController = require('../controllers/kelas.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, kelasController.getAllKelas);
router.get('/:id', authenticateToken, kelasController.getKelasById);

module.exports = router;
