-- Enhance licenses table for desktop activation
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS hardware_id TEXT;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS months_duration INTEGER;

-- Ensure service_role can manage licenses
GRANT ALL ON public.licenses TO service_role;
