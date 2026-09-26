import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import TopBar from './components/TopBar';
import SubHeader from './components/SubHeader';
import BottomNav from './components/BottomNav';
import PresensiModal from './components/PresensiModal';
import LoginView from './views/LoginView';
import BerandaView from './views/BerandaView';
import AbsensiSiswaView from './views/AbsensiSiswaView';
import AbsensiMapelView from './views/AbsensiMapelView';
import JadwalView from './views/JadwalView';
import RiwayatView from './views/RiwayatView';
import api from './api/client';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('beranda');
  const [presensiModalType, setPresensiModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('esekolah_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setCurrentUser(res.data.data);
      } else {
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, isSuccess = true, title = null) => {
    Swal.fire({
      title: title || (isSuccess ? 'Berhasil!' : 'Perhatian'),
      text: message,
      icon: isSuccess ? 'success' : 'error',
      confirmButtonColor: '#0066ff',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'swal2-custom-popup'
      }
    });
  };

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem('esekolah_token', token);
    setCurrentUser(user);
    setActiveTab('beranda');
    Swal.fire({
      title: 'Login Berhasil!',
      text: `Selamat datang kembali, ${user.nama_guru || user.username || 'Pengajar'}!`,
      icon: 'success',
      confirmButtonColor: '#0066ff',
      timer: 2200,
      timerProgressBar: true,
      customClass: {
        popup: 'swal2-custom-popup'
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('esekolah_token');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#0066ff', fontWeight: 600 }}>Memuat E-Sekolah Mobile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-shell" style={{ background: '#070a14', minHeight: '100vh' }}>
        <LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Conditionally Render Header based on activeTab */}
      {activeTab === 'beranda' && (
        <TopBar user={currentUser} onLogout={handleLogout} />
      )}

      {activeTab === 'absensiSiswa' && (
        <SubHeader
          title="Absensi Siswa"
          subtitle="Input data kehadiran siswa per kelas"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'absensiMapel' && (
        <SubHeader
          title="Absensi Mapel"
          subtitle="Catat kehadiran siswa pada jam mengajar"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'jadwal' && (
        <SubHeader
          title="Jadwal Pengajar"
          subtitle="Jadwal mengajar dan kelas minggu ini"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'riwayat' && (
        <SubHeader
          title="Riwayat Presensi"
          subtitle="Catatan dan rekap kehadiran presensi"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {/* Main Content Area */}
      <main className="main-content-area">
        {activeTab === 'beranda' && (
          <BerandaView
            onOpenPresensiModal={(type) => setPresensiModalType(type)}
            onSwitchTab={(t) => setActiveTab(t)}
          />
        )}
        {activeTab === 'absensiSiswa' && <AbsensiSiswaView showToast={showToast} />}
        {activeTab === 'absensiMapel' && <AbsensiMapelView user={currentUser} showToast={showToast} />}
        {activeTab === 'jadwal' && <JadwalView />}
        {activeTab === 'riwayat' && <RiwayatView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(t) => setActiveTab(t)} />

      {/* Presensi Check-In / Check-Out Modal */}
      {presensiModalType && (
        <PresensiModal
          type={presensiModalType}
          onClose={() => setPresensiModalType(null)}
          onSuccess={() => setActiveTab('beranda')}
          showToast={showToast}
        />
      )}
    </div>
  );
}
