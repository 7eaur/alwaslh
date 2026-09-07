# PROJECT HANDOFF — الوسيلة الذكية

> Source of truth: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → Product decisions → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → parity/coverage docs → roadmap. Repository + CI evidence are authoritative.

## Product / repository state

- Product: Arabic educational platform with independent Student PWA, Admin Web and Backend API.
- Repository: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Latest fully verified executable baseline: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.
- Stage11 Provider-Neutral AI Prompt / Output Contracts: **VERIFIED**.
- Stage12 durable AI execution core: **VERIFIED**.
- Stage12 distributed global/provider/project/model backpressure: **VERIFIED**.
- Stage12 global/route kill switch + health/cooldown/Retry-After + budget admission: **VERIFIED**.
- Active Stage12 work: explicit job pause/resume/progress semantics, then dedicated worker lifecycle.
- Deployment: `DEFERRED BY PRODUCT OWNER`; Git auto-deploy remains disabled. Hosted behavior is `NOT YET VERIFIED` until explicitly re-enabled and tested.

## Stable architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── Stage10 media identity/storage abstraction
                   ├── reviewed OCR text / OCR Foundation
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable AI execution + distributed admission/control
                   └── later TTS / notifications / offline sync
```

Hard boundaries:

- browser never receives DB/provider secrets or performs authoritative business writes directly;
- auth/authorization/entitlements are server-owned;
- upload/media success is independent from OCR/AI/TTS;
- source media + reviewed OCR remain canonical evidence;
- provider/model payloads stay behind adapters;
- provider calls happen outside DB transactions;
- stale/expired/cancelled workers cannot finalize attempts, units or outputs;
- no credential/project switching to evade provider quotas/terms;
- no valuable legacy capability is removed without Product Owner approval.

## Exact verified checkpoint

Executable head `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`:

- Stage12 AI Execution Verification `34086168715` — **SUCCESS** including lifecycle, distributed capacity races, kill switches, Retry-After cooldown, global budget race and route budget ceiling.
- Stage11 AI Contract Verification `34086168704` — **SUCCESS**.
- OCR Foundation Verification `34086168712` — **SUCCESS** including real Tesseract.
- Stage10 Media Pipeline `34086168727` — **SUCCESS**.
- Stage9 Content Import Verification `34086168687` — **SUCCESS**.
- Rebuild Stage Verification `34086168772` — **SUCCESS** including Chromium.

This exact head is the current rollback/reference point.

## Verified Stage12 execution / backpressure / operational controls

Implemented through `7c3c5645…`:

- additive `0012_ai_execution.sql`, `0013_ai_capacity_control.sql`, `0014_ai_execution_controls.sql`;
- deterministic plan idempotency + fingerprint conflicts;
- durable `SKIP LOCKED` unit claim;
- UUID leases + strong running-lease DB shape;
- attempt history/telemetry;
- `AiProviderAdapter` / `AiModelRouter`;
- provider calls outside transactions;
- Stage11 validation before acceptance;
- bounded cascade + retry/backoff/jitter;
- stale-worker recovery;
- cancellation + stale-write rejection;
- partial-success reconciliation;
- PostgreSQL-coordinated global/provider/project/model capacity;
- capacity/control deferral through `resume_route_key` without extra semantic attempt consumption;
- global and per-route kill switches;
- persisted Retry-After/health cooldown;
- global and exact-route budget reservation windows;
- `capacity_deferred_count` and `control_deferred_count` telemetry;
- operational pressure never silently escalates just because another route has room.

### Route runtime identity rule

Do **not** assume `route_key` is globally unique. Independent routers may reuse a route key. Operational state is keyed by the full identity:

```text
route_key
+ provider_key
+ provider_project_alias
+ credential_alias
+ model_used
```

Migration `0014` enforces this using a surrogate UUID PK plus `UNIQUE NULLS NOT DISTINCT` over the full identity. Cooldown/health/budget reads and route-budget attempt accounting all use the same full identity.

This rule exists because controls head `3b4b98cbb7bb60a92146bb817d90df458e3862f4` exposed `ai_route_runtime_identity_mismatch:route-1` in the unchanged Stage12 lifecycle. Root-cause repair `7c3c5645…` restored compatibility and all same-head workflows passed.

## Budget evidence boundary

Budget admission is deliberately conservative:

- configured pre-call reservation is persisted on the attempt;
- window usage counts `max(reservation, reported estimated cost)`;
- admission refuses a new attempt if its reservation would exceed the configured ceiling.

This is **not** proof of actual provider invoice accuracy. Live pricing, token ceilings, billing reconciliation and production budget values remain `NOT YET VERIFIED` until authorized provider adapters + benchmark evidence exist.

## Stage12 invariants

- no provider/network call in DB transaction;
- no running unit without lease identity;
- no stale lease may write attempt completion, unit completion/failure or outputs;
- cancel removes current execution authority;
- same idempotency key with different plan fingerprint is rejected;
- provider/model fields remain execution metadata, not Stage11 domain contract fields;
- provider secrets are server-only and not stored;
- exact-source review rules remain authoritative;
- invalid output retries only inside max attempts;
- review-required output stays review-required instead of inventing certainty;
- partial success preserves completed units;
- capacity/cooldown/budget deferral does not consume another semantic retry;
- cascade is bounded and may not rotate credentials/projects to evade limits.

## Active next batch — explicit pause/resume/progress

`database/migrations/0004_ai_and_sync.sql` currently defines `ai_job_status` as:

`queued | running | retrying | completed | failed | cancelled`.

`resume_route_key` is an internal execution-route continuation field. It is **not** job-level resume and must never be presented as such.

The next batch must provide explicit job lifecycle semantics:

1. pause stops **new claims** for that job;
2. an already leased/in-flight unit keeps its lease and can safely finish/fail;
3. resume makes unfinished queued/retrying units claimable again without resetting accepted outputs or attempt counts;
4. cancelled/completed terminal jobs cannot be resumed;
5. progress is server-derived from durable unit states and exposes accepted/failed/running/retrying/queued totals;
6. behavior must be race-tested with an in-flight provider call.

## Worker lifecycle after pause/resume

`apps/api/src/server.ts` is HTTP-only and performs Fastify shutdown. The AI worker must be a **separate process/runtime**, not a polling loop embedded in the HTTP server.

Worker requirements:

- bounded worker slots;
- bounded idle polling/backoff;
- graceful shutdown stops new claims first;
- in-flight provider work drains normally while lease authority is valid;
- process death remains recoverable through existing lease expiry logic;
- database closes only after worker drain;
- no huge in-memory batch state.

A live provider bootstrap is still `NOT YET VERIFIED`; do not invent provider credentials/configuration just to make an entrypoint look complete.

## Direct-question boundary

Stage11 preserves `direct` extraction. Current `0003_learning.sql` Question Bank persists only `multiple_choice | true_false`. Direct extraction remains reviewable AI output but is not automatically publishable Question Bank data. Do not widen persistence silently.

## Deployment / hosted runtime

Hosted Student/Admin/API/media/OCR/AI execution remains `NOT YET VERIFIED` while deployment is deferred. Do not publish or re-enable Git deployment without a new Product Owner instruction.

## Continuation protocol

After every meaningful batch update Status + Engineering Log; update this Handoff whenever architecture/branch/CI/Preview state changes; update specialized AI/parity docs when affected; preserve exact commit/CI/runtime evidence; unexecuted work is `NOT YET VERIFIED`; never weaken tests/security/business rules for a green build.

## Current transition decision

**Operational controls are VERIFIED on `7c3c5645…`. Implement explicit pause/resume/progress next. Only after that closes should the dedicated worker lifecycle be implemented.**
