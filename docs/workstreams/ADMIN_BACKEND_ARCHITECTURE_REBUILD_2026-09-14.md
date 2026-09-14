# Admin + Backend Architecture Rebuild — الوسيلة الذكية

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52` — Draft only; no merge/auto-merge.

## 1. Scope

This workstream owns the structural rebuild of the Super Admin and backend only.

### IN SCOPE

- `apps/admin-web`
- `apps/api`
- `database/migrations`
- `packages/brand`, `packages/ui`, `packages/domain`, `packages/validation` only where required by Admin/API contracts or the Admin design system
- Admin product architecture, UX/UI, routing, information architecture, data flow, accessibility, RTL, responsive behavior, performance and visual consistency
- backend modular-monolith boundaries, service/application ownership, HTTP contracts, PostgreSQL integrity and cross-module orchestration
- CI, integration tests and real Chromium coverage for Admin/backend scenarios

### OUT OF SCOPE

- structural refactor or redesign of `apps/student-web`
- Student route architecture, Student design-system migration, Student bundle optimization or Student feature decomposition
- Student roadmap work

The Student frontend has its own active workstream. At the time these rules were reconciled, its continuation is `stage16/student-016i` / PR #57. Student implementation is not copied or modified here. Existing Student tests may be executed only as consumer regression evidence when a shared API/security contract is affected.

## 2. Root-fix objective

The objective is not to improve the existing Admin shape. The objective is to rebuild the Admin and backend structure so that:

- every Admin route/workflow has one clear feature owner;
- every route represents a coherent operator job rather than mirroring backend modules;
- `App.tsx` becomes a thin composition root;
- feature API adapters/models/components/tests are co-owned;
- unrelated Admin routes do not ship in the initial bundle;
- shared UI/design rules have one owner;
- Overview is attention-first, not duplicated navigation/KPI decoration;
- loading/empty/error/permission/conflict states are designed as product states;
- technical implementation detail is progressively disclosed instead of dominating normal operator UX;
- backend remains a modular monolith with explicit module boundaries;
- PostgreSQL and server application/domain logic remain canonical authority;
- cross-module dependencies are explicit rather than opportunistic imports;
- verified behavior is preserved while incorrect ownership/composition is replaced;
- obsolete legacy owners are removed after parity instead of retained indefinitely.

## 3. Binding design and engineering order

The proven product-design decision order adopted for Super Admin is:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Two architecture constraints outrank convenience:

- **Correct ownership before convenience**.
- **Verified contracts before visual preservation**.

Acceptance target:

**Functional + Clear + Easy + Predictable + Comfortable + Consistent + Fast + Maintainable + Professional**

Legacy presentation is not a preservation contract. Existing screens are evidence for functions/data/workflows; layout, hierarchy, navigation, density and interaction may be rebuilt when the current shape is structurally weak.

Canonical detailed product/design rules:

`docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`

## 4. Non-negotiable execution rule

Every migration follows:

`understand operator job → map API/database contracts → classify current owner → define target owner → design states/flow → build replacement → verify operator outcome → switch composition → remove legacy owner → exact-head gates → document`

No patch-only completion is accepted.

Primary classifications:

- `KEEP`
- `MOVE`
- `STANDARDIZE`
- `REBUILD`
- `REMOVE`

Before implementation, every batch records:

1. operator job;
2. current owner;
3. target owner;
4. authoritative API/database contracts;
5. primary/secondary/destructive actions;
6. loading/empty/error/permission/conflict states;
7. responsive/RTL/keyboard behavior;
8. bundle/loading boundary;
9. old owner/removal condition;
10. verification evidence.

## 5. Target Admin architecture

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
8. One Admin shell owns global chrome/navigation.
9. Server data is not duplicated as a second browser business store.
10. Loading/empty/error/permission/conflict states are explicit patterns.
11. Tabs are reserved for closely related views of one entity/workflow; independent jobs receive routes/pages.
12. Dialogs/drawers are bounded actions, not page-sized workflows.
13. Technical IDs/provider/runtime/storage/raw JSON are progressive/advanced details unless required for the operator decision.
14. RTL/accessibility/responsive behavior are architecture requirements.
15. Browser back/deep links are first-class behavior.

## 6. Target Backend architecture

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

Canonical data flow:

`PostgreSQL → domain/application authority → HTTP contract → feature API adapter → presentation model → Admin UI`

The Admin must not compensate for weak backend ownership by recreating business transitions in browser state.

## 7. Admin product/UX rules

### One operator job, one primary owner

A page is split when it contains independent primary workflows. Do not solve mixed ownership by adding more tabs/cards/accordions.

### Overview is attention-first

Overview may show real actionable exceptions, queues and operational attention signals. It must not repeat the sidebar as tiles or invent decorative KPI metrics.

### Honest operational data

No fabricated health scores, trends, percentages, counts, time savings or business outcomes. A value appears only when an authoritative source exists.

### Product states are first-class

Design and test loading, empty, error, permission denial, invalid input, conflict/stale state, dependency unavailable, success and recovery paths.

Backend error codes/truth remain server-owned. Admin presentation explains:

`what happened → what it means → what the operator can do next`.

### Progressive disclosure

UUIDs, provider config, hashes, raw JSON, storage paths, CI/stage terminology and database internals stay secondary/advanced unless directly necessary.

### Interaction affordance

Primary/secondary/destructive actions are visually distinct. Static information must not visually compete with actions. Keyboard order follows task order; touch-capable responsive surfaces preserve comfortable targets.

### Motion

Motion is restrained state/context feedback only and always honors reduced motion.

## 8. Admin design system

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
- loading/empty/error/permission/conflict states
- dialogs/drawers/destructive confirmation
- responsive table/data behavior

Admin may be dense, but must remain readable, Arabic-first, RTL-native, keyboard operable and visually coherent.

No feature may create a competing local spacing/color/status/form system merely to solve one page.

## 9. Browser acceptance philosophy

Browser tests validate operator outcomes and durable contracts, not obsolete copy/selectors/DOM structure.

Required where applicable:

- route reachable/deep-linkable;
- authoritative data shown;
- operation succeeds/fails correctly;
- auth/permission enforced;
- focus/context restored appropriately;
- RTL/keyboard behavior works;
- representative phone/tablet/desktop widths do not overflow;
- old UI wording/selectors are not preserved solely because an old test asserted them.

No backend validation/security rule is weakened to make an E2E fixture pass.

## 10. Backend/Admin scenario gates

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

## 11. Updated roadmap

### AB-00 — Architecture baseline & guardrails — ACTIVE
- AB-00.1 ownership/boundary map — DONE
- AB-00.2 current-file + dependency migration inventory — ACTIVE
- AB-00.3 automated architecture guard
- AB-00.4 Admin bundle/runtime/backend-composition baseline
- AB-00.5 readiness gate

**Gate:** no structural feature migration before current ownership/dependency seams and accepted exceptions are explicit.

### AB-01 — Admin system foundation + API presentation boundary
- establish design-system primitives/patterns that are truly reusable;
- stable Admin transport/error mapping conventions;
- shared status/action/form/state patterns;
- no feature-specific business logic in shared layers;
- define durable semantic test hooks only where product meaning requires them.

**Gate:** foundation proves a small representative surface without creating generic mega-components.

### AB-02 — Thin Admin application shell
- bootstrap/session provider;
- one global shell/navigation owner;
- router/layout/error boundaries;
- route-level lazy loading/Suspense;
- route focus/history behavior;
- remove feature knowledge from `App.tsx`;
- preserve auth/session outcomes through real Chromium.

**Gate:** initial bundle materially improves from baseline; shell/auth routes remain exact-head green.

### AB-03 — Admin vertical-slice rebuild

Migrate by operator workflow:

1. Overview + Operations — attention-first overview and operational action ownership.
2. Curriculum + Content — structure, ingestion, content lifecycle/publication.
3. Reviews + AI Authoring — human-decision flow and advanced AI details via progressive disclosure.
4. Question Bank — list/detail/create/import/review/revision/regeneration.
5. Quiz Builder — lifecycle/version/question selection/export.
6. Students — account/device/recovery operations.
7. Access Codes — generation/filter/revoke/report/import/export.

For every slice:

`job map → contracts → route/page IA → states/actions → new owner → browser/integration parity → switch → legacy delete`.

Each slice closes only after old ownership is removed or a bounded compatibility bridge has an explicit deletion condition.

### AB-04 — Backend modular-monolith standardization
- separate app composition from module internals;
- normalize HTTP/application/domain/infrastructure boundaries only where they improve ownership;
- explicit cross-module contracts/orchestration;
- transaction/auth/error conventions;
- preserve PostgreSQL authority and current business rules unless evidence proves a defect;
- remove direct internal-module imports that bypass explicit contracts.

### AB-05 — Admin design/interaction convergence

This phase is **not** a late cosmetic pass. The rules apply during every AB-03 slice; AB-05 is the final system-wide convergence/audit:

- eliminate remaining duplicate primitives and one-off CSS;
- verify consistent hierarchy/states/forms/tables/actions;
- remove duplicated navigation/overview choices;
- verify progressive disclosure of technical details;
- RTL/a11y/responsive/visual QA across representative routes.

### AB-06 — Performance/delivery architecture
- validate route code splitting established in AB-02/AB-03;
- remove dead/duplicate code/CSS/dependencies;
- inspect fetch waterfalls/state duplication;
- evidence-based bundle budgets;
- no warning suppression as a substitute for performance architecture.

### AB-07 — Legacy removal + dependency enforcement
- delete replaced root APIs/components/styles/aliases;
- harden import/placement rules;
- prevent new root feature dumping;
- prevent cross-feature private imports;
- no unbounded dual ownership.

### AB-08 — Final Admin + Backend verification
- lint/typecheck/unit;
- API contracts;
- clean PostgreSQL migrations;
- backend integration/security/auth regressions;
- production Admin build;
- real Chromium operator workflows;
- keyboard/focus/RTL/a11y/responsive/no-overflow;
- bundle/performance evidence;
- visual QA;
- honest-data/technical-copy review;
- documentation/architecture consistency.

No merge/readiness decision before AB-08 exact-head green.

## 12. Student workstream lessons adopted — implementation remains isolated

The independent Student workstream proved several useful general principles and provided executable evidence that they improve the product without requiring the Admin to share its implementation:

- preserve contracts, not legacy presentation debt;
- `Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish`;
- one shell owns global chrome;
- outcome-based browser tests instead of preserving obsolete selectors/copy;
- failure/offline/unavailable states are product states, not afterthoughts;
- no fabricated metrics/data;
- route/destination-level code splitting protects initial bundles;
- interactive affordance must be obvious;
- overview surfaces should summarize/guide rather than duplicate navigation;
- motion is restrained and reduced-motion-safe.

These principles are adapted to Admin in `ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`.

Student frontend code/routes/components remain out of scope and are not modified by this workstream.