import React from 'react';
import { Home, Users, Fingerprint, Bell, User } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenPresensi }) {
  return (
    <nav className="bottom-nav-white">
      <div className="bottom-nav-inner">
        <button
          className={`nav-link-item ${activeTab === 'beranda' ? 'active' : ''}`}
          onClick={() => onTabChange('beranda')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          className={`nav-link-item ${activeTab === 'siswa' || activeTab === 'absensiSiswa' ? 'active' : ''}`}
          onClick={() => onTabChange('siswa')}
        >
          <Users size={20} />
          <span>Siswa</span>
        </button>

        {/* CENTER FLOATING FINGERPRINT FAB */}
        <button
          className="floating-center-fab"
          onClick={() => onOpenPresensi?.('in')}
          title="Scan Presensi Fingerprint"
        >
          <Fingerprint size={32} />
        </button>

        <button
          className={`nav-link-item ${activeTab === 'notifikasi' ? 'active' : ''}`}
          onClick={() => onTabChange('riwayat')}
        >
          <Bell size={20} />
          <span>Notifikasi</span>
        </button>

        <button
          className={`nav-link-item ${activeTab === 'profil' ? 'active' : ''}`}
          onClick={() => onTabChange('jadwal')}
        >
          <User size={20} />
          <span>Profil</span>
        </button>
      </div>
    </nav>
  );
}

