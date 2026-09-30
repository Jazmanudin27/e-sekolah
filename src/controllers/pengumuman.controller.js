const PengumumanModel = require('../models/pengumuman.model');

exports.getActiveAnnouncements = async (req, res, next) => {
  try {
    const list = await PengumumanModel.getAllActive();
    res.json({
      success: true,
      data: list
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdminAnnouncements = async (req, res, next) => {
  try {
    const list = await PengumumanModel.getAllAdmin();
    res.json({
      success: true,
      data: list
    });
  } catch (err) {
    next(err);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { judul, isi } = req.body;
    if (!judul || !isi) {
      return res.status(400).json({
        success: false,
        message: 'Judul dan isi pengumuman wajib diisi.'
      });
    }
    const id = await PengumumanModel.create(req.body);
    res.json({
      success: true,
      message: 'Pengumuman berhasil diterbitkan!',
      data: { id, ...req.body }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PengumumanModel.update(id, req.body);
    res.json({
      success: true,
      message: 'Pengumuman berhasil diperbarui!'
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PengumumanModel.delete(id);
    res.json({
      success: true,
      message: 'Pengumuman berhasil dihapus!'
    });
  } catch (err) {
    next(err);
  }
};
