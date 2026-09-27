const crypto = require('crypto');
const { query } = require('../config/database');

let cachedUserTable = null;
let cachedColumns = null;

/**
 * Resolves the actual user table name and column list dynamically
 * to handle case-sensitivity on Linux MySQL (users vs Users vs user)
 */
async function resolveUserTableInfo() {
  if (cachedUserTable && cachedColumns) {
    return { tableName: cachedUserTable, columns: cachedColumns };
  }

  try {
    const tablesResult = await query('SHOW TABLES');
    const allTables = tablesResult.map(row => Object.values(row)[0]);
    console.log('[UserModel] All database tables found:', allTables);

    // Candidates in priority order
    const candidates = ['users', 'user', 'tbl_users', 'tbl_user', 'admin', 'admins', 'users_admin', 'pengguna', 'akun'];
    let foundTable = null;

    for (const cand of candidates) {
      const match = allTables.find(t => t.toLowerCase() === cand.toLowerCase());
      if (match) {
        foundTable = match;
        break;
      }
    }

    if (!foundTable) {
      foundTable = 'users';
    }

    let cols = [];
    try {
      const colRows = await query(`DESCRIBE \`${foundTable}\``);
      cols = colRows.map(c => c.Field);
    } catch (e) {
      console.warn(`[UserModel] DESCRIBE ${foundTable} warning:`, e.message);
    }

    cachedUserTable = foundTable;
    cachedColumns = cols;
    console.log(`[UserModel] Resolved User Table: '${foundTable}' with columns: [${cols.join(', ')}]`);
    return { tableName: foundTable, columns: cols };
  } catch (err) {
    console.warn('[UserModel] Error resolving tables:', err.message);
    return { tableName: 'users', columns: [] };
  }
}

class UserModel {
  /**
   * Dynamically search for user by email, username, name, or NIP
   * Handles table case sensitivity, column variations, and whitespace/case mismatches
   */
  static async findByUsernameOrEmail(identifier) {
    if (!identifier) return null;
    const cleanId = String(identifier).trim();
    console.log(`[UserModel] Initiating search for identifier: '${cleanId}'`);

    const { tableName, columns } = await resolveUserTableInfo();

    // Determine which columns exist in the table that we can search by
    const possibleCols = ['email', 'username', 'name', 'nama', 'user_email', 'login', 'nip', 'nip_nuptk'];
    const activeCols = columns.length > 0 
      ? possibleCols.filter(c => columns.includes(c))
      : ['email', 'username', 'name'];

    // Method 1: Dynamically match across all existing columns with case-insensitive and trimmed comparison
    if (activeCols.length > 0) {
      try {
        const whereClause = activeCols.map(c => `LOWER(TRIM(\`${c}\`)) = LOWER(TRIM(?))`).join(' OR ');
        const params = activeCols.map(() => cleanId);
        const sql = `SELECT * FROM \`${tableName}\` WHERE (${whereClause}) LIMIT 1`;
        
        console.log(`[UserModel] Querying table '${tableName}' on columns [${activeCols.join(', ')}]`);
        const rows = await query(sql, params);
        if (rows && rows.length > 0) {
          console.log(`[UserModel] Success! Found user in '${tableName}':`, {
            id: rows[0].id || rows[0].id_user,
            email: rows[0].email,
            username: rows[0].username,
            name: rows[0].name || rows[0].nama
          });
          return rows[0];
        }
      } catch (e) {
        console.warn(`[UserModel] Dynamic search failed on '${tableName}':`, e.message);
      }
    }

    // Method 2: Direct query on 'users' with TRIM and LOWER
    try {
      const rows = await query(
        'SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) OR LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1',
        [cleanId, cleanId]
      );
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      // ignore
    }

    // Method 3: Direct query on 'Users' (capitalized) for case-sensitive Linux systems
    try {
      const rows = await query(
        'SELECT * FROM Users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) OR LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1',
        [cleanId, cleanId]
      );
      if (rows && rows.length > 0) return rows[0];
    } catch (e) {
      // ignore
    }

    // Method 4: In-memory row scan fallback (ideal for small user/admin tables)
    try {
      console.log(`[UserModel] Running fallback row scan on '${tableName}'...`);
      const allRows = await query(`SELECT * FROM \`${tableName}\` LIMIT 100`);
      for (const r of allRows) {
        for (const [key, val] of Object.entries(r)) {
          if (typeof val === 'string' && val.trim().toLowerCase() === cleanId.toLowerCase()) {
            console.log(`[UserModel] Found user via row scan! Column '${key}', ID:`, r.id || r.id_user);
            return r;
          }
        }
      }
    } catch (e) {
      console.warn('[UserModel] Row scan error:', e.message);
    }

    console.warn(`[UserModel] User '${cleanId}' was NOT found in '${tableName}'.`);
    return null;
  }

