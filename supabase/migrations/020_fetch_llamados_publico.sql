-- Llamados públicos para /llamados (indexable, apunta a Google Jobs)
--
-- La tabla llamados ya es legible por anon (008: GRANT SELECT + policy llamados_select_activo),
-- pero contratantes NO lo es, y ahí está el nombre de quien publica. Estas RPC hacen el join
-- con SECURITY DEFINER y devuelven solo campos seguros.
--
-- Privacidad: de personas físicas no se publica el nombre real (Ley 18.331); se muestra
-- "Particular". De empresas sí, porque es información comercial.

-- ─── Listado ───
CREATE OR REPLACE FUNCTION public.fetch_llamados_publico(
  p_zona  text DEFAULT NULL,
  p_rubro text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resultado json;
BEGIN
  PERFORM public.enforce_rate_limit('fetch_llamados_publico', 30, 60);

  SELECT json_agg(row_to_json(t))
  INTO resultado
  FROM (
    SELECT
      l.id,
      l.titulo,
      l.descripcion,
      l.rubro,
      l.zona,
      l.created_at,
      l.expires_at,
      CASE
        WHEN c.tipo_contratante = 'empresa' THEN c.nombre_empresa
        ELSE 'Particular'
      END AS publicado_por,
      c.tipo_contratante
    FROM public.llamados l
    JOIN public.contratantes c ON c.id = l.contratante_id
    WHERE
      l.estado = 'activo'
      AND (l.expires_at IS NULL OR l.expires_at > now())
      AND (p_zona  IS NULL OR l.zona  = p_zona)
      AND (p_rubro IS NULL OR l.rubro = p_rubro)
    ORDER BY l.created_at DESC
    LIMIT 100
  ) t;

  RETURN COALESCE(resultado, '[]'::json);
END;
$$;

-- ─── Detalle ───
CREATE OR REPLACE FUNCTION public.fetch_llamado_publico(p_id uuid)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resultado json;
BEGIN
  PERFORM public.enforce_rate_limit('fetch_llamado_publico', 30, 60);

  SELECT row_to_json(t)
  INTO resultado
  FROM (
    SELECT
      l.id,
      l.titulo,
      l.descripcion,
      l.rubro,
      l.zona,
      l.created_at,
      l.expires_at,
      CASE
        WHEN c.tipo_contratante = 'empresa' THEN c.nombre_empresa
        ELSE 'Particular'
      END AS publicado_por,
      c.tipo_contratante
    FROM public.llamados l
    JOIN public.contratantes c ON c.id = l.contratante_id
    WHERE
      l.id = p_id
      AND l.estado = 'activo'
      AND (l.expires_at IS NULL OR l.expires_at > now())
    LIMIT 1
  ) t;

  RETURN resultado;
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_llamados_publico(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fetch_llamado_publico(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_llamados_publico(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fetch_llamado_publico(uuid) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.fetch_llamados_publico(text, text) IS
  'Listado público de llamados activos sin PII. Usado en /llamados.';
COMMENT ON FUNCTION public.fetch_llamado_publico(uuid) IS
  'Detalle público de un llamado activo sin PII. Usado en /llamados/[slug].';
