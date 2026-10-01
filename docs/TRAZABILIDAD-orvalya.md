# MATRIZ DE TRAZABILIDAD — Orvalya (v1)
> Convención de IDs (única fuente de verdad):
>   RF-XX  = Requerimiento funcional (SRS §3.1)
>   RNF-XX = Requerimiento no funcional (SRS §3.2)
>   UC-XX  = Caso de uso (SRS §3/§4)
>   TC-UCxx-nn = Caso de test (nn = correlativo del UC)
>   SUITE-xxx  = Grupo de tests por módulo (carpeta o tag en Playwright)
> Regla de oro: ningún test sin ID de UC, ningún UC sin RF asociado.
> En Playwright: test('UC-06 TC-UC06-01: postularse a llamado activo', ...)

| RF | UC | Caso de test (TC) | Suite (módulo) | Estado | Evidencia / fecha |
|----|----|-------------------|----------------|--------|-------------------|
| RF-01 | UC-01/02 | TC-UC01-01 registro email con captcha | SUITE-registro | pendiente | tests/e2e existentes |
| RF-02 | UC-01/02 | TC-UC01-02 aceptación términos versionada | SUITE-registro | pendiente | |
| RF-03 | UC-03 | TC-UC03-01 subir doc con declaración jurada | SUITE-legajo | pendiente | check constraint verificado 23/09 |
| RF-04 | UC-04 | TC-UC04-01 aviso umbral 7 días por email | SUITE-avisos | ✅ PASS | net._http_response 23/09 + email recibido |
| RF-05 | UC-05 | TC-UC05-01 publicar llamado | SUITE-llamados | pendiente | |
| RF-06 | UC-06 | TC-UC06-01 postularse a llamado activo | SUITE-postulaciones | pendiente (H1) | botón es puerta falsa — fix Fase 1 |
| RF-06 | UC-06 | TC-UC06-02 no postularse a llamado cerrado | SUITE-postulaciones | pendiente | |
| RF-07 | UC-07 | TC-UC07-01 email al contratante por postulación | SUITE-postulaciones | pendiente | |
| RF-08 | UC-07 | TC-UC07-02 bandeja muestra postulaciones | SUITE-postulaciones | pendiente | |
| RF-09 | UC-08 | TC-UC08-01 exportar datos JSON/ZIP | SUITE-arco | pendiente | |
| RF-10 | UC-09 | TC-UC09-01 eliminar cuenta + anonimizar consentimientos | SUITE-arco | pendiente | |
| RF-11 | UC-10 | TC-UC10-01 moderar llamado (rechazar) | SUITE-admin | pendiente | |
| RNF-SEG-03 | — | TC-SEC-01 llamada sin secret => 401 | SUITE-seguridad | pendiente | diseño fail-closed (A2) |
| RNF-SEG-03 | — | TC-SEC-02 sin env configurado => 500 | SUITE-seguridad | pendiente | diseño fail-closed (A2) |
| RNF-SEG-04 | — | TC-SEC-03 usuario A no lee datos de B (RLS) | SUITE-seguridad | pendiente | tarea A5 |

## Cómo se usa en el día a día (con TDA):
1. Antes de programar: mirá la fila del RF → sabés qué UC y qué TC tenés que hacer.
2. Al escribir el test: nombralo con el TC (el ID va en el nombre del test).
3. Al pasar: cambiá Estado a PASS con fecha. Si falla: anotá el bug con el RF.
4. ¿Se te pierde algo? Filtrá por la columna Estado — "pendiente" = tu backlog de QA.
5. ¿Auditoría o entrevista corporativa? Mostrá esta tabla: es trazabilidad real, en vivo.
