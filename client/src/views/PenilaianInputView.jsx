import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Plus, Save, AlertCircle, Trash2, CheckCircle2, Edit3, HelpCircle, Lock
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/client';
import SubHeader from '../components/SubHeader';

const getLocalDateString = (dStr) => {
  if (!dStr) return '';
  const d = new Date(dStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PenilaianInputView({ onBack }) {
  const todayStr = getLocalDateString(new Date());

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
  const [savedKeys, setSavedKeys] = useState({});
  const [bobot, setBobot] = useState({ bobot_ph: 25, bobot_praktik: 25, bobot_uts: 25, bobot_uas: 25, kktp_kkm: 75 });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKomponen, setNewKomponen] = useState({
    kategori_id: '',
    nama_komponen: '',
    tanggal_penilaian: todayStr
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
          setNewKomponen(prev => ({ ...prev, kategori_id: firstKat.id || firstKat.kode_kategori || '', tanggal_penilaian: todayStr }));
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
        const rawStudents = res.data.data.students || [];
        const rawKomponen = res.data.data.komponen || [];
        const loadedNilaiMap = res.data.data.nilaiMap || {};

        setStudents(rawStudents);
        setKomponenList(rawKomponen);
        setNilaiMap(loadedNilaiMap);
        if (res.data.data.bobot) setBobot(res.data.data.bobot);

        // Mark existing saved scores in DB as locked (read-only)
        const keysMap = {};
        Object.keys(loadedNilaiMap).forEach(sId => {
          Object.keys(loadedNilaiMap[sId]).forEach(kId => {
            const val = loadedNilaiMap[sId][kId];
            if (val !== null && val !== undefined && val !== '') {
              keysMap[`${sId}_${kId}`] = true;
            }
          });
        });
        setSavedKeys(keysMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (siswaId, komponenId, val) => {
    const cellKey = `${siswaId}_${komponenId}`;
    if (savedKeys[cellKey]) return; // Read-only guard

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
        tanggal_penilaian: newKomponen.tanggal_penilaian || todayStr,
        tahun_ajaran: tahunAjaran,
        semester: semester
      });

      if (res.data.success) {
        Swal.fire({ title: 'Berhasil!', text: 'Komponen nilai baru ditambahkan', icon: 'success', timer: 1500, showConfirmButton: false });
        setShowAddModal(false);
        setNewKomponen(prev => ({ ...prev, nama_komponen: '', tanggal_penilaian: todayStr }));
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

  const activeKomponenList = komponenList.filter(k => {
    if (!k.tanggal_penilaian) return true;
    const kDate = getLocalDateString(k.tanggal_penilaian);
    return kDate >= todayStr;
  });

  const handleSaveAll = async () => {
    if (activeKomponenList.length === 0) {
      return Swal.fire('Info', 'Tidak ada komponen nilai aktif untuk disimpan', 'info');
    }
    setSaving(true);
    try {
      for (const k of activeKomponenList) {
        const nilai_list = students.map(s => ({
          siswa_id: s.id,
          nilai: (nilaiMap[s.id] && nilaiMap[s.id][k.id] !== undefined) ? nilaiMap[s.id][k.id] : 0
        }));

        await api.post('/penilaian/batch-save', {
          komponen_id: k.id,
          nilai_list
        });
      }

      // Lock all newly saved values
      const newSaved = { ...savedKeys };
      students.forEach(s => {
        activeKomponenList.forEach(k => {
          const val = nilaiMap[s.id]?.[k.id];
          if (val !== null && val !== undefined && val !== '') {
            newSaved[`${s.id}_${k.id}`] = true;
          }
        });
      });
      setSavedKeys(newSaved);

      Swal.fire({
        title: 'Berhasil Disimpan!',
        text: 'Nilai yang diisi telah disimpan dan dikunci (Read-Only)',
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

      {/* FULL WIDTH BUTTON: + TAMBAH KATEGORI */}
      <div style={{ maxWidth: 960, margin: '0 auto 16px auto', padding: '0 16px' }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.3)'
          }}
        >
          <Plus size={18} /> + Tambah Kategori
        </button>
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
          ) : activeKomponenList.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              <AlertCircle size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', margin: 0 }}>Tidak ada penilaian aktif untuk hari ini ({todayStr}).</p>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Komponen tanggal yang sudah lewat tidak ditampilkan di lembar input.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', color: '#475569', fontSize: 11, fontWeight: 800 }}>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: 45 }}>No</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', minWidth: 170 }}>Nama Siswa</th>
                    
                    {/* DYNAMIC KOMPONEN COLUMNS (ACTIVE TODAY) */}
                    {activeKomponenList.map((k) => (
                      <th key={k.id} style={{ padding: '10px 10px', textAlign: 'center', minWidth: 105, borderLeft: '1px solid #e2e8f0', background: k.kode_kategori === 'PH' ? '#eff6ff' : k.kode_kategori === 'PRAKTIK' ? '#f0fdf4' : k.kode_kategori === 'UTS' ? '#fffbeb' : '#fef2f2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <span>{k.nama_komponen}</span>
                          <button onClick={() => handleDeleteKomponen(k.id, k.nama_komponen)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }} title="Hapus Kolom">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginTop: 2 }}>
                          {k.nama_kategori} {k.tanggal_penilaian ? `• ${getLocalDateString(k.tanggal_penilaian)}` : ''}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, index) => {
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{index + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                          {s.nama}
                          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>NIS: {s.nis || '-'}</div>
                        </td>

                        {/* CELL INPUTS FOR EACH ACTIVE KOMPONEN */}
                        {activeKomponenList.map(k => {
                          const cellKey = `${s.id}_${k.id}`;
                          const isSaved = Boolean(savedKeys[cellKey]);
                          const val = (nilaiMap[s.id] && nilaiMap[s.id][k.id] !== undefined) ? nilaiMap[s.id][k.id] : '';
                          return (
                            <td key={k.id} style={{ padding: '6px 8px', textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={val}
                                  readOnly={isSaved}
                                  title={isSaved ? "Nilai sudah tersimpan (Read-Only)" : "Input Nilai Siswa"}
                                  onChange={e => !isSaved && handleCellChange(s.id, k.id, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '5px 4px',
                                    paddingRight: isSaved ? 16 : 4,
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    border: isSaved ? '1px solid #cbd5e1' : '1px solid #94a3b8',
                                    borderRadius: 8,
                                    outline: 'none',
                                    background: isSaved ? '#f1f5f9' : (val !== '' ? (parseFloat(val) >= (bobot.kktp_kkm || 75) ? '#f0fdf4' : '#fef2f2') : '#ffffff'),
                                    color: isSaved ? '#475569' : (val !== '' ? (parseFloat(val) >= (bobot.kktp_kkm || 75) ? '#166534' : '#991b1b') : '#0f172a'),
                                    cursor: isSaved ? 'not-allowed' : 'text'
                                  }}
                                />
                                {isSaved && (
                                  <Lock size={11} color="#64748b" style={{ position: 'absolute', right: 5, pointerEvents: 'none' }} />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FULL WIDTH BUTTON BELOW STUDENT DATA TABLE: SIMPAN SEMUA NILAI */}
      {students.length > 0 && (
        <div style={{ maxWidth: 960, margin: '16px auto 0 auto', padding: '0 16px' }}>
          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 20px',
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: saving || loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)',
              opacity: saving ? 0.7 : 1
            }}
          >
            <Save size={18} /> {saving ? 'Menyimpan Semua Nilai...' : 'Simpan Semua Nilai'}
          </button>
        </div>
      )}

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
