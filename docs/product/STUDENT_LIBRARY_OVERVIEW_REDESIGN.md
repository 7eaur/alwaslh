# Student Library Overview Redesign

## Decision

`/app/library` is a personal overview, not a duplicate section switcher.

The previous composition repeated the same destinations in a horizontal tab bar and again as large cards. The redesign removes that duplicate navigation from the overview and uses this hierarchy:

1. concise Library heading;
2. honest personal summary/statistics;
3. one clear collection grid for Downloads, Notes, Saved, and Needs Review;
4. one back-to-Library action inside child sections instead of repeating all destinations above child content.

## Data integrity

- Download count is read from the existing offline lesson package store for the active device/profile.
- Notes, Saved, and Needs Review currently display zero because their Stage17 personal-learning repositories are not yet integrated.
- No fake progress, activity, recommendations, or engagement numbers are introduced.
- When Stage17 lands, these three summary metrics must be connected to the authoritative personal-learning data source instead of remaining static.

## UX rules

- Summary/stat cards are informational and must not look clickable.
- Collection cards are destinations and must look clickable before hover.
- Do not add a second navigation control that repeats the same four Library destinations on the overview.
- Child surfaces keep a single obvious route back to the Library overview.
- Mobile keeps a compact 2x2 stat grid and one-column destination list.
- Desktop keeps the statistics in one glance and the destination grid below it.

## Verification

Required before merge:

- Student lint, typecheck, unit tests, build;
- B05 real Chromium suite;
- phone and desktop visual QA;
- no horizontal overflow;
- saved-download statistic updates from 0 to 1 after a real lesson download in the browser test;
- interaction affordance and 44px touch-target rules remain valid.
