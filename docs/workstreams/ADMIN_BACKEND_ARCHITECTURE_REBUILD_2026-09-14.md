# Admin + Backend Architecture Rebuild — الوسيلة الذكية

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**  
Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52` — Draft only; no merge/auto-merge.

Canonical decision review:

`docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`

## 1. Scope and responsibility boundary

This workstream owns the **Super Admin frontend plus the full server-side product architecture**.

### IN SCOPE — owned here

- `apps/admin-web` — complete Super Admin product rebuild;
- `apps/api` — **full backend**, including APIs/services used by both Admin and Student;
- `database/migrations` — PostgreSQL schema/integrity authority;
- authentication, session, device verification, access/entitlements, curriculum/publication, content/media/OCR, AI/review, Question Bank, Quiz Builder, assessment/scoring, offline authorization/integrity, notifications and operations on the server side;
- `packages/brand`, `packages/ui`, `packages/domain`, `packages/validation` only when genuinely required by Admin/API/shared contracts;
- backend modular-monolith boundaries, service/application ownership, HTTP contracts, PostgreSQL integrity, security, performance and cross-module orchestration;
- Admin product architecture, UX/UI, IA, routing, data flow, accessibility, RTL, responsive behavior, performance and visual consistency;
- CI, contract/integration/security tests and real browser verification required to prove Admin/backend behavior.

### OUT OF SCOPE — owned by the separate Student frontend workstream

- redesign/refactor of `apps/student-web` UI itself;
- Student page composition, shell/navigation, route architecture, visual layout and frontend feature decomposition;
- Student frontend bundle/design migration performed by the other branch/conversation.

**Important:** “Student frontend is out of scope” does **not** mean Student backend capability is out of scope. Server-side contracts consumed by Student remain part of the full backend owned here. When backend changes affect Student consumers, Student code/tests may be read or executed as regression evidence, but this workstream does not redesign or restructure their frontend implementation.

Current independent Student branch observed during reconciliation: `stage16/student-016i` / PR #57. It remains separate and must not be overwritten.

## 2. Cross-workstream principles adopted from Student refoundation

The Student workstream is not an implementation source for Admin, but several principles are strong product/engineering rules and are adopted here as binding cross-product guidance.

### Decision priority

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance target:

**Functional + Clear + Easy + Predictable + Comfortable + Consistent + Fast + Maintainable + Professional**

### Adopted rules

1. **One owner per responsibility.** One shell owner, one route/workflow owner, one durable authority.
2. **Preserve contracts, not presentation debt.** Existing UI structure is evidence, not a target architecture.
3. **Do not fabricate data or authority.** No fake metrics, counts, progress, health, statuses or actions.
4. **Product states are first-class.** Loading, empty, error, denied, conflict, unavailable, long-running, success and recovery states are explicitly designed and tested.
5. **Clickable must look clickable; static must look static.** Primary, secondary and destructive actions must be obvious without relying on hover.
6. **Destination/workflow-level lazy loading.** Split substantial routes/workflows, not tiny components for artificial chunk counts.
7. **Outcome-based tests.** Browser tests prove user/operator outcomes and contracts, not obsolete wording/DOM shape.
8. **Do not preserve legacy UI merely because an old test targeted it.** Replace tests with durable behavior assertions when ownership changes.
9. **One coherent shell.** Global chrome/navigation cannot be duplicated inside feature surfaces.
10. **Remove historical override chains after parity.** Compatibility is bounded; accepted legacy is deleted after replacement proves behavior.
11. **Motion is functional only.** Reduced motion always wins.
12. **UI completion and backend completion are separate truths.** A designed surface never implies a server capability/stage is complete; backend claims require authoritative contracts and executable evidence.

These rules are adapted to Admin/backend semantics; Student frontend code is not copied.

## 3. Branch isolation rule

Latest reviewed repository comparison:

- live `main`: `3053640cc5bb0699cfa7456cf646e8997f6aa81b`;
- architecture checkpoint before review: `f7c56628bc89e1a534c24bd2ba4771b61313664b`;
- inspected `main`-only implementation changes were Student frontend/workflow changes, not Admin/API/migrations/scoped shared implementation paths.

Decision:

- continue the scoped branch without importing parallel Student frontend implementation;
- re-compare live `main` before every structural phase boundary;
- if `main` changes Admin/API/migrations/shared-contract paths, pause and reconcile before continuing;
- reconcile current `main` before PR #52 review/merge readiness.

Branch divergence is never assumed harmless without path-level evidence.

## 4. Root-fix objective

The objective is not to cosmetically improve the current Admin or merely rename backend folders. Rebuild ownership so that:

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
- backend changes are driven by real domain/security/maintainability needs, not architecture theater;
- old owners are deleted after parity instead of retained indefinitely.

Architecture constraints:

- **Correct ownership before convenience**.
- **Verified contracts before visual preservation**.
- **Root cause before local workaround**.

## 5. Migration law

Every structural migration follows:

`understand job/use case → map API/database contracts → classify current owner → define target owner → design states/flow → build replacement → verify outcome → switch composition → delete legacy owner → exact-head gates → document`

Classifications:

- `KEEP`
- `MOVE`
- `STANDARDIZE`
- `REBUILD`
- `REMOVE`

No patch-only completion and no blind big-bang rewrite.

Before implementation, each batch records:

1. user/operator job or backend use case;
2. current owner;
3. target owner;
4. authoritative API/database/security contracts;
5. primary/secondary/destructive actions where UI exists;
6. loading/empty/error/permission/conflict/recovery states;
7. responsive/RTL/keyboard behavior where UI exists;
8. route/bundle loading boundary where applicable;
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
    ai/
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

This map follows user-job IA rather than preserving old workspace names. AI review/jobs belong to the AI workflow; OCR review belongs to Content; contextual AI authoring belongs with the owning Lesson/Question/Quiz workflow rather than surviving as a catch-all top-level feature.

Rules:

1. `app` composes only.
2. Feature owns workflow routes/pages/components/API adapters/models/tests.
3. Feature internals are private.
4. Cross-feature work uses narrow public contracts or app orchestration.
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
- Admin `shared/ui`: reusable Admin-only patterns.
- Features: business composition and vocabulary.

Do not duplicate one primitive in `packages/ui` and Admin shared. Do not push Admin-specific dense workflow components into `packages/ui` merely to call them shared.

### State/library decision

No new global state/query framework is authorized during foundation work without evidence. Correct ownership comes first. Evaluate a dependency only if repeated server-state orchestration remains a proven problem after feature boundaries are corrected.

### Styling decision

Do not replace the approved CSS/token stack with Tailwind, CSS-in-JS or another styling architecture merely for the rebuild. Keep brand/design tokens and repair CSS ownership/pattern duplication.

## 7. Route/IA decision

`TARGET_INFORMATION_ARCHITECTURE.md` is binding for **user-job/screen boundaries**, not for a literal URL prefix when verified runtime has a compatibility reason.

Current Admin runtime owns `/app/*`; preserve `/app` as canonical base unless deployment/runtime evidence justifies changing it.

Target semantics evolve beneath it:

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

This is a dependency model, not permission for mechanical mass moves or empty-layer ceremony.

Direction where concepts exist:

`HTTP → Application → Domain`

Infrastructure supplies technical adapters.

Rules:

- HTTP parses/adapts/delegates; it does not become a second business layer.
- Application owns use-case orchestration/transactions where needed.
- Domain exists only where durable business rules justify it.
- Infrastructure owns PostgreSQL/provider/filesystem adapters.
- Small modules may stay compact when ownership/dependency direction is already obvious.
- Cross-module dependencies use narrow public application contracts only when a genuine dependency exists.
- No DI framework/service locator/interface ceremony without evidence.
- Database schema changes require domain/integrity need, never folder refactoring.
- Student-facing backend security/business contracts remain protected even though Student frontend is developed elsewhere.

Canonical data flow:

`PostgreSQL → application/domain authority → HTTP contract → consumer adapter → presentation/use-case model`

For Admin UI specifically:

`PostgreSQL → application/domain authority → HTTP contract → Admin feature API adapter → presentation model → Admin UI`

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

## 10. Browser and integration acceptance philosophy

Tests validate outcomes and durable contracts, not obsolete copy/selectors/DOM shape.

Where applicable verify:

- route reachable/deep-linkable;
- authoritative data shown;
- operation succeeds/fails correctly;
- auth/permission enforced;
- focus/context restored;
- RTL/keyboard works;
- representative narrow/desktop layouts do not overflow;
- real PostgreSQL/API/Chromium workflow remains valid;
- Student consumer regressions when a shared/server contract changes.

Never weaken server validation/security to make a fixture pass.

## 11. Scenario gates

Admin scenarios:

- sign-in/session restoration/logout;
- Overview → actionable task;
- Curriculum → Content → ingestion/review/publication;
- AI output → human review → application;
- Question Bank lifecycle;
- Quiz Builder lifecycle/version/export;
- Students account/device/recovery;
- Access Codes generation/filter/revoke/report/import/export;
- Operations health/audit/notifications/diagnostics.

Backend/shared-authority scenarios additionally preserve applicable:

- authentication/session/device verification;
- access/entitlement/publication authority;
- human-review boundaries;
- assessment scoring/finalization authority;
- offline signed authorization/integrity/session/device rules;
- protected media/content access;
- Student consumer compatibility whenever those contracts are changed.

## 12. Roadmap — corrected execution order

### AB-00 — Architecture baseline & guardrails — ACTIVE

- **AB-00.1 ownership/boundary map — DONE**
- **AB-00.2 current-file + dependency migration inventory — DONE**
- **AB-00.3 automated architecture guard — IMPLEMENTED / strengthened guard verified; final exact-head coherence required**
- AB-00.4 Admin bundle/runtime + backend-composition baseline — NEXT
- AB-00.5 readiness gate — PENDING

AB-00 closes only when docs, branch evidence, guard, baselines and exact-head verification agree.

### AB-01 — Shared foundations

Build only the foundations needed by real slices:

- Admin design/product-state primitives and reusable patterns;
- stable Admin API transport/error/session boundary;
- backend app composition/HTTP foundation extraction that can be done without changing business rules;
- common auth/error/db infrastructure ownership where evidence supports it;
- no feature business logic in shared;
- no generic mega-components or abstraction ceremony.

### AB-02 — Thin Admin shell + routing

- bootstrap/session provider;
- one global shell/navigation owner;
- router/layout/error boundaries;
- major-route lazy loading/Suspense;
- route focus/history;
- remove feature knowledge from `App.tsx`;
- preserve auth/session outcomes through real Chromium.

### AB-03 — End-to-end vertical slices

Rebuild each slice **through all owning layers needed by that workflow**, rather than finishing the entire Admin first and postponing backend boundary fixes.

Order:

1. Overview + Operations
2. Curriculum + Content + OCR
3. AI Jobs + AI Review + contextual authoring transitions
4. Question Bank
5. Quiz Builder
6. Students
7. Access Codes

For each slice:

`job map → DB/API/security contracts → backend boundary correction if needed → IA/states/actions → new frontend owner → integration/browser parity → switch → legacy delete`

A slice may leave unrelated backend modules untouched. Do not mass-refactor the server merely for folder uniformity.

### AB-04 — Remaining backend modular-monolith normalization

After vertical slices have corrected the backend seams they actually use:

- close remaining cross-module private imports;
- finish app composition extraction;
- standardize useful module boundaries;
- verify transaction/auth/error conventions;
- preserve full Student-facing backend contracts;
- remove architectural debt not naturally eliminated by AB-03.

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
- inspect backend request/query/payload bottlenecks where evidence exists;
- establish evidence-based budgets;
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
- Student consumer regression gates for changed shared contracts;
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
