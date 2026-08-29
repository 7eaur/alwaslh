# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture, audit decisions, changes, verification and remaining work.
>
> Detailed production-readiness findings are maintained in `PROJECT_DEEP_AUDIT.md`.

## Project Understanding

**الوسيلة الذكية** is an Arabic educational platform with two primary roles:

- **Student:** activation/login, class/subject/lesson browsing, interactive questions/quizzes, local notes/saved questions, notifications/statistics, and offline content usage.
- **Admin:** classes/subjects, lessons/content upload, AI-assisted generation, quizzes, activation/class codes, accounts, notifications and access settings.

Core product goal: deliver controlled educational content with an offline-capable student experience and an admin authoring/access-management workflow.

## Repository Map

- `src/` — React/TypeScript frontend and browser data/offline logic.
- `src/context/AuthContext.tsx` — active Supabase session/profile model.
- `src/context/AccessContext.tsx` — student activation/device/offline access model.
- `src/contexts/AuthContext.tsx` — separate legacy/duplicate AuthContext; likely REMOVE after import verification.
- `src/db/api.ts` — mixed admin/student/storage/AI/offline data facade.
- `src/lib/offline-db.ts` — Dexie `AlWaseelahDB` and preload/cache utilities.
- `src/pages/admin/*`, `src/pages/student/*` — role-specific features.
- `supabase/migrations/00001...00045` — schema/RLS evolution.
- `supabase/functions/*` — privileged account/recovery/migration/AI operations.
- `public/sw.js`, `index.html`, `manifest.json` — custom PWA/offline/update layer.
- `.rules/*`, `package.json`, `tsconfig.check.json`, `biome.json` — current verification/tooling.
- `tasks/cloudflare-worker/worker.js` — Supabase proxy; production role NOT YET VERIFIED.

## Current Architecture

```text
Student/Admin Browser
  -> React 18 + React Router
  -> AuthContext / AccessContext / feature state
  -> direct Supabase calls + src/db/api.ts
     -> Postgres + RLS
     -> Supabase Auth
     -> Storage
     -> Edge Functions -> service role / AI integration
  -> offline layer
     -> IndexedDB (Dexie)
     -> localStorage / memory caches
     -> CacheStorage / manual service worker
```

The stack is viable in principle. The main architectural problem is that authorization is distributed across browser UI, RLS and privileged Edge Functions while migration history contains old assumptions that are no longer valid after students became authenticated users.

## User Flows

### Student activation

```text
6-digit full-access code
-> server activation/account creation
-> student password
-> Supabase session
-> local access persistence
-> initial offline preload
-> dashboard
```

### Returning student

```text
session/local restore and/or device detection
-> account/password verification when required
-> access state
-> dashboard / offline content
```

### Learning

```text
class -> subject -> lesson -> interactive questions/notes
or
class -> subject -> quiz -> attempt/progress -> statistics/achievements
```

### Admin

```text
admin login
-> dashboard
-> classes/subjects
-> lessons + AI generation
-> quizzes
-> access/class codes + accounts
-> notifications
```

## Audit Findings

The detailed evidence and fix direction for each category are in `PROJECT_DEEP_AUDIT.md`.

### P0 Critical

| ID | Area | Problem | Status |
|---|---|---|---|
| SEC-P0-001 | Admin auth | `SECURITY DEFINER sync_admin_password()` is executable by `anon` and writes admin password | OPEN |
| SEC-P0-002 | Student data | permissive anon/auth RLS remains on notes/saved questions/attempts/progress/achievements | OPEN |
| SEC-P0-003 | Admin authorization | old policies treat any authenticated user as admin on several admin-style tables | OPEN |
| SEC-P0-004 | Entitlement | class-code lifecycle is client-driven, broadly updateable and non-atomic | OPEN |
| SEC-P0-005 | Data ownership | unauthenticated service-role `migrate-student-data` rewrites ownership using caller-supplied code/user_id | OPEN |

### P1 High

