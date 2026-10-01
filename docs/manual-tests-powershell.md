# MANUAL DE TESTS DE SEGURIDAD — Orvalya (PowerShell)
> Versión 1.0 · 1 oct 2026 · Para usar SIN ayuda externa
> Qué testea: la Edge Function notificar-llamado (Tarea A1) y cualquier otra función.
> Principio: testear por PowerShell = hablarle al servidor como un atacante (sin navegador).

--------------------------------------------------------------------------------
0. PREPARACIÓN (una sola vez por sesión de testing)
--------------------------------------------------------------------------------
Abrí PowerShell y definí las variables (pegá estas 2 líneas y completá):

    $apikey = "sb_publishable_rM2HTXsesAoMfNEH94bVsw_kLuh9zlR"
    $url = "https://msgfcxnqujgvkxrzkbsw.supabase.co/functions/v1/notificar-llamado"

¿Cómo conseguir un TOKEN de usuario (para los tests que necesitan "ser alguien")?
1. Entrá a orvalya.com y logueate con la cuenta de prueba (A o B).
2. Apretá F12 (herramientas de desarrollador) → pestaña "Application" (Aplicación).
3. En el menú izquierdo: Storage → Local Storage → https://www.orvalya.com.
4. Buscá la clave que empieza con "sb-" y dice "auth-token"; adentro está
   "access_token". Copiá ese valor largo que empieza con eyJ...
5. En PowerShell:
       $token = "eyJ....(pegá acá el token)..."
6. IMPORTANTE: el token vence (1 hora). Si un test que antes andaba da 401,
   es que se venció: sacá uno nuevo del navegador.

Códigos que vas a ver y qué significan:
  200 = OK (caso feliz)        404 = no existe el llamado
  401 = sin identidad          429 = rate limit (freno de abuso)
  403 = identidad válida pero NO sos el dueño

--------------------------------------------------------------------------------
TEST 1 — Sin token: tiene que dar 401  (✅ YA APROBADO el 1/10)
--------------------------------------------------------------------------------
    try { Invoke-WebRequest -Uri $url -Method Post -Body '{"llamado_id":"x"}' -ContentType "application/json" -Headers @{apikey=$apikey} | Select-Object StatusCode } catch { $_.Exception.Response.StatusCode.value__ }

Esperado: 401. Si da otra cosa, la función no está chequeando identidad.

--------------------------------------------------------------------------------
TEST 2 — Con token pero llamado que no existe: 404
--------------------------------------------------------------------------------
    try { Invoke-WebRequest -Uri $url -Method Post -Body '{"llamado_id":"00000000-0000-0000-0000-000000000000"}' -ContentType "application/json" -Headers @{apikey=$apikey; Authorization="Bearer $token"} | Select-Object StatusCode } catch { $_.Exception.Response.StatusCode.value__ }

Esperado: 404 ("llamado no encontrado"). Si da 200 o 500, algo anda mal:
llegaste al final sin que el llamado existiera.

--------------------------------------------------------------------------------
TEST 3 — Ownership: cuenta B intenta notificar un llamado de la cuenta A → 403
--------------------------------------------------------------------------------
Necesitás el id de un llamado que sea de la cuenta A:
    # En el SQL Editor de Supabase:
    select id, titulo from public.llamados order by created_at desc limit 5;
Copiá un id y pegalo:
    $llamadoDeA = "UUID-QUE-SALIO-EN-LA-QUERY"

Ahora logueate en el navegador como CUENTA B, sacá su token (paso 0) y:
    $tokenB = "eyJ....token de la cuenta B...."
    try { Invoke-WebRequest -Uri $url -Method Post -Body "{`"llamado_id`":`"$llamadoDeA`"}" -ContentType "application/json" -Headers @{apikey=$apikey; Authorization="Bearer $tokenB"} | Select-Object StatusCode } catch { $_.Exception.Response.StatusCode.value__ }

Esperado: 403 (Prohibido). Este es EL test de la autorización: identidad válida,
pero el llamado no es suyo. Si da 200 = un usuario puede disparar notificaciones
de llamados ajenos = vulnerabilidad.

