const express = require('express');
const router = express.Router();
const absensiMapelController = require('../controllers/absensiMapel.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, absensiMapelController.getAbsensiMapel);
router.post('/batch', authenticateToken, absensiMapelController.saveAbsensiMapel);

module.exports = router;
