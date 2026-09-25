const express = require('express');
const router = express.Router();
const mapelController = require('../controllers/mapel.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, mapelController.getAllMapel);

module.exports = router;
