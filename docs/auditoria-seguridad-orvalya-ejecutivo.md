# Orvalya — Informe ejecutivo de seguridad

**Fecha:** 8 de septiembre de 2026  
**Alcance:** https://www.orvalya.com · React 19 + Next.js 16 + Supabase + Vercel  
**Datos sensibles en alcance:** RUT, emails, teléfonos, documentación DGI/BPS/BSE  
**Normativa de referencia:** Ley 18.331 (Uruguay) · buenas prácticas GDPR/LGPD  
**Método:** (A) revisión de código y migraciones del repositorio · (B) verificación live no invasiva (HTTPS, headers, TLS) · (C) contraste con auditoría externa de caja negra de terceros

---

## 1. Resumen para la startup

Orvalya maneja legajos fiscales y laborales de independientes y empresas. Eso eleva el costo de un error de seguridad: no es solo “una web”, es custodia de PII regulada.

**Conclusión:** la base técnica es sólida en aislamiento de datos (RLS, storage privado de documentos, HTTPS/TLS moderno, consentimiento legal versionado). Los riesgos que más pueden afectar al negocio hoy no son “el sitio está abierto en HTTP”, sino **cómo se guarda la sesión**, **cómo se protegen las Edge Functions con service role**, y **la madurez operativa** (borrado/exportación de cuenta, auditoría, backups).

| Severidad | Cantidad (hallazgos confirmados) | Lectura de negocio |
|-----------|----------------------------------|--------------------|
| Crítico   | 1                                | Puede comprometer cuenta y PII vía XSS |
| Alto      | 6                                | Abuso operativo, integridad o compliance |
| Medio     | 6                                | Defensa en profundidad / detección |
| Bajo      | 2                                | Higiene / deuda técnica |

