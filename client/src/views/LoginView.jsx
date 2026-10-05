import React, { useState } from 'react';
import {
  GraduationCap, Lock, ArrowRight, ShieldCheck, User,
  BookOpen, Sparkles
} from 'lucide-react';
import api from '../api/client';
import loginHeroImg from '../assets/login_hero.jpg';

export default function LoginView({ onLoginSuccess, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Username/Email dan Password wajib diisi.', false);
      return;
    }

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

  return (
    <div className="login-responsive-container">
      <div className="login-card-wrapper">
        {/* ========================================================
            LEFT COLUMN (DESKTOP HERO VISUAL - 3D ARTWORK BANNER)
            ======================================================== */}
        <div
          className="login-hero-showcase"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(7, 22, 51, 0.45) 0%, rgba(7, 22, 51, 0.9) 100%), url(${loginHeroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          {/* TOP BRAND BADGE */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '8px 16px',
            borderRadius: 14,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            width: 'fit-content'
          }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #0066ff, #00d2ff)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0, 102, 255, 0.4)'
            }}>
              <GraduationCap size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', letterSpacing: '0.3px', margin: 0 }}>
                E-SEKOLAH PRO
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px' }}>
                DIGITAL SMART CAMPUS
              </div>
            </div>
          </div>

          {/* BOTTOM HERO CONTENT OVERLAY */}
          <div style={{
            background: 'rgba(7, 19, 43, 0.75)',
            backdropFilter: 'blur(12px)',
            padding: '24px 20px',
            borderRadius: 20,
            border: '1px solid rgba(56, 189, 248, 0.25)',
            marginTop: 'auto'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.35, marginBottom: 8, color: '#ffffff' }}>
              Sistem Informasi Presensi & Manajemen Akademik
            </h2>
            <p style={{ fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              Platform pintar yang menghubungkan administrator, tenaga pendidik, dan presensi kelas dalam satu ekosistem terpadu.
            </p>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (CLEAN LOGIN FORM)
            ======================================================== */}
        <div className="login-form-side">
          {/* MOBILE-ONLY BRAND HEADER (Visible on small screens) */}
          <div style={{ textAlign: 'center', marginBottom: 20 }} className="mobile-header-show">
            <div style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #0284c7, #6366f1)',
              borderRadius: 18,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: 10,
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.45)',
              border: '2px solid rgba(255,255,255,0.25)'
            }}>
              <GraduationCap size={30} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              E-SEKOLAH PRO
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
              Sistem Presensi & Layanan Akademik
            </p>
          </div>

          {/* FORM HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Selamat Datang
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 12.5, marginTop: 4, margin: 0 }}>
                Silakan masuk untuk mengakses sistem
              </p>
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={22} />
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* USERNAME INPUT FIELD */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: 11.5, fontWeight: 700, marginBottom: 6, letterSpacing: '0.3px' }}>
                USERNAME / NIP / NIS / NISN / EMAIL
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: 14, color: '#38bdf8', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="NIP / NIS / NISN / Username"
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    padding: '0 14px 0 42px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1.5px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: 14,
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8';
                    e.target.style.boxShadow = '0 0 14px rgba(56, 189, 248, 0.3)';
                    e.target.style.background = 'rgba(30, 41, 59, 0.9)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(56, 189, 248, 0.25)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(30, 41, 59, 0.7)';
                  }}
                />
              </div>
            </div>

            {/* PASSWORD INPUT FIELD */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: 11.5, fontWeight: 700, marginBottom: 6, letterSpacing: '0.3px' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, color: '#38bdf8', pointerEvents: 'none' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun"
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    padding: '0 14px 0 42px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1.5px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: 14,
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8';
                    e.target.style.boxShadow = '0 0 14px rgba(56, 189, 248, 0.3)';
                    e.target.style.background = 'rgba(30, 41, 59, 0.9)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(56, 189, 248, 0.25)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(30, 41, 59, 0.7)';
                  }}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 50,
                marginTop: 6,
                background: 'linear-gradient(135deg, #0072ff, #0052cc)',
                border: 'none',
                borderRadius: 14,
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 8px 25px rgba(0, 114, 255, 0.4)',
                transition: 'all 0.15s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              <span>{loading ? 'Memverifikasi Data...' : 'Masuk Aplikasi'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* FOOTER MOTTO */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: 0 }}>
              <BookOpen size={14} /> Presensi Digital Transparan & Akurat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
