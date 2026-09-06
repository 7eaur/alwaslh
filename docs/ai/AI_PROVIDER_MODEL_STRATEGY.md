# AI PROVIDER / MODEL STRATEGY

> Decision snapshot: 2026-09-06. Provider pricing/free tiers/rate limits change frequently; re-check official terms before live benchmarking or production routing. Architecture must not depend on today's prices.

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

## Stage12 verified durable execution core

Exact executable checkpoint: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

Verification matrix on that same head:

- Stage12 `34006710501` — SUCCESS.
- Stage11 `34006710456` — SUCCESS.
- OCR `34006710511` — SUCCESS.
- Stage10 `34006710490` — SUCCESS.
- Stage9 `34006710461` — SUCCESS.
- Full Rebuild `34006710470` — SUCCESS including Chromium.

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
- telemetry supports provider/model/project/credential aliases, request id, input/output tokens, latency, validation/error state and optional cost micros without storing provider secrets.

### Important hardening

`AI-012-009` found that stale workers could originally finalize attempt telemetry after lease expiry even though unit/output writes were protected. The fix lease-protects attempt success/failure too, enforces the strong running-lease DB shape and uses consistent unit→attempt lock ordering. Integration coverage proves the stale attempt is recovered as `lease_expired` before a new attempt completes.

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

Capacity pressure is **not** semantic failure. The next Stage12 batch must defer/backpressure work when the intended route has no capacity rather than silently escalating to a more expensive route merely because it is free.

## Distributed concurrency / backpressure — active next work

Durable `SKIP LOCKED` claims prevent duplicate unit ownership, but they are not sufficient throughput control across multiple worker processes.

Required capacity policy:

- database-coordinated, not only process-local;
- bounded global running attempts;
- bounded provider running attempts;
- bounded project/account running attempts where configured;
- bounded model running attempts;
- race-safe under concurrent workers;
- capacity exhaustion defers the unit without consuming a semantic retry attempt;
- backpressure retry time is short/bounded and distinct from provider failure backoff;
- no automatic provider/key/project rotation to evade quota/terms;
- capacity state must remain observable in telemetry/tests.

## Health / cooldown / budget policy — not yet verified

After capacity control:

- honor provider `Retry-After` / explicit cooldown;
- track configured route/provider health state;
- temporarily exclude unhealthy/cooling routes;
- budget ceilings and kill switch must stop new work before overspend;
- legitimate failover only across intentionally authorized providers/projects;
- free-tier/price assumptions are never hard-coded architecture.

## Credential policy

- all provider secrets are server-only;
- no provider keys in Student/Admin bundles or repository files;
- DB/UI may reference non-secret provider/project/credential aliases only;
- credentials/projects may have health/cooldown/budget metadata;
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
- Durable Stage12 execution core / leasing / retry / cascade / partial-success / telemetry: **VERIFIED** on `dfd9a456…`.
- Distributed concurrency/backpressure: **ACTIVE / NOT YET VERIFIED**.
- Route health/cooldown/budget ceilings: **NOT YET VERIFIED**.
- Dedicated worker runtime: **NOT YET VERIFIED**.
- Live provider adapters with authorized credentials: **NOT YET VERIFIED**.
- Live cross-provider/model benchmark results: **NOT YET VERIFIED**.
- Production default routing/budget configuration: **NOT YET VERIFIED**.
- Hosted AI worker/runtime behavior: **NOT YET VERIFIED** while deployment remains deferred by Product Owner.
