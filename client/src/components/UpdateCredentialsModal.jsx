import React, { useState } from 'react';
import { KeyRound, User, Lock, Eye, EyeOff, X, ShieldCheck, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/client';

export default function UpdateCredentialsModal({ user, onClose, onUpdateSuccess }) {
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername && !cleanPassword) {
      Swal.fire('Perhatian', 'Isi username atau password yang ingin diperbarui.', 'warning');
      return;
    }

    if (cleanUsername && cleanUsername.length < 3) {
      Swal.fire('Validasi Gagal', 'Username minimal 3 karakter.', 'warning');
      return;
    }

    if (cleanPassword) {
      if (cleanPassword.length < 4) {
        Swal.fire('Validasi Gagal', 'Password baru minimal 4 karakter.', 'warning');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        Swal.fire('Validasi Gagal', 'Konfirmasi password tidak cocok dengan password baru.', 'warning');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {};
      if (cleanUsername && cleanUsername !== user?.username) {
        payload.username = cleanUsername;
      }
      if (cleanPassword) {
        payload.password = cleanPassword;
      }

      if (Object.keys(payload).length === 0) {
        Swal.fire('Info', 'Tidak ada perubahan username atau password yang dimasukkan.', 'info');
        setSubmitting(false);
        return;
      }

      const res = await api.put('/auth/update-credentials', payload);
      if (res.data?.success) {
        const { token, user: updatedUser } = res.data.data;

        // Update local storage
        if (token) {
          localStorage.setItem('esekolah_token', token);
        }
        if (updatedUser) {
          localStorage.setItem('esekolah_user', JSON.stringify(updatedUser));
          if (onUpdateSuccess) {
            onUpdateSuccess(updatedUser);
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil Diperbarui!',
          text: 'Username / Password akun Anda berhasil disimpan. Harap ingat kredensial baru ini untuk login berikutnya.',
          confirmButtonColor: '#0066ff'
        });

        onClose();
      }
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.response?.data?.message || 'Terjadi kesalahan saat memperbarui akun.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}
            >
              <KeyRound size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Ubah Akun Login</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 12, opacity: 0.85 }}>
                Perbarui Username & Password Akun
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: 10,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* USERNAME FIELD */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Username Login
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username baru..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontWeight: 600
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                Username saat ini: <strong>{user?.username || '-'}</strong>
              </span>
            </div>

            {/* PASSWORD BARU FIELD */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Password Baru (Opsional)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Kosongkan jika tidak ingin diubah"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 4
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* KONFIRMASI PASSWORD */}
            {password && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Ulangi Password Baru
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    placeholder="Ketik ulang password baru..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 38px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 4
                    }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY ADVISORY NOTE */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 11.5, color: '#166534', lineHeight: 1.4 }}>
                Perubahan langsung aktif saat disimpan. Pastikan Anda mengingat atau mencatat kredensial baru.
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Check size={16} />
              {submitting ? 'Menyimpan...' : 'Simpan Kredensial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
