# STAGE16 STUDENT HANDOFF — Offline / PWA

> Canonical continuation checkpoint for Track B. Current code, migrations and executable CI evidence outrank prose. Anything not executed is `NOT YET VERIFIED`.

Last synchronized: **2026-09-11**.

## 1. Identity / ownership

- Repository: `7eaur/alwaslh`
- Track B branch: `parallel/stage14-student-product`
- Shared ledger: GitHub Issue #16
- Track B primary ownership: `apps/student-web` and Student-facing integration.
- Small shared API additions are allowed only when proven necessary, minimal, compatible and documented in Issue #16.
- Track A owns Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G. Never duplicate those authorities.
- Deployment/hosting remains deferred.

## 2. Verified checkpoints

- Stage14: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Canonical Stage13F main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student integration: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 safe PWA shell: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED, run `34430284173`.
- Stage16 server-issued bounded lease: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED, Stage16 `34430915847` + API Regression `34430915786` SUCCESS.
- Stage16 client lease lifecycle runtime: `53aeb972c4c891c3eecafdde0716b544751d2711` — **VERIFIED for the implemented lease/lifecycle boundary**.

Runtime evidence for `53aeb972...`:

- Stage16 Student PWA `34551931757` — **SUCCESS**:
  - PostgreSQL bounded lease contract PASS;
  - Student strict typecheck/build PASS;
  - PWA app shell real Chromium PASS;
  - IndexedDB lease lifecycle real Chromium **3/3 PASS**.
- Stage14 Student Product `34551931610`, attempt 2 — **SUCCESS on the same exact HEAD**:
  - lint PASS;
  - strict typecheck PASS;
  - Vitest **22/22 PASS**;
  - production build PASS;
  - curriculum/Reader contracts PASS;
  - full real Chromium Student suite PASS.

The first Stage14 browser attempt had one Assessment model-selection assertion failure. Assessment code was unchanged from an earlier passing runtime; rerunning the unchanged failed job on the same exact commit passed the full suite. Record this as flaky/non-reproducible test evidence, not a product regression. No assertion/test was weakened.

## 3. Stage16 invariant boundaries

- `/v1` never becomes Service Worker Cache API authority.
- protected Reader/media stays `private,no-store`.
- no password/session cookie/token/device private key/raw storage key in Stage16 offline storage.
- offline lease is server-issued, profile/device-bound and uses PostgreSQL/server time.
- current lease maximum is 24h, clipped by session expiry; grants are clipped by entitlement expiry.
- no automatic `skipWaiting`; no forced reload during lesson/assessment.
- existing sync tables remain dormant until real writers/API/client consumers are proven.

## 4. Verified client lease lifecycle

Relevant files include:

- `apps/student-web/src/offline-api.ts`
- `apps/student-web/src/offline-store.ts`
- `apps/student-web/src/offline-session.ts`
- `apps/student-web/src/auth-api.ts`
- `apps/student-web/src/App.tsx`
- `apps/student-web/e2e/offline-lease.e2e.spec.mjs`
- `.github/workflows/stage16-student-pwa.yml`

Verified behavior:

- activation/login/session restore performs best-effort `GET /v1/student/offline/lease` then `saveOfflineLease()`; offline persistence failure does not make a valid online session invalid;
- IndexedDB `alwaslh-student-offline` v1 still stores only `leases`, scoped by `profileId:deviceId`;
- logout/session expiry removes only the active profile/device scope;
- device rebind removes stale scopes only for the same profile after the new device lease is stored;
- another account/device scope is preserved;
- a non-secret `{profileId,deviceId}` pointer lives in `sessionStorage` only so exact cleanup survives reload in the same browser session; it contains no credential or lease payload;
- large backward clock movement is rejected using the 5-minute tolerance and server-issued-time estimate.

Root causes fixed:

- `STUDENT-016-QA-004`: TypeScript could not retain non-null narrowing for `estimatedServerTimeMs`; fixed using a local non-null value after the existing guard, preserving strictness/behavior.
- Chromium acceptance then exposed a real lifecycle bug: active scope identity existed only in module memory and disappeared on reload. Fixed by the scoped non-secret session pointer above; real Chromium then passed 3/3.

