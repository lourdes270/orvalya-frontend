# Orvalya — Evidencia de remediación de seguridad

Proyecto: orvalya-frontend
Fecha inicio: 14 sep 2026

## Decisiones de config (verify_jwt, cron, etc.)
- 14 sep 2026 (A1 investigación): avisos-documentos NO tenía disparador
  (verificado: sin workflows, sin pg_cron, sin invocación en frontend).
  Los emails de vencimiento nunca se enviaron.
- 16 sep 2026: pg_cron + pg_net activadas (verificado en pg_extension).
- 16 sep 2026: AVISOS_CRON_SECRET creado en Edge Functions Secrets
  (generado localmente, no commiteado).
- 16 sep 2026: cron 'avisos-documentos-diario' creado (0 14 * * * UTC =
  11:00 UY), verificado en cron.job con active=true. Dispara la function
  con apikey + x-cron-secret.
- 23 sep 2026 (A1/A2): `verify_jwt` explícito en `supabase/config.toml`.
  - `notificar-llamado` = true: la llama un usuario logueado.
  - `avisos-documentos` = false: la llama pg_net con apikey + `x-cron-secret`,
    sin JWT de usuario. La cerradura es `AVISOS_CRON_SECRET` fail-closed
    (sin secret en env → 500; header distinto o ausente → 401).
## Registro de tareas
| Tarea | Fecha | Resultado | Evidencia |
|-------|-------|-----------|-----------|
| A0 | 14 sep 2026 | OK | Archivo creado |