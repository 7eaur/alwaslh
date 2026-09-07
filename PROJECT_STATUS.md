# PROJECT STATUS

- **Current Phase:** Stage12 Durable Provider-Neutral AI Execution — execution core + distributed concurrency/backpressure + health/cooldown/Retry-After/budget controls **VERIFIED**; explicit job pause/resume/progress is the active next batch; worker lifecycle follows.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Git auto-deployment remains intentionally disabled; hosted runtime is `NOT YET VERIFIED`.

## Verified baseline through Stage12 operational controls

Stages 1–10, OCR, Stage11, Stage12 durable execution core, distributed capacity/backpressure and distributed operational controls are verified on one exact executable head.

Exact verified executable head: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

- Stage12 AI Execution Verification `34086168715` — **SUCCESS**, including lifecycle, distributed capacity races, global/route kill switches, Retry-After cooldown and global/route budget ceilings.
- Stage11 AI Contract Verification `34086168704` — **SUCCESS**.
- OCR Foundation Verification `34086168712` — **SUCCESS**, including real Tesseract lifecycle.
- Stage10 Media Pipeline `34086168727` — **SUCCESS**.
- Stage9 Content Import Verification `34086168687` — **SUCCESS**.
- Rebuild Stage Verification `34086168772` — **SUCCESS** including Chromium activation/login/recovery flow.

Earlier verified checkpoints:

- execution core: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`;
- distributed capacity/backpressure: `881102ff94711f908104cd068a003ad598609944`.

## Verified Stage12 execution + operational behavior

Implemented and verified:

- reuse of existing `ai_jobs / ai_job_units / ai_outputs` rather than a parallel queue;
- additive `0012_ai_execution.sql`, `0013_ai_capacity_control.sql`, `0014_ai_execution_controls.sql`;
- deterministic plan idempotency + fingerprint conflict detection;
- durable `FOR UPDATE SKIP LOCKED` unit claim;
- UUID lease token + expiry and stale-worker rejection;
- provider-neutral `AiProviderAdapter` + `AiModelRouter`;
- provider/network execution outside DB transactions;
- Stage11 validation before durable output acceptance;
- bounded cascade/retry/backoff/jitter;
- partial success + cancellation safety;
- distributed global/provider/project/model capacity coordinated by PostgreSQL advisory transaction lock;
- capacity deferral via `resume_route_key` without consuming another semantic retry attempt;
- singleton global kill switch;
- route kill switch keyed by full route identity;
- persisted Retry-After / health cooldown;
- consecutive retryable-failure threshold cooldown;
- conservative global + route budget reservation windows checked before attempt creation;
- attempt-level global/route budget reservation telemetry;
- `capacity_deferred_count` + `control_deferred_count` operational telemetry;
- no silent escalation to a more expensive route merely because the intended route is capacity/cooldown/budget blocked.

Budget semantics remain conservative: configured per-attempt reservation is treated as a pre-call ceiling contribution, and admission sums `max(reservation, reported estimated cost)` inside the configured window. This is **not actual provider billing proof**; live pricing/billing remains `NOT YET VERIFIED` until authorized provider adapters and benchmark evidence exist.

## Evidence-backed control defects closed

### Shared formatter gate

Initial controls head `8e525cc57f63caf806cae6ba17a43e26506191f6` failed Stage11 at Biome formatting/import ordering before typecheck/runtime. Formatting-only follow-up `3b4b98cbb7bb60a92146bb817d90df458e3862f4` fixed that gate.

### AI-012-013 — route runtime identity

On `3b4b98cb…`, Stage12 passed lint/typecheck/unit/build, clean migrations through `0014`, and schema contract checks. Existing lifecycle then failed with `ai_route_runtime_identity_mismatch:route-1` because runtime control state incorrectly treated `route_key` as globally unique, while independent routers legitimately reused it for different providers/models.

Root-cause fix on `7c3c5645…`:

- surrogate UUID primary key for runtime route state;
- `UNIQUE NULLS NOT DISTINCT` over `route_key + provider_key + project_alias + credential_alias + model_used`;
- all health/cooldown/budget reads and writes match full route identity;
- route-budget usage filters attempts by the same full identity.

The original lifecycle test was not weakened or renamed. It passed unchanged, and the complete same-head matrix is green.

## Stage12 invariants preserved

- no provider/network call occurs inside a DB transaction;
- no running unit exists without lease identity;
- stale/expired/cancelled workers cannot finalize attempts, units or outputs;
- cancellation clears current execution authority;
- capacity/cooldown/budget blocks do not consume another semantic retry attempt;
- same idempotency key with a changed plan fingerprint is rejected;
- provider/model/project/credential fields remain execution metadata, not Stage11 domain contracts;
- provider secrets are not persisted;
- exact-source review requirements remain authoritative;
- partial successes survive sibling failures;
- direct-question Question Bank persistence remains unresolved and is not silently widened;
- actual provider billing is never inferred from configured reservation telemetry.

## Active next Stage12 batch — pause/resume/progress

Repository review confirms current `ai_job_status` is only `queued | running | retrying | completed | failed | cancelled`. `resume_route_key` is internal route continuation and must not be misrepresented as user/job resume.

Next batch must add explicit job-level pause/resume/progress semantics while preserving:

- cancellation as terminal;
- no new claims while paused;
- in-flight workers keep lease authority to safely finish or fail;
- resume must not reset successful units or consume retries;
- progress is server-derived from durable units, never client-authoritative.

After this batch: dedicated AI worker process separate from `server.ts`, with bounded polling and graceful drain.

## Remaining Stage12 work

1. Implement and verify explicit pause/resume/progress semantics.
2. Add dedicated worker lifecycle separate from HTTP server, with bounded polling + graceful shutdown/drain.
3. Run real provider/model benchmark evidence before enabling production routes/defaults.
4. Keep live credentials, current pricing, actual provider billing, production routing and hosted worker runtime `NOT YET VERIFIED` until explicitly configured/tested.

Admin execution/query/cancel/review API/UI remains a Stage13 integration concern after the backend worker contract stabilizes.

## Stable lower-layer boundaries

- Stage9 canonical source inventory: 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR remains derived from ready media; only reviewed/approved OCR is downstream approved text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Current Question Bank persistence supports only `multiple_choice | true_false`; AI `direct` extraction remains reviewable output, not auto-publishable Question Bank data.

## Last build/test

**Last fully green executable head:** `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

**Current next step:** explicit job pause/resume/progress, then worker lifecycle. Deployment remains deferred.
