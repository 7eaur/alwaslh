# STUDENT PRODUCT TRACK STATUS — Stage14+

> Branch-specific continuation checkpoint for the parallel Student Product track.

Last synchronized: **2026-09-10 — Stage14 CLOSED / VERIFIED on `parallel/stage14-student-product`; Stage15 remains blocked until Stage13F is canonical in `main`.**

## Track Identity

- Repository: `7eaur/alwaslh`
- Branch: `parallel/stage14-student-product`
- Latest verified Stage14 runtime HEAD: `ac55f1435d232cadff334816407f1182125dda90`
- Initial stable baseline: `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Shared execution ledger: GitHub Issue #16
- Operating contract: `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`

## Current Stage

**Stage14 — Student Web/PWA Product**

State: **CLOSED / VERIFIED**

Stage14 now provides a real learning-first Student product foundation on canonical backend authority: activation/session/device, access, entitlement-aware curriculum navigation, published lesson Reader, protected media, approved text, search, TTS capability UX, responsive behavior and explicit connectivity states.

Stage14 does **not** claim Stage15 assessments, Stage16 offline-learning/PWA sync, Stage17 personal-learning data, Stage18 notifications, or Stage19 progress/statistics. Those remain sequenced work.

## Verified Product Understanding

### Auth / session / device — KEEP + IMPROVE / VERIFIED

- Activation, returning login, forced password change, recovery support, session restoration and device rebind use real backend contracts.
- Device private key remains a non-extractable P-256 `CryptoKey` in IndexedDB and is scoped by Student account identifier.
- Browser does not own canonical session or entitlement state.
- Missing/expired sessions return explicitly to login.
- Session-expiry copy is informational rather than falsely presented as success.

### Access / entitlements — KEEP + IMPROVE / VERIFIED

- Canonical active entitlement listing and redemption are consumed directly.
- Seven-digit class redemption accepts Arabic/Eastern-Arabic digits and uses per-attempt idempotency.
- Active all-content access prevents unnecessary class-code consumption.
- Access states include loading, empty, error/retry, offline and session-expired.
- Access management is secondary to study content in the authenticated information hierarchy.

### Curriculum navigation — REBUILD → VERIFIED

- `GET /v1/student/curriculum` is authenticated and server-side entitlement-filtered.
- Server filtering enforces active/unexpired entitlement, active class/subject/offering/section and active lessons with `published_at <= now()`.
- Canonical ordering is owned by server and consumed directly.
- Browser does not reconstruct curriculum authority or expose unpublished lessons.
- Student Web provides class selection, subject selection, unsectioned lessons and section-grouped ordered lessons.

### Reader / publication / media / OCR — REBUILD → VERIFIED

- Reader exposes only published lesson assets backed by ready media.
- Raw `storage_key` values remain server-internal.
- Reader metadata and media requests re-check Student session, entitlement and current publication state.
- Media delivery validates declared byte size and SHA-256 before response.
- Media uses `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`.
- OCR text is exposed only when extraction is `completed` and review status is `not_required` or `approved`; pending/rejected text is excluded.
- Reader provides media/page rendering, trusted text, in-lesson search and browser speech-synthesis capability state.
- Reader loading/error/media-error/offline states are explicit.
- When connectivity drops with a lesson open, in-session class/subject/lesson context remains visible while Reader stops claiming current media authorization/freshness.
- Returning from Reader restores keyboard focus to the lesson that opened it.

### Learning-first shell / accessibility — IMPROVE → VERIFIED

- Authenticated DOM order is study content first, access management second.
- Post-login copy directs the Student to class → subject → lesson rather than security/account administration.
- Internal implementation words such as Stage/PWA/authority are not exposed in the verified authenticated Student flow.
- Lesson open works by keyboard Enter and Reader back restores focus.
- Student-only focus ring uses `--brand-teal-700` with a 3px outline and 3px offset; the audited white-background pair is approximately 4.88:1.
- Real Chromium verifies no horizontal overflow at 390×844, 768×1024 and 1366×900 on the Reader path.

### Routing decision

Stage14 does **not** add a router solely for architectural aesthetics. The verified product contract does not require deep links or shareable lesson URLs today. The simpler stateful class/subject/lesson navigation preserves context and passes required flows. A router should be introduced only when a later verified requirement—such as assessment URLs, offline deep links or navigation history—makes it materially useful.

### PWA / offline — REBUILD / DEFERRED TO STAGE16

- No manifest, service worker or offline-learning authority is claimed by Stage14.
- Existing offline behavior is a truthful connectivity/session/publication safety state.
- No second canonical business state is stored in `localStorage`.
- Entitlement-aware downloads, leases, revisions, tombstones, outbox and sync remain Stage16 work by sequence.

## Stage14 Acceptance Checklist

- [x] Student entry/session restoration.
- [x] Auth/device integration with backend authority.
- [x] entitlement listing and real seven-digit class-code redemption.
- [x] entitlement-aware class listing.
- [x] subject navigation.
- [x] published lesson listing and canonical ordering.
- [x] protected lesson Reader.
- [x] authenticated Reader media loading/integrity/error behavior.
- [x] safe approved/generated text consumption.
- [x] in-lesson search over trusted text.
- [x] browser TTS capability/availability state.
- [x] explicit Reader offline/reconnect behavior.
- [x] learning-first authenticated shell hierarchy.
- [x] product copy cleanup for Stage14 Student surfaces.
- [x] keyboard open + Reader focus return.
- [x] high-contrast Student focus-visible treatment.
- [x] real 390px Auth/Access/Curriculum/Reader evidence.
- [x] Reader responsive checks at 768×1024 and 1366×900.
- [x] clean PostgreSQL migrations through `0018`.
- [x] Student Curriculum PostgreSQL integration.
- [x] Student Reader PostgreSQL integration.
- [x] Student lint / strict typecheck / unit / production build.
- [x] shared API lint / strict typecheck / unit / build regression gate.
- [x] real Chromium Auth/Access/Curriculum + Reader.
- [x] legacy Student parity mapping inspected; no legacy value removed.

Sequenced non-Stage14 work:

- [ ] Practice/Test/Model implementation — **Stage15 BLOCKED by Track A promotion; no fake authority permitted**.
- [ ] PWA/offline-learning sync — Stage16.
- [ ] Notes/Favorites/Needs Review — Stage17.
- [ ] Notifications — Stage18.
- [ ] Progress/statistics/private achievements — Stage19.

## Component Classification

| Area | Classification | Final Stage14 decision |
|---|---|---|
| Student shell/navigation | REBUILD → VERIFIED | Learning-first class/subject/lesson hierarchy; no unnecessary router |
| Auth/session UX | KEEP / IMPROVE → VERIFIED | Preserve device/session contracts; clear expiry/recovery states |
| Access UX | IMPROVE → VERIFIED | Canonical redemption and entitlement states; secondary to study flow |
| Curriculum browsing | REBUILD → VERIFIED | Server-authorized class/subject/lesson navigation |
| Lesson Reader | REBUILD → VERIFIED | Protected media, approved text, search and TTS capability UX |
| Practice entry | REBUILD / BLOCKED | Wait for canonical Stage13F Question Bank/Quiz authority |
| Offline/PWA | REBUILD / DEFERRED | Stage16; no pseudo-offline authority in Stage14 |
| Personal learning | REBUILD / DEFERRED | Stage17 |
| Notifications | REBUILD / DEFERRED | Stage18 |
| Progress/statistics | REBUILD / DEFERRED | Stage19 |
| Design system | IMPROVE → VERIFIED for Stage14 | RTL/mobile-first hierarchy and Student-local focus correction |
| Accessibility | IMPROVE → VERIFIED for Stage14 scope | Keyboard Reader path, focus return, responsive and focus contrast evidence |
| Performance | KEEP / IMPROVE | Production bundle remains small enough; no premature caching/code splitting |
| REMOVE decisions | NONE | No legacy Student value proven obsolete |

## Verified Batches

### Batch 01 — Canonical Access UX

Evidence: Stage14 run `34415384712` — **SUCCESS**.

Core commits:

- `61e5326e83a0a706cce1cf72de4dc96759ad60e8` — Stage14 CI
- `938d82bea0f92c85dcc546d42ed4823bec06be5a` — canonical class access UX
- `9197469d5c012f0786e871080e669e562d837422` — class access/session-expiry Chromium coverage

### Batch 02 — Entitlement-safe Curriculum navigation

Verified runtime: `5c7080bd3b0dadad4ed7b7d22b725593a44bb403`

Evidence: Stage14 run `34417755484` — **SUCCESS**.

Verified: Student quality gates, API build, clean migrations, Curriculum PostgreSQL integration, fixture isolation, real Auth/Access, ordered class→subject→lesson navigation, draft exclusion and 390px behavior.

### Batch 03 — Protected Lesson Reader

Verified runtime checkpoint: `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d`

Evidence: Stage14 run `34419936648` — **SUCCESS**.

Verified: protected media and security headers, approved OCR / pending exclusion, search, TTS capability UI, keyboard Enter, responsive 390/768/1366, explicit offline/reconnect and return to lesson list.

### Batch 04 — Final Stage14 learning-first / UX / accessibility closure

Final verified runtime HEAD: **`ac55f1435d232cadff334816407f1182125dda90`**.

Representative closure commits:

- `93c48ff115bb91d86713e57b5c27bc9f3035150d` — study content before access management
- `84b85f282c3bcd1114173222c10893ca2f789485` — study/access surface separation
- `5f201b0570298f3e83e7b98ea92aae4d2db9582b` — learning shell copy + session notice semantics
- `96ae173dcf1df667d0ec84008b7e7c314338f4cc` — Reader copy + focus return
- `551f98040a9fcbed82d5c2bafb1491c4b56b7dbe` — learning-shell/focus Chromium acceptance
- `3da1226244819f937d872c8994915465a331fe80` — stronger Student focus contrast
- `f587888d1bf04fe0ee9322b095fee4c4a266fbdc` — shared API regression workflow
- `ac55f1435d232cadff334816407f1182125dda90` — final Biome-clean Reader integration formatting

Final Stage14 evidence:

- Stage14 Student Product run **`34420993805` — SUCCESS** on exact HEAD `ac55f143...`.
- Stage14 Student API Regression run **`34420993840` — SUCCESS** on exact HEAD `ac55f143...`.
- Student ESLint: PASS.
- strict Student TypeScript: PASS.
- Student Vitest: **12/12 PASS**.
- production build: PASS — ~**184.20 kB JS / 57.16 kB gzip**, ~**23.02 kB CSS / 4.82 kB gzip**.
- API Biome: **87 files checked, 0 errors**.
- strict API TypeScript: PASS.
- API unit tests: **46/46 PASS**.
- API build: PASS.
- clean PostgreSQL migrations `0001` → `0018`: PASS.
- Curriculum integration: PASS.
- Reader integration: PASS.
- recovery-support Admin bootstrap after fixture cleanup: PASS.
- real Chromium Playwright: **2/2 PASS (6.7s)**.
- Chromium flows include real activation, returning login, recovery/forced password change, device rebind, class-code access, canonical Curriculum, protected Reader, learning-first hierarchy, media/OCR/search/TTS capability, keyboard focus, offline/reconnect and responsive checks.

The browser job uses `NODE_ENV=test`; its Vite bundle output is not used as production performance evidence. Production-size evidence comes from the dedicated Student quality job above.

## Findings / Architecture Decisions

### STUDENT-014-API-001 — P1 — Student Curriculum read contract

Status: **RESOLVED / VERIFIED**.

Solution: minimal authenticated, server-side entitlement-filtered Curriculum read contract. No duplicate browser authority.

### STUDENT-014-READER-001 — P1 — Student lesson publication/read contract

Status: **RESOLVED / VERIFIED**.

Solution: only server-authorized published assets backed by ready media; storage keys and non-approved OCR remain private; media is re-authorized per request.

### STUDENT-014-UX-002 — P2 — Stage14 shell/copy/a11y closure

Status: **RESOLVED / VERIFIED**.

Evidence/fixes:

- study content moved ahead of access-management UI;
- account/security-centric post-login copy replaced with study-first guidance;
- internal Stage/PWA/authority wording removed from verified authenticated surfaces;
- session-expiry notice changed from success styling to informational styling;
- Reader back restores keyboard focus to its launching lesson;
- Student focus ring strengthened to `--brand-teal-700` with 3px width/offset;
- Chromium asserts learning-first DOM order, no internal terminology, keyboard focus return and responsive behavior.

### STUDENT-014-A11Y-003 — P2 — Weak Student focus indicator

Status: **RESOLVED / VERIFIED**.

Problem: shared `--focus-ring: #00b5a9` is about 2.57:1 on white, and the prior Student style further diluted it with transparency.

