# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-02.3 lazy workflow route seam selected after code + current build evidence review.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains a separate workstream; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` as the serial handoff authority. Never auto-merge or rewrite shared history.

Live main: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`. Main implementation changes remain Student-focused and do not overlap Admin/API/migrations; shared project docs require deliberate later reconciliation.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Admin transport/session/product-state foundations, five bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

### AB-02.1 — Global shell/layout ownership — DONE

Source checkpoint `0d07a24aa062ad569ff654524bdc13a4e368f399`; owner `apps/admin-web/src/app/layouts/AdminShell.tsx`. Closure: Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

### AB-02.2 — Inner Admin route-table ownership — DONE

Source checkpoint `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`; owner `apps/admin-web/src/app/router/AdminRoutes.tsx`. Closure: Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS on source/source-tree-equivalent heads.

### AB-02.3 — Substantial workflow route lazy boundaries — SELECTED

Discovery findings:

- `AdminRoutes.tsx` statically imports all major workflow destinations: Overview, Curriculum, Content/Lesson Tools, Reviews, Questions, Quizzes, Students, Access Codes, Operations and AI Authoring.
- AB-00 measured one `968.68 kB / 193.92 kB gzip` JavaScript chunk and Vite >500 kB warning.
- Latest verified Stage13G Admin build `34841142975`, job `103966179619`, transformed 116 modules and emitted one JavaScript chunk: `446.30 kB / 117.48 kB gzip`.
- The current size is materially improved and under the former warning threshold, but route/workflow code is still eager; warning disappearance is not equivalent to route-level code splitting.
- Existing `PageState kind="loading"` can provide an accessible Suspense fallback; no new loading primitive or dependency is justified.

Decision:

- keep route-table ownership in `app/router/AdminRoutes.tsx`;
- convert substantial workflow page imports to `React.lazy()` dynamic boundaries;
- use one route-level `Suspense` fallback using existing product-state presentation;
- adapt named exports only at import boundaries; do not rewrite workflow exports merely for lazy loading.

Preserve URLs/redirects, `onSessionExpired`, route focus/deep links, auth/session behavior, workflow UI/business logic and transitional `src/admin/*` ownership.

Explicitly exclude feature migration, navigation/auth redesign, error-boundary redesign, manual chunk tuning, warning-threshold changes and Student/API/DB changes from this batch.

Closure requires Architecture Guard, Admin lint/typecheck/unit/build, measured dynamic chunk output, representative deep links/session expiry, Combined and Stage13G real Chromium.

## Exact continuation

Implement AB-02.3 only. After green source/equivalent-head gates and measured chunk evidence, close the seam before selecting any additional AB-02 concern.

Remaining roadmap: AB-02 → AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification/reconciliation.
