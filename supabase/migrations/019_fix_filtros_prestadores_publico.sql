-- Fix filtros del listado público: zona y rubro se guardan como JSON, no como texto plano
--
-- perfiles.zona guarda algo como:
--   {"todoUruguay":false,"departamentos":["Artigas"],"zonasMontevideo":[]}
-- por lo que el filtro anterior (p.zona = p_zona) nunca encontraba nada.
--
-- perfiles.descripcion guarda algo como:
--   {"mascotas":["paseador/a"]}
-- el LIKE anterior funcionaba pero también podía matchear un subrol homónimo.

-- ─── Helper: ¿el perfil cubre el departamento buscado? ───
CREATE OR REPLACE FUNCTION public.zona_cubre_departamento(
  p_zona_perfil text,
  p_departamento text
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  j jsonb;
BEGIN
  IF p_departamento IS NULL THEN RETURN true;  END IF;
  IF p_zona_perfil  IS NULL THEN RETURN false; END IF;

  BEGIN
    j := p_zona_perfil::jsonb;
  EXCEPTION WHEN others THEN
    RETURN p_zona_perfil = p_departamento; -- formato legacy: texto plano
  END;

  IF jsonb_typeof(j) <> 'object' THEN
    RETURN p_zona_perfil = p_departamento;
  END IF;

  IF j->'todoUruguay' = 'true'::jsonb THEN
    RETURN true;
  END IF;

  IF jsonb_typeof(j->'departamentos') <> 'array' THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(j->'departamentos') AS d
    WHERE d = p_departamento
  );
END;
$$;

-- ─── Helper: ¿el perfil ofrece el rubro buscado? ───
CREATE OR REPLACE FUNCTION public.descripcion_tiene_rubro(
  p_descripcion text,
  p_rubro text
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  j jsonb;
BEGIN
  IF p_rubro       IS NULL THEN RETURN true;  END IF;
  IF p_descripcion IS NULL THEN RETURN false; END IF;

  BEGIN
    j := p_descripcion::jsonb;
  EXCEPTION WHEN others THEN
    RETURN p_descripcion ILIKE '%' || p_rubro || '%'; -- formato legacy: texto plano
  END;

  IF jsonb_typeof(j) <> 'object' THEN
    RETURN p_descripcion ILIKE '%' || p_rubro || '%';
  END IF;

  RETURN j ? p_rubro;
END;
$$;

GRANT EXECUTE ON FUNCTION public.zona_cubre_departamento(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.descripcion_tiene_rubro(text, text) TO anon, authenticated, service_role;

-- ─── Listado público con filtros corregidos ───
CREATE OR REPLACE FUNCTION public.fetch_prestadores_publico(
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
      p.tarifa_hora,
      p.tarifa_modalidad,
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
      AND public.zona_cubre_departamento(p.zona, p_zona)
      AND public.descripcion_tiene_rubro(p.descripcion, p_rubro)
    GROUP BY p.id, p.nombre, p.zona, p.descripcion, p.avatar_url, p.rango_edad,
             p.sobre_mi, p.tarifa_hora, p.tarifa_modalidad
    ORDER BY p.nombre ASC
    LIMIT 100
  ) t;

  RETURN COALESCE(resultado, '[]'::json);
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_prestadores_publico(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_prestadores_publico(text, text) TO anon, authenticated, service_role;
