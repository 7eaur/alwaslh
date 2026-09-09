# STUDENT PRODUCT TRACK STATUS — Stage14+

> Branch-specific continuation checkpoint for the parallel Student Product track.

Last synchronized: **2026-09-10 — Stage14 discovery/access/curriculum navigation verified; Reader contract is the active batch.**

## Track Identity

- Repository: `7eaur/alwaslh`
- Branch: `parallel/stage14-student-product`
- Current documented code HEAD before this documentation commit: `5c7080bd3b0dadad4ed7b7d22b725593a44bb403`
- Initial stable baseline: `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Shared execution ledger: GitHub Issue #16
- Operating contract: `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`

## Current Stage

**Stage14 — Student Web/PWA Product**

State: **IN PROGRESS — DISCOVERY + ACCESS + ENTITLED CURRICULUM NAVIGATION VERIFIED / READER ACTIVE**

Stage8 Student Activation remains a verified foundation. Stage14 is not closed until Reader and remaining Stage14 evidence are complete.

## Repository Discovery — Verified Findings

### Student product shape

At the Stage14 baseline, `apps/student-web` was primarily Stage8 activation/login/recovery/device UX plus an entitlement list. It had no study shell, curriculum navigation, Reader, practice, personal-learning data, notifications, progress, manifest, or service worker.

The product now consumes canonical Student Access and Curriculum APIs and exposes a mobile-first class → subject → ordered published lessons learning surface. It still does not claim Reader/PWA/Stage15 capabilities before their authorities are verified.

### Auth / session / device

- Activation, returning login, forced password change, recovery support, session restoration and device rebind use real backend contracts.
- Device private key remains a non-extractable P-256 `CryptoKey` in IndexedDB, scoped by account identifier.
- Browser does not own canonical session or entitlement state.
- Missing/expired sessions return explicitly to login.

Classification: **KEEP + IMPROVE**.

### Access / entitlements

- Canonical active entitlement listing and code redemption are consumed directly.
- Seven-digit class redemption supports Arabic/Eastern-Arabic digits and per-attempt idempotency.
- Active all-content access prevents unnecessary class-code consumption.
- Access states include loading, empty, error/retry, offline and session-expired.

Classification: **KEEP + IMPROVE**.

### Curriculum navigation

- Canonical Curriculum persistence remains the authority for classes, subjects, offerings, sections and lessons.
- Stage14 added the minimal authenticated `GET /v1/student/curriculum` contract inside the existing Curriculum module.
- Server-side filtering enforces active Student session, active/unexpired entitlement, active classes/subjects/offerings/sections and active lessons with `published_at IS NOT NULL`.
- Canonical positions are preserved by the server and consumed directly by the browser.
- Browser does not reconstruct authority or expose unpublished lessons.
- `apps/student-web` now provides class selection, subject selection, unsectioned lessons and section-grouped ordered lessons with summary text.

Classification: **REBUILD → VERIFIED FOUNDATION** for Student consumption.

### Reader / publication / media / OCR

Verified architecture:

- `lesson_assets` has independent `draft → review → published` publication lifecycle.
- Published lesson status alone is insufficient; Student Reader must use published lesson assets.
- media variants hold internal `storage_key` values and current storage is server-side `FileSystemMediaStorage`.
- Raw storage keys must never become browser authority or public URLs.
- Reader media delivery must re-check Student session + entitlement + current curriculum state + `lesson_assets.publication_status = 'published'` + media `status = 'ready'`.
- OCR text is Student-safe only when extraction is `completed` and `review_status IN ('not_required','approved')`. Pending/rejected OCR is not Student content.
- Stage14 will initially use `private, no-store` authenticated media delivery; entitlement-aware offline caching belongs to Stage16.

Classification: **REBUILD — ACTIVE BATCH**.

### PWA / offline

- No manifest or service worker exists yet.
- Existing offline state is connectivity/session safety only; it does not pretend cached learning data is current.
- No second canonical business state will be placed in `localStorage`.

Classification: **REBUILD** in Stage16 after Stage14/15 foundations are real.

## Stage14 Audit Checklist

- [x] Student app entry/session restoration.
- [x] Auth/device integration with backend authority.
- [x] entitlement listing and real seven-digit class-code redemption.
- [x] entitlement-aware class listing.
- [x] subject navigation.
- [x] published lesson listing and canonical ordering.
- [ ] lesson Reader — active batch.
- [ ] Reader media loading/error/offline behavior — active batch.
- [ ] OCR/generated text safe Student consumption — contract verified; implementation active.
- [ ] in-lesson search — planned only over safe Reader text; implementation not yet accepted.
- [ ] TTS — browser capability path not yet accepted.
- [ ] practice/test/model entry surfaces — Stage15 authority dependency remains.
- [ ] notes/favorites/needs-review surfaces — Stage17 authority still NOT YET VERIFIED.
- [ ] notifications surfaces — Stage18.
- [ ] progress/statistics/achievement surfaces — Stage19.
- [x] Access/Curriculum loading/empty/error/offline/session-expired states.
- [x] real 390px Auth/Access/Curriculum navigation evidence.
- [ ] tablet/desktop final Stage14 product evidence — NOT YET VERIFIED.
- [ ] full keyboard/focus/accessibility audit — focus styling improved; final audit NOT YET VERIFIED.
- [x] PWA manifest/service worker current state verified absent.
- [x] lint/typecheck/unit/build current navigation batch.
- [x] PostgreSQL integration for Student curriculum authorization/publication filtering.
- [x] real browser navigation batch.
- [x] legacy Student parity mapping inspected; no legacy feature removed.

## Component Classification

| Area | Classification | Current decision |
|---|---|---|
| Student shell/navigation | REBUILD / IMPROVE | Learning-first Curriculum browser now real; continue toward Reader without generic dashboard chrome |
| Auth/session UX | KEEP / IMPROVE | Preserve verified device/session contract |
| Access UX | IMPROVE | Canonical redemption + state handling verified |
| Curriculum browsing | REBUILD → VERIFIED | Server-authorized class/subject/lesson navigation implemented and tested |
| Lesson Reader | REBUILD | Active next batch; no raw storage-key exposure |
| Practice entry | REBUILD | Blocked until Stage13F Question Bank/Quiz authority reaches `main` |
| Offline/PWA | REBUILD | Stage16 only, with account/device scoped lease-aware cache |
| Personal learning | REBUILD | Stage17; NOT YET VERIFIED |
| Notifications | REBUILD | Stage18; Student contract NOT YET VERIFIED |
| Progress/statistics | REBUILD | Stage19; Student contract NOT YET VERIFIED |
| Design system | IMPROVE | Added learning surfaces, responsive hierarchy and explicit focus-visible styling |
| Accessibility | IMPROVE | Semantic controls/states retained; final keyboard/contrast audit pending |
| Performance | KEEP / IMPROVE | Measure; do not add caching that weakens entitlement revocation |
| REMOVE decisions | NONE | No legacy Student value proven obsolete |

## Verified Batches

### Batch 01 — Canonical Access UX

Core commits:

- `61e5326e83a0a706cce1cf72de4dc96759ad60e8` — Stage14 CI
- `938d82bea0f92c85dcc546d42ed4823bec06be5a` — canonical class access UX
- `9197469d5c012f0786e871080e669e562d837422` — class access/session-expiry browser coverage

Evidence: Stage14 run `34415384712` — **SUCCESS**.

### Batch 02 — Entitlement-safe Curriculum navigation

Key commits through code HEAD:

- `bf233eaba82cb2f8b4289aaf87524363a221b62d` — entitlement-safe Student Curriculum API
- `9c20775b5fa6a245e9ce147ab4528d84109e5b04` — Student device-session integration fixture correction
- `c7f3447a8b1ab8f1396850951a4bfea4e18178aa` — isolated Curriculum fixtures
- `e83ee17ab85fb9432b6b86e76d5d4dfdd2069fb1` — typed Curriculum API consumption
- `4aa1e7562441f50aea36cfa8478c7e624422ee71` — Curriculum learning surface
- `2a336907f040eb37fa290b57955ef90bec7a276a` — Access → Curriculum refresh integration
- `2a808aea40069e5d3c964b33af7f08c7085062c9` — Curriculum API unit test
- `74b532acedbdac6a293da4364f2b390d0342dd47` — mobile-first learning browser styles/focus rules
- `4ea3fc69d94ee8f28128f634f84f20960e3f3391` — real Curriculum browser fixture
- `4be2921c10c5db5e350a1221978c16297d7d171a` — real class/subject/lesson Chromium assertions
- `5c7080bd3b0dadad4ed7b7d22b725593a44bb403` — cleanup respecting entitlement FK constraints

GitHub Actions Stage14 run: **`34417755484` — SUCCESS** on `5c7080bd3b0dadad4ed7b7d22b725593a44bb403`.

Verified gates:

- Student ESLint: PASS
- strict Student TypeScript: PASS
- Vitest: **11/11 PASS**
- Student production build: PASS
- API typecheck/build: PASS
- clean PostgreSQL migrations through `0018`: PASS
- Student Curriculum PostgreSQL integration: PASS
- recovery Admin bootstrap after integration cleanup: PASS
- real Chromium: PASS
- viewport: **390 × 844**
- activation / returning login / recovery / forced password change / device rebind: PASS
- seven-digit class redemption: PASS
- class → subject → section/lesson navigation: PASS
- exact ordered published lesson sequence: PASS
- unpublished draft exclusion: PASS
- session expiry handling: PASS
- no horizontal overflow at 390px: PASS

Navigation-batch build evidence:

- JS: ~396.20 kB raw / ~111.37 kB gzip
- CSS: ~20.40 kB raw / ~4.45 kB gzip

The JS increase is mostly the existing application/runtime plus the learning surface; no caching/code-splitting change is justified until Reader and route boundaries are measured together.

## Cross-Track Dependencies / Decisions

### STUDENT-014-API-001 — P1 — Student Curriculum read contract

Status: **RESOLVED / VERIFIED**.

The smallest shared change remained inside the already-registered Curriculum module. No migrations, Auth/Access authority, Admin UI, Question Bank or Quiz Builder were duplicated.

### STUDENT-014-READER-001 — P1 — Student lesson publication/read contract

Status: **IN PROGRESS**.

Architecture decision is recorded in Issue #16. Reader must use entitlement/publication/media/OCR authority and server-side media storage. It must not expose raw `storage_key`, draft/review assets or pending/rejected OCR text.

### STUDENT-015-QB-001 — P1 — Stage15 Question Bank / Quiz authority

Status: **BLOCKED BY TRACK A PROMOTION**.

Latest verified Track A state:

- `integration/stage13f-question-bank @ 4f7f418d69502ebc75ae686a3babe93b98b0843d`
- `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Track A is 58 commits ahead and 0 behind `main`.
- Its diff adds Question Bank/Quiz Builder service/routes/tests/migrations and modifies `app.ts`, but does not modify Curriculum/Media/OCR implementation files used by the Reader decision.

Stage15 must not begin until the canonical authority is promoted to `main` and re-verified from Student branch.

## NOT YET VERIFIED

- Reader implementation and browser evidence
- authenticated media-delivery integrity/error behavior
- in-lesson search UX over approved OCR
- browser TTS behavior/availability states
- final study-shell history/routing model
- tablet/desktop final Stage14 UX
- final keyboard/focus/contrast accessibility audit
- Stage16 manifest/service worker/IndexedDB learning cache/sync
- Stage17 notes/favorites/needs-review authority
- Stage18 Student notifications API
- Stage19 progress/statistics/achievements API
- Stage15 consumption after Stage13F reaches `main`

## Exact Next Action

1. Implement `STUDENT-014-READER-001` as the smallest authenticated entitlement/publication-safe Reader contract.
2. Add PostgreSQL integration evidence for inaccessible/draft/unready media and safe OCR filtering.
3. Add Reader UI with image/page/text states without exposing storage keys.
4. Verify real Chromium at 390px, then tablet/desktop and keyboard/focus/a11y for the completed Stage14 surface.
5. Keep Stage15 blocked until Stage13F is canonical in `main`.
