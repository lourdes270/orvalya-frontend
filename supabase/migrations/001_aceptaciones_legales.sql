-- aceptaciones_legales: registro inmutable de aceptación de T&C y Privacidad
CREATE TABLE IF NOT EXISTS public.aceptaciones_legales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  version_terminos text NOT NULL,
  version_privacidad text NOT NULL,
  aceptado_en timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_aceptaciones_legales_user_id
  ON public.aceptaciones_legales (user_id, aceptado_en DESC);

ALTER TABLE public.aceptaciones_legales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aceptaciones_insert_own ON public.aceptaciones_legales;
CREATE POLICY aceptaciones_insert_own ON public.aceptaciones_legales
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS aceptaciones_select_own ON public.aceptaciones_legales;
CREATE POLICY aceptaciones_select_own ON public.aceptaciones_legales
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Sin UPDATE/DELETE para authenticated: registros legales inmutables (solo service_role).
