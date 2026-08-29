# PROJECT FULL AUDIT CATALOG

> Comprehensive static source audit for the current repository.
>
> Goal: capture the problems, gaps, contradictions, duplication, risks and quality debt that must be addressed while rebuilding the **same product** into a stronger production system.
>
> This document does **not** authorize removing product behavior. Existing user scenarios are tracked separately in `PRODUCT_FEATURE_PARITY_MATRIX.md`.

## Audit Rules

- **CONFIRMED** = directly evidenced in repository source inspected during the audit.
- **NOT YET VERIFIED** = requires runtime, deployed Supabase, browser/device, production infrastructure, or full caller analysis.
- Priorities:
  - **P0 Critical** — release/security/data blocker.
  - **P1 High** — serious correctness/security/product reliability issue.
  - **P2 Medium** — maintainability, performance, UX or quality issue with material impact.
  - **P3 Low** — cleanup/polish/debt.
- A finding about current implementation does not imply the feature should be removed. The intended behavior should be preserved through a safer/cleaner contract unless explicitly marked legacy after caller verification.

---

# 1. Executive Diagnosis

The repository contains a strong amount of product functionality, but several implementation generations were layered on top of each other:

1. anonymous/device-based access;
2. subject activation;
3. class activation;
4. account-based Supabase Auth;
5. local/offline access recovery;
6. multiple cache layers;
7. browser-orchestrated AI generation;
8. later migrations attempting to retrofit authenticated student ownership.

The main architectural defect is therefore **contract drift**: old security/data/offline assumptions remain active after newer account flows were introduced.

The product should be rebuilt in controlled domains, preserving behavior but establishing one source of truth for:

- identity;
- authorization;
- content entitlement;
- student ownership;
- offline state;
- quiz state;
- AI jobs;
- media pipeline;
- design tokens;
- release verification.

Current release decision remains: **NO-GO for production/final client handover**.

---

# 2. Security / Authentication / Authorization

## SEC-001 — Anonymous admin-password mutation
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `supabase/migrations/00040_create_sync_admin_password_function.sql`
- **Problem:** a `SECURITY DEFINER` function directly updates the fixed admin Auth password and grants execute to `anon`.
- **Impact:** critical privilege takeover path.
- **Direction:** remove public RPC entirely; use authenticated admin re-authentication + server-side Auth Admin API with explicit role verification and audit logging.

## SEC-002 — Public access-code read/update policies
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00001_init_schema.sql`
- **Problem:** access codes are publicly readable/updateable for verification/redeem.
- **Impact:** access state can be inspected/tampered with outside intended UI.
- **Direction:** redeem codes only through transactional server endpoint/RPC that never exposes code-table rows broadly.

## SEC-003 — Broad anonymous class-code policies
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00026_allow_anon_read_class_activation_codes_and_classes.sql`
- **Problem:** anonymous read/update is permitted on class activation codes.
- **Impact:** class entitlement state can be queried/manipulated.
- **Direction:** server-only code redemption; only return redemption result and current entitlements.

## SEC-004 — Anonymous student-note access
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00027`, `00029`
- **Problem:** historical policies allow broad anon operations on `student_notes`.
- **Impact:** student isolation can be bypassed where server notes remain relevant.
- **Direction:** remove legacy anon policies; if notes remain local-only, remove unused server table/path or restrict it fully.

## SEC-005 — Anonymous saved-question access
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00028_saved_questions_fix_for_device_id.sql`
- **Problem:** anonymous select/insert/delete with `USING (true)`.
- **Impact:** data ownership bypass.
- **Direction:** local-only product decision or authenticated own-row RLS, not device-id filtering in client code.

## SEC-006 — Anonymous/authenticated quiz attempt access
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00030_quiz_tables_fix_student_id_to_text.sql`
- **Problem:** anonymous read/insert and authenticated `FOR ALL` remain permissive.
- **Impact:** forged/cross-student attempts and unreliable ranking.
- **Direction:** restore UUID/FK ownership and own-row policies; server-derive trusted scoring where needed.

## SEC-007 — Anonymous/authenticated quiz progress access
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00030_quiz_tables_fix_student_id_to_text.sql`
- **Problem:** broad `FOR ALL` policies.
- **Impact:** progress can be read/modified across users.
- **Direction:** own-row RLS on authenticated profile UUID.

## SEC-008 — Anonymous/authenticated achievement access
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00031_student_achievements_fix_student_id_to_text.sql`
- **Problem:** both anon and authenticated users are broadly permitted.
- **Impact:** achievements/leaderboards are forgeable.
- **Direction:** achievements generated server-side from trusted attempts; students read own rows only.

## SEC-009 — Legacy `authenticated == admin` policies
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00038_create_subject_extra_classes.sql`, `00015_create_question_generation_tasks.sql`, `00018_create_export_history_table.sql`
- **Problem:** policies assume authenticated users are administrators, but students are now authenticated too.
- **Impact:** authenticated students can mutate/read admin-oriented data.
- **Direction:** every admin mutation requires `is_admin(auth.uid())` or a server endpoint that verifies admin role.

## SEC-010 — Public lesson-upload task table
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `00011_create_lesson_upload_tasks_table.sql`
- **Problem:** public `FOR ALL USING (true) WITH CHECK (true)`.
- **Impact:** upload-task state/files/errors can be tampered with.
- **Direction:** admin-only task ownership/RLS; server-generated task IDs and state transitions.

## SEC-011 — Unauthenticated service-role ownership migration
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `supabase/functions/migrate-student-data/index.ts`
- **Problem:** accepts caller-supplied code/user_id, then service role rewrites ownership across student tables without caller identity proof.
- **Impact:** ownership takeover/data corruption.
- **Direction:** remove public migration endpoint; migration must run under authenticated user/one-time migration token with strict old/new ownership proof and idempotency.

## SEC-012 — Content entitlement enforced mainly in frontend
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `useAccessControl.ts`, broad education-data/storage read policies.
- **Problem:** UI decides whether content is “locked” while server data remains readable.
- **Impact:** content licensing/access can be bypassed.
- **Direction:** RLS/server query views enforce entitlements; offline sync downloads only authorized content.

## SEC-013 — Public lesson-content Storage bucket
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `00001_init_schema.sql`
- **Problem:** `lesson_content` bucket is public and selectable by anyone.
- **Impact:** direct URLs bypass access codes.
- **Direction:** private bucket + signed/authenticated delivery or entitlement-aware proxy as needed.

## SEC-014 — Public student-note media bucket/policies
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `00006_multimedia_notes_and_bulk_delete.sql`
- **Problem:** public bucket; policies described as authenticated do not actually scope role correctly.
- **Impact:** media privacy exposure and arbitrary storage actions.
- **Direction:** remove obsolete server note-media path if notes remain local-only, otherwise own-user private storage paths.

## SEC-015 — Plaintext student password in profile data
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `00022`, `00044`, `activate-code`, legacy `AuthContext.registerAccount`.
- **Problem:** Supabase Auth password is duplicated in plaintext application data.
- **Impact:** profile exposure becomes credential exposure.
- **Direction:** remove column/data; Auth owns password hash only.

## SEC-016 — Reversible recovery password design
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `_shared/crypto.ts`, recovery Edge Functions.
- **Problem:** original password is encrypted for later decryption rather than reset.
- **Impact:** secrets can be disclosed after key/database compromise.
- **Direction:** one-time reset/recovery flow; never retrieve original password.

## SEC-017 — Admin can reveal student original password
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `admin-get-recovery-password`, AccessCodes UI.
- **Problem:** administrator UI deliberately decrypts and displays the student password.
- **Impact:** credential confidentiality failure.
- **Direction:** replace UI feature with “issue password reset / recovery token”.

## SEC-018 — Device fingerprint used as authorization proof
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `src/lib/device.ts`, device/recovery Edge Functions.
- **Problem:** browser characteristics are treated as security identity.
- **Impact:** collisions/spoofing/device changes can grant or deny access incorrectly.
- **Direction:** treat device metadata only as risk/UX signal; use authenticated session + recovery credential.

