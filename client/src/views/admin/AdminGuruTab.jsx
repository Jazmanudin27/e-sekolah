import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Edit2, Trash2, Printer, RefreshCw, X, Check, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

export default function AdminGuruTab() {
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nip_nuptk: '',
    nama_guru: '',
    jk: 'L',
    no_hp: '',
    email: '',
    status_kepegawaian: 'PNS',
    status: 'Aktif',
    role: 'Guru',
    username: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGuru();
  }, []);

  const fetchGuru = async () => {
    setLoading(true);
    try {
      const res = await api.get('/guru');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setGuruList(res.data.data);
      } else {
        setGuruList([]);
      }
    } catch (err) {
      console.error(err);
      setGuruList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      nip_nuptk: '',
      nama_guru: '',
      jk: 'L',
      no_hp: '',
      email: '',
      status_kepegawaian: 'PNS',
      status: 'Aktif',
      role: 'Guru',
      username: '',
      password: 'password123'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (guru) => {
    setIsEditing(true);
    setCurrentId(guru.kode_guru);
    setFormData({
      nip_nuptk: guru.nip_nuptk || '',
      nama_guru: guru.nama_guru || '',
      jk: guru.jk || 'L',
      no_hp: guru.no_hp || '',
      email: guru.email || '',
      status_kepegawaian: guru.status_kepegawaian || 'PNS',
      status: guru.status || 'Aktif',
      role: guru.role || 'Guru',
      username: guru.username || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = (guru) => {
    Swal.fire({
      title: 'Hapus Data Guru?',
      text: `Apakah Anda yakin ingin menghapus data "${guru.nama_guru}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/guru/${guru.kode_guru}`);
          if (res.data?.success) {
            Swal.fire('Terhapus!', 'Data guru berhasil dihapus.', 'success');
            fetchGuru();
          }
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus data guru.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_guru) {
      Swal.fire('Validasi Gagal', 'Nama guru wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const updatePayload = { ...formData };
        if (!updatePayload.password) delete updatePayload.password;
        await api.put(`/guru/${currentId}`, updatePayload);
        Swal.fire('Berhasil!', 'Data guru berhasil diperbarui.', 'success');
      } else {
        await api.post('/guru', formData);
        Swal.fire('Berhasil!', 'Data guru baru berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchGuru();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan data guru.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  const filteredList = guruList
    .filter(g => {
      const matchSearch = (g.nama_guru || '').toLowerCase().includes(search.toLowerCase()) ||
                          (g.nip_nuptk || '').toLowerCase().includes(search.toLowerCase()) ||
                          (g.email || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || g.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => (a.nama_guru || '').localeCompare(b.nama_guru || '', 'id', { sensitivity: 'base' }));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <h2 className="portal-card-heading">DATA MASTER TENAGA PENDIDIK & GURU</h2>

        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Users size={20} color="#0066ff" /> Data Master Tenaga Pendidik & Guru
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Total {filteredList.length} guru terdaftar dalam sistem
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline-admin" onClick={() => window.print()}>
              <Printer size={16} /> Cetak / Print
            </button>
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Guru Baru
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama guru, NIP, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control-admin"
            style={{ width: 180 }}
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Status: Aktif</option>
            <option value="Nonaktif">Status: Nonaktif</option>
          </select>

          <button className="btn-outline-admin" onClick={fetchGuru} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Nama Guru & Gelar</th>
                <th>NIP / NUPTK</th>
                <th>L/P</th>
                <th>Kepegawaian</th>
                <th>No. Handphone</th>
                <th>Status</th>
                <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data guru...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada data guru yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedList.map((g, idx) => (
                  <tr key={g.kode_guru || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{g.nama_guru}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{g.email || '-'}</div>
                    </td>
                    <td style={{ fontWeight: 600, textAlign: 'center' }}>{g.nip_nuptk || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: g.jk === 'L' ? '#0066ff' : '#be185d' }}>
                        {g.jk === 'L' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {g.status_kepegawaian || 'PNS'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{g.no_hp || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={g.status === 'Aktif' ? 'status-badge-active' : 'status-badge-inactive'}>
                        {g.status || 'Aktif'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-action-icon btn-edit" title="Edit Guru" onClick={() => handleOpenEdit(g)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus Guru" onClick={() => handleDelete(g)}>
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
                {isEditing ? 'Edit Data Tenaga Pendidik' : 'Tambah Guru / Tenaga Pendidik Baru'}
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
                    <label>Nama Lengkap Guru & Gelar *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="Contoh: Drs. H. Ahmad Dahlan, M.Pd"
                      value={formData.nama_guru}
                      onChange={(e) => setFormData({ ...formData, nama_guru: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>NIP / NUPTK</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="19800101..."
                      value={formData.nip_nuptk}
                      onChange={(e) => setFormData({ ...formData, nip_nuptk: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Jenis Kelamin</label>
                    <select
                      className="form-control-admin"
                      value={formData.jk}
                      onChange={(e) => setFormData({ ...formData, jk: e.target.value })}
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div className="form-group-admin">
                    <label>Status Kepegawaian</label>
                    <select
                      className="form-control-admin"
                      value={formData.status_kepegawaian}
                      onChange={(e) => setFormData({ ...formData, status_kepegawaian: e.target.value })}
                    >
                      <option value="PNS">PNS</option>
                      <option value="PPPK">PPPK</option>
                      <option value="GTT">Guru Tidak Tetap (GTT)</option>
                      <option value="Honorer">Honorer</option>
                      <option value="Yayasan">Guru Tetap Yayasan</option>
                    </select>
                  </div>

                  <div className="form-group-admin">
                    <label>Status Akun</label>
                    <select
                      className="form-control-admin"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>

                  <div className="form-group-admin">
                    <label>No. Handphone / WhatsApp</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="08123456789"
                      value={formData.no_hp}
                      onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Email Pengajar</label>
                    <input
                      type="email"
                      className="form-control-admin"
                      placeholder="guru@sekolah.sch.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Username Login</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="username.guru"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>{isEditing ? 'Password Baru (Kosongkan jika tetap)' : 'Password Akun'}</label>
                    <input
                      type="password"
                      className="form-control-admin"
                      placeholder={isEditing ? '••••••••' : 'Password default: 123456'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
