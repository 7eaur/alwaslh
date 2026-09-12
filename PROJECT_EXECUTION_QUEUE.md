# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Start from the first incomplete item after reading Source of Truth + Issue #16.

Last synchronized: **2026-09-12 — unified `main`; Stage16 active; Railway inspection/dev live.**

## Operating rules

- Repo: `7eaur/alwaslh`.
- Baseline: live `main`.
- Issue #16 is the execution ledger.
- New work uses short-lived branches from `main`.
- Old Stage13G/Student long-lived branches are historical/reference after PR #33.
- Code/migrations/executable evidence outrank prose.
- No test weakening/auth bypass/fake API/duplicate durable authority/random timeout masking.
- Hosted Railway is inspection/dev evidence, not a substitute for CI or Stage27/28 release gates.

## Completed checkpoints

- Stage1–10 + OCR — DONE / VERIFIED.
- Stage11 — DONE / VERIFIED.
- Stage12 backend/runtime — DONE / VERIFIED; live provider items `AI-012..AI-019` remain open.
- Stage13A–G — DONE / VERIFIED / integrated into `main`.
- Stage14 — DONE / VERIFIED.
- Stage15 — DONE / VERIFIED.
- Stage16 PWA shell — DONE / VERIFIED.
- Stage16 bounded lease/lifecycle — DONE / VERIFIED.
- Stage16 protected lesson materialization — DONE / VERIFIED for download/storage boundary.
- Stage16 ES256 signed manifest + Student verification before storage — DONE / VERIFIED for issuance/download boundary.
- Full integration PR #33 — 19/19 workflows SUCCESS; merged.
- Railway API/Admin/Student/PostgreSQL inspection stack — LIVE / latest known SUCCESS.
- Grade 9 English canonical media proof — DONE / VERIFIED as Draft-only bounded content proof.

## ACTIVE QUEUE

### STUDENT-016H — Durable offline scope + read-time signed authority

**Priority: P1 · Status: ACTIVE / EXACT NEXT ITEM — candidate implemented, acceptance pending**

Candidate branch `fix/stage16-read-time-authority` starts at live `main@dee9ebda9c56900421754228ad0db34a4b6a40e7`. Durable scope and read-time signature/field/blob checks implemented; Student local lint/typecheck/build + 34/34 tests PASS. CI/browser acceptance and merge remain pending. 016I Reader is still unimplemented.

Required:

1. live-check `main`, Issue #16, Actions and Railway;
2. create a short-lived Stage16 branch from `main`;
3. replace session-only scope discovery with a durable **non-secret** active profile/device selector;
4. preserve exact logout/rebind/session cleanup semantics;
5. reconstruct trusted manifest from stored signed envelope at use time;
6. verify configured public key identity, ES256 signature, canonical signed payload and stored-field equality;
7. fail closed on missing key, malformed data, key mismatch, signature failure, payload mismatch or expiry;
8. never place private signing material in Student code/storage.

Acceptance:

- unit tests for durable scope and signature/field mismatch;
- browser storage isolation;
- no regression of online login/session flows.

---

### STUDENT-016I — Read-time blob integrity + cold-start offline Reader

**Priority: P1 · Status: PENDING 016H**

Required:

- hash stored blobs at offline use/read time;
- compare size + SHA-256 against **signed** manifest fields;
- explicit offline library/Reader state;
- app shell works after real browser restart with network unavailable;
- only valid signed/verified packages render;
- online-only Assessment/actions are hidden/disabled honestly offline;
- invalid/tampered/expired package fails closed.

Real Chromium acceptance must cover:

`download online → close/restart context → network unavailable → app loads → package discovered → signature verified → blobs verified → Reader renders`.

Also test:

- signature tamper;
- manifest/stored-field mismatch;
- blob tamper;
- authorization expiry;
- backward clock;
- account/device isolation;
- offline-empty state.

---

### STUDENT-016R — Reconnect revalidation / revocation purge

**Priority: P1 · Status: PENDING 016I**

Required:

- recheck current Student session/device when online;
- recheck entitlement;
- recheck publication/unpublication;
- recheck content revision;
- define stale/revoked/expired/unpublished behavior;
- purge/disable invalid packages deterministically;
- never keep showing protected bytes merely because they exist locally;
- real Chromium reconnect/revocation regression.

---

### STUDENT-016S — Revision / tombstone / cursor / delta

**Priority: P1 · Status: PENDING SAFE COLD-OFFLINE**

Current schema presence is not enough. Required:

- authoritative content revision writers;
- tombstone semantics;
- bounded server cursor/delta API;
- client delta application;
- idempotency/retry behavior;
- explicit relation to downloaded package revision/publication state;
- integration + browser reconnect evidence.

---

### STUDENT-016O — Bounded outbox

**Priority: P1 · Status: PENDING PRODUCT NEED**

