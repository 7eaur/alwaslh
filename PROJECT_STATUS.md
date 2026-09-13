# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current state

**ACTIVE TRACK: Stage16 Student Offline Runtime**

**ACTIVE BATCH: `STUDENT-016I` — true cold-start offline Reader**

**ACTIVE BRANCH: `stage16/student-016i`**

**BASE: `main@343ff1fd7b3d64d7e990b72606695365f520fa58`**

PR #55 is no longer active. It was merged and verified before this branch was created.

## Latest verified merged baseline

### PR #55 — Student Library Overview Refinement

- **MERGED / VERIFIED**;
- accepted exact head: `8ceb4d5a5f70f7896f6cb358e05605479942d442`;
- exact-head GitHub Actions: **23/23 SUCCESS**;
- B05 Chromium Visual QA artifact inspected and accepted at phone + desktop sizes;
- duplicate Library tabs absent;
- real saved-download statistic verified `٠ → ١`;
- stale B02 Library-heading acceptance was corrected without relaxing navigation/focus/history/offline/no-overflow behavior;
- merge commit / current Stage16 base: `343ff1fd7b3d64d7e990b72606695365f520fa58`.

The accepted Library now has one summary-first overview, one destination grid, honest Downloads data and zero-state future collections.

## Student merged product baseline

Already merged and verified before `STUDENT-016I`:

- Welcome / Activation / Login / Recovery / Help / Support;
- Home / Learn / Subject / Reader;
- Practice / Quiz / Assessment / Result;
- primary navigation: `الرئيسية / التعلّم / التدريب / مكتبتي`;
- Library / Notifications / Progress / Account surfaces;
- learner-safe errors, reduced-motion support and >=44px interaction targets;
- destination-level lazy loading;
- real protected offline package materialization with bounded lease, signed authorization and SHA-256 integrity.

Initial Student feature-level code splitting remains approximately **225.89 KB minified / 71.24 KB gzip** for the main initial chunk. Do not regress this by eagerly importing feature trees into the shell.

## `STUDENT-016I` verified discovery

The older Stage16 handoff understated current implementation. Direct inspection of post-PR55 `main` proves these security primitives already exist and must be preserved rather than rebuilt:

1. **Durable non-secret scope recovery exists**
   - active `profileId + deviceId` scope is persisted in `localStorage`;
   - old sessionStorage key is cleaned;
   - malformed scope fails closed.
2. **Read-time signed authorization exists**
   - stored lesson use re-verifies ES256/P-256 authorization against the canonical manifest;
   - profile/device/class/package/scope/expiry bounds are rechecked on use.
3. **Read-time blob integrity exists**
   - stored assets are rechecked for byte size + SHA-256 before use;
   - malformed/tampered records deny use.
4. **The real remaining gap was runtime integration**
   - `App.tsx` previously blocked the entire app before the Student shell when offline;
   - `student-learning.tsx` required an online curriculum catalog before reaching a lesson route;
   - `student-reader.tsx` did not materialize a verified stored package into the Reader;
   - Downloads had no direct learner action to open a saved lesson.

## `STUDENT-016I` implementation in progress

Implemented on `stage16/student-016i`:

- bounded offline shell restoration from the durable Student scope when server bootstrap cannot be reached;
- no fake server session: the offline profile is derived only from the previously verified local Student scope and is used to enter a restricted offline presentation path;
- direct offline lesson routing without requiring the online curriculum catalog;
- Reader loading through `loadUsableOfflineLessonPackage(...)`, preserving lease + signature + time + blob-integrity checks;
- local image rendering through object URLs created only after package verification;
- learner-safe denial state when a saved package cannot be verified;
- explicit `فتح الدرس` action for saved Downloads;
- new real-Chromium cold-start acceptance using a persistent browser profile.

### New browser acceptance contract

`apps/student-web/e2e/offline-reader-cold-start.e2e.spec.mjs` is designed to prove:

`download online → cache app shell → remove HTTP session cookie → close Chromium → relaunch same browser profile → set network offline → deep-link to saved lesson → verify Reader content`.

The same acceptance also exercises read-time denial for:

- corrupted stored ES256 signature;
- same-size stored blob corruption;
- different profile scope;
- different device scope;
- client clock rollback beyond tolerance;
- signed authorization expiry.

`Stage16 Student PWA` CI now includes this test in the real-Chromium offline-client gate.

## Verification state — current branch

Implementation commits exist, but the new branch has **not yet completed PR exact-head CI**.

Current status:

- code inspection — COMPLETE for bootstrap / learning route / Reader / downloads / offline security primitives;
- implementation — IN PROGRESS / first coherent batch committed;
- local runtime execution in this environment — NOT YET VERIFIED;
- exact-head GitHub Actions — NOT YET VERIFIED;
- merge readiness — **NO** until the new Stage16 browser gate and full triggered matrix are green.

## Exact next action

1. finish documentation synchronization for `STUDENT-016I`;
2. open a focused PR from `stage16/student-016i` to `main`;
3. inspect exact-head CI, especially `Stage16 Student PWA`;
4. if type/lint/browser failures appear, fix the owning contract rather than weakening acceptance;
5. require the cold-start Chromium test to prove restart + no-session-cookie + offline Reader + denial cases;
6. inspect any visual/runtime artifact if produced;
7. merge only with expected-head SHA guard after exact-head acceptance;
8. then continue roadmap at `STUDENT-016R`.

## Roadmap after `016I`

`STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

- `016R` — reconnect revalidation/purge;
- `016S` — revision/tombstone/cursor/delta synchronization;
- conditional `016O` — bounded outbox only if future offline writes require it;
- `016G` — Stage16 closure matrix;
- Stage17 — authoritative Notes / Saved / Needs Review;
- Stage18 — Notifications authority;
- Stage19 — trusted Progress / Statistics / Achievements.

Super Admin rebuild remains a separate workstream.

## Required startup for next conversation

Read in order:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`
8. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`

Then live-check `main`, the active Stage16 PR and exact-head CI before editing.
