import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, AlertTriangle, Plus, Search, Filter, RefreshCw,
  Send, Phone, MessageSquare, Trash2, Edit2, CheckCircle2,
  XCircle, Clock, Calendar, User, ChevronRight, X, AlertCircle, Award
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/client';
import SearchableSelect from '../components/SearchableSelect';

const PRESET_PELANGGARAN = [
  { jenis: 'Terlambat Masuk Sekolah', kategori: 'Ringan', poin: 5, sanksi: 'Teguran lisan & mencatat di buku piket' },
  { jenis: 'Seragam Tidak Lengkap / Tidak Rapi', kategori: 'Ringan', poin: 5, sanksi: 'Teguran & pembinaan kerapian seragam' },
  { jenis: 'Atribut Sekolah (Dasi/Topi/Badge) Tidak Lengkap', kategori: 'Ringan', poin: 5, sanksi: 'Teguran & peminjaman atribut' },
  { jenis: 'Tidak Mengerjakan Tugas / PR Sekolah', kategori: 'Ringan', poin: 5, sanksi: 'Mengerjakan tugas di ruang pembinaan' },
  { jenis: 'Membuang Sampah Sembarangan di Lingkungan Sekolah', kategori: 'Ringan', poin: 5, sanksi: 'Operasi kebersihan area sekolah' },
  { jenis: 'Menggunakan Handphone saat KBM Tanpa Izin Guru', kategori: 'Sedang', poin: 10, sanksi: 'Penyitaan HP sementara hingga jam pulang' },
  { jenis: 'Meninggalkan Kelas / Pelajaran Tanpa Izin', kategori: 'Sedang', poin: 10, sanksi: 'Tugas pembinaan dari wali kelas' },
  { jenis: 'Membolos Sekolah / Tidak Masuk Tanpa Izin Berulang', kategori: 'Sedang', poin: 15, sanksi: 'Pemanggilan orang tua ke sekolah' },
  { jenis: 'Rambut Tidak Rapi / Diwarnai (Cat Rambut)', kategori: 'Sedang', poin: 10, sanksi: 'Diberikan waktu 2 hari untuk merapikan kembali' },
  { jenis: 'Membawa Rokok / Merokok di Lingkungan Sekolah', kategori: 'Berat', poin: 30, sanksi: 'Surat Peringatan 1 (SP1) & Panggilan Orang Tua' },
  { jenis: 'Terlibat Perkelahian / Tawuran Antar Siswa', kategori: 'Berat', poin: 50, sanksi: 'Surat Peringatan 2 (SP2) & Skorsing 3 Hari' },
  { jenis: 'Merusak Fasilitas / Sarana Prasarana Sekolah', kategori: 'Berat', poin: 25, sanksi: 'Ganti rugi perbaikan & sanksi sosial' },
  { jenis: 'Membawa Senjata Tajam / Benda Berbahaya', kategori: 'Berat', poin: 75, sanksi: 'Surat Peringatan Keras & Konferensi Kasus' },
  { jenis: 'Membawa / Mengonsumsi Narkoba / Miras', kategori: 'Berat', poin: 100, sanksi: 'Pengembalian siswa kepada orang tua (Dikeluarkan)' }
];

const getTodayDate = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

