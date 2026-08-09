-- Ensure GRANTs exist for all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maps TO authenticated;
GRANT ALL ON public.maps TO service_role;
GRANT SELECT ON public.maps TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_assets TO authenticated;
GRANT ALL ON public.map_assets TO service_role;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;

-- Re-enable RLS just in case
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add policies only if they don't exist
DO $$
BEGIN
    -- Maps policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maps' AND policyname = 'Users can view their own maps') THEN
        CREATE POLICY "Users can view their own maps" ON public.maps FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maps' AND policyname = 'Users can insert their own maps') THEN
        CREATE POLICY "Users can insert their own maps" ON public.maps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maps' AND policyname = 'Users can update their own maps') THEN
        CREATE POLICY "Users can update their own maps" ON public.maps FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maps' AND policyname = 'Users can delete their own maps') THEN
        CREATE POLICY "Users can delete their own maps" ON public.maps FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maps' AND policyname = 'Anyone can view public maps') THEN
        CREATE POLICY "Anyone can view public maps" ON public.maps FOR SELECT TO anon, authenticated USING (is_public = true);
    END IF;

    -- Map Assets policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'map_assets' AND policyname = 'Users can view their own assets') THEN
        CREATE POLICY "Users can view their own assets" ON public.map_assets FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'map_assets' AND policyname = 'Users can insert their own assets') THEN
        CREATE POLICY "Users can insert their own assets" ON public.map_assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'map_assets' AND policyname = 'Users can update their own assets') THEN
        CREATE POLICY "Users can update their own assets" ON public.map_assets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'map_assets' AND policyname = 'Users can delete their own assets') THEN
        CREATE POLICY "Users can delete their own assets" ON public.map_assets FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;

    -- Profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
    END IF;
END $$;
