const { query } = require('../config/database');

class UserModel {
  static async findByUsernameOrEmail(identifier) {
    try {
      const rows = await query(
        'SELECT * FROM users WHERE (username = ? OR email = ? OR name = ?) LIMIT 1',
        [identifier, identifier, identifier]
      );
      return rows[0] || null;
    } catch (e) {
      console.warn('[UserModel.findByUsernameOrEmail] Error:', e.message);
      return null;
    }
  }

  static async findById(id) {
    try {
      const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (e) {
      console.warn('[UserModel.findById] Error:', e.message);
      return null;
    }
  }

  static async findAll() {
    try {
      const rows = await query('SELECT id, name, username, email, role, status, created_at, updated_at FROM users ORDER BY id ASC');
      return rows;
    } catch (e) {
      try {
        const rows = await query('SELECT * FROM users');
        return rows;
      } catch (err) {
        console.warn('[UserModel.findAll] Error:', err.message);
        return [];
      }
    }
  }

  static async create({ name, username, email, password, role = 'admin', status = 'active' }) {
    const res = await query(
      'INSERT INTO users (name, username, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name || username, username, email || `${username}@esekolah.id`, password, role, status]
    );
    return res.insertId;
  }

  static async update(id, { name, username, email, password, role, status }) {
    let sql = 'UPDATE users SET updated_at = NOW()';
    const params = [];

    if (name) {
      sql += ', name = ?';
      params.push(name);
    }
    if (username) {
      sql += ', username = ?';
      params.push(username);
    }
    if (email) {
      sql += ', email = ?';
      params.push(email);
    }
    if (password) {
      sql += ', password = ?';
      params.push(password);
    }
    if (role) {
      sql += ', role = ?';
      params.push(role);
    }
    if (status) {
      sql += ', status = ?';
      params.push(status);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await query(sql, params);
  }

  static async delete(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = UserModel;
