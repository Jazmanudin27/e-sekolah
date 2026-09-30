import React, { useState, useEffect } from 'react';
import {
  Settings, Building, Clock, Save, ShieldCheck, Database, Check, RefreshCw, MapPin, Camera, Navigation
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState({
    nama_sekolah: '',
    npsn: '',
    alamat: '',
    kepala_sekolah: '',
    jam_masuk: '07:00',
    toleransi_telat: '15',
    jam_pulang: '15:30',
    radius_gps: '100',
    mode_presensi_guru: 'gps_kamera',
    lat_sekolah: '-7.325205',
    lng_sekolah: '108.208354'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSekolahSettings = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('esekolah_user');
      let km = null;
      if (userStr) {
        try { km = JSON.parse(userStr)?.kode_member; } catch (e) {}
      }
      const response = await api.get('/sekolah', { params: { kode_member: km } });
      if (response.data && response.data.success && response.data.data) {
        const d = response.data.data;
        setSettings({
          nama_sekolah: d.nama_sekolah || 'SMK ARTANITA TASIKMALAYA',
          npsn: d.npsn || '20279876',
          alamat: d.alamat || 'Jl. Cienteung No. 112 A, Kota Tasikmalaya',
          kepala_sekolah: d.kepala_sekolah || 'Ali Irsan Shafar, SH.M.Pd',
          jam_masuk: d.jam_masuk || '07:00',
          toleransi_telat: d.toleransi_telat ? String(d.toleransi_telat) : '15',
          jam_pulang: d.jam_pulang || '15:30',
          radius_gps: d.radius_gps ? String(d.radius_gps) : '100',
          mode_presensi_guru: d.mode_presensi_guru || 'gps_kamera',
          lat_sekolah: d.lat_sekolah || '-7.325205',
          lng_sekolah: d.lng_sekolah || '108.208354',
          kode_member: d.kode_member
        });
      }
    } catch (err) {
      console.warn('Gagal memuat data sekolah dari API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSekolahSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/sekolah', settings);
      if (response.data && response.data.success) {
        setSaved(true);
        Swal.fire({
          title: 'Pengaturan Disimpan!',
          text: 'Informasi sekolah dan aturan presensi berhasil diperbarui di database.',
          icon: 'success',
          timer: 1800,
          confirmButtonColor: '#0066ff'
        });
        setTimeout(() => setSaved(false), 2500);
      } else {
        throw new Error(response.data?.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      Swal.fire({
        title: 'Gagal Menyimpan',
        text: err.message || 'Terjadi kesalahan saat menyimpan pengaturan.',
        icon: 'error',
        confirmButtonColor: '#0066ff'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <RefreshCw size={24} className="spin" color="#0066ff" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 10, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Memuat data sekolah dari database...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Settings size={20} color="#0066ff" /> Pengaturan Identitas Sekolah & Mode Presensi
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Konfigurasi data instansi, radius lokasi GPS, serta metode scan presensi guru
            </div>
          </div>
          <button
            type="button"
            className="btn-outline-admin"
            onClick={fetchSekolahSettings}
            title="Refresh Data Sekolah"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            {/* IDENTITAS SEKOLAH */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 16 }}>
                  <Building size={18} color="#0066ff" /> Profil Instansi Sekolah
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group-admin">
                    <label>Nama Resmi Sekolah</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      value={settings.nama_sekolah}
                      onChange={(e) => setSettings({ ...settings, nama_sekolah: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>NPSN (Nomor Pokok Sekolah Nasional)</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      value={settings.npsn}
                      onChange={(e) => setSettings({ ...settings, npsn: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Alamat Lengkap Sekolah</label>
                    <textarea
                      rows={3}
                      className="form-control-admin"
                      value={settings.alamat}
                      onChange={(e) => setSettings({ ...settings, alamat: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Nama Kepala Sekolah</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      value={settings.kepala_sekolah}
                      onChange={(e) => setSettings({ ...settings, kepala_sekolah: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* ATURAN LOKASI & COORDINATES */}
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 16 }}>
                  <MapPin size={18} color="#0066ff" /> Titik Lokasi Koordinat Sekolah (Peta)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group-admin">
                    <label>Latitude Sekolah</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="-7.325205"
                      value={settings.lat_sekolah}
                      onChange={(e) => setSettings({ ...settings, lat_sekolah: e.target.value })}
                    />
                  </div>
                  <div className="form-group-admin">
                    <label>Longitude Sekolah</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="108.208354"
                      value={settings.lng_sekolah}
                      onChange={(e) => setSettings({ ...settings, lng_sekolah: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ATURAN PRESENSI & MODE SCAN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* ATURAN MODE SCAN PRESENSI GURU */}
              <div style={{ background: '#f0f9ff', padding: 20, borderRadius: 14, border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#0369a1', marginBottom: 12 }}>
                  <ShieldCheck size={18} color="#0284c7" /> Mode Scan Presensi Guru
                </div>
                <p style={{ fontSize: 12, color: '#0369a1', marginBottom: 16, lineHeight: 1.4 }}>
                  Sesuaikan metode verifikasi presensi yang wajib dilakukan oleh guru saat absen masuk / pulang:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: settings.mode_presensi_guru === 'gps_kamera' ? '#ffffff' : 'transparent',
                    border: `1.5px solid ${settings.mode_presensi_guru === 'gps_kamera' ? '#0284c7' : '#cbd5e1'}`,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="mode_presensi_guru"
                      value="gps_kamera"
                      checked={settings.mode_presensi_guru === 'gps_kamera'}
                      onChange={(e) => setSettings({ ...settings, mode_presensi_guru: e.target.value })}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>GPS + Kamera (Rekomendasi)</strong>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>Wajib berada di dalam radius GPS sekolah DAN mengambil foto selfie.</span>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: settings.mode_presensi_guru === 'gps_only' ? '#ffffff' : 'transparent',
                    border: `1.5px solid ${settings.mode_presensi_guru === 'gps_only' ? '#0284c7' : '#cbd5e1'}`,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="mode_presensi_guru"
                      value="gps_only"
                      checked={settings.mode_presensi_guru === 'gps_only'}
                      onChange={(e) => setSettings({ ...settings, mode_presensi_guru: e.target.value })}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>GPS Only (Cek Radius Saja)</strong>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>Wajib berada di dalam radius lokasi sekolah, tanpa foto selfie.</span>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: settings.mode_presensi_guru === 'kamera_only' ? '#ffffff' : 'transparent',
                    border: `1.5px solid ${settings.mode_presensi_guru === 'kamera_only' ? '#0284c7' : '#cbd5e1'}`,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="mode_presensi_guru"
                      value="kamera_only"
                      checked={settings.mode_presensi_guru === 'kamera_only'}
                      onChange={(e) => setSettings({ ...settings, mode_presensi_guru: e.target.value })}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>Kamera Only (Selfie Saja)</strong>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>Wajib foto bukti selfie, tanpa pembatasan jarak radius GPS.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* ATURAN RADIUS GPS & WAKTU */}
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 16 }}>
                  <Clock size={18} color="#16a34a" /> Aturan Radius GPS & Jam Kerja
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group-admin">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Navigation size={14} color="#0066ff" /> Radius Safe Zone GPS (Meter)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      className="form-control-admin"
                      value={settings.radius_gps}
                      onChange={(e) => setSettings({ ...settings, radius_gps: e.target.value })}
                      placeholder="Contoh: 100"
                    />
                    <small style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      Jarak maksimal (dalam meter) guru diizinkan absen dari lokasi titik koordinat sekolah.
                    </small>
                  </div>

                  <div className="form-group-admin">
                    <label>Batas Jam Masuk (Pagi)</label>
                    <input
                      type="time"
                      className="form-control-admin"
                      value={settings.jam_masuk}
                      onChange={(e) => setSettings({ ...settings, jam_masuk: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Toleransi Keterlambatan (Menit)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      className="form-control-admin"
                      value={settings.toleransi_telat}
                      onChange={(e) => setSettings({ ...settings, toleransi_telat: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Batas Jam Pulang (Sore)</label>
                    <input
                      type="time"
                      className="form-control-admin"
                      value={settings.jam_pulang}
                      onChange={(e) => setSettings({ ...settings, jam_pulang: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                type="submit"
                className="btn-primary-admin"
                disabled={saving}
                style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: 14 }}
              >
                {saved ? <Check size={18} /> : <Save size={18} />}
                {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan Semua Pengaturan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
