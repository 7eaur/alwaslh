# STUDENT V2 — EXECUTION LOG

Date opened: 2026-09-14
Branch: `ux/student-experience-v2`
PR: `#58`
Status: **ACTIVE / DRAFT PR**

## Why this workstream exists

The Student application was functionally advanced but its UI/UX foundation showed systemic problems: editorial/newspaper-like page structure, repeated explanatory copy, oversized headings, duplicated navigation, card/border overuse, weak hierarchy, inconsistent app chrome, excessive vertical space, weak mobile safe-area handling, and route transitions that felt static.

The user approved a full Student Experience V2 foundation before future backend surfaces are fully connected.

## Approved product decisions

- keep the four primary phone destinations: Home / Learn / Practice / Library;
- Home shows the official الوسيلة الذكية mark + name;
- other top-level pages show page title in the App Bar;
- nested pages use shared App Bar context instead of duplicate giant page headings when possible;
- generic greeting only; do not assume learner name;
- no fixed learner grade on Home/account card;
- move useful Library summary statistics to Home when backed by real data;
- Library itself becomes direct access, not a dashboard article;
- Learn must scale to many subjects, units and lessons;
- Reader is focused and content-first;
- Practice architecture exposes real quiz versions as models without inventing a separate backend authority;
- future Summary / Lesson Questions / Notes / Saved / Review are placed in the architecture but are not fabricated before backend/ownership contracts exist.

## Approved visual decisions

- neutral-first composition;
- teal used for brand/action/selected state rather than every title/border;
- Cairo-first typography contract;
- unified outline icon registry;
- restrained radius/shadows;
- no gradients/glow/glass/3D app chrome;
- functional motion only;
- safe-area aware bottom navigation;
- 44px minimum touch targets;
- reduced-motion respected.

## Approved code decisions

Canonical code architecture is documented in `docs/product/STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`.
Mandatory implementation rules are documented in `docs/product/STUDENT_V2_IMPLEMENTATION_RULES.md`.

> Shared once, feature-owned locally, page files stay thin.

No page/feature may continue growing into a routing + API + cache + storage + large JSX monolith.

## Approved data/cache decisions

Canonical policy: `docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`.

- profile-scoped in-memory read-through cache;
- request deduplication;
- curriculum TTL 2 minutes;
- quiz catalog TTL 1 minute;
- recent attempts TTL 30 seconds;
- counts derived from loaded read models;
- cache is cleared for the active profile on logout/session expiry;
- Stage16 offline package store remains the single lesson-download storage path;
- Notes/Saved/Needs Review target account-scoped IndexedDB once Stage17 ownership rules are explicit;
- no durable curriculum/quiz snapshot database until revision/tombstone/delta semantics are authoritative.

## Foundation implemented

- Student V2 theme/foundation layer;
- shared Student icon boundary;
- shared runtime cache;
- Home rebuilt away from duplicate destination cards;
- Home uses only real curriculum/quiz/attempt/download data;
- App Bar contract + safe-area bottom navigation;
- access-change cache invalidation;
- session-end cache clearing.

## Code architecture extraction

Created and wired:

- `app/layout/student-navigation.ts`
- `app/layout/StudentAppBar.tsx`
- `app/layout/StudentBottomNav.tsx`
- `app/layout/StudentDesktopNav.tsx`
- `app/layout/StudentAppShell.tsx`
- `app/routing/student-route-meta.ts`
- `app/session/StudentSessionStates.tsx`
- `shared/brand/StudentBrandLockup.tsx`
- `shared/icons/StudentIcon.tsx`
- `shared/data/student-runtime-cache.ts`
- `shared/ui/FeatureLoading.tsx`
- `shared/ui/Surface.tsx`
- `shared/ui/SectionHeader.tsx`
- `shared/ui/StatStrip.tsx`
- `shared/ui/ListRow.tsx`
- `shared/ui/FormAlert.tsx`
- `shared/ui/LoadingSpinner.tsx`
- `shared/ui/EmptyState.tsx`
- `features/home/StudentHomeOverview.tsx`

`student-access.tsx` is now primarily a route/feature orchestrator instead of owning shell, navigation, Home data and Home UI.

## Entry/Auth V2

`features/auth/StudentEntryExperience.tsx` is wired from `App.tsx` and `router.tsx` and owns Welcome, Activation, Login, forced password change, Recovery, Help and Support while preserving the existing secure auth/device-proof contracts.

`student-entry-v2.css` provides the current V2 entry/auth visual layer: simpler welcome, smaller hierarchy, calmer surfaces and mobile-safe spacing.

The old root `student-entry.tsx` remains temporarily until reference/test cleanup is safe.

## Account / Library / secondary surfaces V2

New feature-owned surfaces are wired:

- `features/account/StudentAccountExperience.tsx`
- `features/library/StudentLibraryExperience.tsx`
- `features/notifications/StudentNotificationsExperience.tsx`
- `features/progress/StudentProgressExperience.tsx`

Account no longer promotes logout at the top, does not assume a learner display name, and groups access/class-code/help with logout at the bottom. The feature no longer receives an unused profile object.

Library is direct access to Downloads / Notes / Saved / Needs Review and no longer repeats an article-style overview/dashboard. Future personal collections stay honest empty states until their contracts exist.

