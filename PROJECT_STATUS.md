# PROJECT STATUS

- **Current Phase:** Stage12 Durable Provider-Neutral AI Execution backend lifecycle/runtime **VERIFIED**: durable core, distributed capacity/backpressure, health/cooldown/Retry-After/budget controls, explicit pause/resume/progress, centralized claim/lease recovery ownership, and bounded dedicated worker runtime.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Hosted Student/Admin/API/media/OCR/AI worker runtime remains `NOT YET VERIFIED`.

## Latest fully verified same-head matrix

Exact executable head: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

- Stage12 AI Execution Verification `34089764278` — **SUCCESS** including bounded worker lifecycle, execution lifecycle, capacity, controls, pause/resume/progress and paused-lease recovery.
- Stage11 AI Contract Verification `34089764339` — **SUCCESS**.
- OCR Foundation Verification `34089764349` — **SUCCESS** including real Tesseract.
- Stage10 Media Pipeline `34089764277` — **SUCCESS**.
- Stage9 Content Import Verification `34089764344` — **SUCCESS**.
- Rebuild Stage Verification `34089764467` — **SUCCESS** including Chromium.

Stage12 checkpoints:

- execution core: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`;
- distributed capacity/backpressure: `881102ff94711f908104cd068a003ad598609944`;
- distributed operational controls: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`;
- explicit pause/resume/progress: `8c8c03668921d8b4d873d1a0d3139c4eb1740ca9`;
- lifecycle ownership cleanup: `e7b95042a017ea558db9f769a46a37f155273a15`;
- bounded dedicated worker runtime: `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

## Verified Stage12 behavior

Verified through `0015_ai_job_lifecycle.sql` plus the process-level worker runtime:

- existing `ai_jobs / ai_job_units / ai_outputs` reused; no second queue;
- deterministic plan idempotency/fingerprint conflict detection;
- durable short `SKIP LOCKED` unit claims + UUID leases;
- stale/expired/cancelled workers cannot finalize attempts/units/outputs;
- provider calls remain outside DB transactions;
- Stage11 validation remains authoritative;
- bounded cascade/retry/backoff/jitter;
- cancellation + partial success;
- PostgreSQL-coordinated global/provider/project/model capacity;
- operational deferral does not consume another semantic retry or force expensive-route escalation;
- global + full-route kill switches;
- persisted Retry-After/health cooldown;
- conservative global + route budget admission;
- full route runtime identity = route + provider + project + credential + model;
- `ai_jobs.paused_at` is an operator scheduling gate separate from aggregate execution status;
- pause and claim serialize on the same job-row lock;
- pause blocks new claims without revoking an already valid in-flight lease;
- resume preserves accepted outputs, attempts, retry/backoff and route continuation;
- terminal completed/failed/cancelled jobs cannot resume;
- progress is server-derived from durable unit rows;
- expired non-exhausted leases are released to durable `retrying`, including while paused;
- `AiJobLifecycleRepository` is the single owner for job claim + expired-lease recovery;
- worker runtime uses fixed bounded slots and never prefetches a large in-memory batch;
- idle polling uses bounded exponential backoff and resets after useful work;
- graceful stop prevents new `processNext()` calls, wakes idle slots, lets in-flight calls drain under existing lease authority, then closes the database;
- unexpected worker processor failures are fail-fast rather than hidden in an infinite polling loop;
- abrupt process death remains recoverable through existing durable lease expiry logic.

Detailed contracts:

- `docs/ai/STAGE12_JOB_LIFECYCLE.md`;
- `docs/ai/STAGE12_WORKER_RUNTIME.md`;
- `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`.

## Worker verification evidence

`apps/api/tests/ai-worker.test.ts` proves:

- runtime concurrency never exceeds configured slots;
- shutdown starts no later claims;
- in-flight calls drain before database close;
- idle polling backs off to a configured ceiling;
- useful work resets idle backoff;
- unexpected processor failure stops the runtime and still closes resources;
- invalid/unbounded runtime settings are rejected.

Stage12 workflow then runs the same worker test explicitly before the PostgreSQL lifecycle/capacity/control/pause integration tests. All passed on `45a902eb…`.

## Explicit live-runtime boundary — NOT YET VERIFIED

Stage12 runtime closure does **not** invent production provider configuration. Still intentionally unverified:

- authorized live AI provider adapters/credentials;
- live benchmark-approved production routes/models;
- a production `worker.ts` bootstrap constructing those live adapters/routes;
- hosted worker deployment/runtime;
- current provider pricing and actual billing reconciliation.

A future live worker bootstrap should create the database/router/`AiExecutionService`, wire `SIGTERM/SIGINT` into the verified worker shutdown signal, and use `runAiWorkerProcess()` to close the database after drain. It must only be added when real provider configuration is authorized and benchmarked.

## Next ordered engineering work

1. Continue the post-Stage12 roadmap with curriculum structure extension / Stage13 backend preparation while preserving current contracts.
2. Run live provider/model benchmark evidence **before** any production AI route/model defaults or live AI worker bootstrap.
3. Resolve `direct` question persistence explicitly before Question Bank publish workflows depend on it.
4. Keep deployment/hosted runtime deferred until the Product Owner explicitly re-enables it.

## Stable lower-layer boundaries

- Stage9 source inventory: 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR derives only from ready media; only reviewed/approved OCR is downstream approved text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Question Bank currently persists only `multiple_choice | true_false`; AI `direct` extraction remains reviewable output, not auto-publishable data.
- configured AI budget reservations are safety ceilings, not proof of actual provider invoice accuracy.

## Repository housekeeping

A temporary branch named `tmp-unused-do-not-use` was accidentally created at the verified pause baseline while preparing the lifecycle ownership cleanup. It contains no unique code and is not referenced by PR #12. The connected GitHub tool exposes branch creation/update but not ref deletion, so deletion remains a **P3 repository-housekeeping item** instead of being hidden behind a workaround.

## Last verified build/test

**Last fully green executable head:** `45a902eb94cf574ebbcf29e1d0e9b2ca0ae6f894`.

**Stage12 backend lifecycle/runtime:** **VERIFIED**.

**Live provider bootstrap / hosted worker:** **NOT YET VERIFIED**.

**Deployment:** `DEFERRED BY PRODUCT OWNER`.
