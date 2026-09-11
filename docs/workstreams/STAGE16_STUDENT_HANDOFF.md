# STAGE16 STUDENT HANDOFF — Offline / PWA

> Canonical continuation checkpoint for Track B. Current code, migrations and executable CI evidence outrank prose. Anything not executed is `NOT YET VERIFIED`.

Last synchronized: **2026-09-11**.

## 1. Identity / ownership

- Repository: `7eaur/alwaslh`
- Track B branch: `parallel/stage14-student-product`
- Shared ledger: GitHub Issue #16
- Track B owns Student-facing Stage16 implementation; small shared API additions are allowed only when proven necessary, minimal, compatible and documented.
- Track A owns Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G by default; never duplicate those authorities.
- Deployment/hosting remains deferred.

## 2. Verified checkpoints

- Stage14: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage15: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 safe PWA shell: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED.
- Stage16 bounded server lease: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED.
- Stage16 client lease lifecycle: `53aeb972c4c891c3eecafdde0716b544751d2711` — VERIFIED for that boundary.
- Stage16 protected materialization: `d350206710003da311693834db90e348d1a89bc3` — **VERIFIED for download/storage/integrity boundary**.

Exact-head `d3502067...` evidence:

- Stage16 Student PWA `34557753480` — SUCCESS.
- Stage14 Student Product `34557753472` — SUCCESS.
- API Regression for Student `contentRevision` boundary `34557536412` — SUCCESS.

## 3. Invariant boundaries

- `/v1` never becomes Service Worker Cache API authority.
- protected Reader/media remains `private,no-store`.
- no password/session cookie/token/device private key/raw storage key in Stage16 offline DB.
- online Reader/manifest issuance remains server-authorized by session/device/entitlement/publication.
- no automatic `skipWaiting`.
- browser state is resilience state, not canonical backend business authority.
- `content_revisions` / `content_tombstones` / `sync_checkpoints` remain dormant until real writers/API/client consumers are proven.

## 4. Verified protected materialization architecture

### Server

Relevant files:

- `apps/api/src/offline/service.ts`
- `apps/api/src/offline/download.ts`
- `apps/api/src/offline/http.ts`
- `apps/api/src/curriculum/student-reader.ts`

Contracts:

- `GET /v1/student/offline/lease`
- `GET /v1/student/offline/lessons/:lessonId/manifest`
- `GET /v1/student/offline/lessons/:lessonId/assets/:assetId?revision=<n>`

Manifest is issued only after the current Student session/device/entitlement Reader path succeeds. It carries lesson/class IDs, title/summary, safe numeric `contentRevision`, publication time, authorization expiry, stable asset IDs, SHA-256, byte sizes and exact download paths.

### Client

Relevant files:

- `apps/student-web/src/offline-store.ts`
- `apps/student-web/src/offline-content-store.ts`
- `apps/student-web/src/offline-download-api.ts`
- `apps/student-web/src/offline-download.ts`
- `apps/student-web/src/offline-session.ts`
- `apps/student-web/src/App.tsx`
- `apps/student-web/e2e/offline-download.e2e.spec.mjs`

IndexedDB `alwaslh-student-offline` is version 2:

- `leases`
- `lessonPackages`, indexed by `scopeKey = profileId:deviceId`

Storage rules:

- max lesson payload: 64 MiB;
- max payload per profile/device scope: 256 MiB;
- replacement-aware byte accounting;
- no silent eviction;
- verify every asset byte size + SHA-256 before commit;
- package replacement occurs only after the complete new package verifies;
- quota failures are explicit;
- logout/session expiry/rebind exact-scope cleanup removes lease + packages;
- user can remove a package manually.

## 5. Materialization defects found and root-fixed

1. **IndexedDB test downgrade:** browser helpers still opened DB version 1 after runtime moved to v2. Fixed by opening the installed schema rather than pinning an obsolete version.
2. **PostgreSQL BIGINT serialization:** Student curriculum exposed `content_revision` as string, causing `"1" !== 1` and false stale-package state. Fixed at API boundary by normalizing to a safe number.
3. **Lease renewal assertion:** Reader/download activity intentionally renews the server lease; acceptance now asserts authority/scope continuity instead of exact timestamp equality.
4. **Learning hierarchy regression:** downloads were initially inserted between Curriculum and Assessment. Final product hierarchy is **Curriculum → Assessment → Downloads → Access**.
5. **Revision race UX:** stored package may be newer than a catalog loaded moments earlier. Freshness is monotonic (`storedRevision >= catalogRevision`), so a newer package is not incorrectly labeled stale.

