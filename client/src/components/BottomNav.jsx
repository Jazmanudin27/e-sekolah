import React from 'react';
import { Home, Users, BookOpen, Calendar, Clock } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'absensiSiswa', label: 'Absen Siswa', icon: Users },
    { id: 'absensiMapel', label: 'Absen Mapel', icon: BookOpen },
    { id: 'jadwal', label: 'Jadwal', icon: Calendar },
    { id: 'riwayat', label: 'Riwayat', icon: Clock },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
