import React, { useState, useEffect } from 'react';
import {
  Trophy, Plus, Search, Edit2, Trash2, RefreshCw, X, Users, UserPlus, CheckSquare
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

export default function AdminEkskulTab() {
  const [ekskulList, setEkskulList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal CRUD
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ nama_ekskul: '', pembina: '' });
  const [submitting, setSubmitting] = useState(false);

  // Modal Anggota
  const [showAnggotaModal, setShowAnggotaModal] = useState(false);
  const [selectedEkskul, setSelectedEkskul] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [semester, setSemester] = useState('1');
  const [selectedSiswaIds, setSelectedSiswaIds] = useState([]);
  const [savingAnggota, setSavingAnggota] = useState(false);
  const [anggotaCountMap, setAnggotaCountMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEkskul, resKelas] = await Promise.all([
        api.get('/ekskul'),
        api.get('/kelas')
      ]);
      const ekList = resEkskul.data?.data || [];
      setEkskulList(ekList);
      setKelasList(resKelas.data?.data || []);

      // Get anggota count per ekskul
      const countMap = {};
      await Promise.all(ekList.map(async (ek) => {
        try {
          const res = await api.get(`/ekskul/${ek.id}/anggota`);
          countMap[ek.id] = res.data?.data?.length || 0;
        } catch { countMap[ek.id] = 0; }
      }));
      setAnggotaCountMap(countMap);
    } catch (err) {
      console.error(err);
      setEkskulList([]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Handlers
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ nama_ekskul: '', pembina: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (ek) => {
    setIsEditing(true);
    setCurrentId(ek.id);
    setFormData({ nama_ekskul: ek.nama_ekskul || '', pembina: ek.pembina || '' });
    setShowModal(true);
  };

  const handleDelete = (ek) => {
    Swal.fire({
      title: 'Hapus Ekstrakurikuler?',
      text: `Hapus "${ek.nama_ekskul}" beserta seluruh data anggotanya?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/ekskul/${ek.id}`);
          Swal.fire('Terhapus!', 'Ekstrakurikuler berhasil dihapus.', 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_ekskul) {
      Swal.fire('Validasi', 'Nama ekskul wajib diisi!', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/ekskul/${currentId}`, formData);
        Swal.fire('Berhasil!', 'Ekstrakurikuler berhasil diperbarui.', 'success');
      } else {
        await api.post('/ekskul', formData);
        Swal.fire('Berhasil!', 'Ekstrakurikuler baru berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Anggota Handlers
  const handleOpenAnggota = async (ek) => {
    setSelectedEkskul(ek);
    setSelectedSiswaIds([]);
    setAnggotaList([]);

    // Default to first kelas
    if (kelasList.length > 0 && !selectedKelas) {
      const firstK = kelasList[0].kode_kelas;
      setSelectedKelas(firstK);
      await loadAnggotaData(ek.id, firstK, tahunAjaran, semester);
    } else if (selectedKelas) {
      await loadAnggotaData(ek.id, selectedKelas, tahunAjaran, semester);
    }

    setShowAnggotaModal(true);
  };

  const loadAnggotaData = async (ekskulId, kelasId, ta, sem) => {
    try {
      const [resSiswa, resAnggota] = await Promise.all([
        api.get('/siswa', { params: { kelas_id: kelasId } }),
        api.get(`/ekskul/${ekskulId}/anggota`, { params: { kelas_id: kelasId, tahun_ajaran: ta, semester: sem } })
      ]);
      const allSiswa = resSiswa.data?.data || [];
      const anggota = resAnggota.data?.data || [];
      setSiswaList(allSiswa);
      setAnggotaList(anggota);
      setSelectedSiswaIds(anggota.map(a => a.siswa_id));
    } catch {
      setSiswaList([]);
      setAnggotaList([]);
      setSelectedSiswaIds([]);
    }
  };

  useEffect(() => {
    if (showAnggotaModal && selectedEkskul && selectedKelas) {
      loadAnggotaData(selectedEkskul.id, selectedKelas, tahunAjaran, semester);
    }
  }, [selectedKelas, tahunAjaran, semester]);

  const toggleSiswa = (siswaId) => {
    setSelectedSiswaIds(prev =>
      prev.includes(siswaId) ? prev.filter(id => id !== siswaId) : [...prev, siswaId]
    );
  };

  const handleSelectAllSiswa = () => {
    if (selectedSiswaIds.length === siswaList.length) {
      setSelectedSiswaIds([]);
    } else {
      setSelectedSiswaIds(siswaList.map(s => s.kode_siswa || s.id));
    }
  };

  const handleSaveAnggota = async () => {
    if (!selectedEkskul || !selectedKelas) return;
    setSavingAnggota(true);
    try {
      const siswa_list = selectedSiswaIds.map(sid => {
        const existing = anggotaList.find(a => a.siswa_id === sid);
        return {
          siswa_id: sid,
          predikat: existing?.predikat || 'Baik',
          keterangan: existing?.keterangan || ''
        };
      });
      await api.put(`/ekskul/${selectedEkskul.id}/anggota`, {
        kelas_id: selectedKelas,
        tahun_ajaran: tahunAjaran,
        semester: semester,
        siswa_list
      });
      Swal.fire('Berhasil!', `Anggota ekskul "${selectedEkskul.nama_ekskul}" berhasil disimpan.`, 'success');
      setShowAnggotaModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menyimpan anggota.', 'error');
    } finally {
      setSavingAnggota(false);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [search]);

  const filteredList = ekskulList.filter(ek =>
    (ek.nama_ekskul || '').toLowerCase().includes(search.toLowerCase()) ||
    (ek.pembina || '').toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Trophy size={18} color="#f59e0b" /> Data Master Ekstrakurikuler
            </div>
            <div className="admin-panel-subtitle">
              Kelola daftar kegiatan ekstrakurikuler dan anggota pesertanya
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Ekskul Baru
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari nama ekskul atau pembina..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>
          <button className="btn-outline-admin" onClick={fetchData} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Nama Ekstrakurikuler</th>
                <th>Pembina</th>
                <th style={{ width: 140, textAlign: 'center' }}>Anggota</th>
                <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data ekskul...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Belum ada data ekstrakurikuler.
                  </td>
                </tr>
              ) : (
                paginatedList.map((ek, idx) => (
                  <tr key={ek.id}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 13 }}>
                        {ek.nama_ekskul}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{ek.pembina || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenAnggota(ek)}
                        title="Setting Anggota"
                        style={{
                          background: anggotaCountMap[ek.id] > 0 ? '#ecfdf5' : '#fef2f2',
                          color: anggotaCountMap[ek.id] > 0 ? '#059669' : '#dc2626',
                          border: anggotaCountMap[ek.id] > 0 ? '1px solid #a7f3d0' : '1px solid #fecaca',
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Users size={12} />
                        {anggotaCountMap[ek.id] > 0 ? `${anggotaCountMap[ek.id]} Siswa` : 'Belum diatur'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-action-icon btn-edit" title="Edit" onClick={() => handleOpenEdit(ek)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus" onClick={() => handleDelete(ek)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 480 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Ekstrakurikuler' : 'Tambah Ekskul Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group-admin" style={{ marginBottom: 14 }}>
                  <label>Nama Ekstrakurikuler *</label>
                  <input
                    type="text"
                    className="form-control-admin"
                    required
                    placeholder="Contoh: Pramuka, Futsal, PMR, Rohis..."
                    value={formData.nama_ekskul}
                    onChange={(e) => setFormData({ ...formData, nama_ekskul: e.target.value })}
                  />
                </div>
                <div className="form-group-admin">
                  <label>Nama Pembina (Opsional)</label>
                  <input
                    type="text"
                    className="form-control-admin"
                    placeholder="Contoh: Budi Santoso, S.Pd"
                    value={formData.pembina}
                    onChange={(e) => setFormData({ ...formData, pembina: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Ekskul'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANGGOTA MODAL */}
      {showAnggotaModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 640 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} color="#f59e0b" /> Anggota — {selectedEkskul?.nama_ekskul}
              </h3>
              <button onClick={() => setShowAnggotaModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div className="form-group-admin">
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>KELAS</label>
                  <select className="form-control-admin" style={{ fontSize: 12, padding: '6px 10px' }} value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
                    {kelasList.map(k => (
                      <option key={k.kode_kelas} value={k.kode_kelas}>{k.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-admin">
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>TAHUN AJARAN</label>
                  <select className="form-control-admin" style={{ fontSize: 12, padding: '6px 10px' }} value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)}>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                  </select>
                </div>
                <div className="form-group-admin">
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>SEMESTER</label>
                  <select className="form-control-admin" style={{ fontSize: 12, padding: '6px 10px' }} value={semester} onChange={e => setSemester(e.target.value)}>
                    <option value="1">1 (Ganjil)</option>
                    <option value="2">2 (Genap)</option>
                  </select>
                </div>
              </div>

              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                Centang siswa yang mengikuti <strong>{selectedEkskul?.nama_ekskul}</strong> di kelas ini:
              </p>

              {/* Select All */}
              <div
                onClick={handleSelectAllSiswa}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  background: '#fffbeb', padding: '10px 14px', borderRadius: 10, border: '1px solid #fde68a', marginBottom: 12
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selectedSiswaIds.length === siswaList.length && siswaList.length > 0 ? '#f59e0b' : '#ffffff',
                  border: selectedSiswaIds.length === siswaList.length && siswaList.length > 0 ? '2px solid #f59e0b' : '2px solid #cbd5e1',
                  transition: 'all 0.15s'
                }}>
                  {selectedSiswaIds.length === siswaList.length && siswaList.length > 0 && (
                    <CheckSquare size={14} color="#fff" />
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                  Pilih Semua ({siswaList.length} Siswa)
                </span>
                <span style={{ fontSize: 11, color: '#64748b', marginLeft: 'auto' }}>
                  {selectedSiswaIds.length} terpilih
                </span>
              </div>

              {/* Siswa List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {siswaList.map((s, idx) => {
                  const sid = s.kode_siswa || s.id;
                  const isChecked = selectedSiswaIds.includes(sid);
                  return (
                    <div
                      key={sid}
                      onClick={() => toggleSiswa(sid)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                        background: isChecked ? '#fefce8' : '#f8fafc',
                        padding: '10px 14px', borderRadius: 10,
                        border: isChecked ? '1px solid #fde68a' : '1px solid #e2e8f0',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: isChecked ? '#f59e0b' : '#ffffff',
                        border: isChecked ? '2px solid #f59e0b' : '2px solid #cbd5e1',
                        transition: 'all 0.15s'
                      }}>
                        {isChecked && <CheckSquare size={14} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                          {idx + 1}. {s.nama_siswa || s.nama}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>NIS: {s.nis || s.nis_nisn || '-'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {siswaList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 13 }}>
                  Tidak ada siswa di kelas ini.
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <div style={{ fontSize: 12, color: '#64748b', marginRight: 'auto' }}>
                <strong>{selectedSiswaIds.length}</strong> dari {siswaList.length} siswa dipilih
              </div>
              <button type="button" className="btn-outline-admin" onClick={() => setShowAnggotaModal(false)}>Batal</button>
              <button type="button" className="btn-primary-admin" onClick={handleSaveAnggota} disabled={savingAnggota}>
                {savingAnggota ? 'Menyimpan...' : 'Simpan Anggota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
