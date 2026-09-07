# PROJECT STATUS

- **Current Phase:** Stage12 Durable Provider-Neutral AI Execution — execution core + distributed concurrency/backpressure **VERIFIED**; health/cooldown/budget implementation is **ACTIVE / NOT YET VERIFIED**; worker lifecycle remains pending.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Latest fully verified executable baseline:** `881102ff94711f908104cd068a003ad598609944`.
- **Current controls repair head:** pending commit above `3b4b98cbb7bb60a92146bb817d90df458e3862f4`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. Git auto-deployment remains intentionally disabled; hosted runtime is `NOT YET VERIFIED`.

## Verified baseline through Stage12 distributed backpressure

Stages 1–10, OCR, Stage11, Stage12 durable execution core and distributed capacity/backpressure are verified on one exact executable head.

Exact verified executable head: `881102ff94711f908104cd068a003ad598609944`.

- Stage12 AI Execution Verification `34007356406` — **SUCCESS**, including PostgreSQL distributed global/provider/project/model capacity races.
- Stage11 AI Contract Verification `34007356417` — **SUCCESS**.
- OCR Foundation Verification `34007356407` — **SUCCESS**.
- Stage10 Media Pipeline `34007356429` — **SUCCESS**.
- Stage9 Content Import Verification `34007356442` — **SUCCESS**.
- Rebuild Stage Verification `34007356410` — **SUCCESS** including Chromium.

Historical execution-core checkpoint remains `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

## Verified Stage12 execution + capacity behavior

Implemented and verified:

- reuse of existing `ai_jobs / ai_job_units / ai_outputs` rather than a parallel queue;
- additive `0012_ai_execution.sql` + `0013_ai_capacity_control.sql`;
- deterministic plan idempotency + fingerprint conflict detection;
- durable `FOR UPDATE SKIP LOCKED` unit claim;
- UUID lease token + expiry and stale-worker rejection;
- provider-neutral `AiProviderAdapter` + `AiModelRouter`;
- provider/network execution outside DB transactions;
- Stage11 validation before durable output acceptance;
- bounded cascade/retry/backoff/jitter;
- partial success + cancellation safety;
- distributed global/provider/project/model admission coordinated by PostgreSQL advisory transaction lock;
- capacity deferral via `resume_route_key` without consuming another semantic retry attempt;
- `capacity_deferred_count` telemetry;
- no silent escalation to a more expensive route merely because the intended route is at capacity.

## Current Stage12 health/cooldown/budget batch — implementation present, verification pending

The active batch adds:

- `database/migrations/0014_ai_execution_controls.sql`;
- singleton global execution control with kill switch + optional budget window;
- route runtime state keyed by full route identity (`route/provider/project/credential/model`), not by `route_key` alone;
- route kill switch;
- persisted route cooldown;
- Retry-After propagation to distributed cooldown state;
- consecutive retryable-failure health tracking with threshold cooldown;
- conservative global + route budget reservation windows checked before attempt creation;
- attempt-level global/route budget reservation telemetry;
- operational deferral using the existing `resume_route_key` without consuming semantic retry count;
- `control_deferred_count` + explicit control reason telemetry;
- PostgreSQL integration coverage for global/route kill switches, cooldown/Retry-After, race-safe global budget admission and route budget ceilings.

Budget semantics are intentionally conservative: configured per-attempt reservation is treated as a pre-call ceiling contribution, and admission sums `max(reservation, reported estimated cost)` inside the configured window. This is **not a claim of actual provider billing accuracy**; live pricing/billing remains `NOT YET VERIFIED` until authorized provider adapters and benchmark evidence exist.

## Evidence-backed controls failures/fixes

### Shared formatter gate

Initial controls head `8e525cc57f63caf806cae6ba17a43e26506191f6` failed Stage11 at Biome formatting/import ordering before typecheck/runtime. Formatting-only follow-up `3b4b98cbb7bb60a92146bb817d90df458e3862f4` fixed that gate.

### AI-012-013 — route runtime identity incorrectly assumed global `route_key` uniqueness

On `3b4b98cb…`, Stage11 passed lint/typecheck/unit/build. Stage12 passed lint/typecheck/unit/build, all clean migrations through `0014`, and the expanded PostgreSQL schema contract checks. The existing Stage12 lifecycle regression then failed with:

`ai_route_runtime_identity_mismatch:route-1`

Evidence: Stage12 run `34085847128`. The pre-controls lifecycle legitimately creates independent routers that reuse `route-1` for different provider/model identities. The controls table had used `route_key` alone as primary key, silently strengthening an existing contract.

Root-cause fix:

- keep `route_key` reusable across independent router configurations;
- use a surrogate UUID primary key for runtime state;
- enforce `UNIQUE NULLS NOT DISTINCT` over `route_key + provider_key + project_alias + credential_alias + model_used`;
- all cooldown/health/budget reads and writes match the full identity;
- route-budget usage also filters attempts by the full identity so two different routes sharing a display key never share a budget accidentally.

This fix is **NOT YET VERIFIED** until the same-head matrix passes.

## Stage12 invariants preserved

- no provider/network call occurs inside a DB transaction;
- no running unit exists without lease identity;
- stale/expired/cancelled workers cannot finalize attempts, units or outputs;
- cancellation clears current execution authority;
- operational backpressure/cooldown/budget blocks do not consume another semantic retry attempt;
- same idempotency key with a changed plan fingerprint is rejected;
- provider/model/project/credential fields remain execution metadata, not Stage11 domain contracts;
- provider secrets are not persisted;
- exact-source review requirements remain authoritative;
- partial successes survive sibling failures;
- direct-question Question Bank persistence remains unresolved and is not silently widened.

## Remaining Stage12 work

1. Verify the full-identity repair and current health/cooldown/Retry-After/budget/kill-switch batch; fix only evidence-backed failures.
2. Add explicit progress/resume semantics where needed by the Stage12 job contract.
3. Add a dedicated worker lifecycle separate from the HTTP server, with graceful shutdown and bounded polling.
4. Run real provider/model benchmark evidence before enabling production routes/defaults.
5. Keep live credentials, current pricing, actual provider billing, production routing and hosted worker runtime `NOT YET VERIFIED` until explicitly configured/tested.

Admin execution/query/cancel/review UI/API remains a Stage13 integration concern after the backend worker contract stabilizes.

## Stable lower-layer boundaries

- Stage9 canonical source inventory: 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR remains derived from ready media; only reviewed/approved OCR is downstream approved text evidence.
- Student auth/device rules from Stage6/8 remain unchanged.
- Current Question Bank persistence supports only `multiple_choice | true_false`; AI `direct` extraction remains reviewable output, not auto-publishable Question Bank data.

## Last build/test

**Last fully green executable head:** `881102ff94711f908104cd068a003ad598609944`.

**Latest evidence:** `3b4b98cbb7bb60a92146bb817d90df458e3862f4` — Stage11 SUCCESS; Stage12 reached existing PostgreSQL lifecycle after passing build/migrations/contracts, then exposed `AI-012-013`. Full-identity root-cause repair is the current batch.
