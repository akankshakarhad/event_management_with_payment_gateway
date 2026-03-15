-- ============================================================
-- Migration: Add project_category to payments table
-- Run this ONCE against your existing database.
-- ============================================================

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS project_category TEXT;
