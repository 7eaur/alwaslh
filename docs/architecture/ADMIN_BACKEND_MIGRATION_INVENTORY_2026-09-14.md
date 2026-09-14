# Admin + Backend Migration Inventory — AB-00.2

Date: **2026-09-14**  
Status: **COMPLETE — dependency inventory and migration exceptions frozen**

This inventory is the execution map for root restructuring. It does not authorize blind file moves. Each row represents an ownership decision that must be closed by scenario parity and legacy removal.

Detailed dependency evidence is recorded in:

`docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`

## 1. Super Admin — application/root ownership

| Current area | Target owner | Classification | Preserve | Removal condition |
|---|---|---|---|---|
| `src/App.tsx` | `app/bootstrap` + `app/router` + `app/providers` + `app/layouts` | REBUILD | session/auth behavior, route semantics, shell behavior | old broad composition removed after thin shell + routes proven |
| `src/main.tsx` | `app/bootstrap` | MOVE / STANDARDIZE | startup imports and app mounting | root file becomes minimal entry only |
| `src/router.tsx` | `app/router` | MOVE / STANDARDIZE | current route URLs/deep links | target router owns routes + lazy boundaries |
| `src/LoginScreen.tsx` | `features/auth` | MOVE / STANDARDIZE | login/session contract | no auth page ownership remains at root |
| `src/presentation-foundation.tsx` | `app/layouts` / `shared/ui` by responsibility | REBUILD / SPLIT | RTL, skip link, focus landmark, shell semantics | each responsibility has one target owner |
| root generic API transport/error concerns | `shared/api` | STANDARDIZE | cookies/session/error semantics | only transport-level generic code remains shared |
| root feature-specific `*-api.ts` | owning `features/<feature>/api` | MOVE | endpoint contracts | root feature API file deleted after callers migrate |
| root feature-specific tests | owning feature tests | MOVE | coverage | no feature tests remain orphaned at root |
| root feature CSS | feature styles or shared pattern owner | MOVE / REBUILD | intended visual behavior | one-off global ownership removed |
| generic editors/previews | explicit feature owner unless truly generic | AUDIT → MOVE/STANDARDIZE | behavior | shared promotion only after semantic proof |

## 2. Super Admin — feature ownership

| Current owner | Target owner | Classification | Main scenario | Important dependency decision |
|---|---|---|---|---|
| `src/admin/overview` | `features/overview` | MOVE / REBUILD BOUNDARY | attention-first operational overview | must stop importing Operations private model/CSS; consume explicit public attention contract |
| `src/admin/operations` | `features/operations` | MOVE / STANDARDIZE | health/audit/diagnostics/notifications | may expose narrow public attention contract; private implementation stays private |
| `src/admin/curriculum` | `features/curriculum` | MOVE / STANDARDIZE | curriculum structure/authoring | curriculum reference data exposed through explicit feature/public contract where another feature genuinely needs it |
| `src/admin/content` | `features/content` | REBUILD INTERNAL COMPOSITION | ingestion/content/review/publication workflow | split route composition, workflow model, validation, API adapter and bounded components; do not move giant workspace unchanged |
| `src/admin/reviews` | `features/reviews` | REBUILD INTERNAL COMPOSITION | human review decisions | root content API/CSS and `OcrSourcePreview` ownership move into review/content boundary; no root feature seam remains |
| `src/admin/ai-authoring` | `features/ai-authoring` | REBUILD COMPOSITION | AI-assisted authoring/application with human authority | feature adapters become local; advanced technical state remains progressively disclosed |
| `src/admin/questions` | `features/questions` | MOVE / STANDARDIZE | Question Bank lifecycle | root question API/CSS move into feature; curriculum lookup must use explicit public/reference-data contract |
| `src/admin/quizzes` | `features/quizzes` | MOVE / STANDARDIZE | Quiz Builder/version/export lifecycle | root quiz API/CSS move into feature; repeated page patterns use shared primitives only where stable |
| `src/admin/students` | `features/students` | REBUILD INTERNAL COMPOSITION | account/device/recovery management | split list/detail/actions/model; root admin-student-access API/CSS cannot remain hidden shared owner |
| `src/admin/access-codes` | `features/access-codes` | REBUILD INTERNAL COMPOSITION | generate/import/filter/revoke/report/export | split filtering/generation/list/report concerns; curriculum/class lookup through explicit public contract; root shared access CSS/API removed |

