# Admin + Backend Autonomous Execution Protocol — الوسيلة الذكية

Date: 2026-09-14  
Status: **ACTIVE / BINDING**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: #52 — remain Draft; never auto-merge.

## 1. Purpose

This protocol governs **three scheduled alternating workers** that continue the Admin + Backend rebuild in one serial roadmap with a 20-minute handoff cadence.

The workers do **not** own separate code areas. They share one branch, one roadmap, one execution-state file and one source of truth. Every worker must understand the exact state left by the previous worker, execute only the smallest correct next increment, verify it, then leave a precise handoff.

Goal: continuous high-confidence progress without parallel conflicting mutations, duplicated work, architecture drift, stale assumptions or undocumented state.

## 2. Scheduler topology

Strict recurring order:

- **Worker A** — every hour at `:00`;
- **Worker B** — every hour at `:20`;
- **Worker C** — every hour at `:40`.

Thus the project receives one scheduled execution opportunity every 20 minutes:

`A → B → C → A → B → C → ...`

All workers continue the **same ordered roadmap**. No worker may invent an unrelated task merely because another worker touched the active task.

### Automatic shutdown rule

The schedule is temporary and exists only until the roadmap is finished.

When `AB-08` is fully complete with required exact-head green evidence and `ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` is set to `COMPLETE`, the worker that proves completion MUST immediately disable all three scheduled tasks:

- `Alwaslh Worker A`
- `Alwaslh Worker B`
- `Alwaslh Worker C`

No scheduled run should continue after verified project completion.

## 3. Scope

Owned here:

- complete Super Admin frontend architecture/product/UX/UI;
- full Fastify backend/API;
- PostgreSQL schema/migrations/integrity;
- auth/session/device, security, access/entitlements, curriculum/publication, content/media/OCR, AI/review, Question Bank, Quiz Builder, assessment/scoring, offline authorization/integrity, notifications and operations;
- shared packages only when a genuine shared contract/design responsibility exists;
- CI, contracts, integration/security/browser verification;
- architecture documentation and handoff state.

Only structural exclusion:

- `apps/student-web` frontend redesign/restructure belongs to the separate Student workstream.

Student-facing backend contracts remain owned here. Student frontend code/tests may be inspected only as compatibility evidence when shared/server contracts change.

## 4. Source of truth order

1. repository code on the current branch;
2. PostgreSQL migrations/schema;
3. executable CI/tests;
4. verified runtime/browser evidence;
5. current canonical documentation.

Old chat context never overrides current repository evidence.

## 5. Mandatory startup for EVERY run

Before any mutation, each worker MUST:

