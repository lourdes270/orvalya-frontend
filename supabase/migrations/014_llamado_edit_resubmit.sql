-- Contratante: al editar un llamado rechazado, reenviar a moderación

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
    NEW.estado := 'pendiente_moderacion';
    NEW.moderado_por := NULL;
    NEW.moderado_at := NULL;
    NEW.motivo_rechazo := NULL;
    NEW.reportes_count := 0;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.estado = 'rechazado' THEN
      NEW.estado := 'pendiente_moderacion';
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
