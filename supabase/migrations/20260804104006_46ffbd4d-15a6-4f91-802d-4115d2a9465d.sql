CREATE POLICY "Users read own map assets" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'map-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own map assets" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'map-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own map assets" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'map-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own map assets" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'map-assets' AND auth.uid()::text = (storage.foldername(name))[1]);