## SEC-019 — Client-side embedded “secrets”
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `access-crypto.ts`, `access-crypto-v2.ts`, `code-crypto.ts`.
- **Problem:** hardcoded JS secrets/keys power XOR/DJB2/AES local schemes.
- **Impact:** false security boundary; all frontend secrets are recoverable.
- **Direction:** remove as security mechanism; if local integrity/obfuscation is desired, label it honestly and do not trust it server-side.

## SEC-020 — Weak custom local “HMAC-like” scheme
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `access-crypto-v2.ts`.
- **Problem:** DJB2 + XOR is not authenticated encryption/HMAC.
- **Impact:** tamper resistance assumptions are invalid.
- **Direction:** remove trust from local token; server-signed limited offline entitlement snapshot if truly required.

## SEC-021 — Student routes can be authorized by local access state alone
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `RouteGuard.tsx`, `AccessContext.tsx`.
- **Problem:** `isStudent` can be true from local access without validated session.
- **Impact:** Authentication and entitlement are conflated.
- **Direction:** explicit `SessionState`, `EntitlementState`, `OfflineAuthorizationState` contracts.

## SEC-022 — AI generation lacks explicit admin authorization in function source
- **Priority:** P1
- **Status:** CONFIRMED source / deployment config NOT YET VERIFIED
- **Evidence:** `supabase/functions/analyze-lesson/index.ts`.
- **Problem:** function accepts content tasks without checking caller profile role in code.
- **Impact:** paid/privileged generation can be invoked by unauthorized authenticated users depending deployment JWT settings.
- **Direction:** verify JWT then role/permission before any provider call; reject student callers.

## SEC-023 — Wildcard Edge Function CORS
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** multiple Edge Functions.
- **Problem:** `Access-Control-Allow-Origin: *` everywhere.
- **Impact:** unnecessary exposure; not a replacement for auth, but weakens origin boundary and increases abuse surface.
- **Direction:** strict known web origins for browser-only functions where practical; authorization remains primary control.

## SEC-024 — Cloudflare proxy allowlist declared but not enforced
- **Priority:** P1
- **Status:** CONFIRMED source / deployment NOT YET VERIFIED
- **Evidence:** `tasks/cloudflare-worker/worker.js`.
- **Problem:** `ALLOWED_ORIGINS` is unused; response reflects arbitrary request origin while credentials are allowed.
- **Impact:** broad cross-origin proxy if deployed.
- **Direction:** remove if unused; otherwise explicit origin allowlist, method/path allowlist, security headers and monitoring.

## SEC-025 — Default admin credential committed/displayed
- **Priority:** P1
- **Status:** CONFIRMED source / production value NOT YET VERIFIED
- **Evidence:** `00002`, admin dashboard.
- **Problem:** default secret exists in source and UI hint.
- **Impact:** predictable admin access where not rotated.
- **Direction:** bootstrap admin out-of-band, force initial rotation, remove hint/history.

## SEC-026 — First-profile admin bootstrap
- **Priority:** P1
- **Status:** CONFIRMED source / fresh-deploy behavior NOT YET VERIFIED
- **Evidence:** `00001.handle_new_user()`.
- **Problem:** first profile can be assigned admin by profile count.
- **Impact:** unsafe bootstrap race/ownership assumption.
- **Direction:** explicit seeded admin identity/secure bootstrap command; no implicit “first user wins”.

## SEC-027 — Old `check_admin_code` security-definer oracle remains
- **Priority:** P2
- **Status:** CONFIRMED source / execute exposure NOT YET VERIFIED
- **Evidence:** `00002`.
- **Problem:** old RPC validates the admin code independently of modern Auth.
- **Impact:** redundant credential surface/brute-force oracle.
- **Direction:** remove once all callers verified migrated.

## SEC-028 — Legacy subject-activation security-definer functions remain
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `00023_add_activation_helper_functions.sql`.
- **Problem:** RPCs accept arbitrary profile/subject IDs and were created for retired subject activation model.
- **Impact:** privileged legacy surface and ownership ambiguity.
- **Direction:** verify no callers, then remove with retired schema.

## SEC-029 — `check-account-state` uses service role without caller binding
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** `check-account-state/index.ts`.
- **Problem:** caller may query state using user_id/code without binding request token to that identity.
- **Impact:** account-state enumeration/privacy surface.
- **Direction:** authenticated own-account check; admin-only alternate path.

## SEC-030 — Code generation uses `Math.random()`
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** access/class/admin code generation paths.
- **Problem:** codes are generated client-side/server-side using non-cryptographic PRNG in several paths.
- **Impact:** reduced unpredictability for access credentials.
- **Direction:** generate server-side using cryptographic randomness plus uniqueness constraint/rate limits.

---

# 3. Data Model / Database / Integrity

## DATA-001 — Student IDs converted from UUID/FK to TEXT
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** migrations `00028`–`00031`.
- **Problem:** ownership FKs were removed to support legacy device/code identifiers.
- **Impact:** orphan data, broken cascades, weaker integrity.
- **Direction:** canonical `student_id UUID REFERENCES profiles(id)`; migrate legacy aliases through dedicated mapping table/process.

## DATA-002 — Delete-user assumes cascades that later migrations removed
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `delete-user/index.ts` comments vs migrations 28–31.
- **Problem:** account deletion can leave notes/saved questions/attempts/progress/achievements.
- **Impact:** privacy/data-retention bug.
- **Direction:** restore FKs or explicit transactionally verified deletion policy.

## DATA-003 — Deleting access code deletes profile but not Auth user
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `00034_trigger_delete_profile_on_code_delete.sql`; direct code delete UI.
- **Problem:** DB trigger deletes profile by code string; cannot delete `auth.users`.
- **Impact:** orphan Auth account and inconsistent reuse of code.
- **Direction:** server “revoke/delete account” transaction workflow; no magic delete trigger based on code text.

## DATA-004 — Class-code delete trigger lacks explicit redeemed-by relation
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `00036_realtime_and_triggers_access_codes.sql`.
- **Problem:** revocation tries to infer student through `device_id` rather than explicit code redemption owner.
- **Impact:** revocation can fail or target incorrect records.
- **Direction:** class code row records `redeemed_by_profile_id`, redemption transaction creates entitlement, revocation references exact relation.

## DATA-005 — Full access codes lack DB format constraint
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `access_codes.code text unique not null` vs UI 6-digit rule.
- **Problem:** invalid lengths/non-digit values can be inserted.
- **Impact:** admin import can create unusable credentials.
- **Direction:** DB CHECK for canonical format plus shared schema validation.

## DATA-006 — Access import template/validator contradict login
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** AccessCodes template shows 7-digit examples; importer accepts length >=4; login requires exactly 6 digits.
- **Impact:** successful import of codes students cannot redeem.
- **Direction:** one shared `FullAccessCodeSchema` used UI/import/server/DB.

## DATA-007 — Duplicate entitlement sources
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `access_codes`, `profiles.full_access_code`, `profiles.activated_subjects`, class code tables, local AccessContext.
- **Problem:** same business state represented several ways.
- **Impact:** drift and inconsistent access decisions.
- **Direction:** normalized entitlement model, e.g. `student_entitlements` with source/type/expiry/status.

## DATA-008 — Duplicate credential sources
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** Supabase Auth, `admin_settings.admin_code`, `profiles.password`, recovery password field.
- **Problem:** four credential systems overlap.
- **Impact:** impossible consistent rotation/recovery/security.
- **Direction:** Auth = credential source; application DB stores no retrievable passwords.

## DATA-009 — `quiz_progress` source-of-truth drift
- **Priority:** P1
- **Status:** CONFIRMED source mismatch
- **Evidence:** frontend/types use `score`, `total_questions`; visible migrations create neither.
- **Impact:** clean database rebuild may fail at runtime; production may contain undocumented manual changes.
- **Direction:** clean baseline migration must reproduce exact app schema; generate TS types from DB.

## DATA-010 — Rank RPC UUID/TEXT mismatch
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `00030` converts attempt student_id to text; `00043 get_student_rank(target_id uuid)`.
- **Impact:** type mismatch / cast ambiguity / fresh deployment failure risk.
- **Direction:** restore canonical UUID ownership and regenerate RPC contract.

