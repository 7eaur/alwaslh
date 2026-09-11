# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code/migrations/executable CI outrank prose. Anything not executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11**.

## Current position

- Repository: `7eaur/alwaslh`.
- Execution ledger: GitHub Issue #16.
- Track A: Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G.
- Track B: Student Product on `parallel/stage14-student-product`.
- Production deployment/cutover remains deferred.
- Canonical Stage13F main baseline previously verified at `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`; live main must be rechecked before new shared API work.

## Verified Student checkpoints

- Stage14: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F→Student: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 PWA shell: `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED, run `34430284173`.
- Stage16 server lease: `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED, Stage16 `34430915847` + API Regression `34430915786` SUCCESS.
- Stage16 client lease lifecycle: runtime `53aeb972c4c891c3eecafdde0716b544751d2711` — VERIFIED for current lease/lifecycle boundary.

## Current active stage

**Stage16 — Offline / PWA — ACTIVE / NOT CLOSED.**

Detailed handoff: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

Verified through `53aeb972...`:

- safe app-shell Service Worker; `/v1` never cached/intercepted;
- bounded server-issued profile/device lease using PostgreSQL time;
- IndexedDB lease metadata scoped `profileId:deviceId`;
- activation/login/restore lease refresh + persistence;
- scoped logout/session-expiry/device-rebind cleanup;
- account/device isolation;
- 5-minute clock rollback rejection;
- no password/session cookie/token/device private key/raw storage key copied to Stage16 storage.

Executable evidence:

- Stage16 `34551931757` — SUCCESS, including PostgreSQL lease, production build, PWA Chromium and IndexedDB lifecycle Chromium 3/3.
- Stage14 `34551931610` attempt 2 — SUCCESS on exact runtime `53aeb972...`, including lint, strict typecheck, Vitest 22/22, build, contracts and full Chromium suite.
- Attempt 1 had one non-reproducible Assessment assertion failure; unchanged rerun passed. No product/test weakening was performed.

## Current P1 Stage16 findings

- `STUDENT-016-SYNC-001` — sync schema exists but writers/API/client delta flow remain OPEN / PROVEN absent.
- `STUDENT-016-LEASE-002` — FIXED / VERIFIED for bounded lease + client lifecycle boundary.
- `STUDENT-016-CACHE-003` — explicit protected lesson offline materialization absent — OPEN / NEXT DESIGN.
- `STUDENT-016-QA-004` — TS18047 FIXED / VERIFIED.
- `STUDENT-016-CLIENT-005` — authenticated lease lifecycle/cleanup FIXED / VERIFIED.
- `STUDENT-016-DOWNLOAD-006` — manifest/budget/checksum/accounting/rollback/eviction absent — OPEN / NEXT.
- `STUDENT-016-REVOCATION-007` — reconnect revalidation/purge for future protected blobs absent — OPEN.
- `STUDENT-016-OUTBOX-008` — durable delta/outbox reconciliation absent — OPEN.

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
| Stage17 Personal Learning | **BLOCKED BY Stage16** |
| Stage18+ | later roadmap |
| Release/deployment | future / deferred |

## Exact next work

1. Recheck live Student HEAD, main and Issue #16 before shared-contract work.
2. Inspect actual Reader/content/publication/media code and migrations.
3. Define explicit server-authorized protected lesson download manifest with stable lesson/asset IDs, revision/provenance, SHA-256/checksum and byte sizes.
4. Define account/device storage budget, exact accounting, failure rollback and deterministic eviction/removal before storing blobs.
5. Implement only the smallest compatible shared API, never caching current Reader `/v1` responses.
6. Then implement scoped protected materialization + real Chromium offline verification.
7. Then reconnect entitlement/publication revalidation + purge.
8. Only afterward wire revision writers/tombstones/cursor/delta/outbox.
9. Keep Stage17 and deployment blocked until Stage16 closes.
