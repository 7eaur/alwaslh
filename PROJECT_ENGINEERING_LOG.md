# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.2.1 Curriculum frontend ownership cleanup implemented; exact verification still settling.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. No overlapping Admin/API/PostgreSQL/shared-contract implementation change was observed through Worker B sequence 46 startup.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Global shell, inner routing, lazy workflow boundaries and auth login presentation ownership are closed.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — ACTIVE

Worker C sequence 44 identified root `admin-api.ts` as the incorrect owner of the full Curriculum frontend contract while Curriculum and Content consumers depended on it.

Worker A sequence 45 created the real feature owner:

- `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts` owns Curriculum transport/types;
- `apps/admin-web/src/features/curriculum/public/index.ts` exposes the narrow consumer contract;
- `CurriculumWorkspace.tsx` consumes that feature boundary;
- temporary Curriculum root re-exports remained only for the last Content ingestion consumer.

Worker B sequence 46 completed the smallest remaining compatibility cleanup:

- migrated `ContentIngestionWorkspace.tsx` Curriculum imports to `features/curriculum/public`;
- migrated its generic API error/session imports to `shared/api/client`;
- removed the temporary Curriculum re-export block from root `admin-api.ts`;
- deliberately left root `content-ingestion-api.ts` transport untouched for a separate later ownership decision;
- preserved all endpoints, payload shapes, auth/session semantics, UI behavior and backend/database authority;
- made no backend, PostgreSQL, security, OCR, AI or Student frontend implementation change.

Final source checkpoint for this cleanup: `af4a131b1b039883a318ebb41b7ec5e5146f126d`.

Verification observed on the exact source HEAD:

- Architecture Guard `34886697714` — SUCCESS;
- Frontend Preparation `34886697732` — pending at handoff observation;
- Admin AI Operations `34886697663` — pending at handoff observation;
- Combined Integration `34886697673` — in progress at handoff observation;
- Stage13G Admin Operations `34886697753` — in progress at handoff observation.

Therefore AB-03.2.1 is `WAITING_FOR_CI`, not DONE. The next worker must close these source-tree-equivalent gates before opening another Content/OCR ownership increment.