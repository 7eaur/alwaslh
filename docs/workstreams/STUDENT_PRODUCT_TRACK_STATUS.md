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
- Stage16 client lease lifecycle runtime: `53aeb972c4c891c3eecafdde0716b544751d2711` — VERIFIED for the implemented lease persistence/lifecycle boundary.

Documentation commits after a runtime checkpoint do not replace runtime evidence.

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

### Batch 2B — client lease store + lifecycle — VERIFIED

Runtime checkpoint: `53aeb972c4c891c3eecafdde0716b544751d2711`.

Implemented and verified:

- `apps/student-web/src/offline-api.ts` consumes only the bounded server-issued lease contract;
- IndexedDB `alwaslh-student-offline`, version `1`, store `leases`;
- scope key remains `profileId:deviceId`;
- lease metadata only; no lesson/media blobs yet;
- authenticated activation/login/session restore performs best-effort lease refresh/persistence without making offline storage a requirement for online login correctness;
- logout and server-side session expiry remove only the active account/device scope;
- successful device rebind removes stale scopes only for the same `profileId`, preserving other accounts;
- a non-secret `{profileId,deviceId}` pointer is kept in `sessionStorage` only so scoped cleanup survives page reload within the same browser session; no password/session cookie/token/private key/lease payload is placed there;
- 5-minute clock rollback tolerance remains enforced;
- server-time estimate is based on server-issued time plus observed elapsed client time rather than treating the device wall clock as entitlement authority.

Executable evidence on exact runtime `53aeb972...`:

- Stage16 Student PWA run `34551931757` — **SUCCESS**:
  - PostgreSQL bounded offline lease contract — PASS;
  - Student production build — PASS;
  - PWA app-shell real Chromium — PASS;
  - IndexedDB lease lifecycle real Chromium — **3/3 PASS**.
- Stage14 Student Product run `34551931610`, attempt 2 — **SUCCESS** on the same exact HEAD:
  - Student lint — PASS;
  - strict TypeScript — PASS;
  - Vitest — **22/22 PASS**;
  - production build — PASS;
  - curriculum/Reader PostgreSQL contracts — PASS;
  - full real Chromium Student suite — PASS.

The first Stage14 browser attempt on this HEAD had one non-reproducible Assessment assertion failure after model selection. No Assessment code changed between a prior passing run and this HEAD. Re-running the unchanged failed browser job on the same commit produced a full PASS. It is recorded as flaky CI/test evidence, not as a product regression, and no test was weakened.

Root causes closed in this batch:

- prior TS18047 narrowing blocker was fixed type-safely without weakening strictness;
- first IndexedDB lifecycle acceptance exposed that in-memory-only active scope identity was lost after reload; the root fix uses the scoped non-secret session pointer described above, after which the same real Chromium acceptance passed.

## Stage16 findings

| ID | Sev | Finding | Status |
|---|---:|---|---|
| `STUDENT-016-SYNC-001` | P1 | `content_revisions` / `content_tombstones` / `sync_checkpoints` exist but are not verified wired authority | OPEN / PROVEN |
| `STUDENT-016-LEASE-002` | P1 | bounded offline lease + client persistence/lifecycle | FIXED / VERIFIED FOR LEASE BOUNDARY |
| `STUDENT-016-CACHE-003` | P1 | protected Reader is `no-store`; explicit offline content materialization still absent | OPEN / NEXT DESIGN |
| `STUDENT-016-QA-004` | P1 | strict TS nullability blocked client lease build | FIXED / VERIFIED |
| `STUDENT-016-CLIENT-005` | P1 | lease store was not connected to authenticated lifecycle/cleanup | FIXED / VERIFIED |
| `STUDENT-016-DOWNLOAD-006` | P1 | no explicit lesson download/budget/checksum/eviction contract | OPEN / NEXT |
| `STUDENT-016-REVOCATION-007` | P1 | protected offline purge/revalidation not implemented | OPEN |
| `STUDENT-016-OUTBOX-008` | P1 | outbox/delta reconciliation not implemented | OPEN |

## Current classification

| Area | Classification |
|---|---|
| PWA app shell | KEEP / IMPROVE |
| `/v1` Service Worker caching | REMOVE / FORBIDDEN |
| server-issued offline lease | KEEP / VERIFIED FOUNDATION |
| account/device IndexedDB lease metadata | KEEP / VERIFIED FOUNDATION |
| existing sync tables | KEEP AS DORMANT SCHEMA / REFACTOR-WIRE LATER |
| protected lesson offline materialization | REBUILD / NEW EXPLICIT CONTRACT |
| browser credential storage | REMOVE / FORBIDDEN |

## Exact next action

1. Design the explicit protected lesson offline download contract before writing any protected blob.
2. Define server-authorized manifest fields: stable lesson/asset IDs, content revision, SHA-256/checksum and byte sizes; only Published and entitled content may be materialized.
3. Define account/device storage budget, per-download byte accounting, atomic/failure rollback and deterministic eviction/removal policy.
4. Implement the smallest shared API contract necessary without caching the existing Reader `/v1` response and without duplicating Track A authority.
5. Add client materialization only after the contract is fixed, then real Chromium verification of checksum/budget/isolation/offline read behavior.
6. Implement reconnect revalidation and revoked/expired/unpublished purge before claiming protected offline content complete.
7. Only after protected materialization is safe, wire revision writers/tombstones/server cursor/delta sync and any bounded outbox required by product-authorized offline writes.
8. Do not begin Stage17 until Stage16 closes on one exact HEAD with real Service Worker + IndexedDB + protected offline content + revocation/sync evidence.
