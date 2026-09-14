# Admin + Backend Architecture Rebuild — الوسيلة الذكية

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52` — Draft only; no merge/auto-merge.

Canonical decision review:

`docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`

## 1. Scope

This workstream owns the structural rebuild of the **Super Admin frontend and full backend**.

### IN SCOPE

- `apps/admin-web`
- `apps/api`
- `database/migrations`
- `packages/brand`, `packages/ui`, `packages/domain`, `packages/validation` only when genuinely required by Admin/API contracts or shared design semantics
- Admin product architecture, UX/UI, IA, routing, data flow, accessibility, RTL, responsive behavior, performance and visual consistency
- backend modular-monolith boundaries, service/application ownership, HTTP contracts, PostgreSQL integrity and cross-module orchestration
- CI, integration tests and real Chromium coverage for Admin/backend scenarios

### OUT OF SCOPE

- structural refactor/redesign of `apps/student-web`
- Student routes/components/design-system migration/bundle work
- Student roadmap implementation

Student frontend is owned by a separate workstream. Student code/tests may be read/run only as consumer-regression evidence when a shared API/security contract is affected.

## 2. Branch isolation rule

Latest reviewed repository comparison:

- live `main`: `3053640cc5bb0699cfa7456cf646e8997f6aa81b`;
- architecture checkpoint before review: `f7c56628bc89e1a534c24bd2ba4771b61313664b`;
- branch: 284 commits ahead / 170 behind `main`;
- inspected `main`-only changes are Student frontend + documentation, not Admin/API/migrations/shared implementation paths.

Decision:

- continue the scoped branch without importing parallel Student implementation;
- re-compare live `main` before every structural phase boundary;
- if `main` changes Admin/API/migrations/shared-contract paths, pause and reconcile before continuing;
- reconcile current `main` before PR #52 review/merge readiness.

Branch divergence is never assumed harmless without path-level evidence.

## 3. Root-fix objective

The objective is not to cosmetically improve the current Admin. Rebuild ownership so that:

- every Admin route/workflow has one clear feature owner;
- each route represents one coherent operator job;
- `App.tsx` becomes a thin composition root;
- auth/session lifecycle is centralized without becoming business authority;
- feature API adapters/models/components/tests/styles live with the owning feature where appropriate;
- unrelated major routes do not ship in the initial bundle;
- Overview is attention-first, not duplicated navigation/KPI decoration;
- loading/empty/error/permission/conflict/unavailable/success states are deliberate product states;
- technical detail is progressively disclosed;
- backend remains one Fastify modular monolith with explicit useful boundaries;
- PostgreSQL/application/domain logic remain canonical authority;
- legitimate cross-module workflows use narrow explicit public contracts rather than private implementation imports;
- old owners are deleted after parity instead of retained indefinitely.

## 4. Binding decision order

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Architecture constraints:

- **Correct ownership before convenience**.
- **Verified contracts before visual preservation**.

Acceptance target:

**Functional + Clear + Easy + Predictable + Comfortable + Consistent + Fast + Maintainable + Professional**

Legacy presentation is evidence, not a preservation contract.

## 5. Migration law

Every structural migration follows:

`understand operator job → map API/database contracts → classify current owner → define target owner → design states/flow → build replacement → verify operator outcome → switch composition → delete legacy owner → exact-head gates → document`

Classifications:

- `KEEP`
- `MOVE`
- `STANDARDIZE`
- `REBUILD`
- `REMOVE`

No patch-only completion and no big-bang rewrite.

Before implementation, each batch records:

1. operator job;
2. current owner;
3. target owner;
4. authoritative API/database contracts;
5. primary/secondary/destructive actions;
6. loading/empty/error/permission/conflict states;
7. responsive/RTL/keyboard behavior;
8. route/bundle loading boundary;
9. old owner/removal condition;
10. verification evidence.

## 6. Target Admin architecture

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
2. Feature owns workflow routes/pages/components/API adapters/models/tests.
3. Feature internals are private.
4. Cross-feature work uses feature `public` contracts or app orchestration.
5. `shared` cannot import feature/app internals.
6. No new feature dumping in root `src/`.
7. Major workflow route modules lazy-load by default; do not split tiny components merely to create chunks.
8. One Admin shell owns global chrome/navigation.
9. Server data is not recreated as a second browser business authority.
10. Product states are explicit patterns.
11. Tabs are for closely related views of one workflow/entity only.
12. Dialogs/drawers are bounded actions, not page-sized workflows.
13. Technical IDs/provider/runtime/raw JSON are advanced details unless required for the task.
14. RTL/a11y/responsive/reduced-motion are architecture requirements.
15. Browser back/deep links are first-class.

### Shared UI ownership

```text
packages/brand
  → packages/ui
  → apps/admin-web/src/shared
  → apps/admin-web/src/features
  → app composition
