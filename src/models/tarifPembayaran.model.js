const { query } = require('../config/database');

class TarifPembayaranModel {
  static async ensureColumns() {
    try {
      await query("ALTER TABLE tarif_pembayaran MODIFY COLUMN nominal BIGINT NOT NULL DEFAULT 0");
      await query("ALTER TABLE tagihan_siswa MODIFY COLUMN nominal_tagihan BIGINT NOT NULL DEFAULT 0, MODIFY COLUMN nominal_terbayar BIGINT NOT NULL DEFAULT 0");
      await query("ALTER TABLE pembayaran_transaksi MODIFY COLUMN total_bayar BIGINT NOT NULL DEFAULT 0");
      await query("ALTER TABLE pembayaran_detail MODIFY COLUMN nominal_dibayar BIGINT NOT NULL DEFAULT 0");
      await query("ALTER TABLE tarif_siswa_override MODIFY COLUMN nilai_potongan BIGINT NOT NULL DEFAULT 0");
      console.log('[TarifPembayaranModel] Successfully ensured BIGINT column types for financial nominals.');
    } catch (e) {
      console.warn('[TarifPembayaranModel.ensureColumns] Column migration notice:', e.message);
    }
  }

  static async findAll({ pos_id = null, tahun_ajaran = null, kode_member = null } = {}) {
    await this.ensureColumns().catch(() => {});
    let sql = `
      SELECT t.*, p.nama_pos, p.tipe, k.nama_kelas
      FROM tarif_pembayaran t
      JOIN pos_pembayaran p ON t.pos_id = p.id
      LEFT JOIN kelas k ON t.kode_kelas = k.kode_kelas
      WHERE 1=1
    `;
    const params = [];

    if (kode_member) {
      sql += ' AND (p.kode_member = ? OR k.kode_member = ? OR t.kode_member = ?)';
      params.push(kode_member, kode_member, kode_member);
    }
    if (pos_id) {
      sql += ' AND t.pos_id = ?';
      params.push(pos_id);
    }
    if (tahun_ajaran) {
      sql += ' AND t.tahun_ajaran = ?';
      params.push(tahun_ajaran);
    }

    sql += ' ORDER BY t.tahun_ajaran DESC, p.nama_pos ASC';
    return await query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT t.*, p.nama_pos, p.tipe, k.nama_kelas
      FROM tarif_pembayaran t
      JOIN pos_pembayaran p ON t.pos_id = p.id
      LEFT JOIN kelas k ON t.kode_kelas = k.kode_kelas
      WHERE t.id = ?
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async findTarifForSiswa(pos_id, tahun_ajaran, kode_kelas, tingkat = null) {
    // Priority order: Spesifik Kelas > Tingkat > All (General)
    const sql = `
      SELECT * FROM tarif_pembayaran
      WHERE pos_id = ? AND tahun_ajaran = ?
        AND (kode_kelas = ? OR tingkat = ? OR (kode_kelas IS NULL AND tingkat IS NULL))
      ORDER BY 
        CASE 
          WHEN kode_kelas IS NOT NULL THEN 1
          WHEN tingkat IS NOT NULL THEN 2
          ELSE 3
        END ASC
      LIMIT 1
    `;
    const rows = await query(sql, [pos_id, tahun_ajaran, kode_kelas, tingkat]);
    return rows[0] || null;
  }

  static async create({ pos_id, tahun_ajaran, tingkat = null, kode_kelas = null, nominal }) {
    let existingSql = 'SELECT id FROM tarif_pembayaran WHERE pos_id = ? AND tahun_ajaran = ?';
    const params = [pos_id, tahun_ajaran];
    if (kode_kelas) {
      existingSql += ' AND kode_kelas = ?';
      params.push(kode_kelas);
    } else if (tingkat) {
      existingSql += ' AND tingkat = ? AND kode_kelas IS NULL';
      params.push(tingkat);
    } else {
      existingSql += ' AND kode_kelas IS NULL AND tingkat IS NULL';
    }

    const existing = await query(existingSql, params);
    if (existing && existing.length > 0) {
      await query('UPDATE tarif_pembayaran SET nominal = ? WHERE id = ?', [nominal, existing[0].id]);
      return existing[0].id;
    }

    const res = await query(
      'INSERT INTO tarif_pembayaran (pos_id, tahun_ajaran, tingkat, kode_kelas, nominal) VALUES (?, ?, ?, ?, ?)',
      [pos_id, tahun_ajaran, tingkat, kode_kelas, nominal]
    );
    return res.insertId;
  }

  static async update(id, { pos_id, tahun_ajaran, tingkat, kode_kelas, nominal }) {
    const fields = [];
    const params = [];

    if (pos_id !== undefined) { fields.push('pos_id = ?'); params.push(pos_id); }
    if (tahun_ajaran !== undefined) { fields.push('tahun_ajaran = ?'); params.push(tahun_ajaran); }
    if (tingkat !== undefined) { fields.push('tingkat = ?'); params.push(tingkat); }
    if (kode_kelas !== undefined) { fields.push('kode_kelas = ?'); params.push(kode_kelas); }
    if (nominal !== undefined) { fields.push('nominal = ?'); params.push(nominal); }

    if (fields.length === 0) return false;

    params.push(id);
    await query(`UPDATE tarif_pembayaran SET ${fields.join(', ')} WHERE id = ?`, params);
    return true;
  }

  static async delete(id) {
    await query('DELETE FROM tarif_pembayaran WHERE id = ?', [id]);
    return true;
  }

  // --- OVERRIDE BEASISWA / DISKON SISWA ---

  static async getOverrideForSiswa(tarif_id, siswa_id) {
    const rows = await query(
      'SELECT * FROM tarif_siswa_override WHERE tarif_id = ? AND siswa_id = ?',
      [tarif_id, siswa_id]
    );
    return rows[0] || null;
  }

  static async setOverride({ tarif_id, siswa_id, tipe_potongan = 'NOMINAL', nilai_potongan, keterangan = null }) {
    const sql = `
      INSERT INTO tarif_siswa_override (tarif_id, siswa_id, tipe_potongan, nilai_potongan, keterangan)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tipe_potongan = VALUES(tipe_potongan),
        nilai_potongan = VALUES(nilai_potongan),
        keterangan = VALUES(keterangan)
    `;
    return await query(sql, [tarif_id, siswa_id, tipe_potongan, nilai_potongan, keterangan]);
  }

  static async deleteOverride(tarif_id, siswa_id) {
    await query('DELETE FROM tarif_siswa_override WHERE tarif_id = ? AND siswa_id = ?', [tarif_id, siswa_id]);
    return true;
  }
}

module.exports = TarifPembayaranModel;
