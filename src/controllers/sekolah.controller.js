const SekolahModel = require('../models/sekolah.model');

exports.getSekolah = async (req, res) => {
  try {
    const kode_member = req.user?.kode_member || req.query?.kode_member;
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
    const kode_member = req.user?.kode_member || req.body?.kode_member;
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
