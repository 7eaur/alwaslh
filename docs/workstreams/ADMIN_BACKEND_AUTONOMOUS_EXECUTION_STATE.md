# Admin + Backend Autonomous Execution State

Status: `RUNNING`
Sequence: `11`
Last worker: `C`
Active worker: `A`
Start time: `2026-09-14T10:06:22+03:00`
Starting HEAD: `6185cee5660a47b5668af8e9d728bab849f2e13e`
Latest live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`

## Active roadmap position

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 — DONE
- AB-01.2 — DONE
- AB-01.3 — DONE
- **AB-01.4 — ACTIVE / CORS DONE / HEALTH-READINESS DONE / PUBLIC-ERROR SEAM IMPLEMENTATION RUNNING**
- AB-01.5 — PENDING
- AB-01.6 — PENDING

## Active increment — Worker A sequence 11

Implement only the selected third AB-01.4 seam: move the existing public not-found and global public-error handlers out of `apps/api/src/app.ts` into `apps/api/src/app/http/public-errors.ts` behind `registerPublicErrorHandlers(app)` while preserving exact status/body/logging behavior and existing `toPublicError(error)` authority.

Do not touch database `onClose`, Fastify construction/options, service graph, route registry, migrations/schema, or Student frontend.

## Required verification before handoff

- Architecture Guard;
- API lint/typecheck/unit/build;
- relevant auth/security/integration regressions;
- clean PostgreSQL where covered by existing required workflows;
- Combined real Chromium and Stage13G real API/PostgreSQL/Chromium evidence;
- mark DONE only after required source-head/source-tree-equivalent gates are green; otherwise use `WAITING_FOR_CI`.

## Handoff template

- Worker:
- Sequence:
- Start time:
- End time:
- Starting HEAD:
- Ending HEAD:
- Active task/subtask:
- Completed:
- Files/owners changed:
- Verification/CI:
- Current state: `READY_FOR_NEXT | WAITING_FOR_CI | BLOCKED | COMPLETE`
- Exact next smallest step:
- Risks/blockers:
- Main reconciliation required: `YES | NO`
