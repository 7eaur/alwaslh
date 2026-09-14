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
10. before structural phase boundaries, compare live `main` against the architecture branch for scoped paths (`apps/admin-web`, `apps/api`, `database/migrations`, relevant shared packages).

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

Student-facing backend remains in scope. Student frontend tests/code may be inspected as consumer regression evidence when a shared/server contract changes.

## 3. Active branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52: Draft, unmerged, never auto-merge;
- never force-reset/force-push shared history;
- never mix the separate Student frontend branch implementation into this workstream.

## 4. Scheduled alternating execution

Two workers share ONE roadmap and ONE branch:

- Worker A — top of each hour;
- Worker B — half past each hour.

Each worker runs hourly, staggered by 30 minutes, so the project gets one execution opportunity every half hour.

They are not parallel feature owners. The second worker must understand and continue the exact state left by the first; the next A must then continue the exact state left by B.

Shared coordination truth:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`

Binding process/rules:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`

If the prior worker appears still active, do not mutate overlapping work. Inspect/verify only and avoid conflict.

Every run updates the state to one of:

- `READY_FOR_NEXT`;
- `WAITING_FOR_CI`;
- `BLOCKED`;
- `COMPLETE`.

Every run records starting/ending HEAD, worker, task, changed owners/files, CI evidence and exact next smallest step.

## 5. Architecture law

`operator job/use case → DB/API/security contracts → current owner → target owner → product states/flow → backend seam correction where needed → replacement → verify outcome → switch → delete legacy owner → exact-head gates → document`

No patch-only closure. No blind big-bang rewrite. Existing implementation is behavioral evidence, not target architecture.

### Admin

Target:

```text
app/        # bootstrap/router/providers/layouts/error boundaries only
features/   # workflow ownership
shared/     # Admin-only generic patterns/api/lib where truly reusable
styles/
```

Rules:

- app composes only;
- app imports features through public/routes boundaries;
- feature internals private;
- cross-feature dependencies use narrow public contracts/app orchestration;
- shared never imports features/app;
- substantial routes lazy-load;
- one shell/global navigation owner;
- keep verified `/app` base unless runtime evidence says otherwise;
- browser state is not canonical business authority;
- no state/query/styling framework rewrite without evidence.

### Backend

- one Fastify modular monolith over PostgreSQL;
- PostgreSQL/API remain canonical business authority;
- useful direction: `HTTP → Application → Domain`, Infrastructure adapters;
- no mandatory empty layer/interface ceremony;
- no microservices, DI framework, service locator or generic repository ceremony without evidence;
- public application contracts for genuine cross-module dependencies;
- schema changes only for real domain/integrity requirements;
- auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority server-owned.

## 6. Product/design rules

Priority:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**.

- one route/page = one dominant operator job;
- Overview = actionable attention, not duplicated sidebar/KPI decoration;
- no fake metrics/trends/health/progress/outcomes/actions;
- Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class states;
- clickable looks clickable; static looks static;
- primary/secondary/destructive actions distinct;
- technical internals progressively disclosed;
- Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion acceptance mandatory;
- existing brand/Design System reused, not replaced.

## 7. Testing rules

Never weaken tests, validation, auth or security to make migration pass.

Tests prove outcomes/contracts, not obsolete wording/DOM shape.

As applicable require:

- Architecture Guard;
- Admin lint/typecheck/unit/build;
- API lint/typecheck/unit/build;
- clean PostgreSQL migrations;
- relevant backend/auth/security/integration regressions;
- real API + PostgreSQL + Chromium Admin workflow;
- Student consumer regression only for changed shared/server contracts;
- RTL/keyboard/focus/responsive/visual QA for UI changes.

If required CI is still running, use `WAITING_FOR_CI`; never fake `DONE`.

## 8. Current phase

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 shared Admin API transport/error boundary — IMPLEMENTED; live state determines final exact-head completion
- AB-01.2 Auth/session ownership + SessionProvider — IMPLEMENTED; live state determines final exact-head completion
- AB-01.3 minimum proven shared product-state primitives — NEXT once required gates pass
- AB-01.4 backend app composition foundation — PENDING
- AB-01.5 justified common backend technical foundations — PENDING
- AB-01.6 foundation gate — PENDING

Then:

- AB-02 thin Admin shell/router/providers/lazy routes;
- AB-03 end-to-end slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes;
- AB-04 remaining backend modular-monolith debt;
- AB-05 UX/UI convergence;
- AB-06 performance/delivery validation;
- AB-07 legacy deletion + hard dependency enforcement;
- AB-08 final full verification and live-main reconciliation.

## 9. Exact continuation

Do not hard-code a next mutation here because scheduled runs continuously advance it.

Read:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`

That file is the authoritative exact continuation pointer.
