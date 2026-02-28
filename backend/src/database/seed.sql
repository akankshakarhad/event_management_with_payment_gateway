-- GeoFest 2026 Events
-- Run after schema.sql

DELETE FROM events;

INSERT INTO events (title, description, price, max_members) VALUES
  ('GeoFest Arena Quiz',
   'Technical quiz testing geotechnical knowledge, speed, accuracy, and analytical thinking.',
   199.00, 2),

  ('Connecting the Dots',
   'Solve real-world geotechnical problems by connecting multi-disciplinary concepts.',
   199.00, 3),

  ('GeoTalk',
   'Present your research paper or innovative idea in geotechnical / civil engineering.',
   199.00, 2),

  ('GeoFest Project Expo',
   'Showcase innovative geotechnical projects, models, prototypes, and engineering solutions.',
   199.00, 4),

  ('Midas Software Workshop',
   'Expert workshop on MIDAS applications in geotechnical engineering and design.',
   199.00, 1);
