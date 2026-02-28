const { pool } = require('../config/db');

const galleryModel = {
  async create({ imageData, imageType, description, eventId }) {
    const res = await pool.query(
      `INSERT INTO event_gallery (image_data, image_type, description, event_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, image_type, description, event_id, uploaded_at`,
      [imageData, imageType, description || '', eventId || null]
    );
    return res.rows[0];
  },

  async findAll() {
    const res = await pool.query(
      `SELECT g.id, g.image_data, g.image_type, g.description,
              g.event_id, e.title AS event_title, g.uploaded_at
       FROM event_gallery g
       LEFT JOIN events e ON g.event_id = e.id
       ORDER BY g.uploaded_at DESC`
    );
    return res.rows;
  },

  async deleteById(id) {
    const res = await pool.query(
      `DELETE FROM event_gallery WHERE id = $1 RETURNING id`,
      [id]
    );
    return res.rows[0];
  },
};

module.exports = galleryModel;
