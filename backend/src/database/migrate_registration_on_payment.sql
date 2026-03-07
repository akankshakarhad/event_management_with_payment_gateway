-- Add event_ids column to payments to store which events to register for
-- Registrations are now created only after payment is submitted, not at form submission
ALTER TABLE payments ADD COLUMN IF NOT EXISTS event_ids TEXT;
