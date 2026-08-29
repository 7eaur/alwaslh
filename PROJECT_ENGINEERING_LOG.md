# PROJECT ENGINEERING LOG

> Engineering source of truth for audit, architecture decisions, implementation batches, and verification.
>
> Current scope: **Phase 1 — Repository Discovery, Product Understanding, Architecture Mapping**.
> No broad rewrite or behavior-changing refactor has been started.

## Project Understanding

### Product

**الوسيلة الذكية** is an Arabic educational web application with two primary roles:

- **Student**: activates access, signs in, browses classes/subjects/lessons, studies lesson content, uses interactive quizzes, keeps notes/saved questions, sees notifications/statistics, and can continue using cached content offline.
- **Admin**: signs in to an administration area and manages classes, subjects, lessons, quizzes, activation codes, class codes, student accounts, notifications, and admin access settings.

The product is built around controlled educational-content access, lesson/quiz authoring, AI-assisted content/question generation, and an offline-capable student experience.

### Product goals inferred from executable code

- Deliver educational content organized as **Class → Subject → Lesson**.
- Control student access using activation codes/account state.
- Support lesson summaries/questions/quizzes, including AI-assisted generation.
- Persist student learning activity (quiz attempts/progress/achievements) and local notes.
- Remain useful with poor/no connectivity via IndexedDB/local cache and initial content preload.
- Provide an admin workflow for content and access management.

### Users and roles

| Role | Evidence-based capabilities | Verification |
|---|---|---|
| Student | Activation/login, dashboard, lessons, lesson details, quizzes, notes, notifications, statistics, add activation code | VERIFIED at routing/context/API level |
| Admin | Dashboard, classes/subjects, lessons, quizzes, access codes, class codes, accounts, notifications | VERIFIED at routing/layout/API level |
| Guest | `AuthContext` still exposes guest mode, but no current public route flow using it was verified | NOT YET VERIFIED / likely legacy |

## Repository Map

### Top-level

- `src/` — React/TypeScript application.
- `supabase/` — SQL migrations and Deno Edge Functions.
- `public/` — static assets, manifest, service worker.
- `.rules/` — repository-specific static checks and build-validation shell scripts.
- `docs/` — product/source documentation imported with the repository.
- `tasks/` — task artifacts/screenshots plus a Cloudflare Worker file; production role is NOT YET VERIFIED.
- Root Vite/Tailwind/TypeScript/Biome configuration.

### Frontend hotspots

- `src/main.tsx` — React bootstrap.
- `src/App.tsx` — application providers, router, global error boundary, online synchronization trigger.
- `src/routes.tsx` — route registry and role declarations.
- `src/context/AuthContext.tsx` — Supabase account/session management.
- `src/context/AccessContext.tsx` — student activation/access state, device association, offline restoration/migration.
- `src/db/api.ts` — large centralized Supabase data-access facade for admin/student/storage/AI operations.
- `src/lib/offline-db.ts` — Dexie/IndexedDB schema and offline persistence.
- `src/pages/admin/*` — admin product flows.
- `src/pages/student/*` — student product flows.
- `src/components/layout/*` — role-specific navigation/layout.

### Backend/data hotspots

- `src/db/supabase.ts` — browser Supabase client using public URL + anon key.
- `supabase/functions/*` — privileged/server workflows (activation, recovery, migration, account checks, AI analysis, account deletion, code generation).
- `supabase/migrations/00001...00045` — database schema evolution and RLS policies.
- Supabase Storage bucket(s) used for lesson/media content.

## Current Architecture

### High-level topology

```text
Student/Admin Browser
  -> React 18 + React Router + Tailwind/Radix UI
  -> Context state (Auth / Access / upload / question generation)
  -> src/db/api.ts and direct Supabase calls
     -> Supabase Postgres (RLS)
     -> Supabase Auth
     -> Supabase Storage
     -> Supabase Edge Functions
        -> privileged Service Role operations
        -> external integration gateway for AI analysis/generation
  -> Local offline layer
     -> Dexie / IndexedDB (AlWaseelahDB)
     -> localStorage / memory cache
     -> service worker / browser CacheStorage
```

### Frontend

- SPA bootstrapped by `src/main.tsx`.
- `src/App.tsx` wraps the app with:
  - `AuthProvider`
  - `AccessProvider`
  - `LessonUploadProvider`
  - `QuestionGenerationProvider`
  - `BrowserRouter`
  - global `Suspense`, error boundary, PWA install prompt, online indicator, toast system.
