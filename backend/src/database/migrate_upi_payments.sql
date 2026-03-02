-- ============================================================
-- Migration: Add UPI manual-payment columns to payments table
-- Run ONCE against your database after removing PhonePe.
-- ============================================================

-- 1. Rename PhonePe-specific columns to generic names
ALTER TABLE payments
  RENAME COLUMN merchant_transaction_id TO reference_id;

ALTER TABLE payments
  RENAME COLUMN phonepe_transaction_id TO utr;

-- 2. Add screenshot URL column
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- 3. Drop the old status check constraint
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_status_check;

-- 4. Add updated status constraint
ALTER TABLE payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('PENDING', 'VERIFICATION_PENDING', 'APPROVED', 'REJECTED'));

-- 5. Migrate any legacy status values
UPDATE payments SET status = 'APPROVED' WHERE status = 'PAID';
UPDATE payments SET status = 'REJECTED' WHERE status = 'FAILED';
