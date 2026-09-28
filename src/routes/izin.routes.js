const express = require('express');
const router = express.Router();
const { getIzin, createIzin, updateIzin, deleteIzin } = require('../controllers/izin.controller');

router.get('/', getIzin);
router.post('/', createIzin);
router.put('/:id', updateIzin);
router.delete('/:id', deleteIzin);

module.exports = router;
