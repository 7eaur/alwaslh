# STAGE16 STUDENT HANDOFF — Offline / PWA

> Canonical continuation checkpoint for Track B. This file exists so a fresh engineering conversation can continue from GitHub without relying on chat memory. Current code, migrations and executable CI evidence outrank prose. Anything not executed is `NOT YET VERIFIED`.

Last synchronized: **2026-09-11**.

## 1. Identity / ownership

- Repository: `7eaur/alwaslh`
- Track B branch: `parallel/stage14-student-product`
- Shared execution ledger: GitHub Issue `#16`
- Track B primary ownership: `apps/student-web` and Student-facing integration.
- Small shared API additions are allowed only when proven necessary, minimal, non-conflicting and documented in Issue #16.
- Track A owns Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G evolution. Do not duplicate those authorities.
- Deployment/hosting remains deferred.

## 2. Exact checkpoints

Verified historical Student checkpoints:

- Stage14 runtime: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Canonical Stage13F promoted main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student integration runtime: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15 runtime: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.

Stage16 checkpoints:

- Batch 1 safe PWA shell runtime: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED by Stage16 run `34430284173`.
- Batch 2 bounded server-issued offline lease + safe PWA runtime: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED for the implemented server/PWA boundary.
  - Stage16 run `34430915847` — SUCCESS:
    - PostgreSQL offline lease contract PASS;
    - PWA build + real Chromium app-shell/offline test PASS.
  - API Regression `34430915786` — SUCCESS:
    - API lint/Biome PASS;
    - strict typecheck PASS;
    - API unit suite PASS;
    - API build PASS.

Current code checkpoint before this documentation update:

`2c44a363638221ee2985ecb6b8fb71c3e757a333`

State: **NOT VERIFIED** because Student strict TypeScript fails in the new client-side offline store.

Exact failure:

```text
src/offline-store.ts(85,38): error TS18047:
'evaluation.estimatedServerTimeMs' is possibly 'null'.
```

Affected runs on `2c44a363...`:

- Stage14 Student Product `34431220808` — FAILURE at Student typecheck; Chromium job skipped.
- Stage16 Student PWA `34431220827` — overall FAILURE because Student build hit the same TS18047.
  - PostgreSQL lease job inside the run: SUCCESS.
  - PWA browser job did not reach Chromium because build failed.

Important positive evidence on `2c44a363...` before typecheck stopped the pipeline:

- ESLint PASS.
- Vitest **22/22 PASS** across 6 test files, including `offline-api.test.ts`, `offline-store.test.ts` and `pwa.test.ts`.
- PostgreSQL bounded lease contract PASS.

Do **not** mark `2c44a363...` verified until the type error is fixed and exact-head Student/Stage16 gates pass.

## 3. Stage16 source-of-truth contract

Roadmap requires:

- account/device-scoped IndexedDB;
- explicit offline downloads;
- bounded entitlement lease;
- storage budgets;
- revisions/tombstones;
- outbox/delta sync;
- safe Service Worker lifecycle;
- revocation/expiry/reconnect behavior;
- real Service Worker/IndexedDB/browser evidence.

Stage16 is broader than a manifest or offline page reload. Transient network-loss UI from Stage14/15 is not durable offline-learning authority.

## 4. What was inspected and understood

### Auth/session/device

- Student API calls use cookie session flow with `credentials: include`.
- No auth token is intentionally stored in `localStorage` or `sessionStorage`.
- Student returning login is password + registered P-256 device proof.
- Device private key already lives in its own IndexedDB store as a non-exportable `CryptoKey`.
- Current authenticated server session is device-bound; revoked devices invalidate Student session authority.

### Reader/content security

- Protected Reader metadata/media is authorized server-side by session + entitlement + publication state.
- Raw `storage_key` is never a Student authority.
- Media delivery verifies expected bytes/checksum.
- Reader media remains `Cache-Control: private, no-store`.
- Stage16 must **not** opportunistically Cache API-store the existing protected Reader endpoint. Offline content requires an explicit materialization/download contract.

### Existing sync schema

Migration `0004_ai_and_sync.sql` contains:

- `content_revisions`;
- `content_tombstones`;
- `sync_checkpoints`.

However repository inspection/code search found no active Student sync API and no verified writer/consumer wiring for those tables. Later publication work does not automatically make them authoritative.

