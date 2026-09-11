# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> Operational continuity for replacement engineering conversations. Current code + migrations + executable CI outrank prose.

Last synchronized: **2026-09-11**.

## Resume procedure

1. Confirm repo `7eaur/alwaslh` and branch `parallel/stage14-student-product`.
2. Read README + Documentation Index.
3. Read `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`.
4. Read `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`.
5. Read `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.
6. Read Handoff/Status/Resume/Engineering Log/this file/Execution Queue.
7. Read product overrides + roadmap Stage16 + latest Issue #16.
8. Live-check Student branch, `main` and Actions before editing.

## Operating model

- Track A: Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G.
- Track B: Student Product from Stage14 onward.
- Track B branch: `parallel/stage14-student-product`.
- Issue #16 is shared ledger.
- Shared authority is consumed, not duplicated.
- deployment remains deferred.

## Canonical checkpoints

- Stage14 Student `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F main `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15 Student `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 PWA Batch 1 `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED.
- Stage16 bounded server lease/PWA `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED boundary.
- Latest code checkpoint `2c44a363638221ee2985ecb6b8fb71c3e757a333` — NOT VERIFIED due one strict TS error.

## Stable integration boundaries

- Browser is not Auth/Access/Curriculum/Question Bank/Assessment authority.
- protected Reader/media stays server-authorized and `private,no-store`.
- `/v1` must not enter SW cache.
- offline lease is metadata authorization only; it is not downloaded content.
- Student offline DB must remain account/device scoped and credential-free.
- dormant sync tables are not authority until real writers/API/client flows are verified.

## Shared files touched by Student Stage16

Shared API additions that future Track A integration must preserve:

- `apps/api/src/offline/service.ts`;
- `apps/api/src/offline/http.ts`;
- `apps/api/src/app.ts` Student offline route/service registration;
- `apps/api/tests/integration/student-offline.integration.test.ts`.

No Stage16 DB migration has been added so far.

Potential manual conflict surfaces:

- `apps/api/src/app.ts` if Track A adds more registrations;
- future offline/sync route namespace;
- future migrations after current `0023` if protected offline materialization needs server persistence.

Conflict policy: resolve additively and preserve canonical Track A services plus Student Reader/Assessment/Offline contracts. Never copy durable authorities into Student Web to avoid a merge conflict.

## Stage16 verified server contract

`GET /v1/student/offline/lease`

- authenticated Student;
- current session bound to non-revoked device;
- lease `profileId` + `deviceId`;
- server time from DB;
- maximum 24 hours;
- clipped by session expiry;
- entitlement grants clipped by entitlement expiry;
- metadata only;
- response `private,no-store`.

Verified at `5b71aa2...`:

- Stage16 `34430915847` SUCCESS;
- API Regression `34430915786` SUCCESS.

## Stage16 client boundary in progress

At code checkpoint `2c44a363...`:

- `offline-api.ts` fetches server lease with credentials.
- `offline-store.ts` defines DB `alwaslh-student-offline`, store `leases`, scope `profileId:deviceId`.
- storage contains lease metadata + client observation times only.
- clock rollback > current 5-minute tolerance invalidates local lease use.
- no protected lesson/media bytes exist in offline DB.
- lease store is not yet wired to authenticated lifecycle.

Current build blocker:

`offline-store.ts:85` TS18047 — `evaluation.estimatedServerTimeMs` possibly null.

Same-head run facts:

- Student Product `34431220808`: lint PASS, typecheck FAIL at TS18047, later jobs skipped.
- Stage16 `34431220827`: PostgreSQL lease PASS; Student build FAIL at same TS18047; Chromium skipped.
- Vitest 22/22 PASS.

## Dormant sync schema warning

Schema includes `content_revisions`, `content_tombstones`, `sync_checkpoints`, but no verified Student sync API/writers/consumers exist. Future work must prove mutation/revision source, cursor semantics, tombstone behavior and client application before using these tables as Stage16 authority.

## Integration guidance for next batches

1. Fix current Student type narrowing first; no new feature before green exact-head client build.
2. Wire lease refresh/save only after authenticated online success.
3. Cleanup must be scoped to the exact profile/device lease; logout/rebind must not wipe unrelated scopes.
4. Explicit protected lesson download must use new authorization/materialization contract, not existing Reader response caching.
5. Storage budgets/checksum/revision metadata must exist before binary blobs.
6. Reconnect must revalidate current server entitlement/publication before retaining future protected offline content.
7. Revision/tombstone/delta/outbox work comes after the content materialization security boundary.
8. Any future Track A merge touching app registration or migrations requires Student API + Student Product + Stage16 regression reruns.

## Open boundaries

- `STUDENT-016-QA-004` current strict build blocker.
- `STUDENT-016-CLIENT-005` lease lifecycle integration.
- `STUDENT-016-CACHE-003` explicit protected content materialization.
- `STUDENT-016-DOWNLOAD-006` budget/checksum/eviction.
- `STUDENT-016-REVOCATION-007` reconnect purge.
- `STUDENT-016-SYNC-001` + `STUDENT-016-OUTBOX-008` actual sync authority.
- Stage17+ later.
- deployment deferred.

## Exact continuation

Fix TS18047 → exact-head Student + Stage16 gates → wire lease lifecycle/cleanup → real IndexedDB browser acceptance → explicit lesson download/budget/checksum → reconnect purge → delta/tombstone/outbox → Stage16 closure. Do not skip sequence.
