const app = require('../backend/src/app');
const { pool } = require('../backend/src/config/db');

// Ensure event_gallery table and event_id column exist (runs on every cold start)
pool.query(`
  CREATE TABLE IF NOT EXISTS event_gallery (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    image_data  TEXT        NOT NULL,
    image_type  VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    description TEXT        NOT NULL DEFAULT '',
    uploaded_at TIMESTAMP   NOT NULL DEFAULT NOW()
  )
`).then(() => pool.query(`
  ALTER TABLE event_gallery
    ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL
`)).catch((err) => console.error('Gallery table init error:', err.message));

module.exports = app;
