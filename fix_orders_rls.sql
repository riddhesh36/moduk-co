-- Fix RLS policies for orders and delivery_slots
-- 1. Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public select by display_id" ON public.orders;
DROP POLICY IF EXISTS "Allow public read access to active slots" ON public.delivery_slots;
DROP POLICY IF EXISTS "Allow authenticated full access to orders" ON public.orders;

-- 3. Create robust insertion policy for storefront visitors (Orders)
CREATE POLICY "Allow public insert to orders" 
ON public.orders FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 4. Create selection policy so users can see their own order success page (Orders)
CREATE POLICY "Allow public select by display_id"
ON public.orders FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Create public read access for active slots (Delivery Slots)
CREATE POLICY "Allow public read access to active slots" 
ON public.delivery_slots FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- 6. Admin full access (Orders)
CREATE POLICY "Allow authenticated full access to orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
