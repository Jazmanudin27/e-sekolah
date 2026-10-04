/**
 * WhatsApp Gateway Utility for E-Sekolah
 * Supports Fonnte, Wablas, and Generic HTTP REST API
 */

/**
 * Format phone number to international WhatsApp standard (e.g., 628xxxxxxxx)
 * @param {string} phone 
 * @returns {string|null}
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, '');
  if (!cleaned) return null;

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  } else if (!cleaned.startsWith('62') && cleaned.length >= 9) {
    cleaned = '62' + cleaned;
  }

  // Indonesian mobile numbers are typically 10 to 14 digits
  if (cleaned.length < 9 || cleaned.length > 16) {
    return null;
  }

  return cleaned;
}

/**
 * Generate Direct WhatsApp Click URL (wa.me)
 * @param {string} phone 
 * @param {string} message 
 * @returns {string}
 */
function getWhatsAppWebUrl(phone, message) {
  const formatted = formatPhoneNumber(phone) || phone;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message || '')}`;
}

/**
 * Send WhatsApp Message through configured Gateway Provider
 * @param {Object} options
 * @param {string} options.target - Phone number of parent/guardian
 * @param {string} options.message - Text message
 * @param {Object} options.config - School WA Gateway settings
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
async function sendWhatsAppMessage({ target, message, config }) {
  const cleanPhone = formatPhoneNumber(target);
  if (!cleanPhone) {
    return {
      success: false,
      message: `Nomor telepon tidak valid: "${target}"`
    };
  }

  if (!config || !config.wa_api_token) {
    return {
      success: false,
      message: 'API Token WhatsApp Gateway belum dikonfigurasi di Pengaturan Sekolah.'
    };
  }

  const provider = (config.wa_provider || 'fonnte').toLowerCase();
  const token = String(config.wa_api_token).trim();

  try {
    if (provider === 'fonnte') {
      const endpoint = config.wa_endpoint || 'https://api.fonnte.com/send';
      const formData = new URLSearchParams();
      formData.append('target', cleanPhone);
      formData.append('message', message);
      formData.append('countryCode', '62');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': token
        },
        body: formData
      });

      const resData = await response.json().catch(() => ({}));
      if (response.ok && (resData.status === true || resData.status === 'true' || resData.id)) {
        return {
          success: true,
          message: 'Pesan WhatsApp berhasil dikirim via Fonnte',
          data: resData
        };
      } else {
        return {
          success: false,
          message: resData.reason || resData.message || 'Gagal mengirim pesan via Fonnte',
          data: resData
        };
      }
    } else if (provider === 'wablas') {
      const endpoint = config.wa_endpoint || 'https://kudus.wablas.com/api/send-message';
      const payload = {
        phone: cleanPhone,
        message: message
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json().catch(() => ({}));
      if (response.ok && (resData.status === true || resData.status === 'success')) {
        return {
          success: true,
          message: 'Pesan WhatsApp berhasil dikirim via Wablas',
          data: resData
        };
      } else {
        return {
          success: false,
          message: resData.message || 'Gagal mengirim pesan via Wablas',
          data: resData
        };
      }
    } else {
      // Generic HTTP REST API Gateway
      const endpoint = config.wa_endpoint;
      if (!endpoint) {
        return {
          success: false,
          message: 'Endpoint URL untuk Generic WA Gateway belum diisi.'
        };
      }

      const payload = {
        phone: cleanPhone,
        target: cleanPhone,
        number: cleanPhone,
        message: message
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await response.json().catch(() => ({}));
      if (response.ok) {
        return {
          success: true,
          message: 'Pesan WhatsApp berhasil dikirim via Generic Gateway',
          data: resData
        };
      } else {
        return {
          success: false,
          message: resData.message || `Server gateway merespons status ${response.status}`,
          data: resData
        };
      }
    }
  } catch (error) {
    console.error('[WhatsAppUtil.sendWhatsAppMessage] Error:', error.message);
    return {
      success: false,
      message: `Koneksi ke gateway gagal: ${error.message}`
    };
  }
}

/**
 * Format Indonesian Date string (e.g., Senin, 04 Oktober 2026)
 * @param {string|Date} dateStr 
 * @returns {string}
 */
function formatIndoDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch (e) {
    return String(dateStr);
  }
}

/**
 * Generate Template Notifikasi Ketidakhadiran (Alpa / Sakit / Izin)
 */
function buildAbsensiWAMessage({
  nama_sekolah = 'E-SEKOLAH',
  nama_siswa,
  nis,
  nama_kelas,
  tanggal,
  status,
  catatan
}) {
  const formattedDate = formatIndoDate(tanggal);
  const statusUpper = String(status || '').toUpperCase();

  let statusLabel = 'TIDAK HADIR';
  let deskripsi = 'tidak hadir di sekolah tanpa keterangan (Alpa/Membolos).';

  if (statusUpper === 'A' || statusUpper === 'ALPHA' || statusUpper === 'ALPA') {
    statusLabel = 'ALPA (Tanpa Keterangan)';
    deskripsi = 'tidak hadir di sekolah tanpa memberikan surat keterangan atau pemberitahuan.';
  } else if (statusUpper === 'S' || statusUpper === 'SAKIT') {
    statusLabel = 'SAKIT';
    deskripsi = 'tercatat tidak dapat mengikuti kegiatan belajar mengajar karena sakit.';
  } else if (statusUpper === 'I' || statusUpper === 'IZIN') {
    statusLabel = 'IZIN';
    deskripsi = 'tercatat izin tidak mengikuti kegiatan belajar mengajar di sekolah.';
  }

  let text = `📢 *PEMBERITAHUAN KEHADIRAN SISWA*\n`;
  text += `*${nama_sekolah.toUpperCase()}*\n`;
  text += `----------------------------------------\n\n`;
  text += `Yth. Bapak/Ibu Orang Tua / Wali Siswa,\n\n`;
  text += `Melalui pesan ini, kami informasikan bahwa ananda:\n`;
  text += `👤 *Nama:* ${nama_siswa}\n`;
  if (nis) text += `🔢 *NIS/NISN:* ${nis}\n`;
  text += `🏫 *Kelas:* ${nama_kelas || '-'}\n`;
  text += `📅 *Hari/Tanggal:* ${formattedDate}\n`;
  text += `📋 *Status Kehadiran:* *${statusLabel}*\n\n`;
  text += `Keterangan: Pada hari ini, siswa yang bersangkutan ${deskripsi}\n`;

  if (catatan && catatan.trim()) {
    text += `📝 *Catatan Khusus:* ${catatan.trim()}\n`;
  }

  text += `\nMohon konfirmasi atau hubungi pihak sekolah / wali kelas jika terdapat kekeliruan atau keperluan lebih lanjut.\n\n`;
  text += `Terima kasih atas kerja sama dan perhatian Bapak/Ibu.\n\n`;
  text += `_Pesan resmi otomatis dari Sistem Presensi ${nama_sekolah}._`;

  return text;
}

/**
 * Generate Template Notifikasi Pelanggaran Tata Tertib Siswa
 */
function buildPelanggaranWAMessage({
  nama_sekolah = 'E-SEKOLAH',
  nama_siswa,
  nis,
  nama_kelas,
  tanggal,
  jam,
  jenis_pelanggaran,
  kategori = 'Ringan',
  poin = 5,
  tindakan_sanksi,
  catatan,
  pelapor
}) {
  const formattedDate = formatIndoDate(tanggal);
  const timeStr = jam ? ` Pukul ${jam}` : '';

  let text = `⚠️ *PEMBERITAHUAN PELANGGARAN TATA TERTIB SISWA*\n`;
  text += `*${nama_sekolah.toUpperCase()}*\n`;
  text += `----------------------------------------\n\n`;
  text += `Yth. Bapak/Ibu Orang Tua / Wali Murid,\n\n`;
  text += `Dengan ini kami memberitahukan bahwa ananda:\n`;
  text += `👤 *Nama Siswa:* ${nama_siswa}\n`;
  if (nis) text += `🔢 *NIS/NISN:* ${nis}\n`;
  text += `🏫 *Kelas:* ${nama_kelas || '-'}\n`;
  text += `📅 *Waktu Kejadian:* ${formattedDate}${timeStr}\n\n`;
  text += `Tercatat telah melakukan pelanggaran aturan/tata tertib sekolah sebagai berikut:\n`;
  text += `📌 *Pelanggaran:* ${jenis_pelanggaran}\n`;
  text += `⚖️ *Kategori / Bobot:* ${kategori} (+${poin} Poin Pelanggaran)\n`;

  if (tindakan_sanksi && tindakan_sanksi.trim()) {
    text += `🛠️ *Tindakan/Sanksi:* ${tindakan_sanksi.trim()}\n`;
  }
  if (catatan && catatan.trim()) {
    text += `📝 *Catatan:* ${catatan.trim()}\n`;
  }
  if (pelapor && pelapor.trim()) {
    text += `👮 *Petugas / Pelapor:* ${pelapor.trim()}\n`;
  }

  text += `\nKami memohon kerja sama Bapak/Ibu untuk turut memberikan nasihat, arahan, dan bimbingan di rumah demi perbaikan kedisiplinan dan karakter ananda.\n\n`;
  text += `Jika Bapak/Ibu memerlukan informasi lebih lanjut, silakan berkonsultasi dengan Guru BK atau Wali Kelas.\n\n`;
  text += `Terima kasih atas perhatian dan kerja samanya.\n\n`;
  text += `_Pesan resmi otomatis dari Sistem Bimbingan Konseling & Tata Tertib ${nama_sekolah}._`;

  return text;
}

module.exports = {
  formatPhoneNumber,
  getWhatsAppWebUrl,
  sendWhatsAppMessage,
  formatIndoDate,
  buildAbsensiWAMessage,
  buildPelanggaranWAMessage
};
