-- Fix: authenticated no puede INSERTAR en aceptaciones_legales (42501)
-- Ejecutar en SQL Editor si la app muestra "No pudimos registrar tu aceptación"

GRANT SELECT, INSERT ON public.aceptaciones_legales TO authenticated;
GRANT ALL ON public.aceptaciones_legales TO service_role;

-- Verificar policies existen
DROP POLICY IF EXISTS aceptaciones_insert_own ON public.aceptaciones_legales;
CREATE POLICY aceptaciones_insert_own ON public.aceptaciones_legales
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS aceptaciones_select_own ON public.aceptaciones_legales;
CREATE POLICY aceptaciones_select_own ON public.aceptaciones_legales
  FOR SELECT TO authenticated USING (user_id = auth.uid());
