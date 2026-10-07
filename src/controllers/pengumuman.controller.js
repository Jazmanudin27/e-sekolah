const PengumumanModel = require('../models/pengumuman.model');

exports.getActiveAnnouncements = async (req, res, next) => {
  try {
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const list = await PengumumanModel.getAllActive(kode_member);
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
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const list = await PengumumanModel.getAllAdmin(kode_member);
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
    const kode_member = req.user?.kode_member || req.body?.kode_member;
    const id = await PengumumanModel.create({ ...req.body, kode_member });
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
    const kode_member = req.user?.kode_member || req.body?.kode_member || req.query?.kode_member;
    const updateData = { ...req.body };
    if (kode_member && updateData.kode_member === undefined) {
      updateData.kode_member = kode_member;
    }
    await PengumumanModel.update(id, updateData);
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

exports.uploadBanner = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Tidak ada file gambar yang diupload.'
    });
  }
  const fileUrl = `/uploads/pengumuman/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Gambar banner berhasil diupload ke server!',
    url: fileUrl
  });
};
