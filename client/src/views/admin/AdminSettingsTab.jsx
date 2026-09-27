import React, { useState } from 'react';
import {
  Settings, Building, Clock, Save, ShieldCheck, Database, Check
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState({
    nama_sekolah: 'SMK E-SEKOLAH INDONESIA',
    npsn: '10293847',
    alamat: 'Jl. Pendidikan No. 27, Kota Digital',
    kepala_sekolah: 'Drs. H. Ahmad Dahlan, M.Pd',
    jam_masuk: '07:00',
    toleransi_telat: '15',
    jam_pulang: '15:30'
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    Swal.fire({
      title: 'Pengaturan Disimpan!',
      text: 'Informasi sekolah dan aturan presensi berhasil diperbarui.',
      icon: 'success',
      timer: 1800,
      confirmButtonColor: '#0066ff'
    });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Settings size={20} color="#0066ff" /> Pengaturan Identitas Sekolah & Sistem Presensi
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Konfigurasi data profil instansi dan parameter jam kerja presensi
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            {/* IDENTITAS SEKOLAH */}
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

            {/* ATURAN PRESENSI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 16 }}>
                  <Clock size={18} color="#16a34a" /> Aturan Waktu Presensi Guru
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: 14 }}
              >
                {saved ? <Check size={18} /> : <Save size={18} />}
                {saved ? 'Tersimpan!' : 'Simpan Semua Pengaturan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
