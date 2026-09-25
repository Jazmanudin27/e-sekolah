import React from 'react';
import { LogOut } from 'lucide-react';

export default function TopBar({ user, onLogout }) {
  const name = user?.nama_guru || 'Ali Irsan Shafar, S.H., M.Pd';
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div className="header-hero">
      <div className="header-user">
        <div className="user-left">
          <div className="avatar-wrapper">{initials}</div>
          <div>
            <div className="welcome-sub">Selamat datang,</div>
            <div className="welcome-title">{name}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout} title="Keluar Akun">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
