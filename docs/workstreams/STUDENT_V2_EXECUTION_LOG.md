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
- nested pages use back + entity title;
- generic greeting only; do not assume learner name;
- no fixed learner grade on Home/account card;
- move useful Library summary statistics to Home when backed by real data;
- Library itself becomes direct access, not a dashboard article;
- Learn must scale to many subjects, units and lessons;
- Reader is focused and content-first;
- Practice architecture reserves direct access to models/versions;
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

Canonical code architecture is documented in:

`docs/product/STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`

Mandatory implementation rules are documented in:

`docs/product/STUDENT_V2_IMPLEMENTATION_RULES.md`

Key rule:

> Shared once, feature-owned locally, page files stay thin.

No page/feature may continue growing into a routing + API + cache + storage + large JSX monolith.

## Approved data/cache decisions

Canonical policy:

`docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`

Current direction:

- profile-scoped in-memory read-through cache;
- request deduplication;
- curriculum TTL 2 minutes;
- quiz catalog TTL 1 minute;
- recent attempts TTL 30 seconds;
- counts derived from loaded read models;
- Stage16 offline package store remains the single lesson-download storage path;
- Notes/Saved/Needs Review target account-scoped IndexedDB once Stage17 ownership rules are explicit;
- no durable curriculum/quiz snapshot database until revision/tombstone/delta semantics are authoritative.

## Code already started on this branch

- Student V2 theme/foundation layer introduced;
- shared Student icon registry introduced;
- shared runtime cache introduced;
- Home rebuilt away from the duplicate destination-card wall;
- Home reads real curriculum/quiz/attempt/download data only;
- App Bar contract started;
- bottom navigation refined with safe-area ownership;
- relevant cache invalidation started for access changes.

## 2026-09-14 — first code-architecture extraction batch

The implementation moved from the flat `student-access.tsx` ownership model toward the approved V2 boundaries.

Created:

- `app/layout/student-navigation.ts`
- `app/layout/StudentAppBar.tsx`
- `app/layout/StudentBottomNav.tsx`
- `app/layout/StudentDesktopNav.tsx`
- `app/layout/StudentAppShell.tsx`
- `app/routing/student-route-meta.ts`
- `shared/ui/FeatureLoading.tsx`
- `features/home/StudentHomeOverview.tsx`

`student-access.tsx` was reduced to route/feature orchestration and no longer owns the App Bar, Bottom Navigation, adaptive navigation, route metadata, Home data loading or Home presentation.

No Learn/Reader implementation was rewritten in this batch because PR #57 still owns overlapping Stage16 offline Reader changes.

## 2026-09-14 — shared primitives + entry/auth extraction batch

The second extraction batch continued the same architecture instead of adding more code to legacy flat files.

Shared boundaries added:

- `shared/icons/StudentIcon.tsx` — shared icon import boundary;
- `shared/data/student-runtime-cache.ts` — shared cache import boundary;
- `shared/brand/StudentBrandLockup.tsx` — one brand lockup using the official app icon asset;
- `shared/ui/Surface.tsx`;
- `shared/ui/SectionHeader.tsx`;
- `shared/ui/StatStrip.tsx`;
- `shared/ui/ListRow.tsx`;
- `shared/ui/FormAlert.tsx`;
- `shared/ui/LoadingSpinner.tsx`.

Home now composes `StatStrip`, `SectionHeader` and `ListRow` instead of manually reproducing those structures.

Shell App Bar / Bottom Nav / Desktop Nav now consume the shared icon boundary, and the App Bar/Desktop Nav consume the shared brand lockup.

Session loading/unavailable/offline views were extracted from `App.tsx` to:

`app/session/StudentSessionStates.tsx`

A new modular entry/auth feature was created at:

`features/auth/StudentEntryExperience.tsx`

It owns:

- Welcome;
- Activation;
- Login;
- forced password-change flow;
- Recovery;
- Help;
- Support;
- public Help/Support pages.

`App.tsx` and `router.tsx` now route through this V2 auth feature instead of the legacy `student-entry.tsx` implementation. The legacy file remains temporarily for safe incremental removal after reference/test audit.

A new visual override layer `student-entry-v2.css` reduces editorial spacing, removes the welcome feature-list wall, shrinks auth hierarchy, uses calmer surfaces, and improves mobile safe-area spacing without changing backend/auth contracts.

This batch also preserves the existing auth/device-proof/security flow; it only changes ownership/composition and UX copy/presentation.

## Workstream overlap

PR #57 (`stage16/student-016i`) is still the authoritative active workstream for true cold-start offline Reader behavior and changes overlapping files including `App.tsx`, `student-learning.tsx`, `student-reader.tsx`.

Rule: do not rewrite overlapping Learn/Reader files in V2 until #57 is reconciled. Preserve its authorization/integrity/offline behavior.

## Current order

1. V2-00 architecture freeze — DONE.
2. V2-01 foundation / shell / Home — IN PROGRESS.
3. shared layout/primitives extraction — ACTIVE.
4. Welcome/Auth redesign — ACTIVE / V2 FEATURE WIRED.
5. PR #57 reconciliation.
6. Learn/Subject scalable hierarchy.
7. Reader.
8. Practice/Models.
9. Library/Account/secondary surfaces.
10. local personal data.
11. durable read-model caching when contracts allow.
12. full visual/performance/a11y QA.

## Verification state

The workstream remains **NOT YET VERIFIED** until the latest exact-head CI finishes and relevant browser/mobile/RTL/safe-area visual checks are complete.

## Done criteria

No V2 batch is `DONE` until it has executable evidence: lint/typecheck/build/tests plus relevant browser/mobile/RTL/safe-area/visual verification.
