# MASTER REBUILD ROADMAP — الوسيلة الذكية

> Same product, stronger implementation. Stage state is proven only by executable evidence; this Roadmap defines sequence, not truth by itself.

Current executable baseline: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

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
Inventory and parity contract. Legacy application becomes evidence/coverage source.

### Stage 2 — Brand Identity — VERIFIED
Canonical product identity/tokens/assets.

### Stage 3 — UX Architecture — VERIFIED baseline
Student/Admin separation, flow/navigation/responsive/accessibility contracts.

### Stage 4 — PostgreSQL Platform — VERIFIED
Private PostgreSQL, migrations, constraints, transactions, database authority.

### Stage 5 — Engineering Foundation — VERIFIED
API/Admin/Student build/lint/type/test foundation and clean migration runner.

### Stage 6 — Auth & Authorization — VERIFIED
Private server auth/session/role boundaries, Admin bootstrap, password handling.

### Stage 7 — Access Codes & Entitlements — VERIFIED
6-digit Full Codes, 7-digit Class Codes, multiple entitlements, transactional redemption/renewal.

### Stage 8 — Student Activation / Login / Recovery / Device — VERIFIED
Two-step activation, P-256 application-device proof, returning login, recovery, forced change, rebind, Chromium.

### Stage 9 — Canonical Source Import — VERIFIED
Deterministic `alwaslh-go` source inventory/provenance, naming/order/idempotency evidence.

### Stage 10 — Media Pipeline — VERIFIED
Image/PDF processing foundation, deterministic variants, checksum/provenance/order/storage abstraction.

### OCR Foundation — VERIFIED
Durable extraction leases/retry, normalized/raw text, confidence, review, approved search.

### Stage 11 — Provider-Neutral AI Contracts — VERIFIED
Modes, prompt versioning, provenance, validation, golden fixtures, benchmark harness.

### Stage 12 — Durable AI Execution / Runtime — VERIFIED backend/runtime
Jobs/units/attempts, leases, retries, cancellation, partial success, distributed capacity, cooldown/kill/budget, pause/resume/progress, dedicated bounded worker runtime. Production live provider selection remains a later benchmark/runtime gate.

# Stage 13 — Super Admin Product

Stage13 is incremental. Do not mark the whole Admin Product complete because one substage passes.

## Stage13A — Curriculum Structure Backend — VERIFIED

```text
Class
→ Subject Offering (`subject_class_links`)
→ optional Unit/Section
→ Lesson
```

One optional hierarchy layer, DB scope integrity, non-destructive lifecycle.

## Stage13B — Admin Curriculum Web — VERIFIED

Admin login/session, Class/Subject/Offering/Section/Lesson safe management, order/status/moves, responsive Chromium.

## Stage13C — Content / Media / OCR Operations — VERIFIED

```text
Stage9 source evidence
→ Stage10 media state/variants
→ OCR state/detail
→ Admin supervision/review
```

Search/filter/status/detail/OCR correction/approve/reject with PostgreSQL + Admin Chromium evidence.

## Stage13D — Upload / Processing History / Publication Linking — VERIFIED

Verified executable head: `4eca7de8877ac9e2289b9c7990c912d33c256935`.

Implemented and verified:

- image upload;
- PDF upload;
- mixed PDF/images;
- original user-selected order preserved through PDF page extraction;
- reuse of Stage10 `MediaPipelineService`, never a second media pipeline;
- durable server-owned upload/processing task progress;
- task history/archive/error/retry visibility;
- explicit canonical media → curriculum Lesson association;
- explicit Draft/Review/Published content transition;
- no automatic publication merely because media is `ready`;
- non-destructive archive/provenance retention;
- API/PostgreSQL/unit/integration/Chromium evidence;
- legacy `LES-A-010..015` coverage closed as VERIFIED.

Evidence:

- Stage13D Content Ingestion `34177369784` — SUCCESS;
- Stage13D Admin Upload UI `34177369743` — SUCCESS;
- same-head regressions Stage13 `34177369748`, Stage12 `34177369812`, Stage11 `34177369753`, OCR `34177369750`, Stage10 `34177369777`, Stage9 `34177369756`, Full Rebuild `34177369768` — all SUCCESS.

