-- Columna rango_edad en perfiles (opcional, texto)
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS rango_edad text;

-- Bucket avatars (público para lectura de fotos de perfil)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Lectura pública de avatars
DROP POLICY IF EXISTS avatars_select_public ON storage.objects;
CREATE POLICY avatars_select_public ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Upload/update solo del propio usuario
DROP POLICY IF EXISTS avatars_insert_own ON storage.objects;
CREATE POLICY avatars_insert_own ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS avatars_update_own ON storage.objects;
CREATE POLICY avatars_update_own ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS avatars_delete_own ON storage.objects;
CREATE POLICY avatars_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
