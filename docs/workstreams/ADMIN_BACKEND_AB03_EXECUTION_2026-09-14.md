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
- `apps/admin-web/src/features/operations/api/admin-operations-api.ts` now owns Operations transport/types behind `features/operations/public`.
- `apps/admin-web/src/app/router/AdminRoutes.tsx` still lazy-loads the legacy Overview/Operations presentation owners directly; presentation ownership has not yet been migrated.

Current backend authority:

- `apps/api/src/admin-operations/service.ts` reads authoritative PostgreSQL operational state for governance/attention inputs and the multi-source audit stream.
- `apps/api/src/admin-operations/http.ts` owns admin authorization and HTTP query validation.
- `apps/api/src/admin-operations/attention.ts` owns the pure actionable projection used by Overview.
- `apps/api/src/admin-operations/attention-application.ts` owns the attention orchestration use case.
- No schema or migration change was justified by the completed corrections.

### AB-03.1.1 — Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`.

Root correction:

- added `apps/api/src/admin-operations/attention-application.ts`;
- moved governance + audit orchestration for the attention use case out of the HTTP route into `loadOperationsAttention(...)`;
- kept HTTP responsible only for admin authorization, query validation and calling the application owner;
- preserved `/v1/admin/operations/attention`, query bounds, PostgreSQL queries, response projection and security behavior;
- added `apps/api/tests/admin-operations-attention-application.test.ts` to prove orchestration inputs and projected output;
- changed no Admin frontend, Student frontend, PostgreSQL migrations/schema or external API contract.

Closure evidence:

- Architecture Guard `34859593842` — **SUCCESS**.
- Admin AI `34860142887` — **SUCCESS**.
- Combined Integration `34860142983` — **SUCCESS**.
- Stage13G Admin Operations `34860143008` — **SUCCESS**.

AB-03.1.1 is closed.

### AB-03.1.2 — Operations frontend API ownership — IMPLEMENTED / WAITING_FOR_CI

Source checkpoint: `75cab6ca1067f5866a259ad079279757218e805f`.

Root correction implemented by Worker A sequence 36:

- moved the complete Operations frontend adapter from root `apps/admin-web/src/admin-operations-api.ts` to `apps/admin-web/src/features/operations/api/admin-operations-api.ts`;
- preserved the existing exported types/functions and transport behavior; only the relative import of the shared root `adminApiRequest` changed to match the new owner location;
- added `apps/admin-web/src/features/operations/public/index.ts` as the narrow public feature boundary;
- switched `AdminOverviewPage`, `AdminOperationsHealthPage`, `AdminOperationsAuditPage`, `AdminOperationsDiagnosticsPage` and `AdminNotificationsPage` to import Operations contracts/functions through `features/operations/public`;
- deleted the root transitional `apps/admin-web/src/admin-operations-api.ts` after the consumers switched;
- deliberately did not move Overview/Operations pages, `operations-model`, CSS or route ownership;
- did not change URLs, request payloads/query construction, response contracts, session-expiry handling, backend/API/PostgreSQL behavior, schema/migrations, security authority or Student frontend implementation.

Verification observed on exact implementation HEAD:

- Architecture Guard `34866606170` — **SUCCESS**.
- Stage13E Frontend Preparation `34866606173` — pending/not fully closed at handoff.
- Stage13E Admin AI Operations `34866606148` — in progress/not fully closed at handoff.
- Stage13E Combined Integration `34866606220` — pending/not fully closed at handoff.
- Stage13G Admin Operations `34866606179` — pending/not fully closed at handoff.

Because the required affected-scope gates are not all green yet, AB-03.1.2 remains open as `WAITING_FOR_CI`. Documentation-only commits after the source checkpoint may supersede/cancel source-head runs under branch concurrency; such runs may be replaced only by source-tree-equivalent evidence after confirming there is no executable source/test/migration/workflow drift from `75cab6ca...`.

## Exact continuation

Close **AB-03.1.2 only** before any further architecture mutation:

1. inspect the exact source-head runs listed above or the newest source-tree-equivalent runs if docs-only commits supersede them;
2. require Architecture Guard, Admin lint/typecheck/unit/build, relevant Operations/Overview coverage, Combined Integration, and Stage13G real API + PostgreSQL + Chromium to be green;
3. fix any real regression at its root without broadening the scope;
4. after green evidence, mark AB-03.1.2 DONE and perform a fresh discovery-only pass inside Overview + Operations;
5. do not move pages/models/styles/routes or begin Curriculum + Content + OCR in the same increment.
