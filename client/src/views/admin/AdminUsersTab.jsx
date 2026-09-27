import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Plus, Search, Edit2, Trash2, RefreshCw, X, Key, UserCheck, Shield
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

export default function AdminUsersTab() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setUserList(res.data.data);
      } else {
        setUserList([]);
      }
    } catch (err) {
      console.error(err);
      setUserList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: 'password123',
      role: 'admin',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u) => {
    setIsEditing(true);
    setCurrentId(u.id);
    setFormData({
      name: u.name || u.nama || '',
      username: u.username || '',
      email: u.email || '',
      password: '',
      role: u.role || 'admin',
      status: u.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = (u) => {
    Swal.fire({
      title: 'Hapus Akun Pengguna?',
      text: `Apakah Anda yakin ingin menghapus user admin "${u.name || u.username}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/users/${u.id}`);
          if (res.data?.success) {
            Swal.fire('Terhapus!', 'Akun admin berhasil dihapus.', 'success');
            fetchUsers();
          }
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus akun.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      Swal.fire('Validasi Gagal', 'Username wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${currentId}`, payload);
        Swal.fire('Berhasil!', 'Data akun pengguna berhasil diperbarui.', 'success');
      } else {
        await api.post('/users', formData);
        Swal.fire('Berhasil!', 'Akun pengguna admin baru berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan akun pengguna.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredList = userList.filter(u => {
    return (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
           (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
           (u.email || '').toLowerCase().includes(search.toLowerCase());
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <h2 className="portal-card-heading">MANAJEMEN AKUN ADMINISTRATOR & USERS</h2>

        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <ShieldCheck size={20} color="#7c3aed" /> Manajemen Akun Administrator & Pengguna (Tabel Users)
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Hanya akun yang terdaftar di tabel ini yang memiliki hak akses penuh ke Halaman Admin Desktop
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Admin Baru
            </button>
          </div>
        </div>

        {/* SEARCH CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari user admin berdasarkan nama, username, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <button className="btn-outline-admin" onClick={fetchUsers} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Nama Lengkap</th>
                <th>Username Login</th>
                <th>Email</th>
                <th>Hak Akses / Role</th>
                <th>Status</th>
                <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data akun pengguna...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada akun yang terdaftar.
                  </td>
                </tr>
              ) : (
                paginatedList.map((u, idx) => (
                  <tr key={u.id || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{u.name || u.nama || u.username}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 12, color: '#0066ff', fontWeight: 700 }}>
                        {u.username}
                      </code>
                    </td>
                    <td style={{ color: '#475569' }}>{u.email || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: (u.role || '').toLowerCase().includes('super') ? '#fef3c7' : '#eff6ff',
                        color: (u.role || '').toLowerCase().includes('super') ? '#b45309' : '#1d4ed8',
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        {u.role || 'Admin'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={u.status === 'active' || u.status === 'Aktif' ? 'status-badge-active' : 'status-badge-inactive'}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-action-icon btn-edit" title="Edit Akun" onClick={() => handleOpenEdit(u)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus Akun" onClick={() => handleDelete(u)}>
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
                {isEditing ? 'Edit Akun Administrator' : 'Tambah Administrator / Operator Baru'}
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
                    <label>Nama Lengkap *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="Contoh: Administrator Utama"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Username Login *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="admin"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Email Pengguna</label>
                    <input
                      type="email"
                      className="form-control-admin"
                      placeholder="admin@esekolah.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Hak Akses / Role</label>
                    <select
                      className="form-control-admin"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                      <option value="operator">Operator Sekolah</option>
                      <option value="kepala_sekolah">Kepala Sekolah</option>
                    </select>
                  </div>

                  <div className="form-group-admin">
                    <label>Status Akun</label>
                    <select
                      className="form-control-admin"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active (Aktif)</option>
                      <option value="inactive">Inactive (Nonaktif)</option>
                    </select>
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>{isEditing ? 'Password Baru (Kosongkan jika tetap)' : 'Password Akun *'}</label>
                    <input
                      type="password"
                      className="form-control-admin"
                      required={!isEditing}
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
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
