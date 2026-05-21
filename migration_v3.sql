-- Migration V3: Add First-Time Coupon Check and Delivery Options
-- Run this in your Supabase SQL Editor

-- 1. Add is_first_time_only to coupons table
ALTER TABLE public.coupons 
  ADD COLUMN IF NOT EXISTS is_first_time_only boolean DEFAULT false;

-- 2. Add delivery_option to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS delivery_option text DEFAULT 'delivery' 
  CHECK (delivery_option IN ('delivery', 'pickup'));
