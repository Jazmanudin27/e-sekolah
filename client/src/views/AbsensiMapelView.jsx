import React, { useState, useEffect } from 'react';
import { Save, BookOpen, UserCheck, Calendar, Loader2, CheckCircle2, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import api from '../api/client';

export default function AbsensiMapelView({ user, showToast }) {
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [studentList, setStudentList] = useState([]);
  const [mapelStatus, setMapelStatus] = useState({});
  const [isExistingData, setIsExistingData] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [resM, resK] = await Promise.all([
        api.get('/mapel'),
        api.get('/kelas')
      ]);

      let firstM = '';
      let firstK = '';

      if (resM.data.success && resM.data.data.length > 0) {
        setMapelList(resM.data.data);
        firstM = resM.data.data[0].kode_mapel;
        setSelectedMapel(firstM);
      }
      if (resK.data.success && resK.data.data.length > 0) {
        setKelasList(resK.data.data);
        firstK = resK.data.data[0].kode_kelas;
        setSelectedKelas(firstK);
      }

      if (firstM && firstK) {
        loadStudentsAndAbsensi(firstM, firstK, tanggal);
      }
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  const loadStudentsAndAbsensi = async (mId, kId, tgl) => {
    if (!mId || !kId) {
      setStudentList([]);
      return;
    }

    setLoadingStudents(true);
    try {
      const gId = user?.kode_guru || '';
      const [siswaRes, absensiRes] = await Promise.all([
        api.get(`/siswa?kode_kelas=${kId}`),
        api.get(`/absensi-mapel?tanggal=${tgl}&kode_kelas=${kId}&kode_mapel=${mId}${gId ? `&kode_guru=${gId}` : ''}`)
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

      const initial = {};
      students.forEach(s => {
        initial[s.id] = existingMap[s.id] || 'H';
      });
      setMapelStatus(initial);

    } catch (err) {
      console.error('Error loading absensi mapel:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleMapelChange = (e) => {
    const mId = e.target.value;
    setSelectedMapel(mId);
    if (mId && selectedKelas) {
      loadStudentsAndAbsensi(mId, selectedKelas, tanggal);
    }
  };

  const handleKelasChange = (e) => {
    const kId = e.target.value;
    setSelectedKelas(kId);
    if (selectedMapel && kId) {
      loadStudentsAndAbsensi(selectedMapel, kId, tanggal);
    } else {
      setStudentList([]);
    }
  };

  const handleTanggalChange = (e) => {
    const newTgl = e.target.value;
    setTanggal(newTgl);
    if (selectedMapel && selectedKelas) {
      loadStudentsAndAbsensi(selectedMapel, selectedKelas, newTgl);
    }
  };

  const updateStatus = (id, st) => {
    setMapelStatus(prev => ({ ...prev, [id]: st }));
  };

  const markAllPresent = () => {
    const newStatus = {};
    studentList.forEach(s => {
      newStatus[s.id] = 'H';
    });
    setMapelStatus(newStatus);
  };

  const handleSubmit = async () => {
    if (!selectedMapel || !selectedKelas) {
      showToast('Pilih mata pelajaran & kelas terlebih dahulu.', false);
      return;
    }
    if (studentList.length === 0) {
      showToast('Tidak ada data siswa untuk disimpan.', false);
      return;
    }

    setSaving(true);
    const list_absensi = Object.keys(mapelStatus).map(id => ({
      kode_siswa: parseInt(id, 10),
      status: mapelStatus[id]
    }));

    try {
      const res = await api.post('/absensi-mapel/batch', {
        tanggal,
        kode_kelas: selectedKelas,
        kode_guru: user?.kode_guru || 21,
        kode_mapel: selectedMapel,
        list_absensi
      });

      if (res.data.success) {
        showToast(res.data.message || 'Absensi mapel berhasil disimpan!', true);
        setIsExistingData(true);
      } else {
        showToast(res.data.message || 'Gagal menyimpan absensi mapel.', false);
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi server.', false);
    } finally {
      setSaving(false);
    }
  };

  const counts = { H: 0, S: 0, I: 0, A: 0 };
  Object.values(mapelStatus).forEach(st => {
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
          FILTER ABSENSI MATA PELAJARAN
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>MATA PELAJARAN</label>
            <select
              value={selectedMapel}
              onChange={handleMapelChange}
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
              <option value="">-- Pilih Mata Pelajaran --</option>
              {mapelList.map(m => (
                <option key={m.kode_mapel} value={m.kode_mapel}>{m.nama_mapel}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>KELAS</label>
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
      </div>

      {loadingStudents ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#0066ff' }}>
          <Loader2 size={30} className="spin" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Memuat data absensi mapel...</p>
        </div>
      ) : studentList.length > 0 ? (
        <div>
          {/* DATE & DB STATUS BADGE */}
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
                  ? `Absensi Mapel ${formatDateLabel(tanggal)} tersimpan (Dapat Di-edit)`
                  : `Belum ada absensi mapel ${formatDateLabel(tanggal)} di DB`}
              </span>
            </div>
            <button
              onClick={() => loadStudentsAndAbsensi(selectedMapel, selectedKelas, tanggal)}
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
                  const isActive = mapelStatus[s.id] === st;
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
                background: 'linear-gradient(135deg, #0072ff 0%, #0052cc 100%)',
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
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: 10, margin: '0 auto' }} />
          <p style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>
            {!selectedMapel || !selectedKelas
              ? 'Silakan pilih mata pelajaran & kelas di atas.'
              : 'Tidak ada data siswa pada kelas ini.'}
          </p>
        </div>
      )}
    </div>
  );
}
