# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code/migrations/executable CI outrank prose. Anything not executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11**.

## Current position

- Repository: `7eaur/alwaslh`.
- Execution ledger: GitHub Issue #16.
- Parallel model:
  - Track A: Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G.
  - Track B: Student Product on `parallel/stage14-student-product`.
- Production deployment/cutover remains deferred.
- `main` live-checked at `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.

## Verified Student checkpoints

- Stage14: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F→Student integration: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 Batch 1 PWA shell: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED by run `34430284173`.
- Stage16 server lease/PWA boundary: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED by:
  - Stage16 `34430915847` SUCCESS;
  - API Regression `34430915786` SUCCESS.

## Current active stage

**Stage16 — Offline / PWA — ACTIVE / NOT CLOSED.**

Detailed handoff: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

Implemented and verified so far:

- PWA manifest + safe Service Worker app shell;
- `/v1` excluded from Service Worker cache/interception;
- no automatic `skipWaiting`;
- true offline shell reload in real Chromium;
- bounded server-issued offline lease endpoint;
- lease bound to valid Student session + non-revoked device + server time + entitlement scope;
- max lease 24h, clipped by session and entitlement expiry;
- lease response contains metadata only and is `private,no-store`.

## Latest code checkpoint — NOT VERIFIED

`2c44a363638221ee2985ecb6b8fb71c3e757a333`

Adds typed lease client + account/device-scoped IndexedDB lease metadata, but current strict build is blocked by:

```text
src/offline-store.ts(85,38): TS18047
'evaluation.estimatedServerTimeMs' is possibly 'null'.
```

Evidence on the same code checkpoint:

- ESLint PASS.
- Vitest **22/22 PASS**.
- Stage16 PostgreSQL lease contract PASS.
- Student Product run `34431220808` — FAILURE at strict typecheck; Chromium skipped.
- Stage16 run `34431220827` — overall FAILURE from same Student build error; PostgreSQL job SUCCESS; PWA Chromium did not run.

Do not mark `2c44a363...` verified until exact-head Student + Stage16 gates pass.

## Current P1 Stage16 findings

- `STUDENT-016-SYNC-001` — dormant revision/tombstone/checkpoint schema is not wired to Student sync.
- `STUDENT-016-LEASE-002` — server lease FIXED / VERIFIED; client persistence lifecycle not yet verified.
- `STUDENT-016-CACHE-003` — explicit protected lesson offline materialization contract absent.
- `STUDENT-016-QA-004` — TS18047 current build blocker.
- `STUDENT-016-CLIENT-005` — lease fetch/save/cleanup not wired into authenticated lifecycle.
- `STUDENT-016-DOWNLOAD-006` — storage budget/checksum/eviction/download contract absent.
- `STUDENT-016-REVOCATION-007` — reconnect revocation/purge absent for future protected content.
- `STUDENT-016-OUTBOX-008` — durable outbox/delta reconciliation absent.

## Stage ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; live provider bootstrap still NOT YET VERIFIED |
| Stage13A–F | VERIFIED / CLOSED; Stage13F promoted |
| Stage13G | Track A follow-on |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Practice/Assessment | CLOSED / VERIFIED |
| Stage16 Offline/PWA | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17 Personal Learning | BLOCKED BY Stage16 |
| Stage18 Notifications | later |
| Stage19 Progress/Statistics | later |
| Stage20–25 | later roadmap |
| Stage26–29 | future release/deployment |

## Exact next work

1. Fix the single strict-nullability error in `offline-store.ts` without changing behavior.
2. Rerun exact-head Student Product + Stage16 PWA.
3. Wire authenticated online lifecycle to fetch/save bounded lease and scoped cleanup.
4. Add real browser IndexedDB isolation/persistence/rollback/cleanup tests.
5. Define explicit protected lesson download + storage budget + checksum/eviction.
6. Add reconnect revalidation/purge.
7. Only then wire revision/tombstone/delta sync/outbox.
8. Keep Stage17 and deployment blocked.
