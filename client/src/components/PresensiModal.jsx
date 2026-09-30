import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Send, ShieldCheck, Navigation, AlertTriangle, CheckCircle2, Camera, RefreshCw, Check } from 'lucide-react';
import api from '../api/client';

export default function PresensiModal({ type: initialType = 'in', onClose, onSuccess, showToast }) {
  const [scanType, setScanType] = useState(initialType);
  const [coords, setCoords] = useState(null);
  const [coordsString, setCoordsString] = useState('Mencari lokasi GPS...');
  const [loading, setLoading] = useState(false);
  const [isFakeGpsDetected, setIsFakeGpsDetected] = useState(false);
  const [gpsReady, setGpsReady] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Dynamic School Settings
  const [schoolSettings, setSchoolSettings] = useState({
    name: 'SMK Artanita Tasikmalaya',
    lat: -7.325205,
    lng: 108.208354,
    radiusMeter: 100,
    mode: 'gps_kamera' // 'gps_kamera' | 'gps_only' | 'kamera_only'
  });

  // Camera Selfie State
  const [fotoData, setFotoData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch School Settings on Mount
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const res = await api.get('/sekolah');
        if (res.data && res.data.success && res.data.data) {
          const d = res.data.data;
          setSchoolSettings({
            name: d.nama_sekolah || 'SMK Artanita Tasikmalaya',
            lat: parseFloat(d.lat_sekolah || -7.325205),
            lng: parseFloat(d.lng_sekolah || 108.208354),
            radiusMeter: parseInt(d.radius_gps || 100, 10),
            mode: d.mode_presensi_guru || 'gps_kamera'
          });
        }
      } catch (err) {
        console.warn('Gagal memuat pengaturan sekolah di modal presensi:', err);
      }
    };
    fetchSchoolInfo();
  }, []);

  const requiresGps = schoolSettings.mode === 'gps_kamera' || schoolSettings.mode === 'gps_only';
  const requiresKamera = schoolSettings.mode === 'gps_kamera' || schoolSettings.mode === 'kamera_only';

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung oleh browser ini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera Error:', err);
      setCameraError(err.message || 'Gagal mengakses kamera HP.');
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture Photo from Camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFotoData(dataUrl);
      stopCamera();
    } catch (e) {
      console.error('Failed to capture photo:', e);
    }
  };

  // Retake Photo
  const retakePhoto = () => {
    setFotoData(null);
    startCamera();
  };

  // Start Camera when camera is required and no photo yet
  useEffect(() => {
    if (requiresKamera && !fotoData && !cameraActive) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [schoolSettings.mode, fotoData]);

  // Real GPS Geolocation & Fake GPS Detection Effect
  const fetchLocation = () => {
    if (!requiresGps) return;
    setGpsReady(false);
    setGpsError(null);
    setCoordsString('Mencari lokasi GPS...');

    if (navigator.geolocation) {
      const handleSuccess = (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setCoordsString(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setGpsReady(true);
        setGpsError(null);

        // Detect Fake GPS / Mock Location
        const isMocked = Boolean(pos.coords.isMocked || (pos.coords.accuracy !== undefined && pos.coords.accuracy < 0.1));
        setIsFakeGpsDetected(isMocked);
      };

      const handleError = (err) => {
        console.warn("GPS error:", err);
        setGpsReady(true);
        let detailMsg = "Gagal mendeteksi lokasi GPS.";
        if (err.code === 1) { // PERMISSION_DENIED
          detailMsg = "Izin Lokasi Ditolak! Buka ikon Gembok 🔒 / Setelan di baris URL Chrome -> Setelan Situs -> Lokasi -> Pilih 'Izinkan'.";
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          detailMsg = "GPS HP Tidak Aktif / Sinyal lemah. Pastikan GPS/Lokasi HP sudah 'ON', Akurasi Tinggi diaktifkan.";
        } else if (err.code === 3) { // TIMEOUT
          detailMsg = "Pencarian titik GPS waktu habis (Timeout).";
        } else if (err.message) {
          detailMsg = err.message;
        }
        setGpsError(detailMsg);
      };

      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    } else {
      setGpsReady(true);
      setGpsError("Browser Anda tidak mendukung fitur lokasi GPS.");
    }
  };

  useEffect(() => {
    if (requiresGps) {
      fetchLocation();
      if (navigator.geolocation) {
        const handleSuccess = (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setCoordsString(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setGpsReady(true);
          setGpsError(null);
        };
        const handleError = () => {};
        const watchId = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
      }
    }
  }, [schoolSettings.mode]);

  // Leaflet Map Initialization & Update Effect
  useEffect(() => {
    if (!requiresGps || !mapContainerRef.current || !coords?.lat || !coords?.lng) return;

    const L = window.L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 17,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; Leaflet | OpenStreetMap'
      }).addTo(map);

      // School Safe Zone Radius Circle
      L.circle([schoolSettings.lat, schoolSettings.lng], {
        color: '#0066ff',
        fillColor: '#3b82f6',
        fillOpacity: 0.18,
        radius: schoolSettings.radiusMeter
      }).addTo(map);

      // Marker for School Office
      const schoolMarker = L.marker([schoolSettings.lat, schoolSettings.lng]).addTo(map);
      schoolMarker.bindPopup(`<b>${schoolSettings.name}</b><br>Titik Pusat Sekolah`);

      // Custom User Marker (Actual Location)
      const userMarker = L.marker([coords.lat, coords.lng]).addTo(map);
      userMarker.bindPopup(`<b>Titik Lokasi Anda</b><br>Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`).openPopup();

      markerRef.current = userMarker;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 17);
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
        markerRef.current.setPopupContent(`<b>Titik Lokasi Anda</b><br>Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`);
      }
    }
  }, [coords, requiresGps, schoolSettings]);

  const calculateDistanceMeter = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371e3;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const distanceMeter = (coords?.lat && coords?.lng)
    ? calculateDistanceMeter(coords.lat, coords.lng, schoolSettings.lat, schoolSettings.lng)
    : 9999;
  const isOutOfRadius = requiresGps && distanceMeter > schoolSettings.radiusMeter;

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = async () => {
    if (requiresGps) {
      if (!coords?.lat || !coords?.lng) {
        showToast('Menunggu lokasi GPS perangkat terdeteksi...', false);
        return;
      }
      if (isFakeGpsDetected) {
        showToast('Presensi ditolak! Terdeteksi aplikasi pemalsu lokasi (Fake GPS).', false);
        return;
      }
      if (isOutOfRadius) {
        showToast(`Presensi ditolak! Anda berada di luar radius aman sekolah (${distanceMeter}m dari sekolah). Maksimal radius: ${schoolSettings.radiusMeter}m.`, false);
        return;
      }
    }

    if (requiresKamera && !fotoData) {
      showToast('Wajib mengambil foto selfie bukti presensi terlebih dahulu!', false);
      return;
    }

    setLoading(true);
    const endpoint = scanType === 'in' ? '/presensi/checkin' : '/presensi/checkout';
    try {
      const res = await api.post(endpoint, {
        lokasi: requiresGps ? coordsString : 'Kamera Only (Tanpa GPS)',
        foto: fotoData,
        is_fake_gps: isFakeGpsDetected
      });
      if (res.data.success) {
        showToast(res.data.message || `Presensi ${scanType === 'in' ? 'Masuk' : 'Pulang'} berhasil!`, true);
        stopCamera();
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
      <div className="presensi-modal-box" style={{ maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* HEADER MODAL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={22} color="#0066ff" />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Presensi Guru
              </h3>
              <span style={{ fontSize: 11, color: '#0066ff', fontWeight: 700 }}>
                Mode: {schoolSettings.mode === 'gps_kamera' ? 'GPS + Kamera Selfie' : schoolSettings.mode === 'gps_only' ? 'GPS Only (Radius ' + schoolSettings.radiusMeter + 'm)' : 'Kamera Selfie Only'}
              </span>
            </div>
          </div>
          <button onClick={handleModalClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* SCAN TYPE SWITCHER TAB (SCAN MASUK / SCAN PULANG) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 14, marginBottom: 14 }}>
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

        {/* CAMERA SELFIE VIEW (JIKA MODE PILIH KAMERA) */}
        {requiresKamera && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Camera size={16} color="#0066ff" /> Ambil Foto Selfie Bukti Presensi
            </div>
            
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#0f172a', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
              {fotoData ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img src={fotoData} alt="Selfie Presensi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={retakePhoto}
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.3)',
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <RefreshCw size={14} /> Foto Ulang
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                  />

                  {cameraError ? (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.9)', color: '#f87171', padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={32} style={{ marginBottom: 8 }} />
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{cameraError}</div>
                      <button
                        onClick={startCamera}
                        style={{ marginTop: 12, background: '#0066ff', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Coba Lagi Akses Kamera
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        background: 'linear-gradient(135deg, #0066ff, #0052cc)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(0,102,255,0.4)'
                      }}
                    >
                      <Camera size={16} /> Ambil Foto Sekarang
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* GPS & RADIUS VERIFICATION STATUS CARD (JIKA MODE PILIH GPS) */}
        {requiresGps && (
          <>
            <div style={{
              background: !coords ? (gpsError ? '#fff1f2' : '#eff6ff') : (isFakeGpsDetected || isOutOfRadius) ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${!coords ? (gpsError ? '#fecdd3' : '#bfdbfe') : (isFakeGpsDetected || isOutOfRadius) ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: 14,
              padding: '12px 14px',
              marginBottom: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {!coords ? (
                  gpsError ? (
                    <AlertTriangle size={22} color="#e11d48" style={{ marginTop: 2, flexShrink: 0 }} />
                  ) : (
                    <Navigation size={22} color="#0066ff" className="spin" style={{ marginTop: 2, flexShrink: 0 }} />
                  )
                ) : isFakeGpsDetected || isOutOfRadius ? (
                  <AlertTriangle size={22} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />
                ) : (
                  <CheckCircle2 size={22} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                )}
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: !coords ? (gpsError ? '#9f1239' : '#1e40af') : (isFakeGpsDetected || isOutOfRadius) ? '#991b1b' : '#166534' }}>
                    {!coords
                      ? (gpsError ? 'Kendala Lokasi GPS' : 'Mencari Satelit GPS Perangkat...')
                      : isFakeGpsDetected
                      ? 'Fake GPS Terdeteksi!'
                      : isOutOfRadius
                      ? `Di Luar Radius Safe Zone (${distanceMeter}m)`
                      : 'Lokasi Terverifikasi (Dalam Safe Zone)'}
                  </div>
                  <div style={{ fontSize: 11.5, color: !coords ? (gpsError ? '#be123c' : '#1d4ed8') : (isFakeGpsDetected || isOutOfRadius) ? '#b91c1c' : '#15803d', marginTop: 3, lineHeight: 1.45 }}>
                    {!coords
                      ? (gpsError || 'Sedang mengambil titik koordinat GPS fisik perangkat Anda...')
                      : isFakeGpsDetected
                      ? 'Aplikasi pemalsu lokasi terdeteksi. Harap nonaktifkan Fake GPS untuk melakukan absen.'
                      : isOutOfRadius
                      ? `Presensi ditolak karena Anda berada ${distanceMeter}m dari sekolah. Maksimal radius: ${schoolSettings.radiusMeter}m.`
                      : `Jarak Anda ke sekolah: ${distanceMeter}m (Batas Maksimal: ${schoolSettings.radiusMeter}m).`}
                  </div>

                  {!coords && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={fetchLocation}
                        style={{
                          background: '#0066ff',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Navigation size={12} />
                        <span>Coba Deteksi Ulang GPS</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LEAFLET MAP */}
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minHeight: 160, position: 'relative' }}>
              <div style={{ background: '#f8fafc', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Navigation size={14} color="#0066ff" /> Peta Lokasi (Radius Aman: {schoolSettings.radiusMeter}m)
                </span>
                <span style={{ fontSize: 10, color: !coords ? '#0066ff' : isOutOfRadius ? '#dc2626' : '#16a34a', fontWeight: 700, background: !coords ? '#eff6ff' : isOutOfRadius ? '#fee2e2' : '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>
                  {!coords ? 'Mencari...' : isOutOfRadius ? `Di Luar (${distanceMeter}m)` : `Dalam Radius (${distanceMeter}m)`}
                </span>
              </div>
              <div ref={mapContainerRef} style={{ height: 160, width: '100%', zIndex: 1 }}></div>
            </div>
          </>
        )}

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading || (requiresGps && (isFakeGpsDetected || isOutOfRadius)) || (requiresKamera && !fotoData)}
          className={`presensi-submit-btn ${scanType === 'in' ? 'btn-scan-masuk' : 'btn-scan-pulang'}`}
          style={{
            opacity: (requiresGps && (isFakeGpsDetected || isOutOfRadius)) || (requiresKamera && !fotoData) ? 0.6 : 1,
            cursor: (requiresGps && (isFakeGpsDetected || isOutOfRadius)) || (requiresKamera && !fotoData) ? 'not-allowed' : 'pointer'
          }}
        >
          <Send size={18} />
          <span>{loading ? 'Mengirim Data Presensi...' : `Kirim Presensi ${scanType === 'in' ? 'Masuk' : 'Pulang'}`}</span>
        </button>

      </div>
    </div>
  );
}
