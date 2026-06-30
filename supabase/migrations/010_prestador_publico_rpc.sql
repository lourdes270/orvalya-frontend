-- Perfil público de prestador (sin PII). Usado por /prestadores/:id

CREATE OR REPLACE FUNCTION public.fetch_prestador_publico(p_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p record;
  docs_count int;
  semaforo text;
BEGIN
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
