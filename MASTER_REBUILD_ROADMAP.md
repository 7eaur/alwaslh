# MASTER REBUILD ROADMAP — الوسيلة الذكية

> Same product, stronger implementation. Stage state is proven only by executable evidence; this Roadmap defines sequence, not truth by itself.

Current verified Stage13E runtime/application baseline: `d5ebc7f25a369430387a758c7c0bb89350963d67`.

Deployment: **FULLY DEFERRED UNTIL VPS / explicit Product Owner reopening**.

## Core principles

- preserve product/business outcomes and valuable legacy scenarios;
- do not preserve unsafe/duplicated architecture merely because it worked;
- root-cause changes, incremental batches, executable evidence;
- no feature removal without Product Owner approval;
- no browser-direct database authority;
- no generic architecture where an explicit simple model is enough;
- `NOT YET VERIFIED` until tested.

## Stage progression

### Stage 1 — Product Contract — VERIFIED
Inventory and parity contract. Legacy application is evidence/coverage source.

### Stage 2 — Brand Identity — VERIFIED
Canonical product identity/tokens/assets.

### Stage 3 — UX Architecture — VERIFIED baseline
Student/Admin separation, flow/navigation/responsive/accessibility contracts.

### Stage 4 — PostgreSQL Platform — VERIFIED
Private PostgreSQL, migrations, constraints, transactions and database authority.

### Stage 5 — Engineering Foundation — VERIFIED
API/Admin/Student build/lint/type/test foundation and clean migration runner.

### Stage 6 — Auth & Authorization — VERIFIED
Private server auth/session/role boundaries, Admin bootstrap and password handling.

### Stage 7 — Access Codes & Entitlements — VERIFIED
6-digit Full Codes, 7-digit Class Codes, multiple entitlements and transactional redemption/renewal.

### Stage 8 — Student Activation / Login / Recovery / Device — VERIFIED
Two-step activation, P-256 device proof, returning login, recovery, forced change, rebind and Chromium.

### Stage 9 — Canonical Source Import — VERIFIED
Deterministic source inventory/provenance, naming/order/idempotency evidence.

### Stage 10 — Media Pipeline — VERIFIED
Image/PDF processing, deterministic variants, checksum/provenance/order/storage abstraction.

### OCR Foundation — VERIFIED
Durable extraction leases/retry, normalized/raw text, confidence, review and approved search.

### Stage 11 — Provider-Neutral AI Contracts — VERIFIED
Modes, prompt versioning, provenance, validation, golden fixtures and benchmark harness.

### Stage 12 — Durable AI Execution / Runtime — VERIFIED backend/runtime
Jobs/units/attempts, leases, retries, cancellation, partial success, capacity/cooldown/budget controls, pause/resume/progress and bounded worker runtime. Live provider selection/bootstrap remains a later verified-runtime boundary (`AI-012-019`).

# Stage 13 — Super Admin Product

Stage13 is incremental. Do not mark the whole Admin Product complete because one substage passes.

## Stage13A — Curriculum Structure Backend — VERIFIED
Class → Subject Offering (`subject_class_links`) → optional Section → Lesson, with DB scope integrity and non-destructive lifecycle.

## Stage13B — Admin Curriculum Web — VERIFIED
Admin session, Class/Subject/Offering/Section/Lesson management, ordering/status/moves and responsive Chromium.

## Stage13C — Content / Media / OCR Operations — VERIFIED
Stage9 source → Stage10 media → OCR operational supervision/review, with search/filter/detail/correction/approve/reject and executable PostgreSQL/Admin evidence.

## Stage13D — Upload / Processing History / Publication Linking — VERIFIED

Verified executable baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

Verified outcomes include image/PDF/mixed upload, original selected order through PDF expansion, Stage10 pipeline reuse, durable server progress/history/retry/archive, explicit Lesson link and explicit Draft → Review → Published. Legacy `LES-A-010..015` and `CONTENT-013-002` are closed.

## Stage13E — Admin AI Operations / Review — VERIFIED / PROMOTED

Accepted candidate:

`72ead8446af237392dc6d953c8e0c2382f468286`

Candidate matrix: **12/12 SUCCESS**; PR #24 closed unmerged.

Selective verified promotion/runtime SHA:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Promotion construction:

- based on inspected `main @ e304d61286b9ca120db2dad695d29f4f1642e733`;
- exact accepted 36-file promotion manifest;
- one promotion commit;
- no stale central docs or divergent candidate history imported;
- promotion matrix **12/12 SUCCESS**;
- PR #25 closed unmerged;
- non-force fast-forward to `main` after rechecking `main` had not moved.

Verified Stage13E product boundary:

- durable Jobs/Units/Attempts/Outputs observability;
- queued/running/retrying/paused/failed/completed state and server-derived progress;
- pause/resume/cancel/retry through Stage12 authority;
- provider/model/project/usage observability without raw secrets/internal provider responses;
- source/page/checksum provenance;
- Stage11-validated edit/approve/reject review;
- review mutations only on execution-stable outputs;
- complete Jobs/Units/Attempts/Review History through bounded server pagination;
- canonical latest review authority independent from historical page selection;
- snapshot-consistent multi-query Admin read models;
- Job pagination before expensive Unit aggregation;
- safe pagination input representation bounds;
- real browser pagination/session-expiry/stale-review `409`/pause-resume/approve-reload/390px evidence;
- no second lifecycle queue or browser-owned progress.

Closed findings:

- P1: `AI-013E-DB-001`, `AI-013E-REVIEW-002`, `AI-013E-OPS-003`, `AI-013E-OPS-004` — **FIXED + VERIFIED**;
- P2: `AI-013E-OPS-005`, `AI-013E-OPS-006`, `AI-013E-PERF-007`, `AI-013E-API-008` — **FIXED + VERIFIED**;
- `CI-013E-009` — **FIXED + VERIFIED** workflow drift.

