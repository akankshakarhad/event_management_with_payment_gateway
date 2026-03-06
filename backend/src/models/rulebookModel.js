const { pool } = require('../config/db');

const rulebookModel = {
  async upsert({ fileData, fileType, fileName }) {
    await pool.query('DELETE FROM rulebook');
    const res = await pool.query(
      `INSERT INTO rulebook (file_data, file_type, file_name)
       VALUES ($1, $2, $3)
       RETURNING id, file_type, file_name, uploaded_at`,
      [fileData, fileType, fileName]
    );
    return res.rows[0];
  },

  async findCurrent() {
    const res = await pool.query(
      `SELECT id, file_data, file_type, file_name, uploaded_at
       FROM rulebook
       ORDER BY uploaded_at DESC
       LIMIT 1`
    );
    return res.rows[0] || null;
  },

  async deleteAll() {
    await pool.query('DELETE FROM rulebook');
    return true;
  },
};

module.exports = rulebookModel;
