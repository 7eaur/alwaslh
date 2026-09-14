# AB-01 — Admin + Backend Foundation Execution

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**  
Parent roadmap: `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`

## Objective

AB-01 creates only the structural foundations required for later end-to-end slices. It does **not** redesign business workflows, introduce framework ceremony, or move files for appearance.

Root-fix law remains:

`use case → authority/contract → owner → replacement → verification → switch → legacy removal condition`

## Verified checkpoint for AB-01.1 / AB-01.2

Final implementation verification checkpoint: `d955a34087552377dc8b426ec1712e57f59fd8f6`.

Evidence:

- Stage13E Admin AI run `34800888706` — SUCCESS;
- Stage13E Combined Integration run `34800888690` — SUCCESS;
- Stage13G run `34800888723` — SUCCESS, including Admin lint/typecheck/unit/build, API lint/typecheck/unit/build, clean PostgreSQL migrations, integration/auth regressions, and real API + PostgreSQL + Chromium;
- Architecture Guard run `34799891149` — SUCCESS on last code head `e0b90cd21c404cc1ab6a65200a08385c1a319e5a`;
- compare `e0b90cd..d955a340` contains documentation-only changes.

Therefore AB-01.1 and AB-01.2 are **DONE**.

## AB-01 sequence

### AB-01.1 — Shared API transport boundary — DONE

Target owner: `apps/admin-web/src/shared/api/client.ts`.

Owns only base URL resolution, credentialed fetch, JSON/body parsing, public API error normalization, blob transport, network/service-unavailable translation, and missing-session classification. Root `admin-api.ts` compatibility re-exports remain transitional until feature adapters consume shared transport directly.

### AB-01.2 — Auth/session ownership — DONE

Target owner: `apps/admin-web/src/features/auth/`.

- `api/admin-auth-api.ts` — login/restore/logout HTTP contract adapter;
- `model/AdminSessionProvider.tsx` — restore/signed-out/signed-in/error lifecycle and logout/expiry orchestration;
- `public/index.ts` — supported external contract.

`App.tsx` no longer owns session state, restore logic, logout API calls or auth error interpretation. Root `LoginScreen.tsx` remains transitional presentation debt to close before AB-02 finishes.

### AB-01.3 — Product-state primitives — DONE

Source implementation checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

The smallest proven reusable Admin-only state pattern was loading/error/retry presentation shared by Overview and Operations.

Implemented ownership:

- `apps/admin-web/src/shared/ui/AdminProductState.tsx` — title/body/optional-retry presentation shell only;
- `apps/admin-web/src/shared/ui/admin-product-state.css` — sole styling owner;
- `AdminOverviewPage` and `AdminOperationsHealthPage` consume the shared primitive;
- duplicate local state components were removed;
- legacy `.operations-page-state` CSS ownership was removed from Operations.

Deliberately feature-owned: `LoadState` state machines, feature/server-specific error copy, API calls/server truth, session-expiry behavior, retry callbacks and recovery semantics. Empty/permission/conflict/unavailable/success were not generalized without independent duplication/semantic evidence.

#### Closure evidence

Exact source-head evidence:

- Architecture Guard `34804704619` — SUCCESS on `cfa2016e...`;
- Stage13E Frontend Preparation `34804704759` — SUCCESS on `cfa2016e...`.

Three original source-head workflows were cancelled by later documentation pushes rather than test failures. A compare from `cfa2016e...` to verification head `06127e90a859917ee4d62e33b85f6a8eae0fa769` proved every intervening change was documentation-only, so the superseding runs exercise the same Admin/API source tree:

- Stage13E Admin AI `34805721218` — SUCCESS;
- Stage13E Combined Integration `34805721217` — SUCCESS, including API/Admin quality, clean PostgreSQL, backend/auth regressions, deterministic fixtures and real Admin Chromium;
- Stage13G Admin Operations `34805721226` — SUCCESS, including Admin lint/typecheck/unit/build, API lint/typecheck/unit/build, clean PostgreSQL, all listed integration/auth regressions, and real API + PostgreSQL + Chromium.

