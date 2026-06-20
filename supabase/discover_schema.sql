-- ═══════════════════════════════════════════════════════════════
-- ORVALYA — Descubrir schema REAL antes de migrar
-- Ejecutar en Supabase SQL Editor → copiar TODO el resultado → pegarlo en el chat
-- ═══════════════════════════════════════════════════════════════

-- 1) Valores del enum estado_documento (CRÍTICO)
SELECT 'estado_documento enum' AS seccion, unnest(enum_range(NULL::estado_documento)) AS valor;

-- 2) Columnas de documentos
SELECT 'documentos columnas' AS seccion, column_name, data_type, udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documentos'
ORDER BY ordinal_position;

-- 3) Constraints en documentos
SELECT 'documentos constraints' AS seccion, conname AS nombre, pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE conrelid = 'public.documentos'::regclass;

-- 4) Índices en documentos
SELECT 'documentos indices' AS seccion, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'documentos';

-- 5) Triggers en documentos
SELECT 'documentos triggers' AS seccion, tgname AS nombre, pg_get_triggerdef(oid) AS definicion
FROM pg_trigger
WHERE tgrelid = 'public.documentos'::regclass AND NOT tgisinternal;

-- 6) ¿Existe aceptaciones_legales?
SELECT 'aceptaciones_legales existe' AS seccion,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'aceptaciones_legales'
  ) AS existe;

-- 7) Columnas de perfiles
SELECT 'perfiles columnas' AS seccion, column_name, data_type, udt_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'perfiles'
ORDER BY ordinal_position;

-- 8) Columnas de contratos
SELECT 'contratos columnas' AS seccion, column_name, data_type, udt_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'contratos'
ORDER BY ordinal_position;

-- 9) Enum de contratos.estado (si aplica)
SELECT 'contratos.estado tipo' AS seccion, column_name, udt_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'contratos' AND column_name = 'estado';

-- 10) Valores enum contratos (solo si es enum; si falla, ignorar fila)
-- SELECT unnest(enum_range(NULL::estado_contrato));

-- 11) RLS activo por tabla
SELECT 'RLS' AS seccion, relname AS tabla, relrowsecurity AS rls_activo
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relname IN ('perfiles', 'documentos', 'contratos', 'prestadores', 'aceptaciones_legales')
ORDER BY relname;

-- 12) Policies existentes
SELECT 'policies' AS seccion, schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('perfiles', 'documentos', 'contratos', 'aceptaciones_legales')
ORDER BY tablename, policyname;

-- 13) Muestra de documentos (solo columnas base — sin asumir migración aplicada)
SELECT 'documentos muestra' AS seccion, id, prestador_id, nombre, estado::text, archivo_url, fecha_vencimiento, created_at
FROM public.documentos
LIMIT 5;

-- 14) Conteo por estado (valores reales en uso)
SELECT 'documentos por estado' AS seccion, estado::text AS estado, count(*) AS total
FROM public.documentos
GROUP BY estado
ORDER BY total DESC;

-- 15) Funciones relacionadas a documentos
SELECT 'funciones documentos' AS seccion, proname AS nombre
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname LIKE '%documento%';
