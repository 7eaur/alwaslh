# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth for the current Admin + Backend workstream. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-00 closed; AB-01 foundations active; alternating scheduled execution governance added.**

## A. Durable authority invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `apps/student-web` — separate Student frontend workstream; not an implementation target here.
- Student-facing backend contracts remain owned here.
- Browser state is never canonical business authority.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority remains server-owned.
- Tests represent production contracts; validation/security is never weakened to satisfy fixtures.

## B. Historical verified Admin safety baseline retained

- AR-01..AR-04 — DONE / VERIFIED historical foundation.
- AR-05..AR-09 — completed with exact-head successful Admin/API/Combined verification at their recorded historical checkpoints.
- AR-10 auth route-focus correction remains valid; Stage13G `34793896054` fully green at historical checkpoint.
- Former AR-10 “smallest polish only” constraint is superseded by the scoped architecture rebuild.

## C. Root architecture findings

### AB-ARCH-001 — P1 — Admin composition root too broad

Historical `App.tsx` owned session/auth state, shell/navigation/account behavior, full route table, route wrappers and eager imports of major Admin workspaces.

Decision: rebuild into app providers/router/layout + feature public route modules.

### AB-ARCH-002 — P1 — Admin initial bundle architecture

Frozen baseline: Admin initial JS **968.68 kB / 193.92 kB gzip**, Vite >500 kB warning.

Cause: eager static imports of major workflows.

Decision: substantial route-level lazy boundaries; never suppress warning thresholds to hide debt.

### AB-ARCH-003 — P1 — Feature ownership incomplete

Feature pages exist, but API adapters/CSS/tests/session lifecycle were rooted/shared inconsistently.

Decision: feature-local ownership + narrow truly shared primitives/adapters; no mechanical folder move.

### AB-ARCH-004 — P1 — Cross-feature coupling

Confirmed Overview → Operations private model/CSS import and other legitimate reference-data needs.

Decision: explicit public contracts/app orchestration; do not promote whole feature internals to shared.

### AB-ARCH-005 — P1 — Large internal feature compositions

Content Ingestion, Students, Access Codes, Reviews and AI Authoring combine orchestration/presentation concerns.

Decision: rebuild internal composition where needed; moving giant files unchanged is not architecture completion.

### AB-ARCH-101 — P1 — Backend root composition hotspot

`apps/api/src/app.ts` manually constructs/registers most of the service graph and mixes Fastify setup with business-module composition.

Decision: extract app/plugin/composition boundaries while preserving behavior.

### AB-ARCH-102 — P1 — Backend private cross-module coupling

Examples include AI Authoring concrete dependencies on Question Bank/Quiz Builder services, cross-domain SQL, Question Bank HTTP importing AI internals, and module HTTP importing generic helpers from Auth HTTP.

Decision: narrow public application/read contracts and genuinely generic shared HTTP infrastructure. Preserve legitimate orchestration; do not force artificial zero coupling.

## D. AB-00 — CLOSED

- AB-00.1 ownership/boundary map — DONE
- AB-00.2 current-file + dependency inventory — DONE
- AB-00.3 Architecture Guard — DONE / ratchet active
- AB-00.4 measured Admin/runtime/backend composition baseline — DONE
- AB-00.5 readiness review — PASS

Canonical baseline: `docs/architecture/ADMIN_BACKEND_BASELINE_2026-09-14.md`.

## E. Architecture Guard

Implemented:

- `scripts/verify-architecture-boundaries.py`;
- `.github/workflows/admin-backend-architecture-guard.yml`.

Guard capabilities include:

- static and dynamic import detection;
- no new Admin root feature dumping;
- shared → app/features prohibition;
- feature → app prohibition;
- app → private feature internals prohibition;
- private cross-feature import prohibition;
- backend app → private new-module internals prohibition;
- private cross-module import prohibition;
- transitional baseline ratchet for known legacy debt.

Advance ratchet baseline only after accepted exact-head-green cleanup.

## F. Branch governance

Scoped work continues on `rebuild/super-admin-foundation`, PR #52 Draft.

Rules:

- never auto-merge;
- never force-reset/force-push shared history;
- never import separate Student frontend implementation into this branch;
- before structural phase boundaries compare live `main` for Admin/API/migrations/shared-contract changes;
- if live main introduces overlapping scoped changes, pause and reconcile deliberately.

