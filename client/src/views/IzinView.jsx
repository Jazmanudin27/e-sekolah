import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import api from '../api/client';

export default function IzinView({ showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [jenisIzin, setJenisIzin] = useState('Sakit');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(true);
  const [riwayatIzin, setRiwayatIzin] = useState([]);

  useEffect(() => {
    fetchIzin();
  }, []);

  const fetchIzin = async () => {
    setLoading(true);
    try {
      const res = await api.get('/izin');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRiwayatIzin(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tanggalMulai || !keterangan) {
      showToast?.('Mohon isi tanggal dan keterangan pengajuan', 'error');
      return;
    }

    try {
      const payload = {
        jenis: jenisIzin,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai || null,
        keterangan
      };

      const res = await api.post('/izin', payload);
      if (res.data?.success) {
        showToast?.('Pengajuan izin berhasil disimpan ke database!', 'success');
        setShowForm(false);
        setKeterangan('');
        setTanggalMulai('');
        setTanggalSelesai('');
        fetchIzin();
      } else {
        showToast?.(res.data?.message || 'Gagal menyimpan pengajuan izin', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast?.('Terjadi kesalahan saat menyimpan pengajuan izin', 'error');
    }
  };

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 36, paddingTop: 4 }}>
      {/* OVERVIEW STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Pengajuan</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0066ff', marginTop: 4 }}>{riwayatIzin.length}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Disetujui</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
            {riwayatIzin.filter(i => i.status === 'Disetujui').length}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Menunggu</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
            {riwayatIzin.filter(i => i.status === 'Menunggu').length}
          </div>
        </div>
      </div>



      {/* FORM PENGAJUAN */}
      {showForm && (
        <div style={{ background: '#ffffff', padding: 18, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Form Pengajuan Izin</h3>
            <button
              onClick={() => setShowForm(false)}
              style={{ background: '#f1f5f9', border: 'none', color: '#64748b', fontWeight: 700, fontSize: 12, padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>JENIS PERMOHONAN</label>
              <select
                value={jenisIzin}
                onChange={(e) => setJenisIzin(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }}
              >
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin Keperluan Keluarga</option>
                <option value="Dinas">Dinas / Tugas Sekolah</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>TANGGAL MULAI</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>SAMPAI (OPSIONAL)</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' }}>KETERANGAN / ALASAN</label>
              <textarea
                rows={3}
                placeholder="Tuliskan keterangan lengkap pengajuan..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                marginTop: 6
              }}
            >
              Kirim Pengajuan
            </button>
          </form>
        </div>
      )}

      {/* RIWAYAT LIST */}
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Riwayat Pengajuan Izin</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {riwayatIzin.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 14,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      background: item.jenis === 'Sakit' ? '#fee2e2' : '#e0f2fe',
                      color: item.jenis === 'Sakit' ? '#dc2626' : '#0284c7',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6
                    }}
                  >
                    {item.jenis}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{item.tanggal}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.keterangan}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{item.disetujuiOleh}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    color: item.status === 'Disetujui' ? '#16a34a' : '#d97706',
                    background: item.status === 'Disetujui' ? '#f0fdf4' : '#fffbeb',
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: item.status === 'Disetujui' ? '1px solid #bbf7d0' : '1px solid #fef3c7'
                  }}
                >
                  {item.status === 'Disetujui' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON (LIVE CHAT STYLE - BOTTOM RIGHT) */}
      <div
        style={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          zIndex: 150,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        {!showForm && (
          <span
            style={{
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 20,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              pointerEvents: 'none'
            }}
          >
            + Buat Izin
          </span>
        )}
        <button
          onClick={() => setShowForm(!showForm)}
          title={showForm ? 'Tutup Form' : 'Buat Pengajuan Izin Baru'}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: showForm
              ? '#dc2626'
              : 'linear-gradient(135deg, #0052cc 0%, #0072ff 50%, #0284c7 100%)',
            color: '#ffffff',
            border: '3px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 102, 255, 0.45)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: showForm ? 'rotate(45deg)' : 'none'
          }}
        >
          <Plus size={28} color="#ffffff" />
        </button>
      </div>
    </div>
  );
}
