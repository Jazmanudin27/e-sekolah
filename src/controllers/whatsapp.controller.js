const SekolahModel = require('../models/sekolah.model');
const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response.util');
const { sendWhatsAppMessage, formatPhoneNumber } = require('../utils/whatsapp.util');
const whatsappBaileys = require('../utils/whatsappBaileys.util');

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
    const baileysStatus = whatsappBaileys.getBaileysStatus();

    res.json({
      success: true,
      data: {
        wa_provider: sekolah.wa_provider || 'qr_scan',
        has_token: Boolean(sekolah.wa_api_token && sekolah.wa_api_token.trim().length > 0),
        wa_endpoint: sekolah.wa_endpoint || '',
        wa_auto_absen: sekolah.wa_auto_absen ?? 1,
        wa_auto_pelanggaran: sekolah.wa_auto_pelanggaran ?? 1,
        wa_sender_phone: baileysStatus.user?.phone || sekolah.wa_sender_phone || '',
        baileys: {
          status: baileysStatus.status,
          qr: baileysStatus.qr,
          user: baileysStatus.user,
          isConnected: baileysStatus.isConnected
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getQRStatus = async (req, res, next) => {
  try {
    const baileysStatus = whatsappBaileys.getBaileysStatus();
    res.json({
      success: true,
      data: baileysStatus
    });
  } catch (error) {
    next(error);
  }
};

exports.startQR = async (req, res, next) => {
  try {
    await whatsappBaileys.initBaileys(true);

    // Wait until QR is generated or status changes (max 7s)
    const startTime = Date.now();
    while (Date.now() - startTime < 7000) {
      const s = whatsappBaileys.getBaileysStatus();
      if (s.qr || s.isConnected) break;
      await new Promise(r => setTimeout(r, 400));
    }

    const baileysStatus = whatsappBaileys.getBaileysStatus();
    sendSuccess(res, 'Sesi WhatsApp dimulai.', baileysStatus);
  } catch (error) {
    next(error);
  }
};

exports.disconnectQR = async (req, res, next) => {
  try {
    const result = await whatsappBaileys.disconnectBaileys();
    sendSuccess(res, 'Koneksi WhatsApp berhasil diputuskan.', result);
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

    const activeProvider = (wa_provider || sekolah.wa_provider || 'qr_scan').toLowerCase();

    // Use passed config if testing before saving, otherwise fallback to saved config
    const activeConfig = {
      wa_provider: activeProvider,
      wa_api_token: wa_api_token || sekolah.wa_api_token,
      wa_endpoint: wa_endpoint || sekolah.wa_endpoint
    };

    if (activeProvider !== 'qr_scan' && !activeConfig.wa_api_token) {
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
