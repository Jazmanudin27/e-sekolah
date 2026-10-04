import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, AlertTriangle, Plus, Search, Filter, RefreshCw,
  Send, Phone, MessageSquare, Trash2, Edit2, CheckCircle2,
  XCircle, Clock, Calendar, User, BookOpen, AlertCircle, Award, ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

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

export default function AdminPelanggaranTab() {
  const [activeSubTab, setActiveSubTab] = useState('riwayat'); // 'riwayat' | 'rekap'
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [pelanggaranList, setPelanggaranList] = useState([]);
  const [rekapPoinList, setRekapPoinList] = useState([]);
  const [stats, setStats] = useState({ total_kasus: 0, total_akumulasi_poin: 0, kasus_bulan_ini: 0, kasus_berat: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [filterKategori, setFilterKategori] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    tindakan_sanksi: '',
    catatan: '',
    pelapor: 'Guru BK / Tata Tertib',
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
      console.error('Error fetching initial violation data:', err);
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
      console.error('Error fetching list pelanggaran:', e);
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
      console.error('Error fetching rekap poin:', e);
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
      tindakan_sanksi: 'Teguran lisan & pencatatan poin pelanggaran',
      catatan: '',
      pelapor: 'Guru BK / Tata Tertib',
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
      Swal.fire('Data Belum Lengkap', 'Pilih siswa dan isi jenis pelanggaran.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/pelanggaran/${currentId}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Diperbarui',
          text: 'Data pelanggaran siswa berhasil diupdate.',
          timer: 1600,
          confirmButtonColor: '#0066ff'
        });
      } else {
        const res = await api.post('/pelanggaran', formData);
        const waInfo = res.data?.data?.wa;
        let infoMsg = 'Data pelanggaran berhasil dicatat ke buku disiplin.';
        if (waInfo?.sent) {
          infoMsg += ' Notifikasi WhatsApp otomatis terkirim ke Orang Tua Siswa! 📱';
        } else if (waInfo?.message) {
          infoMsg += ` (${waInfo.message})`;
        }

        Swal.fire({
          icon: 'success',
          title: 'Pelanggaran Dicatat!',
          text: infoMsg,
          confirmButtonColor: '#0066ff'
        });
      }
      setShowModal(false);
      fetchPelanggaran();
      fetchRekapPoin();
      // Refresh stats
      const resStats = await api.get('/pelanggaran/stats');
      if (resStats.data?.success) setStats(resStats.data.data);
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Hapus Catatan Pelanggaran?',
      text: `Yakin ingin menghapus catatan "${item.jenis_pelanggaran}" untuk siswa ${item.nama_siswa || item.kode_siswa}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/pelanggaran/${item.id}`);
          Swal.fire('Terhapus!', 'Catatan pelanggaran telah dihapus.', 'success');
          fetchPelanggaran();
          fetchRekapPoin();
        } catch (e) {
          Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
      }
    });
  };

  const handleSendWA = async (item) => {
    if (!item.no_wa_ortu) {
      Swal.fire({
        title: 'Nomor WA Belum Ada',
        text: `Data siswa "${item.nama_siswa}" belum memiliki nomor WhatsApp orang tua/wali. Silakan edit nomor kontak orang tua di Data Master Siswa.`,
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
          text: `Pesan rincian pelanggaran berhasil dikirim ke nomor orang tua (${item.no_wa_ortu}).`,
          confirmButtonColor: '#16a34a'
        });
        fetchPelanggaran();
      } else {
        const waUrl = res.data?.data?.waUrl;
        Swal.fire({
          icon: 'warning',
          title: 'Gateway Tidak Mengirim Langsung',
          html: `<p style="font-size:13px;color:#475569">${res.data?.message || 'Gagal mengirim otomatis via API gateway.'}</p>
                 <p style="margin-top:12px;font-size:13px;font-weight:600">Anda dapat membuka chat WhatsApp Web secara langsung:</p>`,
          showCancelButton: true,
          confirmButtonText: '📱 Buka WhatsApp Web',
          confirmButtonColor: '#25D366',
          cancelButtonText: 'Tutup'
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

  // Filtered List
  const filteredList = pelanggaranList.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nama = String(p.nama_siswa || '').toLowerCase();
    const nis = String(p.nis || '').toLowerCase();
    const jenis = String(p.jenis_pelanggaran || '').toLowerCase();
    const pelapor = String(p.pelapor || '').toLowerCase();
    return nama.includes(q) || nis.includes(q) || jenis.includes(q) || pelapor.includes(q);
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  const getKategoriBadge = (kat) => {
    switch (kat) {
      case 'Berat':
        return <span style={{ padding: '4px 10px', borderRadius: 99, background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 700 }}>🔴 Berat</span>;
      case 'Sedang':
        return <span style={{ padding: '4px 10px', borderRadius: 99, background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700 }}>🟡 Sedang</span>;
      default:
        return <span style={{ padding: '4px 10px', borderRadius: 99, background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 700 }}>🔵 Ringan</span>;
    }
  };

  const getStatusSanksiPoin = (poin) => {
    if (poin >= 50) {
      return { label: 'Surat Peringatan 3 (SP 3) / Konferensi Kasus', color: '#dc2626', bg: '#fef2f2' };
    } else if (poin >= 30) {
      return { label: 'Surat Peringatan 2 (SP 2) & Skorsing', color: '#ea580c', bg: '#fff7ed' };
    } else if (poin >= 15) {
      return { label: 'Surat Peringatan 1 (SP 1) & Panggil Ortu', color: '#d97706', bg: '#fffbeb' };
    } else {
      return { label: 'Peringatan Lisan & Bimbingan BK', color: '#0284c7', bg: '#f0f9ff' };
    }
  };

  return (
    <div>
      {/* STATS HEADER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#ffffff', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={24} color="#0066ff" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Kejadian Pelanggaran</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{stats.total_kasus || 0} Kasus</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Pelanggaran Bulan Ini</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{stats.kasus_bulan_ini || 0} Kasus</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Kasus Kategori Berat</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>{stats.kasus_berat || 0} Kasus</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Akumulasi Poin</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>{stats.total_akumulasi_poin || 0} Poin</div>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        {/* PANEL HEADER WITH SUBTABS */}
        <div className="admin-panel-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="admin-panel-title">
              <ShieldAlert size={20} color="#0066ff" /> Buku Tata Tertib & Bimbingan Konseling (BK)
            </div>
            <div className="admin-panel-subtitle">
              Pencatatan pelanggaran siswa, akumulasi poin sanksi, dan otomatis notifikasi ke WhatsApp orang tua/wali
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* SUBTAB TOGGLE */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setActiveSubTab('riwayat')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeSubTab === 'riwayat' ? '#ffffff' : 'transparent',
                  color: activeSubTab === 'riwayat' ? '#0066ff' : '#64748b',
                  boxShadow: activeSubTab === 'riwayat' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Catatan Pelanggaran
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('rekap')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeSubTab === 'rekap' ? '#ffffff' : 'transparent',
                  color: activeSubTab === 'rekap' ? '#0066ff' : '#64748b',
                  boxShadow: activeSubTab === 'rekap' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Rekap Poin & Buku Sanksi
              </button>
            </div>

            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Catat Pelanggaran
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari siswa, jenis pelanggaran, atau nama pelapor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div style={{ width: 190 }}>
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
              placeholder="Filter Kelas"
            />
          </div>

          {activeSubTab === 'riwayat' && (
            <div style={{ width: 170 }}>
              <SearchableSelect
                options={[
                  { value: 'ALL', label: 'Semua Kategori' },
                  { value: 'Ringan', label: '🔵 Ringan' },
                  { value: 'Sedang', label: '🟡 Sedang' },
                  { value: 'Berat', label: '🔴 Berat' }
                ]}
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                placeholder="Kategori"
              />
            </div>
          )}

          <button
            className="btn-outline-admin"
            onClick={() => { fetchPelanggaran(); fetchRekapPoin(); }}
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* TAB CONTENT: RIWAYAT PELANGGARAN */}
        {activeSubTab === 'riwayat' && (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 45 }}>No</th>
                    <th>Tanggal & Waktu</th>
                    <th>Nama Siswa & Kelas</th>
                    <th>Jenis Pelanggaran</th>
                    <th>Kategori & Poin</th>
                    <th>Tindakan / Sanksi</th>
                    <th>Status Notif WA</th>
                    <th style={{ width: 140, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        Memuat data pelanggaran siswa...
                      </td>
                    </tr>
                  ) : paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        Tidak ada data pelanggaran siswa yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((item, idx) => {
                      const rowNum = startIndex + idx + 1;
                      const tglStr = item.tanggal ? String(item.tanggal).split('T')[0] : '-';

                      return (
                        <tr key={item.id}>
                          <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>{rowNum}</td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{tglStr}</div>
                            {item.jam && (
                              <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Clock size={12} /> {item.jam} WIB
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                              {item.nama_siswa || item.kode_siswa}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              {item.nama_kelas || item.kode_kelas || '-'} | NIS: {item.nis || '-'}
                            </div>
                            {item.no_wa_ortu ? (
                              <div style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Phone size={11} /> {item.nama_ortu ? `${item.nama_ortu}: ` : ''}{item.no_wa_ortu}
                              </div>
                            ) : (
                              <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 }}>
                                WA ortu belum ada
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{item.jenis_pelanggaran}</div>
                            {item.catatan && (
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                Catatan: {item.catatan}
                              </div>
                            )}
                            {item.pelapor && (
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                                Pelapor: {item.pelapor}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ marginBottom: 4 }}>{getKategoriBadge(item.kategori)}</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444' }}>
                              +{item.poin || 0} Poin
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>
                              {item.tindakan_sanksi || '-'}
                            </div>
                          </td>
                          <td>
                            {item.wa_status === 'sent' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700 }}>
                                <CheckCircle2 size={12} /> Terkirim WA
                              </span>
                            ) : item.wa_status === 'failed' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 700 }}>
                                <XCircle size={12} /> Gagal Kirim
                              </span>
                            ) : item.wa_status === 'skipped_no_phone' ? (
                              <span style={{ padding: '3px 8px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', fontSize: 11 }}>
                                No WA Kosong
                              </span>
                            ) : (
                              <span style={{ padding: '3px 8px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', fontSize: 11 }}>
                                Pending
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="btn-icon-admin"
                                title="Kirim Notifikasi WA ke Orang Tua"
                                onClick={() => handleSendWA(item)}
                                disabled={sendingWAId === item.id}
                                style={{ background: '#dcfce7', color: '#16a34a' }}
                              >
                                <Send size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon-admin"
                                title="Edit Pelanggaran"
                                onClick={() => handleOpenEdit(item)}
                              >
                                <Edit2 size={14} color="#0066ff" />
                              </button>
                              <button
                                type="button"
                                className="btn-icon-admin"
                                title="Hapus Pelanggaran"
                                onClick={() => handleDelete(item)}
                                style={{ color: '#ef4444' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredList.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* TAB CONTENT: REKAP POIN SISWA */}
        {activeSubTab === 'rekap' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>No</th>
                  <th>Nama Lengkap Siswa</th>
                  <th>Kelas</th>
                  <th>Kontak Wali (WA)</th>
                  <th style={{ textAlign: 'center' }}>Total Pelanggaran</th>
                  <th style={{ textAlign: 'center' }}>Rincian (R / S / B)</th>
                  <th style={{ textAlign: 'center' }}>Total Poin</th>
                  <th>Status Tindak Lanjut Sanksi</th>
                </tr>
              </thead>
              <tbody>
                {rekapPoinList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Tidak ada catatan akumulasi pelanggaran siswa. Seluruh siswa tertib! 🎉
                    </td>
                  </tr>
                ) : (
                  rekapPoinList.map((st, idx) => {
                    const sanksi = getStatusSanksiPoin(st.total_poin || 0);

                    return (
                      <tr key={st.kode_siswa || idx}>
                        <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{st.nama_siswa}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>NIS: {st.nis || st.kode_siswa}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{st.nama_kelas || '-'}</span>
                        </td>
                        <td>
                          {st.no_wa_ortu ? (
                            <a
                              href={`https://wa.me/${String(st.no_wa_ortu).replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#16a34a', textDecoration: 'none', fontWeight: 600, fontSize: 12 }}
                            >
                              <Phone size={13} /> {st.no_wa_ortu}
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Belum ada</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                          {st.total_pelanggaran} Kasus
                        </td>
                        <td style={{ textAlign: 'center', fontSize: 12 }}>
                          <span style={{ color: '#0284c7', fontWeight: 700 }}>{st.count_ringan || 0}</span> / {' '}
                          <span style={{ color: '#d97706', fontWeight: 700 }}>{st.count_sedang || 0}</span> / {' '}
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>{st.count_berat || 0}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 8,
                            background: st.total_poin >= 30 ? '#fee2e2' : '#fef3c7',
                            color: st.total_poin >= 30 ? '#b91c1c' : '#b45309',
                            fontWeight: 800,
                            fontSize: 13
                          }}>
                            {st.total_poin} Poin
                          </span>
                        </td>
                        <td>
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: sanksi.bg,
                            color: sanksi.color,
                            fontWeight: 700,
                            fontSize: 11.5
                          }}>
                            {sanksi.label}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CATAT / EDIT PELANGGARAN */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 640 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={20} color="#0066ff" />
                {isEditing ? 'Edit Data Pelanggaran Siswa' : 'Pencatatan Pelanggaran Tata Tertib Siswa'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* PILIH SISWA */}
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Pilih Siswa *</label>
                    <SearchableSelect
                      placeholder="-- Pilih Siswa yang Melanggar --"
                      value={formData.kode_siswa}
                      onChange={handleSelectSiswa}
                      options={siswaList.map(s => ({
                        value: s.kode_siswa,
                        label: `${s.nama_siswa} (${s.nama_kelas || s.kode_kelas || '-'} | NIS: ${s.nis_nisn || s.nis || '-'})`
                      }))}
                    />
                  </div>

                  {/* PRESET CEPAT PELANGGARAN */}
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Pilih Jenis Aturan / Pelanggaran Populer (Preset Cepat)</span>
                      <span style={{ fontSize: 11, color: '#0066ff', fontWeight: 600 }}>Otomatis Mengisi Poin</span>
                    </label>
                    <select
                      className="form-control-admin"
                      onChange={(e) => {
                        const sel = PRESET_PELANGGARAN.find(p => p.jenis === e.target.value);
                        if (sel) handleSelectPreset(sel);
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>-- Pilih dari daftar tata tertib standar sekolah --</option>
                      {PRESET_PELANGGARAN.map((pr, i) => (
                        <option key={i} value={pr.jenis}>
                          [{pr.kategori} - +{pr.poin} Poin] {pr.jenis}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* INPUT JENIS PELANGGARAN MANUAL / DETAIL */}
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Nama / Uraian Pelanggaran *</label>
                    <input
                      type="text"
                      required
                      className="form-control-admin"
                      placeholder="Contoh: Merokok di area toilet sekolah saat jam istirahat"
                      value={formData.jenis_pelanggaran}
                      onChange={(e) => setFormData({ ...formData, jenis_pelanggaran: e.target.value })}
                    />
                  </div>

                  {/* KATEGORI */}
                  <div className="form-group-admin">
                    <label>Kategori Tingkat Pelanggaran</label>
                    <select
                      className="form-control-admin"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    >
                      <option value="Ringan">🔵 Ringan (5 - 10 Poin)</option>
                      <option value="Sedang">🟡 Sedang (10 - 25 Poin)</option>
                      <option value="Berat">🔴 Berat (25 - 100 Poin)</option>
                    </select>
                  </div>

                  {/* POIN */}
                  <div className="form-group-admin">
                    <label>Bobot Poin Pelanggaran</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="form-control-admin"
                      value={formData.poin}
                      onChange={(e) => setFormData({ ...formData, poin: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  {/* TANGGAL & JAM */}
                  <div className="form-group-admin">
                    <label>Tanggal Kejadian</label>
                    <input
                      type="date"
                      className="form-control-admin"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Jam / Waktu Kejadian</label>
                    <input
                      type="time"
                      className="form-control-admin"
                      value={formData.jam}
                      onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                    />
                  </div>

                  {/* TINDAKAN / SANKSI */}
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Tindakan Pembinaan / Sanksi Diberikan</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="Contoh: Pemanggilan orang tua & pembinaan oleh Guru BK"
                      value={formData.tindakan_sanksi}
                      onChange={(e) => setFormData({ ...formData, tindakan_sanksi: e.target.value })}
                    />
                  </div>

                  {/* CATATAN KRONOLOGI */}
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Catatan / Kronologi Singkat (Opsional)</label>
                    <textarea
                      rows={2}
                      className="form-control-admin"
                      placeholder="Keterangan tambahan barang bukti, saksi, atau kronologi..."
                      value={formData.catatan}
                      onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    />
                  </div>

                  {/* GURU PELAPOR */}
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Petugas / Guru Pelapor</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      value={formData.pelapor}
                      onChange={(e) => setFormData({ ...formData, pelapor: e.target.value })}
                    />
                  </div>

                  {/* CHECKBOX KIRIM WA OTOMATIS */}
                  {!isEditing && (
                    <div style={{ gridColumn: 'span 2', background: '#f0fdf4', padding: '12px 16px', borderRadius: 10, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        id="send_wa_check"
                        checked={formData.send_wa}
                        onChange={(e) => setFormData({ ...formData, send_wa: e.target.checked })}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <label htmlFor="send_wa_check" style={{ fontSize: 13, color: '#166534', fontWeight: 700, cursor: 'pointer', margin: 0 }}>
                        📱 Otomatis kirim pesan notifikasi pelanggaran ke WhatsApp Orang Tua/Wali
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan & Mengirim WA...' : isEditing ? 'Simpan Perubahan' : 'Catat Pelanggaran & Kirim WA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
