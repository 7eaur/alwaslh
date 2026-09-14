# Admin + Backend Dependency Audit — AB-00.2

Date: **2026-09-14**  
Status: **ACTIVE / concrete dependency findings recorded**  
Scope: `apps/admin-web` + `apps/api` + Admin/API shared contracts. Student frontend is not an implementation target.

## 1. Purpose

This document records concrete dependency seams found in the current branch before any structural migration begins. The objective is to prevent cosmetic reorganization from reproducing the same coupling under new folders.

Every finding is classified by ownership impact and has a target correction. Existing behavior remains evidence until the replacement owner is verified.

---

## 2. Super Admin dependency findings

### `AB-DEP-001` — P1 — `App.tsx` is an application + feature composition hotspot

**Evidence**

`apps/admin-web/src/App.tsx` currently owns all of the following:

- session restoration and auth state;
- login/restoring/error states;
- logout/session-expiry handling;
- shell/sidebar/account rendering;
- full route table;
- review-area navigation;
- related-action wrappers;
- not-found handling;
- eager imports for almost every major Admin route.

**Impact**

- all major feature areas enter the initial dependency graph;
- app composition knows feature internals;
- auth/session concern is passed manually into every route through `onSessionExpired`;
- route UX wrappers become global composition logic rather than feature/app patterns;
- feature addition requires editing the broad root.

**Classification:** `REBUILD`

**Target**

```text
app/bootstrap
app/providers/session
app/router
app/layouts/AdminShell
app/error-boundary
features/*/routes
```

The app layer may know public feature route modules, but not private pages/components.

**Removal condition**

Old broad `App.tsx` route/shell/auth ownership is removed after the new app shell, provider and route registry pass exact-head Admin browser verification.

---

### `AB-DEP-002` — P1 — Session expiry is leaking into every feature page

**Evidence**

Feature pages receive `onSessionExpired` from the application root and each page repeats `isMissingSessionError(...)` handling.

Representative examples include Question Bank, Quiz Builder, Overview and Content Ingestion.

**Impact**

- auth transport behavior is duplicated across features;
- feature pages depend on application lifecycle callbacks;
- error handling becomes inconsistent and repetitive;
- future session behavior changes require edits across many feature owners.

**Classification:** `REBUILD / STANDARDIZE`

**Target**

A single Admin API/session boundary should translate missing-session responses into one session invalidation mechanism owned by `app/providers/session` + `shared/api`.

Feature adapters should return business/transport errors without receiving app lifecycle callbacks.

**Removal condition**

No feature page accepts `onSessionExpired` solely for common session handling.

---

### `AB-DEP-003` — P1 — Feature code depends on root feature API files and root CSS

**Evidence**

Examples:

- Question Bank imports `../../question-bank-api`, `../../admin-api`, `../../question-bank.css`.
- Quiz Builder imports `../../quiz-builder-api`, `../../admin-api`, `../../quiz-builder.css`.
- Content Ingestion imports `../../content-ingestion-api` and `../../admin-api`.

**Impact**

The current feature directory is not the real owner. Important API contracts/styles remain outside the feature and the root remains a dependency hub.

**Classification:** `MOVE / STANDARDIZE`

**Target**

```text
features/questions/api/*
features/questions/model/*
features/questions/styles/* or feature-owned component styles

features/quizzes/api/*
features/quizzes/model/*
...
```

Only truly generic transport/session/error primitives stay in `shared/api`.

**Removal condition**

Root feature-specific API/CSS files have zero production callers and are deleted.

---

### `AB-DEP-004` — P1 — Overview directly imports private Operations internals

**Evidence**

`AdminOverviewPage.tsx` imports:

- `../operations/operations-model`
- `../operations/operations-pages.css`

including `buildAttentionItems`, label/format helpers and Operations CSS.

**Impact**

`overview` is not independent; it reaches directly into another feature's private implementation. This breaks the target rule that feature internals are private.

**Classification:** `REBUILD BOUNDARY`

**Decision**

Overview may consume an **explicit public operations-attention contract/presentation adapter**, but must not import Operations private model or feature stylesheet.

Two acceptable target options:

1. `features/operations/public.ts` exposes a stable presentation-neutral contract needed by Overview; or
2. an app-level Overview adapter owns the aggregation when it is genuinely cross-feature.

Do not promote the whole Operations model to shared.

**Removal condition**

No `features/overview` code imports a private path inside `features/operations`.

---

### `AB-DEP-005` — P2 — Repeated page-level loading/error/status/pagination patterns

**Evidence**

Question Bank and Quiz Builder independently implement very similar:

- `loading | ready | error` state;
- error mapping;
- pagination calculations;
- filter submission behavior;
- list empty/error/loading panels;
- status/date display helpers.

**Impact**

