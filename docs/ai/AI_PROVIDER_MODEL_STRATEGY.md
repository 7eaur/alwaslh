# AI PROVIDER / MODEL STRATEGY

> Decision snapshot: 2026-09-06. Pricing/free tiers change frequently; re-check official provider pricing/rate limits immediately before implementation or production routing. Architecture must not depend on today's prices.

## Goal

Generate the largest **useful and publishable** educational output volume with controlled cost, low token waste, high Arabic/scientific correctness, and resilient throughput.

Primary KPI is not requests/second:

```text
accepted reviewed outputs
-------------------------
cost + tokens + latency
```

Secondary KPIs:
- schema-valid rate؛
- semantic/provenance-valid rate؛
- duplicate rate؛
- Admin rejection/edit rate؛
- retry/failure rate؛
- p50/p95 latency؛
- input/output tokens per accepted item.

## Architectural rule

No direct Gemini/OpenAI/Groq/OpenRouter calls from domain services.

```text
Generation Service
→ AiModelRouter
→ AiProviderAdapter
   ├── Google adapter
   ├── Groq adapter
   ├── OpenRouter adapter
   └── future provider adapter
→ normalized structured response
```

Provider-specific payloads/errors/usage metadata stay inside adapters.

## Initial candidate pool for benchmark

The initial benchmark should include at least:

1. **Google Gemini Flash-class model**
   - attractive free/developer entry and paid/batch options؛
   - good candidate for multimodal fallback and high-quality structured generation؛
   - free-tier privacy/data-use terms must be checked before using real unpublished/source-sensitive production content؛
   - paid/batch mode should be evaluated for large asynchronous generation.

2. **Groq-hosted GPT-OSS / other production text models**
   - very high token throughput and low per-token price are attractive for OCR-text-first bulk question generation؛
   - must prove Arabic, chemistry/math notation, exact-source behavior and structured-output acceptance on our golden set before becoming primary.

3. **OpenRouter specific pinned models**
   - useful as a provider abstraction/fallback and for testing multiple models through a common API shape؛
   - free variants/free router are acceptable for experiments/benchmarks/low-volume non-sensitive work, but **not a production correctness dependency** because availability/rate limits/model routing may change.

Additional providers/models can be added when they beat the current pool on our acceptance/cost benchmark.

## Model routing by task

Do not choose one model for every mode.

### Tier A — cheap/fast first pass
Use when golden tests show acceptable quality for:
- standard MCQ؛
- simple True/False؛
- classification/metadata extraction؛
- duplicate-normalization helpers؛
- simple summaries.

### Tier B — stronger generation
Use directly or by escalation for:
- difficult Arabic phrasing؛
- multi-step scientific questions؛
- chemistry/math notation؛
- questions requiring nuanced explanation/method؛
- units rejected by Tier A validators.

### Exact/sensitive source modes
Religious/source-exact text, formulas/tables and OCR-uncertain material require stricter provenance/evidence and may use a stronger/vision-capable model only when the text path cannot prove correctness. Human Admin review remains mandatory.

## Cascade

```text
job unit
→ cheapest benchmark-approved model for this mode
→ schema validator
→ semantic validator
→ provenance validator
→ duplicate validator
   ├── PASS → Draft
   └── FAIL/UNCERTAIN → stronger approved model for this unit only
```

Never regenerate already accepted units because another unit failed.

## Batch / throughput policy

- OCR once per source revision؛
- compact source chunks sized by tokens/content boundaries, not arbitrary whole books؛
- durable DB-backed job units؛
- bounded global concurrency؛
- bounded per-provider/project/model concurrency؛
- backpressure from provider rate-limit and DB/worker saturation؛
- retry only retryable errors with exponential backoff+jitter؛
- cooldown on 429/rate-limit responses؛
- partial-success checkpoints؛
- cancel/resume؛
- deterministic idempotency keys؛
- no unbounded in-memory batch state.

## Credential policy

- all API keys server-only secret config؛
- no keys in Student/Admin bundles؛
- credentials have health/status/cooldown metadata؛
- legitimate failover across configured authorized provider accounts/projects؛
- no key switching to evade provider limits/terms؛
- per-provider budget ceiling and kill switch.

## Benchmark dataset

Before choosing defaults, run the same source-controlled golden set across candidates. Include:
- Arabic prose؛
- Quran/religious exact-source cases؛
- chemistry notation؛
- physics formulas؛
- mathematics؛
- tables؛
- noisy OCR؛
- short/long lessons؛
- MCQ, T/F, mixed, summary, alternate-version, model/exam modes.

Measure:
- valid structured output؛
- correct answer؛
- explanation quality؛
- source/page fidelity؛
- duplicate rate؛
- Arabic quality؛
- tokens؛
- latency؛
- estimated cost؛
- Admin acceptance/edit rate.

## Production selection rule

A free model is not automatically better. A model that costs slightly more but produces twice as many accepted questions can be cheaper overall.

Routing decisions must be evidence-based and versioned:

```text
mode + subject family + difficulty
→ preferred provider/model
→ fallback provider/model
→ benchmark version
→ max token/output limits
→ concurrency/budget policy
```

## Current implementation status

Architecture DECIDED by PED-044/PED-045. Provider adapters, golden benchmark runner, production routing and credentials are **NOT YET VERIFIED** and belong to revised Stage 11/12 work.
