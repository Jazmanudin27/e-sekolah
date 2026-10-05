import React, { useState, useEffect } from 'react';
import { User, CreditCard, Calendar, Award, AlertTriangle, LogOut, CheckCircle, Clock, ShieldCheck, Key } from 'lucide-react';
import api from '../api/client';
import Swal from 'sweetalert2';

export default function PortalOrtuSiswaView({ user, onLogout, onUserUpdated }) {
  const [activeSubTab, setActiveSubTab] = useState('keuangan');
  const [loading, setLoading] = useState(true);
  const [tagihanList, setTagihanList] = useState([]);
  const [transaksiList, setTransaksiList] = useState([]);
  const [presensiList, setPresensiList] = useState([]);
  const [pelanggaranList, setPelanggaranList] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchSiswaData();
  }, [user?.kode_siswa]);

  const fetchSiswaData = async () => {
    if (!user?.kode_siswa) return;
    setLoading(true);
    try {
      const [resTagihan, resTransaksi, resPresensi, resPelanggaran] = await Promise.allSettled([
        api.get(`/keuangan/tagihan/siswa/${user.kode_siswa}`),
        api.get(`/keuangan/transaksi?siswa_id=${user.kode_siswa}`),
        api.get(`/absensi-siswa?siswa_id=${user.kode_siswa}`),
        api.get(`/pelanggaran?siswa_id=${user.kode_siswa}`)
      ]);

      if (resTagihan.status === 'fulfilled' && resTagihan.value.data?.success) {
        setTagihanList(resTagihan.value.data.data || []);
      }
      if (resTransaksi.status === 'fulfilled' && resTransaksi.value.data?.success) {
        setTransaksiList(resTransaksi.value.data.data || []);
      }
      if (resPresensi.status === 'fulfilled' && resPresensi.value.data?.data) {
        const dataP = resPresensi.value.data.data;
        setPresensiList(Array.isArray(dataP) ? dataP : []);
      }
      if (resPelanggaran.status === 'fulfilled' && resPelanggaran.value.data?.data) {
        const dataPel = resPelanggaran.value.data.data;
        setPelanggaranList(Array.isArray(dataPel) ? dataPel : []);
      }
    } catch (err) {
      console.warn('Error loading student portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      Swal.fire('Perhatian', 'Password baru minimal 4 karakter.', 'warning');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await api.put('/auth/credentials', { password: newPassword });
      if (res.data?.success) {
        Swal.fire('Berhasil!', 'Password akun berhasil diperbarui.', 'success');
        setNewPassword('');
        if (res.data.data?.user && onUserUpdated) {
          onUserUpdated(res.data.data.user);
        }
      }
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal memperbarui password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const unpaidTagihan = tagihanList.filter(t => t.status !== 'Lunas');
  const paidTagihan = tagihanList.filter(t => t.status === 'Lunas');
  const totalTunggakan = unpaidTagihan.reduce((sum, t) => sum + (Number(t.nominal_tagihan) - Number(t.nominal_potongan || 0) - Number(t.total_dibayar || 0)), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', paddingBottom: 60 }}>
      {/* HEADER SECTION */}
      <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '24px 20px 30px', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 4px 20px rgba(2, 132, 199, 0.25)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, backdropFilter: 'blur(4px)', marginBottom: 8 }}>
              <ShieldCheck size={13} /> PORTAL KHUSUS ORANG TUA / SISWA
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{user?.nama_siswa || user?.name || 'Siswa'}</h1>
            <p style={{ fontSize: 13, opacity: 0.9, margin: '4px 0 0' }}>
              NIS / NISN: <strong>{user?.nis_nisn || '-'}</strong> &bull; Kelas: <strong>{user?.nama_kelas || '-'}</strong>
            </p>
          </div>
          <button
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>

        {/* SUMMARY CARD */}
        <div style={{ maxWidth: 900, margin: '20px auto 0', background: '#ffffff', color: '#0f172a', borderRadius: 16, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
          <div style={{ background: '#f0f9ff', padding: 12, borderRadius: 12, border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 700 }}>Total Tunggakan Tagihan</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: totalTunggakan > 0 ? '#dc2626' : '#16a34a', marginTop: 2 }}>
              Rp {totalTunggakan.toLocaleString('id-ID')}
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Orang Tua / Wali</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginTop: 2 }}>
              {user?.nama_ortu || 'Orang Tua Siswa'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>WA: {user?.no_wa_ortu || '-'}</div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ maxWidth: 900, margin: '20px auto 0', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          <button
            onClick={() => setActiveSubTab('keuangan')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: activeSubTab === 'keuangan' ? '#0284c7' : '#ffffff', color: activeSubTab === 'keuangan' ? '#ffffff' : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
          >
            <CreditCard size={15} /> Tagihan & Keuangan
          </button>
          <button
            onClick={() => setActiveSubTab('presensi')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: activeSubTab === 'presensi' ? '#0284c7' : '#ffffff', color: activeSubTab === 'presensi' ? '#ffffff' : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
          >
            <Calendar size={15} /> Presensi
          </button>
          <button
            onClick={() => setActiveSubTab('pelanggaran')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: activeSubTab === 'pelanggaran' ? '#0284c7' : '#ffffff', color: activeSubTab === 'pelanggaran' ? '#ffffff' : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
          >
            <AlertTriangle size={15} /> Catatan BK ({pelanggaranList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('akun')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: activeSubTab === 'akun' ? '#0284c7' : '#ffffff', color: activeSubTab === 'akun' ? '#ffffff' : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
          >
            <Key size={15} /> Akun & Password
          </button>
        </div>

        {/* TAB CONTENTS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem', marginBottom: 10 }}></div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Memuat data siswa...</p>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            {/* TAB 1: KEUANGAN */}
            {activeSubTab === 'keuangan' && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
                  📌 Daftar Tagihan Sekolah ({tagihanList.length})
                </h3>

                {tagihanList.length === 0 ? (
                  <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Belum ada data tagihan sekolah untuk siswa ini.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tagihanList.map((t, idx) => {
                      const totalNominal = Number(t.nominal_tagihan) - Number(t.nominal_potongan || 0);
                      const sisa = totalNominal - Number(t.total_dibayar || 0);
                      const isLunas = t.status === 'Lunas' || sisa <= 0;

                      return (
                        <div key={t.id || idx} style={{ background: '#ffffff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                              {t.nama_pos || t.nama_tarif || 'Tagihan Sekolah'} {t.bulan ? `(${t.bulan} ${t.tahun || ''})` : ''}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>
                              Nominal: Rp {Number(t.nominal_tagihan).toLocaleString('id-ID')}
                              {t.nominal_potongan > 0 && ` | Potongan: Rp ${Number(t.nominal_potongan).toLocaleString('id-ID')}`}
                              {t.total_dibayar > 0 && ` | Dibayar: Rp ${Number(t.total_dibayar).toLocaleString('id-ID')}`}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: isLunas ? '#dcfce7' : '#fee2e2', color: isLunas ? '#15803d' : '#b91c1c' }}>
                              {isLunas ? <CheckCircle size={12} /> : <Clock size={12} />}
                              {isLunas ? 'LUNAS' : `BELUM LUNAS (Sisa: Rp ${sisa.toLocaleString('id-ID')})`}
                            </span>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                              Pembayaran dilakukan secara tunai di Kasir TU Sekolah.
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* RIWAYAT TRANSAKSI */}
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginTop: 24, marginBottom: 12 }}>
                  🧾 Riwayat Transaksi Pembayaran ({transaksiList.length})
                </h3>
                {transaksiList.length === 0 ? (
                  <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Belum ada riwayat transaksi pembayaran.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {transaksiList.map((tr, idx) => (
                      <div key={tr.id || idx} style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                            No Trx: {tr.no_transaksi || `TRX-${tr.id}`}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            Tanggal: {tr.tanggal_bayar ? new Date(tr.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} &bull; Metode: {tr.metode_pembayaran || 'Tunai (Kasir TU)'}
                          </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>
                          Rp {Number(tr.total_bayar || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRESENSI */}
            {activeSubTab === 'presensi' && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
                  📅 Catatan Kehadiran Siswa
                </h3>
                {presensiList.length === 0 ? (
                  <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    Belum ada rekap presensi tercatat.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {presensiList.map((p, idx) => (
                      <div key={p.id || idx} style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                            {p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            Keterangan: {p.keterangan || '-'}
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                          background: p.status === 'Hadir' ? '#dcfce7' : p.status === 'Sakit' ? '#e0f2fe' : p.status === 'Izin' ? '#fef3c7' : '#fee2e2',
                          color: p.status === 'Hadir' ? '#15803d' : p.status === 'Sakit' ? '#0369a1' : p.status === 'Izin' ? '#b45309' : '#b91c1c'
                        }}>
                          {p.status || 'Hadir'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PELANGGARAN */}
            {activeSubTab === 'pelanggaran' && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
                  ⚠️ Catatan Pelanggaran & BK Siswa
                </h3>
                {pelanggaranList.length === 0 ? (
                  <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, textAlign: 'center', color: '#16a34a', border: '1px solid #bcf0da' }}>
                    🎉 Siswa tidak memiliki catatan pelanggaran / poin disiplin. Sangat baik!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pelanggaranList.map((pel, idx) => (
                      <div key={pel.id || idx} style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #fee2e2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>
                            {pel.nama_pelanggaran || pel.jenis_pelanggaran || 'Pelanggaran Disiplin'}
                          </div>
                          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
                            +{pel.poin || 0} Poin
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                          Keterangan: {pel.keterangan || '-'} &bull; Tanggal: {pel.tanggal || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: AKUN & PASSWORD */}
            {activeSubTab === 'akun' && (
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', maxWidth: 500 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 14 }}>
                  🔑 Pengaturan Password Akun
                </h3>
                <form onSubmit={handleUpdatePassword}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ketik password baru minimal 4 karakter"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                  >
                    {isUpdatingPassword ? 'Memperbarui...' : 'Simpan Password Baru'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
