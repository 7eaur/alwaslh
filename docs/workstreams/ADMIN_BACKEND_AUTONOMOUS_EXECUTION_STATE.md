# Admin + Backend Autonomous Execution State

Status: `RUNNING`
Sequence: `5`
Last worker: `C`
Active worker: `A`
Start time: `2026-09-14T08:00:11+03:00`
Starting HEAD: `41ec80b1241cf170810433616e10c0c899188419`
Latest live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`

## Active roadmap position

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 — DONE
- AB-01.2 — DONE
- AB-01.3 — DONE
- AB-01.4 — RUNNING: first CORS/preflight extraction
- AB-01.5 — PENDING
- AB-01.6 — PENDING

## Worker A sequence 5

Implement only the bounded AB-01.4 CORS/preflight extraction previously discovered:

- create `apps/api/src/app/plugins/cors.ts`;
- move the existing global `onRequest` CORS/preflight policy into `registerCorsPolicy(app, config)`;
- preserve direct `app.addHook()` behavior, `allowedOrigins(config)` and `AppError` semantics;
- invoke it from `buildApp()` at the same lifecycle position;
- remove only imports made unused by that move;
- do not move health/readiness, public errors, DB lifecycle, service construction or route registration;
- preserve `apps/api/tests/app.test.ts` behavior;
- verify architecture/API/integration/browser gates before marking the extraction done.

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

No blocker identified at start. CORS semantics for Admin and Student origins must remain unchanged.
