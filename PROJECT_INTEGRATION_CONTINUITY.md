# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> **Purpose:** هذا هو ملف الذاكرة التشغيلية الثابت للمحادثة الرئيسية (Integration / Architecture / QA / Release). يجب أن تستطيع محادثة بديلة قراءة هذا الملف + `DOCUMENTATION_INDEX.md` + ملفات الحالة المركزية + GitHub Boards ثم تكمل من نفس النقطة بدون أي ذاكرة Chat سابقة.
>
> **Authority:** هذا الملف لا يتقدم على الكود أو PostgreSQL migrations أو executable GitHub Actions evidence. هو current operational snapshot يربط Source of Truth مع العمل الجاري. أي ادعاء بلا executable evidence يبقى `NOT YET VERIFIED`.

Last synchronized: **2026-09-08 — after Stage13E Backend/Frontend candidate review**.

---

## 1. Mandatory resume procedure

أي محادثة Integration بديلة يجب قبل أي تعديل/دمج:

1. تأكيد repo: `7eaur/alwaslh`.
2. قراءة `README.md`.
3. قراءة `DOCUMENTATION_INDEX.md` وتطبيق Source of Truth precedence.
4. قراءة `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`.
5. قراءة هذا الملف كاملًا.
6. قراءة `docs/workstreams/TEAM_OPERATING_MODEL.md` و`docs/workstreams/INTEGRATION_WORKSTREAM.md`.
7. قراءة آخر الأوامر/التقارير في:
   - Team Room Issue `#13`;
   - Backend Board Issue `#14`;
   - Frontend Board Issue `#15`;
   - Integration Board Issue `#16`.
8. live-check رؤوس branches الحالية؛ لا تفترض أن آخر تقرير هو آخر commit.
9. live-check GitHub Actions jobs/steps قبل تفسير أي workflow conclusion.
10. افحص code/migrations/tests الفعلية لأي جزء ستقبله أو تعدله.
11. أي شيء غير مفحوص أو غير منفذ = `NOT YET VERIFIED`.

**Never use chat memory as authority.** GitHub + repository docs + executable evidence هي الذاكرة الرسمية.

---

## 2. Integration role / mission

المحادثة الرئيسية تمثل:

- Tech Lead / Software Architect;
- Integration Engineer;
- cross-team contract reviewer;
- QA / regression owner;
- Security/Performance/UX cross-boundary reviewer;
- central documentation owner;
- Release/Preview owner عندما يعاد تفعيل deployment.

المطلوب ليس كتابة كل Backend/Frontend هنا. الفريقان يملكان implementation الخاص بهما؛ Integration:

- يوزع العمل؛
- يراجع code/contracts/evidence؛
- يعيد defect إلى طبقته المالكة عند الحاجة؛
- يمنع duplicate authority / wrong-layer workaround؛
- يدمج فقط candidate منطقيًا؛
- يشغل same-head cross-boundary verification؛
- يقرر `ACCEPT | RETURN | PARTIAL`؛
- وحده يعلن Stage `VERIFIED`.

Backend/Frontend `Ready` لا يساوي Stage PASS.

---

## 3. Product understanding

**الوسيلة الذكية** منصة تعليمية عربية تُعيد بناء منتج قائم مع الحفاظ على النتائج والسيناريوهات ذات القيمة، وليس الحفاظ على implementation قديم غير آمن أو غير قابل للصيانة.

### Student Web/PWA — `apps/student-web`

Target outcomes:

- secure Full-Code activation;
- returning login/device-bound auth;
- entitlement-filtered curriculum;
- Reader/media/text/search/TTS;
- Practice/Tests/Models;
- Notes/Favorites/Needs Review;
- progress/private achievements;
- notifications;
- explicit Offline/PWA lifecycle.

### Super Admin Web — `apps/admin-web`

Target outcomes:

- curriculum/content authoring;
- image/PDF/mixed ingestion;
- media/OCR operations/review;
- AI operations/review;
- Question Bank/Quiz Builder/review/publish;
- students/codes/recovery/device reset;
- notifications/import-export/reports/settings/audit.