This creates visual and behavioral drift and increases maintenance cost.

**Classification:** `STANDARDIZE`, not blind abstraction.

**Target**

Promote only stable generic patterns:

- `PageState` / `AsyncState` presentation pattern;
- pagination component/model;
- FilterBar layout primitives;
- standard date formatting helper if semantically generic;
- status-tone component, while business labels stay feature-owned.

Do **not** build one generic mega-table/list component with feature-specific flags.

---

### `AB-DEP-006` — P1 — Content Ingestion workspace combines orchestration, validation, transport and UI

**Evidence**

`ContentIngestionWorkspace.tsx` currently owns:

- local file contract validation;
- curriculum loading;
- ingestion history loading;
- task creation/upload/process/link/archive orchestration;
- lesson selection;
- busy/progress/feedback state;
- status formatting;
- the full screen composition.

**Impact**

The feature owner is correct, but the internal feature architecture is not. This is exactly the kind of file that must not simply be moved unchanged into a nicer folder.

**Classification:** `REBUILD INTERNAL COMPOSITION`

**Target**

Within `features/content` separate at minimum:

- `api/` transport;
- `model/` ingestion workflow/view model/state helpers;
- `validation/` client preflight constraints that mirror but do not replace server validation;
- `components/` bounded upload/task/history/publish sections;
- `pages/` route composition.

Server remains canonical for file/content acceptance and lifecycle transitions.

---

### `AB-DEP-007` — P2 — Current primary navigation is usable but route knowledge is split

**Evidence**

`admin-navigation.ts` defines grouped primary navigation, while `App.tsx` separately owns all route registration and several secondary routes/actions.

**Impact**

Navigation and route ownership can drift. Hidden/secondary destinations are encoded in unrelated route wrapper logic.

**Classification:** `STANDARDIZE`

**Target**

Create one typed app-level route registry built from public feature route definitions. Primary navigation consumes only routes flagged as primary; secondary routes remain deep-linkable but are not duplicated in the sidebar.

The registry must not become a giant feature configuration dump containing feature UI internals.

---

## 3. Backend dependency findings

### `AB-DEP-101` — P1 — `apps/api/src/app.ts` manually constructs the entire system graph

**Evidence**

`buildApp(...)` directly constructs Auth, Access, Activation, Admin Access, Operations, Notifications, Curriculum, Content, AI, Question Bank, Quiz Builder, Reader, Assessment and Offline services, then registers all routes itself.

**Impact**

- app composition grows linearly with every capability;
- module dependencies are implicit in constructor wiring;
- module boundaries cannot be understood without reading the entire root;
- testing/replacement of module composition becomes harder;
- technical app hooks and domain composition are mixed in one file.

**Classification:** `REBUILD COMPOSITION`, preserve behavior.

**Target**

```text
app/build-app.ts
app/plugins/*
app/composition/admin.ts
app/composition/content.ts
app/composition/learning.ts
modules/*
```

Composition helpers should expose explicit module registrations without hiding cross-module dependencies.

No service locator or dependency-injection framework is justified.

---

### `AB-DEP-102` — P1 — AI Authoring depends on concrete Question Bank and Quiz Builder services

**Evidence**

`AdminAiAuthoringService` imports concrete service types:

- `QuestionBankService`
- `QuizBuilderService`

and receives those concrete services in its constructor.

**Impact**

AI becomes coupled to the internal application implementation of two other modules rather than explicit capabilities/contracts.

**Classification:** `REBUILD BOUNDARY`

**Target**

Question Bank and Quiz Builder expose narrow application ports/capabilities required by AI application, for example semantic operations such as importing approved questions or creating a verified quiz version.

AI must not depend on another module's repository/internal service implementation.

**Removal condition**

AI module constructor depends only on declared cross-module application contracts, not concrete private service classes.

---

### `AB-DEP-103` — P1 — AI Authoring performs cross-domain SQL directly

**Evidence**

AI Authoring queries canonical quiz/lesson/source tables directly while also calling Question Bank and Quiz Builder services.

**Impact**

The module crosses domain ownership through both SQL and service calls. Future schema/business changes in Curriculum/Quiz domains can silently break AI behavior.

**Classification:** `REBUILD BOUNDARY`, not rewrite behavior.

**Target**

For data governed by another module, expose narrow read/application ports such as authoring source resolution and quiz authoring context. Keep AI-owned execution/job/review persistence inside AI infrastructure.

Direct SQL remains valid only for data truly owned by the AI module or explicitly documented shared read models.

---

### `AB-DEP-104` — P1 — Question Bank HTTP layer imports AI internal contract schema

**Evidence**

`question-bank/http.ts` imports `aiQuestionSchema` from `../ai/contracts.js` and derives its own request schema from it.

**Impact**

