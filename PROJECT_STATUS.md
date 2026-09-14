# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.1 Overview + Operations`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read first: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`, then the autonomous protocol, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, and the active workstream record.

Workers A/B/C share one branch and ordered roadmap. Never overlap an active worker. Every run performs one smallest coherent increment.

## Permanent rules

- PostgreSQL/API are canonical business authority.
- Backend stays one Fastify modular monolith; no microservices/DI/service locator without evidence.
- Admin `app` composes only; features own workflows and expose narrow public/routes boundaries.
- Feature internals stay private; shared cannot import app/features.
- No new global state/query framework or styling-stack rewrite without evidence.
- No fabricated metrics/outcomes/actions.
- Product states, Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are first-class requirements.
- Tests/security/validation are never weakened.
- No permanent dual ownership.

## Branch reconciliation

Live `main` latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

AB-02 → AB-03 phase-boundary reconciliation is complete. The live-main-only implementation delta is Student frontend/workflow plus Student-specific CI/docs; no `apps/admin-web`, `apps/api`, or `database/migrations` implementation overlap was found. Shared project docs diverge and remain branch-local workstream authority until final reconciliation.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Shared Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

- AB-02.1 Global shell/layout ownership — DONE.
- AB-02.2 Inner Admin route-table ownership — DONE.
- AB-02.3 Substantial workflow route lazy boundaries — DONE.
- AB-02.4 Auth login presentation ownership — DONE.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — ACTIVE

**AB-03.1.1 Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.**

Source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`. Closure evidence: Architecture Guard `34859593842` — SUCCESS; Admin AI `34860142887` — SUCCESS; Combined `34860142983` — SUCCESS; Stage13G `34860143008` — SUCCESS.

**AB-03.1.2 Operations frontend API ownership — ROOT FIX APPLIED / WAITING_FOR_CI.**

Current source checkpoint: `abe4f2c935cf09a84e7be29d94f5bd59f8c2cfc0`.

Worker A moved Operations transport/types to `apps/admin-web/src/features/operations/api/admin-operations-api.ts` and exposed them through `features/operations/public`, but the next exact verification exposed three stale imports left behind by that move. Worker B sequence 37 fixed only that ownership regression:

- `admin/operations/operations-model.ts` now consumes Operations types through the feature public boundary;
- `admin/operations/operations-model.test.ts` uses the same public boundary;
- the Operations API transport test is colocated at `features/operations/api/admin-operations-api.test.ts` and the stale root test owner was removed;
- no endpoint, payload, response, session, backend/API, PostgreSQL, security, route, style, or Student frontend behavior changed.

Exact source-head verification currently:

- Architecture Guard `34868596586` — **SUCCESS**.
- Frontend Preparation `34868596646` — **SUCCESS**.
- Admin AI Operations `34868596701` — **SUCCESS**.
- Combined Integration `34868596865` — **IN PROGRESS** at last observation.
- Stage13G Admin Operations `34868596682` — **IN PROGRESS** at last observation.

AB-03.1.2 therefore remains open. Exact continuation is verification/closure only: require Combined and Stage13G real API + PostgreSQL + Chromium to finish green on this source tree or a proven documentation-only equivalent. Do not start another ownership seam or Curriculum/Content/OCR before closure.

## Remaining roadmap

Finish Overview + Operations only, then AB-03 slices in canonical order: Curriculum + Content + OCR → AI → Question Bank → Quiz Builder → Students → Access Codes. Then AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.