const { pool } = require('../config/db');

const galleryModel = {
  async create({ imageData, imageType, description }) {
    const res = await pool.query(
      `INSERT INTO event_gallery (image_data, image_type, description)
       VALUES ($1, $2, $3)
       RETURNING id, image_type, description, uploaded_at`,
      [imageData, imageType, description || '']
    );
    return res.rows[0];
  },

  async findAll() {
    const res = await pool.query(
      `SELECT id, image_data, image_type, description, uploaded_at
       FROM event_gallery
       ORDER BY uploaded_at DESC`
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
