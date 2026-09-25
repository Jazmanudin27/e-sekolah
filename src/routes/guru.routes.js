const express = require('express');
const router = express.Router();
const guruController = require('../controllers/guru.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, guruController.getAllGuru);
router.get('/:id', authenticateToken, guruController.getGuruById);

module.exports = router;
