import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import PresensiModal from './components/PresensiModal';
import LoginView from './views/LoginView';
import BerandaView from './views/BerandaView';
import AbsensiSiswaView from './views/AbsensiSiswaView';
import AbsensiMapelView from './views/AbsensiMapelView';
import JadwalView from './views/JadwalView';
import RiwayatView from './views/RiwayatView';
import api from './api/client';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('beranda');
  const [presensiModalType, setPresensiModalType] = useState(null); // 'in', 'out' or null
  const [toast, setToast] = useState({ show: false, message: '', isSuccess: true });
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

  const showToast = (message, isSuccess = true) => {
    setToast({ show: true, message, isSuccess });
    setTimeout(() => {
      setToast({ show: false, message: '', isSuccess: true });
    }, 3000);
  };

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem('esekolah_token', token);
    setCurrentUser(user);
    setActiveTab('beranda');
  };

  const handleLogout = () => {
    localStorage.removeItem('esekolah_token');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#38bdf8', fontWeight: 600 }}>Memuat E-Sekolah Mobile...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-shell" style={{ background: '#070a14', minHeight: '100vh' }}>
        {toast.show && (
          <div className="toast-msg">
            {toast.isSuccess ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> : <XCircle size={18} style={{ color: '#f43f5e' }} />}
            <span>{toast.message}</span>
          </div>
        )}
        <LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-msg">
          {toast.isSuccess ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> : <XCircle size={18} style={{ color: '#f43f5e' }} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content-area">
        <TopBar user={currentUser} onLogout={handleLogout} />

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
