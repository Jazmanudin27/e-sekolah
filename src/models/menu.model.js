const { query } = require('../config/database');

const ALL_AVAILABLE_MENUS = [
  { key: 'siswa', label: 'Data Siswa', category: 'Umum' },
  { key: 'jadwal', label: 'Jadwal Pelajaran', category: 'Umum' },
  { key: 'history', label: 'History Presensi', category: 'Umum' },
  { key: 'absenSiswa', label: 'Absensi Siswa', category: 'Presensi' },
  { key: 'absenMapel', label: 'Absensi Mapel', category: 'Presensi' },
  { key: 'rekapSiswa', label: 'Rekap Presensi Siswa', category: 'Rekap' },
  { key: 'rekapMapel', label: 'Rekap Presensi Mapel', category: 'Rekap' },
  { key: 'rekapGuru', label: 'Rekap Presensi Guru', category: 'Rekap' },
  { key: 'pengajuanIzin', label: 'Pengajuan Izin Saya', category: 'Izin & Cuti' },
  { key: 'approvalIzin', label: 'Persetujuan / Approval Izin', category: 'Izin & Cuti' },
  { key: 'masterGuru', label: 'Master Data Guru', category: 'Admin' },
  { key: 'masterSiswa', label: 'Master Data Siswa & Kelas', category: 'Admin' },
  { key: 'settingUser', label: 'Manajemen Hak Akses & User', category: 'Admin' }
];

// Default fallback mappings if DB is empty
const DEFAULT_ROLE_MENUS = {
  'Admin': ALL_AVAILABLE_MENUS.map(m => m.key),
  'Superadmin': ALL_AVAILABLE_MENUS.map(m => m.key),
  'Kepala Sekolah': ['siswa', 'jadwal', 'history', 'rekapSiswa', 'rekapMapel', 'rekapGuru', 'approvalIzin'],
  'Guru': ['siswa', 'jadwal', 'history', 'absenMapel', 'rekapSiswa', 'pengajuanIzin'],
  'Sekretaris': ['siswa', 'jadwal', 'absenSiswa', 'rekapSiswa'],
  'Kelas': ['siswa', 'jadwal', 'absenSiswa', 'rekapSiswa'],
  'TU': ['siswa', 'jadwal', 'history', 'rekapSiswa', 'rekapGuru', 'approvalIzin', 'masterGuru', 'masterSiswa'],
  'Operator': ['siswa', 'jadwal', 'history', 'absenSiswa', 'absenMapel', 'rekapSiswa', 'rekapMapel', 'rekapGuru', 'approvalIzin', 'masterGuru', 'masterSiswa', 'settingUser']
};

class MenuModel {
  static getAvailableMenus() {
    return ALL_AVAILABLE_MENUS;
  }

  static async ensureTableSchema() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS \`menu\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`kode_user\` VARCHAR(50) DEFAULT NULL,
          \`status\` VARCHAR(20) DEFAULT '1',
          \`menu\` VARCHAR(100) DEFAULT NULL,
          \`kode_member\` VARCHAR(50) DEFAULT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await query(`ALTER TABLE \`menu\` MODIFY COLUMN \`kode_user\` VARCHAR(50) DEFAULT NULL`);
    } catch (err) {
      console.warn('[MenuModel] ensureTableSchema warning:', err.message);
    }
  }

  /**
   * Get allowed menus for a role or specific user ID from MySQL database table `menu`
   */
  static async getMenusForUser(role, userId = null, kodeMember = null) {
    await this.ensureTableSchema();
    const cleanRole = String(role || 'Guru').trim();

    try {
      let rows = [];

      // 1. Try fetching specific permissions for userId if provided
      if (userId) {
        let sql = `SELECT menu, status FROM \`menu\` WHERE \`kode_user\` = ? AND (\`status\` = '1' OR \`status\` = 'aktif' OR \`status\` = 'Active')`;
        const params = [String(userId)];
        if (kodeMember) {
          sql += ` AND (\`kode_member\` = ? OR \`kode_member\` IS NULL)`;
          params.push(String(kodeMember));
        }
        rows = await query(sql, params);
      }

      // 2. If no user-specific permissions, query by role name
      if (!rows || rows.length === 0) {
        let sql = `SELECT menu, status FROM \`menu\` WHERE LOWER(\`kode_user\`) = LOWER(?) AND (\`status\` = '1' OR \`status\` = 'aktif' OR \`status\` = 'Active')`;
        const params = [cleanRole];
        if (kodeMember) {
          sql += ` AND (\`kode_member\` = ? OR \`kode_member\` IS NULL)`;
          params.push(String(kodeMember));
        }
        rows = await query(sql, params);
      }

      // 3. If DB has rows, return menu array
      if (rows && rows.length > 0) {
        return rows.map(r => String(r.menu).trim()).filter(Boolean);
      }

      // 4. Fallback to DEFAULT_ROLE_MENUS if DB has no record for this role yet
      const matchedDefaultKey = Object.keys(DEFAULT_ROLE_MENUS).find(
        k => k.toLowerCase() === cleanRole.toLowerCase()
      );
      if (matchedDefaultKey) {
        return DEFAULT_ROLE_MENUS[matchedDefaultKey];
      }

      // Default fallback for any unspecified role
      return ['siswa', 'jadwal', 'history', 'pengajuanIzin'];
    } catch (err) {
      console.error('[MenuModel] getMenusForUser error:', err.message);
      return DEFAULT_ROLE_MENUS['Guru'];
    }
  }

  /**
   * Fetch menu matrix for all roles for Admin settings UI
   */
  static async getAllRolePermissions(kodeMember = null) {
    await this.ensureTableSchema();

    const rolesList = ['Admin', 'Kepala Sekolah', 'Guru', 'TU', 'Sekretaris', 'Operator'];
    const result = {};

    for (const r of rolesList) {
      result[r] = await this.getMenusForUser(r, null, kodeMember);
    }

    return result;
  }

  /**
   * Save or update menu permissions for a role in MySQL `menu` table
   */
  static async saveRolePermissions(role, menus = [], kodeMember = null) {
    await this.ensureTableSchema();
    const cleanRole = String(role).trim();
    if (!cleanRole) return false;

    // Remove existing menu permissions for this role
    let delSql = `DELETE FROM \`menu\` WHERE LOWER(\`kode_user\`) = LOWER(?)`;
    const delParams = [cleanRole];
    if (kodeMember) {
      delSql += ` AND (\`kode_member\` = ? OR \`kode_member\` IS NULL)`;
      delParams.push(String(kodeMember));
    }
    await query(delSql, delParams);

    // Insert new active menu permissions
    for (const menuKey of menus) {
      await query(
        `INSERT INTO \`menu\` (\`kode_user\`, \`status\`, \`menu\`, \`kode_member\`) VALUES (?, '1', ?, ?)`,
        [cleanRole, menuKey, kodeMember || null]
      );
    }

    return true;
  }
}

module.exports = MenuModel;
