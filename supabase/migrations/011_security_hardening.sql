-- Hardening de seguridad: admin por BD, rate limit en RPC pública, verificación de RUT

-- ─── Admin: solo es_admin en BD (sin email hardcodeado) ───
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT p.es_admin FROM public.perfiles p WHERE p.id = auth.uid()),
    false
  );
$$;

COMMENT ON COLUMN public.perfiles.es_admin IS
  'Marcador de administrador de plataforma (is_admin). Solo modificar con service_role.';

-- ─── IP del request (PostgREST / Supabase) ───
CREATE OR REPLACE FUNCTION public.get_request_ip()
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  headers json;
  forwarded text;
BEGIN
  BEGIN
    headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  EXCEPTION WHEN OTHERS THEN
    RETURN 'unknown';
  END;

  forwarded := headers->>'x-forwarded-for';
  IF forwarded IS NOT NULL AND forwarded <> '' THEN
    RETURN trim(split_part(forwarded, ',', 1));
  END IF;

  RETURN coalesce(nullif(headers->>'x-real-ip', ''), 'unknown');
END;
$$;

-- ─── Rate limiting genérico por IP ───
CREATE OR REPLACE FUNCTION public.enforce_rate_limit(
  p_endpoint text,
  p_max_attempts int,
  p_window_seconds int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip text;
  v_count int;
  v_since timestamptz;
BEGIN
  v_ip := public.get_request_ip();
  v_since := now() - make_interval(secs => p_window_seconds);

  SELECT count(*)::int
  INTO v_count
  FROM public.rate_limit_attempts
  WHERE endpoint = p_endpoint
    AND ip_address = v_ip
    AND attempted_at >= v_since;

  IF v_count >= p_max_attempts THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING ERRCODE = 'P0001',
            HINT = 'Demasiadas solicitudes. Intentá de nuevo en unos minutos.';
  END IF;

  INSERT INTO public.rate_limit_attempts (ip_address, endpoint)
  VALUES (v_ip, p_endpoint);
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_rate_limit(text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_rate_limit(text, int, int) TO service_role;

-- ─── fetch_prestador_publico con rate limit (30 req/min por IP) ───
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

-- ─── Verificar RUT no duplicado (perfiles + contratantes) ───
CREATE OR REPLACE FUNCTION public.rut_ya_registrado(
  p_rut text,
  p_exclude_user_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rut text;
  v_simbolicos text[] := ARRAY['pendiente_verificacion', 'tramite', 'sin_rut'];
BEGIN
  v_rut := regexp_replace(coalesce(p_rut, ''), '\D', '', 'g');
  IF length(v_rut) < 8 THEN
    RETURN false;
  END IF;

  IF lower(trim(coalesce(p_rut, ''))) = ANY (v_simbolicos) THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.contratantes c
    WHERE regexp_replace(c.rut, '\D', '', 'g') = v_rut
      AND (p_exclude_user_id IS NULL OR c.id <> p_exclude_user_id)
  ) THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.perfiles p
    WHERE regexp_replace(coalesce(p.rut, ''), '\D', '', 'g') = v_rut
      AND length(regexp_replace(coalesce(p.rut, ''), '\D', '', 'g')) >= 8
      AND lower(trim(coalesce(p.rut, ''))) <> ALL (v_simbolicos)
      AND (p_exclude_user_id IS NULL OR p.id <> p_exclude_user_id)
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.rut_ya_registrado(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rut_ya_registrado(text, uuid) TO authenticated, service_role;
