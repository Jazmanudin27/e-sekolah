const SekolahModel = require('../models/sekolah.model');
const { query } = require('../config/database');

async function getKodeMemberFromReq(req) {
  let km = req.user?.kode_member || req.query?.kode_member || req.body?.kode_member;
  if (km) return km;

  if (req.user) {
    if (req.user.type === 'Admin' || req.user.id || req.user.username) {
      try {
        const rows = await query(
          'SELECT kode_member FROM users WHERE id = ? OR username = ? LIMIT 1',
          [req.user.id || 0, req.user.username || '']
        );
        if (rows && rows[0]?.kode_member) return rows[0].kode_member;
      } catch (e) {}
    }

    if (req.user.type === 'Guru' || req.user.kode_guru) {
      try {
        const rows = await query(
          'SELECT kode_member FROM guru WHERE kode_guru = ? OR username = ? LIMIT 1',
          [req.user.kode_guru || '', req.user.username || '']
        );
        if (rows && rows[0]?.kode_member) return rows[0].kode_member;
      } catch (e) {}
    }

    if (req.user.type === 'Kelas' || req.user.kode_kelas) {
      try {
        const rows = await query(
          'SELECT kode_member FROM kelas WHERE kode_kelas = ? OR username = ? LIMIT 1',
          [req.user.kode_kelas || '', req.user.username || '']
        );
        if (rows && rows[0]?.kode_member) return rows[0].kode_member;
      } catch (e) {}
    }
  }

  return null;
}

exports.getSekolah = async (req, res) => {
  try {
    const kode_member = await getKodeMemberFromReq(req);
    const data = await SekolahModel.get(kode_member);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data sekolah/member',
      error: error.message
    });
  }
};

exports.updateSekolah = async (req, res) => {
  try {
    const kode_member = await getKodeMemberFromReq(req);
    const updated = await SekolahModel.update(req.body, kode_member);
    res.json({
      success: true,
      message: 'Data sekolah/member berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data sekolah/member',
      error: error.message
    });
  }
};