| ID | Area | Problem | Status |
|---|---|---|---|
| SEC-P1-001 | Credentials | plaintext student password stored in `profiles.password` | OPEN |
| SEC-P1-002 | Recovery | original passwords are reversibly encrypted/decrypted and can be returned to client/admin | OPEN |
| SEC-P1-003 | Device auth | browser fingerprint/signature is used as security proof | OPEN |
| SEC-P1-004 | Recovery correctness | verify-recovery flow references a device signature not selected in its query | OPEN |
| SEC-P1-005 | Content access | educational content/storage is public/anon-readable; access codes mainly gate UI | OPEN |
| SEC-P1-006 | Storage | legacy student note-media bucket/policies are public | OPEN |
| SEC-P1-007 | Proxy | Cloudflare Worker does not enforce its declared allowed origins | OPEN / deployment UNKNOWN |
| SEC-P1-008 | AI | analyze-lesson has no explicit application-level admin role check in inspected source | OPEN / gateway config UNKNOWN |
| SEC-P1-009 | Admin credential | default admin code is committed/displayed | OPEN / production value UNKNOWN |

### Correctness / Data Integrity

- Access-code import template uses 7-digit examples while full-access login requires exactly 6 digits; importer accepts length >= 4.
- Quiz resume restores index/answers but not answered/selected state; repeated answer/misalignment can occur. Same logic is duplicated in lesson and quiz screens.
- Multi-lesson quiz saved questions are assigned to the first lesson ID.
- Audio uploads are converted to note type `image`.
- Statistics UI reads achievement fields (`title`, `score`) not defined by achievement schema.
- Selected progress dialog displays global completion percentage instead of selected-record completion.
- Rank RPC uses UUID input after quiz student IDs were migrated to TEXT.
- Frontend writes/reads `quiz_progress.score` and `total_questions`, but repository migrations do not define those columns.
- Migrations converted student IDs to TEXT and removed FKs; delete-user still assumes cascades, creating orphan/privacy risk.
- activation/reset/admin-code operations are multi-step and not transactionally safe.
- offline stores can preserve server-deleted classes/subjects/lessons; partial preload can still mark sync complete.
- reset/logout does not clear all Dexie student data although PRD says reset clears local data.

### Architecture / Duplication

Large hotspots indicate God modules and mixed responsibilities:

- `src/pages/admin/Lessons.tsx` ~168 KB
- `src/pages/admin/Quizzes.tsx` ~106 KB
- `src/pages/student/LessonDetail.tsx` ~87 KB
- `src/pages/student/Quizzes.tsx` ~76 KB
- `src/lib/export.ts` ~87 KB
- `supabase/functions/analyze-lesson/index.ts` ~86 KB
- `src/db/api.ts` ~45 KB

Other debt:

- duplicate AuthContext implementations;
- legacy subject-code functions remain after subject-code table removal;
- pending note/question sync structures remain although current sync function is a no-op;
- multiple overlapping cache layers create invalidation complexity;
- `useAccess()` silently returns dummy methods outside its provider instead of failing fast.

### Offline / PWA / Performance

- Service Worker treats any hostname containing `supabase` as an image and can Cache-First API GET responses.
- Manual SW registration/unregistration/versioning in `index.html` conflicts with documented/installed Vite-PWA/Workbox tooling.
- initial preload downloads all classes/subjects/lessons rather than only authorized content.
- admin access-code management loads the entire code table client-side, up to a 100k safety ceiling.
- global CSS applies `will-change`/GPU promotion to common transition classes.

### UX / Accessibility — Static Findings

- pinch zoom disabled via `user-scalable=no` / `maximum-scale=1.0`.
- production UI contains very small 8–10px text.
- no verified reduced-motion handling despite many animations.
- excessive large radius/shadows/blur/decorative hero treatment in several core screens.
- repeated remote Miaoda-hosted logo despite local assets.
- admin dashboard contains placeholder activity/alert content and non-data-backed “updated moments ago” copy.
- password/device wording conflicts with PRD account behavior.

### QA / Build / Git

- no automated unit/integration/E2E/RLS test suite found.
- no GitHub Actions CI found.
- `main` was unprotected with no required checks at audit start.
- `lint` is not fail-fast because commands are chained with `;`.
- type check is not full strict and excludes UI components.
- Biome recommended rules are disabled; only a few narrow rules remain.
- `dev`/`build` scripts are intentionally disabled while README gives contradictory development instructions.
- React 18 runtime uses React 19 type packages; build tooling also uses preview/floating vendor dependencies.

### AI Content Integrity

- frontend AI normalizers may invent placeholder answer options and default the correct index when AI data is malformed.
- the large AI function contains ad-hoc JSON extraction/repair logic.

