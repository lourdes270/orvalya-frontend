-- Publicar un llamado ahora va directo a "activo" (antes: pendiente_moderacion).
-- Cambia de moderación previa a moderación posterior: el contratante publica al
-- instante, y el admin revisa después desde /admin/moderacion y puede rechazar
-- (baja el llamado) en cualquier momento. Ver aviso por email en
-- supabase/functions/notificar-llamado.
--
-- "Revisado" se trackea reusando moderado_por/moderado_at: un llamado activo con
-- moderado_at IS NULL es "publicado, todavía no lo vio el admin".

CREATE OR REPLACE FUNCTION public.guard_llamado_moderacion_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.estado := 'activo';
    NEW.moderado_por := NULL;
    NEW.moderado_at := NULL;
    NEW.motivo_rechazo := NULL;
    NEW.reportes_count := 0;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.estado = 'rechazado' THEN
      -- Reenvío tras un rechazo: vuelve a publicarse directo, igual que un llamado nuevo.
      NEW.estado := 'activo';
      NEW.moderado_por := NULL;
      NEW.moderado_at := NULL;
      NEW.motivo_rechazo := NULL;
    ELSE
      NEW.estado := OLD.estado;
      NEW.moderado_por := OLD.moderado_por;
      NEW.moderado_at := OLD.moderado_at;
      NEW.motivo_rechazo := OLD.motivo_rechazo;
    END IF;
    NEW.reportes_count := OLD.reportes_count;
  END IF;

  RETURN NEW;
END;
$$;

-- El insert de un contratante ahora debe llegar con estado = 'activo'
-- (el trigger de arriba ya lo fuerza así antes de que esta política se evalúe).
DROP POLICY IF EXISTS llamados_insert_contratante ON public.llamados;
CREATE POLICY llamados_insert_contratante ON public.llamados
  FOR INSERT TO authenticated
  WITH CHECK (
    contratante_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.contratantes c WHERE c.id = auth.uid())
    AND estado = 'activo'
  );

COMMENT ON COLUMN public.llamados.moderado_at IS
  'NULL en un llamado activo = publicado y todavía sin revisión posterior del admin.';
