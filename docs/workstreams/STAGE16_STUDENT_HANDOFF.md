# STAGE16 STUDENT HANDOFF — Offline / PWA

> Canonical Stage16 continuation checkpoint. Current `main` code, PostgreSQL migrations, executable tests/CI and verified runtime outrank prose. Anything not executed is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13 — `STUDENT-016I` active on `stage16/student-016i`.**

## 1. Current checkpoint

Repository: `7eaur/alwaslh`

Active branch: `stage16/student-016i`

Base: `main@343ff1fd7b3d64d7e990b72606695365f520fa58`

That base is the merge commit of verified PR #55. Do not resume from the older PR #33-era SHAs in previous versions of this document.

Stage14/15 product work and the Student UX rebuild are already merged. Stage16 remains ACTIVE.

## 2. Stable Stage16 security invariants

Do not violate these while finishing Stage16:

- `/v1` never becomes Service Worker Cache authority;
- protected Reader/media remains server-authorized online;
- no password/session cookie/token/device private key/raw media storage key is stored as offline learning state;
- browser data is resilience state, not canonical backend business authority;
- server Auth/Access/Entitlement/Curriculum/Publication authority remains canonical;
- signing private key exists only on the server;
- Student verifies only the public verification identity;
- no automatic `skipWaiting` / forced reload during study;
- offline use is bounded by profile/device scope + stored lease + signed lesson authorization + time bounds + asset integrity;
- an explicit online denial/revocation must never be converted into offline authorization;
- no Stage17 before Stage16 closure.

## 3. Verified existing architecture — do not rebuild

### 3.1 PWA shell

Already exists:

- service worker caches app shell/static assets;
- `/v1` is excluded from SW cache/interception;
- installable shell acceptance exists;
- no forced update activation.

### 3.2 Bounded offline lease

Server authority:

`GET /v1/student/offline/lease`

The lease remains bounded by current Student session, bound non-revoked device, server time, entitlement and expiration.

Client storage:

- IndexedDB DB `alwaslh-student-offline`;
- `leases` store scoped by `profileId:deviceId`;
- exact-scope logout/session-expiry/rebind cleanup;
- clock rollback tolerance enforced.

### 3.3 Protected lesson materialization

Routes:

- `GET /v1/student/offline/lease`
- `GET /v1/student/offline/lessons/:lessonId/manifest`
- `GET /v1/student/offline/lessons/:lessonId/assets/:assetId?revision=<n>`

Materialization already enforces current Student/device/entitlement/published Reader authority before issuing data.

IndexedDB `lessonPackages` already has:

- exact profile/device scope;
- bounded per-lesson and per-scope payload budgets;
- atomic validated replacement;
- no silent eviction;
- manual removal and exact-scope cleanup.

### 3.4 Server-signed offline authorization

Already implemented:

- P-256 / ES256 manifest signing;
- canonical full-manifest payload;
- key ID derived from public key;
- fail-closed production signing configuration;
- browser WebCrypto verification using configured public SPKI.

## 4. Important correction to the old handoff

The 2026-09-12 version of this document listed three items as missing. They are **already implemented in current post-PR55 code** and were directly inspected before starting `STUDENT-016I`.

### Durable non-secret scope — IMPLEMENTED

`apps/student-web/src/offline-session.ts` persists only the active `profileId + deviceId` selector in localStorage and validates it fail-closed. It cleans the obsolete sessionStorage key.

### Read-time signed authorization — IMPLEMENTED

`apps/student-web/src/offline-content-store.ts` calls `verifyOfflineLessonAuthorization(...)` when deciding whether a stored package may be used. It reconstructs the stored manifest and requires the signed payload to match current stored metadata.

### Read-time blob integrity — IMPLEMENTED

Protected package use rechecks each stored Blob byte size and SHA-256 before returning it to the caller.

Unit coverage already rejects wrong device/class/scope, modified metadata, signature mutation, blob mutation, expiry and clock rollback.

Therefore `STUDENT-016I` must **connect runtime behavior to these primitives**, not rewrite them.

## 5. `STUDENT-016I` — true cold-start offline Reader

### Proven pre-fix runtime gap

Direct inspection of current base proved:

1. `App.tsx` stopped at a connection gate before the Student shell on offline startup.
2. `student-learning.tsx` required online curriculum loading before lesson routing.
3. `student-reader.tsx` had no stored-package rendering path.
4. saved Downloads exposed update/remove but no direct open action.
5. existing PWA acceptance explicitly expected the connection gate on an anonymous offline shell; existing download acceptance did not prove Reader use after restart.

### Implementation on active branch

`apps/student-web/src/App.tsx`

