-- CRUD grants faltantes, fix fetch_prestador_publico (STABLE + rate limit), storage documentos

-- ─── Fix: fetch_prestador_publico no puede ser STABLE si llama enforce_rate_limit (INSERT) ───
CREATE OR REPLACE FUNCTION public.fetch_prestador_publico(p_id uuid)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p record;
  docs_count int;
  semaforo text;
BEGIN
  PERFORM public.enforce_rate_limit('fetch_prestador_publico', 30, 60);

  SELECT
    id,
    nombre,
    zona,
    descripcion,
    avatar_url,
    rango_edad,
    sobre_mi,
    experiencia,
    cursos
  INTO p
  FROM public.perfiles
  WHERE id = p_id
    AND tipo IN ('prestador', 'ambos');

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT count(*)::int
  INTO docs_count
  FROM public.documentos
  WHERE prestador_id = p_id
    AND estado = 'vigente';

  semaforo := CASE
    WHEN docs_count >= 3 THEN 'verde'
    WHEN docs_count >= 1 THEN 'amarillo'
    ELSE 'rojo'
  END;

  RETURN json_build_object(
    'id', p.id,
    'nombre', p.nombre,
    'zona', p.zona,
    'descripcion', p.descripcion,
    'avatar_url', p.avatar_url,
    'rango_edad', p.rango_edad,
    'sobre_mi', p.sobre_mi,
    'experiencia', p.experiencia,
    'cursos', p.cursos,
    'semaforo', semaforo
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_prestador_publico(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_prestador_publico(uuid) TO anon, authenticated, service_role;

-- ─── Grants authenticated (tablas core; idempotente) ───
GRANT SELECT, INSERT, UPDATE ON public.perfiles TO authenticated;
GRANT SELECT, INSERT ON public.documentos TO authenticated;
GRANT SELECT, INSERT ON public.aceptaciones_legales TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.contratos TO authenticated;

-- ─── Grants service_role (E2E, scripts admin) ───
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aceptaciones_legales TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contratos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reportes_llamados TO service_role;

-- ─── Storage bucket documentos (privado; path: {prestador_id}/{tipo}/v{n}.ext) ───
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS documentos_insert_own ON storage.objects;
CREATE POLICY documentos_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documentos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS documentos_select_own ON storage.objects;
CREATE POLICY documentos_select_own ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documentos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS documentos_update_own ON storage.objects;
CREATE POLICY documentos_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documentos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS documentos_delete_own ON storage.objects;
CREATE POLICY documentos_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documentos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
