# Orvalya — Plan paso a paso de seguridad (TDAH-friendly)

**Versión:** 3 (10 Sep 2026 · actualizado con correcciones + agregados A–E)  
**Regla:** una sola tarea a la vez. Cuando la termines, marcá `[x]` y pegá evidencia en `docs/SECURITY.md`.

**Cómo usar esta guía**
1. Hacé **una sola tarea** (la del número más bajo pendiente).
2. Cuando la termines, marcá el checkbox `[x]`.
3. Pegá la evidencia en `docs/SECURITY.md` (si no existe, crealo en la Tarea A0).
4. Solo entonces pasá a la siguiente.
5. Si te trabás 15 minutos: anotá dónde y pedí ayuda con esa tarea puntual.

**Leyenda**
- 🛠️ = corregir código / config  
- ✅ = solo verificar  
- 📋 = trámite / decisión de producto

**Hechos del repo (verificados · no asumir lo contrario)**
- En `supabase/config.toml` solo aparece `[functions.verify-captcha]` con `verify_jwt = false`.  
  **No hay** secciones `[functions.notificar-llamado]` ni `[functions.avisos-documentos]`.
- `notificar-llamado` **no** valida ownership ni rate limit; usa service role.
- `avisos-documentos` valida secret solo **si** el env existe → **fail-open**.
- Trigger vigente de rechazo: migración `024` fuerza `activo` al editar un `rechazado` (**a propósito**, no un bug accidental).
- Ya existe `rate_limit_attempts` (por IP) para captcha/RPC; **no** hay rate limit de notificaciones.
- `docs/SECURITY.md` se crea en A0 si no existe.
- FKs de `perfiles` / `documentos` / `contratos` **no** están en migraciones versionadas → hay que consultar la BD en vivo.

---

# BLOQUE A0 — Antes de tocar seguridad

## Tarea A0 · Crear el archivo de evidencia `docs/SECURITY.md`
**Tipo:** 📋  
**Tiempo estimado:** 10 min  
**Estado:** [x]

### ¿Qué es esto?
Un cuaderno de pruebas. Cada vez que termines una tarea, pegás ahí el resultado. Eso es tu prueba para auditoría externa y para clientes.

### Pasos
1. Creá el archivo `docs/SECURITY.md` en este repo (si ya existe, no lo pisés: agregá secciones).
2. Usá esta plantilla mínima si es nuevo:

```markdown
# Orvalya — Evidencia de remediación de seguridad

Proyecto: orvalya-frontend · Fecha inicio: ____

## Decisiones de config (verify_jwt, cron, etc.)
(Completar en A1)

## Registro de tareas
| Tarea | Fecha | Resultado | Evidencia |
|-------|-------|-----------|-----------|
| A0 | | OK | Archivo creado |
```

3. Guardalo local (commit solo si vos lo pedís).

### Evidencia: ___

---

# BLOQUE A — Esta semana (P0)

---

## Tarea A1 · Proteger `notificar-llamado` + declarar `verify_jwt` de las 3 functions + investigar el cron
**Tipo:** 🛠️ + ✅  
**Tiempo estimado:** 2–3 h (incluye investigación + migración)  
**Estado:** [x]

### Estado ACTUAL en este repo (verificado)
- Archivo: `supabase/functions/notificar-llamado/index.ts`
- **Validación del caller:** ninguna. Solo lee `llamado_id` del body (líneas 64–67).
- **Service role:** sí — `getServiceRoleKey()` (15–24) y `createClient(..., getServiceRoleKey())` (69–70).
- **Rate limit:** no hay.
- **`verify_jwt` en config.toml:** solo `verify-captcha = false`. Las otras dos functions **no están declaradas**.

### ⚠️ ALERTA: las DOS caras de `verify_jwt`
1. **Puerta A — gateway (`verify_jwt`)**  
   - `true` = Supabase rechaza si no hay JWT válido.  
   - Solo prueba: “hay *alguien* con token”.  
   - **No** prueba ownership.
2. **Puerta B — ownership en tu código**  
   - Obligatorio en `notificar-llamado`: `llamado.contratante_id === user.id` → si no, `403`.  
   - Aunque `verify_jwt = true`, **sin Puerta B** cualquier cuenta autenticada puede abusar.

Nunca depender del default del CLI: **declarar las 3** en `config.toml`.

### ¿Qué es esto? (20 segundos)
Edge Function = código en el servidor de Supabase.  
Service role = llave maestra que **ignora RLS**.  
Rate limit en Edge **no** puede ser memoria/Redis local: las instances son efímeras. Usá **tabla Postgres**.

