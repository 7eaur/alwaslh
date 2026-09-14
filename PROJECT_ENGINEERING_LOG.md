# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.2.1 Curriculum frontend API ownership closed with source-tree-equivalent green CI.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. No overlapping Admin/API/PostgreSQL/shared-contract implementation change was observed through Worker C sequence 47 startup.

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

#### AB-03.2.1 Curriculum frontend API ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Worker C sequence 44 identified root `admin-api.ts` as the implementation owner of the Curriculum frontend contract while multiple consumers depended on the root facade.

Worker A sequence 45 moved implementation ownership into `features/curriculum/api/admin-curriculum-api.ts`, exposed the narrow `features/curriculum/public` boundary, and migrated `CurriculumWorkspace.tsx` plus generic error/session helpers to canonical owners.

Worker B sequence 46 migrated only the intended Content-ingestion Curriculum consumer. A first attempt to delete root Curriculum compatibility exports was rejected by Stage13G strict typecheck because legitimate later-slice consumers remain in Curriculum subcomponents, Access Codes, AI authoring, Question Bank, Quiz Builder and `admin-api.test.ts`. The compatibility facade was therefore restored without restoring duplicate implementation ownership.

Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Worker C sequence 47 re-verified source-tree equivalence from that checkpoint to handoff HEAD `926013d1af3824cc50836660ca85615bb2ec8593`: differences were documentation/state only. Required closure gates are green:

- Architecture Guard `34887051028` — SUCCESS;
- Frontend Preparation `34887051091` — SUCCESS;
- Admin AI Operations `34887416193` — SUCCESS;
- Combined Integration `34887416088` — SUCCESS;
- Stage13G Admin Operations `34887416108` — SUCCESS.

This closes AB-03.2.1. The remaining root Curriculum facade is intentional temporary migration debt and must be removed only as owning later slices migrate their consumers. Do not bulk-migrate those consumers merely to delete compatibility.

Exact continuation: perform fresh AB-03.2 discovery and choose one smallest Curriculum/Content/OCR root-cause ownership correction from live code evidence before any new source mutation.
