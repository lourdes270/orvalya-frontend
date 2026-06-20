-- Orvalya — migración DEFINITIVA (schema real auditado)
-- Ejecutar UNA vez en Supabase SQL Editor
--
-- Hallazgos previos:
--   • documentos.estado = enum estado_documento
--   • Valores en uso: pendiente (4 filas). NO existe 'aprobado'.
--   • Columnas version/tipo_documento aún no existen
--   • aceptaciones_legales puede no existir

-- ═══ 001: aceptaciones legales ═══
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
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS aceptaciones_select_own ON public.aceptaciones_legales;
CREATE POLICY aceptaciones_select_own ON public.aceptaciones_legales
  FOR SELECT TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT ON public.aceptaciones_legales TO authenticated;
GRANT ALL ON public.aceptaciones_legales TO service_role;

-- ═══ 002: extender enum + columnas nuevas ═══
ALTER TYPE public.estado_documento ADD VALUE IF NOT EXISTS 'vigente';
ALTER TYPE public.estado_documento ADD VALUE IF NOT EXISTS 'reemplazado';
ALTER TYPE public.estado_documento ADD VALUE IF NOT EXISTS 'vencido';

ALTER TABLE public.documentos
  ADD COLUMN IF NOT EXISTS tipo_documento text,
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS fecha_carga timestamptz,
  ADD COLUMN IF NOT EXISTS declaracion_jurada_aceptada boolean,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

UPDATE public.documentos
SET tipo_documento = COALESCE(tipo_documento, nombre),
    fecha_carga = COALESCE(fecha_carga, created_at, now()),
    version = COALESCE(version, 1),
    declaracion_jurada_aceptada = COALESCE(declaracion_jurada_aceptada, true)
WHERE tipo_documento IS NULL
   OR fecha_carga IS NULL
   OR version IS NULL
   OR declaracion_jurada_aceptada IS NULL;

-- Migrar pendiente → vigente (4 filas actuales)
UPDATE public.documentos
SET estado = 'vigente'::estado_documento
WHERE estado = 'pendiente'::estado_documento;

ALTER TABLE public.documentos
  ALTER COLUMN declaracion_jurada_aceptada SET DEFAULT false;

ALTER TABLE public.documentos DROP CONSTRAINT IF EXISTS documentos_estado_check;
ALTER TABLE public.documentos DROP CONSTRAINT IF EXISTS documentos_declaracion_check;

ALTER TABLE public.documentos ADD CONSTRAINT documentos_declaracion_check
  CHECK (
    declaracion_jurada_aceptada IS TRUE
    OR estado = 'pendiente'::estado_documento
  );

ALTER TABLE public.documentos DROP CONSTRAINT IF EXISTS documentos_prestador_id_nombre_key;
ALTER TABLE public.documentos DROP CONSTRAINT IF EXISTS documentos_prestador_nombre_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_documentos_vigente_por_tipo
  ON public.documentos (prestador_id, COALESCE(tipo_documento, nombre))
  WHERE estado = 'vigente'::estado_documento;

CREATE OR REPLACE FUNCTION public.documentos_marcar_anterior_reemplazado()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.documentos
  SET estado = 'reemplazado'::estado_documento
  WHERE prestador_id = NEW.prestador_id
    AND COALESCE(tipo_documento, nombre) = COALESCE(NEW.tipo_documento, NEW.nombre)
    AND estado = 'vigente'::estado_documento
    AND id IS DISTINCT FROM NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_documentos_version ON public.documentos;
CREATE TRIGGER trg_documentos_version
  BEFORE INSERT ON public.documentos
  FOR EACH ROW EXECUTE FUNCTION public.documentos_marcar_anterior_reemplazado();

CREATE OR REPLACE FUNCTION public.documentos_asignar_version()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE max_v integer;
BEGIN
  SELECT COALESCE(MAX(version), 0) INTO max_v
  FROM public.documentos
  WHERE prestador_id = NEW.prestador_id
    AND COALESCE(tipo_documento, nombre) = COALESCE(NEW.tipo_documento, NEW.nombre);

  IF NEW.version IS NULL OR NEW.version <= max_v THEN
    NEW.version := max_v + 1;
  END IF;
  IF NEW.tipo_documento IS NULL THEN NEW.tipo_documento := NEW.nombre; END IF;
  IF NEW.estado IS NULL OR NEW.estado = 'pendiente'::estado_documento THEN
    NEW.estado := 'vigente'::estado_documento;
  END IF;
  IF NEW.fecha_carga IS NULL THEN NEW.fecha_carga := now(); END IF;
  IF NEW.declaracion_jurada_aceptada IS NULL THEN
    NEW.declaracion_jurada_aceptada := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_documentos_asignar_version ON public.documentos;
CREATE TRIGGER trg_documentos_asignar_version
  BEFORE INSERT ON public.documentos
  FOR EACH ROW EXECUTE FUNCTION public.documentos_asignar_version();

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- ═══ 003: RLS (no pisa policies que ya funcionen si existen) ═══
DROP POLICY IF EXISTS perfiles_select_own ON public.perfiles;
CREATE POLICY perfiles_select_own ON public.perfiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS perfiles_select_linked_prestador ON public.perfiles;
CREATE POLICY perfiles_select_linked_prestador ON public.perfiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.contratos c
      WHERE c.contratante_id = auth.uid()
        AND c.prestador_id = perfiles.id
        AND c.estado = 'activo'
    )
  );

DROP POLICY IF EXISTS perfiles_update_own ON public.perfiles;
CREATE POLICY perfiles_update_own ON public.perfiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS documentos_prestador_insert ON public.documentos;
CREATE POLICY documentos_prestador_insert ON public.documentos
  FOR INSERT TO authenticated WITH CHECK (prestador_id = auth.uid());

DROP POLICY IF EXISTS documentos_prestador_select ON public.documentos;
CREATE POLICY documentos_prestador_select ON public.documentos
  FOR SELECT TO authenticated USING (prestador_id = auth.uid());

DROP POLICY IF EXISTS documentos_contratante_select_vigente ON public.documentos;
CREATE POLICY documentos_contratante_select_vigente ON public.documentos
  FOR SELECT TO authenticated USING (
    estado = 'vigente'::estado_documento
    AND EXISTS (
      SELECT 1 FROM public.contratos c
      WHERE c.contratante_id = auth.uid()
        AND c.prestador_id = documentos.prestador_id
        AND c.estado = 'activo'
    )
  );

-- Verificación post-migración
SELECT 'post-migracion' AS seccion, estado::text, count(*) FROM public.documentos GROUP BY estado;
SELECT 'aceptaciones_legales' AS seccion, count(*) FROM public.aceptaciones_legales;
