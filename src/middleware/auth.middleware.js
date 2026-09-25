const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response.util');

const JWT_SECRET = process.env.JWT_SECRET || 'e-sekolah-super-secret-jwt-key-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', 401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return sendError(res, 'Token tidak valid atau telah kadaluwarsa.', 403);
    }
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
