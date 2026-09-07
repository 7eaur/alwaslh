# AI PROVIDER / MODEL STRATEGY

> Decision snapshot: 2026-09-07. Provider pricing/free tiers/rate limits change frequently; re-check official terms before live benchmarking or production routing. Architecture must not depend on today's prices.

## Goal

Generate the largest **useful and publishable** educational output volume with controlled cost, low token waste, strong Arabic/scientific correctness and resilient throughput.

Primary KPI:

```text
accepted reviewed outputs
-------------------------
cost + tokens + latency
```

Secondary KPIs: schema-valid rate, semantic/provenance-valid rate, duplicate rate, Admin rejection/edit rate, retry/failure rate, latency and tokens/cost per accepted item.

## Authoritative architecture

No direct provider calls from domain services.

```text
Generation Plan / Service
→ Stage11 typed request + Prompt Registry
→ Stage12 durable unit + lease
→ distributed operational admission
→ Stage12 AiModelRouter
→ AiProviderAdapter
→ normalized structured Stage11 output
→ Stage11 validators/provenance/dedupe
→ lease-protected durable result / review
```

Provider-specific payloads, errors and usage metadata stay inside adapters. Provider/network calls happen outside database transactions.

## Stage11 verified contract layer

Stage11 is **VERIFIED**. It provides:

- provider-neutral Zod request/output/source/question contracts;
- versioned Prompt Registry;
- provider-neutral prompt envelope;
- deterministic schema/semantic/provenance/count/notation/duplicate validators;
- explicit `valid | invalid | review_required` outcomes;
- exact-source rule that unresolved answers remain unknown/review-required rather than guessed;
- exact duplicate rejection + near-duplicate review;
- source-controlled golden/hardening tests;
- provider-neutral benchmark adapter harness with usage/result summary.

No live provider/model quality claim was made in Stage11.

## Stage12 verified durable execution + distributed capacity

Exact executable checkpoint: `881102ff94711f908104cd068a003ad598609944`.

Verification matrix on that same head:

- Stage12 `34007356406` — SUCCESS.
- Stage11 `34007356417` — SUCCESS.
- OCR `34007356407` — SUCCESS.
- Stage10 `34007356429` — SUCCESS.
- Stage9 `34007356442` — SUCCESS.
- Full Rebuild `34007356410` — SUCCESS including Chromium.

Verified execution behavior:

- existing `ai_jobs / ai_job_units / ai_outputs` are reused rather than shadowed by a parallel queue;
- deterministic generation-plan idempotency + fingerprint conflict detection;
- `FOR UPDATE SKIP LOCKED` durable claims;
- UUID lease token + expiry;
- PostgreSQL `running ↔ lease` invariant;
- stale/expired/cancelled workers cannot finalize attempts, units or outputs;
- provider calls happen outside DB transactions;
- route attempts are persisted independently from unit execution retries;
- Stage11 validation runs before durable acceptance;
- bounded route cascade;
- retryable errors use bounded retry/backoff/jitter;
- partial success is preserved;
- cancellation removes current worker write authority;
- PostgreSQL advisory-lock admission bounds global/provider/project/model running attempts across worker processes;
- capacity pressure defers the intended route with `resume_route_key` instead of consuming another semantic retry or silently escalating to a more expensive route;
- telemetry supports provider/model/project/credential aliases, request id, input/output tokens, latency, validation/error state, capacity deferrals and optional cost micros without storing provider secrets.

## Input/source policy

Textbook generation uses reviewed OCR text first:

```text
ready source media
→ reviewed OCR extraction
→ bounded source/page chunk + checksum identity
→ Stage11 request
```

Vision/raw-image input is fallback-only when text evidence cannot safely satisfy the mode. Vision fallback is explicit and review-gated.

Book-generated questions require source/page evidence. Exact/source-sensitive output preserves evidence and uncertainty; no fabricated answer certainty is allowed.

## Candidate provider/model pool for live benchmark

Initial benchmark candidates may include:

1. Google Gemini Flash-class models;
2. Groq-hosted GPT-OSS or other production text models;
3. pinned OpenRouter models where availability/terms are suitable;
4. additional providers only when they can be benchmarked through the same Stage11 adapter contract.

A provider/model is not approved because it is free, fast or popular. It must beat alternatives on accepted-output quality/cost/time for the relevant task family. **No current provider/model is production-approved yet.**

## Model routing by task

### Tier A — cheap/fast approved first pass

Use only after golden/live benchmark evidence for modes such as standard MCQ, simple True/False, simple summaries, classification or normalization helpers.

### Tier B — stronger generation

Use directly or as escalation for harder Arabic phrasing, multi-step science, chemistry/math notation, nuanced explanation/method, or units rejected/uncertain after Tier A.

### Exact/sensitive source modes

