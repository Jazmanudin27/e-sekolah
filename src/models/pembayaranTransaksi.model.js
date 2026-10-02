const { query } = require('../config/database');
const TagihanSiswaModel = require('./tagihanSiswa.model');

class PembayaranTransaksiModel {
  static async findAll({ siswa_id = null, status = null, limit = 50 }) {
    let sql = `
      SELECT tr.*, s.nama_siswa, s.nis, u.nama_lengkap AS nama_kasir
      FROM pembayaran_transaksi tr
      JOIN siswa s ON tr.siswa_id = s.kode_siswa
      LEFT JOIN user u ON tr.user_id_kasir = u.id
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
    const sql = `
      SELECT tr.*, s.nama_siswa, s.nis, k.nama_kelas, u.nama_lengkap AS nama_kasir
      FROM pembayaran_transaksi tr
      JOIN siswa s ON tr.siswa_id = s.kode_siswa
      LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
      LEFT JOIN user u ON tr.user_id_kasir = u.id
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
   * Update Payment Gateway Online Status (e.g. via Midtrans Webhook)
   */
  static async updateOnlinePaymentStatus(reference_no, status_transaksi) {
    const trx = await this.findByReferenceNo(reference_no);
    if (!trx) throw new Error('Transaksi reference tidak ditemukan');

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
}

module.exports = PembayaranTransaksiModel;
