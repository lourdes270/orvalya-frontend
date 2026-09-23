-- Grants para limpieza de usuarios de prueba (service_role).
-- Sin esto, borrar prestadores falla por FK en audit_trail.

GRANT SELECT, DELETE ON public.audit_trail TO service_role;
GRANT SELECT, DELETE ON public.prestadores TO service_role;
