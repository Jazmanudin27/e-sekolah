import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, CheckSquare, Square, RefreshCw, Check, X, Lock } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';
import SearchableSelect from '../../components/SearchableSelect';

const DEFAULT_FALLBACK_MENUS = [
  { key: 'siswa', label: 'Data Siswa', category: 'Umum' },
  { key: 'jadwal', label: 'Jadwal Pelajaran', category: 'Umum' },
  { key: 'history', label: 'History Presensi', category: 'Umum' },
  { key: 'absenSiswa', label: 'Absensi Siswa', category: 'Presensi' },
  { key: 'absenMapel', label: 'Absensi Mapel', category: 'Presensi' },
  { key: 'rekapSiswa', label: 'Rekap Presensi Siswa', category: 'Rekap' },
  { key: 'rekapMapel', label: 'Rekap Presensi Mapel', category: 'Rekap' },
  { key: 'rekapGuru', label: 'Rekap Presensi Guru', category: 'Rekap' },
  { key: 'pengajuanIzin', label: 'Pengajuan Izin Saya', category: 'Izin & Cuti' },
  { key: 'approvalIzin', label: 'Persetujuan / Approval Izin', category: 'Izin & Cuti' },
  { key: 'masterGuru', label: 'Master Data Guru', category: 'Admin' },
  { key: 'masterSiswa', label: 'Master Data Siswa & Kelas', category: 'Admin' },
  { key: 'settingUser', label: 'Manajemen Hak Akses & User', category: 'Admin' }
];

const DEFAULT_FALLBACK_ROLES = {
  'Admin': DEFAULT_FALLBACK_MENUS.map(m => m.key),
  'Kepala Sekolah': ['siswa', 'jadwal', 'history', 'rekapSiswa', 'rekapMapel', 'rekapGuru', 'approvalIzin'],
  'Guru': ['siswa', 'jadwal', 'history', 'absenMapel', 'rekapSiswa', 'pengajuanIzin'],
  'TU': ['siswa', 'jadwal', 'history', 'rekapSiswa', 'rekapGuru', 'approvalIzin', 'masterGuru', 'masterSiswa'],
  'Sekretaris': ['siswa', 'jadwal', 'absenSiswa', 'rekapSiswa'],
  'Operator': DEFAULT_FALLBACK_MENUS.map(m => m.key)
};

export default function AdminMenuHakAksesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableMenus, setAvailableMenus] = useState(DEFAULT_FALLBACK_MENUS);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_FALLBACK_ROLES);
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [search, setSearch] = useState('');

  const rolesList = ['Admin', 'Kepala Sekolah', 'Guru', 'TU', 'Sekretaris', 'Operator'];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menu/roles');
      if (res.data?.success && res.data?.data) {
        if (Array.isArray(res.data.data.available_menus) && res.data.data.available_menus.length > 0) {
          setAvailableMenus(res.data.data.available_menus);
        }
        if (res.data.data.role_permissions && Object.keys(res.data.data.role_permissions).length > 0) {
          setRolePermissions(res.data.data.role_permissions);
        }
      }
    } catch (err) {
      console.warn('[AdminMenuHakAksesTab] Using default fallback permissions:', err);
      // Fallback silently without throwing error popup
    } finally {
      setLoading(false);
    }
  };

  const currentRoleMenus = rolePermissions[selectedRole] || [];

  const handleToggleMenu = (menuKey) => {
    const isChecked = currentRoleMenus.includes(menuKey);
    let updated;
    if (isChecked) {
      updated = currentRoleMenus.filter(k => k !== menuKey);
    } else {
      updated = [...currentRoleMenus, menuKey];
    }
    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: updated
    });
  };

  const handleSelectAll = () => {
    const allKeys = availableMenus.map(m => m.key);
    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: allKeys
    });
  };

  const handleClearAll = () => {
    setRolePermissions({
      ...rolePermissions,
      [selectedRole]: []
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post('/menu/roles', {
        role: selectedRole,
        menus: currentRoleMenus
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Disimpan!',
          text: `Hak akses menu untuk role "${selectedRole}" berhasil diperbarui di database!`,
          confirmButtonColor: '#0066ff'
        });
      } else {
        Swal.fire('Info', res.data?.message || 'Hak akses berhasil dikirim.', 'info');
      }
    } catch (err) {
      console.error('Save error:', err);
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menyimpan pengaturan ke database.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredMenus = availableMenus.filter(m =>
    (m.label || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.key || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-panel">
      {/* HEADER MATCHING ADMIN GURU TAB */}
      <div className="admin-panel-header">
        <div>
          <div className="admin-panel-title">
            <ShieldCheck size={18} color="#0284c7" /> Hak Akses Menu & Role (RBAC)
          </div>
          <div className="admin-panel-subtitle">
            Atur & kelola hak akses menu untuk setiap role/jabatan pengguna di database MySQL
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary-admin" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Hak Akses'}
          </button>
        </div>
      </div>

      {/* SEARCH & CONTROLS BAR MATCHING ADMIN GURU TAB */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
        <div style={{ width: 220 }}>
          <SearchableSelect
            options={rolesList.map(r => ({ value: r, label: `Role: ${r}` }))}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            placeholder="Pilih Role Jabatan"
          />
        </div>

        <button className="btn-outline-admin" onClick={handleSelectAll} title="Pilih Semua Menu">
          <CheckSquare size={15} /> Pilih Semua
        </button>

        <button className="btn-outline-admin" onClick={handleClearAll} title="Kosongkan Pilihan">
          <Square size={15} /> Kosongkan
        </button>

        <button className="btn-outline-admin" onClick={fetchPermissions} title="Refresh Data">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* DATA TABLE MATCHING ADMIN GURU TAB */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 50, textAlign: 'center' }}>No</th>
              <th style={{ width: 160 }}>Kategori Menu</th>
              <th>Nama Menu / Fitur</th>
              <th>Key Sistem</th>
              <th style={{ width: 160, textAlign: 'center' }}>Akses Role ({selectedRole})</th>
              <th style={{ width: 120, textAlign: 'center' }}>Aksi Toggle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  Memuat data hak akses menu...
                </td>
              </tr>
            ) : filteredMenus.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  Tidak ada menu yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredMenus.map((m, idx) => {
                const isChecked = currentRoleMenus.includes(m.key);
                return (
                  <tr key={m.key || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{idx + 1}</td>
                    <td>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, color: '#475569' }}>
                        {m.category || 'Umum'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{m.label}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#64748b', fontSize: 11.5 }}>
                      <code>{m.key}</code>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={isChecked ? 'status-badge-active' : 'status-badge-inactive'}>
                        {isChecked ? 'Diizinkan' : 'Dibatasi'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`btn-action-icon ${isChecked ? 'btn-delete' : 'btn-edit'}`}
                        title={isChecked ? 'Nonaktifkan Akses' : 'Aktifkan Akses'}
                        onClick={() => handleToggleMenu(m.key)}
                        style={{ width: 'auto', padding: '3px 10px', height: 26, fontSize: 11, fontWeight: 700, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        {isChecked ? <X size={12} /> : <Check size={12} />}
                        {isChecked ? 'Matikan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