Religious/source-exact text, formulas/tables and OCR-uncertain material require stricter provenance/evidence. Human Admin review remains mandatory where Stage11 marks the mode/source as review-required.

## Cascade rule

```text
job unit
→ cheapest benchmark-approved route for this mode/domain
→ Stage11 schema validator
→ semantic validator
→ provenance validator
→ duplicate validator
   ├── PASS → Draft/review flow
   └── FAIL/UNCERTAIN → stronger approved route for this unit only
```

Never regenerate already accepted units because another unit failed.

Capacity/cooldown/budget pressure is **operational**, not semantic. It must defer work on the intended route rather than silently escalating merely because another route currently has room.

## Distributed concurrency / backpressure — VERIFIED

Verified on `881102ff…`:

- database-coordinated admission, not process-local semaphore only;
- bounded global running attempts;
- bounded provider running attempts;
- bounded project/account running attempts where configured;
- bounded model running attempts;
- race-safe under concurrent workers;
- capacity exhaustion defers without consuming another semantic retry attempt;
- backpressure retry time is short/bounded and distinct from provider failure backoff;
- no provider/key/project rotation to evade quota/terms;
- capacity state is observable through `resume_route_key`, `capacity_deferred_count` and tests.

## Health / cooldown / budget policy — implementation active, NOT YET VERIFIED

The current isolated implementation batch adds:

- singleton global kill switch;
- route kill switch;
- route runtime identity pinned to route/provider/project/credential/model;
- persisted route cooldown;
- provider Retry-After → distributed cooldown;
- consecutive retryable-failure tracking + configurable threshold cooldown;
- optional global budget window;
- optional route budget window;
- per-attempt global/route budget reservation persisted before provider execution;
- admission under the same PostgreSQL transaction-scoped advisory lock as capacity control;
- operational deferral without semantic retry consumption;
- PostgreSQL tests for kill switches, cooldown/Retry-After and race-safe budget ceilings.

Budget policy is conservative by design. For each configured budget scope, a pre-call reservation is counted and the window usage uses `max(reservation, reported estimated cost)`. This prevents new work from being admitted beyond the configured reservation ceiling, but **does not claim actual provider invoice accuracy**. Production budget values require live provider pricing, token ceilings and billing evidence.

## Credential policy

- all provider secrets are server-only;
- no provider keys in Student/Admin bundles or repository files;
- DB/UI may reference non-secret provider/project/credential aliases only;
- route runtime state may reference those aliases for health/cooldown/budget identity but stores no secret values;
- legitimate failover is allowed only across intentionally configured authorized accounts/projects;
- multiple keys in one provider project do not imply extra quota;
- no routing behavior may evade provider limits or terms.

## Golden / live benchmark dataset

Use the same source-controlled cases across candidates. Include Arabic prose, religious exact-source cases, chemistry notation, physics formulas, mathematics, tables, noisy OCR, short/long lessons, MCQ, T/F, mixed counts, summaries, exact/replica/exam extraction, alternate versions and regeneration.

Measure:

- structured-output validity;
- answer correctness;
- explanation quality;
- source/page fidelity;
- unresolved-answer honesty;
- duplicate/near-duplicate rate;
- Arabic/scientific notation quality;
- tokens;
- latency;
- estimated/actual cost where available;
- Admin acceptance/edit rate.

## Production selection rule

Routing decisions are versioned evidence, not hard-coded preference:

```text
mode + subject family + difficulty/sensitivity
→ preferred provider/model
→ fallback/escalation route
→ benchmark version
→ output/token limits
→ concurrency/budget policy
```

A slightly more expensive model can be cheaper overall if it produces materially more accepted outputs.

## Worker lifecycle — not yet verified

Stage12 still needs a dedicated worker runtime separate from the HTTP server with:

- bounded polling;
- graceful shutdown that stops new claims first;
- in-flight lease safety;
- explicit idle/backpressure behavior;
- process-level logging/metrics;
- no huge in-memory batch state.

## Current implementation status

- Provider-neutral Stage11 contracts/Prompt Registry/validators/golden harness: **VERIFIED**.
- Durable Stage12 execution core / leasing / retry / cascade / partial-success / telemetry: **VERIFIED**.
- Distributed global/provider/project/model concurrency/backpressure: **VERIFIED** on `881102ff…`.
- Route health/cooldown/Retry-After/budget ceilings/kill switch: **IMPLEMENTED / VERIFICATION PENDING**.
- Dedicated worker runtime: **NOT YET VERIFIED**.
- Live provider adapters with authorized credentials: **NOT YET VERIFIED**.
- Live cross-provider/model benchmark results: **NOT YET VERIFIED**.
- Production default routing/budget configuration: **NOT YET VERIFIED**.
- Actual provider billing accuracy/reconciliation: **NOT YET VERIFIED**.
- Hosted AI worker/runtime behavior: **NOT YET VERIFIED** while deployment remains deferred by Product Owner.
