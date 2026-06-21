-- Rate limiting para endpoints públicos (registro, captcha)
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  endpoint text NOT NULL DEFAULT 'register',
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup
  ON public.rate_limit_attempts (endpoint, ip_address, attempted_at DESC);

ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT ON public.rate_limit_attempts TO service_role;

COMMENT ON TABLE public.rate_limit_attempts IS
  'Contador de intentos por IP para rate limiting en registro y verify-captcha.';
