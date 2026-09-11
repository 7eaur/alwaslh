# STUDENT PRODUCT TRACK STATUS — Stage14+

> Branch-specific status for Track B. Code/migrations + executable CI evidence outrank prose. Unexecuted work = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11 — Stage14 CLOSED / VERIFIED; Stage15 CLOSED / VERIFIED; Stage16 ACTIVE.**

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
- Stage16 server lease + PWA runtime: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — implemented boundary VERIFIED.
- Latest code checkpoint before documentation: `2c44a363638221ee2985ecb6b8fb71c3e757a333` — **NOT VERIFIED** due one strict TypeScript error.

Documentation commits after the code checkpoint do not replace runtime evidence.

## Stage14 boundary — CLOSED / VERIFIED

Verified activation/login/recovery/device/session, entitlements/class redemption, entitled Curriculum, protected Reader/media/OCR, search/TTS capability, honest offline/session states, RTL/mobile-first hierarchy, keyboard focus and responsive 390/768/1366 behavior.

Stage14 never claimed durable offline-learning authority.

## Stage15 boundary — CLOSED / VERIFIED

Verified consumption of canonical immutable Stage13F quiz snapshots through one durable Student assessment runtime:

- entitlement-filtered published quizzes;
- immutable version/model selection;
- create/resume/restart/abandon;
- persisted question/option order;
- Practice server feedback and answer locking after reveal;
- Test correctness withheld until finalize;
- server-owned direct/choice scoring;
- idempotent finalization and durable attempt history;
- publication/access rechecks;
- Curriculum → Assessment → Access learning hierarchy;
- responsive/Chromium regression evidence.

Exact closure runtime: `9a787b7...` with API Regression `34427900263`, Stage15 Assessment `34427900257`, Student Product `34427900209` — all SUCCESS.

## Stage16 — ACTIVE

### Batch 1 — safe PWA shell — VERIFIED

Runtime `c1ae86036d4d302b8ca8c411227f41c37b4063ef`.

Run `34430284173` — SUCCESS.

Verified:

- manifest + Service Worker registration;
- registration only on HTTPS/loopback;
- app-shell/static asset caching only;
- `/v1` excluded from Service Worker caching/interception;
- no protected Reader/Assessment/API response cached;
- no auth/device credential copied to Stage16 storage;
- no automatic `skipWaiting`;
- real Chromium true offline reload at 390px.

### Batch 2A — server-issued bounded offline lease — VERIFIED

Runtime `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd`.

Evidence:

- Stage16 `34430915847` — SUCCESS: PostgreSQL lease contract + PWA Chromium.
- API Regression `34430915786` — SUCCESS.

Contract:

- `GET /v1/student/offline/lease`;
- valid Student session + non-revoked bound device;
- profile/device scoped;
- server time from PostgreSQL;
- max lease 24h;
- clipped by session expiry;
- each entitlement grant clipped by entitlement expiry;
- metadata only, `private,no-store`.

### Batch 2B — client lease store — IMPLEMENTED / NOT VERIFIED

Code checkpoint `2c44a363638221ee2985ecb6b8fb71c3e757a333` adds:

- `apps/student-web/src/offline-api.ts`;
- `apps/student-web/src/offline-store.ts`;
- matching unit tests;
- IndexedDB `alwaslh-student-offline`, store `leases`, key `profileId:deviceId`;
- server-time estimate + 5-minute clock rollback guard.

No lesson/media bytes are stored yet.

Current blocker:

`STUDENT-016-QA-004` P1 — `src/offline-store.ts(85,38)` TS18047: `evaluation.estimatedServerTimeMs` possibly null.

Runs on `2c44a363...`:

- Student Product `34431220808` — FAILURE at strict typecheck; Chromium skipped.
- Stage16 `34431220827` — FAILURE because Student build hit the same TS error; PostgreSQL lease job inside run SUCCESS.
- ESLint PASS.
- Vitest **22/22 PASS**.

## Stage16 findings

| ID | Sev | Finding | Status |
|---|---:|---|---|
| `STUDENT-016-SYNC-001` | P1 | `content_revisions` / `content_tombstones` / `sync_checkpoints` exist but are not verified wired authority | OPEN / PROVEN |
| `STUDENT-016-LEASE-002` | P1 | bounded offline lease was absent | SERVER FIXED / VERIFIED; CLIENT STORE NOT VERIFIED |
| `STUDENT-016-CACHE-003` | P1 | protected Reader is `no-store`; explicit offline content materialization still absent | OPEN |
| `STUDENT-016-QA-004` | P1 | strict TS nullability blocks current build | OPEN / NEXT FIX |
| `STUDENT-016-CLIENT-005` | P1 | lease store not connected to authenticated lifecycle/cleanup | OPEN |
| `STUDENT-016-DOWNLOAD-006` | P1 | no explicit lesson download/budget/checksum/eviction contract | OPEN |
| `STUDENT-016-REVOCATION-007` | P1 | protected offline purge/revalidation not implemented | OPEN |
| `STUDENT-016-OUTBOX-008` | P1 | outbox/delta reconciliation not implemented | OPEN |

## Current classification

| Area | Classification |
|---|---|
| PWA app shell | KEEP / IMPROVE |
| `/v1` Service Worker caching | REMOVE / FORBIDDEN |
| server-issued offline lease | KEEP / IMPROVE |
| account/device IndexedDB lease metadata | IMPROVE / NOT YET VERIFIED |
| existing sync tables | KEEP AS DORMANT SCHEMA / REFACTOR-WIRE LATER |
| protected lesson offline materialization | REBUILD / NEW EXPLICIT CONTRACT |
| browser credential storage | REMOVE / FORBIDDEN |

## Exact next action

1. Fix only TS18047 in `apps/student-web/src/offline-store.ts` around line 85 without weakening strictness or changing behavior.
2. Rerun exact-head Student Product + Stage16 PWA and inspect all jobs/logs.
3. Wire authenticated online session → fetch/save lease; define logout/session-expiry/device-rebind scope cleanup.
4. Add real Chromium IndexedDB account/device isolation + persistence + rollback + cleanup acceptance.
5. Then design explicit protected lesson download contract with byte/checksum/storage budgets. Never cache existing Reader `/v1` responses.
6. Add reconnect entitlement revalidation and purge before claiming protected offline use.
7. Wire revisions/tombstones/delta sync/outbox only after the protected materialization boundary is safe.
8. Do not begin Stage17 until Stage16 closes.
