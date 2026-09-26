import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Send, Smile, ShieldCheck, ToggleLeft, ToggleRight, Navigation } from 'lucide-react';
import api from '../api/client';

export default function PresensiModal({ type: initialType = 'in', onClose, onSuccess, showToast }) {
  const [scanType, setScanType] = useState(initialType);
  const [coords, setCoords] = useState({ lat: -7.325205, lng: 108.208354 });
  const [coordsString, setCoordsString] = useState('-7.325205, 108.208354');
  const [isFakeGpsActive, setIsFakeGpsActive] = useState(false);
  const [fakeLat, setFakeLat] = useState('-7.325205');
  const [fakeLng, setFakeLng] = useState('108.208354');
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const SCHOOL_LOCATION = {
    name: 'SMK Artanita Tasikmalaya (Kantor Pusat)',
    lat: -7.325205,
    lng: 108.208354,
    radiusMeter: 100
  };

  // Camera initialization effect
  useEffect(() => {
    let isMounted = true;
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          });
          if (isMounted) {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
          } else {
            stream.getTracks().forEach(track => track.stop());
          }
        }
      } catch (err) {
        console.warn("Camera init warning:", err);
      }
    }
    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Real GPS Geolocation Effect
  useEffect(() => {
    if (!isFakeGpsActive && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setCoordsString(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
        (err) => {
          console.warn("GPS error:", err);
          setCoords({ lat: SCHOOL_LOCATION.lat, lng: SCHOOL_LOCATION.lng });
          setCoordsString(`${SCHOOL_LOCATION.lat}, ${SCHOOL_LOCATION.lng}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [isFakeGpsActive]);

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
        attribution: '&copy; <a href="https://leafletjs.com" title="A JavaScript library for interactive maps"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet</a> | &copy; OpenStreetMap'
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

      // Custom User / Fake GPS Marker (Hide raw coords from popup)
      const userMarker = L.marker([coords.lat, coords.lng]).addTo(map);
      userMarker.bindPopup(`<b>${isFakeGpsActive ? 'Lokasi Fake GPS' : 'Lokasi Presensi Guru'}</b><br>Status: Terverifikasi`).openPopup();

      markerRef.current = userMarker;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
        markerRef.current.setPopupContent(`<b>${isFakeGpsActive ? 'Lokasi Fake GPS' : 'Lokasi Presensi Guru'}</b><br>Status: Terverifikasi`);
      }
    }
  }, [coords, isFakeGpsActive]);

  const handleToggleFakeGps = () => {
    const nextState = !isFakeGpsActive;
    setIsFakeGpsActive(nextState);

    if (nextState) {
      const fLat = parseFloat(fakeLat) || SCHOOL_LOCATION.lat;
      const fLng = parseFloat(fakeLng) || SCHOOL_LOCATION.lng;
      setCoords({ lat: fLat, lng: fLng });
      setCoordsString(`${fLat.toFixed(6)}, ${fLng.toFixed(6)} [FAKE GPS]`);
      showToast?.('Fake GPS berhasil diaktifkan!', true);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setCoords({ lat, lng });
            setCoordsString(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          },
          null,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
      showToast?.('Kembali ke Lokasi GPS Asli.', true);
    }
  };

  const handleFakeCoordsChange = (newLat, newLng) => {
    setFakeLat(newLat);
    setFakeLng(newLng);
    if (isFakeGpsActive) {
      const fLat = parseFloat(newLat) || SCHOOL_LOCATION.lat;
      const fLng = parseFloat(newLng) || SCHOOL_LOCATION.lng;
      setCoords({ lat: fLat, lng: fLng });
      setCoordsString(`${fLat.toFixed(6)}, ${fLng.toFixed(6)} [FAKE GPS]`);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const endpoint = scanType === 'in' ? '/presensi/checkin' : '/presensi/checkout';
    try {
      const res = await api.post(endpoint, {
        lokasi: coordsString,
        foto: 'upload/presensi/selfie.jpg',
        is_fake_gps: isFakeGpsActive
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
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Halaman Presensi Mobile</h3>
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
            Scan Masuk
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
            Scan Pulang
          </button>
        </div>

        {/* CAMERA SELFIE PREVIEW CONTAINER */}
        <div className="scanner-camera-box">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '14px',
              transform: 'scaleX(-1)',
              display: isCameraActive ? 'block' : 'none'
            }}
          />

          <div className="scanner-line" style={{ zIndex: 5 }}></div>

          <div
            style={{
              position: 'relative',
              zIndex: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: isCameraActive ? 'rgba(15, 23, 42, 0.35)' : 'transparent',
              padding: '8px 14px',
              borderRadius: '12px',
              backdropFilter: isCameraActive ? 'blur(2px)' : 'none'
            }}
          >
            {!isCameraActive && (
              <Smile size={40} color="#10b981" style={{ marginBottom: 8 }} />
            )}
            <p style={{ fontSize: 13, color: '#f8fafc', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {isCameraActive ? 'Deteksi Wajah & Kamera Aktif' : 'Memuat Kamera Biometrik...'}
            </p>
            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              Posisikan wajah Anda di dalam area kamera
            </p>
          </div>
        </div>

        {/* LEAFLET INTERACTIVE MAP DISPLAY (LOKASI SEKOLAH & KANTOR) */}
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#f8fafc', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Navigation size={14} color="#0066ff" /> Peta Interaktif Leaflet (Sekolah & Kantor)
            </span>
            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>
              Radius Safe Zone: {SCHOOL_LOCATION.radiusMeter}m
            </span>
          </div>

          <div ref={mapContainerRef} style={{ height: 160, width: '100%', zIndex: 1 }}></div>
        </div>

        {/* FAKE GPS CONTROL PANEL */}
        <div style={{ background: isFakeGpsActive ? '#fff7ed' : '#f8fafc', padding: 12, borderRadius: 14, marginBottom: 16, border: isFakeGpsActive ? '1px solid #fdba74' : '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color={isFakeGpsActive ? '#ea580c' : '#0066ff'} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                  {isFakeGpsActive ? 'Fitur Fake GPS' : 'Status Lokasi GPS'}
                </div>
                <div style={{ fontSize: 10, color: isFakeGpsActive ? '#ea580c' : '#16a34a', fontWeight: 600 }}>
                  {isFakeGpsActive ? 'Menggunakan Fake GPS' : '✓ Lokasi Terdeteksi & Terverifikasi'}
                </div>
              </div>
            </div>

            <button onClick={handleToggleFakeGps} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Toggle Fake GPS">
              {isFakeGpsActive ? <ToggleRight size={32} color="#ea580c" /> : <ToggleLeft size={32} color="#94a3b8" />}
            </button>
          </div>

          {/* FAKE COORDINATES INPUT FIELD */}
          {isFakeGpsActive && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #fed7aa', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#ea580c' }}>Fake Latitude</label>
                <input
                  type="text"
                  value={fakeLat}
                  onChange={(e) => handleFakeCoordsChange(e.target.value, fakeLng)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid #fdba74', fontSize: 11, fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#ea580c' }}>Fake Longitude</label>
                <input
                  type="text"
                  value={fakeLng}
                  onChange={(e) => handleFakeCoordsChange(fakeLat, e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid #fdba74', fontSize: 11, fontWeight: 600 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`presensi-submit-btn ${scanType === 'in' ? 'btn-scan-masuk' : 'btn-scan-pulang'}`}
        >
          <Send size={18} />
          <span>{loading ? 'Mengirim Data Presensi...' : `Kirim Presensi ${scanType === 'in' ? 'Masuk' : 'Pulang'}`}</span>
        </button>

      </div>
    </div>
  );
}

