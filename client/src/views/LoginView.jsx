import React, { useState } from 'react';
import { School, GraduationCap, UserCheck, Lock, ArrowRight, ShieldCheck, Sparkles, BookOpen, User } from 'lucide-react';
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
        showToast('Login Berhasil! Selamat Datang di E-Sekolah.');
        onLoginSuccess(res.data.data.user, res.data.data.token);
      } else {
        showToast(res.data.message || 'Username atau Password salah.', false);
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
      padding: '32px 20px', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', minHeight: '100vh', flex: 1,
      backgroundColor: '#070a14',
      background: 'radial-gradient(circle at top, rgba(14, 165, 233, 0.25), rgba(7, 10, 20, 0.98) 70%)',
      position: 'relative'
    }}>

      {/* EDUCATIONAL HERO HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {/* SCHOOL CREST EMBLEM */}
        <div style={{
          width: 76, height: 76,
          background: 'linear-gradient(135deg, #0284c7, #6366f1)',
          borderRadius: 24, display: 'inline-flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', marginBottom: 12,
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.4), inset 0 0 15px rgba(255,255,255,0.3)',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <GraduationCap size={44} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11,
          fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)',
          padding: '4px 12px', borderRadius: 20, marginBottom: 8,
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}>
          <School size={12} /> PORTAL PRESENSI GURU & SEKOLAH
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 800, letterSpacing: 1,
          background: 'linear-gradient(to right, #ffffff, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          SMK ARTANITA
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
          Sistem Informasi & Presensi Digital Terpadu
        </p>
      </div>

      {/* LOGIN CARD WITH SCHOOL EMBLEM THEME */}
      <div className="glass-card" style={{
        border: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(56, 189, 248, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Masuk Akun Pengajar</h2>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>Silakan masukkan NIP / Email Guru</p>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={20} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} style={{ color: '#38bdf8' }} /> NIP / Email / Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: ali@artanita.com"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={14} style={{ color: '#38bdf8' }} /> Password Akses
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password anda"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 6 }}>
            <span>{loading ? 'Verifikasi Data Akun...' : 'Masuk Portal Presensi'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* QUICK PRESET TEACHERS */}
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <UserCheck size={12} style={{ display: 'inline', marginRight: 4 }} /> Akun Demo Pengajar:
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('ali@artanita.com')}
              style={{
                padding: '10px 8px', background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 12,
                color: '#f8fafc', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>Ali Irsan, S.H.</span>
              <span style={{ color: '#94a3b8', fontSize: 10 }}>Guru Hukum / PPKn</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('dina@artanita.com')}
              style={{
                padding: '10px 8px', background: 'rgba(129, 140, 248, 0.08)',
                border: '1px solid rgba(129, 140, 248, 0.25)', borderRadius: 12,
                color: '#f8fafc', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontWeight: 700, color: '#818cf8' }}>Dina Saparinda</span>
              <span style={{ color: '#94a3b8', fontSize: 10 }}>Guru Informatika / IT</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER MOTTO */}
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <p style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <BookOpen size={12} /> Presensi Digital Transparan & Akurat
        </p>
      </div>

    </div>
  );
}
