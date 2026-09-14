# Platform Architecture Rebuild — 2026-09-14

Status: **ACTIVE — architecture baseline and controlled rebuild plan approved for execution**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52` — remains Draft; no merge or auto-merge authorized.  
Live `main` baseline checked: `3053640cc5bb0699cfa7456cf646e8997f6aa81b`.  
Admin branch baseline checked: `302127c3223d00715f1d960f37c7d25044b6b20e`.  
Latest verified Admin runtime gate before this architecture pivot: Stage13G `34793896054` — Admin UI, backend, migrations/integration, and Real API + PostgreSQL + Chromium all SUCCESS.

> Source of truth order remains: repository code → PostgreSQL migrations/schema → executable tests/CI → verified runtime → canonical documentation.

## 1. Why this workstream exists

The previous Super Admin roadmap successfully restored product parity, route ownership and executable coverage, but its AR-10 contract explicitly limited work to the smallest evidence-driven polish and prohibited redesign/rebuild of already-working surfaces.

That constraint is now superseded by a product-level architecture decision: **the platform must be evaluated and organized from first principles rather than continuing to improve the current shape simply because it exists.**

The goal is not to cosmetically refactor files or silence bundle warnings. The goal is to establish a durable architecture for the whole Alwaslh platform that is:

- understandable by a new engineer without reconstructing history;
- feature-owned and dependency-directed;
- easy to extend without editing unrelated modules;
- explicit about data ownership and server authority;
- consistent across Student and Super Admin experiences;
- Arabic-first, RTL-safe, accessible, responsive and visually coherent;
- testable at unit, contract, integration and real-browser levels;
- performant by construction rather than by late optimization;
- capable of incremental migration without weakening existing production contracts.

This is a **controlled structural rebuild**, not patching and not an unsafe big-bang rewrite.

## 2. Current-state diagnosis

### 2.1 What is structurally sound and must be preserved

**KEEP**

1. Monorepo product split: `apps/student-web`, `apps/admin-web`, `apps/api`.
2. Fastify API + PostgreSQL as canonical business-state authority.
3. Database migrations as schema/integrity authority.
4. Existing backend domain directories (`auth`, `access`, `activation`, `content`, `curriculum`, `question-bank`, `quiz-builder`, `student-assessment`, `offline`, `ai`, operations, notifications, etc.).
5. Human review/publication/revision/provenance/audit rules.
6. Server-owned authentication, authorization, entitlement and assessment finalization.
7. Real PostgreSQL + Chromium verification already established in CI.
8. Existing verified product behavior from AR-01..AR-09 and Student workstreams unless a new architecture decision explicitly replaces presentation/composition only.

### 2.2 Frontend architecture findings

**REBUILD / STANDARDIZE**

#### Super Admin

`apps/admin-web/src/App.tsx` is still a composition hotspot. It owns or coordinates:

- session restoration and authentication state;
- login/error/restoring states;
- shell/sidebar/navigation/account/logout;
- the full route table;
- feature composition helpers;
- eager imports for nearly every Admin workspace.

This makes the composition root too aware of feature internals and causes all major workspaces to enter the initial production bundle. The verified build baseline produced a single JS chunk around `968.58 kB` minified (`193.92 kB` gzip), with Vite's >500 kB warning.

The Admin source root also still contains API clients, editors, tests and CSS beside app bootstrap concerns. Feature ownership exists under `src/admin/<feature>` for many screens, but the architecture is transitional rather than consistently enforced.

#### Student

`apps/student-web/src/App.tsx` is approximately 30 KB and contains authentication/activation/login/recovery flow plus shared presentation pieces and product-state orchestration. API modules and CSS remain largely flat in the source root. This is a similar composition problem even though the product scenarios are different.

Therefore the architecture problem is platform-wide: **both frontends need the same structural rules, not identical screens.**

### 2.3 Shared package findings

Current shared packages are:

- `packages/brand`
- `packages/domain`
- `packages/ui`
- `packages/validation`

The direction is useful, but coverage is incomplete. `packages/domain/src` currently contains only a small subset of the platform domains, and `packages/validation/src` is even narrower. This means contracts/types/validation are not yet organized as a complete platform boundary.

**Decision:** do not turn `shared` packages into a dumping ground. Shared code is promoted only when two or more product/domain owners genuinely share the same contract or primitive.

### 2.4 Backend architecture findings

The API is healthier than the frontend because it is already grouped by business areas, but `apps/api/src/app.ts` is a large manual composition root that directly constructs every service and registers every route.

That is acceptable as a composition root only if module boundaries are made explicit. Today naming/layout varies by module (`service.ts`, specialized service files, `*-http.ts`, direct database dependencies), and dependency rules are conventional rather than enforced.

**IMPROVE / STANDARDIZE, not rewrite business rules.**

The target is a modular monolith with clear module internals and one app-level composition layer. No microservice split is justified by current evidence.

### 2.5 Design/UX system findings

There is shared brand/UI foundation and existing RTL/accessibility work, but screen-level CSS and patterns remain distributed between apps/features. A coherent product does not mean every screen has the same card layout; it means the same rules govern hierarchy, spacing, typography, states, actions and interaction semantics.

The target design system must establish:

`tokens → primitives → components → patterns → feature compositions`

Feature screens may vary visually according to task, but they must not redefine foundational behavior.

### 2.6 Testing and delivery findings

The project has strong executable coverage compared with its current architecture: unit/integration tests, clean PostgreSQL migrations and real Chromium flows exist. This is an asset and becomes the migration safety net.

The missing piece is architecture enforcement itself: dependency direction, feature-boundary checks, bundle/performance budgets and design-system ownership are not yet first-class gates.

## 3. Target platform architecture

### 3.1 Repository boundary

```text
apps/
  admin-web/
  student-web/
  api/

