# STUDENT PRODUCT TRACK STATUS — Stage14+

> Branch-specific status for Track B. Code/migrations + executable CI evidence outrank prose. Unexecuted work = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11 — Stage14 CLOSED / VERIFIED; Stage15 CLOSED / VERIFIED; Stage16 ACTIVE. Protected materialization VERIFIED; cold-offline authorization is the active security boundary.**

## Track identity

- Repo: `7eaur/alwaslh`
- Branch: `parallel/stage14-student-product`
- Ledger: GitHub Issue #16
- Operating contract: `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
- Detailed active-stage handoff: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
- Deployment: deferred

## Canonical checkpoints

- Stage14 runtime: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Canonical Stage13F main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student merge: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15 runtime: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 safe PWA shell: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED.
- Stage16 server lease + PWA runtime: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED.
- Stage16 client lease lifecycle runtime: `53aeb972c4c891c3eecafdde0716b544751d2711` — VERIFIED for the implemented lease lifecycle boundary.
- Stage16 protected lesson materialization runtime: `d350206710003da311693834db90e348d1a89bc3` — VERIFIED for manifest/download/checksum/budget/atomic storage/delete/isolation boundary.

Documentation commits after a runtime checkpoint do not replace runtime evidence.

## Stage14 boundary — CLOSED / VERIFIED

Verified activation/login/recovery/device/session, entitlements/class redemption, entitled Curriculum, protected Reader/media/OCR, search/TTS capability, honest offline/session states, RTL/mobile-first hierarchy, keyboard focus and responsive behavior.

## Stage15 boundary — CLOSED / VERIFIED

Verified canonical published immutable quiz snapshots, create/resume/restart/abandon, persisted ordering, Practice feedback, Test withholding/finalization, server-owned scoring and history, publication/access rechecks and real Chromium regression.

## Stage16 — ACTIVE

### Batch 1 — safe PWA shell — VERIFIED

- app-shell/static assets only;
- `/v1` excluded from Service Worker caching/interception;
- protected Reader/Assessment/API responses never become Cache API authority;
- no automatic `skipWaiting`.

### Batch 2A/2B — bounded lease + client lifecycle — VERIFIED FOR IMPLEMENTED BOUNDARY

- `GET /v1/student/offline/lease` is session/device/entitlement bounded and uses PostgreSQL time;
- max lease 24h clipped by session and entitlement expiry;
- IndexedDB scoped by `profileId:deviceId`;
- login/activation/restore refresh is best-effort;
- logout/session expiry/device rebind cleanup is exact-scope;
- 5-minute backward-clock guard remains enabled;
- no password/session cookie/token/device private key/raw storage key is copied to Stage16 offline DB.

### Batch 3 — explicit protected lesson materialization — VERIFIED

Runtime: `d350206710003da311693834db90e348d1a89bc3`.

Implemented:

- dedicated Student offline lesson manifest + asset endpoints; existing Reader `/v1` responses are not cached;
- only currently entitled + Published Reader material is issued through the manifest path;
- manifest includes stable lesson/asset IDs, `contentRevision`, publication provenance, SHA-256, exact byte sizes and authorization expiry;
- IndexedDB upgraded to v2 with `lessonPackages` scoped by `profileId:deviceId`;
- 64 MiB max lesson payload;
- 256 MiB max payload per account/device scope;
- replacement-aware accounting; no silent eviction;
- WebCrypto SHA-256 + exact byte-size verification before commit;
- package write is atomic after all assets verify; failed/tampered downloads do not replace a valid prior package;
- manual removal supported;
- scope cleanup removes both lease and packages;
- UI supports select lesson → download/update/remove + usage display without disrupting learning hierarchy;
- revision comparison is monotonic: a package newer than a stale catalog is not mislabeled as old;
- API normalizes PostgreSQL `BIGINT` content revision to a safe number at the Student contract boundary.

Exact-head evidence for `d3502067...`:

- Stage16 Student PWA run `34557753480` — **SUCCESS**:
  - PostgreSQL lease/download contract PASS;
  - Student strict typecheck/build PASS;
  - real Chromium lease lifecycle + protected materialization PASS;
  - PWA shell PASS.
- Stage14 Student Product run `34557753472` — **SUCCESS**:
  - Student lint/typecheck/unit/build PASS;
  - Reader/curriculum PostgreSQL contracts PASS;
  - full real Chromium Student suite PASS.
- API Regression run covering the `contentRevision` contract fix: `34557536412` — **SUCCESS**.

Root causes closed during Batch 3:

- tests opening IndexedDB v1 after runtime moved to v2 were made schema-version resilient rather than pinning an obsolete version;
- PostgreSQL `BIGINT` content revision leaking as string caused `"1" !== 1` in browser state; fixed at API boundary;
- lease browser acceptance previously compared renewable timestamps byte-for-byte; fixed to assert stable authority/scope while allowing intentional renewal;
- download UI initially interrupted the learning order; final hierarchy remains **Curriculum → Assessment → Downloads → Access**.

## Active security finding before true cold-offline Reader

### `STUDENT-016-OFFLINE-AUTH-009` — P1 — OPEN / PROVEN

The current IndexedDB lease and stored lesson package metadata are ordinary mutable browser records. `offlineLessonPackageAllowsUse()` currently trusts locally stored lease grants/timestamps after structural/time checks. This is sufficient for the verified online materialization/lifecycle boundary, but it is **not sufficient to promote a cold-start offline Reader to protected-content authority** because local mutation could extend/alter the unsigned authorization metadata.

Decision:

- do **not** make the cold-offline Reader consume the current unsigned lease/package as authoritative access proof;
- add a server-authentic signed offline authorization/manifest envelope first;
- offline Reader must verify the signature and exact signed profile/device/class/lesson/revision/expiry/asset checksum fields before rendering;
- keep browser limitations explicit: a hostile user controlling their own browser is not a DRM-grade trusted execution environment; the goal is authentic server authorization + integrity + scoped expiry/purge, not impossible client-side content secrecy.

## Stage16 findings

| ID | Sev | Finding | Status |
|---|---:|---|---|
| `STUDENT-016-SYNC-001` | P1 | revision/tombstone/checkpoint schema lacks verified writers/API/client flow | OPEN / PROVEN |
| `STUDENT-016-LEASE-002` | P1 | bounded offline lease + client lifecycle | FIXED / VERIFIED FOR LEASE BOUNDARY |
| `STUDENT-016-CACHE-003` | P1 | explicit protected offline materialization | FIXED / VERIFIED FOR DOWNLOAD/STORAGE BOUNDARY |
| `STUDENT-016-QA-004` | P1 | strict TS nullability blocker | FIXED / VERIFIED |
| `STUDENT-016-CLIENT-005` | P1 | authenticated lease lifecycle/cleanup | FIXED / VERIFIED |
| `STUDENT-016-DOWNLOAD-006` | P1 | manifest/budget/checksum/accounting/rollback/removal | FIXED / VERIFIED |
| `STUDENT-016-REVOCATION-007` | P1 | reconnect revalidation/purge | OPEN |
| `STUDENT-016-OUTBOX-008` | P1 | delta/outbox authority | OPEN |
| `STUDENT-016-OFFLINE-AUTH-009` | P1 | unsigned local authorization cannot become cold-offline protected Reader authority | OPEN / ACTIVE NEXT |

## Exact next action

1. Define the smallest server-authentic signed authorization envelope for downloaded lesson manifests; pin/verify the server signing identity without introducing a browser-held signing secret.
2. Add signature-tamper contract/unit/browser evidence before using stored bytes in a cold-start Reader.
3. Persist only a non-secret durable active offline scope selector needed for browser-restart discovery; preserve account/device isolation and exact logout/rebind cleanup.
4. Implement true cold-start PWA → verified signed package → Reader rendering with the network unavailable.
5. Add reconnect revalidation against current session/device/entitlement/publication/revision and purge revoked/expired/unpublished/stale packages before claiming protected offline complete.
6. Then wire authoritative revisions/tombstones/cursor/delta and any bounded outbox required by later product-authorized offline writes.
7. Do not begin Stage17 until Stage16 closes on one exact HEAD with cold-offline + reconnect purge + sync evidence.
