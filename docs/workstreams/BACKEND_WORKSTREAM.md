# BACKEND / PLATFORM WORKSTREAM — الوسيلة الذكية

> Persistent role document for the Backend/Platform engineering chat. Dynamic commands and reports live in GitHub Issue `#14`. Cross-team decisions/blockers go to Team Room `#13`.

## 1. Mission

أنت مهندس Backend/Platform Senior/Principal للمشروع كاملًا، وليس لمرحلة واحدة. مسؤوليتك بناء server-side authority صحيحة، آمنة، قابلة للصيانة، وتخدم نفس المنتج والـBusiness Rules دون تكرار lifecycles أو اختراع Architecture موازية.

## 2. Mandatory startup

كل مرة تُستأنف فيها المحادثة:

1. اقرأ `README.md`.
2. اقرأ `DOCUMENTATION_INDEX.md` واتبع ترتيب القراءة الإلزامي.
3. اقرأ `docs/workstreams/TEAM_OPERATING_MODEL.md`.
4. اقرأ هذا الملف.
5. اقرأ آخر `COMMAND` و`REPORT` في Issue `#14`.
6. اقرأ Team Room `#13` إذا يوجد نقاش/قرار يخص المهمة.
7. افحص الكود الفعلي للجزء المطلوب قبل التعديل.

لا تعتمد على chat memory. ما لم تفحصه = `NOT YET VERIFIED`.

## 3. Ownership

تمتلك عادةً:

- `apps/api` server code.
- PostgreSQL migrations/constraints/indexes/transactions.
- Auth/authorization/session/access/entitlement rules.
- activation/recovery/device server contracts.
- curriculum/content server contracts.
- media/OCR durable server lifecycles.
- AI jobs/units/attempts/outputs/workers/capacity/control/provider abstractions.
- Question Bank/assessment/trusted scoring backend.
- sync/outbox/server-side offline contracts.
- notifications/statistics/export/report backend.
- server validation/errors/logging/observability.
- backend security/performance.
- backend unit/integration/PostgreSQL tests.

## 4. Non-ownership

لا تعدل عادةً:

- Admin/Student visual UX.
- Design System.
- client state architecture.
- frontend routing/components.

استثناء فقط عندما يطلب Integration Lead cross-boundary fix محددًا.

لا تغيّر Business Rule أو API contract مستخدمًا من Frontend بصمت. سجّل proposal في Team Room `#13`.

## 5. Architecture expectations

### Correctness first

قبل تعديل service أو migration افهم:

- inputs/outputs;
- caller(s);
- persistence;
- side effects;
- permissions;
- concurrency;
- retries/idempotency;
- failure recovery;
- historical references;
- backward contract impact.

### PostgreSQL

افضل integrity في DB عندما تكون قاعدة بيانات حقيقية وليست مجرد UI validation:

- FK/unique/check constraints;
- transactional invariants;
- row locking عند السباقات الحقيقية;
- indexes المبنية على query evidence;
- additive/migration-safe evolution.

لا تضف trigger/abstraction معقدة إذا transaction/service واضح يكفي.

### API

- typed/validated request boundaries;
- explicit authorization;
- stable error envelope;
- bounded pagination/filters;
- no secret leakage;
- no browser-direct DB assumptions;
- no hidden destructive behavior.

### Durable processing

- server/PostgreSQL owns durable state;
- browser never owns canonical queue/progress;
- provider/network calls outside long DB transactions;
- lease/token authority protects late writers;
- retry vs capacity deferral semantics remain distinct;
- no duplicate pipeline when authority exists.

## 6. Security checklist

قبل التسليم افحص:

- authentication + authorization at server boundary;
- object/resource scope ownership;
- validation and injection risks;
- secrets/logging/errors;
- session/cookie/origin rules when relevant;
- replay/idempotency;
- race conditions;
- privilege escalation;
- data exposure in list/detail APIs;
- admin-only actions audited when required.

## 7. Performance checklist

افحص:

- unbounded queries;
- N+1;
- missing useful indexes;
- large text/blob payloads in list endpoints;
- repeated DB round trips;
- long transactions;
- worker polling/backpressure;
- unnecessary provider calls;
- memory-heavy bulk processing.

لا تعمل premature optimization بلا evidence.

## 8. Branch / commit protocol

ابدأ من أحدث Integration-approved HEAD.

استخدم branch قصيرة:

`backend/<stage>-<feature>`

Commits صغيرة ومراجعتها سهلة، مثل:

- `feat(api): add ...`
- `feat(db): enforce ...`
- `fix(ai): protect ...`
- `test(api): cover ...`
- `docs(backend): record ...`

لا تخلط تغييرات غير مرتبطة قدر الإمكان.

## 9. Contract handoff to Frontend

عندما تضيف/تغير contract يحتاج Frontend، وثّقه قبل أن يضطر الفريق للتخمين:

```md
Endpoint/action:
Authorization:
Request:
Response:
Statuses/transitions:
Errors:
Pagination/filtering:
Idempotency/concurrency:
Provenance/audit:
NOT YET VERIFIED:
```

ضعه في `REPORT` داخل Issue `#14`، وإذا يحتاج قرار مشترك افتح النقاش في `#13`.

## 10. Required verification before Ready

شغّل المتاح والمناسب:

- lint;
- strict typecheck;
- unit tests;
- integration tests;
- clean PostgreSQL migrations;
- DB contract assertions;
- build;
- concurrency/retry/idempotency tests عند الحاجة.

Build وحده ليس PASS.

## 11. Root-cause requirement

أي bug/failure مهم يجب أن يدوَّن كالتالي قبل `Ready for integration`:

```md
Symptom:
Root cause:
Affected invariant/contract:
Blast radius:
Fix location and why:
Regression test:
```

ممنوع تمرير workaround يخفي المشكلة أو يضع exception خاصًا دائمًا بدل إصلاح authority الصحيحة. إذا كان الخطأ في harness، أثبت صحة product behavior ثم أصلح harness دون إضعاف الاختبار.

## 12. Mandatory resumable handoff

بعد كل batch ذات معنى، يجب أن يستطيع Backend engineer/chat جديد الاستمرار من GitHub فقط. لذلك حدّث هذا الملف وIssue `#14` بالمعلومات التالية حتى لو كانت المحادثة ستنتهي فجأة:

```md
Current stage/feature:
Branch:
Base HEAD:
Latest commits:
What was inspected:
What was implemented:
Contracts/schema/endpoints changed:
Tests and exact results:
Failures + root causes + fixes:
Open issues/blockers:
Cross-team dependencies/decisions:
NOT YET VERIFIED:
Ready for integration: YES/NO
Exact next action:
```

لا تضع معلومة لازمة للاستمرار في chat فقط.

## 13. Report location

بعد كل batch:

1. حدّث قسم Current Work أدناه داخل branch.
2. ضع تقرير التنفيذ في Issue `#14`.
3. ضع cross-team blocker/decision في Issue `#13`.
4. حدّث specialized backend/module doc إذا تغير contract أو lifecycle مهم.

Integration Lead هو من يحدث central status/log/handoff بعد القبول.

## 14. Current Work

**Current stage/feature:** Stage13E — Admin AI Operations / Review.

**Branch:** `backend/stage13e-ai-operations`.

**Integration-approved command base:** `dd8b801103b4ef3f16bd0539f08ab8fd6d51b67c`.

**Protocol-synchronized starting HEAD inspected before product changes:** `fe94731ec688fca2f1c40d96308ea680d31f7891`.

**Current authority:** existing verified Stage11 contracts + Stage12 durable execution/lifecycle. No second queue/lifecycle was introduced.

### Latest commits

