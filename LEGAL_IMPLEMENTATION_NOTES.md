# Legal Implementation Notes — Orvalya Frontend

Resumen para cruzar con el documento legal definitivo de T&C y Privacidad.

## Parte 1: Aceptación legal en registro

### Implementado
- **`/aceptar-terminos`**: pantalla obligatoria post-registro (`LegalAcceptancePage` + `LegalAcceptance.tsx`).
- Resumen en 4 bullets + enlaces a `/terminos` y `/privacidad` (nueva pestaña).
- Checkbox único deshabilitado hasta marcar; botón **Continuar** bloqueado sin aceptación.
- Inserción en Supabase tabla **`aceptaciones_legales`** con `version_terminos`, `version_privacidad`, `user_agent`, `ip_address` (best-effort vía ipify).
- Versiones actuales en **`src/config/legalVersions.ts`** (`2026-06-19`).
- **`ProtectedRoute`** redirige a `/aceptar-terminos` si falta aceptación de la versión vigente.
- Tras onboarding Step4 y registro en `/auth`, navegación va a `/aceptar-terminos` (no al dashboard).

### Asunciones
- Usuarios existentes sin fila en `aceptaciones_legales` deben re-aceptar al próximo login.
- Re-aceptación por nueva versión = nueva fila INSERT (historial completo).
- IP es best-effort; puede ser `null` (documentado en código y migración).

### Migración
- `supabase/migrations/001_aceptaciones_legales.sql`

---

## Parte 2: Documentos — declaración jurada y versionado

### Implementado
- Checkbox **por cada upload** (no pre-marcado): *"Declaro que este documento es auténtico..."*
- Botón **Subir** deshabilitado sin archivo, fecha, y declaración marcada.
- **Versionado**: cada upload INSERT nueva fila; path storage `{prestador_id}/{tipo}/v{version}.{ext}`.
- Trigger DB marca versión anterior como `reemplazado`; no se borran filas ni archivos viejos.
- Columna **`metadata` jsonb**: `size`, `mime`, `filename`, `uploaded_at`.
- **`DocumentHistory.tsx`**: historial expandible por tipo de documento (prestador).

### Migración
- `supabase/migrations/002_documentos_versioning.sql`

### Asunciones
- Columna legacy **`nombre`** se mantiene y se sincroniza con `tipo_documento` en inserts.
- Documentos migrados existentes reciben `declaracion_jurada_aceptada = true` (grandfathering).
- CHECK constraint exige `declaracion_jurada_aceptada = true` en todo INSERT.

---

## Parte 3: Aislamiento entre contratantes (RLS)

### Políticas definidas en migración
- **`perfiles`**: SELECT propio; SELECT prestador solo si `contratos.estado = 'activo'`.
- **`documentos`**: prestador INSERT/SELECT propio; contratante SELECT solo `estado = 'vigente'` con contrato activo.
- **`contratos`**: SELECT/UPDATE solo si `auth.uid()` es contratante o prestador de esa fila.

### Script de prueba
- `supabase/tests/rls_isolation_tests.sql` — ejecutar manualmente en Supabase con UUIDs reales.

### Hallazgos / riesgos (auditoría sin acceso al proyecto remoto)
| Tabla | Estado |
|-------|--------|
| `perfiles` | Políticas propuestas en migración 003 |
| `documentos` | Políticas propuestas en migración 003 |
| `contratos` | Asume columnas `prestador_id`, `contratante_id`, `estado` |
| Otras tablas contratante | **No referenciadas en frontend** — revisar en Supabase antes de nuevas features |

**Acción requerida**: aplicar migraciones 001–003 en el proyecto Supabase remoto y correr el script de tests.

---

## Parte 4: Metadata de fraude (ligero)

- Un campo **`metadata` jsonb** por fila en `documentos` al subir.
- Sin detección de alteración de imagen (fuera de alcance).

---

## Archivos clave frontend

| Archivo | Rol |
|---------|-----|
| `src/config/legalVersions.ts` | Versiones vigentes |
| `src/lib/legalAcceptance.ts` | Check + insert aceptación |
| `src/hooks/useLegalGate.ts` | Hook para guards |
| `src/routing/RouteGuards.tsx` | Protected / Legal / Public |
| `src/pages/legal/*` | UI aceptación + páginas legales |
| `src/pages/dashboard/documentos/*` | Upload versionado + historial |

---

## Límites de líneas

Componentes orquestadores (`App.tsx`, `LegalAcceptancePage.tsx`, `DocumentosPrestador.tsx`) bajo 80 líneas. Resto bajo 150.

---

## Parte 5: Protección anti-bot en registro

### Implementado (junio 2026)
- **hCaptcha** en formularios de registro (`RegisterForm` contratante/auth y `Step4Registro` prestador onboarding).
  - Site key pública en `VITE_HCAPTCHA_SITE_KEY` (`.env`, no commitear).
  - Verificación server-side vía Edge Function **`verify-captcha`** antes de `supabase.auth.signUp()`.
  - Secret key solo en Supabase secrets (`HCAPTCHA_SECRET_KEY`), nunca en frontend.
- **Honeypot** (`middle_name`): campo oculto con `position: absolute; left: -9999px`. Si tiene valor → rechazo silencioso con mensaje genérico de éxito (sin crear cuenta); intento logueado en consola.
- **Rate limiting**: máx. 5 intentos por IP / endpoint / 15 min en tabla **`rate_limit_attempts`** (migración `004`). Mensaje: *"Demasiados intentos, esperá unos minutos"*.

### Archivos clave
| Archivo | Rol |
|---------|-----|
| `src/components/botProtection/*` | Widget captcha + honeypot |
| `src/lib/botProtection/*` | Guard unificado pre-signUp |
| `supabase/functions/verify-captcha/` | Verificación hCaptcha + rate limit |
| `supabase/migrations/004_rate_limit_attempts.sql` | Tabla contador |

### Alineación con Política de Privacidad
Sección 6 promete *"controles anti-bot"* — esta implementación cumple esa promesa en el flujo de registro.

### Deploy requerido
1. Aplicar migración `004_rate_limit_attempts.sql` en Supabase SQL Editor.
2. `supabase secrets set HCAPTCHA_SECRET_KEY=...` (solo vía CLI/dashboard, no en repo).
3. `supabase functions deploy verify-captcha --no-verify-jwt`.

---

## Pendiente fuera de este PR

- Texto legal completo en `/terminos` y `/privacidad` (placeholders mínimos incluidos).
- Vista contratante de historial documental con permiso de auditoría explícito (solo prestador hoy).
- Confirmar schema real de `contratos` en Supabase antes de deploy de RLS 003.
