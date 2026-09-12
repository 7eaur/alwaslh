# MASTER REBUILD ROADMAP — الوسيلة الذكية

> Same product, stronger implementation. Stage state is proven only by executable evidence; this Roadmap defines sequence, not truth by itself.

Last synchronized: **2026-09-12**.

## Core principles

- preserve valuable product/business outcomes and legacy scenarios;
- replace unsafe/duplicated architecture instead of preserving it blindly;
- root-cause fixes, incremental batches and executable evidence;
- no feature removal without Product Owner approval;
- no browser-direct durable authority;
- no duplicate Auth/Access/AI/Question Bank/Quiz/content/sync authority;
- `NOT YET VERIFIED` until executed/tested;
- live hosting never replaces repository/CI acceptance.

## Current execution model

The earlier parallel Track A / Track B model is historical after PR #33.

PR #33 integrated Stage13G + current Student Product into `main`:

- verification head `dcdae7579a40878c71f64593280a0df2f8363ee2`;
- **19/19 workflows SUCCESS**;
- merge commit `5e22c3ff157b42b6da47febe205dd91fcb264eed`.

All remaining post-Stage13 work is now one unified continuation from live `main`, using short-lived branches per batch.

## Stage progression

### Stage 1 — Product Contract — VERIFIED

### Stage 2 — Brand Identity — VERIFIED

### Stage 3 — UX Architecture — VERIFIED baseline

### Stage 4 — PostgreSQL Platform — VERIFIED

### Stage 5 — Engineering Foundation — VERIFIED

### Stage 6 — Auth & Authorization — VERIFIED

### Stage 7 — Access Codes & Entitlements — VERIFIED

### Stage 8 — Student Activation / Login / Recovery / Device — VERIFIED

Includes real Chromium and bound-device security behavior.

### Stage 9 — Canonical Source Import — VERIFIED

Canonical source inventory/provenance verified. Current approved source checkpoint:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Full inventory: **48 documents / 5,552 images**. Inventory metadata does not imply all bytes are hosted/published.

### Stage 10 — Media Pipeline — VERIFIED

### OCR Foundation — VERIFIED

### Stage 11 — Provider-Neutral AI Contracts — VERIFIED

Provider-neutral modes/prompts/versions/provenance/output contracts verified.

### Stage 12 — Durable AI Execution / Runtime — VERIFIED backend/runtime

Jobs/units/attempts/outputs, leases/retries/cancellation/capacity/budget/cooldown and worker runtime verified.

`AI-012..AI-019` live provider/model/routes/credentials/bootstrap remains **NOT YET VERIFIED**.

# Stage 13 — Super Admin Product — VERIFIED / CLOSED / INTEGRATED

## Stage13A — Curriculum Structure Backend — VERIFIED

## Stage13B — Admin Curriculum Web — VERIFIED

## Stage13C — Content / Media / OCR Operations — VERIFIED

## Stage13D — Upload / Processing History / Publication Linking — VERIFIED

## Stage13E — Admin AI Operations / Review — VERIFIED / CLOSED

## Stage13F — Question Bank / Quiz Builder / Publish — VERIFIED / CLOSED

Verified durable Question Bank revisions, human review/publication, Quiz Builder immutable versions/snapshots, regeneration, CSV/print exports and Student-safe delivery authority.

## Stage13G — Remaining Admin Product / AI Authoring Parity — VERIFIED / CLOSED / INTEGRATED

Verified areas include:

- Student accounts/access operations;
- code generation/import/export/print;
- notifications/operations;
- reports/settings/security/audit;
- lesson/quiz AI authoring orchestration;
- question regeneration/archive;
- human reviewed-output application;
- specialized quiz exports;
- lesson summary edit/clear;
- quiz metadata editing;
- lesson content/history export;
- safe AI → review → Question Bank → Quiz publication chain.

Stage13G was integrated with Student Product through PR #33 after full cross-stage verification.

# Stage 14 — Student Web/PWA Product — CLOSED / VERIFIED

Verified Student activation/login/recovery/device/session, access/entitlements, curriculum, protected Reader/media/OCR, search/TTS capabilities, responsive RTL UX and browser regressions.

# Stage 15 — Practice / Assessment Engine — CLOSED / VERIFIED

Verified consumption of immutable published quiz snapshots, Practice/Test behavior, resume/restart/history, stable ordering/provenance and server-owned scoring/finalization.

# Stage 16 — Offline / PWA — ACTIVE / PARTIALLY VERIFIED

## Already verified

- safe PWA app shell;
- `/v1` excluded from Service Worker cache;
- bounded profile/device/session/entitlement lease;
- IndexedDB exact-scope lifecycle;
- explicit protected lesson manifest/assets;
- exact byte-size + SHA-256 verification;
- 64 MiB lesson / 256 MiB scope budgets;
- atomic package storage/replacement/removal;
- ES256 server-signed canonical offline authorization envelope;
- Student public-key/keyId/signature/canonical-manifest verification before package storage;
- real Chromium tamper rejection at download/materialization boundary.

Integrated Stage16 evidence: workflow `34560999667` on PR #33 head — all jobs SUCCESS.

## Still required before Stage16 closure

