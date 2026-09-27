const { query } = require('../src/config/database');

async function inspectDb() {
  try {
    const tables = await query('SHOW TABLES');
    console.log('--- ALL TABLES ---');
    console.log(JSON.stringify(tables));

    try {
      const userCols = await query('DESCRIBE users');
      console.log('--- USERS TABLE COLUMNS ---');
      console.log(JSON.stringify(userCols));
      
      const userRows = await query('SELECT * FROM users LIMIT 5');
      console.log('--- USERS SAMPLE DATA ---');
      console.log(JSON.stringify(userRows));
    } catch (e) {
      console.log('Error describing users table:', e.message);
    }
  } catch (err) {
    console.error('Error inspecting database:', err);
  } finally {
    process.exit(0);
  }
}

inspectDb();
