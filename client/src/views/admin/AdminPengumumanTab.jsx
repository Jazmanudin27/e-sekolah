import React, { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Search, Edit2, Trash2, RefreshCw, X, Check, Eye, Calendar, User, Tag
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function AdminPengumumanTab() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'Penting',
    isi: '',
    gambar_url: '',
    penulis: 'Administrator',
    target_role: 'Semua',
    is_active: 1
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pengumuman/admin');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setList(res.data.data);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      judul: '',
      kategori: 'Penting',
      isi: '',
      gambar_url: '',
      penulis: 'Administrator',
      target_role: 'Semua',
      is_active: 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      judul: item.judul || '',
      kategori: item.kategori || 'Penting',
      isi: item.isi || '',
      gambar_url: item.gambar_url || '',
      penulis: item.penulis || 'Administrator',
      target_role: item.target_role || 'Semua',
      is_active: item.is_active !== undefined ? item.is_active : 1
    });
    setShowModal(true);
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Hapus Pengumuman?',
      text: `Apakah Anda yakin ingin menghapus "${item.judul}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/pengumuman/${item.id}`);
          if (res.data?.success) {
            Swal.fire('Terhapus!', 'Pengumuman berhasil dihapus.', 'success');
            fetchAnnouncements();
          }
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus pengumuman.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.isi) {
      Swal.fire('Validasi Gagal', 'Judul dan isi pengumuman wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/pengumuman/${currentId}`, formData);
        Swal.fire('Berhasil!', 'Pengumuman berhasil diperbarui.', 'success');
      } else {
        await api.post('/pengumuman', formData);
        Swal.fire('Berhasil!', 'Pengumuman baru berhasil diterbitkan.', 'success');
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan pengumuman.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterKategori]);

  const filteredList = list.filter(item => {
    const matchSearch = (item.judul || '').toLowerCase().includes(search.toLowerCase()) ||
                        (item.isi || '').toLowerCase().includes(search.toLowerCase()) ||
                        (item.penulis || '').toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategori === 'ALL' || item.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Megaphone size={18} color="#0284c7" /> Manajemen Informasi & Pengumuman Sekolah
            </div>
            <div className="admin-panel-subtitle">
              Total {filteredList.length} pengumuman terdaftar dalam sistem
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Pengumuman Baru
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, isi, atau penulis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div style={{ width: 180 }}>
            <SearchableSelect
              options={[
                { value: 'ALL', label: 'Semua Kategori' },
                { value: 'Penting', label: 'Kategori: Penting' },
                { value: 'Kegiatan', label: 'Kategori: Kegiatan' },
                { value: 'Libur', label: 'Kategori: Libur' },
                { value: 'Umum', label: 'Kategori: Umum' }
              ]}
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              placeholder="Semua Kategori"
            />
          </div>

          <button className="btn-outline-admin" onClick={fetchAnnouncements} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Judul & Ringkasan Pengumuman</th>
                <th>Kategori</th>
                <th>Penulis / Pengirim</th>
                <th>Target Role</th>
                <th>Tanggal Terbit</th>
                <th>Status</th>
                <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data pengumuman...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada data pengumuman yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{item.judul}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.isi}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: item.kategori === 'Penting' ? '#fef2f2' : item.kategori === 'Kegiatan' ? '#e0f2fe' : '#ecfdf5',
                        color: item.kategori === 'Penting' ? '#dc2626' : item.kategori === 'Kegiatan' ? '#0284c7' : '#059669',
                        padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800
                      }}>
                        {item.kategori || 'Umum'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.penulis || 'Administrator'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {item.target_role || 'Semua'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 11.5, color: '#64748b' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={item.is_active ? 'status-badge-active' : 'status-badge-inactive'}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-action-icon btn-edit" title="Edit Pengumuman" onClick={() => handleOpenEdit(item)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus Pengumuman" onClick={() => handleDelete(item)}>
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
          <div className="admin-modal-box" style={{ maxWidth: 620 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Data Pengumuman' : 'Tambah Pengumuman Sekolah Baru'}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Judul Pengumuman *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="Contoh: Ujian Akhir Semester (UAS) Ganjil"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Kategori Pengumuman</label>
                    <SearchableSelect
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      options={[
                        { value: 'Penting', label: '🔥 Penting' },
                        { value: 'Kegiatan', label: '📅 Kegiatan' },
                        { value: 'Libur', label: '🎉 Libur' },
                        { value: 'Umum', label: '📢 Umum' }
                      ]}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Penulis / Pengirim</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="Kepala Sekolah / Tim IT"
                      value={formData.penulis}
                      onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Target Penerima</label>
                    <SearchableSelect
                      value={formData.target_role}
                      onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                      options={[
                        { value: 'Semua', label: 'Semua Pengguna' },
                        { value: 'Guru', label: 'Dewan Guru' },
                        { value: 'Siswa', label: 'Siswa / Kelas' }
                      ]}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Status Publikasi</label>
                    <SearchableSelect
                      value={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: Number(e.target.value) })}
                      options={[
                        { value: 1, label: 'Aktif (Tampilkan)' },
                        { value: 0, label: 'Nonaktif (Sembunyikan)' }
                      ]}
                    />
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>URL Gambar Banner (Opsional)</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="https://images.unsplash.com/... atau URL Gambar"
                      value={formData.gambar_url}
                      onChange={(e) => setFormData({ ...formData, gambar_url: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Isi Lengkap Pengumuman *</label>
                    <textarea
                      className="form-control-admin"
                      rows={5}
                      required
                      placeholder="Tuliskan isi pengumuman secara rinci di sini..."
                      value={formData.isi}
                      onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                      style={{ height: 'auto', padding: 12, resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
