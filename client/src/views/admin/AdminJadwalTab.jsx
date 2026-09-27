import React, { useState, useEffect } from 'react';
import {
  Calendar, Search, RefreshCw, Clock, Building2, User, BookOpen
} from 'lucide-react';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function AdminJadwalTab() {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'list'
  const [jadwalList, setJadwalList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedHari, setSelectedHari] = useState('Senin');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const daftarHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const classColumns = [
    'X AKL', 'X MPLB', 'X PM', 'X PPLG',
    'XI AKL', 'XI MPLB', 'XI PM', 'XI PPLG',
    'XII AKL', 'XII MPLB', 'XII PM', 'XII PPLG'
  ];

  const timeSlots = [
    { jam: 1, range: '07.00 - 07.40' },
    { jam: 2, range: '07.40 - 08.20' },
    { jam: 3, range: '08.20 - 09.00' },
    { jam: 4, range: '09.00 - 09.40' },
    { jam: 5, range: '09.40 - 10.10' }, // Istirahat
    { jam: 6, range: '10.10 - 10.50' },
    { jam: 7, range: '10.50 - 11.30' },
    { jam: 8, range: '11.30 - 12.10' },
    { jam: 9, range: '12.10 - 12.40' }, // Istirahat / Sholat
    { jam: 10, range: '12.40 - 13.20' },
    { jam: 11, range: '13.20 - 14.00' }
  ];

  const defaultScheduleMatrix = {
    1: { 'X AKL': '4', 'X MPLB': '22', 'X PPLG': '7' },
    2: { 'X AKL': '5', 'X MPLB': '19', 'X PM': '7', 'X PPLG': '8' },
    3: { 'X AKL': '7', 'X MPLB': '19', 'X PM': '6', 'X PPLG': '7' },
    4: { 'X AKL': '8', 'X MPLB': '3', 'X PM': '7', 'X PPLG': '6' },
    5: {}, // Istirahat
    6: { 'X AKL': '5', 'X MPLB': '5', 'X PM': '7', 'X PPLG': '7' },
    7: { 'X AKL': '4', 'X MPLB': '6', 'X PM': '5', 'X PPLG': '7' },
    8: { 'X AKL': '5', 'X MPLB': '6', 'X PM': '5', 'X PPLG': '7' },
    9: {}, // Istirahat
    10: { 'X AKL': '7', 'X MPLB': '14', 'X PPLG': '6', 'XI AKL': '8', 'XI MPLB': '19', 'XI PM': '12', 'XI PPLG': '7', 'XII AKL': '21', 'XII MPLB': '4' },
    11: { 'X AKL': '7', 'X MPLB': '5', 'X PPLG': '6', 'XI AKL': '8', 'XI MPLB': '19', 'XI PPLG': '2', 'XII AKL': '21', 'XII MPLB': '7' }
  };

  const getCellValue = (jam, className) => {
    if (jadwalList.length > 0) {
      const match = jadwalList.find(j => {
        const kMatch = (j.nama_kelas || '').toUpperCase().includes(className.replace(/\s+/g, '').toUpperCase()) ||
                       (j.nama_kelas || '').toUpperCase() === className.toUpperCase();
        return (j.jam_ke === jam || String(j.jam_ke) === String(jam)) && kMatch;
      });
      if (match) return match.kode_guru || match.kode_mapel || match.nama_guru?.substring(0, 3) || match.nama_mapel?.substring(0, 4) || '✓';
    }
    return defaultScheduleMatrix[jam]?.[className] || '';
  };

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedHari, selectedKelas]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = jadwalList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Calendar size={18} color="#0284c7" /> Jadwal Pelajaran & Matriks Jam Mengajar
            </div>
            <div className="admin-panel-subtitle">
              Struktur jadwal mingguan seluruh tingkat kelas dan alokasi jam mengajar
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn-outline-admin ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => setViewMode('matrix')}
              style={{
                background: viewMode === 'matrix' ? '#0284c7' : '#ffffff',
                color: viewMode === 'matrix' ? '#ffffff' : '#334155',
                borderColor: viewMode === 'matrix' ? '#0284c7' : '#cbd5e1',
                fontWeight: 600
              }}
            >
              Matriks Grid Jadwal
            </button>
            <button
              type="button"
              className={`btn-outline-admin ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#0284c7' : '#ffffff',
                color: viewMode === 'list' ? '#ffffff' : '#334155',
                borderColor: viewMode === 'list' ? '#0284c7' : '#cbd5e1',
                fontWeight: 600
              }}
            >
              Daftar Baris Data
            </button>
          </div>
        </div>

        {/* 1. MATRIX VIEW (EXACT SCREENSHOT LAYOUT) */}
        {viewMode === 'matrix' && (
          <div>
            {/* DAY SELECTOR DROPDOWN */}
            <div className="portal-day-selector-wrapper" style={{ marginBottom: 16 }}>
              <select
                value={selectedHari}
                onChange={(e) => {
                  const h = e.target.value;
                  setSelectedHari(h);
                  fetchFilteredJadwal(h, selectedKelas);
                }}
                className="portal-day-select"
              >
                {daftarHari.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* MATRIX GRID TABLE */}
            <div className="portal-matrix-table-wrap">
              <table className="portal-matrix-table">
                <thead>
                  {/* TOP HEADER ROW */}
                  <tr>
                    <th colSpan={2} className="matrix-th-waktu">WAKTU</th>
                    <th colSpan={classColumns.length} className="matrix-th-kelas">KELAS</th>
                  </tr>
                  {/* SUB HEADER ROW */}
                  <tr>
                    <th className="matrix-th-jam">JAM</th>
                    <th className="matrix-th-range">DARI - SAMPAI</th>
                    {classColumns.map(col => (
                      <th key={col} className="matrix-th-class">
                        <div>{col.split(' ')[0]}</div>
                        <div style={{ fontWeight: 800 }}>{col.split(' ')[1]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(slot => (
                    <tr key={slot.jam}>
                      <td className="matrix-td-jam">{slot.jam}</td>
                      <td className="matrix-td-range">{slot.range}</td>
                      {classColumns.map(col => {
                        const val = getCellValue(slot.jam, col);
                        return (
                          <td key={col} className="matrix-td-cell">
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. LIST VIEW (WITH 10 DATA ITEMS PER PAGE PAGINATION) */}
        {viewMode === 'list' && (
          <div>
            {/* FILTERS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>FILTER HARI</label>
                <SearchableSelect
                  value={selectedHari}
                  onChange={handleHariChange}
                  options={[
                    { value: 'ALL', label: 'Semua Hari (Senin - Sabtu)' },
                    ...daftarHari.map(h => ({ value: h, label: h }))
                  ]}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>FILTER KELAS</label>
                <SearchableSelect
                  value={selectedKelas}
                  onChange={handleKelasChange}
                  options={[
                    { value: 'ALL', label: 'Semua Kelas' },
                    ...kelasList.map(k => ({
                      value: k.kode_kelas,
                      label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                    }))
                  ]}
                />
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
                    <th style={{ width: 50, textAlign: 'center' }}>No</th>
                    <th style={{ textAlign: 'center' }}>Hari</th>
                    <th style={{ textAlign: 'center' }}>Jam Ke</th>
                    <th style={{ textAlign: 'center' }}>Waktu / Jam</th>
                    <th style={{ textAlign: 'center' }}>Kelas</th>
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
                    paginatedList.map((j, idx) => (
                      <tr key={j.kode_jadwal || idx}>
                        <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            background: j.hari === 'Senin' ? '#eff6ff' : j.hari === 'Jumat' ? '#f0fdf4' : '#f8fafc',
                            color: j.hari === 'Senin' ? '#1d4ed8' : j.hari === 'Jumat' ? '#15803d' : '#0f172a',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: 11.5
                          }}>
                            {j.hari}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#475569' }}>
                            Ke-{j.jam_ke || '-'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0f172a', fontWeight: 600 }}>
                            <Clock size={13} color="#64748b" />
                            {j.jam || 'Jam Belajar'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
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

            {/* PAGINATION */}
            <Pagination
              currentPage={currentPage}
              totalItems={jadwalList.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
