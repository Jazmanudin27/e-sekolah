const { query } = require('../config/database');
const TagihanSiswaModel = require('./tagihanSiswa.model');
const UserModel = require('./user.model');

async function getUserQueryParts() {
  try {
    const { tableName, columns } = await UserModel.resolveUserTableInfo();
    const idCol = columns.includes('id_user') ? 'id_user' : 'id';
    
    // Filter candidate name columns that actually exist in the DB schema
    const candidates = ['nama_lengkap', 'nama', 'name', 'username', 'email'];
    const validCols = candidates.filter(c => columns.includes(c));
    
    let selectKasir = "'Kasir TU' AS nama_kasir";
    if (validCols.length > 0) {
      selectKasir = `COALESCE(${validCols.map(c => `u.\`${c}\``).join(', ')}, 'Kasir TU') AS nama_kasir`;
    }
    
    const joinClause = `LEFT JOIN \`${tableName}\` u ON tr.user_id_kasir = u.\`${idCol}\``;
    return { selectKasir, joinClause };
  } catch (e) {
    return {
      selectKasir: "'Kasir TU' AS nama_kasir",
      joinClause: "LEFT JOIN users u ON tr.user_id_kasir = u.id"
    };
  }
}

class PembayaranTransaksiModel {
  static async findAll({ siswa_id = null, status = null, limit = 50 }) {
    const { selectKasir, joinClause } = await getUserQueryParts();
    let sql = `
      SELECT tr.*, s.nama_siswa, s.nis, ${selectKasir}
      FROM pembayaran_transaksi tr
      JOIN siswa s ON tr.siswa_id = s.kode_siswa
      ${joinClause}
      WHERE 1=1
    `;
    const params = [];

    if (siswa_id) {
      sql += ' AND tr.siswa_id = ?';
      params.push(siswa_id);
    }
    if (status) {
      sql += ' AND tr.status_transaksi = ?';
      params.push(status);
    }

    sql += ' ORDER BY tr.tanggal_bayar DESC LIMIT ?';
    params.push(Number(limit));
    return await query(sql, params);
  }

  static async findById(id) {
    const { selectKasir, joinClause } = await getUserQueryParts();
    const sql = `
      SELECT tr.*, s.nama_siswa, s.nis, k.nama_kelas, ${selectKasir}
      FROM pembayaran_transaksi tr
      JOIN siswa s ON tr.siswa_id = s.kode_siswa
      LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
      ${joinClause}
      WHERE tr.id = ?
    `;
    const rows = await query(sql, [id]);
    if (!rows || rows.length === 0) return null;

    const transaction = rows[0];
    const details = await query(
      `SELECT d.*, t.bulan, t.tahun, p.nama_pos 
       FROM pembayaran_detail d
       JOIN tagihan_siswa t ON d.tagihan_id = t.id
       JOIN tarif_pembayaran tr ON t.tarif_id = tr.id
       JOIN pos_pembayaran p ON tr.pos_id = p.id
       WHERE d.transaksi_id = ?`,
      [id]
    );

    return { ...transaction, details };
  }

  static async findByNoTransaksi(no_transaksi) {
    const rows = await query('SELECT * FROM pembayaran_transaksi WHERE no_transaksi = ?', [no_transaksi]);
    return rows[0] || null;
  }

  static async findByReferenceNo(reference_no) {
    const rows = await query('SELECT * FROM pembayaran_transaksi WHERE reference_no = ?', [reference_no]);
    return rows[0] || null;
  }

  /**
   * Process Cash Payment by Kasir TU
   */
  static async processCashPayment({ siswa_id, user_id_kasir, items = [] }) {
    if (!items || items.length === 0) throw new Error('Item pembayaran tidak boleh kosong');

    const total_bayar = items.reduce((acc, item) => acc + Number(item.nominal_bayar), 0);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const no_transaksi = `TRX-${dateStr}-${randomNum}`;

    // 1. Insert Transaction Header
    const sqlHeader = `
      INSERT INTO pembayaran_transaksi (no_transaksi, siswa_id, total_bayar, metode_pembayaran, channel_pembayaran, user_id_kasir, status_transaksi)
      VALUES (?, ?, ?, 'CASH', 'CASH_KASIR', ?, 'SUCCESS')
    `;
    const resHeader = await query(sqlHeader, [no_transaksi, siswa_id, total_bayar, user_id_kasir]);
    const transaksi_id = resHeader.insertId;

    // 2. Insert Details & Update Invoices
    for (const item of items) {
      await query(
        'INSERT INTO pembayaran_detail (transaksi_id, tagihan_id, nominal_dibayar) VALUES (?, ?, ?)',
        [transaksi_id, item.tagihan_id, item.nominal_bayar]
      );
      await TagihanSiswaModel.updatePembayaran(item.tagihan_id, item.nominal_bayar);
    }

    return await this.findById(transaksi_id);
  }

