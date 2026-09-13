# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL BACKEND ROADMAP: PAUSED FOR PRODUCT/UX FOUNDATION**

**ACTIVE TRACK: STUDENT FUTURE-COMPLETE SURFACES + FRONTEND SPLITTING**

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
- responsive RTL styling and existing subtle motion/reduced-motion contract extended to all new surfaces.

## Performance architecture

The Student app is being split now instead of allowing future screens to accumulate in one initial JS bundle.

`student-access.tsx` uses feature-level `React.lazy` / `Suspense` for:

- Learn/Reader;
- Practice/Assessment;
- Library/personal surfaces;
- Account.

Home/Shell remains immediately available. Loading copy is learner-facing: `جاري فتح الصفحة`.

Before lazy splitting, the expanded future-surface build reached approximately **599.61 kB minified / 148.83 kB gzip** in one main JS chunk. A new production build on the documentation-complete head must verify the split output before this workstream is accepted.

## Current verification evidence

On the initial PR #54 code head before lazy splitting:

- Student lint/typecheck/unit/build: SUCCESS;
- 11 Student unit files / 41 tests: SUCCESS;
- PostgreSQL migrations in B02/B05: SUCCESS;
- B05 Chromium + expanded future-surface Visual QA: SUCCESS;
- B02 desktop scenario: SUCCESS;
- B02 mobile scenario found only a strict Playwright selector ambiguity because both the app-bar bell and Home card contain `الإشعارات`; selector corrected to the exact app-bar accessible name.

Because lazy splitting + documentation changed the branch afterward, those results are not final acceptance evidence. The next exact-head matrix is authoritative.

## Required acceptance before PR #54 merge

1. exact-head lint/typecheck/unit/build;
2. confirm production build emits route/feature chunks and reduces initial main bundle materially;
3. B01/B02/B03/B04/B05 browser regressions;
4. Stage14/15/16 + Rebuild verification;
5. all other triggered workflows SUCCESS;
6. phone + desktop Visual QA for Library overview/downloads/notes/saved/review, Notifications, Progress and Account;
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