## DATA-011 — Quiz `lesson_ids uuid[]` has no FK
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** lesson IDs inside array are not referentially enforced.
- **Impact:** deleted lessons can leave stale quiz references.
- **Direction:** normalized `quiz_lessons(quiz_id, lesson_id, order)` relation.

## DATA-012 — Questions/versions stored as unconstrained JSONB
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** AI/admin data can persist malformed question objects.
- **Impact:** renderer/scoring must guess missing fields and data migrations become complex.
- **Direction:** either normalized question tables or strict JSON schema at service boundary + versioned schema and DB checks where feasible.

## DATA-013 — Historical JSON quiz migration burden
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** `00032_fix_quiz_versions_lesson_image_url.sql` loops JSONB to patch nested version/question images.
- **Impact:** difficult migrations/querying/indexing.
- **Direction:** normalize durable relations; JSON only for immutable snapshots when justified.

## DATA-014 — Class/subject/page uniqueness rules unspecified
- **Priority:** P2
- **Status:** CONFIRMED schema gap / business intent requires verification
- **Problem:** duplicate class names, duplicate subject names in same class, duplicate lesson page numbers can exist.
- **Impact:** ambiguous admin/content navigation.
- **Direction:** decide intentional uniqueness and enforce where business rule requires.

## DATA-015 — Activation flow is non-transactional
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `activate-code/index.ts` checks code, creates Auth user, profile, updates access code separately.
- **Problem:** concurrency/failure can leave partial account/code state.
- **Impact:** duplicate activation/orphan accounts/used code mismatch.
- **Direction:** atomic/idempotent redemption workflow; serialize code claim with DB transaction/advisory lock/RPC and compensation for Auth creation.

## DATA-016 — Profile-create failure can be tolerated during activation
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** activation function logs/continues in some profile failure path.
- **Impact:** Auth account without required profile.
- **Direction:** hard-fail/compensate; activation only returns success after invariants hold.

## DATA-017 — Legacy Auth user lookup only considers limited user list
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** activation migration path enumerates first page/limited Auth users.
- **Impact:** old accounts beyond limit may not migrate correctly.
- **Direction:** deterministic identity lookup, not list-and-search.

## DATA-018 — Class-code redemption non-atomic
- **Priority:** P0
- **Status:** CONFIRMED
- **Evidence:** `AccessContext.verifyAndActivateClassCode` performs select/insert/update separately.
- **Impact:** race/reuse/inconsistent local/server state.
- **Direction:** `redeem_class_code()` server transaction.

## DATA-019 — Class-code redemption ignores used/expiry state
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** code existence/class is checked, not all lifecycle constraints before mutation.
- **Impact:** used/expired code can be accepted in paths.
- **Direction:** one server state machine with status/expiry/owner checks.

## DATA-020 — Class-code renewal does not reliably extend existing entitlement
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** if student/class activation already exists, path skips insert/update of entitlement expiry while marking new code used.
- **Impact:** new code may be consumed without extending access.
- **Direction:** transactional upsert with explicit renewal semantics.

## DATA-021 — Ignored Supabase errors in class activation
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** insert/update results are not consistently checked before local success.
- **Impact:** UI can report activated while server failed.
- **Direction:** typed result handling; success only after all required mutations succeed.

## DATA-022 — Saved-question IDs collide across lessons
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** local ID `${questionIndex}_${studentCode}`.
- **Problem:** lesson ID is absent.
- **Impact:** question 0 from one lesson can overwrite question 0 from another.
- **Direction:** random UUID or composite account+lesson+stable question ID.

## DATA-023 — Multi-lesson quiz bookmark maps question to first lesson
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** Student Quizzes uses first `lesson_ids[0]`.
- **Impact:** saved question metadata/content provenance is wrong.
- **Direction:** every question carries source lesson/page ID explicitly.

## DATA-024 — Achievements can be duplicated
- **Priority:** P2
- **Status:** CONFIRMED schema/business gap
- **Problem:** repeated high scores can insert same award repeatedly; no uniqueness/idempotency rule.
- **Impact:** inflated achievements/points.
- **Direction:** explicit award rule/key; server-side idempotent insertion.

## DATA-025 — Client supplies trusted score/achievement data
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** browser computes score and creates achievement rows.
- **Impact:** ranking/awards can be forged.
- **Direction:** store answer attempt, derive trusted score/award server-side; clearly separate casual local practice if offline.

## DATA-026 — Correct answers are shipped to browser
- **Priority:** P2 / product classification
- **Status:** CONFIRMED
- **Problem:** practice question payload includes correct answer.
- **Impact:** cannot be treated as secure exam assessment.
- **Direction:** declare current quizzes “practice”; if future secure exams are needed, create separate assessment architecture.

## DATA-027 — Statistics schema/UI mismatch
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** UI reads achievement title/score fields not in schema (`achievement_type`, `points`).
- **Impact:** wrong/empty student achievements.
- **Direction:** typed achievement view model and generated DB types.

## DATA-028 — Selected progress dialog uses global completion
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** dialog for one record shows overall `stats.completionRate`.
- **Impact:** misleading result.
- **Direction:** derive record-specific completion.

## DATA-029 — Soft-delete quiz semantics incomplete
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** UI checks `deleted_at`, while deletion paths/data contracts vary and final schema must be verified.
- **Impact:** deleted quizzes can differ between admin/student/cache.
- **Direction:** choose soft vs hard delete and implement consistently with sync tombstones.

## DATA-030 — Fresh-deploy reproducibility is not guaranteed
- **Priority:** P0 release gate
- **Status:** CONFIRMED source drift / runtime NOT YET VERIFIED
- **Problem:** frontend contracts do not fully match migration history.
- **Impact:** repository alone may not reproduce production.
- **Direction:** new baseline schema migration + migration verification test in CI.

---

# 4. Frontend Architecture / Code Quality / Duplication

## ARCH-001 — No domain/service layer
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `src/services/` effectively empty; pages/contexts/db/lib own business logic.
- **Impact:** duplicated rules and high coupling.
- **Direction:** feature/domain modules with repositories/services/use-cases.

## ARCH-002 — `src/db/api.ts` God facade
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** admin CRUD, student reads, offline fallback, storage and AI transport in one module.
- **Impact:** broad regression surface, weak ownership/testing.
- **Direction:** repositories by domain: content, quizzes, accounts, entitlements, notifications, AI jobs, media.

## ARCH-003 — Admin Lessons God page
- **Priority:** P1
- **Status:** CONFIRMED (~169 KB)
- **Direction:** split list/query, upload workbench, content editor, AI actions/jobs, export/history.

## ARCH-004 — Admin Quizzes God page
- **Priority:** P1
- **Status:** CONFIRMED (~106 KB)
- **Direction:** QuizList, QuizBuilder, VersionBuilder, QuestionEditor, AI generation, ExportDialog.

## ARCH-005 — Student LessonDetail God page
- **Priority:** P1
- **Status:** CONFIRMED (~87 KB)
- **Direction:** Reader, Summary, PracticeEngine, Notes, ReaderPreferences, adjacent navigation.

## ARCH-006 — Student Quizzes God page
- **Priority:** P1
- **Status:** CONFIRMED (~76 KB)
- **Direction:** shared PracticeEngine + quiz catalog/session/results/history modules.

## ARCH-007 — `export.ts` God utility
- **Priority:** P2
- **Status:** CONFIRMED (~88 KB)
- **Direction:** export domain/templates/renderers, lazy loaded only in admin.

## ARCH-008 — `analyze-lesson` God Edge Function
- **Priority:** P1
- **Status:** CONFIRMED (~86 KB)
- **Direction:** PromptRegistry, provider client, schemas, validators, image transport, job worker separated.

## ARCH-009 — Duplicate AuthContext implementations
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** `src/context/AuthContext.tsx`, `src/contexts/AuthContext.tsx`.
- **Direction:** verify all imports then remove duplicate; one auth contract.

## ARCH-010 — Active AuthContext still exports dead/legacy methods
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** code/subject login, registerAccount, legacy activation, guest mode remain alongside new account flow.
- **Impact:** accidental reuse, unclear product contract.
- **Direction:** feature-parity review then remove retired API surface.

## ARCH-011 — Legacy subject-code Edge Function targets dropped table
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** `generate-subject-codes` writes `subject_activation_codes`; migration 25 drops that table.
- **Impact:** broken dead endpoint/attack surface.
- **Direction:** verify no external caller, then remove.

