const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwal.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, jadwalController.getJadwal);

module.exports = router;
