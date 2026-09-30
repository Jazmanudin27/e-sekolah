import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Search, Edit2, Trash2, RefreshCw, X, Check, Filter, CalendarDays
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function AdminKalenderTab() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterKategori, setFilterKategori] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    tahun_ajaran: '2026/2027',
    semester: 1,
    kategori: 'Kegiatan',
    nama_kegiatan: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    keterangan: '',
    warna: '#0066ff',
    tingkat_target: 'Semua'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kalender');
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
    const todayStr = new Date().toISOString().split('T')[0];
    setFormData({
      tahun_ajaran: '2026/2027',
      semester: 1,
      kategori: 'Kegiatan',
      nama_kegiatan: '',
      tanggal_mulai: todayStr,
      tanggal_selesai: todayStr,
      keterangan: '',
      warna: '#0066ff',
      tingkat_target: 'Semua'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    let startDate = item.tanggal_mulai ? item.tanggal_mulai.split('T')[0] : '';
    let endDate = item.tanggal_selesai ? item.tanggal_selesai.split('T')[0] : '';
    setFormData({
      tahun_ajaran: item.tahun_ajaran || '2026/2027',
      semester: item.semester || 1,
      kategori: item.kategori || 'Kegiatan',
      nama_kegiatan: item.nama_kegiatan || '',
      tanggal_mulai: startDate,
      tanggal_selesai: endDate,
      keterangan: item.keterangan || '',
      warna: item.warna || '#0066ff',
      tingkat_target: item.tingkat_target || 'Semua'
    });
    setShowModal(true);
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Hapus Agenda Kalender?',
      text: `Apakah Anda yakin ingin menghapus "${item.nama_kegiatan}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/kalender/${item.id}`);
          if (res.data?.success) {
            Swal.fire('Terhapus!', 'Agenda kalender berhasil dihapus.', 'success');
            fetchEvents();
          }
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus agenda kalender.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_kegiatan || !formData.tanggal_mulai) {
      Swal.fire('Validasi Gagal', 'Nama kegiatan dan tanggal mulai wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/kalender/${currentId}`, formData);
        Swal.fire('Berhasil!', 'Agenda kalender berhasil diperbarui.', 'success');
      } else {
        await api.post('/kalender', formData);
        Swal.fire('Berhasil!', 'Agenda kalender baru berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan agenda kalender.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSemester, filterKategori]);

  const filteredList = list.filter(item => {
    const matchSearch = (item.nama_kegiatan || '').toLowerCase().includes(search.toLowerCase()) ||
                        (item.keterangan || '').toLowerCase().includes(search.toLowerCase());
    const matchSem = filterSemester === 'ALL' || String(item.semester) === filterSemester;
    const matchKat = filterKategori === 'ALL' || item.kategori === filterKategori;
    return matchSearch && matchSem && matchKat;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  const getKategoriBadge = (kategori, warna) => {
    let bg = '#eff6ff';
    let text = '#1d4ed8';
    const cat = (kategori || '').toLowerCase();
    if (cat.includes('libur')) { bg = '#fef2f2'; text = '#dc2626'; }
    else if (cat.includes('ujian')) { bg = '#fffbeb'; text = '#d97706'; }
    else if (cat.includes('lomba')) { bg = '#f5f3ff'; text = '#7c3aed'; }
    else if (cat.includes('rapor')) { bg = '#f0fdf4'; text = '#16a34a'; }
    else if (cat.includes('mpls')) { bg = '#fff7ed'; text = '#c2410c'; }

    return (
      <span style={{
        background: bg,
        color: text,
        padding: '3px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 800
      }}>
        {kategori}
      </span>
    );
  };

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Calendar size={18} color="#0284c7" /> Kalender Pendidikan Tahun Ajaran 2026/2027
            </div>
            <div className="admin-panel-subtitle">
              Total {filteredList.length} agenda kegiatan (Disdik Jabar & Agenda Sekolah)
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Agenda Kalender
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari agenda kegiatan kalender..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div style={{ width: 170 }}>
            <SearchableSelect
              options={[
                { value: 'ALL', label: 'Semua Semester' },
                { value: '1', label: 'Semester 1 (Ganjil)' },
                { value: '2', label: 'Semester 2 (Genap)' }
              ]}
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              placeholder="Semua Semester"
            />
          </div>

          <div style={{ width: 170 }}>
            <SearchableSelect
              options={[
                { value: 'ALL', label: 'Semua Kategori' },
                { value: 'Kegiatan', label: 'Kegiatan' },
                { value: 'Libur', label: 'Libur' },
                { value: 'Ujian', label: 'Ujian/Asesmen' },
                { value: 'Rapor', label: 'Rapor' },
                { value: 'MPLS', label: 'MPLS' },
                { value: 'Lomba', label: 'Lomba/Olimpiade' }
              ]}
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              placeholder="Semua Kategori"
            />
          </div>

          <button className="btn-outline-admin" onClick={fetchEvents} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 45 }}>No</th>
                <th>Nama Kegiatan / Agenda</th>
                <th>Kategori</th>
                <th>Semester</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Target</th>
                <th>Keterangan</th>
                <th style={{ width: 90, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data kalender pendidikan...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada agenda kalender yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                      {startIndex + idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.nama_kegiatan}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getKategoriBadge(item.kategori, item.warna)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        Sem {item.semester}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                      {item.tanggal_mulai ? new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                      {item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                        {item.tingkat_target || 'Semua'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: '#64748b', maxWidth: 200 }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.keterangan || '-'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-action-icon btn-edit" title="Edit Agenda" onClick={() => handleOpenEdit(item)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus Agenda" onClick={() => handleDelete(item)}>
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

      {/* MODAL ADD / EDIT AGENDA */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 600 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Agenda Kalender' : 'Tambah Agenda Kalender Baru'}
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
                    <label>Nama Agenda / Kegiatan *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="Contoh: Masa Pengenalan Lingkungan Sekolah (MPLS)"
                      value={formData.nama_kegiatan}
                      onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Kategori Agenda</label>
                    <SearchableSelect
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      options={[
                        { value: 'Kegiatan', label: 'Kegiatan' },
                        { value: 'Libur', label: 'Libur' },
                        { value: 'Ujian', label: 'Ujian / Asesmen' },
                        { value: 'Rapor', label: 'Rapor' },
                        { value: 'MPLS', label: 'MPLS' },
                        { value: 'Lomba', label: 'Lomba / Olimpiade' }
                      ]}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Semester</label>
                    <SearchableSelect
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                      options={[
                        { value: 1, label: 'Semester 1 (Ganjil)' },
                        { value: 2, label: 'Semester 2 (Genap)' }
                      ]}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Tanggal Mulai *</label>
                    <input
                      type="date"
                      className="form-control-admin"
                      required
                      value={formData.tanggal_mulai}
                      onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Tanggal Selesai (Opsional)</label>
                    <input
                      type="date"
                      className="form-control-admin"
                      value={formData.tanggal_selesai}
                      onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Jenjang Sasaran</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="Semua / SMK / SMA / SMP"
                      value={formData.tingkat_target}
                      onChange={(e) => setFormData({ ...formData, tingkat_target: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Warna Penanda</label>
                    <input
                      type="color"
                      className="form-control-admin"
                      style={{ padding: 4, height: 38 }}
                      value={formData.warna}
                      onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Keterangan Tambahan (Opsional)</label>
                    <textarea
                      className="form-control-admin"
                      rows={3}
                      placeholder="Catatan atau keterangan agenda..."
                      value={formData.keterangan}
                      onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      style={{ height: 'auto', padding: 10, resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
