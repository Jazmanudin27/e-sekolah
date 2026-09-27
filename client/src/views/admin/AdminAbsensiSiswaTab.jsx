import React, { useState, useEffect } from 'react';
import {
  UserCheck, Search, Filter, Calendar, Save, CheckCircle2,
  RefreshCw, Building2, Users, AlertCircle, HeartPulse, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

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

export default function AdminAbsensiSiswaTab() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(getTodayIndonesianDate());

  const [studentList, setStudentList] = useState([]);
  const [studentStatus, setStudentStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    if (selectedKelas) {
      loadStudentsAndAttendance(selectedKelas, tanggal);
    }
  }, [selectedKelas, tanggal]);

  const fetchKelas = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setKelasList(res.data.data);
        setSelectedKelas(res.data.data[0].kode_kelas);
      }
    } catch (e) {
      console.error('Error fetching kelas:', e);
    }
  };

  const loadStudentsAndAttendance = async (kelasId, tgl) => {
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

      // 2. Fetch existing attendance
      const resAbsen = await api.get(`/absensi-siswa?kode_kelas=${kelasId}&tanggal=${tgl}`);
      const statusMap = {};
      let hasData = false;

      if (resAbsen.data?.success && Array.isArray(resAbsen.data.data) && resAbsen.data.data.length > 0) {
        hasData = true;
        resAbsen.data.data.forEach(item => {
          statusMap[item.nisn] = item.status;
        });
      } else {
        // Default all to 'H' (Hadir)
        list.forEach(s => {
          statusMap[s.nisn] = 'H';
        });
      }

      setStudentStatus(statusMap);
      setIsExistingData(hasData);
    } catch (e) {
      console.error('Error loading attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (nisn, status) => {
    setStudentStatus(prev => ({
      ...prev,
      [nisn]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    studentList.forEach(s => {
      updated[s.nisn] = status;
    });
    setStudentStatus(updated);
  };

  const handleSave = async () => {
    if (studentList.length === 0) return;

    setSaving(true);
    try {
      const records = studentList.map(s => ({
        nisn: s.nisn,
        nama_siswa: s.nama_siswa,
        status: studentStatus[s.nisn] || 'H'
      }));

      const res = await api.post('/absensi-siswa/batch', {
        kode_kelas: selectedKelas,
        tanggal,
        records
      });

      if (res.data?.success) {
        setIsExistingData(true);
        Swal.fire({
          title: 'Berhasil Disimpan!',
          text: `Data absensi kelas untuk tanggal ${tanggal} berhasil disimpan.`,
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
    const st = studentStatus[s.nisn];
    if (st === 'H') hadirCount++;
    else if (st === 'S') sakitCount++;
    else if (st === 'I') izinCount++;
    else if (st === 'A') alpaCount++;
  });

  const selectedKelasObj = kelasList.find(k => k.kode_kelas === selectedKelas);

  return (
    <div className="admin-absensi-wrapper">
      {/* STATS OVERVIEW CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Total Siswa di Kelas</div>
            <div className="stat-value">{studentList.length}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {selectedKelasObj?.nama_kelas || 'Kelas Terpilih'}
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Users size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Hadir (H)</div>
            <div className="stat-value" style={{ color: '#059669' }}>{hadirCount}</div>
            <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
              {studentList.length > 0 ? `${Math.round((hadirCount / studentList.length) * 100)}% kehadiran` : '0%'}
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Sakit & Izin (S / I)</div>
            <div className="stat-value" style={{ color: '#d97706' }}>{sakitCount + izinCount}</div>
            <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>
              {sakitCount} Sakit, {izinCount} Izin
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <HeartPulse size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Alpa / Tanpa Keterangan</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{alpaCount}</div>
            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
              Tidak ada keterangan
            </div>
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
              <UserCheck size={18} color="#0284c7" /> Pencatatan Absensi Harian Siswa
            </div>
            <div className="admin-panel-subtitle">
              Status: {isExistingData ? (
                <span style={{ color: '#059669', fontWeight: 700 }}>● Sudah Tersimpan di Database</span>
              ) : (
                <span style={{ color: '#d97706', fontWeight: 700 }}>● Data Baru / Belum Disimpan</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-outline-admin"
              onClick={() => handleMarkAll('H')}
              title="Set semua siswa hadir"
            >
              <CheckCircle2 size={16} color="#059669" /> Semua Hadir
            </button>
            <button
              className="btn-primary-admin"
              onClick={handleSave}
              disabled={saving || studentList.length === 0}
            >
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, marginBottom: 18, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              PILIH KELAS
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="form-control-admin"
            >
              {kelasList.map(k => (
                <option key={k.kode_kelas} value={k.kode_kelas}>
                  {k.nama_kelas} ({k.jurusan || 'Umum'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              TANGGAL PRESENSI
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
              onClick={() => loadStudentsAndAttendance(selectedKelas, tanggal)}
              title="Refresh Data"
              style={{ height: 42 }}
            >
              <RefreshCw size={16} /> Muat Ulang
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
                    Tidak ada siswa terdaftar di kelas ini.
                  </td>
                </tr>
              ) : (
                (() => {
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedList = studentList.slice(startIndex, startIndex + itemsPerPage);
                  return paginatedList.map((siswa, idx) => {
                    const currentStatus = studentStatus[siswa.nisn] || 'H';
                    const isL = (siswa.jenis_kelamin || '').toUpperCase() === 'L';

                    return (
                      <tr key={siswa.nisn || idx}>
                        <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0066ff', textAlign: 'center' }}>{siswa.nisn}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{siswa.nama_siswa}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{siswa.nis ? `NIS: ${siswa.nis}` : '-'}</div>
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
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            {/* HADIR BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.nisn, 'H')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 10,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: currentStatus === 'H' ? '2px solid #059669' : '1px solid #e2e8f0',
                                background: currentStatus === 'H' ? '#ecfdf5' : '#ffffff',
                                color: currentStatus === 'H' ? '#059669' : '#64748b',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Hadir (H)
                            </button>

                            {/* SAKIT BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.nisn, 'S')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 10,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: currentStatus === 'S' ? '2px solid #d97706' : '1px solid #e2e8f0',
                                background: currentStatus === 'S' ? '#fffbeb' : '#ffffff',
                                color: currentStatus === 'S' ? '#d97706' : '#64748b',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Sakit (S)
                            </button>

                            {/* IZIN BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.nisn, 'I')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 10,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: currentStatus === 'I' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                background: currentStatus === 'I' ? '#eff6ff' : '#ffffff',
                                color: currentStatus === 'I' ? '#2563eb' : '#64748b',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Izin (I)
                            </button>

                            {/* ALPA BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.nisn, 'A')}
                              style={{
                                padding: '6px 14px',
                                borderRadius: 10,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: currentStatus === 'A' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                                background: currentStatus === 'A' ? '#fef2f2' : '#ffffff',
                                color: currentStatus === 'A' ? '#dc2626' : '#64748b',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Alpa (A)
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

        {/* BOTTOM SAVE BAR */}
        {studentList.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
            <button
              className="btn-primary-admin"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '12px 28px', fontSize: 14 }}
            >
              <Save size={18} /> {saving ? 'Menyimpan Perubahan...' : 'Simpan Seluruh Absensi Kelas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
