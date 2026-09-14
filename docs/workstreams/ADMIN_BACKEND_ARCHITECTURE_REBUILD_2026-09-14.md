# Admin + Backend Architecture Rebuild — الوسيلة الذكية

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52` — Draft only; no merge/auto-merge.

## 1. Scope

This workstream supersedes the broader platform-rebuild scope for execution purposes.

### IN SCOPE

- `apps/admin-web`
- `apps/api`
- `database/migrations`
- `packages/brand`, `packages/ui`, `packages/domain`, `packages/validation` only where required by Admin/API contracts or the Admin design system
- Admin UX/UI architecture, routing, data flow, accessibility, RTL, responsive behavior, performance and visual consistency
- Backend modular-monolith boundaries, service/application ownership, HTTP contracts, PostgreSQL integrity and cross-module orchestration
- CI, integration tests and real Chromium coverage for Admin/backend scenarios

### OUT OF SCOPE

- structural refactor or redesign of `apps/student-web`
- Student route architecture, Student design-system migration, Student bundle optimization or Student feature decomposition
- Student roadmap work

Student code may be read or executed only when necessary to prove that an API/security/public contract consumed by Student has not been broken. No Student implementation work is authorized by this workstream.

## 2. Root-fix objective

The objective is not to improve the existing Admin shape. The objective is to rebuild the Admin and backend structure so that:

- every Admin route/workflow has one clear feature owner;
- `App.tsx` becomes a thin composition root;
- feature API adapters/models/components/tests are co-owned;
- unrelated Admin routes do not ship in the initial bundle;
- shared UI/design rules have one owner;
- backend remains a modular monolith with explicit module boundaries;
- PostgreSQL and server application/domain logic remain canonical authority;
- cross-module dependencies are explicit rather than opportunistic imports;
- verified behavior is preserved while incorrect ownership/composition is replaced;
- obsolete legacy owners are removed after parity instead of retained indefinitely.

## 3. Non-negotiable execution rule

Every migration follows:

`understand scenario → map API/database contracts → classify current owner → define target owner → build replacement → verify → switch composition → remove legacy owner → exact-head gates → document`

No patch-only completion is accepted.

Primary classifications:

- `KEEP`
- `MOVE`
- `STANDARDIZE`
- `REBUILD`
- `REMOVE`

## 4. Target Admin architecture

```text
apps/admin-web/src/
  app/
    bootstrap/
    router/
    providers/
    layouts/
    error-boundary/

  features/
    auth/
    overview/
    curriculum/
    content/
    reviews/
    ai-authoring/
    questions/
    quizzes/
    students/
    access-codes/
    operations/

  shared/
    ui/
    api/
    hooks/
    lib/
    types/

  styles/
```

Rules:

1. `app` composes only.
2. Feature owns route/page/components/API adapter/model/tests.
3. Feature internals are private to the feature.
4. Cross-feature work uses navigation/public contracts/app orchestration.
5. `shared` cannot import feature internals.
6. New feature files may not be dumped into root `src/`.
7. Route features lazy-load by default.
8. Server data is not duplicated as a second browser business store.
9. Loading/empty/error/permission states are explicit patterns.
10. RTL/accessibility/responsive behavior are architecture requirements.

## 5. Target Backend architecture

Deployment remains one Fastify modular monolith.

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
    media/
    observability/
```

This is a dependency model, not permission for mechanical mass moves.

Direction:

`HTTP → Application → Domain`

Infrastructure supplies technical adapters. Cross-module collaboration must be explicit application contracts/orchestration. PostgreSQL migrations remain schema/integrity authority.

## 6. Admin design system

Authority layers:

`brand tokens → primitives → components → patterns → feature compositions`

Required patterns include:

- AppShell/navigation
- PageHeader/ActionBar
- forms + validation/pending/error
- FilterBar/search
- list/table/detail layouts
- status semantics
- review workflow
- loading/empty/error/permission states
- dialogs/drawers/destructive confirmation
- responsive table/data behavior

Admin may be dense, but must remain readable, Arabic-first, RTL-native, keyboard operable and visually coherent.

## 7. Backend/Admin scenario gates

Architecture is validated through real workflows:

- admin sign-in/session restoration/logout;
- Overview → actionable task;
- Curriculum → Content → ingestion/review/publication;
- AI output → human review → application;
- Question Bank lifecycle;
- Quiz Builder lifecycle/version/export;
- Students account/device/recovery operations;
- Access Code generation/filter/revoke/report/import/export;
- Operations health/audit/notifications/diagnostics;
- real PostgreSQL + API + Chromium;
- keyboard/RTL/responsive/no-overflow representative flows.

## 8. Updated roadmap

### AB-00 — Architecture baseline & guardrails — ACTIVE
- AB-00.1 ownership/boundary map — DONE
- AB-00.2 current-file migration inventory — ACTIVE
- AB-00.3 automated architecture guard
- AB-00.4 Admin bundle/runtime baseline
- AB-00.5 readiness gate

### AB-01 — Shared Admin foundation
- design-system primitives/patterns
- stable Admin API transport/error conventions
- shared contracts only where genuinely shared

### AB-02 — Thin Admin application shell
- bootstrap/session provider
- router/layout/error boundaries
- lazy route boundaries
- remove feature knowledge from `App.tsx`

### AB-03 — Admin vertical-slice rebuild
1. Overview + Operations
2. Curriculum + Content
3. Reviews + AI Authoring
4. Question Bank
5. Quiz Builder
6. Students
7. Access Codes

Each slice closes only after old ownership is removed.

### AB-04 — Backend modular-monolith standardization
- separate app composition from module internals
- normalize HTTP/application/domain/infrastructure boundaries where useful
- explicit cross-module contracts
- transaction/auth/error conventions
- preserve PostgreSQL authority and current business rules unless evidence proves a defect

### AB-05 — Admin design/interaction convergence
- eliminate duplicate primitives and one-off CSS
- consistent hierarchy/states/forms/tables/actions
- RTL/a11y/responsive/visual QA

### AB-06 — Performance/delivery architecture
- route code splitting
- remove dead/duplicate code/CSS/dependencies
- inspect fetch waterfalls/state duplication
- evidence-based bundle budgets

### AB-07 — Legacy removal + dependency enforcement
- delete replaced root APIs/components/styles/aliases
- harden import/placement rules
- no dual ownership

### AB-08 — Final Admin + Backend verification
- lint/typecheck/unit
- API contracts
- clean PostgreSQL migrations
- backend integration/security/auth regressions
- production Admin build
- real Chromium workflows
- RTL/a11y/responsive/no-overflow
- bundle/performance evidence
- visual QA
- documentation consistency

No merge/readiness decision before AB-08 exact-head green.

## 9. Student isolation rule

`apps/student-web` is not a migration target. If an Admin/backend change affects an endpoint consumed by Student, verification may run existing Student contract/tests as a regression check only. No Student refactor is permitted inside this workstream.