## 3. Confirmed frontend coupling categories

### 3.1 Session lifecycle leakage

Current pages repeatedly receive `onSessionExpired` and call `isMissingSessionError(...)` themselves.

**Target:** one session invalidation boundary under `app/providers/session` + `shared/api`; feature pages stop owning application lifecycle callbacks.

### 3.2 Root feature API/CSS ownership

Confirmed representative root dependencies:

- Question Bank → `admin-api`, `question-bank-api`, `question-bank.css`;
- Quiz Builder → `admin-api`, `quiz-builder-api`, `quiz-builder.css`;
- Content → `admin-api`, `content-ingestion-api`;
- Reviews → `admin-api`, `content-operations-api`, `content-operations.css`, root `OcrSourcePreview`;
- Students / Access Codes → `admin-api`, `admin-student-access-api`, `admin-student-access.css`.

**Target:** feature-local adapters/styles plus truly generic shared transport/patterns only.

### 3.3 Cross-feature private import

Confirmed:

`overview → operations/operations-model + operations-pages.css`

**Target:** narrow public Operations attention contract or app-level aggregation; no private feature import.

### 3.4 Cross-feature reference data

Question Bank, Content and Access Codes need curriculum/class/lesson reference information.

**Decision:** this is legitimate product dependency but may not use another feature's private implementation. Curriculum may expose a narrow read/public contract or the app may own a stable Admin reference-data adapter if evidence shows it is broadly reused. Do not duplicate curriculum fetch/mapping logic in every feature.

### 3.5 Repeated presentation patterns

Confirmed across Question Bank, Quiz Builder, Students, Access Codes and Reviews:

- loading/ready/error states;
- filter bars;
- pagination;
- status/date mapping;
- feedback/success/error surfaces.

**Decision:** AB-01 may standardize stable generic presentation patterns. Business labels/actions remain feature-owned; no generic mega-component.

## 4. Backend — composition and module ownership

Current API is already grouped by business domains and that domain decomposition is retained as evidence. The primary defect is inconsistent internal layering plus a large manual `src/app.ts` composition root.

| Current area | Target owner | Classification | Preserve | Removal/closure condition |
|---|---|---|---|---|
| `src/app.ts` | `src/app/build-app.ts` + `src/app/composition/*` | REBUILD COMPOSITION | Fastify setup, hooks, route registration, lifecycle | broad direct service construction removed from one giant file |
| `src/config.ts` | `src/app/config` | MOVE / STANDARDIZE | environment validation/config semantics | one app config boundary |
| `src/db.ts` | `src/shared/db` | MOVE / STANDARDIZE | PostgreSQL connection authority | modules consume explicit DB infrastructure contract |
| `src/errors.ts` | `src/shared/errors` | MOVE / STANDARDIZE | stable public error contract | one error boundary/convention |
| `auth` | `modules/auth` | STANDARDIZE / SPLIT HTTP FOUNDATION | auth/session/security rules | generic request parsing/admin guard no longer owned by Auth private HTTP |
| `activation` | `modules/activation` | STANDARDIZE | activation/device-binding behavior | explicit module boundary |
| `access` | `modules/access` | STANDARDIZE | access-code business rules/imports | explicit module boundary |
| `admin-access` | `modules/admin-access` | STANDARDIZE | admin account/access operations | explicit module boundary; frontend may still expose Students and Access Codes as separate user-task features |
| `curriculum` | `modules/curriculum` | STANDARDIZE | curriculum/reader publication contracts | explicit module boundary/public read contracts where needed |
| `content` | `modules/content` | STANDARDIZE | ingestion/preview/content operations | explicit module boundary |
| `ai` | `modules/ai` | REBUILD BOUNDARIES | AI ops/review/authoring behavior | concrete QuestionBank/QuizBuilder dependencies and cross-domain SQL replaced by explicit ports/read contracts |
| `question-bank` | `modules/question-bank` | STANDARDIZE CONTRACT | question lifecycle/revisions/regeneration | no dependency on AI internal question schema; neutral question contract owner established |
| `quiz-builder` | `modules/quiz-builder` | STANDARDIZE | quiz/version/candidate/export rules | explicit application contracts for legitimate orchestration |
| `student-assessment` | `modules/student-assessment` | KEEP / STANDARDIZE CONTRACT | server scoring/finalization; Student UI out of scope | backend-only boundary cleanup if required |
| `offline` | `modules/offline` | KEEP / STANDARDIZE CONTRACT | signed auth/integrity rules | backend-only boundary cleanup if required |
| `notifications` | `modules/notifications` | STANDARDIZE | notification behavior | explicit module boundary |
| `admin-operations` | `modules/admin-operations` | STANDARDIZE | health/audit/ops contracts | explicit module boundary |
| `media` | `shared/media` or module infrastructure by use | AUDIT | storage/provider behavior | no business semantics hidden in shared infrastructure |

