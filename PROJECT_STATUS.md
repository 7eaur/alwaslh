# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL BACKEND ROADMAP: PAUSED FOR PRODUCT/UX FOUNDATION**

**ACTIVE TRACK: STUDENT FUTURE-COMPLETE SURFACES + FRONTEND SPLITTING + INTERACTION AFFORDANCE**

**ACTIVE PR: #54 — `feat(student): prebuild future Library notifications and progress surfaces`**

**ADMIN B06–B14: DEFERRED / SUPERSEDED-PENDING-ADMIN-ADR.** Dedicated Super Admin Product Rebuild owns Admin architecture and UX.

## Verified merged baseline

Student Experience Rebuild PR #53 is **CLOSED / VERIFIED / MERGED**.

- exact accepted head: `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- exact-head workflow matrix: **23/23 SUCCESS**;
- phone/desktop Visual QA accepted;
- live `main` after merge: `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

Preserved authority:

- API/PostgreSQL canonical;
- Auth/Authz/Entitlements server-owned;
- Assessment scoring/finalization server-owned;
- published immutable Quiz authority unchanged;
- `/v1` excluded from Service Worker Cache authority;
- signed offline authorization/integrity/device/session contracts unchanged;
- no password/session token/device private key persisted as offline learning data.

## Product Owner direction now active

No production learner will use the Student app before the remaining roadmap is complete.

Therefore the final UI/IA for approved future capabilities may be built now before backend connection, under one hard rule:

**Build the final surface now; connect authoritative data later.**

Prebuilt UI may show honest empty/zero-data states. It must never fabricate notes, unread counts, progress percentages, scores, statistics, achievements, ranking, streaks, recommendations or unsupported account/security behavior.

Canonical docs:

- `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
- `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`

## Interaction affordance rule — active

The Student app now has a binding usability rule:

**Anything clickable must look clickable before the learner touches it; anything static must not visually compete with an action.**

Implementation:

- `student-affordance.css` is the shared Student interaction layer;
- primary actions use the strongest filled treatment;
- secondary actions use a visible bordered treatment;
- lightweight actions still receive a button-like surface instead of looking like ordinary body text;
- clickable cards use pointer/focus/press states and a consistent directional cue;
- Library tabs have clear active/inactive states and touch targets;
- Account logout is visually separated as a destructive action;
- important interactive labels use the approved teal hierarchy while descriptive text remains neutral;
- hover is enhancement only; phone users receive the same clarity without relying on hover;
- keyboard `focus-visible` is preserved and strengthened;
- disabled actions remain visibly disabled and non-clickable;
- reduced-motion behavior remains preserved.

The design target is not “make everything look like a button.” The target is **action hierarchy**: primary, secondary, contextual, destructive, then static information.

## PR #54 implementation

Current Student structure:

- four-item mobile navigation: `الرئيسية / التعلّم / التدريب / مكتبتي`;
- `/app/library` overview;
- `/app/library/downloads` using the existing Stage16 Downloads implementation;
- `/app/library/notes` honest empty pre-integration surface;
- `/app/library/saved` honest empty pre-integration surface;
- `/app/library/review` honest empty pre-integration surface;
- `/app/downloads` retained as compatibility route;
- app-bar Notifications action + `/app/notifications` honest zero-data feed state;
- `/app/progress` pre-integration Learning/Practice/Achievements composition without fake metrics;
- Home points to Learn / Practice / Library with secondary Progress / Notifications;
- Account is the personal management hub for access/class-code + Library/Progress/Notifications + Help/Support + logout;
- future Reader/Assessment integration flows for Notes/Saved/Needs Review specified before Stage17 backend work;
- responsive RTL styling and existing subtle motion/reduced-motion contract extended to all new surfaces;
- interaction affordance layer makes clickable cards, tabs, buttons and contextual actions visibly distinct from static information.

## Performance architecture — verified

The Student app is split now instead of allowing future screens to accumulate in one initial JS bundle.

`student-access.tsx` uses feature-level `React.lazy` / `Suspense` for:

- Learn/Reader;
- Practice/Assessment;
- Library/personal surfaces;
- Account.

Home/Shell remains immediately available. Loading copy is learner-facing: `جاري فتح الصفحة`.

Production-build evidence after splitting:

- **initial main JS: 225.89 kB minified / 71.24 kB gzip**;
- Account chunk: 7.91 kB / 2.57 kB gzip;
- Learn/Reader chunk: 13.85 kB / 4.09 kB gzip;
- Assessment chunk: 22.58 kB / 6.10 kB gzip;
- Future/Library chunk: 25.81 kB / 7.56 kB gzip;
- Assessment feature CSS chunk: 15.90 kB / 3.04 kB gzip;
- shared initial CSS: 62.02 kB / 10.89 kB gzip.

Before splitting, the same expanded app produced a single main JS chunk of approximately **599.61 kB / 148.83 kB gzip**. The initial JS payload is therefore materially smaller and Vite no longer reports the >500 kB main-chunk warning on the verified build.

## Current verification evidence

Before the final affordance refinement:

- Student lint/typecheck/unit/build: SUCCESS;
- 11 Student unit files / 41 tests: SUCCESS;
- feature-level chunks emitted as expected;
- B01/B02/B03/B04/B05 Student browser paths passed on the prior exact head;
- Stage14/Stage16 passed on the prior exact head;
- B05 produced 28 phone/desktop Visual QA screenshots for the future surfaces.

Manual review of those screenshots identified a usability gap: some actionable links/cards were technically clickable but visually too close to static content. That evidence directly produced the new `student-affordance.css` layer and stronger Library/Progress/Account CTAs.

Because the affordance changes move the branch head, all final acceptance evidence must be taken from the new exact head.

## Required acceptance before PR #54 merge

1. exact-head lint/typecheck/unit/build;
2. B01/B02/B03/B04/B05 browser regressions;
3. Stage14/15/16 + Rebuild verification;
4. all other triggered workflows SUCCESS;
5. regenerate and manually inspect B05 phone + desktop Visual QA after affordance changes;
6. verify clickable cards/actions are visually distinct without making static cards look interactive;
7. no horizontal overflow;
8. production-copy scanner remains clean;
9. `prefers-reduced-motion` remains valid;
10. verify live main/base before merge and use exact expected-head guard.

## Not completed by this PR

These surfaces are prebuilt, but their authoritative service implementations remain future roadmap work:

- Stage17 Notes/Saved/Needs Review data and CRUD/sync/provenance contracts;
- Stage18 Notifications feed/unread/deep-link contracts;
- Stage19 Progress/Statistics/Achievements formulas/data/privacy contracts;
- true cold-start offline Reader authority at `STUDENT-016I`;
- unsupported self-service Account security/preferences controls.

## Normal backend-roadmap return

After Student/shared refoundation and Admin synchronization:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

The difference now is that Stage17–19 should connect real contracts into already-established UI/IA instead of restructuring the Student application again.
