# AB-01.4 — Backend App Composition Discovery

Date: **2026-09-14**  
Status: **DISCOVERY COMPLETE — FIRST EXTRACTION IDENTIFIED**  
Branch: `rebuild/super-admin-foundation`  
Discovery starting HEAD: `60151da0cdcf56d61f5d68ea5cdd3d329523f2a9`

## Purpose

Identify the first real backend composition extraction from `apps/api/src/app.ts` without changing business rules, HTTP contracts, database schema, security semantics or the single Fastify modular-monolith deployment model.

This document is evidence for the next implementation increment. It is **not** permission for a broad folder move or service-container abstraction.

## Source inspected

Primary source:

- `apps/api/src/app.ts`

Direct collaborators inspected where needed to establish technical ownership and parity:

- `apps/api/src/config.ts`
- `apps/api/src/db.ts`
- `apps/api/src/errors.ts`
- `apps/api/src/server.ts`
- `apps/api/tests/app.test.ts`
- `apps/api/package.json`
- representative composite service dependency: `apps/api/src/offline/download.ts`

Live `main` was also reconciled. `main` advanced to `258c5bc2c09a049afb57c0593b5b6ca9db532c62` through Student Experience V2 merge #58; that delta contains Student frontend/workflow and root documentation changes, not `apps/api`, `apps/admin-web`, migrations or scoped shared implementation requiring import before this discovery.

## Current `app.ts` responsibilities

`buildApp()` currently owns all of the following in one root file:

1. **Fastify instance construction**
   - logger mode/level;
   - request logging;
   - `trustProxy`;
   - body limit;
   - request timeout.

2. **Cross-cutting HTTP request policy**
   - parse configured allowed origins;
   - add credential-safe CORS response headers;
   - explicitly handle/reject `OPTIONS` preflight.

3. **Infrastructure adapter construction**
   - filesystem media storage;
   - offline authorization signer.

4. **Broad module/service construction**
   - auth, access, activation, Admin student access, operations, notifications, curriculum, content, AI, question bank, quiz builder, assessment and offline services.

5. **Cross-service composite construction**
   - `QuizVersionExportService(quizBuilder)`;
   - `StudentOfflineDownloadService(studentOffline, studentReader, offlineAuthorizationSigner)`;
   - `AdminAiAuthoringService(database, questionBank, quizBuilder)`;
   - `QuizSpecializedExportService(quizBuilder, database, mediaStorage)`.

6. **Route registration for the whole product**
   - auth and Student activation/access;
   - Admin access/operations/notifications;
   - curriculum/content;
   - assessment/offline;
   - AI;
   - Question Bank;
   - Quiz Builder/export surfaces.

7. **Technical process/readiness HTTP surface**
   - `GET /health` is process health only;
   - `GET /ready` probes PostgreSQL and returns 503 on failure.

8. **Global HTTP/lifecycle handling**
   - not-found public error envelope;
   - global error-to-public-error mapping and 5xx logging;
   - database close on Fastify `onClose`.

The root problem is therefore real: the file is simultaneously the Fastify factory, technical HTTP policy owner, lifecycle owner, complete service graph, cross-domain composition root and route registry.

## Behavior-sensitive ordering/dependencies

### Construction dependencies

Most services are direct `database` consumers, but several constructions depend on earlier services/adapters:

- `contentPreview` and `contentIngestion` require `mediaStorage`;
- `studentReader` requires `mediaStorage`;
- `quizExports` requires `quizBuilder`;
- `studentOfflineDownloads` requires `studentOffline`, `studentReader` and the optional offline signer;
- `aiAuthoring` requires `questionBank` and `quizBuilder` in addition to `database`;
- `quizSpecializedExports` requires `quizBuilder`, `database` and `mediaStorage`.

A future composition extraction must preserve these dependency edges rather than hiding them in a generic container/service locator.

### Registration dependencies

All business route registrations receive the same `app`, `config` and `auth` base dependencies, with module services added per route family. Auth is constructed before every authenticated route family.

The CORS `onRequest` hook is installed **before route registration** in the current app and therefore applies globally, including preflight handling. A first extraction must preserve that scope and timing.

### Runtime/lifecycle boundary

`server.ts` owns environment loading, database creation, legacy content startup batch, process signal handling and `listen()`. `app.ts` owns Fastify close → database close through `onClose`. This split must not be silently changed during the first composition extraction.