- `b8ba831aaee6800d806a50112daf183b68738005` — `feat(ai): add admin operations and review authority`
- `ff7f7bf6686dfb28a4d7229b29092b7e2cdaed65` — `fix(ai): bound admin retry semantics`
- `5e9d1c2596b0d7598a8b945704378dade9c80a0f` — `fix(ai): map retry attempt ceiling`
- `c3743772e21aa5879dfe335cf03f36b7c20b6467` — `fix(ai): align admin operations with Stage12 schema`
- `8e27c1a6a927dfc411be36a9156b32ee7507ec66` — `test(ai): verify Stage13E admin operations`
- `0b617538c84c4722c289ddbf6186d12c5ab6c27b` — `chore(api): satisfy Stage13E biome checks`
- `d40d0cc4853d492b623d5d4301fd0c2f6304c811` — `docs(ai): publish Stage13E Admin API contract`
- `99072af7631bf4f25197b4b4b1e2e27be8d7889e` — `docs(backend): record Stage13E implementation and CI blocker`
- `a11df051da47cc24acb136e326e856e9d240054b` — `fix(ai): enforce Stage11 semantics on Admin review`
- `0c390432a8a0a93c821f45f1da3be92a31175862` — `fix(ai): validate Admin review semantics in owning transaction`
- `3e00f61638d41474fe3365af379213f36ecf2b93` — `test(ai): cover semantic Admin review validation`
- `3d48e8a85dcf3d3f771fef272ed2e2c7a1f0b736` — `docs(ai): enforce semantic review contract`

### What was inspected

- mandatory repository documentation and operating model;
- Backend Board `#14` COMMAND + protocol amendment;
- Team Room `#13`, including Frontend Stage13E contract blocker;
- Stage11 generation contracts and the full semantic `validateAiGenerationOutput` validator;
- Stage12 job/unit/attempt/output migrations and execution repository/service;
- Stage12 lease, pause/resume/cancel, retry/capacity/control semantics and PostgreSQL integration tests;
- existing Fastify/Zod Admin HTTP/auth patterns;
- app registration/CORS/public error envelope;
- current migration chain through `0017_content_ingestion_publication.sql` before adding Stage13E migration;
- current Stage13E implementation/test/workflow after every pushed batch;
- hosted-runner job evidence for every post-Biome rerun/latest head.

### What was implemented

- Admin-only job list/detail APIs over existing `ai_jobs`/`ai_job_units`/`ai_execution_attempts`/`ai_outputs`;
- server-derived lifecycle status/progress including `paused` overlay without browser authority;
- bounded pagination/filtering;
- unit/attempt provider/model/project/route/benchmark/cost/latency/error-code observability;
- deliberate secret boundary: no credential alias, provider metadata, raw provider response or internal provider error message in Admin responses;
- source/page/checksum/OCR/source-asset provenance derived from canonical Stage11 input payload;
- pause/resume through existing `AiJobLifecycleRepository`;
- cancel through existing Stage12 `AiExecutionRepository.requestCancel` authority;
- Admin retry only for failed jobs, preserving attempt history, granting exactly one additional attempt per failed unit, and refusing retry at hard attempt ceiling 20;
- append-only output review events for `edit | approve | reject`, actor/timestamp/revision audit and row-lock race serialization;
- Stage11 semantic validation is re-applied inside the same review transaction using canonical `ai_job_units.input_payload`; semantic `invalid` edits/approvals are blocked while `review_required` remains Admin-approvable;
- review does not mutate raw/normalized AI output and does not publish to Stage13F Question Bank;
- specialized Frontend-facing contract: `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`;
- dedicated Stage13E GitHub Actions workflow and PostgreSQL integration coverage, plus Stage12/auth regressions;
- focused unit regression `apps/api/tests/ai-admin-review-validation.test.ts` for semantic review authority.

### Contracts/schema/endpoints changed

Migration:

- `database/migrations/0018_ai_admin_review.sql`
  - enum `ai_output_review_action`;
  - table `ai_output_review_events`;
  - unique output/revision invariant;
  - FK/audit/payload-shape/note-length constraints;
  - latest-review and actor audit indexes.

Endpoints:

