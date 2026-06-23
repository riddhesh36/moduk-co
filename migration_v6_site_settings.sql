-- Migration V6: Site Settings (key-value store for site-wide configs)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed the notification bar with the current hardcoded text
INSERT INTO public.site_settings (key, value)
VALUES (
  'notification_bar',
  '{"text": "🎉 New Website Launch Offer! Get 10% OFF your first order with code NEW10.", "bg_color": "#C4617A", "is_active": true}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (storefront needs this)
CREATE POLICY "Allow public read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Allow authenticated full access site_settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated');
