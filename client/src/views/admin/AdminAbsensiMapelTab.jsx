import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, Filter, Calendar, Save, CheckCircle2,
  RefreshCw, Building2, Users, AlertCircle, HeartPulse, Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import PresensiSubTabNav from './PresensiSubTabNav';

const getTodayIndonesianDate = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  } catch (e) {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

export default function AdminAbsensiMapelTab({ activeSubTab = 'mapel', onTabChange }) {
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(getTodayIndonesianDate());

  const [studentList, setStudentList] = useState([]);
  const [mapelStatus, setMapelStatus] = useState({});
  const [catatanMap, setCatatanMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    if (selectedMapel && selectedKelas) {
      loadStudentsAndAttendance(selectedMapel, selectedKelas, tanggal);
    }
  }, [selectedMapel, selectedKelas, tanggal]);

  const fetchDropdowns = async () => {
    try {
      const [resM, resK] = await Promise.all([
        api.get('/mapel'),
        api.get('/kelas')
      ]);

      if (resM.data?.success && Array.isArray(resM.data.data)) {
        setMapelList(resM.data.data);
        if (resM.data.data.length > 0) setSelectedMapel(resM.data.data[0].kode_mapel);
      }

      if (resK.data?.success && Array.isArray(resK.data.data)) {
        setKelasList(resK.data.data);
        if (resK.data.data.length > 0) setSelectedKelas(resK.data.data[0].kode_kelas);
      }
    } catch (e) {
      console.error('Error fetching dropdowns:', e);
    }
  };

  const getSiswaKey = (s) => String(s.kode_siswa || s.nis_nisn || s.nis || s.nisn || s.id || s.nama_siswa);

  const loadStudentsAndAttendance = async (mapelId, kelasId, tgl) => {
    setLoading(true);
    try {
      // 1. Fetch students of selected class
      const resSiswa = await api.get(`/siswa?kode_kelas=${kelasId}`);
      let list = [];
      if (resSiswa.data?.success && Array.isArray(resSiswa.data.data)) {
        list = resSiswa.data.data.sort((a, b) =>
          (a.nama_siswa || '').localeCompare(b.nama_siswa || '', 'id', { sensitivity: 'base' })
        );
      }
      setStudentList(list);

      // 2. Fetch existing mapel attendance
      const resAbsen = await api.get(`/absensi-mapel?kode_mapel=${mapelId}&kode_kelas=${kelasId}&tanggal=${tgl}`);
      const statusMap = {};
      const noteMap = {};
      let hasData = false;

      if (resAbsen.data?.success && Array.isArray(resAbsen.data.data) && resAbsen.data.data.length > 0) {
        hasData = true;
        const dbRecords = resAbsen.data.data;
        list.forEach(s => {
          const key = getSiswaKey(s);
          const match = dbRecords.find(r => 
            (r.kode_siswa !== undefined && String(r.kode_siswa) === String(s.kode_siswa)) ||
            (r.kode_siswa !== undefined && String(r.kode_siswa) === String(s.nis_nisn)) ||
            (r.kode_siswa !== undefined && String(r.kode_siswa) === String(s.nis)) ||
            (r.kode_siswa !== undefined && String(r.kode_siswa) === String(s.nisn)) ||
            (r.nisn !== undefined && String(r.nisn) === String(s.nisn)) ||
            (r.nisn !== undefined && String(r.nisn) === String(s.nis_nisn)) ||
            (r.nisn !== undefined && String(r.nisn) === String(s.nis))
          );
          statusMap[key] = match && match.status ? match.status : 'H';
          noteMap[key] = match && match.catatan ? match.catatan : '';
        });
      } else {
        list.forEach(s => {
          const key = getSiswaKey(s);
          statusMap[key] = 'H';
          noteMap[key] = '';
        });
      }

      setMapelStatus(statusMap);
      setCatatanMap(noteMap);
      setIsExistingData(hasData);
    } catch (e) {
      console.error('Error loading mapel attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (sKey, status) => {
    setMapelStatus(prev => ({
      ...prev,
      [sKey]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    studentList.forEach(s => {
      const key = getSiswaKey(s);
      updated[key] = status;
    });
    setMapelStatus(updated);
  };

  const handleSave = async () => {
    if (studentList.length === 0) return;

    setSaving(true);
    try {
      const records = studentList.map(s => {
        const key = getSiswaKey(s);
        return {
          kode_siswa: s.kode_siswa || s.nis_nisn || s.nis || s.nisn,
          nisn: s.nis_nisn || s.nisn || s.nis || s.kode_siswa,
          nama_siswa: s.nama_siswa,
          status: mapelStatus[key] || 'H',
          catatan: catatanMap[key] || ''
        };
      });

      const res = await api.post('/absensi-mapel/batch', {
        kode_mapel: selectedMapel,
        kode_kelas: selectedKelas,
        tanggal,
        list_absensi: records,
        records
      });

      if (res.data?.success) {
        setIsExistingData(true);
        Swal.fire({
          title: 'Berhasil Disimpan!',
          text: `Presensi mata pelajaran untuk tanggal ${tanggal} berhasil disimpan.`,
          icon: 'success',
          confirmButtonColor: '#0066ff'
        });
      }
    } catch (err) {
      Swal.fire('Gagal Menyimpan', err.response?.data?.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  studentList.forEach(s => {
    const key = getSiswaKey(s);
    const st = mapelStatus[key] || 'H';
    if (st === 'H') hadirCount++;
    else if (st === 'S') sakitCount++;
    else if (st === 'I') izinCount++;
    else if (st === 'A') alpaCount++;
  });

  const selectedMapelObj = mapelList.find(m => m.kode_mapel === selectedMapel);
  const selectedKelasObj = kelasList.find(k => k.kode_kelas === selectedKelas);

  return (
    <div className="admin-absensi-wrapper">
      {/* STATS OVERVIEW CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Siswa Terdaftar di Mapel</div>
            <div className="stat-value">{studentList.length}</div>
            <div className="stat-subtext">
              <span style={{ color: '#0284c7' }}>●</span> {selectedKelasObj?.nama_kelas || ''} • {selectedMapelObj?.nama_mapel || ''}
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <BookOpen size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Hadir (H)</div>
            <div className="stat-value" style={{ color: '#059669' }}>{hadirCount}</div>
            <div className="stat-subtext">
              <span style={{ color: '#059669' }}>●</span> {studentList.length > 0 ? `${Math.round((hadirCount / studentList.length) * 100)}% kehadiran` : '0%'}
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle2 size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Sakit & Izin (S / I)</div>
            <div className="stat-value" style={{ color: '#d97706' }}>{sakitCount + izinCount}</div>
            <div className="stat-subtext">
              <span style={{ color: '#d97706' }}>●</span> {sakitCount} Sakit, {izinCount} Izin
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <HeartPulse size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Alpa (A)</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{alpaCount}</div>
            <div className="stat-subtext">
              <span style={{ color: '#dc2626' }}>●</span> Bolos / Tanpa izin
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
              <BookOpen size={18} color="#0284c7" /> Pencatatan Kehadiran Siswa per Mata Pelajaran
            </div>
            <div className="admin-panel-subtitle">
              Status: {isExistingData ? (
                <span style={{ color: '#059669', fontWeight: 700 }}>● Sudah Tersimpan di Database</span>
              ) : (
                <span style={{ color: '#d97706', fontWeight: 700 }}>● Belum Ada Catatan / Baru</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-outline-admin"
              onClick={() => handleMarkAll('H')}
              title="Set semua hadir"
            >
              <CheckCircle2 size={16} color="#059669" /> Semua Hadir
            </button>
            <button
              className="btn-primary-admin"
              onClick={handleSave}
              disabled={saving || studentList.length === 0}
            >
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Absensi Mapel'}
            </button>
          </div>
        </div>

        {/* SUBTAB TOGGLE (DI ATAS FILTER SEPERTI REKAP PRESENSI) */}
        <PresensiSubTabNav activeSubTab={activeSubTab} onTabChange={onTabChange} />

        {/* CONTROLS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 14, marginBottom: 18, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              MATA PELAJARAN
            </label>
            <SearchableSelect
              options={mapelList.map(m => ({
                value: m.kode_mapel,
                label: `${m.nama_mapel} (${m.kode_mapel})`
              }))}
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              placeholder="-- Pilih Mata Pelajaran --"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              KELAS
            </label>
            <SearchableSelect
              options={kelasList.map(k => ({
                value: k.kode_kelas,
                label: k.nama_kelas
              }))}
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              placeholder="-- Pilih Kelas --"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              TANGGAL MENGAJAR
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="form-control-admin"
            />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              className="btn-outline-admin"
              onClick={() => loadStudentsAndAttendance(selectedMapel, selectedKelas, tanggal)}
              title="Refresh Data"
            >
              <RefreshCw size={13} /> Muat Ulang
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th style={{ width: 140 }}>NISN</th>
                <th>Nama Lengkap Siswa</th>
                <th style={{ width: 80 }}>L/P</th>
                <th style={{ width: 340, textAlign: 'center' }}>Status Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat daftar siswa...
                  </td>
                </tr>
              ) : studentList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada siswa di kelas yang dipilih.
                  </td>
                </tr>
              ) : (
                (() => {
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedList = studentList.slice(startIndex, startIndex + itemsPerPage);
                  return paginatedList.map((siswa, idx) => {
                    const sKey = getSiswaKey(siswa);
                    const currentStatus = mapelStatus[sKey] || 'H';
                    const isL = (siswa.jenis_kelamin || '').toUpperCase() === 'L';
                    const nisnDisplay = siswa.nis_nisn || siswa.nisn || siswa.nis || siswa.kode_siswa || '-';

                    return (
                      <tr key={sKey || idx}>
                        <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0066ff', textAlign: 'center' }}>{nisnDisplay}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{siswa.nama_siswa}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{siswa.nis ? `NIS: ${siswa.nis}` : ''}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            background: isL ? '#eff6ff' : '#fdf2f8',
                            color: isL ? '#1d4ed8' : '#be185d'
                          }}>
                            {isL ? 'L' : 'P'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(sKey, 'H')}
                              title="Hadir (H)"
                              style={{
                                width: 38,
                                height: 32,
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 800,
                                cursor: 'pointer',
                                border: currentStatus === 'H' ? '2px solid #059669' : '1px solid #cbd5e1',
                                background: currentStatus === 'H' ? '#ecfdf5' : '#ffffff',
                                color: currentStatus === 'H' ? '#059669' : '#64748b',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              H
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(sKey, 'S')}
                              title="Sakit (S)"
                              style={{
                                width: 38,
                                height: 32,
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 800,
                                cursor: 'pointer',
                                border: currentStatus === 'S' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                background: currentStatus === 'S' ? '#eff6ff' : '#ffffff',
                                color: currentStatus === 'S' ? '#2563eb' : '#64748b',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              S
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(sKey, 'I')}
                              title="Izin (I)"
                              style={{
                                width: 38,
                                height: 32,
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 800,
                                cursor: 'pointer',
                                border: currentStatus === 'I' ? '2px solid #d97706' : '1px solid #cbd5e1',
                                background: currentStatus === 'I' ? '#fffbeb' : '#ffffff',
                                color: currentStatus === 'I' ? '#d97706' : '#64748b',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              I
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(sKey, 'A')}
                              title="Alpa (A)"
                              style={{
                                width: 38,
                                height: 32,
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 800,
                                cursor: 'pointer',
                                border: currentStatus === 'A' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                                background: currentStatus === 'A' ? '#fef2f2' : '#ffffff',
                                color: currentStatus === 'A' ? '#dc2626' : '#64748b',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              A
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalItems={studentList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