```

- `packages/ui`: genuinely cross-product primitives/semantic behavior only.
- Admin `shared/ui`: reusable **Admin-only** patterns.
- Features: business composition and vocabulary.

Do not duplicate one primitive in `packages/ui` and Admin shared. Do not push Admin-specific dense workflow components into `packages/ui` merely to call them shared.

### State/library decision

No new global state/query framework is authorized during foundation work without evidence. Correct ownership comes first. Evaluate a dependency only if repeated server-state orchestration remains a proven problem after feature boundaries are corrected.

### Styling decision

Do not replace the approved CSS/token stack with Tailwind, CSS-in-JS or another styling architecture merely for the rebuild. Keep brand/design tokens and repair CSS ownership/pattern duplication.

## 7. Route/IA decision

`TARGET_INFORMATION_ARCHITECTURE.md` is binding for **user-job/screen boundaries**, not for a literal URL prefix when verified runtime has a better compatibility reason.

Current Admin runtime owns `/app/*`; preserve `/app` as canonical base unless deployment/runtime evidence justifies changing it.

Target semantics evolve beneath it, e.g.:

```text
/app
/app/curriculum/...
/app/content/library/...
/app/content/ingestion/...
/app/content/ocr/...
/app/ai/jobs/...
/app/ai/review/...
/app/questions/...
/app/quizzes/...
/app/students/...
/app/access/codes/...
/app/operations/...
```

Superseded routes may redirect through a bounded compatibility window with an explicit deletion condition.

## 8. Target Backend architecture

Deployment remains one Fastify modular monolith.

Conceptual target:

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

This is a **dependency model**, not permission for mechanical mass moves or empty-layer ceremony.

Direction where the concepts exist:

`HTTP → Application → Domain`

Infrastructure supplies technical adapters.

Rules:

- HTTP parses/adapts/delegates; it does not become a second business layer.
- Application owns use-case orchestration/transactions where needed.
- Domain exists only where durable business rules justify it.
- Infrastructure owns PostgreSQL/provider/filesystem adapters.
- Small modules may stay compact when ownership/dependency direction is already obvious.
- Cross-module dependencies use narrow public application contracts only when a genuine dependency exists.
- No DI framework/service locator/interface ceremony is introduced without evidence.
- Database schema changes require domain/integrity need, never folder refactoring.

Canonical data flow:

`PostgreSQL → application/domain authority → HTTP contract → feature API adapter → presentation model → Admin UI`

## 9. Product/design rules

Canonical detailed rules:

`docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`

Highlights:

- one operator job / one primary owner;
- Overview answers “what needs attention now?”;
- no fabricated metrics/trends/health claims;
- product states are first-class;
- backend error truth stays server-owned; Admin presents meaning + recovery;
- progressive disclosure for technical data;
- primary/secondary/destructive actions are visually distinct;
- motion is restrained and reduced-motion safe;
- dense Admin surfaces remain readable, Arabic-first and RTL-native.

Design authority remains:

`brand tokens → primitives → components → patterns → feature compositions`

No second visual identity/design system is authorized.

## 10. Browser acceptance philosophy

Browser tests validate operator outcomes/durable contracts, not obsolete copy/selectors/DOM shape.

Where applicable verify:

- route reachable/deep-linkable;
- authoritative data shown;
- operation succeeds/fails correctly;
- auth/permission enforced;
- focus/context restored;
- RTL/keyboard works;
- representative narrow/desktop layouts do not overflow;
- real PostgreSQL/API/Chromium workflow remains valid.

Never weaken server validation/security to make a fixture pass.

## 11. Scenario gates

- admin sign-in/session restoration/logout;
- Overview → actionable task;
- Curriculum → Content → ingestion/review/publication;
- AI output → human review → application;
- Question Bank lifecycle;
- Quiz Builder lifecycle/version/export;
- Students account/device/recovery;
- Access Codes generation/filter/revoke/report/import/export;
- Operations health/audit/notifications/diagnostics;
- real PostgreSQL + API + Chromium;
- keyboard/focus/RTL/responsive/no-overflow representative flows.

## 12. Roadmap

### AB-00 — Architecture baseline & guardrails — ACTIVE

- **AB-00.1 ownership/boundary map — DONE**
- **AB-00.2 current-file + dependency migration inventory — DONE**
- **AB-00.3 automated architecture guard — IMPLEMENTED / strengthening exact-head verification active**
- AB-00.4 Admin bundle/runtime + backend-composition baseline — NEXT
- AB-00.5 readiness gate — PENDING

AB-00 closes only when docs, branch evidence, guard, baselines and exact-head verification agree.

### AB-01 — Admin system foundation + API presentation boundary

- design-system primitives/patterns that are genuinely reusable;
- stable Admin transport/error/session conventions;
- status/action/form/state patterns;
- no feature-specific logic in shared;
- no generic mega-components.

### AB-02 — Thin Admin application shell

- bootstrap/session provider;
- global shell/navigation owner;
- router/layout/error boundaries;
- major-route lazy loading/Suspense;
- route focus/history;
- remove feature knowledge from `App.tsx`;
- preserve auth/session outcomes through real Chromium.

### AB-03 — Admin vertical-slice rebuild

1. Overview + Operations
2. Curriculum + Content
3. Reviews + AI Authoring
4. Question Bank
5. Quiz Builder
6. Students
7. Access Codes

For every slice:

`job map → contracts → IA/states/actions → new owner → browser/integration parity → switch → legacy delete`

### AB-04 — Backend modular-monolith standardization

- extract app composition/HTTP infrastructure;
- standardize only useful module boundaries;
- explicit legitimate cross-module contracts;
- preserve business/security/PostgreSQL authority;
- remove private cross-module implementation imports.

### AB-05 — Admin design/interaction convergence audit

Rules apply during every earlier slice. AB-05 only audits remaining system-wide drift:

- duplicate primitives/one-off CSS;
- hierarchy/forms/tables/actions/states;
- duplicated navigation;
- technical-detail leakage;
- RTL/a11y/responsive/visual QA.

### AB-06 — Performance/delivery validation

- validate code splitting from AB-02/03;
- remove dead/duplicate code/CSS/dependencies;
- inspect fetch waterfalls/state duplication;
- establish evidence-based bundle budgets;
- never hide performance debt by raising warnings.

### AB-07 — Legacy removal + hard dependency enforcement

- delete replaced root APIs/components/styles/aliases;
- remove transitional exceptions;
- harden target dependency rules;
- no dual ownership.

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
- documentation consistency.

No merge/readiness before AB-08 exact-head green.

## 13. Architecture guard ratchet rule

Current transitional guard freezes legacy debt at an accepted baseline and rejects new debt.

After an architecture-cleanup batch becomes exact-head green:

1. confirm the cleanup removed an accepted legacy seam;
2. advance the guard baseline in a dedicated reviewed update;
3. run guard self-test + exact-head CI;
4. never advance the baseline across an unverified architectural regression.

AB-07 removes transitional debt allowances and enforces target rules directly.
