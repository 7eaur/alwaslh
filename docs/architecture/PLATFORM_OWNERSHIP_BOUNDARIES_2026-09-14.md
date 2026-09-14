# Platform Ownership & Boundary Map — الوسيلة الذكية

Date: **2026-09-14**  
Status: **PA-00.1 COMPLETE — binding baseline for structural migration**

> This document defines who owns what before any structural migration. It is intentionally stricter than the current repository shape. Existing code is behavioral evidence, not permission to keep ambiguous ownership.

## 1. Non-negotiable platform ownership

### Applications

| Area | Canonical owner | Responsibility | May not own |
|---|---|---|---|
| Student product | `apps/student-web` | learner journeys, route composition, learner presentation, client adapters | canonical business rules, authorization, scoring, publication authority |
| Super Admin | `apps/admin-web` | operator journeys, route composition, admin presentation, client adapters | canonical publication/review/access rules, raw database authority |
| API | `apps/api` | authentication, authorization, domain/application behavior, HTTP contracts, orchestration | browser presentation state |
| PostgreSQL | `database/migrations` + database runtime | canonical persisted state and integrity | UI semantics |
| Brand | `packages/brand` | identity assets and design tokens | feature layouts/business components |
| UI | `packages/ui` | genuinely cross-product primitives/components/patterns | Student/Admin domain-specific rules |
| Domain | `packages/domain` | genuinely shared pure contracts/value semantics | feature-specific browser state or database adapters |
| Validation | `packages/validation` | genuinely shared boundary schemas | arbitrary helper functions |

## 2. Dependency direction

### Frontends

Allowed direction:

`app → features → shared → packages`

Rules:

1. `app/` composes routing, providers, layouts and top-level lifecycle only.
2. `features/<name>/` owns its route pages, API adapter, model, feature components and tests.
3. One feature must not import another feature's private file.
4. Cross-feature collaboration happens through navigation, an explicit public contract, or app-level orchestration.
5. `shared/` never imports from `features/` or `app/`.
6. `packages/ui` never imports application features.
7. A feature-specific API adapter belongs to that feature; only transport/session/error primitives may be shared.
8. New feature files are not allowed to accumulate in frontend `src/` roots.

### Backend

Target direction:

`HTTP → Application → Domain`

`Infrastructure → implements ports required by Application/Domain`

Rules:

1. `app/` is a composition root, not a business module.
2. Module internals are private unless exposed through an explicit application contract.
3. Database/Fastify/media-provider details do not become domain concepts.
4. Modules must not import another module's internal repository/service opportunistically.
5. Cross-module work is explicit orchestration or an application-level contract.
6. PostgreSQL remains canonical state authority; this refactor does not replace it with browser state or a second persistence abstraction.

## 3. Current Admin ownership map

Existing route/feature ownership under `apps/admin-web/src/admin/` is a useful intermediate asset and should be migrated into the final `features/` convention rather than discarded blindly.

| Current owner | Target owner | Classification | Migration rule |
|---|---|---|---|
| `admin/overview` | `features/overview` | MOVE / STANDARDIZE | preserve attention-first behavior; feature owns its route/page/model |
| `admin/curriculum` | `features/curriculum` | MOVE / STANDARDIZE | keep curriculum business contracts; remove root API/UI leakage |
| `admin/content` | `features/content` | MOVE / REBUILD COMPOSITION | separate ingestion/review/publication screens by user task, not backend implementation |
| `admin/reviews` | `features/reviews` | MOVE / STANDARDIZE | human review remains explicit and server-authoritative |
| `admin/ai-authoring` | `features/ai-authoring` | MOVE / REBUILD COMPOSITION | advanced internals stay progressive/diagnostic, not default UX |
| `admin/questions` | `features/questions` | MOVE / STANDARDIZE | Question Bank owns list/detail/create/import/review/revision UX |
| `admin/quizzes` | `features/quizzes` | MOVE / STANDARDIZE | Quiz Builder owns lifecycle/version/export UX |
| `admin/students` | `features/students` | MOVE / STANDARDIZE | student account/device/recovery ownership only |
| `admin/access-codes` | `features/access-codes` | MOVE / STANDARDIZE | access-code generation/revoke/report/import ownership only |
| `admin/operations` | `features/operations` | MOVE / STANDARDIZE | health/audit/diagnostics/notifications operations |

### Admin root `src/` findings

Current root contains bootstrap files **and** feature/API/editor/test/CSS files. This is transitional debt.

Binding classification:

- `main.tsx` → **KEEP then MOVE responsibility into `app/bootstrap`**.
- `App.tsx` → **REBUILD as a thin composition root; do not preserve its current responsibility load**.
- `router.tsx` / route composition → **KEEP behavior, MOVE into `app/router` and make route owners lazy by default**.
- `presentation-foundation.tsx`, shell foundation → **STANDARDIZE under app layouts/shared patterns**.
- `LoginScreen.tsx` → **MOVE to `features/auth`**.
- feature-specific `admin-*-api.ts`, `*-api.ts` → **MOVE to owning feature `api/`** unless proven truly shared transport.
- feature-specific `*.test.ts` → **MOVE with owner**.
- feature-specific CSS → **MOVE with owner or replace with shared pattern only when semantics are genuinely shared**.
- generic editors/previews → **evaluate owner before promotion**; do not move to shared merely because multiple files call them.

