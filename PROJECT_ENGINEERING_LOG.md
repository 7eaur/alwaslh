# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-03.1.1 attention application ownership closed with source-tree-equivalent green CI.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main at AB-03 startup and latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

AB-02 → AB-03 phase-boundary reconciliation compared live main against the work branch. The live-main-only implementation delta is confined to Student frontend/workflow and Student-specific CI/product documentation; no `apps/admin-web`, `apps/api`, or `database/migrations` implementation overlap was found. Shared top-level docs diverge and must continue to be reconciled deliberately.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, five bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

### AB-02.1 — Global shell/layout ownership — DONE

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; closure Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

### AB-02.2 — Inner Admin route-table ownership — DONE

Source checkpoint `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`; closure Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS.

### AB-02.3 — Substantial workflow route lazy boundaries — DONE

Source checkpoint `f60d3d0d163c9f31dead139cc36406396f795a7e`; closure Guard `34849322458`, Frontend Preparation `34849322443`, Admin AI `34849322533`, source-tree-equivalent Combined `34849829516`, Stage13G `34849829576` — SUCCESS. Verified initial JS is **196.84 kB / 64.11 kB gzip**, with independent lazy workflow chunks and no artificial warning/manualChunks tuning.

### AB-02.4 — Auth login presentation ownership — DONE

Source implementation checkpoint: `d4c3c7896043ea6b1cc4cac1dd404d7912131916`.

Correction:

- moved login presentation to `apps/admin-web/src/features/auth/ui/LoginScreen.tsx`;
- exposed it through `apps/admin-web/src/features/auth/public/index.ts`;
- changed `App.tsx` to compose `LoginScreen` through the auth public boundary;
- deleted the transitional root `LoginScreen.tsx`.

Behavior remained unchanged: same credentials form, browser validation attributes, pending/error behavior, `loginAdmin` call, profile callback, session acceptance and post-auth focus.

Closure evidence:

- source checkpoint → verification head `080b8e131da72b0795f647809239a815d4604210` changes only canonical/shared documentation;
- Architecture Guard `34853562192` — SUCCESS;
- Admin AI `34853935899` — SUCCESS;
- Combined Integration `34853935696` — SUCCESS;
- Stage13G `34853935720` — SUCCESS, including Admin lint/typecheck/unit/build, API lint/typecheck/unit/build, clean PostgreSQL migrations, DB contract, accounts/access/operations/security/audit/AI integration, auth regression and Real API + PostgreSQL + Chromium.

### Final AB-02 closure inspection

Worker C inspected live `App.tsx`, `AdminShell`, `AdminRoutes`, outer router/bootstrap, auth public contract and session provider.

Findings:

- root `App.tsx` is composition-only for session/provider/authenticated shell;
- `AdminShell` is the single global navigation/chrome owner;
- `AdminRoutes` is the single inner route-table owner and holds substantial route lazy/Suspense boundaries;
- auth/session is feature-owned and exposed through a narrow public boundary;
- outer router owns `/app`, focus and outer not-found behavior;
- remaining `src/admin/*` workflow pages are deliberate AB-03 migration targets, not evidence for another AB-02 abstraction.

No material AB-02 shell/router/provider debt remains. Comparing verification head `080b8e...` to the documentation-only handoff chain shows only the five canonical/shared documentation files changed; no Admin/API/migration/test/workflow source changed. Therefore the existing green source-tree-equivalent Guard/Combined/Stage13G evidence remains valid for AB-02 closure.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1.1 — Operations attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Discovery established that `AdminOverviewPage` consumes `/v1/admin/operations/attention`, while PostgreSQL-backed governance/audit authority lives in `apps/api/src/admin-operations/service.ts`. The route in `admin-operations/http.ts` was still orchestrating two application reads and building the Overview projection itself.

Root correction at source checkpoint `5c36365888486cf8297893467bfc4e1c97bc6b43`:

- created `admin-operations/attention-application.ts` with `loadOperationsAttention(...)` as the use-case owner;
- moved concurrent governance + audit orchestration there;
- left HTTP with admin authorization, Zod query validation and application invocation only;
- retained `attention.ts` as the pure projection;
- added `admin-operations-attention-application.test.ts` proving orchestration inputs and projection result;
- preserved API path, SQL/PostgreSQL authority, response contract and security behavior;
- changed no migrations/schema, Admin frontend or Student frontend.

Closure evidence:

- Architecture Guard `34859593842` — SUCCESS on implementation tree `fe2f3e8811e78e03662a759127dd35fe3588b336`; final source checkpoint adds only the dedicated application test.
- Compare `5c363658...` → `d350ce8...` shows only `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`, and `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`; therefore the verification head is source-tree equivalent.
- Admin AI `34860142887` — SUCCESS.
- Combined `34860142983` — SUCCESS: API/Admin quality gates, clean PostgreSQL migrations, DB contract, backend-authority regressions, Stage12/auth security regressions, real Admin Chromium.
- Stage13G `34860143008` — SUCCESS: Admin/API lint/typecheck/unit/build, clean PostgreSQL, database contract, accounts/access, notifications/operations, reports/settings/security/audit, AI authoring, auth regression and real API + PostgreSQL + Chromium.

No source mutation was required to close the increment.

## Exact continuation

Run one **AB-03.1 Overview + Operations discovery-only** increment next. Re-read live Overview/Operations frontend and backend owners and tests, then choose exactly one smallest root ownership correction. Inspect the root transitional `apps/admin-web/src/admin-operations-api.ts`, legacy `src/admin/overview` / `src/admin/operations` ownership, and remaining Operations HTTP/application seams as candidates; do not pre-commit to a target without evidence. Do not start Curriculum/Content/OCR in the same increment.

Remaining roadmap: AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification/reconciliation.