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
- compare `e0b90cd..d955a340` contains documentation-only changes, so no Admin/API/source mutation occurred after the successful architecture guard.

Therefore AB-01.1 and AB-01.2 are closed as **DONE**. Documentation-only commits after this checkpoint do not introduce a second implementation owner and do not reopen these subtasks unless later source changes regress their contracts.

## AB-01 sequence

### AB-01.1 — Shared API transport boundary — DONE

Target owner:

`apps/admin-web/src/shared/api/client.ts`

Owns only:
- base URL resolution;
- credentialed fetch;
- JSON/body parsing;
- public API error normalization;
- blob transport;
- network/service-unavailable translation;
- missing-session error classification.

Must not own feature contracts or business semantics.

Compatibility:
- root `admin-api.ts` may re-export transport symbols temporarily;
- removal condition: all feature adapters consume shared transport directly and root compatibility is unused.

### AB-01.2 — Auth/session ownership — DONE

Target owner:

`apps/admin-web/src/features/auth/`

Structure:
- `api/admin-auth-api.ts` — login/restore/logout HTTP contract adapter;
- `model/AdminSessionProvider.tsx` — restore/signed-out/signed-in/error lifecycle and logout/expiry orchestration;
- `public/index.ts` — only supported external contract.

Verified result:
- `App.tsx` no longer owns session state, restore logic, logout API calls or auth error interpretation.

Compatibility:
- root `admin-api.ts` re-exports auth symbols through the feature public boundary temporarily;
- root `LoginScreen.tsx` is still transitional presentation debt and will move under Auth before AB-02 closes.

### AB-01.3 — Product-state primitives — NEXT

Create/standardize the smallest reusable Admin-only state patterns needed by real workflows:
- loading;
- empty;
- error/retry;
- permission/denied;
- conflict/unavailable;
- success/confirmation where persistent UI is justified.

Rules:
- first inspect real duplicated patterns and their semantics;
- start with the smallest proven common surface, currently evidenced by Overview/Operations loading/error/retry states;
- no mega-component;
- no generic copy that hides server truth;
- accessible live regions/focus semantics;
- Arabic-first/RTL;
- promote to `packages/ui` only if independently required cross-product.

### AB-01.4 — Backend app composition foundation

Refactor `apps/api/src/app.ts` without changing business rules:
- extract configuration/composition responsibilities that are genuinely app-level;
- keep Fastify modular monolith;
- preserve plugin/route/service construction order where behavior depends on it;
- no DI framework;
- no repository/interface ceremony;
- no database migration merely for folder structure.

First target shape:

```text
apps/api/src/app/
  build-app.ts
  composition/
  config/
  plugins/
```

Only create folders/files that hold real responsibility.

### AB-01.5 — Common backend technical ownership

Normalize only proven cross-cutting technical concerns:
- error/public error mapping;
- authentication/session helpers;
- PostgreSQL connection/transaction helpers;
- observability hooks;
- media technical helpers when genuinely shared.

Domain/business rules stay with their module owners.

### AB-01.6 — Foundation closure gate

AB-01 closes only when:
- Admin transport has one owner;
- auth/session has one feature owner and public contract;
- root `App.tsx` no longer owns auth lifecycle;
- common product states have explicit reusable ownership;
- backend app composition is thinner without behavior loss;
- no new cross-feature/module private imports;
- compatibility bridges have explicit deletion conditions;
- Architecture Guard passes;
- Admin lint/typecheck/unit/build passes;
- API lint/typecheck/unit/build passes;
- clean PostgreSQL migrations pass;
- real API + PostgreSQL + Chromium auth/session/operator regression passes;
- docs match code.

## After AB-01

### AB-02 — Thin Admin shell + router

- move bootstrap/providers/layout/router to `app/`;
- move Auth presentation to its feature;
- one global shell owner;
- route modules owned by features;
- major workflow routes lazy-loaded;
- Suspense/error/focus/history boundaries;
- remove feature imports/route table from root `App.tsx`.

### AB-03 — End-to-end business slices

Order:
1. Overview + Operations
2. Curriculum + Content + OCR
3. AI Jobs + Review + contextual authoring
4. Question Bank
5. Quiz Builder
6. Students
7. Access Codes

Each slice fixes its frontend owner and the backend seam it actually uses, verifies parity, switches ownership, then removes replaced legacy owners.

### AB-04 — Remaining backend normalization

Close server-only and Student-facing backend seams not naturally closed by AB-03, while preserving all authoritative contracts.

### AB-05 — Design/interaction convergence

Audit remaining visual/state/accessibility/RTL/responsive drift after slices already applied the design rules.

### AB-06 — Performance/delivery

Measure route chunks, initial JS/CSS, fetch/query behavior and payloads; establish evidence-based budgets. Never suppress warnings instead of fixing causes.

### AB-07 — Legacy removal + hard enforcement

Delete compatibility re-exports, old root APIs/components/styles, transitional aliases/exceptions and ratchet architecture rules to the target structure.

### AB-08 — Final verification

Full exact-head Admin + Backend verification, real Chromium flows, PostgreSQL migrations, security/auth/integration, Student consumer regressions for changed server contracts, a11y/RTL/responsive/performance/visual QA and documentation consistency.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.
