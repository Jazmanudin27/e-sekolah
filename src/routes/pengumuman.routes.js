const express = require('express');
const router = express.Router();
const pengumumanController = require('../controllers/pengumuman.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public/App user route
router.get('/', pengumumanController.getActiveAnnouncements);

// Admin routes
router.get('/admin', verifyToken, pengumumanController.getAdminAnnouncements);
router.post('/', verifyToken, pengumumanController.createAnnouncement);
router.put('/:id', verifyToken, pengumumanController.updateAnnouncement);
router.delete('/:id', verifyToken, pengumumanController.deleteAnnouncement);

module.exports = router;
