# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth for the current Admin + Backend workstream. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-14 — AB-01.1 transport and AB-01.2 auth/session foundations verified and closed; AB-01.3 next.**

## A. Durable authority invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `apps/student-web` — separate Student frontend workstream; not an implementation target here.
- Student-facing backend contracts remain owned here.
- Browser state is never canonical business authority.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority remains server-owned.
- Tests represent production contracts; validation/security is never weakened to satisfy fixtures.

## B. Historical safety baseline

Historical AR foundations remain retained as safety evidence. Frozen AB baseline before rebuild:

- Admin initial JS: **968.68 kB / 193.92 kB gzip**;
- Admin CSS: **91.38 kB / 13.68 kB gzip**;
- Admin unit tests: **71/71**;
- API unit tests: **66/66**;
- clean PostgreSQL 16 migration sequence: green;
- baseline real Chromium Admin acceptance: **9/9 green**.

## C. Root architecture findings

### AB-ARCH-001 — Admin composition root too broad

Historical `App.tsx` owned session/auth state, shell/navigation/account behavior, full route table, route wrappers and eager imports of major workspaces.

Decision: rebuild toward app providers/router/layout plus feature public route modules.

### AB-ARCH-002 — Initial bundle architecture

Cause of oversized initial Admin bundle: eager static imports of major workflows.

Decision: substantial route-level lazy boundaries; never suppress warning thresholds to hide debt.

### AB-ARCH-003 — Feature ownership incomplete

Feature pages existed while API adapters/CSS/tests/session lifecycle were rooted/shared inconsistently.

Decision: feature-local ownership plus narrow truly shared primitives/adapters; no mechanical folder moves.

### AB-ARCH-004 — Cross-feature coupling

Confirmed Overview → Operations private model/CSS import and other legitimate reference-data dependencies.

Decision: explicit public contracts or app orchestration; do not promote whole feature internals to shared.

### AB-ARCH-005 — Large feature compositions

Content Ingestion, Students, Access Codes, Reviews and AI Authoring combine orchestration/presentation concerns.

Decision: rebuild internal composition where needed; moving giant files unchanged is not completion.

### AB-ARCH-101 — Backend root composition hotspot

`apps/api/src/app.ts` manually constructs/registers most of the service graph and mixes Fastify setup with business-module composition.

Decision: extract real app/plugin/composition boundaries while preserving behavior.

### AB-ARCH-102 — Backend private cross-module coupling

Known examples include AI Authoring concrete dependencies on Question Bank/Quiz Builder services, cross-domain SQL, Question Bank HTTP importing AI internals, and module HTTP importing generic helpers from Auth HTTP.

Decision: narrow public application/read contracts and genuinely generic shared HTTP infrastructure where justified.

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

Guard capabilities include static/dynamic import detection, no new Admin root dumping, shared→app/features prohibition, feature→app prohibition, app→private feature prohibition, private cross-feature prohibition, backend app→private module prohibition, private cross-module prohibition, and a transitional ratchet for known legacy debt.

Advance the ratchet baseline only after accepted exact-head-green cleanup.

## F. Branch governance

Scoped work continues on `rebuild/super-admin-foundation`, PR #52 Draft.

- never auto-merge;
- never force-reset/force-push shared history;
- never import separate Student frontend implementation;
- compare live `main` before structural phase boundaries;
- if `main` introduces overlapping Admin/API/migrations/shared-contract changes, pause and reconcile.

Latest Worker A sequence 1 reconciliation observed `main` at `3053640cc5bb0699cfa7456cf646e8997f6aa81b`, unchanged from prior AB-01 reconciliation.

## G. Confirmed architecture/product decisions

