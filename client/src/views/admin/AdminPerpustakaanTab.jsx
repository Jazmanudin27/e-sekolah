import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Search, Edit2, Trash2, RefreshCw, X, CheckCircle,
  Clock, AlertTriangle, Book, User, Calendar, Tag, MapPin, Grid, List,
  RotateCcw, DollarSign, ArrowRight, BarChart2, ShieldCheck, Layers
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function AdminPerpustakaanTab() {
  const [activeSubTab, setActiveSubTab] = useState('katalog'); // 'katalog' | 'peminjaman' | 'statistik'
  const [stats, setStats] = useState({
    total_judul: 0,
    total_eksemplar: 0,
    total_tersedia: 0,
    total_dipinjam: 0,
    total_terlambat: 0,
    kategori_summary: []
  });

  // ============ STATE KATALOG BUKU ============
  const [bukuList, setBukuList] = useState([]);
  const [loadingBuku, setLoadingBuku] = useState(true);
  const [searchBuku, setSearchBuku] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [currentPageBuku, setCurrentPageBuku] = useState(1);
  const itemsPerPage = 8;

  // Modal Buku CRUD
  const [showBukuModal, setShowBukuModal] = useState(false);
  const [isEditingBuku, setIsEditingBuku] = useState(false);
  const [editingBukuId, setEditingBukuId] = useState(null);
  const [bukuForm, setBukuForm] = useState({
    kode_buku: '',
    judul: '',
    pengarang: '',
    penerbit: '',
    tahun_terbit: '',
    isbn: '',
    kategori: 'Pelajaran',
    lokasi_rak: 'Rak A-1',
    stok: 5,
    deskripsi: ''
  });
  const [submittingBuku, setSubmittingBuku] = useState(false);

  // Modal Detail Buku
  const [detailBuku, setDetailBuku] = useState(null);

  // ============ STATE PEMINJAMAN ============
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [loadingPeminjaman, setLoadingPeminjaman] = useState(true);
  const [searchPinjam, setSearchPinjam] = useState('');
  const [filterStatusPinjam, setFilterStatusPinjam] = useState('Semua');
  const [filterTypePinjam, setFilterTypePinjam] = useState('Semua');
  const [currentPagePinjam, setCurrentPagePinjam] = useState(1);

  // Modal Peminjaman Baru
  const [showPinjamModal, setShowPinjamModal] = useState(false);
  const [pinjamForm, setPinjamForm] = useState({
    buku_id: '',
    peminjam_type: 'siswa',
    peminjam_id: '',
    nama_peminjam: '',
    kelas_atau_jabatan: '',
    tgl_pinjam: new Date().toISOString().slice(0, 10),
    tgl_tenggat: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    catatan: ''
  });
  const [siswaOptions, setSiswaOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);
  const [submittingPinjam, setSubmittingPinjam] = useState(false);

  // Modal Pengembalian
  const [showKembaliModal, setShowKembaliModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [kembaliForm, setKembaliForm] = useState({
    tgl_kembali: new Date().toISOString().slice(0, 10),
    denda: 0,
    catatan: ''
  });
  const [submittingKembali, setSubmittingKembali] = useState(false);

  const categoriesList = [
    'Semua', 'Pelajaran', 'Fiksi', 'Sejarah', 'Sains', 'Teknologi', 'Psikologi', 'Agama', 'Umum'
  ];

  // Fetch initial data
  useEffect(() => {
    fetchStats();
    fetchBuku();
    fetchPeminjaman();
    fetchPeminjamOptions();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/perpustakaan/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetchStats:', err);
    }
  };

  const fetchBuku = async () => {
    setLoadingBuku(true);
    try {
      const res = await api.get('/perpustakaan/buku');
      setBukuList(res.data?.data || []);
    } catch (err) {
      console.error('Error fetchBuku:', err);
      setBukuList([]);
    } finally {
      setLoadingBuku(false);
    }
  };

  const fetchPeminjaman = async () => {
    setLoadingPeminjaman(true);
    try {
      const res = await api.get('/perpustakaan/peminjaman');
      setPeminjamanList(res.data?.data || []);
    } catch (err) {
      console.error('Error fetchPeminjaman:', err);
      setPeminjamanList([]);
    } finally {
      setLoadingPeminjaman(false);
    }
  };

  const fetchPeminjamOptions = async () => {
    try {
      const [resSiswa, resGuru] = await Promise.all([
        api.get('/siswa'),
        api.get('/guru')
      ]);
      setSiswaOptions(resSiswa.data?.data || []);
      setGuruOptions(resGuru.data?.data || []);
    } catch (err) {
      console.error('Error fetchPeminjamOptions:', err);
    }
  };

  // ============ HANDLERS BUKU ============
  const handleOpenAddBuku = () => {
    const autoCode = `BUK-${Math.floor(100 + Math.random() * 900)}`;
    setBukuForm({
      kode_buku: autoCode,
      judul: '',
      pengarang: '',
      penerbit: '',
      tahun_terbit: new Date().getFullYear().toString(),
      isbn: '',
      kategori: 'Pelajaran',
      lokasi_rak: 'Rak A-1',
      stok: 5,
      deskripsi: ''
    });
    setIsEditingBuku(false);
    setEditingBukuId(null);
    setShowBukuModal(true);
  };

  const handleOpenEditBuku = (buku) => {
    setBukuForm({
      kode_buku: buku.kode_buku || '',
      judul: buku.judul || '',
      pengarang: buku.pengarang || '',
      penerbit: buku.penerbit || '',
      tahun_terbit: buku.tahun_terbit || '',
      isbn: buku.isbn || '',
      kategori: buku.kategori || 'Pelajaran',
      lokasi_rak: buku.lokasi_rak || 'Rak A-1',
      stok: buku.stok || 1,
      deskripsi: buku.deskripsi || ''
    });
    setIsEditingBuku(true);
    setEditingBukuId(buku.id);
    setShowBukuModal(true);
  };

  const handleSubmitBuku = async (e) => {
    e.preventDefault();
    if (!bukuForm.judul || !bukuForm.pengarang) {
      Swal.fire('Validasi', 'Judul buku dan nama pengarang wajib diisi!', 'warning');
      return;
    }
    setSubmittingBuku(true);
    try {
      if (isEditingBuku) {
        await api.put(`/perpustakaan/buku/${editingBukuId}`, bukuForm);
        Swal.fire('Berhasil!', 'Data buku berhasil diperbarui.', 'success');
      } else {
        await api.post('/perpustakaan/buku', bukuForm);
        Swal.fire('Berhasil!', 'Buku baru berhasil ditambahkan ke katalog perpustakaan.', 'success');
      }
      setShowBukuModal(false);
      fetchBuku();
      fetchStats();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menyimpan buku.', 'error');
    } finally {
      setSubmittingBuku(false);
    }
  };

  const handleDeleteBuku = (buku) => {
    Swal.fire({
      title: 'Hapus Buku?',
      text: `Apakah Anda yakin ingin menghapus buku "${buku.judul}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/perpustakaan/buku/${buku.id}`);
          Swal.fire('Terhapus!', 'Buku telah dihapus dari katalog.', 'success');
          fetchBuku();
          fetchStats();
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus buku.', 'error');
        }
      }
    });
  };

  // ============ HANDLERS PEMINJAMAN ============
  const handleOpenPinjamModal = (preselectBuku = null) => {
    const today = new Date();
    const tenggat = new Date(today);
    tenggat.setDate(tenggat.getDate() + 7);

    setPinjamForm({
      buku_id: preselectBuku ? preselectBuku.id : (bukuList.length > 0 ? bukuList[0].id : ''),
      peminjam_type: 'siswa',
      peminjam_id: '',
      nama_peminjam: '',
      kelas_atau_jabatan: '',
      tgl_pinjam: today.toISOString().slice(0, 10),
      tgl_tenggat: tenggat.toISOString().slice(0, 10),
      catatan: ''
    });
    setShowPinjamModal(true);
  };

  const handleSelectPeminjamUser = (val) => {
    if (!val) {
      setPinjamForm(prev => ({ ...prev, peminjam_id: '', nama_peminjam: '', kelas_atau_jabatan: '' }));
      return;
    }

    if (pinjamForm.peminjam_type === 'siswa') {
      const siswa = siswaOptions.find(s => (s.kode_siswa || s.id) == val);
      if (siswa) {
        setPinjamForm(prev => ({
          ...prev,
          peminjam_id: siswa.kode_siswa || siswa.id,
          nama_peminjam: siswa.nama_siswa || siswa.nama,
          kelas_atau_jabatan: siswa.kelas || siswa.kode_kelas || 'Siswa'
        }));
      }
    } else {
      const guru = guruOptions.find(g => (g.kode_guru || g.id) == val);
      if (guru) {
        setPinjamForm(prev => ({
          ...prev,
          peminjam_id: guru.kode_guru || guru.nip || guru.id,
          nama_peminjam: guru.nama_guru || guru.nama,
          kelas_atau_jabatan: guru.jabatan || 'Guru'
        }));
      }
    }
  };

  const handleSubmitPinjam = async (e) => {
    e.preventDefault();
    if (!pinjamForm.buku_id || !pinjamForm.peminjam_id || !pinjamForm.nama_peminjam) {
      Swal.fire('Validasi', 'Mohon pilih buku dan data peminjam dengan lengkap!', 'warning');
      return;
    }
    setSubmittingPinjam(true);
    try {
      await api.post('/perpustakaan/peminjaman', pinjamForm);
      Swal.fire('Berhasil!', 'Transaksi peminjaman buku berhasil dicatat.', 'success');
      setShowPinjamModal(false);
      fetchPeminjaman();
      fetchBuku();
      fetchStats();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Gagal memproses peminjaman.', 'error');
    } finally {
      setSubmittingPinjam(false);
    }
  };

  const handleOpenKembaliModal = (tx) => {
    setSelectedTx(tx);
    const todayStr = new Date().toISOString().slice(0, 10);
    let calculatedDenda = 0;

    // Calculate denda if past due date
    if (tx.tgl_tenggat) {
      const tenggatDate = new Date(tx.tgl_tenggat);
      const returnDate = new Date(todayStr);
      if (returnDate > tenggatDate) {
        const diffDays = Math.ceil((returnDate - tenggatDate) / (1000 * 60 * 60 * 24));
        calculatedDenda = diffDays * 1000; // Rp 1.000 / day
      }
    }

    setKembaliForm({
      tgl_kembali: todayStr,
      denda: calculatedDenda,
      catatan: ''
    });
    setShowKembaliModal(true);
  };

  const handleSubmitKembali = async (e) => {
    e.preventDefault();
    if (!selectedTx) return;
    setSubmittingKembali(true);
    try {
      await api.put(`/perpustakaan/peminjaman/${selectedTx.id}/kembali`, kembaliForm);
      Swal.fire('Berhasil!', 'Buku telah dikembalikan dan stok diperbarui.', 'success');
      setShowKembaliModal(false);
      fetchPeminjaman();
      fetchBuku();
      fetchStats();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Gagal mengembalikan buku.', 'error');
    } finally {
      setSubmittingKembali(false);
    }
  };

  const handleDeletePeminjaman = (tx) => {
    Swal.fire({
      title: 'Hapus Transaksi?',
      text: `Hapus riwayat peminjaman "${tx.kode_transaksi}" (${tx.nama_peminjam})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await api.delete(`/perpustakaan/peminjaman/${tx.id}`);
          Swal.fire('Terhapus!', 'Transaksi peminjaman berhasil dihapus.', 'success');
          fetchPeminjaman();
          fetchBuku();
          fetchStats();
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus transaksi.', 'error');
        }
      }
    });
  };

  // Filtered Lists
  const filteredBuku = bukuList.filter(b => {
    const matchSearch = (b.judul || '').toLowerCase().includes(searchBuku.toLowerCase()) ||
                        (b.pengarang || '').toLowerCase().includes(searchBuku.toLowerCase()) ||
                        (b.kode_buku || '').toLowerCase().includes(searchBuku.toLowerCase()) ||
                        (b.isbn || '').toLowerCase().includes(searchBuku.toLowerCase());
    const matchKategori = filterKategori === 'Semua' || b.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  const indexOfLastBuku = currentPageBuku * itemsPerPage;
  const indexOfFirstBuku = indexOfLastBuku - itemsPerPage;
  const currentBukuPageItems = filteredBuku.slice(indexOfFirstBuku, indexOfLastBuku);

  const filteredPeminjaman = peminjamanList.filter(p => {
    const matchSearch = (p.kode_transaksi || '').toLowerCase().includes(searchPinjam.toLowerCase()) ||
                        (p.nama_peminjam || '').toLowerCase().includes(searchPinjam.toLowerCase()) ||
                        (p.judul_buku || '').toLowerCase().includes(searchPinjam.toLowerCase()) ||
                        (p.peminjam_id || '').toLowerCase().includes(searchPinjam.toLowerCase());
    const matchStatus = filterStatusPinjam === 'Semua' || p.status === filterStatusPinjam;
    const matchType = filterTypePinjam === 'Semua' || p.peminjam_type === filterTypePinjam;
    return matchSearch && matchStatus && matchType;
  });

  const indexOfLastPinjam = currentPagePinjam * 10;
  const indexOfFirstPinjam = indexOfLastPinjam - 10;
  const currentPinjamPageItems = filteredPeminjaman.slice(indexOfFirstPinjam, indexOfLastPinjam);

  const getCategoryBadgeColor = (cat) => {
    switch (cat) {
      case 'Pelajaran': return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'Fiksi': return { bg: '#fce7f3', color: '#be185d', border: '#fbcfe8' };
      case 'Sejarah': return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case 'Sains': return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
      case 'Teknologi': return { bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' };
      case 'Psikologi': return { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' };
      default: return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div className="perpustakaan-module">
      {/* ----------------- TOP BANNER & STATS CARDS ----------------- */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: '0 10px 25px rgba(2, 132, 199, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12, backdropFilter: 'blur(8px)' }}>
                <BookOpen size={24} color="#ffffff" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                Perpustakaan E-Katalog & Peminjaman
              </h2>
            </div>
            <p style={{ fontSize: 13, color: '#e0f2fe', margin: 0, opacity: 0.9 }}>
              Kelola katalog koleksi buku, lokasi rak, transaksi peminjaman siswa & guru, serta pengembalian.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleOpenAddBuku}
              style={{
                background: '#ffffff',
                color: '#0284c7',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Plus size={16} /> Tambah Buku Baru
            </button>
            <button
              onClick={() => handleOpenPinjamModal()}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '10px 18px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              <RotateCcw size={16} /> Catat Peminjaman
            </button>
          </div>
        </div>

        {/* Stats Summary Grid inside banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginTop: 20
        }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#bae6fd', textTransform: 'uppercase', marginBottom: 4 }}>TOTAL JUDUL BUKU</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{stats.total_judul} <span style={{ fontSize: 12, fontWeight: 500 }}>Judul</span></div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#bae6fd', textTransform: 'uppercase', marginBottom: 4 }}>TOTAL EKSEMPLAR STOK</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{stats.total_eksemplar} <span style={{ fontSize: 12, fontWeight: 500 }}>Buku</span></div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fef08a', textTransform: 'uppercase', marginBottom: 4 }}>SEDANG DIPINJAM</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fef08a' }}>{stats.total_dipinjam} <span style={{ fontSize: 12, fontWeight: 500 }}>Buku</span></div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', marginBottom: 4 }}>TERLAMBAT KEMBALI</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fca5a5' }}>{stats.total_terlambat} <span style={{ fontSize: 12, fontWeight: 500 }}>Buku</span></div>
          </div>
        </div>
      </div>

      {/* ----------------- SUB-TABS NAVIGATION ----------------- */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: 2
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setActiveSubTab('katalog')}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              color: activeSubTab === 'katalog' ? '#0284c7' : '#64748b',
              borderBottom: activeSubTab === 'katalog' ? '3px solid #0284c7' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <BookOpen size={17} /> Katalog & Eksemplar ({bukuList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('peminjaman')}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              color: activeSubTab === 'peminjaman' ? '#0284c7' : '#64748b',
              borderBottom: activeSubTab === 'peminjaman' ? '3px solid #0284c7' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={17} /> Transaksi Peminjaman ({peminjamanList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('statistik')}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              color: activeSubTab === 'statistik' ? '#0284c7' : '#64748b',
              borderBottom: activeSubTab === 'statistik' ? '3px solid #0284c7' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <BarChart2 size={17} /> Statistik & Rak
          </button>
        </div>

        <button
          className="btn-outline-admin"
          onClick={() => { fetchBuku(); fetchPeminjaman(); fetchStats(); }}
          title="Refresh Data Perpustakaan"
          style={{ padding: '6px 12px', fontSize: 12 }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ======================================================================== */}
      {/* SUB-TAB 1: KATALOG BUKU                                                  */}
      {/* ======================================================================== */}
      {activeSubTab === 'katalog' && (
        <div className="admin-panel" style={{ background: '#ffffff', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          {/* Controls Header */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Cari judul, pengarang, kode buku, atau ISBN..."
                value={searchBuku}
                onChange={(e) => { setSearchBuku(e.target.value); setCurrentPageBuku(1); }}
                className="form-control-admin"
                style={{ paddingLeft: 40 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Kategori:</label>
              <select
                className="form-control-admin"
                style={{ fontSize: 12, padding: '7px 12px', width: 150 }}
                value={filterKategori}
                onChange={(e) => { setFilterKategori(e.target.value); setCurrentPageBuku(1); }}
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? '#0284c7' : '#ffffff',
                  color: viewMode === 'grid' ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '7px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Tampilan Kartu Grid"
              >
                <Grid size={15} /> Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? '#0284c7' : '#ffffff',
                  color: viewMode === 'table' ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '7px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Tampilan Tabel Detail"
              >
                <List size={15} /> Tabel
              </button>
            </div>
          </div>

          {/* Grid View */}
          {loadingBuku ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>Memuat katalog buku...</div>
          ) : filteredBuku.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
              Tidak ada koleksi buku yang sesuai dengan pencarian/kategori.
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16
            }}>
              {currentBukuPageItems.map((buku) => {
                const badge = getCategoryBadgeColor(buku.kategori);
                const isAvailable = buku.tersedia > 0;
                return (
                  <div
                    key={buku.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 16,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s hover:shadow-md'
                    }}
                  >
                    <div>
                      {/* Top Bar: Code & Category Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', background: '#f0f9ff', padding: '3px 8px', borderRadius: 6, border: '1px solid #bae6fd' }}>
                          {buku.kode_buku}
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 10 }}>
                          {buku.kategori}
                        </span>
                      </div>

                      {/* Title & Author */}
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {buku.judul}
                      </h4>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 12 }}>
                        Pengarang: <span style={{ color: '#334155' }}>{buku.pengarang}</span>
                      </div>

                      {/* Info Pills */}
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #f1f5f9', fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>Penerbit / Thn:</span>
                          <span style={{ fontWeight: 700 }}>{buku.penerbit || '-'} ({buku.tahun_terbit || '-'})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                          <span>Lokasi Rak:</span>
                          <span style={{ fontWeight: 700, color: '#0284c7' }}>{buku.lokasi_rak || 'Rak A-1'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {/* Availability status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px dashed #e2e8f0', marginBottom: 12 }}>
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Ketersediaan:</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: isAvailable ? '#059669' : '#dc2626' }}>
                          {buku.tersedia} / {buku.stok} Eksemplar
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenPinjamModal(buku)}
                          disabled={!isAvailable}
                          style={{
                            flex: 1,
                            background: isAvailable ? '#0284c7' : '#cbd5e1',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 10px',
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4
                          }}
                        >
                          <RotateCcw size={12} /> Pinjamkan
                        </button>
                        <button
                          className="btn-action-icon btn-edit"
                          onClick={() => handleOpenEditBuku(buku)}
                          title="Edit Buku"
                          style={{ padding: 6 }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn-action-icon btn-delete"
                          onClick={() => handleDeleteBuku(buku)}
                          title="Hapus Buku"
                          style={{ padding: 6 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 45 }}>No</th>
                    <th style={{ width: 90 }}>Kode</th>
                    <th>Judul Buku</th>
                    <th>Pengarang & Penerbit</th>
                    <th>Kategori</th>
                    <th>Rak</th>
                    <th style={{ textAlign: 'center' }}>Tersedia / Stok</th>
                    <th style={{ width: 140, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBukuPageItems.map((buku, idx) => {
                    const badge = getCategoryBadgeColor(buku.kategori);
                    const isAvailable = buku.tersedia > 0;
                    return (
                      <tr key={buku.id}>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          {indexOfFirstBuku + idx + 1}
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: '#0284c7', fontSize: 12 }}>{buku.kode_buku}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>{buku.judul}</div>
                          {buku.isbn && <div style={{ fontSize: 11, color: '#64748b' }}>ISBN: {buku.isbn}</div>}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{buku.pengarang}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{buku.penerbit || '-'} ({buku.tahun_terbit || '-'})</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '3px 8px', borderRadius: 8 }}>
                            {buku.kategori}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0284c7', fontSize: 12 }}>{buku.lokasi_rak || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 800, color: isAvailable ? '#059669' : '#dc2626', fontSize: 12 }}>
                            {buku.tersedia} / {buku.stok}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 4 }}>
                            <button
                              onClick={() => handleOpenPinjamModal(buku)}
                              disabled={!isAvailable}
                              style={{
                                background: isAvailable ? '#0284c7' : '#cbd5e1',
                                color: '#ffffff',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: isAvailable ? 'pointer' : 'not-allowed'
                              }}
                              title="Pinjamkan Buku"
                            >
                              Pinjam
                            </button>
                            <button
                              className="btn-action-icon btn-edit"
                              onClick={() => handleOpenEditBuku(buku)}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn-action-icon btn-delete"
                              onClick={() => handleDeleteBuku(buku)}
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPageBuku}
            totalItems={filteredBuku.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPageBuku}
          />
        </div>
      )}

      {/* ======================================================================== */}
      {/* SUB-TAB 2: TRANSAKSI PEMINJAMAN                                          */}
      {/* ======================================================================== */}
      {activeSubTab === 'peminjaman' && (
        <div className="admin-panel" style={{ background: '#ffffff', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          {/* Controls Header */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Cari transaksi (No TRX, nama peminjam, judul buku...)"
                value={searchPinjam}
                onChange={(e) => { setSearchPinjam(e.target.value); setCurrentPagePinjam(1); }}
                className="form-control-admin"
                style={{ paddingLeft: 40 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Status:</label>
              <select
                className="form-control-admin"
                style={{ fontSize: 12, padding: '7px 12px', width: 140 }}
                value={filterStatusPinjam}
                onChange={(e) => { setFilterStatusPinjam(e.target.value); setCurrentPagePinjam(1); }}
              >
                <option value="Semua">Semua Status</option>
                <option value="Dipinjam">Dipinjam (Aktif)</option>
                <option value="Dikembalikan">Dikembalikan</option>
                <option value="Terlambat">Terlambat</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Tipe:</label>
              <select
                className="form-control-admin"
                style={{ fontSize: 12, padding: '7px 12px', width: 130 }}
                value={filterTypePinjam}
                onChange={(e) => { setFilterTypePinjam(e.target.value); setCurrentPagePinjam(1); }}
              >
                <option value="Semua">Semua Tipe</option>
                <option value="siswa">Siswa</option>
                <option value="guru">Guru / Staf</option>
              </select>
            </div>

            <button
              className="btn-primary-admin"
              onClick={() => handleOpenPinjamModal()}
              style={{ fontSize: 12, padding: '8px 14px' }}
            >
              <Plus size={15} /> Catat Peminjaman
            </button>
          </div>

          {/* Table Transactions */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>No</th>
                  <th style={{ width: 120 }}>Kode Transaksi</th>
                  <th>Judul Buku</th>
                  <th>Peminjam</th>
                  <th>Tgl Pinjam</th>
                  <th>Tenggat Kembali</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Denda</th>
                  <th style={{ width: 130, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingPeminjaman ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Memuat data peminjaman...
                    </td>
                  </tr>
                ) : filteredPeminjaman.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Belum ada catatan transaksi peminjaman.
                    </td>
                  </tr>
                ) : (
                  currentPinjamPageItems.map((tx, idx) => {
                    const isDipinjam = tx.status === 'Dipinjam';
                    const isTerlambat = isDipinjam && new Date(tx.tgl_tenggat) < new Date(new Date().toISOString().slice(0,10));
                    
                    return (
                      <tr key={tx.id}>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          {indexOfFirstPinjam + idx + 1}
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: '#0284c7', fontSize: 11.5 }}>{tx.kode_transaksi}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 12.5 }}>{tx.judul_buku}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Kode: {tx.kode_buku}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 12.5 }}>{tx.nama_peminjam}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{tx.peminjam_type}</span> • {tx.kelas_atau_jabatan}
                          </div>
                        </td>
                        <td style={{ fontSize: 12 }}>{tx.tgl_pinjam ? new Date(tx.tgl_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                        <td style={{ fontSize: 12, color: isTerlambat ? '#dc2626' : '#334155', fontWeight: isTerlambat ? 800 : 500 }}>
                          {tx.tgl_tenggat ? new Date(tx.tgl_tenggat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {tx.status === 'Dikembalikan' ? (
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: 10 }}>
                              Dikembalikan
                            </span>
                          ) : isTerlambat ? (
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: 10 }}>
                              Terlambat
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: 10 }}>
                              Dipinjam
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 12, color: tx.denda > 0 ? '#dc2626' : '#64748b' }}>
                          {tx.denda > 0 ? `Rp ${parseInt(tx.denda, 10).toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 4 }}>
                            {tx.status !== 'Dikembalikan' && (
                              <button
                                onClick={() => handleOpenKembaliModal(tx)}
                                style={{
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                                title="Proses Pengembalian Buku"
                              >
                                <CheckCircle size={12} /> Kembali
                              </button>
                            )}
                            <button
                              className="btn-action-icon btn-delete"
                              onClick={() => handleDeletePeminjaman(tx)}
                              title="Hapus Transaksi"
                            >
                              <Trash2 size={13} />
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
            currentPage={currentPagePinjam}
            totalItems={filteredPeminjaman.length}
            itemsPerPage={10}
            onPageChange={setCurrentPagePinjam}
          />
        </div>
      )}

      {/* ======================================================================== */}
      {/* SUB-TAB 3: STATISTIK & RAK                                              */}
      {/* ======================================================================== */}
      {activeSubTab === 'statistik' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Card Category Distribution */}
          <div className="admin-panel" style={{ background: '#ffffff', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#0284c7" /> Distribusi Kategori Buku
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.kategori_summary && stats.kategori_summary.length > 0 ? (
                stats.kategori_summary.map((item) => {
                  const percent = stats.total_judul > 0 ? Math.round((item.count / stats.total_judul) * 100) : 0;
                  const badge = getCategoryBadgeColor(item.kategori);
                  return (
                    <div key={item.kategori} style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.kategori}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0284c7' }}>{item.count} Judul ({percent}%)</span>
                      </div>
                      <div style={{ background: '#e2e8f0', height: 6, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ background: badge.color, height: '100%', width: `${percent}%`, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: '#64748b', fontSize: 13 }}>Belum ada data kategori.</div>
              )}
            </div>
          </div>

          {/* Rules & Information */}
          <div className="admin-panel" style={{ background: '#ffffff', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#059669" /> Ketentuan Perpustakaan E-Sekolah
            </h4>
            <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 12, borderRadius: 10, color: '#065f46' }}>
                <strong>Batas Peminjaman:</strong> Standar masa simpan pinjam buku siswa adalah 7 hari kalender.
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 12, borderRadius: 10, color: '#92400e' }}>
                <strong>Denda Keterlambatan:</strong> Keterlambatan pengembalian buku dikenakan denda otomatis <strong>Rp 1.000 / hari</strong>.
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bae6fd', padding: 12, borderRadius: 10, color: '#1e40af' }}>
                <strong>Sinkronisasi Stok:</strong> Stok buku yang dipinjam akan otomatis berkurang dan kembali bertambah saat proses pengembalian dikonfirmasi.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL: TAMBAH / EDIT BUKU                                               */}
      {/* ======================================================================== */}
      {showBukuModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 580 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="#0284c7" />
                {isEditingBuku ? 'Edit Detail Buku' : 'Tambah Buku Baru'}
              </h3>
              <button onClick={() => setShowBukuModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitBuku}>
              <div className="admin-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group-admin">
                    <label>Kode Buku *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      value={bukuForm.kode_buku}
                      onChange={(e) => setBukuForm({ ...bukuForm, kode_buku: e.target.value })}
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>ISBN (Opsional)</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="978-..."
                      value={bukuForm.isbn}
                      onChange={(e) => setBukuForm({ ...bukuForm, isbn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group-admin" style={{ marginBottom: 12 }}>
                  <label>Judul Buku *</label>
                  <input
                    type="text"
                    className="form-control-admin"
                    required
                    placeholder="Judul lengkap buku..."
                    value={bukuForm.judul}
                    onChange={(e) => setBukuForm({ ...bukuForm, judul: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group-admin">
                    <label>Pengarang / Penulis *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="Nama penulis..."
                      value={bukuForm.pengarang}
                      onChange={(e) => setBukuForm({ ...bukuForm, pengarang: e.target.value })}
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Penerbit</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="Nama penerbit..."
                      value={bukuForm.penerbit}
                      onChange={(e) => setBukuForm({ ...bukuForm, penerbit: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group-admin">
                    <label>Kategori *</label>
                    <select
                      className="form-control-admin"
                      value={bukuForm.kategori}
                      onChange={(e) => setBukuForm({ ...bukuForm, kategori: e.target.value })}
                    >
                      {categoriesList.filter(c => c !== 'Semua').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group-admin">
                    <label>Lokasi Rak</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="Contoh: Rak A-1"
                      value={bukuForm.lokasi_rak}
                      onChange={(e) => setBukuForm({ ...bukuForm, lokasi_rak: e.target.value })}
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Jumlah Stok *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control-admin"
                      required
                      value={bukuForm.stok}
                      onChange={(e) => setBukuForm({ ...bukuForm, stok: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>
                </div>

                <div className="form-group-admin">
                  <label>Deskripsi / Sinopsis Buku</label>
                  <textarea
                    rows={3}
                    className="form-control-admin"
                    placeholder="Ringkasan singkat isi buku..."
                    value={bukuForm.deskripsi}
                    onChange={(e) => setBukuForm({ ...bukuForm, deskripsi: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowBukuModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submittingBuku}>
                  {submittingBuku ? 'Menyimpan...' : isEditingBuku ? 'Simpan Perubahan' : 'Tambah Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL: TRANSAKSI PEMINJAMAN BARU                                        */}
      {/* ======================================================================== */}
      {showPinjamModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 560 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <RotateCcw size={18} color="#0284c7" /> Catat Peminjaman Buku
              </h3>
              <button onClick={() => setShowPinjamModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPinjam}>
              <div className="admin-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-group-admin" style={{ marginBottom: 14 }}>
                  <label>Pilih Buku Yang Dipinjam * (Ketik untuk mencari)</label>
                  <SearchableSelect
                    placeholder="-- Cari berdasarkan judul, kode, pengarang, atau lokasi rak --"
                    value={pinjamForm.buku_id}
                    onChange={(e) => setPinjamForm({ ...pinjamForm, buku_id: e.target.value })}
                    options={bukuList.map(b => ({
                      value: b.id,
                      label: `${b.kode_buku} - ${b.judul}`,
                      sublabel: b.tersedia > 0
                        ? `Stok: ${b.tersedia} dari ${b.stok} eksemplar | ${b.kategori} (${b.lokasi_rak})`
                        : '⚠️ Stok Habis (Tidak dapat dipinjam)'
                    }))}
                    required
                    isClearable
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-group-admin">
                    <label>Tipe Peminjam *</label>
                    <select
                      className="form-control-admin"
                      value={pinjamForm.peminjam_type}
                      onChange={(e) => {
                        setPinjamForm({ ...pinjamForm, peminjam_type: e.target.value, peminjam_id: '', nama_peminjam: '', kelas_atau_jabatan: '' });
                      }}
                    >
                      <option value="siswa">Siswa</option>
                      <option value="guru">Guru / Staf</option>
                    </select>
                  </div>
                  <div className="form-group-admin">
                    <label>Pilih {pinjamForm.peminjam_type === 'siswa' ? 'Siswa' : 'Guru'} * (Ketik nama/NIS/NIP)</label>
                    <SearchableSelect
                      placeholder={`-- Cari nama/NIS/NIP ${pinjamForm.peminjam_type === 'siswa' ? 'Siswa' : 'Guru'} --`}
                      value={pinjamForm.peminjam_id}
                      onChange={(e) => handleSelectPeminjamUser(e.target.value)}
                      options={pinjamForm.peminjam_type === 'siswa' ? (
                        siswaOptions.map(s => ({
                          value: s.kode_siswa || s.id,
                          label: `${s.nama_siswa || s.nama} (NIS: ${s.nis || '-'})`,
                          sublabel: `Kelas: ${s.kelas || s.kode_kelas || '-'}`
                        }))
                      ) : (
                        guruOptions.map(g => ({
                          value: g.kode_guru || g.id,
                          label: `${g.nama_guru || g.nama} (NIP: ${g.nip || '-'})`,
                          sublabel: `Jabatan: ${g.jabatan || 'Guru'}`
                        }))
                      )}
                      required
                      isClearable
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group-admin">
                    <label>Tanggal Pinjam *</label>
                    <input
                      type="date"
                      className="form-control-admin"
                      required
                      value={pinjamForm.tgl_pinjam}
                      onChange={(e) => setPinjamForm({ ...pinjamForm, tgl_pinjam: e.target.value })}
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Tanggal Tenggat Kembali *</label>
                    <input
                      type="date"
                      className="form-control-admin"
                      required
                      value={pinjamForm.tgl_tenggat}
                      onChange={(e) => setPinjamForm({ ...pinjamForm, tgl_tenggat: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group-admin">
                  <label>Catatan (Opsional)</label>
                  <input
                    type="text"
                    className="form-control-admin"
                    placeholder="Keterangan tambahan..."
                    value={pinjamForm.catatan}
                    onChange={(e) => setPinjamForm({ ...pinjamForm, catatan: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowPinjamModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submittingPinjam}>
                  {submittingPinjam ? 'Memproses...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL: PENGEMBALIAN BUKU                                                */}
      {/* ======================================================================== */}
      {showKembaliModal && selectedTx && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 480 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} color="#059669" /> Konfirmasi Pengembalian Buku
              </h3>
              <button onClick={() => setShowKembaliModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitKembali}>
              <div className="admin-modal-body">
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 14, fontSize: 12.5, lineHeight: 1.6 }}>
                  <div><strong>Kode TRX:</strong> {selectedTx.kode_transaksi}</div>
                  <div><strong>Judul Buku:</strong> {selectedTx.judul_buku}</div>
                  <div><strong>Peminjam:</strong> {selectedTx.nama_peminjam} ({selectedTx.kelas_atau_jabatan})</div>
                  <div><strong>Tgl Tenggat:</strong> {selectedTx.tgl_tenggat}</div>
                </div>

                <div className="form-group-admin" style={{ marginBottom: 12 }}>
                  <label>Tanggal Dikembalikan *</label>
                  <input
                    type="date"
                    className="form-control-admin"
                    required
                    value={kembaliForm.tgl_kembali}
                    onChange={(e) => setKembaliForm({ ...kembaliForm, tgl_kembali: e.target.value })}
                  />
                </div>

                <div className="form-group-admin" style={{ marginBottom: 12 }}>
                  <label>Denda Keterlambatan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control-admin"
                    value={kembaliForm.denda}
                    onChange={(e) => setKembaliForm({ ...kembaliForm, denda: parseFloat(e.target.value) || 0 })}
                  />
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Auto-hitung Rp 1.000 / hari jika melewati tanggal tenggat.
                  </div>
                </div>

                <div className="form-group-admin">
                  <label>Catatan Pengembalian</label>
                  <input
                    type="text"
                    className="form-control-admin"
                    placeholder="Kondisi buku (misal: Baik, Rapih)..."
                    value={kembaliForm.catatan}
                    onChange={(e) => setKembaliForm({ ...kembaliForm, catatan: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowKembaliModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" style={{ background: '#059669', borderColor: '#059669' }} disabled={submittingKembali}>
                  {submittingKembali ? 'Memproses...' : 'Konfirmasi Pengembalian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
