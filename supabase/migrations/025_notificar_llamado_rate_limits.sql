-- Rate limit de notificar-llamado: 1 aviso por llamado cada 15 min,
-- y como máximo 10 avisos por usuario por hora.
-- La Edge Function llama a enforce_notificar_llamado_limits con service role.

CREATE TABLE IF NOT EXISTS public.notificar_llamado_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  llamado_id uuid NOT NULL REFERENCES public.llamados (id) ON DELETE CASCADE,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificar_llamado_attempts_llamado
  ON public.notificar_llamado_attempts (llamado_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_notificar_llamado_attempts_user
  ON public.notificar_llamado_attempts (user_id, attempted_at DESC);

ALTER TABLE public.notificar_llamado_attempts ENABLE ROW LEVEL SECURITY;
-- Sin políticas: anon y authenticated no entran. service_role ignora RLS.

GRANT SELECT, INSERT ON public.notificar_llamado_attempts TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_notificar_llamado_limits(
  p_user uuid,
  p_llamado uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  DELETE FROM public.notificar_llamado_attempts
  WHERE attempted_at < now() - interval '7 days';

  IF EXISTS (
    SELECT 1
    FROM public.notificar_llamado_attempts
    WHERE llamado_id = p_llamado
      AND attempted_at >= now() - interval '15 minutes'
  ) THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*)::int
  INTO v_count
  FROM public.notificar_llamado_attempts
  WHERE user_id = p_user
    AND attempted_at >= now() - interval '1 hour';

  IF v_count >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.notificar_llamado_attempts (user_id, llamado_id)
  VALUES (p_user, p_llamado);
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_notificar_llamado_limits(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_notificar_llamado_limits(uuid, uuid) TO service_role;
