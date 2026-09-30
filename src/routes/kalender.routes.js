const express = require('express');
const router = express.Router();
const kalenderController = require('../controllers/kalender.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public/App user route
router.get('/', kalenderController.getKalender);
router.get('/:id', kalenderController.getKalenderById);

// Admin modification routes
router.post('/', authenticateToken, kalenderController.createKalender);
router.put('/:id', authenticateToken, kalenderController.updateKalender);
router.delete('/:id', authenticateToken, kalenderController.deleteKalender);

module.exports = router;