Solution: Student-local focus-visible override uses `--brand-teal-700: #007f78`, approximately 4.88:1 on white, with 3px outline + 3px offset. Shared brand tokens were not changed because Track B does not own the shared design system globally.

### STUDENT-014-QA-004 — P2 — Shared API regression coverage

Status: **RESOLVED / VERIFIED**.

Problem: Stage14 browser gate typechecked/built API and ran targeted DB contracts but did not execute full API lint/unit coverage after the small shared Reader addition.

Solution: added `Stage14 Student API Regression` workflow. Initial run correctly exposed three Biome-only drift errors; they were fixed without changing behavior. Final gate: 87 files lint-clean, 46/46 API unit tests, strict typecheck and build PASS.

### STUDENT-015-QB-001 — P1 — Stage15 Question Bank / Quiz authority

Status: **BLOCKED BY TRACK A PROMOTION**.

Latest live verification during closure:

- `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`
- Track A `integration/stage13f-question-bank @ 24549cd05cfde6d22b6a9847d195456cb3b9514e`

Track A remains outside `main`. Stage15 must not start with mocks, temporary persistence or duplicate question/quiz models.

## Remaining Work / Sequence Boundary

Stage14 has no open implementation blocker on this branch.

Next work is **not** Stage16. The required next stage is Stage15, but it is externally blocked until Stage13F Question Bank/Quiz authority reaches `main` and is re-read from source.

Deferred by sequence:

- Stage15 — practice/tests/models once canonical QB/Quiz authority exists.
- Stage16 — installable PWA and entitlement-aware offline/sync.
- Stage17 — Notes/Favorites/Needs Review.
- Stage18 — Student Notifications.
- Stage19 — progress/statistics/private achievements.

## Exact Next Action

1. Keep `parallel/stage14-student-product` stable at the verified Stage14 closure.
2. Monitor/re-read `main` and Track A authority before any Stage15 implementation.
3. When Stage13F is promoted to `main`, integrate/rebase only after inspecting the exact diff and conflicts, then read the real Question Bank/Quiz contracts before coding Stage15.
4. Do not skip into Stage16 while Stage15 authority is blocked, and do not invent assessment authority.
