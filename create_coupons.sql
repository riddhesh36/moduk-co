-- ============================================================
-- Coupon/Discount System Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text CHECK (type IN ('percentage', 'flat')) DEFAULT 'percentage',
  value numeric NOT NULL,
  min_order_amount numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,        -- null = unlimited
  uses_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz DEFAULT NULL,  -- null = no expiry
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Create coupon_uses audit table
CREATE TABLE IF NOT EXISTS public.coupon_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES public.coupons(id),
  order_id uuid REFERENCES public.orders(id),
  user_phone text,
  discount_applied numeric,
  used_at timestamptz DEFAULT now()
);

-- 3. Alter orders table to support coupon fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id),
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_total numeric,
  ADD COLUMN IF NOT EXISTS final_total numeric;

-- 4. Enable RLS on new tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — Coupons

-- Public can read active coupons (for validation)
CREATE POLICY "Allow public read active coupons"
ON public.coupons FOR SELECT
USING (is_active = true);

-- Authenticated admin has full access to coupons
CREATE POLICY "Allow authenticated full access to coupons"
ON public.coupons FOR ALL
USING (auth.role() = 'authenticated');

-- 6. RLS Policies — Coupon Uses

-- Public can insert coupon_uses (recorded on order placement)
CREATE POLICY "Allow public insert coupon_uses"
ON public.coupon_uses FOR INSERT
WITH CHECK (true);

-- Authenticated admin can read/manage coupon_uses
CREATE POLICY "Allow authenticated full access to coupon_uses"
ON public.coupon_uses FOR ALL
USING (auth.role() = 'authenticated');

-- 7. Seed initial coupon: MODUK10 (10% off, unlimited uses)
INSERT INTO public.coupons (code, type, value, is_active, max_uses)
VALUES ('MODUK10', 'percentage', 10, true, NULL)
ON CONFLICT (code) DO NOTHING;