packages/
  brand/          # canonical visual identity/tokens source
  ui/             # truly shared framework/presentation primitives
  domain/         # shared pure domain contracts only
  validation/     # shared schemas at system boundaries
  config/         # create only if proven shared configuration warrants it
```

Do not create packages for code used by one feature only.

### 3.2 Frontend architecture — both web apps

Each frontend follows the same dependency shape:

```text
src/
  app/
    bootstrap/
    router/
    providers/
    layouts/
    error-boundary/

  features/
    <feature>/
      routes/
      pages/
      components/
      api/
      model/
      schemas/
      hooks/
      tests/

  shared/
    ui/
    api/
    hooks/
    lib/
    types/

  styles/
```

Rules:

1. `app` composes; it does not contain business feature logic.
2. A feature owns its routes/pages/API adapter/model/UI composition.
3. Features do not reach into another feature's private folders.
4. Cross-feature integration occurs through public feature contracts or app orchestration.
5. `shared` may not import from `features`.
6. Shared UI contains generic behavior, never curriculum/question/student-specific rules.
7. Route-level features are lazy-loaded by default unless evidence proves they are part of the critical initial path.
8. Loading/error/empty/permission/offline states are explicit and standardized.
9. Server data stays server data; do not duplicate canonical API state in a global browser store.
10. Local UI state remains local. Cross-app global state is limited to true platform concerns such as session/theme/connectivity where required.

### 3.3 Admin product feature map

Target feature ownership:

```text
features/
  auth/
  overview/
  curriculum/
  content/
  reviews/
  questions/
  quizzes/
  students/
  access-codes/
  operations/
  ai-authoring/
```

Each route must have one clear feature owner. Contextual links between features are navigation/contracts, not component ownership leakage.

### 3.4 Student product feature map

Target product ownership derived from current scenarios:

```text
features/
  auth/
  activation/
  home/
  learning/
  reader/
  assessment/
  practice/
  downloads/
  offline/
  account/
  access/
```

Activation/login/device/offline authorization remain security-sensitive flows and must retain existing server/device contracts during migration.

### 3.5 Backend modular-monolith target

```text
apps/api/src/
  app/
    build-app.ts
    config/
    plugins/
    composition/

  modules/
    <domain>/
      domain/
      application/
      infrastructure/
      http/
      tests/

  shared/
    db/
    auth/
    errors/
    observability/
    media/