Specialized contract: `docs/admin/STAGE13_CONTENT_INGESTION_PUBLICATION.md`.

## Stage13E — Admin AI Operations / Review — COMBINED CANDIDATE / EXECUTION PENDING

Current combined branch:

`integration/stage13e-ai-operations @ c48d1e597497e6054340f71235c78937082b9371`

Latest runtime/test HEAD beneath docs:

`d60218b518fb0fe453c21386e77cd35a2228ad07`

Candidate implements the required Stage13E product boundary while reusing Stage12 authority:

- durable Jobs/Units/Attempts/Outputs observability;
- queued/running/retrying/paused/failed/completed state and server-derived progress;
- pause/resume/cancel/retry through Stage12 lifecycle authority;
- provider/model/project/usage observability without raw secrets/internal provider responses;
- source/page/checksum provenance;
- Stage11-validated edit/approve/reject review;
- review mutations only on execution-stable outputs;
- complete Jobs/Units/Attempts/Review History through bounded server pagination;
- canonical latest review authority independent from historical page selection;
- snapshot-consistent multi-query Admin read models;
- Job pagination before expensive Unit aggregation;
- safe pagination input bounds at HTTP validation;
- deterministic real-browser contract for pagination, session expiry, stale-review `409`, pause/resume, approve/reload and 390px responsive behavior;
- no Stage13F Question Bank publication and no client-owned queue/progress.

Audit findings currently fixed in candidate:

- P1: `AI-013E-DB-001`, `AI-013E-REVIEW-002`, `AI-013E-OPS-003`, `AI-013E-OPS-004`;
- P2: `AI-013E-OPS-005`, `AI-013E-OPS-006`, `AI-013E-PERF-007`, `AI-013E-API-008`.

Executable state:

- latest combined run `34283442253`, attempt `2`, job `102256556365`;
- `runner_id=0`, `runner_name=""`, `steps=[]`;
- no checkout/lint/typecheck/test/build/PostgreSQL/Chromium command executed.

Therefore Stage13E remains **NOT YET VERIFIED**. The only proven closure blocker is `EXEC-004` executable same-head verification; do not treat pre-checkout runner failure as product failure or PASS.

## Stage13F — Question Bank / Quiz Builder / Publish — REQUIRED / BLOCKED BY STAGE13E CLOSURE

- reviewed Question Bank authority;
- MCQ/T-F/manual/generated editing;
- resolve `direct` question persistence explicitly;
- class/subject/lesson/source provenance;
- Quiz Builder and multiple versions;
- exact ministerial model handling;
- regenerate one question preserving context;
- Draft→Review→Published;
- QA status/history;
- safe exports/print.

Do not implement Stage13F until Stage13E combined + wider regression closure unless Product Owner explicitly changes stage ordering.

## Stage13G — Remaining Admin Product — REQUIRED

- Student accounts/search/status;
- access code generation/search/filter/sort/bulk/import/export/print;
- recovery/device rebind operations;
- notifications;
- import/export/reports;
- settings/security/audit/operations dashboard;
- any remaining parity rows with explicit disposition/evidence.

# Stage 14 — Student Web/PWA Product — REQUIRED

Build the complete Student learning surface on the already verified auth/device/access foundation:

```text
Activation/Login
→ entitled Classes/Subjects/Lessons
→ Reader
   ├── page/media
   ├── text/search/TTS
   ├── summary
   ├── Notes
   ├── Favorite
   └── Needs Review
→ Practice / Tests / Models
→ Progress / private achievements
→ Notifications
```

Requirements include mobile-first RTL, clear loading/error/empty/offline states, accessibility and entitlement filtering.

# Stage 15 — Practice / Assessment Engine — REQUIRED

Published Question Bank only; immediate Practice feedback; final Test/Model results; multi-lesson/custom counts/types; stable identities; shuffle/randomization; explanations/images; resume/restart/history; Needs Review events; exact ministerial provenance; trusted finalization; offline outbox where applicable.

# Stage 16 — Offline / PWA — REQUIRED

