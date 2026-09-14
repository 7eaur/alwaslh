# Admin + Backend AB-03 Execution — End-to-end vertical slices

Date: **2026-09-14**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft / unmerged / no auto-merge.  
Status: **ACTIVE — AB-03.1 Overview + Operations**

## Scope and order

AB-03 migrates complete Admin vertical slices in canonical order:

1. Overview + Operations — ACTIVE
2. Curriculum + Content + OCR — PENDING
3. AI Jobs + AI Review + contextual authoring — PENDING
4. Question Bank — PENDING
5. Quiz Builder — PENDING
6. Students — PENDING
7. Access Codes — PENDING

Each slice follows `job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`.

## AB-03.1 — Overview + Operations

### Discovery checkpoint

Current Admin owners:

- `apps/admin-web/src/admin/overview/AdminOverviewPage.tsx` owns the Overview presentation.
- `apps/admin-web/src/admin/operations/*` owns health, audit, diagnostics, notifications and shared operations presentation/model code.
- `apps/admin-web/src/features/operations/api/admin-operations-api.ts` owns Operations transport/types behind `features/operations/public`.
- `apps/admin-web/src/app/router/AdminRoutes.tsx` still lazy-loads the legacy Overview/Operations presentation owners directly; presentation ownership has not yet been migrated.

Current backend authority:

- `apps/api/src/admin-operations/service.ts` reads authoritative PostgreSQL operational state for governance/attention inputs and the multi-source audit stream.
- `apps/api/src/admin-operations/http.ts` owns admin authorization and HTTP query validation.
- `apps/api/src/admin-operations/attention.ts` owns the pure actionable projection used by Overview.
- `apps/api/src/admin-operations/attention-application.ts` owns the attention orchestration use case.
- No schema or migration change was justified by the completed corrections.

### AB-03.1.1 — Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`.

Closure evidence: Architecture Guard `34859593842`, Admin AI `34860142887`, Combined Integration `34860142983`, Stage13G Admin Operations `34860143008` — **SUCCESS**.

### AB-03.1.2 — Operations frontend API ownership — ROOT FIX APPLIED / WAITING_FOR_CI

Initial implementation checkpoint: `75cab6ca1067f5866a259ad079279757218e805f`.

Worker A sequence 36 moved the Operations frontend adapter/types from root into `apps/admin-web/src/features/operations/api/admin-operations-api.ts`, exposed `features/operations/public`, switched the principal page consumers, and deleted the transitional root adapter.

Worker B sequence 37 inspected the failed Stage13G Admin UI job and found a genuine migration defect: three stale imports still referenced the deleted root module. This was not treated as CI/concurrency noise.

Current corrected source checkpoint: `abe4f2c935cf09a84e7be29d94f5bd59f8c2cfc0`.

Root correction:

- `apps/admin-web/src/admin/operations/operations-model.ts` now imports `OperationsAttentionSummary`, `OperationsAuditEntry`, and `OperationsAuditSource` through `../../features/operations/public`;
- `apps/admin-web/src/admin/operations/operations-model.test.ts` consumes `OperationsAttentionSummary` through the same public boundary;
- the transport test was colocated with its owner as `apps/admin-web/src/features/operations/api/admin-operations-api.test.ts`;
- the stale root `apps/admin-web/src/admin-operations-api.test.ts` was removed;
- exported names, URLs, query/body construction, response contracts, credentials/session-expiry behavior, page behavior, routes/styles, backend/API authority, PostgreSQL schema/migrations, security and Student frontend implementation remain unchanged.

The original failure was strict typecheck missing-module errors in the three stale import sites. On the corrected exact source HEAD, current evidence is:

- Architecture Guard `34868596586` — **SUCCESS**.
- Stage13E Frontend Preparation `34868596646` — **SUCCESS**.
- Stage13E Admin AI Operations `34868596701` — **SUCCESS**.
- Stage13E Combined Integration `34868596865` — **IN PROGRESS** at last observation.
- Stage13G Admin Operations `34868596682` — **IN PROGRESS** at last observation.

AB-03.1.2 remains open as `WAITING_FOR_CI`. Documentation-only commits after `abe4f2c...` may supersede/cancel source-head runs under branch concurrency; substitute only source-tree-equivalent evidence after proving no executable source/test/migration/workflow drift.

## Exact continuation

Close **AB-03.1.2 only** before any further architecture mutation:

1. inspect Combined `34868596865` and Stage13G `34868596682`, or newest source-tree-equivalent runs if docs-only commits supersede them;
2. require Combined green and Stage13G Admin/API quality, clean PostgreSQL/contracts, relevant integration/auth regressions, and real API + PostgreSQL + Chromium green;
3. fix any genuine regression only at its root inside this ownership seam;
4. after green evidence, mark AB-03.1.2 DONE and perform a fresh discovery-only pass inside Overview + Operations;
5. do not move another ownership seam or begin Curriculum + Content + OCR in the same increment.