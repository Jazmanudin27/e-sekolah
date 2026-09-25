import React, { useState, useEffect } from 'react';
import { Save, UserCheck, Loader2 } from 'lucide-react';
import api from '../api/client';

export default function AbsensiSiswaView({ showToast }) {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [studentList, setStudentList] = useState([]);
  const [studentStatus, setStudentStatus] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data.success) {
        setKelasList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKelasChange = async (e) => {
    const kId = e.target.value;
    setSelectedKelas(kId);

    if (!kId) {
      setStudentList([]);
      return;
    }

    setLoadingStudents(true);
    try {
      const res = await api.get(`/siswa?kode_kelas=${kId}`);
      if (res.data.success && res.data.data.length > 0) {
        const dbStudents = res.data.data.map(s => ({
          id: s.kode_siswa,
          nis: s.nis_nisn || `NIS-${s.kode_siswa}`,
          nama: s.nama_siswa || `Siswa ID #${s.kode_siswa}`
        }));
        setStudentList(dbStudents);
        const initialStatus = {};
        dbStudents.forEach(s => initialStatus[s.id] = 'H');
        setStudentStatus(initialStatus);
      } else {
        const mock = [
          { id: 101, nis: '202401', nama: 'Ahmad Fauzi' },
          { id: 102, nis: '202402', nama: 'Budi Santoso' },
          { id: 103, nis: '202403', nama: 'Citra Dewi' },
          { id: 104, nis: '202404', nama: 'Dinda Lestari' }
        ];
        setStudentList(mock);
        const initialStatus = {};
        mock.forEach(s => initialStatus[s.id] = 'H');
        setStudentStatus(initialStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const updateStatus = (id, st) => {
    setStudentStatus(prev => ({ ...prev, [id]: st }));
  };

  const handleSubmit = async () => {
    if (!selectedKelas) return;
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
        showToast(res.data.message, true);
      } else {
        showToast(res.data.message || 'Gagal menyimpan absensi.', false);
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan.', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inner-page-wrapper">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Absensi Harian Siswa</h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>Input data kehadiran siswa per kelas</p>
      </div>

      <div className="white-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group-custom">
            <label>PILIH KELAS</label>
            <select value={selectedKelas} onChange={handleKelasChange}>
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map(k => (
                <option key={k.kode_kelas} value={k.kode_kelas}>
                  {k.nama_kelas} ({k.jurusan})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-custom">
            <label>TANGGAL</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
        </div>
      </div>

      {loadingStudents ? (
        <div style={{ textAlign: 'center', padding: 30, color: '#2563eb' }}>
          <Loader2 size={28} className="spin" />
          <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>Memuat daftar siswa...</p>
        </div>
      ) : studentList.length > 0 ? (
        <div>
          {studentList.map(s => (
            <div key={s.id} className="student-item-card">
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{s.nama}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>NIS: {s.nis}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
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

          <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={saving} style={{ marginTop: 16 }}>
            <Save size={18} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Absensi Siswa'}</span>
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <UserCheck size={52} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#64748b' }}>Silakan pilih kelas & tanggal di atas.</p>
        </div>
      )}
    </div>
  );
}
