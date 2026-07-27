-- 015: Sincronizar auth.users.email -> public.perfiles.email
--
-- Problema que resuelve: desincronización entre auth.users.email y perfiles.email.
-- El email en `perfiles` se escribe desde el frontend (onboarding / activación de
-- contratante) con el valor del formulario, por lo que puede quedar distinto al
-- email real de la cuenta (caso detectado: usuario 4f61a091-99cf-4b12-ac8f-1519e309f16b,
-- cuenta hugo.alvarado.duran@gmail.com con perfiles.email de otra persona).
-- Además, si el usuario cambia su email en Auth, `perfiles` nunca se enteraba.
--
-- Cobertura:
--   1. UPDATE de auth.users.email  -> propaga el nuevo email a perfiles.
--   2. INSERT en auth.users (alta) -> trigger nombrado con prefijo `zzz_` para
--      ejecutarse DESPUÉS del trigger existente de creación de perfil (los triggers
--      de un mismo evento corren en orden alfabético). Ese trigger de signup vive
--      solo en la base remota (no está versionado en este repo); este AFTER INSERT
--      garantiza que perfiles.email quede igual a auth.users.email sin depender
--      de la definición de aquel trigger.

CREATE OR REPLACE FUNCTION public.sync_perfil_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.perfiles
  SET email = NEW.email
  WHERE id = NEW.id
    AND NEW.email IS NOT NULL
    AND email IS DISTINCT FROM NEW.email;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_perfil_email() FROM PUBLIC;
-- Los triggers sobre auth.users se disparan durante operaciones del servicio Auth
GRANT EXECUTE ON FUNCTION public.sync_perfil_email() TO supabase_auth_admin;

-- 1) Cambio de email posterior al alta
DROP TRIGGER IF EXISTS trg_sync_perfil_email ON auth.users;
CREATE TRIGGER trg_sync_perfil_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.sync_perfil_email();

-- 2) Alta de usuario: corre después del trigger que crea la fila en perfiles
DROP TRIGGER IF EXISTS zzz_trg_sync_perfil_email_signup ON auth.users;
CREATE TRIGGER zzz_trg_sync_perfil_email_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_perfil_email();

-- Backfill opcional (comentado a propósito): alinearía TODOS los perfiles cuyo
-- email difiere del de auth.users. No se ejecuta automáticamente porque algún
-- perfil podría tener un email de contacto distinto de forma intencional.
-- Revisar los casos con el SELECT antes de descomentar el UPDATE.
--
-- SELECT p.id, u.email AS auth_email, p.email AS perfil_email
-- FROM public.perfiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE u.email IS NOT NULL AND p.email IS DISTINCT FROM u.email;
--
-- UPDATE public.perfiles p
-- SET email = u.email
-- FROM auth.users u
-- WHERE u.id = p.id
--   AND u.email IS NOT NULL
--   AND p.email IS DISTINCT FROM u.email;
