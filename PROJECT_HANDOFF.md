# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-08 — Single Owner mode active; hosting deferred; Stage13E combined candidate hardened by two P1 integrity fixes and awaiting executable verification**.

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
- Always live-check current `main` HEAD; central docs advance independently from unverified feature branches.
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

`integration/stage13e-ai-operations`

Current branch HEAD at this synchronization:

`1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`

Latest runtime/test candidate beneath that docs commit:

`6494a0ee232cf646eae693054b129db752aee40e`

Assembly/hardening lineage:

- `227f4c9dba99e7b8c93d25caebe86e38108d4a5c` — reviewed Backend candidate overlay;
- `a60274fedf55fb45b6684743da24b24004339917` — reviewed Frontend candidate overlay;
- `4ba77703866762c471257bbb914590b817ecc82e` — deterministic real browser/Postgres fixture;
- `807f733838e2fab2620652025b255c3bc404fec1` — combined integration workflow;
- `730989b8bde404b229544c473bba02b05c7e75b4` — PostgreSQL reject-reason invariant + redundant-index removal;
- `6589d6e53de7ca8cd82b424e5c1496186eb701f1` — direct DB reject-reason regression;
- `bc1bf508897796d0a74d22126094e83180b7ec79` — workflow DB contract update;
- `5c03fa27f90cd10df06a9e0b7c5e2c0c768e653a` — bind human review to stable unit state;
- `6494a0ee232cf646eae693054b129db752aee40e` — failed/retrying output review regression;
- `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9` — specialized Stage13E contract synchronized.

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
- **review mutation only for execution-stable unit output (`completed | review_required`)**;
- failed/retrying/running/queued/cancelled outputs remain inspection-only;
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

## 8. Stage13E integrity findings fixed in candidate

### AI-013E-DB-001 — P1 Data/Audit Integrity

Original Stage13E HTTP/service required nonblank reject reason, but PostgreSQL did not. A future/direct writer could create an incomplete terminal reject audit record.

Root fix:

- DB constraint `ai_output_review_events_reject_note_required`;
- direct NULL/blank insert regression;
- redundant latest-review index removed because UNIQUE `(ai_output_id, revision)` already serves backward latest lookup.

Execution remains `NOT YET VERIFIED`.

### AI-013E-REVIEW-002 — P1 Data/Review Integrity

Stage12 can overwrite the same `ai_outputs` row during retry/re-execution. Original Stage13E review authority did not gate review on owning unit state, while review events remain append-only on the output id. That could leave an old human decision attached to newly replaced AI content.

Root fix:

- `allowedReviewActions=[]` unless owning unit is `completed` or `review_required`;
- `reviewOutput()` locks output + unit rows together;
- unstable output mutation returns `409` before any audit write;
- failed/retrying outputs remain visible for diagnosis only;
- regression proves failed/retrying outputs expose no actions, mutation is denied, and zero review events are created.

Execution remains `NOT YET VERIFIED`.

## 9. Stage13E executable blocker

Combined workflow:

`.github/workflows/stage13e-integration.yml`

Latest runtime/test run:

- run `34199202570`;
- head `6494a0ee232cf646eae693054b129db752aee40e`;
- job `101973855894`;
- ended before checkout with no executable steps (`steps=null`).

Latest branch-head docs run:

- run `34199371763`;
- head `1e19ef06807516ce6869a821dfcbf6fa6ba51bf9`;
- job `101974393620`;
- same pre-checkout condition.

Earlier post-fix runs and `34193380473` attempts 1/2 had the same behavior.

Interpretation:

- external GitHub hosted-runner allocation problem;
- **not product failure evidence**;
- do not modify product/test behavior to chase it;
- do not weaken Stage gate;
- retry same workflow when runner allocation actually works.

## 10. Current Single Owner work

Read `PROJECT_EXECUTION_QUEUE.md` for exact status.

Immediate sequence:

1. keep Stage13E outside `main`;
2. retain both P1 root-cause fixes and regressions;
3. rerun unchanged combined gate when a GitHub runner actually starts;
4. any executed failure → investigate and fix root cause in owning layer;
5. after combined PASS, run wider Stage9/10/OCR/11/12/13/13D/Full Rebuild regressions;
6. close Stage13E and promote accepted code to `main` while preserving central docs;
7. then begin Stage13F.

Do not skip Stage13E closure merely to continue roadmap progress.

## 11. Stage13F and later

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

## 12. Open findings

- `CI-001` P1 — hosted runner currently terminates before checkout; external cause not verified.
- `AI-013E-DB-001` P1 — fixed in candidate; executable verification pending.
- `AI-013E-REVIEW-002` P1 — fixed in candidate; executable verification pending.
- `AI-011-005` P2 — direct generated question persistence unresolved; Stage13F owns it.
- `AI-012-019` P2 — live AI provider benchmark/routes/credentials/bootstrap unverified.
- Stage13E executable gate pending.
- later Student/Offline/assessment/admin roadmap incomplete.

## 13. End-of-batch continuity rule

After every meaningful batch the single engineering owner must update:

1. `PROJECT_EXECUTION_QUEUE.md`;
2. `PROJECT_INTEGRATION_CONTINUITY.md`;
3. `PROJECT_STATUS.md` if state changed;
4. `PROJECT_ENGINEERING_LOG.md` findings/decisions/tests;
5. specialized stage docs/contracts;
6. active Issue #16 with an `EXECUTION REPORT`;
7. this Handoff/Index/Roadmap/Legacy Coverage when their truth changes.

Record exact branch/HEAD/run IDs and explicit `NOT YET VERIFIED` items. Never leave continuation-critical information only in chat.
