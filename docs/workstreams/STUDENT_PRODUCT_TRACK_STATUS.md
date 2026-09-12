# STUDENT PRODUCT TRACK STATUS — Stage14+

> Current Student/product status after full integration into `main`. Code/migrations + executable CI evidence outrank prose. Unexecuted work = `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## 1. Identity

- Repository: `7eaur/alwaslh`
- Canonical baseline: live `main`
- Shared ledger: GitHub Issue #16
- Current operating decision: unified post-Stage13 continuation; old `parallel/stage14-student-product` branch is historical/reference after PR #33 integration.
- Detailed active-stage handoff: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
- Hosted inspection/dev stack: Railway, documented in `docs/operations/RAILWAY_LIVE_STATE.md`

## 2. Integrated checkpoint

PR #33 integrated Stage13G + current Student Product into `main`.

- verification head: `dcdae7579a40878c71f64593280a0df2f8363ee2`
- wider PR matrix: **19/19 workflows SUCCESS**
- Stage16 workflow: `34560999667` — SUCCESS for app shell + PostgreSQL lease/download/signing contracts + real Chromium lifecycle/materialization
- merge commit: `5e22c3ff157b42b6da47febe205dd91fcb264eed`

Subsequent `main` commits fixed Railway Docker deployment and added the scoped Grade 9 English content bootstrap. Before this documentation sync, `main` was `8006a7c4b2fa66bcac9cfb3addcd52fa831c42df`.

## 3. Stage ledger

| Stage | State |
|---|---|
| Stage14 Student Product | CLOSED / VERIFIED |
| Stage15 Practice / Assessment | CLOSED / VERIFIED |
| Stage16 Offline / PWA | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17 Personal Learning | BLOCKED BY Stage16 closure |
| Stage18+ | pending roadmap sequence |

## 4. Stage14 boundary — CLOSED / VERIFIED

Verified activation/login/recovery/device/session, entitlements/class redemption, entitled curriculum, protected Reader/media/OCR, search/TTS capability, RTL/mobile-first product hierarchy, session/offline/error states and real browser coverage.

## 5. Stage15 boundary — CLOSED / VERIFIED

Verified canonical published immutable quiz snapshots, Practice/Test behavior, persisted ordering, resume/restart/abandon, server-owned scoring/finalization/history, publication/access rechecks and real Chromium regressions.

## 6. Stage16 implemented/verified boundary

### PWA shell

- app-shell/static assets only;
- `/v1` excluded from SW cache/interception;
- protected Reader/API remains `private,no-store`;
- no automatic `skipWaiting`.

### Bounded offline lease/lifecycle

- `GET /v1/student/offline/lease` is bound to Student session + non-revoked device + entitlement;
- PostgreSQL/server time authority;
- maximum 24h, clipped by session/entitlement expiry;
- account/device-scoped IndexedDB;
- login/activation/restore refresh best-effort;
- exact-scope logout/session-expiry/rebind cleanup;
- backward-clock guard.

### Protected materialization

- dedicated offline lesson manifest + asset routes;
- only current Published + entitled Reader material is issued;
- stable IDs, numeric content revision, publication provenance, SHA-256 and exact byte size;
- IndexedDB package storage scoped by `profileId:deviceId`;
- 64 MiB lesson and 256 MiB scope budgets;
- no silent eviction;
- checksum/byte-size verification before atomic commit;
- failed/tampered downloads do not replace a valid package;
- manual removal and exact-scope cleanup.

### Signed offline authorization — implemented / verified at issuance+download boundary

Current integrated code adds:

- API `OfflineAuthorizationSigner` using P-256/ES256;
- fail-closed manifest issuance when production signing configuration is absent;
- signed canonical manifest binding profile/device/class/lesson/revision/publication/expiry/asset metadata;
- key ID derived from public SPKI;
- Student uses only a configured public verification key;
- Student validates key ID, ES256 signature, canonical signed payload and outer-manifest equality before storing downloaded content;
- API signing policy + PostgreSQL contracts + real Chromium tamper rejection verified in Stage16 run `34560999667`.

Railway is configured with a private signing-key variable only on API and a public verification-key variable on Student Web. Actual key values must never be copied into docs/chat.

## 7. Why Stage16 is still open

Signing at download time is necessary but not sufficient for a true protected cold-offline Reader.

Current remaining gaps:

1. **Durable scope discovery:** active scope is still kept in `sessionStorage`; a true browser restart loses it.
2. **Read-time authorization verification:** stored authorization is not yet re-verified and promoted to trusted read-time metadata before rendering.
3. **Read-time blob integrity:** blobs were verified when downloaded, but must be re-hashed against signed checksums when used offline.
4. **Cold-start Reader:** no accepted flow yet for app restart + network unavailable + offline library/Reader.
5. **Reconnect purge:** session/device/entitlement/publication/revision must be revalidated and revoked/expired/unpublished/invalid content purged/disabled.
6. **Sync:** `content_revisions`, `content_tombstones`, `sync_checkpoints` are not yet a proven writer/API/client delta authority.
7. **Outbox:** bounded outbox semantics for future product-authorized offline writes remain open.

## 8. Findings

| ID | Sev | Finding | Current status |
|---|---:|---|---|
| `STUDENT-016-LEASE-002` | P1 | bounded offline lease/lifecycle | FIXED / VERIFIED |
| `STUDENT-016-CACHE-003` | P1 | explicit protected materialization | FIXED / VERIFIED for download/storage boundary |
| `STUDENT-016-DOWNLOAD-006` | P1 | manifest/budget/checksum/accounting/rollback/removal | FIXED / VERIFIED |
| `STUDENT-016-OFFLINE-AUTH-009` | P1 | local mutable authorization cannot be cold-start authority | **PARTIAL FIX**: server signature + download verification done; read-time/cold-start authority still OPEN |
| `STUDENT-016-REVOCATION-007` | P1 | reconnect revalidation/purge | OPEN |
| `STUDENT-016-SYNC-001` | P1 | revision/tombstone/cursor/delta | OPEN / PROVEN absent as full flow |
| `STUDENT-016-OUTBOX-008` | P1 | bounded durable outbox | OPEN |

## 9. Hosted runtime

Railway inspection/dev stack currently reports API/Admin/Student/PostgreSQL as **SUCCESS**.

- Student: `https://alwaslh-dev-student-7eaur-production.up.railway.app`
- Admin: `https://alwaslh-dev-admin-7eaur-production.up.railway.app`
- API: `https://alwaslh-dev-api-7eaur-production.up.railway.app`

This is live inspection/development hosting, not final Stage28 production declaration.

## 10. Content proof

Grade 9 English canonical-source proof on Railway:

- 75 source images / 8,390,689 bytes;
- 75 ready media assets;
- 300 variants;
- 75 lesson assets across 10 lessons;
- publication state: **Draft only**.

No AI questions were auto-generated/published by the bootstrap. Review/publication and any later question authoring must use existing Admin/Question Bank authority.

## 11. Exact next action

Create a short-lived branch from live `main` and close Stage16 in this order:

1. durable non-secret active scope;
2. stored signed-envelope verification at use time;
3. read-time blob checksum verification;
4. cold-start offline library/Reader with network unavailable;
5. tamper/expiry/clock rollback fail-closed browser tests;
6. reconnect revalidation + purge;
7. revisions/tombstones/server cursor/delta/client application;
8. outbox only where later product scope requires offline writes;
9. exact-head wider closure matrix + docs/Issue #16;
10. only then begin Stage17.