### ¿Por qué doble límite?
- Por `llamado_id`: 1 notificación cada X minutos → no re-disparar el mismo llamado.  
- Por `user_id`: máx. 10/hora → un abusor no evade creando muchos llamados.

### Pasos (uno por uno — no saltees 1–3)

**Investigación (antes de tocar config de avisos)**

1. **Investigar el cron / GitHub Action que llama a `avisos-documentos` hoy:**
   - Buscá en el repo: workflows (`.github/workflows/`), scripts, docs, secrets mencionados, `x-cron-secret`, `Authorization`, `Bearer`.
   - Revisá en GitHub Actions / cron del host qué headers manda realmente.
   - Preguntá: ¿está funcionando en prod o puede estar fallando en silencio por `verify_jwt` default?
   - Anotá en `SECURITY.md`: qué Bearer/header manda (o “ninguno”), y si los avisos llegan o no.

2. **Declarar explícitamente `verify_jwt` en `supabase/config.toml` para las 3 functions** (nunca default):
   - `verify-captcha`: `false` (ya está así; dejar explícito).
   - `notificar-llamado`: `true` (la llama un usuario logueado).
   - `avisos-documentos`: **según lo que encontraste en el paso 1**  
     - Si el cron **no** manda JWT de usuario → `verify_jwt = false` y la cerradura es el secret.  
     - Si manda algún Bearer especial → documentar qué es y por qué; no adivinar.  
   - Pegá la decisión final (true/false + motivo) en `SECURITY.md`.

**Rate limit en Postgres + ownership en `notificar-llamado`**

3. Creá migración nueva, ej. `025_notificar_llamado_rate_limits.sql`, con tabla dedicada:

```sql
create table if not exists public.notificar_llamado_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  llamado_id uuid not null references public.llamados (id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index on public.notificar_llamado_attempts (llamado_id, attempted_at desc);
create index on public.notificar_llamado_attempts (user_id, attempted_at desc);
alter table public.notificar_llamado_attempts enable row level security;
grant select, insert on public.notificar_llamado_attempts to service_role;
```

4. (Recomendado) RPC `enforce_notificar_llamado_limits(p_user uuid, p_llamado uuid)`:
   - máx. 1 intento por `llamado_id` en los últimos **N minutos** (ej. 15);
   - máx. 10 intentos por `user_id` en la última **hora**;
   - si excede → `raise exception 'rate_limit_exceeded'`;
   - si OK → `insert` del intento.
5. Aplicá la migración al proyecto remoto.
6. En `notificar-llamado/index.ts`, tras validar POST:
   - Leé `Authorization` (Bearer JWT).
   - Cliente user con anon key + JWT → `auth.getUser()` → si no hay user → `401`.
7. Con service role leé el llamado por `llamado_id`.
8. Si `llamado.contratante_id !== user.id` → `403`.
9. Aplicá rate limit (RPC/tabla) **antes** de mandar emails → si excede → `429`.
10. Solo entonces enviá emails (como hoy).
11. Deploy de `notificar-llamado` (y redeploy de las otras si cambió `config.toml`).

### Cómo verificar
1. Dueño del llamado → POST OK.  
2. Otra cuenta, mismo `llamado_id` → `403`.  
3. Sin JWT → rechazado por gateway/`401`.  
4. **Rate por llamado:** 2 veces seguidas mismo llamado → 2ª = `429`.  
5. **Rate por usuario:** >10 llamados distintos en <1 h (o simular attempts) → corta.  
6. En `SECURITY.md`: decisión `verify_jwt` de las 3 functions + hallazgo del cron.

### Evidencia: ___

---

## Tarea A2 · Cerrar `avisos-documentos` (secret fail-closed + aplicar decisión de `verify_jwt`)
**Tipo:** 🛠️  
**Tiempo estimado:** 25–45 min  
**Estado:** [ ]  
**Dependencia:** terminá el paso de investigación de A1 (cron) antes de fijar `verify_jwt` acá.

### Estado ACTUAL en este repo (verificado)
```ts
  const cronSecret = Deno.env.get('AVISOS_CRON_SECRET')
  if (cronSecret) {
    const header = req.headers.get('x-cron-secret')
    if (header !== cronSecret) {
      return json({ ok: false, error: 'No autorizado' }, 401)
    }
  }
```
Si el env **no** existe → **fail-open**.  
`verify_jwt` **no declarado** en config.

