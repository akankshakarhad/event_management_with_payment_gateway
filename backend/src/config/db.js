const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err.message);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
    throw err;
  }
};

module.exports = { pool, connectDB };
