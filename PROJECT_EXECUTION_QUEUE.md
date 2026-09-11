# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Start from the first incomplete item after reading Source of Truth + Issue #16.

Last synchronized: **2026-09-11 — Stage14/15 closed; Stage16 active.**

## Operating rules

- Repo: `7eaur/alwaslh`.
- Student branch: `parallel/stage14-student-product`.
- Issue #16 is shared execution ledger.
- Code/migrations/executable evidence outrank prose.
- No test weakening/auth bypass/fake API/duplicate durable authority/random timeout masking.
- Track A Backend/Admin; Track B Student Product.
- deployment/cutover deferred.

## Completed Track B checkpoints

### STUDENT-014 — Stage14 Student Product

**DONE / VERIFIED / CLOSED**

Runtime `ac55f1435d232cadff334816407f1182125dda90`.

### STUDENT-014I — Integrate canonical Stage13F

**DONE / VERIFIED**

Merge runtime `4a476e1f29cb605fce294d7c34fd68e8218a32e8` from canonical `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.

### STUDENT-015 — Practice / Assessment Engine

**DONE / VERIFIED / CLOSED**

Runtime `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`.

Evidence: API `34427900263`, Assessment `34427900257`, Student Product `34427900209` — SUCCESS.

### STUDENT-016A — Safe PWA app shell

**DONE / VERIFIED**

Runtime `c1ae86036d4d302b8ca8c411227f41c37b4063ef`.

Run `34430284173` SUCCESS.

Scope: manifest, safe SW registration/lifecycle, app-shell/static cache, `/v1` exclusion, real offline reload.

### STUDENT-016B1 — Server-issued bounded offline lease

**DONE / VERIFIED**

Runtime `5b71aa2a3bfbf2a9b7d1c6ec7a3762033ac9cacd`.

- Stage16 `34430915847` SUCCESS.
- API Regression `34430915786` SUCCESS.

Lease is profile/device/server-time/session/entitlement scoped, maximum 24h, metadata only.

## Active Track B queue

### STUDENT-016B2 — Client lease storage exact-head repair

**Priority: P1 · Status: ACTIVE / BLOCKED BY ONE TYPE ERROR**

Current code checkpoint:

`2c44a363638221ee2985ecb6b8fb71c3e757a333`

Implemented:

- `offline-api.ts` typed lease fetch;
- `offline-store.ts` account/device-scoped IndexedDB lease metadata;
- server-time estimate;
- 5-minute clock rollback guard;
- unit tests.

Current failure:

`src/offline-store.ts(85,38) TS18047: evaluation.estimatedServerTimeMs is possibly null`.

Evidence:

- ESLint PASS.
- Vitest 22/22 PASS.
- Student Product `34431220808` FAIL at typecheck.
- Stage16 `34431220827` overall FAIL from same Student build; PostgreSQL lease job PASS; Chromium skipped.

Required completion:

1. fix strict narrowing only; preserve behavior;
2. exact-head Student Product + Stage16 PWA PASS;
3. record new runtime/run IDs in Issue #16 and docs.

---

### STUDENT-016C — Lease lifecycle integration

**Priority: P1 · Status: NEXT AFTER 016B2 GREEN**

Required:

- after successful authenticated online restore/login/activation, fetch current server lease;
- save only metadata into scope `profileId:deviceId`;
- refresh on reconnect/entitlement refresh where appropriate;
- define exact cleanup on logout/session expiry/device rebind;
- never wipe another account/device scope accidentally;
- no auth token/password/session cookie/device private key in offline DB;
- add real Chromium IndexedDB acceptance.

---

### STUDENT-016D — Explicit protected lesson download contract

**Priority: P1 · Status: PENDING 016C**

Required before storing protected bytes:

- explicit server-authorized offline lesson materialization endpoint/manifest;
- only currently entitled + published content;
- stable lesson/asset IDs;
- revision/checksum provenance;
- byte sizes;
- storage budget policy;
- deterministic failure rollback;
- removal/eviction semantics;
- no caching of current Reader `/v1` endpoint.

---

### STUDENT-016E — Offline content store + revocation/revalidation

**Priority: P1 · Status: PENDING 016D**

Required:

- account/device scoped content records;
- checksum validation before commit;
- budget enforcement;
- offline Reader path from explicit local materialization;
- lease enforcement using server-time estimate;
- reconnect entitlement/publication revalidation;
- purge/disable revoked/expired/unpublished material;
- real Chromium offline learning acceptance.

---

### STUDENT-016F — Revisions / tombstones / delta / outbox

**Priority: P1 · Status: PENDING SAFE MATERIALIZATION**

Known current state:

`content_revisions`, `content_tombstones`, `sync_checkpoints` exist but are dormant/unwired. Do not treat them as sync authority.

Required:

- authoritative revision writers;
- cursor semantics;
- tombstone semantics;
- bounded delta API;
- client application rules;
- outbox only for features that are actually allowed to mutate offline;
- conflict/retry/idempotency rules;
- reconnect reconciliation tests.

---

### STUDENT-016G — Stage16 closure

**Priority: P0 process gate · Status: PENDING**

Require exact-head evidence:

- Student lint/typecheck/unit/build;
- API regression where shared API changed;
- clean PostgreSQL migrations/integration;
- real Chromium SW lifecycle;
- IndexedDB account/device isolation;
- offline lease expiry/clock rollback;
- explicit protected downloads;
- checksum/storage-budget behavior;
- revocation/reconnect purge;
- sync/tombstone/outbox behavior if in scope;
- responsive/accessibility regression;
- synchronized docs + Issue #16 closure report.

## Parallel Track A

Stage13G remains Track A. Track B must not absorb Admin ownership. Any shared contract must be additive/minimal and documented.

`AI-012-019` live AI provider bootstrap remains separate and does not block Student use of already-published content.

## Later Student sequence

- Stage17 Personal Learning Data — **BLOCKED UNTIL Stage16 CLOSES**.
- Stage18 Notifications.
- Stage19 Progress/Statistics/Achievements.
- Stage20+ later roadmap.
- release/deployment only when explicitly reopened.

## Exact first item

`STUDENT-016B2`: fix `offline-store.ts:85` TS18047, then rerun exact-head Student Product + Stage16 PWA. Do nothing later in Stage16 before this gate is green.
