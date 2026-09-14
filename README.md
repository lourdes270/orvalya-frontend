# Orvalya

## Qué es

Orvalya es el mercado de servicios de Uruguay donde cualquier persona o empresa con una necesidad encuentra prestadores — desde monotributistas formales con años de clientes hasta personas que recién arrancan y aún no se formalizaron. El foco es marketplace + legajo documental (DGI, BPS, BSE) con avisos de vencimiento.

**URL producción:** https://www.orvalya.com

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + TypeScript |
| Routing híbrido | **Next.js 16** (páginas públicas/SEO) + **React Router** (SPA interna) |
| Backend/DB | **Supabase** (Auth, Postgres, Storage, Edge Functions) |
| PDF | jsPDF (presentación comercial del perfil) |
| Captcha | hCaptcha |
| Contacto | Formspree |
| Deploy | Vercel |
| Tests | Playwright (E2E) |

---

## Rutas y páginas

### Públicas (Next.js — SEO)

| Ruta | Qué hace |
|------|----------|
| `/` | Landing principal |
| `/como-funciona` | Explicación del producto |
| `/quienes-somos` | Sobre Orvalya |
| `/prestadores` | Listado de prestadores |
| `/prestadores/[slug]` | Perfil público de prestador |
| `/prestadores/rubro/[rubro]` | Filtro por rubro |
| `/prestadores/zona/[zona]` | Filtro por zona |
| `/llamados` | Listado de llamados de trabajo |
| `/llamados/[slug]` | Detalle de llamado |
| `/terminos` | Términos de Servicio |
| `/privacidad` | Política de Privacidad |
| `/sitemap.xml`, `/robots.txt` | SEO |

### App autenticada (React Router SPA)

| Ruta | Qué hace |
|------|----------|
| `/auth` | Login + registro (email y Google) |
| `/auth/restablecer-contrasena` | Reset de contraseña |
| `/onboarding` | Registro guiado (4 pasos) |
| `/dashboard` | Panel principal (prestador o contratante) |
| `/contratante/perfil` | Perfil de empresa contratante |
| `/contacto/contratante` | Formulario de contacto (Formspree) |
| `/aceptar-terminos` | Aceptación legal post-login |
| `/admin/moderacion` | Panel admin (moderación) |

---

## Flujos de usuario

### Prestador (independiente / mono / unipersonal)

1. **Onboarding** (4 pasos):
   - Paso 0: Tipo de perfil
   - Paso 1: Rubros/servicios que ofrece
   - Paso 2: Datos básicos (nombre, zona, teléfono, WhatsApp)
   - Paso 3: Situación fiscal (DGI, BPS, BSE)
   - Paso 4: Registro (email + contraseña + captcha)
2. **Dashboard prestador:**
   - Perfil público (descripción, tarifa, disponibilidad)
   - Subida de documentos: **Certificado DGI**, **Certificado BPS**, **Constancia BSE**
   - Semáforo de vencimientos
   - Descarga de **PDF de presentación comercial**
   - Avatar y datos de contacto
3. Aparece en búsquedas públicas por rubro/zona

### Contratante (persona o empresa con una necesidad)

1. Onboarding simplificado (tipo contratante)
2. **Dashboard contratante:**
   - Completar perfil
   - **Publicar llamados** de servicio (título, descripción, rubro, zona, vencimiento)
   - Editar / reenviar llamados
3. Contacto vía Formspree (temporal; ver huecos conocidos)

### Admin

- Moderación de perfiles y contenido (`/admin/moderacion`)

---

## Backend (Supabase)

### Migraciones

Incluyen perfiles, documentos con versionado, RLS (aislamiento por usuario), rate limiting en registro, llamados de contratantes, RPCs para listados públicos (prestadores, llamados), avisos de vencimiento de documentos, grants y hardening de seguridad.

### Edge Functions

| Función | Propósito |
|---------|-----------|
| `verify-captcha` | Validación hCaptcha en registro |
| `notificar-llamado` | Notificación al publicar llamado |
| `avisos-documentos` | Alertas de vencimiento de docs |

---

## Seguridad implementada

- HTTPS (Vercel)
- Supabase Auth (passwords hasheadas)
- Row Level Security (RLS) en DB
- Rate limiting en registro
- CSP headers (Content Security Policy)
- hCaptcha anti-bots
- Aceptación legal obligatoria (términos + privacidad)

---

## Legal

- Términos de Servicio completos (responsabilidad, disponibilidad, uso fraudulento)
- Política de Privacidad
- Disclaimer en documentos: *"Documento declarado por el prestador. Orvalya no verifica su autenticidad."*
- Generación automática de legal: `npm run legal:gen`

---

## Huecos conocidos (honestidad técnica)

- El flujo de postulación a llamados está por construirse: hoy publicar un llamado notifica, pero no hay mecanismo para que prestadores se postulen ni para que el contratante elija. El contacto actual vía Formspree es temporal.
- La remediación de seguridad está en ejecución: ver `docs/SECURITY.md` y el plan paso a paso en `docs/`.
- Sin analytics, sin error tracking (Sentry), backups por documentar.

---

## Lo que NO tenés (todavía)

- Facturación / invoices / CFE
- Flujo de postulación/matching (en diseño)
- Analytics (PostHog, GA, etc.)
- Error tracking (Sentry)
- Planes de pago / free tier con límites
- Backup DB documentado
- Email de contacto público fijo (solo "canales en orvalya.com")

---

## Cómo correrlo local

```bash
# Variables en .env (prefijo VITE_*) — no commitear secretos
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_HCAPTCHA_SITE_KEY=
VITE_FORMSPREE_CONTRATANTE_URL=
SITE_URL=https://www.orvalya.com

npm install
npm run dev        # Next.js en localhost:3000
npm run dev:vite   # Alternativa Vite (legacy)
npm run build      # Build producción
npm run test:e2e   # Tests Playwright
```

---

## Estructura del repo

```
orvalya-frontend/
├── app/              # Páginas Next.js (públicas, SEO)
├── src/
│   ├── vistas/       # Pantallas SPA (auth, dashboard, onboarding, admin)
│   ├── contexts/     # AuthContext
│   ├── lib/          # Helpers, Supabase client, SEO
│   ├── hooks/        # Custom hooks
│   └── content/legal/ # Markdown legal → TS generado
├── supabase/
│   ├── migrations/   # Migraciones SQL
│   └── functions/    # Edge Functions
├── docs/             # Seguridad, planes y notas
├── public/           # Assets estáticos
├── tests/e2e/        # Playwright
└── scripts/          # Generador legal, verify-crud, cleanup
```
