import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish, duration = 2000 }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out slightly before duration ends
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 400);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`splash-screen-container ${fadeOut ? 'splash-fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0f172a',
        overflow: 'hidden'
      }}
    >
      {/* Main Animated Content Box */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Animated Logo Display */}
        <div className="splash-logo-wrapper" style={{ width: 100, height: 100, marginBottom: 16 }}>
          <img
            src="/logo.png"
            alt="Ruang Sekolah"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              animation: 'splashLogoPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both'
            }}
          />
        </div>

        {/* Brand Name & Tagline */}
        <div className="splash-brand-row" style={{ marginBottom: 4 }}>
          <h1 className="splash-brand-title" style={{ color: '#0f172a', textShadow: 'none', fontSize: 24, fontWeight: 800 }}>
            E-Sekolah
          </h1>
          <span className="splash-pro-badge" style={{ fontSize: 9, padding: '2px 7px', borderRadius: 6 }}>PRO</span>
        </div>

        <p className="splash-subtitle" style={{ color: '#64748b', fontSize: 12, marginBottom: 28 }}>
          Sistem Presensi & Manajemen Sekolah Digital
        </p>

        {/* Loading Progress Bar & Spinner */}
        <div className="splash-loader-box">
          <div className="splash-progress-track" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <div className="splash-progress-fill" style={{ background: 'linear-gradient(90deg, #1e40af, #2563eb)' }} />
          </div>
          <div className="splash-status-text" style={{ color: '#94a3b8', fontSize: 11 }}>
            <Sparkles size={13} className="splash-sparkle-icon" color="#2563eb" />
            <span>Memuat aplikasi...</span>
          </div>
        </div>
      </div>

      {/* Footer Powered By */}
      <div className="splash-footer-text" style={{ color: '#94a3b8', fontSize: 10.5 }}>
        E-Sekolah &bull; Digital Campus
      </div>
    </div>
  );
}
