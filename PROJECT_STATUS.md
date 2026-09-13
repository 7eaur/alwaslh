# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL BACKEND ROADMAP: PAUSED FOR PRODUCT/UX FOUNDATION**

**ACTIVE TRACK: STUDENT LIBRARY OVERVIEW REFINEMENT**

**ACTIVE PR: #55 — `refactor(student): redesign Library overview hierarchy`**

**ADMIN B06–B14: DEFERRED / SUPERSEDED-PENDING-ADMIN-ADR.** Dedicated Super Admin Product Rebuild owns Admin architecture and UX.

## Verified merged baseline

Student Future Surfaces PR #54 is **CLOSED / VERIFIED / MERGED**.

- exact accepted head: `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- exact-head workflow matrix: **23/23 SUCCESS**;
- phone/desktop Visual QA accepted;
- live `main` after merge: `c3734366c132ea3919a925bdd0dd37cfd5d82104`.

The merged Student IA contains:

- primary mobile destinations `الرئيسية / التعلّم / التدريب / مكتبتي`;
- Library with Downloads / Notes / Saved / Needs Review placements;
- Notifications and Progress future-complete surfaces without fabricated data;
- Account as personal-management hub;
- destination-level lazy loading;
- interaction-affordance rule with >=44px touch targets;
- learner-safe copy and reduced-motion behavior.

Preserved authority:

- API/PostgreSQL canonical;
- Auth/Authz/Entitlements server-owned;
- Assessment scoring/finalization server-owned;
- published immutable Quiz authority unchanged;
- `/v1` excluded from Service Worker Cache authority;
- signed offline authorization/integrity/device/session contracts unchanged;
- no password/session token/device private key persisted as offline learning data.

## Active PR #55 — Library overview redesign

Branch: `ux/student-library-overview`

Base: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`

Problem identified from the actual merged UI:

- `/app/library` repeated the same four destinations in a horizontal tab bar and again as large cards;
- the page behaved as a section switcher rather than a useful personal overview;
- repeated navigation increased visual weight and made the overview less elegant.

Implemented target hierarchy:

1. concise Library heading;
2. `ملخص مكتبتي` with honest statistics;
3. one clear `أقسام مكتبتي` destination grid;
4. one explicit return-to-Library action inside child sections instead of repeating all destination tabs.

### Statistics truth

- **Downloads count** is read from the existing offline lesson package store for the active profile/device.
- Browser acceptance performs a real lesson save then requires the overview count to change from `٠` to `١`.
- Notes / Saved / Needs Review currently show honest zero states because Stage17 repositories are not yet integrated.
- No fake progress, activity, streaks, recommendations, achievements or engagement numbers are introduced.

### Visual rules

- summary statistics are one quiet information panel with internal dividers, not four dashboard cards;
- no decorative gradient is used;
- statistic cells are intentionally non-clickable;
- only destination cards use strong clickable affordance and directional cues;
- phone uses a compact 2×2 statistics layout and one-column destination list;
- desktop keeps the summary readable at a glance with destination cards below;
- duplicate Library tabs are removed.

Canonical decision document:

- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

## Verification state

Latest candidate head before this documentation synchronization:

`fa6c1a74005f07c802925706be3c2df35e29eb1d`

Verified on its immediate predecessor / same product implementation:

- Student lint: SUCCESS;
- Student typecheck: SUCCESS;
- 11 unit test files / 41 tests: SUCCESS;
- Student production build: SUCCESS.

A B05 Chromium run initially failed because legacy `offline-download.e2e.spec.mjs` still searched for the removed exact `التنزيلات` tab and old Library heading. The application behavior was not the failure. The test was updated to follow the new clickable Library destination card while preserving all offline integrity assertions.

Because the test and this documentation moved the branch head, **final exact-head CI and Visual QA are still required before merge**.

## Required acceptance before PR #55 merge

1. exact-head lint/typecheck/unit/build;
2. B01/B02/B03/B04/B05 browser regressions;
3. Stage14/15/16 + Rebuild verification;
4. all other triggered workflows SUCCESS;
5. inspect new phone + desktop Library overview screenshots;
6. verify no duplicate Library tab navigation;
7. verify real saved-download statistic updates after download;
8. verify summary cells remain visually static while destination cards remain clearly clickable;
9. no horizontal overflow;
10. learner-copy scanner and reduced-motion acceptance remain clean;
11. verify live `main`, PR mergeability and exact expected head before merge.

## Remaining roadmap authority

PR #55 does **not** implement future backend/service ownership for:

- Stage17 Notes / Saved / Needs Review CRUD, provenance, ownership and sync;
- Stage18 Notifications feed/unread/deep-link contracts;
- Stage19 Progress/Statistics/Achievements contracts;
- true cold-start offline Reader at `STUDENT-016I`;
- unsupported self-service Account security/preferences controls.

Normal backend-roadmap return remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`