### Backend — `apps/api` + PostgreSQL

Authoritative for:

- Auth / Authorization / Entitlements;
- curriculum/business state;
- content/media/OCR/AI durable state;
- review/publication;
- trusted assessment/scoring/progress;
- security-sensitive mutations/audit.

Browser owns presentation/session UX only, not durable business authority.

---

## 4. Stable architecture

```text
Student Web/PWA ─┐
                 ├── Fastify API ── private PostgreSQL
Admin Web ───────┘       │
                         ├── Auth / Access / Curriculum
                         ├── Stage9 source provenance
                         ├── Stage10 media pipeline
                         ├── OCR durable derived/reviewed text
                         ├── Stage11 provider-neutral AI contracts
                         ├── Stage12 durable AI execution/worker
                         └── Stage13 Admin review/publication/operations
```

Non-negotiable principles:

- Correctness > Cleverness.
- Clarity > Complexity.
- Evidence > Assumptions.
- Simple Architecture > Overengineering.
- no duplicate queue/lifecycle/pipeline for convenience;
- provider/network calls outside long DB transactions;
- durable jobs/progress/review/publication server/PostgreSQL-owned;
- Frontend does not derive server-owned permissions when Backend can project them;
- `media ready != published`;
- raw AI output != student published content;
- Stage13E AI review approval != Stage13F Question Bank publication;
- exact/extraction AI modes never fabricate unknown answers;
- no test weakening/auth bypass/hidden catch/random timeout as final fix.

Every important defect must carry:

`Symptom → Root cause → Broken invariant/contract → Blast radius → Correct owning layer → Regression`.

---

## 5. Stable business/security boundaries

- Full Code = exactly 6 digits.
- Class Code = exactly 7 digits.
- Student activation verify is non-consuming; final activation is atomic.
- Returning Student auth requires password + registered ECDSA P-256 device proof.
- Admin auth/recovery is separate; recovery/session revoke/forced password replacement/device rebind rules remain intact.
- Curriculum authority: `Class → Subject Offering(subject_class_links) → optional Section → Lesson`.
- Stage9 source/Git import is provenance evidence, not curriculum hierarchy.
- Source folder/file names never silently become Business Rules.
- Upload/media success is independent from OCR/AI/TTS.
- Reviewed OCR is preferred downstream evidence when available.
- AI contract/provider routing/execution are separate concerns.
- AI provider credentials/aliases/raw internals are never client-visible.
- Fastify HTTP runtime remains separate from dedicated AI worker runtime.
- DB-coordinated AI capacity/cooldown/kill/budget authority remains intact.

---

## 6. Repository / branch / PR / deployment

Repo: `7eaur/alwaslh`.

Main planning/integration branch:

`planning/product-evolution-review`

Draft PR:

`#12` → base `rebuild/media-pipeline`.

Do not force-rewrite history.

PR body is stale and still describes an older Stage10-era sequence. It is optional metadata cleanup, not runtime work.

Deployment / Preview:

**`DEFERRED BY PRODUCT OWNER`**.

Do not deploy, sync Preview, or re-enable auto-deploy without explicit new Product Owner instruction.

Old database:

**OUT OF CURRENT SCOPE** unless explicitly reopened.

---

## 7. Canonical executable baseline

Latest fully verified runtime/executable head remains:

`4eca7de8877ac9e2289b9c7990c912d33c256935`

Same-head SUCCESS evidence:

- Stage13D Admin Upload UI — `34177369743`;
- Stage13D Content Ingestion — `34177369784`;
- Stage13 Admin Product — `34177369748`;
- Stage12 AI Execution — `34177369812`;
- Stage11 AI Contracts — `34177369753`;
- OCR Foundation — `34177369750`;
- Stage10 Media Pipeline — `34177369777`;
- Stage9 Content Import — `34177369756`;
- Full Rebuild — `34177369768` incl. Student Chromium.

