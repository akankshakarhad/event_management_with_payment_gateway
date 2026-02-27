-- ============================================================
-- Migration: Razorpay → PhonePe
-- Run this ONCE against your existing database.
-- ============================================================

-- 1. Rename old Razorpay columns to generic names
ALTER TABLE payments
  RENAME COLUMN razorpay_order_id TO merchant_transaction_id;

ALTER TABLE payments
  RENAME COLUMN razorpay_payment_id TO phonepe_transaction_id;

-- 2. Add user_ids column (stores JSON array of all user UUIDs for group payments)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS user_ids TEXT;
