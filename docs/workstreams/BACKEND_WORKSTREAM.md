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

**Protocol-synchronized starting HEAD:** `fe94731ec688fca2f1c40d96308ea680d31f7891`.

**Latest Integration Review:** Issue `#14` comment `5579170754`, reviewed `27da24b84d6769d673ab1bcb91f22a9829c0e64a`, decision `RETURN / CONTINUE` for a bounded contract/test/doc batch. Team Room decision `#13` comment `5579176219` requires Backend-owned action availability and preserves the raw/error secrecy boundaries.

**Current authority:** verified Stage11 semantic contracts + Stage12 durable execution/lifecycle. No second queue/lifecycle or browser-owned authority is introduced.

### Latest commits

Core Stage13E before latest Integration Review:

- `b8ba831aaee6800d806a50112daf183b68738005` — `feat(ai): add admin operations and review authority`
- `ff7f7bf6686dfb28a4d7229b29092b7e2cdaed65` — `fix(ai): bound admin retry semantics`
- `5e9d1c2596b0d7598a8b945704378dade9c80a0f` — `fix(ai): map retry attempt ceiling`
- `c3743772e21aa5879dfe335cf03f36b7c20b6467` — `fix(ai): align admin operations with Stage12 schema`
- `8e27c1a6a927dfc411be36a9156b32ee7507ec66` — `test(ai): verify Stage13E admin operations`
- `0b617538c84c4722c289ddbf6186d12c5ab6c27b` — `chore(api): satisfy Stage13E biome checks`
- `d40d0cc4853d492b623d5d4301fd0c2f6304c811` — `docs(ai): publish Stage13E Admin API contract`
- `99072af7631bf4f25197b4b4b1e2e27be8d7889e` — `docs(backend): record Stage13E implementation and CI blocker`
- `0c390432a8a0a93c821f45f1da3be92a31175862` — `fix(ai): validate Admin review semantics in owning transaction`
- `3e00f61638d41474fe3365af379213f36ecf2b93` — `test(ai): cover semantic Admin review validation`
- `3d48e8a85dcf3d3f771fef272ed2e2c7a1f0b736` — `docs(ai): enforce semantic review contract`
- `f0a3ebc2dbf21b152a0f43093b3c7a2fa1568461` — `docs(backend): record Stage13E semantic review fix`
- `96d5f993d5fcef142dac037d4b11bb208c25cd2f` — `fix(ai): clear pause in cancellation authority`
- `74a3781e754a76b441f93aedb19afd348c1cb779` — `test(ai): cover paused Admin cancellation`
- `27da24b84d6769d673ab1bcb91f22a9829c0e64a` — `fix(api): reject ambiguous AI review payloads`

Latest Integration-return batch:

- `e8f27e37e5563a85ce3747f0515b67f11102298c` — `feat(ai): derive Admin job action availability`
- `20a36eacdf6516339f68ff38f3ced8c339b29c0c` — `feat(ai): expose review action authority`
- `9056fd44dda3285e561d787833593c77d5380f8f` — `feat(ai): expose server-derived action availability`
- `5a9062c227132a3305d393aadd0dc91c1b875ede` — `fix(api): require exact AI review union`
- `1f2e26789989e43a92b790a212ea108727a5f87e` — `test(ai): cover Stage13E action authority contracts`
- `37559d2a0492dfc4dd10faa78bc984d03960a43f` — `ci(ai): include Stage13E action authority regression`
- `846169609d344d01a6056a22fc7634c86fcb31fb` — `docs(ai): synchronize Stage13E action authority contract`

### What was inspected

- latest Stage13E COMMAND/protocol in Backend Board `#14`;
- latest Integration Review `#14` comment `5579170754` before this batch;
- Team Room `#13`, especially Integration decision `5579176219`, before implementation;
- actual branch `backend/stage13e-ai-operations` at reviewed HEAD `27da24b8...`;
- `AiJobLifecycleRepository` pause/resume/retry/progress and hard attempt ceiling;
- Stage12 cancellation authority and the accepted `pause -> cancel` invariant;
- Stage11 semantic validator + Stage13E review validator;
- Admin AI read models, review HTTP boundary, current integration tests and Stage13E workflow;
- canonical Frontend contract `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`.

### What was implemented in the Integration-return batch

