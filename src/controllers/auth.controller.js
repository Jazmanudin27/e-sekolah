const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const GuruModel = require('../models/guru.model');
const KelasModel = require('../models/kelas.model');
const { sendSuccess, sendError } = require('../utils/response.util');
const { JWT_SECRET } = require('../middleware/auth.middleware');

// Multi-Table Login: Checks `guru` table AND `kelas` table
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Username / NIP / Email dan Password wajib diisi.', 400);
    }

    let user = null;
    let userType = null; // 'Guru' or 'Kelas'

    // 1. Check in `guru` table first
    const teacher = await GuruModel.findByUsernameOrEmail(username);
    if (teacher) {
      user = teacher;
      userType = 'Guru';
    } else {
      // 2. Check in `kelas` table second
      const kelasAccount = await KelasModel.findByUsername(username);
      if (kelasAccount) {
        user = kelasAccount;
        userType = 'Kelas';
      }
    }

    if (!user) {
      return sendError(res, 'Username atau Password salah.', 401);
    }

    // Verify Password (supports Laravel $2y$, $2a$ bcrypt, and plain text string comparison)
    let isMatch = false;
    const dbPassword = user.password || '';

    if (dbPassword) {
      if (dbPassword.startsWith('$2y$') || dbPassword.startsWith('$2a$')) {
        const hash = dbPassword.startsWith('$2y$')
          ? '$2a$' + dbPassword.substring(4)
          : dbPassword;
        try {
          isMatch = await bcrypt.compare(password, hash);
        } catch (e) {
          console.warn('[Bcrypt Compare Error]', e.message);
        }
      }
      
      // Fallback exact match comparison (for plain text passwords)
      if (!isMatch && (dbPassword === password || String(dbPassword).trim() === String(password).trim())) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return sendError(res, 'Username atau Password salah.', 401);
    }

    // Construct Payload & User Object based on user type
    let payload = {};
    let userData = {};

    if (userType === 'Guru') {
      const userRole = user.role || 'Guru';
      payload = {
        type: 'Guru',
        kode_guru: user.kode_guru,
        nama_guru: user.nama_guru,
        username: user.username,
        email: user.email,
        role: userRole,
        kode_member: user.kode_member
      };
      userData = {
        type: 'Guru',
        kode_guru: user.kode_guru,
        nip_nuptk: user.nip_nuptk,
        nama_guru: user.nama_guru,
        email: user.email,
        role: userRole,
        status: user.status,
        kode_member: user.kode_member
      };
    } else {
      // Kelas Account
      payload = {
        type: 'Kelas',
        kode_kelas: user.kode_kelas,
        nama_kelas: user.nama_kelas,
        jurusan: user.jurusan,
        username: user.username,
        role: 'Kelas',
        kode_member: user.kode_member
      };
      userData = {
        type: 'Kelas',
        kode_kelas: user.kode_kelas,
        nama_kelas: user.nama_kelas,
        jurusan: user.jurusan,
        nama_guru: `Akun Kelas ${user.nama_kelas}`,
        role: 'Kelas',
        kode_member: user.kode_member
      };
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return sendSuccess(res, 'Login berhasil.', {
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
}

// Get Profile
async function getProfile(req, res, next) {
  try {
    if (req.user.type === 'Kelas') {
      const kelasData = await KelasModel.findById(req.user.kode_kelas);
      return sendSuccess(res, 'Data profil kelas berhasil diambil.', {
        type: 'Kelas',
        kode_kelas: req.user.kode_kelas,
        nama_kelas: req.user.nama_kelas,
        nama_guru: `Akun Kelas ${req.user.nama_kelas}`,
        role: 'Kelas',
        details: kelasData
      });
    }

    const { kode_guru } = req.user;
    const teacher = await GuruModel.findById(kode_guru);

    if (!teacher) {
      return sendError(res, 'User tidak ditemukan.', 404);
    }

    sendSuccess(res, 'Data profil berhasil diambil.', teacher);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getProfile
};