- Pages are lazy-loaded from the centralized `routes` array.
- `RouteGuard` applies admin/student navigation gating.
- Admin navigation is desktop sidebar + mobile sheet.
- Student navigation is desktop sidebar + mobile bottom navigation.

### Backend

There is no conventional application server in the repository. Backend responsibilities are split between:

1. Browser Supabase calls for CRUD and reads.
2. Supabase Postgres + RLS as the primary authorization/data boundary.
3. Supabase Edge Functions for privileged or integration-heavy operations.

This makes **RLS correctness and Edge Function authorization part of the core security architecture**, not optional hardening.

### Database

Verified core entities include:

- `profiles`
- `classes`
- `subjects`
- `lessons`
- `access_codes`
- `class_activation_codes`
- `student_class_activations`
- `student_notes`
- `notifications`
- `quizzes`
- `quiz_attempts`
- `quiz_progress`
- `student_achievements`
- `saved_questions`
- `subject_extra_classes`
- `lesson_upload_tasks`
- `export_history`
- `admin_settings`

Exact final schema/constraint/index matrix across all 45 migrations is **NOT YET VERIFIED**.

### Authentication and authorization

#### Admin

- Admin login uses Supabase Auth with a fixed admin email identity and a code used as password.
- Admin routes require a Supabase user/profile with `role === 'admin'` in `RouteGuard`.
- Admin CRUD is primarily issued directly from the browser and relies on RLS.

#### Student

- Current access model combines a Supabase student account with access-code/account state.
- Initial activation is handled through Edge Functions, creates an Auth user/profile, associates the access code, and stores device-related identifiers.
- Access state is cached locally to allow offline startup.
- Returning-device detection/recovery uses client-derived fingerprint/signature values and Edge Functions.

### Offline architecture

`src/lib/offline-db.ts` defines `AlWaseelahDB` using Dexie with versioned stores for:

- lessons
- questions
- quizzes
- subjects
- classes
- progress
- saved questions
- notes
- pending note/question sync queues
- sync status
- code hashes
- access backup
- quiz attempts
- cached images

The student dashboard performs a first-load preload when online and uses local data when offline. Quiz attempts are written locally immediately and server persistence is attempted when online. Notes are currently handled locally in `studentApi`.

### AI/content generation integration

- Frontend calls the `analyze-lesson` Supabase Edge Function for lesson analysis, page detection, summaries, question generation, and quiz generation.
- The Edge Function reads `INTEGRATIONS_API_KEY` from server environment.
- Exact upstream provider/gateway contract and failure/rate-limit behavior are **NOT YET VERIFIED**.

### Build and deployment

- Tooling: React + TypeScript + Vite + Tailwind + Biome.
- Root `dev` and `build` scripts are intentionally disabled messages.
- `lint` performs TypeScript/Biome/custom checks and finishes with `.rules/testBuild.sh`, which runs `vite build` into `/workspace/.dist`.
- No `.github/workflows` were present in the inspected repository tree.
- Production hosting/deployment topology is **NOT YET VERIFIED**.
- A Cloudflare Worker exists under `tasks/`, but its actual production role is **NOT YET VERIFIED**.

## User Flows

### UF-01 — Student first activation

```text
Open public student entry
-> enter 6-digit activation code
-> AccessContext / Edge Function validates code
-> if new activation: student creates password
-> Edge Function creates Supabase Auth user + profile and binds code/device state
-> browser signs in
-> local access state is persisted
-> initial offline content sync runs if required
-> student dashboard
```

Status: **VERIFIED at routing/context/Edge Function level**. Exact UI/error coverage after all edge cases is NOT YET VERIFIED.

### UF-02 — Returning student

```text
Open app
-> local/session restore and/or device-code detection
-> password requested when required
-> Supabase authentication/account-state check
-> access restored
-> dashboard
```

Offline branch:

```text
Open app without network
-> restore encrypted/local access backup
-> use IndexedDB/local cached education data
-> defer network-dependent operations
```

Status: **VERIFIED at architecture level**.

### UF-03 — Student content browsing

```text
Dashboard
-> visible classes filtered by access state
-> class selection
-> subjects/lessons
-> lesson detail
-> lesson content/questions/notes interactions
```