  /**
   * Create Online Pending Transaction (e.g. Midtrans SNAP) with status 'PENDING'
   */
  static async createOnlinePendingTransaction({ order_id, siswa_id, total_bayar, items = [], metode_pembayaran = 'MIDTRANS' }) {
    // Auto-expire previous uncompleted PENDING transactions for this student
    if (siswa_id) {
      await query(
        "UPDATE pembayaran_transaksi SET status_transaksi = 'EXPIRED', alasan_batal = 'Digantikan transaksi baru' WHERE siswa_id = ? AND status_transaksi = 'PENDING'",
        [siswa_id]
      );
    }

    const sqlHeader = `
      INSERT INTO pembayaran_transaksi (no_transaksi, reference_no, siswa_id, total_bayar, metode_pembayaran, channel_pembayaran, status_transaksi)
      VALUES (?, ?, ?, ?, ?, 'ONLINE_GATEWAY', 'PENDING')
    `;
    const resHeader = await query(sqlHeader, [order_id, order_id, siswa_id, total_bayar, metode_pembayaran]);
    const transaksi_id = resHeader.insertId;

    if (items && items.length > 0) {
      for (const item of items) {
        await query(
          'INSERT INTO pembayaran_detail (transaksi_id, tagihan_id, nominal_dibayar) VALUES (?, ?, ?)',
          [transaksi_id, item.tagihan_id || item.id, item.nominal_bayar || item.price || total_bayar]
        );
      }
    }
    return await this.findById(transaksi_id);
  }

  /**
   * Update Payment Gateway Online Status (e.g. via Midtrans Webhook)
   */
  static async updateOnlinePaymentStatus(reference_no, status_transaksi) {
    let trx = await this.findByReferenceNo(reference_no);
    if (!trx) {
      trx = await this.findByNoTransaksi(reference_no);
    }
    if (!trx) {
      console.warn(`⚠️ Transaksi reference_no ${reference_no} tidak ditemukan di database.`);
      return null;
    }

    await query('UPDATE pembayaran_transaksi SET status_transaksi = ? WHERE id = ?', [status_transaksi, trx.id]);

    // If status becomes SUCCESS, update tagihan_siswa
    if (status_transaksi === 'SUCCESS') {
      const details = await query('SELECT * FROM pembayaran_detail WHERE transaksi_id = ?', [trx.id]);
      for (const d of details) {
        await TagihanSiswaModel.updatePembayaran(d.tagihan_id, d.nominal_dibayar);
      }
    }

    return await this.findById(trx.id);
  }

  /**
   * Cancel / Void payment transaction and restore invoice balance
   */
  static async cancelTransaction(id, alasan_batal = null) {
    try {
      await query("ALTER TABLE pembayaran_transaksi ADD COLUMN IF NOT EXISTS alasan_batal TEXT NULL AFTER status_transaksi");
    } catch (e) {
      // Ignore if column exists
    }

    const trx = await this.findById(id);
    if (!trx) throw new Error('Transaksi tidak ditemukan');
    if (trx.status_transaksi === 'CANCELLED') throw new Error('Transaksi ini sudah dibatalkan sebelumnya');

    // Restore tagihan_siswa nominal_terbayar & status
    if (trx.details && trx.details.length > 0) {
      for (const d of trx.details) {
        await TagihanSiswaModel.reducePembayaran(d.tagihan_id, d.nominal_dibayar);
      }
    }

    // Mark header status as CANCELLED with reason
    await query("UPDATE pembayaran_transaksi SET status_transaksi = 'CANCELLED', alasan_batal = ? WHERE id = ?", [alasan_batal || 'Dibatalkan oleh Kasir/TU', id]);
    return await this.findById(id);
  }

  /**
   * Update / Edit existing payment transaction items & amounts
   */
  static async updateTransaction(id, { metode_pembayaran, items = [] }) {
    const trx = await this.findById(id);
    if (!trx) throw new Error('Transaksi tidak ditemukan');
    if (trx.status_transaksi === 'CANCELLED') throw new Error('Transaksi yang telah dibatalkan tidak dapat diedit');

    if (!items || items.length === 0) throw new Error('Item pembayaran tidak boleh kosong');

    // 1. Revert previous amounts from tagihan_siswa
    if (trx.details && trx.details.length > 0) {
      for (const d of trx.details) {
        await TagihanSiswaModel.reducePembayaran(d.tagihan_id, d.nominal_dibayar);
      }
    }

    // 2. Delete old details
    await query('DELETE FROM pembayaran_detail WHERE transaksi_id = ?', [id]);

    // 3. Insert new details & apply updated payment to tagihan_siswa
    let newTotal = 0;
    for (const item of items) {
      const nominal = Number(item.nominal_bayar) || 0;
      newTotal += nominal;

      await query(
        'INSERT INTO pembayaran_detail (transaksi_id, tagihan_id, nominal_dibayar) VALUES (?, ?, ?)',
        [id, item.tagihan_id, nominal]
      );
      await TagihanSiswaModel.updatePembayaran(item.tagihan_id, nominal);
    }

    // 4. Update header total & method
    await query(
      'UPDATE pembayaran_transaksi SET total_bayar = ?, metode_pembayaran = COALESCE(?, metode_pembayaran), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newTotal, metode_pembayaran || null, id]
    );

    return await this.findById(id);
  }
}

module.exports = PembayaranTransaksiModel;
