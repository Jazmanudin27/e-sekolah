const express = require('express');
const router = express.Router();
const controller = require('../controllers/pelanggaran.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, controller.getPelanggaran);
router.get('/stats', authenticateToken, controller.getStats);
router.get('/rekap', authenticateToken, controller.getRekapPoin);
router.get('/:id', authenticateToken, controller.getPelanggaranById);
router.post('/', authenticateToken, controller.createPelanggaran);
router.put('/:id', authenticateToken, controller.updatePelanggaran);
router.delete('/:id', authenticateToken, controller.deletePelanggaran);
router.post('/:id/send-wa', authenticateToken, controller.sendWAPelanggaran);

module.exports = router;