For an educational product, malformed AI output should be rejected/marked for admin review, not converted into plausible-looking fabricated answers.

## Classification

### KEEP

- product idea and core user flows;
- React/Vite frontend;
- Supabase platform;
- route-level lazy loading;
- IndexedDB offline-first concept;
- component primitives;
- AI-assisted authoring concept.

### IMPROVE

- validation schemas/forms;
- design system hierarchy and accessibility;
- query pagination/counts;
- error/loading/empty states;
- documentation and deployment runbooks;
- cache freshness/version contracts.

### REFACTOR

- `src/db/api.ts` by domain;
- Auth/Access ownership;
- shared quiz engine;
- offline cache/sync layer;
- PWA/service-worker architecture;
- large admin/student feature pages.

### REBUILD — Targeted

- final database RLS/authorization model;
- student password/recovery model;
- server-side entitlement enforcement;
- admin credential-management path;
- student data ownership/FKs after legacy device-ID migration.

### REMOVE

- anonymous `sync_admin_password` capability;
- plaintext `profiles.password`;
- reversible password retrieval/admin reveal;
- duplicate legacy AuthContext after caller verification;
- retired subject-code functions/Edge Functions;
- dead pending-sync structures after product decision verification.

## Architecture Decisions

### AD-001 — No whole-project rewrite

The product stack is not the problem. Replace only security/data ownership subsystems that are fundamentally unsafe; refactor the rest incrementally to preserve business behavior.

### AD-002 — Security remediation must precede visual polish

Closing RLS in isolation can break current flows because offline/build-update logic sometimes preserves local entitlement while clearing Supabase session data and old flows rely on anonymous reads. Auth/session/offline entitlement contracts must be corrected together.

### AD-003 — Database migrations must become the source of truth

A clean database created from repository migrations must reproduce all fields, constraints, functions and policies used by the application. Undocumented production-only schema is unacceptable for handover.

## Execution Log

### Phase 1 — Discovery

- Created initial repository/product/architecture map.
- No production behavior changed.

### Phase 2 — Deep static audit / release decision

- Audited major RLS/security migrations and role drift.
- Audited major auth/recovery/account Edge Functions.
- Audited student quiz/lesson/statistics correctness paths.
- Audited offline DB/service-worker/PWA behavior.
- Audited build/lint/CI/Git release controls.
- Performed preliminary static UX/accessibility/performance review.
- Added `PROJECT_DEEP_AUDIT.md`.
- **Result:** production sign-off = **NO-GO**.

## Tests & Verification

### Runtime tests

**NOT RUN** in the connected repository environment. No claim is made that current build/lint passes or fails.

### VERIFIED from source

- repository structure and major module sizes;
- routes/providers/role flows;
- active auth/access architecture;
- critical RLS migrations and functions referenced in the deep audit;
- major account/recovery Edge Functions;
- student quiz/lesson/statistics bugs listed above;
- offline DB and service-worker logic;
- build/lint/TypeScript/Biome configuration;
- lack of repository CI/tests;
- main branch protection state at audit start.

### NOT YET VERIFIED

- actual deployed Supabase schema/RLS/functions;
- production environment/secrets/admin credential value;
- Cloudflare Worker deployment status;
- complete line-by-line behavior of the two largest admin pages and every AI task branch;
- real browser/device UX/accessibility/performance measurements;
- runtime build/test result.

## Known Issues

See `PROJECT_DEEP_AUDIT.md`. P0/P1 issues are release blockers, not optional hardening.

## Remaining Work

1. Remove P0 privilege paths and build explicit RLS matrix.
2. Redesign credentials/recovery and server-side entitlement.
3. Restore reproducible schema/data integrity and transactional invariants.
4. Correct core quiz/code/statistics/offline bugs.
5. Add authorization/unit/integration/E2E tests and CI; protect main.
6. Refactor domain boundaries and caching incrementally.
7. Complete visual accessibility/performance audit in staging.
8. Run full release verification on a staging environment created from repository migrations.

## Current State

The repository is a **feature-rich late prototype / beta**, not a production-ready handover. I would not sign final delivery in its current state. The product concept and stack should be preserved, but the authorization/authentication/entitlement/data-ownership layer needs targeted rebuilding before the rest of the architecture and UI are polished.
