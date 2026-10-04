const SekolahModel = require('../models/sekolah.model');
const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response.util');
const { sendWhatsAppMessage, formatPhoneNumber } = require('../utils/whatsapp.util');

async function getKodeMember(req) {
  let km = req.user?.kode_member || req.query?.kode_member || req.body?.kode_member;
  if (km) return km;

  if (req.user?.username) {
    try {
      const rows = await query('SELECT kode_member FROM users WHERE username = ? LIMIT 1', [req.user.username]);
      if (rows && rows[0]?.kode_member) return rows[0].kode_member;
    } catch (e) {}
  }
  return null;
}

exports.getStatus = async (req, res, next) => {
  try {
    const kode_member = await getKodeMember(req);
    const sekolah = await SekolahModel.get(kode_member);

    res.json({
      success: true,
      data: {
        wa_provider: sekolah.wa_provider || 'fonnte',
        has_token: Boolean(sekolah.wa_api_token && sekolah.wa_api_token.trim().length > 0),
        wa_endpoint: sekolah.wa_endpoint || '',
        wa_auto_absen: sekolah.wa_auto_absen ?? 1,
        wa_auto_pelanggaran: sekolah.wa_auto_pelanggaran ?? 1,
        wa_sender_phone: sekolah.wa_sender_phone || ''
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.testSend = async (req, res, next) => {
  try {
    const kode_member = await getKodeMember(req);
    const { target_phone, message, wa_provider, wa_api_token, wa_endpoint } = req.body;

    if (!target_phone) {
      return sendError(res, 'Nomor HP tujuan pengujian wajib diisi.', 400);
    }

    const sekolah = await SekolahModel.get(kode_member);

    // Use passed config if testing before saving, otherwise fallback to saved config
    const activeConfig = {
      wa_provider: wa_provider || sekolah.wa_provider || 'fonnte',
      wa_api_token: wa_api_token || sekolah.wa_api_token,
      wa_endpoint: wa_endpoint || sekolah.wa_endpoint
    };

    if (!activeConfig.wa_api_token) {
      return sendError(res, 'Token API WhatsApp Gateway belum diisi.', 400);
    }

    const testMessage = message || (
      `🔔 *TES KONEKSI WHATSAPP GATEWAY*\n` +
      `Sistem E-Sekolah ${sekolah.nama_sekolah || ''}\n\n` +
      `Halo! Pesan ini adalah uji coba koneksi gateway WhatsApp untuk pengiriman notifikasi otomatis absensi dan tata tertib siswa.\n\n` +
      `Waktu tes: ${new Date().toLocaleString('id-ID')}\n` +
      `Status Gateway: Terhubung Aktif ✅`
    );

    const result = await sendWhatsAppMessage({
      target: target_phone,
      message: testMessage,
      config: activeConfig
    });

    if (result.success) {
      sendSuccess(res, 'Pesan uji coba WhatsApp berhasil dikirim!', result.data);
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        details: result.data
      });
    }
  } catch (error) {
    next(error);
  }
};
