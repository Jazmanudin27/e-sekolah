const express = require('express');
const router = express.Router();
const siswaController = require('../controllers/siswa.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, siswaController.getSiswaByKelas);

module.exports = router;