Decision: treat this schema as **dormant / NOT YET WIRED**, not as completed delta sync.

## 5. Implemented Stage16 Batch 1 — safe app shell

Relevant Student files include:

- `apps/student-web/public/manifest.webmanifest`
- `apps/student-web/public/sw.js`
- `apps/student-web/src/pwa.ts`
- `apps/student-web/src/pwa.test.ts`
- `apps/student-web/e2e/pwa-shell.e2e.spec.mjs`
- `apps/student-web/playwright.pwa.config.mjs`
- `.github/workflows/stage16-student-pwa.yml`

Verified policy:

- Service Worker registration only on HTTPS or loopback development origins.
- app-shell navigation/static Vite assets only.
- `/v1` is explicitly excluded from SW interception/Cache API.
- no protected Reader/Assessment/API response is cached by Batch 1.
- no cookie/session/device credential is copied into Stage16 storage.
- no automatic `skipWaiting`; waiting worker activates only after explicit `SKIP_WAITING` message.
- real Chromium proved manifest, SW control, shell cache, no `/v1` cache entries and true offline reload at 390×844.

Classification:

- app-shell SW foundation: `KEEP / IMPROVE`.
- caching protected API responses: `REMOVE / FORBIDDEN`.
- automatic forced worker activation: `REMOVE / FORBIDDEN`.

## 6. Implemented Stage16 Batch 2 — bounded server-issued offline lease

Relevant backend files:

- `apps/api/src/offline/service.ts`
- `apps/api/src/offline/http.ts`
- `apps/api/src/app.ts` registration
- `apps/api/tests/integration/student-offline.integration.test.ts`

Endpoint:

`GET /v1/student/offline/lease`

Response contains lease metadata only, never educational content or credentials:

- version;
- `profileId`;
- current bound `deviceId`;
- server `issuedAt`;
- bounded `expiresAt`;
- active entitlement grants with scope/class and grant expiry.

Lease rules:

- request must have a valid Student session;
- session must remain bound to a non-revoked Student device;
- server time comes from PostgreSQL `now()`;
- maximum lease duration is currently **24 hours**;
- lease expires at the earlier of 24 hours or session expiry;
- each grant expires at the earlier of lease expiry or entitlement expiry;
- active entitlement scope is authoritative;
- response is `private, no-store` / `Pragma: no-cache`;
- no schema migration was required.

Architecture decision: 24 hours is a bounded security policy, not derived from the browser clock or cookie TTL. It can be changed later without changing storage schema.

## 7. Current unverified client-side lease work

New files at code checkpoint `2c44a363...`:

- `apps/student-web/src/offline-api.ts`
- `apps/student-web/src/offline-api.test.ts`
- `apps/student-web/src/offline-store.ts`
- `apps/student-web/src/offline-store.test.ts`

Intended client boundary:

- dedicated IndexedDB DB: `alwaslh-student-offline`;
- DB version 1;
- current store: `leases` only;
- scope key = `profileId:deviceId`;
- stored object contains lease + observation timing metadata, not credentials;
- 5-minute backward-clock tolerance;
- estimated server time = server-issued time + elapsed local monotonic-like wall-clock delta;
- large client clock rollback makes lease unusable instead of trusting the changed clock;
- class access checks require a fresh lease and an unexpired matching grant or `all_content` grant.

Current implementation is **not yet wired into the authenticated UI/session lifecycle** and is **not verified** because of TS18047.

Important: no protected lesson/media bytes are stored in this DB yet.

## 8. Current findings

| ID | Sev | Area | Finding | Status |
|---|---:|---|---|---|
| `STUDENT-016-SYNC-001` | P1 | Sync | revision/tombstone/checkpoint schema exists but no verified writers/API/client delta flow | OPEN / PROVEN |
| `STUDENT-016-LEASE-002` | P1 | Lease | no bounded lease existed originally | SERVER SIDE FIXED + VERIFIED; CLIENT PERSISTENCE NOT YET VERIFIED |
| `STUDENT-016-CACHE-003` | P1 | Protected content | Reader content is correctly `no-store`; explicit offline materialization path still absent | OPEN / DESIGN REQUIRED |
| `STUDENT-016-QA-004` | P1 | Build | `offline-store.ts:85` TS18047 blocks current Student build | OPEN / EXACT NEXT FIX |
| `STUDENT-016-CLIENT-005` | P1 | Client lifecycle | new lease store is not yet refreshed/saved/cleared through authenticated session lifecycle | OPEN |
| `STUDENT-016-DOWNLOAD-006` | P1 | Offline content | no explicit lesson download manifest/content contract, budget or eviction policy | OPEN |
| `STUDENT-016-REVOCATION-007` | P1 | Security | protected offline content revocation/reconnect purge is not implemented because protected content is not stored yet | OPEN |
| `STUDENT-016-OUTBOX-008` | P1 | Sync | no durable Student outbox/delta reconciliation contract yet | OPEN |

