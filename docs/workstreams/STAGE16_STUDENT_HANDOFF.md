# STAGE16 STUDENT HANDOFF — Offline / PWA

> Canonical continuation checkpoint for the active Stage16 work. Current `main` code, migrations and executable CI evidence outrank prose. Anything not executed is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## 1. Identity / current ownership

- Repository: `7eaur/alwaslh`
- Canonical baseline: **live `main`**
- Shared ledger: GitHub Issue #16
- Current operating decision: unified post-Stage13 continuation. Old Track A/Track B long-lived branches are historical after PR #33 integration.
- New Stage16 work starts from current `main` on a short-lived branch.
- One owner now carries the remaining product, but backend/database/frontend concerns must still be changed in their correct layers.

## 2. Integration checkpoint

PR #33 integrated verified Stage13G with the latest Student Product.

- PR verification head: `dcdae7579a40878c71f64593280a0df2f8363ee2`
- merge commit: `5e22c3ff157b42b6da47febe205dd91fcb264eed`
- wider PR verification: **19/19 workflows SUCCESS**
- Stage16 run on the PR head: `34560999667` — all Stage16 jobs SUCCESS.

Stage16 `34560999667` specifically verified:

- installable PWA app shell in real Chromium;
- PostgreSQL offline lease + protected download contracts;
- API signing unit policy;
- real Chromium IndexedDB lease lifecycle + protected materialization + signed-manifest tamper rejection.

Before this documentation sync, live `main` was `8006a7c4b2fa66bcac9cfb3addcd52fa831c42df`; always live-check after this docs PR merges.

## 3. Stable security/business invariants

Do not violate these while finishing Stage16:

- `/v1` never becomes Service Worker Cache API authority;
- protected Reader/media remains `private,no-store` online;
- no password/session cookie/token/device private key/raw media storage key in offline IndexedDB;
- browser local data is resilience state, not canonical backend business authority;
- current server Auth/Access/Entitlement/Curriculum/Publication authority remains canonical;
- signed authorization private key exists only on the server;
- Student receives/verifies only the non-secret public verification identity;
- no automatic `skipWaiting`/forced reload during study;
- no Stage17 before Stage16 closes;
- no fake sync authority from dormant tables.

## 4. Verified Stage16 architecture

### 4.1 Safe PWA shell — VERIFIED

- Service Worker caches app shell/static assets only;
- `/v1` is excluded from SW cache/interception;
- real Chromium offline shell behavior is tested;
- no automatic `skipWaiting`.

### 4.2 Bounded offline lease — VERIFIED

Server route:

`GET /v1/student/offline/lease`

Authority:

- Student session required;
- non-revoked bound device required;
- PostgreSQL/server time authority;
- max lease 24h;
- lease clipped by session expiration;
- grants clipped by entitlement expiration;
- metadata only, `private,no-store`.

Client:

- IndexedDB DB `alwaslh-student-offline`;
- `leases` store scoped by `profileId:deviceId`;
- login/activation/restore refresh best-effort;
- exact-scope logout/session-expiry/device-rebind cleanup;
- >5-minute backward clock movement rejects lease use.

### 4.3 Protected lesson materialization — VERIFIED for download/storage boundary

Server files:

- `apps/api/src/offline/service.ts`
- `apps/api/src/offline/download.ts`
- `apps/api/src/offline/http.ts`
- `apps/api/src/curriculum/student-reader.ts`

Routes:

- `GET /v1/student/offline/lease`
- `GET /v1/student/offline/lessons/:lessonId/manifest`
- `GET /v1/student/offline/lessons/:lessonId/assets/:assetId?revision=<n>`

Manifest/assets are issued only after current Student session/device/entitlement/published Reader authority succeeds.

Manifest includes:

- profile/device identity;
- lesson/class identity;
- lesson title/summary;
- safe numeric `contentRevision`;
- publication time;
- issue/lease/authorization expiry times;
- stable asset IDs and positions;
- mime/size/dimensions/source-page/text where safe;
- SHA-256 checksums;
- exact revision-pinned download paths.

Client files:

- `apps/student-web/src/offline-store.ts`
- `apps/student-web/src/offline-content-store.ts`
- `apps/student-web/src/offline-download-api.ts`
- `apps/student-web/src/offline-download.ts`
- `apps/student-web/src/offline-session.ts`
- `apps/student-web/src/offline-authorization.ts`
- `apps/student-web/src/App.tsx`

Storage:

- IndexedDB v2 `lessonPackages` scoped by `profileId:deviceId`;
- 64 MiB max lesson payload;
- 256 MiB max account/device scope payload;
- replacement-aware accounting;
- no silent eviction;
- exact size + SHA-256 before commit;
- atomic replacement only after the complete new package validates;
- failed/tampered download cannot overwrite prior valid package;
- manual remove + exact-scope cleanup.

## 5. Server-signed offline authorization — IMPLEMENTED / VERIFIED AT ISSUANCE+DOWNLOAD

This is newer than several older Stage16 docs and must not be missed.

### Server

`apps/api/src/offline/signing.ts` provides:

- P-256 / ES256 signing;
- canonical JSON serialization of the entire offline lesson manifest;
- signed fields covering profile/device/class/lesson/revision/publication/issue/expiry and every asset metadata/checksum/size/path;
- public-key-derived SHA-256 `keyId`;
- fail-closed production behavior: manifest issuance returns unavailable if the private signing key is not configured;
- only test environment may fall back to the repository test key.

`apps/api/src/offline/download.ts` now returns:

```text
{
  manifest: <StudentOfflineLessonManifest>,
  authorization: <ES256 signed envelope>
}
```

### Client

`apps/student-web/src/offline-authorization.ts`:

- consumes configured `VITE_OFFLINE_AUTH_PUBLIC_KEY_SPKI` only;
- derives and checks `keyId`;
- imports a P-256 SPKI public key into WebCrypto;
- verifies ES256/SHA-256 signature;
- decodes signed payload;
- requires canonical payload equality;
- requires outer manifest == signed manifest;
- fails with typed verification errors on malformed/key/signature/payload/mismatch states.

`offline-download.e2e.spec.mjs` proves:

- signed manifest is received;
- server key identity matches expected test public key;
- valid package is stored;
- tampering the outer manifest while leaving the signature unchanged is rejected;
- tampering asset bytes is rejected by checksum;
- logout deletes package scope.

Railway deployment configuration contains:

- API: private signing key variable name `OFFLINE_AUTH_SIGNING_PRIVATE_KEY_PEM_B64`;
- Student: public verification key variable `VITE_OFFLINE_AUTH_PUBLIC_KEY_SPKI`.

Never copy their actual values into docs/chat.

## 6. Why `STUDENT-016-OFFLINE-AUTH-009` is only PARTIALLY FIXED

Download-time signature verification is **not yet the complete cold-offline authorization chain**.

Current code still has these gaps:

### 6.1 Active scope is not durable across a true browser restart

`apps/student-web/src/offline-session.ts` stores active scope in:

`sessionStorage["alwaslh-student-offline:active-scope"]`

That intentionally disappears when the browser session ends. A true cold start therefore has no durable non-secret selector for which profile/device package library to inspect.

### 6.2 Signed envelope is stored but not re-verified as read-time authority

`StoredOfflineLessonPackage` stores the authorization envelope, but current `offlineLessonPackageAllowsUse()` is still driven by the stored mutable lease + duplicated package fields and does not call `verifyOfflineLessonAuthorization()` at use/render time.

Before protected cold-offline rendering, the application must re-verify the stored signed payload and derive trusted metadata from that signed payload rather than trusting mutable duplicated fields.

### 6.3 Blob checksum is verified at write time, not every offline read

`saveOfflineLessonPackage()` hashes blobs before commit. The cold-offline Reader must additionally re-hash stored blobs against **signed** checksums when opening/using them.

### 6.4 No accepted cold-start offline Reader flow yet

There is no complete executable acceptance proving:

`download online → close/restart browser context → network unavailable → PWA shell → durable scope discovery → signed authorization verify → blob verify → offline lesson render`.

Until that exists, Stage16 cannot claim true protected cold-offline Reader completion.

## 7. Exact next Stage16 batch

Implement in this order:

1. **Durable non-secret scope selector**
   - stores only identity needed to discover local packages;
   - never password/token/session/private device key;
   - login/restore updates it;
   - logout/rebind removes/replaces exact scope.
2. **Read-time signed authorization verification**
   - reconstruct/parse stored package manifest safely;
   - verify key ID, ES256 signature, canonical payload;
   - ensure stored package fields/assets match signed payload;
   - fail closed.
3. **Read-time blob integrity**
   - SHA-256 every blob before offline rendering/use;
   - match signed checksums and byte sizes.
4. **Offline library/Reader UX**
   - app shell loads when network/session bootstrap cannot reach server;
   - discover valid package(s) for durable active scope;
   - clearly show offline mode;
   - online-only Assessment/actions unavailable or honestly disabled.
5. **Real Chromium cold-start acceptance**
   - download online;
   - close/restart context;
   - network offline;
   - open Reader;
   - signature tamper rejection;
   - blob tamper rejection;
   - authorization expiry rejection;
   - clock rollback rejection;
   - account/device isolation.
6. **Reconnect revalidation/purge**
   - session/device state;
   - entitlement;
   - publication/unpublication;
   - lesson revision;
   - purge/disable revoked/expired/invalid/stale package per defined policy.
7. **Revision/tombstone/cursor/delta**
   - prove authoritative writers;
   - bounded server cursor/delta API;
   - client application/idempotency;
   - tombstone semantics.
8. **Outbox only if required**
   - only for explicitly product-authorized offline writes in later stages;
   - bounded retry/idempotency/conflict policy.
9. **Stage16 closure**
   - exact-head lint/typecheck/unit/build;
   - clean PostgreSQL/API contracts;
   - real Chromium cold-offline/reconnect;
   - a11y/responsive regression;
   - wider product regression;
   - docs + Issue #16.

## 8. Reconnect / revocation finding

`STUDENT-016-REVOCATION-007` remains OPEN.

Do not keep showing protected bytes merely because they exist locally. On reconnect, current backend authority wins. Revoked device, expired/revoked entitlement, unpublished lesson, changed publication state or invalid revision must be reconciled and local material disabled/purged per the final documented policy.

## 9. Sync finding

`content_revisions`, `content_tombstones`, `sync_checkpoints` exist from earlier schema, but schema presence alone is not sync authority.

`STUDENT-016-SYNC-001` and `STUDENT-016-OUTBOX-008` remain OPEN until writers + API + client + executable reconciliation tests exist.

## 10. Current hosted/runtime context

Railway inspection/dev stack is live:

- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`

Latest known service statuses at this sync: API/Admin/Student/PostgreSQL SUCCESS.

The hosted environment does not close Stage16 by itself. Repository/CI executable acceptance is still required.

## 11. Content note

Grade 9 English canonical media proof is materialized in Railway as **Draft**, not Student-visible. It may be reviewed/published independently of the Stage16 code batch, but do not mix bulk content publication into the cold-offline architecture change.

See `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`.

## 12. Findings summary

| ID | Status |
|---|---|
| `STUDENT-016-LEASE-002` | FIXED / VERIFIED |
| `STUDENT-016-CACHE-003` | FIXED / VERIFIED for protected materialization boundary |
| `STUDENT-016-DOWNLOAD-006` | FIXED / VERIFIED |
| `STUDENT-016-OFFLINE-AUTH-009` | **PARTIAL FIX** — server signature + download verification VERIFIED; cold-start/read-time authority OPEN |
| `STUDENT-016-REVOCATION-007` | OPEN |
| `STUDENT-016-SYNC-001` | OPEN |
| `STUDENT-016-OUTBOX-008` | OPEN |

## 13. Continuation sentence

**Stage14 and Stage15 are CLOSED / VERIFIED and integrated with Stage13G in `main`. Stage16 is ACTIVE. PWA shell, bounded lease/lifecycle, protected materialization and ES256 signed authorization verification at download time are VERIFIED on the integrated PR #33 head (`dcdae757...`, Stage16 run `34560999667`). Stage16 must next implement durable non-secret scope discovery, read-time signed-envelope + blob verification, true cold-start offline Reader, reconnect purge and then revision/tombstone/delta/outbox before Stage17 begins.**
