require('dotenv').config();
const app = require('./src/app');
const { connectDB, pool } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

/* ── Sync event titles and descriptions to canonical values ── */
const migrateEvents = async () => {
  // Rename legacy titles
  const renames = [
    ['GeoFest Arena Quiz',           'Quiz Competition'],
    ['GeoTalk',                      'Geotalk'],
    ['Geotalk (Paper Presentation)', 'Geotalk'],
    ['GeoFest Project Expo',         'Project Display'],
    ['Connecting the Dots',          'Connecting The Dots'],
  ];
  for (const [oldTitle, newTitle] of renames) {
    await pool.query(
      `UPDATE events SET title = $1 WHERE title = $2`,
      [newTitle, oldTitle]
    );
  }

  // Sync descriptions to match the landing page
  const descriptions = [
    ['Quiz Competition',        'Technical quiz testing Geotechnical knowledge, speed, accuracy, and analytical thinking.'],
    ['Connecting The Dots',     'Solve real-world Geotechnical problems by connecting multi-disciplinary concepts.'],
    ['Geotalk',                 'Present your research paper or innovative idea in Geotechnical / civil engineering.'],
    ['Project Display',         'Showcase innovative Geotechnical projects, models, prototypes, and engineering solutions.'],
    ['Midas Software Workshop', 'Expert workshop on MIDAS applications in Geotechnical engineering and design.'],
  ];
  for (const [title, desc] of descriptions) {
    await pool.query(
      `UPDATE events SET description = $1 WHERE title = $2`,
      [desc, title]
    );
  }

  console.log('Event migration applied.');
};

const ensureGalleryTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_gallery (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      image_data  TEXT        NOT NULL,
      image_type  VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
      description TEXT        NOT NULL DEFAULT '',
      uploaded_at TIMESTAMP   NOT NULL DEFAULT NOW()
    )
  `);
  console.log('Gallery table ready.');
};

const start = async () => {
  await connectDB();
  await migrateEvents();
  await ensureGalleryTable();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
