const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menu.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/my-menus', verifyToken, MenuController.getMyMenus);
router.get('/roles', verifyToken, MenuController.getRolePermissions);
router.post('/roles', verifyToken, MenuController.saveRolePermissions);

module.exports = router;