### Pasos
1. Cambiá el bloque a **fail-closed**:
   - Sin `AVISOS_CRON_SECRET` en env → `500`.  
   - Header `x-cron-secret` distinto → `401`.
2. En `config.toml`, dejá `[functions.avisos-documentos] verify_jwt = …` **exactamente como decidiste en A1** (documentado en `SECURITY.md`). No uses el default.
3. Dashboard → Secrets: confirmá `AVISOS_CRON_SECRET`.
4. Alineá el cron/Action: mande el secret (y JWT solo si la decisión lo requiere).
5. Deploy.

### Cómo verificar
1. Sin header → `401`.  
2. Secret malo → `401`.  
3. Sin env (prueba controlada) → `500`.  
4. Llamada correcta del cron → OK / avisos llegan.  
5. Confirmá que no falla en silencio por `verify_jwt`.

### Evidencia: ___

---

## Tarea A3 · Moderación post-rechazo (decisión de producto, no “bug”)
**Tipo:** 🛠️ + 📋  
**Tiempo estimado:** 30–60 min (+ tiempo de acuerdo con founder)  
**Estado:** [ ]

### Estado ACTUAL en este repo (verificado)
Migración vigente: **`024_llamados_publicar_directo.sql`**.  
Cuando un llamado en `rechazado` recibe UPDATE (no-admin):

```sql
    IF OLD.estado = 'rechazado' THEN
      NEW.estado := 'activo';  -- republicación directa a propósito
```

Antes (`014`) iba a `pendiente_moderacion`. El `024` **cambió la política a propósito** (moderación posterior + republicar al editar).  
**Esto no es un bug accidental: es una decisión de producto.** Cambiarlo es revertir/ajustar esa política.

### Decisión requerida (antes de codear)
Confirmar con la founder que la política **deseada** es:

> Llamado rechazado + editado por el contratante → `pendiente_moderacion` (requiere re-aprobación admin), **no** republicación directa a `activo`.

- Si la founder **no** confirma → **no** cambies el trigger; documentá en `SECURITY.md` “se mantiene republicación directa (024)”.  
- Si **sí** confirma → seguí los pasos técnicos abajo.

### Pasos técnicos (solo si hay OK de producto)
1. Creá migración nueva, ej. `026_llamados_rechazo_recola.sql`.
2. `CREATE OR REPLACE` de `guard_llamado_moderacion_fields`: en rechazo + UPDATE → `NEW.estado := 'pendiente_moderacion'` (recomendado: no borrar `motivo_rechazo` / `moderado_*` hasta aprobación).
3. Aplicá migración remota.
4. Probá el flujo en la app.

### Cómo verificar
1. Admin rechaza.  
2. Contratante edita.  
3. Estado = `pendiente_moderacion` (no público).  
4. Admin aprueba → público.  
5. En `SECURITY.md`: “política confirmada por founder el ____”.

### Evidencia: ___

---

## Tarea A4 · Verificar Auth en Supabase Dashboard
**Tipo:** ✅  
**Tiempo estimado:** 15–25 min  
**Estado:** [ ]

### ¿Qué es esto?
Consola Auth: rate limits de login/registro y JWT.  
`config.toml` `[auth.rate_limit] sign_in_sign_ups = 5` es local/doc; prod se confirma en Dashboard.

### Pasos
1. Dashboard → proyecto Orvalya (`msgfcxnqujgvkxrzkbsw`).
2. Authentication → Rate Limits: anotá valor real: `______`.
3. JWT expiry / refresh rotation: anotá: `______`.
4. Google OAuth: redirects solo `https://www.orvalya.com/...`.
5. Pegá valores en `SECURITY.md`.

### Cómo verificar
Fallá login 6–10 veces rápido: debería frenar si el límite está activo.

### Evidencia: ___

---

## Tarea A5 · Test RLS con dos usuarios reales
**Tipo:** ✅  
**Tiempo estimado:** 30–45 min  
**Estado:** [ ]

### ¿Qué es esto?
**RLS** = “este usuario solo ve *sus* filas”. Firewall principal de Supabase.

### Pasos
1. Cuenta A y cuenta B.
2. Con A, intentá leer perfil/documentos de B.
3. Esperado: 0 filas / sin acceso Storage del otro.
4. (Opcional) `supabase/tests/rls_isolation_tests.sql`.
5. PASS/FAIL en `SECURITY.md`.

### Evidencia: ___

---

# BLOQUE B — Próximas 2 semanas (P1)

---

