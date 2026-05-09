-- Run this in your Supabase SQL Editor AFTER you have created the user in the Auth dashboard.

-- Replace 'admin@moduk.co' with the actual email you registered
UPDATE auth.users 
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@moduk.co';

-- Optional: If you want to make your RLS policies strictly check for this admin role:
-- (Only run these if you want to lock it down beyond just 'authenticated')

DROP POLICY IF EXISTS "Allow authenticated full access to delivery_slots" ON public.delivery_slots;
CREATE POLICY "Allow admin full access to delivery_slots" 
ON public.delivery_slots FOR ALL 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Allow authenticated full access to orders" ON public.orders;
CREATE POLICY "Allow admin full access to orders" 
ON public.orders FOR ALL 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
