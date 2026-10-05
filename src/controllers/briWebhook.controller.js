const briSnapService = require('../services/briSnap.service');
const { query } = require('../config/database');
const TagihanSiswaModel = require('../models/tagihanSiswa.model');

async function handleBriWebhook(req, res) {
  try {
    const headers = req.headers;
    const body = req.body;

    console.log('🔔 [BRI WEBHOOK RECEIVED]:', JSON.stringify(body));

    if (process.env.NODE_ENV === 'production') {
      const isValid = briSnapService.verifyWebhookSignature(headers, body);
      if (!isValid) {
        console.warn('⚠️ [BRI WEBHOOK INVALID SIGNATURE]');
        return res.status(401).json({
          responseCode: '4012500',
          responseMessage: 'Unauthorized Signature'
        });
      }
    }

    const { virtualAccountNo, amount } = body;
    const paidAmount = Number(amount?.value || body.paidAmount || 0);

    const rawNo = virtualAccountNo || '';
    const prefix = process.env.BRI_VA_PREFIX || '77777';
    const kodeOrNis = rawNo.startsWith(prefix) ? rawNo.slice(prefix.length) : rawNo;

    const tagihanRows = await query(
      `SELECT t.* FROM tagihan_siswa t 
       JOIN siswa s ON t.siswa_id = s.kode_siswa 
       WHERE (t.kode_tagihan = ? OR s.nis = ? OR s.kode_siswa = ?) AND t.status != 'PAID'`,
      [kodeOrNis, kodeOrNis, kodeOrNis]
    );

    if (!tagihanRows || tagihanRows.length === 0) {
      console.warn('⚠️ Tagihan tidak ditemukan untuk BRIVA:', virtualAccountNo);
      return res.status(200).json({
        responseCode: '4042500',
        responseMessage: 'Bill Not Found'
      });
    }

    let sisaBayar = paidAmount;
    for (const tagihan of tagihanRows) {
      if (sisaBayar <= 0) break;
      const outstanding = Number(tagihan.nominal_tagihan) - Number(tagihan.nominal_terbayar || 0);
      const bayar = Math.min(sisaBayar, outstanding);

      await TagihanSiswaModel.updatePembayaran(tagihan.id, bayar);
      sisaBayar -= bayar;
    }

    console.log(`✅ [BRI WEBHOOK SUCCESS] BRIVA: ${virtualAccountNo}, Paid: Rp ${paidAmount}`);

    return res.status(200).json({
      responseCode: '2002500',
      responseMessage: 'Successful'
    });

  } catch (error) {
    console.error('❌ [BRI WEBHOOK ERROR]:', error);
    return res.status(500).json({
      responseCode: '5002500',
      responseMessage: 'Internal Server Error'
    });
  }
}

module.exports = {
  handleBriWebhook
};