## 5. Confirmed backend coupling categories

1. `app.ts` constructs/registers the full system graph.
2. AI Authoring directly depends on concrete `QuestionBankService` and `QuizBuilderService`.
3. AI Authoring performs direct SQL against data governed by other domains while also calling their services.
4. Question Bank HTTP imports the question schema from AI internals (`ai/contracts`).
5. Module HTTP imports request/auth helpers from `auth/http` and repeats admin authorization guards.
6. `config`, `db`, `errors` are global infrastructure concerns currently owned incidentally by source-root files.
7. Legitimate orchestration exists and must be preserved through explicit narrow application contracts rather than artificially removed.

## 6. Frozen temporary exception set for AB-00.3 guard

The architecture guard introduced in AB-00.3 must follow a **ratchet model**: it blocks new debt immediately while allowing only the explicitly listed legacy seams until their scheduled migration removes them.

Temporary exceptions allowed only because they already exist:

### Admin

- existing production files under `apps/admin-web/src/admin/*` until moved feature-by-feature;
- existing root feature API files referenced by current production code;
- existing root feature CSS referenced by current production code;
- current `onSessionExpired` prop plumbing;
- current `overview → operations` private import;
- current root `OcrSourcePreview` owner;
- current `App.tsx` eager feature imports and route table.

### Backend

- existing business directories under `apps/api/src/<domain>` until module migration;
- current `app.ts` direct service construction;
- current `auth/http` helper imports by module HTTP files;
- current AI → concrete Question Bank / Quiz Builder service type dependencies;
- current Question Bank → AI contract schema import;
- existing root imports of `config.ts`, `db.ts`, `errors.ts`.

Rules for exceptions:

- exceptions are exact known debt, not patterns permitting more files;
- no new root feature API/CSS/workspace file may be added;
- no new cross-feature private import may be added;
- no new backend cross-module private service/schema dependency may be added;
- touching an exception during its owning migration should reduce or remove it, never expand it;
- exception count must monotonically decrease after structural migration begins.

## 7. First implementation wave after AB-00 closes

The first structural implementation is dependency-first:

1. Admin shared transport/session/error boundary;
2. Admin `app/` shell + typed route registry + lazy boundaries;
3. Overview + Operations boundary repair as first UI vertical slice;
4. backend app composition + HTTP foundation extraction without business-rule changes;
5. Curriculum + Content as first high-value cross-layer business slice;
6. Question Bank / Quiz / AI only after neutral question and cross-module application contracts are explicit.

## 8. AB-00.2 completion decision

**AB-00.2 — DONE.**

The migration inventory now records:

- root/application ownership;
- all Admin feature owners;
- representative internal composition problems;
- frontend cross-feature/root dependency categories;
- backend composition and cross-module dependency categories;
- exact temporary exception classes required by the architecture ratchet;
- removal conditions and first implementation order.

Next stage: **AB-00.3 — Automated architecture guard**.

No visual or structural migration starts before the guard and baselines are established.
