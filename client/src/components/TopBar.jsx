import React from 'react';
import { LogOut } from 'lucide-react';

export default function TopBar({ user, onLogout }) {
  const initials = user?.nama_guru
    ? user.nama_guru.split(' ').slice(0, 2).map(n => n[0]).join('')
    : 'G';

  return (
    <header className="top-bar">
      <div className="user-info">
        <div className="avatar">{initials}</div>
        <div className="user-text">
          <h3>{user?.nama_guru || 'Pengguna Guru'}</h3>
          <span className="badge">{user?.role || 'Guru SMK ARTANITA'}</span>
        </div>
      </div>
      <button className="icon-btn" onClick={onLogout} title="Keluar">
        <LogOut size={18} />
      </button>
    </header>
  );
}
