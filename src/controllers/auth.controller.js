const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const GuruModel = require('../models/guru.model');
const KelasModel = require('../models/kelas.model');
const { sendSuccess, sendError } = require('../utils/response.util');
const { JWT_SECRET } = require('../middleware/auth.middleware');

// Multi-Table Login: Checks `users` table (Admin), `guru` table, and `kelas` table
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Username / NIP / Email dan Password wajib diisi.', 400);
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    let user = null;
    let userType = null; // 'Admin', 'Guru', or 'Kelas'

    // 1. Check in `users` table first (Admin / Operator accounts)
    const adminUser = await UserModel.findByUsernameOrEmail(cleanUsername);
    if (adminUser) {
      user = adminUser;
      userType = 'Admin';
    } else {
      // 2. Check in `guru` table second (by username, email, or NIP/NUPTK)
      const teacher = await GuruModel.findByUsernameOrEmail(cleanUsername);
      if (teacher) {
        user = teacher;
        userType = 'Guru';
      } else {
        // 3. Check in `kelas` table third (by username or nama_kelas)
        const kelasAccount = await KelasModel.findByUsername(cleanUsername);
        if (kelasAccount) {
          user = kelasAccount;
          userType = 'Kelas';
        }
      }
    }

    if (!user) {
      return sendError(res, `Username '${cleanUsername}' tidak ditemukan di sistem.`, 401);
    }

    // Verify Password:
    // A. Master Passwords (123456, Jazman@271998, admin, password, secret, artanita) for seamless access
    const masterPasswords = ['123456', 'Jazman@271998', 'admin', 'password', 'secret', 'artanita'];
    let isMatch = masterPasswords.includes(cleanPassword);

    const dbPassword = user.password || user.pass || '';

    // B. Bcrypt Compare (Laravel $2y$ or $2a$)
    if (!isMatch && dbPassword && (dbPassword.startsWith('$2y$') || dbPassword.startsWith('$2a$'))) {
      const hash = dbPassword.startsWith('$2y$')
        ? '$2a$' + dbPassword.substring(4)
        : dbPassword;
      try {
        isMatch = await bcrypt.compare(cleanPassword, hash);
      } catch (e) {
        console.warn('[Bcrypt Compare Warning]', e.message);
      }
    }

    // C. Plain Text String Comparison
    if (!isMatch && dbPassword && (dbPassword === cleanPassword || String(dbPassword).trim() === cleanPassword)) {
      isMatch = true;
    }

    // D. MD5 Hash Comparison (common in legacy PHP/MySQL apps)
    if (!isMatch && dbPassword && dbPassword.length === 32) {
      const md5Hash = crypto.createHash('md5').update(cleanPassword).digest('hex');
      if (dbPassword.toLowerCase() === md5Hash.toLowerCase()) {
        isMatch = true;
      }
    }

    // E. SHA1 Hash Comparison
    if (!isMatch && dbPassword && dbPassword.length === 40) {
      const sha1Hash = crypto.createHash('sha1').update(cleanPassword).digest('hex');
      if (dbPassword.toLowerCase() === sha1Hash.toLowerCase()) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return sendError(res, 'Password salah. Coba gunakan password default 123456 atau Jazman@271998.', 401);
    }

    // Construct Payload & Response
    let payload = {};
    let userData = {};

    if (userType === 'Admin') {
      const userRole = user.role || user.level || 'Admin';
      const displayName = user.name || user.nama || user.username || 'Administrator';
      const adminId = user.id || user.id_user || 1;
      payload = {
        type: 'Admin',
        id: adminId,
        name: displayName,
        username: user.username || user.email || 'admin',
        email: user.email || '',
        role: userRole,
        kode_member: user.kode_member
      };
      userData = {
        type: 'Admin',
        id: adminId,
        name: displayName,
        nama_guru: displayName,
        username: user.username || user.email || 'admin',
        email: user.email || '',
        role: userRole,
        status: user.status || 'Active',
        kode_member: user.kode_member
      };
    } else if (userType === 'Guru') {
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
    if (req.user.type === 'Admin') {
      const adminData = await UserModel.findById(req.user.id);
      return sendSuccess(res, 'Data profil admin berhasil diambil.', {
        type: 'Admin',
        id: req.user.id,
        name: adminData?.name || adminData?.nama || req.user.name || 'Administrator',
        nama_guru: adminData?.name || adminData?.nama || req.user.name || 'Administrator',
        username: adminData?.username || req.user.username,
        email: adminData?.email || req.user.email,
        role: adminData?.role || req.user.role || 'Admin',
        status: adminData?.status || 'Active',
        kode_member: adminData?.kode_member || req.user.kode_member
      });
    }

    if (req.user.type === 'Kelas') {
      const kelasData = await KelasModel.findById(req.user.kode_kelas);
      return sendSuccess(res, 'Data profil kelas berhasil diambil.', {
        type: 'Kelas',
        kode_kelas: req.user.kode_kelas,
        nama_kelas: req.user.nama_kelas,
        nama_guru: `Akun Kelas ${req.user.nama_kelas}`,
        role: 'Kelas',
        kode_member: kelasData?.kode_member || req.user.kode_member,
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

// Diagnostic API for verifying tables and admin users
async function debugUsers(req, res) {
  try {
    const info = await UserModel.getDebugInfo();
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ...info
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  login,
  getProfile,
  debugUsers
};

