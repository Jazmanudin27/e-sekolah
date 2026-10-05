const express = require('express');
const router = express.Router();
const SaprasController = require('../controllers/sapras.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public/App user route for summary and data viewing
router.get('/summary', authenticateToken, SaprasController.getSummary);
router.get('/', authenticateToken, SaprasController.getSummary);

// Fasilitas CRUD
router.post('/fasilitas', authenticateToken, SaprasController.addFasilitas);
router.put('/fasilitas/:id', authenticateToken, SaprasController.updateFasilitas);
router.delete('/fasilitas/:id', authenticateToken, SaprasController.deleteFasilitas);

// Sarana CRUD
router.post('/sarana', authenticateToken, SaprasController.addSarana);
router.put('/sarana/:id', authenticateToken, SaprasController.updateSarana);
router.delete('/sarana/:id', authenticateToken, SaprasController.deleteSarana);

// Tanah CRUD
router.post('/tanah', authenticateToken, SaprasController.addTanah);
router.put('/tanah/:id', authenticateToken, SaprasController.updateTanah);
router.delete('/tanah/:id', authenticateToken, SaprasController.deleteTanah);

module.exports = router;
