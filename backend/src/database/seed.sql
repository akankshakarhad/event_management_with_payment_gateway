-- Sample Geofest 2026 Events
-- Run this after schema.sql to populate initial event data

INSERT INTO events (title, description, price) VALUES
  ('Paper Presentation',   'Present your research paper on geoscience topics.', 150.00),
  ('Poster Presentation',  'Display your work as a scientific poster.',          100.00),
  ('Quiz Competition',     'Inter-college geoscience quiz.',                     50.00),
  ('Field Mapping',        'Practical field geology mapping contest.',           200.00),
  ('Rock Identification',  'Identify rock and mineral specimens.',               75.00)
ON CONFLICT DO NOTHING;
