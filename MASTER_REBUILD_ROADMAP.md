# MASTER REBUILD ROADMAP — الوسيلة الذكية

> Same product, stronger implementation. Stage state is proven only by executable evidence; this Roadmap defines sequence, not truth by itself.

Current Stage13F verified runtime checkpoint: `afbe552710b3f1cf79ee70594f691fa836c05a45`.

Current execution model: parallel Track A (Backend/Admin/AI) + Track B (Student Product), coordinated through Issue #16 and verified `main` contracts.

Production deployment/cutover remains future-only; repository/CI gates remain mandatory regardless of hosting.

## Core Principles

- preserve product/business outcomes and valuable legacy scenarios;
- replace unsafe/duplicated architecture instead of preserving it blindly;
- root-cause fixes, incremental batches and executable evidence;
- no feature removal without Product Owner approval;
- no browser-direct durable authority;
- no duplicate Auth/Access/AI/Question Bank/Quiz state across tracks;
- `NOT YET VERIFIED` until tested.

## Stage Progression

### Stage 1 — Product Contract — VERIFIED

### Stage 2 — Brand Identity — VERIFIED

### Stage 3 — UX Architecture — VERIFIED baseline

### Stage 4 — PostgreSQL Platform — VERIFIED

### Stage 5 — Engineering Foundation — VERIFIED

### Stage 6 — Auth & Authorization — VERIFIED

### Stage 7 — Access Codes & Entitlements — VERIFIED

### Stage 8 — Student Activation / Login / Recovery / Device — VERIFIED incl. real Chromium

### Stage 9 — Canonical Source Import — VERIFIED

### Stage 10 — Media Pipeline — VERIFIED

### OCR Foundation — VERIFIED

### Stage 11 — Provider-Neutral AI Contracts — VERIFIED

Modes, prompts/versions, source provenance, MCQ/T-F/direct rules, exact extraction, multi-version output and regenerate-one contract are verified. This does not by itself prove a live provider runtime.

### Stage 12 — Durable AI Execution / Runtime — VERIFIED backend/runtime