Account/device-scoped IndexedDB, explicit downloads, signed entitlement lease max 14 days capped by entitlement expiry, storage budgets, revisions/tombstones/outbox/delta sync, safe Service Worker update lifecycle and clear offline/backend/sync states.

# Stage 17 — Personal Learning Data — REQUIRED

Notes text/image/capture/audio, Favorites, Needs Review, stable provenance, correct Blob/media storage and defined local/sync behavior.

# Stage 18 — Notifications — REQUIRED

Web Push where supported + In-App fallback, useful content/access/admin messages, gentle study reminders, quiet hours, opt-out and secure subscription lifecycle.

# Stage 19 — Progress / Statistics / Achievements — REQUIRED

Server-derived metrics, sufficient-sample weak-area recommendations, private achievements, no global leaderboard, no client-authoritative mastery/awards.

# Stage 20 — Import / Export / Reporting — REQUIRED

Module-scoped validated import/export for curriculum/Question Bank/codes/reports/print; no blind generic importer.

# Stage 21 — Performance Engineering
Measure bundle/API/DB/media/OCR/TTS/AI/cache/upload/export budgets. Optimize only with evidence.

# Stage 22 — Security Hardening
Authorization/IDOR/rates/session/CSRF/CORS/CSP/device abuse/upload/storage/secrets/dependencies/audit/backups.

# Stage 23 — Automated Tests & CI Expansion
Unit/DB/Auth/Device/Access/Content/Media/OCR/TTS/AI/Practice/Offline/Admin/Student E2E + legacy coverage regression.

# Stage 24 — Accessibility / Device QA
RTL, keyboard/focus/screen reader, 200% zoom, contrast, reduced motion, touch targets, mobile/tablet/desktop/PWA/offline/device-reset scenarios.

# Stage 25 — Initial Data / Content Load
Canonical production curriculum/content through final verified pipelines. Old DB migration is not current scope unless explicitly reopened.

# Stage 26 — Staging
Fresh reproducible production-like environment with real storage/workers/runtime. **Not current work until VPS/deployment is explicitly reopened.**

# Stage 27 — Release Gate
No unresolved/unaccepted P0/P1; real-host DB/storage/OCR/TTS/AI evidence; backup restore; Auth/device/access races; Admin/Student E2E; Offline/PWA; performance/security/a11y; full Legacy Coverage.

# Stage 28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke → rollback readiness.

# Stage 29 — Monitoring & Operations
Auth/access/device reset, DB/backups, media/OCR/TTS/AI jobs, offline sync, Push, storage/PWA/runtime health, runbooks/incidents.

## Current Progress

| Area | Status |
|---|---|
| Stages1–10 | VERIFIED |
| OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime |
| Stage13A Curriculum backend | VERIFIED |
| Stage13B Admin Curriculum Web | VERIFIED |
| Stage13C Content/Media/OCR Operations | VERIFIED |
| Stage13D Upload/History/Publication Linking | **VERIFIED** |
| Stage13E Admin AI Operations/Review | **COMBINED CANDIDATE / EXECUTION PENDING / NOT YET VERIFIED** |
| Stage13F–G | REQUIRED / BLOCKED BY ORDERED CLOSURE |
| Stage14–20 | REQUIRED |
| Stage21–25 | PLANNED product/hardening gates |
| Stage26–29 | FUTURE / deployment track reopens only after VPS |
| Hosted deployment | **OUT OF CURRENT SCOPE UNTIL VPS** |

Latest fully executable product evidence remains `4eca7de8877ac9e2289b9c7990c912d33c256935`, with Stage9/10/OCR/11/12/13/13D and Full Rebuild all SUCCESS. Stage13E candidate is newer but not executable-verified.

## Deployment policy

Current development sequence is:

```text
repository discovery
→ implementation
→ lint/type/unit/integration/PostgreSQL/browser gates
→ exact-head regressions
→ documentation closure
→ next isolated batch
```

Deployment/hosting are intentionally excluded until Product Owner provides VPS and explicitly reopens that track. Historical Preview/Render/Vercel/Railway work is not a current gate or blocker.

## Final completion rule

The product is not feature-complete until every valuable legacy capability is mapped through `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` to a verified implementation/test or an explicit owner-approved removal.