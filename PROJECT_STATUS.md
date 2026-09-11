# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code/migrations/executable CI outrank prose. Anything not executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-11**.

## Current position

- Repository: `7eaur/alwaslh`.
- Execution ledger: GitHub Issue #16.
- Track A: Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G — closed on its branch, not promoted to `main` without Product Owner direction.
- Track B: Student Product on `parallel/stage14-student-product`.
- Production deployment/cutover remains deferred.
- Shared `main` remains the Stage13F checkpoint until explicitly changed.

## Verified Student checkpoints

- Stage14 `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage15 `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.
- Stage16 PWA shell `c1ae86036d4d302b8ca8c411227f41c37b4063ef` — VERIFIED.
- Stage16 server lease `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd` — VERIFIED.
- Stage16 client lease lifecycle `53aeb972c4c891c3eecafdde0716b544751d2711` — VERIFIED for that boundary.
- Stage16 protected lesson materialization `d350206710003da311693834db90e348d1a89bc3` — VERIFIED for manifest/download/checksum/budget/atomic storage/delete/isolation boundary.

## Current active stage

**Stage16 — Offline / PWA — ACTIVE / NOT CLOSED.**

Detailed handoff: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

Verified through `d3502067...`:

- Service Worker app shell only; `/v1` never cached/intercepted;
- bounded server-issued profile/device lease;
- scoped IndexedDB lease lifecycle and cleanup;
- explicit protected lesson manifest + asset download path;
- published/entitled content only at issuance;
- IndexedDB v2 lesson packages scoped per profile/device;
- 64 MiB lesson + 256 MiB scope budgets;
- exact byte-size + SHA-256 verification before atomic write;
- no silent eviction; explicit remove/update;
- package cleanup on scoped logout/session expiry/rebind;
- Download UI placed after Assessment, before Access;
- PostgreSQL content revision normalized to safe numeric Student contract.

Exact-head executable evidence:

- Stage16 Student PWA `34557753480` — SUCCESS.
- Stage14 Student Product `34557753472` — SUCCESS.
- API Regression `34557536412` — SUCCESS for `contentRevision` boundary fix.

## Current P1 Stage16 findings

- `STUDENT-016-SYNC-001` — sync schema exists but writers/API/client delta flow remain OPEN / PROVEN absent.
- `STUDENT-016-LEASE-002` — FIXED / VERIFIED for bounded lease + client lifecycle boundary.
- `STUDENT-016-CACHE-003` — FIXED / VERIFIED for explicit materialization boundary.
- `STUDENT-016-QA-004` — FIXED / VERIFIED.
- `STUDENT-016-CLIENT-005` — FIXED / VERIFIED.
- `STUDENT-016-DOWNLOAD-006` — FIXED / VERIFIED for manifest/budget/checksum/accounting/rollback/removal.
- `STUDENT-016-REVOCATION-007` — reconnect revalidation/purge OPEN.
- `STUDENT-016-OUTBOX-008` — durable delta/outbox reconciliation OPEN.
- `STUDENT-016-OFFLINE-AUTH-009` — **OPEN / ACTIVE NEXT**: unsigned mutable local lease/package metadata cannot become true cold-offline protected Reader authority.

## Security decision for cold-offline

Do not render protected stored lesson bytes after a browser cold start using only the current unsigned IndexedDB lease/package metadata. The next batch must add a cryptographically signed server authorization envelope, client verification with a non-secret pinned public identity, read-time blob integrity checks and fail-closed tamper/expiry behavior.

A browser is not a DRM-grade trusted execution environment; the security target is authentic server authorization, integrity, bounded expiry, account/device isolation and reconnect purge—not impossible secrecy from a hostile user controlling their own browser.

## Stage ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; live provider bootstrap still NOT YET VERIFIED |
| Stage13A–F | VERIFIED / CLOSED; Stage13F promoted |
| Stage13G | VERIFIED / CLOSED on Track A branch; not promoted |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Practice/Assessment | CLOSED / VERIFIED |
| Stage16 Offline/PWA | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17 Personal Learning | **BLOCKED BY Stage16** |
| Stage18+ | later roadmap |
| Release/deployment | future / deferred |

## Exact next work

1. Signed server-authentic offline lesson authorization envelope + client verification.
2. Read-time stored-blob checksum verification against signed checksums.
3. Durable non-secret active offline scope discovery across browser restart.
4. True cold-start offline Reader in real Chromium with network unavailable and tamper/expiry rejection.
5. Reconnect session/device/entitlement/publication/revision revalidation + purge.
6. Revision/tombstone/cursor/delta/outbox wiring only after protected cold-offline is safe.
7. Keep Stage17 and deployment blocked until Stage16 closes.
