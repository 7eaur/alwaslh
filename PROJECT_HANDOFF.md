# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-08 — Single Owner mode active; hosting deferred; Stage13E combined candidate under static/executable verification**.

## 0. Mandatory startup

Before changing code:

1. confirm repo `7eaur/alwaslh`;
2. treat `main` as latest Integration-approved **development baseline**;
3. read `README.md`;
4. read `DOCUMENTATION_INDEX.md`;
5. read this file;
6. read `PROJECT_STATUS.md`;
7. read `PROJECT_ENGINEERING_LOG.md`;
8. read `PROJECT_INTEGRATION_CONTINUITY.md`;
9. read **`PROJECT_EXECUTION_QUEUE.md`**;
10. read `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
11. read `docs/workstreams/SINGLE_OWNER_OPERATING_MODEL.md`;
12. read latest comments in active Issue `#16`;
13. read current stage specialized docs + actual code/migrations/tests;
14. live-check `main`, active branch HEADs and GitHub Actions before conclusions.

Anything not inspected/executed = `NOT YET VERIFIED`.

Do not ask an earlier chat what happened. If repository files are insufficient, fix the documentation before proceeding.

## 1. Current operating model

Product Owner retired the permanent multi-chat Backend/Frontend team model.

Current model:

- **one replaceable engineering conversation owns the whole product**;
- Product/Architecture/Backend/Frontend/UX/Security/Performance/QA/Git/Documentation are one responsibility;
- Issue `#16` is the sole active Project Execution Board;
- `PROJECT_EXECUTION_QUEUE.md` is the ordered task authority;
- `PROJECT_INTEGRATION_CONTINUITY.md` is the detailed current memory.

Historical only:

- Issue `#13` Team Room — CLOSED;
- Issue `#14` Backend Board — CLOSED;
- Issue `#15` Frontend Board — CLOSED;
- old Team/Backend/Frontend/Integration workstream files are superseded pointers.

Do not recreate separate workstream chats unless Product Owner explicitly asks for them again.

## 2. Hosting / deployment policy

**Hosting and deployment are completely deferred until Product Owner provides a VPS and explicitly reopens deployment.**

Therefore:

- no Render/Vercel/Railway/Supabase hosting work;
- no hosted-runtime acceptance gate;
- no provider cutover work;
- no deployment blocker in current stages;
- keep application architecture portable but do not build infrastructure abstractions prematurely.

Historical hosting/config files can remain in Git but are not Current Work.

## 3. Repository / Git state

- Repository: `7eaur/alwaslh`.
- `main`: current Integration-approved development baseline.
- Main HEAD at latest Single Owner synchronization will be recorded in `PROJECT_STATUS.md` / Continuity / Queue.
- Legacy pre-rebuild main preserved at:
  `archive/legacy-main-2026-09-08 @ 5d16c9ae5e4aa84a13c128da34b0e62f4ae28c06`.
- Latest fully executable green product baseline:
  `4eca7de8877ac9e2289b9c7990c912d33c256935`.

Do not rewrite `main` history casually. Use short isolated branches for meaningful product batches and preserve central docs when integrating older divergent branches.

## 4. Product idea

**الوسيلة الذكية** منصة تعليمية عربية تعيد بناء منتج موجود مع الحفاظ على قيمته الأساسية وسيناريوهاته المهمة، لكن بمعمارية أكثر أمانًا ووضوحًا وقابلية للصيانة.

### Student Web/PWA

Target product includes:

- secure activation/login/recovery/device flows;
- entitlement-filtered curriculum;
- lesson Reader/media/text/search/TTS;
- Practice/Tests/Models;
- Notes/Favorites/Needs Review;
- progress/private achievements;
- notifications;
- offline/PWA.

### Super Admin

Target product includes:

- curriculum/content authoring;
- image/PDF/mixed ingestion;
- media/OCR supervision;
- AI operations/review;
- Question Bank/Quiz Builder/publication;
- Student/account/access code/recovery/device operations;
- notifications/import-export/reports/settings/audit.

### Backend

Fastify + PostgreSQL own:

- Auth/Authorization;
- Access/Entitlements;
- Curriculum/business data;
- media/OCR/AI durable state;
- review/publication;
- trusted assessment/scoring/progress/sync authority in later stages.

Legacy is capability/failure evidence, not target architecture.

## 5. Stable architecture / business rules

Do not violate without explicit evidence/decision:

- Browser owns presentation/session UX, not durable canonical business state.
- Full Code = 6 digits; Class Code = 7 digits.
- activation verification is non-consuming; finalization is atomic.
- returning Student = password + registered P-256 device proof.
- Curriculum = Class → Subject Offering (`subject_class_links`) → optional Section → Lesson.
- Stage9 source inventory = provenance, never curriculum hierarchy.
- Stage10 media readiness is processing evidence, not publication.
- `media ready != published`.
- Stage13D content publication = explicit Draft → Review → Published.
- OCR/AI are derived/reviewed layers; raw AI output is never student authority.
- provider/network calls stay outside long DB transactions.
- durable workers use PostgreSQL leases/capacity/control.
- Fastify HTTP remains separate from durable AI worker polling.
- secrets/credential aliases/raw provider internals/internal error text never enter frontend contract.
- no duplicate queues/pipelines/state authorities.
- no patching/test weakening/auth bypass/sleep-based race hiding.

## 6. Verified stage history

Verified:

