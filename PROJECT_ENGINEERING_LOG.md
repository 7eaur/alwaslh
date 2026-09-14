# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.2 Curriculum feature ownership established; remaining Content consumer compatibility seam isolated.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. No overlapping Admin/API/PostgreSQL/shared-contract implementation change was observed through Worker A sequence 45.

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

Worker C sequence 44 established that root `admin-api.ts` incorrectly owned the full Curriculum frontend contract while Curriculum and Content consumers depended on it.

Worker A sequence 45 executed the first smallest owner correction:

- created `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts` as the implementation owner for Curriculum types and `/v1/admin/curriculum*` request functions;
- created `apps/admin-web/src/features/curriculum/public/index.ts` as the narrow feature boundary;
- migrated `CurriculumWorkspace.tsx` to the feature public contract and canonical `shared/api/client` error/session helpers;
- reduced root `admin-api.ts` from implementation owner to a temporary compatibility re-export for the still-unmigrated Content ingestion consumer;
- preserved all URLs, payload shapes, auth/session semantics, UI behavior and server/database authority;
- made no backend, PostgreSQL, security, OCR, AI or Student frontend changes.

Source checkpoint: `ee58ffe125da9e550b97965976f47240a7f35d68`.

This is intentionally not declared fully DONE yet. The remaining exact AB-03.2.1 seam is to migrate `ContentIngestionWorkspace.tsx` Curriculum imports to `features/curriculum/public` and then delete the temporary Curriculum re-exports from root `admin-api.ts`. Root `content-ingestion-api.ts` migration remains a separate later concern and must not be combined with that cleanup.

Fresh CI for the source checkpoint started as runs including Frontend Preparation `34884252963` and Admin AI `34884253074`; required gates had not completed at handoff, so shared state is `WAITING_FOR_CI`.