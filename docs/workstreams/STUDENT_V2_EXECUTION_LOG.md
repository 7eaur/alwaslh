# STUDENT V2 — EXECUTION LOG

Date opened: 2026-09-14
Branch: `ux/student-experience-v2`
PR: `#58`
Status: **CLOSURE / DRAFT PR — CORE IMPLEMENTATION VERIFIED ON `1dd6222...`; DOCUMENTATION-HEAD CI REQUIRED BEFORE MERGE**

## Why this workstream exists

The Student application was functionally advanced but its UI/UX foundation showed systemic problems: editorial/newspaper-like page structure, repeated explanatory copy, oversized headings, duplicated navigation, card/border overuse, weak hierarchy, inconsistent app chrome, excessive vertical space, weak mobile safe-area handling, and route transitions that felt static.

The approved goal was a clean Student Experience V2 foundation that can accept future backend capabilities without another redesign.

## Approved product decisions

- primary phone destinations: Home / Learn / Practice / Library;
- Home shows the official الوسيلة الذكية mark + name;
- other top-level pages show page title in the App Bar;
- nested pages use shared App Bar title context where appropriate;
- generic greeting only; do not assume learner name;
- no fixed permanent grade identity on Home/account card;
- Home shows useful real overview data, not duplicate navigation;
- Library = direct access, not a dashboard article;
- Learn scales to many subjects/units/lessons;
- Reader is focused and content-first;
- active assessment is a focused task flow;
- real quiz versions are presented as learner-facing `نماذج` without creating a second backend authority;
- future Summary / Lesson Questions / Notes / Saved / Needs Review are never fabricated before real contracts/data exist.

## Approved visual decisions

- neutral-first composition;
- teal for brand/action/selected state rather than every title/border;
- Cairo-first typography contract;
- unified outline icon registry;
- restrained radius/shadows;
- no gradients/glow/glass/3D app chrome;
- functional motion only;
- safe-area-aware bottom navigation;
- >=44px touch targets;
- `prefers-reduced-motion` respected.

## Approved code decisions

Canonical code architecture: `docs/product/STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`.
Mandatory rules: `docs/product/STUDENT_V2_IMPLEMENTATION_RULES.md`.

Direction:

`app → features → shared`

Rule:

> Shared once, feature-owned locally, page/orchestrator files stay thin.

No page/feature may grow into a routing + API + cache + storage + large JSX monolith.

## Approved data/cache decisions

Canonical policy: `docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`.

- curriculum memory TTL: 2 minutes;
- quiz catalog TTL: 1 minute;
- recent attempts TTL: 30 seconds;
- cache is profile-scoped;
- concurrent duplicate reads are deduplicated;
- access changes invalidate affected read models;
- successful assessment completion invalidates attempt summaries;
- cache is cleared for the active profile on logout/session expiry;
- Downloads reuses the shared curriculum cache rather than creating a separate catalog request path;
- Stage16 offline package store remains the single lesson-download authority;
- Notes/Saved/Needs Review stay deferred until Stage17 ownership/synchronization rules are authoritative;
- no durable generic `/v1` response cache as hidden business authority.

## Foundation / shell / Home

Implemented and wired:

- Student V2 theme/foundation layer;
- shared Student icon boundary;
- shared brand boundary;
- shared runtime cache;
- App Shell / App Bar / Bottom Nav / Desktop Nav;
- route metadata and session states;
- shared loading/empty/alert/surface/list/stat primitives;
- Home V2 using available authoritative curriculum/quiz/attempt/download data only.

`student-access.tsx` is now primarily app-level route/feature orchestration rather than shell + navigation + Home + data ownership.

## Entry/Auth V2

`features/auth/StudentEntryExperience.tsx` owns:

- Welcome;
- Activation;
- Login;
- forced temporary-password change;
- Recovery;
- Help;
- Support.

The secure auth/device-proof contracts were preserved. The replaced root `student-entry.tsx` compatibility implementation was removed after consumers/tests were migrated.

## Account / Library / secondary surfaces

Feature-owned surfaces:

- `features/account/StudentAccountExperience.tsx`
- `features/library/StudentLibraryExperience.tsx`
- `features/notifications/StudentNotificationsExperience.tsx`
- `features/progress/StudentProgressExperience.tsx`

Account does not assume a learner name and keeps logout as a subdued bottom action.

Library now directly exposes Downloads / Notes / Saved / Needs Review. Future personal collections remain honest empty states until their contracts exist.

Downloads now:

- keep Stage16 as the only offline package authority;
- reuse shared profile-scoped curriculum caching;
- expose `فتح الدرس` directly for verified stored lessons;
- are consumed through `features/library/StudentOfflineDownloads.tsx` feature boundary while security-critical storage/materialization internals remain unchanged.

Obsolete `student-library-overview.css` was removed. `student-future.css` was pruned to selectors still used by loading, desktop secondary navigation and embedded Downloads.

## Learn / Subject V2

Implemented modular ownership:

- `features/learn/StudentLearningExperience.tsx`
- `features/learn/useStudentCurriculum.ts`
- `features/learn/LearnLanding.tsx`
- `features/learn/SubjectPage.tsx`

Behavior:

- shared profile-scoped curriculum cache;
- subject search only when useful;
- compact subject lists instead of card wall;
- unit/section accordion disclosure;
- unsectioned lessons remain direct rows;
- summary badge only when a real summary exists;
- nested subject title can populate shared App Bar;
- offline lesson deep links preserve Stage16 stored Reader behavior.

## Reader V2

`student-reader-v2.css` is the current focused visual layer.