Promotion run set on exact `d5ebc7f...`: Combined `34401502463`, standalone `34401549935`, Frontend Prep `34401549849`, Rebuild `34401550016`, Stage13 `34401549835`, Stage9 `34401549851`, Stage10 `34401549989`, OCR `34401549910`, Stage11 `34401549927`, Stage12 `34401549964`, Stage13D Content `34401550065`, Stage13D Admin `34401549903` — all SUCCESS.

Stage13E approval is review approval only. It does **not** persist/publish a Question Bank item.

## Stage13F — Question Bank / Quiz Builder / Publish — READY / NOT STARTED

First perform repository discovery of actual existing Question Bank/quiz DB/API/Admin/tests and classify KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE.

Required product boundary:

- reviewed Question Bank authority and `AI-011-005` direct-output persistence decision;
- MCQ/T-F/manual/generated editing;
- class/subject/lesson/source/page/checksum/prompt/model provenance;
- explicit candidate/edit/review/publish authority;
- Draft → Review → Published;
- Quiz Builder with stable question identity and multiple versions;
- regenerate one question while preserving unrelated question identity/context;
- safe exports/print from reviewed/published authority;
- reuse Stage11 validation, Stage12 durable execution and Stage13E review; no duplicate queue/review system;
- PostgreSQL/API/Admin/real Chromium + wider same-head regression closure.

## Stage13G — Remaining Admin Product — REQUIRED / BLOCKED BY STAGE13F CLOSURE

- Student accounts/search/status;
- access code generation/search/filter/sort/bulk/import/export/print;
- recovery/device rebind operations;
- notifications;
- import/export/reports;
- settings/security/audit/operations dashboard;
- remaining parity rows with explicit disposition/evidence.

# Stage 14 — Student Web/PWA Product — REQUIRED
Entitlement-filtered Classes/Subjects/Lessons → Reader/media/text/search/TTS → Notes/Favorite/Needs Review → Practice/Tests/Models → progress/private achievements/notifications, with mobile-first RTL/loading/error/empty/offline/a11y.

# Stage 15 — Practice / Assessment Engine — REQUIRED
Published Question Bank only; Practice feedback, Test/Model finalization, stable identities, shuffle/randomization, resume/restart/history and exact ministerial provenance.

# Stage 16 — Offline / PWA — REQUIRED
Account/device-scoped IndexedDB, explicit downloads, bounded entitlement lease, storage budgets, revisions/tombstones/outbox/delta sync and safe Service Worker lifecycle.

# Stage 17 — Personal Learning Data — REQUIRED
Notes, Favorites, Needs Review and stable provenance/local-sync behavior.

# Stage 18 — Notifications — REQUIRED
Web Push where supported + In-App fallback, quiet hours, opt-out and secure subscription lifecycle.

# Stage 19 — Progress / Statistics / Achievements — REQUIRED
Server-derived metrics, sufficient-sample recommendations, private achievements and no global leaderboard.

# Stage 20 — Import / Export / Reporting — REQUIRED
Module-scoped validated import/export for curriculum/Question Bank/codes/reports/print.

# Stage 21 — Performance Engineering
Measure first; optimize bundle/API/DB/media/OCR/TTS/AI/cache/upload/export with evidence.

# Stage 22 — Security Hardening
Authorization/IDOR/rates/session/CSRF/CORS/CSP/device abuse/upload/storage/secrets/dependencies/audit/backups.

# Stage 23 — Automated Tests & CI Expansion
Unit/DB/Auth/Device/Access/Content/Media/OCR/TTS/AI/Practice/Offline/Admin/Student E2E + legacy coverage regression.

# Stage 24 — Accessibility / Device QA
RTL, keyboard/focus/screen reader, zoom, contrast, reduced motion, touch targets and mobile/tablet/desktop/PWA/offline/device-reset scenarios.

# Stage 25 — Initial Data / Content Load
Canonical production curriculum/content through verified pipelines. Old DB migration is outside current scope unless explicitly reopened.

# Stage 26 — Staging
Future only after VPS/deployment is explicitly reopened.

# Stage 27 — Release Gate
No unresolved/unaccepted P0/P1; real-host DB/storage/OCR/TTS/AI evidence; backup restore; Auth/device/access races; Admin/Student E2E; Offline/PWA; performance/security/a11y; full Legacy Coverage.

# Stage 28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke → rollback readiness.

# Stage 29 — Monitoring & Operations
Auth/access/device reset, DB/backups, media/OCR/TTS/AI jobs, offline sync, Push, storage/PWA/runtime health and runbooks/incidents.

## Current Progress

| Area | Status |
|---|---|
| Stages1–10 | VERIFIED |
| OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime |
| Stage13A–D | VERIFIED |
| Stage13E Admin AI Operations/Review | **VERIFIED / PROMOTED** |
| Stage13F | **READY / NOT STARTED** |
| Stage13G | REQUIRED / BLOCKED BY STAGE13F |
| Stage14–20 | REQUIRED |
| Stage21–25 | PLANNED product/hardening gates |
| Stage26–29 | FUTURE / deployment track reopens only after VPS |
| Hosted deployment | **OUT OF CURRENT SCOPE UNTIL VPS** |

## Deployment policy

Current development sequence:

```text
repository discovery
→ implementation
→ lint/type/unit/integration/PostgreSQL/browser gates
→ exact-head regressions
→ documentation closure
→ next isolated batch
```

Deployment/hosting remain intentionally excluded until Product Owner provides VPS and explicitly reopens that track.

## Final completion rule

The product is not feature-complete until every valuable legacy capability is mapped through `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` to a verified implementation/test or explicit owner-approved removal.
