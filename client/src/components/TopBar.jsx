import React, { useState, useEffect } from 'react';
import { GraduationCap, Bell, LogOut, Calendar, KeyRound } from 'lucide-react';
import UpdateCredentialsModal from './UpdateCredentialsModal';

export default function TopBar({ user, onLogout, onUserUpdated }) {
  const [showAccountModal, setShowAccountModal] = useState(false);
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
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const displayName = user?.nama_guru || user?.nama_kelas || user?.username || 'Pengguna';
  const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();

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
              <GraduationCap size={18} color="#ffffff" />
            </div>
            <div className="brand-text">
              <span className="brand-name">E-Sekolah</span>
              <span className="brand-badge">PRO</span>
            </div>
          </div>

          <div className="header-icons">
            <button
              type="button"
              className="header-icon-btn key-btn-hero"
              onClick={() => setShowAccountModal(true)}
              title="Ubah Username & Password"
            >
              <KeyRound size={17} />
            </button>
            <button className="header-icon-btn notif-btn-hero" title="Notifikasi">
              <Bell size={18} />
              <span className="bell-dot"></span>
            </button>
            <button className="header-icon-btn logout-btn-hero" onClick={onLogout} title="Keluar Akun">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* HERO WELCOME USER CARD */}
        <div className="hero-welcome-card">
          <div
            className="hero-avatar-wrapper"
            onClick={() => setShowAccountModal(true)}
            style={{ cursor: 'pointer' }}
            title="Klik untuk ubah username / password"
          >
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
              <Calendar size={12} className="hero-date-icon" />
              <span className="hero-date-text">
                {currentDate} &bull; <span className="live-clock-badge"><span className="live-clock-dot"></span>{currentTime}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL UBAH USERNAME & PASSWORD */}
      {showAccountModal && (
        <UpdateCredentialsModal
          user={user}
          onClose={() => setShowAccountModal(false)}
          onUpdateSuccess={onUserUpdated}
        />
      )}
    </header>
  );
}
