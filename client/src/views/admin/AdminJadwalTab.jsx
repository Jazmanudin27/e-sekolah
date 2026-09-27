import React, { useState, useEffect } from 'react';
import {
  Calendar, Search, Printer, RefreshCw, Clock, Building2, User, BookOpen
} from 'lucide-react';
import api from '../../api/client';

export default function AdminJadwalTab() {
  const [jadwalList, setJadwalList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedHari, setSelectedHari] = useState('ALL');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const daftarHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const [resK, resJ] = await Promise.all([
        api.get('/kelas'),
        api.get('/jadwal')
      ]);

      if (resK.data?.success && Array.isArray(resK.data.data)) {
        setKelasList(resK.data.data);
      }
      if (resJ.data?.success && Array.isArray(resJ.data.data)) {
        setJadwalList(resJ.data.data);
      } else {
        setJadwalList([]);
      }
    } catch (err) {
      console.error(err);
      setJadwalList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredJadwal = async (hari, kelas) => {
    setLoading(true);
    try {
      const params = {};
      if (hari !== 'ALL') params.hari = hari;
      if (kelas !== 'ALL') params.kode_kelas = kelas;

      const res = await api.get('/jadwal', { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setJadwalList(res.data.data);
      } else {
        setJadwalList([]);
      }
    } catch (err) {
      console.error(err);
      setJadwalList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHariChange = (e) => {
    const h = e.target.value;
    setSelectedHari(h);
    fetchFilteredJadwal(h, selectedKelas);
  };

  const handleKelasChange = (e) => {
    const k = e.target.value;
    setSelectedKelas(k);
    fetchFilteredJadwal(selectedHari, k);
  };

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Calendar size={20} color="#0066ff" /> Manajemen Jadwal Pelajaran & Mengajar
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Jadwal alokasi mata pelajaran, kelas, dan guru pengajar per hari
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline-admin" onClick={() => window.print()}>
              <Printer size={16} /> Cetak / Print
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>FILTER HARI</label>
            <select
              value={selectedHari}
              onChange={handleHariChange}
              className="form-control-admin"
            >
              <option value="ALL">Semua Hari (Senin - Sabtu)</option>
              {daftarHari.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>FILTER KELAS</label>
            <select
              value={selectedKelas}
              onChange={handleKelasChange}
              className="form-control-admin"
            >
              <option value="ALL">Semua Kelas</option>
              {kelasList.map(k => (
                <option key={k.kode_kelas} value={k.kode_kelas}>
                  {k.nama_kelas} {k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-outline-admin" onClick={() => fetchFilteredJadwal(selectedHari, selectedKelas)} title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* JADWAL TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Hari</th>
                <th>Jam Ke</th>
                <th>Waktu / Jam</th>
                <th>Kelas</th>
                <th>Mata Pelajaran</th>
                <th>Guru Pengampu</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat jadwal pelajaran...
                  </td>
                </tr>
              ) : jadwalList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada jadwal yang cocok untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                jadwalList.map((j, idx) => (
                  <tr key={j.kode_jadwal || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                    <td>
                      <span style={{
                        background: j.hari === 'Senin' ? '#eff6ff' : j.hari === 'Jumat' ? '#f0fdf4' : '#f8fafc',
                        color: j.hari === 'Senin' ? '#1d4ed8' : j.hari === 'Jumat' ? '#15803d' : '#0f172a',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12
                      }}>
                        {j.hari}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#475569' }}>
                        Ke-{j.jam_ke || '-'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0f172a', fontWeight: 600 }}>
                        <Clock size={13} color="#64748b" />
                        {j.jam || 'Jam Belajar'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#0066ff' }}>
                        {j.nama_kelas || `Kelas ${j.kode_kelas}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>
                        {j.nama_mapel || 'Mata Pelajaran'}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#334155', fontWeight: 600 }}>
                        {j.nama_guru || 'Guru Pengampu'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