## App-level versus module-owned responsibility

### App-level / technical

- Fastify construction options;
- CORS/preflight policy;
- health/readiness endpoints;
- public not-found/error mapping;
- Fastify/database close lifecycle;
- composition wiring between modules/adapters.

### Module-owned business responsibility

- authentication/session rules;
- access/activation/entitlement rules;
- curriculum/content/publication behavior;
- AI/review/authoring behavior;
- Question Bank and Quiz Builder behavior;
- Student assessment/offline business rules;
- Admin operations/business queries.

AB-01.4 must move **composition/technical ownership**, not pull those business rules into `app/`.

## Rejected first moves

### Rejected: one giant `createServices()` container

This would move the broad problem without reducing conceptual coupling, hide important cross-service dependencies and drift toward service-locator/DI ceremony.

### Rejected: move all route registrations at once

This would create a large review surface and could accidentally normalize legacy private cross-module imports before module public boundaries are ready.

### Rejected: create the full target folder tree immediately

`app/config`, `app/plugins`, `app/composition` are responsibility concepts, not empty-folder requirements.

### Rejected: database/error ownership migration in the same first extraction

`db.ts` and `errors.ts` are candidates for AB-01.5 common technical ownership. Combining them with the first AB-01.4 extraction would mix concerns and enlarge regression scope.

## Single smallest real first extraction

**Extract only the current CORS/preflight `onRequest` registration into an app-owned technical helper.**

Proposed owner:

`apps/api/src/app/plugins/cors.ts`

Proposed public function shape (conceptual, not yet implemented):

`registerCorsPolicy(app, config)`

It should:

- derive origins through the existing `allowedOrigins(config)` contract;
- call `app.addHook("onRequest", ...)` directly;
- preserve exact allowed-origin response headers;
- preserve credential behavior and `Vary: Origin`;
- preserve explicit allowed methods/headers for `OPTIONS`;
- preserve `AppError("FORBIDDEN", ..., 403)` for rejected preflight;
- be invoked in `buildApp()` at the same point: after Fastify construction and before business route registration.

### Why this is the right first seam

- pure app-level HTTP policy, not module business logic;
- already has direct behavior tests;
- no service graph changes;
- no constructor-order changes;
- no route contract changes;
- no database/schema changes;
- meaningful root ownership: `app.ts` stops owning detailed CORS mechanics;
- establishes a real `app/plugins` owner without manufacturing empty architecture.

Do **not** use `app.register()` merely to label this a Fastify plugin in the first extraction, because Fastify plugin encapsulation could alter hook scope. Preserve current semantics with a direct registration helper first.

## Parity / verification contract for the first extraction

Minimum direct evidence:

- `apps/api/tests/app.test.ts`
  - allowed CORS preflight remains 204;
  - `Access-Control-Allow-Origin` remains the configured origin;
  - credentials remain `true`;
  - unknown preflight origin remains 403 / `FORBIDDEN`.

Required engineering gates after implementation:

1. Architecture Guard;
2. API lint;
3. API strict typecheck;
4. API unit tests, including `app.test.ts`;
5. API build;
6. Combined integration / real Admin Chromium because CORS is global browser-facing transport policy;
7. Stage13G or equivalent current real API + PostgreSQL + Chromium gate when available on exact source head.

No migration is required.

## Student-facing impact

No Student business contract should change. However CORS is a cross-consumer browser transport policy used by both Admin and Student origins, so the implementation must preserve exact global behavior. No Student frontend restructuring is authorized. A Student-specific frontend refactor/test is not required solely for moving the helper; broader browser/integration gates remain useful regression evidence.

## Exact next increment

Implement **only** the CORS/preflight extraction described above:

1. create `apps/api/src/app/plugins/cors.ts` with the existing behavior unchanged;
2. replace the inline CORS block in `apps/api/src/app.ts` with one `registerCorsPolicy(app, config)` call at the same lifecycle position;
3. do not move health/readiness, errors, database lifecycle, service construction or route registration in that same increment;
4. run exact-head Architecture Guard + API quality/unit/build and required integration/browser gates;
5. document evidence before selecting the second AB-01.4 seam.

This keeps AB-01.4 incremental, behavior-preserving and reviewable while making the first target `app/plugins` ownership real.