**Lo que ya está bien (evidencia):**
- Sitio solo por HTTPS; TLS 1.3; certificado Let’s Encrypt válido.
- Headers en producción: HSTS (`max-age=63072000`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, CSP activa.
- Bucket `documentos` **privado** con ACL por dueño (no URLs públicas eternas a certificados).
- RLS en tablas core; tests de aislamiento en el repo.
- Rate limit en RPC públicas de búsqueda; hCaptcha + honeypot en registro.
- Páginas legales publicadas; aceptación versionada e inmutable en BD.
- Proveedores: Supabase y Vercel con SOC 2 Type II e ISO 27001.

---

## 2. Contraste con la auditoría externa (caja negra)

Otra IA auditó solo desde afuera (sin código). Fue útil como checklist de riesgos típicos del stack, pero **varios ítems quedaron en “pendiente / asumir que falta”** porque no tenía acceso al repo ni a headers. Esta es la reconciliación:

| Afirmación externa | Veredicto interno | Comentario |
|--------------------|-------------------|------------|
| HTTPS OK; legales publicados | **Confirmado** | Correcto |
| “No pude leer headers” → asumir duda | **Superado** | Headers verificados en vivo (HSTS, CSP, XFO, nosniff) |
| JWT en localStorage = riesgo alto/crítico | **Confirmado (crítico)** | `createClient` browser sin cookies httpOnly |
| Storage público de docs = crítico *si aplica* | **No aplica a documentos** | Bucket `documentos` privado; avatares sí son públicos (esperado) |
| “Asumir que no hay rate limit” | **Parcialmente incorrecto** | Hay rate limit en RPC de búsqueda y captcha en registro; login depende del Dashboard Auth |
| RLS no verificable desde afuera | **Correcto como límite** | Internamente hay policies + tests; Edge Functions con service role siguen siendo el punto débil |
| Edge Function + `user_id` del cliente | **Riesgo real, forma distinta** | `notificar-llamado` no pide `user_id`, pero tampoco valida ownership del caller |
| Encriptación de columna RUT | **Confirmado (alto)** | Solo cifrado de disco del proveedor |
| Sin export/delete account | **Confirmado (alto / compliance)** | Solo canal manual ARCO |
| PITR / RNPD / DPA | **Sigue pendiente operativo** | No verificable solo con código |

**Lectura honesta:** la auditoría externa acertó los riesgos *estructurales* del stack Supabase+Next, pero **sobreestimó algunos vacíos** (headers, storage público de docs, rate limit total ausente) y **no pudo ver** los hallazgos concretos del código (edge sin authZ, trigger de republicación, CSP débil, IP de aceptación siempre null).

---

## 3. Hallazgos prioritarios (confirmados)

### Crítico
1. **Sesión en `localStorage` + CSP permisiva (`unsafe-inline` / `unsafe-eval`)**  
   - **Impacto:** un XSS puede robar el JWT y acceder a la cuenta (RUT, metadatos documentales, uploads propios).  
   - **Remediación:** patrón oficial `@supabase/ssr` con cookies httpOnly + middleware Next; endurecer CSP con nonces.

### Altos
2. **Edge `notificar-llamado` sin ownership ni rate limit** → abuso de emails a admins / Resend.  
3. **Edge `avisos-documentos` con secret de cron opcional** → fail-open si no está configurado.  
4. **RUT y documentos sin cifrado a nivel de aplicación** → fuga de `service_role` = PII en claro.  
5. **Validación de archivos solo en el cliente** → bypasseable.  
6. **Sin flujo automatizado de exportar / eliminar cuenta** (Ley 18.331 / ARCO).  
7. **Llamado rechazado vuelve a `activo` al editar** → evasión de moderación.

### Medios (selección)
- Sin Sentry ni audit trail de login/PII/accesos a documentos.  
- Login sin captcha; rate limit Auth a confirmar en Dashboard.  
- Formspree sin captcha propio.  
- Política de privacidad habla de “cookies de sesión”; la app usa localStorage.

---

## 4. Plan de remediación (priorizado para startup)

### P0 — esta semana (bajo costo, alto impacto)
- [ ] Autorizar `notificar-llamado` (JWT + `contratante_id === auth.uid()`) + rate limit.  
- [ ] Hacer **obligatorio** `AVISOS_CRON_SECRET` (fail-closed).  
- [ ] Corregir trigger: rechazo → `pendiente_moderacion`, no republicación automática.  
- [ ] Confirmar en Supabase Dashboard: rate limits Auth y JWT expiry/refresh rotation.  
- [ ] Re-test RLS con dos cuentas reales (prestador A vs contratante B).

### P1 — 2 semanas
- [ ] Migrar sesión a cookies httpOnly (`@supabase/ssr`).  
- [ ] Endurecer CSP (quitar `unsafe-eval`; nonces).  
- [ ] Revalidar MIME/tamaño de uploads en Edge Function.  
- [ ] UI/API: “Exportar mis datos” y “Eliminar mi cuenta” (hard delete + purge Storage).

### P2 — 30 días (compliance y madurez)
- [ ] Sentry + `audit_log` de accesos a documentos y cambios de RUT/email.  
- [ ] Cifrado de columna RUT (Vault/pgcrypto) y retención de logs 90+ días.  
- [ ] Activar PITR (plan Pro), documentar RTO/RPO, restore de prueba.  
- [ ] Firmar DPA Supabase/Vercel; evaluar registro URCDP/RNPD; captcha en Formspree o reemplazo propio.

---

## 5. Checklist ejecutivo (estado consolidado)

| Dominio | Estado global | Comentario corto |
|---------|---------------|------------------|
| 1. Auth & sesiones | **Atención** | HTTPS OK; tokens en localStorage (crítico) |
| 2. Datos sensibles | **Atención** | Storage docs privado OK; sin cifrado de columna; sin delete automatizado |
| 3. RLS | **Bien con matices** | Policies OK; Edge con service role deben autocheckear |
| 4. Inyección / validación | **Bien / mejorar** | PostgREST OK; uploads solo cliente; CSP débil |
| 5. Rate limiting | **Parcial** | Búsqueda y registro OK; login/uploads/Vercel Firewall a reforzar |
| 6. Backup & DR | **Pendiente operativo** | Verificar PITR / restore / RTO-RPO en Dashboard |
| 7. Logging | **Débil** | Legal promete auditoría; falta implementación + Sentry |
| 8. Terceros | **Aceptable** | Supabase/Vercel/hCaptcha OK; Formspree y DPAs a cerrar |
| 9. Headers & TLS | **Bien** | HSTS/CSP/XFO/nosniff/TLS 1.3 verificados en vivo |
| 10. Ley 18.331 | **Parcial** | Políticas y consentimiento OK; export/borrado y RNPD pendientes |

---

## 6. Mensaje listo para presentar (30 segundos)

> Auditamos Orvalya contra un checklist de seguridad y protección de datos personales (RUT y documentos DGI/BPS/BSE). El sitio está bien blindado en la capa pública (HTTPS, TLS 1.3, headers, storage privado de documentos, RLS). El riesgo principal confirmado es el manejo de sesión en el cliente; además hay que cerrar autorizaciones en Edge Functions y completar los procesos de derechos del usuario. Tenemos un plan P0–P2 de 30 días con acciones concretas.

---

## 7. Anexos / fuentes

- Revisión de código: `src/lib/supabase.ts`, `next.config.ts`, `supabase/migrations/*`, `supabase/functions/*`, textos legales.  
- Verificación live (8 Sep 2026): headers y TLS de `https://www.orvalya.com`.  
- Canvas técnico detallado (uso interno Cursor): `orvalya-security-audit.canvas.tsx`.  
- Auditoría externa de caja negra: contrastada en la sección 2 (no se adoptaron hallazgos no verificados).

*Este documento es un informe de elaboración interna de la startup. No sustituye un pentest formal ni el asesoramiento legal de un abogado en protección de datos.*