No claim is made that Stage16 is closed.

## 9. Exact next engineering actions

Do these in order:

1. **Fix only the TypeScript narrowing error** in `apps/student-web/src/offline-store.ts` around line 85. Preserve behavior. The prior guard already checks `estimatedServerTimeMs === null`; make TypeScript understand the non-null value locally rather than weakening strictness.
2. Run exact-head:
   - Stage14 Student Product;
   - Stage16 Student PWA;
   - inspect all jobs/logs.
   Do not mark the client lease layer verified until lint + strict typecheck + 22+ unit tests + production build + real Chromium Stage16 gate pass.
3. Wire online authenticated session lifecycle to fetch and save the server-issued lease after successful Student session restoration/login/activation, without storing auth credentials.
4. Define logout/session-expiry/device-rebind cleanup semantics for `profileId:deviceId` scopes. Do not delete another account/device scope accidentally.
5. Add real browser IndexedDB acceptance proving account/device isolation, lease persistence, clock-rollback rejection and cleanup.
6. Design the **explicit lesson offline download contract**. Do not cache existing Reader `/v1` responses.
7. Define storage budget before writing blobs: per-account/device quota target, per-download byte accounting, checksum verification, failure rollback, and deterministic eviction/removal behavior.
8. Materialize only server-authorized published content and retain stable lesson/asset IDs + content revision/checksum provenance.
9. On reconnect, revalidate lease/entitlements before allowing further protected offline use; implement purge/tombstone behavior for revoked/expired/unpublished material.
10. Only after protected materialization is safe, wire revisions/tombstones/delta sync and any outbox needed by later offline-writable features.
11. Keep Stage17 blocked until Stage16 closes with exact-head CI + real SW/IndexedDB/offline evidence.
12. Update this file, central docs and Issue #16 after every meaningful batch.

## 10. Do not do

- Do not cache `/v1` in the Service Worker.
- Do not put session cookies/tokens/passwords/device private keys into offline DB.
- Do not treat browser clock as entitlement authority.
- Do not expose raw media storage keys.
- Do not create a duplicate Auth/Access/Curriculum/Question Bank/Assessment authority in the browser.
- Do not add `skipWaiting()` automatically and reload a student mid-lesson/test.
- Do not weaken TypeScript/tests to make the current failure green.
- Do not start Stage17 while Stage16 is open.
- Do not start deployment/hosting work.

## 11. Mandatory startup for a replacement conversation

Read in this order before editing:

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
4. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
5. **`docs/workstreams/STAGE16_STUDENT_HANDOFF.md`**
6. `PROJECT_HANDOFF.md`
7. `PROJECT_STATUS.md`
8. `PROJECT_RESUME_SNAPSHOT.md`
9. `PROJECT_ENGINEERING_LOG.md`
10. `PROJECT_INTEGRATION_CONTINUITY.md`
11. `PROJECT_EXECUTION_QUEUE.md`
12. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
13. `MASTER_REBUILD_ROADMAP.md` Stage16
14. latest Issue `#16` body/comments
15. live branch `parallel/stage14-student-product`, `main` and Actions
16. actual Stage16 files listed above

Then verify live GitHub before trusting any SHA in prose.

## 12. Current continuation sentence

**Stage14 and Stage15 are CLOSED / VERIFIED. Stage16 is ACTIVE. Safe PWA shell and server-issued bounded lease are verified through `5b71aa2...`. The latest code checkpoint `2c44a363...` adds typed lease client + scoped IndexedDB metadata but is NOT VERIFIED because of one strict TypeScript nullability error in `offline-store.ts:85`. Fix that first, rerun exact-head Student + Stage16 gates, then wire lease lifecycle before designing protected lesson downloads.**
