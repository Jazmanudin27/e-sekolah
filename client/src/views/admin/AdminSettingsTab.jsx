import React, { useState, useEffect } from 'react';
import {
  Settings, Building, Clock, Save, ShieldCheck, Database, Check, RefreshCw, MapPin, Camera, Navigation,
  MessageSquare, Send, Smartphone, Eye, EyeOff, KeyRound, AlertTriangle, QrCode, Wifi, WifiOff, LogOut, CheckCircle2
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
    lng_sekolah: '108.208354',
    wa_provider: 'qr_scan',
    wa_api_token: '',
    wa_endpoint: '',
    wa_auto_absen: 1,
    wa_auto_pelanggaran: 1,
    wa_sender_phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // WhatsApp QR State (Direct Baileys Multi-Device)
  const [baileysStatus, setBaileysStatus] = useState({
    status: 'disconnected',
    qr: null,
    user: null,
    isConnected: false
  });
  const [startingQR, setStartingQR] = useState(false);
  const [disconnectingQR, setDisconnectingQR] = useState(false);

  // WhatsApp Testing State
  const [testPhone, setTestPhone] = useState('');
  const [testingWA, setTestingWA] = useState(false);

  const fetchQRStatus = async () => {
    try {
      const res = await api.get('/whatsapp/qr-status');
      if (res.data?.success && res.data.data) {
        setBaileysStatus(res.data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchQRStatus();
  }, []);

  useEffect(() => {
    let interval = null;
    if (
      settings.wa_provider === 'qr_scan' &&
      (!baileysStatus.isConnected && (baileysStatus.hasSession || baileysStatus.status === 'qr_ready' || startingQR))
    ) {
      interval = setInterval(() => {
        fetchQRStatus();
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings.wa_provider, baileysStatus.status, baileysStatus.hasSession, baileysStatus.isConnected, startingQR]);

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
          kode_member: d.kode_member,
          wa_provider: d.wa_provider || 'qr_scan',
          wa_api_token: d.wa_api_token || '',
          wa_endpoint: d.wa_endpoint || '',
          wa_auto_absen: d.wa_auto_absen !== undefined ? Number(d.wa_auto_absen) : 1,
          wa_auto_pelanggaran: d.wa_auto_pelanggaran !== undefined ? Number(d.wa_auto_pelanggaran) : 1,
          wa_sender_phone: d.wa_sender_phone || ''
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

  const handleStartQR = async () => {
    setStartingQR(true);
    try {
      const res = await api.post('/whatsapp/qr-start');
      if (res.data?.data) {
        setBaileysStatus(res.data.data);
      }
    } catch (e) {
      Swal.fire('Gagal Menghubungkan', e.response?.data?.message || e.message, 'error');
    } finally {
      setStartingQR(false);
    }
  };

  const handleDisconnectQR = async () => {
    const choice = await Swal.fire({
      title: 'Putuskan Nomor WhatsApp?',
      text: 'Nomor WhatsApp sekolah akan dikeluarkan dari sistem. Anda perlu scan ulang untuk menghubungkannya kembali.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Putuskan',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Batal'
    });

    if (choice.isConfirmed) {
      setDisconnectingQR(true);
      try {
        await api.post('/whatsapp/qr-disconnect');
        setBaileysStatus({ status: 'disconnected', qr: null, user: null, isConnected: false });
        Swal.fire({
          icon: 'success',
          title: 'Terputus!',
          text: 'Koneksi nomor WhatsApp berhasil dikeluarkan.',
          timer: 1500
        });
      } catch (e) {
        Swal.fire('Gagal', e.response?.data?.message || e.message, 'error');
      } finally {
        setDisconnectingQR(false);
      }
    }
  };

  const handleTestWhatsApp = async () => {
    if (!testPhone.trim()) {
      Swal.fire('Nomor Kosong', 'Masukkan nomor WhatsApp tujuan uji coba (contoh: 08123456789).', 'warning');
      return;
    }
    if (settings.wa_provider === 'qr_scan' && !baileysStatus.isConnected) {
      Swal.fire('WhatsApp Belum Terhubung', 'Silakan scan QR Code terlebih dahulu sebelum melakukan uji coba pengiriman.', 'warning');
      return;
    }
    if (settings.wa_provider !== 'qr_scan' && !settings.wa_api_token) {
      Swal.fire('Token Kosong', 'Silakan isi API Token WhatsApp Gateway terlebih dahulu.', 'warning');
      return;
    }

    setTestingWA(true);
    try {
      const res = await api.post('/whatsapp/test', {
        target_phone: testPhone,
        wa_provider: settings.wa_provider,
        wa_api_token: settings.wa_api_token,
        wa_endpoint: settings.wa_endpoint
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Tes WhatsApp Berhasil! 📱',
          text: `Pesan uji coba berhasil terkirim ke ${testPhone}. Gateway aktif dan siap mengirim notifikasi otomatis!`,
          confirmButtonColor: '#16a34a'
        });
      } else {
        throw new Error(res.data?.message || 'Gagal mengirim pesan tes.');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Tes WhatsApp Gagal',
        text: err.response?.data?.message || err.message || 'Tidak dapat terhubung ke WhatsApp Gateway.'
      });
    } finally {
      setTestingWA(false);
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

              {/* INTEGRASI WHATSAPP GATEWAY */}
              <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 14, border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#166534', marginBottom: 12 }}>
                  <MessageSquare size={18} color="#16a34a" /> Integrasi WhatsApp Gateway & Notifikasi Otomatis
                </div>
                <p style={{ fontSize: 12, color: '#166534', marginBottom: 16, lineHeight: 1.4 }}>
                  Kirim pesan WhatsApp otomatis ke nomor orang tua/wali murid saat siswa tidak hadir atau melanggar aturan sekolah.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group-admin">
                    <label>Metode Koneksi WhatsApp</label>
                    <select
                      className="form-control-admin"
                      value={settings.wa_provider}
                      onChange={(e) => {
                        const prov = e.target.value;
                        let endpoint = '';
                        if (prov === 'fonnte') endpoint = 'https://api.fonnte.com/send';
                        else if (prov === 'wablas') endpoint = 'https://kudus.wablas.com/api/send-message';
                        setSettings({ ...settings, wa_provider: prov, wa_endpoint: endpoint });
                      }}
                      style={{ fontWeight: 700 }}
                    >
                      <option value="qr_scan">📱 Scan QR Code WhatsApp (Nomor Sekolah Langsung - GRATIS & OTOMATIS)</option>
                      <option value="fonnte">Fonnte API Gateway (Pakai Token)</option>
                      <option value="wablas">Wablas Gateway (Pakai Token)</option>
                      <option value="generic">Custom REST API / Generic Webhook</option>
                    </select>
                  </div>

                  {/* KOTAK KHUSUS SCAN QR CODE */}
                  {settings.wa_provider === 'qr_scan' && (
                    <div style={{
                      background: baileysStatus.isConnected ? '#dcfce7' : '#ffffff',
                      border: baileysStatus.isConnected ? '2px solid #22c55e' : '2px dashed #cbd5e1',
                      borderRadius: 14,
                      padding: 18,
                      textAlign: 'center'
                    }}>
                      {baileysStatus.isConnected ? (
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#22c55e', color: '#ffffff', marginBottom: 10 }}>
                            <CheckCircle2 size={28} />
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#15803d' }}>
                            WhatsApp Sekolah Terhubung!
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginTop: 4 }}>
                            +{baileysStatus.user?.phone} ({baileysStatus.user?.name || 'Nomor Resmi Sekolah'})
                          </div>
                          <p style={{ fontSize: 11.5, color: '#15803d', margin: '8px 0 14px' }}>
                            Semua notifikasi ketidakhadiran & pelanggaran tata tertib akan terkirim otomatis dari nomor ini.
                          </p>
                          <button
                            type="button"
                            onClick={handleDisconnectQR}
                            disabled={disconnectingQR}
                            style={{
                              background: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <LogOut size={14} />
                            {disconnectingQR ? 'Memutuskan...' : 'Putuskan / Ganti Nomor WhatsApp'}
                          </button>
                        </div>
                      ) : baileysStatus.status === 'qr_ready' && baileysStatus.qr ? (
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                            Pindai QR Code Menggunakan WhatsApp Sekolah
                          </div>
                          <p style={{ fontSize: 11.5, color: '#64748b', marginBottom: 12 }}>
                            Buka WhatsApp di HP ➔ Titik Tiga (⋮) / Pengaturan ➔ <b>Perangkat Tertaut</b> ➔ <b>Tautkan Perangkat</b>
                          </p>
                          <div style={{
                            display: 'inline-block',
                            padding: 10,
                            background: '#ffffff',
                            borderRadius: 12,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                            border: '1px solid #e2e8f0'
                          }}>
                            <img
                              src={baileysStatus.qr}
                              alt="Scan QR WhatsApp"
                              style={{ width: 220, height: 220, display: 'block', margin: '0 auto' }}
                            />
                          </div>
                          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 10 }}>
                            <button
                              type="button"
                              onClick={handleStartQR}
                              disabled={startingQR}
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '7px 14px',
                                borderRadius: 8,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <RefreshCw size={13} className={startingQR ? 'spin' : ''} />
                              {startingQR ? 'Memperbarui...' : 'Perbarui QR Code'}
                            </button>
                          </div>
                          <small style={{ display: 'block', marginTop: 8, color: '#94a3b8', fontSize: 11 }}>
                            Status otomatis terdeteksi setelah Anda scan di HP.
                          </small>
                        </div>
                      ) : baileysStatus.hasSession && !baileysStatus.isConnected ? (
                        <div style={{ padding: '14px 0' }}>
                          <RefreshCw size={26} className="spin" color="#16a34a" style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#166534' }}>
                            Menghubungkan ke WhatsApp Sekolah...
                          </div>
                          {baileysStatus.user?.phone && (
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', marginTop: 4 }}>
                              Nomor: +{baileysStatus.user?.phone}
                            </div>
                          )}
                          <p style={{ fontSize: 11.5, color: '#64748b', margin: '6px 0 12px' }}>
                            Sesi tersimpan ditemukan. Menghubungkan ulang ke server WhatsApp...
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                            <button
                              type="button"
                              onClick={fetchQRStatus}
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #cbd5e1',
                                padding: '6px 12px',
                                borderRadius: 8,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Cek Ulang
                            </button>
                            <button
                              type="button"
                              onClick={handleStartQR}
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 8,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Tampilkan QR Baru
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', marginBottom: 8 }}>
                            <QrCode size={24} />
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                            Nomor WhatsApp Sekolah Belum Terhubung
                          </div>
                          <p style={{ fontSize: 11.5, color: '#64748b', margin: '6px 0 14px' }}>
                            Klik tombol di bawah untuk memunculkan QR Code dan hubungkan nomor WhatsApp sekolah.
                          </p>
                          <button
                            type="button"
                            onClick={handleStartQR}
                            disabled={startingQR}
                            style={{
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '10px 18px',
                              borderRadius: 10,
                              fontSize: 12.5,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                            }}
                          >
                            <QrCode size={16} />
                            {startingQR ? 'Menyiapkan QR Code...' : 'Hubungkan Nomor & Tampilkan QR Code'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FORM TOKEN KHUSUS PROVIDER API (FONNTE / WABLAS / GENERIC) */}
                  {settings.wa_provider !== 'qr_scan' && (
                    <>
                      <div className="form-group-admin">
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>API Token / Secret Key *</span>
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            style={{ background: 'transparent', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            {showToken ? <EyeOff size={12} /> : <Eye size={12} />} {showToken ? 'Sembunyikan' : 'Lihat'}
                          </button>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showToken ? 'text' : 'password'}
                            className="form-control-admin"
                            placeholder="Contoh: token_xxxxxxxxxxxx"
                            value={settings.wa_api_token}
                            onChange={(e) => setSettings({ ...settings, wa_api_token: e.target.value })}
                          />
                        </div>
                        <small style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                          Dapatkan API token ini dari dashboard akun provider WA Gateway Anda.
                        </small>
                      </div>

                      {settings.wa_provider === 'generic' && (
                        <div className="form-group-admin">
                          <label>Custom Endpoint URL</label>
                          <input
                            type="url"
                            className="form-control-admin"
                            placeholder="https://api.yourgateway.com/send"
                            value={settings.wa_endpoint}
                            onChange={(e) => setSettings({ ...settings, wa_endpoint: e.target.value })}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* TOGGLES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#ffffff',
                      border: '1px solid #dcfce7',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={Number(settings.wa_auto_absen) === 1}
                        onChange={(e) => setSettings({ ...settings, wa_auto_absen: e.target.checked ? 1 : 0 })}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                        Otomatis kirim WA saat Siswa Tidak Hadir (Alpa / Sakit / Izin)
                      </span>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#ffffff',
                      border: '1px solid #dcfce7',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={Number(settings.wa_auto_pelanggaran) === 1}
                        onChange={(e) => setSettings({ ...settings, wa_auto_pelanggaran: e.target.checked ? 1 : 0 })}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                        Otomatis kirim WA saat Siswa Melanggar Tata Tertib Sekolah
                      </span>
                    </label>
                  </div>

                  {/* LIVE TEST SENDER */}
                  <div style={{ marginTop: 8, padding: 14, background: '#ffffff', borderRadius: 10, border: '1px dashed #86efac' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Smartphone size={14} color="#16a34a" /> Uji Coba Pengiriman Pesan (Test Gateway)
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Nomor WA Tes (08123456789)"
                        className="form-control-admin"
                        style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleTestWhatsApp}
                        disabled={testingWA}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {testingWA ? <RefreshCw size={13} className="spin" /> : <Send size={13} />}
                        {testingWA ? 'Mengirim...' : 'Tes Kirim'}
                      </button>
                    </div>
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