Docs/governance descendants do not replace this runtime baseline until a newer same-head executable matrix actually runs green.

---

## 8. Repository-wide GitHub Actions blocker

Observed planning docs head:

`e9c8b27570512b5e05a03b8fa964429489ebe596`

All nine PR workflow families concluded `failure` on that head, including:

- OCR `34188318559`;
- Stage10 `34188318608`;
- Stage13D backend `34188318590`;
- Stage12 `34188318556`;
- Stage13D Admin Chromium `34188318614`;
- Stage9 `34188318583`;
- Stage11 `34188318598`;
- Stage13 Admin `34188318586`;
- Full Rebuild `34188318551`.

Inspection of Rebuild jobs showed no workflow steps; e.g. job `101941035842` had `steps=[]`.

Backend Stage13E and Frontend Stage13E runs show the same condition: jobs end before checkout with no runner/steps.

**Interpretation:** this is repository/account/platform runner-allocation evidence, not proof that nine independent product areas regressed. Exact billing/quota/platform cause remains `NOT YET VERIFIED` with current permissions.

Rules:

- do not weaken/skips workflows;
- do not mark PASS;
- do not churn product code to force runs;
- when runner returns, run unchanged gates and fix only real failures at owning layer.

---

## 9. Stage ledger

VERIFIED:

- Stages1–10;
- OCR Foundation;
- Stage11 AI Contracts;
- Stage12 durable AI execution/runtime backend;
- Stage13A Curriculum Backend;
- Stage13B Admin Curriculum UI incl. Chromium;
- Stage13C Admin Content/Media/OCR Operations incl. Chromium;
- Stage13D Upload/Processing History/Publication Linking incl. Chromium.

Current:

- **Stage13E Admin AI Operations / Review — IN PROGRESS / NOT YET VERIFIED.**

Later:

- Stage13F Question Bank / Quiz Builder / Review / Publish;
- Stage13G remaining Admin modules;
- Stage14 Student product/Reader;
- Stage15 Assessment;
- Stage16 Offline/PWA;
- Stage17 Personal Learning Data;
- Stage18 Notifications;
- Stage19 Progress/Statistics;
- Stage20 Import/Export/Reporting;
- Stage21–29 hardening/release/cutover/operations.

Do not start Stage13F implementation before Stage13E closure.

---

## 10. Permanent team topology

### Team Room — Issue `#13`

Cross-team contracts/blockers/architecture decisions.

### Backend / Platform — Issue `#14`

Persistent Backend chat; short feature branches.

Current branch:

`backend/stage13e-ai-operations`

### Frontend / Product — Issue `#15`

Persistent Frontend chat; short feature branches.

Current branch:

`frontend/stage13e-ai-operations`

### Integration / Architecture / QA / Release — Issue `#16`

Main acceptance/return/merge/verification/central docs/release board.

Latest Board `COMMAND`/Integration Review governs current scope. Each workstream updates its own workstream doc + Board REPORT. Integration updates this continuity file whenever the resume point changes.

---

## 11. Stage13E Backend — current candidate state

Branch:

`backend/stage13e-ai-operations`

Current HEAD:

`348c02646d0ff873fd305beff16f41c46d9c0285`

Formal REPORT:

Issue #14 comment `5579330147`.

Same-head CI retry follow-up:

Issue #14 comment `5579336922`.

Latest Integration decision:

Issue #14 comment `5579472553` — **IMPLEMENTATION CANDIDATE ACCEPTED / HOLD FOR EXECUTABLE CI**.

### Backend functionality implemented

- Admin-only AI job list/detail;
- durable units/attempts/output detail;
- server-derived lifecycle status/progress;
- pause/resume/cancel/retry over existing Stage12 authorities;
- provider/model/project/route/benchmark/token/cost/latency observability without credentials;
- source/page/checksum/OCR/content-source provenance;
- append-only `edit | approve | reject` review audit;
- output-row locking + unique review revision protection;
- Stage11 semantic validation reused for Admin edits/approval;
- raw/normalized provider result remains immutable;
- Stage13E review never directly publishes to Stage13F Question Bank.

