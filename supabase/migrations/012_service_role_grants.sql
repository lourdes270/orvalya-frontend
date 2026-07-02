-- Grants para service_role (tests E2E, scripts admin, limpieza de datos)
-- Sin esto, la legacy service_role JWT no puede leer tablas con RLS aunque bypass políticas.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contratantes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.llamados TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO service_role;
