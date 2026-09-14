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

Final AB-02 closure confirmed `App.tsx` composition-only ownership, single `AdminShell`, single inner `AdminRoutes`, auth public boundaries and route-level lazy/Suspense behavior. Existing green Architecture Guard, Combined and Stage13G evidence remains source-tree-equivalent.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — ACTIVE

**AB-03.1.1 Attention application ownership — DONE / SOURCE-TREE-EQUIVALENT VERIFIED.**

Source checkpoint: `5c36365888486cf8297893467bfc4e1c97bc6b43`. Closure evidence: Architecture Guard `34859593842` — SUCCESS; Admin AI `34860142887` — SUCCESS; Combined `34860142983` — SUCCESS; Stage13G `34860143008` — SUCCESS.

**AB-03.1.2 Operations frontend API ownership — DISCOVERED / NEXT.**

Live discovery found `apps/admin-web/src/admin-operations-api.ts` still owns feature-specific Operations transport/types at root while Overview and Operations pages consume it. The next smallest correction is to move this adapter into `features/operations/api`, expose a narrow `features/operations/public` contract, update only the existing Overview/Operations consumers, and delete the root transitional adapter. Do not move pages/models/styles or change backend/API/PostgreSQL behavior in the same increment.

Required verification after implementation: Architecture Guard; Admin lint/typecheck/unit/build; focused Overview/Operations tests; Combined Integration; Stage13G real API + PostgreSQL + Chromium.

## Remaining roadmap

Finish Overview + Operations only, then AB-03 slices in canonical order: Curriculum + Content + OCR → AI → Question Bank → Quiz Builder → Students → Access Codes. Then AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
