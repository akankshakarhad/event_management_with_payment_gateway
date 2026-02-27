-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  phone       VARCHAR(15)  NOT NULL,
  college     VARCHAR(200) NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_members INT NOT NULL DEFAULT 1
);

-- ============================================================
-- REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id    UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status      VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'PAID')),
  UNIQUE (user_id, event_id)
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount                   NUMERIC(10, 2) NOT NULL,
  merchant_transaction_id  VARCHAR(100),              -- ID sent to PhonePe
  phonepe_transaction_id   VARCHAR(100),              -- ID returned by PhonePe on success
  user_ids                 TEXT,                      -- JSON array of all user UUIDs (for groups)
  status                   VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                                       CHECK (status IN ('PENDING', 'PAID', 'FAILED')),
  created_at               TIMESTAMP   NOT NULL DEFAULT NOW()
);
