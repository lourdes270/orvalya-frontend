-- Límites de rate limit configurables, y más altos para las RPC públicas.
--
-- Contexto: enforce_rate_limit cuenta por IP (get_request_ip()). Eso servía cuando el
-- navegador de cada visitante llamaba directo a Supabase: una IP = un usuario.
-- Con render en servidor (Next.js en Vercel) TODAS las visitas salen de un puñado de IPs
-- del servidor, así que 20 req/min estrangulaba el sitio entero, y además hacía fallar
-- el build al prerenderizar varias páginas seguidas.
--
-- En lugar de recrear cada función para cambiar un número, el límite ahora se puede
-- ajustar por endpoint desde esta tabla, sin nuevas migraciones.

CREATE TABLE IF NOT EXISTS public.rate_limit_config (
  endpoint        text PRIMARY KEY,
  max_attempts    int  NOT NULL,
  window_seconds  int  NOT NULL,
  nota            text,
  CONSTRAINT rate_limit_config_positivos CHECK (max_attempts > 0 AND window_seconds > 0)
);

ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;
-- Sin políticas: solo accesible por SECURITY DEFINER y service_role.

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
  v_max int := p_max_attempts;
  v_window int := p_window_seconds;
BEGIN
  -- El valor configurado manda sobre el que pasa la función que llama.
  SELECT max_attempts, window_seconds
  INTO v_max, v_window
  FROM public.rate_limit_config
  WHERE endpoint = p_endpoint;

  IF NOT FOUND THEN
    v_max := p_max_attempts;
    v_window := p_window_seconds;
  END IF;

  v_ip := public.get_request_ip();
  v_since := now() - make_interval(secs => v_window);

  SELECT count(*)::int
  INTO v_count
  FROM public.rate_limit_attempts
  WHERE endpoint = p_endpoint
    AND ip_address = v_ip
    AND attempted_at >= v_since;

  IF v_count >= v_max THEN
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

-- Lecturas públicas: se renderizan en el servidor y las cachea Next (ISR),
-- así que el volumen real contra la base es bajo pese al límite alto.
INSERT INTO public.rate_limit_config (endpoint, max_attempts, window_seconds, nota) VALUES
  ('fetch_prestadores_publico', 600, 60, 'Listado público SSR: una IP sirve a todos los visitantes'),
  ('fetch_prestador_publico',   600, 60, 'Perfil público SSR'),
  ('fetch_llamados_publico',    600, 60, 'Listado de llamados SSR'),
  ('fetch_llamado_publico',     600, 60, 'Detalle de llamado SSR')
ON CONFLICT (endpoint) DO UPDATE
  SET max_attempts = EXCLUDED.max_attempts,
      window_seconds = EXCLUDED.window_seconds,
      nota = EXCLUDED.nota;

COMMENT ON TABLE public.rate_limit_config IS
  'Límites por endpoint que sobreescriben los valores pasados a enforce_rate_limit.';
