# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-02 — Thin Admin shell + routing`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read first: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`, then the autonomous protocol, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, and `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

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

Live `main`: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

Latest implementation changes on main remain Student-focused and do not touch `apps/admin-web`, `apps/api`, or `database/migrations`. Shared project docs changed on main and require deliberate reconciliation before the AB-03 structural phase boundary.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Shared Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — ACTIVE

Canonical execution record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

### AB-02.1 Global Admin shell/layout ownership — DONE

Source checkpoint: `0d07a24aa062ad569ff654524bdc13a4e368f399`. Closure: Architecture Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

### AB-02.2 Inner Admin route-table ownership — DONE

Source checkpoint: `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`. Closure: Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS.

### AB-02.3 Substantial workflow route lazy boundaries — DONE

Source checkpoint: `f60d3d0d163c9f31dead139cc36406396f795a7e`. Closure: Guard `34849322458`, Frontend Preparation `34849322443`, Admin AI `34849322533`, source-tree-equivalent Combined `34849829516`, Stage13G `34849829576` — SUCCESS. Verified initial JS became **196.84 kB / 64.11 kB gzip** with real lazy workflow chunks and no warning-threshold/manualChunks tuning.

### AB-02.4 Auth login presentation ownership — IMPLEMENTED / WAITING_FOR_CI

AB-01 had explicitly left root `LoginScreen.tsx` as transitional AB-02 presentation debt. Source checkpoint `d4c3c7896043ea6b1cc4cac1dd404d7912131916` moves the login presentation to `features/auth/ui/LoginScreen.tsx`, exports it through `features/auth/public`, updates `App.tsx` to consume that public contract, and removes the root file. Login/session behavior is unchanged; no API/DB/migration/Student frontend implementation changed.

Current evidence: Architecture Guard `34853562192` — SUCCESS; Stage13G `34853562095` — in progress; Combined `34853562292` — pending at observation. Therefore AB-02.4 is not DONE yet.

## Remaining roadmap

First close AB-02.4 with green exact-head/source-tree-equivalent evidence, then perform a final AB-02 closure inspection. If no further material shell/router/provider debt is proven, close AB-02 rather than inventing abstraction. Reconcile live `main` before entering AB-03. Then continue AB-03 vertical slices → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