## 6. Security blocker for true cold-offline Reader

### `STUDENT-016-OFFLINE-AUTH-009` — P1 — OPEN / PROVEN

Current lease/package records in IndexedDB are mutable browser data. `offlineLessonPackageAllowsUse()` validates scope, timestamps and grants but the authorization envelope itself is unsigned. A cold-start Reader must not elevate that mutable JSON into protected-content authority.

Required architecture before cold-offline rendering:

1. Server issues a cryptographically signed authorization envelope over canonical serialized fields.
2. Signed payload must bind at least: schema/version, profile ID, device ID, class ID, lesson ID, content revision, publication time, issued time, authorization expiry, asset IDs/checksums/byte sizes.
3. Client verifies using a pinned/known server public verification key; no signing secret may exist in Student JS/IndexedDB.
4. Package use fails closed on missing/unknown key ID, malformed payload, signature failure, field mismatch, expiry or clock rollback.
5. Offline Reader derives trusted metadata from the verified signed envelope rather than mutable duplicate fields.
6. Blob integrity must be checked against signed checksums at offline read/use, not only at initial download.
7. The security claim must stay realistic: browser-side protection cannot become DRM against a hostile user who controls their own browser; the goal is server-authentic authorization/integrity, bounded expiry and correct application behavior.

## 7. Cold-start UX requirement

Current `sessionStorage` active-scope pointer intentionally disappears when the browser session ends, so it cannot discover a package after a real browser restart.

The cold-offline batch must add a durable **non-secret** active offline scope selector. It may identify only profile/device scope (and optional presentation-only cached identity metadata if needed), never password/session/token/private key. Online login/restore updates it; logout/session-expiry/rebind removes or replaces it with exact scope semantics.

When network/session bootstrap fails because the device is genuinely offline:

- app shell should load from Service Worker;
- if a valid signed package exists for the durable active scope, Student can enter an explicit offline library/Reader state;
- the UI must not pretend online status or expose online-only Assessment/actions;
- if no valid package exists, show an honest offline-empty state.

## 8. Reconnect / revocation still required

Cold-offline alone does not close Stage16. On reconnect the client must revalidate current session/device/entitlement/publication/revision and purge or disable packages that are revoked, expired, unpublished or obsolete according to the final policy.

`STUDENT-016-REVOCATION-007` remains OPEN until executable evidence covers this flow.

## 9. Remaining sync boundary

Migration `0004_ai_and_sync.sql` contains `content_revisions`, `content_tombstones`, `sync_checkpoints`, but there is still no verified Student delta API/writer/client flow. Treat as **DORMANT / NOT YET WIRED**.

`STUDENT-016-SYNC-001` and `STUDENT-016-OUTBOX-008` remain OPEN.

## 10. Exact next engineering batch

1. Implement server signing-key configuration with production-safe failure behavior and a non-secret public verification identity for Student Web.
2. Canonically serialize + sign the offline lesson authorization manifest.
3. Verify signatures and signed-field consistency client-side; add unit/API tamper tests.
4. Upgrade stored package representation as needed without breaking exact-scope cleanup/budget/atomicity.
5. Add durable non-secret active offline scope discovery.
6. Implement real cold-start offline Reader from signed verified package bytes.
7. Add real Chromium: download online → close/restart context → network unavailable → app shell → offline Reader → tamper rejection → expiry/clock rollback rejection.
8. Then implement reconnect revalidation/purge.
9. Only after that wire revision/tombstone/cursor/delta/outbox and close Stage16 on one exact HEAD.

## 11. Continuation sentence

**Stage14 and Stage15 are CLOSED / VERIFIED. Stage16 remains ACTIVE. Safe PWA, bounded lease/lifecycle and explicit protected lesson materialization are VERIFIED through `d3502067...`, Stage16 run `34557753480` and Stage14 run `34557753472`. True cold-offline Reader is intentionally blocked until `STUDENT-016-OFFLINE-AUTH-009` is fixed with server-authentic signed authorization + read-time blob integrity + durable non-secret scope discovery.**
