-- Asistente documental: marcar vencidos, avisos in-app/email, semáforo por fecha

-- ─── Marcar vigentes cuya fecha ya pasó ───
CREATE OR REPLACE FUNCTION public.marcar_documentos_vencidos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  UPDATE public.documentos
  SET estado = 'vencido'::estado_documento,
      updated_at = now()
  WHERE estado = 'vigente'::estado_documento
    AND fecha_vencimiento IS NOT NULL
    AND fecha_vencimiento::date < CURRENT_DATE;

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.marcar_documentos_vencidos() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marcar_documentos_vencidos() TO service_role;

-- ─── Tabla de avisos (anti-spam + bandeja in-app) ───
CREATE TABLE IF NOT EXISTS public.avisos_documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  documento_id uuid REFERENCES public.documentos (id) ON DELETE SET NULL,
  tipo_documento text NOT NULL,
  umbral_dias integer NOT NULL,
  canal text NOT NULL DEFAULT 'in_app'
    CHECK (canal IN ('in_app', 'email')),
  titulo text NOT NULL,
  cuerpo text NOT NULL,
  leido_at timestamptz,
  enviado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT avisos_documentos_umbral_check CHECK (umbral_dias IN (30, 15, 7, 0, -1))
);

-- Unique constraint usable by ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS idx_avisos_doc_unique_envio
  ON public.avisos_documentos (documento_id, umbral_dias, canal)
  WHERE documento_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_avisos_doc_prestador_unread
  ON public.avisos_documentos (prestador_id, enviado_en DESC)
  WHERE leido_at IS NULL;

ALTER TABLE public.avisos_documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS avisos_select_own ON public.avisos_documentos;
CREATE POLICY avisos_select_own ON public.avisos_documentos
  FOR SELECT TO authenticated
  USING (prestador_id = auth.uid());

DROP POLICY IF EXISTS avisos_update_own ON public.avisos_documentos;
CREATE POLICY avisos_update_own ON public.avisos_documentos
  FOR UPDATE TO authenticated
  USING (prestador_id = auth.uid())
  WITH CHECK (prestador_id = auth.uid());

GRANT SELECT, UPDATE ON public.avisos_documentos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avisos_documentos TO service_role;

-- ─── Generar avisos pendientes según umbrales ───
CREATE OR REPLACE FUNCTION public.generar_avisos_documentos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  dias integer;
  umbral integer;
  umbrales integer[] := ARRAY[30, 15, 7, 0];
  inserted integer := 0;
  titulo text;
  cuerpo text;
  nombre_doc text;
BEGIN
  PERFORM public.marcar_documentos_vencidos();

  FOR r IN
    SELECT d.id, d.prestador_id, COALESCE(d.tipo_documento, d.nombre) AS tipo,
           d.fecha_vencimiento::date AS venc
    FROM public.documentos d
    WHERE d.estado IN ('vigente'::estado_documento, 'vencido'::estado_documento)
      AND d.fecha_vencimiento IS NOT NULL
  LOOP
    dias := (r.venc - CURRENT_DATE);

    nombre_doc := replace(initcap(replace(r.tipo, '_', ' ')), 'Dgi', 'DGI');
    nombre_doc := replace(nombre_doc, 'Bps', 'BPS');
    nombre_doc := replace(nombre_doc, 'Bse', 'BSE');

    IF dias < 0 THEN
      umbral := -1;
      titulo := nombre_doc || ' vencido';
      cuerpo := 'Tu ' || nombre_doc || ' venció el ' || to_char(r.venc, 'DD/MM/YYYY')
        || '. Actualizalo para mantener tu legajo al día.';

      INSERT INTO public.avisos_documentos (
        prestador_id, documento_id, tipo_documento, umbral_dias, canal, titulo, cuerpo
      )
      VALUES (r.prestador_id, r.id, r.tipo, umbral, 'in_app', titulo, cuerpo)
      ON CONFLICT DO NOTHING;
      IF FOUND THEN inserted := inserted + 1; END IF;

      INSERT INTO public.avisos_documentos (
        prestador_id, documento_id, tipo_documento, umbral_dias, canal, titulo, cuerpo
      )
      VALUES (r.prestador_id, r.id, r.tipo, umbral, 'email', titulo, cuerpo)
      ON CONFLICT DO NOTHING;
      CONTINUE;
    END IF;

    FOREACH umbral IN ARRAY umbrales
    LOOP
      IF dias = umbral THEN
        IF dias = 0 THEN
          titulo := nombre_doc || ' vence hoy';
          cuerpo := 'Tu ' || nombre_doc || ' vence hoy. Subí una versión actualizada.';
        ELSE
          titulo := nombre_doc || ' vence en ' || dias || ' días';
          cuerpo := 'Tu ' || nombre_doc || ' vence el ' || to_char(r.venc, 'DD/MM/YYYY')
            || '. Renovalo a tiempo para evitar sorpresas.';
        END IF;

        INSERT INTO public.avisos_documentos (
          prestador_id, documento_id, tipo_documento, umbral_dias, canal, titulo, cuerpo
        )
        VALUES (r.prestador_id, r.id, r.tipo, umbral, 'in_app', titulo, cuerpo)
        ON CONFLICT DO NOTHING;
        IF FOUND THEN inserted := inserted + 1; END IF;

        INSERT INTO public.avisos_documentos (
          prestador_id, documento_id, tipo_documento, umbral_dias, canal, titulo, cuerpo
        )
        VALUES (r.prestador_id, r.id, r.tipo, umbral, 'email', titulo, cuerpo)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  RETURN inserted;
END;
$$;

REVOKE ALL ON FUNCTION public.generar_avisos_documentos() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generar_avisos_documentos() TO service_role;

-- Semáforo público: solo cuenta vigentes con fecha futura o sin fecha
CREATE OR REPLACE FUNCTION public.fetch_prestador_publico(p_id uuid)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p record;
  docs_count int;
  semaforo text;
BEGIN
  PERFORM public.enforce_rate_limit('fetch_prestador_publico', 30, 60);

  SELECT
    id,
    nombre,
    zona,
    descripcion,
    avatar_url,
    rango_edad,
    sobre_mi,
    experiencia,
    cursos
  INTO p
  FROM public.perfiles
  WHERE id = p_id
    AND tipo IN ('prestador', 'ambos');

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT count(*)::int
  INTO docs_count
  FROM public.documentos
  WHERE prestador_id = p_id
    AND estado = 'vigente'::estado_documento
    AND (fecha_vencimiento IS NULL OR fecha_vencimiento::date >= CURRENT_DATE);

  semaforo := CASE
    WHEN docs_count >= 3 THEN 'verde'
    WHEN docs_count >= 1 THEN 'amarillo'
    ELSE 'rojo'
  END;

  RETURN json_build_object(
    'id', p.id,
    'nombre', p.nombre,
    'zona', p.zona,
    'descripcion', p.descripcion,
    'avatar_url', p.avatar_url,
    'rango_edad', p.rango_edad,
    'sobre_mi', p.sobre_mi,
    'experiencia', p.experiencia,
    'cursos', p.cursos,
    'semaforo', semaforo
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_prestador_publico(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_prestador_publico(uuid) TO anon, authenticated, service_role;

COMMENT ON TABLE public.avisos_documentos IS
  'Avisos de vencimiento documental (in-app y email). Un registro por documento/umbral/canal.';
