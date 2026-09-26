import React, { useState, useEffect } from 'react';
import { GraduationCap, Bell, LogOut, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export default function TopBar({ user, onLogout }) {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState({ text: 'Selamat Datang', emoji: '👋' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 4 && hour < 11) {
        setGreeting({ text: 'Selamat Pagi', emoji: '🌅' });
      } else if (hour >= 11 && hour < 15) {
        setGreeting({ text: 'Selamat Siang', emoji: '☀️' });
      } else if (hour >= 15 && hour < 19) {
        setGreeting({ text: 'Selamat Sore', emoji: '🌤️' });
      } else {
        setGreeting({ text: 'Selamat Malam', emoji: '🌙' });
      }

      const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      setCurrentDate(now.toLocaleDateString('id-ID', options));
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const displayName = user?.nama_guru || user?.username || 'Pengajar';
  const roleTitle = user?.type === 'Kelas' ? `Akun ${user.nama_kelas}` : (user?.role || 'Pengajar');
  const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <header className="header-blue-hero">
      {/* Decorative Glow & Ambient Blur Elements */}
      <div className="hero-glow-circle hero-glow-1"></div>
      <div className="hero-glow-circle hero-glow-2"></div>
      <div className="hero-glow-circle hero-glow-3"></div>

      <div className="header-inner">
        {/* TOP BRAND & CONTROLS */}
        <div className="header-top-row">
          <div className="brand-title">
            <div className="brand-logo-icon">
              <GraduationCap size={22} color="#ffffff" strokeWidth={2.2} />
            </div>
            <div className="brand-text">
              <span className="brand-name">E-SEKOLAH</span>
              <span className="brand-badge">
                <Sparkles size={10} color="#ffffff" style={{ marginRight: 3 }} />
                PRO
              </span>
            </div>
          </div>

          <div className="header-icons">
            {/* NOTIFICATION BUTTON WITH COUNTER BADGE */}
            <button className="header-icon-btn notif-btn-modern" title="Notifikasi Sistem">
              <Bell size={19} color="#ffffff" />
              <span className="notif-badge-pill">3</span>
            </button>

            {/* LOGOUT CRIMSON CAPSULE BUTTON */}
            <button className="logout-capsule-btn" onClick={onLogout} title="Keluar Akun">
              <LogOut size={15} color="#ffffff" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* HERO WELCOME USER CARD */}
        <div className="hero-welcome-card">
          <div className="hero-avatar-wrapper">
            <div className="user-avatar-circle">
              {user?.avatar ? (
                <img src={user.avatar} alt={displayName} />
              ) : (
                <span>{initials || 'ES'}</span>
              )}
            </div>
            <span className="avatar-online-dot" title="Aktif"></span>
          </div>

          <div className="hero-user-info">
            <div className="hero-greeting-line">
              <span className="greeting-emoji">{greeting.emoji}</span>
              <span className="greeting-label">{greeting.text},</span>
              <span className="user-role-badge">
                <ShieldCheck size={11} color="#38bdf8" />
                {roleTitle}
              </span>
            </div>

            <h2 className="hero-user-name">{displayName}</h2>

            <div className="hero-date-row">
              <Calendar size={13} className="hero-date-icon" />
              <span className="hero-date-text">{currentDate} • {currentTime}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