## Tarea B1 · Pasar la sesión a cookies httpOnly
**Tipo:** 🛠️  
**Tiempo estimado:** medio día (2–3 sesiones)  
**Estado:** [ ]

### Estado ACTUAL
`src/lib/supabase.ts` → `createClient` browser (localStorage típico). `@supabase/ssr` en deps pero no usado para sesión.

### Pasos
1. Guía oficial Supabase + Next.js App Router (SSR cookies).
2. Clientes browser/server + middleware de refresh.
3. Reemplazar patrón de `supabase.ts` / `AuthContext`.
4. Probar login, refresh, logout, rutas protegidas.
5. Actualizar privacidad § cookies cuando esté live.

### Cómo verificar
Cookies presentes; access token **no** en Local Storage; logout limpia sesión.

### Evidencia: ___

---

## Tarea B2 · Endurecer la CSP
**Tipo:** 🛠️  
**Tiempo estimado:** 1–2 h  
**Estado:** [ ]

### Estado ACTUAL
CSP en `next.config.ts` con `'unsafe-inline'` y `'unsafe-eval'`.

### Pasos
1. Editar CSP.  
2. Quitar `unsafe-eval` si no hace falta; nonces.  
3. Probar login, hCaptcha, Formspree, Storage.  
4. Re-chequear headers en preview/prod.

### Evidencia: ___

---

## Tarea B3 · Validar archivos también en el servidor
**Tipo:** 🛠️  
**Tiempo estimado:** 2–4 h  
**Estado:** [ ]

### Estado ACTUAL
`src/lib/fileValidation.ts` solo en el browser.

### Pasos
1. Validación MIME/size en Edge/gateway.  
2. Cliente no sube crudo sin pasar por ella.  
3. Probar PDF OK, exe renombrado, >5 MB.

### Evidencia: ___

---

## Tarea B4 · Exportar datos + eliminar cuenta (ARCO) — FKs en vivo + excepción legal
**Tipo:** 🛠️ + 📋  
**Tiempo estimado:** 1 día (partible)  
**Estado:** [ ]

### ¿Qué es?
Derechos de acceso y borrado (Ley 18.331). Hoy no hay UI self-service.

### ⚠️ Nunca “confiar” en CASCADE
Las migraciones del repo muestran CASCADE en varias tablas, pero **`perfiles` / `documentos` / `contratos` no tienen CREATE en migraciones**.  
El inventario válido es el de la **base en vivo** (`information_schema`), no solo el historial SQL del repo.

### Referencia parcial (solo migraciones — incompleta)
| Tabla.columna | ON DELETE en migraciones |
|---------------|--------------------------|
| `aceptaciones_legales.user_id` | CASCADE en `001` — **hay que cambiar el comportamiento de borrado** (ver excepción abajo) |
| `contratantes.id` | CASCADE |
| `llamados.moderado_por` | SET NULL |
| `reportes_llamados.reportado_por` | CASCADE |
| `avisos_documentos.prestador_id` | CASCADE |

### Excepción legal: `aceptaciones_legales`
**No borrar** esas filas al eliminar la cuenta.  
Son evidencia de consentimiento. Aunque la migración `001` tenga `ON DELETE CASCADE`, el flujo de delete account debe:

1. **Anonimizar** (ej. reemplazar/nullar datos identificables según diseño acordado; conservar fila, versión legal, timestamp).  
2. Evitar que el `deleteUser` se lleve las filas: p.ej. migración que pase la FK a `ON DELETE SET NULL` (si `user_id` puede ser null) **o** reasignar/anonimizar `user_id` **antes** del delete de Auth, de forma que no quede PII pero sí la prueba legal.  
3. Documentar el esquema final en `SECURITY.md`.

Borrar `aceptaciones_legales` = destruir prueba legal. **Prohibido en este plan.**

### Pasos
1. **Consultar la BD en vivo** (SQL Editor de Supabase), no solo migraciones:

```sql
select
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
  and ccu.table_schema = tc.table_schema
join information_schema.referential_constraints rc
  on rc.constraint_name = tc.constraint_name
  and rc.constraint_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and (
    (ccu.table_schema = 'auth' and ccu.table_name = 'users')
    or (ccu.table_schema = 'public' and ccu.table_name = 'perfiles')
  )
order by tc.table_name, kcu.column_name;
```

