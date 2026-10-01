import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Building2, Box, Layers, Plus, Search, Edit2, Trash2,
  RefreshCw, CheckCircle2, AlertTriangle, XCircle, Printer, X, Check
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

export default function AdminSaprasTab() {
  const [activeSubTab, setActiveSubTab] = useState('fasilitas'); // 'fasilitas' | 'sarana' | 'tanah'
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

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [modalType, setModalType] = useState('fasilitas'); // 'fasilitas' | 'sarana' | 'tanah'
  const [submitting, setSubmitting] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sapras/summary');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Gagal memuat data sapras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset pagination on sub-tab or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, search, filterKondisi]);

  // Filtered lists
  const filteredFasilitas = useMemo(() => {
    return (data.fasilitas || []).filter(item => {
      const matchSearch = (item.fasilitas || '').toLowerCase().includes(search.toLowerCase());
      const matchKondisi =
        filterKondisi === 'ALL' ||
        (item.keterangan || '').toUpperCase() === filterKondisi.toUpperCase();
      return matchSearch && matchKondisi;
    });
  }, [data.fasilitas, search, filterKondisi]);

  const filteredSarana = useMemo(() => {
    return (data.sarana || []).filter(item => {
      const matchSearch = (item.jenis_sapras || '').toLowerCase().includes(search.toLowerCase());
      if (filterKondisi === 'RUSAK') {
        return matchSearch && (parseInt(item.rusak, 10) || 0) > 0;
      }
      if (filterKondisi === 'BAIK') {
        return matchSearch && (parseInt(item.baik, 10) || 0) > 0;
      }
      return matchSearch;
    });
  }, [data.sarana, search, filterKondisi]);

  const filteredTanah = useMemo(() => {
    return (data.tanah || []).filter(item => {
      return (item.penggunaan_tanah || '').toLowerCase().includes(search.toLowerCase());
    });
  }, [data.tanah, search]);

  // Current list for active sub tab
  const currentList = activeSubTab === 'fasilitas'
    ? filteredFasilitas
    : activeSubTab === 'sarana'
    ? filteredSarana
    : filteredTanah;

  const paginatedList = currentList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Modal Open
  const handleOpenAdd = () => {
    setModalType(activeSubTab);
    setIsEditing(false);
    setCurrentId(null);
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
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setModalType(activeSubTab);
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      no_urut: item.no_urut || '',
      fasilitas: item.fasilitas || '',
      jumlah: item.jumlah || 1,
      keterangan: item.keterangan || 'BAIK',
      jenis_sapras: item.jenis_sapras || '',
      baik: item.baik !== undefined ? item.baik : item.jumlah || 1,
      rusak: item.rusak || 0,
      penggunaan_tanah: item.penggunaan_tanah || '',
      luas_tanah: item.luas_tanah || '',
      satuan: item.satuan || 'M2'
    });
    setShowModal(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalType === 'fasilitas') {
        if (isEditing) {
          await api.put(`/sapras/fasilitas/${currentId}`, formData);
        } else {
          await api.post('/sapras/fasilitas', formData);
        }
      } else if (modalType === 'sarana') {
        if (isEditing) {
          await api.put(`/sapras/sarana/${currentId}`, formData);
        } else {
          await api.post('/sapras/sarana', formData);
        }
      } else if (modalType === 'tanah') {
        if (isEditing) {
          await api.put(`/sapras/tanah/${currentId}`, formData);
        } else {
          await api.post('/sapras/tanah', formData);
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Data ${modalType} berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}.`,
        timer: 1500,
        showConfirmButton: false
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (item) => {
    const itemName = item.fasilitas || item.jenis_sapras || item.penggunaan_tanah;
    const confirm = await Swal.fire({
      title: 'Hapus Data?',
      text: `Apakah Anda yakin ingin menghapus data "${itemName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        if (activeSubTab === 'fasilitas') {
          await api.delete(`/sapras/fasilitas/${item.id}`);
        } else if (activeSubTab === 'sarana') {
          await api.delete(`/sapras/sarana/${item.id}`);
        } else if (activeSubTab === 'tanah') {
          await api.delete(`/sapras/tanah/${item.id}`);
        }
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Data berhasil dihapus.',
          timer: 1200,
          showConfirmButton: false
        });
        fetchData();
      } catch (err) {
        Swal.fire('Gagal Menghapus', err.response?.data?.message || err.message, 'error');
      }
    }
  };

  // Helper status color badge
  const renderKondisiBadge = (keterangan) => {
    const ket = (keterangan || '').toUpperCase();
    if (ket === 'BAIK') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontSize: 11, fontWeight: 700 }}>
          <CheckCircle2 size={12} /> BAIK
        </span>
      );
    }
    if (ket === 'CUKUP BAIK') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', fontSize: 11, fontWeight: 700 }}>
          <CheckCircle2 size={12} /> CUKUP BAIK
        </span>
      );
    }
    if (ket === 'CUKUP') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, background: 'rgba(245, 158, 11, 0.14)', color: '#d97706', fontSize: 11, fontWeight: 700 }}>
          <AlertTriangle size={12} /> CUKUP
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', fontSize: 11, fontWeight: 700 }}>
        <XCircle size={12} /> {ket || 'RUSAK'}
      </span>
    );
  };

  return (
    <div className="admin-tab-container">
      {/* 1. TOP HEADER & METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#0066ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Fasilitas</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{data.fasilitas?.length || 25} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Ruangan</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Sarana & Prasarana</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{data.sarana?.length || 31} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Jenis</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Luas Lahan Sekolah</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{Number(data.stats?.totalLuasTanah || 1032).toLocaleString('id-ID')} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>M²</span></div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Kondisi Sarana Baik</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{data.stats?.totalBaikSarana || 494} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>Unit</span></div>
          </div>
        </div>
      </div>

      {/* 2. SUB-TAB SELECTION & ACTIONS BAR */}
      <div className="admin-header-actions" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
          <button
            type="button"
            onClick={() => { setActiveSubTab('fasilitas'); setFilterKondisi('ALL'); }}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              background: activeSubTab === 'fasilitas' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'fasilitas' ? '#0066ff' : '#64748b',
              fontWeight: activeSubTab === 'fasilitas' ? 800 : 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeSubTab === 'fasilitas' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            🏛️ Fasilitas ({data.fasilitas?.length || 25})
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab('sarana'); setFilterKondisi('ALL'); }}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              background: activeSubTab === 'sarana' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'sarana' ? '#0066ff' : '#64748b',
              fontWeight: activeSubTab === 'sarana' ? 800 : 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeSubTab === 'sarana' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            📦 Sarana & Prasarana ({data.sarana?.length || 31})
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab('tanah'); setFilterKondisi('ALL'); }}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              background: activeSubTab === 'tanah' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'tanah' ? '#0066ff' : '#64748b',
              fontWeight: activeSubTab === 'tanah' ? 800 : 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeSubTab === 'tanah' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            📐 Penggunaan Tanah ({data.tanah?.length || 3})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary-admin"
            onClick={() => window.print()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
          >
            <Printer size={15} /> Cetak Laporan
          </button>

          <button
            type="button"
            className="btn-secondary-admin"
            onClick={fetchData}
            title="Refresh Data"
            style={{ padding: '9px 12px', borderRadius: 10, cursor: 'pointer' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            className="btn-primary-admin"
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 10,
              background: '#0066ff',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Data {activeSubTab === 'fasilitas' ? 'Fasilitas' : activeSubTab === 'sarana' ? 'Sarana' : 'Tanah'}</span>
          </button>
        </div>
      </div>

      {/* 3. FILTER BAR */}
      <div className="admin-filter-bar" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control-admin"
            placeholder={`Cari nama ${activeSubTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, width: '100%', fontSize: 13 }}
          />
        </div>

        {activeSubTab === 'fasilitas' && (
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'BAIK', 'CUKUP BAIK', 'CUKUP'].map((kondisi) => (
              <button
                key={kondisi}
                type="button"
                onClick={() => setFilterKondisi(kondisi)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: filterKondisi === kondisi ? '#0066ff' : '#cbd5e1',
                  background: filterKondisi === kondisi ? '#eff6ff' : '#ffffff',
                  color: filterKondisi === kondisi ? '#0066ff' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {kondisi === 'ALL' ? 'Semua Kondisi' : kondisi}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. TABLE VIEW BY SUB TAB */}
      <div className="portal-table-container">
        {/* SUBTAB 1: FASILITAS */}
        {activeSubTab === 'fasilitas' && (
          <table className="portal-table">
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: 'center' }}>No</th>
                <th>Nama Fasilitas Ruangan / Gedung</th>
                <th style={{ width: 120, textAlign: 'center' }}>Jumlah Unit</th>
                <th style={{ width: 160, textAlign: 'center' }}>Kondisi / Keterangan</th>
                <th style={{ width: 120, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    Tidak ada data fasilitas yang sesuai dengan pencarian
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, index) => (
                  <tr key={item.id || index}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                      {item.no_urut || (currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: '#1e293b' }}>
                        <Building2 size={16} color="#0066ff" />
                        <span>{item.fasilitas}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 8, background: '#f1f5f9' }}>
                        {item.jumlah}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {renderKondisiBadge(item.keterangan)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button className="btn-action-icon btn-edit" title="Edit Fasilitas" onClick={() => handleOpenEdit(item)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus Fasilitas" onClick={() => handleDelete(item)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* SUBTAB 2: SARANA & PRASARANA */}
        {activeSubTab === 'sarana' && (
          <table className="portal-table">
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: 'center' }}>No</th>
                <th>Jenis Sarana & Prasarana</th>
                <th style={{ width: 110, textAlign: 'center' }}>Jumlah Total</th>
                <th style={{ width: 110, textAlign: 'center', color: '#059669' }}>Kondisi Baik</th>
                <th style={{ width: 110, textAlign: 'center', color: '#dc2626' }}>Kondisi Rusak</th>
                <th style={{ width: 120, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    Tidak ada data sarana yang sesuai dengan pencarian
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, index) => (
                  <tr key={item.id || index}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                      {item.no_urut || (currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: '#1e293b' }}>
                        <Box size={16} color="#16a34a" />
                        <span>{item.jenis_sapras}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 8, background: '#f1f5f9' }}>
                        {item.jumlah}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontWeight: 800 }}>
                        {item.baik}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 8, background: (parseInt(item.rusak, 10) || 0) > 0 ? 'rgba(239, 68, 68, 0.15)' : '#f1f5f9', color: (parseInt(item.rusak, 10) || 0) > 0 ? '#dc2626' : '#94a3b8', fontWeight: 800 }}>
                        {item.rusak || 0}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button className="btn-action-icon btn-edit" title="Edit Sarana" onClick={() => handleOpenEdit(item)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus Sarana" onClick={() => handleDelete(item)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* SUBTAB 3: PENGGUNAAN TANAH */}
        {activeSubTab === 'tanah' && (
          <table className="portal-table">
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: 'center' }}>No</th>
                <th>Penggunaan Tanah</th>
                <th style={{ width: 180, textAlign: 'center' }}>Luas Lahan</th>
                <th style={{ width: 140, textAlign: 'center' }}>Persentase</th>
                <th style={{ width: 120, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    Tidak ada data penggunaan tanah
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, index) => {
                  const luas = parseFloat(item.luas_tanah) || 0;
                  const total = parseFloat(data.stats?.totalLuasTanah) || 1032;
                  const pct = ((luas / total) * 100).toFixed(1);

                  return (
                    <tr key={item.id || index}>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                        {item.no_urut || index + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: '#1e293b' }}>
                          <Layers size={16} color="#d97706" />
                          <span>{item.penggunaan_tanah}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                        {Number(item.luas_tanah).toLocaleString('id-ID')} {item.satuan || 'M2'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 8, background: '#eff6ff', color: '#0066ff', fontWeight: 800 }}>
                          {pct}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button className="btn-action-icon btn-edit" title="Edit Tanah" onClick={() => handleOpenEdit(item)}>
                            <Edit2 size={13} />
                          </button>
                          <button className="btn-action-icon btn-delete" title="Hapus Tanah" onClick={() => handleDelete(item)}>
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
        )}

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalItems={currentList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 5. ADD / EDIT MODAL FOR DESKTOP */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 540 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Data ' : 'Tambah Data '}
                {modalType === 'fasilitas' ? 'Fasilitas Ruangan' : modalType === 'sarana' ? 'Sarana & Prasarana' : 'Penggunaan Tanah'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Nomor Urut</label>
                    <input
                      type="number"
                      className="form-control-admin"
                      placeholder="Contoh: 1"
                      value={formData.no_urut}
                      onChange={(e) => setFormData({ ...formData, no_urut: e.target.value })}
                    />
                  </div>

                  {modalType === 'fasilitas' && (
                    <>
                      <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                        <label>Nama Fasilitas Ruangan / Gedung *</label>
                        <input
                          type="text"
                          className="form-control-admin"
                          required
                          placeholder="Contoh: RUANG KBM, LAB KOMPUTER"
                          value={formData.fasilitas}
                          onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="form-group-admin">
                        <label>Jumlah Unit *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="form-control-admin"
                          value={formData.jumlah}
                          onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value, 10) || 1 })}
                        />
                      </div>

                      <div className="form-group-admin">
                        <label>Keterangan / Kondisi</label>
                        <select
                          className="form-control-admin"
                          value={formData.keterangan}
                          onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                        >
                          <option value="BAIK">BAIK</option>
                          <option value="CUKUP BAIK">CUKUP BAIK</option>
                          <option value="CUKUP">CUKUP</option>
                          <option value="RUSAK">RUSAK</option>
                        </select>
                      </div>
                    </>
                  )}

                  {modalType === 'sarana' && (
                    <>
                      <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                        <label>Jenis Sarana & Prasarana *</label>
                        <input
                          type="text"
                          className="form-control-admin"
                          required
                          placeholder="Contoh: KURSI SISWA, LAPTOP, PROYEKTOR"
                          value={formData.jenis_sapras}
                          onChange={(e) => setFormData({ ...formData, jenis_sapras: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                          <div>
                            <label>Jumlah Total *</label>
                            <input
                              type="number"
                              min="1"
                              required
                              className="form-control-admin"
                              value={formData.jumlah}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                setFormData({ ...formData, jumlah: val, baik: val });
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ color: '#059669' }}>Kondisi Baik</label>
                            <input
                              type="number"
                              min="0"
                              className="form-control-admin"
                              value={formData.baik}
                              onChange={(e) => setFormData({ ...formData, baik: parseInt(e.target.value, 10) || 0 })}
                            />
                          </div>
                          <div>
                            <label style={{ color: '#dc2626' }}>Kondisi Rusak</label>
                            <input
                              type="number"
                              min="0"
                              className="form-control-admin"
                              value={formData.rusak}
                              onChange={(e) => setFormData({ ...formData, rusak: parseInt(e.target.value, 10) || 0 })}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {modalType === 'tanah' && (
                    <>
                      <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                        <label>Penggunaan Tanah *</label>
                        <input
                          type="text"
                          className="form-control-admin"
                          required
                          placeholder="Contoh: BANGUNAN, HALAMAN, LAPANGAN OLAHRAGA"
                          value={formData.penggunaan_tanah}
                          onChange={(e) => setFormData({ ...formData, penggunaan_tanah: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="form-group-admin">
                        <label>Luas Lahan *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="form-control-admin"
                          placeholder="Contoh: 702"
                          value={formData.luas_tanah}
                          onChange={(e) => setFormData({ ...formData, luas_tanah: e.target.value })}
                        />
                      </div>

                      <div className="form-group-admin">
                        <label>Satuan</label>
                        <input
                          type="text"
                          className="form-control-admin"
                          value={formData.satuan}
                          onChange={(e) => setFormData({ ...formData, satuan: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-secondary-admin" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
