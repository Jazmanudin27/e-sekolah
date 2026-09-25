import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin, Send, Smile } from 'lucide-react';
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
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>
            {type === 'in' ? 'Absen Masuk (Check-In)' : 'Absen Pulang (Check-Out)'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          width: '100%', height: 200, background: '#000', borderRadius: 14,
          position: 'relative', overflow: 'hidden', marginBottom: 16,
          border: '2px dashed #38bdf8', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center'
        }}>
          <Smile size={42} style={{ color: '#10b981', marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Posisikan Wajah Anda di Dalam Bingkai Kamera</p>
        </div>

        <div style={{
          display: 'flex', gap: 12, background: 'rgba(15, 23, 42, 0.7)',
          padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 12
        }}>
          <MapPin size={24} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#fff' }}>Lokasi Terdeteksi (GPS)</div>
            <div style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{coords}</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>SMK Artanita, Kota Tasikmalaya</div>
          </div>
        </div>

        <button className="btn btn-emerald btn-block" onClick={handleSubmit} disabled={loading}>
          <Send size={16} />
          <span>{loading ? 'Mengirim...' : 'Kirim Presensi Sekarang'}</span>
        </button>
      </div>
    </div>
  );
}
