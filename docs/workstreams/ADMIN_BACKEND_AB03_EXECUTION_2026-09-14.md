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

- `apps/admin-web/src/admin/overview/AdminOverviewPage.tsx` owns the Overview presentation and consumes `/v1/admin/operations/attention`.
- `apps/admin-web/src/admin/operations/*` owns health, audit, diagnostics, notifications and shared operations presentation/model code.
- `apps/admin-web/src/admin-operations-api.ts` is still a root-level transitional API adapter.
- `apps/admin-web/src/app/router/AdminRoutes.tsx` lazy-loads the legacy Overview/Operations owners directly.

Current backend authority:

- `apps/api/src/admin-operations/service.ts` reads authoritative PostgreSQL operational state for governance/attention inputs and the multi-source audit stream.
- `apps/api/src/admin-operations/http.ts` owns admin authorization and HTTP query validation.
- `apps/api/src/admin-operations/attention.ts` owns the pure actionable projection used by Overview.
- No schema or migration change is justified for the first correction.

### AB-03.1.1 — Attention application ownership — IMPLEMENTED / WAITING_FOR_CI

Source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`.

Root correction:

- added `apps/api/src/admin-operations/attention-application.ts`;
- moved governance + audit orchestration for the attention use case out of the HTTP route into `loadOperationsAttention(...)`;
- kept HTTP responsible only for admin authorization, query validation and calling the application owner;
- preserved `/v1/admin/operations/attention`, query bounds, PostgreSQL queries, response projection and security behavior;
- added `apps/api/tests/admin-operations-attention-application.test.ts` to prove orchestration inputs and projected output;
- changed no Admin frontend, Student frontend, PostgreSQL migrations/schema or external API contract.

Verification at handoff:

- Architecture Guard `34859593842` — **SUCCESS** on implementation tree `fe2f3e8811e78e03662a759127dd35fe3588b336`; source checkpoint `5c363658...` adds only the dedicated API test.
- Admin AI `34859616706` — **SUCCESS** on exact source checkpoint.
- Combined Integration `34859616648` — **IN PROGRESS** at handoff.
- Stage13G Admin Operations `34859617164` — **IN PROGRESS** at handoff; this is the required gate carrying Admin/API/PostgreSQL/integration/real API + PostgreSQL + Chromium evidence for this slice.

Therefore AB-03.1.1 is not marked DONE yet. Shared state remains `WAITING_FOR_CI` until the remaining required source-head gates are green.

## Exact continuation

1. Verify `34859616648` and `34859617164` against source checkpoint `5c36365888486cf8297893467bfc4e1c97bc6b43` (or a source-tree-equivalent verification head if documentation concurrency supersedes them).
2. If green, close AB-03.1.1 and continue AB-03.1 discovery only.
3. Next likely ownership seam must be chosen from evidence in Overview/Operations frontend/API ownership; do not start Curriculum/Content/OCR.
4. Do not introduce schema/framework changes without domain evidence.
