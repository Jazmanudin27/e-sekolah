import React, { useState, useEffect } from 'react';
import { Save, UserCheck, Loader2, Calendar, CheckCircle2, AlertCircle, RefreshCw, Users, Filter } from 'lucide-react';
import api from '../api/client';

export default function AbsensiSiswaView({ showToast }) {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [studentList, setStudentList] = useState([]);
  const [studentStatus, setStudentStatus] = useState({});
  const [isExistingData, setIsExistingData] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data.success && res.data.data.length > 0) {
        setKelasList(res.data.data);
        const firstKelas = res.data.data[0].kode_kelas;
        setSelectedKelas(firstKelas);
        loadStudentsAndAbsensi(firstKelas, tanggal);
      }
    } catch (err) {
      console.error('Error fetching kelas:', err);
    }
  };

  const loadStudentsAndAbsensi = async (kId, tgl) => {
    if (!kId) {
      setStudentList([]);
      return;
    }

    setLoadingStudents(true);
    try {
      const [siswaRes, absensiRes] = await Promise.all([
        api.get(`/siswa?kode_kelas=${kId}`),
        api.get(`/absensi-siswa?tanggal=${tgl}&kode_kelas=${kId}`)
      ]);

      let students = [];
      if (siswaRes.data.success && Array.isArray(siswaRes.data.data)) {
        students = siswaRes.data.data.map(s => ({
          id: s.kode_siswa,
          nis: s.nis_nisn || `NIS-${s.kode_siswa}`,
          nama: s.nama_siswa || `Siswa ID #${s.kode_siswa}`
        }));
      }

      setStudentList(students);

      const existingMap = {};
      let hasRecords = false;
      if (absensiRes.data.success && Array.isArray(absensiRes.data.data) && absensiRes.data.data.length > 0) {
        hasRecords = true;
        absensiRes.data.data.forEach(item => {
          existingMap[item.kode_siswa] = item.status;
        });
      }

      setIsExistingData(hasRecords);

      const initialStatus = {};
      students.forEach(s => {
        initialStatus[s.id] = existingMap[s.id] || 'H';
      });
      setStudentStatus(initialStatus);

    } catch (err) {
      console.error('Error loading absensi siswa:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleKelasChange = (e) => {
    const kId = e.target.value;
    setSelectedKelas(kId);
    if (kId) {
      loadStudentsAndAbsensi(kId, tanggal);
    } else {
      setStudentList([]);
    }
  };

  const handleTanggalChange = (e) => {
    const newTgl = e.target.value;
    setTanggal(newTgl);
    if (selectedKelas) {
      loadStudentsAndAbsensi(selectedKelas, newTgl);
    }
  };

  const updateStatus = (id, st) => {
    setStudentStatus(prev => ({ ...prev, [id]: st }));
  };

  const markAllPresent = () => {
    const newStatus = {};
    studentList.forEach(s => {
      newStatus[s.id] = 'H';
    });
    setStudentStatus(newStatus);
  };

  const handleSubmit = async () => {
    if (!selectedKelas) {
      showToast('Pilih kelas terlebih dahulu.', false);
      return;
    }
    if (studentList.length === 0) {
      showToast('Tidak ada data siswa untuk disimpan.', false);
      return;
    }

    setSaving(true);
    const list_absensi = Object.keys(studentStatus).map(id => ({
      kode_siswa: parseInt(id, 10),
      status: studentStatus[id]
    }));

    try {
      const res = await api.post('/absensi-siswa/batch', {
        tanggal,
        kode_kelas: selectedKelas,
        list_absensi
      });
      if (res.data.success) {
        showToast(res.data.message || 'Absensi siswa berhasil disimpan!', true);
        setIsExistingData(true);
      } else {
        showToast(res.data.message || 'Gagal menyimpan absensi.', false);
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan/server.', false);
    } finally {
      setSaving(false);
    }
  };

  const counts = { H: 0, S: 0, I: 0, A: 0 };
  Object.values(studentStatus).forEach(st => {
    if (counts[st] !== undefined) counts[st]++;
  });

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      return d.toLocaleDateString('id-ID', options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="inner-page-wrapper" style={{ paddingTop: 4 }}>
      {/* FILTER CONTROL CARD (SAMAIN SAMA HISTORI PRESENSI) */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.3px' }}>
          <Filter size={14} color="#0066ff" />
          FILTER ABSENSI SISWA
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>PILIH KELAS</label>
            <select
              value={selectedKelas}
              onChange={handleKelasChange}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                background: '#f8fafc',
                color: '#0f172a',
                outline: 'none'
              }}
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map(k => (
                <option key={k.kode_kelas} value={k.kode_kelas}>
                  {k.nama_kelas}{k.jurusan && k.jurusan.trim() !== '-' ? ` (${k.jurusan.trim()})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>TANGGAL</label>
            <input
              type="date"
              value={tanggal}
              onChange={handleTanggalChange}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                background: '#f8fafc',
                color: '#0f172a',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {loadingStudents ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#0066ff' }}>
          <Loader2 size={30} className="spin" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Memuat data absensi siswa...</p>
        </div>
      ) : studentList.length > 0 ? (
        <div>
          {/* DATE STATUS BADGE */}
          <div
            style={{
              padding: '9px 12px',
              borderRadius: 12,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isExistingData ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${isExistingData ? '#bbf7d0' : '#bfdbfe'}`,
              color: isExistingData ? '#166534' : '#1e40af'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700 }}>
              {isExistingData ? <CheckCircle2 size={15} color="#16a34a" /> : <AlertCircle size={15} color="#2563eb" />}
              <span>
                {isExistingData
                  ? `Absensi ${formatDateLabel(tanggal)} tersimpan (Dapat Di-edit)`
                  : `Belum ada absensi ${formatDateLabel(tanggal)} di DB`}
              </span>
            </div>
            <button
              onClick={() => loadStudentsAndAbsensi(selectedKelas, tanggal)}
              title="Refresh Data"
              style={{
                background: 'none',
                border: 'none',
                color: isExistingData ? '#15803d' : '#1d4ed8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* SUMMARY COUNTER BAR */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 6,
              marginBottom: 12,
              textAlign: 'center'
            }}
          >
            <div style={{ background: '#ffffff', padding: '7px 4px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>TOTAL</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{studentList.length}</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '7px 4px', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#16a34a' }}>HADIR</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>{counts.H}</div>
            </div>
            <div style={{ background: '#e0f2fe', padding: '7px 4px', borderRadius: 10, border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#0284c7' }}>SAKIT</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0369a1' }}>{counts.S}</div>
            </div>
            <div style={{ background: '#fef3c7', padding: '7px 4px', borderRadius: 10, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#d97706' }}>IZIN</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#b45309' }}>{counts.I}</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '7px 4px', borderRadius: 10, border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#dc2626' }}>ALPHA</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#b91c1c' }}>{counts.A}</div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Daftar Siswa ({studentList.length})</span>
            <button
              onClick={markAllPresent}
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                borderRadius: 8,
                padding: '4px 9px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Set Semua Hadir (H)
            </button>
          </div>

          {/* STUDENT LIST CARDS */}
          {studentList.map((s, idx) => (
            <div key={s.id} className="student-item-card" style={{ padding: '10px 12px', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.nama}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>NIS: {s.nis}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 5 }}>
                {['H', 'S', 'I', 'A'].map(st => {
                  const isActive = studentStatus[s.id] === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateStatus(s.id, st)}
                      className={`status-btn-pill ${isActive ? `act-${st}` : ''}`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* COMPACT & ELEGANT SAVE BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, marginBottom: 12 }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 18px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)',
                transition: 'all 0.15s ease',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>{isExistingData ? 'Simpan Perubahan' : 'Simpan Absensi'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <UserCheck size={48} style={{ opacity: 0.3, marginBottom: 10, margin: '0 auto' }} />
          <p style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>
            {selectedKelas ? 'Tidak ada data siswa pada kelas ini.' : 'Silakan pilih kelas & tanggal di atas.'}
          </p>
        </div>
      )}
    </div>
  );
}
