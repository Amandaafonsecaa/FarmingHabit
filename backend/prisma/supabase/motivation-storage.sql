-- Bucket privado das fotos da motivação e regras de acesso (Row Level Security em storage.objects).
-- Cada usuário só mexe nos arquivos da própria pasta: "<userId>/...". O backend usa a service role e não passa por estas regras.
-- Rodar uma vez: npm run db:storage (ou colar no SQL Editor do Supabase).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('motivation-photos', 'motivation-photos', false, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "motivation_photos_select_own" ON storage.objects;
DROP POLICY IF EXISTS "motivation_photos_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "motivation_photos_update_own" ON storage.objects;
DROP POLICY IF EXISTS "motivation_photos_delete_own" ON storage.objects;

CREATE POLICY "motivation_photos_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'motivation-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "motivation_photos_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'motivation-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "motivation_photos_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'motivation-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "motivation_photos_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'motivation-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
