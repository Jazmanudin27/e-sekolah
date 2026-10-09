import React from 'react';
import { Users, GraduationCap, BookOpen } from 'lucide-react';

export default function PresensiSubTabNav({ activeSubTab = 'guru', onTabChange }) {
  if (!onTabChange) return null;

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, flexWrap: 'wrap' }}>
      <button
        type="button"
        className={`btn-outline-admin ${activeSubTab === 'guru' ? 'active' : ''}`}
        onClick={() => onTabChange('guru')}
        style={{
          background: activeSubTab === 'guru' ? '#0066ff' : '#ffffff',
          color: activeSubTab === 'guru' ? '#ffffff' : '#475569',
          borderColor: activeSubTab === 'guru' ? '#0066ff' : '#cbd5e1',
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <Users size={16} color={activeSubTab === 'guru' ? '#ffffff' : '#475569'} /> Presensi Guru
      </button>

      <button
        type="button"
        className={`btn-outline-admin ${activeSubTab === 'siswa' ? 'active' : ''}`}
        onClick={() => onTabChange('siswa')}
        style={{
          background: activeSubTab === 'siswa' ? '#0066ff' : '#ffffff',
          color: activeSubTab === 'siswa' ? '#ffffff' : '#475569',
          borderColor: activeSubTab === 'siswa' ? '#0066ff' : '#cbd5e1',
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <GraduationCap size={16} color={activeSubTab === 'siswa' ? '#ffffff' : '#475569'} /> Absensi Siswa
      </button>

      <button
        type="button"
        className={`btn-outline-admin ${activeSubTab === 'mapel' ? 'active' : ''}`}
        onClick={() => onTabChange('mapel')}
        style={{
          background: activeSubTab === 'mapel' ? '#0066ff' : '#ffffff',
          color: activeSubTab === 'mapel' ? '#ffffff' : '#475569',
          borderColor: activeSubTab === 'mapel' ? '#0066ff' : '#cbd5e1',
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <BookOpen size={16} color={activeSubTab === 'mapel' ? '#ffffff' : '#475569'} /> Absensi Mapel
      </button>
    </div>
  );
}
