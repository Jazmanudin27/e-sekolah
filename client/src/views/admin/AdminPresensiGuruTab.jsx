import React, { useState, useEffect } from 'react';
import {
  Fingerprint, Search, Filter, Calendar, Clock, CheckCircle2,
  AlertCircle, RefreshCw, Printer, User, MapPin, Eye, X, Download
} from 'lucide-react';
import api from '../../api/client';

export default function AdminPresensiGuruTab() {
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());
  const [selectedGuru, setSelectedGuru] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'LENGKAP', 'BELUM_PULANG', 'TERLAMBAT'

  const [guruList, setGuruList] = useState([]);
  const [presensiList, setPresensiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const daftarBulan = [
    { value: '', label: 'Semua Bulan' },
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];

  const daftarTahun = [2024, 2025, 2026, 2027];

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchPresensi();
  }, [selectedBulan, selectedTahun, selectedGuru]);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/guru');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setGuruList(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching teachers:', e);
    }
  };

  const fetchPresensi = async () => {
    setLoading(true);
    try {
      let url = `/presensi/history?limit=200`;
      if (selectedBulan) url += `&bulan=${selectedBulan}`;
      if (selectedTahun) url += `&tahun=${selectedTahun}`;
      if (selectedGuru) url += `&kode_guru=${selectedGuru}`;

      const res = await api.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPresensiList(res.data.data);
      } else {
        setPresensiList([]);
      }
    } catch (err) {
      console.error('Error fetching presensi:', err);
      setPresensiList([]);
    } finally {
      setLoading(false);
    }
  };

  // Attach teacher info if missing
  const guruMap = {};
  guruList.forEach(g => {
    guruMap[g.kode_guru] = g;
  });

  const enrichedList = presensiList.map(p => {
    const teacher = guruMap[p.kode_guru] || {};
    return {
      ...p,
      nama_guru: p.nama_guru || teacher.nama_guru || `Guru #${p.kode_guru}`,
      nip_nuptk: p.nip_nuptk || teacher.nip_nuptk || '-'
    };
  });

  // Filter list by search and status
  const filteredList = enrichedList.filter(item => {
    const matchSearch =
      (item.nama_guru || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.nip_nuptk || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.tanggal || '').includes(search);

    const isLengkap = item.jam_in && item.jam_out;
    const isBelumPulang = item.jam_in && !item.jam_out;
    const isTerlambat = item.jam_in && item.jam_in > '07:15:00';

    if (filterStatus === 'LENGKAP') return matchSearch && isLengkap;
    if (filterStatus === 'BELUM_PULANG') return matchSearch && isBelumPulang;
    if (filterStatus === 'TERLAMBAT') return matchSearch && isTerlambat;
    return matchSearch;
  });

  // Summary counts
  const totalHadir = presensiList.length;
  const totalLengkap = presensiList.filter(p => p.jam_in && p.jam_out).length;
  const totalBelumPulang = presensiList.filter(p => p.jam_in && !p.jam_out).length;
  const totalTerlambat = presensiList.filter(p => p.jam_in && p.jam_in > '07:15:00').length;

  return (
    <div className="admin-presensi-wrapper">
      {/* STATS OVERVIEW CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Total Log Presensi</div>
            <div className="stat-value">{totalHadir}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Presensi tercatat</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Fingerprint size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Presensi Lengkap (In & Out)</div>
            <div className="stat-value" style={{ color: '#059669' }}>{totalLengkap}</div>
            <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Sudah scan pulang</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Belum Scan Pulang</div>
            <div className="stat-value" style={{ color: '#d97706' }}>{totalBelumPulang}</div>
            <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>Masih di sekolah / belum checkout</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <Clock size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Terlambat (&gt; 07:15 WIB)</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{totalTerlambat}</div>
            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Lewat batas jam masuk</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-purple" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* MAIN DATA PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Fingerprint size={20} color="#0066ff" /> Log Presensi Harian Guru & Tenaga Kependidikan
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Pemantauan waktu check-in, check-out, geolocation, dan foto selfie presensi
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline-admin" onClick={() => window.print()}>
              <Printer size={16} /> Cetak Laporan
            </button>
            <button className="btn-outline-admin" onClick={fetchPresensi} title="Segarkan Data">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* TOOLBAR CONTROLS */}
        <div className="table-toolbar-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari nama guru, NIP, tanggal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <select
            value={selectedGuru}
            onChange={(e) => setSelectedGuru(e.target.value)}
            className="form-control-admin"
          >
            <option value="">Semua Guru</option>
            {guruList.map(g => (
              <option key={g.kode_guru} value={g.kode_guru}>{g.nama_guru}</option>
            ))}
          </select>

          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="form-control-admin"
          >
            {daftarBulan.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>

          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="form-control-admin"
          >
            {daftarTahun.map(t => (
              <option key={t} value={t}>Tahun {t}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control-admin"
          >
            <option value="ALL">Semua Status</option>
            <option value="LENGKAP">Lengkap (In & Out)</option>
            <option value="BELUM_PULANG">Belum Scan Pulang</option>
            <option value="TERLAMBAT">Terlambat</option>
          </select>
        </div>

        {/* DATA TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Nama Guru & NIP</th>
                <th>Tanggal</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Status Kehadiran</th>
                <th>Lokasi Presensi</th>
                <th style={{ width: 80, textAlign: 'center' }}>Foto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data presensi dari database...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada catatan presensi pada periode yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isTerlambat = item.jam_in && item.jam_in > '07:15:00';
                  const isComplete = item.jam_in && item.jam_out;

                  return (
                    <tr key={item.id || idx}>
                      <td style={{ fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama_guru}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>NIP: {item.nip_nuptk}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.tanggal}</td>
                      <td>
                        {item.jam_in ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, color: isTerlambat ? '#dc2626' : '#059669' }}>
                              {item.jam_in}
                            </span>
                            {isTerlambat && (
                              <span style={{ fontSize: 10, background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>
                                Terlambat
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>-</span>
                        )}
                      </td>
                      <td>
                        {item.jam_out ? (
                          <span style={{ fontWeight: 700, color: '#0066ff' }}>{item.jam_out}</span>
                        ) : (
                          <span style={{ fontSize: 11, background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>
                            Belum Scan
                          </span>
                        )}
                      </td>
                      <td>
                        {isComplete ? (
                          <span className="badge-status-aktif">
                            <span className="status-dot"></span> Lengkap
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
                            Hadir (Aktif)
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 11.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} color="#0066ff" />
                          <span>{item.lokasi_in ? item.lokasi_in.substring(0, 25) + '...' : 'Di Area Sekolah'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.foto_in ? (
                          <button
                            className="btn-action-icon"
                            style={{ background: '#f0fdf4', color: '#16a34a' }}
                            onClick={() => setPreviewPhoto(item.foto_in)}
                            title="Lihat Foto Selfie Presensi"
                          >
                            <Eye size={15} />
                          </button>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: 11 }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#64748b' }}>
          <div>
            Menampilkan <strong>{filteredList.length}</strong> catatan presensi
          </div>
          <div>
            Sistem Presensi Real-Time E-Sekolah
          </div>
        </div>
      </div>

      {/* PHOTO PREVIEW MODAL */}
      {previewPhoto && (
        <div className="admin-modal-overlay" onClick={() => setPreviewPhoto(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>Foto Selfie Presensi</div>
              <button className="btn-action-icon" onClick={() => setPreviewPhoto(null)}>
                <X size={16} />
              </button>
            </div>
            <img
              src={previewPhoto}
              alt="Foto Presensi"
              style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid #e2e8f0', objectFit: 'cover' }}
            />
            <button
              className="btn-primary-admin"
              style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
              onClick={() => setPreviewPhoto(null)}
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