  static async findById(id) {
    const { tableName, columns } = await resolveUserTableInfo();
    const idCol = columns.includes('id_user') ? 'id_user' : 'id';
    try {
      const rows = await query(`SELECT * FROM \`${tableName}\` WHERE \`${idCol}\` = ? LIMIT 1`, [id]);
      return rows[0] || null;
    } catch (e) {
      console.warn(`[UserModel.findById] Error on ${tableName}:`, e.message);
      return null;
    }
  }

  static async findAll() {
    const { tableName, columns } = await resolveUserTableInfo();
    const idCol = columns.includes('id_user') ? 'id_user' : 'id';
    try {
      const rows = await query(`SELECT * FROM \`${tableName}\` ORDER BY \`${idCol}\` ASC`);
      return rows.map(r => ({
        id: r[idCol] || r.id,
        name: r.name || r.nama || r.username || 'User',
        username: r.username || r.email || r.name || `user-${r[idCol] || r.id}`,
        email: r.email || r.user_email || '-',
        role: r.role || r.level || 'Admin',
        status: r.status || 'Active',
        created_at: r.created_at,
        updated_at: r.updated_at
      }));
    } catch (e) {
      console.warn(`[UserModel.findAll] Error on ${tableName}:`, e.message);
      return [];
    }
  }

  static async create({ name, username, email, password, role = 'admin', status = 'active' }) {
    const { tableName, columns } = await resolveUserTableInfo();
    try {
      const insertData = {};
      if (columns.includes('name')) insertData.name = name || username;
      if (columns.includes('nama')) insertData.nama = name || username;
      if (columns.includes('username')) insertData.username = username || email;
      if (columns.includes('email')) insertData.email = email;
      if (columns.includes('user_email')) insertData.user_email = email;
      if (columns.includes('password')) insertData.password = password;
      if (columns.includes('pass')) insertData.pass = password;
      if (columns.includes('role')) insertData.role = role;
      if (columns.includes('level')) insertData.level = role;
      if (columns.includes('status')) insertData.status = status;

      const keys = Object.keys(insertData);
      if (keys.length > 0) {
        const fields = keys.map(k => `\`${k}\``).join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => insertData[k]);
        const res = await query(`INSERT INTO \`${tableName}\` (${fields}) VALUES (${placeholders})`, values);
        return res.insertId;
      }
    } catch (e) {
      console.warn(`[UserModel.create] Error:`, e.message);
    }
    return null;
  }

  static async update(id, { name, username, email, password, role, status }) {
    const { tableName, columns } = await resolveUserTableInfo();
    const idCol = columns.includes('id_user') ? 'id_user' : 'id';
    try {
      const updates = [];
      const values = [];

      if (name && columns.includes('name')) { updates.push('`name` = ?'); values.push(name); }
      if (name && columns.includes('nama')) { updates.push('`nama` = ?'); values.push(name); }
      if (username && columns.includes('username')) { updates.push('`username` = ?'); values.push(username); }
      if (email && columns.includes('email')) { updates.push('`email` = ?'); values.push(email); }
      if (password && columns.includes('password')) { updates.push('`password` = ?'); values.push(password); }
      if (role && columns.includes('role')) { updates.push('`role` = ?'); values.push(role); }
      if (status && columns.includes('status')) { updates.push('`status` = ?'); values.push(status); }

      if (updates.length > 0) {
        values.push(id);
        await query(`UPDATE \`${tableName}\` SET ${updates.join(', ')} WHERE \`${idCol}\` = ?`, values);
      }
    } catch (e) {
      console.warn(`[UserModel.update] Error:`, e.message);
    }
  }

  static async delete(id) {
    const { tableName, columns } = await resolveUserTableInfo();
    const idCol = columns.includes('id_user') ? 'id_user' : 'id';
    await query(`DELETE FROM \`${tableName}\` WHERE \`${idCol}\` = ?`, [id]);
  }

  /**
   * Diagnostic helper to inspect tables and users for debugging login
   */
  static async getDebugInfo() {
    try {
      const tablesResult = await query('SHOW TABLES');
      const allTables = tablesResult.map(row => Object.values(row)[0]);
      const { tableName, columns } = await resolveUserTableInfo();

      let usersSample = [];
      try {
        const rows = await query(`SELECT * FROM \`${tableName}\` LIMIT 20`);
        usersSample = rows.map(r => {
          const safe = { ...r };
          const pwd = safe.password || safe.pass || '';
          safe.password_type = pwd.startsWith('$2')
            ? 'bcrypt'
            : (pwd.length === 32 ? 'md5' : (pwd ? 'plain/other' : 'empty'));
          safe.password_length = pwd.length;
          safe.has_password = Boolean(pwd);
          delete safe.password;
          delete safe.pass;
          return safe;
        });
      } catch (e) {
        usersSample = [{ error: e.message }];
      }

      return {
        allTables,
        resolvedUserTable: tableName,
        columns,
        usersCount: usersSample.length,
        users: usersSample
      };
    } catch (err) {
      return {
        error: err.message
      };
    }
  }
}

module.exports = UserModel;
