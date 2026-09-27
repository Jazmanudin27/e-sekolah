const express = require('express');
const router = express.Router();
const guruController = require('../controllers/guru.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, guruController.getAllGuru);
router.get('/:id', authenticateToken, guruController.getGuruById);
router.post('/', authenticateToken, guruController.createGuru);
router.put('/:id', authenticateToken, guruController.updateGuru);
router.delete('/:id', authenticateToken, guruController.deleteGuru);

module.exports = router;
