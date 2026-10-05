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

const SekolahModel = require('../models/sekolah.model');

const DEFAULT_SCHOOL_LAT = -7.325205;
const DEFAULT_SCHOOL_LNG = 108.208354;
const DEFAULT_MAX_RADIUS_METER = 100;

function calculateDistanceMeter(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function checkRadiusValidation(lokasiStr, schoolLat, schoolLng, maxRadius) {
  if (!lokasiStr) return { valid: true, distance: 0 };
  const parts = String(lokasiStr).split(',').map(s => parseFloat(s.trim()));
  const targetLat = schoolLat || DEFAULT_SCHOOL_LAT;
  const targetLng = schoolLng || DEFAULT_SCHOOL_LNG;
  const limitRadius = maxRadius || DEFAULT_MAX_RADIUS_METER;

  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const distance = calculateDistanceMeter(parts[0], parts[1], targetLat, targetLng);
    if (distance > limitRadius) {
      return { valid: false, distance, maxRadius: limitRadius };
    }
    return { valid: true, distance, maxRadius: limitRadius };
  }
  return { valid: true, distance: 0, maxRadius: limitRadius };
}

// Teacher Check-In (Absen Masuk)
async function checkIn(req, res, next) {
  try {
    const { kode_guru, kode_member } = req.user;
    const { lokasi, foto, is_fake_gps } = req.body;
    const today = getTodayString();
    const timeNow = getCurrentTimeString();

    const existing = await PresensiModel.findByGuruAndDate(kode_guru, today);
    if (existing) {
      return sendError(res, 'Anda sudah melakukan presensi masuk hari ini.', 400);
    }

    // Load dynamic school settings
    const school = await SekolahModel.get(kode_member);
    const modePresensi = school.mode_presensi_guru || 'gps_kamera';
    const schoolLat = parseFloat(school.lat_sekolah || DEFAULT_SCHOOL_LAT);
    const schoolLng = parseFloat(school.lng_sekolah || DEFAULT_SCHOOL_LNG);
    const maxRadius = parseInt(school.radius_gps || DEFAULT_MAX_RADIUS_METER, 10);

    // Mode check
    const requiresGps = modePresensi === 'gps_kamera' || modePresensi === 'gps_only';
    const requiresKamera = modePresensi === 'gps_kamera' || modePresensi === 'kamera_only';

    if (requiresGps) {
      if (is_fake_gps) {
        return sendError(res, 'Penggunaan Fake GPS dilarang oleh sistem presensi sekolah.', 403);
      }
      const radiusCheck = checkRadiusValidation(lokasi, schoolLat, schoolLng, maxRadius);
      if (!radiusCheck.valid) {
        return sendError(res, `Presensi ditolak! Anda berada di luar radius aman sekolah (${radiusCheck.distance}m dari sekolah). Maksimal radius: ${maxRadius}m.`, 400);
      }
    }

    if (requiresKamera && !foto) {
      return sendError(res, 'Presensi ditolak! Foto bukti selfie wajib diambil untuk mode presensi ini.', 400);
    }

    const finalLokasi = lokasi || 'Kamera Only (Tanpa GPS)';

    const insertId = await PresensiModel.createCheckIn({
      kode_guru,
      tanggal: today,
      jam_in: timeNow,
      lokasi_in: finalLokasi,
      foto_in: foto,
      kode_member
    });

    sendSuccess(res, 'Presensi masuk berhasil dicatat.', {
      id: insertId,
      kode_guru,
      tanggal: today,
      jam_in: timeNow,
      lokasi_in: finalLokasi
    }, 201);
  } catch (error) {
    next(error);
  }
}

// Teacher Check-Out (Absen Pulang)
async function checkOut(req, res, next) {
  try {
    const { kode_guru, kode_member } = req.user;
    const { lokasi, foto, is_fake_gps } = req.body;
    const today = getTodayString();
    const timeNow = getCurrentTimeString();

    const existing = await PresensiModel.findByGuruAndDate(kode_guru, today);
    if (!existing) {
      return sendError(res, 'Anda belum melakukan presensi masuk hari ini.', 400);
    }
    if (existing.jam_out) {
      return sendError(res, 'Anda sudah melakukan presensi pulang hari ini.', 400);
    }

    // Load dynamic school settings
    const school = await SekolahModel.get(kode_member);
    const modePresensi = school.mode_presensi_guru || 'gps_kamera';
    const schoolLat = parseFloat(school.lat_sekolah || DEFAULT_SCHOOL_LAT);
    const schoolLng = parseFloat(school.lng_sekolah || DEFAULT_SCHOOL_LNG);
    const maxRadius = parseInt(school.radius_gps || DEFAULT_MAX_RADIUS_METER, 10);

    const requiresGps = modePresensi === 'gps_kamera' || modePresensi === 'gps_only';
    const requiresKamera = modePresensi === 'gps_kamera' || modePresensi === 'kamera_only';

    if (requiresGps) {
      if (is_fake_gps) {
        return sendError(res, 'Penggunaan Fake GPS dilarang oleh sistem presensi sekolah.', 403);
      }
      const radiusCheck = checkRadiusValidation(lokasi, schoolLat, schoolLng, maxRadius);
      if (!radiusCheck.valid) {
        return sendError(res, `Presensi ditolak! Anda berada di luar radius aman sekolah (${radiusCheck.distance}m dari sekolah). Maksimal radius: ${maxRadius}m.`, 400);
      }
    }

    if (requiresKamera && !foto) {
      return sendError(res, 'Presensi ditolak! Foto bukti selfie wajib diambil untuk mode presensi ini.', 400);
    }

    const finalLokasi = lokasi || 'Kamera Only (Tanpa GPS)';

    await PresensiModel.updateCheckOut(existing.id, {
      jam_out: timeNow,
      lokasi_out: finalLokasi,
      foto_out: foto
    });

    sendSuccess(res, 'Presensi pulang berhasil dicatat.', {
      id: existing.id,
      kode_guru,
      tanggal: today,
      jam_out: timeNow,
      lokasi_out: finalLokasi
    });
  } catch (error) {
    next(error);
  }
}

// Get Attendance History
async function getHistory(req, res, next) {
  try {
    const { kode_guru } = req.user;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const { bulan, tahun, limit = 30 } = req.query;

    const userRole = String(req.user?.role || req.user?.level || '').toLowerCase();
    const isFullAccess = ['admin', 'superadmin', 'kepala sekolah', 'kepala_sekolah', 'kepsek', 'tu', 'operator'].includes(userRole);
    const teacherId = isFullAccess ? (req.query.kode_guru || null) : kode_guru;

    const records = await PresensiModel.getHistory({
      kode_guru: teacherId,
      bulan,
      tahun,
      limit,
      kode_member
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
