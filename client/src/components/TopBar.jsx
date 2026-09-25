import React, { useState, useEffect } from 'react';
import { GraduationCap, Bell, Search, LogOut } from 'lucide-react';

export default function TopBar({ user, onLogout }) {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      const dateStr = now.toLocaleDateString('id-ID', options);
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      setCurrentDateTime(`${dateStr} | ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const rawName = user?.nama_guru || user?.username || 'Bu Citra';

  const getCleanName = (name) => {
    if (!name) return 'Bu Citra';
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
  const initials = rawName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <header className="header-blue-hero">
      <div className="header-inner">
        <div className="header-top-row">
          <div className="brand-title">
            <GraduationCap size={22} color="#ffffff" />
            <span>E-Sekolah</span>
          </div>
          <div className="header-icons">
            <button className="header-icon-btn" title="Notifikasi">
              <Bell size={20} />
              <span className="bell-dot"></span>
            </button>
            <button className="header-icon-btn" title="Cari">
              <Search size={20} />
            </button>
            <button className="header-icon-btn" onClick={onLogout} title="Keluar Akun">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="user-profile-row">
          <div className="user-avatar-circle">
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} />
            ) : (
              <span>{initials || 'BC'}</span>
            )}
          </div>
          <div className="user-text-col">
            <div className="greeting-text">Selamat Datang, {displayName}!</div>
            <div className="date-time-text">{currentDateTime || 'Senin, 18 Oktober 2023 | 08:30 WIB'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