Current behavior includes:

- smaller hierarchy and calmer reading width;
- image/text sizing tuned for reading;
- safe-area handling;
- focused Reader without global bottom navigation;
- explicit offline status + `فتح التنزيلات` recovery action;
- existing search/listening affordances retained;
- verified stored-content path remains fail-closed.

A `features/reader` boundary now fronts the Reader for feature ownership. The security-critical implementation remains partly in root modules intentionally; further file movement is not required merely for directory aesthetics if it would add Stage16 regression risk.

## Practice / Models V2

Practice was split from the old root monolith into:

- `features/practice/practice-model.ts`
- `features/practice/PracticeCatalog.tsx`
- `features/practice/AssessmentAttempt.tsx`
- `features/practice/StudentPracticeExperience.tsx`

The old `student-assessment.tsx` monolith was removed after executable evidence proved the feature-owned path was live.

Data behavior:

- quiz catalog uses shared 60-second cache;
- recent attempts use shared 30-second cache;
- cached values can render immediately during navigation;
- successful attempt completion invalidates attempt summaries;
- real quiz `versions` are shown as `نماذج`.

## Practice visual QA closure

B04 visual artifacts were inspected manually, not just accepted because Chromium passed.

An actual phone-layout issue was found in the attempt screen: previous/next actions, remaining-question status and finish action compressed/touched each other at `390px`.

The V2 layout was repaired by:

- using stable grid composition for step actions;
- separating finish state from finish CTA;
- stacking finish content on narrow screens;
- making the finish CTA full-width on phone;
- adding a smaller breakpoint for previous/next stacking when needed.

The later exact-head artifact on `1dd6222...` was inspected and the overlap is gone in both attempt and result screens.

## PR #57 / Stage16 reconciliation

PR #57 (`stage16/student-016i`) behavior was reconciled into V2 instead of overwriting V2 architecture.

Preserved:

- bounded local presentation recovery from durable verified `profileId + deviceId` scope;
- no synthetic server session/token;
- offline lesson deep link to verified stored Reader;
- signature/scope/time/blob integrity checks;
- verified stored images use temporary object URLs;
- tampered/expired packages fail closed;
- direct `فتح الدرس` from Downloads;
- persistent-profile real-Chromium cold-start/tamper/isolation/time-bound acceptance;
- Stage16 workflow gates cold-start Reader behavior.

## Legacy cleanup completed

Removed/replaced structural compatibility files after reference/test evidence:

- root `student-assessment.tsx` monolith;
- old root Account/Entry/Learning/Future-surface compatibility implementations that no longer had live consumers;
- temporary root icon/cache wrappers;
- obsolete Library overview CSS.

Remaining legacy-style files are not automatically dead. Some still carry selectors used by Reader/Downloads/session/assessment integration and must only be removed with reference + browser evidence.

## CI repair history

Evidence-backed fixes included:

1. `exactOptionalPropertyTypes` mismatch in Learn error-state prop;
2. unused Account profile dependency;
3. missing cache-clear export through shared boundary;
4. focused Reader offline assertion mismatch;
5. outdated acceptance selectors/copy that still targeted the pre-V2 design;
6. Practice visual overlap found from screenshot review rather than test failure.

A Stage12 AI-control failure (`expected 'retrying', actual undefined`) was outside Student UI. No Student contract was modified for it; a later exact-head Stage12 run completed successfully.

## Exact-head verification

Last fully verified implementation head before documentation-only synchronization:

`1dd6222bc21cab615ca9b93416666bfa16d1bf04`

Successful Student workflows on that exact head:

- `UX B01 Shared Frontend Foundation`
- `UX B02 Student Shell and Navigation`
- `UX B03 Student Learning and Reader`
- `UX B04 Student Practice and Assessment`
- `UX B05 Student Downloads and Account`
- `Stage14 Student Product`
- `Stage15 Student Assessment`
- `Stage16 Student PWA`

Stage14 Student lint/typecheck/unit/build passed. Its real Chromium auth/access/curriculum acceptance at `390px` also passed.

B04 exact-head visual artifact was manually inspected after the phone-layout fix.

Therefore:

`STUDENT V2 CORE IMPLEMENTATION = VERIFIED ON 1dd6222...`

Documentation-only synchronization commits after that head still require normal exact-head CI before PR #58 is merged.

## Current order

1. V2-00 architecture freeze — DONE.
2. Foundation / shell / Home — DONE / VERIFIED.
3. Shared layout/primitives — DONE / VERIFIED.
4. Welcome/Auth — DONE / VERIFIED.
5. Stage16 reconciliation — DONE / VERIFIED.
6. Learn/Subject scalable hierarchy — DONE / VERIFIED.
7. Reader focused V2 — DONE FOR CURRENT CONTRACT / VERIFIED.
8. Practice/Models modular migration — DONE / VERIFIED.
9. secondary surfaces + legacy cleanup — DONE FOR CURRENT CONTRACT / VERIFIED.
10. Stage17 local personal data — DEFERRED UNTIL AUTHORITATIVE CONTRACTS.
11. durable catalog/read-model snapshots — DEFERRED UNTIL REVISION/TOMBSTONE/DELTA SEMANTICS EXIST.
12. final documentation-head CI / PR readiness — ACTIVE.

## Closure criteria

PR #58 may leave Draft only when:

- documentation-sync exact head has no evidence-backed regression;
- required repository checks are green;
- PR remains mergeable;
- no new code drift appeared after the verified implementation head.

After merge, resume the Student roadmap from the next unclosed backend/product stage. Do not redesign the approved V2 foundation without new evidence.
