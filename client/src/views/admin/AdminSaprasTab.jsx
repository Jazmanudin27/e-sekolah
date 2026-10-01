import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, RefreshCw, X, Building2, Box, Layers, CheckCircle2, AlertTriangle, XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

export default function AdminSaprasTab() {
  const [activeSubTab, setActiveSubTab] = useState('fasilitas'); // 'fasilitas' | 'sarana' | 'tanah'
  const [data, setData] = useState({
    fasilitas: [],
    sarana: [],
    tanah: []
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, search, filterKondisi]);

  // Filtered lists
  const filteredFasilitas = useMemo(() => {
    return (data.fasilitas || []).filter(item => {
      const matchSearch = (item.fasilitas || '').toLowerCase().includes(search.toLowerCase());
      const matchKondisi = filterKondisi === 'ALL' || (item.keterangan || '').toUpperCase() === filterKondisi.toUpperCase();
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

  const currentList = activeSubTab === 'fasilitas'
    ? filteredFasilitas
    : activeSubTab === 'sarana'
    ? filteredSarana
    : filteredTanah;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = currentList.slice(startIndex, startIndex + itemsPerPage);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      no_urut: currentList.length + 1,
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

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
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
      if (activeSubTab === 'fasilitas') {
        if (isEditing) {
          await api.put(`/sapras/fasilitas/${currentId}`, formData);
          Swal.fire('Berhasil!', 'Data fasilitas berhasil diperbarui.', 'success');
        } else {
          await api.post('/sapras/fasilitas', formData);
          Swal.fire('Berhasil!', 'Data fasilitas baru berhasil ditambahkan.', 'success');
        }
      } else if (activeSubTab === 'sarana') {
        if (isEditing) {
          await api.put(`/sapras/sarana/${currentId}`, formData);
          Swal.fire('Berhasil!', 'Data sarana & prasarana berhasil diperbarui.', 'success');
        } else {
          await api.post('/sapras/sarana', formData);
          Swal.fire('Berhasil!', 'Data sarana & prasarana baru berhasil ditambahkan.', 'success');
        }
      } else if (activeSubTab === 'tanah') {
        if (isEditing) {
          await api.put(`/sapras/tanah/${currentId}`, formData);
          Swal.fire('Berhasil!', 'Data penggunaan tanah berhasil diperbarui.', 'success');
        } else {
          await api.post('/sapras/tanah', formData);
          Swal.fire('Berhasil!', 'Data penggunaan tanah baru berhasil ditambahkan.', 'success');
        }
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan data.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (item) => {
    const itemName = item.fasilitas || item.jenis_sapras || item.penggunaan_tanah;
    const confirm = await Swal.fire({
      title: 'Hapus Data?',
      text: `Apakah Anda yakin ingin menghapus "${itemName}"?`,
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
        Swal.fire('Terhapus!', 'Data berhasil dihapus dari sistem.', 'success');
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
        <span style={{
          background: '#ecfdf5',
          color: '#059669',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4
        }}>
          <CheckCircle2 size={12} /> BAIK
        </span>
      );
    }
    if (ket === 'CUKUP BAIK') {
      return (
        <span style={{
          background: '#e0f2fe',
          color: '#0284c7',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4
        }}>
          <CheckCircle2 size={12} /> CUKUP BAIK
        </span>
      );
    }
    if (ket === 'CUKUP') {
      return (
        <span style={{
          background: '#fef3c7',
          color: '#d97706',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4
        }}>
          <AlertTriangle size={12} /> CUKUP
        </span>
      );
    }
    return (
      <span style={{
        background: '#fef2f2',
        color: '#dc2626',
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 800,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4
      }}>
        <XCircle size={12} /> {ket || 'RUSAK'}
      </span>
    );
  };

  return (
    <div>
      <div className="admin-panel">
        {/* PANEL HEADER */}
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Package size={18} color="#0284c7" /> Laporan Sarana & Prasarana Sekolah
            </div>
            <div className="admin-panel-subtitle">
              Total {currentList.length} data {activeSubTab === 'fasilitas' ? 'fasilitas ruangan' : activeSubTab === 'sarana' ? 'sarana & prasarana' : 'penggunaan tanah'} terdaftar dalam sistem
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Data Baru
            </button>
          </div>
        </div>

        {/* SUBTAB SELECTION BUTTONS (PERSIS GAYA ADMIN) */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <button
            type="button"
            className={activeSubTab === 'fasilitas' ? 'btn-primary-admin' : 'btn-outline-admin'}
            onClick={() => { setActiveSubTab('fasilitas'); setFilterKondisi('ALL'); }}
            style={{ fontSize: 13, padding: '7px 15px' }}
          >
            <Building2 size={15} /> Fasilitas Ruangan ({data.fasilitas?.length || 25})
          </button>
          <button
            type="button"
            className={activeSubTab === 'sarana' ? 'btn-primary-admin' : 'btn-outline-admin'}
            onClick={() => { setActiveSubTab('sarana'); setFilterKondisi('ALL'); }}
            style={{ fontSize: 13, padding: '7px 15px' }}
          >
            <Box size={15} /> Sarana & Prasarana ({data.sarana?.length || 31})
          </button>
          <button
            type="button"
            className={activeSubTab === 'tanah' ? 'btn-primary-admin' : 'btn-outline-admin'}
            onClick={() => { setActiveSubTab('tanah'); setFilterKondisi('ALL'); }}
            style={{ fontSize: 13, padding: '7px 15px' }}
          >
            <Layers size={15} /> Penggunaan Tanah ({data.tanah?.length || 3})
          </button>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={`Cari berdasarkan nama ${activeSubTab === 'fasilitas' ? 'ruangan' : activeSubTab === 'sarana' ? 'sarana / perlengkapan' : 'penggunaan tanah'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          {activeSubTab === 'fasilitas' && (
            <div style={{ width: 190 }}>
              <select
                className="form-control-admin"
                value={filterKondisi}
                onChange={(e) => setFilterKondisi(e.target.value)}
              >
                <option value="ALL">Semua Kondisi</option>
                <option value="BAIK">Kondisi: BAIK</option>
                <option value="CUKUP BAIK">Kondisi: CUKUP BAIK</option>
                <option value="CUKUP">Kondisi: CUKUP</option>
              </select>
            </div>
          )}

          <button className="btn-outline-admin" onClick={fetchData} title="Refresh Data">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* DATA TABLE (PERSIS SEPERTI TAB PENGUMUMAN) */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            {/* SUBTAB 1: FASILITAS */}
            {activeSubTab === 'fasilitas' && (
              <>
                <thead>
                  <tr>
                    <th style={{ width: 50, textAlign: 'center' }}>No</th>
                    <th>Nama Fasilitas Ruangan & Gedung</th>
                    <th style={{ width: 130, textAlign: 'center' }}>Jumlah Unit</th>
                    <th style={{ width: 170, textAlign: 'center' }}>Status Kelayakan</th>
                    <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        Memuat data fasilitas...
                      </td>
                    </tr>
                  ) : filteredFasilitas.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        Tidak ada data fasilitas yang cocok.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                          {item.no_urut || startIndex + idx + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                            {item.fasilitas}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b' }}>
                            Fasilitas Fisik Sarana Sekolah
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 800, color: '#0f172a' }}>
                            {item.jumlah} Unit
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {renderKondisiBadge(item.keterangan)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 4 }}>
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
              </>
            )}

            {/* SUBTAB 2: SARANA & PRASARANA */}
            {activeSubTab === 'sarana' && (
              <>
                <thead>
                  <tr>
                    <th style={{ width: 50, textAlign: 'center' }}>No</th>
                    <th>Jenis Sarana & Perlengkapan</th>
                    <th style={{ width: 120, textAlign: 'center' }}>Jumlah Total</th>
                    <th style={{ width: 120, textAlign: 'center' }}>Kondisi Baik</th>
                    <th style={{ width: 120, textAlign: 'center' }}>Kondisi Rusak</th>
                    <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        Memuat data sarana & prasarana...
                      </td>
                    </tr>
                  ) : filteredSarana.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        Tidak ada data sarana yang cocok.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                          {item.no_urut || startIndex + idx + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                            {item.jenis_sapras}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b' }}>
                            Inventaris Peralatan & Sarana
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 800, color: '#0f172a' }}>
                            {item.jumlah} Unit
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            background: '#ecfdf5',
                            color: '#059669',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800
                          }}>
                            {item.baik}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            background: (parseInt(item.rusak, 10) || 0) > 0 ? '#fef2f2' : '#f1f5f9',
                            color: (parseInt(item.rusak, 10) || 0) > 0 ? '#dc2626' : '#94a3b8',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 800
                          }}>
                            {item.rusak || 0}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 4 }}>
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
              </>
            )}

            {/* SUBTAB 3: PENGGUNAAN TANAH */}
            {activeSubTab === 'tanah' && (
              <>
                <thead>
                  <tr>
                    <th style={{ width: 50, textAlign: 'center' }}>No</th>
                    <th>Kategori Penggunaan Tanah</th>
                    <th style={{ width: 180, textAlign: 'center' }}>Luas Area</th>
                    <th style={{ width: 140, textAlign: 'center' }}>Persentase Lahan</th>
                    <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        Memuat data penggunaan tanah...
                      </td>
                    </tr>
                  ) : filteredTanah.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        Tidak ada data penggunaan tanah.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((item, idx) => {
                      const luas = parseFloat(item.luas_tanah) || 0;
                      const total = 1032;
                      const pct = ((luas / total) * 100).toFixed(1);

                      return (
                        <tr key={item.id || idx}>
                          <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                            {item.no_urut || startIndex + idx + 1}
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                              {item.penggunaan_tanah}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>
                              Aset Fisik Lahan Sekolah
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                            {Number(item.luas_tanah).toLocaleString('id-ID')} {item.satuan || 'M2'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              background: '#e0f2fe',
                              color: '#0284c7',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 800
                            }}>
                              {pct}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 4 }}>
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
              </>
            )}
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalItems={currentList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ADD / EDIT MODAL (PERSIS SEPERTI MODAL PENGUMUMAN) */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 540 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Data ' : 'Tambah Data '}
                {activeSubTab === 'fasilitas' ? 'Fasilitas Ruangan' : activeSubTab === 'sarana' ? 'Sarana & Prasarana' : 'Penggunaan Tanah'}
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

                  {activeSubTab === 'fasilitas' && (
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
                        <label>Kondisi / Keterangan</label>
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

                  {activeSubTab === 'sarana' && (
                    <>
                      <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                        <label>Jenis Sarana & Perlengkapan *</label>
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

                  {activeSubTab === 'tanah' && (
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