1. durable non-secret active offline scope across true browser restart;
2. re-verify stored signed authorization and signed-field consistency at use/render time;
3. re-hash stored blobs against signed checksums at read time;
4. true cold-start offline library/Reader with network unavailable;
5. fail-closed signature/field/blob/expiry/clock/account-device acceptance in real Chromium;
6. reconnect session/device/entitlement/publication/revision revalidation + purge;
7. authoritative revision writers + tombstones + bounded cursor/delta API + client application;
8. bounded outbox only for explicitly authorized future offline writes;
9. exact-head wider closure matrix + docs/Issue #16.

# Stage 17 — Personal Learning Data — REQUIRED AFTER STAGE16

- Notes;
- Favorites;
- Needs Review;
- stable provenance;
- explicit local/server ownership;
- offline/sync behavior built on the closed Stage16 authority.

# Stage 18 — Notifications — REQUIRED

- In-App;
- Web Push where supported;
- secure subscription lifecycle;
- quiet hours/opt-out;
- permission/expiry/revocation behavior.

# Stage 19 — Progress / Statistics / Achievements — REQUIRED

- server-derived trusted metrics;
- sufficient-sample recommendations;
- private achievements;
- no unapproved global leaderboard.

# Stage 20 — Import / Export / Reporting — REQUIRED CLOSURE

Reuse Stage13G capabilities and close remaining validated module/reporting gaps. Do not create duplicate export/report stores.

# Stage 21 — Performance Engineering

Measure first; optimize evidenced bottlenecks only.

# Stage 22 — Security Hardening

Authorization/IDOR/rates/session/CSRF/CORS/CSP/device abuse/upload/storage/secrets/dependencies/audit/backups.

# Stage 23 — Automated Tests & CI Expansion

Unit/DB/Auth/Device/Access/Content/Media/OCR/AI/Question Bank/Practice/Offline/Admin/Student E2E + concurrency/idempotency + legacy regression.

# Stage 24 — Accessibility / Device QA

RTL, keyboard/focus/screen reader, zoom, contrast, reduced motion, touch targets, mobile/tablet/desktop/PWA/offline/device-reset scenarios.

# Stage 25 — Initial Data / Content Load

Complete canonical production curriculum/content through verified pipelines.

Current live content proof:

- Grade 9 English only;
- 75 source images / 8,390,689 bytes;
- 75 ready media assets;
- 300 variants;
- 75 Draft lesson assets / 10 lessons;
- not Student-visible yet.

Full 5,552-image byte materialization remains NOT YET EXECUTED.

# Stage 26 — Staging

Formal release-candidate staging and configuration validation.

Current Railway inspection/dev stack is useful evidence but does **not** automatically close Stage26.

# Stage 27 — Release Gate

Require:

- no unresolved/unaccepted P0/P1;
- real-host DB/storage/AI evidence where required;
- backup/restore drill;
- Auth/device/access races;
- Admin/Student E2E;
- Offline/PWA closure;
- performance/security/a11y acceptance;
- complete Legacy Coverage;
- content/load acceptance;
- rollback readiness.

# Stage 28 — Production Cutover

Provision → migrations → content → backend/workers → Admin → Student → smoke → rollback readiness → explicit Product Owner release declaration.

The current Railway environment is **not yet Stage28 completion**, even though its environment is named `production`.

# Stage 29 — Monitoring & Operations

Auth/access/device reset, DB/backups, media/OCR/AI, offline sync, Push, storage/PWA/runtime health, observability and incident runbooks.

## Current hosted inspection/dev environment

Railway currently runs:

- API;
- Admin;
- Student;
- PostgreSQL;
- persistent API media volume.

Latest known service state at the 2026-09-12 sync: all four services SUCCESS. See `docs/operations/RAILWAY_LIVE_STATE.md`.

## Current canonical content rule

Old Supabase import is out of current scope by Product Owner instruction.

Use `7eaur/alwaslh-go@f81ebb6...` + current Media/Curriculum pipeline. Imported content remains Draft until Admin publication.

See `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`.

## Current progress table

| Area | Status |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; `AI-012..AI-019` open |
| Stage13A–G | VERIFIED / CLOSED / integrated |
| Stage14 | CLOSED / VERIFIED |
| Stage15 | CLOSED / VERIFIED |
| **Stage16** | **ACTIVE / PARTIALLY VERIFIED** |
| Stage17–20 | REQUIRED after Stage16 |
| Stage21–25 | planned hardening/completion gates |
| Stage26–29 | release/staging/cutover/operations gates |
| Railway inspection/dev hosting | LIVE / VERIFIED current stack |
| Full canonical content load | NOT YET COMPLETE |

## Exact next stage action

Finish Stage16 by implementing durable scope + read-time signed authorization + read-time blob integrity + true cold-start offline Reader, then reconnect purge and authoritative delta/tombstone/outbox. Close Stage16 on one exact-head verification matrix before opening Stage17.

## Final completion rule

The product is not feature-complete/release-complete until every valuable legacy capability is mapped to verified implementation/test or explicit Product Owner-approved removal, Stage16–25 are closed, required live AI evidence is proven, and Stage27/28 release gates are explicitly accepted.
