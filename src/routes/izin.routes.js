const express = require('express');
const router = express.Router();
const { getIzin, createIzin, updateIzin, deleteIzin } = require('../controllers/izin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, getIzin);
router.post('/', authenticateToken, createIzin);
router.put('/:id', authenticateToken, updateIzin);
router.delete('/:id', authenticateToken, deleteIzin);

module.exports = router;
