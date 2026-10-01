# ORVALYA — PLAN MAESTRO Y CONTEXTO PARA CUALQUIER IA
> Fecha: 14 sep 2026 · Versión 1
> INSTRUCCIÓN PARA CUALQUIER ASISTENTE DE IA: leé este archivo COMPLETO antes de
> tocar código, proponer features o hacer auditorías. Describe el producto real,
> la visión acordada, el estado verificado del código y las reglas de trabajo.
> No asumas nada que contradiga este documento: si el código difiere, reportá la
> diferencia en vez de maquillarla.

---

## 1. QUÉ ES ORVALYA (visión acordada, corregida)

Orvalya es el mercado de servicios de Uruguay donde **cualquier persona o
empresa con una necesidad** encuentra prestadores de confianza — desde
monotributistas formales con años de clientes hasta personas que recién
arrancan y aún no se formalizaron.

- DEMANDA: cualquiera con una necesidad (la señora que necesita una limpiadora,
  el vecino con la cañería rota, LA EMPRESA que necesita compliance). NO es
  solo B2B.
- OFERTA: todos los niveles de formalización (informal entrando, monotributista
  formal, unipersonal, pyme chica, freelancer).
- Insight central: "te formalizás y tenés que tener plata para pagar" → la
  rampa correcta es: primero conseguir clientes y facturar, DESPUÉS formalizar
  con las herramientas de Orvalya (legajo DGI/BPS/BSE + avisos de vencimiento).
- Perfiles de trabajos reales, NO CVs (la oferta es gente de acción: limpiadores,
  plomeros, pintores — no usuarios de LinkedIn).
- Publicar una necesidad debe ser tan fácil como publicar en MercadoLibre.

### FUERA DE SCOPE (decisión de founder, 14 sep 2026)
Facturación / CFE / emisor-receptor-ítems: es OTRO producto. No construir.

### Muro norte: los primeros 50 usuarios
Validar el match prestador↔contratante antes de cobrar. Incentivo: primeros 100
prestadores gratis para siempre + alertas de llamados de su rubro.

---

## 2. ESTADO VERIFICADO DEL CÓDIGO (14 sep 2026, lectura directa del repo)

### Seguridad — confirmado con archivo/línea
- CRÍTICO: sesión JWT en localStorage (src/lib/supabase.ts, createClient con
  persistencia por defecto). Plan: migrar a @supabase/ssr cookies httpOnly.
- ALTO: notificar-llamado sin ownership ni rate limit (index.ts: body L64-67,
  service role L69-70, cero validación). SOLO avisa a ADMINS (moderación).
- ALTO: avisos-documentos fail-open (L71-78: valida solo si el env existe).
- ALTO: verify_jwt declarado solo para verify-captcha=false en config.toml.
- ALTO: trigger 024 republica rechazados→activo (INTENCIONAL, decisión de
  producto a revisar con founder: debería ir a pendiente_moderacion).
- config.toml tiene [auth.rate_limit] sign_in_sign_ups=5 (local; confirmar en
  Dashboard para prod).

### Hallazgos de producto (del código, no de resúmenes)
- H1 PUERTA FALSA: el botón "Postularme a este llamado" (app/llamados/[slug]/
  page.tsx L213-231) es un Link a /auth. No existe tabla ni flujo de postulación.
- H2 FUNCIÓN MUERTA: avisos-documentos NUNCA es invocada en el repo (sin cron
  ni Action). Los emails de vencimiento probablemente jamás se enviaron.
- H3: notificar-llamado solo avisa a admins; prestadores no reciben nada.
- H4: registro de contratante exige nombre_empresa (ContratantePerfilPage L53)
  → una persona común no puede registrarse sin inventarse una empresa.

### Sólido (no rehacer)
24 migraciones con RLS real; arquitectura híbrida Next.js (público/SEO) + SPA
interna (defendible: SEO = canal de adquisición); legal versionado con
generador legal:gen; semáforo de vencimientos en dashboard; Playwright E2E;
hCaptcha + rate limit en registro; aceptaciones legales inmutables.

---

## 3. PLAN DE FASES (una a la vez; definición de "terminada" por fase)

FASE 1 — Blindaje P0 (sem 1-2): plan de seguridad en docs/plan-seguridad-
paso-a-paso.md (v3). A0→A5. Terminada cuando: tests de A1 verificados +
evidencia en docs/SECURITY.md.
FASE 2 — Loop mínimo (sem 3-4): tabla postulaciones + RLS + botón real +
bandeja contratante + email. Terminada cuando: A publica, B se postula, A elige.
Después: contratante tipo "persona" (H4).
FASE 3 — SEO (sem 5-6): metadata dinámica por rubro/zona, JSON-LD
(Service/LocalBusiness/FAQ), sitemap dinámico (prestadores+llamados), 4-6
guías de formalización (RUPE, monotributo, certificado BPS), llamados estatales
manuales (10/sem desde el RSS oficial) como contenido indexable.
FASE 4 — Imán de prestadores (sem 7+): grupos de FB, ferias, cámaras MIPYMES,
municipios. Oferta: primeros 100 gratis para siempre + alertas. Revivir
avisos-documentos con cron real (Supabase Scheduled Functions, fail-closed).

### Compras Estatales (ARCE) — validado y con reglas
Datos oficiales abiertos: RSS + XML estándar Open Contracting. NO scrapear HTML.
Usar como imán de prestadores FORMALES y contenido SEO, NO como revenue
(los tenders se ganan en el portal ARCE). REGLAS: etiquetar "Fuente:
comprasestatales.gub.uy — respondé en el portal oficial"; link y atribución
siempre; disclaimer de verificación; NUNCA logos ni aval estatal; diferenciar
visualmente de llamados privados de Orvalya. Ley 18.381 respalda la publicidad.
Diferenciador vs Gubly/Tenderis/iaLicitaciones: Orvalya = marketplace + legajo
+ "te mantiene el RUPE activo" (aviso de vencimientos DGI/BPS).

---

## 4. REGLAS DE TRABAJO CON IA (aprendidas, no negociables)

1. La IA propone → explica línea por línea → la persona verifica con tests
   reales (curl, dos cuentas, DevTools). La IA escribe; la persona comprueba.
2. Nunca aplicar código que la persona no pueda explicar con sus palabras.
3. Una tarea por sesión. Rama por fix. Evidencia en docs/SECURITY.md.
4. "Nunca confíes en el cliente": toda validación crítica va en servidor.
5. Fail-closed siempre que se custodien datos de terceros.
6. El código real manda: si difiere del plan/auditoría, reportar la diferencia.
7. Si la persona está trabada 15 minutos: parar y pedir ayuda puntual.
8. Diario de aprendizaje: APRENDIZAJE.md (qué toqué / qué significa / sorpresa).
9. TDAH: una sola fase a la vez; "si solo tenés energía para una cosa: A1".

## 5. DOCUMENTOS HERMANOS EN ESTE REPO
- docs/plan-seguridad-paso-a-paso.md — plan TDAH-friendly v3 (ejecutable)
- docs/SECURITY.md — evidencia de remediación (crear en A0)
- docs/auditoria-seguridad-orvalya-ejecutivo.md — informe ejecutivo sep 2026
- VISION.md — crear a partir de la sección 1 de este archivo
