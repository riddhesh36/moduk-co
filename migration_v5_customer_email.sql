-- Migration: Add customer_email column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email text;