Question Bank HTTP is coupled to another module's internal contract location. AI implementation changes can alter Question Bank API validation accidentally.

**Classification:** `MOVE / STANDARDIZE CONTRACT`

**Target**

The question value contract must have one neutral owner:

- Question Bank domain/application contract if it is fundamentally a question contract; or
- `packages/domain` / `packages/validation` only if genuinely shared with external consumers/modules.

AI may consume that contract; Question Bank should not depend on AI to define what a question is.

---

### `AB-DEP-105` — P1 — Module HTTP layers depend on Auth HTTP internals

**Evidence**

`question-bank/http.ts` imports `currentProfile` and `parseBody` from `../auth/http.js`, plus `AuthService`, and defines a local `adminActor(...)` guard.

**Impact**

- module HTTP depends on another module's HTTP internals;
- authorization boilerplate is repeated;
- auth is both a business module and an HTTP helper provider;
- request parsing/authorization conventions become difficult to standardize.

**Classification:** `REBUILD / STANDARDIZE HTTP FOUNDATION`

**Target**

Move generic HTTP boundary concerns to app/shared HTTP infrastructure:

- validated request parsing;
- authenticated request context/decorator;
- admin authorization pre-handler/guard.

Auth module remains responsible for session/authentication behavior; generic Fastify adapter helpers do not live inside Auth HTTP private files.

---

### `AB-DEP-106` — P2 — Root `config`, `db`, `errors` are effectively shared infrastructure without explicit ownership

**Evidence**

Business modules import `../config.js`, `../db.js`, `../errors.js` directly.

**Impact**

The semantics are platform-wide, but ownership is currently incidental because the files sit in the source root.

**Classification:** `MOVE / STANDARDIZE`

**Target**

- app configuration → `app/config`;
- PostgreSQL infrastructure contract → `shared/db`;
- stable application/public error contract → `shared/errors`.

Avoid creating generic “utils” packages.

---

### `AB-DEP-107` — P2 — Valid cross-module orchestration must be distinguished from accidental coupling

Current examples include:

- Offline Download orchestrating Offline + Reader + signer;
- Quiz export using Quiz Builder;
- AI Authoring applying accepted output into Question Bank/Quiz Builder.

These dependencies are not automatically wrong. The defect is that their contracts are currently concrete/internal rather than explicit.

**Decision**

AB-04 will preserve legitimate orchestration but expose it through narrow public application contracts. We will not eliminate dependencies merely to produce an artificial zero-coupling architecture.

---

## 4. Root-cause map

The current architecture has four recurring causes:

1. **Root ownership:** application roots own feature behavior or feature adapters.
2. **Cross-cutting leakage:** session/auth/error handling is passed manually into features.
3. **Private-owner imports:** one feature/module reaches into another owner's private implementation.
4. **Composition without public contracts:** legitimate workflows depend on concrete services/internal schemas instead of explicit capabilities.

The rebuild must fix these causes rather than merely rename directories.

---

## 5. First-wave implementation order derived from this audit

After AB-00.3/AB-00.4/AB-00.5 gates, implementation order is now fixed as:

### Wave A — Admin application foundation

1. establish `shared/api` request/error contract;
2. establish session provider/invalidation boundary;
3. create `app/layouts/AdminShell`;
4. create typed public feature route registry;
5. introduce route-level lazy loading;
6. move Login ownership to `features/auth`;
7. remove session-expiry callback plumbing from migrated feature pages.

### Wave B — First Admin feature slice

**Overview + Operations** together because Overview currently imports Operations private internals.

Goal:

- define explicit Operations attention public contract;
- separate Overview presentation from Operations private model/CSS;
- establish PageHeader/AsyncState/Action/Status patterns;
- preserve attention-first behavior and real metrics only.

### Wave C — Backend application composition foundation

1. extract technical Fastify setup from module construction;
2. establish shared HTTP auth/request/error adapters;
3. split module composition into explicit bounded composition functions;
4. no business rule rewrite.

### Wave D — First cross-layer business slice

**Curriculum + Content** because Content currently consumes Curriculum data and combines upload/process/link/publication workflows.

This wave validates the final feature/module pattern before Question Bank/Quiz/AI migration.

---

## 6. AB-00.2 closure state

Concrete dependency seams are now documented for the highest-risk Admin and Backend roots and representative feature/module interactions.

Remaining before AB-00.2 can be marked DONE:

- enumerate accepted temporary exceptions for the future automated architecture guard;
- inspect Access Codes / Students / Reviews ownership for any additional cross-feature imports that would change the guard model;
- confirm no additional backend internal-schema dependency category is missing;
- update the migration inventory with the final exception set.

No structural code move is authorized until those remaining AB-00.2 checks are closed and AB-00.3 guard design is ready.
