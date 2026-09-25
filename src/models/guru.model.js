const { query } = require('../config/database');

class GuruModel {
  static async findByUsernameOrEmail(identifier) {
    const rows = await query(
      'SELECT * FROM guru WHERE (username = ? OR email = ? OR nip_nuptk = ?) LIMIT 1',
      [identifier, identifier, identifier]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const rows = await query(
      'SELECT kode_guru, nip_nuptk, nama_guru, jk, tmt, alamat, no_hp, email, agama, tempat_lahir, tgl_lahir, status_kepegawaian, pendidikan_terakhir, status, role, kode_member FROM guru WHERE kode_guru = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findAll({ status, search }) {
    let sql = 'SELECT kode_guru, nip_nuptk, nama_guru, jk, no_hp, email, status_kepegawaian, status, role FROM guru WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (nama_guru LIKE ? OR nip_nuptk LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY nama_guru ASC';
    return await query(sql, params);
  }

  static async countActive() {
    const rows = await query('SELECT COUNT(*) AS total FROM guru WHERE status = "Aktif"');
    return rows[0].total || 0;
  }
}

module.exports = GuruModel;
