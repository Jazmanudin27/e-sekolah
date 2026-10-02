const { query } = require('../config/database');

class TagihanSiswaModel {
  static async findBySiswa(siswa_id, status = null) {
    let sql = `
      SELECT t.*, p.nama_pos, p.tipe AS tipe_pos, tr.tahun_ajaran
      FROM tagihan_siswa t
      JOIN tarif_pembayaran tr ON t.tarif_id = tr.id
      JOIN pos_pembayaran p ON tr.pos_id = p.id
      WHERE t.siswa_id = ?
    `;
    const params = [siswa_id];

    if (status && status !== 'ALL') {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.tahun ASC, t.bulan ASC, t.id ASC';
    return await query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT t.*, p.nama_pos, p.tipe AS tipe_pos, tr.tahun_ajaran, s.nama_siswa, s.nis
      FROM tagihan_siswa t
      JOIN tarif_pembayaran tr ON t.tarif_id = tr.id
      JOIN pos_pembayaran p ON tr.pos_id = p.id
      JOIN siswa s ON t.siswa_id = s.kode_siswa
      WHERE t.id = ?
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async findByIds(ids = []) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const sql = `
      SELECT t.*, p.nama_pos, p.tipe AS tipe_pos, tr.tahun_ajaran
      FROM tagihan_siswa t
      JOIN tarif_pembayaran tr ON t.tarif_id = tr.id
      JOIN pos_pembayaran p ON tr.pos_id = p.id
      WHERE t.id IN (${placeholders})
    `;
    return await query(sql, ids);
  }

  static async createInvoice({ siswa_id, tarif_id, bulan = null, tahun = null, nominal_tagihan, tanggal_jatuh_tempo = null }) {
    const kode_tagihan = `INV-${tahun || new Date().getFullYear()}${String(bulan || 0).padStart(2, '0')}-${siswa_id}-${Math.floor(1000 + Math.random() * 9000)}`;

    const dueDate = (tanggal_jatuh_tempo && String(tanggal_jatuh_tempo).trim() !== '')
      ? tanggal_jatuh_tempo
      : (tahun && bulan ? `${tahun}-${String(bulan).padStart(2, '0')}-10` : null);

    const sql = `
      INSERT INTO tagihan_siswa (kode_tagihan, siswa_id, tarif_id, bulan, tahun, nominal_tagihan, status, tanggal_jatuh_tempo)
      VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', ?)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `;
    const res = await query(sql, [kode_tagihan, siswa_id, tarif_id, bulan, tahun, nominal_tagihan, dueDate]);
    return res.insertId;
  }

  static async updatePembayaran(tagihan_id, nominal_dibayar) {
    const tagihan = await this.findById(tagihan_id);
    if (!tagihan) throw new Error('Tagihan tidak ditemukan');

    const new_terbayar = Number(tagihan.nominal_terbayar || 0) + Number(nominal_dibayar);
    let new_status = 'PARTIAL';

    if (new_terbayar >= Number(tagihan.nominal_tagihan)) {
      new_status = 'PAID';
    }

    const sql = `
      UPDATE tagihan_siswa 
      SET nominal_terbayar = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [new_terbayar, new_status, tagihan_id]);
    return { new_terbayar, new_status };
  }

  static async reducePembayaran(tagihan_id, nominal_batal) {
    const tagihan = await this.findById(tagihan_id);
    if (!tagihan) return;

    const new_terbayar = Math.max(0, Number(tagihan.nominal_terbayar || 0) - Number(nominal_batal));
    let new_status = 'UNPAID';

    if (new_terbayar >= Number(tagihan.nominal_tagihan)) {
      new_status = 'PAID';
    } else if (new_terbayar > 0) {
      new_status = 'PARTIAL';
    }

    const sql = `
      UPDATE tagihan_siswa 
      SET nominal_terbayar = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [new_terbayar, new_status, tagihan_id]);
    return { new_terbayar, new_status };
  }

