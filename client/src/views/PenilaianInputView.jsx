import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Plus, Save, AlertCircle, Trash2, CheckCircle2, Edit3, HelpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/client';
import SubHeader from '../components/SubHeader';

export default function PenilaianInputView({ onBack }) {
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);

  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [semester, setSemester] = useState('1');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Spreadsheet Matrix Data
  const [students, setStudents] = useState([]);
  const [komponenList, setKomponenList] = useState([]);
  const [nilaiMap, setNilaiMap] = useState({});
  const [bobot, setBobot] = useState({ bobot_ph: 25, bobot_praktik: 25, bobot_uts: 25, bobot_uas: 25, kktp_kkm: 75 });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKomponen, setNewKomponen] = useState({
    kategori_id: '',
    nama_komponen: '',
    tanggal_penilaian: ''
  });

  useEffect(() => {
    fetchInitialOptions();
  }, []);

  useEffect(() => {
    if (selectedKelas && selectedMapel) {
      fetchMatrixData();
    }
  }, [selectedKelas, selectedMapel, tahunAjaran, semester]);

  const fetchInitialOptions = async () => {
    try {
      const [resKelas, resMapel, resKat] = await Promise.all([
        api.get('/kelas'),
        api.get('/mapel'),
        api.get('/penilaian/kategori')
      ]);

      if (resKelas.data.success && Array.isArray(resKelas.data.data)) {
        setKelasList(resKelas.data.data);
        if (resKelas.data.data.length > 0) {
          const firstK = resKelas.data.data[0];
          setSelectedKelas(firstK.kode_kelas || firstK.id || '');
        }
      }
      if (resMapel.data.success && Array.isArray(resMapel.data.data)) {
        setMapelList(resMapel.data.data);
        if (resMapel.data.data.length > 0) {
          const firstM = resMapel.data.data[0];
          setSelectedMapel(firstM.kode_mapel || firstM.id || '');
        }
      }
      if (resKat.data.success && Array.isArray(resKat.data.data)) {
        setKategoriList(resKat.data.data);
        if (resKat.data.data.length > 0) {
          const firstKat = resKat.data.data[0];
          setNewKomponen(prev => ({ ...prev, kategori_id: firstKat.id || firstKat.kode_kategori || '' }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatrixData = async () => {
    if (!selectedKelas || !selectedMapel) return;
    setLoading(true);
    try {
      const res = await api.get(`/penilaian/matrix?kelas_id=${selectedKelas}&mapel_id=${selectedMapel}&tahun_ajaran=${tahunAjaran}&semester=${semester}`);
      if (res.data.success) {
        setStudents(res.data.data.students || []);
        setKomponenList(res.data.data.komponen || []);
        setNilaiMap(res.data.data.nilaiMap || {});
        if (res.data.data.bobot) setBobot(res.data.data.bobot);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (siswaId, komponenId, val) => {
    const numericVal = val === '' ? '' : Math.min(100, Math.max(0, parseFloat(val) || 0));
    setNilaiMap(prev => ({
      ...prev,
      [siswaId]: {
        ...(prev[siswaId] || {}),
        [komponenId]: numericVal
      }
    }));
  };

  const handleCreateKomponen = async (e) => {
    e.preventDefault();
    if (!newKomponen.nama_komponen.trim()) {
      return Swal.fire('Peringatan', 'Harap isi nama komponen penilaian', 'warning');
    }
    try {
      const res = await api.post('/penilaian/komponen', {
        mapel_id: selectedMapel,
        kelas_id: selectedKelas,
        kategori_id: newKomponen.kategori_id,
        nama_komponen: newKomponen.nama_komponen,
        tanggal_penilaian: newKomponen.tanggal_penilaian || null,
        tahun_ajaran: tahunAjaran,
        semester: semester
      });

      if (res.data.success) {
        Swal.fire({ title: 'Berhasil!', text: 'Komponen nilai baru ditambahkan', icon: 'success', timer: 1500, showConfirmButton: false });
        setShowAddModal(false);
        setNewKomponen(prev => ({ ...prev, nama_komponen: '', tanggal_penilaian: '' }));
        fetchMatrixData();
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal menambahkan komponen nilai', 'error');
    }
  };

  const handleDeleteKomponen = async (komponenId, nama) => {
    const result = await Swal.fire({
      title: 'Hapus Komponen Nilai?',
      text: `Penilaian "${nama}" dan seluruh angka nilainya akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/penilaian/komponen/${komponenId}`);
        fetchMatrixData();
        Swal.fire({ title: 'Terhapus', text: 'Komponen nilai telah dihapus', icon: 'success', timer: 1200, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus komponen nilai', 'error');
      }
    }
  };

  const handleSaveAll = async () => {
    if (komponenList.length === 0) {
      return Swal.fire('Info', 'Belum ada komponen nilai yang ditambahkan', 'info');
    }
    setSaving(true);
    try {
      for (const k of komponenList) {
        const nilai_list = students.map(s => ({
          siswa_id: s.id,
          nilai: (nilaiMap[s.id] && nilaiMap[s.id][k.id] !== undefined) ? nilaiMap[s.id][k.id] : 0
        }));

        await api.post('/penilaian/batch-save', {
          komponen_id: k.id,
          nilai_list
        });
      }

      Swal.fire({
        title: 'Berhasil Disimpan!',
        text: 'Seluruh nilai siswa berhasil diperbarui ke database',
        icon: 'success',
        confirmButtonColor: '#0066ff'
      });
      fetchMatrixData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal menyimpan nilai', 'error');
    } finally {
      setSaving(false);
    }
  };

  const calculateStudentFinal = (siswaId) => {
    const sNilai = nilaiMap[siswaId] || {};
    
    const phVals = [];
    const praktikVals = [];
    let utsVal = null;
    let uasVal = null;

    for (const k of komponenList) {
      const val = parseFloat(sNilai[k.id]);
      if (isNaN(val)) continue;

      const katCode = (k.kode_kategori || '').toUpperCase();
      if (katCode === 'PH' || katCode === 'TUGAS' || k.kelompok === 'FORMATIF') {
        phVals.push(val);
      } else if (katCode === 'PRAKTIK' || katCode === 'P5' || k.kelompok === 'KETERAMPILAN' || k.kelompok === 'PROYEK') {
        praktikVals.push(val);
      } else if (katCode === 'UTS') {
        utsVal = val;
      } else if (katCode === 'UAS') {
        uasVal = val;
      } else {
        phVals.push(val);
      }
    }

    const avgPH = phVals.length > 0 ? (phVals.reduce((a, b) => a + b, 0) / phVals.length) : 0;
    const avgPraktik = praktikVals.length > 0 ? (praktikVals.reduce((a, b) => a + b, 0) / praktikVals.length) : 0;
    const scoreUTS = utsVal !== null ? utsVal : 0;
    const scoreUAS = uasVal !== null ? uasVal : 0;

    const bPH = bobot.bobot_ph || 25;
    const bPraktik = bobot.bobot_praktik || 25;
    const bUTS = bobot.bobot_uts || 25;
    const bUAS = bobot.bobot_uas || 25;
    const totalBobot = bPH + bPraktik + bUTS + bUAS || 100;

    const finalScore = ((avgPH * bPH) + (avgPraktik * bPraktik) + (scoreUTS * bUTS) + (scoreUAS * bUAS)) / totalBobot;
    
    let predikat = 'D';
    if (finalScore >= 88) predikat = 'A';
    else if (finalScore >= 78) predikat = 'B';
    else if (finalScore >= 68) predikat = 'C';

    return {
      finalScore: finalScore.toFixed(1),
      predikat,
      isPass: finalScore >= (bobot.kktp_kkm || 75)
    };
  };

  return (
    <div className="penilaian-view-container" style={{ paddingBottom: 40 }}>
      <SubHeader title="✏️ Halaman Input Penilaian" subtitle="Lembar pengisian angka nilai siswa per kelas dan mata pelajaran" onBack={onBack} />

      {/* FILTER & SELECTOR BAR */}
      <div style={{ maxWidth: 960, margin: '16px auto', padding: '0 16px' }}>
        <div style={{ background: '#ffffff', borderRadius: 20, padding: '16px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>KELAS</label>
            <select
              className="form-control-admin"
              style={{ cursor: 'pointer', opacity: 1, pointerEvents: 'auto' }}
              value={selectedKelas}
              onChange={e => setSelectedKelas(e.target.value)}
            >
              {kelasList.map(k => {
                const kVal = k.kode_kelas || k.id;
                return (
                  <option key={kVal} value={kVal}>
                    {k.nama_kelas || k.nama || kVal}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>MATA PELAJARAN</label>
            <select
              className="form-control-admin"
              style={{ cursor: 'pointer', opacity: 1, pointerEvents: 'auto' }}
              value={selectedMapel}
              onChange={e => setSelectedMapel(e.target.value)}
            >
              {mapelList.map(m => {
                const mVal = m.kode_mapel || m.id;
                return (
                  <option key={mVal} value={mVal}>
                    {m.nama_mapel || m.nama || mVal}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>TAHUN AJARAN</label>
            <select className="form-control-admin" value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)}>
              <option value="2026/2027">2026/2027</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>SEMESTER</label>
            <select className="form-control-admin" value={semester} onChange={e => setSemester(e.target.value)}>
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTION TOOLBAR */}
      <div style={{ maxWidth: 960, margin: '0 auto 16px auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)' }}
        >
          <Plus size={16} /> Tambah Ujian/Tugas Baru
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 12, fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}
          >
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
          </button>
        </div>
      </div>

      {/* SPREADSHEET MATRIX TABLE */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 6px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Memuat data lembar penilaian...</p>
            </div>
          ) : students.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
              <AlertCircle size={36} color="#cbd5e1" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, fontWeight: 600 }}>Tidak ada data siswa ditemukan di kelas ini.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', color: '#475569', fontSize: 11, fontWeight: 800 }}>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: 45 }}>No</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', minWidth: 170 }}>Nama Siswa</th>
                    
                    {/* DYNAMIC KOMPONEN COLUMNS */}
                    {komponenList.map((k) => (
                      <th key={k.id} style={{ padding: '10px 10px', textAlign: 'center', minWidth: 95, borderLeft: '1px solid #e2e8f0', background: k.kode_kategori === 'PH' ? '#eff6ff' : k.kode_kategori === 'PRAKTIK' ? '#f0fdf4' : k.kode_kategori === 'UTS' ? '#fffbeb' : '#fef2f2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <span>{k.nama_komponen}</span>
                          <button onClick={() => handleDeleteKomponen(k.id, k.nama_komponen)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }} title="Hapus Kolom">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginTop: 2 }}>{k.nama_kategori}</div>
                      </th>
                    ))}

                    {/* REKAP CALCULATED COLUMNS */}
                    <th style={{ padding: '12px 10px', textAlign: 'center', minWidth: 80, borderLeft: '2px solid #cbd5e1', background: '#f1f5f9' }}>Nilai Akhir</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center', minWidth: 70, background: '#f1f5f9' }}>Predikat</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center', minWidth: 80, background: '#f1f5f9' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, index) => {
                    const stats = calculateStudentFinal(s.id);
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{index + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                          {s.nama}
                          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>NIS: {s.nis || '-'}</div>
                        </td>

                        {/* CELL INPUTS FOR EACH KOMPONEN */}
                        {komponenList.map(k => {
                          const val = (nilaiMap[s.id] && nilaiMap[s.id][k.id] !== undefined) ? nilaiMap[s.id][k.id] : '';
                          return (
                            <td key={k.id} style={{ padding: '6px 8px', textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={val}
                                onChange={e => handleCellChange(s.id, k.id, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '5px 4px',
                                  textAlign: 'center',
                                  fontWeight: 700,
                                  fontSize: 12,
                                  border: '1px solid #cbd5e1',
                                  borderRadius: 8,
                                  outline: 'none',
                                  background: val !== '' ? (parseFloat(val) >= (bobot.kktp_kkm || 75) ? '#f0fdf4' : '#fef2f2') : '#ffffff',
                                  color: val !== '' ? (parseFloat(val) >= (bobot.kktp_kkm || 75) ? '#166534' : '#991b1b') : '#0f172a'
                                }}
                              />
                            </td>
                          );
                        })}

                        {/* REKAP CALCULATED VALUES */}
                        <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, fontSize: 13, borderLeft: '2px solid #cbd5e1', color: stats.isPass ? '#059669' : '#dc2626' }}>
                          {stats.finalScore}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: stats.predikat === 'A' ? '#dcfce7' : stats.predikat === 'B' ? '#e0f2fe' : '#fef3c7', color: stats.predikat === 'A' ? '#15803d' : stats.predikat === 'B' ? '#0369a1' : '#b45309' }}>
                            {stats.predikat}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 12, background: stats.isPass ? '#ecfdf5' : '#fef2f2', color: stats.isPass ? '#047857' : '#b91c1c', border: `1px solid ${stats.isPass ? '#a7f3d0' : '#fecaca'}` }}>
                            {stats.isPass ? 'TUNTAS' : 'REMEDIAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH KOMPONEN UJIAN / TUGAS BARU */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>+ Tambah Komponen Nilai Baru</h3>
            <p style={{ fontSize: 11.5, color: '#64748b', marginBottom: 16 }}>Buat kolom penilaian baru (misal: PH 1, Praktik 2, UTS, Tugas 1)</p>

            <form onSubmit={handleCreateKomponen}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Kategori Penilaian</label>
                <select
                  className="form-control-admin"
                  style={{ cursor: 'pointer', opacity: 1, pointerEvents: 'auto' }}
                  value={newKomponen.kategori_id}
                  onChange={e => setNewKomponen({ ...newKomponen, kategori_id: e.target.value })}
                >
                  {kategoriList.map(k => {
                    const katVal = k.id || k.kode_kategori;
                    return (
                      <option key={katVal} value={katVal}>
                        {k.nama_kategori} ({k.kelompok})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Judul / Nama Komponen</label>
                <input
                  type="text"
                  className="form-control-admin"
                  placeholder="e.g., PH 1: Algoritma / Praktik Lab 2"
                  value={newKomponen.nama_komponen}
                  onChange={e => setNewKomponen({ ...newKomponen, nama_komponen: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Tanggal Penilaian (Opsional)</label>
                <input
                  type="date"
                  className="form-control-admin"
                  value={newKomponen.tanggal_penilaian}
                  onChange={e => setNewKomponen({ ...newKomponen, tanggal_penilaian: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