- `AiJobLifecycleRepository.getAllowedActions()` is now the server authority for Job Detail action availability.
- `GET /v1/admin/ai/jobs/:jobId` returns `job.allowedActions: Array<"pause" | "resume" | "cancel" | "retry">`.
- Active unpaused jobs advertise `pause,cancel`; paused jobs advertise `resume,cancel`.
- `retry` is advertised only for a failed job with at least one failed unit, no cancellation request, and no failed unit at attempt ceiling 20.
- Completed/cancelled and ineligible failed jobs advertise no actions.
- `GET /v1/admin/ai/outputs/:outputId` returns `allowedReviewActions: Array<"edit" | "approve" | "reject">`.
- Terminal approve/reject exposes no review actions.
- Open review exposes edit/reject; approve is advertised only when the current candidate passes the same Stage11 semantic authority used by approval (`valid` or `review_required`, not `invalid`).
- Review HTTP body is an exact strict discriminated union; edit requires non-`undefined` `editedOutput`, approve cannot carry `editedOutput`, reject requires a nonblank trimmed reason, and unknown fields are rejected.
- Raw provider response and provider/internal error-message boundaries remain unchanged: only `hasRawResponse`, safe `errorCode` and `lastErrorCode` are exposed.
- `pause -> cancel` invariant remains in owning Stage12 cancellation authority: cancellation atomically clears `paused_at`.
- New independent PostgreSQL integration regression `ai-admin-action-authority.integration.test.ts` covers the Integration Review matrix and is wired into the full Stage13E workflow.
- Canonical Frontend contract is synchronized with exact request and action-availability semantics.

### Contracts/schema/endpoints changed

No new migration beyond existing Stage13E `database/migrations/0018_ai_admin_review.sql`.

Existing endpoints are unchanged, but read response contracts are extended:

- `GET /v1/admin/ai/jobs/:jobId` -> `job.allowedActions`.
- `GET /v1/admin/ai/outputs/:outputId` -> `output.allowedReviewActions`.
- `PATCH /v1/admin/ai/outputs/:outputId/review` -> exact strict discriminated request union documented in `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`.

Mutation endpoints remain canonical and may still return `409`; Frontend must refresh after conflict.

### Tests and exact results

Workflow: `Stage 13E Admin AI Operations Verification`.

Historical executable run `34184515829` reached a GitHub-hosted runner/PostgreSQL and failed only at initial Biome hygiene; the source hygiene was fixed in `0b617538...` without weakening CI.

Repeated post-fix runs, including Integration-reviewed run `34186560937` on `27da24b8...`, failed before checkout with `runner_id=0`, empty runner name and `steps=[]`. That is infrastructure evidence, not product PASS/FAIL.

New committed regression `apps/api/tests/integration/ai-admin-action-authority.integration.test.ts` covers:

- active/paused/resumed/cancelled Job Detail action arrays;
- retry advertised only when lifecycle preconditions are satisfied;
- retry not advertised at attempt ceiling, with cancellation requested, or with no failed unit;
- output review actions before terminal review;
- empty review actions after approve/reject;
- strict HTTP matrix: `approve + editedOutput -> 400`, edit missing output -> `400`, reject missing/blank reason -> `400`, unknown field -> `400`;
- rejected strict bodies create zero review events.

The workflow now runs this regression in addition to the existing Stage13E integration test. **These latest-head tests have not yet been observed executing on a hosted runner.**

### Failures + root causes + fixes

#### Failure 1 — nonexistent job-level failure columns

Symptom: early Stage13E projected `ai_jobs.failure_code/failure_message` that do not exist.

Root cause: unverified duplicate job-level error shape instead of Stage12 unit/attempt authority.

Affected invariant/contract: schema correctness + single state authority.

Blast radius: PostgreSQL list/retry failure.

Fix location and why: Stage13E Admin query layer; nonexistent fields removed, unit/attempt error codes retained as authority.

Regression test: clean PostgreSQL Stage13E integration coverage.

#### Failure 2 — Admin retry budget / ceiling

Symptom: manual retry needed exactly one new attempt and hard ceiling 20.

Root cause: generic retry growth did not encode the Admin contract precisely.

Affected invariant/contract: bounded retries + attempt history.

Blast radius: excess retry budget or constraint failure.

Fix location and why: `AiJobLifecycleRepository.requestRetry`, the existing lifecycle authority.

Regression test: one-attempt extension, history preservation, exhausted retry unchanged; latest action-availability test also ensures ineligible retry is not advertised.

#### Failure 3 — semantic review bypass

Symptom: a schema-valid manual edit could bypass Stage11 semantic rules.

Root cause: structural schema validation was initially treated as sufficient.

Affected invariant/contract: Stage11 semantic/provenance authority.

Blast radius: invalid content could be manually approved.

Fix location and why: shared Stage11 validation reused inside the owning review transaction; no weaker parallel validator.

Regression test: semantic edit/approve unit regressions; output action availability uses the same semantic authority.

