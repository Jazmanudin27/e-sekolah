import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Search, Edit2, Trash2, RefreshCw, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

export default function AdminMapelTab() {
  const [mapelList, setMapelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nama_mapel: '',
    kkm: 75
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMapel();
  }, []);

  const fetchMapel = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mapel');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMapelList(res.data.data);
      } else {
        setMapelList([]);
      }
    } catch (err) {
      console.error(err);
      setMapelList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      nama_mapel: '',
      kkm: 75
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m) => {
    setIsEditing(true);
    setCurrentId(m.kode_mapel);
    setFormData({
      nama_mapel: m.nama_mapel || '',
      kkm: m.kkm || 75
    });
    setShowModal(true);
  };

  const handleDelete = (m) => {
    Swal.fire({
      title: 'Hapus Mata Pelajaran?',
      text: `Apakah Anda yakin ingin menghapus mapel "${m.nama_mapel}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/mapel/${m.kode_mapel}`);
          if (res.data?.success) {
            Swal.fire('Terhapus!', 'Mata pelajaran berhasil dihapus.', 'success');
            fetchMapel();
          }
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus mata pelajaran.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_mapel) {
      Swal.fire('Validasi Gagal', 'Nama mata pelajaran wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/mapel/${currentId}`, formData);
        Swal.fire('Berhasil!', 'Mata pelajaran berhasil diperbarui.', 'success');
      } else {
        await api.post('/mapel', formData);
        Swal.fire('Berhasil!', 'Mata pelajaran baru berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchMapel();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan mata pelajaran.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredList = mapelList
    .filter(m => (m.nama_mapel || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.nama_mapel || '').localeCompare(b.nama_mapel || '', 'id', { sensitivity: 'base' }));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <BookOpen size={18} color="#0284c7" /> Data Master Mata Pelajaran
            </div>
            <div className="admin-panel-subtitle">
              Total {filteredList.length} mata pelajaran dalam kurikulum sekolah
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Mapel Baru
            </button>
          </div>
        </div>

        {/* SEARCH CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <button className="btn-outline-admin" onClick={fetchMapel} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Kode Mapel</th>
                <th>Nama Mata Pelajaran</th>
                <th>Standar KKM</th>
                <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data mata pelajaran...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada mata pelajaran yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedList.map((m, idx) => (
                  <tr key={m.kode_mapel || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 12, color: '#475569', fontWeight: 700 }}>
                        MPL-{m.kode_mapel}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13 }}>{m.nama_mapel}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 800 }}>
                        {m.kkm || 75}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-action-icon btn-edit" title="Edit Mapel" onClick={() => handleOpenEdit(m)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus Mapel" onClick={() => handleDelete(m)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Data Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group-admin">
                    <label>Nama Mata Pelajaran *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="Contoh: Matematika, Pemrograman Web, Bahasa Indonesia"
                      value={formData.nama_mapel}
                      onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Kriteria Ketuntasan Minimal (KKM)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="form-control-admin"
                      value={formData.kkm}
                      onChange={(e) => setFormData({ ...formData, kkm: parseInt(e.target.value, 10) || 75 })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Mapel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