  /**
   * Auto generate tagihan SPP untuk satu kelas / angkatan berdasarkan tarif & override beasiswa
   */
  static async autoGenerateInvoices({ tarif_id, bulan, tahun, kode_kelas = null, tanggal_jatuh_tempo = null }) {
    // 1. Get tarif details
    const tarifRows = await query('SELECT * FROM tarif_pembayaran WHERE id = ?', [tarif_id]);
    if (!tarifRows || tarifRows.length === 0) throw new Error('Tarif tidak ditemukan');
    const tarif = tarifRows[0];

    // 2. Get active students
    let siswaSql = "SELECT * FROM siswa WHERE (status = 'Aktif' OR status IS NULL OR status = '')";
    const siswaParams = [];
    if (kode_kelas) {
      siswaSql += ' AND kode_kelas = ?';
      siswaParams.push(kode_kelas);
    }
    const siswaList = await query(siswaSql, siswaParams);

    // 3. Loop generate for each student
    let generatedCount = 0;
    for (const s of siswaList) {
      // Check existing invoice for this period
      const existing = await query(
        'SELECT id FROM tagihan_siswa WHERE siswa_id = ? AND tarif_id = ? AND bulan = ? AND tahun = ?',
        [s.kode_siswa, tarif_id, bulan, tahun]
      );
      if (existing && existing.length > 0) continue; // Skip if already created

      // Check scholarship / override
      let finalNominal = Number(tarif.nominal);
      const overrideRows = await query(
        'SELECT * FROM tarif_siswa_override WHERE tarif_id = ? AND siswa_id = ?',
        [tarif_id, s.kode_siswa]
      );

      if (overrideRows && overrideRows.length > 0) {
        const ov = overrideRows[0];
        if (ov.tipe_potongan === 'PERSEN') {
          finalNominal = finalNominal - (finalNominal * (Number(ov.nilai_potongan) / 100));
        } else {
          finalNominal = Math.max(0, finalNominal - Number(ov.nilai_potongan));
        }
      }

      await this.createInvoice({
        siswa_id: s.kode_siswa,
        tarif_id,
        bulan,
        tahun,
        nominal_tagihan: finalNominal,
        tanggal_jatuh_tempo
      });
      generatedCount++;
    }

    return { total_siswa: siswaList.length, generated_count: generatedCount };
  }

  /**
   * Auto generate tagihan SPP untuk rentang bulan custom (misal Agustus 2025 s/d Juli 2026)
   */
  static async autoGenerateRangeInvoices({
    tarif_id,
    bulan_mulai,
    tahun_mulai,
    bulan_selesai,
    tahun_selesai,
    kode_kelas = null,
    tanggal_jatuh_tempo = null
  }) {
    let curY = Number(tahun_mulai);
    let curM = Number(bulan_mulai);
    const endY = Number(tahun_selesai);
    const endM = Number(bulan_selesai);

    let totalGeneratedCount = 0;
    let totalSiswa = 0;
    let monthsProcessed = 0;

    let loopGuard = 0;

    while (loopGuard < 60) { // Max 5 tahun rentang
      loopGuard++;
      monthsProcessed++;

      const res = await this.autoGenerateInvoices({
        tarif_id,
        bulan: curM,
        tahun: curY,
        kode_kelas,
        tanggal_jatuh_tempo
      });

      totalSiswa = res.total_siswa;
      totalGeneratedCount += res.generated_count;

      if (curY === endY && curM === endM) {
        break;
      }

      curM++;
      if (curM > 12) {
        curM = 1;
        curY++;
      }

      if (curY > endY || (curY === endY && curM > endM)) {
        break;
      }
    }

    return {
      total_siswa: totalSiswa,
      months_processed: monthsProcessed,
      generated_count: totalGeneratedCount
    };
  }

  // --- REKAPITULASI & LAPORAN ---

