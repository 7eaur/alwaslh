# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Start from the first incomplete item after reading Source of Truth + Issue #16.

Last synchronized: **2026-09-11 — Stage14/15 closed; Stage16 active.**

## Operating rules

- Repo: `7eaur/alwaslh`.
- Student branch: `parallel/stage14-student-product`.
- Issue #16 is shared execution ledger.
- Code/migrations/executable evidence outrank prose.
- No test weakening/auth bypass/fake API/duplicate durable authority/random timeout masking.
- Track A owns Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G; Track B owns Student Product.
- deployment/cutover deferred.

## Completed Track B checkpoints

- `STUDENT-014` Stage14 — DONE / VERIFIED / CLOSED @ `ac55f1435d232cadff334816407f1182125dda90`.
- `STUDENT-014I` Stage13F integration — DONE / VERIFIED @ `4a476e1f29cb605fce294d7c34fd68e8218a32e8` from canonical Stage13F main baseline `3aeca598...`.
- `STUDENT-015` Assessment — DONE / VERIFIED / CLOSED @ `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`.
- `STUDENT-016A` Safe PWA shell — DONE / VERIFIED @ `c1ae86036d4d302b8ca8c411227f41c37b4063ef`, run `34430284173`.
- `STUDENT-016B1` Server-issued bounded lease — DONE / VERIFIED @ `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd`, Stage16 `34430915847` + API `34430915786`.
- `STUDENT-016B2` Client lease strict-build repair — DONE / VERIFIED. TS18047 fixed without weakening strictness.
- `STUDENT-016C` Lease lifecycle integration — DONE / VERIFIED for current boundary @ runtime `53aeb972c4c891c3eecafdde0716b544751d2711`.

`STUDENT-016C` evidence:

- Stage16 `34551931757` — SUCCESS: lease PostgreSQL + Student build + PWA Chromium + IndexedDB lifecycle 3/3.
- Stage14 `34551931610`, attempt 2 — SUCCESS on exact same runtime: lint/typecheck/Vitest 22/22/build/contracts/full Chromium.
- activation/login/restore lease sync, scoped logout/session-expiry/rebind cleanup, account/device isolation and clock rollback are executable-proven.
- no protected lesson/media blobs are stored yet.

## Active Track B queue

### STUDENT-016D — Explicit protected lesson download contract

**Priority: P1 · Status: ACTIVE / EXACT NEXT ITEM**

Required before storing protected bytes:

1. live-check Student HEAD, `main`, Issue #16 and Track A shared changes;
2. inspect actual canonical Reader/content/publication/media code + migrations;
3. define smallest server-authorized offline lesson manifest using existing authority;
4. manifest must provide stable lesson/asset IDs, explicit revision/provenance, SHA-256/checksum and exact byte sizes;
5. issue material only when content is currently Published + entitled and device/session authority is valid;
6. expose no raw storage key and never cache current Reader `/v1` response in Service Worker Cache API;
7. define account/device storage budget before blobs;
8. define exact per-download accounting, atomic/failure rollback and deterministic eviction/removal policy;
9. add server integration/contract evidence before client blob storage.

---

### STUDENT-016E — Offline content store + protected Reader path

**Priority: P1 · Status: PENDING 016D**

Required:

- account/device-scoped content records;
- checksum validation before commit;
- budget enforcement and exact byte accounting;
- failure leaves no partial durable materialization;
- deterministic eviction/removal;
- offline Reader uses only explicitly materialized authorized content;
- lease enforced using server-time estimate;
- real Chromium isolation/checksum/budget/offline-read acceptance.

---

### STUDENT-016R — Reconnect revalidation / revocation purge

**Priority: P1 · Status: PENDING 016E**

Required:

- recheck lease/device/session-derived authority when online;
- recheck entitlement and publication state;
- disable/delete revoked, expired or unpublished material;
- never continue showing protected bytes merely because they exist locally;
- real reconnect/revocation Chromium regression.

---

### STUDENT-016F — Revisions / tombstones / delta / outbox

**Priority: P1 · Status: PENDING SAFE MATERIALIZATION**

Current state: `content_revisions`, `content_tombstones`, `sync_checkpoints` are dormant/unwired, not authority.

Required:

- authoritative revision writers;
- tombstone semantics;
- bounded server cursor/delta API;
- client delta application;
- outbox only for product-authorized offline writes;
- retry/idempotency/conflict behavior;
- reconnect reconciliation tests.

---

### STUDENT-016G — Stage16 closure

**Priority: P0 process gate · Status: PENDING**

Require one exact runtime HEAD with:

- Student lint/typecheck/unit/build;
- API regression if shared API changed;
- clean PostgreSQL integration;
- real Chromium SW lifecycle;
- IndexedDB account/device isolation;
- lease expiry/clock rollback;
- explicit protected downloads;
- checksum/storage-budget/rollback/eviction evidence;
- revocation/reconnect purge;
- revisions/tombstones/delta/outbox behavior where Stage16 contract requires it;
- responsive/accessibility regression;
- synchronized docs + Issue #16 closure report.

## Parallel Track A

Stage13G remains Track A. Track B must not absorb Admin/AI/Question Bank authority. Any shared API must be the smallest additive contract required for Student offline materialization and documented in Issue #16.

## Later Student sequence

- Stage17 Personal Learning Data — **BLOCKED UNTIL Stage16 CLOSES**.
- Stage18 Notifications.
- Stage19 Progress/Statistics/Achievements.
- Stage20+ later roadmap.
- release/deployment only when explicitly reopened.

## Exact first item

`STUDENT-016D`: inspect canonical Reader/content/media authority, then fix the explicit protected download manifest + budget/checksum/accounting/rollback/eviction contract **before any protected blob is written**.
