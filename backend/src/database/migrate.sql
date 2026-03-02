-- Migration: add razorpay_order_id to payments
-- Run this if you already initialized the DB with schema.sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);

-- Migration: add course to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS course VARCHAR(200) NOT NULL DEFAULT '';

-- Migration: add participant_type to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS participant_type VARCHAR(20) NOT NULL DEFAULT '';

-- Migration: update Project Display max_members to 5
UPDATE events SET max_members = 5 WHERE title = 'Project Display';