## ARCH-012 — Legacy device/recovery functions overlap
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** `check-device`, `get-code-by-device`, `record-code-device`, recovery verify/get/set overlap with account Auth.
- **Impact:** state-machine complexity/security surface.
- **Direction:** new small account/recovery API; retire compatibility endpoints after migration window.

## ARCH-013 — Multiple cache implementations
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `offline-cache`, `offline-db`, `memory-cache`, `simple-cache`, SW CacheStorage, local page caches.
- **Impact:** unclear source of truth/invalidation.
- **Direction:** Admin: query cache only. Student: one repository + IndexedDB + explicit sync/version; Service Worker only static/media strategy.

## ARCH-014 — Multiple preload/sync implementations
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** InitialSync, DataPreloader, preloadAllContent, Dashboard refresh paths.
- **Impact:** different data sets/error semantics, duplicated network work.
- **Direction:** one `StudentSyncEngine`.

## ARCH-015 — No shared quiz/practice engine
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** lesson interactive questions and quiz page duplicate shuffle/answer/resume/score/save logic.
- **Impact:** same resume defects duplicated.
- **Direction:** shared domain state machine + persistence adapter.

## ARCH-016 — Two image lazy/cache components
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** `CachedImage`, `LazyImage`; both imported in LessonDetail.
- **Impact:** inconsistent behavior and duplicate IntersectionObserver/load logic.
- **Direction:** one media component with policy options.

## ARCH-017 — Two image-compression implementations
- **Priority:** P2
- **Status:** CONFIRMED
- **Evidence:** `file-processing.ts`, `image-compression.ts`.
- **Impact:** inconsistent quality/format/size contracts.
- **Direction:** one deterministic MediaPipeline.

## ARCH-018 — Misnamed request “batcher”
- **Priority:** P3
- **Status:** CONFIRMED / usage NOT YET VERIFIED
- **Problem:** only deduplicates identical in-flight calls, does not batch.
- **Direction:** remove if unused or rename to request deduper.

## ARCH-019 — `storage.set(..., compress)` ignores compression argument
- **Priority:** P3
- **Status:** CONFIRMED
- **Impact:** misleading utility contract.
- **Direction:** remove param/utility if unused or implement explicit serialization strategy.

## ARCH-020 — `useAccess()` hides provider misuse
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** returns dummy methods instead of throwing outside provider.
- **Impact:** integration bugs silently degrade behavior.
- **Direction:** fail fast in development/runtime boundary.

## ARCH-021 — Auth subscriptions can be recreated as profile changes
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** active AuthContext effect dependency/logic intertwines session/profile state.
- **Impact:** duplicate subscriptions/extra work/race complexity.
- **Direction:** one stable session subscription; profile query separately keyed by user id.

## ARCH-022 — Manual admin token REST path duplicates Supabase client auth
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** admin login path manually calls token endpoint and constructs local profile state.
- **Impact:** duplicated auth behavior and role inconsistency.
- **Direction:** one Auth client/service and server role verification.

## ARCH-023 — Errors frequently converted into empty/offline data
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** authorization/schema/server failures can look like empty lists/offline fallback.
- **Impact:** hides production defects and corrupts user perception.
- **Direction:** typed errors: OfflineUnavailable, Unauthorized, Forbidden, Validation, Server, NotFound; only network errors use offline fallback.

## ARCH-024 — Extensive `any` at core business boundaries
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** AI/schema/database drift is not caught by type system.
- **Direction:** strict schemas, generated Supabase types, no `any` in domain interfaces.

---

# 5. Quiz / Learning Correctness

## QUIZ-001 — Resume restores current index but not answered state
- **Priority:** P1
- **Status:** CONFIRMED
- **Impact:** user may answer the same current question again; answers become misaligned.
- **Direction:** state machine stores `next_question_index` or complete per-question answer map; resume reconstructs selected/answered state exactly.

## QUIZ-002 — Resume bug duplicated in two screens
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** one PracticeEngine.

## QUIZ-003 — Score state can lag final answer
- **Priority:** P1
- **Status:** requires targeted runtime verification
- **Problem:** React `setScore` is async while final-attempt code may persist current `score` state around navigation to result.
- **Direction:** derive score from answers deterministically at commit time, never from mutable UI counter.

## QUIZ-004 — Progress upsert conflict semantics are implicit
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** generic upsert without explicit conflict target relies on DB constraints and nullable lesson/quiz fields.
- **Direction:** separate lesson-practice and quiz-session keys or explicit unique session key.

## QUIZ-005 — `maybeSingle` can be ambiguous if filters do not uniquely identify progress
- **Priority:** P2
- **Status:** CONFIRMED pattern
- **Direction:** exact unique key contract.

## QUIZ-006 — Option shuffle uses text lookup
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** `shuffleOptions()` uses `indexOf(correctOption)`.
- **Impact:** duplicate option texts can resolve to wrong occurrence.
- **Direction:** shuffle `{id,text,isCorrect}` objects or indices.

## QUIZ-007 — AI malformed answer can default to index 0
- **Priority:** P1
- **Status:** CONFIRMED
- **Impact:** plausible but false educational answer.
- **Direction:** reject invalid question; require admin review/retry.

## QUIZ-008 — Achievements derived client-side
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** trusted server result event triggers award rules.

## QUIZ-009 — Ranking based on forgeable client attempts
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** only trusted attempts count in ranking; offline practice marked unverified until synced/validated.

## QUIZ-010 — Student history labels lack real lesson metadata
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** statistics often renders ordinal “lesson N” rather than joined title.
- **Direction:** aggregate/query projection includes title/subject/class.

## QUIZ-011 — Local failed attempts are never actually synced
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** save function says “will sync later”, but no quiz-attempt pending queue; sync function is no-op.
- **Impact:** history/rank differs by device/network.
- **Direction:** outbox queue with idempotency IDs or explicitly local-only practice; never promise nonexistent sync.

## QUIZ-012 — Quiz data includes full answer key client-side
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** acceptable for practice, document it. Separate architecture if secure exams are introduced.

---

# 6. AI / Gemini / Content Integrity

## AI-001 — Single provider credential
- **Priority:** P1 reliability
- **Status:** CONFIRMED
- **Problem:** one `INTEGRATIONS_API_KEY` creates single credential/gateway failure point.
- **Direction:** server-side credential/project pool with health/cooldown/rotation; no keys in frontend.

## AI-002 — Same-project key rotation does not increase Gemini quota
- **Priority:** Architecture constraint
- **Status:** VERIFIED from current Google documentation
- **Problem:** assuming several API keys multiply RPM/TPM would be wrong because limits are project-level.
- **Direction:** track quota by project; use proper tier/quota, queueing/batching/context optimization. Multiple keys help rotation/failure isolation, not quota bypass.

## AI-003 — AI job orchestration runs in browser
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** UI creates task row but browser continues actual work.
- **Impact:** closing/suspending tab leaves jobs stuck.
- **Direction:** durable queue + server worker; UI only creates/cancels/observes jobs.

## AI-004 — Long retry waits inside one Edge request
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** 429 retry sleeps can be tens of seconds inside function invocation.
- **Impact:** timeout/memory/concurrency pressure.
- **Direction:** queue retry with next-attempt timestamp and exponential backoff.

## AI-005 — No Retry-After/circuit breaker/project cooldown
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** classify provider errors; 429/503 backoff; project cooldown; 401/403 disable credential and alert.

## AI-006 — No durable idempotency
- **Priority:** P1
- **Status:** CONFIRMED
- **Impact:** retry/double-click can duplicate generated data/jobs.
- **Direction:** idempotency key from task type + source IDs + prompt version + requested settings.

## AI-007 — Hardcoded provider/model runtime
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** transport tied to one gateway/model string.
- **Direction:** provider adapter/model config; benchmark before changing model.

## AI-008 — Prompt rules mixed with transport/parsing/retry
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** versioned PromptRegistry separated from provider client and validators.

## AI-009 — Prompt rules have no stored version per output
- **Priority:** P1
- **Status:** CONFIRMED
- **Impact:** impossible to reproduce why content differs across generations.
- **Direction:** save prompt_version/model/provider/job metadata with generated artifact.

