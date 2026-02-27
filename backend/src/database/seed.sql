-- GeoFest 2026 Events
-- Run after schema.sql

DELETE FROM events;

INSERT INTO events (title, description, price, max_members) VALUES
  ('Quiz Competition',
   'Inter-college geoscience & geotechnical engineering quiz. Team of up to 2 members.',
   199.00, 2),

  ('Connecting the Dots',
   'Solve real-world geotechnical problems by connecting multi-disciplinary concepts. Team of up to 3 members.',
   199.00, 3),

  ('Geotalk (Paper Presentation)',
   'Present your research paper or innovative idea in geotechnical / civil engineering. Team of up to 2 members.',
   199.00, 2),

  ('Project Display',
   'Showcase your engineering project or working model. Team of exactly 4 members.',
   199.00, 4),

  ('Midas Software Workshop',
   'Hands-on training on MIDAS geotechnical software. Individual participation only.',
   199.00, 1);
