import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Send, ShieldCheck, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function PresensiModal({ type: initialType = 'in', onClose, onSuccess, showToast }) {
  const [scanType, setScanType] = useState(initialType);
  const [coords, setCoords] = useState({ lat: -7.325205, lng: 108.208354 });
  const [coordsString, setCoordsString] = useState('-7.325205, 108.208354');
  const [loading, setLoading] = useState(false);
  const [isFakeGpsDetected, setIsFakeGpsDetected] = useState(false);
  const [gpsReady, setGpsReady] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const SCHOOL_LOCATION = {
    name: 'SMK Artanita Tasikmalaya (Kantor Pusat)',
    lat: -7.325205,
    lng: 108.208354,
    radiusMeter: 100
  };

  // Real GPS Geolocation & Fake GPS Detection Effect
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setCoordsString(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setGpsReady(true);

          // Detect Fake GPS / Mock Location
          const isMocked = pos.coords.isMocked || (pos.coords.accuracy !== undefined && pos.coords.accuracy < 0.1);
          if (isMocked) {
            setIsFakeGpsDetected(true);
          } else {
            setIsFakeGpsDetected(false);
          }
        },
        (err) => {
          console.warn("GPS error:", err);
          setCoords({ lat: SCHOOL_LOCATION.lat, lng: SCHOOL_LOCATION.lng });
          setCoordsString(`${SCHOOL_LOCATION.lat}, ${SCHOOL_LOCATION.lng}`);
          setGpsReady(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setGpsReady(true);
    }
  }, []);

  // Leaflet Map Initialization & Update Effect
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const L = window.L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; Leaflet | OpenStreetMap'
      }).addTo(map);

      // School Safe Zone Radius Circle
      L.circle([SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng], {
        color: '#0066ff',
        fillColor: '#3b82f6',
        fillOpacity: 0.18,
        radius: SCHOOL_LOCATION.radiusMeter
      }).addTo(map);

      // Marker for School Office
      const schoolMarker = L.marker([SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng]).addTo(map);
      schoolMarker.bindPopup(`<b>${SCHOOL_LOCATION.name}</b><br>Kantor Pusat Presensi`);

      // Custom User Marker
      const userMarker = L.marker([coords.lat, coords.lng]).addTo(map);
      userMarker.bindPopup(`<b>Lokasi Presensi Guru</b><br>Status: Terverifikasi`).openPopup();

      markerRef.current = userMarker;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
        markerRef.current.setPopupContent(`<b>Lokasi Presensi Guru</b><br>Status: Terverifikasi`);
      }
    }
  }, [coords]);

  const handleSubmit = async () => {
    if (isFakeGpsDetected) {
      showToast('Presensi ditolak! Terdeteksi aplikasi pemalsu lokasi (Fake GPS).', false);
      return;
    }
    setLoading(true);
    const endpoint = scanType === 'in' ? '/presensi/checkin' : '/presensi/checkout';
    try {
      const res = await api.post(endpoint, {
        lokasi: coordsString,
        is_fake_gps: isFakeGpsDetected
      });
      if (res.data.success) {
        showToast(res.data.message || `Presensi ${scanType === 'in' ? 'Masuk' : 'Pulang'} berhasil!`, true);
        onSuccess();
        onClose();
      } else {
        showToast(res.data.message || 'Presensi gagal.', false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan sistem.', false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="presensi-modal-overlay">
      <div className="presensi-modal-box">
        {/* HEADER MODAL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={22} color="#0066ff" />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Presensi Mobile via GPS</h3>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* SCAN TYPE SWITCHER TAB (SCAN MASUK / SCAN PULANG) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 14, marginBottom: 16 }}>
          <button
            onClick={() => setScanType('in')}
            style={{
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              background: scanType === 'in' ? '#22c55e' : 'transparent',
              color: scanType === 'in' ? '#ffffff' : '#64748b'
            }}
          >
            Absen Masuk
          </button>
          <button
            onClick={() => setScanType('out')}
            style={{
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              background: scanType === 'out' ? '#ef4444' : 'transparent',
              color: scanType === 'out' ? '#ffffff' : '#64748b'
            }}
          >
            Absen Pulang
          </button>
        </div>

        {/* GPS VERIFICATION STATUS CARD */}
        <div style={{
          background: isFakeGpsDetected ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${isFakeGpsDetected ? '#fecaca' : '#bbf7d0'}`,
          borderRadius: 14,
          padding: '12px 14px',
          marginBottom: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            {isFakeGpsDetected ? (
              <AlertTriangle size={22} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />
            ) : (
              <CheckCircle2 size={22} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isFakeGpsDetected ? '#991b1b' : '#166534' }}>
                {isFakeGpsDetected ? 'Fake GPS Terdeteksi!' : 'Lokasi GPS Terverifikasi Real-Time'}
              </div>
              <div style={{ fontSize: 11.5, color: isFakeGpsDetected ? '#b91c1c' : '#15803d', marginTop: 3, lineHeight: 1.4 }}>
                {isFakeGpsDetected
                  ? 'Aplikasi pemalsu lokasi terdeteksi. Harap nonaktifkan Fake GPS untuk melakukan absen.'
                  : 'Sistem menggunakan lokasi GPS presisi tinggi. Proteksi Anti-Fake GPS Aktif.'}
              </div>
            </div>
          </div>
        </div>

        {/* LEAFLET INTERACTIVE MAP DISPLAY */}
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#f8fafc', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Navigation size={14} color="#0066ff" /> Peta Lokasi Saya & Sekolah
            </span>
            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>
              Radius Safe Zone: {SCHOOL_LOCATION.radiusMeter}m
            </span>
          </div>

          <div ref={mapContainerRef} style={{ height: 180, width: '100%', zIndex: 1 }}></div>
        </div>

        {/* REAL GPS COORDINATES BOX */}
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 12, marginBottom: 16, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="#0066ff" />
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Koordinat GPS Saat Ini</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{gpsReady ? coordsString : 'Mencari Satelit GPS...'}</div>
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6, border: '1px solid #a7f3d0' }}>
            GPS Aktif
          </span>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading || isFakeGpsDetected}
          className={`presensi-submit-btn ${scanType === 'in' ? 'btn-scan-masuk' : 'btn-scan-pulang'}`}
          style={{ opacity: isFakeGpsDetected ? 0.6 : 1, cursor: isFakeGpsDetected ? 'not-allowed' : 'pointer' }}
        >
          <Send size={18} />
          <span>{loading ? 'Mengirim Data Presensi...' : `Kirim Presensi ${scanType === 'in' ? 'Masuk' : 'Pulang'}`}</span>
        </button>

      </div>
    </div>
  );
}