```

This is a target shape, not permission to move every file mechanically.

Dependency direction:

`http → application → domain`

`infrastructure` implements ports required by application/domain. Database/Fastify details must not become domain concepts. Module-to-module calls must be explicit application contracts, not arbitrary imports into internal repositories/services.

The initial migration can preserve existing SQL/service implementations behind these boundaries; business behavior is not rewritten without evidence.

### 3.6 Contract and data-flow rules

Canonical flow:

`PostgreSQL → domain/application service → HTTP contract → feature API adapter → feature model/view → UI`

Write flow reverses through the same boundary.

Rules:

- never pass raw database rows directly into UI contracts by accident;
- request/response contracts are validated at boundaries;
- IDs/status enums/date semantics are centrally defined where genuinely shared;
- API errors use one stable machine-readable contract plus localized UI mapping;
- session/permissions remain server-authoritative;
- no duplicated business rule in Admin and Student clients;
- derived presentation state may exist client-side, canonical business state may not.

## 4. Design system and UX architecture

### 4.1 Layers

1. **Tokens** — color, typography, spacing, radius, elevation, motion, breakpoints, focus.
2. **Primitives** — Button, Input, Select, Textarea, Link, Icon, Spinner, Divider, VisuallyHidden.
3. **Components** — Field, Alert, Dialog, Drawer, Tabs, Table/DataGrid shell, Pagination, Search, Filter controls.
4. **Patterns** — PageHeader, ActionBar, FilterBar, DataList/Table pattern, Detail layout, Form layout, Review workflow, Empty/Loading/Error/Permission states.
5. **Feature compositions** — feature-owned pages that use the system without forcing every page into the same layout.

### 4.2 Product UX principles

- Arabic-first and RTL-native using logical CSS properties.
- Main action obvious; secondary/advanced actions visually separated.
- Progressive disclosure for IDs, provider details, hashes and diagnostics.
- Keyboard-operable with visible focus.
- Reduced-motion respected.
- Responsive behavior defined at pattern level, not patched page by page.
- No horizontal overflow at supported widths.
- Tables degrade intentionally on narrow screens through a documented pattern.
- Forms use consistent validation, pending, success and failure behavior.
- Destructive actions require explicit intent and clear consequence.
- Loading preserves layout where possible to reduce visual instability.
- Navigation follows user tasks, not database tables.

## 5. Core scenario ownership

The rebuild will validate architecture through real scenarios rather than file movement.

### Admin scenarios

- sign in → attention-first overview → resolve an operational/content task;
- curriculum → content ingestion → review/publication;
- AI output → human review → accepted application to content/question workflows;
- Question Bank → create/import/review/detail/revision/regeneration;
- Quiz Builder → create/version/select/export;
- student → recovery/device/access management;
- access codes → generate/filter/revoke/report/export;
- operations → health/notifications/audit/diagnostics;
- keyboard-only and phone-width navigation through representative flows.

### Student scenarios

- activation code → account/password/device binding → authenticated home;
- login/recovery → session/device validation;
- Learn → subject → lesson/Reader;
- assessment/practice lifecycle;
- downloads/offline authorization/use/revalidation;
- account/session/logout;
- offline/unavailable recovery without bypassing security authority.

## 6. Rebuild strategy — no patching, no unsafe big-bang

A root rebuild does **not** mean deleting verified behavior and rebuilding everything blind. The migration rule is:

`define target boundary → build new owner → prove contract/parity → switch route/composition → remove old owner → exact-head gates`

Legacy code is not used as the architecture template, but it remains executable evidence for business behavior until the replacement slice is proven.

A migration batch is incomplete if both old and new owners remain active indefinitely.

## 7. Execution roadmap

### PA-00 — Architecture baseline and guardrails

- freeze the target architecture and naming rules;
- create Architecture Decision Records for frontend boundaries, backend module boundaries, data ownership and design-system layers;
- establish import/dependency rules and ownership map;
- baseline bundle sizes and representative runtime metrics;
- map current files to KEEP / MOVE / REBUILD / REMOVE / STANDARDIZE.

**Gate:** no feature migration until boundaries and acceptance rules are documented and executable where practical.

### PA-01 — Shared design and contract foundation

- normalize brand/tokens/UI layers;
- define reusable state/action/form/navigation patterns;
- expand shared domain/validation only for proven shared contracts;
- standardize API error/response adapter conventions.

**Gate:** shared packages remain domain-neutral and have tests/typecheck/build ownership.

### PA-02 — Frontend app shells

- extract bootstrap/providers/router/layout/auth boundaries from giant `App.tsx` files;
- make composition roots thin;
- establish route lazy-loading/Suspense/error boundaries;
- standardize session/connectivity handling without changing security rules.

**Gate:** first-load bundle materially improves from the documented baseline and all auth/runtime E2E stays green.

### PA-03 — Admin vertical-slice migration

Migrate by coherent user workflow, not by random files:

1. Overview + Operations foundation.
2. Curriculum + Content.
3. Reviews + AI application/authoring.
4. Question Bank.
5. Quiz Builder.
6. Students.
7. Access Codes.

Each slice receives feature-local routes/pages/components/api/model/tests and removes its replaced legacy owner after parity.

### PA-04 — Student vertical-slice migration

Migrate without breaking existing Student/content work on `main`:

1. auth + activation + device/session boundary;
2. shell/home/navigation;
3. learning/subject/reader;
4. assessment/practice;
5. downloads/offline;
6. account/access.

Student migration must be rebased/planned against the then-current live `main`; do not overwrite parallel content/product changes from this Admin branch.

### PA-05 — Backend module-boundary standardization

- separate app composition from modules;
- normalize module internal layers where they add clarity;
- make cross-module dependencies explicit;
- preserve SQL/PostgreSQL authority and migrations;
- eliminate accidental circular/internal imports;
- standardize transaction/error/authorization boundaries.

This phase is not a microservice conversion.

### PA-06 — Design/interaction convergence

- migrate both apps to the documented system patterns;
- eliminate duplicate primitives and near-identical feature CSS;
- verify hierarchy, interaction, RTL, keyboard, responsive, reduced-motion and state consistency;
- visual QA representative routes at desktop/tablet/phone widths.

### PA-07 — Performance and delivery architecture

- route-level code splitting;
- remove unused/duplicate dependencies and dead CSS;
- establish evidence-based bundle budgets from the improved baseline;
- inspect request waterfalls and unnecessary duplicate fetches;
- ensure cache/offline behavior does not conflict with API authority/security;
- add architecture/performance gates where stable and deterministic.

### PA-08 — Legacy removal and dependency enforcement

- delete replaced seams after parity;
- prevent cross-feature private imports;
- prevent new root-level feature dumping;
- update documentation index/ownership maps;
- verify no obsolete aliases, duplicate APIs or duplicate UI primitives remain.

### PA-09 — Full platform verification

Required on final exact head:

- lint;
- strict typecheck;
- unit tests;
- contract/schema tests;
- PostgreSQL migrations on clean database;
- backend integration/security/auth regressions;
- production builds;
- Admin and Student representative real-browser flows;
- accessibility/RTL/responsive/no-overflow checks;
- performance/bundle evidence;
- visual QA;
- documentation/architecture consistency review.

Only after PA-09 may a merge/readiness decision be made. No automatic merge.

## 8. Acceptance criteria

The rebuild is not complete because folders look clean. It is complete only when:

- a developer can locate ownership of a requirement from the scenario/domain name;
- app roots are composition-only;
- features own their private UI/data/model logic;
- shared code has a demonstrated shared reason;
- API/module dependencies flow in one explainable direction;
- browser clients do not own canonical business rules;
- design foundations are unified while feature layouts remain task-appropriate;
- adding a feature does not require editing unrelated feature internals;
- deleting a feature does not require disentangling global files;
- representative routes load only the code they need;
- all critical flows remain executable against real PostgreSQL/API/browser gates;
- legacy owners are removed after replacement, not left as permanent compatibility debt.

## 9. Immediate next action

**Do not continue the old AR-10 “smallest polish” loop.**

Start `PA-00` on the current architecture branch: produce the current-file ownership/classification map, ADR set and enforceable dependency rules. Then execute `PA-01` and `PA-02` before migrating business feature slices.

PR #52 remains Draft while this architectural direction is established. A future decision may either continue the same branch/PR or cut a dedicated architecture branch after reconciling current `main`; that decision must be evidence-based and must not discard verified work silently.
