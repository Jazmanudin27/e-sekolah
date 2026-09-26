const express = require('express');
const router = express.Router();
const { getIzin, createIzin, deleteIzin } = require('../controllers/izin.controller');

router.get('/', getIzin);
router.post('/', createIzin);
router.delete('/:id', deleteIzin);

module.exports = router;