Migration:

`database/migrations/0018_ai_admin_review.sql`

Adds:

- `ai_output_review_action` enum;
- append-only `ai_output_review_events`;
- output/actor FK;
- unique `(ai_output_id, revision)`;
- payload/note constraints and audit indexes.

No Stage12 lifecycle table/queue duplicated.

### Backend Admin endpoints

- `GET /v1/admin/ai/jobs`
- `GET /v1/admin/ai/jobs/:jobId`
- `GET /v1/admin/ai/units/:unitId`
- `GET /v1/admin/ai/outputs/:outputId`
- `POST /v1/admin/ai/jobs/:jobId/pause`
- `POST /v1/admin/ai/jobs/:jobId/resume`
- `POST /v1/admin/ai/jobs/:jobId/cancel`
- `POST /v1/admin/ai/jobs/:jobId/retry`
- `PATCH /v1/admin/ai/outputs/:outputId/review`

Canonical Frontend-facing Backend contract:

`docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md` on Backend branch.

### Server-derived action authority

Job detail:

```ts
allowedActions: Array<"pause" | "resume" | "cancel" | "retry">
```

Output detail:

```ts
allowedReviewActions: Array<"edit" | "approve" | "reject">
```

Mutation endpoints remain final authority and may return `409` after a race.

Retry is not advertised when:

- failed unit attempt ceiling >=20;
- cancellation request exists;
- no failed units exist.

Terminal review `approve/reject` => `allowedReviewActions=[]`.

### Strict review request

```ts
type ReviewRequest =
  | { action: "edit"; editedOutput: AiGenerationOutput; note?: string }
  | { action: "approve"; note?: string }
  | { action: "reject"; note: string };
```

HTTP strictness:

- `approve + editedOutput` => 400;
- `edit` without output => 400;
- blank/missing reject reason => 400;
- unknown extra fields => 400;
- rejected request writes zero review events.

### Backend root-cause fixes already accepted

1. Initial use of nonexistent `ai_jobs.failure_code/failure_message` removed instead of adding duplicate state; unit/attempt error authority retained.
2. Admin retry grants exactly one additional attempt with hard ceiling 20 while preserving attempt history.
3. Admin edit/approve now reuses full Stage11 semantic validation, not schema-only acceptance.
4. `pause → cancel` clears `paused_at` in owning Stage12 `AiExecutionRepository.requestCancel`; regression added.
5. Review HTTP intent encoded as exact discriminated union.
6. Missing read-side action authority closed by server-projected allowed-action arrays.

### Backend security boundary

Do not expose:

- `credential_alias`;
- provider raw metadata;
- raw provider response;
- provider/internal error message text.

Safe contract exposes operational IDs/codes plus `hasRawResponse` only.

### Backend CI status

Run `34187606304` attempt 2 on exact HEAD `348c026...`, job `101939489640`:

- failure before checkout;
- `runner_id=0`;
- empty runner name;
- `steps=[]`;
- no repository command executed.

Current-head lint/typecheck/unit/build/clean PostgreSQL/Stage13E integration/Stage12 regressions/auth regression remain `NOT YET VERIFIED`.

### Backend current command

**HOLD branch stable.** No additional Backend product work requested now.

Only act if:

1. runner actually executes and reveals a real failure; or
2. Integration finds a concrete cross-boundary defect.

Then root-fix only. Closure Report + `Ready for integration: YES` only after full same-head PASS.

---

## 12. Stage13E Frontend — current candidate state

Branch:

`frontend/stage13e-ai-operations`

Current branch HEAD after docs:

`e42644944ca3fcc7e225a263a6e9699bcb70b9f7`

Latest product-code HEAD:

`f649a9a73cb44c3a95caec342af6280b87c86a47`

Formal REPORT:

Issue #15 comment `5579436581`.

Backend contract consumed:

