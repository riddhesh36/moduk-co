-- Run this in your Supabase SQL Editor

-- 1. Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  ingredients text[] NOT NULL,
  price numeric NOT NULL,
  pieces integer NOT NULL,
  image_url text NOT NULL,
  shelf_life text DEFAULT 'Best within 24 hours',
  storage_instructions text DEFAULT 'Refrigerate if not consuming same day',
  badge text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Allow public read access to active products" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Allow authenticated full access to products
CREATE POLICY "Allow authenticated full access to products" 
ON public.products FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert initial mock products
INSERT INTO public.products (id, slug, name, description, ingredients, price, pieces, image_url, shelf_life, storage_instructions, badge)
VALUES 
  ('classic-box', 'classic-box-5', 'Classic Box', 'A lovely assorted box of our traditional steamed modaks. Perfect for a small family.', ARRAY['Fresh Coconut', 'Rice Flour', 'Jaggery', 'Cardamom', 'Saffron'], 130, 5, '/images/product-1.png', 'Best within 24 hours', 'Refrigerate if not consuming same day', NULL),
  ('delight-box', 'delight-box-7', 'Delight Box', 'A delightful assortment of our premium modaks, ideal for gifting or treating yourself.', ARRAY['Fresh Coconut', 'Rice Flour', 'Jaggery', 'Cardamom', 'Saffron', 'Almonds'], 170, 7, '/images/product-2.png', 'Best within 24 hours', 'Refrigerate if not consuming same day', NULL),
  ('celebration-box', 'celebration-box-11', 'Celebration Box', 'The ultimate celebration box featuring 11 handcrafted modaks. A grand offering for special occasions.', ARRAY['Fresh Coconut', 'Rice Flour', 'Jaggery', 'Cardamom', 'Saffron', 'Pistachio', 'Almonds'], 260, 11, '/images/product-1.png', 'Best within 24 hours', 'Refrigerate if not consuming same day', 'Best Value')
ON CONFLICT (id) DO NOTHING;

-- Create Storage Bucket for product images
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'products' );

create policy "Authenticated access"
on storage.objects for all
using ( bucket_id = 'products' and auth.role() = 'authenticated' );