Jobs/units/attempts/outputs, leases/retries/cancellation/capacity/budget/cooldown and worker runtime are verified. `AI-012-019` live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED`.

# Stage 13 — Super Admin Product

## Stage13A — Curriculum Structure Backend — VERIFIED

## Stage13B — Admin Curriculum Web — VERIFIED

## Stage13C — Content / Media / OCR Operations — VERIFIED

## Stage13D — Upload / Processing History / Publication Linking — VERIFIED

Image/PDF/mixed upload, deterministic order, Stage10 reuse, durable progress/history/retry/archive and Lesson Draft→Review→Published are verified.

## Stage13E — Admin AI Operations / Review — VERIFIED / CLOSED

Verified runtime/application authority: `d5ebc7f25a369430387a758c7c0bb89350963d67`.

Stage13E provides durable Admin observability/control and Stage11-validated human review. Approval remains review authority only; it never publishes Question Bank content automatically.

## Stage13F — Question Bank / Quiz Builder / Publish — VERIFIED / CLOSED

Verified runtime checkpoint:

`afbe552710b3f1cf79ee70594f691fa836c05a45`

Stage-specific runs:

- backend/PostgreSQL `34420441878` — SUCCESS;
- Admin/PostgreSQL/real Chromium `34420441837` — SUCCESS.

Wider runtime verification-only PR #27 executed **13/13 SUCCESS** and was closed unmerged. It included Stage9–13F, OCR and Rebuild regressions.

Verified Stage13F boundary:

- stable reusable Question Bank item UUIDs + immutable revisions;
- MCQ/T-F/direct persistence and typed answer constraints;
- source/page/checksum/OCR/content-source and AI-review provenance;
- latest-approve-only Stage13E import, always Draft and idempotent;
- manual edit + Draft→Review→Published;
- dedicated Admin Question Bank workspace;
- Quiz Builder class/subject/multi-lesson scope;
- published Question Bank candidate selection;
- multiple quiz models/versions;
- immutable delivery snapshots retaining bank item/revision refs;
- direct delivery support;
- quiz Review→Published→Archived authority;
- approved one-question regeneration as a new revision of the same item only;
- reviewed/published exact-version CSV and RTL print/PDF template; Draft export rejected;
- real Chromium Question Bank + Quiz Builder lifecycle/session/responsive evidence.

Legacy note: Stage13F does not claim every `QADMIN-001..033` scenario. Remaining direct generation orchestration and specialized export variants are mapped explicitly into Stage13G/AI authoring in the Legacy Coverage Gate.

## Stage13G — Remaining Admin Product — NEXT TRACK A STAGE

Required:

- Student accounts/search/status;
- access code generation/search/filter/sort/bulk/import/export/print;
- recovery/device rebind operations;
- notifications;
- import/export/reports;
- settings/security/audit/operations dashboard;
- unresolved Admin parity;
- unresolved Quiz/AI authoring user flows, including generation orchestration and legacy export variants not proven by Stage13F.

Stage13G must use Stage11/12/13E/13F authorities, not create parallel generation/review/question stores.

# Stage 14 — Student Web/PWA Product — PARALLEL / IN PROGRESS

Track B branch: `parallel/stage14-student-product`.

Its current Source of Truth records Access, entitled Curriculum and protected Reader as verified, with latest verified Reader runtime `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d`; final learning-first shell/copy/a11y closure remains active.

# Stage 15 — Practice / Assessment Engine — REQUIRED AFTER STAGE13F INTEGRATION

Track B must first incorporate the exact Stage13F closure checkpoint promoted to `main`.

Then consume published quiz snapshots only; implement Practice feedback, Test/Model sessions, stable IDs, shuffle/randomization, version choice, resume/restart/history, scores and exact provenance. No mutable Question Bank rows become Student attempt authority.

# Stage 16 — Offline / PWA — REQUIRED

Account/device-scoped IndexedDB, explicit downloads, bounded entitlement lease, storage budgets, revisions/tombstones/outbox/delta sync and safe Service Worker lifecycle.

# Stage 17 — Personal Learning Data — REQUIRED

Notes, Favorites, Needs Review, stable provenance and defined local/sync behavior.

# Stage 18 — Notifications — REQUIRED

Web Push where supported + In-App fallback, quiet hours/opt-out and secure subscription lifecycle.

# Stage 19 — Progress / Statistics / Achievements — REQUIRED

Server-derived trusted metrics, sufficient-sample recommendations, private achievements and no global leaderboard.

# Stage 20 — Import / Export / Reporting — REQUIRED

Validated module-scoped import/export/reporting for curriculum, Question Bank, codes and reports.

# Stage 21 — Performance Engineering

Measure first; optimize only evidenced bottlenecks.

# Stage 22 — Security Hardening

Authorization/IDOR/rates/session/CSRF/CORS/CSP/device abuse/upload/storage/secrets/dependencies/audit/backups.

# Stage 23 — Automated Tests & CI Expansion

Unit/DB/Auth/Device/Access/Content/Media/OCR/TTS/AI/Question Bank/Practice/Offline/Admin/Student E2E + legacy regression.

# Stage 24 — Accessibility / Device QA

RTL, keyboard/focus/screen reader, zoom, contrast, reduced motion, touch targets and mobile/tablet/desktop/PWA/offline/device-reset scenarios.

# Stage 25 — Initial Data / Content Load

Canonical production curriculum/content through verified pipelines.

# Stage 26 — Staging

Future release/deployment work only when explicitly active.

# Stage 27 — Release Gate

No unresolved/unaccepted P0/P1; real-host DB/storage/OCR/TTS/AI evidence where required; backup restore; Auth/device/access races; Admin/Student E2E; Offline/PWA; performance/security/a11y; complete Legacy Coverage.

# Stage 28 — Production Cutover

Provision → migrations → content → backend/workers → Admin → Student → smoke → rollback readiness.

# Stage 29 — Monitoring & Operations

Auth/access/device reset, DB/backups, media/OCR/TTS/AI, offline sync, Push, storage/PWA/runtime health and incident runbooks.

## Current Progress

| Area | Status |
|---|---|
| Stages1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; `AI-012-019` open |
| Stage13A–E | VERIFIED / CLOSED |
| Stage13F | **VERIFIED / CLOSED** |
| Stage13G | **NEXT Track A work** |
| Stage14 | parallel IN PROGRESS; Access/Curriculum/Reader verified |
| Stage15 | waits for Track B integration of Stage13F main checkpoint |
| Stage16–20 | REQUIRED |
| Stage21–25 | planned hardening/completion gates |
| Stage26–29 | future release/deployment track |

## Stage13F Promotion Gate

The closure documentation commit containing this Roadmap must pass the same wider pull-request matrix, then the verification PR is closed unmerged and `main` is non-force fast-forwarded to that exact commit after confirming `main` did not move.

## Final Completion Rule

The product is not feature-complete until every valuable legacy capability is mapped through `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` to verified implementation/test or explicit Product Owner-approved removal. Foundation evidence never silently closes a later user outcome.