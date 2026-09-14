# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.1.2 root CI regression fixed; final Combined + Stage13G evidence still pending.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. AB-02 → AB-03 reconciliation found no Admin/API/PostgreSQL implementation overlap; shared docs remain deliberately branch-local until final reconciliation.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Global shell, inner routing, lazy workflow boundaries and auth login presentation ownership are closed. Canonical evidence is retained in `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1.1 — Operations attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Source checkpoint `5c36365888486cf8297893467bfc4e1c97bc6b43` moved governance/audit orchestration from HTTP into `admin-operations/attention-application.ts`, retained HTTP authorization/query validation, added a dedicated application-owner test and preserved API/PostgreSQL/security behavior. Closure: Guard `34859593842`, Admin AI `34860142887`, Combined `34860142983`, Stage13G `34860143008` — SUCCESS.

### AB-03.1.2 — Operations frontend API ownership — ROOT FIX APPLIED / WAITING_FOR_CI

Worker A sequence 36 moved Operations transport/types under `features/operations` and deleted the root adapter. Worker B sequence 37 inspected the failing verification rather than treating it as concurrency noise and found a genuine ownership-migration regression: the deleted root module was still referenced by `admin-operations-api.test.ts`, `operations-model.ts`, and `operations-model.test.ts`. Stage13G Admin UI quality failed strict typecheck on those stale imports, while its backend/PostgreSQL/integration job was already green.

Current source checkpoint: `abe4f2c935cf09a84e7be29d94f5bd59f8c2cfc0`.

Root correction:

- `admin/operations/operations-model.ts` now imports Operations contracts through `features/operations/public`;
- `admin/operations/operations-model.test.ts` uses the same public contract;
- `admin-operations-api.test.ts` was moved from root to `features/operations/api/admin-operations-api.test.ts`, colocating the transport test with its actual owner;
- the stale root test file was removed;
- no endpoint/query/body/response/session semantics, page/model behavior, routes/styles, API backend, PostgreSQL schema/migrations, security authority or Student frontend implementation changed.

Exact source-head verification at handoff:

- Architecture Guard `34868596586` — **SUCCESS**.
- Frontend Preparation `34868596646` — **SUCCESS**.
- Admin AI Operations `34868596701` — **SUCCESS**.
- Combined Integration `34868596865` — **IN PROGRESS** at last observation.
- Stage13G Admin Operations `34868596682` — **IN PROGRESS** at last observation.

The subtask remains `WAITING_FOR_CI`; no second architecture seam was started.

## Exact continuation

Verification/closure of **AB-03.1.2 only**:

1. inspect Combined `34868596865` and Stage13G `34868596682`, or newer source-tree-equivalent runs if documentation commits supersede them;
2. require Combined to be green and Stage13G to include green Admin/API quality, clean PostgreSQL/contracts, regressions, and real API + PostgreSQL + Chromium;
3. fix only a genuine root regression inside AB-03.1.2 if one appears;
4. when all required evidence is green, mark AB-03.1.2 DONE and only then perform a fresh discovery-only pass inside Overview + Operations;
5. do not begin Curriculum/Content/OCR in the same increment.