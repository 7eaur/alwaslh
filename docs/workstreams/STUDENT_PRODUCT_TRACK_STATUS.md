# STUDENT PRODUCT TRACK STATUS — Stage14+

> Branch-specific continuation checkpoint for the parallel Student Product track.

Last synchronized: **2026-09-10 — Stage14 discovery complete; canonical Student Access UX verified; entitlement-filtered curriculum contract is the active batch.**

## Track Identity

- Repository: `7eaur/alwaslh`
- Branch: `parallel/stage14-student-product`
- Current documented code HEAD before this documentation commit: `9197469d5c012f0786e871080e669e562d837422`
- Initial stable baseline: `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Shared execution ledger: GitHub Issue #16
- Operating contract: `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`

## Current Stage

**Stage14 — Student Web/PWA Product**

State: **IN PROGRESS — DISCOVERY COMPLETE / ACCESS BATCH VERIFIED / CURRICULUM CONTRACT ACTIVE**

Stage8 Student Activation remains a verified foundation, not evidence that Stage14 learning-product outcomes are complete.

## Repository Discovery — Verified Findings

### Current Student product shape

`apps/student-web` was inspected directly. At the Stage14 baseline it was primarily the Stage8 activation/login/recovery/device experience plus a post-login entitlement list. It did not yet provide a study shell, curriculum navigation, lesson reader, practice, personal-learning data, notifications, progress, manifest, or service worker.

### Auth / session / device

- Student activation, returning login, forced password change, recovery support, session restoration and device rebind are implemented against real backend contracts.
- The device private key is a non-extractable P-256 `CryptoKey` stored in IndexedDB and scoped by the Student account identifier.
- The browser does not own canonical session or entitlement state.
- Offline startup does not pretend that an unverified private session is online-valid.

Classification: **KEEP + IMPROVE**.

### Access / entitlements

- Canonical Student endpoints exist for active entitlements and code redemption.
- Six-digit codes grant/renew all-content access; seven-digit codes grant/renew class access.
- The backend prevents wasting a class code when an active all-content entitlement already exists.
- Stage14 now exposes real seven-digit class-code redemption, Arabic/Eastern-Arabic digit normalization, idempotent requests, explicit loading/offline/error/retry states, and explicit return to login when the session expires during an Access request.

Classification: **KEEP + IMPROVE**.

### Curriculum / content

- Canonical Curriculum persistence and Admin CRUD exist for classes, subjects, offerings, sections and lessons.
- At the Stage14 baseline, `apps/api/src/curriculum/http.ts` exposed Admin Curriculum routes only; no authenticated entitlement-filtered Student curriculum read route existed.
- The Student browser therefore must not invent classes, subjects, lesson order, or publication eligibility.
- A minimal non-overlapping shared Curriculum read contract has been documented in Issue #16 and is the current implementation batch.

Classification: **REBUILD for Student consumption**, preserving the existing canonical Curriculum authority.

### Reader / publication / media / OCR

The existence of lesson/content/media/OCR Admin foundations is verified, but the exact safe Student publication/read contract, asset delivery model, Reader payload, search and TTS contracts are **NOT YET VERIFIED**.

Classification: **REBUILD**, implementation blocked until the real publication/read authority is inspected.

### PWA / offline

- No manifest or service worker exists in the current Student app.
- Existing offline UI is only a connectivity/session safety state; it is not an offline-learning architecture.
- No second canonical business state will be placed in `localStorage`.

Classification: **REBUILD** in Stage16 after Stage14/15 foundations are real.

## Stage14 Audit Checklist

- [x] Student app entry / session restoration — verified; no application router exists yet.
- [x] API client boundaries — Auth/Access verified; broader split still needs refactor as Student product grows.
- [x] Auth/device integration with current backend.
- [x] entitlement listing and real seven-digit class-code redemption.
- [ ] entitlement-aware class listing — backend contract batch active.
- [ ] subject navigation — depends on verified Student Curriculum contract.
- [ ] lesson listing/order/thumbnails — lesson order contract active; thumbnail/publication delivery **NOT YET VERIFIED**.
- [ ] lesson reader — **NOT YET VERIFIED**.
- [ ] media loading/error/offline behavior — **NOT YET VERIFIED**.
- [ ] generated summary/text consumption — **NOT YET VERIFIED**.
- [ ] search — **NOT YET VERIFIED**.
- [ ] TTS — **NOT YET VERIFIED**.
- [ ] practice/test/model entry surfaces — Stage15 authority dependency remains.
- [ ] notes/favorites/needs-review entry surfaces — **NOT YET VERIFIED**.
- [ ] notifications surfaces — **NOT YET VERIFIED**.
- [ ] progress/statistics/achievement surfaces — **NOT YET VERIFIED**.
- [x] Access loading/empty/error/offline/session-expired states.
- [x] mobile 390px for current Auth/Access flow — real Chromium verified.
- [ ] tablet/desktop final Student product responsive rules — **NOT YET VERIFIED**.
- [ ] keyboard/focus/a11y final product audit — baseline semantics inspected; full audit **NOT YET VERIFIED**.
- [x] PWA manifest/service worker current state — verified absent.
- [x] lint/typecheck/unit/build current Stage14 batch.
- [x] real browser current Stage14 Auth/Access batch.
- [x] legacy Student parity mapping inspected; no legacy feature has been removed.

## Component Classification

| Area | Classification | Evidence | Decision |
|---|---|---|---|
| Student shell/navigation | REBUILD | Baseline post-login page was entitlement-only and had no router/study flow | Build a learning-first shell incrementally on canonical contracts |
| Auth/session UX | KEEP / IMPROVE | Real activation/login/recovery/device/session flow passes Chromium | Preserve contracts; improve integration and session-expiry handling |
| Access UX | IMPROVE | Canonical entitlements/redeem endpoints exist | Added real seven-digit class access UI and state handling |
| Dashboard/home | REBUILD | No study-oriented home exists | Replace generic account summary with study hierarchy as contracts land |
| Curriculum browsing | REBUILD | Backend canonical model exists but Student read route was absent | Add smallest entitlement-filtered Student read contract; no browser authority |
| Lesson Reader | REBUILD | Safe Student publication/read payload not yet inspected | Do not fabricate; inspect authority next |
| Practice entry | REBUILD | Stage15 must consume Track A Question Bank/Quiz authority | Keep blocked until Stage13F reaches `main` and contract is verified |
| Offline/PWA | REBUILD | No manifest/SW/offline-learning storage | Stage16 only, with explicit account/device-scoped cache and sync architecture |
| Personal learning | REBUILD | **NOT YET VERIFIED** | Stage17 after canonical contracts are inspected |
| Notifications | REBUILD | DB foundation exists; Student contract **NOT YET VERIFIED** | Stage18 after authority inspection |
| Progress/statistics | REBUILD | DB foundations exist; Student contract **NOT YET VERIFIED** | Stage19 after authority inspection |
| Design-system application | IMPROVE | Shared brand tokens + usable Stage8 styles exist | Extend into learning surfaces; avoid admin/dashboard visual language |
| Accessibility | IMPROVE | Semantic labels/live regions/reduced-motion baseline exists | Complete keyboard/focus/contrast audit as new surfaces land |
| Performance | KEEP / IMPROVE | Current Student bundle remains small; no premature performance layer | Measure each learning/PWA batch before adding caching complexity |
| REMOVE decisions | NONE | No legacy Student value has been proven obsolete | Removal requires evidence and Product Owner approval where applicable |

## Stage14 Batch 01 — Canonical Access UX

Commits:

- `61e5326e83a0a706cce1cf72de4dc96759ad60e8` — `ci(student): add Stage14 product gate`
- `938d82bea0f92c85dcc546d42ed4823bec06be5a` — `feat(student): add canonical class access UX`
- `9197469d5c012f0786e871080e669e562d837422` — `test(student): cover class access and session expiry`

Implemented:

- branch-scoped Stage14 Student CI,
- real class-code redemption via `/v1/student/access/redeem`,
- canonical entitlement refresh,
- all-content protection from unnecessary class-code consumption,
- Arabic digit normalization,
- idempotency-key lifecycle,
- loading skeleton / empty / error / retry / offline states,
- session-expiry transition back to login,
- separation of Access UI from the prior monolithic `App.tsx`,
- two-column Auth mode switch correction.

## Tests & Verification

GitHub Actions Stage14 run: **`34415384712` — SUCCESS** on `9197469d5c012f0786e871080e669e562d837422`.

Verified gates:

- Student ESLint: PASS
- strict TypeScript: PASS
- Vitest: **10/10 PASS**
- production build: PASS
- API typecheck/build in browser job: PASS
- clean PostgreSQL migrations: PASS
- real Chromium: PASS
- viewport: **390 × 844**
- real activation / returning login / recovery / forced password change / device rebind: PASS
- real seven-digit class-code redemption against PostgreSQL/API: PASS
- session expiry during entitlement refresh returns safely to login: PASS
- no horizontal overflow at 390px: PASS

Current production build evidence from the run:

- JS: ~171.28 kB raw / ~54.17 kB gzip
- CSS: ~15.55 kB raw / ~3.79 kB gzip

No performance optimization is justified solely by these sizes today.

## Cross-Track Dependencies / Findings

### STUDENT-014-API-001 — P1 — Student Curriculum read contract

Status: **IN PROGRESS**.

Root cause: canonical Curriculum exists, but the Stage14 baseline exposed it only to Admin routes. Browser-side reconstruction would create duplicate authority and could leak inactive/unpublished/unentitled content.

Decision recorded in Issue #16: implement the smallest shared change only inside the already-registered Curriculum module. Track A comparison against its current Stage13F head showed no edits to `apps/api/src/curriculum/http.ts` or `apps/api/src/curriculum/service.ts`; therefore this change can avoid `app.ts`, Auth/Access, migrations, Admin UI, Question Bank and Quiz Builder.

### STUDENT-014-READER-001 — P1 — Student lesson publication/read contract

Status: **NOT YET VERIFIED**.

Do not expose raw storage keys, Admin-only operations, OCR internals, or draft content until the actual publication/media authority is inspected and an entitlement-safe Student contract is proven.

### STUDENT-015-QB-001 — P1 — Stage15 Question Bank / Quiz authority

Status: **BLOCKED BY TRACK A PROMOTION**.

Track A current Stage13F work remains on `integration/stage13f-question-bank`; it is not yet canonical in `main`. Stage15 must not create a temporary Question Bank or accept mocks as completion evidence.

## Current Main / Track A Continuity

At the last verification:

- `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Track A `integration/stage13f-question-bank @ 0f849c78ccdbd5fd384579d8142f1945fc9b5ee4`
- Student branch was ahead of `main` and not behind it before this documentation commit.

Before integrating any newer `main`, inspect its exact diff and rerun Student gates on the new HEAD.

## NOT YET VERIFIED

- Student Reader publication/media contract and asset authorization
- OCR/generated text safe Student consumption
- Student search contract
- TTS contract
- final study-shell routing/history behavior
- tablet/desktop finished Stage14 UX
- full keyboard/focus/accessibility audit after learning surfaces exist
- PWA manifest/service worker/IndexedDB learning cache/sync
- notes/favorites/needs-review authority
- Student notifications API
- progress/statistics/achievements API
- Stage15 consumption contract after Stage13F reaches `main`

## Exact Next Action

1. Finish `STUDENT-014-API-001`: add authenticated, server-side entitlement-filtered Student Curriculum read contract with active/published ordering and PostgreSQL integration evidence.
2. Run API + Student Stage14 gates.
3. Consume that verified contract in `apps/student-web` for class → subject → ordered lessons without inventing Reader data.
4. Inspect the actual content/publication/media/OCR authority and define `STUDENT-014-READER-001` from evidence before building the lesson Reader.
