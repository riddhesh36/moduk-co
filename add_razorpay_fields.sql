-- Migration: Add Razorpay columns to orders table
-- Run this in your Supabase SQL Editor

-- 1. Add payment_link_id column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_link_id text;

-- 2. Add payment_id column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id text;

-- 3. Set default for payment_method to 'cod'
ALTER TABLE public.orders ALTER COLUMN payment_method SET DEFAULT 'cod';
