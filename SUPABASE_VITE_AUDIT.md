# Auditoría Supabase ↔ Vite ↔ Frontend

Fecha: 2026-06-20  
Proyecto Supabase: `msgfcxnqujgvkxrzkbsw`

## Vite / variables de entorno

| Hallazgo | Estado |
|----------|--------|
| Vite carga `.env` solo desde la **raíz** del proyecto | OK tras eliminar `src/.env` duplicado |
| `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` presentes en raíz | OK |
| `VITE_FORMSPREE_CONTRATANTE_URL` **no configurada** | Formulario `/contacto/contratante` fallará al enviar |
| Cliente Supabase ahora valida env al iniciar | Corregido en `src/lib/supabase.ts` |

## Supabase remoto — tablas verificadas (sesión autenticada)

| Tabla | Existe | Filas | Notas |
|-------|--------|-------|-------|
| `perfiles` | Sí | 8 | OK |
| `documentos` | Sí | 0+ | Schema **legacy**, sin columnas legales nuevas |
| `prestadores` | Sí | 8 | Incluye `semaforo`, valoraciones |
| `contratos` | Sí | 0 | RLS activo (`permission denied` en INSERT anónimo) |
| `aceptaciones_legales` | **No** | — | Error `PGRST205` — migración 001 pendiente |

## Incongruencias schema `perfiles`

**Columnas en Supabase que faltaban en el tipo TS:**

- `declaracion_jurada_fecha`
- `suscripcion_plan`, `suscripcion_hasta`
- `contratos_activos_count`
- `whatsapp`, `updated_at`

→ Añadidas como opcionales en `AuthContextType.ts`.

## Incongruencias schema `documentos`

**Supabase actual (legacy):**

```
id, prestador_id, documento_rubro_id, nombre, archivo_url,
fecha_emision, fecha_vencimiento, estado (default: 'pendiente'),
revisado_por, revisado_at, notas_revision, created_at, updated_at, obligatorio
```

**Frontend legal (post-migración 002):**

```
tipo_documento, version, fecha_carga, declaracion_jurada_aceptada,
metadata, estado ('vigente'|'reemplazado'|'vencido')
```

**Impacto:** uploads con columnas nuevas fallan con `PGRST204` hasta aplicar migración 002.

**Corrección frontend:** `uploadDocument.ts` hace fallback a upsert legacy (`nombre`, `archivo_url`, `fecha_vencimiento`).

**Corrección migración:** `002_documentos_versioning.sql` reescrita para convivir con columnas y estados legacy (`pendiente`, `aprobado`).

## Incongruencias flujo contratante

**Problema:** Registro en `/auth` dejaba `perfil.tipo = 'pendiente'` → loop en onboarding, nunca llegaba a aceptar términos ni al dashboard.

**Corrección:**

- `Step0TipoPerfil` guarda `orvalya_registro_tipo=contratante` en sessionStorage
- `RegisterForm` llama `activarPerfilContratante()` → UPDATE `tipo='contratante'` + refresca contexto

## Migraciones pendientes en Supabase

Ejecutar **en orden** en SQL Editor (Dashboard → SQL):

1. `supabase/migrations/001_aceptaciones_legales.sql`
2. `supabase/migrations/002_documentos_versioning.sql` (versión compatible)
3. `supabase/migrations/003_rls_isolation.sql` (revisar si no rompe policies existentes)

Tras 001, el gate legal en `/aceptar-terminos` funcionará.

Tras 002, uploads usarán versionado completo (sin fallback legacy).

## Clave anon / publishable

El proyecto usa formato `sb_publishable_...`. Funciona en el cliente `@supabase/supabase-js` en browser; las pruebas REST crudas desde PowerShell pueden devolver 401/404 sin JWT de usuario.

## Acciones recomendadas

1. **PRIMERO:** ejecutar `supabase/discover_schema.sql` y revisar el resultado antes de migrar
2. Aplicar migraciones adaptadas al schema real (001 → 002 → 003)
3. Agregar `VITE_FORMSPREE_CONTRATANTE_URL` en `.env` y Vercel
4. Re-testear flujos prestador y contratante post-migración
5. Ejecutar `supabase/tests/rls_isolation_tests.sql` con UUIDs reales
