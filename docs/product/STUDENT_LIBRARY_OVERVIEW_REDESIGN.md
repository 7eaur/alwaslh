# Student Library Overview Redesign

Date: 2026-09-13
Status: **ACTIVE — PR #55 / FINAL EXACT-HEAD CI + VISUAL QA PENDING**

Branch: `ux/student-library-overview`

## Decision

`/app/library` is a personal overview, not a duplicate section switcher.

The previous composition repeated the same destinations in a horizontal tab bar and again as large cards. The redesign removes that duplicate navigation from the overview and uses this hierarchy:

1. concise Library heading;
2. honest personal summary/statistics;
3. one clear collection grid for Downloads, Notes, Saved, and Needs Review;
4. one back-to-Library action inside child sections instead of repeating all destinations above child content.

## Data integrity

- Download count is read from the existing offline lesson package store for the active device/profile.
- Browser acceptance must perform a real lesson save and require the overview Downloads count to change from `٠` to `١`.
- Notes, Saved, and Needs Review currently display zero because their Stage17 personal-learning repositories are not yet integrated.
- No fake progress, activity, recommendations, streaks, achievements or engagement numbers are introduced.
- When Stage17 lands, these three summary metrics must be connected to the authoritative personal-learning repositories instead of remaining static.

## UX rules

- Summary statistics are informational and must not look clickable.
- Use one quiet divided summary surface rather than four separate KPI cards.
- Collection cards are destinations and must look clickable before hover.
- Do not add a second navigation control that repeats the same four Library destinations on the overview.
- Child surfaces keep a single obvious route back to the Library overview.
- Mobile keeps a compact 2×2 summary and one-column destination list.
- Desktop keeps the statistics readable at a glance with destination cards below.
- No decorative gradient or dashboard/card-wall styling.
- Existing global interaction rules remain: >=44px touch targets, clear focus/pressed states and reduced-motion support.

## Implementation ownership

Primary files:

- `apps/student-web/src/student-future-surfaces.tsx`
- `apps/student-web/src/student-library-overview.css`
- `apps/student-web/src/main.tsx`
- `apps/student-web/e2e/student-b05.e2e.spec.mjs`
- `apps/student-web/e2e/offline-download.e2e.spec.mjs`

Do not duplicate Downloads business/storage/integrity authority in the overview. The overview reads the existing package store only for its real count.

## Verification already obtained

Before the latest documentation/test synchronization:

- Student lint — SUCCESS;
- strict typecheck — SUCCESS;
- unit tests — 11 files / 41 tests SUCCESS;
- production build — SUCCESS.

An initial B05 Chromium failure was caused by an old test targeting the intentionally removed Library tab/old heading. The stale selector was updated to the new Library destination while preserving offline integrity assertions.

## Final merge gate

Before PR #55 can merge:

1. live-check current PR head and `main`;
2. require exact-head triggered workflow matrix to be green;
3. inspect regenerated B05 phone/desktop Visual QA;
4. verify duplicate Library tabs are absent;
5. verify real Downloads stat updates `0 → 1`;
6. verify statistic cells remain static/non-clickable;
7. verify collection cards remain clearly clickable;
8. verify responsive/no-overflow/copy/reduced-motion checks;
9. merge only with expected-head SHA guard after acceptance.

If a test fails, classify real product regression versus stale test before changing the UI.