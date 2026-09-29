const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menu.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/my-menus', authenticateToken, MenuController.getMyMenus);
router.get('/roles', authenticateToken, MenuController.getRolePermissions);
router.post('/roles', authenticateToken, MenuController.saveRolePermissions);

module.exports = router;
