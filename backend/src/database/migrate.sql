-- Migration: add razorpay_order_id to payments
-- Run this if you already initialized the DB with schema.sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);
