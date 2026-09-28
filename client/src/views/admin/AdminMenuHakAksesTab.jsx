import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, CheckSquare, Square, RefreshCw, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

export default function AdminMenuHakAksesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableMenus, setAvailableMenus] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState('Kepala Sekolah');

  const rolesList = ['Admin', 'Kepala Sekolah', 'Guru', 'TU', 'Sekretaris', 'Operator'];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menu/roles');
      if (res.data.success) {
        setAvailableMenus(res.data.data.available_menus || []);
        setRolePermissions(res.data.data.role_permissions || {});
      }
    } catch (err) {
      console.error('Error fetching role permissions:', err);
      Swal.fire('Gagal', 'Gagal memuat data hak akses menu dari database.', 'error');
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

      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Disimpan!',
          text: `Hak akses menu untuk role ${selectedRole} berhasil diperbarui di database MySQL!`,
          confirmButtonColor: '#0066ff'
        });
      }
    } catch (err) {
      console.error('Save error:', err);
      Swal.fire('Gagal', 'Gagal menyimpan pengaturan ke database.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={24} className="spin" style={{ marginBottom: '12px', color: '#0066ff' }} />
        <p>Memuat Pengaturan Hak Akses Menu dari Database MySQL...</p>
      </div>
    );
  }

  // Group available menus by category
  const categories = availableMenus.reduce((acc, menu) => {
    const cat = menu.category || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(menu);
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '24px 28px',
        borderRadius: '16px',
        color: '#ffffff',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(0, 102, 255, 0.2)',
            border: '1px solid rgba(0, 102, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={26} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
              Pengaturan Hak Akses Menu (Role-Based Access)
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Atur & simpan menu yang dapat diakses oleh setiap Jabatan/Role langsung di tabel database MySQL (<code style={{ color: '#38bdf8' }}>menu</code>).
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          <Save size={18} />
          {saving ? 'Menyimpan...' : 'Simpan ke Database'}
        </button>
      </div>

      {/* Role Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        marginBottom: '20px',
        paddingBottom: '4px'
      }}>
        {rolesList.map(roleName => {
          const isActive = selectedRole === roleName;
          const count = (rolePermissions[roleName] || []).length;
          return (
            <button
              key={roleName}
              onClick={() => setSelectedRole(roleName)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: isActive ? '2px solid #0066ff' : '1px solid #e2e8f0',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#0066ff' : '#475569',
                fontWeight: isActive ? '700' : '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 12px rgba(0, 102, 255, 0.12)' : 'none'
              }}
            >
              <span>{roleName}</span>
              <span style={{
                background: isActive ? '#0066ff' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                {count} Menu
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Box */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '14px'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Daftar Menu untuk Role: <span style={{ color: '#0066ff' }}>{selectedRole}</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Centang menu yang diperbolehkan tampil untuk akun berpangkat <strong>{selectedRole}</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSelectAll}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Pilih Semua
            </button>
            <button
              onClick={handleClearAll}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #fed7aa',
                background: '#fff7ed',
                color: '#c2410c',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Kosongkan
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {Object.entries(categories).map(([catName, menuList]) => (
            <div
              key={catName}
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #f1f5f9'
              }}
            >
              <h4 style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={14} color="#0066ff" />
                {catName}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuList.map(menu => {
                  const isChecked = currentRoleMenus.includes(menu.key);
                  return (
                    <div
                      key={menu.key}
                      onClick={() => handleToggleMenu(menu.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: isChecked ? '#ffffff' : 'transparent',
                        border: isChecked ? '1px solid #bfdbfe' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isChecked ? (
                          <CheckSquare size={18} color="#0066ff" />
                        ) : (
                          <Square size={18} color="#94a3b8" />
                        )}
                        <span style={{
                          fontSize: '13px',
                          fontWeight: isChecked ? '700' : '500',
                          color: isChecked ? '#1e293b' : '#64748b'
                        }}>
                          {menu.label}
                        </span>
                      </div>

                      {isChecked && (
                        <span style={{
                          fontSize: '10px',
                          background: '#dbeafe',
                          color: '#1d4ed8',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontWeight: '700'
                        }}>
                          Aktif
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