`backend/stage13e-ai-operations` @ `348c02646d0ff873fd305beff16f41c46d9c0285`.

Latest Integration review:

Issue #15 comment `5579474397` — production binding **accepted as candidate**, bounded RETURN only for missing real-browser regression preparation.

### Frontend product binding now present

- `ai-operations-api.ts` — authenticated Stage13E transport;
- `ai-operations-adapter.ts` — safe DTO→view-model boundary;
- `AiOperationsPage.tsx` — request/state/polling/controller layer;
- `AiOperationsWorkspace.tsx` — jobs/units/attempts/output/review UI;
- `ai-operations-view-model.ts` — presentation types/labels only;
- `App.tsx` — Admin nav activation for **عمليات AI والمراجعة**;
- review CSS;
- unit/transport/adapter tests;
- real combined-browser E2E spec.

Key commits:

- `79330380e23d0c1941dc750fddd5b854286868a5` — bind Stage13E transport;
- `afad78e8950373a501b67a37fe32c9af2f5cebeb` — production activation;
- `1582772590443e113a9b7bd24c0499fa06476595` — review transport hardening;
- `f649a9a73cb44c3a95caec342af6280b87c86a47` — Chromium integration-flow preparation;
- `20839ae304553233af10286a91aedddbfd075fcd` — production-binding docs;
- `e42644944ca3fcc7e225a263a6e9699bcb70b9f7` — Frontend handoff docs.

### Frontend contract mapping accepted

Actual reviewed transport matches Backend:

- list/detail/control/review endpoint paths;
- `job.allowedActions` nested in job detail;
- `output.allowedReviewActions` inside output detail;
- control responses unwrap `{progress}`;
- review response unwraps `{output}`;
- strict review input union matches Backend.

Frontend does **not** derive action permissions from lifecycle enums.

### Frontend authority/security corrections accepted

- no raw provider JSON display;
- no `rawResponse` client dependency;
- `hasRawResponse` only as non-sensitive indicator;
- no provider/internal `errorMessage`/`lastErrorMessage` dependency;
- safe `errorCode`/`lastErrorCode` mapping only;
- no invented disabled-reason authority;
- canonical server progress used as-is;
- Stage13E approval copy explicitly says it is not Question Bank publication.

### Frontend controller behavior accepted

- bounded list load;
- job/unit details on demand;
- polling every 5s only for selected non-terminal job;
- in-flight guard prevents overlapping poll tick work;
- cleanup on effect teardown;
- mutation success refreshes canonical state;
- `409` conflict refreshes canonical state and shows safe feedback;
- no optimistic lifecycle promotion;
- existing session-expiry handling reused.

### Frontend existing E2E preparation

`apps/admin-web/e2e/ai-operations.e2e.spec.mjs` currently prepares real combined-backend flows for:

1. Admin login;
2. open AI Operations;
3. open seeded job;
4. pause;
5. verify paused/resume availability;
6. resume;
7. open unit/output;
8. approve;
9. verify terminal review/no actions;
10. reload and verify durable approval;
11. 390×844 no-horizontal-overflow assertion.

`STAGE13E_E2E=1` requires `STAGE13E_E2E_JOB_TYPE`; missing fixture is a hard failure rather than silent skip.

### Frontend bounded test-contract gap found by Integration

The current E2E file does **not yet prepare explicit real-browser scenarios for**:

- session expiry/auth boundary while inside Stage13E;
- stale review/action `409` race and canonical refresh/error feedback.

Latest Integration RETURN requires deterministic real-backend preparation, not mocks:

1. authenticate/open AI workspace, invalidate/logout same real session through real API/browser context, trigger Stage13E refresh/action, verify app returns to signed-out/login state;
2. open review output, complete terminal review out-of-band through same real browser context/API, then submit stale UI review and prove `409` causes canonical refresh + safe feedback + terminal server state/no actions.

No `page.route` fake API, no test-only production endpoint, no Backend contract change for this gap.

