import React, { useState, useEffect } from 'react';
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
      {/* RENDER CONTENT BY ACTIVE SUBTAB DENGAN SUBTAB TOGGLE DI ATAS FILTER DALAM PANEL */}
      {activeSubTab === 'guru' && (
        <AdminPresensiGuruTab activeSubTab={activeSubTab} onTabChange={setActiveSubTab} />
      )}
      {activeSubTab === 'siswa' && (
        <AdminAbsensiSiswaTab activeSubTab={activeSubTab} onTabChange={setActiveSubTab} />
      )}
      {activeSubTab === 'mapel' && (
        <AdminAbsensiMapelTab activeSubTab={activeSubTab} onTabChange={setActiveSubTab} />
      )}
    </div>
  );
}
