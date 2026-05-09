-- Table for storing temporary login OTPs
CREATE TABLE IF NOT EXISTS public.login_otps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile text NOT NULL,
  otp text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.login_otps ENABLE ROW LEVEL SECURITY;

-- Allow service role (server-side) to manage OTPs
CREATE POLICY "Allow server-side access to login_otps"
ON public.login_otps FOR ALL
TO authenticated, service_role
USING (true)
WITH CHECK (true);
