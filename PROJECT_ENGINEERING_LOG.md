# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.2.1 Content consumer migrated to Curriculum feature boundary; remaining root facade consumers proven and compatibility preserved.**

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

Worker C sequence 44 identified root `admin-api.ts` as the implementation owner of the Curriculum frontend contract while multiple consumers depended on the root facade.

Worker A sequence 45 moved the implementation owner into:

- `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts` for Curriculum transport/types;
- `apps/admin-web/src/features/curriculum/public/index.ts` for the narrow feature consumer boundary;
- `CurriculumWorkspace.tsx` was switched to that boundary and canonical `shared/api/client` helpers.

Worker B sequence 46 then migrated only the intended Content-ingestion consumer:

- `ContentIngestionWorkspace.tsx` now imports Curriculum symbols from `features/curriculum/public`;
- generic API error/session helpers come from `shared/api/client`;
- root `content-ingestion-api.ts` remained intentionally untouched;
- no endpoint/payload/session/UI/backend/PostgreSQL/security/OCR/AI/Student frontend behavior changed.

A first cleanup attempt removed the root Curriculum compatibility exports at source checkpoint `af4a131b1b039883a318ebb41b7ec5e5146f126d`. Stage13G `34886697753` then failed specifically at Admin strict typecheck because live code still contains legitimate root-facade consumers across Curriculum subcomponents, Access Codes, AI authoring, Question Bank, Quiz Builder and `admin-api.test.ts`. The Stage13G backend job on that same source remained green through API lint/typecheck/unit/build, clean PostgreSQL migrations, DB contract, integration and auth regressions. Tests were not weakened or bypassed.

The smallest root correction was to restore only the transitional Curriculum re-export facade while retaining feature implementation ownership and the migrated Content-ingestion consumer. Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Verification on the corrected source at the last observation:

- Architecture Guard `34887051028` — SUCCESS;
- Frontend Preparation `34887051091` — pending/in progress;
- Admin AI Operations `34887051031` — pending;
- Combined Integration `34887051068` — pending;
- Stage13G Admin Operations `34887051059` — pending/in progress.

Therefore this increment remains `WAITING_FOR_CI`. The compatibility facade is intentional temporary migration debt, not duplicate implementation ownership. Do not mass-migrate future-slice consumers merely to remove it; close this exact source first, then select the next smallest AB-03.2 ownership seam from fresh code evidence.