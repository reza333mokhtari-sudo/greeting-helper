CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled map',
  doc JSONB NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_slug TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(9), 'base64'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX maps_user_id_idx ON public.maps(user_id);
GRANT SELECT ON public.maps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maps TO authenticated;
GRANT ALL ON public.maps TO service_role;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can read their maps" ON public.maps FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public maps are readable by anyone" ON public.maps FOR SELECT USING (is_public = true);
CREATE POLICY "Owners can create maps" ON public.maps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update their maps" ON public.maps FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can delete their maps" ON public.maps FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.map_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'prop',
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX map_assets_user_id_idx ON public.map_assets(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_assets TO authenticated;
GRANT ALL ON public.map_assets TO service_role;
ALTER TABLE public.map_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their assets" ON public.map_assets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER maps_touch_updated_at BEFORE UPDATE ON public.maps
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();