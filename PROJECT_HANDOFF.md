# PROJECT HANDOFF — الوسيلة الذكية

> أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-11 — Stage14/15 closed; Student Stage16 active.**

## Mandatory startup

1. Confirm repo `7eaur/alwaslh`.
2. Confirm Student branch `parallel/stage14-student-product` when continuing Track B.
3. Read `README.md` then `DOCUMENTATION_INDEX.md`.
4. For Track B read, in order:
   - `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
   - `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
   - `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
5. Read `PROJECT_STATUS.md`, `PROJECT_RESUME_SNAPSHOT.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_EXECUTION_QUEUE.md`.
6. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` and `MASTER_REBUILD_ROADMAP.md` for the current stage.
7. Read latest Issue #16 body/comments.
8. Live-check current branch, `main` and Actions before any conclusion.

Code/migrations/executable CI evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## Operating model

- Track A: Backend/Admin/AI/Question Bank/Quiz Builder/Stage13G.
- Track B: Student Product on `parallel/stage14-student-product`.
- `main` is verified shared-contract handoff authority.
- Track B may add a minimal shared API only when a missing Student contract is proven, documented and non-conflicting.
- No duplicate durable authority, auth bypass, fake API or test weakening.
- deployment/hosting remains deferred.

## Stable product/business rules

- Browser does not own canonical durable business state.
- Full Code = 6 digits; Class Code = 7 digits.
- returning Student requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- `media ready != published`; Student content requires publication time to have arrived.
- raw provider/AI output never automatically becomes Student authority.
- Question Bank published revisions + published Quiz versions are immutable delivery authority.
- Student assessment scoring/finalization remains server-owned.
- protected Reader media is server-authorized and does not expose raw storage keys.

## Verified Student checkpoints

- Stage14 runtime `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Canonical Stage13F main `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage13F→Student integration `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- Stage15 runtime `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.

## Current Stage16 state

Stage16 = **ACTIVE / PARTIALLY VERIFIED / NOT CLOSED**.

Detailed source: `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`.

Verified runtime boundary:

`5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd`

Evidence:

- Stage16 `34430915847` SUCCESS — PostgreSQL bounded lease + PWA real Chromium.
- API Regression `34430915786` SUCCESS.

Verified Stage16 capabilities:

- PWA manifest + app-shell Service Worker;
- `/v1` excluded from SW cache/interception;
- no automatic `skipWaiting`;
- real offline shell reload;
- server-issued `GET /v1/student/offline/lease`;
- lease requires valid Student session + non-revoked device;
- server/PostgreSQL time authority;
- max 24h, clipped by session expiry;
- grants clipped by entitlement expiry;
- metadata only, `private,no-store`.

## Latest code checkpoint / exact blocker

Latest code checkpoint before documentation:

`2c44a363638221ee2985ecb6b8fb71c3e757a333`

It adds typed lease client + dedicated IndexedDB lease metadata but is **NOT VERIFIED**.

Exact failure:

```text
src/offline-store.ts(85,38): error TS18047:
'evaluation.estimatedServerTimeMs' is possibly 'null'.
```

Runs:

- Student Product `34431220808` — FAILURE at strict typecheck; Chromium skipped.
- Stage16 `34431220827` — overall FAILURE due same Student build error; PostgreSQL lease job SUCCESS; Chromium skipped.
- ESLint PASS.
- Vitest 22/22 PASS.

First continuation action: fix TypeScript narrowing only, preserve behavior/strictness, then rerun exact-head Student Product + Stage16 PWA.

## Stage16 security boundary

Do not violate these:

- no `/v1` Cache API caching;
- no password/session cookie/token/device private key in offline DB;
- no browser-clock entitlement authority;
- no raw media storage key exposure;
- no protected lesson blobs before explicit download/budget/checksum contract;
- no duplicate Auth/Access/Curriculum/Question Bank/Assessment authority;
- no automatic forced SW update/reload during study;
- no Stage17 before Stage16 closure.

## Current open Stage16 work

- wire lease fetch/save into authenticated lifecycle and exact scope cleanup;
- real Chromium IndexedDB account/device isolation + persistence + rollback + cleanup;
- explicit lesson offline download/materialization contract;
- byte/checksum/storage budget + eviction/failure rollback;
- reconnect entitlement/publication revalidation + purge;
- authoritative revisions/tombstones/delta/outbox.

Existing `content_revisions`, `content_tombstones`, `sync_checkpoints` are currently dormant/unwired; do not treat schema presence as verified sync.

## Exact continuation

Fix `offline-store.ts:85` → exact-head green Student/Stage16 gates → wire lease lifecycle/cleanup → browser IndexedDB acceptance → explicit protected download/budget/checksum → reconnect purge → delta/tombstone/outbox → Stage16 closure. Deployment remains deferred.
