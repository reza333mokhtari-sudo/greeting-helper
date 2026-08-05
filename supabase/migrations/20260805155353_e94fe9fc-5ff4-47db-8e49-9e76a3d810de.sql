-- Add license column to map_assets
ALTER TABLE public.map_assets ADD COLUMN IF NOT EXISTS license text;

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_assets TO authenticated;
GRANT ALL ON public.map_assets TO service_role;
