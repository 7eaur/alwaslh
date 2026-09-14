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

This is the first concrete application of:

> shared layout once + thin page/orchestrator + feature-owned UI/data composition.

No Learn/Reader implementation was rewritten in this batch because PR #57 still owns overlapping Stage16 offline Reader changes.

Latest implementation head after extraction: `8e88bc02a1130c1dfa603460edafa3d73b057c82`.

CI for that exact head was triggered and is pending/queued; this batch is **NOT YET VERIFIED** until the relevant workflows finish green.

## Workstream overlap

PR #57 (`stage16/student-016i`) is still the authoritative active workstream for true cold-start offline Reader behavior and changes overlapping files including `App.tsx`, `student-learning.tsx`, `student-reader.tsx`.

Rule: do not rewrite overlapping Learn/Reader files in V2 until #57 is reconciled. Preserve its authorization/integrity/offline behavior.

## Current order

1. V2-00 architecture freeze — DONE.
2. V2-01 foundation / shell / Home — IN PROGRESS.
3. shared layout/primitives extraction — STARTED.
4. Welcome/Auth redesign.
5. PR #57 reconciliation.
6. Learn/Subject scalable hierarchy.
7. Reader.
8. Practice/Models.
9. Library/Account/secondary surfaces.
10. local personal data.
11. durable read-model caching when contracts allow.
12. full visual/performance/a11y QA.

## Done criteria

No V2 batch is `DONE` until it has executable evidence: lint/typecheck/build/tests plus relevant browser/mobile/RTL/safe-area/visual verification.
