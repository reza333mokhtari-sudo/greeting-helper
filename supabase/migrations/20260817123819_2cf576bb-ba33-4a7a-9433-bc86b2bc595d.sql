-- Hardening RLS for map_assets
ALTER TABLE public.map_assets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Only allow authenticated users to manage their own assets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'map_assets' AND policyname = 'Users can manage their own assets') THEN
        CREATE POLICY "Users can manage their own assets" 
        ON public.map_assets 
        FOR ALL 
        TO authenticated 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Allow admins to oversee assets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'map_assets' AND policyname = 'Admins can oversee all assets') THEN
        CREATE POLICY "Admins can oversee all assets" 
        ON public.map_assets 
        FOR ALL 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    -- Profiles should not be fully public if not required
    DROP POLICY IF EXISTS "Public profiles viewable by all" ON public.profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    
    CREATE POLICY "Profiles viewable by authenticated users" 
    ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (true);
END $$;

-- Ensure grants are tight
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.maps TO authenticated;
GRANT SELECT ON public.map_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
GRANT SELECT ON public.admin_audit_logs TO authenticated;
