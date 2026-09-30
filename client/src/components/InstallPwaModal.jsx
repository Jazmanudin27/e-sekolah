import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed & running as app)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iosDevice);

    // Listen for Chrome/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user dismissed prompt recently in this session
      const dismissed = sessionStorage.getItem('esekolah_pwa_dismissed');
      if (!dismissed) {
        // Show modal after 1.5 seconds for great UX
        setTimeout(() => setShowModal(true), 1500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, also offer install guide
    if (iosDevice && !sessionStorage.getItem('esekolah_pwa_dismissed')) {
      setTimeout(() => setShowModal(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        alert('Untuk menginstall di iPhone/iPad:\n1. Ketik ikon "Share" (Bagikan) di bagian bawah Safari\n2. Pilih "Tambahkan ke Layar Utama" (Add to Home Screen)');
      } else {
        alert('Petunjuk Install Manual (Chrome):\n1. Klik ikon Titik Tiga (⋮) di sudut kanan atas Chrome\n2. Pilih "Install aplikasi" atau "Tambahkan ke Layar Utama" (Add to Home Screen)');
      }
      return;
    }

    try {
      setIsInstalling(true);
      // Show Native Install Prompt
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (err) {
      console.error('Error during PWA install:', err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('esekolah_pwa_dismissed', 'true');
    setShowModal(false);
  };

  if (isInstalled || !showModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(7, 19, 43, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'linear-gradient(145deg, #0f172a, #1e293b)',
          borderRadius: 24,
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '24px 20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.25)',
          position: 'relative',
          color: '#ffffff',
          textAlign: 'center',
          animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* LOGO SHOWCASE */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: 22,
              background: '#ffffff',
              padding: 6,
              boxShadow: '0 8px 30px rgba(0, 102, 255, 0.4), 0 0 0 3px rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            <img
              src="/logo.png"
              alt="Logo SMK Artanita"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 16 }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0f172a'
            }}
          >
            <Sparkles size={14} />
          </div>
        </div>

        {/* TITLE & APP INFO */}
        <h3 style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.2px' }}>
          Install Aplikasi E-Sekolah
        </h3>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px 0', lineHeight: 1.45 }}>
          Pasang aplikasi <strong>SIARTAS SMK Artanita</strong> di HP Anda untuk akses presensi cepat tanpa lewat browser!
        </p>

        {/* ADVANTAGES LIST */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: 16,
            padding: '12px 14px',
            marginBottom: 20,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#cbd5e1' }}>
            <CheckCircle2 size={16} color="#38bdf8" />
            <span>Akses 1-Klik langsung dari Layar Utama HP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#cbd5e1' }}>
            <CheckCircle2 size={16} color="#38bdf8" />
            <span>Tampilan Fullscreen layaknya Aplikasi Android/iOS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#cbd5e1' }}>
            <CheckCircle2 size={16} color="#38bdf8" />
            <span>Notifikasi & scan presensi lebih stabil</span>
          </div>
        </div>

        {/* INSTALL BUTTON */}
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          style={{
            width: '100%',
            height: 48,
            background: isInstalling ? '#334155' : 'linear-gradient(135deg, #0066ff, #0052cc)',
            border: 'none',
            borderRadius: 14,
            color: '#ffffff',
            fontSize: 14.5,
            fontWeight: 700,
            cursor: isInstalling ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: isInstalling ? 'none' : '0 6px 20px rgba(0, 102, 255, 0.45)',
            marginBottom: 10,
            opacity: isInstalling ? 0.8 : 1,
            transition: 'transform 0.15s ease'
          }}
        >
          <Download size={18} />
          <span>
            {isInstalling 
              ? 'Memproses Install...' 
              : (isIOS ? 'Petunjuk Install iOS' : 'Install Aplikasi Sekarang')}
          </span>
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px'
          }}
        >
          Nanti Saja
        </button>
      </div>
    </div>
  );
}
