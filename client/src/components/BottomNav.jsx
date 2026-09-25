import React from 'react';
import { Home, Fingerprint, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenPresensi }) {
  return (
    <nav className="bottom-nav-bar">
      <button
        className={`nav-btn-item ${activeTab === 'beranda' ? 'active' : ''}`}
        onClick={() => onTabChange('beranda')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      {/* CENTER FLOATING FINGERPRINT FAB */}
      <button
        className="fab-center-btn"
        onClick={() => onOpenPresensi('in')}
        title="Scan Presensi Fingerprint"
      >
        <Fingerprint size={32} />
      </button>

      <button
        className={`nav-btn-item ${activeTab === 'riwayat' ? 'active' : ''}`}
        onClick={() => onTabChange('riwayat')}
      >
        <Settings size={22} />
        <span>Settings</span>
      </button>
    </nav>
  );
}
