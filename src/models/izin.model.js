const { query } = require('../config/database');

class IzinModel {
  static async initTable() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS pengajuan_izin (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kode_member VARCHAR(50) NULL,
          user_id INT NULL,
          nama_pengaju VARCHAR(255) NULL,
          jenis VARCHAR(50) NOT NULL,
          tanggal_mulai DATE NOT NULL,
          tanggal_selesai DATE NULL,
          durasi VARCHAR(50) NULL,
          keterangan TEXT NULL,
          status VARCHAR(50) DEFAULT 'Menunggu',
          disetujui_oleh VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
      `);
      await this.ensureColumns();
    } catch (err) {
      console.log('[IzinModel] Table init or check:', err.message);
    }
  }

  static async ensureColumns() {
    try {
      await query('ALTER TABLE pengajuan_izin CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci').catch(() => null);
      const cols = await query('DESCRIBE pengajuan_izin');
      const colNames = cols.map(c => c.Field);
      if (!colNames.includes('kode_member')) {
        await query('ALTER TABLE pengajuan_izin ADD COLUMN kode_member VARCHAR(50) NULL');
      }
    } catch (err) {
      console.warn('[IzinModel.ensureColumns] Warning:', err.message);
    }
  }

  static async findAll(targetKodeMember) {
    await this.initTable();
    try {
      let sql = `
        SELECT 
          p.id, 
          p.user_id, 
          p.kode_member,
          COALESCE(NULLIF(TRIM(g.nama_guru), ''), NULLIF(TRIM(p.nama_pengaju), ''), 'Guru Pengajar') AS nama_guru,
          p.nama_pengaju, 
          p.jenis, 
          p.jenis AS jenis_izin,
          DATE_FORMAT(p.tanggal_mulai, '%Y-%m-%d') AS tanggal_mulai,
          DATE_FORMAT(p.tanggal_selesai, '%Y-%m-%d') AS tanggal_selesai,
          p.durasi, 
          p.keterangan, 
          p.status, 
          p.disetujui_oleh, 
          DATE_FORMAT(p.created_at, '%d %b %Y') AS tanggal
        FROM pengajuan_izin p
        LEFT JOIN guru g ON (p.user_id = g.kode_guru OR (p.user_id IS NULL AND CONVERT(p.nama_pengaju USING utf8mb4) = CONVERT(g.nama_guru USING utf8mb4)))
      `;
      const params = [];
      if (targetKodeMember) {
        sql += ` WHERE (p.kode_member = ? OR p.kode_member IS NULL)`;
        params.push(targetKodeMember);
      }
      sql += ` ORDER BY p.id DESC`;

      const rows = await query(sql, params);
      return rows;
    } catch (err) {
      console.error('[IzinModel.findAll] Error:', err.message);
      return [];
    }
  }

  static async findById(id) {
    await this.initTable();
    const rows = await query('SELECT * FROM pengajuan_izin WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ kode_member, user_id, nama_pengaju, jenis, tanggal_mulai, tanggal_selesai, durasi, keterangan, status, disetujui_oleh }) {
    await this.initTable();
    const res = await query(
      `INSERT INTO pengajuan_izin 
       (kode_member, user_id, nama_pengaju, jenis, tanggal_mulai, tanggal_selesai, durasi, keterangan, status, disetujui_oleh) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kode_member || null,
        user_id || null,
        nama_pengaju || 'Pengguna E-Sekolah',
        jenis || 'Sakit',
        tanggal_mulai,
        tanggal_selesai || null,
        durasi || '1 Hari',
        keterangan || '',
        status || 'Menunggu',
        disetujui_oleh || 'Menunggu Persetujuan'
      ]
    );
    return res.insertId;
  }

  static async update(id, { kode_member, user_id, nama_pengaju, jenis, tanggal_mulai, tanggal_selesai, durasi, keterangan, status, disetujui_oleh }) {
    await this.initTable();
    const fields = [];
    const params = [];

    if (kode_member !== undefined) { fields.push('kode_member = ?'); params.push(kode_member); }
    if (user_id !== undefined) { fields.push('user_id = ?'); params.push(user_id); }
    if (nama_pengaju !== undefined) { fields.push('nama_pengaju = ?'); params.push(nama_pengaju); }
    if (jenis !== undefined) { fields.push('jenis = ?'); params.push(jenis); }
    if (tanggal_mulai !== undefined) { fields.push('tanggal_mulai = ?'); params.push(tanggal_mulai); }
    if (tanggal_selesai !== undefined) { fields.push('tanggal_selesai = ?'); params.push(tanggal_selesai); }
    if (durasi !== undefined) { fields.push('durasi = ?'); params.push(durasi); }
    if (keterangan !== undefined) { fields.push('keterangan = ?'); params.push(keterangan); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (disetujui_oleh !== undefined) { fields.push('disetujui_oleh = ?'); params.push(disetujui_oleh); }

    if (fields.length > 0) {
      params.push(id);
      await query(`UPDATE pengajuan_izin SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    return await this.findById(id);
  }

  static async delete(id) {
    await this.initTable();
    await query('DELETE FROM pengajuan_izin WHERE id = ?', [id]);
  }
}

module.exports = IzinModel;
