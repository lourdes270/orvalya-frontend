-- Script de prueba manual de aislamiento RLS (ejecutar en SQL Editor de Supabase)
-- Reemplazar UUIDs de ejemplo antes de correr.
-- Ejecutar cada bloque autenticado como el usuario correspondiente (JWT / impersonate).

-- IDs de ejemplo (reemplazar):
-- :contratante_a  → uuid contratante A
-- :contratante_b  → uuid contratante B
-- :prestador_p    → uuid prestador vinculado solo a A

-- ═══ TEST 1: Contratante A no ve perfiles de Contratante B ═══
-- Sesión: contratante_a
-- Esperado: 0 filas (salvo el propio perfil si id = contratante_a)
SELECT id, email, tipo FROM perfiles WHERE id = :contratante_b;
-- Esperado: ERROR permission denied o 0 rows

-- ═══ TEST 2: Contratante A ve prestador vinculado ═══
-- Precondición: contratos(contratante_id=A, prestador_id=P, estado='activo')
SELECT id, nombre FROM perfiles WHERE id = :prestador_p;
-- Esperado: 1 fila

-- ═══ TEST 3: Contratante B no ve prestador de A sin contrato ═══
-- Sesión: contratante_b
SELECT id FROM perfiles WHERE id = :prestador_p;
-- Esperado: 0 filas

-- ═══ TEST 4: Contratante A ve solo documentos vigentes del prestador ═══
SELECT tipo_documento, version, estado FROM documentos
WHERE prestador_id = :prestador_p;
-- Esperado: solo filas con estado = 'vigente'

-- ═══ TEST 5: Prestador ve historial completo propio ═══
-- Sesión: prestador_p
SELECT tipo_documento, version, estado FROM documentos
WHERE prestador_id = :prestador_p
ORDER BY tipo_documento, version;
-- Esperado: vigente + reemplazado + vencido

-- ═══ TEST 6: Contratante A no ve contratos de Contratante B ═══
SELECT * FROM contratos WHERE contratante_id = :contratante_b;
-- Esperado: 0 filas

-- ═══ TEST 7: aceptaciones_legales inmutables ═══
-- Sesión: cualquier usuario autenticado
UPDATE aceptaciones_legales SET version_terminos = 'hack' WHERE user_id = auth.uid();
-- Esperado: permission denied
DELETE FROM aceptaciones_legales WHERE user_id = auth.uid();
-- Esperado: permission denied

-- ═══ TEST 8: INSERT documento sin declaración jurada ═══
INSERT INTO documentos (prestador_id, tipo_documento, archivo_url, fecha_vencimiento, declaracion_jurada_aceptada)
VALUES (:prestador_p, 'certificado_dgi', 'path/test.pdf', '2027-01-01', false);
-- Esperado: CHECK constraint violation
