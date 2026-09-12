# Stage14+ Unified Product Continuation

> Current post-Stage13 execution contract. Historical parallel-branch ownership has been superseded; new work starts from live `main`.

Last synchronized: **2026-09-12**.

## 1. Mission

Own and complete the remaining **الوسيلة الذكية** product after Stage13, preserving the existing product/business rules and verified authorities while progressing sequentially through Stage14–29.

The responsibility is no longer “Student frontend only”. After Product Owner-directed integration, the continuation owner is responsible for the **whole remaining product scope** needed by later stages, including Student UI, shared API/DB changes, Admin support, deployment/hardening and release work—while still editing each concern in its correct architectural layer.

## 2. Baseline and branching

- Repository: `7eaur/alwaslh`
- Canonical baseline: **live `main`**
- Old branch `parallel/stage14-student-product`: historical/reference after PR #33 integration.
- Old Stage13G branch: historical/reference after PR #33 integration.
- New work: create a **short-lived branch from current `main`** for each coherent batch.
- Never force-push/rewrite shared history.

PR #33 integrated Stage13G + Student Product into `main` after **19/19 workflows SUCCESS** on head `dcdae7579a40878c71f64593280a0df2f8363ee2`; merge commit `5e22c3ff157b42b6da47febe205dd91fcb264eed`.

## 3. Mandatory startup

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATUS.md`
5. `PROJECT_RESUME_SNAPSHOT.md`
6. `PROJECT_ENGINEERING_LOG.md`
7. `PROJECT_INTEGRATION_CONTINUITY.md`
8. `PROJECT_EXECUTION_QUEUE.md`
9. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
10. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
11. `docs/operations/RAILWAY_LIVE_STATE.md`
12. `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
13. `MASTER_REBUILD_ROADMAP.md`
14. latest Issue #16
15. live `main`, Actions and Railway state
16. actual current-stage code/tests/workflows.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 4. Current stage state

- Stage14 Student Product — **CLOSED / VERIFIED**.
- Stage15 Practice/Assessment — **CLOSED / VERIFIED**.
- **Stage16 Offline/PWA — ACTIVE / NOT CLOSED**.
- Stage17+ — pending Stage16 closure.

Detailed Stage16 continuation: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

## 5. Architectural ownership under unified continuation

One owner does **not** mean one layer.

### Student-facing work

Use `apps/student-web` for:

- navigation/session/student UX;
- Reader/Assessment/Offline/PWA;
- later Notes/Favorites/Needs Review;
- Student notifications/progress;
- responsive/RTL/a11y/device behavior.

### Backend/shared authority

Use `apps/api` + `database/migrations` for:

- Auth/Access/session/device authority;
- Curriculum/publication/media authority;
- Assessment scoring/finalization;
- offline authorization/sync/revocation;
- later server-derived progress/notification/sync contracts.

### Admin support

Use `apps/admin-web` only when later stages need Admin configuration/review/operations. Do not reimplement server authority inside Admin.

### Existing durable authorities to preserve

- Auth/device/session;
- entitlements/access codes;
- curriculum/publication;
- media/OCR;
- AI execution/review;
- Question Bank revisions/publication;
- Quiz Builder immutable published versions;
- Student assessment server scoring/history.

Do not create substitutes to avoid touching shared code.

## 6. Current Stage16 verified boundary

Already implemented and executable-proven on the integrated code:

- installable PWA app shell;
- `/v1` excluded from Service Worker caching/interception;
- bounded server-issued profile/device lease;
- IndexedDB account/device scope and cleanup;
- explicit protected lesson manifest/assets;
- checksum + exact byte-size verification;
- 64 MiB lesson / 256 MiB scope budgets;
- atomic package storage/replacement/removal;
- ES256 server-signed authorization envelope;
- Student verifies configured public-key identity, signature and canonical signed manifest before storing package.

PR #33 verification Stage16 run: `34560999667` — all three Stage16 jobs SUCCESS.

## 7. Stage16 remaining security/product boundary

The signed envelope improved issuance/download security, but Stage16 remains open because the cold-start Reader does not yet promote stored content through a fully verified read-time authority chain.

Required:

1. durable **non-secret** active offline scope across browser restart; current scope discovery uses `sessionStorage` and is not durable;
2. re-verify stored signed authorization/key ID/canonical payload at offline use time;
3. re-hash stored blobs against signed checksums before rendering, not only at download time;
4. cold-start app shell → offline library/Reader with network unavailable;
5. fail closed on signature/key/field/tamper/expiry/clock-rollback failure;
6. reconnect revalidation of session/device/entitlement/publication/revision;
7. purge/disable revoked, expired, unpublished or invalid packages;
8. authoritative revision writers + tombstones + cursor/delta + client application;
9. bounded outbox only for later product-authorized offline writes;
10. exact-head API/DB/Student/Chromium/a11y/responsive closure.

## 8. Current hosted environment

Railway inspection/dev stack is live and should be used for real product inspection after CI—not as a replacement for CI.

- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`

Read `docs/operations/RAILWAY_LIVE_STATE.md` before deployment changes.

## 9. Current content proof

Grade 9 English canonical source bytes were materialized as a controlled proof:

- 75 images;
- 75 ready media assets;
- 300 variants;
- 75 Draft lesson assets;
- 10 lessons.

They remain Draft and are not Student-visible until Admin review/publication. Full 5,552-image byte materialization is not complete.

Read `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`.

## 10. Later stage sequence

After Stage16 closure:

- Stage17 — Personal Learning Data;
- Stage18 — Notifications;
- Stage19 — Progress / Statistics / Achievements;
- Stage20 — Import / Export / Reporting closure;
- Stage21 — Performance Engineering;
- Stage22 — Security Hardening;
- Stage23 — Automated Tests & CI Expansion;
- Stage24 — Accessibility / Device QA;
- Stage25 — Initial Data / Content Load;
- Stage26 — Staging;
- Stage27 — Release Gate;
- Stage28 — Production Cutover;
- Stage29 — Monitoring & Operations.

`AI-012..AI-019` live-provider readiness remains open and must be resolved before final release if production AI is required.

## 11. Quality rules

- root-cause fixes only;
- no fake APIs/test weakening/auth bypass;
- no browser-owned canonical business state;
- no duplicate durable authority;
- no random sleeps/timeouts to hide races;
- Arabic-first RTL/mobile-first/accessibility;
- exact-head lint/typecheck/unit/integration/DB/build/browser evidence appropriate to each batch;
- documentation + Issue #16 after meaningful work.

## 12. Exact first action

Start from live `main`, create a short-lived Stage16 completion branch, inspect current signed offline implementation, then close the cold-start/read-time integrity/reconnect/sync boundary. Do not start Stage17 until Stage16 is executable-proven closed.
