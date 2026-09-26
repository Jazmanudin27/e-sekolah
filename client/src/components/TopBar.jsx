import React, { useState, useEffect } from 'react';
import { GraduationCap, Bell, Search, LogOut, Calendar } from 'lucide-react';

export default function TopBar({ user, onLogout }) {
  const [currentDate, setCurrentDate] = useState('');
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
    };

    updateTime();
  }, []);

  const rawName = user?.nama_guru || user?.username || 'Pengajar';

  const getCleanName = (name) => {
    if (!name) return 'Pengajar';
    let clean = name.split(',')[0].trim();
    if (clean.startsWith('Pak') || clean.startsWith('Bu') || clean.startsWith('Guru')) {
      return clean;
    }
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length > 2) {
      clean = parts.slice(0, 2).join(' ');
    }
    return `Pak ${clean}`;
  };

  const displayName = getCleanName(rawName);
  const initials = rawName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <header className="header-blue-hero">
      {/* Decorative Glow Elements */}
      <div className="hero-glow-circle hero-glow-1"></div>
      <div className="hero-glow-circle hero-glow-2"></div>

      <div className="header-inner">
        {/* TOP BRAND & CONTROLS */}
        <div className="header-top-row">
          <div className="brand-title">
            <div className="brand-logo-icon">
              <GraduationCap size={20} color="#ffffff" />
            </div>
            <div className="brand-text">
              <span className="brand-name">E-Sekolah</span>
              <span className="brand-badge">PRO</span>
            </div>
          </div>

          <div className="header-icons">
            <button className="header-icon-btn" title="Notifikasi">
              <Bell size={19} />
              <span className="bell-dot"></span>
            </button>
            <button className="header-icon-btn" title="Cari Data">
              <Search size={19} />
            </button>
            <button className="header-icon-btn logout-btn-hero" onClick={onLogout} title="Keluar Akun">
              <LogOut size={17} />
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
            </div>

            <h2 className="hero-user-name">{displayName}</h2>

            <div className="hero-date-row">
              <Calendar size={13} className="hero-date-icon" />
              <span className="hero-date-text">{currentDate}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