Conclusion: AB-01.3 is **DONE**. No source mutation was required during the verification/closure run.

### AB-01.4 — Backend app composition foundation — DISCOVERY COMPLETE / IMPLEMENTATION NEXT

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

Discovery established that `apps/api/src/app.ts` currently owns Fastify construction, global CORS/preflight policy, infrastructure adapters, the broad service graph, cross-service composites, all route registrations, health/readiness, public error/not-found handling and database-close lifecycle.

Behavior-sensitive dependency edges were recorded, including media-storage consumers, offline download composition, AI authoring dependencies and quiz export dependencies. `server.ts` remains the owner of config/database creation, startup batch, listen and process signals.

The **single smallest real first extraction** is now fixed:

- create `apps/api/src/app/plugins/cors.ts`;
- move only the existing CORS/preflight `onRequest` registration into `registerCorsPolicy(app, config)`;
- invoke it at the same lifecycle point, after Fastify construction and before business routes;
- preserve direct `app.addHook` semantics rather than introducing `app.register()` encapsulation;
- do not move health/readiness, errors, database lifecycle, service construction or route registration in the same increment.

Direct parity authority is `apps/api/tests/app.test.ts`; exact-head verification after implementation requires Architecture Guard, API lint/typecheck/unit/build, and current integration/real-browser gates because CORS is global browser-facing transport policy.

Rejected for the first seam: giant `createServices()` container, moving all routes at once, empty target folder scaffolding, or bundling DB/error ownership into the same change.

Constraints remain:
- keep one Fastify modular monolith;
- preserve plugin/route/service construction order where behavior depends on it;
- no DI framework;
- no repository/interface ceremony;
- no database migration merely for folder structure;
- create only folders/files that own real responsibility.

### AB-01.5 — Common backend technical ownership — PENDING

Normalize only proven cross-cutting technical concerns such as public error mapping, auth/session helpers, PostgreSQL connection/transaction helpers, observability hooks, or media technical helpers when genuinely shared. Domain/business rules stay with module owners.

### AB-01.6 — Foundation closure gate — PENDING

AB-01 closes only when Admin transport has one owner, auth/session has one feature owner/public contract, common product states have explicit reusable ownership, backend app composition is thinner without behavior loss, no new private dependency violations exist, compatibility bridges have removal conditions, Architecture Guard passes, Admin/API quality passes, clean PostgreSQL passes, real API + PostgreSQL + Chromium passes, and docs match code.

## After AB-01

### AB-02 — Thin Admin shell + router

Move bootstrap/providers/layout/router to `app/`, move Auth presentation to its feature, establish one global shell owner, feature public route entry points, substantial route lazy-loading, Suspense/error/focus/history boundaries, and remove feature imports/route table knowledge from root `App.tsx` while preserving real auth/session behavior.

### AB-03 — End-to-end business slices

Order: Overview + Operations → Curriculum + Content + OCR → AI Jobs + Review + contextual authoring → Question Bank → Quiz Builder → Students → Access Codes.

Each slice fixes its frontend owner and the backend seam it actually uses, verifies parity, switches ownership, then removes replaced legacy owners.

### AB-04 — Remaining backend normalization

Close server-only and Student-facing backend seams not naturally closed by AB-03 while preserving authoritative contracts.

### AB-05 — Design/interaction convergence

Audit remaining visual/state/accessibility/RTL/responsive drift after slices already apply design rules.

### AB-06 — Performance/delivery

Measure route chunks, initial JS/CSS, fetch/query behavior and payloads; establish evidence-based budgets. Never suppress warnings instead of fixing causes.

### AB-07 — Legacy removal + hard enforcement

Delete compatibility re-exports, old root APIs/components/styles, transitional aliases/exceptions and ratchet architecture rules to the target structure.

### AB-08 — Final verification

Full exact-head Admin + Backend verification, real Chromium flows, PostgreSQL migrations, security/auth/integration, Student consumer regressions for changed server contracts, a11y/RTL/responsive/performance/visual QA and documentation consistency.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.
