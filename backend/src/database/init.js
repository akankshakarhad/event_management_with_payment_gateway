require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const { pool, connectDB } = require('../config/db');

const runFile = async (filename) => {
  const sql = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  await pool.query(sql);
  console.log(`✔  ${filename} executed`);
};

const init = async () => {
  await connectDB();
  try {
    await runFile('schema.sql');
    await runFile('seed.sql');
    console.log('Database initialised successfully.');
  } catch (err) {
    console.error('Init failed:', err.message);
  } finally {
    await pool.end();
  }
};

init();
