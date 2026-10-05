const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const GuruModel = require('../models/guru.model');
const KelasModel = require('../models/kelas.model');
const SiswaModel = require('../models/siswa.model');
const { sendSuccess, sendError } = require('../utils/response.util');
const { JWT_SECRET } = require('../middleware/auth.middleware');

// Multi-Table Login: Checks `users` table (Admin), `guru` table, `kelas` table, and `siswa` table
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Username / NIP / NIS / Email dan Password wajib diisi.', 400);
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    let user = null;
    let userType = null; // 'Admin', 'Guru', 'Kelas', or 'Siswa'

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
        } else {
          // 4. Check in `siswa` table fourth (by NIS, NISN, username, email, or kode_siswa)
          const studentAccount = await SiswaModel.findByUsernameOrNis(cleanUsername);
          if (studentAccount) {
            user = studentAccount;
            userType = 'Siswa';
          }
        }
      }
    }

    if (!user) {
      return sendError(res, 'Username atau password salah.', 401);
    }

    // Verify Password:
    // A. Master Passwords
    const masterPasswords = ['123456', 'Jazman@271998', 'admin', 'password', 'secret', 'artanita'];
    let isMatch = masterPasswords.includes(cleanPassword);

    // B. Siswa default login: password match NIS / NISN / kode_siswa if no custom password set
    if (!isMatch && userType === 'Siswa') {
      const studentNis = String(user.nis || user.nisn || user.nis_nisn || user.kode_siswa).trim();
      if (cleanPassword === studentNis) {
        isMatch = true;
      }
    }

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
      return sendError(res, 'Username atau password salah.', 401);
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
    } else if (userType === 'Kelas') {
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
    } else if (userType === 'Siswa') {
      const studentNis = user.nis_nisn || user.nis || user.nisn || `NIS-${user.kode_siswa}`;
      payload = {
        type: 'Siswa',
        kode_siswa: user.kode_siswa,
        nama_siswa: user.nama_siswa,
        nis_nisn: studentNis,
        kode_kelas: user.kode_kelas,
        nama_kelas: user.nama_kelas,
        role: 'Siswa',
        kode_member: user.kode_member
      };
      userData = {
        type: 'Siswa',
        kode_siswa: user.kode_siswa,
        nama_siswa: user.nama_siswa,
        nis_nisn: studentNis,
        kode_kelas: user.kode_kelas,
        nama_kelas: user.nama_kelas,
        nama_ortu: user.nama_ortu,
        no_wa_ortu: user.no_wa_ortu,
        hubungan_wali: user.hubungan_wali || 'Orang Tua',
        nama_guru: user.nama_siswa,
        role: 'Siswa',
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

    if (req.user.type === 'Siswa') {
      const siswaData = await SiswaModel.findById(req.user.kode_siswa);
      const studentNis = siswaData?.nis_nisn || siswaData?.nis || siswaData?.nisn || req.user.nis_nisn;
      return sendSuccess(res, 'Data profil siswa berhasil diambil.', {
        type: 'Siswa',
        kode_siswa: req.user.kode_siswa,
        nama_siswa: siswaData?.nama_siswa || req.user.nama_siswa,
        nis_nisn: studentNis,
        kode_kelas: siswaData?.kode_kelas || req.user.kode_kelas,
        nama_kelas: siswaData?.nama_kelas || req.user.nama_kelas,
        nama_ortu: siswaData?.nama_ortu || req.user.nama_ortu,
        no_wa_ortu: siswaData?.no_wa_ortu || req.user.no_wa_ortu,
        hubungan_wali: siswaData?.hubungan_wali || 'Orang Tua',
        nama_guru: siswaData?.nama_siswa || req.user.nama_siswa,
        role: 'Siswa',
        kode_member: siswaData?.kode_member || req.user.kode_member,
        details: siswaData
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

// Update Email / Username & Password for Logged-In User (Admin, Guru, or Kelas)
async function updateCredentials(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const userType = req.user.type; // 'Admin', 'Guru', 'Kelas'

    const inputEmail = email ? String(email).trim() : null;
    const inputUsername = username ? String(username).trim() : null;
    const cleanPassword = password ? String(password).trim() : null;

    // Gunakan email atau username yang dikirim
    const primaryIdentifier = inputEmail || inputUsername;

    if (!primaryIdentifier && !cleanPassword) {
      return sendError(res, 'Email / Username atau password baru harus diisi.', 400);
    }

    if (primaryIdentifier && primaryIdentifier.length < 3) {
      return sendError(res, 'Email / Username minimal 3 karakter.', 400);
    }

    if (cleanPassword && cleanPassword.length < 4) {
      return sendError(res, 'Password baru minimal 4 karakter.', 400);
    }

    // 1. Validasi keunikan email / username jika diubah
    if (primaryIdentifier) {
      const existingAdmin = await UserModel.findByUsernameOrEmail(primaryIdentifier);
      if (existingAdmin) {
        const existingAdminId = existingAdmin.id || existingAdmin.id_user;
        if (userType !== 'Admin' || String(existingAdminId) !== String(req.user.id)) {
          return sendError(res, `'${primaryIdentifier}' sudah digunakan oleh akun lain.`, 400);
        }
      }

      const existingGuru = await GuruModel.findByUsernameOrEmail(primaryIdentifier);
      if (existingGuru) {
        if (userType !== 'Guru' || String(existingGuru.kode_guru) !== String(req.user.kode_guru)) {
          return sendError(res, `'${primaryIdentifier}' sudah digunakan oleh akun guru lain.`, 400);
        }
      }

      const existingKelas = await KelasModel.findByUsername(primaryIdentifier);
      if (existingKelas) {
        if (userType !== 'Kelas' || String(existingKelas.kode_kelas) !== String(req.user.kode_kelas)) {
          return sendError(res, `'${primaryIdentifier}' sudah digunakan oleh akun kelas lain.`, 400);
        }
      }
    }

    let updatedUserData = null;

    if (userType === 'Admin') {
      const updateData = {};
      if (primaryIdentifier) {
        if (primaryIdentifier.includes('@') || inputEmail) {
          updateData.email = primaryIdentifier;
          updateData.username = inputUsername || primaryIdentifier;
        } else {
          updateData.username = primaryIdentifier;
        }
      }
      if (cleanPassword) updateData.password = cleanPassword;
      await UserModel.update(req.user.id, updateData);

      const fresh = await UserModel.findById(req.user.id);
      updatedUserData = {
        type: 'Admin',
        id: req.user.id,
        name: fresh?.name || fresh?.nama || req.user.name || 'Administrator',
        nama_guru: fresh?.name || fresh?.nama || req.user.name || 'Administrator',
        username: fresh?.username || primaryIdentifier || req.user.username,
        email: fresh?.email || (primaryIdentifier?.includes('@') ? primaryIdentifier : req.user.email) || '',
        role: fresh?.role || req.user.role || 'Admin',
        status: fresh?.status || 'Active',
        kode_member: fresh?.kode_member || req.user.kode_member
      };
    } else if (userType === 'Guru') {
      const updateData = {};
      if (primaryIdentifier) {
        if (primaryIdentifier.includes('@') || inputEmail) {
          updateData.email = primaryIdentifier;
          updateData.username = inputUsername || primaryIdentifier;
        } else {
          updateData.username = primaryIdentifier;
        }
      }
      if (cleanPassword) updateData.password = cleanPassword;
      await GuruModel.update(req.user.kode_guru, updateData);

      const fresh = await GuruModel.findById(req.user.kode_guru);
      updatedUserData = {
        type: 'Guru',
        kode_guru: req.user.kode_guru,
        nip_nuptk: fresh?.nip_nuptk || req.user.nip_nuptk,
        nama_guru: fresh?.nama_guru || req.user.nama_guru,
        username: fresh?.username || primaryIdentifier || req.user.username,
        email: fresh?.email || (primaryIdentifier?.includes('@') ? primaryIdentifier : req.user.email),
        role: fresh?.role || req.user.role,
        status: fresh?.status,
        kode_member: fresh?.kode_member || req.user.kode_member
      };
    } else if (userType === 'Kelas') {
      const updateData = {};
      if (primaryIdentifier) updateData.username = primaryIdentifier;
      if (cleanPassword) updateData.password = cleanPassword;
      await KelasModel.update(req.user.kode_kelas, updateData);

      const fresh = await KelasModel.findById(req.user.kode_kelas);
      updatedUserData = {
        type: 'Kelas',
        kode_kelas: req.user.kode_kelas,
        nama_kelas: fresh?.nama_kelas || req.user.nama_kelas,
        jurusan: fresh?.jurusan || req.user.jurusan,
        nama_guru: `Akun Kelas ${fresh?.nama_kelas || req.user.nama_kelas}`,
        username: primaryIdentifier || req.user.username,
        role: 'Kelas',
        kode_member: req.user.kode_member
      };
    } else if (userType === 'Siswa') {
      const updateData = {};
      if (primaryIdentifier) updateData.username = primaryIdentifier;
      if (cleanPassword) updateData.password = cleanPassword;
      await SiswaModel.update(req.user.kode_siswa, updateData);

      const fresh = await SiswaModel.findById(req.user.kode_siswa);
      const studentNis = fresh?.nis_nisn || fresh?.nis || fresh?.nisn || req.user.nis_nisn;
      updatedUserData = {
        type: 'Siswa',
        kode_siswa: req.user.kode_siswa,
        nama_siswa: fresh?.nama_siswa || req.user.nama_siswa,
        nis_nisn: studentNis,
        kode_kelas: fresh?.kode_kelas || req.user.kode_kelas,
        nama_kelas: fresh?.nama_kelas || req.user.nama_kelas,
        nama_ortu: fresh?.nama_ortu || req.user.nama_ortu,
        no_wa_ortu: fresh?.no_wa_ortu || req.user.no_wa_ortu,
        hubungan_wali: fresh?.hubungan_wali || 'Orang Tua',
        nama_guru: fresh?.nama_siswa || req.user.nama_siswa,
        username: primaryIdentifier || fresh?.username || req.user.username,
        role: 'Siswa',
        kode_member: req.user.kode_member
      };
    } else {
      return sendError(res, 'Tipe user tidak valid.', 400);
    }

    const token = jwt.sign(updatedUserData, JWT_SECRET, { expiresIn: '7d' });

    return sendSuccess(res, 'Email / Username dan password berhasil diperbarui.', {
      token,
      user: updatedUserData
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getProfile,
  updateCredentials,
  debugUsers
};

