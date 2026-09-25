import React, { useState, useEffect } from 'react';
import { X, MapPin, Send, Smile, ShieldCheck } from 'lucide-react';
import api from '../api/client';

export default function PresensiModal({ type, onClose, onSuccess, showToast }) {
  const [coords, setCoords] = useState('-7.325205, 108.208354');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
        () => setCoords('-7.325205, 108.208354')
      );
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const endpoint = type === 'in' ? '/presensi/checkin' : '/presensi/checkout';
    try {
      const res = await api.post(endpoint, {
        lokasi: coords,
        foto: 'upload/presensi/selfie.jpg'
      });
      if (res.data.success) {
        showToast(res.data.message, true);
        onSuccess();
        onClose();
      } else {
        showToast(res.data.message || 'Presensi gagal.', false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan jaringan.', false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(2, 4, 10, 0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 380, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={20} style={{ color: '#38bdf8' }} />
            {type === 'in' ? 'Absen Masuk (Check-In)' : 'Absen Pulang (Check-Out)'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* CAMERA PREVIEW WITH SCANNER LASER ANIMATION */}
        <div style={{
          width: '100%', height: 210, background: '#0a0f1d', borderRadius: 16,
          position: 'relative', overflow: 'hidden', marginBottom: 16,
          border: '2px solid rgba(56, 189, 248, 0.4)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)'
        }}>
          <div className="scanner-line"></div>
          <Smile size={48} style={{ color: '#10b981', marginBottom: 10, filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))' }} />
          <p style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>Kamera Selfie & Biometrik Wajah</p>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Posisikan wajah Anda di dalam area deteksi</p>
        </div>

        <div style={{
          display: 'flex', gap: 12, background: 'rgba(10, 15, 28, 0.9)',
          padding: 14, borderRadius: 14, marginBottom: 18, fontSize: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <MapPin size={24} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#fff' }}>Lokasi Terverifikasi (GPS)</div>
            <div style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600, margin: '2px 0' }}>{coords}</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>SMK Artanita, Kota Tasikmalaya</div>
          </div>
        </div>

        <button className="btn btn-emerald btn-block" onClick={handleSubmit} disabled={loading}>
          <Send size={18} />
          <span>{loading ? 'Mengirim Presensi...' : 'Kirim Presensi Sekarang'}</span>
        </button>
      </div>
    </div>
  );
}
