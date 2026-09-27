const UserModel = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getAllUsers(req, res, next) {
  try {
    const users = await UserModel.findAll();
    sendSuccess(res, 'Data pengguna admin berhasil diambil.', users, 200, { count: users.length });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return sendError(res, 'User tidak ditemukan.', 404);
    }
    sendSuccess(res, 'Detail user berhasil diambil.', user);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const id = await UserModel.create(req.body);
    sendSuccess(res, 'User admin berhasil ditambahkan.', { id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    await UserModel.update(id, req.body);
    sendSuccess(res, 'User admin berhasil diperbarui.', { id });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await UserModel.delete(id);
    sendSuccess(res, 'User admin berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
