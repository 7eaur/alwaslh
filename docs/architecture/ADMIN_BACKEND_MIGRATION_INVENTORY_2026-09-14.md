# Admin + Backend Migration Inventory — AB-00.2

Date: **2026-09-14**  
Status: **ACTIVE BASELINE / first-wave inventory established**

This inventory is the execution map for root restructuring. It does not authorize blind file moves. Each row represents an ownership decision that must be closed by scenario parity and legacy removal.

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

| Current owner | Target owner | Classification | Main scenario |
|---|---|---|---|
| `src/admin/overview` | `features/overview` | MOVE / STANDARDIZE | attention-first operational overview |
| `src/admin/operations` | `features/operations` | MOVE / STANDARDIZE | health/audit/diagnostics/notifications |
| `src/admin/curriculum` | `features/curriculum` | MOVE / STANDARDIZE | curriculum structure/authoring |
| `src/admin/content` | `features/content` | REBUILD COMPOSITION | ingestion/content/review/publication workflow |
| `src/admin/reviews` | `features/reviews` | MOVE / STANDARDIZE | human review decisions |
| `src/admin/ai-authoring` | `features/ai-authoring` | REBUILD COMPOSITION | AI-assisted authoring/application with human authority |
| `src/admin/questions` | `features/questions` | MOVE / STANDARDIZE | Question Bank lifecycle |
| `src/admin/quizzes` | `features/quizzes` | MOVE / STANDARDIZE | Quiz Builder/version/export lifecycle |
| `src/admin/students` | `features/students` | MOVE / STANDARDIZE | account/device/recovery management |
| `src/admin/access-codes` | `features/access-codes` | MOVE / STANDARDIZE | generate/import/filter/revoke/report/export |

## 3. Backend — composition and module ownership

Current API is already grouped by business domains and that domain decomposition is retained as evidence. The primary defect is inconsistent internal layering plus a large manual `src/app.ts` composition root.

| Current area | Target owner | Classification | Preserve | Removal/closure condition |
|---|---|---|---|---|
| `src/app.ts` | `src/app/build-app.ts` + `src/app/composition/*` | REBUILD COMPOSITION | Fastify setup, hooks, route registration, lifecycle | broad direct service construction removed from one giant file |
| `src/config.ts` | `src/app/config` | MOVE / STANDARDIZE | environment validation/config semantics | one app config boundary |
| `src/db.ts` | `src/shared/db` | MOVE / STANDARDIZE | PostgreSQL connection authority | modules consume explicit DB infrastructure contract |
| `src/errors.ts` | `src/shared/errors` | MOVE / STANDARDIZE | stable public error contract | one error boundary/convention |
| `auth` | `modules/auth` | STANDARDIZE | auth/session/security rules | HTTP/application/domain responsibilities explicit |
| `activation` | `modules/activation` | STANDARDIZE | activation/device-binding behavior | explicit module boundary |
| `access` | `modules/access` | STANDARDIZE | access-code business rules/imports | explicit module boundary |
| `admin-access` | `modules/admin-access` | STANDARDIZE | admin account/access operations | explicit module boundary |
| `curriculum` | `modules/curriculum` | STANDARDIZE | curriculum/reader publication contracts | explicit module boundary |
| `content` | `modules/content` | STANDARDIZE | ingestion/preview/content operations | explicit module boundary |
| `ai` | `modules/ai` | REBUILD BOUNDARIES | AI ops/review/authoring behavior | internal sub-areas and dependencies explicit |
| `question-bank` | `modules/question-bank` | STANDARDIZE | question lifecycle/revisions/regeneration | explicit module boundary |
| `quiz-builder` | `modules/quiz-builder` | STANDARDIZE | quiz/version/candidate/export rules | explicit module boundary |
| `student-assessment` | `modules/student-assessment` | KEEP / STANDARDIZE CONTRACT | server scoring/finalization; Student UI out of scope | backend-only boundary cleanup if required |
| `offline` | `modules/offline` | KEEP / STANDARDIZE CONTRACT | signed auth/integrity rules | backend-only boundary cleanup if required |
| `notifications` | `modules/notifications` | STANDARDIZE | notification behavior | explicit module boundary |
| `admin-operations` | `modules/admin-operations` | STANDARDIZE | health/audit/ops contracts | explicit module boundary |
| `media` | `shared/media` or module infrastructure by use | AUDIT | storage/provider behavior | no business semantics hidden in shared infrastructure |

## 4. Dependency decisions to audit next

AB-00.2 must explicitly inspect and classify:

1. cross-feature imports inside Admin;
2. feature code importing root API helpers that should become feature adapters;
3. generic components that actually encode one feature's vocabulary;
4. backend services constructing/calling another module's internal service directly;
5. HTTP handlers doing application/business work instead of delegation;
6. repeated authorization/error/transaction logic;
7. raw DB shapes leaking into HTTP/frontend contracts;
8. duplicated status/date/error mapping across Admin features;
9. CSS selectors/patterns repeated across feature owners;
10. route imports responsible for the current eager ~968.58 kB Admin main chunk baseline.

## 5. First implementation wave after AB-00 closes

The first structural implementation should be dependency-first:

1. Admin `app/` shell + route lazy boundaries;
2. shared Admin transport/error/session primitives;
3. Overview + Operations as first vertical slice because they exercise shell, navigation and shared patterns with low cross-feature write risk;
4. backend app composition extraction without changing business behavior;
5. then Curriculum + Content as the first high-value cross-layer business slice.

This order is architectural, not cosmetic.

## 6. Student isolation

`apps/student-web` is intentionally absent from the migration inventory. Existing Student tests may be executed only as regression evidence for API contracts affected by backend work.
