# STUDENT PRODUCT TRACK STATUS — Stage14+

> Branch-specific continuation checkpoint for the parallel Student Product track.

Last synchronized: **2026-09-10 — Access + entitled Curriculum + protected Reader verified; Stage14 final closure/polish audit is active.**

## Track Identity

- Repository: `7eaur/alwaslh`
- Branch: `parallel/stage14-student-product`
- Latest verified Stage14 runtime HEAD: `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d`
- Initial stable baseline: `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Shared execution ledger: GitHub Issue #16
- Operating contract: `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`

## Current Stage

**Stage14 — Student Web/PWA Product**

State: **IN PROGRESS — ACCESS + ENTITLED CURRICULUM + PROTECTED READER VERIFIED / FINAL PRODUCT-UX-A11Y CLOSURE ACTIVE**

Stage8 Student Activation remains a verified foundation. Reader acceptance does not by itself close Stage14; the learning-first shell, copy and final accessibility/product audit must still be closed or explicitly documented.

## Verified Product Understanding

### Auth / session / device

- Activation, returning login, forced password change, recovery support, session restoration and device rebind use real backend contracts.
- Device private key remains a non-extractable P-256 `CryptoKey` in IndexedDB, scoped by Student account identifier.
- Browser does not own canonical session or entitlement state.
- Missing/expired sessions return explicitly to login.

Classification: **KEEP + IMPROVE**.

### Access / entitlements

- Canonical active entitlement listing and code redemption are consumed directly.
- Seven-digit class redemption supports Arabic/Eastern-Arabic digits and per-attempt idempotency.
- Active all-content access prevents unnecessary class-code consumption.
- Access states include loading, empty, error/retry, offline and session-expired.

Classification: **KEEP + IMPROVE — VERIFIED**.

### Curriculum navigation

- Canonical Curriculum persistence remains authority for classes, subjects, offerings, sections and lessons.
- `GET /v1/student/curriculum` is authenticated and server-side entitlement-filtered.
- Server filtering enforces active/unexpired entitlement, active class/subject/offering/section and active lessons with `published_at <= now()`.
- Canonical positions are preserved by server and consumed directly by browser.
- Browser does not reconstruct authority or expose unpublished lessons.
- Student Web provides class selection, subject selection, unsectioned lessons and section-grouped ordered lessons.

Classification: **REBUILD → VERIFIED FOUNDATION**.

### Reader / publication / media / OCR

Verified implementation:

- Lesson publication alone is insufficient: Reader exposes only `lesson_assets.publication_status = 'published'` backed by `media_assets.status = 'ready'`.
- Raw `storage_key` values remain server-internal and never become browser authority/public URLs.
- Reader metadata and media requests re-check Student session, entitlement and current curriculum/publication state.
- Media delivery validates declared byte size and SHA-256 before response.
- Student media uses `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`; Stage16 owns any future entitlement-aware offline cache.
- OCR is exposed only when extraction is `completed` and review is `not_required` or `approved`; pending/rejected text is excluded.
- Student Reader renders published media/page context, safe OCR text, in-lesson search and browser TTS capability state.
- Reader loading/error/media-error/offline states are explicit.
- If connectivity drops while a lesson is open, current in-session class/subject/lesson context remains visible, but Reader transitions to offline and does not claim media/curriculum freshness.

Classification: **REBUILD → VERIFIED**.

### PWA / offline

- No manifest/service worker/offline-learning store exists yet.
- Stage14 offline behavior is connectivity/session safety, not offline-learning authority.
- No second canonical business state is placed in `localStorage`.
- Entitlement-aware downloads/leases/revisions/tombstones/outbox/sync remain Stage16 work by sequence.

Classification: **REBUILD — Stage16**.

## Stage14 Audit Checklist

- [x] Student entry/session restoration.
- [x] Auth/device integration with backend authority.
- [x] entitlement listing and real seven-digit class-code redemption.
- [x] entitlement-aware class listing.
- [x] subject navigation.
- [x] published lesson listing and canonical ordering.
- [x] protected lesson Reader.
- [x] authenticated Reader media loading/integrity/error behavior.
- [x] safe OCR/generated text consumption.
- [x] in-lesson search over trusted Reader text.
- [x] browser TTS capability/availability state.
- [x] Reader explicit offline/reconnect behavior.
- [x] real 390px Auth/Access/Curriculum/Reader evidence.
- [x] Reader responsive checks at 768×1024 and 1366×900.
- [x] keyboard activation of lesson Reader and explicit focus-visible styling on current controls.
- [ ] final learning-first dashboard/shell acceptance — closure audit active.
- [ ] final product copy cleanup — closure audit active.
- [ ] final whole-surface keyboard/focus/contrast audit — Reader-critical path verified; closure audit active.
- [x] PWA manifest/service-worker current state verified absent.
- [x] lint/typecheck/unit/build on Reader runtime.
- [x] PostgreSQL integration for Student Curriculum authorization/publication filtering.
- [x] PostgreSQL integration for Reader entitlement/publication/media/OCR filtering.
- [x] real Chromium Reader batch.
- [x] legacy Student parity mapping inspected; no legacy feature removed.
- [ ] Practice/Test/Model Student implementation — **BLOCKED by Stage15 dependency; no fake authority permitted**.
- [ ] Notes/Favorites/Needs Review — Stage17 authority not yet available/verified.
- [ ] Notifications — Stage18.
- [ ] Progress/statistics/private achievements — Stage19.

## Component Classification

| Area | Classification | Current decision |
|---|---|---|
| Student shell/navigation | REBUILD / IMPROVE | Learning hierarchy is real; final learning-first shell polish remains |
| Auth/session UX | KEEP / IMPROVE | Preserve verified device/session contract; final notice semantics under audit |
| Access UX | IMPROVE → VERIFIED | Canonical redemption/state handling verified |
| Curriculum browsing | REBUILD → VERIFIED | Server-authorized class/subject/lesson navigation verified |
| Lesson Reader | REBUILD → VERIFIED | Protected media/OCR/search/TTS-capability Reader verified |
| Practice entry | REBUILD | Stage15 blocked until Stage13F authority is canonical in `main` |
| Offline/PWA | REBUILD | Stage16 only; no Stage14 pseudo-offline authority |
| Personal learning | REBUILD | Stage17; NOT YET VERIFIED |
| Notifications | REBUILD | Stage18; NOT YET VERIFIED |
| Progress/statistics | REBUILD | Stage19; NOT YET VERIFIED |
| Design system | IMPROVE | Learning surfaces, responsive hierarchy and focus-visible rules exist; closure polish active |
| Accessibility | IMPROVE | Reader keyboard path verified; whole Stage14 surface final audit active |
| Performance | KEEP / IMPROVE | Reader bundle remains modest; do not add caching/code splitting without measured need |
| REMOVE decisions | NONE | No legacy Student value proven obsolete |

## Verified Batches

### Batch 01 — Canonical Access UX

Core commits:

- `61e5326e83a0a706cce1cf72de4dc96759ad60e8` — Stage14 CI
- `938d82bea0f92c85dcc546d42ed4823bec06be5a` — canonical class access UX
- `9197469d5c012f0786e871080e669e562d837422` — class access/session-expiry Chromium coverage

Evidence: Stage14 run `34415384712` — **SUCCESS**.

### Batch 02 — Entitlement-safe Curriculum navigation

Verified runtime: `5c7080bd3b0dadad4ed7b7d22b725593a44bb403`

Evidence: Stage14 run `34417755484` — **SUCCESS**.

Verified: Student lint/typecheck/11 unit/build, API build, clean migrations through `0018`, Curriculum PostgreSQL integration, Admin fixture isolation, real activation/login/recovery/rebind, class redemption, ordered class→subject→lesson navigation, unpublished draft exclusion, session expiry and 390px overflow.

### Batch 03 — Protected Lesson Reader

Latest verified runtime: `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d`

Representative implementation/fix commits include:

- `1edd305d374cc827af21f9ff044ab13389570b20` — Student Reader service foundation
- `ccbbd4ffd6d24efe316d297146e253b4abf1f679` — Student Reader HTTP contract
- `7e80781b3897e06a09dfbfeb40bbc416edded572` — Reader media-storage wiring
- `91dae3168843a119d3a73ffd256559b58a92fc7d` — Reader PostgreSQL integration coverage
- `9b15b6a2c0cfc99896066d3c356a9607eac6a643` — Student Reader API consumption
- `c48d3cd8228c8c80ae481f247d0f71dd2d9f124c` — Reader UI/search/TTS
- `f24c7b3eda7b6777c72cc9e9050697d750fcd4d2` — real media/OCR browser fixture
- `fbaacbd426b0d33f850327cf6de25c90595343cc` — Reader responsive styles
- `8cc984d458356fe8167ebd67af6c07c20469b8e8` — protected Reader Chromium spec
- `831be45d60b09c53a79ad76c9103e78c91babaaa` — unambiguous Curriculum browser fixture
- `680252e937fb27bb941ba21001d1a69bedf5ba8b` — explicit browser network-event synchronization
- `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d` — preserve Reader context while offline

GitHub Actions Stage14 run: **`34419936648` — SUCCESS** on exact runtime HEAD `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d`.

Verified gates:

- Student ESLint: PASS
- strict Student TypeScript: PASS
- Vitest: **12/12 PASS**
- Student production build: PASS
- API typecheck/build: PASS
- clean PostgreSQL migrations through `0018`: PASS
- Curriculum PostgreSQL integration: PASS
- Reader PostgreSQL integration: PASS
- Admin bootstrap after fixture cleanup: PASS
- real Chromium Auth/Access/Curriculum: PASS
- real Chromium protected Reader: PASS
- protected binary media + security headers: PASS
- approved OCR visible / pending OCR absent: PASS
- in-lesson search: PASS
- browser TTS availability state: PASS
- lesson keyboard focus + Enter open: PASS
- no horizontal overflow at **390×844**, **768×1024**, **1366×900**: PASS
- explicit offline Reader state + reconnect reload: PASS
- return from Reader to lesson list: PASS

Reader-batch production build evidence:

- JS: ~408.84 kB raw / ~113.30 kB gzip
- CSS: ~22.77 kB raw / ~4.80 kB gzip

No code splitting or caching layer is justified solely by these sizes. Stage16 must not reuse browser cache as entitlement authority.

## Architecture Decisions / Findings

### STUDENT-014-API-001 — P1 — Student Curriculum read contract

Status: **RESOLVED / VERIFIED**.

Minimal shared Curriculum change; no duplicate browser authority.

### STUDENT-014-READER-001 — P1 — Student lesson publication/read contract

Status: **RESOLVED / VERIFIED**.

Decision: Student Reader may consume only server-authorized published assets backed by ready media; raw storage keys and non-approved OCR remain private. Media is re-authorized per request. In-session learning context may remain visible through a connection drop, but freshness/authorization is never inferred from that context.

### STUDENT-014-UX-002 — P2 — Final Stage14 shell/copy/a11y closure

Status: **IN PROGRESS**.

Evidence from final audit start: post-login shell still contains account/security-centric copy and some internal stage/PWA wording. Reader-critical keyboard/responsive behavior is verified, but whole-surface semantic/focus/contrast closure remains to be completed before Stage14 is declared closed.

### STUDENT-015-QB-001 — P1 — Stage15 Question Bank / Quiz authority

Status: **BLOCKED BY TRACK A PROMOTION**.

Latest live verification:

- `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Track A `integration/stage13f-question-bank @ 24549cd05cfde6d22b6a9847d195456cb3b9514e`

Track A is still outside `main`; Stage15 must not start using mocks, temporary persistence or duplicate quiz/question models.

## NOT YET VERIFIED / Deferred by Sequence

- final Stage14 learning-first shell/dashboard acceptance
- final Stage14 product copy cleanup
- final whole-surface keyboard/focus/contrast audit
- final study-shell URL/history model decision
- Stage15 consumption after Stage13F reaches `main`
- Stage16 manifest/service worker/account-device IndexedDB learning cache/lease/sync
- Stage17 Notes/Favorites/Needs Review authority
- Stage18 Student notifications API
- Stage19 progress/statistics/private achievements API

## Exact Next Action

1. Complete bounded `STUDENT-014-UX-002` audit and root-fix only evidenced Stage14 shell/copy/a11y issues.
2. Rerun the Stage14 Student quality + PostgreSQL + real Chromium gate on the exact final runtime HEAD.
3. Update Issue #16 and engineering/status docs with Stage14 closure evidence.
4. If Stage13F is still not canonical in `main`, stop at the Stage15 dependency boundary; do not skip sequence into Stage16 and do not invent assessment authority.
