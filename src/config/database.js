const mysql = require('mysql2/promise');
const { AsyncLocalStorage } = require('async_hooks');
require('dotenv').config();

const tenantStorage = new AsyncLocalStorage();

// Multi-Tenant Domain-to-Database Configuration Mapping
const TENANT_CONFIGS = {
  'sekolah.aspartech.com': {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: 'artanita',
    password: 'Jazman@271998',
    database: 'artanita'
  },
  'mobile.sistemiartas.com': {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: 'artanita',
    password: 'Jazman@271998',
    database: 'artanita'
  },
  'demosekolah.devorme.site': {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: 'user_demo',
    password: 'Jazman@271998',
    database: 'demo_sekolah'
  }
};

const pools = {};

function getTenantConfig(domain) {
  if (!domain) return null;
  const cleanDomain = String(domain).split(':')[0].toLowerCase().trim();

  if (TENANT_CONFIGS[cleanDomain]) {
    return TENANT_CONFIGS[cleanDomain];
  }

  if (cleanDomain.includes('demosekolah') || cleanDomain.includes('devorme')) {
    return TENANT_CONFIGS['demosekolah.devorme.site'];
  }
  if (cleanDomain.includes('artanita') || cleanDomain.includes('aspartech') || cleanDomain.includes('sistemiartas')) {
    return TENANT_CONFIGS['sekolah.aspartech.com'];
  }

  return null;
}

function getPool(customHost) {
  const currentHost = customHost || tenantStorage.getStore();
  const config = getTenantConfig(currentHost);

  const dbHost = process.env.DB_HOST || (config ? config.host : 'localhost');
  const dbPort = parseInt(process.env.DB_PORT, 10) || (config ? config.port : 3306);
  const dbUser = process.env.DB_USER || (config ? config.user : 'artanita');
  const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (config ? config.password : 'Jazman@271998');
  const dbName = process.env.DB_NAME || (config ? config.database : 'artanita');

  const poolKey = `${dbHost}:${dbPort}:${dbUser}:${dbName}`;

  if (!pools[poolKey]) {
    pools[poolKey] = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 25,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    console.log(`[DatabasePool] Dynamic pool initialized for tenant DB '${dbName}' (${dbUser}@${dbHost})`);
  }

  return pools[poolKey];
}

/**
 * Execute parameterized SQL Query safely for the target domain tenant
 * @param {string} sql 
 * @param {Array} params 
 * @param {string} [customHost] 
 * @returns {Promise<Array>}
 */
async function query(sql, params = [], customHost = null) {
  const targetPool = getPool(customHost);
  try {
    const [rows] = await targetPool.query(sql, params);
    return rows;
  } catch (err) {
    const [rows] = await targetPool.execute(sql, params);
    return rows;
  }
}

module.exports = {
  tenantStorage,
  getPool,
  query
};
