import React, { useState, useEffect } from 'react';
import {
  Wallet, CreditCard, Layers, RefreshCw, FileSpreadsheet,
  Plus, Search, Edit2, Trash2, CheckCircle, DollarSign,
  X, Check, Printer, User, Filter, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const getBulanLabel = (bulanNum) => {
  if (!bulanNum) return '';
  const idx = Number(bulanNum) - 1;
  return NAMA_BULAN[idx] || `Bulan ${bulanNum}`;
};

const formatRupiahInput = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/[^0-9]/g, '');
  if (!numStr) return '';
  return parseInt(numStr, 10).toLocaleString('id-ID');
};

const parseRupiahInput = (val) => {
  if (!val) return 0;
  return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
};

export default function AdminKeuanganTab() {
  const [activeSubTab, setActiveSubTab] = useState('kasir'); // 'kasir', 'master', 'generate', 'rekap'

  // --- KASIR STATE ---
  const [siswaSearch, setSiswaSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [siswaTagihan, setSiswaTagihan] = useState([]);
  const [selectedTagihanIds, setSelectedTagihanIds] = useState([]);
  const [bayarNominal, setBayarNominal] = useState({});
  const [totalBayar, setTotalBayar] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  // --- MASTER POS & TARIF STATE ---
  const [posList, setPosList] = useState([]);
  const [tarifList, setTarifList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [masterSubTab, setMasterSubTab] = useState('pos'); // 'pos', 'tarif', 'override'

  // Modal States
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load Initial Data
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
  const handleLiveSearch = async (queryVal) => {
    if (!queryVal || !queryVal.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await api.get('/siswa', { params: { search: queryVal.trim() } });
      const students = res.data?.data || [];
      setSearchResults(students);
      setShowDropdown(true);

      // Jika hanya ada 1 hasil pencarian yang tepat, langsung pilih
      if (students.length === 1 && String(queryVal).trim().toLowerCase() === String(students[0].nis || '').toLowerCase()) {
        handleSelectStudent(students[0]);
      }
    } catch (err) {
      console.error('Error live search:', err);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedSiswa(student);
    setSiswaSearch(`${student.nama_siswa} (${student.nis || 'NIS'})`);
    setShowDropdown(false);
    setSearchResults([]);
    fetchSiswaTagihan(student.kode_siswa);
  };

  const handleSearchSiswaSubmit = async (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectStudent(searchResults[0]);
    } else if (siswaSearch.trim()) {
      handleLiveSearch(siswaSearch.trim());
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
        setLastReceipt(res.data.data);
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
    const confirm = await Swal.fire({
      title: 'Hapus Pos Pembayaran?',
      text: 'Semua tarif terkait pos ini akan ikut terhapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus'
    });
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
    const confirm = await Swal.fire({
      title: 'Hapus Tarif?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    });
    if (confirm.isConfirmed) {
      await api.delete(`/keuangan/tarif/${id}`);
      fetchTarifList();
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

  const paginatedRekap = rekapTunggakan.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        {/* PANEL HEADER MATCHING ADMIN PENGUMUMAN TAB */}
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Wallet size={18} color="#0284c7" /> Manajemen Keuangan & SPP (E-BMS)
            </div>
            <div className="admin-panel-subtitle">
              Pengelolaan Pos Biaya Sekolah, Matrix Tarif, Generasi Tagihan SPP, & Kasir TU
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={activeSubTab === 'kasir' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => setActiveSubTab('kasir')}
            >
              <CreditCard size={15} /> Kasir TU
            </button>

            <button
              className={activeSubTab === 'master' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => setActiveSubTab('master')}
            >
              <Layers size={15} /> Pos & Tarif
            </button>

            <button
              className={activeSubTab === 'generate' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => setActiveSubTab('generate')}
            >
              <RefreshCw size={15} /> Auto Tagihan
            </button>

            <button
              className={activeSubTab === 'rekap' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => setActiveSubTab('rekap')}
            >
              <FileSpreadsheet size={15} /> Rekap Tunggakan
            </button>
          </div>
        </div>

        {/* ========================================================
            SUB TAB 1: KASIR TU (PEMBAYARAN SISWA)
            ======================================================== */}
        {activeSubTab === 'kasir' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
            {/* LEFT AREA: SEARCH & TAGIHAN TABLE */}
            <div>
              <form onSubmit={handleSearchSiswaSubmit} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
                  <input
                    type="text"
                    placeholder="Ketik NIS, NISN, atau Nama Siswa... (Hasil langsung muncul)"
                    value={siswaSearch}
                    onChange={(e) => {
                      setSiswaSearch(e.target.value);
                      handleLiveSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowDropdown(true);
                    }}
                    className="form-control-admin"
                    style={{ paddingLeft: 40, paddingRight: siswaSearch ? 36 : 12 }}
                  />
                  {siswaSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setSiswaSearch('');
                        setSelectedSiswa(null);
                        setSiswaTagihan([]);
                        setSearchResults([]);
                        setShowDropdown(false);
                      }}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', zIndex: 2 }}
                      title="Reset Pencarian"
                    >
                      <X size={16} />
                    </button>
                  )}

                  {/* FLOATING LIVE DROPDOWN SISTER SUGGESTIONS */}
                  {showDropdown && searchResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                        background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8,
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 99999,
                        maxHeight: 280, overflowY: 'auto'
                      }}
                    >
                      {searchResults.map((s) => (
                        <div
                          key={s.kode_siswa}
                          onClick={() => handleSelectStudent(s)}
                          style={{
                            padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                        >
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a' }}>{s.nama_siswa}</div>
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                            NIS: <strong style={{ color: '#0284c7' }}>{s.nis || '-'}</strong> • Kelas: <strong>{s.nama_kelas || '-'}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-primary-admin">
                  Cari Siswa
                </button>
              </form>

              {selectedSiswa ? (
                <>
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{selectedSiswa.nama_siswa}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        NIS: <strong>{selectedSiswa.nis || '-'}</strong> • Kelas: <strong>{selectedSiswa.nama_kelas || '-'}</strong>
                      </div>
                    </div>
                    <span className="status-badge-active">
                      Siswa Aktif
                    </span>
                  </div>

                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40, textAlign: 'center' }}>Pilih</th>
                          <th>Pos Pembayaran</th>
                          <th>Tipe & Periode Tagihan</th>
                          <th>Nominal Tagihan</th>
                          <th>Sisa Tagihan</th>
                          <th style={{ width: 220 }}>Nominal Bayar (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {siswaTagihan.filter(t => t.status !== 'PAID').length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#059669', fontWeight: 700 }}>
                              <CheckCircle size={36} style={{ marginBottom: 6 }} /><br />
                              Semua tagihan siswa ini telah LUNAS!
                            </td>
                          </tr>
                        ) : (
                          siswaTagihan.filter(t => t.status !== 'PAID').map((t) => {
                            const isChecked = selectedTagihanIds.includes(t.id);
                            const sisa = Number(t.nominal_tagihan) - Number(t.nominal_terbayar || 0);
                            const isBulanan = t.tipe_pos === 'BULANAN' || Boolean(t.bulan);
                            const terbayar = Number(t.nominal_terbayar || 0);
                            const percent = Math.min(100, Math.round((terbayar / Number(t.nominal_tagihan)) * 100));

                            return (
                              <tr key={t.id} style={{ background: isChecked ? '#f0f9ff' : 'transparent' }}>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleSelectTagihan(t)}
                                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                                  />
                                </td>
                                <td>
                                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13.5 }}>{t.nama_pos}</div>
                                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                    Kode: {t.kode_tagihan || `INV-${t.id}`}
                                  </div>
                                </td>
                                <td>
                                  {isBulanan ? (
                                    <div>
                                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        🗓️ {getBulanLabel(t.bulan)} {t.tahun}
                                      </span>
                                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                        Tagihan SPP Rutin Bulanan
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        💰 Tipe Bebas (Bisa Dicicil)
                                      </span>
                                      {terbayar > 0 && (
                                        <div style={{ marginTop: 4 }}>
                                          <div style={{ fontSize: 10.5, color: '#475569', fontWeight: 600 }}>
                                            Sudah dicicil: <strong>Rp {terbayar.toLocaleString('id-ID')}</strong> ({percent}%)
                                          </div>
                                          <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 2, overflow: 'hidden' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', background: '#0284c7' }} />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td style={{ fontWeight: 600 }}>Rp {Number(t.nominal_tagihan).toLocaleString('id-ID')}</td>
                                <td style={{ fontWeight: 800, color: '#dc2626' }}>
                                  Rp {sisa.toLocaleString('id-ID')}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                      <span style={{ position: 'absolute', left: 8, fontSize: 12, fontWeight: 700, color: isChecked ? '#0284c7' : '#94a3b8', zIndex: 2 }}>Rp</span>
                                      <input
                                        type="text"
                                        disabled={!isChecked}
                                        value={formatRupiahInput(bayarNominal[t.id])}
                                        onChange={(e) => handleNominalChange(t.id, parseRupiahInput(e.target.value))}
                                        className="form-control-admin"
                                        style={{ paddingLeft: 30, paddingRight: 8, fontWeight: 800, fontSize: 13, color: '#0284c7' }}
                                        placeholder="0"
                                      />
                                    </div>

                                    {/* QUICK BUTTONS FOR FREE TYPE CICILAN */}
                                    {isChecked && !isBulanan && (
                                      <div style={{ display: 'flex', gap: 4 }}>
                                        <button
                                          type="button"
                                          onClick={() => handleNominalChange(t.id, sisa)}
                                          style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                                        >
                                          Pelunasan Rp {sisa.toLocaleString('id-ID')}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <Search size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
                  <div style={{ fontWeight: 700, color: '#64748b' }}>Ketik NIS atau nama siswa pada pencarian di atas.</div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: CHECKOUT KASIR WITH CASH RECEIVED & CHANGE CALCULATION */}
            <div style={{ background: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign color="#16a34a" size={20} /> Ringkasan Pembayaran
                </div>

                <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Item Tagihan Dipilih:</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{selectedTagihanIds.length} Tagihan</div>
                </div>

                <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Total Harus Dibayar:</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>
                    Rp {totalBayar.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* UANG DITERIMA & KEMBALIAN */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Uang Diterima (Cash In):
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ position: 'absolute', left: 10, fontSize: 13, fontWeight: 700, color: '#64748b' }}>Rp</span>
                    <input
                      type="text"
                      value={formatRupiahInput(cashReceived)}
                      onChange={(e) => setCashReceived(parseRupiahInput(e.target.value))}
                      className="form-control-admin"
                      placeholder="0"
                      style={{ paddingLeft: 34, fontWeight: 800, fontSize: 14, color: '#0f172a' }}
                    />
                  </div>

                  {/* QUICK CASH PRESETS */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => setCashReceived(totalBayar)}
                      style={{ background: '#e2e8f0', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Uang Pas
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashReceived(50000)}
                      style={{ background: '#e2e8f0', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      50rb
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashReceived(100000)}
                      style={{ background: '#e2e8f0', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      100rb
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashReceived(500000)}
                      style={{ background: '#e2e8f0', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      500rb
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Kembalian:</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: (parseRupiahInput(cashReceived) - totalBayar) < 0 ? '#dc2626' : '#0284c7' }}>
                      Rp {Math.max(0, parseRupiahInput(cashReceived) - totalBayar).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: 8, borderRadius: 6 }}>
                  Metode: <strong>Tunai (Kasir TU)</strong> • Cetak Struk Otomatis
                </div>
              </div>

              <button
                type="button"
                disabled={isProcessingPayment || selectedTagihanIds.length === 0}
                onClick={handleProcessPayment}
                className="btn-primary-admin"
                style={{
                  width: '100%', padding: '12px', marginTop: 16,
                  opacity: selectedTagihanIds.length === 0 ? 0.6 : 1,
                  background: '#16a34a', borderColor: '#16a34a', fontSize: 14, fontWeight: 800
                }}
              >
                {isProcessingPayment ? 'Memproses Transaksi...' : 'Proses & Cetak Kuitansi'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            SUB TAB 2: MASTER POS & TARIF
            ======================================================== */}
        {activeSubTab === 'master' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button
                className={masterSubTab === 'pos' ? 'btn-primary-admin' : 'btn-outline-admin'}
                onClick={() => setMasterSubTab('pos')}
              >
                Master Pos Pembayaran
              </button>
              <button
                className={masterSubTab === 'tarif' ? 'btn-primary-admin' : 'btn-outline-admin'}
                onClick={() => setMasterSubTab('tarif')}
              >
                Matrix Tarif Pembayaran
              </button>
            </div>

            {masterSubTab === 'pos' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Daftar Pos Pembayaran</div>
                  <button
                    className="btn-primary-admin"
                    onClick={() => {
                      setEditingPosId(null);
                      setPosFormData({ kode_pos: '', nama_pos: '', tipe: 'BULANAN', deskripsi: '' });
                      setShowPosModal(true);
                    }}
                  >
                    <Plus size={15} /> Tambah Pos Baru
                  </button>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 120 }}>Kode Pos</th>
                        <th>Nama Pos Pembayaran</th>
                        <th style={{ width: 120, textAlign: 'center' }}>Tipe</th>
                        <th>Deskripsi</th>
                        <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posList.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 800, color: '#0284c7' }}>{p.kode_pos}</td>
                          <td style={{ fontWeight: 700 }}>{p.nama_pos}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              background: p.tipe === 'BULANAN' ? '#e0f2fe' : '#fef3c7',
                              color: p.tipe === 'BULANAN' ? '#0369a1' : '#b45309',
                              padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800
                            }}>
                              {p.tipe}
                            </span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: 12 }}>{p.deskripsi || '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 4 }}>
                              <button
                                className="btn-action-icon btn-edit"
                                onClick={() => {
                                  setEditingPosId(p.id);
                                  setPosFormData({ kode_pos: p.kode_pos, nama_pos: p.nama_pos, tipe: p.tipe, deskripsi: p.deskripsi || '' });
                                  setShowPosModal(true);
                                }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button className="btn-action-icon btn-delete" onClick={() => handleDeletePos(p.id)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {masterSubTab === 'tarif' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Matrix Tarif Pembayaran</div>
                  <button className="btn-primary-admin" onClick={() => setShowTarifModal(true)}>
                    <Plus size={15} /> Tambah Tarif Baru
                  </button>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Pos Pembayaran</th>
                        <th>Tahun Ajaran</th>
                        <th>Sasaran Kelas/Tingkat</th>
                        <th>Nominal Tarif (Rp)</th>
                        <th style={{ width: 80, textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tarifList.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{t.nama_pos}</td>
                          <td style={{ color: '#64748b' }}>{t.tahun_ajaran}</td>
                          <td>
                            {t.nama_kelas ? `Kelas ${t.nama_kelas}` : t.tingkat ? `Tingkat ${t.tingkat}` : 'Semua Kelas (Umum)'}
                          </td>
                          <td style={{ fontWeight: 800, color: '#16a34a' }}>
                            Rp {Number(t.nominal).toLocaleString('id-ID')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button className="btn-action-icon btn-delete" onClick={() => handleDeleteTarif(t.id)}>
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================
            SUB TAB 3: GENERATE TAGIHAN SPP
            ======================================================== */}
        {activeSubTab === 'generate' && (
          <div style={{ maxWidth: 580, margin: 0, background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw color="#0284c7" size={18} /> Auto-Generate Tagihan SPP Bulanan
            </div>
            <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 20 }}>
              Sistem akan membuat tagihan SPP bulanan secara otomatis untuk seluruh siswa aktif sesuai tarif yang ditentukan.
            </div>

            <form onSubmit={handleGenerateInvoice}>
              <div className="form-group-admin" style={{ marginBottom: 14 }}>
                <label>Pilih Tarif SPP *</label>
                <SearchableSelect
                  value={genFormData.tarif_id}
                  onChange={(e) => setGenFormData({ ...genFormData, tarif_id: e.target.value })}
                  placeholder="-- Pilih Pos & Tarif --"
                  options={tarifList.map(t => ({
                    value: t.id,
                    label: `${t.nama_pos} - TA ${t.tahun_ajaran} (Rp ${Number(t.nominal).toLocaleString('id-ID')})`
                  }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group-admin">
                  <label>Bulan Tagihan *</label>
                  <SearchableSelect
                    value={genFormData.bulan}
                    onChange={(e) => setGenFormData({ ...genFormData, bulan: Number(e.target.value) })}
                    options={[1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ value: m, label: `Bulan ke-${m}` }))}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Tahun Tagihan *</label>
                  <input
                    type="number"
                    className="form-control-admin"
                    value={genFormData.tahun}
                    onChange={(e) => setGenFormData({ ...genFormData, tahun: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group-admin" style={{ marginBottom: 20 }}>
                <label>Filter Kelas (Opsional)</label>
                <SearchableSelect
                  value={genFormData.kode_kelas}
                  onChange={(e) => setGenFormData({ ...genFormData, kode_kelas: e.target.value })}
                  placeholder="-- Semua Kelas (Semua Siswa Aktif) --"
                  options={kelasList.map(k => ({
                    value: k.kode_kelas || k.id,
                    label: `Kelas ${k.nama_kelas}`
                  }))}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary-admin"
                style={{ width: '100%', padding: '12px', fontWeight: 800 }}
              >
                {isGenerating ? 'Memproses Tagihan...' : 'Generate Tagihan Masal'}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            SUB TAB 4: REKAP TUNGGAKAN
            ======================================================== */}
        {activeSubTab === 'rekap' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ width: 220 }}>
                <SearchableSelect
                  value={rekapFilterKelas}
                  onChange={(e) => setRekapFilterKelas(e.target.value)}
                  placeholder="Semua Kelas"
                  options={kelasList.map(k => ({ value: k.kode_kelas || k.id, label: `Kelas ${k.nama_kelas}` }))}
                />
              </div>

              <button className="btn-outline-admin" onClick={fetchRekapTunggakan} title="Refresh Rekap">
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>No</th>
                    <th>NIS</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th>Total Tagihan Macet</th>
                    <th>Total Nominal Tunggakan (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRekap.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                        Tidak ada data tunggakan.
                      </td>
                    </tr>
                  ) : (
                    paginatedRekap.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td style={{ color: '#64748b' }}>{r.nis || '-'}</td>
                        <td style={{ fontWeight: 800, color: '#0f172a' }}>{r.nama_siswa}</td>
                        <td>{r.nama_kelas || '-'}</td>
                        <td>{r.total_tagihan} Invoice</td>
                        <td style={{ fontWeight: 800, color: '#dc2626' }}>
                          Rp {Number(r.total_tunggakan || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={rekapTunggakan.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- MODAL POS PEMBAYARAN MATCHING ADMIN PENGUMUMAN MODAL --- */}
      {showPosModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 460 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editingPosId ? 'Edit Pos Pembayaran' : 'Tambah Pos Pembayaran Baru'}
              </h3>
              <button onClick={() => setShowPosModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePos}>
              <div className="admin-modal-body">
                <div className="form-group-admin">
                  <label>Kode Pos *</label>
                  <input
                    type="text"
                    required
                    className="form-control-admin"
                    placeholder="Contoh: POS-SPP"
                    value={posFormData.kode_pos}
                    onChange={(e) => setPosFormData({ ...posFormData, kode_pos: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Nama Pos Pembayaran *</label>
                  <input
                    type="text"
                    required
                    className="form-control-admin"
                    placeholder="Contoh: SPP Bulanan, Uang Gedung"
                    value={posFormData.nama_pos}
                    onChange={(e) => setPosFormData({ ...posFormData, nama_pos: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Tipe Pembayaran</label>
                  <SearchableSelect
                    value={posFormData.tipe}
                    onChange={(e) => setPosFormData({ ...posFormData, tipe: e.target.value })}
                    options={[
                      { value: 'BULANAN', label: 'BULANAN (Tagihan rutin per bulan)' },
                      { value: 'BEBAS', label: 'BEBAS (Cicilan / Sekali Bayar)' }
                    ]}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Deskripsi</label>
                  <textarea
                    rows={2}
                    className="form-control-admin"
                    value={posFormData.deskripsi}
                    onChange={(e) => setPosFormData({ ...posFormData, deskripsi: e.target.value })}
                    style={{ height: 'auto', padding: 10 }}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowPosModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin">
                  Simpan Pos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL TARIF PEMBAYARAN MATCHING ADMIN PENGUMUMAN MODAL --- */}
      {showTarifModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 460 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Tambah Tarif Pembayaran
              </h3>
              <button onClick={() => setShowTarifModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTarif}>
              <div className="admin-modal-body">
                <div className="form-group-admin">
                  <label>Pos Pembayaran *</label>
                  <SearchableSelect
                    value={tarifFormData.pos_id}
                    onChange={(e) => setTarifFormData({ ...tarifFormData, pos_id: e.target.value })}
                    placeholder="-- Pilih Pos Pembayaran --"
                    options={posList.map(p => ({ value: p.id, label: `${p.nama_pos} (${p.kode_pos})` }))}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Tahun Ajaran *</label>
                  <input
                    type="text"
                    required
                    className="form-control-admin"
                    placeholder="Contoh: 2025/2026"
                    value={tarifFormData.tahun_ajaran}
                    onChange={(e) => setTarifFormData({ ...tarifFormData, tahun_ajaran: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Nominal Tarif (Rp) *</label>
                  <input
                    type="number"
                    required
                    className="form-control-admin"
                    placeholder="Contoh: 350000"
                    value={tarifFormData.nominal}
                    onChange={(e) => setTarifFormData({ ...tarifFormData, nominal: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowTarifModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin">
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
