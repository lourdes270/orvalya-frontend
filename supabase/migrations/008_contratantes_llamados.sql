-- Contratantes, llamados de trabajo y reportes — con RLS desde el inicio
-- Prerequisitos: public.perfiles, auth.users
-- Admin: columna perfiles.es_admin (solo mutable vía service_role / SQL Editor)

-- ─── Catálogos (mismos valores que el frontend) ───
-- Rubros: src/pages/onboarding/data/rubros.ts (campo id)
-- Zonas: src/pages/onboarding/data/zonas.ts (19 departamentos)

-- ─── Admin helper ───
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS es_admin boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.perfiles.es_admin IS
  'Marcador de administrador de plataforma. Solo modificar con service_role.';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT p.es_admin FROM public.perfiles p WHERE p.id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- Evitar escalada: usuarios autenticados no pueden cambiar es_admin vía API
CREATE OR REPLACE FUNCTION public.guard_perfiles_es_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.es_admin IS DISTINCT FROM OLD.es_admin THEN
    IF coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' THEN
      NEW.es_admin := OLD.es_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_perfiles_guard_es_admin ON public.perfiles;
CREATE TRIGGER trg_perfiles_guard_es_admin
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_perfiles_es_admin();

-- ─── updated_at genérico ───
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ─── contratantes ───
CREATE TABLE IF NOT EXISTS public.contratantes (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  nombre_empresa text NOT NULL,
  rut text NOT NULL,
  rut_verificado boolean NOT NULL DEFAULT false,
  tipo_contratante text NOT NULL,
  rubro_principal text,
  zona text,
  email text NOT NULL,
  email_verificado boolean NOT NULL DEFAULT false,
  telefono text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contratantes_rut_unique UNIQUE (rut),
  CONSTRAINT contratantes_tipo_contratante_check CHECK (
    tipo_contratante IN ('empresa', 'persona_fisica')
  ),
  CONSTRAINT contratantes_rubro_principal_check CHECK (
    rubro_principal IS NULL OR rubro_principal IN (
      'limpieza', 'domestico', 'cuidados', 'mascotas', 'oficios', 'comercio',
      'gastronomia', 'logistica', 'seguridad', 'profesionales', 'arte', 'varios', 'otro'
    )
  ),
  CONSTRAINT contratantes_zona_check CHECK (
    zona IS NULL OR zona IN (
      'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores',
      'Florida', 'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro',
      'Rivera', 'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_contratantes_zona ON public.contratantes (zona);
CREATE INDEX IF NOT EXISTS idx_contratantes_rubro ON public.contratantes (rubro_principal);

DROP TRIGGER IF EXISTS trg_contratantes_updated_at ON public.contratantes;
CREATE TRIGGER trg_contratantes_updated_at
  BEFORE UPDATE ON public.contratantes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.contratantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contratantes_select_own ON public.contratantes;
CREATE POLICY contratantes_select_own ON public.contratantes
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS contratantes_insert_own ON public.contratantes;
CREATE POLICY contratantes_insert_own ON public.contratantes
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS contratantes_update_own ON public.contratantes;
CREATE POLICY contratantes_update_own ON public.contratantes
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── llamados ───
CREATE TABLE IF NOT EXISTS public.llamados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contratante_id uuid NOT NULL REFERENCES public.contratantes (id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  rubro text NOT NULL,
  zona text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente_moderacion',
  moderado_por uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  moderado_at timestamptz,
  motivo_rechazo text,
  reportes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  CONSTRAINT llamados_estado_check CHECK (
    estado IN ('pendiente_moderacion', 'activo', 'rechazado', 'cerrado')
  ),
  CONSTRAINT llamados_rubro_check CHECK (
    rubro IN (
      'limpieza', 'domestico', 'cuidados', 'mascotas', 'oficios', 'comercio',
      'gastronomia', 'logistica', 'seguridad', 'profesionales', 'arte', 'varios', 'otro'
    )
  ),
  CONSTRAINT llamados_zona_check CHECK (
    zona IN (
      'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores',
      'Florida', 'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro',
      'Rivera', 'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
    )
  ),
  CONSTRAINT llamados_reportes_count_nonneg CHECK (reportes_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_llamados_estado ON public.llamados (estado);
CREATE INDEX IF NOT EXISTS idx_llamados_contratante ON public.llamados (contratante_id);
CREATE INDEX IF NOT EXISTS idx_llamados_rubro_zona ON public.llamados (rubro, zona);
CREATE INDEX IF NOT EXISTS idx_llamados_expires_at ON public.llamados (expires_at)
  WHERE expires_at IS NOT NULL;

-- Fuerza moderación: clientes no pueden publicar directo ni tocar campos de moderación
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
    NEW.estado := OLD.estado;
    NEW.moderado_por := OLD.moderado_por;
    NEW.moderado_at := OLD.moderado_at;
    NEW.motivo_rechazo := OLD.motivo_rechazo;
    NEW.reportes_count := OLD.reportes_count;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_llamados_guard_moderacion ON public.llamados;
CREATE TRIGGER trg_llamados_guard_moderacion
  BEFORE INSERT OR UPDATE ON public.llamados
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_llamado_moderacion_fields();

ALTER TABLE public.llamados ENABLE ROW LEVEL SECURITY;

-- Público: solo llamados activos (anon + autenticados)
DROP POLICY IF EXISTS llamados_select_activo ON public.llamados;
CREATE POLICY llamados_select_activo ON public.llamados
  FOR SELECT TO anon, authenticated
  USING (
    estado = 'activo'
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Contratante: ve todos sus llamados (cualquier estado)
DROP POLICY IF EXISTS llamados_select_own ON public.llamados;
CREATE POLICY llamados_select_own ON public.llamados
  FOR SELECT TO authenticated
  USING (contratante_id = auth.uid());

-- Admin: ve todo
DROP POLICY IF EXISTS llamados_select_admin ON public.llamados;
CREATE POLICY llamados_select_admin ON public.llamados
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS llamados_insert_contratante ON public.llamados;
CREATE POLICY llamados_insert_contratante ON public.llamados
  FOR INSERT TO authenticated
  WITH CHECK (
    contratante_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.contratantes c WHERE c.id = auth.uid())
    AND estado = 'pendiente_moderacion'
  );

-- Contratante: edita contenido propio (estado lo bloquea el trigger)
DROP POLICY IF EXISTS llamados_update_own ON public.llamados;
CREATE POLICY llamados_update_own ON public.llamados
  FOR UPDATE TO authenticated
  USING (contratante_id = auth.uid())
  WITH CHECK (contratante_id = auth.uid());

-- Admin: moderación (estado, motivo, etc.)
DROP POLICY IF EXISTS llamados_update_admin ON public.llamados;
CREATE POLICY llamados_update_admin ON public.llamados
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── reportes_llamados ───
CREATE TABLE IF NOT EXISTS public.reportes_llamados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  llamado_id uuid NOT NULL REFERENCES public.llamados (id) ON DELETE CASCADE,
  reportado_por uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  motivo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reportes_llamados_unique_por_usuario UNIQUE (llamado_id, reportado_por)
);

CREATE INDEX IF NOT EXISTS idx_reportes_llamados_llamado ON public.reportes_llamados (llamado_id);

CREATE OR REPLACE FUNCTION public.incrementar_reportes_llamado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.llamados
  SET reportes_count = reportes_count + 1
  WHERE id = NEW.llamado_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reportes_increment_count ON public.reportes_llamados;
CREATE TRIGGER trg_reportes_increment_count
  AFTER INSERT ON public.reportes_llamados
  FOR EACH ROW
  EXECUTE FUNCTION public.incrementar_reportes_llamado();

ALTER TABLE public.reportes_llamados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reportes_insert_authenticated ON public.reportes_llamados;
CREATE POLICY reportes_insert_authenticated ON public.reportes_llamados
  FOR INSERT TO authenticated
  WITH CHECK (reportado_por = auth.uid());

DROP POLICY IF EXISTS reportes_select_admin ON public.reportes_llamados;
CREATE POLICY reportes_select_admin ON public.reportes_llamados
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ─── Grants ───
GRANT SELECT, INSERT, UPDATE ON public.contratantes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.llamados TO authenticated;
GRANT SELECT ON public.llamados TO anon;
GRANT INSERT ON public.reportes_llamados TO authenticated;
GRANT SELECT ON public.reportes_llamados TO authenticated;

COMMENT ON TABLE public.contratantes IS 'Perfil extendido de empresas/personas que contratan servicios.';
COMMENT ON TABLE public.llamados IS 'Pedidos de servicio publicados por contratantes; requieren moderación.';
COMMENT ON TABLE public.reportes_llamados IS 'Reportes de usuarios sobre llamados inapropiados.';
