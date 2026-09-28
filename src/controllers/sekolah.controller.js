const SekolahModel = require('../models/sekolah.model');

exports.getSekolah = async (req, res) => {
  try {
    const data = await SekolahModel.get();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data sekolah',
      error: error.message
    });
  }
};

exports.updateSekolah = async (req, res) => {
  try {
    const updated = await SekolahModel.update(req.body);
    res.json({
      success: true,
      message: 'Data sekolah berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data sekolah',
      error: error.message
    });
  }
};
