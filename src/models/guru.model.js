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
    let sql = 'SELECT kode_guru, nip_nuptk, nama_guru, jk, tempat_lahir, tgl_lahir, agama, alamat, no_hp, email, pendidikan_terakhir, tmt, status_kepegawaian, status, role, kode_member FROM guru WHERE 1=1';
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
      sql += ' AND (nama_guru LIKE ? OR nip_nuptk LIKE ? OR email LIKE ? OR alamat LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY nama_guru ASC';
    return await query(sql, params);
  }

  static async getTodayBirthdays(kode_member) {
    // Zona waktu Indonesia (WIB)
    const nowWib = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const todayMonth = nowWib.getMonth() + 1;
    const todayDay = nowWib.getDate();

    const tomorrowWib = new Date(nowWib.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowMonth = tomorrowWib.getMonth() + 1;
    const tomorrowDay = tomorrowWib.getDate();

    let sqlToday = `
      SELECT kode_guru, nama_guru, jk, email, no_hp, status_kepegawaian, tgl_lahir, tempat_lahir, pendidikan_terakhir,
             'today' AS birthday_timing, 0 AS days_remaining
      FROM guru
      WHERE status = 'Aktif'
        AND tgl_lahir IS NOT NULL
        AND MONTH(tgl_lahir) = ?
        AND DAY(tgl_lahir) = ?
    `;
    const todayParams = [todayMonth, todayDay];
    if (kode_member) {
      sqlToday += ' AND kode_member = ?';
      todayParams.push(kode_member);
    }
    const todayRows = await query(sqlToday, todayParams);

    let sqlTomorrow = `
      SELECT kode_guru, nama_guru, jk, email, no_hp, status_kepegawaian, tgl_lahir, tempat_lahir, pendidikan_terakhir,
             'tomorrow' AS birthday_timing, 1 AS days_remaining
      FROM guru
      WHERE status = 'Aktif'
        AND tgl_lahir IS NOT NULL
        AND MONTH(tgl_lahir) = ?
        AND DAY(tgl_lahir) = ?
    `;
    const tomorrowParams = [tomorrowMonth, tomorrowDay];
    if (kode_member) {
      sqlTomorrow += ' AND kode_member = ?';
      tomorrowParams.push(kode_member);
    }
    const tomorrowRows = await query(sqlTomorrow, tomorrowParams);

    const combined = [
      ...(todayRows || []).map(r => ({ ...r, birthday_timing: 'today', days_remaining: 0 })),
      ...(tomorrowRows || []).map(r => ({ ...r, birthday_timing: 'tomorrow', days_remaining: 1 }))
    ];
    return combined;
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

  static async ensureColumns() {
    try {
      await query("ALTER TABLE guru ADD COLUMN kode_member VARCHAR(50) DEFAULT NULL");
    } catch (e) {}
  }

  static async create({ nip_nuptk, nama_guru, jk = 'L', tempat_lahir, tgl_lahir, agama, alamat, no_hp, email, pendidikan_terakhir, tmt, status_kepegawaian = 'PNS', status = 'Aktif', role = 'Guru', username, password, kode_member }) {
    await this.ensureColumns();
    const res = await query(
      `INSERT INTO guru (nip_nuptk, nama_guru, jk, tempat_lahir, tgl_lahir, agama, alamat, no_hp, email, pendidikan_terakhir, tmt, status_kepegawaian, status, role, username, password, kode_member)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nip_nuptk || '-',
        nama_guru,
        jk,
        tempat_lahir || null,
        tgl_lahir || null,
        agama || 'Islam',
        alamat || '-',
        no_hp || '-',
        email || '-',
        pendidikan_terakhir || 'S1',
        tmt || null,
        status_kepegawaian,
        status,
        role,
        username || nip_nuptk || nama_guru.toLowerCase().replace(/\s+/g, ''),
        password || '123456',
        kode_member || null
      ]
    );
    return res.insertId;
  }

  static async update(id, data) {
    await this.ensureColumns();
    const fields = [];
    const params = [];
    const allowed = [
      'nip_nuptk', 'nama_guru', 'jk', 'tempat_lahir', 'tgl_lahir', 'agama', 'alamat',
      'no_hp', 'email', 'pendidikan_terakhir', 'tmt', 'status_kepegawaian', 'status',
      'role', 'username', 'password', 'kode_member'
    ];
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
