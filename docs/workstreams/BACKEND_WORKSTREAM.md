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

### What was inspected

- mandatory repository documentation and operating model;
- Backend Board `#14` COMMAND + protocol amendment;
- Team Room `#13`, including Frontend Stage13E contract blocker;
- Stage11 generation contracts and validators;
- Stage12 job/unit/attempt/output migrations and execution repository/service;
- Stage12 lease, pause/resume/cancel, retry/capacity/control semantics and PostgreSQL integration tests;
- existing Fastify/Zod Admin HTTP/auth patterns;
- app registration/CORS/public error envelope;
- current migration chain through `0017_content_ingestion_publication.sql` before adding Stage13E migration;
- current Stage13E implementation/test/workflow after every pushed batch.

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
- review does not mutate raw/normalized AI output and does not publish to Stage13F Question Bank;
- specialized Frontend-facing contract: `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`;
- dedicated Stage13E GitHub Actions workflow and PostgreSQL integration coverage, plus Stage12/auth regressions.

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
- CI was re-triggered.

Run `34185062185` on `0b617538c84c4722c289ddbf6186d12c5ab6c27b`:

- attempts 1, 2 and 3 all failed **before any runner was provisioned**;
- GitHub job evidence: `runner_id=0`, `runner_name=""`, `steps=[]`;
- therefore no source/test command executed in those attempts.

A later documentation push also re-triggered the workflow; its result must be inspected before closure.

### Failures + root causes + fixes

#### Failure 1 — Stage13E code referenced nonexistent job-level failure columns

Symptom: inspection found Stage13E list/retry queries referencing `ai_jobs.failure_code` / `failure_message` even though Stage12 schema owns execution errors at unit/attempt level.

Root cause: initial Stage13E implementation projected an unverified job-level error shape instead of using actual Stage12 persistence.

Affected invariant/contract: no duplicate lifecycle/state authority; schema correctness.

Blast radius: job list/retry would fail on PostgreSQL despite TypeScript compiling.

Fix location and why: `apps/api/src/ai/admin-operations.ts` / lifecycle integration; removed the nonexistent job columns rather than adding duplicate state, preserving `ai_job_units.last_error_code` + attempt `error_code` as owning authority.

Regression test: Stage13E clean PostgreSQL/list/retry integration test is present but current-head execution remains blocked by hosted-runner provisioning.

#### Failure 2 — Admin retry could exceed DB attempt ceiling / grant unintended retry budget

Symptom: retry logic needed explicit handling at Stage12 hard max 20 and must not restore an old multi-attempt budget.

Root cause: generic `greatest(max_attempts, attempt_count + 1)` semantics did not encode the intended Admin action precisely.

Affected invariant/contract: bounded retries and historical attempt integrity.

Blast radius: failed jobs near the hard ceiling could hit a DB constraint or receive more retry budget than the Admin requested.

Fix location and why: existing `AiJobLifecycleRepository.requestRetry`; precheck all failed units for `attempt_count >= 20`, then set `max_attempts = attempt_count + 1`. No second retry queue was introduced.

Regression test: integration test asserts one-attempt extension, preserved attempt history and unchanged state on exhausted retry.

#### Failure 3 — Initial Stage13E CI lint failure

Symptom: run `34184515829` stopped at Biome before typecheck/build/PostgreSQL gates.

Root cause: formatting/import ordering and one unused import in newly created Stage13E source/test files.

Affected invariant/contract: repository quality gate only; no product lifecycle invariant.

Blast radius: prevented later verification gates from running.

Fix location and why: source/test formatting and imports corrected in commit `0b617538...`; CI was not weakened and no `--write` workaround was added to the verification workflow.

Regression test: same lint command remains in Stage13E workflow.

#### Failure 4 — GitHub-hosted runner provisioning blocker

Symptom: run `34185062185`, attempts 1/2/3, ended in seconds with no workflow steps.

Root cause: GitHub did not provision a hosted runner; evidence is `runner_id=0`, empty runner name and `steps=[]`. This occurred before checkout, service initialization or any repository command.

Affected invariant/contract: verification availability, not product code.

Blast radius: current-head lint/typecheck/unit/build/clean PostgreSQL/integration/regression results cannot be established yet.

Fix location and why: external CI infrastructure; product code/test harness must not be weakened to hide it. Re-runs were attempted and the blocker is being recorded for Integration/Team Room visibility.

Regression test: rerun the unchanged Stage13E workflow when GitHub allocates a runner; require same-head green before Ready.

### Open issues/blockers

- **BLOCKER:** current Stage13E same-head CI cannot complete while GitHub-hosted runner allocation returns `runner_id=0`/no steps.
- Frontend contract blocker is addressed by `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`; Frontend may implement transport against that documented contract, but Backend is not yet integration-ready until verification is green.
- live provider adapter/benchmark/bootstrap remains `NOT YET VERIFIED` and is outside this Stage13E command.
- direct Question Bank persistence/publication remains Stage13F and is not implemented here.

### Cross-team dependencies/decisions

- Team Room `#13` must receive the stabilized Frontend contract handoff and the CI infrastructure blocker.
- Integration Lead must verify same-head CI before marking Stage13E `VERIFIED`.
- No Frontend inference of lifecycle permissions or review persistence is required; the contract document now defines server behavior.

### NOT YET VERIFIED

- current-head lint/typecheck/unit/build after Biome fix;
- clean application of migration `0018_ai_admin_review.sql` on PostgreSQL;
- Stage13E authorization/secret-boundary/provenance/review-race/retry/control integration tests;
- Stage12 execution/capacity/control/lifecycle regressions on current Stage13E head;
- auth security regression on current Stage13E head;
- live provider adapter/benchmark/bootstrap.

### Ready for integration

**NO** — implementation and contract are present, but required same-head verification is blocked by GitHub-hosted runner provisioning.

### Exact next action

1. Inspect the newest Stage13E workflow run created by the documentation/workstream pushes.
2. If GitHub provisions a runner, let the unchanged full verification gate run and fix any real source/schema/test failure at its owning layer.
3. If runner allocation again reports `runner_id=0`/`steps=[]`, record the new evidence in Team Room `#13` and Backend Board `#14` without weakening CI.
4. After a same-head green run, update this file + Issue `#14` with exact successful results and issue the Stage13E Closure Report / `Ready for integration: YES`.