## AI-010 — No strict structured-output schema contract
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** response parsing guesses several shapes and repairs JSON.
- **Direction:** provider structured output JSON Schema/Zod + local semantic validation.

## AI-011 — JSON repair can turn truncated output into plausible partial output
- **Priority:** P1 content integrity
- **Status:** CONFIRMED
- **Direction:** reject incomplete output or retry chunk; do not silently fabricate closure.

## AI-012 — Parse failure may be returned as a successful-looking payload
- **Priority:** P1
- **Status:** CONFIRMED pattern
- **Direction:** typed provider/parse error; job status failed/retryable.

## AI-013 — AI normalization invents fallback option/answer data
- **Priority:** P0/P1 educational correctness
- **Status:** CONFIRMED
- **Direction:** malformed educational output must fail validation and be regenerated/reviewed.

## AI-014 — No semantic second-pass verification
- **Priority:** P2
- **Status:** CONFIRMED gap
- **Problem:** syntactically valid answer can still be wrong.
- **Direction:** deterministic checks + optional verifier model for high-value generation, especially answer/explanation consistency.

## AI-015 — Silent image/context truncation
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** task paths cap images/text (e.g. first subset / fixed char limits) without a coverage contract.
- **Impact:** generated summary/test may omit later lesson pages.
- **Direction:** chunk all source content with coverage map and merge stage; UI shows covered pages.

## AI-016 — Browser callers silently truncate lesson text
- **Priority:** P1
- **Status:** CONFIRMED
- **Impact:** long lessons/quizzes lose content.
- **Direction:** source chunk service, never arbitrary char slicing.

## AI-017 — Very high max output token setting used broadly
- **Priority:** P2 cost/perf
- **Status:** CONFIRMED
- **Direction:** task-specific token budgets derived from requested count/format.

## AI-018 — Image fetch/base64 conversion can be memory heavy
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** signed server fetch, bounded concurrency, resize/quality policy, streamed/file API where provider supports it.

## AI-019 — Inconsistent image concurrency
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** some sequential, some broad `Promise.all`.
- **Direction:** shared bounded-concurrency loader.

## AI-020 — No generation cost/token observability
- **Priority:** P2
- **Status:** CONFIRMED gap
- **Direction:** per job task/model/token/latency/retry/credential-project metrics.

## AI-021 — No job priority/concurrency policy
- **Priority:** P2
- **Status:** CONFIRMED gap
- **Direction:** queue priorities: interactive single-question > admin batch > background comprehensive/bulk.

## AI-022 — No key/project health dashboard
- **Priority:** P2
- **Status:** CONFIRMED gap
- **Direction:** Admin AI Operations page, secret values never rendered.

## AI-023 — Provider secret currently abstracted behind third-party integration gateway
- **Priority:** P1 reliability/ownership
- **Status:** CONFIRMED current code / upstream contract NOT YET VERIFIED
- **Direction:** define first-party provider adapter and documented failover; avoid hidden vendor dependency where possible.

## AI-024 — Scientific renderer contradicts prompt notation rules
- **Priority:** P1 educational formatting
- **Status:** CONFIRMED
- **Evidence:** prompt rejects English superscripts; `localizeScientificText` emits `²/³` for `^2/^3`.
- **Direction:** one notation specification used prompt + validator + renderer + export.

## AI-025 — Scientific localization does broad textual replacements
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** global replacements such as `/` → division can corrupt contexts not intended as math.
- **Direction:** structured math/text segments or carefully scoped parser, not blanket replacement.

## AI-026 — Generated serial number is collision-prone
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** time suffix + small random suffix is not globally robust.
- **Direction:** UUID/database identity; display serial generated from stable row/order if needed.

## AI-027 — Exact source modes can still mix inference with extraction
- **Priority:** P1
- **Status:** CONFIRMED design tension
- **Problem:** “exact paper/source” modes should not invent an answer when source does not mark one.
- **Direction:** separate extraction certainty fields; unknown answer remains unknown/admin-review.

## AI-028 — Generation state updates depend on page-local timers/refetches
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** jobs/subscriptions query cache invalidation; no arbitrary `setTimeout` synchronization.

## AI-029 — Cancellation is status-level, not durable provider/job cancellation
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** worker checks cancellation between units/chunks and stops future attempts.

## AI-030 — No golden regression set for prompt/model changes
- **Priority:** P1
- **Status:** CONFIRMED gap
- **Direction:** fixture pages across Arabic/math/science/Quran/exam formats; score structure/coverage/answer quality before model/prompt release.

---

# 7. Offline / PWA / Sync

## OFF-001 — Global IndexedDB not account-scoped
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** one `AlWaseelahDB` stores content/student state for current/previous accounts.
- **Impact:** account switching/privacy/stale entitlement risk.
- **Direction:** account/tenant partition keys and explicit session cleanup; content cache can be shared only when entitlement/security allows.

## OFF-002 — Global initial-sync flag
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** `syncStatus.id='initial'` is not account/content-version/entitlement scoped.
- **Impact:** wrong account may believe sync is complete.
- **Direction:** sync checkpoint keyed by account + entitlement revision + content revision.

## OFF-003 — Saving access resets sync flag
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** AccessContext access persistence deletes initial sync state.
- **Impact:** repeated full downloads/network/battery usage.
- **Direction:** access changes produce a targeted entitlement diff, not blanket resync flag reset.

## OFF-004 — Deleted lessons can remain offline forever
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** `saveLessonsOffline([])` returns before deleting prior subject lessons.
- **Direction:** sync uses server revision/tombstones or replace-by-scope even when result empty.

## OFF-005 — Deleted subjects can remain offline
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** subject save only upserts; empty result does not delete old scope.
- **Direction:** scoped replacement/delta tombstones.

## OFF-006 — Deleted classes can remain offline
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** revision/delta or scoped replacement.

## OFF-007 — Partial preload can mark sync complete
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** per-subject lesson failures are swallowed, then sync complete is set.
- **Impact:** silent incomplete offline package.
- **Direction:** checkpoint each scope; complete only when required scopes succeed; expose partial status.

## OFF-008 — InitialSync ignores query errors before completion
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** explicit results/errors and retryable checkpoint.

## OFF-009 — InitialSync uses unstable random question IDs
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** duplicates/non-deterministic cache on repeat sync.
- **Direction:** stable server IDs or deterministic hash of source question identity.

## OFF-010 — Full preload downloads unauthorized content
- **Priority:** P1 security/perf
- **Status:** CONFIRMED
- **Direction:** entitlement-aware manifest from server.

## OFF-011 — Multiple live/legacy preload mechanisms
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** one sync engine and one content manifest/revision API.

## OFF-012 — Quiz-attempt outbox missing
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** durable local outbox, idempotent sync, or explicit local-only semantics.

## OFF-013 — Pending note/question queues remain while sync is no-op
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** misleading dead architecture.
- **Direction:** remove after confirming local-only product decision; do not retain fake sync.

## OFF-014 — `clearAllData()` does not clear all data
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** access backup and quizAttempts are not cleared.
- **Impact:** reset/logout privacy and stale-data bug.
- **Direction:** explicit `clearAccountData`, `clearContentCache`, `factoryReset` scopes with tests.

## OFF-015 — Service Worker treats Supabase host as image
- **Priority:** P0/P1
- **Status:** CONFIRMED
- **Impact:** API GET can be Cache First/stale under image cache.
- **Direction:** only cache actual image requests/extensions/content types; never cache authenticated API JSON under media strategy.

## OFF-016 — Service Worker media cache has no eviction
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** unbounded storage growth.
- **Direction:** max entries/age/storage quota policy.

## OFF-017 — IndexedDB image cache has no eviction
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** media cache metadata + LRU/age/size budget.

## OFF-018 — Same images may be stored twice
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** IndexedDB blob cache + SW CacheStorage.
- **Impact:** device storage/memory waste.
- **Direction:** one media cache strategy.

## OFF-019 — Manual SW unregister/re-register on load
- **Priority:** P1 reliability
- **Status:** CONFIRMED
- **Evidence:** `index.html`.
- **Impact:** update/reload loops, loses standard PWA lifecycle benefits.
- **Direction:** stable build revision strategy; allow SW lifecycle to update safely.