#### Failure 4 — paused cancellation stale gate

Symptom: Stage13E Admin cancel initially called `AiExecutionRepository.requestCancel` without Stage12 service-level `clearPause`, so a paused job could become terminal while retaining `paused_at`.

Root cause: cancellation invariant was split between repository and one service caller.

Affected invariant/contract: terminal lifecycle state must not retain an active pause gate.

Blast radius: stale canonical lifecycle metadata and misleading Admin state.

Fix location and why: owning `AiExecutionRepository.requestCancel` now clears `paused_at` atomically with cancellation, protecting every caller.

Regression test: `pause -> cancel` asserts API `pausedAt=null` and PostgreSQL `paused_at IS NULL` (`74a3781e...`).

#### Failure 5 — ambiguous review HTTP body

Symptom: `approve` could receive an `editedOutput` that would be ignored, and the generic documented shape implied optional fields across all actions.

Root cause: request contract was not encoded/documented as an exact discriminated union.

Affected invariant/contract: explicit mutation intent and no silently ignored write payload.

Blast radius: Frontend/backend ambiguity and unsafe operator expectations.

Fix location and why: strict Zod discriminated union at the HTTP boundary; canonical contract updated to match it exactly.

Regression test: dedicated strict HTTP matrix with zero-event side-effect assertion.

#### Failure 6 — action-availability authority gap

Symptom: Frontend was forbidden from deriving action permissions from enums, while Backend read models did not expose permissions.

Root cause: mutation transition authority existed, but no server-derived read projection exposed its current availability.

Affected invariant/contract: server/PostgreSQL must own lifecycle/review permissions; browser must not duplicate them.

Blast radius: Frontend would either guess actions or maintain a duplicate permission table that could drift from mutations.

Fix location and why: job availability is derived in `AiJobLifecycleRepository`; review availability reuses the same Stage11 review validation authority as mutation. Read arrays contain action identifiers only, no presentation strings.

Regression test: dedicated action-authority integration test covering positive/negative lifecycle and terminal review cases.

#### Failure 7 — GitHub-hosted runner provisioning blocker

Symptom: repeated jobs terminate before checkout with `runner_id=0` and `steps=[]`.

Root cause: no hosted runner is provisioned; available repo-level evidence does not expose a narrower billing/quota/platform diagnosis, so none is assumed.

Affected invariant/contract: required same-head verification availability, not application behavior.

Blast radius: latest lint/typecheck/unit/build/PostgreSQL/integration/regression status cannot be established.

Fix location and why: external CI/account/platform layer; workflow/product tests are not weakened or skipped.

Regression test: unchanged full Stage13E workflow must execute and be green on the latest head.

### Open issues/blockers

- **BLOCKER:** same-head full verification is still required; inspect newest workflow evidence after the latest code/docs commits.
- Stage13F Question Bank persistence/publication remains explicitly outside Stage13E.
- Live production provider adapter/benchmark/bootstrap remains `NOT YET VERIFIED` and outside this command.

### Cross-team dependencies/decisions

- Team Room `#13` Integration decision `5579176219` is implemented: raw/error secrecy boundaries preserved and Backend now exposes server-derived action availability.
- Frontend may bind to the canonical contract but must never infer successful transition after `409`; refresh canonical state.
- No Frontend presentation strings are returned by Backend action availability.
- Integration Lead must not mark Stage13E `VERIFIED` until same-head full gate is green.

### NOT YET VERIFIED

- latest-head lint;
- latest-head strict typecheck;
- latest-head unit tests;
- latest-head build;
- clean PostgreSQL application of migration `0018_ai_admin_review.sql`;
- existing Stage13E authorization/secret/provenance/review-race/retry/control integration regression;
- new strict-body/action-authority PostgreSQL integration regression;
- Stage12 execution/capacity/control/lifecycle regressions on latest Stage13E head;
- auth security regression on latest Stage13E head;
- live provider adapter/benchmark/bootstrap.

### Ready for integration

**NO** — the Integration-return contract/test/doc batch is implemented, but Closure requires the unchanged full same-head verification gate to actually execute green.

### Exact next action

1. Inspect the newest `Stage 13E Admin AI Operations Verification` run for the latest branch head.
2. If a runner is allocated, fix any real lint/typecheck/schema/PostgreSQL/test failure at its owning layer until all required gates are green.
3. If runner allocation is still `runner_id=0`/`steps=[]`, record exact evidence in Issue `#14` and Team Room as an infrastructure blocker without weakening CI.
4. When same-head full verification is green, update this file and Issue `#14`, then issue the mandatory Stage13E Closure Report with `Ready for integration: YES`.
