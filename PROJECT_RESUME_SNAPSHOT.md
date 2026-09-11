# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Latest replacement-conversation checkpoint. GitHub/code/CI outrank this file. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11**.

## Resume identity

- Repo: `7eaur/alwaslh`
- Student branch: `parallel/stage14-student-product`
- Ledger: Issue #16
- Detailed current-stage handoff: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
- Deployment: deferred

## Canonical checkpoints

- Stage14 Student: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F canonical main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student integration: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15 Student: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 Batch 1 PWA: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED, run `34430284173`.
- Stage16 bounded server lease/PWA: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED boundary, runs `34430915847` + `34430915786` SUCCESS.

## Current code checkpoint

`2c44a363638221ee2985ecb6b8fb71c3e757a333`

State: **NOT VERIFIED**.

Reason:

`apps/student-web/src/offline-store.ts:85` fails strict TS with `TS18047` because `evaluation.estimatedServerTimeMs` is possibly `null` from TypeScript's perspective.

Same-head evidence:

- ESLint PASS.
- Vitest **22/22 PASS**.
- Stage16 PostgreSQL lease contract PASS.
- Student Product `34431220808` failed at strict typecheck; Chromium skipped.
- Stage16 `34431220827` failed at Student build for same error; PostgreSQL job passed; PWA browser did not run.

## What Stage16 already means

### Safe PWA shell — verified

- Service Worker only on HTTPS/loopback.
- navigation/static assets only.
- `/v1` excluded from SW cache/interception.
- no protected Reader/Assessment/API response cached.
- no auth credentials copied into offline storage.
- no automatic `skipWaiting`.
- real Chromium offline reload verified.

### Server-issued offline lease — verified

`GET /v1/student/offline/lease` returns metadata only:

- profile/device identity;
- server issued time;
- lease expiry;
- active entitlement grants.

Rules:

- valid Student session;
- non-revoked bound device;
- max 24h;
- clipped by session expiry;
- grant clipped by entitlement expiry;
- response `private,no-store`.

### Client lease storage — implemented but not verified

New DB: `alwaslh-student-offline`, version 1, store `leases`, key `profileId:deviceId`.

Purpose:

- persist lease metadata only;
- estimate server time from issuedAt + elapsed client time;
- reject large backward clock movement (>5 minutes tolerance);
- evaluate class/all-content grants.

No lesson/media blobs are stored yet. The lease store is not yet wired to authenticated session lifecycle.

## Dormant sync warning

`content_revisions`, `content_tombstones`, `sync_checkpoints` exist in schema but no verified Student sync API/writer/consumer is wired. Treat as dormant schema, not functioning sync authority.

## Mandatory startup order

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
4. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
5. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
6. `PROJECT_HANDOFF.md`
7. `PROJECT_STATUS.md`
8. `PROJECT_RESUME_SNAPSHOT.md`
9. `PROJECT_ENGINEERING_LOG.md`
10. `PROJECT_INTEGRATION_CONTINUITY.md`
11. `PROJECT_EXECUTION_QUEUE.md`
12. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
13. `MASTER_REBUILD_ROADMAP.md` Stage16
14. latest Issue #16
15. live Student branch + main + Actions
16. actual Stage16 code/tests/workflows

## Exact continuation

1. Fix only TS18047/null narrowing in `offline-store.ts` around line 85; do not weaken strictness/tests.
2. Rerun exact-head Student Product + Stage16 PWA.
3. If green, wire online authenticated session to fetch/save lease after restore/login/activation.
4. Define scoped cleanup on logout/session expiry/device rebind.
5. Add real Chromium IndexedDB isolation/persistence/clock rollback/cleanup tests.
6. Then design explicit protected lesson download contract with byte/checksum/budget/eviction semantics; do not cache Reader `/v1` responses.
7. Add reconnect revalidation/purge.
8. Wire revisions/tombstones/delta/outbox only after explicit content materialization is safe.
9. Do not start Stage17 until Stage16 closes.
