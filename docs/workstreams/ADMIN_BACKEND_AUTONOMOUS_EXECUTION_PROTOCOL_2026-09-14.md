# Admin + Backend Autonomous Execution Protocol — الوسيلة الذكية

Date: 2026-09-14
Status: ACTIVE / BINDING
Branch: `rebuild/super-admin-foundation`
Draft PR: #52 — remain Draft; never auto-merge.

## 1. Purpose

This protocol governs the two scheduled alternating execution workers that continue the Admin + Backend rebuild every 30 minutes in a safe serial handoff pattern.

The two workers do NOT own separate code areas. They share one ordered roadmap and one branch. Each worker must understand the exact state left by the previous worker, execute the smallest correct next step, verify it, then leave a precise handoff for the other worker.

Goal: continuous progress without parallel conflicting mutations, duplicated work, architecture drift, or undocumented state.

## 2. Scope

Owned by this workstream:

- complete Super Admin frontend architecture/product/UX/UI;
- full Fastify backend/API;
- PostgreSQL schema/migrations/integrity;
- security, auth/session/device, access/entitlements, curriculum/publication, content/media/OCR, AI/review, Question Bank, Quiz Builder, assessment/scoring, offline authorization/integrity, notifications and operations;
- shared packages only when a real shared contract/design responsibility exists;
- CI, contract/integration/security/browser verification;
- architecture documentation and handoff state.

Only structural exclusion:

- `apps/student-web` frontend redesign/restructure belongs to the separate Student workstream.

Student-facing backend contracts remain owned here. Student code/tests may be inspected only as compatibility evidence when server/shared contracts change.

## 3. Source of truth order

1. repository code on the current branch;
2. PostgreSQL migrations/schema;
3. executable CI/tests;
4. verified runtime/browser evidence;
5. current canonical documentation.

Never substitute old chat context for current repository evidence.

## 4. Mandatory startup for EVERY scheduled run

Before any mutation, the worker MUST:

1. fetch live HEAD of `rebuild/super-admin-foundation`;
2. fetch live `main` HEAD;
3. read `PROJECT_STATUS.md`;
4. read `PROJECT_ENGINEERING_LOG.md`;
5. read `PROJECT_HANDOFF.md`;
6. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`;
7. read the active roadmap docs listed in `PROJECT_STATUS.md`;
8. inspect exact-head Actions/CI for the current branch;
9. inspect current code/tests for the active batch;
10. confirm no unresolved conflicting work is already active.

Anything not inspected is `NOT YET VERIFIED`.

## 5. Alternating worker law

Two workers operate in strict sequence:

- Worker A — top of the hour;
- Worker B — half past the hour.

Each worker runs hourly, staggered by 30 minutes, producing one execution opportunity every half hour.

Both workers MUST continue the SAME ordered roadmap. Neither worker may start an unrelated task merely because the other worker touched the current task.

The next worker always treats the repository + execution state file as authoritative handoff.

## 6. Mutual-exclusion / anti-collision protocol

Before mutation, inspect `ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`.

If state is `RUNNING` and the recorded lease/start is recent enough that the prior worker may still be executing, DO NOT mutate overlapping code. Instead:

- inspect CI/state only;
- record that execution was skipped due to active lease if safe to do so;
- leave the branch unchanged.

If the prior run is clearly stale/abandoned, reconcile actual HEAD and CI before taking ownership.

At the start of a real execution batch, update the state to:

- `RUNNING`;
- worker identity A or B;
- observed starting HEAD;
- active roadmap item/subtask;
- intended smallest next step;
- start timestamp.

At the end of the run, update state to exactly one of:

- `READY_FOR_NEXT` — completed a safe increment; next worker may continue;
- `WAITING_FOR_CI` — implementation is done but required exact-head gates are still running;
- `BLOCKED` — real blocker needs resolution before continuing;
- `COMPLETE` — roadmap fully finished and final verification complete.

Never leave state as `RUNNING` after finishing normally.

## 7. Execution size rule

Each scheduled run should perform ONE smallest coherent high-confidence increment, not open multiple fronts.

A valid increment usually does one of:

- finish/verify the currently active subtask;
- implement one small architecture boundary;
- migrate one owner seam;
- add one necessary test/guard;
- complete one UI state primitive proven by duplication;
- close one backend composition seam;
- complete one vertical-slice step.

Do not start a second major concern merely because time remains.

## 8. Required reasoning before mutation

For every batch answer internally and, where durable, document:

1. What operator job/backend use case is being improved?
2. What is the current owner?
3. What is the target owner?
4. What API/DB/security contract must remain true?
5. What old owner/compatibility path will eventually be deleted?
6. What tests prove parity?
7. Could this change break the separate Student frontend consumer?
8. Is the change a root fix or merely a patch?
9. Is any abstraction/framework being introduced without evidence?
10. What exact-head gates are required before advancing?

## 9. Permanent architecture rules

### Admin

- `app` composes only;
- features own workflows/routes/API adapters/models/components/tests/styles;
- app imports features only through public/routes entry points;
- feature internals are private;
- cross-feature work uses narrow public contracts or app orchestration;
- shared never imports app/features;
- no new feature files in root `src/`;
- one shell owns global chrome/navigation;
- substantial workflow routes lazy-load by default;
- keep verified `/app` base unless runtime evidence justifies changing it;
- browser state is not canonical business authority;
- no new global state/query framework without evidence;
- no styling-stack rewrite without evidence.

### Backend

- one Fastify modular monolith;
- PostgreSQL/API remain canonical business authority;
- conceptual direction where useful: `HTTP → Application → Domain`, infrastructure as technical adapter;
- do not create empty layers/interfaces for ceremony;
- no microservices, DI framework, service locator, generic repositories everywhere, or interface ceremony without demonstrated value;
- app composition must not import private module internals in new architecture;
- cross-module work uses narrow public application contracts when genuinely needed;
- schema changes require domain/integrity need, never folder cleanup;
- auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority remains server-owned.

## 10. Product / UX / design rules

Priority:

`Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish`

Binding rules:

- one route/page = one dominant operator job;
- Overview answers “what needs attention now?”;
- no fabricated metrics, counts, progress, health, outcomes or actions;
- Loading / Empty / Error / Permission / Conflict / Unavailable / Long-running / Success / Recovery are first-class product states;
- clickable looks clickable; static looks static;
- primary / secondary / destructive actions are visually distinct;
- technical IDs/provider/runtime/storage/raw JSON use progressive disclosure unless needed for the decision;
- Arabic-first / RTL-native;
- keyboard/focus/deep-link/back-navigation are first-class;
- responsive/no-overflow required;
- reduced-motion respected;
- use existing approved brand/design system; no second visual identity;
- cards/tabs/dialogs are not default containers: use only when semantically correct;
- UI completion never implies backend completion without authoritative server evidence.

## 11. Testing / verification rules

Never weaken tests, validation, auth or security to make migration pass.

Tests assert durable outcomes/contracts, not obsolete wording or DOM shape.

Required according to affected scope:

- architecture guard;
- Admin lint/typecheck/unit/build;
- API lint/typecheck/unit/build;
- clean PostgreSQL migrations;
- relevant backend integration/security/auth regressions;
- real API + PostgreSQL + Chromium Admin flow;
- Student consumer regression only when changed backend/shared contracts affect it;
- RTL/keyboard/focus/responsive/visual QA where UI changes.

A worker may document `WAITING_FOR_CI`; it must not falsely mark the subtask `DONE` before required exact-head gates are green.

## 12. No-conflict Git rules

- work only on `rebuild/super-admin-foundation`;
- do not touch the separate Student frontend implementation;
- never force-push/reset shared history;
- never auto-merge PR #52;
- before structural phase boundaries, compare live `main` for Admin/API/migrations/shared-contract changes;
- if live `main` gains scoped changes, pause and reconcile deliberately;
- commits must be small, coherent and accurately named;
- no broad rename/move without ownership evidence;
- no permanent dual ownership.

## 13. Documentation rule after EVERY scheduled run

Before finishing, update the SAME shared truth:

1. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` — mandatory every run;
2. `PROJECT_STATUS.md` when stage/subtask/CI truth changes;
3. `PROJECT_ENGINEERING_LOG.md` when durable engineering evidence/decision/change occurs;
4. `PROJECT_HANDOFF.md` when exact continuation point changes materially;
5. relevant canonical architecture/workstream doc when the plan/decision itself changes;
6. PR #52 comment for significant completed/blocked milestones, not noisy trivial updates.

