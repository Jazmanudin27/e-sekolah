import React, { useState } from 'react';
import { GraduationCap, Lock, ArrowRight, ShieldCheck, User, BookOpen } from 'lucide-react';
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
    <div style={{
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#070a14',
      backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.22), rgba(7, 10, 20, 0.98) 75%)',
      position: 'relative',
      boxSizing: 'border-box'
    }}>

      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* EDUCATIONAL HERO HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {/* SCHOOL CREST EMBLEM */}
          <div style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #0284c7, #6366f1)',
            borderRadius: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 16,
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.45), inset 0 0 15px rgba(255,255,255,0.3)',
            border: '2px solid rgba(255,255,255,0.25)'
          }}>
            <GraduationCap size={48} />
          </div>

          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: '#ffffff',
            margin: 0
          }}>
            SMK ARTANITA
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
            Sistem Informasi & Presensi Digital Terpadu
          </p>
        </div>

        {/* LOGIN CARD */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 24,
          padding: '28px 24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(56, 189, 248, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>Masuk Akun Pengajar</h2>
              <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, margin: 0 }}>Silakan masukkan NIP / Email Guru</p>
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 14,
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
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: '0.3px' }}>
                NIP / EMAIL / USERNAME
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <User size={18} style={{ position: 'absolute', left: 14, color: '#38bdf8', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan NIP atau Email"
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    padding: '0 14px 0 42px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1.5px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: 14,
                    color: '#ffffff',
                    fontSize: 14,
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
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: '0.3px' }}>
                PASSWORD AKSES
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, color: '#38bdf8', pointerEvents: 'none' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password anda"
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    padding: '0 14px 0 42px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1.5px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: 14,
                    color: '#ffffff',
                    fontSize: 14,
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
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              <span>{loading ? 'Verifikasi Data Akun...' : 'Masuk Portal Presensi'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* FOOTER MOTTO */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: 0 }}>
            <BookOpen size={14} /> Presensi Digital Transparan & Akurat
          </p>
        </div>

      </div>
    </div>
  );
}
