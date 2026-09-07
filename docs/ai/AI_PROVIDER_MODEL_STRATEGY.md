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
→ distributed capacity + operational admission
→ Stage12 AiModelRouter
→ AiProviderAdapter
→ normalized structured Stage11 output
→ Stage11 validators/provenance/dedupe
→ lease-protected durable result / review
```

Provider-specific payloads, errors and usage metadata stay inside adapters. Provider/network calls happen outside database transactions.

## Verified checkpoints

### Stage11 contract layer

Stage11 is **VERIFIED** and provides provider-neutral Zod request/output/source/question contracts, versioned Prompt Registry, deterministic schema/semantic/provenance/count/notation/duplicate validators, explicit `valid | invalid | review_required`, exact-source uncertainty handling, golden tests and provider-neutral benchmark harness.

### Stage12 durable execution core

Verified executable checkpoint: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

Verified: existing `ai_jobs / ai_job_units / ai_outputs` reuse, idempotent plans, `SKIP LOCKED` claims, UUID leases, stale-worker rejection, attempt telemetry, provider calls outside transactions, Stage11 validation, bounded cascade/retry, cancellation safety and partial success.

### Stage12 distributed capacity / backpressure

Verified checkpoint: `881102ff94711f908104cd068a003ad598609944`.

- PostgreSQL-coordinated global/provider/project/model concurrency;
- transaction-scoped advisory admission lock only around count/check/attempt insert;
- `resume_route_key` preserves the intended route under pressure;
- capacity deferral does not consume another semantic retry;
- capacity pressure does not silently escalate to a more expensive route;
- race tests prove concurrent workers cannot over-admit configured limits.

### Stage12 health / cooldown / budget controls

Verified checkpoint: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

Same-head verification:

- Stage12 `34086168715` — SUCCESS.
- Stage11 `34086168704` — SUCCESS.
- OCR `34086168712` — SUCCESS.
- Stage10 `34086168727` — SUCCESS.
- Stage9 `34086168687` — SUCCESS.
- Full Rebuild `34086168772` — SUCCESS including Chromium.

Verified controls:

- singleton global kill switch;
- route kill switch keyed by **full route identity**;
- persisted provider Retry-After / health cooldown;
- consecutive retryable-failure threshold cooldown;
- conservative global and route budget windows;
- pre-call budget reservation persisted on attempts;
- budget admission and capacity admission share the short PostgreSQL advisory critical section;
- `control_deferred_count` records operational deferrals;
- control deferral keeps the intended `resume_route_key` and does not consume another semantic retry.

Route operational identity is:

```text
route_key
+ provider_key
+ provider_project_alias
+ credential_alias
+ model_used
```

`route_key` is not globally unique. Migration `0014_ai_execution_controls.sql` uses a surrogate UUID primary key plus `UNIQUE NULLS NOT DISTINCT` over the full identity. Cooldown, health, route budget configuration and route budget usage aggregation use that same identity.

## Budget evidence boundary

Budget admission is conservative safety control, not billing truth.

For an attempt inside the configured window, usage contribution is:

```text
max(configured pre-call reservation, reported estimated cost)
```

A new attempt is rejected/deferred before the provider call if its configured reservation would exceed the global or exact-route ceiling. Actual provider invoice accuracy, live prices and reconciliation remain **NOT YET VERIFIED** until authorized live adapters and benchmark/billing evidence exist.

## Input/source policy

Textbook generation uses reviewed OCR text first:

```text
ready source media
→ reviewed OCR extraction
→ bounded source/page chunk + checksum identity
→ Stage11 request
```

Vision/raw-image input is fallback-only when text evidence cannot safely satisfy the mode. Vision fallback is explicit and review-gated. Book-generated questions require source/page evidence. Exact/source-sensitive output preserves uncertainty; no fabricated answer certainty is allowed.

## Model routing policy

A provider/model is not approved because it is free, fast or popular. Production route eligibility requires benchmark evidence for the relevant mode/domain/sensitivity.

Routing principle:

```text
mode + subject family + sensitivity
→ cheapest benchmark-approved route
→ Stage11 validation
→ accepted/review
   or, only for semantic failure/uncertainty allowed by policy,
→ stronger approved route
```

Capacity, cooldown or budget pressure is **not semantic failure** and therefore does not justify automatic escalation by itself.

## Candidate live benchmark pool

When live benchmarking is explicitly authorized, candidates may include production-grade Gemini Flash-class models, Groq-hosted text models, pinned OpenRouter routes or other providers that can implement the same Stage11 adapter contract. Provider terms, privacy, current pricing and limits must be re-verified at benchmark time.

No current provider/model is production-approved yet.

## Health / quota / credential policy

- provider secrets are server-only;
- no provider keys in Student/Admin bundles or Git;
- DB/UI may reference non-secret provider/project/credential aliases only;
- legitimate failover is allowed only across intentionally authorized routes/projects;
- multiple keys do not imply additional quota and must not be rotated to evade limits/terms;
- Retry-After and configured health cooldown are distributed operational state in PostgreSQL;
- kill switches stop new attempts without invalidating existing lease/cancellation rules.

## Golden / live benchmark dataset

Use the same source-controlled cases across candidates. Include Arabic prose, religious exact-source cases, chemistry notation, physics formulas, mathematics, tables, noisy OCR, short/long lessons, MCQ, T/F, mixed counts, summaries, exact/replica/exam extraction, alternate versions and regeneration.

Measure structured validity, answer correctness, explanation quality, source/page fidelity, unresolved-answer honesty, duplicate/near-duplicate rate, Arabic/scientific notation quality, tokens, latency, estimated/actual cost where available and Admin acceptance/edit rate.

## Explicit pause / resume / progress — active next work

`resume_route_key` is an internal route continuation field and is **not** user/job resume.

The next Stage12 batch must add explicit job-level lifecycle semantics:

- pause stops new claims for that job;
- already leased/in-flight work retains lease authority and may finish safely;
- resume makes unfinished work claimable without resetting successful outputs or attempt counts;
- completed/cancelled terminal jobs cannot be resumed;
- progress is derived from durable unit state, never client-authoritative;
- race coverage must include pausing while a provider call is already in flight.

## Worker lifecycle — after pause/resume

`apps/api/src/server.ts` is HTTP-only. The AI worker must be a separate process/runtime, not a polling loop embedded in Fastify.

Required worker behavior:

- bounded concurrent slots;
- bounded idle polling/backoff;
- graceful shutdown stops new claims first;
- in-flight work drains while leases remain valid;
- abrupt process death is recovered by existing lease expiry logic;
- DB closes after drain;
- no huge in-memory batches.

A live-provider worker bootstrap is still **NOT YET VERIFIED**. Do not invent credentials or a fake production route merely to claim a complete entrypoint.

## Current implementation status

- Stage11 provider-neutral contracts / Prompt Registry / validators / golden harness: **VERIFIED**.
- Stage12 durable execution core: **VERIFIED**.
- Stage12 distributed concurrency/backpressure: **VERIFIED**.
- Stage12 health/cooldown/Retry-After/global+route budget admission: **VERIFIED** on `7c3c5645…`.
- Explicit job pause/resume/progress: **ACTIVE NEXT / NOT YET VERIFIED**.
- Dedicated worker runtime: **NOT YET VERIFIED**.
- Live provider adapters with authorized credentials: **NOT YET VERIFIED**.
- Live cross-provider/model benchmark: **NOT YET VERIFIED**.
- Production routing/budget values and actual provider billing: **NOT YET VERIFIED**.
- Hosted AI worker/runtime: **NOT YET VERIFIED** while deployment remains deferred by Product Owner.
