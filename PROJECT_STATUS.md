# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current state

**ACTIVE TRACK: Student Library Overview Refinement**

**ACTIVE PR: #55 — `refactor(student): redesign Library overview hierarchy`**

**ACTIVE BRANCH: `ux/student-library-overview`**

**BASE WHEN OPENED: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`**

PR #55 is **OPEN** and was mergeable at the latest live inspection. Live-check current head/base/mergeability before merge.

Normal backend roadmap remains paused until this Student UX batch is closed.

## Verified merged Student baseline

### PR #53 — Student Experience Rebuild

- MERGED / VERIFIED;
- exact accepted head `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- **23/23 workflows SUCCESS**;
- merge commit `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

### PR #54 — Future Student Surfaces

- MERGED / VERIFIED;
- exact accepted head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- **23/23 workflows SUCCESS**;
- phone/desktop Visual QA accepted;
- merge commit / current merged baseline `c3734366c132ea3919a925bdd0dd37cfd5d82104`.

Merged Student foundation now includes:

- Welcome / Activation / Login / Recovery / Help / Support;
- Home / Learn / Subject / Reader;
- Practice / Quiz / Assessment / Result;
- final primary navigation: `الرئيسية / التعلّم / التدريب / مكتبتي`;
- Library / Notifications / Progress / Account prebuilt surfaces;
- learner-safe error copy;
- restrained motion + reduced-motion support;
- strong interaction affordance + >=44px touch targets;
- destination-level lazy loading;
- no fabricated future learner data.

## Performance state

Accepted Student feature-level code splitting reduced the initial main bundle from roughly:

- **599.61 KB minified / 148.83 KB gzip**

to roughly:

- **225.89 KB minified / 71.24 KB gzip**

with Learn, Assessment, Library/personal surfaces and Account split into on-demand chunks.

Do not regress this by eagerly importing destination feature trees back into the Student shell.

## Active PR #55 — Library Overview redesign

### Problem

The merged `/app/library` repeated the same destinations twice:

- horizontal section tabs;
- destination cards.

This created unnecessary repetition and weakened the idea of a useful personal overview.

### Approved target hierarchy

1. concise Library heading;
2. `ملخص مكتبتي` with honest statistics;
3. one `أقسام مكتبتي` destination grid;
4. child sections use one clear `العودة إلى مكتبتي` action instead of repeating the full destination navigation.

Collections:

- التنزيلات;
- ملاحظاتي;
- المحفوظات;
- يحتاج مراجعة.

### Statistics authority

- Downloads count is real and read from the existing offline package store for the active profile/device.
- Browser acceptance saves a real lesson then requires Downloads count to change `٠ → ١`.
- Notes / Saved / Needs Review remain honest zero states until Stage17 authoritative repositories exist.
- No fake progress/activity/streak/recommendation/achievement/engagement metrics.

### Visual rules

- one quiet divided summary surface, not separate dashboard KPI cards;
- no decorative gradient;
- statistic cells are static/non-clickable;
- destination cards are clearly clickable;
- phone: compact 2×2 statistics + one-column destination list;
- desktop: one-glance summary + destination grid;
- duplicate Library tabs removed.

Canonical decision:

- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

## Verification state — PR #55

Local/targeted implementation verification recorded before the latest exact-head pass:

- Student lint — SUCCESS;
- strict typecheck — SUCCESS;
- unit tests — **11 files / 41 tests SUCCESS**;
- production build — SUCCESS.

### Exact-head CI inspection — `aca9a2f72ecede120d1d87889f9a3fb0660ea712`

Triggered matrix result: **20/23 workflows SUCCESS**.

Failures:

- `UX B02 Student Shell and Navigation`;
- `Stage14 Student Product`;
- `Rebuild Stage Verification`.

Failure classification:

- B02 quality/build/migrations/Chromium setup all passed; its browser step failed because `student-shell-navigation.e2e.spec.mjs` still expected the intentionally removed Library heading `كل ما يخص تعلمك في مكان واحد`.
- PR #55 intentionally replaced that heading with `محتواك الشخصي، مرتب في مكان واحد` as part of the approved Library hierarchy.
- Stage14 quality passed and failed only in `npm run test:e2e`.
- Rebuild Stage Verification backend/build/migration jobs passed and failed only in the Stage8 browser `npm run test:e2e` job.
- Both aggregate workflows execute the same full Playwright suite, so the stale B02 expectation necessarily makes them red as well.
- No evidence from this matrix indicates a backend, PostgreSQL, auth, access, curriculum, assessment or offline-integrity regression.

Fix applied:

- `apps/student-web/e2e/student-shell-navigation.e2e.spec.mjs` now asserts the approved current Library heading while preserving navigation, focus, history, offline-state and no-overflow assertions.
- This is a test-contract alignment, not a relaxation of product acceptance.

Because the branch head moved after the fix and documentation synchronization, **a fresh exact-head 23/23 matrix is required**. Do not merge using evidence from `aca9a2f...`.

## Exact next action

1. live-fetch the new PR #55 head and unchanged/changed `main`;
2. require all exact-head triggered workflows to complete SUCCESS;
3. inspect the exact-head B05 Chromium artifact and phone/desktop Visual QA;
4. verify no duplicate Library tabs;
5. verify saved-download statistic updates `0 → 1` after a real download;
6. verify stats are visually static and destination cards clearly clickable;
7. verify responsive/no-overflow/reduced-motion/learner-copy checks;
8. if all triggered workflows are SUCCESS and Visual QA is accepted, update final evidence then merge PR #55 using expected-head SHA guard;
9. after merge, return immediately to normal roadmap at `STUDENT-016I`.

## Remaining roadmap after PR #55

The future surfaces are prebuilt, but their service/backend ownership is not complete.

Return sequence:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

Still open:

- true cold-start offline Reader / remaining Stage16 authority;
- Stage17 Notes / Saved / Needs Review CRUD, provenance, ownership, offline/sync;
- Stage18 Notifications feed/unread/deep links/lifecycle;
- Stage19 trusted Progress/Statistics/Achievements;
- unsupported self-service Account security/preferences;
- Super Admin rebuild remains a separate workstream.

## Required startup for next conversation

Read in order:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

Then live-check PR #55 / `main` / CI before editing.
