const PresensiModel = require('../models/presensi.model');
const { sendSuccess, sendError } = require('../utils/response.util');
const { getTodayString, getCurrentTimeString } = require('../utils/date.util');

// Get today's attendance status for logged-in teacher
async function getTodayStatus(req, res, next) {
  try {
    const { kode_guru } = req.user;
    const today = getTodayString();

    const item = await PresensiModel.findByGuruAndDate(kode_guru, today);

    if (!item) {
      return sendSuccess(res, 'Belum presensi hari ini.', {
        tanggal: today,
        status: 'BELUM_CHECKIN',
        jam_in: null,
        jam_out: null
      });
    }

    let status = 'CHECKIN';
    if (item.jam_in && item.jam_out) {
      status = 'CHECKOUT';
    }

    sendSuccess(res, 'Status presensi hari ini berhasil diambil.', {
      ...item,
      status
    });
  } catch (error) {
    next(error);
  }
}

// Teacher Check-In (Absen Masuk)
async function checkIn(req, res, next) {
  try {
    const { kode_guru } = req.user;
    const { lokasi, foto } = req.body;
    const today = getTodayString();
    const timeNow = getCurrentTimeString();

    const existing = await PresensiModel.findByGuruAndDate(kode_guru, today);

    if (existing) {
      return sendError(res, 'Anda sudah melakukan presensi masuk hari ini.', 400);
    }

    const insertId = await PresensiModel.createCheckIn({
      kode_guru,
      tanggal: today,
      jam_in: timeNow,
      lokasi_in: lokasi,
      foto_in: foto
    });

    sendSuccess(res, 'Presensi masuk berhasil dicatat.', {
      id: insertId,
      kode_guru,
      tanggal: today,
      jam_in: timeNow,
      lokasi_in: lokasi
    }, 201);
  } catch (error) {
    next(error);
  }
}

// Teacher Check-Out (Absen Pulang)
async function checkOut(req, res, next) {
  try {
    const { kode_guru } = req.user;
    const { lokasi, foto } = req.body;
    const today = getTodayString();
    const timeNow = getCurrentTimeString();

    const existing = await PresensiModel.findByGuruAndDate(kode_guru, today);

    if (!existing) {
      return sendError(res, 'Anda belum melakukan presensi masuk hari ini.', 400);
    }

    if (existing.jam_out) {
      return sendError(res, 'Anda sudah melakukan presensi pulang hari ini.', 400);
    }

    await PresensiModel.updateCheckOut(existing.id, {
      jam_out: timeNow,
      lokasi_out: lokasi,
      foto_out: foto
    });

    sendSuccess(res, 'Presensi pulang berhasil dicatat.', {
      id: existing.id,
      kode_guru,
      tanggal: today,
      jam_out: timeNow,
      lokasi_out: lokasi
    });
  } catch (error) {
    next(error);
  }
}

// Get Attendance History
async function getHistory(req, res, next) {
  try {
    const { kode_guru } = req.user;
    const { bulan, tahun, limit = 30 } = req.query;

    const teacherId = (req.user.role === 'Guru') ? kode_guru : (req.query.kode_guru || kode_guru);

    const records = await PresensiModel.getHistory({
      kode_guru: teacherId,
      bulan,
      tahun,
      limit
    });

    sendSuccess(res, 'Riwayat presensi berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTodayStatus,
  checkIn,
  checkOut,
  getHistory
};
