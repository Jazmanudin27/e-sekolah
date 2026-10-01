import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Box,
  Layers,
  Search,
  Plus,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Filter,
  Edit2,
  Trash2,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import api from '../api/client';

export default function SaprasView({ user, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('fasilitas'); // 'fasilitas' | 'sarana' | 'tanah'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    fasilitas: [],
    sarana: [],
    tanah: [],
    stats: {
      totalFasilitas: 25,
      totalUnitFasilitas: 45,
      fasilitasKondisi: { baik: 14, cukupBaik: 10, cukup: 1, rusak: 0 },
      totalJenisSarana: 31,
      totalUnitSarana: 494,
      totalBaikSarana: 494,
      totalRusakSarana: 0,
      totalLuasTanah: 1032
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('fasilitas'); // 'fasilitas' | 'sarana' | 'tanah'
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    no_urut: '',
    fasilitas: '',
    jumlah: 1,
    keterangan: 'BAIK',
    jenis_sapras: '',
    baik: 1,
    rusak: 0,
    penggunaan_tanah: '',
    luas_tanah: '',
    satuan: 'M2'
  });

  const canManage = user?.role === 'admin' || user?.role === 'kepsek' || user?.type === 'Admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sapras/summary');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Gagal load sapras dari API, menggunakan data offline fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered lists
  const filteredFasilitas = useMemo(() => {
    return (data.fasilitas || []).filter(item => {
      const matchSearch = (item.fasilitas || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchKondisi =
        filterKondisi === 'ALL' ||
        (item.keterangan || '').toUpperCase() === filterKondisi.toUpperCase();
      return matchSearch && matchKondisi;
    });
  }, [data.fasilitas, searchTerm, filterKondisi]);

  const filteredSarana = useMemo(() => {
    return (data.sarana || []).filter(item => {
      const matchSearch = (item.jenis_sapras || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (filterKondisi === 'RUSAK') {
        return matchSearch && (parseInt(item.rusak, 10) || 0) > 0;
      }
      if (filterKondisi === 'BAIK') {
        return matchSearch && (parseInt(item.baik, 10) || 0) > 0;
      }
      return matchSearch;
    });
  }, [data.sarana, searchTerm, filterKondisi]);

  const filteredTanah = useMemo(() => {
    return (data.tanah || []).filter(item => {
      return (item.penggunaan_tanah || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data.tanah, searchTerm]);

  // Open Modal for Add
  const handleOpenAdd = (type) => {
    setModalType(type);
    setEditItem(null);
    setFormData({
      no_urut: '',
      fasilitas: '',
      jumlah: 1,
      keterangan: 'BAIK',
      jenis_sapras: '',
      baik: 1,
      rusak: 0,
      penggunaan_tanah: '',
      luas_tanah: '',
      satuan: 'M2'
    });
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (type, item) => {
    setModalType(type);
    setEditItem(item);
    setFormData({
      no_urut: item.no_urut || '',
      fasilitas: item.fasilitas || '',
      jumlah: item.jumlah || 1,
      keterangan: item.keterangan || 'BAIK',
      jenis_sapras: item.jenis_sapras || '',
      baik: item.baik || 0,
      rusak: item.rusak || 0,
      penggunaan_tanah: item.penggunaan_tanah || '',
      luas_tanah: item.luas_tanah || '',
      satuan: item.satuan || 'M2'
    });
    setModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'fasilitas') {
        if (editItem) {
          await api.put(`/sapras/fasilitas/${editItem.id}`, formData);
          showToast?.('Fasilitas berhasil diperbarui');
        } else {
          await api.post('/sapras/fasilitas', formData);
          showToast?.('Fasilitas baru berhasil ditambahkan');
        }
      } else if (modalType === 'sarana') {
        if (editItem) {
          await api.put(`/sapras/sarana/${editItem.id}`, formData);
          showToast?.('Sarana berhasil diperbarui');
        } else {
          await api.post('/sapras/sarana', formData);
          showToast?.('Sarana baru berhasil ditambahkan');
        }
      } else if (modalType === 'tanah') {
        if (editItem) {
          await api.put(`/sapras/tanah/${editItem.id}`, formData);
          showToast?.('Data tanah berhasil diperbarui');
        } else {
          await api.post('/sapras/tanah', formData);
          showToast?.('Data tanah baru berhasil ditambahkan');
        }
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.message || err.message, false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (type, item) => {
    if (!window.confirm(`Yakin ingin menghapus data ${item.fasilitas || item.jenis_sapras || item.penggunaan_tanah}?`)) {
      return;
    }
    try {
      if (type === 'fasilitas') {
        await api.delete(`/sapras/fasilitas/${item.id}`);
      } else if (type === 'sarana') {
        await api.delete(`/sapras/sarana/${item.id}`);
      } else if (type === 'tanah') {
        await api.delete(`/sapras/tanah/${item.id}`);
      }
      showToast?.('Data berhasil dihapus');
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.message || err.message, false);
    }
  };

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Helper status color badge
  const renderKondisiBadge = (keterangan) => {
    const ket = (keterangan || '').toUpperCase();
    if (ket === 'BAIK') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 9px',
          borderRadius: 20,
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#059669',
          fontSize: 11.5,
          fontWeight: 700,
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}>
          <CheckCircle2 size={13} strokeWidth={2.5} />
          BAIK
        </span>
      );
    }
    if (ket === 'CUKUP BAIK') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 9px',
          borderRadius: 20,
          background: 'rgba(2, 132, 199, 0.12)',
          color: '#0284c7',
          fontSize: 11.5,
          fontWeight: 700,
          border: '1px solid rgba(2, 132, 199, 0.25)'
        }}>
          <CheckCircle2 size={13} strokeWidth={2.5} />
          CUKUP BAIK
        </span>
      );
    }
    if (ket === 'CUKUP') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 9px',
          borderRadius: 20,
          background: 'rgba(245, 158, 11, 0.14)',
          color: '#d97706',
          fontSize: 11.5,
          fontWeight: 700,
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <AlertTriangle size={13} strokeWidth={2.5} />
          CUKUP
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 9px',
        borderRadius: 20,
        background: 'rgba(239, 68, 68, 0.12)',
        color: '#dc2626',
        fontSize: 11.5,
        fontWeight: 700,
        border: '1px solid rgba(239, 68, 68, 0.25)'
      }}>
        <XCircle size={13} strokeWidth={2.5} />
        {ket || 'RUSAK'}
      </span>
    );
  };

  return (
    <div className="sapras-view-container" style={{ padding: '16px 14px 80px', maxWidth: 1000, margin: '0 auto' }}>
      
      {/* 1. TOP METRICS DASHBOARD CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 20
      }}>
        {/* Card 1: Fasilitas */}
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: 18,
          padding: '14px 16px',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(2, 132, 199, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Fasilitas Ruangan</span>
            <Building2 size={20} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
              {data.fasilitas?.length || 25}
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
              Total {data.stats?.totalUnitFasilitas || 45} Unit Ruang
            </div>
          </div>
        </div>

        {/* Card 2: Sarana */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: 18,
          padding: '14px 16px',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(37, 99, 235, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Sarana & Prasarana</span>
            <Box size={20} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
              {data.sarana?.length || 31}
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
              Total {data.stats?.totalUnitSarana || 494} Item/Alat
            </div>
          </div>
        </div>

        {/* Card 3: Tanah */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: 18,
          padding: '14px 16px',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(5, 150, 105, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Luas Lahan Tanah</span>
            <Layers size={20} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>
              {Number(data.stats?.totalLuasTanah || 1032).toLocaleString('id-ID')} M²
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
              Bangunan, Halaman & Lapang
            </div>
          </div>
        </div>

        {/* Card 4: Kondisi */}
        <div style={{
          background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          borderRadius: 18,
          padding: '14px 16px',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(234, 88, 12, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Kondisi Aset</span>
            <TrendingUp size={20} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
              100%
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>
              Siap Digunakan KBM
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-TAB SELECTION BUTTONS */}
      <div style={{
        display: 'flex',
        background: '#f1f5f9',
        padding: 5,
        borderRadius: 16,
        marginBottom: 16,
        gap: 6
      }}>
        <button
          type="button"
          onClick={() => { setActiveSubTab('fasilitas'); setFilterKondisi('ALL'); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: activeSubTab === 'fasilitas' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'fasilitas' ? '#0066ff' : '#64748b',
            fontWeight: activeSubTab === 'fasilitas' ? 800 : 600,
            fontSize: 13,
            boxShadow: activeSubTab === 'fasilitas' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Building2 size={16} />
          <span>Fasilitas ({data.fasilitas?.length || 25})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('sarana'); setFilterKondisi('ALL'); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: activeSubTab === 'sarana' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'sarana' ? '#0066ff' : '#64748b',
            fontWeight: activeSubTab === 'sarana' ? 800 : 600,
            fontSize: 13,
            boxShadow: activeSubTab === 'sarana' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Box size={16} />
          <span>Sarana & Prasarana ({data.sarana?.length || 31})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('tanah'); setFilterKondisi('ALL'); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: activeSubTab === 'tanah' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'tanah' ? '#0066ff' : '#64748b',
            fontWeight: activeSubTab === 'tanah' ? 800 : 600,
            fontSize: 13,
            boxShadow: activeSubTab === 'tanah' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Layers size={16} />
          <span>Tanah ({data.tanah?.length || 3})</span>
        </button>
      </div>

      {/* 3. TOOLBAR (SEARCH, FILTER & ACTION BUTTONS) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        {/* Search input */}
        <div style={{
          position: 'relative',
          flex: '1 1 200px',
          minWidth: 180
        }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={`Cari nama ${activeSubTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: 14,
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 13,
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Filter kondisi (khusus fasilitas & sarana) */}
        {activeSubTab === 'fasilitas' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ALL', 'BAIK', 'CUKUP BAIK', 'CUKUP'].map((kondisi) => (
              <button
                key={kondisi}
                type="button"
                onClick={() => setFilterKondisi(kondisi)}
                style={{
                  padding: '7px 11px',
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: filterKondisi === kondisi ? '#0066ff' : '#e2e8f0',
                  background: filterKondisi === kondisi ? '#eff6ff' : '#ffffff',
                  color: filterKondisi === kondisi ? '#0066ff' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {kondisi === 'ALL' ? 'Semua' : kondisi}
              </button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={handlePrint}
            title="Cetak Laporan Sarpras"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 13px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Printer size={15} />
            <span>Cetak</span>
          </button>

          <button
            type="button"
            onClick={fetchData}
            title="Segarkan data"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdd(activeSubTab)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 102, 255, 0.28)'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA (BY SUB-TAB) */}

      {/* TAB 1: FASILITAS */}
      {activeSubTab === 'fasilitas' && (
        <div style={{ background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                Fasilitas Ruangan & Gedung
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
                Daftar ketersediaan dan status kelayakan fasilitas fisik sekolah
              </p>
            </div>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 10
            }}>
              {filteredFasilitas.length} Ruangan
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 14px', width: 50, textAlign: 'center', fontWeight: 800 }}>No</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800 }}>Fasilitas Ruangan</th>
                  <th style={{ padding: '12px 14px', width: 90, textAlign: 'center', fontWeight: 800 }}>Jumlah</th>
                  <th style={{ padding: '12px 14px', width: 140, textAlign: 'center', fontWeight: 800 }}>Keterangan</th>
                  <th style={{ padding: '12px 14px', width: 100, textAlign: 'center', fontWeight: 800 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredFasilitas.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                      Tidak ada fasilitas yang sesuai dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filteredFasilitas.map((item, index) => (
                    <tr
                      key={item.id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                        {item.no_urut || index + 1}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: '#eff6ff',
                            color: '#0066ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Building2 size={16} />
                          </div>
                          <span>{item.fasilitas}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: '#f1f5f9'
                        }}>
                          {item.jumlah}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {renderKondisiBadge(item.keterangan)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit('fasilitas', item)}
                            style={{
                              border: 'none',
                              background: '#f1f5f9',
                              color: '#0284c7',
                              padding: 6,
                              borderRadius: 8,
                              cursor: 'pointer'
                            }}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('fasilitas', item)}
                            style={{
                              border: 'none',
                              background: '#fef2f2',
                              color: '#dc2626',
                              padding: 6,
                              borderRadius: 8,
                              cursor: 'pointer'
                            }}
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SARANA & PRASARANA */}
      {activeSubTab === 'sarana' && (
        <div style={{ background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                Sarana & Prasarana Sekolah
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
                Inventaris barang, perlengkapan KBM, peralatan TIK, olahraga & kantor
              </p>
            </div>
            <span style={{
              background: '#dbeafe',
              color: '#1d4ed8',
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 10
            }}>
              {filteredSarana.length} Jenis Sarana
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 14px', width: 50, textAlign: 'center', fontWeight: 800 }}>No</th>
                  <th style={{ padding: '12px 14px', fontWeight: 800 }}>Jenis Sarana / Perlengkapan</th>
                  <th style={{ padding: '12px 14px', width: 90, textAlign: 'center', fontWeight: 800 }}>Jumlah</th>
                  <th style={{ padding: '12px 14px', width: 90, textAlign: 'center', fontWeight: 800, color: '#059669' }}>Baik</th>
                  <th style={{ padding: '12px 14px', width: 90, textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>Rusak</th>
                  <th style={{ padding: '12px 14px', width: 100, textAlign: 'center', fontWeight: 800 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSarana.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                      Tidak ada data sarana yang sesuai dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filteredSarana.map((item, index) => (
                    <tr
                      key={item.id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                        {item.no_urut || index + 1}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: '#f0fdf4',
                            color: '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Box size={16} />
                          </div>
                          <span>{item.jenis_sapras}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: '#f1f5f9'
                        }}>
                          {item.jumlah}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#059669',
                          fontWeight: 800
                        }}>
                          {item.baik}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: (parseInt(item.rusak, 10) || 0) > 0 ? 'rgba(239, 68, 68, 0.15)' : '#f1f5f9',
                          color: (parseInt(item.rusak, 10) || 0) > 0 ? '#dc2626' : '#94a3b8',
                          fontWeight: 800
                        }}>
                          {item.rusak || 0}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit('sarana', item)}
                            style={{
                              border: 'none',
                              background: '#f1f5f9',
                              color: '#0284c7',
                              padding: 6,
                              borderRadius: 8,
                              cursor: 'pointer'
                            }}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('sarana', item)}
                            style={{
                              border: 'none',
                              background: '#fef2f2',
                              color: '#dc2626',
                              padding: 6,
                              borderRadius: 8,
                              cursor: 'pointer'
                            }}
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PENGGUNAAN TANAH */}
      {activeSubTab === 'tanah' && (
        <div>
          {/* Visual Distribution Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: 20,
            border: '1px solid #e2e8f0',
            marginBottom: 16,
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                  Distribusi Proporsi Penggunaan Lahan
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                  Total Luas Lahan Sekolah: <strong>1.032 M²</strong>
                </p>
              </div>
              <span style={{
                background: '#dcfce7',
                color: '#15803d',
                fontSize: 12,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 20
              }}>
                100% Terkelola
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div style={{
              display: 'flex',
              height: 24,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#e2e8f0',
              marginBottom: 14
            }}>
              <div style={{ width: '68%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }} title="Bangunan (702 M² - 68%)">
                68%
              </div>
              <div style={{ width: '29%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }} title="Lapangan Olahraga (300 M² - 29%)">
                29%
              </div>
              <div style={{ width: '3%', background: '#f59e0b' }} title="Halaman (30 M² - 3%)"></div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#0284c7' }}></span>
                <span style={{ fontWeight: 600, color: '#334155' }}>Bangunan: 702 M² (68.0%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }}></span>
                <span style={{ fontWeight: 600, color: '#334155' }}>Lapangan Olahraga: 300 M² (29.1%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b' }}></span>
                <span style={{ fontWeight: 600, color: '#334155' }}>Halaman: 30 M² (2.9%)</span>
              </div>
            </div>
          </div>

          {/* Cards Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14
          }}>
            {filteredTanah.map((item, index) => {
              const luas = parseFloat(item.luas_tanah) || 0;
              const total = parseFloat(data.stats?.totalLuasTanah) || 1032;
              const pct = ((luas / total) * 100).toFixed(1);
              const colorBg = index === 0 ? '#0284c7' : index === 1 ? '#f59e0b' : '#10b981';

              return (
                <div
                  key={item.id || index}
                  style={{
                    background: '#ffffff',
                    borderRadius: 18,
                    padding: 18,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: `${colorBg}15`,
                        color: colorBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800
                      }}>
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                          NO. {item.no_urut || index + 1}
                        </div>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                          {item.penggunaan_tanah}
                        </h4>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit('tanah', item)}
                        style={{ border: 'none', background: '#f1f5f9', color: '#0284c7', padding: 6, borderRadius: 8, cursor: 'pointer' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem('tanah', item)}
                        style={{ border: 'none', background: '#fef2f2', color: '#dc2626', padding: 6, borderRadius: 8, cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{
                    marginTop: 16,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Luas Area</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                        {Number(item.luas_tanah).toLocaleString('id-ID')} {item.satuan || 'M2'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Persentase</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: colorBg, marginTop: 2 }}>
                        {pct}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MODAL FORM TAMBAH / EDIT */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 22,
            width: '100%',
            maxWidth: 480,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'fadeInUpCard 0.25s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fafafa'
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                {editItem ? 'Edit Data ' : 'Tambah Data '}
                {modalType === 'fasilitas' ? 'Fasilitas' : modalType === 'sarana' ? 'Sarana & Prasarana' : 'Penggunaan Tanah'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                {/* No Urut */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                    Nomor Urut
                  </label>
                  <input
                    type="number"
                    value={formData.no_urut}
                    onChange={(e) => setFormData({ ...formData, no_urut: e.target.value })}
                    placeholder="Contoh: 1"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Form Fields: Fasilitas */}
                {modalType === 'fasilitas' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                        Nama Fasilitas Ruangan / Gedung *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fasilitas}
                        onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value.toUpperCase() })}
                        placeholder="Contoh: RUANG KBM, LAB KOMPUTER"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                          Jumlah Unit
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.jumlah}
                          onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value, 10) || 1 })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 13,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                          Keterangan / Kondisi
                        </label>
                        <select
                          value={formData.keterangan}
                          onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 13,
                            background: '#ffffff',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="BAIK">BAIK</option>
                          <option value="CUKUP BAIK">CUKUP BAIK</option>
                          <option value="CUKUP">CUKUP</option>
                          <option value="RUSAK">RUSAK</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Form Fields: Sarana */}
                {modalType === 'sarana' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                        Jenis Sarana & Prasarana *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.jenis_sapras}
                        onChange={(e) => setFormData({ ...formData, jenis_sapras: e.target.value.toUpperCase() })}
                        placeholder="Contoh: KURSI SISWA, LAPTOP, PROYEKTOR"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                          Jumlah Total
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.jumlah}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 1;
                            setFormData({ ...formData, jumlah: val, baik: val });
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 13,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 5 }}>
                          Kondisi Baik
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.baik}
                          onChange={(e) => setFormData({ ...formData, baik: parseInt(e.target.value, 10) || 0 })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 13,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 5 }}>
                          Kondisi Rusak
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.rusak}
                          onChange={(e) => setFormData({ ...formData, rusak: parseInt(e.target.value, 10) || 0 })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 13,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Form Fields: Tanah */}
                {modalType === 'tanah' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                        Penggunaan Tanah *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.penggunaan_tanah}
                        onChange={(e) => setFormData({ ...formData, penggunaan_tanah: e.target.value.toUpperCase() })}
                        placeholder="Contoh: BANGUNAN, HALAMAN, LAPANGAN"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                          Luas Tanah
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.luas_tanah}
                          onChange={(e) => setFormData({ ...formData, luas_tanah: e.target.value })}
                          placeholder="Contoh: 702"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 13,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5 }}>
                          Satuan
                        </label>
                        <input
                          type="text"
                          value={formData.satuan}
                          onChange={(e) => setFormData({ ...formData, satuan: e.target.value.toUpperCase() })}
                          placeholder="M2"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1.5px solid #cbd5e1',
                            fontSize: 13,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)'
                  }}
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT-ONLY OFFICIAL HEADER */}
      <div className="sapras-print-header" style={{ display: 'none' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 18 }}>LAPORAN SARANA & PRASARANA SEKOLAH</h2>
        <p style={{ textAlign: 'center', margin: 0, fontSize: 12, color: '#666' }}>Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
      </div>

    </div>
  );
}