No new product feature implementation may be added to Admin root `src/` during the rebuild.

## 4. Current Student ownership map

Student currently has more root-level composition than the target architecture permits. Security-sensitive behavior is preserved while presentation/composition ownership changes.

| Current responsibility | Target owner | Classification | Contract to preserve |
|---|---|---|---|
| activation | `features/activation` | REBUILD COMPOSITION / KEEP behavior | server activation + device binding |
| login/recovery/session | `features/auth` | REBUILD COMPOSITION / KEEP behavior | auth/session/device proof |
| authenticated shell/home | `features/home` + `app/layouts` | REBUILD | no fake progress/recommendation data |
| curriculum browse | `features/learning` | MOVE / REFACTOR | entitlement/publication-filtered curriculum |
| lesson Reader | `features/reader` | MOVE / REFACTOR | protected media/publication/entitlement |
| quiz discovery | `features/practice` | MOVE / REFACTOR | published quiz availability |
| active assessment | `features/assessment` | MOVE / REFACTOR | server-owned attempt/scoring/finalization |
| downloads | `features/downloads` | MOVE / REFACTOR | bounded storage and protected packages |
| offline authorization/session | `features/offline` | MOVE / STANDARDIZE | signed authorization/integrity/scope rules |
| account/access | `features/account` / `features/access` | MOVE / STANDARDIZE | existing account/access authority |

### Student root rule

`App.tsx` must become orchestration only. Forms, auth steps, connection UI, learning workflows and account operations must not continue accumulating in one file.

## 5. Backend module ownership map

Current business-area directories are **KEEP as domain evidence**, but the internal shape is inconsistent and composition is centralized in `apps/api/src/app.ts`.

Target modules:

- `auth`
- `activation`
- `access`
- `admin-access`
- `curriculum`
- `content`
- `ai`
- `question-bank`
- `quiz-builder`
- `student-assessment`
- `offline`
- `notifications`
- `admin-operations`
- `media` as shared infrastructure only where it is provider/storage infrastructure rather than product behavior

Classification:

- business rules/services: **KEEP behavior / STANDARDIZE boundary**;
- HTTP registration: **MOVE under module `http/` convention**;
- app-level service construction: **REFACTOR into explicit module composition**;
- database access: **KEEP PostgreSQL authority, isolate infrastructure concern where useful**;
- cross-module direct internal imports: **AUDIT and REMOVE unless they are explicit application contracts**.

No microservice split is authorized by PA-00.

## 6. Shared package promotion rules

A file may move to a shared package only when all are true:

1. at least two independent owners require the same semantic contract/primitive;
2. it has no feature-specific vocabulary/behavior hidden inside it;
3. its API can be named without referring to one current caller;
4. ownership and tests are clear;
5. moving it reduces dependency coupling rather than hiding it.

Otherwise it remains feature-owned.

This rule directly prevents `shared/` from becoming a second dumping ground.

## 7. Design-system ownership

Binding layer direction:

`brand tokens → UI primitives → reusable components → product patterns → feature composition`

- token ownership: `packages/brand`;
- cross-product primitive/component ownership: `packages/ui`;
- Student/Admin pattern variants may remain app-local when density/task semantics differ;
- feature composition remains inside the feature;
- no feature creates a competing color/spacing/typography system;
- RTL, focus, reduced motion and supported responsive behavior are system requirements, not page-by-page patches.

Existing `TARGET_INFORMATION_ARCHITECTURE.md` and `DESIGN_SYSTEM_SPEC.md` remain UX/product authority and are not duplicated here.

## 8. Migration classifications

Every touched owner must use exactly one primary classification before edit:

- **KEEP** — architecture and behavior are correct; verify only.
- **MOVE** — behavior is correct but ownership/location is wrong.
- **STANDARDIZE** — behavior is valid but boundary/API/layout convention is inconsistent.
- **REBUILD** — current composition/ownership is fundamentally wrong; preserve only proven contracts.
- **REMOVE** — obsolete/duplicate owner after replacement parity.

"IMPROVE" without an ownership decision is not sufficient for architecture work.

## 9. Root-fix migration rule

For every vertical slice:

1. identify canonical product scenario and server contracts;
2. declare target owner and dependency boundary;
3. build/relocate behind that target owner;
4. prove unit/contract/integration/browser parity as applicable;
5. switch route/composition to the new owner;
6. delete replaced legacy owner in the same stage or a specifically bounded cleanup commit;
7. run exact-head gates;
8. update ownership map and engineering log.

A stage is **not complete** while both old and new owners remain active without a documented temporary bridge.

## 10. PA-00.1 completion decision

PA-00.1 is complete when this ownership map is committed and referenced from the active architecture roadmap.

This does **not** authorize mass file movement. The next PA-00 substep is automated dependency/placement enforcement plus an exact current-file migration inventory. Feature migration begins only after PA-00 closes.