## 5. Reader/content security already verified

- protected Reader metadata/media is authorized by server session + entitlement + publication state;
- raw media `storage_key` is never Student authority;
- media delivery already verifies expected bytes/checksum;
- current Reader endpoint remains `private,no-store` and **must not be reused as a Cache API download path**.

## 6. Dormant sync schema

Migration `0004_ai_and_sync.sql` contains:

- `content_revisions`;
- `content_tombstones`;
- `sync_checkpoints`.

There is still no verified Student sync API/writer/client consumer for these tables. Treat them as **DORMANT / NOT YET WIRED**. Their presence does not satisfy revision or delta-sync requirements.

## 7. Findings

| ID | Sev | Finding | Status |
|---|---:|---|---|
| `STUDENT-016-SYNC-001` | P1 | revision/tombstone/checkpoint schema lacks verified writers/API/client flow | OPEN / PROVEN |
| `STUDENT-016-LEASE-002` | P1 | bounded lease + client persistence/lifecycle | FIXED / VERIFIED FOR LEASE BOUNDARY |
| `STUDENT-016-CACHE-003` | P1 | explicit protected offline materialization absent | OPEN / NEXT DESIGN |
| `STUDENT-016-QA-004` | P1 | strict TypeScript lease build blocker | FIXED / VERIFIED |
| `STUDENT-016-CLIENT-005` | P1 | authenticated lease lifecycle/cleanup absent | FIXED / VERIFIED |
| `STUDENT-016-DOWNLOAD-006` | P1 | explicit manifest/budget/checksum/accounting/eviction absent | OPEN / NEXT |
| `STUDENT-016-REVOCATION-007` | P1 | reconnect purge/revalidation for protected blobs absent | OPEN |
| `STUDENT-016-OUTBOX-008` | P1 | delta/outbox authority absent | OPEN |

Stage16 is **ACTIVE / NOT CLOSED** because protected offline content, reconnect revocation and real sync remain incomplete.

## 8. Exact next engineering batch — explicit protected lesson download contract

Before writing any protected blob:

1. Re-check live Student HEAD, `main`, latest Issue #16 and Track A shared-contract changes.
2. Inspect actual Reader/content/publication/media code and migrations; do not infer IDs/revisions from names.
3. Define the smallest server-authorized download manifest contract using existing canonical lesson/content/media authority.
4. Manifest must provide stable lesson/asset identifiers, explicit content revision/provenance, SHA-256/checksum and byte size, and be issued only for currently Published + entitled material.
5. Define account/device storage budget, exact per-download accounting, transactional/failure rollback, and deterministic eviction/removal **before** adding an IndexedDB blob store.
6. Do not cache the existing Reader `/v1` response or protected media in Service Worker Cache API.
7. After the contract is fixed, implement account/device-scoped materialization and real Chromium checksum/budget/isolation/offline-reader evidence.
8. Then implement reconnect lease/entitlement/publication revalidation and purge revoked/expired/unpublished material.
9. Only after materialization is safe, implement revision writers/tombstones/server cursor/delta sync/client application/outbox rules.
10. Do not begin Stage17 until Stage16 closes on one exact runtime HEAD with executable evidence.

## 9. Mandatory startup for a replacement conversation

Read in this order before editing:

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
14. latest Issue #16 body/comments
15. live Student branch + `main` + Actions
16. actual Reader/content/media/offline code/tests/workflows

## 10. Continuation sentence

**Stage14 and Stage15 are CLOSED / VERIFIED. Stage16 remains ACTIVE. Safe PWA, server-issued bounded lease, client IndexedDB lease persistence, authenticated lifecycle, scoped cleanup and clock-rollback rejection are VERIFIED through runtime `53aeb972...`, Stage16 run `34551931757` and Stage14 run `34551931610` attempt 2. The exact next batch is the explicit protected lesson download manifest + budget/checksum/accounting/rollback/eviction contract; no protected blob may be stored before that contract is fixed.**
