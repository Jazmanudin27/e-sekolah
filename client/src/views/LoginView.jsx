import React, { useState } from 'react';
import {
  GraduationCap, Lock, ArrowRight, ShieldCheck, User,
  BookOpen, Sparkles, CheckCircle2, Users, Building2, Shield
} from 'lucide-react';
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

  return (
    <div className="login-responsive-container">
      <div className="login-card-wrapper">
        {/* ========================================================
            LEFT COLUMN (DESKTOP HERO SHOWCASE - HIDDEN ON MOBILE)
            ======================================================== */}
        <div className="login-hero-showcase">
          <div className="login-hero-glow"></div>

          <div>
            {/* BRAND CREST */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #38bdf8, #0052cc)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)'
              }}>
                <GraduationCap size={28} color="#ffffff" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '0.3px', color: '#ffffff' }}>
                  E-SEKOLAH PRO
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Sistem Informasi Terpadu
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3, marginBottom: 12, color: '#ffffff' }}>
              Pusat Layanan Presensi & Akademik Sekolah Modern
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 28 }}>
              Satu portal terintegrasi untuk seluruh ekosistem sekolah. Sistem otomatis mengarahkan peran dan modul kerja Anda.
            </p>

            {/* FEATURE BADGES LIST */}
            <div className="login-hero-feature-item">
              <div className="login-feature-icon">
                <Shield size={18} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Panel Administrator Desktop</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  Akses khusus akun `users` untuk kelola master guru, siswa, kelas, mapel & rekap.
                </div>
              </div>
            </div>

            <div className="login-hero-feature-item">
              <div className="login-feature-icon">
                <Users size={18} color="#34d399" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Portal Pengajar & Guru</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  Presensi mandiri, scan jam masuk/pulang, jadwal mengajar, dan absensi mapel.
                </div>
              </div>
            </div>

            <div className="login-hero-feature-item">
              <div className="login-feature-icon">
                <Building2 size={18} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Akun Absensi Kelas</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  Input kehadiran harian siswa khusus untuk masing-masing kelas.
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER BADGE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 16 }}>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
              Smart Role Detection • v2.6.0
            </span>
            <span style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: 10,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              SECURE SSO
            </span>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (LOGIN FORM - RESPONSIVE FOR ALL DEVICES)
            ======================================================== */}
        <div className="login-form-side">
          {/* MOBILE-ONLY HEADER LOGO (Shown when Left Column is hidden on small screens) */}
          <div style={{ textAlign: 'center', marginBottom: 20 }} className="mobile-header-show">
            <div style={{
              width: 58,
              height: 58,
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
              <GraduationCap size={32} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              SMK ARTANITA
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
              Sistem Informasi & Presensi Terpadu
            </p>
          </div>

          {/* FORM HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Masuk Portal Terpadu
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, margin: 0 }}>
                Silakan masukkan kredensial akun Anda
              </p>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={20} />
            </div>
          </div>

          {/* ROLE IDENTIFIER TAGS */}
          <div style={{
            display: 'flex',
            gap: 6,
            marginBottom: 20,
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '8px 10px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: 6 }}>
              🛡️ Admin
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 8px', borderRadius: 6 }}>
              👨‍🏫 Guru
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', padding: '2px 8px', borderRadius: 6 }}>
              🏫 Kelas
            </span>
            <span style={{ fontSize: 10.5, color: '#94a3b8', marginLeft: 'auto', alignSelf: 'center', fontWeight: 600 }}>
              Auto-detect
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* USERNAME INPUT FIELD */}
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: 11.5, fontWeight: 700, marginBottom: 6, letterSpacing: '0.3px' }}>
                USERNAME / NIP / EMAIL
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: 14, color: '#38bdf8', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan NIP, Email, atau Username"
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
                PASSWORD AKSES
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
                height: 48,
                marginTop: 6,
                background: 'linear-gradient(135deg, #0072ff, #0052cc)',
                border: 'none',
                borderRadius: 14,
                color: '#ffffff',
                fontSize: 14.5,
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
              <span>{loading ? 'Memverifikasi Akun...' : 'Masuk Aplikasi'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* FOOTER MOTTO */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: 0 }}>
              <BookOpen size={13} /> E-Sekolah Digital • Aman & Transparan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
