const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const GuruModel = require('../models/guru.model');
const { sendSuccess, sendError } = require('../utils/response.util');
const { JWT_SECRET } = require('../middleware/auth.middleware');

// Login Guru / User
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Username/Email/NIP dan Password wajib diisi.', 400);
    }

    const user = await GuruModel.findByUsernameOrEmail(username);

    if (!user) {
      return sendError(res, 'Username atau Password salah.', 401);
    }

    // Verify Password (bcrypt support Laravel $2y$ hash)
    let isMatch = false;
    if (user.password) {
      const hash = user.password.startsWith('$2y$')
        ? '$2a$' + user.password.substring(4)
        : user.password;
      isMatch = await bcrypt.compare(password, hash);
    }

    // Fallback plain password check if not yet hashed
    if (!isMatch && user.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return sendError(res, 'Username atau Password salah.', 401);
    }

    const userRole = user.role || 'Guru';
    const payload = {
      kode_guru: user.kode_guru,
      nama_guru: user.nama_guru,
      username: user.username,
      email: user.email,
      role: userRole,
      kode_member: user.kode_member
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return sendSuccess(res, 'Login berhasil.', {
      token,
      user: {
        kode_guru: user.kode_guru,
        nip_nuptk: user.nip_nuptk,
        nama_guru: user.nama_guru,
        email: user.email,
        role: userRole,
        status: user.status,
        kode_member: user.kode_member
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get Profile
async function getProfile(req, res, next) {
  try {
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
