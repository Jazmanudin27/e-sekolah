const MenuModel = require('../models/menu.model');
const { sendSuccess, sendError } = require('../utils/response.util');

class MenuController {
  /**
   * Get allowed menus for current logged-in user
   */
  static async getMyMenus(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return sendError(res, 'User tidak ditemukan', 401);
      }

      const role = user.role || user.level || (user.type === 'Kelas' ? 'Sekretaris' : 'Guru');
      const userId = user.id || user.kode_guru || null;
      const kodeMember = user.kode_member || null;

      const allowedMenus = await MenuModel.getMenusForUser(role, userId, kodeMember);
      const canApproveIzin = allowedMenus.includes('approvalIzin') || 
                             ['admin', 'superadmin', 'kepala_sekolah', 'kepala sekolah', 'tu', 'operator'].includes(String(role).toLowerCase());

      return sendSuccess(res, 'Berhasil mengambil data menu user', {
        role,
        menus: allowedMenus,
        can_approve_izin: canApproveIzin
      });
    } catch (err) {
      console.error('[MenuController] getMyMenus error:', err);
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Get role permissions matrix for Admin Panel
   */
  static async getRolePermissions(req, res) {
    try {
      const kodeMember = req.user?.kode_member || null;
      const availableMenus = MenuModel.getAvailableMenus();
      const rolePermissions = await MenuModel.getAllRolePermissions(kodeMember);

      return sendSuccess(res, 'Berhasil mengambil daftar hak akses role', {
        available_menus: availableMenus,
        role_permissions: rolePermissions
      });
    } catch (err) {
      console.error('[MenuController] getRolePermissions error:', err);
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Save role permissions matrix from Admin Panel
   */
  static async saveRolePermissions(req, res) {
    try {
      const { role, menus } = req.body;
      if (!role) {
        return sendError(res, 'Role harus diisi', 400);
      }

      const kodeMember = req.user?.kode_member || null;
      await MenuModel.saveRolePermissions(role, Array.isArray(menus) ? menus : [], kodeMember);

      return sendSuccess(res, `Berhasil memperbarui hak akses menu untuk role ${role}`);
    } catch (err) {
      console.error('[MenuController] saveRolePermissions error:', err);
      return sendError(res, err.message, 500);
    }
  }
}

module.exports = MenuController;