## OFF-020 — Build changes aggressively clear localStorage/caches
- **Priority:** P1
- **Status:** CONFIRMED
- **Impact:** local user state can be unexpectedly lost while IndexedDB remains, creating mixed generations.
- **Direction:** explicit schema migrations/versioned caches, never “clear until it works”.

## OFF-021 — App error boundary clears cache for arbitrary React errors
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** masks software defects and destroys offline state unrelated to error.
- **Direction:** error reporting/recovery screen; cache reset as explicit troubleshooting option only.

## OFF-022 — “Online” equals `navigator.onLine`
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** network interface may exist while Supabase/provider is unreachable.
- **Direction:** connection state distinguishes browser connectivity, backend reachability and sync health.

## OFF-023 — New-content check only inspects latest class creation
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** new lesson/subject inside old class can be missed.
- **Direction:** server content revision/change feed.

## OFF-024 — Manual refresh syncs an incomplete domain set
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** general refresh loads classes/subjects/lessons but not the whole student content contract consistently.
- **Direction:** one sync engine with named scopes and revision result.

---

# 8. Media / Upload / Export

## MEDIA-001 — Mixed-file processing can reorder lesson pages
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** concurrent `processFiles()` pushes results by completion order.
- **Impact:** book/page sequence can be corrupted before upload/AI analysis.
- **Direction:** preserve original file index and PDF page index deterministically while processing concurrently.

## MEDIA-002 — PDF worker depends on external unpkg CDN
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** upload workflow depends on third-party network/CSP.
- **Direction:** bundle/self-host compatible PDF worker.

## MEDIA-003 — Unsupported files are passed through
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** late storage/AI failures.
- **Direction:** validate MIME/extension/size at selection and server boundary.

## MEDIA-004 — Compression failure silently falls back to original
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** huge files can proceed and fail later.
- **Direction:** explicit warning/size gate; fallback only if still within allowed bounds.

## MEDIA-005 — Two incompatible compression policies
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** one media profile: display, OCR/AI, thumbnail.

## MEDIA-006 — Note files stored as base64 strings
- **Priority:** P1 performance/storage
- **Status:** CONFIRMED
- **Impact:** ~33% expansion plus localStorage/IndexedDB memory pressure for image/audio.
- **Direction:** store Blob/File in IndexedDB object store; metadata row references blob key.

## MEDIA-007 — Audio note classified as image
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** preserve actual media type enum and renderer.

## MEDIA-008 — Note preview object URL cleanup needs normalization
- **Priority:** P2
- **Status:** cleanup path NOT YET VERIFIED everywhere
- **Direction:** shared media-preview hook always revokes on replace/unmount.

## EXPORT-001 — Raw HTML export interpolates unescaped content
- **Priority:** P1 security/correctness
- **Status:** CONFIRMED
- **Problem:** quiz/lesson/option strings are injected into HTML template.
- **Impact:** generated/admin content can alter export DOM or inject markup.
- **Direction:** escape/sanitize all text; structured template renderer.

## EXPORT-002 — Lesson-images export silently includes only first two images
- **Priority:** P1 product correctness
- **Status:** CONFIRMED
- **Impact:** “images only” export is incomplete without telling admin.
- **Direction:** export all selected images or explicitly offer an intentional limit option.

## EXPORT-003 — Export implementation carries old brand identity
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** shared new BrandConfig/print tokens/assets.

## EXPORT-004 — Export depends on remote logo
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** self-host asset and embed safely.

## EXPORT-005 — Heavy export dependencies load into admin feature bundle eagerly
- **Priority:** P2 performance
- **Status:** CONFIRMED pattern (`jsPDF`, XLSX/html export imports)
- **Direction:** dynamic import only when export flow opens/starts.

## EXPORT-006 — Code-card export hardcodes many colors/keyword mappings
- **Priority:** P3 design debt
- **Status:** CONFIRMED
- **Impact:** independent visual language outside future design system.
- **Direction:** print palette/token service derived from new identity.

## EXPORT-007 — Class-code CSV escaping is insufficient
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** comma/newline/quote in class name can break CSV.
- **Direction:** real CSV serializer/escaping.

---

# 9. Performance / Network / Runtime

## PERF-001 — Admin access codes load full table into browser
- **Priority:** P1
- **Status:** CONFIRMED
- **Problem:** batches up to 100k then client-side search/sort/page.
- **Impact:** latency/memory/network and Realtime refetch spikes.
- **Direction:** server pagination/filter/sort/count.

## PERF-002 — Access-code Realtime insert/delete refetches full collection
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** patch current page/counters or invalidate paginated query, not fetch entire table.

## PERF-003 — Admin lesson query defaults to very high limit
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** cursor/server pagination and summary projections.

## PERF-004 — “Load more” refetches first N rather than next page
- **Priority:** P2
- **Status:** CONFIRMED in large admin pages.
- **Impact:** repeated network transfer.
- **Direction:** cursor/page query.

## PERF-005 — Student lessons use N+1 subject lesson fetches
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** entitlement-aware content manifest/list projection, or batched query by subject IDs.

## PERF-006 — Student Realtime changes can trigger broad full refetches
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** revision/delta updates and scoped query invalidation.

## PERF-007 — Dashboard count logic fetches data rows instead of aggregates
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** aggregate RPC/view/count queries.

## PERF-008 — Multiple caches duplicate memory/network logic
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** simplify cache ownership per app.

## PERF-009 — Global CSS applies `will-change` broadly
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** unnecessary compositing/GPU memory/battery use.
- **Direction:** use only on truly animated elements and only during animation.

## PERF-010 — Excessive large shadows/backdrop blur on mobile
- **Priority:** P2
- **Status:** CONFIRMED static review
- **Impact:** rendering cost and visual noise on low-end devices.
- **Direction:** restrained elevation system; avoid persistent backdrop blur where not functional.

## PERF-011 — Large notes/media base64 memory footprint
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** Blob storage and lazy decode.

## PERF-012 — Cached images create Blob object URLs repeatedly
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** one cache layer, lifecycle-aware object URLs.

## PERF-013 — LazyImage custom memo comparator ignores relevant props
- **Priority:** P2 correctness/perf
- **Status:** CONFIRMED
- **Problem:** only src/className changes trigger rerender.
- **Impact:** stale alt/handler/other props.
- **Direction:** normal memo or complete comparator; prefer browser native lazy loading where sufficient.

## PERF-014 — Initial content preload can be extremely broad
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** incremental authorized manifest; prioritize current class/subject/next lessons, optional “download all available”.

## PERF-015 — Admin and student share one app/provider/dependency bundle
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** admin-only AI/export/upload dependencies and student offline contexts share deployment/runtime boundaries.
- **Direction:** separate admin-web and student-web applications with shared packages.

---

# 10. Admin Product / UX

## ADMIN-001 — Dashboard is not operational
- **Priority:** P1 product
- **Status:** CONFIRMED
- **Problem:** basic counts; activity/alerts are placeholders.
- **Direction:** real KPIs, AI job health, content publishing activity, activation/account activity, errors/alerts.

## ADMIN-002 — Security setting is mixed into dashboard
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** dedicated Settings > Security.

## ADMIN-003 — Flat navigation without domain grouping
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** Overview; Content; Assessments & AI; Students & Access; Communication; Reports; Settings.

## ADMIN-004 — Admin screens are visually card-heavy rather than task-dense
- **Priority:** P2
- **Status:** CONFIRMED static review
- **Direction:** stronger information hierarchy, tables/workbenches, restrained cards.

## ADMIN-005 — Core pages combine list + edit + dialogs + AI + export
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** route/workspace decomposition and reusable panels.

## ADMIN-006 — Accounts management fetches all students client-side
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** server pagination/search/filter.

## ADMIN-007 — Account “trial/status” semantics are inferred from legacy fields
- **Priority:** P2
- **Status:** CONFIRMED pattern / business label needs verification
- **Direction:** explicit account/entitlement status model.

## ADMIN-008 — Student account and code operations are split across screens
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** account detail shows entitlement sources, code history, last login, revoke/reset audit.

