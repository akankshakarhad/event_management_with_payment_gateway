-- Migration: add rulebook table
CREATE TABLE IF NOT EXISTS rulebook (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  file_data   TEXT         NOT NULL,
  file_type   VARCHAR(100) NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