Notifications and Progress are intentionally honest future surfaces; no fabricated counts/progress are shown.

## Learn / Subject V2

Implemented modular learning ownership:

- `features/learn/StudentLearningExperience.tsx`
- `features/learn/useStudentCurriculum.ts`
- `features/learn/LearnLanding.tsx`
- `features/learn/SubjectPage.tsx`

Behavior now scales progressively:

- curriculum reads use the shared profile-scoped cache instead of refetching on every route change;
- subject search appears only when useful;
- subject lists stay compact rather than becoming a card wall;
- sectioned subjects use accordion disclosure;
- unsectioned lessons remain direct rows;
- lesson summary badge appears only when a real summary exists;
- nested subject title can populate the shared App Bar;
- offline lesson deep links preserve Stage16 stored Reader behavior.

## Reader V2

`student-reader-v2.css` is wired as the current focused visual layer while the Reader behavior remains compatible with Stage16 integrity/offline semantics.

Current improvements include smaller hierarchy, calmer reading width, better image/text sizing, safe-area handling, focused offline state, search and listening affordance polish, and no global bottom navigation while reading.

Reader implementation ownership remains partly legacy-flat and must not be aggressively moved until exact-head Stage16/Reader gates remain green.

## Practice V2 structural migration

The large assessment implementation is being split into feature-owned units instead of adding more code to `student-assessment.tsx`.

Created:

- `features/practice/practice-model.ts` — routes, hrefs, formatting and catalog state;
- `features/practice/PracticeCatalog.tsx` — catalog, adaptive filters and quiz/model detail;
- `features/practice/AssessmentAttempt.tsx` — focused attempt, answer feedback, result/review flow;
- `features/practice/StudentPracticeExperience.tsx` — route/data orchestration.

`student-access.tsx` now routes the live Practice destination to `StudentPracticeExperience` and passes `profileId` so quiz/attempt read models share the same profile-scoped cache used elsewhere.

Practice data behavior:

- quiz catalog reads use the shared 60-second cache;
- recent attempts use the shared 30-second cache;
- cached values can render immediately during navigation;
- force refresh remains available for explicit refresh;
- successful attempt completion invalidates attempt summaries so Home/Practice cannot keep stale scores;
- real quiz `versions` are presented as learner-facing `نماذج` without inventing an unsupported backend entity.

The old `student-assessment.tsx` still exists temporarily as legacy structural debt until exact-head compile/tests show the modular path is stable and any direct imports can be safely removed or reduced to a compatibility boundary.

## PR #57 / Stage16 reconciliation — IMPLEMENTED ON V2 BRANCH

PR #57 (`stage16/student-016i`) was inspected file-by-file before reconciliation. Its security/runtime behavior was ported into the V2 architecture rather than overwriting V2 files.

Preserved and integrated:

- offline startup may recover only a bounded local presentation profile from the durable verified `profileId + deviceId` scope;
- no synthetic server session/token is created;
- an offline lesson deep link can enter the stored Reader path without requiring online curriculum;
- `StudentOfflineLessonReaderPage` uses `loadUsableOfflineLessonPackage(...)` and renders only after existing lease/scope/signature/time/blob checks pass;
- verified stored image bytes use temporary object URLs;
- invalid/tampered/expired packages fail closed;
- Downloads expose `فتح الدرس` directly;
- the persistent-profile real-Chromium cold-start Reader test was added;
- Stage16 CI runs that cold-start test with the existing lease/materialization browser tests.

## CI repair log

Exact-head CI is treated as source of truth, not as a final afterthought.

Recent blockers and repairs:

1. `exactOptionalPropertyTypes` error in Learn error-state props — repaired.
2. Account `_profile` unused lint error — removed the unused profile prop entirely.
3. session-end cache clear imported through shared boundary but not re-exported — `clearStudentRuntimeCache` is now exported through `shared/data/student-runtime-cache.ts`.

Fresh exact-head workflows are required after each repair. No superseded failed run is treated as current evidence.

## Current order

1. V2-00 architecture freeze — DONE.
2. Foundation / shell / Home — IMPLEMENTED / VERIFICATION ACTIVE.
3. Shared layout/primitives extraction — IMPLEMENTED / VERIFICATION ACTIVE.
4. Welcome/Auth — IMPLEMENTED / VERIFICATION ACTIVE.
5. Stage16 reconciliation — IMPLEMENTED / VERIFICATION ACTIVE.
6. Learn/Subject scalable hierarchy — IMPLEMENTED / VERIFICATION ACTIVE.
7. Reader visual/interaction V2 — IMPLEMENTED PARTIALLY / VERIFICATION ACTIVE.
8. Practice/Models — STRUCTURAL MIGRATION ACTIVE.
9. final secondary-surface polish and legacy-file cleanup.
10. local personal data after Stage17 contracts.
11. durable read-model caching when contracts allow.
12. full visual/performance/a11y QA.

## Verification state

The branch remains **NOT YET VERIFIED** until the latest exact-head lint/typecheck/build/tests and relevant Chromium/mobile/RTL/safe-area visual checks are green.

## Done criteria

No V2 batch is `DONE` until it has executable evidence: lint/typecheck/build/tests plus relevant browser/mobile/RTL/safe-area/visual verification.