If fixture orchestration properly belongs in combined Integration workflow, Frontend should document exact fixture dependency and prepare spec/helper contract on its branch.

### Frontend CI state

Historical prep run `34184228250` was green but predates production binding and does not verify current product.

Current binding runs include:

- `34187450894` @ `79330380...`;
- `34187905811` @ `afad78e...`;
- `34188105821` @ `15827725...`;
- `34188173087` @ `f649a9a...`, job `101940609263`.

These failed before checkout with `steps=[]`; no current product command executed.

Current-head lint/typecheck/unit/build remain `NOT YET VERIFIED`.

### Frontend current command

Complete only the bounded real-browser regression preparation above, update `FRONTEND_WORKSTREAM.md` + Issue #15, then hold product branch stable until runner executes.

Do not claim `Ready for integration: YES` until current-head executable quality gates pass.

---

## 13. Cross-team Stage13E decisions settled

Do not reopen casually:

- no second Stage12 queue/lifecycle;
- PostgreSQL/Backend owns jobs/progress/review;
- Frontend receives, not derives, action availability;
- raw provider response stays server-internal;
- internal provider error messages stay server-internal;
- safe error codes may be displayed/mapped;
- source/page/checksum provenance is visible;
- review events are append-only/audited;
- terminal approve/reject blocks later review mutation;
- `review_required` may be human-approved; semantic `invalid` may not;
- edit/approve candidate reuses Stage11 semantic validator;
- cancellation clears paused state in owning repository;
- mutation conflict `409` means refresh canonical server state;
- Stage13E approval is not Stage13F publication.

Relevant Team Room comments:

- `5578975107` — Backend contract handoff;
- `5579019837` — semantic-review correction;
- `5579176219` — Integration security/contract alignment;
- `5579322581` — Backend amended contract handoff;
- `5579429605` — Frontend production-binding status;
- `5579477299` — latest candidate/test-gap status.

---

## 14. Current Integration decision

Latest Integration Board report:

Issue #16 comment `5579476017`.

Decision:

**PARTIAL / HOLD — DO NOT MERGE TO PLANNING YET.**

Why:

- Backend implementation/contract is code-review accepted candidate, but executable same-head gates have never run on `348c026...`.
- Frontend production binding is code-review accepted candidate, but one requested browser-regression preparation batch remains and current-head quality gates have never run.
- repository-wide hosted runners currently end jobs before checkout.

No Stage13E PASS, no central stage-closure docs, no Stage13F command yet.

---

## 15. Exact next Integration actions

A replacement main chat should do exactly this:

### A. Re-read live team state

1. Backend #14: see whether runner has executed or a Closure Report appeared after `5579472553`.
2. Frontend #15: see whether bounded session-expiry/409 E2E prep report appeared after `5579474397`; live-check branch HEAD.
3. Team Room #13: inspect decisions newer than `5579477299`.
4. Integration #16: inspect any newer acceptance/return report.
5. Check repo-wide GitHub Actions jobs/steps before interpreting conclusions.

### B. Backend gate

Backend is not to be changed unless real evidence demands it.

Before final acceptance require exact same Backend HEAD:

- API lint;
- strict typecheck;
- unit tests;
- build;
- clean PostgreSQL migrations including `0018`;
- Stage13E auth/secret/provenance/review-race/action/retry/control tests;
- Stage12 execution/capacity/control/lifecycle regressions;
- auth security regression.

### C. Frontend gate

After bounded E2E-prep batch:

Review diff only for:

- no fake/intercepted production API;
- real session-expiry scenario uses actual auth/session mechanics;
- real stale-review `409` race uses actual backend state;
- no product behavior changed just to make test easy;
- existing happy/reload/390px flow retained.

Then require current product head:

- Admin lint;
- typecheck;
- unit/transport/adapter tests;
- production build.

### D. Create short integration candidate only after both candidate branches are stable

Create short branch from latest approved `planning/product-evolution-review`, e.g.:

`integration/stage13e-ai-operations`

