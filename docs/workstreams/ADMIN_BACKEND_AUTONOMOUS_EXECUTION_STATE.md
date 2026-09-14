# Admin + Backend Autonomous Execution State

Status: `RUNNING`
Sequence: `17`
Last worker: `C`
Active worker: `A`
Start time: `2026-09-14T12:00:31+03:00`
Starting HEAD: `ff99103df41dabebacc889b45607b411ec80c731`
Current live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`
Active task: `AB-01.4 — implement only the selected database lifecycle registration seam`

## Active roadmap position

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 — DONE
- AB-01.2 — DONE
- AB-01.3 — DONE
- AB-01.4 — ACTIVE
  - CORS — DONE
  - Health/readiness — DONE
  - Public error/not-found — DONE
  - Fastify construction/options — DONE
  - Database lifecycle registration — RUNNING
- AB-01.5 — PENDING
- AB-01.6 — PENDING

## Current execution contract

Implement only the selected database lifecycle seam:

1. create `apps/api/src/app/plugins/database-lifecycle.ts` with narrow database-close hook registration;
2. replace only the inline database `onClose` hook in `apps/api/src/app.ts`, keeping the same composition position;
3. add focused `apps/api/tests/app.test.ts` app-close→database-close parity coverage;
4. do not change `server.ts`, database creation/pool behavior, service graph, routes, startup batch, migrations or Student frontend;
5. run Architecture Guard + API lint/typecheck/unit/build + clean PostgreSQL + relevant integration/security/auth + real API/PostgreSQL/Chromium gates;
6. use `WAITING_FOR_CI` until the affected source tree has sufficient green evidence;
7. after the fifth seam closes, reassess whether AB-01.4 should close rather than forcing a broad sixth extraction.

## Preserved contracts

- `buildApp()` continues to receive an already-created `Database`.
- The same Fastify instance owns the `onClose` hook.
- `await app.close()` continues to await `database.close()` with no swallowed close error.
- Registration remains after business routes, health and public-error composition.
- `server.ts` continues to use `app.close()` for SIGTERM/SIGINT and listen failure.
- Legacy startup failure before app construction continues to call `database.close().catch(() => undefined)` directly.
- Database pool configuration, query/transaction behavior, migrations/schema and all HTTP/business contracts remain unchanged.

## Handoff template

Before finishing this run replace/update this file with:

- Worker
- Sequence
- Start/end time
- Starting/ending HEAD
- Active task/subtask
- Completed work
- Files/owners changed
- Verification/CI run IDs + state
- Current state: `READY_FOR_NEXT | WAITING_FOR_CI | BLOCKED | COMPLETE`
- Exact next smallest step
- Risks/blockers
- Main reconciliation required: `YES | NO`
