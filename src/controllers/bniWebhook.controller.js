const bniSnapService = require('../services/bniSnap.service');
const { query } = require('../config/database');
const TagihanSiswaModel = require('../models/tagihanSiswa.model');

async function handleBniWebhook(req, res) {
  try {
    const headers = req.headers;
    const body = req.body;

    console.log('🔔 [BNI WEBHOOK RECEIVED]:', JSON.stringify(body));

    // 1. Verifikasi Signature BNI SNAP (opsional jika di sandbox, diwajibkan di prod)
    if (process.env.NODE_ENV === 'production') {
      const isValid = bniSnapService.verifyWebhookSignature(headers, body);
      if (!isValid) {
        console.warn('⚠️ [BNI WEBHOOK INVALID SIGNATURE]');
        return res.status(401).json({
          responseCode: '4012500',
          responseMessage: 'Unauthorized Signature'
        });
      }
    }

    // 2. Extract Data Pembayaran BNI SNAP
    const { virtualAccountNo, amount, paymentRequestId, trxId } = body;
    const paidAmount = Number(amount?.value || body.paidAmount || 0);

    // 3. Cari tagihan/transaksi berdasarkan VA / Reference No
    // Format VA: PREFIX + NIS / Kode Tagihan
    const rawNo = virtualAccountNo || '';
    const prefix = process.env.BNI_VA_PREFIX || '888';
    const kodeOrNis = rawNo.startsWith(prefix) ? rawNo.slice(prefix.length) : rawNo;

    // Cari tagihan siswa yang cocok (UNPAID/PARTIAL)
    const tagihanRows = await query(
      `SELECT t.* FROM tagihan_siswa t 
       JOIN siswa s ON t.siswa_id = s.kode_siswa 
       WHERE (t.kode_tagihan = ? OR s.nis = ? OR s.kode_siswa = ?) AND t.status != 'PAID'`,
      [kodeOrNis, kodeOrNis, kodeOrNis]
    );

    if (!tagihanRows || tagihanRows.length === 0) {
      console.warn('⚠️ Tagihan tidak ditemukan untuk VA:', virtualAccountNo);
      return res.status(200).json({
        responseCode: '4042500',
        responseMessage: 'Bill Not Found'
      });
    }

    // Apply pembayaran ke tagihan teratas / tertua
    let sisaBayar = paidAmount;
    for (const tagihan of tagihanRows) {
      if (sisaBayar <= 0) break;
      const outstanding = Number(tagihan.nominal_tagihan) - Number(tagihan.nominal_terbayar || 0);
      const bayar = Math.min(sisaBayar, outstanding);

      await TagihanSiswaModel.updatePembayaran(tagihan.id, bayar);
      sisaBayar -= bayar;
    }

    console.log(`✅ [BNI WEBHOOK SUCCESS] VA: ${virtualAccountNo}, Paid: Rp ${paidAmount}`);

    // 4. Response Standar BNI SNAP BI
    return res.status(200).json({
      responseCode: '2002500',
      responseMessage: 'Successful'
    });

  } catch (error) {
    console.error('❌ [BNI WEBHOOK ERROR]:', error);
    return res.status(500).json({
      responseCode: '5002500',
      responseMessage: 'Internal Server Error'
    });
  }
}

module.exports = {
  handleBniWebhook
};