  static async getRekapTunggakan(kode_kelas = null) {
    let sql = `
      SELECT 
        s.kode_siswa, s.nama_siswa, s.nis, k.nama_kelas,
        COUNT(t.id) AS total_tagihan,
        SUM(t.nominal_tagihan - t.nominal_terbayar) AS total_tunggakan
      FROM tagihan_siswa t
      JOIN siswa s ON t.siswa_id = s.kode_siswa
      LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
      WHERE t.status IN ('UNPAID', 'PARTIAL')
    `;
    const params = [];

    if (kode_kelas) {
      sql += ' AND s.kode_kelas = ?';
      params.push(kode_kelas);
    }

    sql += ' GROUP BY s.kode_siswa ORDER BY total_tunggakan DESC';
    return await query(sql, params);
  }

  // --- KELOLA & MANAGEMENT TAGIHAN ---

  static async getAllTagihan({ search = '', pos_id = '', kode_kelas = '', bulan = '', tahun = '', status = '', limit = 100 }) {
    let sql = `
      SELECT t.*, s.nama_siswa, s.nis, s.kode_kelas, k.nama_kelas, p.nama_pos, p.tipe AS tipe_pos
      FROM tagihan_siswa t
      JOIN siswa s ON t.siswa_id = s.kode_siswa
      LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
      JOIN tarif_pembayaran tr ON t.tarif_id = tr.id
      JOIN pos_pembayaran p ON tr.pos_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search && String(search).trim()) {
      sql += ' AND (s.nama_siswa LIKE ? OR s.nis LIKE ? OR t.kode_tagihan LIKE ?)';
      const q = `%${String(search).trim()}%`;
      params.push(q, q, q);
    }
    if (pos_id) {
      sql += ' AND tr.pos_id = ?';
      params.push(pos_id);
    }
    if (kode_kelas) {
      sql += ' AND s.kode_kelas = ?';
      params.push(kode_kelas);
    }
    if (bulan) {
      sql += ' AND t.bulan = ?';
      params.push(bulan);
    }
    if (tahun) {
      sql += ' AND t.tahun = ?';
      params.push(tahun);
    }
    if (status && status !== 'ALL') {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.tahun DESC, t.bulan DESC, t.id DESC LIMIT ?';
    params.push(Number(limit) || 100);

    return await query(sql, params);
  }

  static async updateInvoice(id, { nominal_tagihan, tanggal_jatuh_tempo }) {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Tagihan tidak ditemukan.');

    const sql = `
      UPDATE tagihan_siswa
      SET nominal_tagihan = ?, tanggal_jatuh_tempo = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [nominal_tagihan, tanggal_jatuh_tempo || existing.tanggal_jatuh_tempo, id]);
    return await this.findById(id);
  }

  static async deleteInvoice(id) {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Tagihan tidak ditemukan.');
    if (Number(existing.nominal_terbayar || 0) > 0) {
      throw new Error('Tagihan yang sudah pernah dibayar (sebagian/lunas) tidak dapat dihapus langsung. Batalkan transaksinya terlebih dahulu di Riwayat Transaksi.');
    }
    const sql = 'DELETE FROM tagihan_siswa WHERE id = ?';
    await query(sql, [id]);
    return true;
  }

  static async deleteBatchUnpaid({ pos_id = null, bulan = null, tahun = null, kode_kelas = null }) {
    let sql = `
      DELETE t FROM tagihan_siswa t
      JOIN tarif_pembayaran tr ON t.tarif_id = tr.id
      JOIN siswa s ON t.siswa_id = s.kode_siswa
      WHERE t.status = 'UNPAID' AND (t.nominal_terbayar = 0 OR t.nominal_terbayar IS NULL)
    `;
    const params = [];
    if (pos_id) {
      sql += ' AND tr.pos_id = ?';
      params.push(pos_id);
    }
    if (bulan) {
      sql += ' AND t.bulan = ?';
      params.push(bulan);
    }
    if (tahun) {
      sql += ' AND t.tahun = ?';
      params.push(tahun);
    }
    if (kode_kelas) {
      sql += ' AND s.kode_kelas = ?';
      params.push(kode_kelas);
    }

    const res = await query(sql, params);
    return { affected_rows: res.affectedRows };
  }
}

module.exports = TagihanSiswaModel;
