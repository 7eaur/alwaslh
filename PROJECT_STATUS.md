# PROJECT STATUS

- **Current Phase:** Stage12 Durable Provider-Neutral AI Execution — core + distributed capacity/backpressure + health/cooldown/Retry-After/budget controls + explicit job pause/resume/progress **VERIFIED**; dedicated bounded worker runtime **IMPLEMENTED / VERIFICATION PENDING**.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `e7b95042a017ea558db9f769a46a37f155273a15`.
- **Pause/resume closure head:** `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`.
- **Lifecycle ownership cleanup:** `e7b95042a017ea558db9f769a46a37f155273a15` — removed obsolete duplicate claim/expired-lease recovery implementations from `AiExecutionRepository`; `AiJobLifecycleRepository` is the single owner.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Git auto-deployment remains intentionally disabled; hosted runtime is `NOT YET VERIFIED`.

## Latest fully verified same-head matrix

Exact executable head: `e7b95042a017ea558db9f769a46a37f155273a15`.

- Stage12 AI Execution Verification `34089070993` — **SUCCESS** including existing lifecycle, distributed capacity, operational controls, pause/resume/progress and paused-lease recovery.
- Stage11 AI Contract Verification `34089071172` — **SUCCESS**.
- OCR Foundation Verification `34089070998` — **SUCCESS** including real Tesseract.
- Stage10 Media Pipeline `34089071005` — **SUCCESS**.
- Stage9 Content Import Verification `34089071023` — **SUCCESS**.
- Rebuild Stage Verification `34089071001` — **SUCCESS** including Chromium.

Earlier Stage12 checkpoints:

- execution core: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`;
- distributed capacity/backpressure: `881102ff94711f908104cd068a003ad598609944`;
- distributed operational controls: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`;
- explicit pause/resume/progress behavior: `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`.

## Verified Stage12 behavior

Verified through `0015_ai_job_lifecycle.sql`:

- existing `ai_jobs / ai_job_units / ai_outputs` reused; no parallel queue;
- deterministic plan idempotency/fingerprint conflict detection;
- durable short `SKIP LOCKED` unit claims + UUID leases;
- stale/expired/cancelled workers cannot finalize attempts/units/outputs;
- provider calls remain outside DB transactions;
- Stage11 validation remains authoritative;
- bounded cascade/retry/backoff/jitter;
- cancellation + partial success;
- PostgreSQL-coordinated global/provider/project/model capacity;
- capacity/control deferral does not consume another semantic retry;
- global and full-route kill switches;
- persisted Retry-After/health cooldown;
- conservative global + route budget admission;
- full route runtime identity: route + provider + project + credential + model;
- no operational pressure causes silent expensive-route escalation;
- `ai_jobs.paused_at` is an operator scheduling gate separate from aggregate execution status;
- pause and claim serialize on the same job-row lock;
- pause stops new claims without revoking an already valid in-flight lease;
- resume preserves accepted outputs, attempt counts, retry/backoff and route continuation;
- terminal completed/failed/cancelled jobs cannot resume;
- progress is derived from durable unit rows;
- expired non-exhausted leases are released to durable `retrying`, including while the job is paused;
- job claim and expired-lease recovery ownership is centralized in `AiJobLifecycleRepository`.

Budget reservation remains a safety ceiling, not proof of actual provider billing. Live pricing/billing evidence is `NOT YET VERIFIED`.

Detailed lifecycle contract: `docs/ai/STAGE12_JOB_LIFECYCLE.md`.

## Current isolated batch — dedicated worker runtime

Implementation is being added under `apps/api/src/ai/worker-runtime.ts` and is **NOT YET VERIFIED** until the Stage12 + lower-layer matrix passes on one exact implementation head.

Architecture:

```text
standalone future worker bootstrap
→ fixed worker slots
→ one AiExecutionService.processNext() per slot at a time
→ durable PostgreSQL claim/lease/admission
→ provider call outside DB transaction
→ durable result
→ next unit or bounded idle sleep/backoff
```

Runtime rules:

- `apps/api/src/server.ts` remains HTTP-only; no queue polling is embedded in Fastify;
- slot count is fixed/bounded; no large in-memory prefetch batch;
- empty queue polling backs off to a configured ceiling and resets after useful work;
- graceful stop aborts idle sleeps and prevents new `processNext()` calls;
- in-flight `processNext()` calls are not aborted and drain under their existing lease authority;
- database close happens after slots drain;
- unexpected processor errors are fail-fast: stop new claims, drain other in-flight slots, close resources, rethrow;
- abrupt process death is recovered by existing Stage12 lease-expiry logic;
- no fake provider route/credential/bootstrap is added merely to claim production readiness.

Detailed runtime contract: `docs/ai/STAGE12_WORKER_RUNTIME.md`.

## Verification gates for current worker batch

Stage12 must prove:

- fixed concurrent slots never exceed configured runtime concurrency;
- stop signal prevents subsequent claims;
- in-flight calls drain before database close;
- idle polling has bounded exponential backoff;
- useful work resets idle polling delay;
- unexpected processor failure stops the runtime and still closes resources;
- invalid/unbounded worker settings are rejected;
- existing PostgreSQL execution/capacity/control/pause regressions remain green;
- Stage11/OCR/Stage10/Stage9/Full Rebuild + Chromium remain green on the same exact head.

Until those gates pass: **dedicated worker runtime = NOT YET VERIFIED**.

## Explicit live-runtime boundary

Still `NOT YET VERIFIED` and intentionally not invented:

- authorized live AI provider adapters/credentials;
- benchmark-approved production routes/models;
- production `worker.ts` bootstrap constructing those routes/adapters;
- hosted worker deployment/runtime;
- current provider pricing and actual billing reconciliation.

A future live worker bootstrap will wire `SIGTERM/SIGINT` into the verified runtime shutdown signal only after real provider configuration is authorized and benchmarked.

## Remaining Stage12 work

1. Run/fix the dedicated worker runtime batch until Stage12 + Stage11 + OCR + Stage10 + Stage9 + Full Rebuild/Chromium are green on one exact head.
2. Close worker documentation with exact commit/run evidence.
3. Run real provider/model benchmark evidence before any production route/model defaults or live bootstrap.
4. Keep credentials, current pricing, actual provider billing and hosted worker runtime `NOT YET VERIFIED` until explicitly configured/tested.

Admin AI execution/query/cancel/review UI/API remains Stage13 integration after Stage12 backend lifecycle/runtime stability.

## Stable lower-layer boundaries

- Stage9 source inventory: 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR derives only from ready media; only reviewed/approved OCR is downstream approved text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Question Bank currently persists only `multiple_choice | true_false`; AI `direct` extraction remains reviewable output, not auto-publishable data.

## Repository housekeeping

A temporary branch named `tmp-unused-do-not-use` was accidentally created at the verified pause baseline while preparing the cleanup commit. It contains no unique code and is not referenced by PR #12. The connected GitHub tool exposes branch creation/update but not ref deletion, so branch deletion remains a **P3 repository-housekeeping item** rather than being hidden or force-worked-around.

## Last verified build/test

**Last fully green executable head:** `e7b95042a017ea558db9f769a46a37f155273a15`.

**Current implementation state:** dedicated worker runtime implementation in progress / verification pending. Deployment remains deferred.
