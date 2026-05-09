-- Run this in your Supabase SQL Editor

-- 1. Create delivery_slots table
CREATE TABLE IF NOT EXISTS public.delivery_slots (
  id text PRIMARY KEY,
  label text NOT NULL,
  cutoff_time time NOT NULL,
  max_capacity integer NOT NULL DEFAULT 20,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial slots
INSERT INTO public.delivery_slots (id, label, cutoff_time, max_capacity, is_active)
VALUES 
  ('SLOT-11AM', '11:00 AM – 1:00 PM', '09:30:00', 20, true),
  ('SLOT-3PM', '3:00 PM – 5:00 PM', '13:30:00', 20, true),
  ('SLOT-7PM', '7:00 PM – 9:00 PM', '17:30:00', 20, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  display_id text NOT NULL,
  customer_name text NOT NULL,
  customer_mobile text NOT NULL,
  address_line1 text NOT NULL,
  address_area text NOT NULL,
  address_city text NOT NULL,
  address_pincode text NOT NULL,
  items jsonb NOT NULL,
  slot_id text REFERENCES public.delivery_slots(id),
  slot_date date NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  razorpay_order_id text,
  wa_opt_in boolean DEFAULT false,
  order_notes text,
  status text NOT NULL DEFAULT 'needs_verification',
  total_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for public access (Storefront)
-- Create anonymous viewing of active slots
CREATE POLICY "Allow public read access to active slots" 
ON public.delivery_slots FOR SELECT 
USING (is_active = true);

-- Allow public insertion of orders
CREATE POLICY "Allow public insert to orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Policies for authenticated admin
CREATE POLICY "Allow authenticated full access to delivery_slots" 
ON public.delivery_slots FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to orders" 
ON public.orders FOR ALL 
USING (auth.role() = 'authenticated');
