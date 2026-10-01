import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, Filter, RotateCcw, CheckCircle, Clock,
  AlertTriangle, Book, Tag, MapPin, X, Info, Layers, ChevronRight, Plus
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/client';
import SearchableSelect from '../components/SearchableSelect';

export default function PerpustakaanView({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'peminjaman' | 'aturan'
  const [bukuList, setBukuList] = useState([]);
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Detail Modal State
  const [selectedBook, setSelectedBook] = useState(null);

  // Pinjam Modal State
  const [showPinjamModal, setShowPinjamModal] = useState(false);
  const [pinjamBookTarget, setPinjamBookTarget] = useState(null);
  const [siswaOptions, setSiswaOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [pinjamForm, setPinjamForm] = useState({
    buku_id: '',
    peminjam_type: user?.type === 'Guru' ? 'guru' : 'siswa',
    peminjam_id: user?.kode_guru || user?.kode_siswa || user?.id || '',
    nama_peminjam: user?.nama_guru || user?.nama || user?.name || '',
    kelas_atau_jabatan: user?.kelas || user?.jabatan || '-',
    tgl_pinjam: new Date().toISOString().slice(0, 10),
    tgl_tenggat: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    catatan: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Semua', 'Pelajaran', 'Fiksi', 'Sejarah', 'Sains', 'Teknologi', 'Psikologi', 'Agama', 'Umum'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBuku, resPinjam, resSiswa, resGuru, resKelas] = await Promise.all([
        api.get('/perpustakaan/buku'),
        api.get('/perpustakaan/peminjaman'),
        api.get('/siswa').catch(() => ({ data: { data: [] } })),
        api.get('/guru').catch(() => ({ data: { data: [] } })),
        api.get('/kelas').catch(() => ({ data: { data: [] } }))
      ]);

      if (resBuku.data?.success) setBukuList(resBuku.data.data || []);
      if (resPinjam.data?.success) setPeminjamanList(resPinjam.data.data || []);
      setSiswaOptions(resSiswa.data?.data || []);
      setGuruOptions(resGuru.data?.data || []);
      setKelasList(resKelas.data?.data || []);
    } catch (err) {
      console.error('Error PerpustakaanView fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNamaKelas = (s) => {
    if (!s) return '-';
    if (s.nama_kelas) return s.nama_kelas;
    const kFound = kelasList.find(k => String(k.kode_kelas) === String(s.kode_kelas) || String(k.id) === String(s.kode_kelas));
    if (kFound && kFound.nama_kelas) return kFound.nama_kelas;
    if (s.kelas) return s.kelas;
    return s.kode_kelas ? `Kelas ${s.kode_kelas}` : '-';
  };

  const handleOpenPinjamModal = (buku = null) => {
    const today = new Date();
    const tenggat = new Date(today);
    tenggat.setDate(tenggat.getDate() + 7);

    const bTarget = buku || (bukuList.length > 0 ? bukuList[0] : null);
    setPinjamBookTarget(bTarget);

    setPinjamForm({
      buku_id: bTarget ? bTarget.id : '',
      peminjam_type: user?.type === 'Guru' ? 'guru' : 'siswa',
      peminjam_id: user?.kode_guru || user?.kode_siswa || user?.id || '',
      nama_peminjam: user?.nama_guru || user?.nama || user?.name || '',
      kelas_atau_jabatan: user?.kelas || user?.jabatan || '-',
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
          kelas_atau_jabatan: getNamaKelas(siswa)
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
      Swal.fire('Validasi', 'Mohon lengkapi buku dan data peminjam!', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/perpustakaan/peminjaman', pinjamForm);
      Swal.fire('Berhasil!', 'Permohonan peminjaman buku berhasil dicatat.', 'success');
      setShowPinjamModal(false);
      setSelectedBook(null);
      fetchData();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Gagal memproses peminjaman.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering list
  const filteredBuku = bukuList.filter(b => {
    const matchSearch = (b.judul || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (b.pengarang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (b.kode_buku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (b.isbn || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'Semua' || b.kategori === selectedCategory;
    return matchSearch && matchCat;
  });

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Pelajaran': return { bg: '#e0f2fe', color: '#0369a1' };
      case 'Fiksi': return { bg: '#fce7f3', color: '#be185d' };
      case 'Sejarah': return { bg: '#fef3c7', color: '#b45309' };
      case 'Sains': return { bg: '#dcfce7', color: '#15803d' };
      case 'Teknologi': return { bg: '#ede9fe', color: '#6d28d9' };
      case 'Psikologi': return { bg: '#ffedd5', color: '#c2410c' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className="mobile-view-container" style={{ padding: '16px 16px 95px 16px', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* ----------------- SEARCH & CATEGORY SELECT FILTER ----------------- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 135px', gap: 10, marginBottom: 16 }}>
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Cari judul, pengarang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 12,
              border: '1px solid #cbd5e1',
              fontSize: 12.5,
              background: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Category Select Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 10px',
            borderRadius: 12,
            border: '1px solid #cbd5e1',
            fontSize: 12,
            fontWeight: 700,
            background: '#ffffff',
            color: '#0284c7',
            outline: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'Semua' ? 'Semua Kategori' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* ----------------- SUB-TAB NAVIGATION ----------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 6,
        background: '#f1f5f9',
        padding: 5,
        borderRadius: 14,
        marginBottom: 20
      }}>
        <button
          onClick={() => setActiveTab('katalog')}
          style={{
            background: activeTab === 'katalog' ? '#ffffff' : 'transparent',
            color: activeTab === 'katalog' ? '#0284c7' : '#64748b',
            border: 'none',
            padding: '8px 6px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: activeTab === 'katalog' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Katalog ({bukuList.length})
        </button>
        <button
          onClick={() => setActiveTab('peminjaman')}
          style={{
            background: activeTab === 'peminjaman' ? '#ffffff' : 'transparent',
            color: activeTab === 'peminjaman' ? '#0284c7' : '#64748b',
            border: 'none',
            padding: '8px 6px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: activeTab === 'peminjaman' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Peminjaman ({peminjamanList.length})
        </button>
        <button
          onClick={() => setActiveTab('aturan')}
          style={{
            background: activeTab === 'aturan' ? '#ffffff' : 'transparent',
            color: activeTab === 'aturan' ? '#0284c7' : '#64748b',
            border: 'none',
            padding: '8px 6px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: activeTab === 'aturan' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          Info & Denda
        </button>
      </div>

      {/* ======================================================================== */}
      {/* TAB 1: KATALOG BUKU MOBILE                                              */}
      {/* ======================================================================== */}
      {activeTab === 'katalog' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 13 }}>
              Memuat katalog buku...
            </div>
          ) : filteredBuku.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <BookOpen size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Koleksi Tidak Ditemukan</div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>Tidak ada buku yang sesuai dengan pencarian atau kategori ini.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredBuku.map((buku) => {
                const catColor = getCategoryColor(buku.kategori);
                const isAvailable = buku.tersedia > 0;
                return (
                  <div
                    key={buku.id}
                    onClick={() => setSelectedBook(buku)}
                    style={{
                      background: '#ffffff',
                      borderRadius: 16,
                      padding: 14,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      display: 'flex',
                      gap: 12,
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {/* Fake Book Cover / Icon */}
                    <div style={{
                      width: 54,
                      height: 72,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #0284c7, #0f172a)',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)',
                      padding: 4,
                      textAlign: 'center'
                    }}>
                      <Book size={20} />
                      <span style={{ fontSize: 8, fontWeight: 800, marginTop: 4, opacity: 0.9 }}>{buku.kode_buku}</span>
                    </div>

                    {/* Book Info Column */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, background: catColor.bg, color: catColor.color, padding: '2px 6px', borderRadius: 6 }}>
                          {buku.kategori}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: isAvailable ? '#059669' : '#dc2626' }}>
                          {isAvailable ? `${buku.tersedia} Tersedia` : 'Stok Habis'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {buku.judul}
                      </h4>
                      <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>
                        Penulis: {buku.pengarang}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#0284c7', fontWeight: 700 }}>
                          <MapPin size={12} /> {buku.lokasi_rak || 'Rak A-1'}
                        </span>
                        <span>•</span>
                        <span>{buku.penerbit || 'Erlangga'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================================== */}
      {/* TAB 2: TRANSAKSI PEMINJAMAN MOBILE                                      */}
      {/* ======================================================================== */}
      {activeTab === 'peminjaman' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 13 }}>
              Memuat data peminjaman...
            </div>
          ) : peminjamanList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <RotateCcw size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Belum Ada Peminjaman</div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>Belum ada catatan peminjaman buku yang aktif.</p>
            </div>
          ) : (
            peminjamanList.map((tx) => {
              const isDipinjam = tx.status === 'Dipinjam';
              const isTerlambat = isDipinjam && new Date(tx.tgl_tenggat) < new Date(new Date().toISOString().slice(0, 10));

              return (
                <div
                  key={tx.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 14,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7' }}>{tx.kode_transaksi}</span>
                    {tx.status === 'Dikembalikan' ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 8 }}>
                        Dikembalikan
                      </span>
                    ) : isTerlambat ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: 8 }}>
                        Terlambat
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: '#eff6ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: 8 }}>
                        Dipinjam
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                    {tx.judul_buku}
                  </h4>
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 8 }}>
                    Peminjam: <span style={{ color: '#0f172a' }}>{tx.nama_peminjam}</span> ({tx.kelas_atau_jabatan})
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 10, fontSize: 11.5, display: 'flex', justifyContent: 'space-between', border: '1px solid #f1f5f9' }}>
                    <span>Tgl Pinjam: <strong>{tx.tgl_pinjam}</strong></span>
                    <span>Tenggat: <strong style={{ color: isTerlambat ? '#dc2626' : '#0284c7' }}>{tx.tgl_tenggat}</strong></span>
                  </div>

                  {tx.denda > 0 && (
                    <div style={{ marginTop: 8, background: '#fef2f2', color: '#dc2626', padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Denda Keterlambatan:</span>
                      <span>Rp {parseInt(tx.denda, 10).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================================== */}
      {/* TAB 3: INFO & ATURAN PEMINJAMAN                                         */}
      {/* ======================================================================== */}
      {activeTab === 'aturan' && (
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#e0f2fe', padding: 8, borderRadius: 10 }}>
              <Info size={20} color="#0284c7" />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: '#0f172a' }}>Syarat & Ketentuan Perpustakaan</h4>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Ketentuan peminjaman buku SMK Artanita</p>
            </div>
          </div>

          <div style={{ background: '#eff6ff', padding: 12, borderRadius: 12, border: '1px solid #bae6fd', fontSize: 12, color: '#1e40af', lineHeight: 1.6 }}>
            <strong>1. Durasi Peminjaman:</strong><br />
            Masa pinjam buku adalah <strong>7 Hari Kalender</strong> sejak tanggal transaksi dilakukan.
          </div>

          <div style={{ background: '#fffbeb', padding: 12, borderRadius: 12, border: '1px solid #fde68a', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
            <strong>2. Denda Keterlambatan:</strong><br />
            Pengembalian yang melebihi batas tenggat dikenakan denda otomatis <strong>Rp 1.000 / hari</strong>.
          </div>

          <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 12, border: '1px solid #a7f3d0', fontSize: 12, color: '#065f46', lineHeight: 1.6 }}>
            <strong>3. Perawatan Buku:</strong><br />
            Peminjam wajib merawat fisik buku dan mengembalikan dalam keadaan rapi. Kerusakan/kehilangan buku menjadi tanggung jawab peminjam.
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL / DRAWER DETAIL BUKU                                              */}
      {/* ======================================================================== */}
      {selectedBook && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 440, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: 6 }}>
                {selectedBook.kode_buku}
              </span>
              <button onClick={() => setSelectedBook(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.4 }}>
              {selectedBook.judul}
            </h3>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 14 }}>
              Penulis: <span style={{ color: '#334155' }}>{selectedBook.pengarang}</span>
            </div>

            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Kategori:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedBook.kategori}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Lokasi Rak:</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>{selectedBook.lokasi_rak || 'Rak A-1'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Penerbit / Thn:</span>
                <span style={{ fontWeight: 700 }}>{selectedBook.penerbit || '-'} ({selectedBook.tahun_terbit || '-'})</span>
              </div>
              {selectedBook.isbn && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>ISBN:</span>
                  <span style={{ fontWeight: 700 }}>{selectedBook.isbn}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>
                <span style={{ color: '#64748b' }}>Stok Tersedia:</span>
                <span style={{ fontWeight: 800, color: selectedBook.tersedia > 0 ? '#059669' : '#dc2626' }}>
                  {selectedBook.tersedia} dari {selectedBook.stok} Eksemplar
                </span>
              </div>
            </div>

            {selectedBook.deskripsi && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>SINOPSIS / DESKRIPSI:</div>
                <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, margin: 0 }}>{selectedBook.deskripsi}</p>
              </div>
            )}

            <button
              onClick={() => {
                const b = selectedBook;
                setSelectedBook(null);
                handleOpenPinjamModal(b);
              }}
              disabled={selectedBook.tersedia < 1}
              style={{
                width: '100%',
                background: selectedBook.tersedia > 0 ? '#0284c7' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                padding: 12,
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                cursor: selectedBook.tersedia > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <RotateCcw size={16} /> {selectedBook.tersedia > 0 ? 'Ajukan Peminjaman Buku Ini' : 'Stok Habis'}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL FORM PEMINJAMAN BUKU                                              */}
      {/* ======================================================================== */}
      {showPinjamModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 480, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={18} color="#0284c7" /> Form Peminjaman Buku
              </h3>
              <button onClick={() => setShowPinjamModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPinjam}>
              <div className="form-group-admin" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>Pilih Buku * (Ketik untuk mencari)</label>
                <SearchableSelect
                  placeholder="-- Cari judul/kode buku --"
                  value={pinjamForm.buku_id}
                  onChange={(e) => setPinjamForm({ ...pinjamForm, buku_id: e.target.value })}
                  options={bukuList.map(b => ({
                    value: b.id,
                    label: `${b.kode_buku} - ${b.judul}`,
                    sublabel: b.tersedia > 0 ? `Tersedia: ${b.tersedia} | Rak: ${b.lokasi_rak || 'A-1'}` : '⚠️ Stok Habis'
                  }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 12 }}>
                <div className="form-group-admin">
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>Tipe *</label>
                  <select
                    className="form-control-admin"
                    style={{ fontSize: 12 }}
                    value={pinjamForm.peminjam_type}
                    onChange={(e) => setPinjamForm({ ...pinjamForm, peminjam_type: e.target.value, peminjam_id: '', nama_peminjam: '', kelas_atau_jabatan: '' })}
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                  </select>
                </div>

                <div className="form-group-admin">
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>Pilih Peminjam *</label>
                  <SearchableSelect
                    placeholder={`-- Pilih ${pinjamForm.peminjam_type === 'siswa' ? 'Siswa' : 'Guru'} --`}
                    value={pinjamForm.peminjam_id}
                    onChange={(e) => handleSelectPeminjamUser(e.target.value)}
                    options={pinjamForm.peminjam_type === 'siswa' ? (
                      siswaOptions.map(s => ({
                        value: s.kode_siswa || s.id,
                        label: `${s.nama_siswa || s.nama} (NIS: ${s.nis || s.nis_nisn || '-'})`,
                        sublabel: `Kelas: ${getNamaKelas(s)}`
                      }))
                    ) : (
                      guruOptions.map(g => ({
                        value: g.kode_guru || g.id,
                        label: `${g.nama_guru || g.nama} (NIP: ${g.nip || '-'})`,
                        sublabel: `Jabatan: ${g.jabatan || 'Guru'}`
                      }))
                    )}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div className="form-group-admin">
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>Tgl Pinjam</label>
                  <input
                    type="date"
                    className="form-control-admin"
                    style={{ fontSize: 12 }}
                    required
                    value={pinjamForm.tgl_pinjam}
                    onChange={(e) => setPinjamForm({ ...pinjamForm, tgl_pinjam: e.target.value })}
                  />
                </div>
                <div className="form-group-admin">
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>Tenggat Kembali</label>
                  <input
                    type="date"
                    className="form-control-admin"
                    style={{ fontSize: 12 }}
                    required
                    value={pinjamForm.tgl_tenggat}
                    onChange={(e) => setPinjamForm({ ...pinjamForm, tgl_tenggat: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer" style={{ padding: '12px 0 0 0' }}>
                <button type="button" className="btn-outline-admin" onClick={() => setShowPinjamModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Memproses...' : 'Kirim Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
