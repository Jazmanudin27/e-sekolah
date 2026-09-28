const express = require('express');
const router = express.Router();
const sekolahController = require('../controllers/sekolah.controller');

router.get('/', sekolahController.getSekolah);
router.put('/', sekolahController.updateSekolah);

module.exports = router;
