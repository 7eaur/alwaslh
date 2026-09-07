# PROJECT STATUS

- **Current Phase:** Stage13 Super Admin Product — Admin Curriculum Web **VERIFIED**; next isolated batch is **Content / Media / OCR Operations**.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Hosted Student/Admin/API/media/OCR/AI worker runtime remains `NOT YET VERIFIED`.
- **Old database:** intentionally out of current scope per Product Owner; repository migrations, tests and current PostgreSQL contracts are authoritative for ongoing development.

## Latest fully verified same-head matrix

Exact executable head: `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.

- Stage13 Curriculum Verification `34168788666` — SUCCESS, including Admin Chromium E2E.
- Stage12 AI Execution `34168788667` — SUCCESS.
- Stage11 AI Contracts `34168788661` — SUCCESS.
- OCR Foundation `34168788704` — SUCCESS.
- Stage10 Media Pipeline `34168788646` — SUCCESS.
- Stage9 Content Import `34168788663` — SUCCESS.
- Full Rebuild `34168788747` — SUCCESS, including existing Student Chromium activation/login/recovery coverage.

## Stage13 Admin Curriculum Web — VERIFIED

Verified browser architecture:

```text
Admin Web
→ GET /v1/admin/me
→ POST /v1/auth/login when signed out
→ HttpOnly server session
→ GET /v1/admin/curriculum
→ Admin-only curriculum mutations
→ authoritative server snapshot refresh
```

Verified behavior:

- separate Admin login and automatic session restoration;
- server-backed logout;
- real curriculum counts, no fake dashboard metrics;
- create Class / Subject / Subject Offering / optional Section / Lesson;
- sectioned and unsectioned lessons;
- rename Class/Subject/Section/Lesson;
- explicit ordering and `active | inactive | archived` state;
- move Lesson between Sections or detach to Offering root;
- loading, empty, network-error and mutation-feedback states;
- RTL responsive layout and 390px horizontal-overflow check;
- no destructive DELETE UI.

Chromium verified:

```text
login
→ create Class
→ create Subject
→ link Offering
→ create Section
→ create Lesson
→ move/detach Lesson
→ rename Lesson
→ change status
→ reload + restore server session
→ logout
```

## CI hardening during closure

The final closure did not weaken product assertions. Test-harness issues were corrected at their source:

1. fresh `Response` per mocked fetch instead of reusing a consumed body;
2. API-client tests assert URL path rather than assuming relative URLs when `VITE_API_BASE_URL` is configured;
3. Playwright selectors were scoped to real interactive controls instead of regex/fuzzy label matches;
4. duplicate visible/accessibility text assertions were scoped to the intended UI element;
5. Stage12 distributed-capacity race now uses two independent jobs, so job-row locking cannot short-circuit the capacity gate before the race is exercised.

## Stable architecture boundaries

- `subject_class_links` remains the only Subject Offering authority.
- `curriculum_sections` remains one optional layer only.
- Stage9 source inventory remains provenance/evidence, not curriculum authority.
- Stage10 `media_assets/media_variants` remain derived media authority.
- only completed OCR with `not_required | approved` review state is approved downstream text evidence.
- `lesson_assets` exists but is **not currently linked automatically** to Stage10 `media_assets`; therefore source/media/OCR operations must not be presented as published lesson content yet.
- browser must not run OCR/AI workers or mutate PostgreSQL directly.
- Stage12 `ai_jobs / ai_job_units / ai_outputs` remains the single AI execution authority.
- Question Bank still persists only `multiple_choice | true_false`; AI `direct` remains reviewable output only.

## Current isolated batch — Content / Media / OCR Operations

Repository discovery is complete enough to start the batch:

- Stage9 already stores ordered source documents/assets and provenance.
- Stage10 already stores media processing status plus `source/display/thumbnail/ai` variants.
- OCR already stores durable extraction, retry, confidence and review state.
- `apps/api/src/app.ts` currently exposes no Admin HTTP surface for media/OCR operations.
- `apps/admin-web` currently marks “الوسائط وOCR” as a later module.

The next implementation will add a thin Admin operations/read-review layer over the existing authorities, not a second media/OCR pipeline. Upload task history and lesson publication/linking remain separate contracts unless implemented and verified in the same future batch.

## Legacy coverage state

Verified implementation evidence from the Admin Curriculum batch now covers the implemented subset of:

- `PUB-002` separate Admin login;
- `ADMIN-007` Admin navigation foundation;
- `ADMIN-008` responsive Admin shell;
- `CLASS-A-001..003`, `CLASS-A-005..007`, `CLASS-A-010` where represented by current hierarchy operations;
- `LES-A-001..003`, `LES-A-006..007` for current hierarchy/list/filter/edit/order behavior.

Still open: server search/pagination, preview, destructive dependency-aware delete semantics, bulk lesson operations, uploads, media processing/progress/history, OCR operations UI, AI authoring/review, Question Bank publish, students/codes, notifications, imports/exports/reports/settings/audit.

## Still intentionally NOT YET VERIFIED

- authorized live AI provider adapters/credentials;
- live provider/model benchmark and production route/model defaults;
- production live-provider worker bootstrap;
- hosted worker/runtime behavior;
- hosted Admin/Student/API runtime while deployment is deferred;
- Draft → Review → Published content workflow;
- Stage10 media → `lesson_assets` publication/linking contract;
- TTS implementation/runtime.

## Next ordered work

1. Build Stage13 Admin Content/Media/OCR read-model and Admin-only HTTP contracts over existing Stage9/10/OCR tables.
2. Add OCR pending/detail/review operations without browser-owned worker execution or duplicate SQL lifecycle.
3. Activate the Admin “الوسائط وOCR” workspace with search/filter/status/detail/review UX plus loading/error/empty/responsive/a11y states.
4. Add PostgreSQL/API/unit/Chromium verification and update parity evidence.
5. Define upload/progress/history and media→lesson publication/linking explicitly before implementing those flows.
6. Continue Stage13 AI Operations using the existing Stage12 queue/runtime only.
7. Resolve `direct` Question Bank persistence before publish flows depend on it.
8. Continue students/codes/recovery/device-rebind, notifications, import-export, reports, settings and audit.
9. Keep deployment disabled until explicit Product Owner re-enable instruction.

## Repository housekeeping

`tmp-unused-do-not-use` remains P3 repository noise only; it has no unique code and is not used by PR #12.

## Last build/test

**Last fully green executable head:** `d3e621e6f60cc56ee3838b7df36a86ebafa37524`.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
