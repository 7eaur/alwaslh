# PROJECT DEEP AUDIT — Production Readiness

> Static source audit of `7eaur/alwaslh` against the repository state based on `main` commit `5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
>
> **Release decision: NO-GO.** I would not approve or sign off this repository as production-ready in its current source state.
>
> Runtime production Supabase state, deployed policies/functions, environment values, and an executable build/test run are still NOT YET VERIFIED. The source findings below are independently sufficient to block production sign-off.

## Executive Assessment

The product idea and feature coverage are meaningful: Arabic educational content, admin authoring, quizzes, AI assistance, access codes, and a substantial offline experience. The problem is not that the application is unfinished visually. The blocking problem is that the current security/data architecture contains legacy authorization assumptions, broad RLS policies, privileged recovery flows, schema drift, weak release verification, and duplicated business logic that already produces user-visible bugs.

The strongest pattern found during the audit is historical layering: a newer Supabase-authenticated student account model was added on top of an older device/anonymous-access model without fully removing or rewriting the old database policies, functions, caches, and data contracts. Several old migrations assume `authenticated == admin`; that assumption stopped being true once students became authenticated users.

## Delivery Verdict

- **Production / customer-facing release:** REJECT / NO-GO.
- **Internal prototype / controlled development build:** acceptable only with known blockers documented and no claim of secure production readiness.
- **Final client handover:** not acceptable until P0/P1 blockers are fixed and independently verified.

## Scorecard — Static Source Audit

| Area | Score | Delivery note |
|---|---:|---|
| Product idea / feature coverage | 7/10 | Good product scope; many real flows exist. |
| Architecture | 4/10 | Viable stack, but boundaries are mixed and migration history is not clean. |
| Security | 1/10 | Critical authorization defects in source migrations/functions. |
| Data integrity | 3/10 | FKs were removed for legacy IDs; multi-step account operations are not atomic. |
| Maintainability | 3/10 | God pages/services and duplicated quiz/auth/offline logic. |
| QA / testing / release governance | 1/10 | No automated tests/CI gate; main branch unprotected; check chain can hide failures. |
| Performance engineering | 4/10 | Considerable caching effort, but too many overlapping caches and broad reads. |
| UX/UI static assessment | 5/10 | Functional and branded, but over-decorated/inconsistent with accessibility issues. |
| Production readiness | 1/10 | Release blockers remain open. |

---

# P0 — Critical Release Blockers

## SEC-P0-001 — Anonymous caller can execute an admin password reset function

**Area:** Database / Authentication / Privilege Boundary

`supabase/migrations/00040_create_sync_admin_password_function.sql` creates a `SECURITY DEFINER` function that writes `auth.users.encrypted_password` for the fixed admin identity `admin@miaoda.com`, then grants EXECUTE to `anon`.

**Impact:** The source database contract contains an anonymous path capable of changing the administrator password. This alone blocks production approval.

**Required fix:** Revoke/drop the public function immediately; admin credential changes must require verified admin identity and an explicitly authorized server-side operation. Add DB authorization tests proving anon/student cannot change admin credentials.

**Status:** OPEN. Repository source VERIFIED; deployed DB state NOT YET VERIFIED.

## SEC-P0-002 — Student-data RLS is broadly open to anon/authenticated users

Legacy migrations open student-owned tables with permissive `USING (true)` / `WITH CHECK (true)` policies:

- `00027_allow_anon_student_data_tables.sql`
- `00028_saved_questions_fix_for_device_id.sql`
- `00029_student_notes_fix_for_device_id.sql`
- `00030_quiz_tables_fix_student_id_to_text.sql`
- `00031_student_achievements_fix_student_id_to_text.sql`

`00042_v727_account_based_auth_v2.sql` later adds own-row policies for authenticated students, but does not remove all earlier broad policies. PostgreSQL permissive policies combine with OR semantics, so restrictive new policies do not cancel broad old ones.

**Impact:** Cross-student read/write risk for notes, saved questions, attempts, progress, and achievements; data integrity cannot be trusted.

**Required fix:** Reconstruct the final effective RLS matrix and replace all legacy policies with one explicit role/ownership model. Add automated anon/student/admin authorization tests per table and operation.

**Status:** OPEN.

## SEC-P0-003 — `authenticated` is incorrectly treated as `admin` in administrative tables

Once students became real authenticated Supabase users, older policies became privilege escalation paths. Examples:

- `subject_extra_classes`: authenticated users may INSERT/DELETE with `true`.
- `question_generation_tasks`: policy comment says admin but the rule is only `auth.role() = 'authenticated'`.
- `export_history`: all authenticated users can read/insert/delete.
- `lesson_upload_tasks`: public `FOR ALL USING (true) WITH CHECK (true)`.

**Impact:** A student account may be able to mutate data intended for admin-only workflows.

**Required fix:** Replace every `authenticated == admin` assumption with explicit `is_admin(auth.uid())` or server-side authorization. Do a repository-wide policy audit, not isolated fixes.

**Status:** OPEN.

## SEC-P0-004 — Class activation code authorization is not a real server-side entitlement boundary

`class_activation_codes` is readable/updateable by student/anon policies. Current `verifyAndActivateClassCode()` in `AccessContext` queries and updates the table directly from the browser.

The function also does not reliably check `is_used`, does not validate `expires_at`, ignores several insert/update errors, and performs multiple non-atomic operations before returning local success.

**Impact:** Code reuse/tampering and client/server state divergence are possible. Entitlement enforcement is not trustworthy.

**Required fix:** Move activation to one server-side transaction/RPC/Edge Function that validates code state, expiry, ownership, uniqueness and writes activation atomically.

**Status:** OPEN.

## SEC-P0-005 — Unauthenticated service-role migration endpoint can rewrite student ownership

`supabase/functions/migrate-student-data/index.ts` accepts `{code, user_id}`, uses the service-role client, and rewrites `student_id` across notes, saved questions, attempts, achievements and progress. It contains no caller ownership/authentication proof.

**Impact:** IDOR-style ownership takeover/data reassignment risk.

**Required fix:** Require an authenticated session and prove the requested code belongs to that user inside the server function; preferably retire this public migration surface after a controlled one-time migration.

**Status:** OPEN.

---

# P1 — High Priority Security / Correctness

## SEC-P1-001 — Student password exists as plaintext application data

`profiles.password` is added by migrations and written by both `activate-code` and legacy registration paths even though Supabase Auth already owns credential hashing.

**Impact:** Any profile data exposure becomes credential exposure; two credential sources can drift.

**Required fix:** Remove `profiles.password`, migrate/erase existing values, and let Supabase Auth own credentials.

## SEC-P1-002 — Recovery is implemented as reversible password disclosure

Recovery passwords are AES-GCM encrypted with a single server secret and later decrypted. `get-recovery-password` can return the original password. `admin-get-recovery-password` explicitly decrypts the student's password for the admin UI.

**Impact:** Password recovery becomes password retrieval. A server-key compromise exposes all recoverable passwords, and administrators can see user passwords.

**Required fix:** Replace retrieval with reset flows; no admin or client should receive the original password.

## SEC-P1-003 — Device fingerprint is used like a credential

`src/lib/device.ts` builds device identifiers from browser/platform/screen/hardware/timezone/canvas/WebGL data and simple hashes. Multiple privileged Edge Functions accept caller-supplied fingerprints/signatures as proof of identity.

**Impact:** Browser fingerprinting is not a secret and is not an authentication factor. It is suitable only as a risk/UX signal.

**Required fix:** Authenticate with account/session credentials. Treat fingerprint as supplementary telemetry only.

## SEC-P1-004 — `verify-recovery-password` has a device-signature query bug

The function later reads `row.device_signature`, but the selected columns do not include `device_signature`. This makes the row appear legacy/no-signature in important branches and weakens the intended device restriction.

**Impact:** Device-binding logic does not match the comments/product promise.

**Required fix:** Redesign recovery around account authentication instead of patching fingerprint logic; if temporarily retained, select/validate the actual signature and add tests.

## SEC-P1-005 — Educational content access is mainly UI gating

The lesson storage bucket is public, anon policies allow reads of classes/subjects/lessons/quizzes, and the initial offline preload downloads all classes → subjects → lessons. Student UI later filters visible classes.

**Impact:** If activation codes represent paid/restricted access, content protection can be bypassed outside the UI.

**Required fix:** Enforce entitlement server-side for content queries/storage. Offline packages must contain only authorized content.

## SEC-P1-006 — Student note-media storage policy is public

`student_notes_media` is created as a public bucket. Policies named “authenticated students” omit `TO authenticated`, so comments do not match SQL enforcement.

**Impact:** Legacy student media can be publicly readable/uploadable/deletable depending deployed policy state.

**Required fix:** Remove public legacy bucket/policies if unused; otherwise make paths private and ownership-bound.

## SEC-P1-007 — Cloudflare Worker is effectively an unrestricted Supabase proxy

`tasks/cloudflare-worker/worker.js` defines `ALLOWED_ORIGINS` but does not use it. It reflects the request Origin (or `*`) and proxies arbitrary methods/paths/headers to the Supabase project.

**Impact:** Additional abuse/cross-origin attack surface and unclear production boundary.

**Required fix:** Verify whether deployed. Remove if unnecessary. If required, enforce exact origins, methods, paths and authentication.

## SEC-P1-008 — AI function lacks explicit application-level admin authorization

`analyze-lesson` consumes a privileged integration key and begins processing request tasks without an explicit admin-role verification step in the inspected source.

**Impact:** Cost/quota abuse if gateway JWT configuration is weak or misconfigured.

**Required fix:** Require and verify admin session/role at the function boundary; add rate/size limits.

## SEC-P1-009 — Default admin credential is committed/displayed

A default admin code exists in migration source and the Admin Dashboard tells the user the default value.

**Impact:** Any environment that retained the default is immediately guessable from source.

**Required fix:** Remove the hint/default bootstrap credential, verify production immediately, require rotation/bootstrap setup.

---

# Correctness / Business Logic Findings

## COR-001 — Access-code Excel template creates unusable codes

Full-access login requires a 6-digit code and the generator creates six digits, but the official import template contains 7-digit examples and import accepts any code length >= 4.

**Impact:** Admin can successfully import database records students cannot use.

**Fix:** One shared schema/validator for code length at DB, server and UI/import boundaries.

## COR-002 — Quiz resume can duplicate/misalign answers

Quiz progress saves `current_index` for the currently answered question. Resume restores index and answer array but does not restore the answered/selected state. The same question can be answered again after resume, shifting the answers array.

This logic is duplicated in both `StudentQuizzes` and `LessonDetail`.

**Impact:** Wrong scores/progress and inconsistent user experience.

**Fix:** Extract a shared quiz engine and define one persistence contract: next unanswered index, selected answer state, shuffled question IDs, version, score derivation.

## COR-003 — Multi-lesson quiz saves questions against the first lesson only

`StudentQuizzes` acknowledges quizzes may span multiple lessons but still stores a saved question against `activeQuiz.lesson_ids?.[0]`.

**Impact:** Saved questions can be attributed to the wrong lesson.

## COR-004 — Audio note is typed as image

`LessonDetail.handleFileUpload(type)` sets any non-capture upload to `'image'`, so `audio` becomes image.

**Impact:** Broken media rendering/semantics.

## COR-005 — Achievement display does not match database schema

Database achievements contain `achievement_type`, `badge_icon`, `points`; Statistics UI renders `achievement.title` and `achievement.score`.

**Impact:** Undefined/generic values and incorrect percentage display.

## COR-006 — Selected progress dialog shows global completion rate

The details dialog for one progress record displays `stats.completionRate`, calculated across all records, rather than the selected record.

**Impact:** User-visible wrong statistic.

## COR-007 — Rank RPC has type drift risk

Older migration changes `student_id` in quiz tables from UUID to TEXT. Later `get_student_rank(target_id uuid)` compares that field to UUID input.

**Impact:** RPC can fail/type-mismatch; frontend catches failures and silently reports zero ranking, hiding the defect.

## COR-008 — `quiz_progress` source schema does not match frontend writes

The repository migration creating `quiz_progress` does not contain `score` or `total_questions`; frontend repeatedly writes/reads those fields. A later migration only adds `shuffled_questions`.

**Impact:** Fresh DB rebuilt from repository migrations can fail where production may depend on undocumented schema changes.

**Fix:** Make migrations the reproducible source of truth and add schema contract tests.

## COR-009 — Delete/reset semantics no longer cascade after FKs were removed

Migrations 28–31 drop `student_id` foreign keys and convert IDs to text. `delete-user` still assumes profile deletion cascades all student data.

**Impact:** Orphaned notes/saved questions/attempts/progress/achievements and privacy retention.

## COR-010 — Account activation/reset operations are not transactional

`activate-code`, admin reset, admin password updates and class activation perform multiple independent writes. Several intermediate errors are logged/ignored or compensated only partially.

**Impact:** Auth/profile/code state can diverge.

**Fix:** Define transactional database procedures where possible and explicit compensation only where external Auth operations require it.

## COR-011 — Offline deletion/invalidation is incomplete

- classes/subjects use `bulkPut` without removing server-deleted rows;
- lesson save returns early for empty server result, leaving old offline lessons;
- initial preload catches individual failures and still marks initial sync complete;
- quiz fetch sometimes refuses to replace UI arrays with valid empty server arrays.

**Impact:** Deleted/old content can survive indefinitely offline and partial sync can be labelled complete.

## COR-012 — Reset flow does not clear all local student data as PRD promises

PRD says admin reset should clear all local data. Actual logout clears selected localStorage/access backup but not the full Dexie learning data. A `clearAllData()` helper exists but is not the reset contract.

**Impact:** Previous-account data can remain on a shared/reused device.

---

# Architecture / Duplication / Dead Code

## ARCH-001 — God modules

Large source hotspots include roughly:

- `admin/Lessons.tsx` ~168 KB
- `admin/Quizzes.tsx` ~106 KB
- `student/LessonDetail.tsx` ~87 KB
- `student/Quizzes.tsx` ~76 KB
- `src/lib/export.ts` ~87 KB
- `analyze-lesson/index.ts` ~86 KB
- `src/db/api.ts` ~45 KB

**Impact:** high regression cost, weak boundaries, hard testing, duplicated local state/business logic.

**Decision:** REFACTOR incrementally by feature/domain; no blind rewrite.

## ARCH-002 — `src/db/api.ts` mixes unrelated layers

Admin CRUD, student queries, offline fallback, storage, AI and export-related responsibilities are centralized.

**Fix:** split into domain repositories/services with typed contracts after P0/P1 remediation.

## ARCH-003 — Duplicate AuthContext

Both `src/context/AuthContext.tsx` and `src/contexts/AuthContext.tsx` exist with different APIs/behavior. Verified runtime imports use the singular path; the plural context appears legacy.

**Classification:** REMOVE after import verification.

## ARCH-004 — Old activation system artifacts remain after replacement

`00025` drops `subject_activation_codes`, while legacy helper/function code such as `generate-subject-codes` still references the retired model.

**Impact:** dead attack surface, confusion, broken operations if invoked.

## ARCH-005 — Dead pending synchronization architecture

App still calls `syncPendingStudentData()` on startup/online events, but the function is now explicitly a no-op because notes/saved questions became local-only. Dexie still contains pending queues/helpers.

**Classification:** REMOVE/REFACTOR after confirming product decision.

## ARCH-006 — Too many cache sources of truth

The project simultaneously uses:

- Supabase live data
- ad-hoc localStorage caches
- offline-cache helper
- memory cache
- IndexedDB records/images
- CacheStorage/service worker
- duplicated dashboard caches

**Impact:** invalidation complexity and stale-state bugs.

**Fix:** define a single offline data strategy per domain and explicit freshness/ownership/version rules.

---

# PWA / Offline / Performance

## OFF-001 — Service Worker treats every Supabase hostname as an image

`isImageRequest()` returns true for any hostname containing `supabase`; that branch runs before external-request exclusion. GET API responses can therefore enter the image Cache First path.

**Impact:** stale API responses, sensitive local cache persistence and account-switch contamination.

**Fix:** cache only actual immutable media/storage URLs using explicit pathname/content-type rules.

## OFF-002 — Manual service worker architecture conflicts with documented Vite PWA stack

`vite-plugin-pwa`/Workbox are dependencies/documented, but `vite.config.ts` does not configure them. `index.html` contains custom unregister/register/version/cleanup logic for `/sw.js`.

**Impact:** duplicated update strategies and hard-to-reason cache lifecycle.

**Classification:** REFACTOR to one PWA strategy.

## OFF-003 — Initial preload downloads all content, not authorized content

The preload traverses all classes, subjects and lessons and saves them locally.

**Impact:** bandwidth/storage cost plus entitlement bypass.

## PERF-001 — Access-code management loads entire tables client-side

Admin AccessCodes fetches batches until all rows are loaded (safety ceiling 100,000), then searches/sorts/pages in memory. Admin dashboard also loads access code data instead of count-only statistics.

**Fix:** server-side pagination/filter/count queries.

## PERF-002 — Global `will-change`/GPU promotion is overused

Global CSS applies `will-change` and `translateZ(0)` to common transition classes, potentially promoting many layers.

**Fix:** use only on proven animation bottlenecks.

---

# UX / UI / Accessibility — Static Audit

Runtime visual/device testing remains NOT YET VERIFIED, but source-level issues include:

- `maximum-scale=1.0, user-scalable=no` disables pinch zoom.
- very small 8–10px UI text appears in production screens.
- no verified `prefers-reduced-motion` path despite many animations.
- design language overuses very large radii, shadows, rotations, blur and decorative hero cards relative to task hierarchy.
- the same remote Miaoda-hosted logo is hardcoded across layouts/login/manifest/favicons although local assets exist.
- admin dashboard contains placeholder “latest activity/alerts” content and “updated moments ago” copy that is not tied to actual timestamps.
- student password wording says “this device” while the PRD describes permanent account access from any device/browser.
- app-level connectivity indicator plus student-layout offline indicator may duplicate feedback.

**Direction:** keep the brand/core layout concept, but simplify visual hierarchy, standardize typography/radius/spacing, fix accessibility first, and remove decorative inconsistency.

---

# QA / Build / Git / Release Governance

## QA-001 — No automated test suite

README states there is no test directory and merely recommends Vitest/Jest. No unit, integration, RLS, migration, or E2E coverage was found.

**Impact:** auth/offline/refactor changes cannot be safely verified.

## QA-002 — No CI workflow found

No `.github/workflows` gate was found in the repository tree.

## QA-003 — `lint` script is not fail-fast

The check chain uses shell semicolons. TypeScript/Biome/custom-check failure may be followed by a successful final Vite build, yielding a misleading overall success.

## QA-004 — Type/lint policy is weak

`tsconfig.check.json` does not enable full `strict` and excludes `src/components/ui`. `biome.json` disables recommended rules and enables only a few narrow checks.

## QA-005 — main branch is unprotected

At audit start, `main` had no required status checks/protection.

## QA-006 — Build/dev scripts and README contradict each other

`package.json` intentionally makes `dev`/`build` echo-only commands. README later tells developers to run `npm run dev` and separately notes build must use direct Vite.

## QA-007 — Dependency reproducibility/compatibility concerns

Examples include React 18 runtime with React 19 type packages, a Vite alias to `rolldown-vite@latest`, preview TypeScript tooling and Miaoda-specific development dependencies.

---

# AI Content Integrity

## AI-001 — Invalid AI output can be silently converted into fabricated educational options

Frontend normalizers sometimes insert placeholder options such as `خيار 1..4` and default `correct_option_index: 0` when upstream AI structure is incomplete.

**Impact:** an educational system may present manufactured answers instead of flagging generation failure.

**Fix:** validate with a strict schema (Zod is already installed), reject invalid content, and require admin review for degraded generations.

## AI-002 — Large AI Edge Function uses ad-hoc JSON repair

`analyze-lesson` contains manual extraction/truncation repair logic that may append syntax to malformed model output.

**Fix:** separate task handlers, typed response schemas, bounded retries and explicit failure/review states.

---

# Documentation / Product Contract Drift

- README calls the activation model secure while source policies contradict that claim.
- README says Vite PWA/Workbox while current app uses manual SW registration.
- PRD references a `student_accounts` table while implementation uses `profiles`.
- PRD says account password works across devices; UI says it is device-specific.
- PRD says reset clears all local data; implementation leaves Dexie data.
- PRD simultaneously wants reinstall persistence for notes/saved questions while current implementation makes them local-only.
- Performance TODO claims/percentages are not backed by verified benchmark data.

---

# Classification Matrix

## KEEP

- Core product idea and main user flows.
- React/Vite SPA architecture.
- Supabase as platform (no evidence requires platform replacement).
- route-level lazy loading.
- offline-first product goal and IndexedDB concept.
- component primitive approach.
- AI-assisted authoring concept, with stricter validation.

## IMPROVE

- design tokens and UX hierarchy.
- forms/validation schemas.
- pagination and query contracts.
- error/empty/loading states.
- documentation/runbooks.
- cache freshness/version rules.

## REFACTOR

- `src/db/api.ts` by domain.
- Auth/Access state ownership.
- quiz player into one shared engine.
- offline sync/cache architecture.
- PWA/service-worker update architecture.
- admin code management and large admin screens.

## REBUILD — Targeted, not whole project

- final database RLS/authorization model.
- student password/recovery model.
- server-side entitlement enforcement.
- admin credential management.
- student data ownership model/FKs after legacy device-ID migration.

## REMOVE

- anonymous `sync_admin_password` capability.
- plaintext `profiles.password`.
- reversible password-retrieval flow/admin password reveal.
- duplicate legacy `src/contexts/AuthContext.tsx` after import verification.
- retired subject-activation functions/Edge Functions.
- dead pending-sync queues/no-op synchronization after product decision is confirmed.
- unnecessary vendor/template artifacts after deployment dependency verification.

---

# Required Release Gate Before Sign-Off

I would reconsider production approval only after all of the following are true:

1. P0 database/authorization paths removed and tested.
2. Complete RLS matrix tested for anon / student A / student B / admin.
3. Recovery changed to reset, with no plaintext/reversible user password access.
4. Privileged Edge Functions require explicit role/ownership checks and rate/size limits.
5. Content entitlement is server-side; offline package contains only authorized content.
6. Schema/migrations reproduce a clean database including actual frontend fields and FKs/constraints.
7. Account activation/reset/delete invariants are tested for partial failures.
8. Quiz resume/scoring/achievement/statistics bugs are corrected with automated tests.
9. Offline invalidation/account-switch privacy behavior is tested.
10. CI runs fail-fast lint + strict typecheck + unit/integration + authorization tests + build; main is protected.
11. Critical accessibility issues (zoom, readable sizes, motion) are fixed.
12. A staging deployment passes core admin/student E2E flows online and offline.

## Current Verification Boundary

### VERIFIED FROM SOURCE

Repository structure, routing/providers, active auth/access architecture, core student/admin flows, selected major frontend pages, offline DB/service worker, all critical migrations referenced above, major account/recovery Edge Functions, build/lint configuration, README/PRD contract drift, and Git branch protection state at audit start.

### NOT YET VERIFIED

- Actual deployed Supabase schema/RLS/function versions.
- Production secrets/environment/admin credential state.
- Whether the Cloudflare Worker is deployed/in path.
- Runtime lint/type/build/test result for the audited commit.
- Real browser/device accessibility and performance measurements.
- Complete line-by-line review of the two largest admin modules (`Lessons.tsx`, `Quizzes.tsx`) and every branch of `analyze-lesson`.

Those unknowns may reveal additional problems; they do not weaken the current NO-GO decision.