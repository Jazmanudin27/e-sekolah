import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, CheckSquare } from 'lucide-react';
import AdminPresensiGuruTab from './AdminPresensiGuruTab';
import AdminAbsensiSiswaTab from './AdminAbsensiSiswaTab';
import AdminAbsensiMapelTab from './AdminAbsensiMapelTab';

export default function AdminPresensiAbsensiTab({ initialSubTab = 'guru' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <div>
      {/* SUBTAB TOGGLE (PERSIS SEPERTI REKAP PRESENSI & ABSENSI) */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 12,
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          className={`btn-outline-admin ${activeSubTab === 'guru' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('guru')}
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
          <Users size={16} /> Presensi Guru
        </button>

        <button
          type="button"
          className={`btn-outline-admin ${activeSubTab === 'siswa' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('siswa')}
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
          <GraduationCap size={16} /> Absensi Siswa
        </button>

        <button
          type="button"
          className={`btn-outline-admin ${activeSubTab === 'mapel' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('mapel')}
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
          <BookOpen size={16} /> Absensi Mapel
        </button>
      </div>

      {/* RENDER CONTENT BY ACTIVE SUBTAB */}
      {activeSubTab === 'guru' && <AdminPresensiGuruTab />}
      {activeSubTab === 'siswa' && <AdminAbsensiSiswaTab />}
      {activeSubTab === 'mapel' && <AdminAbsensiMapelTab />}
    </div>
  );
}
