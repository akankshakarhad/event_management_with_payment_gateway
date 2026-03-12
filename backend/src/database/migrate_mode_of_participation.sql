-- Add mode_of_participation to registrations (Online / Offline)
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS mode_of_participation VARCHAR(20) NOT NULL DEFAULT '';

-- Store per-member modes in payments so they can be applied when registrations are created
ALTER TABLE payments ADD COLUMN IF NOT EXISTS member_modes TEXT;
