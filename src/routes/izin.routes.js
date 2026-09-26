const express = require('express');
const router = express.Router();
const { getIzin, createIzin } = require('../controllers/izin.controller');

router.get('/', getIzin);
router.post('/', createIzin);

module.exports = router;
