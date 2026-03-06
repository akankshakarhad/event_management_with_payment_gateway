-- Migration v2: add event_id to rulebook table
ALTER TABLE rulebook ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Ensure only one rulebook per event
DROP INDEX IF EXISTS rulebook_event_unique;
CREATE UNIQUE INDEX IF NOT EXISTS rulebook_event_unique ON rulebook(event_id) WHERE event_id IS NOT NULL;
