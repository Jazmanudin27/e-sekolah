const { query } = require('../config/database');

class EkskulModel {
  /**
   * Auto-create tables if they don't exist
   */
  static async ensureTables() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ekstrakurikuler (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nama_ekskul VARCHAR(200) NOT NULL,
          pembina VARCHAR(200) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e) {}
    try {
      await query("ALTER TABLE ekstrakurikuler ADD COLUMN kode_member VARCHAR(50) DEFAULT NULL");
    } catch (e) {}
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS ekskul_siswa (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ekskul_id INT NOT NULL,
          siswa_id INT NOT NULL,
          kelas_id INT NOT NULL,
          tahun_ajaran VARCHAR(20) DEFAULT '2025/2026',
          semester VARCHAR(10) DEFAULT '1',
          predikat VARCHAR(50) DEFAULT 'Baik',
          keterangan TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_ekskul_siswa_sem (ekskul_id, siswa_id, kelas_id, tahun_ajaran, semester)
        )
      `);
    } catch (e) {}
  }

  // ============ MASTER EKSKUL ============

  static async findAll(kode_member = null) {
    await this.ensureTables();
    let sql = 'SELECT * FROM ekstrakurikuler';
    const params = [];
    if (kode_member) {
      sql += ' WHERE kode_member = ?';
      params.push(kode_member);
    }
    sql += ' ORDER BY nama_ekskul ASC';
    return await query(sql, params);
  }

  static async create({ nama_ekskul, pembina, kode_member }) {
    await this.ensureTables();
    const res = await query(
      'INSERT INTO ekstrakurikuler (nama_ekskul, pembina, kode_member) VALUES (?, ?, ?)',
      [nama_ekskul, pembina || null, kode_member || null]
    );
    return res.insertId;
  }

  static async update(id, data) {
    await this.ensureTables();
    const fields = [];
    const params = [];
    if (data.nama_ekskul !== undefined) {
      fields.push('nama_ekskul = ?');
      params.push(data.nama_ekskul);
    }
    if (data.pembina !== undefined) {
      fields.push('pembina = ?');
      params.push(data.pembina);
    }
    if (data.kode_member !== undefined) {
      fields.push('kode_member = ?');
      params.push(data.kode_member);
    }
    if (fields.length === 0) return;
    params.push(id);
    await query(`UPDATE ekstrakurikuler SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await query('DELETE FROM ekskul_siswa WHERE ekskul_id = ?', [id]);
    await query('DELETE FROM ekstrakurikuler WHERE id = ?', [id]);
  }

  // ============ ANGGOTA EKSKUL ============

  /**
   * Get all students assigned to a specific ekskul (with optional filter)
   */
  static async getAnggota(ekskulId, { kelas_id, tahun_ajaran, semester } = {}) {
    await this.ensureTables();
    let sql = `
      SELECT es.*, s.nama_siswa, s.nis, k.nama_kelas
      FROM ekskul_siswa es
      JOIN siswa s ON es.siswa_id = s.kode_siswa
      LEFT JOIN kelas k ON es.kelas_id = k.kode_kelas
      WHERE es.ekskul_id = ?
    `;
    const params = [ekskulId];

    if (kelas_id) {
      sql += ' AND es.kelas_id = ?';
      params.push(kelas_id);
    }
    if (tahun_ajaran) {
      sql += ' AND es.tahun_ajaran = ?';
      params.push(tahun_ajaran);
    }
    if (semester) {
      sql += ' AND es.semester = ?';
      params.push(semester);
    }

    sql += ' ORDER BY s.nama_siswa ASC';
    return await query(sql, params);
  }

  /**
   * Sync students for an ekskul (for specific kelas + tahun + semester)
   */
  static async syncAnggota(ekskulId, kelasId, tahunAjaran, semester, siswaList) {
    await this.ensureTables();
    // Delete existing for this combination
    await query(
      'DELETE FROM ekskul_siswa WHERE ekskul_id = ? AND kelas_id = ? AND tahun_ajaran = ? AND semester = ?',
      [ekskulId, kelasId, tahunAjaran, semester]
    );

    if (!Array.isArray(siswaList) || siswaList.length === 0) return;

    // Insert new
    const values = siswaList.map(s => {
      const sid = parseInt(s.siswa_id);
      const predikat = s.predikat || 'Baik';
      const keterangan = s.keterangan || '';
      return `(${parseInt(ekskulId)}, ${sid}, ${parseInt(kelasId)}, '${tahunAjaran}', '${semester}', '${predikat}', '${keterangan.replace(/'/g, "''")}')`;
    }).join(', ');

    await query(
      `INSERT INTO ekskul_siswa (ekskul_id, siswa_id, kelas_id, tahun_ajaran, semester, predikat, keterangan) VALUES ${values}`
    );
  }

  /**
   * Update a single anggota's predikat/keterangan
   */
  static async updateAnggota(id, data) {
    const fields = [];
    const params = [];
    if (data.predikat !== undefined) {
      fields.push('predikat = ?');
      params.push(data.predikat);
    }
    if (data.keterangan !== undefined) {
      fields.push('keterangan = ?');
      params.push(data.keterangan);
    }
    if (fields.length === 0) return;
    params.push(id);
    await query(`UPDATE ekskul_siswa SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  /**
   * Remove a single anggota
   */
  static async removeAnggota(id) {
    await query('DELETE FROM ekskul_siswa WHERE id = ?', [id]);
  }

  /**
   * Get ekskul data for rapor: all ekskul a student participates in for a given kelas+sem+tahun
   */
  static async getRaporSiswa(siswaId, kelasId, tahunAjaran, semester) {
    await this.ensureTables();
    return await query(
      `SELECT es.predikat, es.keterangan, e.nama_ekskul
       FROM ekskul_siswa es
       JOIN ekstrakurikuler e ON es.ekskul_id = e.id
       WHERE es.siswa_id = ? AND es.kelas_id = ? AND es.tahun_ajaran = ? AND es.semester = ?
       ORDER BY e.nama_ekskul ASC`,
      [siswaId, kelasId, tahunAjaran, semester]
    );
  }
}

module.exports = EkskulModel;