- one Fastify modular monolith;
- PostgreSQL/API canonical authority;
- feature-owned Admin + thin app composition target;
- user-job IA and attention-first Overview;
- substantial route-level code splitting;
- existing Design System/brand authority;
- RTL/a11y/responsive/reduced-motion/product states as architecture acceptance;
- controlled replacement with legacy deletion after parity;
- `packages/ui` only for genuinely cross-product primitives; Admin `shared/ui` for Admin-only patterns;
- backend layers selective, not ceremony;
- verified `/app` base preserved unless runtime evidence changes the decision;
- performance budgets evidence-based.

Rejected without evidence: microservices, DI/service locator, generic repositories everywhere, new global state/query library, styling-stack rewrite, artificial tiny-component splitting and big-bang rewrite.

## H. AB-01 implementation ledger

### AB-01.1 — Shared API transport boundary — DONE

Owner:

`apps/admin-web/src/shared/api/client.ts`

Responsibility:

- fetch/credentials;
- JSON/blob transport;
- network/service errors;
- `ApiRequestError`;
- missing-session classification.

Root `admin-api.ts` compatibility re-exports are transitional only and have a deletion condition.

### AB-01.2 — Auth/session ownership — DONE

Owners:

- `apps/admin-web/src/features/auth/api/admin-auth-api.ts`;
- `apps/admin-web/src/features/auth/model/AdminSessionProvider.tsx`;
- `apps/admin-web/src/features/auth/public/index.ts`.

`App.tsx` no longer owns session state, restore/logout API calls or auth error interpretation.

#### Closure evidence

Verified implementation checkpoint: `d955a34087552377dc8b426ec1712e57f59fd8f6`.

- Stage13E Admin AI `34800888706` — SUCCESS.
- Stage13E Combined Integration `34800888690` — SUCCESS.
- Stage13G `34800888723` — SUCCESS.
  - Admin lint/typecheck/unit/build — SUCCESS.
  - API lint/typecheck/unit/build — SUCCESS.
  - clean PostgreSQL migrations — SUCCESS.
  - Accounts/Access, Notifications/Operations, Reports/Settings/Security/Audit, AI authoring and auth regressions — SUCCESS.
  - real API + PostgreSQL + Chromium — SUCCESS.
- Architecture Guard `34799891149` — SUCCESS on last code head `e0b90cd21c404cc1ab6a65200a08385c1a319e5a`.
- Compare `e0b90cd..d955a340` contains documentation-only changes; no Admin/API/source change occurred after the successful guard.

Conclusion: AB-01.1 and AB-01.2 are final **DONE**.

### AB-01.3 — NEXT

Purpose: extract only the minimum Admin product-state primitive proven by real duplication.

Known current evidence before next-run reinspection:

- Overview and Operations duplicate local loading/error/retry state containers;
- shared Admin UI currently has no general state-pattern owner;
- no generic mega-component is authorized;
- server error truth/copy remains feature-owned.

Next run must re-read current source and select one smallest coherent shared primitive only.

### AB-01.4 — PENDING

Backend app composition extraction from `apps/api/src/app.ts`, preserving business rules and modular-monolith behavior.

### AB-01.5 — PENDING

Only justified common backend technical ownership.

### AB-01.6 — PENDING

Full foundation closure gate after remaining AB-01 work.

## I. Alternating execution governance

Binding protocol:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`

Live handoff state:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`

Worker A and B share one roadmap and branch, execute one smallest coherent increment per run, and leave `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE` with exact HEAD/CI/next-step evidence.

## J. Full roadmap

- AB-00 — DONE
- AB-01 — shared foundations — ACTIVE
- AB-02 — thin Admin shell/router/providers/layouts + major lazy routes
- AB-03 — vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence audit
- AB-06 — performance/delivery validation and evidence-based budgets
- AB-07 — legacy deletion + hard dependency enforcement
- AB-08 — final Admin + Backend verification and live-main reconciliation

## K. Exact continuation

Never infer the next mutation from this log alone. Read first:

`docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`

Current durable continuation after Worker A sequence 1: **AB-01.3 minimum proven Admin product-state primitives**.
