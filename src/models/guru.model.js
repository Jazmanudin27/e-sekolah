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

  static async findAll({ status, search, kode_member }) {
    let sql = 'SELECT kode_guru, nip_nuptk, nama_guru, jk, no_hp, email, status_kepegawaian, tgl_lahir, status, role, kode_member FROM guru WHERE 1=1';
    const params = [];

    if (kode_member) {
      sql += ' AND kode_member = ?';
      params.push(kode_member);
    }
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

  static async getTodayBirthdays() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const rows = await query(
      `SELECT kode_guru, nama_guru, jk, email, no_hp, status_kepegawaian, tgl_lahir
       FROM guru
       WHERE status = 'Aktif'
         AND tgl_lahir IS NOT NULL
         AND MONTH(tgl_lahir) = ?
         AND DAY(tgl_lahir) = ?`,
      [month, day]
    );
    return rows;
  }

  static async countActive(kode_member) {
    let sql = 'SELECT COUNT(*) AS total FROM guru WHERE status = "Aktif"';
    const params = [];
    if (kode_member) {
      sql += ' AND kode_member = ?';
      params.push(kode_member);
    }
    const rows = await query(sql, params);
    return rows[0].total || 0;
  }

  static async create({ nip_nuptk, nama_guru, jk = 'L', no_hp, email, tgl_lahir, status_kepegawaian = 'PNS', status = 'Aktif', role = 'Guru', username, password, kode_member }) {
    const res = await query(
      `INSERT INTO guru (nip_nuptk, nama_guru, jk, no_hp, email, tgl_lahir, status_kepegawaian, status, role, username, password, kode_member)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nip_nuptk || '-', nama_guru, jk, no_hp || '-', email || '-', tgl_lahir || null, status_kepegawaian, status, role, username || nip_nuptk || nama_guru.toLowerCase().replace(/\s+/g, ''), password || '123456', kode_member || null]
    );
    return res.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const params = [];
    const allowed = ['nip_nuptk', 'nama_guru', 'jk', 'no_hp', 'email', 'tgl_lahir', 'status_kepegawaian', 'status', 'role', 'username', 'password'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return;
    params.push(id);
    await query(`UPDATE guru SET ${fields.join(', ')} WHERE kode_guru = ?`, params);
  }

  static async delete(id) {
    await query('DELETE FROM guru WHERE kode_guru = ?', [id]);
  }
}

module.exports = GuruModel;