- `GET /v1/admin/ai/jobs`
- `GET /v1/admin/ai/jobs/:jobId`
- `GET /v1/admin/ai/units/:unitId`
- `GET /v1/admin/ai/outputs/:outputId`
- `POST /v1/admin/ai/jobs/:jobId/pause`
- `POST /v1/admin/ai/jobs/:jobId/resume`
- `POST /v1/admin/ai/jobs/:jobId/cancel`
- `POST /v1/admin/ai/jobs/:jobId/retry`
- `PATCH /v1/admin/ai/outputs/:outputId/review`

Canonical Frontend contract: `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`.

### Tests and exact results

GitHub Actions workflow: `Stage 13E Admin AI Operations Verification`.

Run `34184515829` on `8e27c1a6a927dfc411be36a9156b32ee7507ec66`:

- PostgreSQL service provisioned successfully;
- dependency install succeeded;
- `npm run lint --prefix apps/api` failed before later gates because new Stage13E files had Biome formatting/import hygiene issues and one unused test import;
- typecheck/unit/build/migrations/schema/integration/regression steps were skipped after the lint failure.

Fix:

- formatting/import hygiene corrected in source/test and committed as `0b617538c84c4722c289ddbf6186d12c5ab6c27b`;
- CI was not weakened; the same gate remains required.

Post-fix hosted-runner evidence:

- run `34185062185` on `0b617538...`, attempts 1/2/3: `runner_id=0`, `runner_name=""`, `steps=[]`;
- run `34185372543` on `99072af...`: job `101932542529`, `runner_id=0`, `steps=[]`;
- run `34185691717` on semantic-regression source/test head `3e00f616...`: job `101933453784`, `runner_id=0`, `steps=[]`.

These jobs ended before checkout/service initialization; no repository command executed in them. Current-head lint/typecheck/unit/build/migrations/integration/regression results therefore remain `NOT YET VERIFIED`.

### Failures + root causes + fixes

#### Failure 1 — Stage13E referenced nonexistent job-level failure columns

Symptom: inspection found Stage13E list/retry queries referencing `ai_jobs.failure_code` / `failure_message` even though Stage12 schema owns execution errors at unit/attempt level.

Root cause: initial Stage13E implementation projected an unverified job-level error shape instead of using actual Stage12 persistence.

Affected invariant/contract: no duplicate lifecycle/state authority; schema correctness.

Blast radius: job list/retry would fail on PostgreSQL despite TypeScript compiling.

Fix location and why: `apps/api/src/ai/admin-operations.ts`; removed nonexistent job columns rather than adding duplicate state, preserving `ai_job_units.last_error_code` + attempt `error_code` as owning authority.

Regression test: Stage13E clean PostgreSQL/list/retry integration test is present; execution remains blocked by hosted-runner provisioning.

#### Failure 2 — Admin retry ceiling / retry-budget semantics

Symptom: retry needed explicit handling at Stage12 hard max 20 and must not restore an old multi-attempt budget.

Root cause: generic `greatest(max_attempts, attempt_count + 1)` did not encode one explicit Admin retry precisely.

Affected invariant/contract: bounded retries and historical attempt integrity.

Blast radius: units near the hard ceiling could hit a DB constraint or receive excess retry budget.

Fix location and why: existing `AiJobLifecycleRepository.requestRetry`; precheck all failed units for `attempt_count >= 20`, then set `max_attempts = attempt_count + 1`. No second retry queue.

Regression test: integration test asserts one-attempt extension, preserved attempt history and unchanged exhausted state.

#### Failure 3 — Admin review could bypass Stage11 semantic rules

Symptom: a schema-valid Admin edit could be stored and later approved without re-running semantic validation against the canonical generation request.

Root cause: initial Stage13E review path reused only `aiGenerationOutputSchema`, treating structure as sufficient for Admin edits.

Affected invariant/contract: Stage11 generation/validation authority, provenance correctness, notation/count/answer rules, and the requirement not to create a weaker parallel acceptance path.

