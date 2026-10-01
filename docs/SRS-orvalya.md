# ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)
## Proyecto: Orvalya — Plataforma de intermediación de servicios
### Versión 1.0 · 23 de septiembre de 2026 · Basado en ISO/IEC/IEEE 29148 (formato simplificado)
Documento: docs/SRS-orvalya.md · Autor: Lourdes M. (Fundadora / Analista funcional)
Estado: Aprobado para desarrollo · Historial de cambios: ver tabla al final

--------------------------------------------------------------------------------
1. INTRODUCCIÓN
--------------------------------------------------------------------------------
1.1 Propósito
Especificar los requerimientos funcionales y no funcionales del sistema Orvalya
para servir de baseline de desarrollo, pruebas y aceptación. Destinatarios:
equipo de desarrollo, QA, stakeholders y auditores.

1.2 Alcance del documento
Cubre el MVP (release 1.0): marketplace con legajo documental y avisos de
vencimiento. Fuera de alcance: facturación electrónica (CFE), agendamiento,
aplicación móvil nativa (ver §7).

1.3 Definiciones, acrónimos y abreviaturas
- RLS: Row Level Security (aislamiento de datos por usuario en Postgres)
- ARCO: Acceso, Rectificación, Cancelación y Oposición (Ley 18.331)
- MVP: Producto Mínimo Viable
- UC: Caso de Uso; RF: Requerimiento Funcional; RNF: Requerimiento No Funcional

1.4 Referencias
- docs/PRD.md (definición de producto y roadmap)
- docs/plan-seguridad-paso-a-paso.md (requisitos de seguridad detallados)
- Ley 18.331 (Protección de Datos Personales, Uruguay)

--------------------------------------------------------------------------------
2. DESCRIPCIÓN GENERAL
--------------------------------------------------------------------------------
2.1 Perspectiva del producto
Sistema web (SPA + páginas públicas SSR) que conecta prestadores de servicios
independientes con personas y empresas contratantes. Backend gestionado
(Supabase: Postgres, Auth, Storage, Edge Functions). Frontend desplegado en Vercel.

2.2 Funciones del producto (resumen)
a) Gestión de cuentas (prestador, contratante persona, contratante empresa, admin)
b) Publicación y postulación de llamados de servicio
c) Legajo documental con vencimientos y notificaciones automáticas
d) Moderación de contenido
e) Cumplimiento ARCO (exportación y eliminación de cuenta)

2.3 Características de los usuarios (actores)
| ID | Actor | Formación técnica | Rol en el sistema |
|----|-------|-------------------|-------------------|
| A1 | Prestador informal | Baja | Oferta servicios; completa legajo |
| A2 | Prestador formal (monotributista/unipersonal) | Media | Oferta servicios; mantiene RUPE al día |
| A3 | Persona contratante | Baja | Publica necesidades; elige postulante |
| A4 | Empresa contratante | Media | Publica necesidades; exige compliance doc. |
| A5 | Administrador | Alta | Moderación, gestión de calidad |

2.4 Suposiciones y dependencias
- Los usuarios acceden con navegador moderno y correo electrónico válido.
- Supabase y Vercel mantienen disponibilidad (SLA de terceros).
- Los documentos fiscales son DECLARADOS por el prestador; el sistema no
  verifica autenticidad ante DGI/BPS/BSE (disclaimer publicado).

--------------------------------------------------------------------------------
3. REQUERIMIENTOS ESPECÍFICOS
--------------------------------------------------------------------------------
3.1 Requerimientos funcionales

| ID | Requerimiento | Prioridad | UC asociado |
|----|---------------|-----------|-------------|
| RF-01 | El sistema debe permitir registro con email/contraseña y Google OAuth, con captcha anti-bot | Alta | UC-01, UC-02 |
| RF-02 | El sistema debe registrar la aceptación de términos y privacidad por versión, de forma inmutable | Alta | UC-01, UC-02 |
| RF-03 | El prestador debe poder cargar documentos (DGI, BPS, BSE) con declaración jurada obligatoria | Alta | UC-03 |
| RF-04 | El sistema debe generar avisos de vencimiento a los 30, 15, 7, 0 y -1 días (canal in-app y email) | Alta | UC-04 |
| RF-05 | El contratante debe poder publicar llamados (título, descripción, rubro, zona, vencimiento) | Alta | UC-05 |
| RF-06 | El prestador autenticado debe poder postularse a llamados vigentes con un mensaje breve | Alta | UC-06 |
| RF-07 | El sistema debe notificar al contratante por email ante cada nueva postulación | Alta | UC-07 |
| RF-08 | El contratante debe visualizar las postulaciones recibidas y revelar datos de contacto al elegir | Alta | UC-07 |
| RF-09 | El usuario debe poder exportar sus datos personales en formato estructurado (JSON/ZIP) | Alta | UC-08 |
| RF-10 | El usuario debe poder eliminar su cuenta; las evidencias de consentimiento se anonimizan, no se borran | Alta | UC-09 |
| RF-11 | El administrador debe poder aprobar/rechazar perfiles y llamados desde panel de moderación | Media | UC-10 |
| RF-12 | El sistema debe notificar a prestadores cuyo rubro y zona coincidan con un llamado nuevo | Media (fase 2) | UC-05 |

