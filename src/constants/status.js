/**
 * System Constants for E-Sekolah
 */
module.exports = {
  // Status Presensi Guru / Siswa
  STATUS_PRESENSI: {
    HADIR: 'H',
    SAKIT: 'S',
    IZIN: 'I',
    ALPHA: 'A'
  },
  
  // Status Kepegawaian Guru
  STATUS_GURU: {
    AKTIF: 'Aktif',
    NON_AKTIF: 'Non Aktif'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
};