## ADMIN-009 — Notification management lacks audience/schedule/read model
- **Priority:** P2 improvement
- **Status:** CONFIRMED current limitation
- **Direction:** preserve global broadcast first; design extensible notification model for audience, schedule, expiry, CTA/read state.

## ADMIN-010 — Native `confirm()` used in professional admin flows
- **Priority:** P3 UX
- **Status:** CONFIRMED
- **Direction:** consistent destructive confirmation dialogs with consequences.

## ADMIN-011 — Very small helper text in admin UI
- **Priority:** P2 accessibility
- **Status:** CONFIRMED
- **Direction:** readable minimum type scale.

## ADMIN-012 — Notification header control appears non-functional
- **Priority:** P3
- **Status:** CONFIRMED static review
- **Direction:** only show actionable controls; connect to real alert center.

## ADMIN-013 — Code list exposes device fingerprint as operational UI detail
- **Priority:** P2 UX/security
- **Status:** CONFIRMED
- **Direction:** hide low-level fingerprint; show user/account/device session status only if genuinely useful.

## ADMIN-014 — Code-card export scope differs from list/Excel scope
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** card export may receive current page while Excel exports all.
- **Direction:** explicit scope selector: current page / filtered / selected / all.

---

# 11. Student Product / UX

## STUDENT-001 — Student shell is visually dense
- **Priority:** P2
- **Status:** CONFIRMED static review
- **Problem:** large hero cards, badges, shadows, footer/support and navigation compete for attention.
- **Direction:** calm mobile-first learning surface; fewer simultaneous calls to action.

## STUDENT-002 — LessonDetail control area is crowded
- **Priority:** P1 UX
- **Status:** CONFIRMED
- **Direction:** separate content tabs from reader preferences; preferences in compact sheet/menu.

## STUDENT-003 — Reader dark mode is page-local and defaults independently
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** persistent reader preference/design-system theme scoped appropriately.

## STUDENT-004 — Reader font/alignment/zoom preferences are not consistently persisted
- **Priority:** P2
- **Status:** CONFIRMED current state
- **Direction:** account/device reader preferences.

## STUDENT-005 — Student footer/support repeated on all pages
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** move support/account contact into menu/help surface; keep learning screens uncluttered.

## STUDENT-006 — Notification badge is not real unread state
- **Priority:** P2
- **Status:** CONFIRMED static behavior
- **Direction:** local/server last-seen/read model.

## STUDENT-007 — Notification polling duplicates broader sync concepts
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** notification repository/change feed.

## STUDENT-008 — Every notification is visually treated as important
- **Priority:** P3 UX
- **Status:** CONFIRMED
- **Direction:** notification severity/type hierarchy.

## STUDENT-009 — Onboarding copy is stale vs navigation/features
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** references old names/routes/code semantics.
- **Direction:** onboarding content generated from canonical feature/navigation metadata or maintained adjacent to routes.

## STUDENT-010 — Returning-login/device wording contradicts PRD/account intent
- **Priority:** P1 product consistency
- **Status:** CONFIRMED
- **Direction:** decide account portability/recovery policy and write one UX contract.

## STUDENT-011 — Full-access student can still see class-code redemption path
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** entitlement page adapts to account state; no redundant activation action.

## STUDENT-012 — Recovery UI reveals original password
- **Priority:** P1 security/UX
- **Status:** CONFIRMED
- **Direction:** reset/recovery, not reveal.

## STUDENT-013 — PWA installation status mixed between server profile and device local state
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** prompt can be suppressed on another device incorrectly.
- **Direction:** install prompt dismissal/installation is device-local; server profile should not own it unless per-device records exist.

## STUDENT-014 — PWA browser fallback lacks strong iOS/Safari guidance
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** browser-specific install help when native prompt unavailable.

## STUDENT-015 — Offline status disappears while still offline
- **Priority:** P2 UX
- **Status:** CONFIRMED
- **Direction:** subtle persistent state plus sync details when relevant.

---

# 12. Design System / Identity / Accessibility

## DESIGN-001 — Identity is scattered/hardcoded
- **Priority:** P1 for rebrand
- **Status:** CONFIRMED
- **Evidence:** index, manifest, layouts, footer, export, code cards, colors.
- **Direction:** central BrandConfig + local assets + tokenized design system.

## DESIGN-002 — Remote Miaoda-hosted brand assets
- **Priority:** P1 reliability/branding
- **Status:** CONFIRMED
- **Direction:** self-host production logos/icons/fonts/assets with cache/version control.

## DESIGN-003 — Excessive gradients/radii/shadows
- **Priority:** P2
- **Status:** CONFIRMED static review
- **Direction:** restrained hierarchy; semantic elevation and radius scale.

## DESIGN-004 — Hardcoded colors bypass semantic tokens
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** semantic design tokens only for product UI; exceptions documented.

## DESIGN-005 — Dark tokens coexist with hardcoded white surfaces
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** incomplete dark theme.
- **Direction:** either properly support theme via tokens or intentionally ship one theme; no half-state.

## DESIGN-006 — No verified global theme provider despite theme dependency
- **Priority:** P3
- **Status:** CONFIRMED search / final intended theme NOT YET VERIFIED
- **Direction:** remove unused dependency or implement coherent theme system.

## A11Y-001 — Pinch zoom disabled
- **Priority:** P1
- **Status:** CONFIRMED
- **Evidence:** viewport `maximum-scale=1.0,user-scalable=no`.
- **Direction:** allow browser zoom.

## A11Y-002 — 8–10px body/helper text
- **Priority:** P1/P2
- **Status:** CONFIRMED
- **Direction:** accessible Arabic type scale; minimum readable sizes.

## A11Y-003 — No verified reduced-motion handling
- **Priority:** P2
- **Status:** CONFIRMED gap
- **Direction:** `prefers-reduced-motion` and non-essential animation reduction.

## A11Y-004 — Hover-dependent controls exist
- **Priority:** P2
- **Status:** CONFIRMED in admin quiz/list patterns
- **Impact:** poor touch/keyboard discoverability.
- **Direction:** visible/focusable action menus.

## A11Y-005 — Focus/keyboard full-path audit missing
- **Priority:** P1 release verification
- **Status:** NOT YET VERIFIED
- **Direction:** keyboard traversal and screen-reader audit across auth, admin forms, lesson reader, quiz.

## A11Y-006 — Contrast audit incomplete
- **Priority:** P1 release verification
- **Status:** NOT YET VERIFIED
- **Direction:** automated + manual WCAG contrast checks against new tokens.

## A11Y-007 — Global overscroll behavior disables native interaction
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** only disable where app interaction genuinely requires it.

---

# 13. PWA / Deployment / Infrastructure

## DEPLOY-001 — README says Vite PWA/Workbox, runtime uses manual SW
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** one PWA implementation and matching docs.

## DEPLOY-002 — Manifest icons are external URLs
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** local properly sized maskable icons.

## DEPLOY-003 — BrowserRouter hosting rewrite not codified
- **Priority:** P1 deployment
- **Status:** repository config missing / host state NOT YET VERIFIED
- **Impact:** direct deep-link refresh can 404 on static hosting without rewrite.
- **Direction:** deployment config per chosen host with SPA fallback and headers.

## DEPLOY-004 — Security headers not version-controlled
- **Priority:** P1
- **Status:** repo missing / host state NOT YET VERIFIED
- **Direction:** CSP, HSTS, frame policy, referrer policy, permissions policy in deployment config.

## DEPLOY-005 — Production topology is undocumented/ambiguous
- **Priority:** P1 handover
- **Status:** CONFIRMED documentation gap
- **Direction:** architecture/runbook: domains, frontend host, Supabase project, functions, secrets, backups, monitoring, rollback.

## DEPLOY-006 — Cloudflare Worker production role unknown
- **Priority:** P2
- **Status:** NOT YET VERIFIED
- **Direction:** either remove dead infrastructure artifact or formally own/deploy/test it.

## DEPLOY-007 — External CDN dependencies in core runtime
- **Priority:** P2
- **Status:** CONFIRMED
- **Examples:** PDF worker, old brand assets.
- **Direction:** self-host/bundle critical assets.

---

# 14. Build / Type Safety / QA / Git

