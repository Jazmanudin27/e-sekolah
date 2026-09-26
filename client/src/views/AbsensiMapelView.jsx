import React, { useState, useEffect } from 'react';
import { Save, BookOpen, UserCheck, Calendar } from 'lucide-react';
import api from '../api/client';

export default function AbsensiMapelView({ user, showToast }) {
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [studentList, setStudentList] = useState([]);
  const [mapelStatus, setMapelStatus] = useState({});
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
      if (resM.data.success) setMapelList(resM.data.data);
      if (resK.data.success) setKelasList(resK.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudents = () => {
    if (!selectedMapel || !selectedKelas) {
      setStudentList([]);
      return;
    }

    const sample = [
      { id: 201, nis: '202401', nama: 'Ahmad Fauzi' },
      { id: 202, nis: '202402', nama: 'Budi Santoso' },
      { id: 203, nis: '202403', nama: 'Citra Dewi' },
      { id: 204, nis: '202404', nama: 'Dinda Lestari' },
      { id: 205, nis: '202405', nama: 'Eko Prasetyo' }
    ];

    setStudentList(sample);
    const initial = {};
    sample.forEach(s => initial[s.id] = 'H');
    setMapelStatus(initial);
  };

  useEffect(() => {
    loadStudents();
  }, [selectedMapel, selectedKelas]);

  const updateStatus = (id, st) => {
    setMapelStatus(prev => ({ ...prev, [id]: st }));
  };

  const handleSubmit = async () => {
    if (!selectedMapel || !selectedKelas) return;
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
      } else {
        showToast(res.data.message || 'Gagal menyimpan absensi mapel.', false);
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi.', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inner-page-wrapper">
      <div className="white-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group-custom">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} color="#0066ff" /> PILIH MATA PELAJARAN
            </label>
            <select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)}>
              <option value="">-- Pilih Mata Pelajaran --</option>
              {mapelList.map(m => (
                <option key={m.kode_mapel} value={m.kode_mapel}>{m.nama_mapel}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group-custom">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserCheck size={14} color="#0066ff" /> PILIH KELAS
              </label>
              <select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)}>
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k => (
                  <option key={k.kode_kelas} value={k.kode_kelas}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>

            <div className="form-group-custom">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color="#0066ff" /> TANGGAL
              </label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {studentList.length > 0 ? (
        <div>
          {studentList.map(s => (
            <div key={s.id} className="student-item-card">
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{s.nama}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>NIS: {s.nis}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
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

          <button
            className="btn btn-primary btn-block"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              marginTop: 16,
              background: 'linear-gradient(135deg, #0072ff, #0052cc)',
              height: 48,
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 14
            }}
          >
            <Save size={18} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Absensi Mapel'}</span>
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
          <BookOpen size={54} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: '#64748b' }}>Silakan pilih mata pelajaran & kelas di atas.</p>
        </div>
      )}
    </div>
  );
}
