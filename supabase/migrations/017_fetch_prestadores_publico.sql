-- Listado público de prestadores para /prestadores
-- Sin PII. Visible a anon. Semáforo calculado con JOIN a documentos.

CREATE OR REPLACE FUNCTION public.fetch_prestadores_publico(
  p_zona  text DEFAULT NULL,
  p_rubro text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resultado json;
BEGIN
  PERFORM public.enforce_rate_limit('fetch_prestadores_publico', 20, 60);

  SELECT json_agg(row_to_json(t))
  INTO resultado
  FROM (
    SELECT
      p.id,
      p.nombre,
      p.zona,
      p.descripcion,
      p.avatar_url,
      p.rango_edad,
      left(p.sobre_mi, 200) AS sobre_mi,
      CASE
        WHEN COUNT(d.id) FILTER (
          WHERE d.estado = 'vigente'::estado_documento
            AND (d.fecha_vencimiento IS NULL OR d.fecha_vencimiento::date >= CURRENT_DATE)
        ) >= 3 THEN 'verde'
        WHEN COUNT(d.id) FILTER (
          WHERE d.estado = 'vigente'::estado_documento
            AND (d.fecha_vencimiento IS NULL OR d.fecha_vencimiento::date >= CURRENT_DATE)
        ) >= 1 THEN 'amarillo'
        ELSE 'rojo'
      END AS semaforo
    FROM public.perfiles p
    LEFT JOIN public.documentos d ON d.prestador_id = p.id
    WHERE
      p.tipo IN ('prestador', 'ambos')
      AND p.nombre IS NOT NULL
      AND p.descripcion IS NOT NULL
      AND (p_zona  IS NULL OR p.zona = p_zona)
      AND (
        p_rubro IS NULL
        OR p.descripcion LIKE '%"' || p_rubro || '"%'
      )
    GROUP BY p.id, p.nombre, p.zona, p.descripcion, p.avatar_url, p.rango_edad, p.sobre_mi
    ORDER BY p.nombre ASC
    LIMIT 100
  ) t;

  RETURN COALESCE(resultado, '[]'::json);
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_prestadores_publico(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_prestadores_publico(text, text) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.fetch_prestadores_publico(text, text) IS
  'Listado público de prestadores con semáforo documental. Usado en /prestadores.';
