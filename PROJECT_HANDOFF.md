# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, current code/tests/migrations and exact-head Actions;
6. confirm no active worker collision;
7. compare live `main` at structural phase boundaries or when overlapping scoped changes appear.

Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned here: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification.

Excluded only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

Latest live-main reconciliation shows the only move since the prior checkpoint is Student Experience V2; no `apps/api`, `apps/admin-web`, or `database/migrations` path appears in that main-only delta.

## Execution governance

Workers A/B/C share one branch and roadmap in serial order. Shared state is `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. If another worker is active, do not mutate overlapping work. Each run performs one smallest coherent increment and leaves exact HEAD, CI evidence, next step and one of `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, `COMPLETE`.

## Current phase

- AB-00 — DONE
- AB-01 — **DONE / EXACT-HEAD VERIFIED**
- AB-02 — **ACTIVE**
- AB-03..AB-08 — PENDING

## AB-01 closure evidence

AB-01.5 request-validation owner is `apps/api/src/shared/http/request-validation.ts`; complete source implementation checkpoint is `d0352917f9df83dd15f9fbd7994ad79c1b9447dd`.

The five commits from that checkpoint to verification HEAD `16c7ac34078d75b990422374954f30631ebbee45` changed documentation only.

Verified closure:

- Architecture Guard `34834714337` — SUCCESS;
- Stage13E Admin AI `34834945644` — SUCCESS;
- Stage13E Combined Integration `34834945655` — SUCCESS;
- Stage13G `34834945649` — SUCCESS.

Stage13G proves Admin/API quality, clean PostgreSQL migrations, database contract, relevant integration/security/auth regressions and real API + PostgreSQL + Chromium. Therefore AB-01.5 is DONE and AB-01.6 Foundation Closure Gate is PASS/DONE.

No further foundation extraction is authorized.

## Exact continuation — AB-02 discovery

The next worker must begin AB-02 by inspecting current evidence before mutation:

1. `apps/admin-web/src/App.tsx` — current bootstrap/session/shell/navigation/route responsibilities;
2. current route table and route wrappers;
3. current shell/global chrome/navigation owner(s);
4. feature public/routes entry points and any private imports used by app composition;
5. auth/session provider placement from AB-01.2;
6. route focus/history/deep-link behavior and tests;
7. Admin build/bundle composition and current eager imports;
8. existing app/feature/shared folder ownership and Architecture Guard rules.

Then document one smallest first AB-02 seam. Do not redesign workflow pages in this phase. Preserve auth/session and browser navigation outcomes. Major workflow UI/backend changes belong to AB-03.

Likely target direction remains thin bootstrap/providers/router/layout, one shell/navigation owner, feature public route boundaries and substantial route lazy-loading; however actual implementation must follow inspected live code rather than this prose.

## Verification expectations for first AB-02 mutation

At minimum according to affected scope:

- Architecture Guard;
- Admin lint/typecheck/unit/build;
- relevant auth/session/navigation tests;
- real API + PostgreSQL + Chromium Admin parity when shell/router behavior changes;
- bundle evidence when route/lazy boundaries change.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.