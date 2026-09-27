const express = require('express');
const router = express.Router();
const mapelController = require('../controllers/mapel.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, mapelController.getAllMapel);
router.post('/', authenticateToken, mapelController.createMapel);
router.put('/:id', authenticateToken, mapelController.updateMapel);
router.delete('/:id', authenticateToken, mapelController.deleteMapel);

module.exports = router;