- Stages 1–10;
- OCR Foundation;
- Stage11 Provider-neutral AI Contracts;
- Stage12 Durable AI Execution / Worker Runtime backend/runtime;
- Stage13A Curriculum Backend;
- Stage13B Admin Curriculum UI;
- Stage13C Content/Media/OCR Operations;
- Stage13D Upload/History/Publication Linking incl. Chromium.

Latest fully green same-head baseline:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Runs:

- Stage13D Admin `34177369743` SUCCESS;
- Stage13D Backend `34177369784` SUCCESS;
- Stage13 Admin `34177369748` SUCCESS;
- Stage12 `34177369812` SUCCESS;
- Stage11 `34177369753` SUCCESS;
- OCR `34177369750` SUCCESS;
- Stage10 `34177369777` SUCCESS;
- Stage9 `34177369756` SUCCESS;
- Full Rebuild `34177369768` SUCCESS incl. Student Chromium.

## 7. Current Stage13E — Admin AI Operations / Review

Status:

**COMBINED INTEGRATION CANDIDATE / NOT YET VERIFIED / OUTSIDE `main`**.

Active combined branch:

`integration/stage13e-ai-operations @ 807f733838e2fab2620652025b255c3bc404fec1`

Assembly:

- `227f4c9dba99e7b8c93d25caebe86e38108d4a5c` — reviewed Backend candidate overlay;
- `a60274fedf55fb45b6684743da24b24004339917` — reviewed Frontend candidate overlay;
- `4ba77703866762c471257bbb914590b817ecc82e` — deterministic real browser/Postgres fixture;
- `807f733838e2fab2620652025b255c3bc404fec1` — combined integration workflow.

Historical source branches:

- Backend `348c02646d0ff873fd305beff16f41c46d9c0285`;
- Frontend `1eb141e950e96c9f53ffd103a386d59166113c16`, Product/Test `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

### Backend candidate includes

- Admin-only job/unit/attempt/output views;
- server-derived progress/status/action availability;
- Stage12 pause/resume/cancel/retry reuse;
- bounded retry attempt semantics;
- provider/model/project observability without secret/raw metadata leakage;
- page/source/checksum provenance;
- strict append-only output review audit via `0018_ai_admin_review.sql`;
- Stage11 semantic validation inside review authority;
- edit/approve/reject with row locking/concurrency protection;
- no Question Bank publication (Stage13F boundary).

### Frontend candidate includes

- real authenticated transport + adapter;
- AI Operations page/navigation;
- server-provided job/review action arrays;
- no raw provider response/internal error text;
- canonical reload after mutation/409;
- bounded polling for selected non-terminal job;
- review/provenance/history UI;
- real Chromium prep for happy path, pause/resume, approve/reload, session expiry, stale-review 409 and 390px.

## 8. Stage13E executable blocker

Combined workflow:

`.github/workflows/stage13e-integration.yml`

Run:

`34193380473`

Attempt 1 job:

`101955846938`

Attempt 2 job:

`101958463625`

Both ended before checkout with no executable steps (`steps=[]`; no useful logs).

Interpretation:

- external GitHub hosted-runner allocation problem;
- **not product failure evidence**;
- do not modify product/test behavior to chase it;
- do not weaken Stage gate;
- retry same workflow when runner allocation actually works.

## 9. Current Single Owner work

Read `PROJECT_EXECUTION_QUEUE.md` for exact status.

At handoff creation the immediate sequence is:

1. finish Single Owner documentation synchronization;
2. finish static audit of Stage13E combined candidate;
3. fix any statically proven defect with regression coverage;
4. keep retrying unchanged executable gate only when useful;
5. after actual combined PASS, run wider regressions;
6. close Stage13E and promote accepted code to `main`;
7. then begin Stage13F.

Do not skip Stage13E closure merely to continue roadmap progress.

## 10. Stage13F and later

After Stage13E closure:

### Stage13F — Question Bank / Quiz Builder / Publish

Must resolve `AI-011-005` direct question persistence explicitly and provide reviewed Question Bank authority, provenance, editing, quiz versions, regeneration, Draft→Review→Published, ministerial model handling and safe exports.

### Stage13G — Remaining Admin

Student/admin operations, access codes, recovery/device operations, notifications, reports/settings/audit and remaining Admin parity.

### Stage14–20

Student Product → Assessment → Offline/PWA → Personal Data → Notifications → Progress/Statistics → Import/Export/Reporting.

### Stage21–25

Performance → Security → test expansion → Accessibility/device QA → initial content load.

### Stage26–29

Only when VPS/deployment is explicitly reopened: Staging → Release Gate → Production Cutover → Monitoring/Operations.

## 11. Open findings

- `AI-011-005` P2 — direct generated question persistence unresolved; Stage13F owns it.
- `AI-012-019` P2 — live AI provider benchmark/routes/credentials/bootstrap unverified.
- `CI-001` P1 — hosted runner currently terminates before checkout; external cause not verified.
- Stage13E executable gate pending.
- later Student/Offline/assessment/admin roadmap incomplete.

## 12. End-of-batch continuity rule

After every meaningful batch the single engineering owner must update:

1. `PROJECT_EXECUTION_QUEUE.md`;
2. `PROJECT_INTEGRATION_CONTINUITY.md`;
3. `PROJECT_STATUS.md` if state changed;
4. `PROJECT_ENGINEERING_LOG.md` findings/decisions/tests;
5. specialized stage docs/contracts;
6. active Issue #16 with an `EXECUTION REPORT`;
7. this Handoff/Index/Roadmap/Legacy Coverage when their truth changes.

Record exact branch/HEAD/run IDs and explicit `NOT YET VERIFIED` items. Never leave continuation-critical information only in chat.