Combine logical Backend + Frontend batches while preserving their intent. Resolve conflicts based on contracts, not merely Git cleanliness.

Do **not** merge to planning before same-head integration evidence.

### E. Combined Stage13E same-head verification

Run on one exact integrated HEAD:

- API lint/typecheck/unit/build;
- Admin lint/typecheck/unit/build;
- clean PostgreSQL migrations;
- Stage13E Backend integration/security/concurrency/action/review tests;
- Stage12 regressions;
- auth regression;
- Stage13 Admin regressions;
- real Stage13E Chromium:
  - login/auth boundary;
  - jobs/detail;
  - server actions;
  - review;
  - session expiry;
  - stale `409` conflict + canonical refresh;
  - reload durability;
  - permission/error paths justified by real fixture;
  - 390px overflow/a11y;
- Stage13D regression;
- Stage11/Stage12/OCR/Stage10/Stage9/Full Rebuild matrix as required.

No fake transport in final browser gate.

### F. Closure only after green executable matrix

Update:

- `PROJECT_INTEGRATION_CONTINUITY.md`;
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `PROJECT_HANDOFF.md`;
- Stage13E specialized docs;
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`;
- `MASTER_REBUILD_ROADMAP.md` when Stage13E becomes VERIFIED;
- `DOCUMENTATION_INDEX.md` only if topology changes;
- `NEXT_CONVERSATION_PROMPT.md` only if startup path changes.

Record exact integration HEAD + all run IDs.

Only then merge/advance planning and issue Stage13F commands.

---

## 16. Known risks/open work carried forward

- `AI-011-005` P2 — `direct` AI question persistence into Question Bank unresolved; Stage13F owns it.
- `AI-012-019` P2 — live provider/model benchmark/config/routes/bootstrap NOT YET VERIFIED.
- `LES-A-016..019` page-detection/review/save coverage remains open unless Stage13E executable evidence later closes part of it.
- `LES-A-020..037` Admin AI generation/review user-flow legacy rows require executable user-flow evidence before VERIFIED.
- TTS runtime/quality unverified.
- full Student curriculum/read product remains later work.
- final Offline/PWA remains later.
- hosted deployment remains unverified because deployment is deferred.
- `tmp-unused-do-not-use` branch remains P3 housekeeping.

---

## 17. Root-cause / no-patching gate

Any failure must record:

```md
Symptom:
Root cause:
Broken invariant/contract:
Blast radius:
Correct owning layer:
Why this fix is correct:
Regression evidence:
Remaining NOT YET VERIFIED:
```

Reject final fixes based on:

- test weakening;
- auth/security bypass;
- hidden/swallowed errors;
- random sleeps/timeouts;
- duplicate authority;
- wrong-layer permanent workaround;
- fake production API;
- client-derived server-owned state;
- changing Business Rules only to make tests easier.

---

## 18. Update policy for this file

Integration/main chat must update `PROJECT_INTEGRATION_CONTINUITY.md` after every meaningful event that changes the resume point:

- Backend/Frontend REPORT;
- `ACCEPT | RETURN | PARTIAL` decision;
- material branch/head advance;
- cross-team contract decision;
- root cause/fix;
- CI result/blocker;
- integration candidate creation/merge;
- Stage transition;
- deployment policy change;
- important open-risk change.

Do not wait for Stage end.

If a branch advances without a Board report, record it as **observed WIP / NOT YET VERIFIED**, never completed.

Permanent historical detail belongs in `PROJECT_ENGINEERING_LOG.md`; concise project handoff belongs in `PROJECT_HANDOFF.md`; executable summary belongs in `PROJECT_STATUS.md`. This file is the precise current Integration memory connecting all of them.

If this file conflicts with another source, use precedence:

1. current code/migrations + actual executable CI evidence;
2. Current Product Overrides;
3. central status/handoff/engineering log;
4. specialized module contracts;
5. this current operational snapshot;
6. Boards for dynamic commands/reports;
7. older planning/legacy docs.

Then update this file immediately so the conflict disappears.