## QA-001 — No automated test suite
- **Priority:** P0/P1 release gate
- **Status:** CONFIRMED
- **Direction:** unit/domain + integration + RLS authorization + E2E critical flows.

## QA-002 — No CI workflow
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** GitHub Actions required checks.

## QA-003 — Verification shell chain is not fail-fast
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** independent scripts + `&&`/fail-fast; CI executes all required checks.

## QA-004 — TypeScript checker is not full strict
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** strict mode migration with measured fixes.

## QA-005 — Typecheck excludes UI components
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** full src compile.

## QA-006 — Biome recommended lint disabled
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** sensible recommended baseline with intentional exceptions.

## QA-007 — `dev`/`build` scripts intentionally disabled
- **Priority:** P2
- **Status:** CONFIRMED
- **Impact:** standard developer/release workflow is broken/host-specific.
- **Direction:** real `dev`, `build`, `typecheck`, `lint`, `test`, `test:e2e` scripts.

## QA-008 — README contradicts scripts
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** generated/verified setup guide.

## QA-009 — React runtime/type package major versions mismatch
- **Priority:** P2
- **Status:** CONFIRMED
- **Problem:** React 18 runtime with React 19 types.
- **Direction:** align runtime/type versions before strict migration.

## QA-010 — Preview TypeScript checker dependency
- **Priority:** P2
- **Status:** CONFIRMED
- **Direction:** stable TypeScript compiler/toolchain for production checks unless preview has a documented required reason.

## QA-011 — Vite dependency points at floating `latest` vendor alias
- **Priority:** P2
- **Status:** CONFIRMED package contract
- **Direction:** pin supported stable Vite/build versions; lockfile is not enough policy for future installs.

## QA-012 — Miaoda development tooling remains in production config path
- **Priority:** P2
- **Status:** CONFIRMED config; production effect NOT YET VERIFIED
- **Direction:** isolate development-only plugins by mode or remove after platform migration.

## QA-013 — No branch protection/required checks at audit start
- **Priority:** P2
- **Status:** CONFIRMED at audit time
- **Direction:** protect main after CI is trustworthy.

## QA-014 — No migration reset/authorization test in CI
- **Priority:** P0/P1
- **Status:** CONFIRMED gap
- **Direction:** create clean Supabase test DB from migrations and run anon/studentA/studentB/admin policy matrix.

## QA-015 — No AI golden regression tests
- **Priority:** P1
- **Status:** CONFIRMED gap
- **Direction:** test prompt versions/models on fixed Arabic/science/math/exam fixtures.

## QA-016 — No offline upgrade/account-switch E2E suite
- **Priority:** P1
- **Status:** CONFIRMED gap
- **Direction:** Playwright/browser tests: online→offline, install/update, account reset, content deletion, storage quota.

## QA-017 — No performance budgets
- **Priority:** P2
- **Status:** CONFIRMED gap
- **Direction:** bundle budgets + Lighthouse/Web Vitals + low-end-device scenarios.

## QA-018 — No accessibility gate
- **Priority:** P2
- **Status:** CONFIRMED gap
- **Direction:** axe automated checks + manual keyboard/reader acceptance.

---

# 15. Documentation / Product Contract Drift

## DOC-001 — PRD and current password/device behavior conflict
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** decide product rule, document once, implement/auth test.

## DOC-002 — PRD says reset clears all local data; implementation does not
- **Priority:** P1
- **Status:** CONFIRMED
- **Direction:** make reset contract explicit and tested.

## DOC-003 — README PWA architecture is inaccurate
- **Priority:** P2
- **Status:** CONFIRMED

## DOC-004 — README development commands conflict with package scripts
- **Priority:** P2
- **Status:** CONFIRMED

## DOC-005 — Onboarding copy references retired navigation/features
- **Priority:** P2
- **Status:** CONFIRMED

## DOC-006 — Code comments frequently describe behavior no longer true
- **Priority:** P2
- **Status:** CONFIRMED examples: sync-later/no-op sync, authenticated storage policy, cache semantics.
- **Direction:** comments explain invariants/why, not stale implementation history.

## DOC-007 — No documented production schema snapshot
- **Priority:** P1
- **Status:** CONFIRMED gap

## DOC-008 — No operational runbook/rollback/backups/secret rotation guide
- **Priority:** P1 handover
- **Status:** CONFIRMED gap

---

# 16. New Product Architecture Classification

## KEEP

- Core educational product idea.
- Student/Admin role split.
- Class → Subject → Lesson hierarchy.
- 6-digit full-access activation concept (subject to final business confirmation).
- 7-digit class activation concept.
- Admin class/subject/lesson/quiz/content management.
- AI-assisted summaries/questions/extraction/quizzes/exam replication.
- Quiz multiple versions.
- Lesson reader and interactive practice.
- Student local notes/saved questions.
- Notifications.
- Statistics/achievements/ranking concept.
- Offline-first student experience.
- PWA installability.
- Excel/PDF/card exports.
- Supabase platform unless later deployment evidence requires otherwise.

## IMPROVE

- Dashboard information architecture.
- Student navigation/reader hierarchy.
- Forms, validation, tables, empty/error/loading states.
- Query pagination and aggregates.
- Media quality and upload feedback.
- Notification model.
- Accessibility and responsive behavior.
- Visual identity.

## REFACTOR

- Frontend feature modules.
- Shared quiz engine.
- Admin lesson/quiz builders.
- Data repositories.
- Export system.
- Cache/sync code.
- PWA lifecycle.
- Media processing.

## REBUILD — Targeted / Required

- Authentication/recovery model.
- Authorization/RLS matrix.
- Entitlement/code redemption model.
- Student ownership/FKs.
- AI job/runtime/key/project orchestration.
- Offline authorization/content manifest.
- Release/test pipeline.

## REMOVE — only after caller/migration verification

- anonymous admin password RPC.
- plaintext/reversible password storage/reveal.
- duplicate AuthContext.
- retired subject activation tables/functions/Edge Function.
- obsolete device-recovery compatibility functions after migration window.
- dead cache/preload/request utilities.
- no-op pending-sync architecture if notes/bookmarks remain local-only.
- Miaoda-specific production dependencies/artifacts not required after migration.

---

# 17. Release Gates for the Rebuilt Product

The rebuilt system is not considered ready until all are true:

1. **Feature parity matrix is 100% accounted for** — preserved, intentionally improved or explicitly retired with reason.
2. Fresh database from repository migrations passes.
3. Authorization matrix passes for anon / student A / student B / admin / service worker functions.
4. No retrievable plaintext student/admin passwords in application DB/UI.
5. Server-side entitlement blocks direct unauthorized lesson/quiz/storage access.
6. Activation and class-code redemption are atomic/idempotent under concurrency tests.
7. Student account reset/logout/data deletion behavior is verified online/offline.
8. Shared PracticeEngine resume/scoring tests pass.
9. AI golden dataset passes structural + semantic acceptance thresholds.
10. AI jobs survive closing browser and provider transient failure.
11. Credential/project failover is observable and does not bypass provider quota policy.
12. Offline sync handles adds/updates/deletes/entitlement changes and partial failures.
13. No stale account data leaks after account switching/reset.
14. Admin and student apps meet bundle/performance budgets.
15. Keyboard/zoom/contrast/reduced-motion/touch-target acceptance passes.
16. CI runs typecheck, lint, unit, integration, RLS, build and E2E smoke.
17. Main is protected by required checks.
18. Staging deployment is built only from repository source/migrations/secrets configuration.
19. Monitoring/error reporting/AI-job observability are live.
20. Deployment/rollback/backup/secret-rotation runbooks are documented.

---

# 18. Verification Boundary

This catalog is intentionally aggressive and source-based. It is much broader than the initial audit, but it still cannot truthfully claim that no additional issue exists until the following are exercised:

- deployed production Supabase schema/policies/functions;
- real secrets/quota/project configuration;
- real browsers/PWA install/update/offline flows;
- actual data volume/query plans;
- runtime build/type/lint output;
- end-to-end admin/student workflows;
- accessibility assistive technology;
- low-end mobile performance/network throttling;
- AI output quality on representative production lesson material.

Any issue discovered in those verification stages must be added here rather than hidden as an implementation detail.