Status: class/dashboard and data layer VERIFIED; detailed lesson page interactions are **NOT YET VERIFIED** because `LessonDetail.tsx` has not yet been fully audited.

### UF-04 — Student quiz attempt

```text
Student quizzes / lesson quiz
-> fetch quiz/questions
-> answer questions
-> persist attempt locally immediately
-> when online, persist attempt to Supabase
-> statistics/achievements/progress consume attempt data
```

Status: data persistence path VERIFIED; complete page-level quiz behavior and scoring edge cases are **NOT YET VERIFIED**.

### UF-05 — Admin sign-in

```text
/admin-login
-> enter admin code
-> Supabase Auth password flow for admin identity
-> profile/role state
-> RouteGuard authorizes admin routes
-> /admin/dashboard
```

Status: **VERIFIED**.

### UF-06 — Admin content management

```text
Admin dashboard
-> manage classes/subjects
-> manage lessons/upload content
-> optional AI analysis/content generation
-> manage quizzes
-> manage activation/access codes and accounts
-> publish notifications
```

Status: routes/API capabilities VERIFIED. Detailed `Lessons.tsx` and `Quizzes.tsx` workflows are **NOT YET VERIFIED** because both are very large modules and require dedicated staged review.

## Audit Findings

### SEC-001 — Anonymous RLS grants can bypass student data isolation

- **Priority:** P0 Critical
- **Area:** Security / Database / Authorization
- **Problem:** migrations create broad `anon` policies allowing unrestricted operations/read access on student-owned tables, and unrestricted anonymous update access on activation-code tables. A later account-based migration adds authenticated per-user policies but does not remove the earlier broad anonymous policies.
- **Evidence:**
  - `supabase/migrations/00026_allow_anon_read_class_activation_codes_and_classes.sql` grants `anon` SELECT/UPDATE on `class_activation_codes` with `USING (true)` / `WITH CHECK (true)`.
  - `supabase/migrations/00027_allow_anon_student_data_tables.sql` grants `anon` broad access to `student_notes`, `quiz_progress`, quiz attempts, and achievements.
  - `supabase/migrations/00042_v727_account_based_auth_v2.sql` adds authenticated own-row policies but does not drop those older anonymous policies.
  - `src/context/AccessContext.tsx` also performs access-table updates from the browser, making RLS the effective enforcement boundary.
- **Impact:** Potential cross-student data disclosure/manipulation and activation-state tampering when requests are made with the public anon client, depending on the final deployed migration state.
- **Recommended Fix:** Perform a migration-state/RLS audit first, then revoke broad anonymous policies and route activation mutations through narrowly authorized Edge Functions/RPCs. Add automated authorization tests for anon/student/admin roles.
- **Status:** OPEN — confirmed in repository migrations; deployed DB state NOT YET VERIFIED.

### SEC-002 — Student password is stored in plaintext application profile data

- **Priority:** P1 High
- **Area:** Security / Authentication
- **Problem:** the schema adds `profiles.password`, and current account creation writes the student's password directly into that column even though Supabase Auth already owns credential hashing.
- **Evidence:**
  - `supabase/migrations/00022_update_profiles_for_unified_account.sql` adds `password TEXT`.
  - `supabase/functions/activate-code/index.ts` inserts `password: password` into `profiles`.
  - `src/context/AuthContext.tsx` legacy registration path also inserts the plaintext password.
- **Impact:** Any profile-data exposure becomes credential exposure; password lifecycle is duplicated across Auth and application tables.
- **Recommended Fix:** Remove plaintext password storage and migrate existing data safely. Keep only Supabase Auth credentials; if recovery is a required business rule, redesign recovery using reset/verification tokens rather than password retrieval.
- **Status:** OPEN.

### SEC-003 — Recovery endpoint can return the original password

- **Priority:** P1 High
- **Area:** Security / Authentication / Edge Functions
- **Problem:** `get-recovery-password` decrypts and returns the stored recovery password based on caller-supplied device fingerprint/signature values.
- **Evidence:** `supabase/functions/get-recovery-password/index.ts` uses the service-role client, finds a code by supplied device identifiers, decrypts `recovery_password_encrypted`, and returns `{ password, code }`.
- **Impact:** Password recovery is implemented as password disclosure. Security depends heavily on the unpredictability/unforgeability of client-generated device identifiers, which has not yet been demonstrated.
- **Recommended Fix:** Replace password retrieval with a password reset flow. Treat device fingerprinting as UX/risk signal, not sole credential-recovery authorization.
- **Status:** OPEN; device-identifier strength and deployed function JWT settings NOT YET VERIFIED.

