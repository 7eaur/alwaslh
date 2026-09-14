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
- No schema or migration change is justified for the first corrections.

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

- Architecture Guard `34859593842` — **SUCCESS** on implementation tree `fe2f3e8811e78e03662a759127dd35fe3588b336`; source checkpoint `5c363658...` adds only the dedicated application test.
- Source-tree-equivalent verification head `d350ce8d1ec9d7fdedc8c466c1a4ca4657ca546e` differs from `5c363658...` only in canonical/shared documentation files; no source, test, migration or workflow drift exists.
- Admin AI `34860142887` — **SUCCESS**.
- Combined Integration `34860142983` — **SUCCESS**, including API/Admin quality gates, clean PostgreSQL migrations, DB contract, backend-authority regressions, Stage12/auth security regressions and real Admin Chromium.
- Stage13G Admin Operations `34860143008` — **SUCCESS**, including Admin lint/typecheck/unit/build, API lint/typecheck/unit/build, clean PostgreSQL, DB contract, accounts/access, notifications/operations, reports/settings/security/audit, AI authoring, auth regression and real API + PostgreSQL + Chromium.

AB-03.1.1 is therefore closed without further source mutation.

### AB-03.1.2 — Operations frontend API ownership — DISCOVERED / NEXT

Worker C sequence 35 inspected the live Overview/Operations frontend owners after AB-03.1.1 closure.

Evidence:

- `apps/admin-web/src/admin-operations-api.ts` remains a root-level feature-specific adapter containing all Operations transport functions and response/type contracts (`attention`, `overview`, `governance`, `diagnostics`, `audit`, notifications).
- `AdminOverviewPage`, `AdminOperationsHealthPage`, `AdminOperationsAuditPage` and the remaining Operations pages consume this adapter as feature workflow code; it is not an app-composition or genuinely cross-product root responsibility.
- `AdminRoutes.tsx` still routes directly to legacy `src/admin/overview` and `src/admin/operations` owners; migrating all those pages at once would be broader than the smallest safe increment.
- the only existing feature under `src/features` is auth, so the next move should establish the Operations feature transport boundary without simultaneously moving presentation/model/style ownership.

Decision for the next implementation increment:

- create a narrow Operations feature API owner under `apps/admin-web/src/features/operations/api/` (exact filename may follow repository naming conventions discovered during implementation);
- move the complete contents of root `admin-operations-api.ts` there with behavior and exported type/function names unchanged;
- expose only the needed contract through `apps/admin-web/src/features/operations/public/index.ts`;
- update Overview/Operations consumers to import through that public boundary;
- delete the root transitional `apps/admin-web/src/admin-operations-api.ts` after all consumers switch;
- do **not** move Overview/Operations pages, models or CSS in the same increment;
- do **not** change URLs, request payloads/query construction, response types, session-expiry behavior, backend/API/PostgreSQL contracts, or Student frontend.

Verification required after implementation: Architecture Guard; Admin lint/typecheck/unit/build; focused Overview/Operations tests; Combined Integration and Stage13G real API + PostgreSQL + Chromium because the adapter is runtime transport for operator workflows. No schema migration is expected.

## Exact continuation

Implement **AB-03.1.2 Operations frontend API ownership only** as defined above. Do not combine it with page/model/style migration, route restructuring, UX redesign, backend changes, or Curriculum/Content/OCR. After exact affected-scope verification, close AB-03.1.2 and perform a fresh discovery pass for the next smallest Overview + Operations ownership correction.
