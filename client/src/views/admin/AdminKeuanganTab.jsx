import React, { useState, useEffect } from 'react';
import {
  CreditCard, Wallet, Plus, Edit2, Trash2, Search, CheckCircle,
  FileSpreadsheet, AlertCircle, RefreshCw, Printer, DollarSign,
  Calendar, Layers, UserCheck, ShieldCheck, Download, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';

export default function AdminKeuanganTab() {
  const [activeSubTab, setActiveSubTab] = useState('kasir'); // 'kasir', 'master', 'generate', 'rekap'

  // --- KASIR STATE ---
  const [siswaSearch, setSiswaSearch] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [siswaTagihan, setSiswaTagihan] = useState([]);
  const [selectedTagihanIds, setSelectedTagihanIds] = useState([]);
  const [bayarNominal, setBayarNominal] = useState({});
  const [totalBayar, setTotalBayar] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [lastTransactionReceipt, setLastTransactionReceipt] = useState(null);

  // --- MASTER POS & TARIF STATE ---
  const [posList, setPosList] = useState([]);
  const [tarifList, setTarifList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [masterSubTab, setMasterSubTab] = useState('pos'); // 'pos', 'tarif', 'override'

  // Modal / Form States
  const [showPosModal, setShowPosModal] = useState(false);
  const [posFormData, setPosFormData] = useState({ kode_pos: '', nama_pos: '', tipe: 'BULANAN', deskripsi: '' });
  const [editingPosId, setEditingPosId] = useState(null);

  const [showTarifModal, setShowTarifModal] = useState(false);
  const [tarifFormData, setTarifFormData] = useState({ pos_id: '', tahun_ajaran: '2025/2026', tingkat: '', kode_kelas: '', nominal: '' });

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideData, setOverrideData] = useState({ tarif_id: '', siswa_id: '', tipe_potongan: 'NOMINAL', nilai_potongan: '', keterangan: '' });

  // --- GENERATE TAGIHAN STATE ---
  const [genFormData, setGenFormData] = useState({
    tarif_id: '',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    kode_kelas: '',
    tanggal_jatuh_tempo: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // --- REKAP TUNGGAKAN STATE ---
  const [rekapFilterKelas, setRekapFilterKelas] = useState('');
  const [rekapTunggakan, setRekapTunggakan] = useState([]);
  const [isLoadingRekap, setIsLoadingRekap] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchPosList();
    fetchTarifList();
    fetchKelasList();
  }, []);

  const fetchPosList = async () => {
    try {
      const res = await api.get('/keuangan/pos');
      if (res.data?.success) setPosList(res.data.data || []);
    } catch (e) {
      console.error('Error fetch pos:', e);
    }
  };

  const fetchTarifList = async () => {
    try {
      const res = await api.get('/keuangan/tarif');
      if (res.data?.success) setTarifList(res.data.data || []);
    } catch (e) {
      console.error('Error fetch tarif:', e);
    }
  };

  const fetchKelasList = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data?.success) setKelasList(res.data.data || []);
    } catch (e) {
      console.error('Error fetch kelas:', e);
    }
  };

  // --- KASIR HANDLERS ---
  const handleSearchSiswa = async (e) => {
    e.preventDefault();
    if (!siswaSearch.trim()) return;
    try {
      const res = await api.get('/siswa', { params: { search: siswaSearch.trim() } });
      const students = res.data?.data || [];
      if (students.length === 0) {
        Swal.fire('Tidak Ditemukan', 'Siswa dengan NIS/Nama tersebut tidak ditemukan.', 'warning');
        return;
      }
      const s = students[0];
      setSelectedSiswa(s);
      fetchSiswaTagihan(s.kode_siswa);
    } catch (err) {
      Swal.fire('Error', 'Gagal mencari data siswa.', 'error');
    }
  };

  const fetchSiswaTagihan = async (kode_siswa) => {
    try {
      const res = await api.get(`/keuangan/tagihan/siswa/${kode_siswa}`, { params: { status: 'ALL' } });
      const tagihans = res.data?.data || [];
      setSiswaTagihan(tagihans);
      setSelectedTagihanIds([]);
      setBayarNominal({});
      setTotalBayar(0);
    } catch (e) {
      console.error('Error fetch tagihan siswa:', e);
    }
  };

  const toggleSelectTagihan = (t) => {
    const isSelected = selectedTagihanIds.includes(t.id);
    let newIds = [];
    let newNominal = { ...bayarNominal };

    if (isSelected) {
      newIds = selectedTagihanIds.filter(id => id !== t.id);
      delete newNominal[t.id];
    } else {
      newIds = [...selectedTagihanIds, t.id];
      const sisa = Number(t.nominal_tagihan) - Number(t.nominal_terbayar || 0);
      newNominal[t.id] = sisa;
    }

    setSelectedTagihanIds(newIds);
    setBayarNominal(newNominal);
    calculateTotal(newNominal);
  };

  const handleNominalChange = (tId, val) => {
    const num = Number(val) || 0;
    const newNominal = { ...bayarNominal, [tId]: num };
    setBayarNominal(newNominal);
    calculateTotal(newNominal);
  };

  const calculateTotal = (nominals) => {
    const sum = Object.values(nominals).reduce((acc, curr) => acc + Number(curr || 0), 0);
    setTotalBayar(sum);
  };

  const handleProcessPayment = async () => {
    if (!selectedSiswa || selectedTagihanIds.length === 0) {
      Swal.fire('Peringatan', 'Pilih minimal satu tagihan untuk dibayar.', 'warning');
      return;
    }
    if (totalBayar <= 0) {
      Swal.fire('Peringatan', 'Nominal bayar harus lebih besar dari Rp 0.', 'warning');
      return;
    }

    const items = selectedTagihanIds.map(id => ({
      tagihan_id: id,
      nominal_bayar: bayarNominal[id] || 0
    }));

    const confirm = await Swal.fire({
      title: 'Konfirmasi Pembayaran Kasir',
      html: `
        <div style="text-align:left; font-size:14px;">
          <p><strong>Siswa:</strong> ${selectedSiswa.nama_siswa} (${selectedSiswa.nis || 'NIS'})</p>
          <p><strong>Total Pembayaran:</strong> <span style="color:#16a34a; font-weight:700;">Rp ${totalBayar.toLocaleString('id-ID')}</span></p>
          <p>Metode Pembayaran: <strong>Tunai (Kasir TU)</strong></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Proses Pembayaran',
      cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed) return;

    setIsProcessingPayment(true);
    try {
      const res = await api.post('/keuangan/bayar/cash', {
        siswa_id: selectedSiswa.kode_siswa,
        items
      });

      if (res.data?.success) {
        Swal.fire('Sukses', 'Pembayaran berhasil diproses!', 'success');
        setLastTransactionReceipt(res.data.data);
        fetchSiswaTagihan(selectedSiswa.kode_siswa);
      }
    } catch (e) {
      Swal.fire('Gagal', e.response?.data?.message || 'Gagal memproses pembayaran.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // --- POS HANDLERS ---
  const handleSavePos = async (e) => {
    e.preventDefault();
    try {
      if (editingPosId) {
        await api.put(`/keuangan/pos/${editingPosId}`, posFormData);
        Swal.fire('Berhasil', 'Pos pembayaran berhasil diperbarui.', 'success');
      } else {
        await api.post('/keuangan/pos', posFormData);
        Swal.fire('Berhasil', 'Pos pembayaran berhasil ditambahkan.', 'success');
      }
      setShowPosModal(false);
      setPosFormData({ kode_pos: '', nama_pos: '', tipe: 'BULANAN', deskripsi: '' });
      setEditingPosId(null);
      fetchPosList();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan pos.', 'error');
    }
  };

  const handleDeletePos = async (id) => {
    const confirm = await Swal.fire({ title: 'Hapus Pos Pembayaran?', text: 'Semua tarif terkait pos ini akan ikut terhapus.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus' });
    if (confirm.isConfirmed) {
      await api.delete(`/keuangan/pos/${id}`);
      fetchPosList();
      fetchTarifList();
    }
  };

  // --- TARIF HANDLERS ---
  const handleSaveTarif = async (e) => {
    e.preventDefault();
    try {
      await api.post('/keuangan/tarif', tarifFormData);
      Swal.fire('Berhasil', 'Tarif pembayaran berhasil ditambahkan.', 'success');
      setShowTarifModal(false);
      setTarifFormData({ pos_id: '', tahun_ajaran: '2025/2026', tingkat: '', kode_kelas: '', nominal: '' });
      fetchTarifList();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan tarif.', 'error');
    }
  };

  const handleDeleteTarif = async (id) => {
    const confirm = await Swal.fire({ title: 'Hapus Tarif?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus' });
    if (confirm.isConfirmed) {
      await api.delete(`/keuangan/tarif/${id}`);
      fetchTarifList();
    }
  };

  // --- OVERRIDE BEASISWA HANDLERS ---
  const handleSaveOverride = async (e) => {
    e.preventDefault();
    try {
      await api.post('/keuangan/tarif/override', overrideData);
      Swal.fire('Berhasil', 'Beasiswa/Potongan siswa berhasil disimpan.', 'success');
      setShowOverrideModal(false);
      setOverrideData({ tarif_id: '', siswa_id: '', tipe_potongan: 'NOMINAL', nilai_potongan: '', keterangan: '' });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan potongan.', 'error');
    }
  };

  // --- GENERATE INVOICE HANDLERS ---
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!genFormData.tarif_id || !genFormData.bulan || !genFormData.tahun) {
      Swal.fire('Peringatan', 'Pilih Tarif, Bulan, dan Tahun terlebih dahulu.', 'warning');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Generate Tagihan Masal?',
      text: 'Sistem akan membuat tagihan SPP bulanan untuk seluruh siswa aktif sesuai tarif dan potongan yang berlaku.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Generate Sekarang'
    });

    if (!confirm.isConfirmed) return;

    setIsGenerating(true);
    try {
      const res = await api.post('/keuangan/tagihan/generate', genFormData);
      if (res.data?.success) {
        const d = res.data.data;
        Swal.fire('Generasi Berhasil', `Berhasil generate ${d.generated_count} tagihan baru dari total ${d.total_siswa} siswa.`, 'success');
      }
    } catch (e) {
      Swal.fire('Error', e.response?.data?.message || 'Gagal membuat tagihan.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- REKAP HANDLERS ---
  const fetchRekapTunggakan = async () => {
    setIsLoadingRekap(true);
    try {
      const res = await api.get('/keuangan/rekap/tunggakan', { params: { kode_kelas: rekapFilterKelas } });
      if (res.data?.success) setRekapTunggakan(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRekap(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'rekap') fetchRekapTunggakan();
  }, [activeSubTab, rekapFilterKelas]);

  return (
    <div className="admin-keuangan-container" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER TITLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet color="#0284c7" size={28} /> Manajemen Keuangan & SPP (E-BMS)
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Pengelolaan Pos Biaya Sekolah, Matrix Tarif, Generasi Tagihan SPP, & Kasir TU.
          </p>
        </div>
      </div>

      {/* TOP NAVIGATION SUB-TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('kasir')}
          style={{
            padding: '10px 18px', fontWeight: 700, fontSize: '14px', borderRadius: '8px 8px 0 0', cursor: 'pointer', border: 'none',
            background: activeSubTab === 'kasir' ? '#0284c7' : 'transparent',
            color: activeSubTab === 'kasir' ? '#ffffff' : '#64748b',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <CreditCard size={18} /> Kasir TU (Pembayaran)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('master')}
          style={{
            padding: '10px 18px', fontWeight: 700, fontSize: '14px', borderRadius: '8px 8px 0 0', cursor: 'pointer', border: 'none',
            background: activeSubTab === 'master' ? '#0284c7' : 'transparent',
            color: activeSubTab === 'master' ? '#ffffff' : '#64748b',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Layers size={18} /> Pos & Tarif Pembayaran
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('generate')}
          style={{
            padding: '10px 18px', fontWeight: 700, fontSize: '14px', borderRadius: '8px 8px 0 0', cursor: 'pointer', border: 'none',
            background: activeSubTab === 'generate' ? '#0284c7' : 'transparent',
            color: activeSubTab === 'generate' ? '#ffffff' : '#64748b',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <RefreshCw size={18} /> Generate Tagihan SPP
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('rekap')}
          style={{
            padding: '10px 18px', fontWeight: 700, fontSize: '14px', borderRadius: '8px 8px 0 0', cursor: 'pointer', border: 'none',
            background: activeSubTab === 'rekap' ? '#0284c7' : 'transparent',
            color: activeSubTab === 'rekap' ? '#ffffff' : '#64748b',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <FileSpreadsheet size={18} /> Rekap Tunggakan
        </button>
      </div>

      {/* ========================================================
          1. SUB TAB: KASIR TU (PEMBAYARAN SISWA)
          ======================================================== */}
      {activeSubTab === 'kasir' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
          {/* LEFT: SEARCH & TAGIHAN TABLE */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <form onSubmit={handleSearchSiswa} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Ketik NIS, NISN, atau Nama Siswa..."
                  value={siswaSearch}
                  onChange={(e) => setSiswaSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1',
                    fontSize: '14px', outline: 'none'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Cari Siswa
              </button>
            </form>

            {selectedSiswa ? (
              <>
                <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{selectedSiswa.nama_siswa}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      NIS: {selectedSiswa.nis || '-'} • Kelas: {selectedSiswa.nama_kelas || '-'}
                    </div>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                    Siswa Aktif
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#334155' }}>Daftar Tagihan Belum Lunas</h3>

                {siswaTagihan.filter(t => t.status !== 'PAID').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#16a34a', fontWeight: 700 }}>
                    <CheckCircle size={36} style={{ marginBottom: '8px' }} /><br />
                    Seluruh tagihan siswa ini telah LUNAS!
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Pilih</th>
                        <th style={{ padding: '10px' }}>Pos Pembayaran</th>
                        <th style={{ padding: '10px' }}>Periode</th>
                        <th style={{ padding: '10px' }}>Nominal Tagihan</th>
                        <th style={{ padding: '10px' }}>Sisa Tagihan</th>
                        <th style={{ padding: '10px' }}>Nominal Bayar (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siswaTagihan.filter(t => t.status !== 'PAID').map((t) => {
                        const isChecked = selectedTagihanIds.includes(t.id);
                        const sisa = Number(t.nominal_tagihan) - Number(t.nominal_terbayar || 0);
                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: isChecked ? '#f0f9ff' : 'transparent' }}>
                            <td style={{ padding: '10px' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectTagihan(t)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '10px', fontWeight: 700, color: '#0f172a' }}>{t.nama_pos}</td>
                            <td style={{ padding: '10px', color: '#64748b' }}>
                              {t.bulan ? `Bulan ${t.bulan} / ${t.tahun}` : 'Tipe Bebas'}
                            </td>
                            <td style={{ padding: '10px' }}>Rp {Number(t.nominal_tagihan).toLocaleString('id-ID')}</td>
                            <td style={{ padding: '10px', fontWeight: 700, color: '#dc2626' }}>Rp {sisa.toLocaleString('id-ID')}</td>
                            <td style={{ padding: '10px' }}>
                              <input
                                type="number"
                                disabled={!isChecked}
                                value={bayarNominal[t.id] || ''}
                                onChange={(e) => handleNominalChange(t.id, e.target.value)}
                                style={{
                                  width: '120px', padding: '6px 8px', borderRadius: '6px',
                                  border: '1px solid #cbd5e1', fontWeight: 700
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <Search size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Cari siswa di atas untuk memulai transaksi pembayaran kasir.</p>
              </div>
            )}
          </div>

          {/* RIGHT: CHECKOUT SUMMARY PANEL */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign color="#16a34a" /> Ringkasan Kasir
              </h3>

              <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Item Dipilih:</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{selectedTagihanIds.length} Tagihan</div>
              </div>

              <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Total Yang Harus Dibayar:</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
                  Rp {totalBayar.toLocaleString('id-ID')}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                 Metode Pembayaran: <strong>Tunai (Kasir TU)</strong><br />
                 Bukti bayar/kuitansi dapat dicetak setelah transaksi berhasil disubmit.
              </div>
            </div>

            <div>
              <button
                type="button"
                disabled={isProcessingPayment || selectedTagihanIds.length === 0}
                onClick={handleProcessPayment}
                style={{
                  width: '100%', padding: '14px', background: selectedTagihanIds.length === 0 ? '#94a3b8' : '#16a34a',
                  color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '15px',
                  cursor: selectedTagihanIds.length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                }}
              >
                {isProcessingPayment ? 'Memproses...' : 'Proses & Cetak Kuitansi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. SUB TAB: MASTER POS & TARIF
          ======================================================== */}
      {activeSubTab === 'master' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {/* MASTER INTERNAL TABS */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setMasterSubTab('pos')}
              style={{
                padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer',
                background: masterSubTab === 'pos' ? '#0f172a' : '#f1f5f9',
                color: masterSubTab === 'pos' ? '#fff' : '#475569'
              }}
            >
              Master Pos Pembayaran
            </button>
            <button
              onClick={() => setMasterSubTab('tarif')}
              style={{
                padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer',
                background: masterSubTab === 'tarif' ? '#0f172a' : '#f1f5f9',
                color: masterSubTab === 'tarif' ? '#fff' : '#475569'
              }}
            >
              Matrix Tarif Pembayaran
            </button>
            <button
              onClick={() => setMasterSubTab('override')}
              style={{
                padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer',
                background: masterSubTab === 'override' ? '#0f172a' : '#f1f5f9',
                color: masterSubTab === 'override' ? '#fff' : '#475569'
              }}
            >
              Beasiswa & Potongan Siswa
            </button>
          </div>

          {/* TAB 1: POS PEMBAYARAN */}
          {masterSubTab === 'pos' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Daftar Pos Pembayaran Sekolah</h3>
                <button
                  onClick={() => {
                    setEditingPosId(null);
                    setPosFormData({ kode_pos: '', nama_pos: '', tipe: 'BULANAN', deskripsi: '' });
                    setShowPosModal(true);
                  }}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Tambah Pos Baru
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Kode Pos</th>
                    <th style={{ padding: '10px' }}>Nama Pos Pembayaran</th>
                    <th style={{ padding: '10px' }}>Tipe</th>
                    <th style={{ padding: '10px' }}>Deskripsi</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {posList.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#0284c7' }}>{p.kode_pos}</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>{p.nama_pos}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: p.tipe === 'BULANAN' ? '#dbeafe' : '#fef3c7', color: p.tipe === 'BULANAN' ? '#1e40af' : '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                          {p.tipe}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{p.deskripsi || '-'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setEditingPosId(p.id);
                            setPosFormData({ kode_pos: p.kode_pos, nama_pos: p.nama_pos, tipe: p.tipe, deskripsi: p.deskripsi || '' });
                            setShowPosModal(true);
                          }}
                          style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', marginRight: '8px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePos(p.id)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* TAB 2: MATRIX TARIF */}
          {masterSubTab === 'tarif' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Matrix Tarif Pembayaran</h3>
                <button
                  onClick={() => setShowTarifModal(true)}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Tambah Tarif Baru
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Pos Pembayaran</th>
                    <th style={{ padding: '10px' }}>Tahun Ajaran</th>
                    <th style={{ padding: '10px' }}>Sasaran Kelas/Tingkat</th>
                    <th style={{ padding: '10px' }}>Nominal Tarif</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tarifList.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 700 }}>{t.nama_pos}</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{t.tahun_ajaran}</td>
                      <td style={{ padding: '10px' }}>
                        {t.nama_kelas ? `Kelas ${t.nama_kelas}` : t.tingkat ? `Tingkat ${t.tingkat}` : 'Semua Kelas (Umum)'}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#16a34a' }}>
                        Rp {Number(t.nominal).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteTarif(t.id)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* TAB 3: OVERRIDE BEASISWA */}
          {masterSubTab === 'override' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Pengaturan Diskon Beasiswa per Siswa</h3>
                <button
                  onClick={() => setShowOverrideModal(true)}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Set Beasiswa Siswa
                </button>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Fitur ini digunakan untuk memotong tarif standar bagi siswa penerima beasiswa, anak guru, atau potongan khusus.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. SUB TAB: GENERATE TAGIHAN SPP
          ======================================================== */}
      {activeSubTab === 'generate' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw color="#0284c7" /> Auto-Generate Tagihan SPP Bulanan
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Sistem akan secara masal membuat tagihan bulanan untuk seluruh siswa aktif sesuai tarif dan potongan yang berlaku.
          </p>

          <form onSubmit={handleGenerateInvoice}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Pilih Tarif SPP:*</label>
              <select
                required
                value={genFormData.tarif_id}
                onChange={(e) => setGenFormData({ ...genFormData, tarif_id: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="">-- Pilih Pos & Tarif --</option>
                {tarifList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_pos} - TA {t.tahun_ajaran} (Rp {Number(t.nominal).toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Bulan Tagihan:*</label>
                <select
                  value={genFormData.bulan}
                  onChange={(e) => setGenFormData({ ...genFormData, bulan: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>Bulan ke-{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Tahun Tagihan:*</label>
                <input
                  type="number"
                  value={genFormData.tahun}
                  onChange={(e) => setGenFormData({ ...genFormData, tahun: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Filter Kelas (Opsional):</label>
              <select
                value={genFormData.kode_kelas}
                onChange={(e) => setGenFormData({ ...genFormData, kode_kelas: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- Semua Kelas (Semua Siswa Aktif) --</option>
                {kelasList.map((k) => (
                  <option key={k.kode_kelas || k.id} value={k.kode_kelas || k.id}>Kelas {k.nama_kelas}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              style={{
                width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none',
                borderRadius: '8px', fontWeight: 800, fontSize: '15px', cursor: 'pointer'
              }}
            >
              {isGenerating ? 'Sedang Memproses Invoices...' : 'Generate Tagihan Masal'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          4. SUB TAB: REKAP TUNGGAKAN
          ======================================================== */}
      {activeSubTab === 'rekap' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Daftar Rekapitulasi Tunggakan Siswa</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={rekapFilterKelas}
                onChange={(e) => setRekapFilterKelas(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="">-- Semua Kelas --</option>
                {kelasList.map(k => (
                  <option key={k.kode_kelas || k.id} value={k.kode_kelas || k.id}>Kelas {k.nama_kelas}</option>
                ))}
              </select>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>NIS</th>
                <th style={{ padding: '10px' }}>Nama Siswa</th>
                <th style={{ padding: '10px' }}>Kelas</th>
                <th style={{ padding: '10px' }}>Total Tagihan Macet</th>
                <th style={{ padding: '10px' }}>Total Nominal Tunggakan</th>
              </tr>
            </thead>
            <tbody>
              {rekapTunggakan.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', color: '#64748b' }}>{r.nis || '-'}</td>
                  <td style={{ padding: '10px', fontWeight: 700, color: '#0f172a' }}>{r.nama_siswa}</td>
                  <td style={{ padding: '10px' }}>{r.nama_kelas || '-'}</td>
                  <td style={{ padding: '10px' }}>{r.total_tagihan} Invoice</td>
                  <td style={{ padding: '10px', fontWeight: 800, color: '#dc2626' }}>
                    Rp {Number(r.total_tunggakan || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL FORM POS PEMBAYARAN --- */}
      {showPosModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 700 }}>
              {editingPosId ? 'Edit Pos Pembayaran' : 'Tambah Pos Pembayaran Baru'}
            </h3>
            <form onSubmit={handleSavePos}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Kode Pos:*</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: POS-SPP, POS-DSP"
                  value={posFormData.kode_pos}
                  onChange={(e) => setPosFormData({ ...posFormData, kode_pos: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Nama Pos:*</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SPP Bulanan, Uang Gedung"
                  value={posFormData.nama_pos}
                  onChange={(e) => setPosFormData({ ...posFormData, nama_pos: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Tipe Pembayaran:*</label>
                <select
                  value={posFormData.tipe}
                  onChange={(e) => setPosFormData({ ...posFormData, tipe: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="BULANAN">BULANAN (Diset tiap bulan)</option>
                  <option value="BEBAS">BEBAS (Cicilan / Sekali Bayar)</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Deskripsi:</label>
                <textarea
                  rows="2"
                  value={posFormData.deskripsi}
                  onChange={(e) => setPosFormData({ ...posFormData, deskripsi: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowPosModal(false)} style={{ padding: '8px 14px', border: 'none', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 14px', border: 'none', background: '#0284c7', color: '#fff', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Simpan Pos</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL FORM TARIF PEMBAYARAN --- */}
      {showTarifModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '450px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 700 }}>Tambah Tarif Pembayaran</h3>
            <form onSubmit={handleSaveTarif}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Pos Pembayaran:*</label>
                <select
                  required
                  value={tarifFormData.pos_id}
                  onChange={(e) => setTarifFormData({ ...tarifFormData, pos_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Pilih Pos --</option>
                  {posList.map(p => (
                    <option key={p.id} value={p.id}>{p.nama_pos} ({p.kode_pos})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Tahun Ajaran:*</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2025/2026"
                  value={tarifFormData.tahun_ajaran}
                  onChange={(e) => setTarifFormData({ ...tarifFormData, tahun_ajaran: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Nominal (Rp):*</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 350000"
                  value={tarifFormData.nominal}
                  onChange={(e) => setTarifFormData({ ...tarifFormData, nominal: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowTarifModal(false)} style={{ padding: '8px 14px', border: 'none', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 14px', border: 'none', background: '#0284c7', color: '#fff', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Simpan Tarif</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
