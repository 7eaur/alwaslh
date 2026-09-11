# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> Operational continuity for replacement engineering conversations. Current code + migrations + executable CI outrank prose.

Last synchronized: **2026-09-11**.

## Resume procedure

1. Confirm repo `7eaur/alwaslh` and branch `parallel/stage14-student-product`.
2. Read README + Documentation Index + Student Track docs + Stage16 handoff.
3. Read Handoff/Status/Resume/Engineering Log/this file/Execution Queue.
4. Read product overrides + roadmap Stage16 + latest Issue #16.
5. Live-check Student branch, `main` and Actions before editing.
6. Before shared API changes inspect actual Track A/main contracts and Reader/content/media implementation.

## Operating model

- Track A: Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G.
- Track B: Student Product on `parallel/stage14-student-product`.
- Issue #16 is the shared ledger.
- Shared authority is consumed, never duplicated.
- deployment remains deferred.

## Canonical checkpoints

- Stage14 `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F main baseline `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15 `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 PWA `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED.
- Stage16 bounded server lease `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED.
- Stage16 client lease lifecycle runtime `53aeb972c4c891c3eecafdde0716b544751d2711` — VERIFIED for current lease boundary.

Runtime evidence:

- Stage16 `34551931757` SUCCESS, including real Chromium IndexedDB lifecycle 3/3.
- Stage14 `34551931610` attempt 2 SUCCESS on the same runtime, full quality + browser suite.

## Stable integration boundaries

- Browser is not Auth/Access/Curriculum/Question Bank/Assessment authority.
- protected Reader/media remains server-authorized and `private,no-store`.
- `/v1` must not enter SW Cache API.
- offline lease is metadata authorization, not downloaded content.
- offline DB remains account/device-scoped and credential-free.
- `content_revisions`, `content_tombstones`, `sync_checkpoints` remain dormant until verified writers/API/client flows exist.

## Shared API already added by Student Stage16

- `apps/api/src/offline/service.ts`
- `apps/api/src/offline/http.ts`
- `apps/api/src/app.ts` Student offline registration
- `apps/api/tests/integration/student-offline.integration.test.ts`

No Stage16 DB migration has been required so far.

Potential manual conflict surfaces:

- `apps/api/src/app.ts` registrations;
- Reader/media/offline route namespaces;
- migrations after current integrated schema if future sync persistence is required.

Conflict policy: preserve canonical Track A services and resolve additively. Never copy durable authority into Student Web merely to avoid a shared-file conflict.

## Verified lease lifecycle boundary

`GET /v1/student/offline/lease` remains the lease authority.

Client behavior verified at `53aeb972...`:

- activation/login/restore refreshes and saves lease metadata best-effort;
- DB `alwaslh-student-offline` v1 store `leases`, key `profileId:deviceId`;
- logout/session-expiry deletes only active scope;
- device rebind removes stale scopes only within the same profile;
- another account scope survives;
- reload-safe cleanup uses only non-secret `{profileId,deviceId}` session pointer;
- clock rollback beyond 5-minute tolerance rejects offline lease use.

No protected lesson/media bytes exist yet.

## Current shared-contract next boundary

`STUDENT-016-CACHE-003` + `STUDENT-016-DOWNLOAD-006` require an explicit protected lesson download contract before any blob storage.

Do not invent the contract from dormant sync tables. First inspect actual canonical Reader/content/publication/media schema and services. The contract must reuse canonical lesson/content/media IDs where stable and expose only safe manifest data required for offline materialization:

- stable lesson/asset identity;
- explicit content revision/provenance;
- SHA-256/checksum;
- exact byte size;
- current Published + entitlement authorization;
- no raw storage key;
- no current Reader endpoint caching.

Client storage design must define account/device budget, exact byte accounting, failure rollback and deterministic eviction/removal before adding blob stores.

## Open boundaries

- `STUDENT-016-CACHE-003` — explicit protected materialization OPEN / next design.
- `STUDENT-016-DOWNLOAD-006` — manifest/budget/checksum/accounting/rollback/eviction OPEN / next.
- `STUDENT-016-REVOCATION-007` — reconnect revalidation/purge OPEN.
- `STUDENT-016-SYNC-001` — revision/tombstone/cursor authority OPEN / PROVEN absent.
- `STUDENT-016-OUTBOX-008` — delta/outbox OPEN.
- Stage17+ blocked/later.
- deployment deferred.

Closed in current runtime boundary:

- `STUDENT-016-QA-004` FIXED / VERIFIED.
- `STUDENT-016-CLIENT-005` FIXED / VERIFIED.
- `STUDENT-016-LEASE-002` FIXED / VERIFIED for lease server+client lifecycle.

## Exact continuation

Live shared-state recheck → inspect Reader/content/media → explicit manifest + bounded storage contract → smallest compatible shared API → account/device materialization + real Chromium → reconnect revalidation/purge → authoritative revisions/tombstones/cursor/delta/outbox → Stage16 closure. Do not start Stage17 or deployment.
