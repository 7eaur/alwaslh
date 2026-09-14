# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: allow any new/manual/scheduled execution to resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## 1. Mandatory startup order

Before any mutation:

1. confirm repo `7eaur/alwaslh`;
2. live-check `main` and `rebuild/super-admin-foundation` HEADs;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` FIRST for the exact continuation point;
4. read `PROJECT_STATUS.md`;
5. read `PROJECT_ENGINEERING_LOG.md`;
6. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`;
7. read the active phase execution doc referenced by status/state;
8. inspect current code/tests/migrations for the active batch;
9. inspect exact-head Actions before claiming health;
10. before structural phase boundaries, compare live `main` for scoped Admin/API/migrations/shared changes.

Code/migrations/executable CI/runtime evidence outrank prose. Anything not inspected is `NOT YET VERIFIED`.

## 2. Scope

IN: complete Super Admin frontend/product/UX/UI/architecture, full Fastify API/backend, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts/design primitives, CI/security/integration/browser verification and architecture documentation.

OUT only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope; Student frontend tests/code may be used as consumer regression evidence when shared/server contracts change.

## 3. Active branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52: Draft, unmerged, never auto-merge;
- never force-reset/force-push shared history;
- never mix separate Student frontend implementation into this workstream.

Latest reconciled `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62` after Student V2 merge #58. No overlapping implementation change affected AB-01.3.

## 4. Alternating execution

Workers A, B and C share one roadmap and branch in serial order `A → B → C`, staggered at `:00`, `:20`, `:40`. Each run performs one smallest coherent increment, writes the shared state, and hands the exact next step to the following worker.

Shared truth: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`.

If the prior worker appears still active, do not mutate overlapping work. Every run ends in `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE` with starting/ending HEAD, task, changes, CI evidence and exact next step. After verified AB-08 completion, the proving worker disables all three scheduled tasks.

## 5. Architecture law

`operator job/use case → DB/API/security contracts → current owner → target owner → product states/flow → backend seam correction where needed → replacement → verify outcome → switch → delete legacy owner → exact-head gates → document`

No patch-only closure. No big-bang rewrite.

### Admin

App composes only; app imports feature public/routes boundaries; feature internals private; shared never imports app/features; substantial routes lazy-load; one shell owns chrome/navigation; preserve verified `/app`; browser state is not canonical authority; no state/query/styling rewrite without evidence.

### Backend

One Fastify modular monolith over PostgreSQL; PostgreSQL/API canonical authority; useful direction `HTTP → Application → Domain` with Infrastructure adapters; no mandatory empty layers/interfaces; no microservices/DI/service locator/generic repository ceremony without evidence; cross-module dependencies use narrow public contracts; schema changes only for real domain/integrity needs.

## 6. Product/design rules

Priority: **Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**.

Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class. No fake data. Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are mandatory. Reuse approved brand/design system.

## 7. Testing rules

Never weaken tests, validation, auth or security. As affected require Architecture Guard; Admin lint/typecheck/unit/build; API lint/typecheck/unit/build; clean PostgreSQL migrations; backend/auth/security/integration regressions; real API + PostgreSQL + Chromium; Student consumer regression only for changed shared/server contracts; RTL/keyboard/focus/responsive/visual QA for UI changes.

If required CI is still running, use `WAITING_FOR_CI`.

## 8. Current phase

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 shared Admin API transport/error boundary — DONE
- AB-01.2 Auth/session ownership + SessionProvider — DONE
- **AB-01.3 minimum proven shared product-state primitive — DONE**
- **AB-01.4 backend app composition foundation — NEXT**
- AB-01.5 justified common backend technical foundations — PENDING
- AB-01.6 foundation gate — PENDING

### AB-01.3 final closure

Source implementation checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

Implemented:
- `apps/admin-web/src/shared/ui/AdminProductState.tsx` — shared Admin-only title/body/optional-retry shell;
- `apps/admin-web/src/shared/ui/admin-product-state.css` — sole styling owner;
- Overview and Operations adopted it;
- duplicate local state components and legacy Operations state CSS removed;
- page-specific state machines, copy, API/session/retry semantics remain feature-owned;
- no unsupported generic empty/permission/conflict/success abstraction.

Closure evidence:
- Architecture Guard `34804704619` — SUCCESS on source head;
- Frontend Preparation `34804704759` — SUCCESS on source head;
- intervening commits to verification head `06127e90a859917ee4d62e33b85f6a8eae0fa769` were proven documentation-only;
- Admin AI `34805721218` — SUCCESS;
- Combined Integration `34805721217` — SUCCESS including real Admin Chromium;
- Stage13G `34805721226` — SUCCESS including Admin/API quality, clean PostgreSQL, integration/auth regressions and real API + PostgreSQL + Chromium.

No source fix was required during Worker B verification.

## 9. Exact next engineering task — AB-01.4 DISCOVERY ONLY

The following worker must not begin with a broad refactor. The smallest coherent increment is to **understand and record the real backend composition seam before mutation**:

1. fetch live branch/main HEADs and current CI/state;
2. inspect `apps/api/src/app.ts` completely;
3. inspect its direct app/config/plugin/service/route construction collaborators as needed;
4. map construction and registration order, including behavior-sensitive dependencies;
5. separate technical app-level responsibilities from module-owned business composition;
6. identify the smallest useful extraction seam that reduces `app.ts` responsibility without changing business rules;
7. identify tests/gates that prove parity and any Student-facing contract impact;
8. document the discovery and exact proposed first extraction;
9. only if that discovery is sufficiently bounded and the one-increment rule still permits it, implementation may be the next worker/run — do not combine discovery with a broad multi-seam rewrite.

Constraints: keep Fastify modular monolith; no DI framework; no generic repository/interface ceremony; no schema migration for folder structure; create only files/folders with real ownership.

## 10. Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes; AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes; AB-04 remaining backend debt; AB-05 UX/UI convergence; AB-06 performance/delivery; AB-07 legacy deletion + hard dependency enforcement; AB-08 final full verification + live-main reconciliation.

Always defer exact mutation to the live execution-state file because scheduled runs continuously advance the branch.