3.2 Requerimientos no funcionales
| ID | Categoría | Requerimiento | Referencia |
|----|-----------|---------------|------------|
| RNF-SEG-01 | Seguridad | Sesión en cookies httpOnly (nunca localStorage); migración a @supabase/ssr | B1 del plan |
| RNF-SEG-02 | Seguridad | Toda Edge Function debe validar identidad y autorización (ownership) del llamante; rate limit en funciones expuestas | A1 |
| RNF-SEG-03 | Seguridad | Configuración fail-closed: ausencia de secret/config implica denegar | A2 (implementado) |
| RNF-SEG-04 | Seguridad | RLS habilitado en 100% de tablas con datos de usuario; verificación con dos cuentas | A5 |
| RNF-SEG-05 | Compliance | Cumplimiento Ley 18.331: ARCO self-service, consentimientos inmutables, políticas publicadas | B4 |
| RNF-SEG-06 | Continuidad | PITR (Point-in-Time Recovery) activo antes de crecimiento de usuarios; restore probado | C4 |
| RNF-SEO-01 | SEO | Páginas públicas indexables con metadata dinámica (rubro/zona) y sitemap.xml | Fase 3 |
| RNF-PERF-01 | Rendimiento | Respuesta p95 < 2s en listados públicos; assets comprimidos | Fase 3 |
| RNF-01 | Disponibilidad | Uptime objetivo 99% (depende de Vercel/Supabase) | — |

3.3 Requerimientos de interfaces
- INT-01: Interfaz web responsive (desktop y móvil), español es-UY.
- INT-02: Integración Supabase Auth (email + Google OAuth).
- INT-03: Integración Resend (envío transaccional) mediante Edge Functions.
- INT-04: Integración hCaptcha (registro y formularios públicos).

--------------------------------------------------------------------------------
4. CASOS DE USO EXTENDIDOS (selección)
--------------------------------------------------------------------------------
Formato: precondición / flujo principal / flujos alternos / postcondición.

UC-06: Postularse a llamado (ACTOR: A1/A2) — RF-06
  Precondición: prestador autenticado con perfil completo; llamado en estado activo.
  Flujo principal:
    1. El prestador visualiza el detalle del llamado.
    2. Selecciona "Postularme", redacta mensaje breve (<= 500 caracteres).
    3. El sistema registra la postulación (llamado_id, prestador_id, mensaje, timestamp).
    4. El sistema notifica por email al contratante (RF-07).
  Flujos alternos:
    2a. Llamado cerrado/vencido: el sistema inhabilita el botón.
    3a. Postulación duplicada: el sistema informa "ya te postulaste" (idempotencia).
  Postcondición: postulación registrada en estado "recibida"; contador visible
  para el contratante.

UC-08/09: Exportar / Eliminar cuenta (ACTOR: cualquier autenticado) — RF-09/10
  Precondición: usuario autenticado.
  Flujo principal:
    1. Usuario solicita exportación desde configuración.
    2. El sistema genera archivo JSON/ZIP con perfil, metadata documental y aceptaciones.
    3. Para eliminación: el sistema exige confirmación (escribir "ELIMINAR").
    4. El sistema anonimiza aceptaciones_legales (conserva evidencia, remueve PII),
       purga archivos del usuario en Storage, elimina filas personales y la cuenta de Auth.
  Flujos alternos: 4a. Falla parcial: rollback y notificación al admin.
  Postcondición: cuenta inaccesible; evidencias de consentimiento anonimizadas persisten.

--------------------------------------------------------------------------------
5. MATRIZ DE TRAZABILIDAD (extracto)
--------------------------------------------------------------------------------
RF-06 -> UC-06 -> Pruebas: E2E postulación (Playwright) -> Evidencia: SECURITY.md/QA
RF-04 -> UC-04 -> Pruebas: test end-to-end pg_cron -> Evidencia: net._http_response 23/09
RNF-SEG-03 -> A2 -> Verificación: llamada sin header x-cron-secret => 401

--------------------------------------------------------------------------------
6. CRITERIOS DE ACEPTACIÓN DEL MVP (release 1.0)
--------------------------------------------------------------------------------
AC-01: Un prestador real puede registrarse, cargar legajo y recibir aviso de
        vencimiento por email (ya demostrado el 23/09/2026).
AC-02: Dos usuarios de prueba completan el ciclo: publicar -> postular -> elegir.
AC-03: RLS verificado: usuario A no accede a datos de usuario B (test con dos cuentas).
AC-04: Exportar y eliminar cuenta funcionan en ambiente de staging con datos de prueba.
AC-05: Auditoría externa de caja blanca sin hallazgos críticos abiertos.

--------------------------------------------------------------------------------
7. APÉNDICE
--------------------------------------------------------------------------------
7.1 Fuera de alcance (v1): facturación/CFE, pagos en línea, agendamiento de turnos,
    app móvil nativa, modelo dimensional analítico (ver fase post-lanzamiento).
7.2 Historial de cambios
| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| 1.0 | 23/09/2026 | L. Mendaro | Versión inicial del SRS |

Nota metodológica: en entornos Agile, cada RF/UC se descompone en historias de
usuario con criterios de aceptación (Given/When/Then) en el backlog (Jira).
Este SRS sirve como baseline contractual; el backlog como planificación operativa.