## G. Confirmed architecture/product decisions

- KEEP one Fastify modular monolith.
- KEEP PostgreSQL/API canonical authority.
- KEEP feature-owned Admin + thin app composition target.
- KEEP user-job IA and attention-first Overview.
- KEEP route-level code splitting for substantial workflows.
- KEEP existing Design System/brand authority; no second design system.
- KEEP RTL/a11y/responsive/reduced-motion/product states as architecture acceptance.
- KEEP controlled replacement with legacy deletion after parity.
- `packages/ui` = cross-product primitives only; Admin `shared/ui` = Admin-only patterns.
- backend layers are selective dependency boundaries, not mandatory empty folders/interfaces.
- preserve verified `/app` base unless runtime/deployment evidence justifies changing it.
- performance budgets are evidence-based, not arbitrary.

Explicitly rejected without evidence:

- microservices;
- DI framework/service locator;
- repository/interface ceremony everywhere;
- new global state/query library;
- wholesale Tailwind/CSS-in-JS/styling-stack replacement;
- tiny-component lazy splitting for fake chunk counts;
- big-bang rewrite.

## H. AB-01 implementation progress

### AB-01.1 — Shared API transport boundary — IMPLEMENTED

Created owner:

`apps/admin-web/src/shared/api/client.ts`

Responsibility:

- fetch/credentials;
- JSON/blob transport;
- network/service errors;
- `ApiRequestError`;
- missing-session classification.

Root `admin-api.ts` compatibility re-exports are transitional only and must be deleted once all feature owners move.

### AB-01.2 — Auth/session ownership — IMPLEMENTED

Created/established:

- `apps/admin-web/src/features/auth/api/admin-auth-api.ts`;
- `apps/admin-web/src/features/auth/model/AdminSessionProvider.tsx`;
- `apps/admin-web/src/features/auth/public/index.ts`.

`App.tsx` no longer owns session state, restore/logout API calls or auth error interpretation.

Latest verified code checkpoint before protocol-documentation commits:

- Architecture Guard on code head `e0b90cd21c404cc1ab6a65200a08385c1a319e5a` — SUCCESS, run `34799891149`.
- Later documentation commits advanced branch HEAD, so scheduled/manual execution must always re-check live exact-head gates before marking AB-01.1/AB-01.2 final DONE.

### AB-01.3 — NEXT after exact-head gate

Purpose: extract only the minimum product-state primitives proven by real duplication. Do not create a generic mega-component.

Observed duplication exists between Overview/Operations loading/error/retry states; inspect current live code again before implementation.

## I. Alternating scheduled execution governance

Created binding protocol:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`

Created live handoff/state:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`

Operating model:

- Worker A at the top of each hour;
- Worker B at half past each hour;
- each worker runs hourly, staggered 30 minutes;
- both continue one ordered roadmap, not separate workstreams;
- each run performs one smallest coherent increment;
- next worker reads state + repo + CI and continues exactly from prior handoff;
- active-worker collision means no overlapping mutation;
- every run documents starting/ending HEAD, changed owners/files, verification, CI, state and exact next step.

Allowed terminal handoff states per run:

- `READY_FOR_NEXT`;
- `WAITING_FOR_CI`;
- `BLOCKED`;
- `COMPLETE`.

## J. Full roadmap

- AB-00 — DONE
- AB-01 — shared foundations — ACTIVE
- AB-02 — thin Admin shell/router/providers/layouts + major lazy routes
- AB-03 — end-to-end slices in order:
  1. Overview + Operations
  2. Curriculum + Content + OCR
  3. AI Jobs + AI Review + contextual authoring transitions
  4. Question Bank
  5. Quiz Builder
  6. Students
  7. Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence audit
- AB-06 — performance/delivery validation and evidence-based budgets
- AB-07 — legacy deletion + hard dependency enforcement
- AB-08 — final full Admin + Backend verification and live-main reconciliation

## K. Exact continuation rule

Never hard-code the next mutation from this log because scheduled workers continuously advance it.

Read first:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`

Then inspect live branch/main HEADs and exact-head Actions before mutation.
