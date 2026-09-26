const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'artanita',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Jazman@271998',
  database: process.env.DB_NAME || 'artanita',
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Execute parameterized SQL Query safely
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

module.exports = {
  pool,
  query
};