export default function PelanggaranView({ user, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('riwayat'); // 'riwayat' | 'rekap'
  const [pelanggaranList, setPelanggaranList] = useState([]);
  const [rekapPoinList, setRekapPoinList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [stats, setStats] = useState({ total_kasus: 0, total_akumulasi_poin: 0, kasus_bulan_ini: 0, kasus_berat: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [filterKategori, setFilterKategori] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingWAId, setSendingWAId] = useState(null);

  const [formData, setFormData] = useState({
    kode_siswa: '',
    kode_kelas: '',
    tanggal: getTodayDate(),
    jam: '08:00',
    jenis_pelanggaran: '',
    kategori: 'Ringan',
    poin: 5,
    tindakan_sanksi: 'Teguran lisan & pencatatan buku pelanggaran',
    catatan: '',
    pelapor: user?.name || user?.nama_guru || 'Guru / BK',
    send_wa: true
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPelanggaran();
    if (activeSubTab === 'rekap') {
      fetchRekapPoin();
    }
  }, [filterKelas, filterKategori, activeSubTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resKelas, resSiswa, resStats] = await Promise.all([
        api.get('/kelas'),
        api.get('/siswa?status=Aktif'),
        api.get('/pelanggaran/stats')
      ]);

      if (resKelas.data?.success && Array.isArray(resKelas.data.data)) {
        setKelasList(resKelas.data.data);
      }
      if (resSiswa.data?.success && Array.isArray(resSiswa.data.data)) {
        setSiswaList(resSiswa.data.data);
      }
      if (resStats.data?.success && resStats.data.data) {
        setStats(resStats.data.data);
      }
      await fetchPelanggaran();
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPelanggaran = async () => {
    try {
      const params = {};
      if (filterKelas !== 'ALL') params.kode_kelas = filterKelas;
      if (filterKategori !== 'ALL') params.kategori = filterKategori;
      const res = await api.get('/pelanggaran', { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPelanggaranList(res.data.data);
      } else {
        setPelanggaranList([]);
      }
    } catch (e) {
      console.error(e);
      setPelanggaranList([]);
    }
  };

  const fetchRekapPoin = async () => {
    try {
      const params = {};
      if (filterKelas !== 'ALL') params.kode_kelas = filterKelas;
      const res = await api.get('/pelanggaran/rekap', { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRekapPoinList(res.data.data);
      } else {
        setRekapPoinList([]);
      }
    } catch (e) {
      console.error(e);
      setRekapPoinList([]);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    const firstSiswa = siswaList[0];
    setFormData({
      kode_siswa: firstSiswa ? firstSiswa.kode_siswa : '',
      kode_kelas: firstSiswa ? firstSiswa.kode_kelas : '',
      tanggal: getTodayDate(),
      jam: new Date().toTimeString().substring(0, 5),
      jenis_pelanggaran: '',
      kategori: 'Ringan',
      poin: 5,
      tindakan_sanksi: 'Teguran lisan & pencatatan buku pelanggaran',
      catatan: '',
      pelapor: user?.name || user?.nama_guru || 'Guru / BK',
      send_wa: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      kode_siswa: item.kode_siswa,
      kode_kelas: item.kode_kelas || '',
      tanggal: item.tanggal ? String(item.tanggal).split('T')[0] : getTodayDate(),
      jam: item.jam || '08:00',
      jenis_pelanggaran: item.jenis_pelanggaran || '',
      kategori: item.kategori || 'Ringan',
      poin: item.poin || 5,
      tindakan_sanksi: item.tindakan_sanksi || '',
      catatan: item.catatan || '',
      pelapor: item.pelapor || '',
      send_wa: false
    });
    setShowModal(true);
  };

  const handleSelectPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      jenis_pelanggaran: preset.jenis,
      kategori: preset.kategori,
      poin: preset.poin,
      tindakan_sanksi: preset.sanksi
    }));
  };

  const handleSelectSiswa = (val) => {
    const s = siswaList.find(x => String(x.kode_siswa) === String(val) || String(x.nis_nisn) === String(val));
    setFormData(prev => ({
      ...prev,
      kode_siswa: val,
      kode_kelas: s ? s.kode_kelas : prev.kode_kelas
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kode_siswa || !formData.jenis_pelanggaran) {
      if (showToast) showToast('Pilih siswa dan isi jenis pelanggaran.', false);
      else Swal.fire('Data Belum Lengkap', 'Pilih siswa dan isi jenis pelanggaran.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/pelanggaran/${currentId}`, formData);
        if (showToast) showToast('Data pelanggaran berhasil diperbarui!', true);
        else Swal.fire('Tersimpan', 'Data pelanggaran berhasil diperbarui.', 'success');
      } else {
        const res = await api.post('/pelanggaran', formData);
        const waInfo = res.data?.data?.wa;
        let msg = 'Pelanggaran siswa berhasil dicatat!';
        if (waInfo?.sent) {
          msg += ' 📱 Notif WA otomatis terkirim ke Orang Tua.';
        }
        if (showToast) showToast(msg, true);
        else Swal.fire('Berhasil Dicatat!', msg, 'success');
      }
      setShowModal(false);
      fetchPelanggaran();
      fetchRekapPoin();
      const resStats = await api.get('/pelanggaran/stats');
      if (resStats.data?.success) setStats(resStats.data.data);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan.';
      if (showToast) showToast(errMsg, false);
      else Swal.fire('Gagal Menyimpan', errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Hapus Catatan Pelanggaran?',
      text: `Hapus pelanggaran "${item.jenis_pelanggaran}" siswa ${item.nama_siswa || item.kode_siswa}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await api.delete(`/pelanggaran/${item.id}`);
          if (showToast) showToast('Catatan pelanggaran telah dihapus.', true);
          fetchPelanggaran();
          fetchRekapPoin();
        } catch (e) {
          if (showToast) showToast('Gagal menghapus catatan.', false);
        }
      }
    });
  };

  const handleSendWA = async (item) => {
    if (!item.no_wa_ortu) {
      Swal.fire({
        title: 'Nomor WA Belum Terdaftar',
        text: `Siswa "${item.nama_siswa}" belum memiliki nomor WhatsApp orang tua/wali di sistem.`,
        icon: 'info',
        confirmButtonColor: '#0066ff'
      });
      return;
    }

    setSendingWAId(item.id);
    try {
      const res = await api.post(`/pelanggaran/${item.id}/send-wa`);
      if (res.data?.success && res.data.data?.sent) {
        Swal.fire({
          icon: 'success',
          title: 'Notifikasi WA Terkirim!',
          text: `Pesan pelanggaran berhasil dikirim ke orang tua (${item.no_wa_ortu}).`,
          confirmButtonColor: '#16a34a'
        });
        fetchPelanggaran();
      } else {
        const waUrl = res.data?.data?.waUrl;
        Swal.fire({
          icon: 'info',
          title: 'Kirim via WhatsApp Langsung',
          text: 'Buka chat WhatsApp dengan format pesan resmi yang sudah tersusun:',
          showCancelButton: true,
          confirmButtonText: '📱 Buka WhatsApp',
          confirmButtonColor: '#25D366',
          cancelButtonText: 'Batal'
        }).then((choice) => {
          if (choice.isConfirmed && waUrl) {
            window.open(waUrl, '_blank');
          }
        });
      }
    } catch (err) {
      Swal.fire('Gagal Kirim WA', err.response?.data?.message || err.message, 'error');
    } finally {
      setSendingWAId(null);
    }
  };

  // Filter list
  const filteredList = pelanggaranList.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nama = String(p.nama_siswa || '').toLowerCase();
    const nis = String(p.nis || '').toLowerCase();
    const jenis = String(p.jenis_pelanggaran || '').toLowerCase();
    return nama.includes(q) || nis.includes(q) || jenis.includes(q);
  });

  const getKategoriBadge = (kat) => {
    switch (kat) {
      case 'Berat':
        return <span style={{ padding: '3px 8px', borderRadius: 99, background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 700 }}>🔴 Berat</span>;
      case 'Sedang':
        return <span style={{ padding: '3px 8px', borderRadius: 99, background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700 }}>🟡 Sedang</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: 99, background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 700 }}>🔵 Ringan</span>;
    }
  };

  const getStatusSanksiPoin = (poin) => {
    if (poin >= 50) {
      return { label: 'Surat Peringatan 3 (SP 3)', color: '#dc2626', bg: '#fef2f2' };
    } else if (poin >= 30) {
      return { label: 'Surat Peringatan 2 (SP 2)', color: '#ea580c', bg: '#fff7ed' };
    } else if (poin >= 15) {
      return { label: 'Surat Peringatan 1 (SP 1)', color: '#d97706', bg: '#fffbeb' };
    } else {
      return { label: 'Peringatan Lisan & BK', color: '#0284c7', bg: '#f0f9ff' };
    }
  };

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 80, paddingTop: 4 }}>
      {/* 1. TOP STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: '#ffffff', padding: '12px 10px', borderRadius: 14, border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>Total Kasus</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{stats.total_kasus || 0}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 10px', borderRadius: 14, border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 10.5, color: '#d97706', fontWeight: 600 }}>Bulan Ini</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706', marginTop: 2 }}>{stats.kasus_bulan_ini || 0}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 10px', borderRadius: 14, border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 600 }}>Total Poin</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', marginTop: 2 }}>{stats.total_akumulasi_poin || 0}</div>
        </div>
      </div>

      {/* 2. SUBTAB TOGGLE PILLS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('riwayat')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSubTab === 'riwayat' ? '#0066ff' : '#ffffff',
            color: activeSubTab === 'riwayat' ? '#ffffff' : '#64748b',
            boxShadow: activeSubTab === 'riwayat' ? '0 4px 12px rgba(0, 102, 255, 0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s'
          }}
        >
          Riwayat Pelanggaran
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('rekap')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSubTab === 'rekap' ? '#0066ff' : '#ffffff',
            color: activeSubTab === 'rekap' ? '#ffffff' : '#64748b',
            boxShadow: activeSubTab === 'rekap' ? '0 4px 12px rgba(0, 102, 255, 0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s'
          }}
        >
          Buku Poin Siswa
        </button>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Cari siswa atau jenis pelanggaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 13,
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <SearchableSelect
              options={[
                { value: 'ALL', label: 'Semua Kelas' },
                ...kelasList.map(k => ({
                  value: k.kode_kelas,
                  label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                }))
              ]}
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              placeholder="Semua Kelas"
            />
          </div>

          {activeSubTab === 'riwayat' && (
            <div style={{ width: 130 }}>
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155'
                }}
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Ringan">🔵 Ringan</option>
                <option value="Sedang">🟡 Sedang</option>
                <option value="Berat">🔴 Berat</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => { fetchPelanggaran(); fetchRekapPoin(); }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} color="#64748b" />
          </button>
        </div>
      </div>

      {/* 4. CONTENT LIST */}
      {activeSubTab === 'riwayat' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              <RefreshCw size={22} className="spin" color="#0066ff" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13 }}>Memuat data pelanggaran...</div>
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ background: '#ffffff', padding: 30, borderRadius: 16, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <ShieldAlert size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Belum Ada Catatan Pelanggaran</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Siswa tertib atau tidak ada pelanggaran yang sesuai filter.
              </div>
            </div>
          ) : (
            filteredList.map((item) => {
              const tglStr = item.tanggal ? String(item.tanggal).split('T')[0] : '-';

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    padding: 14,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  {/* CARD HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>
                        {item.nama_siswa || item.kode_siswa}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                        {item.nama_kelas || item.kode_kelas || '-'} | NIS: {item.nis || '-'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {getKategoriBadge(item.kategori)}
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', marginTop: 3 }}>
                        +{item.poin || 0} Poin
                      </div>
                    </div>
                  </div>

                  {/* KASUS DETAIL */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                      📌 {item.jenis_pelanggaran}
                    </div>
                    {item.tindakan_sanksi && (
                      <div style={{ fontSize: 11.5, color: '#475569', marginTop: 4 }}>
                        <strong>Sanksi:</strong> {item.tindakan_sanksi}
                      </div>
                    )}
                    {item.catatan && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                        <strong>Catatan:</strong> {item.catatan}
                      </div>
                    )}
                  </div>

                  {/* FOOTER & ACTIONS */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {tglStr} {item.jam ? `| ${item.jam}` : ''}
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      {item.no_wa_ortu ? (
                        <button
                          type="button"
                          onClick={() => handleSendWA(item)}
                          disabled={sendingWAId === item.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: '#dcfce7',
                            color: '#15803d',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Send size={12} /> {sendingWAId === item.id ? 'Mengirim...' : 'Kirim WA'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 10.5, color: '#94a3b8', alignSelf: 'center', fontStyle: 'italic' }}>
                          No WA kosong
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 8px',
                          color: '#0066ff',
                          cursor: 'pointer'
                        }}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        style={{
                          background: '#fee2e2',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 8px',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* REKAP POIN LIST */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rekapPoinList.length === 0 ? (
            <div style={{ background: '#ffffff', padding: 30, borderRadius: 16, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <Award size={36} color="#16a34a" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>Semua Siswa Disiplin!</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Belum ada akumulasi poin pelanggaran pada kelas ini.
              </div>
            </div>
          ) : (
            rekapPoinList.map((st, idx) => {
              const sanksi = getStatusSanksiPoin(st.total_poin || 0);

              return (
                <div
                  key={st.kode_siswa || idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13.5 }}>
                      {idx + 1}. {st.nama_siswa}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {st.nama_kelas || '-'} | {st.total_pelanggaran} Kali Melanggar
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: sanksi.bg,
                        color: sanksi.color,
                        fontSize: 10.5,
                        fontWeight: 700
                      }}>
                        {sanksi.label}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: st.total_poin >= 30 ? '#fee2e2' : '#fef3c7',
                      color: st.total_poin >= 30 ? '#b91c1c' : '#b45309',
                      fontWeight: 800,
                      fontSize: 13
                    }}>
                      {st.total_poin} Poin
                    </div>

                    {st.no_wa_ortu && (
                      <a
                        href={`https://wa.me/${String(st.no_wa_ortu).replace(/\D/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: '#16a34a',
                          textDecoration: 'none',
                          fontSize: 11,
                          fontWeight: 700
                        }}
                      >
                        <Phone size={11} /> WA Ortu
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FLOATING ACTION BUTTON "+ CATAT PELANGGARAN" */}
      <button
        type="button"
        onClick={handleOpenAdd}
        style={{
          position: 'fixed',
          bottom: 74,
          right: 18,
          background: 'linear-gradient(135deg, #0066ff, #0052cc)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 99,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 8px 24px rgba(0, 102, 255, 0.4)',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: 13,
          zIndex: 99
        }}
      >
        <Plus size={18} strokeWidth={2.8} />
        <span>Catat Pelanggaran</span>
      </button>

      {/* MODAL INPUT / EDIT PELANGGARAN */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div style={{
            background: '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            width: '100%',
            maxWidth: 520,
            maxHeight: '88vh',
            overflowY: 'auto',
            padding: '20px 18px 26px',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.15)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={20} color="#0066ff" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  {isEditing ? 'Edit Pelanggaran Siswa' : 'Catat Pelanggaran Siswa'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* PILIH SISWA */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Pilih Siswa *
                </label>
                <SearchableSelect
                  placeholder="-- Cari Nama Siswa --"
                  value={formData.kode_siswa}
                  onChange={handleSelectSiswa}
                  options={siswaList.map(s => ({
                    value: s.kode_siswa,
                    label: `${s.nama_siswa} (${s.nama_kelas || s.kode_kelas || '-'} | NIS: ${s.nis_nisn || s.nis || '-'})`
                  }))}
                />
              </div>

              {/* PRESET CEPAT ATURAN */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#0066ff', marginBottom: 4 }}>
                  ⚡ Pilih Aturan Standar (Preset Cepat)
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 12
                  }}
                  onChange={(e) => {
                    const sel = PRESET_PELANGGARAN.find(p => p.jenis === e.target.value);
                    if (sel) handleSelectPreset(sel);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Pilih dari jenis pelanggaran sekolah --</option>
                  {PRESET_PELANGGARAN.map((pr, i) => (
                    <option key={i} value={pr.jenis}>
                      [{pr.kategori} - +{pr.poin} Poin] {pr.jenis}
                    </option>
                  ))}
                </select>
              </div>

              {/* URAIAN PELANGGARAN */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Nama / Uraian Pelanggaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Merokok di area sekolah"
                  value={formData.jenis_pelanggaran}
                  onChange={(e) => setFormData({ ...formData, jenis_pelanggaran: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Kategori Tingkat
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="Ringan">🔵 Ringan</option>
                    <option value="Sedang">🟡 Sedang</option>
                    <option value="Berat">🔴 Berat</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Bobot Poin
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.poin}
                    onChange={(e) => setFormData({ ...formData, poin: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Waktu / Jam
                  </label>
                  <input
                    type="time"
                    value={formData.jam}
                    onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </div>
              </div>

              {/* SANKSI PEMBINAAN */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Tindakan / Sanksi Pembinaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pemanggilan orang tua & teguran tertulis"
                  value={formData.tindakan_sanksi}
                  onChange={(e) => setFormData({ ...formData, tindakan_sanksi: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                />
              </div>

              {/* KRONOLOGI / CATATAN */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Catatan Kronologi (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tambahan barang bukti atau saksi..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }}
                />
              </div>

              {/* CHECKBOX KIRIM WA OTOMATIS */}
              {!isEditing && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.send_wa}
                    onChange={(e) => setFormData({ ...formData, send_wa: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                    📱 Otomatis kirim pesan notifikasi ke WhatsApp Orang Tua
                  </span>
                </label>
              )}

              {/* SUBMIT BUTTONS */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 12,
                    border: 'none',
                    background: '#0066ff',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)'
                  }}
                >
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Catat & Kirim WA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
