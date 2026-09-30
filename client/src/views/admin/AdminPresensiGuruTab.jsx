import React, { useState, useEffect } from 'react';
import {
  Fingerprint, Search, Filter, Calendar, Clock, CheckCircle2,
  AlertCircle, RefreshCw, User, MapPin, Eye, X, Download,
  ExternalLink, Navigation
} from 'lucide-react';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

const getCoordinates = (item) => {
  if (!item) return null;
  if (item.latitude && item.longitude) {
    return { lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) };
  }
  if (item.lat && item.lng) {
    return { lat: parseFloat(item.lat), lng: parseFloat(item.lng) };
  }
  const loc = item.lokasi_in || item.lokasi || '';
  const match = String(loc).match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };
  }
  return null;
};

export default function AdminPresensiGuruTab() {
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());
  const [selectedGuru, setSelectedGuru] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'LENGKAP', 'BELUM_PULANG', 'TERLAMBAT'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, selectedGuru, selectedBulan, selectedTahun]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  // Summary counts
  const totalHadir = presensiList.length;
  const totalLengkap = presensiList.filter(p => p.jam_in && p.jam_out).length;
  const totalBelumPulang = presensiList.filter(p => p.jam_in && !p.jam_out).length;
  const totalTerlambat = presensiList.filter(p => p.jam_in && p.jam_in > '07:15:00').length;

  const [selectedDetail, setSelectedDetail] = useState(null);

  return (
    <div className="admin-presensi-wrapper">
      {/* STATS OVERVIEW CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Total Log Presensi</div>
            <div className="stat-value">{totalHadir}</div>
            <div className="stat-subtext">
              <span style={{ color: '#0284c7' }}>●</span> Presensi tercatat
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Fingerprint size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Presensi Lengkap</div>
            <div className="stat-value" style={{ color: '#059669' }}>{totalLengkap}</div>
            <div className="stat-subtext">
              <span style={{ color: '#059669' }}>●</span> Sudah scan pulang
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle2 size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Belum Scan Pulang</div>
            <div className="stat-value" style={{ color: '#d97706' }}>{totalBelumPulang}</div>
            <div className="stat-subtext">
              <span style={{ color: '#d97706' }}>●</span> Masih di sekolah
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <Clock size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Terlambat (&gt; 07:15)</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{totalTerlambat}</div>
            <div className="stat-subtext">
              <span style={{ color: '#dc2626' }}>●</span> Lewat batas masuk
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-red">
            <AlertCircle size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>
      </div>

      {/* MAIN DATA PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Fingerprint size={18} color="#0284c7" /> Log Presensi Harian Guru & Tenaga Kependidikan
            </div>
            <div className="admin-panel-subtitle">
              Pemantauan waktu check-in, check-out, geolocation, dan foto selfie presensi
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
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

          <SearchableSelect
            options={[
              { value: '', label: 'Semua Guru' },
              ...guruList.map(g => ({ value: g.kode_guru, label: g.nama_guru }))
            ]}
            value={selectedGuru}
            onChange={(e) => setSelectedGuru(e.target.value)}
            placeholder="Semua Guru"
          />

          <SearchableSelect
            options={daftarBulan.map(b => ({ value: b.value, label: b.label }))}
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            placeholder="Pilih Bulan"
          />

          <SearchableSelect
            options={daftarTahun.map(t => ({ value: t, label: `Tahun ${t}` }))}
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            placeholder="Pilih Tahun"
          />

          <SearchableSelect
            options={[
              { value: 'ALL', label: 'Semua Status' },
              { value: 'LENGKAP', label: 'Lengkap (In & Out)' },
              { value: 'BELUM_PULANG', label: 'Belum Scan Pulang' },
              { value: 'TERLAMBAT', label: 'Terlambat' }
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            placeholder="Semua Status"
          />
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
                <th>Lokasi Presensi</th>
                <th style={{ width: 90, textAlign: 'center' }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data presensi dari database...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada catatan presensi pada periode yang dipilih.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const isTerlambat = item.jam_in && item.jam_in > '07:15:00';

                  return (
                    <tr key={item.id || idx}>
                      <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama_guru}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{item.nip_nuptk && item.nip_nuptk !== '-' ? `NIP: ${item.nip_nuptk}` : ''}</div>
                      </td>
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>{item.tanggal}</td>
                      <td style={{ textAlign: 'center' }}>
                        {item.jam_in ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, color: isTerlambat ? '#dc2626' : '#059669' }}>
                              {item.jam_in}
                            </span>
                            {isTerlambat && (
                              <span style={{ fontSize: 10, background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                Terlambat
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.jam_out ? (
                          <span style={{ fontWeight: 700, color: '#0066ff' }}>{item.jam_out}</span>
                        ) : (
                          <span style={{ fontSize: 11, background: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                            Belum Scan
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 11.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} color="#0066ff" />
                          <span>{item.lokasi_in ? item.lokasi_in.substring(0, 30) + (item.lokasi_in.length > 30 ? '...' : '') : 'Di Area Sekolah'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-outline-detail"
                          onClick={() => setSelectedDetail(item)}
                          title="Lihat Detail Presensi"
                        >
                          <Eye size={13} /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* DETAIL MODAL */}
      {selectedDetail && (
        <div className="admin-modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="admin-modal-box" style={{ maxWidth: 580, width: '94%' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #0284c7, #0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Fingerprint size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>Rincian Presensi Guru</h3>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {selectedDetail.nama_guru} {selectedDetail.nip_nuptk && selectedDetail.nip_nuptk !== '-' ? `(${selectedDetail.nip_nuptk})` : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '18px 20px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tanggal Presensi</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{selectedDetail.tanggal}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status Sesi</div>
                  <div style={{ marginTop: 2 }}>
                    {selectedDetail.jam_in && selectedDetail.jam_out ? (
                      <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                        Lengkap (In & Out)
                      </span>
                    ) : (
                      <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                        Belum Scan Pulang
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Jam Masuk</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: selectedDetail.jam_in > '07:15:00' ? '#dc2626' : '#059669', marginTop: 2 }}>
                    {selectedDetail.jam_in || '-'}
                  </div>
                </div>
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Jam Pulang</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0066ff', marginTop: 2 }}>
                    {selectedDetail.jam_out || '-'}
                  </div>
                </div>
              </div>

              {/* LOKASI & INTERACTIVE MAPS SECTION */}
              {(() => {
                const coords = getCoordinates(selectedDetail);
                return (
                  <div style={{ background: '#ffffff', padding: '14px', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={14} color="#0284c7" /> Titik Peta Lokasi Presensi
                      </div>
                      {coords && (
                        <a
                          href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline-admin"
                          style={{ padding: '3px 8px', fontSize: 11, gap: 4, height: 26, textDecoration: 'none' }}
                        >
                          <ExternalLink size={12} /> Buka di Google Maps
                        </a>
                      )}
                    </div>

                    <div style={{ fontSize: 12, color: '#334155', marginBottom: coords ? 10 : 0 }}>
                      <span style={{ fontWeight: 600 }}>Keterangan Lokasi: </span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>
                        {selectedDetail.lokasi_in || (coords ? `${coords.lat}, ${coords.lng}` : 'Di Area Sekolah (SMK Artanita)')}
                      </span>
                    </div>

                    {coords ? (
                      <div style={{
                        width: '100%',
                        height: 200,
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: '1px solid #cbd5e1',
                        background: '#f1f5f9',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}>
                        <iframe
                          title="Peta Lokasi Presensi Guru"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight="0"
                          marginWidth="0"
                          src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=id&z=16&output=embed`}
                          style={{ border: 0 }}
                        />
                      </div>
                    ) : (
                      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b', fontSize: 12, border: '1px dashed #cbd5e1' }}>
                        Tidak ada koordinat GPS terlampir pada log presensi ini.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* FOTO SELFIE PRESENSI */}
              {(selectedDetail.foto_in || selectedDetail.foto_out) && (
                <div style={{ display: 'grid', gridTemplateColumns: (selectedDetail.foto_in && selectedDetail.foto_out) ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {selectedDetail.foto_in && (
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 8, textAlign: 'left' }}>
                        📷 Foto Selfie Masuk
                      </div>
                      <img
                        src={selectedDetail.foto_in}
                        alt="Foto Selfie Masuk"
                        style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                    </div>
                  )}

                  {selectedDetail.foto_out && (
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8, textAlign: 'left' }}>
                        📷 Foto Selfie Pulang
                      </div>
                      <img
                        src={selectedDetail.foto_out}
                        alt="Foto Selfie Pulang"
                        style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className="btn-primary-admin"
                onClick={() => setSelectedDetail(null)}
                style={{ padding: '6px 20px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