Only implement an outbox for later product-authorized offline writes such as Stage17 personal learning data if those writes are explicitly supported offline.

Required before use:

- stable operation IDs;
- bounded retry;
- idempotent server handling;
- conflict rule;
- account/device isolation;
- cleanup after acknowledgement;
- no auth/session secrets in outbox.

Do not invent an outbox merely because a table name exists.

---

### STUDENT-016G — Stage16 closure

**Priority: P0 process gate · Status: PENDING**

Require one exact runtime HEAD with:

- Student lint/typecheck/unit/build;
- API lint/typecheck/unit/build when shared code changed;
- clean PostgreSQL migrations/contracts;
- PWA shell real Chromium;
- account/device offline isolation;
- signed authorization issuance + read-time verification;
- read-time blob integrity;
- true cold-start offline Reader;
- tamper/expiry/clock-rollback rejection;
- reconnect revalidation/purge;
- revision/tombstone/delta behavior required by Stage16;
- responsive/accessibility regression;
- wider regression matrix;
- synchronized docs + Issue #16 closure report.

Stage17 remains blocked until this gate passes.

## CONTROLLED CONTENT QUEUE — may run separately from Stage16 architecture

### CONTENT-PROD-002 — Review/publish Grade 9 English proof

**Priority: P1 product verification · Status: READY / NOT YET EXECUTED**

Current live Draft sample:

- 75 source images;
- 75 ready media assets;
- 300 variants;
- 75 Draft lesson assets;
- 10 lessons.

Required:

1. inspect class/subject/lesson titles/grouping/order in Admin;
2. inspect representative source/display/thumbnail rendering;
3. correct mapping if necessary before publication;
4. move only approved lessons/assets through normal Review/Published authority;
5. verify Student entitlement + Reader on Railway;
6. record exact published sample and browser evidence.

No automatic AI question publication.

### CONTENT-PROD-003 — Next bounded canonical subject

**Status: PENDING CONTENT-PROD-002**

Before import:

- choose a small representative subject with deterministic manifest/grouping;
- estimate raw + variant storage;
- verify media-volume capacity;
- import through current idempotent pipeline;
- review before publishing.

### CONTENT-PROD-004 — Full canonical media load

**Status: NOT YET STARTED**

Stage9 inventory = 48 documents / 5,552 images. Full byte materialization requires proven mapping across representative subjects, capacity sizing and controlled batches. Do not bulk-import blindly.

## CROSS-CUTTING OPEN ITEM

### AI-012..AI-019 — Live AI provider readiness

**Priority: P2 until release dependency becomes active · Status: NOT YET VERIFIED**

Need real evidence for provider/model benchmark, routes, credentials/bootstrap, limits/failures and production runtime. Existing test fixtures do not close this.

## LATER PRODUCT SEQUENCE

### Stage17 — Personal Learning Data

Notes / Favorites / Needs Review, stable provenance, local/server ownership and offline/sync behavior.

### Stage18 — Notifications

In-App + Web Push where supported, secure subscription lifecycle, quiet hours/opt-out.

### Stage19 — Progress / Statistics / Achievements

Server-derived trusted metrics, sufficient-sample recommendations, private achievements, no unapproved global leaderboard.

### Stage20 — Import / Export / Reporting closure

Reuse Stage13G/Admin capabilities; close remaining validated module/reporting gaps rather than rebuilding parallel exports.

### Stage21 — Performance Engineering

Measure first; optimize evidenced bottlenecks.

### Stage22 — Security Hardening

Authorization/IDOR/rates/session/CSRF/CORS/CSP/device abuse/upload/storage/secrets/dependencies/audit/backups.

### Stage23 — Tests & CI Expansion

Complete cross-surface unit/DB/integration/browser/concurrency/regression coverage.

### Stage24 — Accessibility / Device QA

RTL, keyboard/focus/screen reader, zoom/contrast/reduced motion, touch targets, mobile/tablet/desktop/PWA/offline/device-reset.

### Stage25 — Initial Data / Content Load

Complete canonical production curriculum/content through verified pipelines.

### Stage26 — Staging

Formal release-candidate staging. Current Railway inspection/dev stack does not automatically close Stage26.

### Stage27 — Release Gate

No unresolved/unaccepted P0/P1, backup restore, real-host evidence, security/performance/a11y, Admin/Student E2E, Offline/PWA, complete content/legacy coverage.

### Stage28 — Production Cutover

Provision → migrations → content → backend/workers → Admin → Student → smoke → rollback readiness → explicit Product Owner declaration.

### Stage29 — Monitoring & Operations

Auth/access/device resets, DB/backups, media/OCR/AI, offline sync, Push, storage/PWA/runtime health and incident runbooks.

## Exact first item

`STUDENT-016H`: durable non-secret active scope + read-time signed authorization verification on a short-lived branch from live `main`.
