const { query } = require('../config/database');

class UserModel {
  static async findByUsernameOrEmail(identifier) {
    // 1. Try with username, email, name
    try {
      const rows = await query(
        'SELECT * FROM users WHERE (username = ? OR email = ? OR name = ?) LIMIT 1',
        [identifier, identifier, identifier]
      );
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      // Column username might not exist in standard Laravel users table
    }

    // 2. Try with email or name only
    try {
      const rows = await query(
        'SELECT * FROM users WHERE (email = ? OR name = ?) LIMIT 1',
        [identifier, identifier]
      );
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      // Try email only
    }

    // 3. Try with email only
    try {
      const rows = await query(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [identifier]
      );
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      console.warn('[UserModel.findByUsernameOrEmail] Error:', e.message);
    }

    return null;
  }

  static async findById(id) {
    try {
      const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (e) {
      console.warn('[UserModel.findById] Error:', e.message);
      return null;
    }
  }

  static async findAll() {
    try {
      const rows = await query('SELECT * FROM users ORDER BY id ASC');
      return rows.map(r => ({
        id: r.id,
        name: r.name || r.nama || r.username || 'User',
        username: r.username || r.email || r.name || `user-${r.id}`,
        email: r.email || '-',
        role: r.role || r.level || 'Admin',
        status: r.status || 'Active',
        created_at: r.created_at,
        updated_at: r.updated_at
      }));
    } catch (e) {
      console.warn('[UserModel.findAll] Error:', e.message);
      return [];
    }
  }

  static async create({ name, username, email, password, role = 'admin', status = 'active' }) {
    try {
      const res = await query(
        'INSERT INTO users (name, username, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [name || username, username || email, email, password, role, status]
      );
      return res.insertId;
    } catch (e) {
      // Fallback if username or role column doesn't exist
      const res = await query(
        'INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [name || email, email, password]
      );
      return res.insertId;
    }
  }

  static async update(id, { name, username, email, password, role, status }) {
    try {
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
    } catch (e) {
      // Simple fallback update
      if (name && email) {
        await query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
      }
    }
  }

  static async delete(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = UserModel;
