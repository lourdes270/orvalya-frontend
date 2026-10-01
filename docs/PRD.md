# ORVALYA — PRD v1 (Product Requirements Document)
> Documento vivo. Fecha: 23 sep 2026. Vive en el repo (docs/PRD.md).
> Cualquier IA que trabaje en el repo: leer este documento ANTES de proponer features.
> Regla: si una feature no está aquí, no se construye hasta que la founder la agregue.

## 1. Problema
En Uruguay, quien necesita un servicio (limpieza, plomería, pintura, etc.) no tiene
un lugar confiable para encontrar prestadores. Y los prestadores —especialmente los
informales— no tienen rampa de entrada: para formalizarse necesitan plata, y para
tener plata necesitan clientes. El orden correcto es: primero clientes, después
formalización. Orvalya es esa rampa.

## 2. Visión (resumen)
Mercado de servicios donde CUALQUIERA con una necesidad contrata, y donde el
prestador —del informal al monotributista formal— encuentra clientes y herramientas
de formalización (legajo DGI/BPS/BSE + avisos de vencimiento).
Ver VISION.md para la versión completa.

## 3. Actores
| Actor | Descripción | Necesidad principal |
|---|---|---|
| Prestador informal | Recién arranca, sin formalizar | Clientes primero; formalización después |
| Prestador formal (mono/unipersonal) | Ya factura; quiere venderle también al Estado (RUPE) | Clientes + mantener documentación al día (RUPE activo) |
| Persona contratante | Cualquier persona con una necesidad (limpieza del hogar, arreglo) | Encontrar alguien confiable, fácil |
| Empresa contratante (pyme) | Contrata servicios recurrentes | Prestadores + compliance (docs al día) |
| Admin (Orvalya) | Moderación, calidad | Moderar perfiles y llamados |

## 4. Casos de uso principales (v1)
- UC-01: Registro de prestador (email/Google + captcha + onboarding 4 pasos + legajo)
- UC-02: Registro de contratante (persona O empresa — hoy solo empresa, ver H4)
- UC-03: Prestador sube documentos (DGI/BPS/BSE) con declaración jurada
- UC-04: Sistema avisa vencimientos (in-app + email; umbrales 30/15/7/0/-1 días) ✅ FUNCIONA
- UC-05: Contratante publica llamado (MercadoLibre-fácil: título, rubro, zona, vencimiento)
- UC-06: Prestador se POSTULA a un llamado ← **NO EXISTE (H1: puerta falsa)** — prioridad P0 producto
- UC-07: Contratante recibe postulaciones y elige ← NO EXISTE — prioridad P0 producto
- UC-08: Exportar mis datos (ARCO) ← NO EXISTE — prioridad legal (B4)
- UC-09: Eliminar mi cuenta (ARCO) ← NO EXISTE — prioridad legal (B4)
- UC-10: Admin modera perfiles/llamados (panel /admin/moderacion) ✅

## 5. Requerimientos funcionales (extraídos de los casos de uso)
- RF-01: El registro exige captcha + aceptación de términos versionada (auditable).
- RF-02: Cada prestador tiene perfil público indexable (SEO): /prestadores/[slug].
- RF-03: Cada llamado publicado notifica a admins (moderación) ✅ y a futuro a
  prestadores matcheados por rubro+zona (RF-07).
- RF-04: El semáforo de vencimientos se muestra en el dashboard del prestador ✅.
- RF-05: Las notificaciones de vencimiento se envían por email automáticamente ✅.
- RF-06: La postulación registra: llamado_id, prestador_id, mensaje, fecha, estado.
- RF-07 (fase 2): Notificación a prestadores matcheados (rubro+zona) al publicarse llamado.
- RF-08: El contratante ve bandeja de postulaciones con datos de contacto (revealed al elegir).
- RF-09: Calificación mutua simple (1-5 + texto) tras contratación. Fase 2.
- RF-10: Exportar datos en JSON/ZIP y eliminar cuenta con anonimización de consentimientos.

## 6. Requerimientos NO funcionales
- RNF-1 Seguridad: ver plan de seguridad (docs/plan-seguridad-paso-a-paso.md). P0 crítico:
  sesión fuera de localStorage, Edge Functions con autorización, fail-closed, RLS.
- RNF-2 Compliance: Ley 18.331 (ARCO), consentimientos inmutables, disclaimer en docs.
- RNF-3 SEO: páginas públicas indexables, metadata dinámica, sitemap (Fase 3).
- RNF-4 Disponibilidad: Vercel + Supabase managed; PITR activar antes de usuarios masivos (C4).
- RNF-5 Rendimiento: Core Web Vitals aceptables; hero video comprimido (revisar).
- RNF-6 Idioma: español (es-UY).

## 7. Alcance
DENTRO: marketplace de postulación, perfiles, legajo documental, avisos de
vencimiento, moderación, SEO público, ARCO self-service.
FUERA (por ahora): facturación/CFE, pagos online, agendamiento/turnos (fase 2),
app móvil nativa, analítica dimensional (ver docs futuro ANALYTICS.md).

## 8. Métricas de éxito
- M1: 50 usuarios registrados con al menos 1 match completo (llamado → postulación → contacto).
- M2: 100 prestadores (oferta inicial; incentivo: gratis para siempre + alertas).
- M3: ≥30% de prestadores con legajo completo y al día.
- M4: tasa de respuesta a postulaciones (medir desde el lanzamiento).

## 9. Roadmap (alineado con plan maestro)
- FASE 1 (sem 1-2): Seguridad P0 restante (A1, A4, A5) + tabla postulaciones + botón real.
- FASE 2 (sem 3-4): Bandeja contratante + email de postulación + contratante "persona" (H4)
  + ARCO (B4 exportar/borrar).
- FASE 3 (sem 5-6): SEO técnico + metadata + sitemap + guías de formalización.
- FASE 4 (sem 7+): Promoción "Primeros 100" + seeding (grupos FB, INEFOP, cámaras, ferias)
  + llamados estatales (ARCE, RSS) como imán y contenido.
- FASE 5 (post-lanzamiento): agendamiento, notificación a matcheados (RF-07),
  analytics/modelo dimensional (docs/ANALYTICS.md), monetización.

## 10. Riesgos conocidos (del diagnóstico 14 sep 2026)
- H1 puerta falsa de postulación (en corrección Fase 1).
- H4 registro de contratante exige empresa (en corrección Fase 2).
- Umbral de avisos solo días exactos (docs subidos con <7 días no avisan hasta vencer) — mejora pendiente.
- Backups: activar PITR antes de crecer (C4).


## 10.1 MVP — definición (lo mínimo para promocionar)
El MVP de Orvalya = Fase 1 + Fase 2 del roadmap. Criterio de "MVP listo":
- [ ] Seguridad P0 completa (A1 ownership+rate-limit, A4, A5) con evidencia en SECURITY.md
- [ ] UC-06: postulación real (tabla postulaciones + botón funcional)
- [ ] UC-07: bandeja del contratante + email de aviso de postulación
- [ ] UC-08/09: exportar y eliminar cuenta (ARCO)
- [ ] UC-02: contratante tipo "persona" (sin exigir empresa)
Checklist de lanzamiento: cuando las 5 casillas estén [x], se promociona.
