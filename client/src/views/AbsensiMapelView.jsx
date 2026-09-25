import React, { useState, useEffect } from 'react';
import { Save, BookOpen } from 'lucide-react';
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
      { id: 204, nis: '202404', nama: 'Dinda Lestari' }
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
        showToast(res.data.message, true);
      } else {
        showToast(res.data.message || 'Gagal menyimpan absensi mapel.', false);
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan.', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>Absensi Mata Pelajaran</h2>
        <p style={{ color: '#94a3b8', fontSize: 12 }}>Catat kehadiran siswa pada jam mengajar</p>
      </div>

      <div className="glass-card" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label>Pilih Mata Pelajaran</label>
          <select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)}>
            <option value="">-- Pilih Mapel --</option>
            {mapelList.map(m => (
              <option key={m.kode_mapel} value={m.kode_mapel}>{m.nama_mapel}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Pilih Kelas</label>
            <select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)}>
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map(k => (
                <option key={k.kode_kelas} value={k.kode_kelas}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tanggal</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
        </div>
      </div>

      {studentList.length > 0 ? (
        <div>
          {studentList.map(s => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', marginBottom: 10, background: 'rgba(22, 30, 46, 0.75)',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.nama}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>NIS: {s.nis}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['H', 'S', 'I', 'A'].map(st => {
                  const isActive = mapelStatus[s.id] === st;
                  let bg = 'rgba(255,255,255,0.05)';
                  let color = '#94a3b8';
                  if (isActive) {
                    if (st === 'H') { bg = '#059669'; color = '#fff'; }
                    if (st === 'S') { bg = '#0284c7'; color = '#fff'; }
                    if (st === 'I') { bg = '#d97706'; color = '#fff'; }
                    if (st === 'A') { bg = '#e11d48'; color = '#fff'; }
                  }
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateStatus(s.id, st)}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: bg, color, fontWeight: 700, fontSize: 12, cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={saving} style={{ marginTop: 16 }}>
            <Save size={16} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Absensi Mapel'}</span>
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <BookOpen size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>Pilih mata pelajaran, kelas, dan tanggal untuk mengisi absensi.</p>
        </div>
      )}
    </div>
  );
}
