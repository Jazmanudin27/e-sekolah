const PosPembayaranModel = require('../models/posPembayaran.model');
const TarifPembayaranModel = require('../models/tarifPembayaran.model');
const TagihanSiswaModel = require('../models/tagihanSiswa.model');
const PembayaranTransaksiModel = require('../models/pembayaranTransaksi.model');
const { sendSuccess, sendError } = require('../utils/response.util');

// --- POS PEMBAYARAN CONTROLLERS ---

async function getAllPos(req, res, next) {
  try {
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const list = await PosPembayaranModel.findAll(kode_member);
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
    const kode_member = req.user?.kode_member || req.body?.kode_member;
    const id = await PosPembayaranModel.create({ kode_pos, nama_pos, tipe, deskripsi, kode_member });
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
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const list = await TarifPembayaranModel.findAll({ pos_id, tahun_ajaran, kode_member });
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
    let { siswa_id } = req.params;
    if (req.user && (req.user.type === 'Siswa' || req.user.type === 'Ortu')) {
      siswa_id = req.user.kode_siswa;
    }
    const { status } = req.query;
    const list = await TagihanSiswaModel.findBySiswa(siswa_id, status);
    sendSuccess(res, 'Daftar tagihan siswa berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

async function generateTagihan(req, res, next) {
  try {
    const { mode = 'SINGLE', tarif_id, bulan, tahun, bulan_mulai, tahun_mulai, bulan_selesai, tahun_selesai, kode_kelas, tanggal_jatuh_tempo } = req.body;
    const kode_member = req.user?.kode_member || req.body?.kode_member;
    if (!tarif_id) {
      return sendError(res, 'tarif_id wajib diisi.', 400);
    }

    let result;
    if (mode === 'RANGE' || (bulan_mulai && tahun_mulai && bulan_selesai && tahun_selesai)) {
      if (!bulan_mulai || !tahun_mulai || !bulan_selesai || !tahun_selesai) {
        return sendError(res, 'Bulan & tahun mulai serta selesai wajib diisi untuk mode rentang.', 400);
      }
      result = await TagihanSiswaModel.autoGenerateRangeInvoices({
        tarif_id,
        bulan_mulai,
        tahun_mulai,
        bulan_selesai,
        tahun_selesai,
        kode_kelas,
        tanggal_jatuh_tempo,
        kode_member
      });
    } else {
      if (!tahun) {
        return sendError(res, 'Tahun tagihan wajib diisi.', 400);
      }
      if (!bulan) {
        const { query } = require('../config/database');
        const tarifRows = await query(
          'SELECT p.tipe AS tipe_pos FROM tarif_pembayaran t JOIN pos_pembayaran p ON t.pos_id = p.id WHERE t.id = ?',
          [tarif_id]
        );
        const isBebas = (tarifRows?.[0]?.tipe_pos === 'BEBAS');
        if (!isBebas) {
          return sendError(res, 'Bulan dan tahun wajib diisi untuk tagihan bulanan.', 400);
        }
      }
      result = await TagihanSiswaModel.autoGenerateInvoices({
        tarif_id,
        bulan: bulan || null,
        tahun,
        kode_kelas,
        tanggal_jatuh_tempo,
        kode_member
      });
    }

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
    let { siswa_id, status, limit } = req.query;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    if (req.user && (req.user.type === 'Siswa' || req.user.type === 'Ortu')) {
      siswa_id = req.user.kode_siswa;
    }
    const list = await PembayaranTransaksiModel.findAll({ siswa_id, status, limit, kode_member });
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

async function createMidtransSnapToken(req, res, next) {
  try {
    const { siswa_id, items = [], nominal } = req.body;
    const midtransService = require('../services/midtrans.service');
    const { query } = require('../config/database');

    const siswaRows = await query('SELECT * FROM siswa WHERE kode_siswa = ?', [siswa_id]);
    if (!siswaRows || siswaRows.length === 0) return sendError(res, 'Siswa tidak ditemukan', 404);
    const siswa = siswaRows[0];

    const totalNominal = nominal || items.reduce((acc, item) => acc + Number(item.nominal_bayar || 0), 0);
    const orderId = `INV-${Date.now()}`;

    // 1. Simpan Transaksi Online PENDING ke DB
    await PembayaranTransaksiModel.createOnlinePendingTransaction({
      order_id: orderId,
      siswa_id,
      total_bayar: totalNominal,
      items,
      metode_pembayaran: 'MIDTRANS'
    });

    // 2. Buat Snap Token di Midtrans Gateway
    const finishUrl = req.headers.origin ? `${req.headers.origin}/` : (req.headers.referer || process.env.MIDTRANS_FINISH_URL || 'https://sekolah.aspartech.com/');
    const snapResult = await midtransService.createSnapTransaction({
      orderId,
      grossAmount: totalNominal,
      customerName: siswa.nama_siswa,
      email: siswa.email || 'siswa@artanita.sch.id',
      items,
      finishUrl
    });

    sendSuccess(res, 'Midtrans Snap Token berhasil dibuat.', snapResult, 201);
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
    const { alasan_batal } = req.body || {};
    const reason = alasan_batal || req.query.alasan_batal || null;
    const cancelledTrx = await PembayaranTransaksiModel.cancelTransaction(id, reason);
    sendSuccess(res, 'Transaksi berhasil dibatalkan dan nominal tagihan telah dikembalikan.', cancelledTrx);
  } catch (error) {
    next(error);
  }
}

async function updateTransaksi(req, res, next) {
  try {
    const { id } = req.params;
    const { metode_pembayaran, items } = req.body;
    const updated = await PembayaranTransaksiModel.updateTransaction(id, { metode_pembayaran, items });
    sendSuccess(res, 'Transaksi berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
}

async function createBniVa(req, res, next) {
  try {
    const { siswa_id, nominal } = req.body;
    const bniSnapService = require('../services/bniSnap.service');
    const { query } = require('../config/database');

    const siswaRows = await query('SELECT * FROM siswa WHERE kode_siswa = ?', [siswa_id]);
    if (!siswaRows || siswaRows.length === 0) return sendError(res, 'Siswa tidak ditemukan', 404);
    const siswa = siswaRows[0];

    const vaNo = String(siswa.nis || siswa.kode_siswa).replace(/[^0-9]/g, '');
    const vaResult = await bniSnapService.createVirtualAccount({
      vaNumber: vaNo,
      customerName: siswa.nama_siswa,
      amount: nominal || 350000,
      description: `Tagihan SPP ${siswa.nama_siswa}`
    });

    sendSuccess(res, 'Virtual Account BNI berhasil dibuat.', vaResult, 201);
  } catch (error) {
    next(error);
  }
}

// --- LAPORAN & REKAP CONTROLLERS ---

async function getRekapTunggakan(req, res, next) {
  try {
    const { kode_kelas } = req.query;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const list = await TagihanSiswaModel.getRekapTunggakan(kode_kelas, kode_member);
    sendSuccess(res, 'Rekapitulasi tunggakan siswa berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

// --- KELOLA & MANAGEMENT TAGIHAN CONTROLLERS ---

async function getAllTagihan(req, res, next) {
  try {
    const { search, pos_id, kode_kelas, bulan, tahun, status, limit } = req.query;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const list = await TagihanSiswaModel.getAllTagihan({ search, pos_id, kode_kelas, bulan, tahun, status, limit, kode_member });
    sendSuccess(res, 'Daftar tagihan berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

async function updateTagihan(req, res, next) {
  try {
    const { id } = req.params;
    const { nominal_tagihan, tanggal_jatuh_tempo } = req.body;
    const updated = await TagihanSiswaModel.updateInvoice(id, { nominal_tagihan, tanggal_jatuh_tempo });
    sendSuccess(res, 'Tagihan berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
}

async function deleteTagihan(req, res, next) {
  try {
    const { id } = req.params;
    await TagihanSiswaModel.deleteInvoice(id);
    sendSuccess(res, 'Tagihan berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

async function deleteBatchUnpaidTagihan(req, res, next) {
  try {
    const { pos_id, bulan, tahun, kode_kelas } = req.body;
    const result = await TagihanSiswaModel.deleteBatchUnpaid({ pos_id, bulan, tahun, kode_kelas });
    sendSuccess(res, `Berhasil menghapus ${result.affected_rows} tagihan yang belum dibayar.`, result);
  } catch (error) {
    next(error);
  }
}

async function createDanaPayment(req, res, next) {
  try {
    const { siswa_id, items = [], nominal } = req.body;
    const danaService = require('../services/dana.service');
    const { query } = require('../config/database');

    const siswaRows = await query('SELECT * FROM siswa WHERE kode_siswa = ?', [siswa_id]);
    if (!siswaRows || siswaRows.length === 0) return sendError(res, 'Siswa tidak ditemukan', 404);
    const siswa = siswaRows[0];

    const totalNominal = nominal || items.reduce((acc, item) => acc + Number(item.nominal_bayar || 0), 0);
    const orderId = `INV-DANA-${Date.now()}`;

    // 1. Simpan Transaksi Online PENDING ke DB
    await PembayaranTransaksiModel.createOnlinePendingTransaction({
      order_id: orderId,
      siswa_id,
      total_bayar: totalNominal,
      items,
      metode_pembayaran: 'DANA'
    });

    // 2. Buat DANA Transaction / QRIS
    const finishUrl = req.headers.origin ? `${req.headers.origin}/` : (req.headers.referer || process.env.MIDTRANS_FINISH_URL || 'https://sekolah.aspartech.com/');
    const danaResult = await danaService.createTransaction({
      orderId,
      grossAmount: totalNominal,
      customerName: siswa.nama_siswa,
      items,
      finishUrl
    });

    sendSuccess(res, 'DANA Payment QRIS / Order berhasil dibuat.', danaResult, 201);
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
  getAllTagihan,
  updateTagihan,
  deleteTagihan,
  deleteBatchUnpaidTagihan,
  generateTagihan,
  payCash,
  createBniVa,
  getAllTransaksi,
  getTransaksiDetail,
  cancelTransaksi,
  updateTransaksi,
  handleWebhookMidtrans,
  createMidtransSnapToken,
  createDanaPayment,
  getRekapTunggakan
};
