const { pool } = require('../config/db');

const rulebookModel = {
  // Replace existing rulebook for the same event (or global slot if no eventId)
  async upsertForEvent({ fileData, fileType, fileName, eventId }) {
    if (eventId) {
      await pool.query('DELETE FROM rulebook WHERE event_id = $1', [eventId]);
    } else {
      await pool.query('DELETE FROM rulebook WHERE event_id IS NULL');
    }
    const res = await pool.query(
      `INSERT INTO rulebook (file_data, file_type, file_name, event_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, file_type, file_name, event_id, uploaded_at`,
      [fileData, fileType, fileName, eventId || null]
    );
    return res.rows[0];
  },

  // Metadata only — no file_data — fast for listing
  async findAllMeta() {
    const res = await pool.query(
      `SELECT r.id, r.file_type, r.file_name, r.event_id,
              e.title AS event_title, r.uploaded_at
       FROM rulebook r
       LEFT JOIN events e ON r.event_id = e.id
       ORDER BY r.uploaded_at DESC`
    );
    return res.rows;
  },

  // Full record including file_data — only for serving the binary
  async findById(id) {
    const res = await pool.query(
      `SELECT id, file_data, file_type, file_name FROM rulebook WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async deleteById(id) {
    const res = await pool.query(
      `DELETE FROM rulebook WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rows[0];
  },
};

module.exports = rulebookModel;
