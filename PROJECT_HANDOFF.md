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
10. before structural phase boundaries, compare live `main` against the architecture branch for scoped Admin/API/migrations/shared paths.

Code/migrations/executable CI/runtime evidence outrank prose. Anything not inspected is `NOT YET VERIFIED`.

## 2. Scope

IN:

- complete Super Admin frontend/product/UX/UI/architecture;
- full Fastify API/backend;
- PostgreSQL/migrations/integrity;
- server capabilities consumed by Admin, Student or both;
- relevant shared contracts/design primitives;
- CI/security/integration/browser verification and architecture documentation.

OUT only:

- structural/design implementation of `apps/student-web` frontend.

Student-facing backend remains in scope. Student frontend tests/code may be inspected as consumer regression evidence only when a shared/server contract changes.

## 3. Active branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52: Draft, unmerged, never auto-merge;
- never force-reset/force-push shared history;
- never mix separate Student frontend implementation into this workstream.

Latest live-main observation during Worker A sequence 1: `3053640cc5bb0699cfa7456cf646e8997f6aa81b`, unchanged from prior AB-01 reconciliation.

## 4. Alternating execution

Worker A and Worker B share one roadmap and one branch. Each run performs one smallest coherent increment, writes the shared state, and hands the exact next step to the other worker.

Shared coordination truth:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`

Binding protocol:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`

If the prior worker appears still active, do not mutate overlapping work. Inspect/verify only.

Every run ends in `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE` and records starting/ending HEAD, task, changed ownership/files, CI evidence and exact next step.

## 5. Architecture law

`operator job/use case → DB/API/security contracts → current owner → target owner → product states/flow → backend seam correction where needed → replacement → verify outcome → switch → delete legacy owner → exact-head gates → document`

No patch-only closure. No big-bang rewrite.

### Admin rules

- app composes only;
- app imports features through public/routes boundaries;
- feature internals private;
- cross-feature work uses narrow public contracts/app orchestration;
- shared never imports app/features;
- substantial routes lazy-load;
- one shell/global navigation owner;
- keep verified `/app` base unless runtime evidence says otherwise;
- browser state is not canonical business authority;
- no state/query/styling framework rewrite without evidence.

### Backend rules

- one Fastify modular monolith over PostgreSQL;
- PostgreSQL/API canonical business authority;
- useful direction `HTTP → Application → Domain`, Infrastructure adapters;
- no mandatory empty-layer/interface ceremony;
- no microservices, DI/service locator or generic repository ceremony without evidence;
- public application contracts for genuine cross-module dependencies;
- schema changes only for real domain/integrity requirements;
- security/business authority remains server-owned.

## 6. Product/design rules

Priority: **Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**.

Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class states. No fake data. Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are mandatory. Reuse the approved brand/design system.

## 7. Testing rules

Never weaken tests, validation, auth or security.

As affected require:

- Architecture Guard;
- Admin lint/typecheck/unit/build;
- API lint/typecheck/unit/build;
- clean PostgreSQL migrations;
- relevant backend/auth/security/integration regressions;
- real API + PostgreSQL + Chromium Admin workflow;
- Student consumer regression only for changed shared/server contracts;
- RTL/keyboard/focus/responsive/visual QA for UI changes.

If required CI is still running, use `WAITING_FOR_CI`.

## 8. Current phase and verified closure

- AB-00 — DONE
- AB-01 — ACTIVE
- **AB-01.1 shared Admin API transport/error boundary — DONE**
- **AB-01.2 Auth/session ownership + SessionProvider — DONE**
- AB-01.3 minimum proven shared product-state primitives — NEXT
- AB-01.4 backend app composition foundation — PENDING
- AB-01.5 justified common backend technical foundations — PENDING
- AB-01.6 foundation gate — PENDING

AB-01.1/AB-01.2 final implementation checkpoint: `d955a34087552377dc8b426ec1712e57f59fd8f6`.

Verification:

- Stage13E Admin AI `34800888706` — SUCCESS;
- Stage13E Combined `34800888690` — SUCCESS;
- Stage13G `34800888723` — SUCCESS, including Admin/API quality, clean PostgreSQL, integration/auth regressions and real Chromium;
- Architecture Guard `34799891149` — SUCCESS on last code head `e0b90cd21c404cc1ab6a65200a08385c1a319e5a`;
- all commits from that code head through `d955a340` were documentation-only.

## 9. Exact next engineering task

AB-01.3 — minimum proven Admin product-state primitive.

Next worker must:

1. first inspect the live shared state and exact-head workflows from Worker A documentation commits;
2. if no real regression exists, re-read current Overview + Operations state implementations and any other repeated state patterns;
3. identify one smallest reusable Admin-only primitive with proven duplication, beginning with loading/error/retry if evidence still supports it;
4. keep server/feature-specific copy and recovery semantics with the feature;
5. do not create a generic mega-component;
6. implement one coherent primitive adoption only;
7. run Architecture Guard and relevant Admin/API/PostgreSQL/Chromium gates before advancing.

## 10. Remaining roadmap

- AB-02 thin Admin shell/router/providers/lazy routes;
- AB-03 vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes;
- AB-04 remaining backend modular-monolith debt;
- AB-05 UX/UI convergence;
- AB-06 performance/delivery validation;
- AB-07 legacy deletion + hard dependency enforcement;
- AB-08 final full verification and live-main reconciliation.

Always defer the exact mutation to the live execution-state file because scheduled runs continuously advance the branch.