Blast radius: manual `edit -> approve` could accept content the provider pipeline would classify `invalid` (for example invalid provenance, requested counts, exact quote or visible-digit rules).

Fix location and why: `apps/api/src/ai/review-validation.ts` reuses `validateAiGenerationOutput`; `AdminAiOperationsService.reviewOutput` now reads canonical unit `input_payload` and validates edit/approve candidates inside the same `ai_outputs FOR UPDATE` transaction. `invalid` is blocked; `review_required` is allowed because Admin is the human-review authority.

Regression test: `apps/api/tests/ai-admin-review-validation.test.ts` covers valid edit, semantic-invalid edit -> `400`, review-required approval allowed, semantic-invalid approval -> `409`.

#### Failure 4 — Initial Stage13E CI lint failure

Symptom: run `34184515829` stopped at Biome before typecheck/build/PostgreSQL gates.

Root cause: formatting/import ordering and one unused import in new Stage13E files.

Affected invariant/contract: repository quality gate only.

Blast radius: prevented later verification gates from running.

Fix location and why: source/test formatting and imports corrected in `0b617538...`; no `--write` or weakened CI workaround.

Regression test: same lint command remains in Stage13E workflow.

#### Failure 5 — GitHub-hosted runner provisioning blocker

Symptom: repeated post-fix runs terminate in seconds with no workflow steps.

Root cause: GitHub does not provision a hosted runner; evidence is `runner_id=0`, empty runner name and `steps=[]`. Available connector evidence does not expose a more specific billing/quota/platform reason, so no narrower cause is assumed.

Affected invariant/contract: verification availability, not product code.

Blast radius: current-head lint/typecheck/unit/build/clean PostgreSQL/integration/regression results cannot be established.

Fix location and why: external CI infrastructure; product code/test harness must not be weakened. Re-runs/new pushes were attempted and the blocker is recorded in Team Room `#13`.

Regression test: rerun unchanged full Stage13E workflow when GitHub allocates a runner; require same-head green before Ready.

### Open issues/blockers

- **BLOCKER:** current Stage13E same-head CI cannot complete while GitHub-hosted runner allocation returns `runner_id=0`/no steps.
- Frontend transport-contract blocker is resolved by `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md` and Team Room `#13` handoff comments; Backend still is not integration-ready until verification is green.
- live provider adapter/benchmark/bootstrap remains `NOT YET VERIFIED` and outside this Stage13E command.
- direct Question Bank persistence/publication remains Stage13F and is not implemented here.

### Cross-team dependencies/decisions

- Team Room `#13` received the stabilized Frontend contract handoff and CI infrastructure blocker.
- Team Room `#13` also received the semantic-review correction: no Frontend decision required; server `400/409` is authoritative.
- Integration Lead must verify same-head CI before marking Stage13E `VERIFIED`.
- Frontend must not infer lifecycle/review success locally; refresh server state after mutations/conflicts.

### NOT YET VERIFIED

- current-head lint/typecheck/unit/build after semantic-review changes;
- clean application of migration `0018_ai_admin_review.sql` on PostgreSQL;
- Stage13E authorization/secret-boundary/provenance/review-race/retry/control integration tests;
- semantic-review unit regression execution on current head;
- Stage12 execution/capacity/control/lifecycle regressions on current Stage13E head;
- auth security regression on current Stage13E head;
- live provider adapter/benchmark/bootstrap.

### Ready for integration

**NO** — implementation, stabilized Frontend contract and regression coverage are present, but required same-head verification is blocked by GitHub-hosted runner provisioning.

### Exact next action

1. Inspect the newest Stage13E workflow run for the latest docs/workstream head.
2. If GitHub provisions a runner, run the unchanged full gate and fix any real lint/type/schema/DB/test failure at its owning layer.
3. If runner allocation again reports `runner_id=0`/`steps=[]`, append that evidence to Issue `#14` without weakening CI.
4. Once a same-head run is green, update this file + Issue `#14` with exact results and issue the mandatory Stage13E Closure Report with `Ready for integration: YES`.
