const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/summary', authenticateToken, dashboardController.getDashboardSummary);

module.exports = router;
