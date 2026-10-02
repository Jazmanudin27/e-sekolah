const PosPembayaranModel = require('../models/posPembayaran.model');
const TarifPembayaranModel = require('../models/tarifPembayaran.model');
const TagihanSiswaModel = require('../models/tagihanSiswa.model');
const PembayaranTransaksiModel = require('../models/pembayaranTransaksi.model');
const { sendSuccess, sendError } = require('../utils/response.util');

// --- POS PEMBAYARAN CONTROLLERS ---

async function getAllPos(req, res, next) {
  try {
    const list = await PosPembayaranModel.findAll();
    sendSuccess(res, 'Daftar pos pembayaran berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

async function createPos(req, res, next) {
  try {
    const { kode_pos, nama_pos, tipe, deskripsi } = req.body;
    if (!kode_pos || !nama_pos) {
      return sendError(res, 'Kode pos dan Nama pos wajib diisi.', 400);
    }
    const id = await PosPembayaranModel.create({ kode_pos, nama_pos, tipe, deskripsi });
    sendSuccess(res, 'Pos pembayaran berhasil dibuat.', { id, kode_pos, nama_pos }, 201);
  } catch (error) {
    next(error);
  }
}

async function updatePos(req, res, next) {
  try {
    const { id } = req.params;
    await PosPembayaranModel.update(id, req.body);
    sendSuccess(res, 'Pos pembayaran berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

async function deletePos(req, res, next) {
  try {
    const { id } = req.params;
    await PosPembayaranModel.delete(id);
    sendSuccess(res, 'Pos pembayaran berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

// --- TARIF PEMBAYARAN CONTROLLERS ---

async function getAllTarif(req, res, next) {
  try {
    const { pos_id, tahun_ajaran } = req.query;
    const list = await TarifPembayaranModel.findAll({ pos_id, tahun_ajaran });
    sendSuccess(res, 'Daftar tarif pembayaran berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

async function createTarif(req, res, next) {
  try {
    const { pos_id, tahun_ajaran, tingkat, kode_kelas, nominal } = req.body;
    if (!pos_id || !tahun_ajaran || nominal === undefined) {
      return sendError(res, 'pos_id, tahun_ajaran, dan nominal wajib diisi.', 400);
    }
    const id = await TarifPembayaranModel.create({ pos_id, tahun_ajaran, tingkat, kode_kelas, nominal });
    sendSuccess(res, 'Tarif pembayaran berhasil ditambahkan.', { id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateTarif(req, res, next) {
  try {
    const { id } = req.params;
    await TarifPembayaranModel.update(id, req.body);
    sendSuccess(res, 'Tarif pembayaran berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

async function deleteTarif(req, res, next) {
  try {
    const { id } = req.params;
    await TarifPembayaranModel.delete(id);
    sendSuccess(res, 'Tarif pembayaran berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

async function setTarifOverride(req, res, next) {
  try {
    const { tarif_id, siswa_id, tipe_potongan, nilai_potongan, keterangan } = req.body;
    if (!tarif_id || !siswa_id || nilai_potongan === undefined) {
      return sendError(res, 'tarif_id, siswa_id, dan nilai_potongan wajib diisi.', 400);
    }
    await TarifPembayaranModel.setOverride({ tarif_id, siswa_id, tipe_potongan, nilai_potongan, keterangan });
    sendSuccess(res, 'Potongan/Beasiswa siswa berhasil disimpan.');
  } catch (error) {
    next(error);
  }
}

// --- TAGIHAN SISWA CONTROLLERS ---

async function getTagihanSiswa(req, res, next) {
  try {
    const { siswa_id } = req.params;
    const { status } = req.query;
    const list = await TagihanSiswaModel.findBySiswa(siswa_id, status);
    sendSuccess(res, 'Daftar tagihan siswa berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

async function generateTagihan(req, res, next) {
  try {
    const { tarif_id, bulan, tahun, kode_kelas, tanggal_jatuh_tempo } = req.body;
    if (!tarif_id || !bulan || !tahun) {
      return sendError(res, 'tarif_id, bulan, dan tahun wajib diisi.', 400);
    }
    const result = await TagihanSiswaModel.autoGenerateInvoices({
      tarif_id,
      bulan,
      tahun,
      kode_kelas,
      tanggal_jatuh_tempo
    });
    sendSuccess(res, 'Tagihan siswa berhasil digenerate.', result, 201);
  } catch (error) {
    next(error);
  }
}

// --- TRANSAKSI PEMBAYARAN CONTROLLERS ---

async function payCash(req, res, next) {
  try {
    const { siswa_id, items } = req.body;
    const user_id_kasir = req.user?.id || req.body.user_id_kasir || null;

    if (!siswa_id || !items || items.length === 0) {
      return sendError(res, 'siswa_id dan list items pembayaran wajib diisi.', 400);
    }

    const transaction = await PembayaranTransaksiModel.processCashPayment({
      siswa_id,
      user_id_kasir,
      items
    });

    sendSuccess(res, 'Pembayaran kasir berhasil diproses.', transaction, 201);
  } catch (error) {
    next(error);
  }
}

async function getAllTransaksi(req, res, next) {
  try {
    const { siswa_id, status, limit } = req.query;
    const list = await PembayaranTransaksiModel.findAll({ siswa_id, status, limit });
    sendSuccess(res, 'Daftar transaksi berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

async function getTransaksiDetail(req, res, next) {
  try {
    const { id } = req.params;
    const detail = await PembayaranTransaksiModel.findById(id);
    if (!detail) return sendError(res, 'Transaksi tidak ditemukan.', 404);
    sendSuccess(res, 'Detail transaksi berhasil diambil.', detail);
  } catch (error) {
    next(error);
  }
}

async function handleWebhookMidtrans(req, res, next) {
  try {
    const { order_id, transaction_status } = req.body;
    if (!order_id || !transaction_status) {
      return sendError(res, 'Invalid webhook payload', 400);
    }

    let status = 'PENDING';
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      status = 'SUCCESS';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      status = 'EXPIRED';
    }

    const updatedTrx = await PembayaranTransaksiModel.updateOnlinePaymentStatus(order_id, status);
    sendSuccess(res, 'Webhook payment updated successfully.', updatedTrx);
  } catch (error) {
    next(error);
  }
}

async function cancelTransaksi(req, res, next) {
  try {
    const { id } = req.params;
    const cancelledTrx = await PembayaranTransaksiModel.cancelTransaction(id);
    sendSuccess(res, 'Transaksi berhasil dibatalkan dan nominal tagihan telah dikembalikan.', cancelledTrx);
  } catch (error) {
    next(error);
  }
}

// --- LAPORAN & REKAP CONTROLLERS ---

async function getRekapTunggakan(req, res, next) {
  try {
    const { kode_kelas } = req.query;
    const list = await TagihanSiswaModel.getRekapTunggakan(kode_kelas);
    sendSuccess(res, 'Rekapitulasi tunggakan siswa berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPos,
  createPos,
  updatePos,
  deletePos,
  getAllTarif,
  createTarif,
  updateTarif,
  deleteTarif,
  setTarifOverride,
  getTagihanSiswa,
  generateTagihan,
  payCash,
  getAllTransaksi,
  getTransaksiDetail,
  cancelTransaksi,
  handleWebhookMidtrans,
  getRekapTunggakan
};