Every handoff must record:

- worker A/B;
- starting HEAD;
- ending HEAD;
- exact files/owners changed;
- what was verified;
- CI run IDs/status if applicable;
- active task state;
- exact next smallest step;
- blocker/risk if any;
- whether `main` reconciliation is required.

## 14. Current ordered roadmap

### AB-00 — Architecture baseline & guardrails — DONE

- AB-00.1 ownership/boundary map — DONE
- AB-00.2 dependency/migration inventory — DONE
- AB-00.3 architecture guard — DONE
- AB-00.4 measured baseline — DONE
- AB-00.5 readiness gate — DONE

### AB-01 — Shared foundations — ACTIVE

Ordered subtasks:

1. AB-01.1 shared Admin API transport/error boundary;
2. AB-01.2 Auth/session feature ownership and session lifecycle extraction from App root;
3. AB-01.3 minimum proven shared Admin product-state primitives;
4. AB-01.4 backend app composition extraction without business-rule change;
5. AB-01.5 justified common backend technical foundations only;
6. AB-01.6 foundation exact-head verification gate.

AB-01.1 and AB-01.2 are implemented; exact-head verification may still be running at the time this protocol was created. Always re-read live state rather than assuming completion.

### AB-02 — Thin Admin shell + routing

- bootstrap/providers;
- one shell/navigation owner;
- router/layout/error boundary;
- feature public route entry points;
- substantial route lazy loading/Suspense;
- route focus/history/deep links;
- remove feature knowledge from App root;
- preserve auth/session outcomes in real Chromium.

### AB-03 — End-to-end vertical slices

Order:

1. Overview + Operations
2. Curriculum + Content + OCR
3. AI Jobs + AI Review + contextual authoring transitions
4. Question Bank
5. Quiz Builder
6. Students
7. Access Codes

Each slice follows:

`job → DB/API/security → backend boundary correction → IA/states/actions → frontend owner → integration/browser parity → switch → delete legacy`

### AB-04 — Remaining backend modular-monolith normalization

- close remaining private cross-module seams;
- finish app composition extraction;
- standardize useful module boundaries;
- verify transactions/auth/errors;
- preserve Student-facing server contracts;
- eliminate backend debt not naturally closed by AB-03.

### AB-05 — Admin design/interaction convergence audit

- duplicate primitives/one-off CSS;
- hierarchy/forms/tables/actions/states;
- duplicate navigation;
- technical-detail leakage;
- RTL/a11y/responsive/reduced-motion/visual QA.

### AB-06 — Performance/delivery validation

- route/code splitting evidence;
- dead/duplicate code/CSS/dependencies;
- fetch waterfalls/state duplication;
- backend query/payload bottlenecks based on evidence;
- evidence-based budgets;
- never hide debt by raising warning thresholds.

### AB-07 — Legacy removal + hard dependency enforcement

- delete root compatibility APIs/components/styles/aliases when unused;
- remove temporary redirects/exceptions;
- remove dual ownership;
- harden Architecture Guard to target architecture.

### AB-08 — Final verification

- Admin/API lint/typecheck/unit/build;
- API contracts;
- clean PostgreSQL migrations;
- integration/security/auth/offline/assessment regressions as affected;
- Student consumer regression for changed shared/server contracts;
- real Admin API + PostgreSQL + Chromium workflows;
- keyboard/focus/RTL/a11y/responsive/no-overflow;
- bundle/performance evidence;
- visual QA;
- documentation consistency;
- final reconciliation with live `main`.

PR #52 remains Draft until AB-08 exact-head green.

## 15. Stop conditions

A scheduled worker must stop and record `BLOCKED` instead of improvising if:

- required source of truth cannot be inspected;
- branch/HEAD changed unexpectedly and cannot be reconciled confidently;
- live `main` introduces overlapping Admin/API/migration/shared changes;
- required CI exposes a real regression not yet understood;
- a schema/security/business-rule change would be needed without sufficient evidence;
- another worker appears actively mutating the same branch;
- progress would require touching Student frontend implementation;
- the only available path is a patch that violates the root architecture rules.

High confidence and continuity are more important than maximizing mutations per run.
