const express = require('express');
const router = express.Router();
const sekolahController = require('../controllers/sekolah.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, sekolahController.getSekolah);
router.put('/', authenticateToken, sekolahController.updateSekolah);

module.exports = router;
