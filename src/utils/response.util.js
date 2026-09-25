/**
 * Standardized JSON API Response Helpers
 */

function sendSuccess(res, message = 'Berhasil', data = null, statusCode = 200, extra = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null && { data }),
    ...extra
  });
}

function sendError(res, message = 'Terjadi kesalahan', statusCode = 400, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== null && { errors })
  });
}

module.exports = {
  sendSuccess,
  sendError
};