### SEC-004 — Default admin credential is committed and displayed by the application

- **Priority:** P1 High
- **Area:** Security / Authentication
- **Problem:** a default admin code value is committed in a migration and the admin dashboard explicitly tells the user the default value.
- **Evidence:** `supabase/migrations/00002_admin_settings_and_offline_cache.sql`; `src/pages/admin/Dashboard.tsx`.
- **Impact:** If any deployed environment still uses the default, administrator access is guessable from public source. Even if changed, documenting a live-style default in UI/source creates avoidable credential risk.
- **Recommended Fix:** Remove hardcoded/default credential hints; provision an admin credential out-of-band and require rotation/bootstrap setup. Verify production immediately.
- **Status:** OPEN — repository exposure VERIFIED; whether production still uses the default is UNKNOWN.

### ARCH-001 — Data/business responsibilities are concentrated in very large modules

- **Priority:** P2 Medium
- **Area:** Architecture / Maintainability
- **Problem:** `src/db/api.ts` mixes admin CRUD, student data, offline fallback, storage, and AI calls. Multiple page modules are extremely large (`admin/Lessons.tsx`, `admin/Quizzes.tsx`, `student/LessonDetail.tsx`, `student/Quizzes.tsx`).
- **Evidence:** repository tree sizes and inspected API implementation.
- **Impact:** Higher change risk, harder tests, duplicated state/error handling, and difficult ownership boundaries.
- **Recommended Fix:** After behavior is fully understood, refactor by bounded feature/domain while preserving contracts. Do not perform a blind rewrite.
- **Status:** OPEN; exact split plan awaits dedicated module audits.

### ARCH-002 — Duplicate authentication context path may be legacy/dead code

- **Priority:** P3 Low
- **Area:** Architecture / Dead Code
- **Problem:** both `src/context/AuthContext.tsx` and `src/contexts/AuthContext.tsx` exist. Current verified imports use the singular `context` path.
- **Evidence:** repository tree + inspected current imports.
- **Impact:** Confusion and future accidental divergence.
- **Recommended Fix:** Verify all callers/build references, then remove or consolidate only if unused.
- **Status:** NOT YET VERIFIED — no removal performed.

### QA-001 — Verification script is not fail-fast across all checks

- **Priority:** P2 Medium
- **Area:** Tests / Build / CI
- **Problem:** `package.json` chains TypeScript, Biome, custom checks and build with shell semicolons. Earlier command failures do not automatically stop the script; the final build exit code can determine overall success.
- **Evidence:** `package.json`, `.rules/check.sh`, `.rules/testBuild.sh`.
- **Impact:** Type/lint/static-rule failures may be hidden behind a successful final Vite build.
- **Recommended Fix:** make each required verification step fail the pipeline (`set -euo pipefail` / `&&` / dedicated scripts), and add CI.
- **Status:** OPEN.

### QA-002 — No repository CI workflow found

- **Priority:** P2 Medium
- **Area:** QA / GitHub
- **Problem:** no `.github/workflows` files were present in the recursively inspected tree.
- **Impact:** no repository-enforced lint/type/build/test gate is visible.
- **Recommended Fix:** add minimal CI after the verification commands are made reliable.
- **Status:** OPEN.

### PERF-001 — Some data fetching uses broad/high-limit reads

- **Priority:** P2 Medium
- **Area:** Performance / Data Access
- **Problem:** examples include `adminApi.getLessons()` defaulting to a `10000`-row limit and several broad list reads. This may be acceptable at current scale but does not define pagination contracts.
- **Impact:** increasingly expensive network/memory/render work as content grows.
- **Recommended Fix:** profile actual data sizes/query patterns before optimization; introduce pagination/summary queries where justified.
- **Status:** OPEN / requires measurement.

## Architecture Decisions

### AD-001 — No rewrite during discovery

