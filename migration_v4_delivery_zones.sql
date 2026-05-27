-- Migration V4: Add Delivery Zone Fields to Orders table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0;

ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS delivery_zone integer;
