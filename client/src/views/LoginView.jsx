import React, { useState } from 'react';
import { GraduationCap, User, Lock, ArrowRight } from 'lucide-react';
import api from '../api/client';

export default function LoginView({ onLoginSuccess, showToast }) {
  const [username, setUsername] = useState('ali@artanita.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        showToast('Login berhasil! Selamat datang.');
        onLoginSuccess(res.data.data.user, res.data.data.token);
      } else {
        showToast(res.data.message || 'Login gagal.', false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Koneksi gagal. Pastikan API running.', false);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email) => {
    setUsername(email);
    setPassword('123456');
  };

  return (
    <div style={{
      padding: '30px 20px', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', height: '100%',
      background: 'radial-gradient(circle at top, rgba(56, 189, 248, 0.15), transparent 60%)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
          borderRadius: 20, display: 'inline-flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', marginBottom: 12,
          boxShadow: '0 10px 25px rgba(56, 189, 248, 0.4)'
        }}>
          <GraduationCap size={36} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>E-SEKOLAH</h1>
        <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Sistem Presensi Mobile React.js</p>
      </div>

      <div className="glass-card">
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Masuk Akun</h2>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>Gunakan NIP atau Email Guru Anda</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} /> NIP / Email / Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ali@artanita.com"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <span>{loading ? 'Memproses...' : 'Masuk Aplikasi'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Quick Preset Login:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('ali@artanita.com')}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                color: '#94a3b8', fontSize: 12, cursor: 'pointer'
              }}
            >
              Ali Irsan Shafar (Guru)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('dina@artanita.com')}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                color: '#94a3b8', fontSize: 12, cursor: 'pointer'
              }}
            >
              Dina Saparinda (Guru/IT)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