--------------------------------------------------------------------------------
TEST 4 — Caso feliz: el dueño notifica su propio llamado → 200
--------------------------------------------------------------------------------
    $tokenA = "eyJ....token de la cuenta dueña del llamado...."
    try { Invoke-WebRequest -Uri $url -Method Post -Body "{`"llamado_id`":`"$llamadoDeA`"}" -ContentType "application/json" -Headers @{apikey=$apikey; Authorization="Bearer $tokenA"} | Select-Object StatusCode } catch { $_.Exception.Response.StatusCode.value__ }

Esperado: 200 y los admins reciben el email de notificación (revisá la bandeja).
OJO: este test gasta 1 envío de Resend. Está bien, es producción de verdad.

--------------------------------------------------------------------------------
TEST 5 — Rate limit por llamado: 2° aviso del mismo llamado → 429
--------------------------------------------------------------------------------
Corré el TEST 4 DOS VECES SEGUIDAS (el mismo llamado, mismo token, dentro de
15 minutos). La segunda tiene que dar:

Esperado: 429 (rate_limit_exceeded). El primero pasó, el segundo frenó.

--------------------------------------------------------------------------------
TEST 6 — Rate limit por usuario (simulado con SQL, sin crear 10 llamados)
--------------------------------------------------------------------------------
En el SQL Editor de Supabase, simulá que la cuenta A ya mandó 10 avisos en la
última hora (insertamos 10 filas "de mentira"):

    insert into public.notificar_llamado_attempts (user_id, llamado_id, attempted_at)
    select 'UUID-DE-LA-CUENTA-A', id, now() - (random() * interval '30 minutes')
    from public.llamados limit 10;

    (Para saber el UUID de la cuenta A: select id, email from auth.users;)

Después, con el token de A, llamá la función con un llamado cualquiera distinto:

    try { Invoke-WebRequest -Uri $url -Method Post -Body "{`"llamado_id`":`"OTRO-UUID`"}" -ContentType "application/json" -Headers @{apikey=$apikey; Authorization="Bearer $tokenA"} | Select-Object StatusCode } catch { $_.Exception.Response.StatusCode.value__ }

Esperado: 429 (aunque el llamado sea nuevo y nunca notificado: el límite es por
USUARIO). Si da 200, el límite por usuario no funciona.

--------------------------------------------------------------------------------
LIMPIEZA (después de testear)
--------------------------------------------------------------------------------
Borrar los attempts simulados y dejar todo prolijo:
    delete from public.notificar_llamado_attempts where attempted_at > now() - interval '2 hours';
Si creaste llamados de prueba para testear, borralos desde la app o:
    delete from public.llamados where titulo like '%prueba%';

--------------------------------------------------------------------------------
EVIDENCIA (para docs/SECURITY.md — siempre, es la regla del plan)
--------------------------------------------------------------------------------
Anotá en SECURITY.md bajo "Tarea A1":
| Test | Fecha | Esperado | Resultado | Estado |
| 1 sin token | ___ | 401 | ___ | PASS/FAIL |
| 2 llamado inexistente | ___ | 404 | ___ | |
| 3 ownership (B sobre A) | ___ | 403 | ___ | |
| 4 caso feliz dueño | ___ | 200 | ___ | |
| 5 rate por llamado | ___ | 429 | ___ | |
| 6 rate por usuario | ___ | 429 | ___ | |

Cuando los 6 digan PASS → A1 completa → marcá [x] en el plan + commit.

--------------------------------------------------------------------------------
PROBLEMAS FRECUENTES
--------------------------------------------------------------------------------
- "401 de repente en todos lados" → el token venció; sacá uno nuevo.
- "404 como antes de deployear" → la función vieja sigue corriendo; falta
  `supabase functions deploy notificar-llamado`.
- PowerShell rompe con comillas en el body → usá las comillas con tilde
  invertida como en los tests 3-6 (`"), o armá el body así:
      $body = @{ llamado_id = "UUID" } | ConvertTo-Json