- discovers the previously verified durable local Student/device scope when startup cannot reach the server;
- creates only a local presentation profile derived from that scope;
- does not invent/persist a server session or token;
- when server auth is reachable, normal server session authority is unchanged.

`apps/student-web/src/student-learning.tsx`

- only an offline **lesson** route bypasses the online curriculum catalog;
- Learn/Subject browsing remains honestly offline/unavailable without server catalog state.

`apps/student-web/src/student-reader.tsx`

- adds `StudentOfflineLessonReaderPage`;
- calls `loadUsableOfflineLessonPackage(profileId, deviceId, lessonId)`;
- renders no protected content unless lease/scope/signature/time/blob checks all pass;
- creates temporary Blob object URLs only after verification;
- invalid/tampered/expired content fails closed with learner-safe copy.

`apps/student-web/src/student-offline-downloads.tsx`

- saved packages expose explicit `فتح الدرس` using the canonical lesson route.

## 6. `STUDENT-016I` executable acceptance

New test:

`apps/student-web/e2e/offline-reader-cold-start.e2e.spec.mjs`

Required positive path:

`download online → wait for Service Worker shell → clear HTTP session cookie → close Chromium → relaunch same persistent browser profile → set browser offline → deep-link to saved lesson → verified Reader renders saved title/text/image`.

This is intentionally stronger than page reload: Chromium itself is closed and relaunched with the same persistent browser profile, so localStorage/IndexedDB/Service Worker state must truly survive restart.

Required fail-closed cases in the same browser acceptance:

- stored ES256 signature mutation;
- same-size stored Blob corruption;
- different profile scope;
- different device scope;
- client clock rollback beyond tolerance;
- signed authorization expiry.

The test also proves the restarted browser has **no Student HTTP session cookie** before offline Reader use.

Workflow:

`.github/workflows/stage16-student-pwa.yml`

The `offline-client` real-Chromium job now runs:

- `offline-lease.e2e.spec.mjs`
- `offline-download.e2e.spec.mjs`
- `offline-reader-cold-start.e2e.spec.mjs`

## 7. Current verification status

For the active branch:

- code/security discovery — COMPLETE;
- implementation — first coherent batch committed;
- documentation synchronization — COMPLETE for top-level docs + this handoff;
- local execution in this tool environment — `NOT YET VERIFIED`;
- PR exact-head GitHub Actions — `NOT YET VERIFIED`;
- merge readiness — **NO** until exact-head CI is green.

Do not weaken the cold-start acceptance if it fails. Diagnose whether the owner is runtime code, Service Worker persistence, test setup, or an actual security contract.

## 8. After `STUDENT-016I`

Continue in order:

### `STUDENT-016R` — reconnect revalidation/purge

Current backend authority wins on reconnect. Revalidate/purge or disable local content for revoked device, expired/revoked entitlement, unpublished lesson, changed publication state or invalid/stale revision according to explicit policy.

### `STUDENT-016S` — revision/tombstone/cursor/delta

Schema presence is not sync authority. Prove authoritative writers + API + bounded cursor/delta + client idempotent application + tombstone semantics.

### conditional `STUDENT-016O`

Add an outbox only if later product-authorized offline writes actually require it. No speculative queue.

### `STUDENT-016G`

Close Stage16 only after exact-head quality/build/PostgreSQL/API/real-browser/offline/reconnect regression gates pass.

Then Stage17 may begin.

## 9. Findings summary

| ID | Status |
|---|---|
| `STUDENT-016-LEASE-002` | FIXED / VERIFIED |
| `STUDENT-016-CACHE-003` | FIXED / VERIFIED for protected materialization boundary |
| `STUDENT-016-DOWNLOAD-006` | FIXED / VERIFIED |
| `STUDENT-016-OFFLINE-AUTH-009` | read-time scope/signature/blob primitives IMPLEMENTED; runtime cold-start closure ACTIVE in `016I` |
| `UX-OFFLINE-104` | ACTIVE — `016I` runtime + restart acceptance |
| `STUDENT-016-REVOCATION-007` | OPEN → `016R` |
| `STUDENT-016-SYNC-001` | OPEN → `016S` |
| `STUDENT-016-OUTBOX-008` | CONDITIONAL → `016O` only if needed |

## 10. Continuation sentence

**Current merged baseline is `main@343ff1fd7b3d64d7e990b72606695365f520fa58` after verified PR #55. `STUDENT-016I` is active on `stage16/student-016i`. Durable scope, read-time ES256 verification and read-time Blob SHA-256 verification already exist; the active batch connects startup/routing/Reader UX to those authorities and gates the result with a persistent-profile Chromium restart test before proceeding to reconnect revalidation (`016R`).**
