# PROJECT EXECUTION QUEUE — الوسيلة الذكية

> Ordered execution authority. Start from the first incomplete item after reading Source of Truth + Issue #16.

Last synchronized: **2026-09-14 — Student Experience V2 merged; Stage16 cold-start + reconnect revalidation verified on PR #59 implementation head; next = STUDENT-016S after PR #59 closure.**

## Operating rules

- Repo: `7eaur/alwaslh`.
- Baseline for new work is live `main`.
- Issue #16 is the execution ledger.
- New work uses short-lived branches from `main`.
- Code/migrations/executable evidence outrank prose.
- No test weakening, auth bypass, fake API, duplicate durable authority or random timeout masking.
- Railway remains inspection/dev evidence until formal release gates.

## Completed checkpoints

- Stage1–10 + OCR — DONE / VERIFIED.
- Stage11 — DONE / VERIFIED.
- Stage12 backend/runtime — DONE / VERIFIED; live provider items `AI-012..AI-019` remain open.
- Stage13A–G — DONE / VERIFIED / integrated into `main`.
- Stage14 — DONE / VERIFIED.
- Stage15 — DONE / VERIFIED.
- Student Experience V2 — DONE / VERIFIED / merged through PR #58 at `main@258c5bc2c09a049afb57c0593b5b6ca9db532c62`.
- Stage16 PWA shell — DONE / VERIFIED.
- Stage16 bounded lease/lifecycle — DONE / VERIFIED.
- Stage16 protected lesson materialization — DONE / VERIFIED.
- Stage16 ES256 signed manifest issuance + Student verification — DONE / VERIFIED.
- `STUDENT-016H` durable non-secret offline scope + read-time signed authority — DONE / VERIFIED.
- `STUDENT-016I` read-time blob integrity + true cold-start Offline Reader — DONE / VERIFIED and reconciled into merged Student V2; superseded PR #57 closed unmerged.

## ACTIVE QUEUE

### STUDENT-016R — Reconnect revalidation / revocation purge

**Priority: P1 · Status: IMPLEMENTED / EXACT-HEAD STUDENT+STAGE16 VERIFIED / PR #59 CLOSURE ACTIVE**

Branch: `stage16/student-016r-reconnect-revalidation`

Draft PR: `#59 — feat(student): revalidate offline packages on reconnect`

Verified implementation head before documentation synchronization:

`d6cd685006d8cbae27dfd9871af671634404b26d`

Implemented behavior:

- detects real browser offline→online transition;
- restores current server session before trusting reconnect state;
- refreshes current bounded profile/device lease;
- re-fetches the authoritative signed offline manifest for every stored lesson package;
- re-verifies ES256 authorization and manifest shape;
- rechecks current profile/device/class/publication/content revision through current server Reader authority;
- refreshes a valid package without duplicate asset download, but only after existing exact byte-size + SHA-256 checks run again against the newly signed manifest;
- purges stale/revoked/unpublished/unverifiable packages deterministically;
- propagates `UNAUTHORIZED` to the existing session-expiry owner for exact-scope cleanup;
- never retains protected bytes merely because they remain in IndexedDB.

Exact-head evidence on `d6cd685...`:

- Student lint/typecheck/unit/build — SUCCESS;
- UX B01/B02/B03/B04/B05 — SUCCESS;
- Stage14 Student Product — SUCCESS;
- Stage15 Student Assessment — SUCCESS;
- Stage16 PostgreSQL lease/download contracts — SUCCESS;
- Stage16 PWA shell Chromium — SUCCESS;
- Stage16 lifecycle/materialization/cold-start/**reconnect revocation** Chromium — SUCCESS.

Real reconnect acceptance covers:

`download → offline → revoke current entitlement in PostgreSQL → reconnect → authoritative hidden Reader denial → local package purge → offline Reader denied`.

Only documentation synchronization / PR closure remains before this item is merged.

---

### STUDENT-016S — Revision / tombstone / cursor / delta

**Priority: P1 · Status: EXACT NEXT ITEM AFTER PR #59 MERGE**

Current schema presence alone is not closure. Required:

- authoritative content revision writers;
- explicit tombstone semantics;
- bounded server cursor/delta API;
- client delta application;
- idempotency and retry behavior;
- explicit relation to downloaded package revision/publication state;
- reconnect/integration/browser evidence;
- no second durable business authority in the browser.

---

### STUDENT-016O — Bounded outbox

**Priority: P1 · Status: CONDITIONAL / PRODUCT NEED**

Implement only if later product-authorized offline writes require it, such as Stage17 personal learning data.

Required before use:

- stable operation IDs;
- bounded retry;
- idempotent server handling;
- explicit conflict rule;
- account/device isolation;
- acknowledgement cleanup;
- no auth/session secrets in outbox.

Do not invent an outbox because a table or future concept exists.

---

### STUDENT-016G — Stage16 closure

**Priority: P0 process gate · Status: PENDING 016S + CONDITIONAL 016O DECISION**

Require one exact runtime HEAD with:

- Student lint/typecheck/unit/build;
- API quality gates when shared/backend code changes;
- clean PostgreSQL migrations/contracts;
- PWA shell Chromium;
- account/device offline isolation;
- signed authorization issuance + read-time verification;
- read-time blob integrity;
- true cold-start offline Reader;
- tamper/expiry/clock-rollback rejection;
- reconnect revalidation/revocation purge;
- revision/tombstone/cursor/delta behavior;
- responsive/accessibility regression;
- wider regression matrix;
- synchronized docs + Issue #16 closure report.

Stage17 remains blocked until this gate passes.

## CONTROLLED CONTENT QUEUE

Content work may proceed independently only through normal review/publication authority. Do not rerun already closed Grade 9 bulk import or reviewed Unit 2 publication checkpoints.

Remaining imported content stays unpublished until evidence-backed pedagogical/question review explicitly approves publication.

## CROSS-CUTTING OPEN ITEM

### AI-012..AI-019 — Live AI provider readiness

**Priority: P2 until release dependency becomes active · Status: NOT YET VERIFIED**

Need real provider/model/credential/rate/failure/runtime evidence. Fixtures do not close live provider readiness.

## LATER PRODUCT SEQUENCE

### Stage17 — Personal Learning Data
Notes / Favorites / Needs Review, stable provenance, local/server ownership and offline/sync behavior.

### Stage18 — Notifications
In-App + Web Push where supported, secure subscription lifecycle, quiet hours/opt-out.

### Stage19 — Progress / Statistics / Achievements
Server-derived trusted metrics, sufficient-sample recommendations, private achievements, no unapproved global leaderboard.

### Stage20 — Import / Export / Reporting closure
Reuse existing Admin capabilities and close only verified gaps.

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
Formal release-candidate staging.

### Stage27 — Release Gate
No unresolved/unaccepted P0/P1; backup restore + real-host security/performance/a11y + Admin/Student E2E + Offline/PWA + content/legacy coverage.

### Stage28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke → rollback readiness → explicit Product Owner declaration.

### Stage29 — Monitoring & Operations
Auth/access/device resets, DB/backups, media/OCR/AI, offline sync, Push, storage/PWA/runtime health and incident runbooks.

## Exact next item

Close PR #59 without regression, then start `STUDENT-016S` from the new live `main`.
