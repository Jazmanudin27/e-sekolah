import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, Edit2, Trash2, RefreshCw, X, Key, UserCheck, BookOpen, CheckSquare
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function AdminKelasTab() {
  const [kelasList, setKelasList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nama_kelas: '',
    jurusan: '',
    kode_guru: '',
    username: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Setting Mapel Modal State
  const [showMapelModal, setShowMapelModal] = useState(false);
  const [mapelModalKelas, setMapelModalKelas] = useState(null);
  const [allMapelList, setAllMapelList] = useState([]);
  const [selectedMapelIds, setSelectedMapelIds] = useState([]);
  const [savingMapel, setSavingMapel] = useState(false);
  const [mapelCountMap, setMapelCountMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resKelas, resGuru] = await Promise.all([
        api.get('/kelas'),
        api.get('/guru')
      ]);

      if (resGuru.data?.success && Array.isArray(resGuru.data.data)) {
        setGuruList(resGuru.data.data);
      }
      if (resKelas.data?.success && Array.isArray(resKelas.data.data)) {
        setKelasList(resKelas.data.data);
        // Fetch mapel count for each kelas
        const countMap = {};
        await Promise.all(resKelas.data.data.map(async (k) => {
          try {
            const res = await api.get(`/kelas/${k.kode_kelas}/mapel`);
            countMap[k.kode_kelas] = res.data?.data?.length || 0;
          } catch { countMap[k.kode_kelas] = 0; }
        }));
        setMapelCountMap(countMap);
      } else {
        setKelasList([]);
      }
    } catch (err) {
      console.error(err);
      setKelasList([]);
    } finally {
      setLoading(false);
    }
  };

  // Setting Mapel Handlers
  const handleOpenMapelSetting = async (kelas) => {
    setMapelModalKelas(kelas);
    try {
      const [resAllMapel, resKelasMapel] = await Promise.all([
        api.get('/mapel'),
        api.get(`/kelas/${kelas.kode_kelas}/mapel`)
      ]);
      const all = resAllMapel.data?.data || [];
      const assigned = resKelasMapel.data?.data || [];
      setAllMapelList(all);
      setSelectedMapelIds(assigned.map(m => m.mapel_id));
    } catch {
      setAllMapelList([]);
      setSelectedMapelIds([]);
    }
    setShowMapelModal(true);
  };

  const toggleMapelSelection = (mapelId) => {
    setSelectedMapelIds(prev =>
      prev.includes(mapelId)
        ? prev.filter(id => id !== mapelId)
        : [...prev, mapelId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMapelIds.length === allMapelList.length) {
      setSelectedMapelIds([]);
    } else {
      setSelectedMapelIds(allMapelList.map(m => m.kode_mapel));
    }
  };

  const handleSaveMapelSetting = async () => {
    if (!mapelModalKelas) return;
    setSavingMapel(true);
    try {
      await api.put(`/kelas/${mapelModalKelas.kode_kelas}/mapel`, { mapel_ids: selectedMapelIds });
      Swal.fire('Berhasil!', `Setting mapel untuk kelas "${mapelModalKelas.nama_kelas}" berhasil disimpan.`, 'success');
      setShowMapelModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menyimpan setting mapel.', 'error');
    } finally {
      setSavingMapel(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      nama_kelas: '',
      jurusan: '',
      kode_guru: '',
      username: '',
      password: 'password123'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (k) => {
    setIsEditing(true);
    setCurrentId(k.kode_kelas);
    setFormData({
      nama_kelas: k.nama_kelas || '',
      jurusan: k.jurusan || '',
      kode_guru: k.kode_guru || '',
      username: k.username || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = (k) => {
    Swal.fire({
      title: 'Hapus Data Kelas?',
      text: `Apakah Anda yakin ingin menghapus kelas "${k.nama_kelas}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/kelas/${k.kode_kelas}`);
          if (res.data?.success) {
            Swal.fire('Terhapus!', 'Data kelas berhasil dihapus.', 'success');
            fetchData();
          }
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus data kelas.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_kelas) {
      Swal.fire('Validasi Gagal', 'Nama kelas wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/kelas/${currentId}`, payload);
        Swal.fire('Berhasil!', 'Data kelas berhasil diperbarui.', 'success');
      } else {
        await api.post('/kelas', formData);
        Swal.fire('Berhasil!', 'Data kelas baru berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan data kelas.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredList = kelasList
    .filter(k => {
      return (k.nama_kelas || '').toLowerCase().includes(search.toLowerCase()) ||
             (k.jurusan || '').toLowerCase().includes(search.toLowerCase()) ||
             (k.wali_kelas || '').toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => (a.nama_kelas || '').localeCompare(b.nama_kelas || '', 'id', { numeric: true }));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Building2 size={18} color="#0284c7" /> Data Master Kelas & Akun Kelas
            </div>
            <div className="admin-panel-subtitle">
              Kelola daftar ruang kelas dan kredensial login akun kelas
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Kelas Baru
            </button>
          </div>
        </div>

        {/* SEARCH CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama kelas, jurusan, atau wali kelas..."
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

        {/* DATA TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Nama Kelas</th>
                <th>Jurusan / Peminatan</th>
                <th>Wali Kelas</th>
                <th>Username Akun</th>
                <th style={{ width: 140, textAlign: 'center' }}>Mapel</th>
                <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data kelas...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada data kelas yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedList.map((k, idx) => (
                  <tr key={k.kode_kelas || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#0066ff', fontSize: 13 }}>
                        {k.nama_kelas}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, textAlign: 'center' }}>{k.jurusan && k.jurusan !== '-' ? k.jurusan : ''}</td>
                    <td>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>
                        {k.wali_kelas && k.wali_kelas !== '-' && k.wali_kelas !== 'Belum diatur' ? k.wali_kelas : ''}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 12, color: '#0f172a', fontWeight: 700 }}>
                        {k.username || k.nama_kelas.toLowerCase().replace(/\s+/g, '')}
                      </code>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenMapelSetting(k)}
                        title="Setting Mapel"
                        style={{
                          background: mapelCountMap[k.kode_kelas] > 0 ? '#ecfdf5' : '#fef2f2',
                          color: mapelCountMap[k.kode_kelas] > 0 ? '#059669' : '#dc2626',
                          border: mapelCountMap[k.kode_kelas] > 0 ? '1px solid #a7f3d0' : '1px solid #fecaca',
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
                        <BookOpen size={12} />
                        {mapelCountMap[k.kode_kelas] > 0 ? `${mapelCountMap[k.kode_kelas]} Mapel` : 'Belum diatur'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn-action-icon btn-edit" title="Edit Kelas" onClick={() => handleOpenEdit(k)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn-action-icon btn-delete" title="Hapus Kelas" onClick={() => handleDelete(k)}>
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

        {/* PAGINATION */}
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
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Nama Kelas *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="Contoh: X RPL 1, XII TKJ 2"
                      value={formData.nama_kelas}
                      onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Jurusan / Peminatan</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="Contoh: Rekayasa Perangkat Lunak"
                      value={formData.jurusan}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Wali Kelas</label>
                    <SearchableSelect
                      placeholder="-- Pilih Wali Kelas (Opsional) --"
                      value={formData.kode_guru}
                      onChange={(e) => setFormData({ ...formData, kode_guru: e.target.value })}
                      isClearable
                      options={[
                        { value: '', label: '-- Pilih Wali Kelas (Opsional) --' },
                        ...guruList.map(g => ({
                          value: g.kode_guru,
                          label: `${g.nama_guru} (${g.nip_nuptk || 'Guru'})`
                        }))
                      ]}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Username Akun Kelas</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="username_kelas"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>{isEditing ? 'Password Baru (Kosongkan jika tetap)' : 'Password Akun'}</label>
                    <input
                      type="password"
                      className="form-control-admin"
                      placeholder={isEditing ? '••••••••' : 'Password default: 123456'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTING MAPEL PER KELAS MODAL */}
      {showMapelModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 640 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="#0284c7" /> Setting Mapel — {mapelModalKelas?.nama_kelas}
              </h3>
              <button
                onClick={() => setShowMapelModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                Pilih mata pelajaran yang <strong>aktif</strong> untuk kelas <strong>{mapelModalKelas?.nama_kelas}</strong>.
                Hanya mapel yang dicentang yang akan tampil di Rapor dan Penilaian.
              </p>

              {/* Select All Toggle */}
              <div
                onClick={handleSelectAll}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  background: '#f0f9ff', padding: '10px 14px', borderRadius: 10, border: '1px solid #bae6fd', marginBottom: 12
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selectedMapelIds.length === allMapelList.length && allMapelList.length > 0 ? '#0284c7' : '#ffffff',
                  border: selectedMapelIds.length === allMapelList.length && allMapelList.length > 0 ? '2px solid #0284c7' : '2px solid #cbd5e1',
                  transition: 'all 0.15s'
                }}>
                  {selectedMapelIds.length === allMapelList.length && allMapelList.length > 0 && (
                    <CheckSquare size={14} color="#fff" />
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0284c7' }}>
                  Pilih Semua ({allMapelList.length} Mapel)
                </span>
                <span style={{ fontSize: 11, color: '#64748b', marginLeft: 'auto' }}>
                  {selectedMapelIds.length} terpilih
                </span>
              </div>

              {/* Mapel Checkbox List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {allMapelList.map((m, idx) => {
                  const isChecked = selectedMapelIds.includes(m.kode_mapel);
                  return (
                    <div
                      key={m.kode_mapel}
                      onClick={() => toggleMapelSelection(m.kode_mapel)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                        background: isChecked ? '#f0fdf4' : '#f8fafc',
                        padding: '10px 14px', borderRadius: 10,
                        border: isChecked ? '1px solid #86efac' : '1px solid #e2e8f0',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: isChecked ? '#16a34a' : '#ffffff',
                        border: isChecked ? '2px solid #16a34a' : '2px solid #cbd5e1',
                        transition: 'all 0.15s'
                      }}>
                        {isChecked && <CheckSquare size={14} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                          {idx + 1}. {m.nama_mapel}
                        </div>
                        {m.kelompok && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>{m.kelompok} • KKM: {m.kkm || 75}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {allMapelList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 13 }}>
                  Belum ada data mata pelajaran. Tambahkan terlebih dahulu di menu Mapel.
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <div style={{ fontSize: 12, color: '#64748b', marginRight: 'auto' }}>
                <strong>{selectedMapelIds.length}</strong> dari {allMapelList.length} mapel dipilih
              </div>
              <button type="button" className="btn-outline-admin" onClick={() => setShowMapelModal(false)}>
                Batal
              </button>
              <button type="button" className="btn-primary-admin" onClick={handleSaveMapelSetting} disabled={savingMapel}>
                {savingMapel ? 'Menyimpan...' : 'Simpan Setting Mapel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
