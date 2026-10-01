import React, { useState } from 'react';
import { Printer, X, Edit2, Check, FileText } from 'lucide-react';

export default function RaporModal({ isOpen, onClose, siswa, kelasNama = 'X-1', mapelList = [], tahunAjaran = '2025/2026', semester = '1 (Ganjil)' }) {
  if (!isOpen || !siswa) return null;

  const [isEditing, setIsEditing] = useState(false);

  // Default / Editable Rapor State
  const [raporData, setRaporData] = useState({
    namaSekolah: 'SMAN 1 MERDEKA',
    alamatSekolah: 'Jl. Pendidikan No. 12',
    fase: 'E',
    tanggalCetak: '20 Desember 2025',
    kotaSekolah: 'Kota Sekolah',
    sakit: 2,
    izin: 1,
    alpa: 0,
    catatanWali: 'Tingkatkan terus konsistensi belajar, terutama pada mata pelajaran eksak.',
    namaWaliKelas: 'Nani Wijaya, S.Pd',
    nipWaliKelas: '19800101 200501 2 003',
    namaKepalaSekolah: 'Dr. H. Supriyadi, M.Pd',
    nipKepalaSekolah: '19700202 199503 1 002',
    ekstra: [
      { id: 1, nama: 'Pramuka', predikat: 'Baik', catatan: 'Aktif mengikuti seluruh kegiatan perkemahan.' },
      { id: 2, nama: 'PMR', predikat: 'Baik', catatan: 'Menunjukkan kepedulian tinggi dalam aksi medis.' }
    ]
  });

  const generateDeskripsi = (mapelNama, nilai) => {
    const score = parseFloat(nilai) || 75;
    if (score >= 88) {
      return `Menunjukkan penguasaan yang sangat baik dalam menganalisis dan memahami materi ${mapelNama}. Terus pertahankan prestasi!`;
    } else if (score >= 78) {
      return `Sangat baik dalam menguasai konsep dasar ${mapelNama}. Perlu sedikit peningkatan pada pemahaman lanjutan.`;
    } else if (score >= 68) {
      return `Menunjukkan penguasaan yang cukup baik pada materi ${mapelNama}. Perlu keaktifan lebih lanjut.`;
    }
    return `Perlu bimbingan lebih lanjut dan remedial pada beberapa bab dasar mata pelajaran ${mapelNama}.`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rapor-modal-overlay">
      <style>{`
        .rapor-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow-y: auto;
        }

        .rapor-modal-card {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .rapor-modal-header {
          padding: 14px 20px;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rapor-modal-body {
          padding: 24px 32px;
          overflow-y: auto;
          color: #0f172a;
          font-family: 'Times New Roman', Times, serif, sans-serif;
          font-size: 13px;
          line-height: 1.5;
        }

        /* RAPOR FORMAL DOCUMENT STYLES */
        .rapor-title-box {
          text-align: center;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 8px 0;
          margin-bottom: 20px;
        }

        .rapor-title {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 1px;
          margin: 0;
        }

        .rapor-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 30px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .rapor-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          margin-bottom: 20px;
          font-size: 12.5px;
        }

        .rapor-table th, .rapor-table td {
          border: 1px solid #000;
          padding: 6px 8px;
          vertical-align: top;
        }

        .rapor-table th {
          background: #f1f5f9;
          font-weight: 700;
          text-align: center;
        }

        .rapor-section-title {
          font-size: 14px;
          font-weight: 800;
          margin-top: 18px;
          margin-bottom: 6px;
        }

        .rapor-attendance-box {
          width: 280px;
          border: 1px solid #000;
          padding: 8px 12px;
          margin-bottom: 20px;
          font-size: 12.5px;
        }

        .rapor-notes-box {
          border: 1px solid #000;
          padding: 10px 14px;
          margin-bottom: 30px;
          font-style: italic;
        }

        .rapor-signatures {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          text-align: center;
          gap: 20px;
          font-size: 12.5px;
        }

        /* PRINT STYLES */
        @media print {
          body * {
            visibility: hidden;
          }
          .rapor-modal-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: none;
            padding: 0;
          }
          .rapor-modal-card {
            box-shadow: none;
            max-width: 100%;
            max-height: none;
            border-radius: 0;
          }
          .rapor-modal-header {
            display: none !important;
          }
          .rapor-modal-body, .rapor-modal-body * {
            visibility: visible;
          }
          .rapor-modal-body {
            padding: 0;
            margin: 0;
          }
          .rapor-table th {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="rapor-modal-card">
        {/* MODAL NAVBAR / CONTROLS */}
        <div className="rapor-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} color="#38bdf8" />
            <div>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>E-Rapor Digital Siswa</h4>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Format Resmi Kurikulum Merdeka</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: isEditing ? '#059669' : '#334155',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
              {isEditing ? 'Selesai Edit' : 'Edit Catatan/Presensi'}
            </button>
            <button
              onClick={handlePrint}
              style={{
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Cetak Rapor (PDF)
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* PRINTABLE RAPOR BODY */}
        <div className="rapor-modal-body">
          {/* HEADER TITLE BOX */}
          <div className="rapor-title-box">
            <h2 className="rapor-title">LAPORAN HASIL BELAJAR (RAPOR)</h2>
          </div>

          {/* STUDENT & SCHOOL IDENTITY HEADER */}
          <div className="rapor-meta-grid">
            <div>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ width: 140, fontWeight: 600 }}>Nama Peserta Didik</td>
                    <td style={{ width: 10 }}>:</td>
                    <td style={{ fontWeight: 700 }}>{siswa.nama || 'Ahmad Fauzi'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>NIS / NISN</td>
                    <td>:</td>
                    <td>{siswa.nis || '22231001'} / {siswa.nisn || '0071234567'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Nama Sekolah</td>
                    <td>:</td>
                    <td>
                      {isEditing ? (
                        <input type="text" value={raporData.namaSekolah} onChange={e => setRaporData({ ...raporData, namaSekolah: e.target.value })} />
                      ) : (
                        raporData.namaSekolah
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Alamat Sekolah</td>
                    <td>:</td>
                    <td>
                      {isEditing ? (
                        <input type="text" value={raporData.alamatSekolah} onChange={e => setRaporData({ ...raporData, alamatSekolah: e.target.value })} />
                      ) : (
                        raporData.alamatSekolah
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ width: 120, fontWeight: 600 }}>Kelas</td>
                    <td style={{ width: 10 }}>:</td>
                    <td style={{ fontWeight: 700 }}>{kelasNama}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Fase</td>
                    <td>:</td>
                    <td>{raporData.fase}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Semester</td>
                    <td>:</td>
                    <td>{semester}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Tahun Pelajaran</td>
                    <td>:</td>
                    <td>{tahunAjaran}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* A. NILAI DAN CAPAIAN PEMBELAJARAN */}
          <div className="rapor-section-title">A. NILAI DAN CAPAIAN PEMBELAJARAN</div>
          <table className="rapor-table">
            <thead>
              <tr>
                <th style={{ width: 35 }}>No</th>
                <th style={{ width: 220, textAlign: 'left' }}>Mata Pelajaran</th>
                <th style={{ width: 85 }}>Nilai Akhir</th>
                <th style={{ textAlign: 'left' }}>Capaian Kompetensi (Deskripsi)</th>
              </tr>
            </thead>
            <tbody>
              {mapelList && mapelList.length > 0 ? (
                mapelList.map((m, idx) => (
                  <tr key={m.id || idx}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{m.nama_mapel || m.nama || `Mata Pelajaran ${idx + 1}`}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 13 }}>{m.finalScore || m.nilai || 85}</td>
                    <td>{m.deskripsi || generateDeskripsi(m.nama_mapel || m.nama, m.finalScore || m.nilai || 85)}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td style={{ fontWeight: 600 }}>Pendidikan Agama dan Budi Pekerti</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>88</td>
                    <td>Menunjukkan penguasaan yang sangat baik dalam menganalisis hukum bacaan Al-Qur'an. Perlu peningkatan pada hafalan ayat pilihan.</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>2</td>
                    <td style={{ fontWeight: 600 }}>Pendidikan Pancasila</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>85</td>
                    <td>Sangat baik dalam menganalisis penerapan nilai-nilai Pancasila dalam kehidupan bermasyarakat.</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>3</td>
                    <td style={{ fontWeight: 600 }}>Bahasa Indonesia</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>90</td>
                    <td>Sangat baik dalam menyusun teks Laporan Hasil Observasi secara runtut dan objektif.</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>4</td>
                    <td style={{ fontWeight: 600 }}>Matematika</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>78</td>
                    <td>Menunjukkan penguasaan baik pada Sistem Persamaan Linear. Perlu bimbingan lebih lanjut pada materi Vektor.</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center' }}>5</td>
                    <td style={{ fontWeight: 600 }}>Bahasa Inggris</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>82</td>
                    <td>Baik dalam memahami teks deskriptif lisan dan tulisan serta komunikasi aktif sederhana.</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {/* B. EKSTRAKURIKULER */}
          <div className="rapor-section-title">B. EKSTRAKURIKULER</div>
          <table className="rapor-table">
            <thead>
              <tr>
                <th style={{ width: 35 }}>No</th>
                <th style={{ width: 220, textAlign: 'left' }}>Kegiatan Ekstrakurikuler</th>
                <th style={{ width: 85 }}>Predikat</th>
                <th style={{ textAlign: 'left' }}>Keterangan / Catatan</th>
              </tr>
            </thead>
            <tbody>
              {raporData.ekstra.map((ek, i) => (
                <tr key={ek.id}>
                  <td style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{ek.nama}</td>
                  <td style={{ textAlign: 'center' }}>{ek.predikat}</td>
                  <td>{ek.catatan}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* C. KETIDAKHADIRAN */}
          <div className="rapor-section-title">C. KETIDAKHADIRAN</div>
          <div className="rapor-attendance-box">
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: 140 }}>Sakit</td>
                  <td style={{ width: 10 }}>:</td>
                  <td>
                    {isEditing ? (
                      <input type="number" value={raporData.sakit} style={{ width: 50 }} onChange={e => setRaporData({ ...raporData, sakit: parseInt(e.target.value) || 0 })} />
                    ) : (
                      `${raporData.sakit} hari`
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Izin</td>
                  <td>:</td>
                  <td>
                    {isEditing ? (
                      <input type="number" value={raporData.izin} style={{ width: 50 }} onChange={e => setRaporData({ ...raporData, izin: parseInt(e.target.value) || 0 })} />
                    ) : (
                      `${raporData.izin} hari`
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Tanpa Keterangan</td>
                  <td>:</td>
                  <td>
                    {isEditing ? (
                      <input type="number" value={raporData.alpa} style={{ width: 50 }} onChange={e => setRaporData({ ...raporData, alpa: parseInt(e.target.value) || 0 })} />
                    ) : (
                      `${raporData.alpa} hari`
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CATATAN WALI KELAS */}
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Catatan Wali Kelas:</div>
          <div className="rapor-notes-box">
            {isEditing ? (
              <textarea
                style={{ width: '100%', height: 60 }}
                value={raporData.catatanWali}
                onChange={e => setRaporData({ ...raporData, catatanWali: e.target.value })}
              />
            ) : (
              `"${raporData.catatanWali}"`
            )}
          </div>

          {/* SIGNATURES BLOCK */}
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            {raporData.kotaSekolah}, {raporData.tanggalCetak}
          </div>

          <div className="rapor-signatures">
            <div>
              <div>Mengetahui,</div>
              <div style={{ marginBottom: 60 }}>Orang Tua / Wali Siswa,</div>
              <div style={{ fontWeight: 700 }}>( ___________________ )</div>
            </div>

            <div>
              <br />
              <div style={{ marginBottom: 60 }}>Wali Kelas,</div>
              <div style={{ fontWeight: 700 }}>
                {isEditing ? (
                  <input type="text" value={raporData.namaWaliKelas} onChange={e => setRaporData({ ...raporData, namaWaliKelas: e.target.value })} />
                ) : (
                  `( ${raporData.namaWaliKelas} )`
                )}
              </div>
              <div>NIP. {raporData.nipWaliKelas}</div>
            </div>

            <div>
              <br />
              <div style={{ marginBottom: 60 }}>Kepala Sekolah,</div>
              <div style={{ fontWeight: 700 }}>
                {isEditing ? (
                  <input type="text" value={raporData.namaKepalaSekolah} onChange={e => setRaporData({ ...raporData, namaKepalaSekolah: e.target.value })} />
                ) : (
                  `( ${raporData.namaKepalaSekolah} )`
                )}
              </div>
              <div>NIP. {raporData.nipKepalaSekolah}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