- **Problem:** several modules are large and security issues are already visible.
- **Options:** immediate rewrite; targeted patching while still discovering; staged evidence-first audit.
- **Decision:** continue staged audit before architectural rewrite.
- **Why:** core product behavior, access migration history, and offline contracts are intertwined. Rewriting before verifying them risks breaking valid user flows.
- **Tradeoffs:** known issues remain temporarily open while discovery proceeds.
- **Risk:** P0 security issue should be prioritized immediately in the next implementation phase once final migration/policy dependencies are verified.

### AD-002 — Preserve Supabase architecture unless audit proves it unsuitable

- **Problem:** authorization issues exist in current RLS policies.
- **Options:** replace Supabase/backend; fix boundaries within current stack.
- **Decision:** no backend-platform replacement is justified yet.
- **Why:** most product capabilities map naturally to Supabase; current problems appear to be policy/boundary implementation issues, not proof that the platform is wrong.
- **Tradeoffs:** requires disciplined RLS/Edge Function design and authorization tests.
- **Risk:** direct browser CRUD remains dangerous until policies are verified/corrected.

## Execution Log

### Phase 1 — Repository Discovery / Product Understanding / Architecture Mapping

- **What changed:** created engineering documentation only; no product code changed.
- **Why:** establish evidence-based understanding and capture high-priority findings before implementation.
- **Files affected:**
  - `PROJECT_ENGINEERING_LOG.md`
  - `PROJECT_STATUS.md`
- **Tests:** local execution could not be performed from the current repository connector environment. Build/check scripts were inspected statically.
- **Result:** product/architecture baseline established; P0/P1 security findings identified for next-phase verification/remediation.

## Known Issues

- P0 anonymous RLS policies require urgent final-state verification and remediation.
- Student credential storage/recovery design needs redesign.
- Admin default credential exposure requires production-state check and cleanup.
- Large feature/page modules make behavior changes risky without focused audits.
- Verification pipeline can hide non-final command failures.
- Deployment topology and production Supabase policy state remain unknown.

## Remaining Work

### Next phase

**Phase 2 — Backend + Database + Security deep verification**, beginning with SEC-001.

Scope:

1. Reconstruct final schema/RLS state across all 45 migrations.
2. Enumerate every table by role: anon / authenticated student / admin / service-role.
3. Audit all Edge Functions for caller authentication, authorization, validation, CORS, service-role scope, and secret handling.
4. Verify access-code lifecycle and device/account migration contracts.
5. Produce the smallest safe remediation batch for P0/P1 findings with authorization tests.

Then continue dedicated audits of:

- admin lesson upload/AI workflow
- admin quiz workflow
- student lesson detail
- student quiz/scoring/statistics flow
- UX/accessibility/design system
- performance
- deployment

## Verification

### VERIFIED in Phase 1

- Repository top-level and recursive structure.
- React entry point and provider/router composition.
- Route inventory and role declarations.
- Admin and student layout/navigation structure.
- Supabase client location and environment variable usage.
- Core admin/student data-access facade structure.
- Student offline IndexedDB schema and preload/fallback approach.
- Admin login implementation at application level.
- Student activation/account architecture at context + Edge Function level.
- Core initial schema and selected security/account migrations.
- Selected RLS policies exposing P0 risk.
- AI Edge Function existence and integration-key boundary.
- Build/check script structure.
- Current `main` HEAD at discovery start: `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.

### NOT YET VERIFIED

- Final effective production database schema and currently deployed RLS state.
- Every migration and every policy/function/trigger.
- Every Edge Function end-to-end.
- `admin/Lessons.tsx` complete behavior.
- `admin/Quizzes.tsx` complete behavior.
- `student/LessonDetail.tsx` complete behavior.
- `student/Quizzes.tsx` complete scoring/error/offline behavior.
- All form validation and permission edge cases.
- Full UX/UI/accessibility audit.
- Real performance measurements and query plans.
- Production deployment/hosting configuration.
- Cloudflare Worker production usage.
- Supabase deployment settings (including Edge Function JWT verification configuration).
- Production secrets and actual environment values.
- Production admin credential state.
- Runtime lint/type/build/test result for this commit.

## Current State

The application is a real, feature-rich education product with meaningful offline support and a coherent high-level role model. The current architecture is viable in principle, but authorization is distributed across browser code, RLS, and privileged Edge Functions. Because broad anonymous RLS policies are present in repository migrations, **security/data isolation is the first implementation priority before architecture polish or visual redesign**.