1. fetch live HEAD of `rebuild/super-admin-foundation`;
2. fetch live `main` HEAD;
3. read `PROJECT_STATUS.md`;
4. read `PROJECT_ENGINEERING_LOG.md`;
5. read `PROJECT_HANDOFF.md`;
6. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`;
7. read active roadmap/architecture docs listed in `PROJECT_STATUS.md`;
8. inspect exact-head Actions/CI for current branch;
9. inspect current code/tests for the active batch;
10. confirm no unresolved active worker lease/conflicting mutation exists.

Anything not inspected is `NOT YET VERIFIED`.

## 6. Mutual exclusion / anti-collision law

`ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` is the shared lease and handoff authority.

If state is `RUNNING` and the recorded start/lease is recent enough that another worker may still be executing, the next worker MUST NOT mutate overlapping code. It may inspect CI/state only and leave the branch unchanged.

If a previous run looks stale/abandoned, reconcile actual HEAD + CI before taking ownership.

At start of a real batch, record:

- `RUNNING`;
- worker identity `A | B | C`;
- sequence number;
- start timestamp;
- observed starting HEAD;
- active roadmap item/subtask;
- intended smallest next step.

At the end, state must be exactly one of:

- `READY_FOR_NEXT` — safe increment complete;
- `WAITING_FOR_CI` — implementation/documentation done but required exact-head gates still running;
- `BLOCKED` — real blocker needs resolution;
- `COMPLETE` — AB-08 and final verification fully complete.

Never leave state as `RUNNING` after a normal finish.

## 7. Execution-size rule

Each scheduled run performs **ONE smallest coherent high-confidence increment**.

Examples:

- finish/verify the currently active subtask;
- implement one architecture boundary;
- migrate one owner seam;
- add one necessary test/guard;
- extract one product-state primitive proven by duplication;
- close one backend composition seam;
- complete one vertical-slice step.

Do not start a second major concern merely because time remains.

## 8. Required reasoning before mutation

For every batch establish:

1. operator job/backend use case;
2. current owner;
3. target owner;
4. authoritative API/DB/security contract;
5. legacy/compatibility owner and deletion condition;
6. tests proving parity;
7. possible Student-consumer impact;
8. whether this is a root fix rather than a patch;
9. whether any abstraction/framework is being introduced without evidence;
10. exact-head gates required before advancing.

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
- useful dependency direction: `HTTP → Application → Domain`, with Infrastructure as technical adapter;
- do not manufacture empty layers/interfaces;
- no microservices, DI framework, service locator, universal repositories or interface ceremony without demonstrated value;
- new app composition must not import private module internals;
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
- technical IDs/provider/runtime/storage/raw JSON use progressive disclosure unless required for the decision;
- Arabic-first / RTL-native;
- keyboard/focus/deep-link/back-navigation are first-class;
- responsive/no-overflow required;
- reduced-motion respected;
- reuse approved brand/design system; no second visual identity;
- cards/tabs/dialogs are not default containers;
- UI completion never implies backend completion without authoritative server evidence.

## 11. Testing / verification rules

Never weaken tests, validation, auth or security to make migration pass.

Tests assert durable outcomes/contracts, not obsolete wording or DOM shape.

According to affected scope, require:

- Architecture Guard;
- Admin lint/typecheck/unit/build;
- API lint/typecheck/unit/build;
- clean PostgreSQL migrations;
- relevant backend integration/security/auth regressions;
- real API + PostgreSQL + Chromium Admin flow;
- Student consumer regression when a changed server/shared contract affects it;
- RTL/keyboard/focus/responsive/visual QA for UI changes.

A worker may record `WAITING_FOR_CI`; it must never falsely mark a subtask `DONE` before its required exact-head gates are green.

## 12. Git / branch rules

- work only on `rebuild/super-admin-foundation`;
- do not touch Student frontend implementation;
- never force-push/reset shared history;
- never auto-merge PR #52;
- before structural phase boundaries compare live `main` for Admin/API/migrations/shared-contract changes;
- if live `main` gains overlapping scoped changes, pause and reconcile deliberately;
- commits must be small, coherent and accurately named;
- no broad rename/move without ownership evidence;
- no permanent dual ownership.

## 13. Documentation after EVERY run

Mandatory shared handoff:

1. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` — update every run;
2. `PROJECT_STATUS.md` when stage/subtask/CI truth changes;
3. `PROJECT_ENGINEERING_LOG.md` for durable engineering evidence/decision/change;
4. `PROJECT_HANDOFF.md` when exact continuation changes materially;
5. relevant canonical workstream/architecture doc when plan/decision changes;
6. PR #52 comment only for significant milestones/blockers.

Every handoff records:

- worker `A/B/C`;
- sequence;
- start/end timestamps;
- starting/ending HEAD;
- active task/subtask;
- completed work;
- exact files/owners changed;
- verification and CI run IDs/status;
- current state;
- exact next smallest step;
- risks/blockers;
- whether `main` reconciliation is required.

## 14. Ordered roadmap

### AB-00 — Architecture baseline & guardrails — DONE

- AB-00.1 ownership/boundary map — DONE
- AB-00.2 dependency/migration inventory — DONE
- AB-00.3 Architecture Guard — DONE
- AB-00.4 measured baseline — DONE
- AB-00.5 readiness gate — DONE

### AB-01 — Shared foundations — ACTIVE

1. AB-01.1 shared Admin API transport/error boundary;
2. AB-01.2 Auth/session feature ownership + session lifecycle extraction;
3. AB-01.3 minimum proven shared Admin product-state primitives;
4. AB-01.4 backend app composition extraction without business-rule change;
5. AB-01.5 justified common backend technical foundations only;
6. AB-01.6 foundation exact-head verification gate.

Always re-read live state; do not infer completion from this static protocol.

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
- eliminate backend debt not naturally closed in AB-03.

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

PR #52 remains Draft until AB-08 exact-head green. Once AB-08 is verified and state becomes `COMPLETE`, disable all three scheduled workers immediately.

## 15. Stop conditions

A worker records `BLOCKED` and stops instead of improvising if:

- required source of truth cannot be inspected;
- branch/HEAD changed unexpectedly and cannot be reconciled confidently;
- live `main` introduces overlapping Admin/API/migration/shared changes;
- required CI exposes a real regression not yet understood;
- schema/security/business-rule changes would be needed without enough evidence;
- another worker appears actively mutating the same branch;
- progress would require Student frontend implementation changes;
- only available path is a patch violating root architecture rules.

High confidence, serial continuity and exact evidence are more important than maximizing mutations per run.
