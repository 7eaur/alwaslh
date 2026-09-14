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

Live `main` at AB-03 startup: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

AB-02 → AB-03 phase-boundary reconciliation is complete. The live-main-only implementation delta is Student frontend/workflow plus Student-specific CI/docs; no `apps/admin-web`, `apps/api`, or `database/migrations` implementation overlap was found. Shared project docs diverge and remain branch-local workstream authority until final reconciliation.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Shared Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

### AB-02.1 Global Admin shell/layout ownership — DONE

Source checkpoint: `0d07a24aa062ad569ff654524bdc13a4e368f399`. Closure: Architecture Guard `34838037118`, Frontend Preparation `34838037114`, Combined `34838123077`, Stage13G `34838123143` — SUCCESS.

### AB-02.2 Inner Admin route-table ownership — DONE

Source checkpoint: `732555cb9b8499c712ad6cd19ad50cccf26a8e4a`. Closure: Guard `34840954071`, Frontend Preparation `34840953959`, Admin AI `34841142948`, Combined `34841142987`, Stage13G `34841142975` — SUCCESS.

### AB-02.3 Substantial workflow route lazy boundaries — DONE

Source checkpoint: `f60d3d0d163c9f31dead139cc36406396f795a7e`. Closure: Guard `34849322458`, Frontend Preparation `34849322443`, Admin AI `34849322533`, source-tree-equivalent Combined `34849829516`, Stage13G `34849829576` — SUCCESS. Verified initial JS became **196.84 kB / 64.11 kB gzip** with real lazy workflow chunks and no warning-threshold/manualChunks tuning.

### AB-02.4 Auth login presentation ownership — DONE

Source checkpoint `d4c3c7896043ea6b1cc4cac1dd404d7912131916` moved login presentation into `features/auth/ui/LoginScreen.tsx`, exposed it through `features/auth/public`, updated `App.tsx` to consume the public contract, and removed the transitional root file with no login/session behavior change.

Source-tree-equivalent verification head `080b8e131da72b0795f647809239a815d4604210` differs from the implementation checkpoint only by canonical/shared documentation. Closure evidence: Architecture Guard `34853562192` — SUCCESS; Admin AI `34853935899` — SUCCESS; Combined Integration `34853935696` — SUCCESS; Stage13G `34853935720` — SUCCESS, including Admin/API quality, clean PostgreSQL migrations/contracts, auth/security/integration regressions, and Real API + PostgreSQL + Chromium.

### AB-02 final closure inspection — DONE

Live inspection confirms:

- `App.tsx` composes session/provider/authenticated shell only;
- `AdminShell` is the single global chrome/navigation owner;
- `AdminRoutes` owns the inner `/app/*` table, redirects/not-found wrappers and route-level Suspense/lazy boundaries;
- auth/session internals are consumed only through `features/auth/public` at app composition boundaries;
- remaining legacy `src/admin/*` workflow ownership is intentionally deferred to AB-03 vertical slices, not an AB-02 blocker.

No additional shell/router/provider abstraction is justified.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — ACTIVE

First correction, **AB-03.1.1 Attention application ownership**, is implemented at source checkpoint `5c36365888486cf8297893467bfc4e1c97bc6b43`.

- governance + audit orchestration moved from the Fastify HTTP route into `admin-operations/attention-application.ts`;
- HTTP retains authorization/query validation and calls the application owner;
- API path, PostgreSQL authority, response shape and security behavior are unchanged;
- a dedicated application-owner test was added;
- no Admin or Student frontend source and no migration/schema changed.

Verification so far: Architecture Guard `34859593842` — SUCCESS on the implementation tree; exact-source Admin AI `34859616706` — SUCCESS; Combined `34859616648` and Stage13G `34859617164` were still running at handoff. Therefore AB-03.1.1 is **WAITING_FOR_CI**, not DONE.

## Remaining roadmap

Finish AB-03.1 verification and continue Overview + Operations only, then AB-03 slices in canonical order: Curriculum + Content + OCR → AI → Question Bank → Quiz Builder → Students → Access Codes. Then AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.