2. Pegá el resultado **completo** en `SECURITY.md` (incluye `perfiles`, `documentos`, `contratos` si aparecen).
3. Para cada FK (excepto la excepción de `aceptaciones_legales`):
   - si debe borrarse con la cuenta y `delete_rule <> 'CASCADE'` → migración a CASCADE **o** DELETE explícito en la Edge Function antes de `deleteUser`;
   - si es `SET NULL` y está bien (ej. `moderado_por`) → dejarlo.
4. Para `aceptaciones_legales`: implementar **anonimización**, no cascade-delete de la evidencia.
5. **Storage** no tiene FK: borrar `documentos/{userId}/**` y avatar del user **antes** del delete de Auth.
6. Implementar **Export** (JSON/ZIP de datos propios).
7. Implementar **Delete** con confirmación fuerte:
   - JWT del caller; nunca `user_id` del body;
   - orden: anonimizar aceptaciones → purge Storage → borrar/ajustar filas según inventario vivo → `auth.admin.deleteUser(caller.id)`.
8. Actualizar `privacidad.md` con el flujo self-service + retención de evidencia de consentimiento.

### Cómo verificar
1. Export OK.  
2. Delete: no login; storage vacío; **filas de `aceptaciones_legales` siguen existiendo anonimizadas**.  
3. Otra cuenta intacta.  
4. Inventario vivo de FKs + decisión por tabla en `SECURITY.md`.

### Evidencia: ___

---

# BLOQUE C — 30 días (P2)

## Tarea C1 · Sentry + audit log
**Tipo:** 🛠️ · **Estado:** [ ]  
Sentry + tabla `audit_events` (actor, acción, target, ip, created_at).  
### Evidencia: ___

## Tarea C2 · Cifrado de columna RUT
**Tipo:** 🛠️ · **Estado:** [ ]  
Vault/pgcrypto para RUT (disco cifrado ≠ columna cifrada).  
### Evidencia: ___

## Tarea C3 · Captcha en login + Formspree
**Tipo:** 🛠️ · **Estado:** [ ]  
Captcha en login y/o contacto.  
### Evidencia: ___

## Tarea C4 · PITR + restore de prueba
**Tipo:** ✅/📋 · **Estado:** [ ]  
PITR, RPO/RTO, un restore a staging.  
### Evidencia: ___

## Tarea C5 · DPA / URCDP / OAuth scopes
**Tipo:** 📋 · **Estado:** [ ]  
DPA Supabase/Vercel; URCDP; scopes Google mínimos.  
### Evidencia: ___

---

# BLOQUE D — Verificación live rápida
**Tipo:** ✅ · 10 min · **Estado:** [ ]

```powershell
$r = Invoke-WebRequest -Uri "https://www.orvalya.com" -Method Head -UseBasicParsing
$r.Headers['Strict-Transport-Security']
$r.Headers['Content-Security-Policy']
$r.Headers['X-Frame-Options']
$r.Headers['X-Content-Type-Options']
```

Esperado: HSTS, CSP, `DENY`, `nosniff`.

### Evidencia: ___

---

# Tablero del día

Hoy solo: **A__ / B__ / C__**

- [ ] Leí estado actual + qué es  
- [ ] Hice los pasos  
- [ ] Verifiqué  
- [ ] Pegué evidencia en `docs/SECURITY.md`  
- [ ] Marqué la tarea  
- [ ] Paré

---

# Orden estricto

```
A0 → A1 → A2 → A3 → A4 → A5 → B1 → B2 → B3 → B4 → C1 → C2 → C3 → C4 → C5 → D
```

- Una sola cosa hoy: **A0** o **A1**.  
- 20 minutos: **A0** o **A4**.

---

# Changelog de esta versión (v3)

1. Rate limit de notificaciones: solo Postgres; doble límite por `llamado_id` y por `user_id` (sin memoria/Redis).  
2. Nota `verify_jwt`: ownership sigue obligatorio aunque `verify_jwt = true`.  
3. B4: FKs vía `information_schema` en vivo; nunca “confiar” en cascade de migraciones.  
4. `Evidencia: ___` al final de cada tarea.  
5. **Agregado A:** declarar las 3 functions en `config.toml`; `avisos-documentos` según cómo autentica el cron (documentar en `SECURITY.md`).  
6. **Agregado B:** investigar headers/Bearer del cron a `avisos-documentos` (¿funciona o falla en silencio?).  
7. **Agregado C:** A3 = decisión de producto con founder; el `024` es intencional.  
8. **Agregado D:** inventario FK obligatorio en BD live.  
9. **Agregado E:** `aceptaciones_legales` se anonimiza; no se borra con la cuenta.

*Este archivo solo planifica. No implementa código hasta que lo pidas.*
