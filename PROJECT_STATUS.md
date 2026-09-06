# PROJECT STATUS

- **Current Phase:** Stage11 Provider-Neutral AI Prompt / Output Contracts — **VERIFIED**; Stage12 Durable Provider-Neutral High-Throughput AI Execution is active next work.
- **Planning branch / PR:** `planning/product-evolution-review` / draft PR #12.
- **Exact verified Stage11 implementation head:** `592123dae33f0cfce2ecd36e9577764767faa95a`.
- **Deployment:** `DEFERRED BY PRODUCT OWNER`. No Preview/Vercel deployment is required while this decision remains active.
- **Git auto-deployment:** intentionally disabled during this development period so ordinary commits/CI do not publish.
- **Verification policy:** executable evidence is mandatory. Hosted Preview surfaces remain `NOT YET VERIFIED` / `DEFERRED BY PRODUCT OWNER`; they are not reported as PASS.

## Verified foundation through Stage11

Stages 1–10 and OCR remain green. Stage11 now adds a provider/model-neutral generation contract layer above reviewed OCR/source evidence without introducing live provider coupling or Stage12 scheduling complexity.

```text
approved OCR/source page chunks
→ typed AiGenerationRequest
→ versioned Prompt Registry
→ provider-neutral prompt envelope
→ structured AiGenerationOutput
→ schema + semantic + provenance + duplicate validation
→ valid | invalid | review_required
→ provider benchmark harness / later durable execution
```

## Stage11 implementation contract

Canonical implementation lives under `apps/api/src/ai`:

- `contracts.ts` — Zod-backed request/output/source/question contracts;
- `prompt-registry.ts` — one versioned prompt identity per supported generation mode;
- `validators.ts` — deterministic schema/semantic/provenance/notation/duplicate review rules;
- `benchmark.ts` — provider-neutral adapter benchmark harness and usage/result summary.

Supported generation modes:

- `lesson_summary`;
- `question_generation`;
- `comprehensive_lesson_content`;
- `multi_version_quiz`;
- `exact_question_extraction`;
- `exact_exam_extraction`;
- `replica_question_extraction`;
- `regenerate_question`;
- `page_detection`.

Legacy AI text extraction is not duplicated as a generation mode because OCR Foundation now owns durable text extraction. The user/product outcome remains preserved through reviewed OCR text.

## Stage11 correctness rules now enforced

- book-generation input is page/source scoped and checksum-aware through Stage10/OCR identity;
- approved OCR text is the primary source path; `vision_fallback` is explicit and review-gated;
- source/page evidence must reference a chunk actually present in the request;
- OCR extraction evidence cannot silently point to a different approved extraction;
- requested MCQ/True-False/direct counts are checked exactly where the mode requires counts;
- multi-version version counts and per-version question counts are checked;
- MCQ requires exactly four options;
- True/False requires exactly `["صح", "خطأ"]`;
- `correctOptionIndex` and `answerText` must agree exactly;
- uncertain answers cannot carry a fabricated answer/index;
- exact/exam/replica modes keep unproven answers as `unknown` / `review_required` instead of consulting external knowledge to manufacture certainty;
- exact-source evidence quote must be present in approved OCR text when text evidence is available;
- exact/religious/source-sensitive modes require Admin review;
- Arabic educational output and visible Arabic numeral policy are checked while scientific tokens such as `H2O`/`Fe3O4` preserve Western notation;
- generated exact duplicates are invalid;
- high-similarity near-duplicates are sent to review rather than automatically rejected;
- regeneration must return exactly one question, preserve type/difficulty and actually change wording;
- output kind must match the registered mode contract.

## Question Bank boundary retained

The AI extraction contract preserves legacy `direct` questions so exact exam/source extraction does not lose information. Current `0003_learning.sql` Question Bank persistence still supports only `multiple_choice | true_false`.

Therefore:

- no DB enum/schema was widened silently during Stage11;
- direct extracted output is reviewable AI data, not automatically publishable Question Bank data;
- the explicit persistence/translation rule for direct questions remains `NOT YET VERIFIED` and must be resolved before a later Question Bank/Admin publishing stage writes them.

## Golden / benchmark verification

Stage11 tests now cover:

- Prompt Registry completeness and unique version identities;
- provider-neutral prompt envelopes with no provider/model field;
- valid chemistry/formula digit handling;
- invalid visible Western digits outside scientific tokens;
- exact exam extraction with unresolved answer staying review-required;
- exact-source quote mismatch rejection;
- cross-version exact duplicate rejection;
- religious exact-source review gating;
- wrong answer-index/answerText rejection;
- requested-count mismatch rejection;
- provenance outside the request source set rejection;
- near-duplicate review classification;
- benchmark adapter success/failure recording and token/cost aggregation.

No live provider credential or provider-quality claim is part of Stage11 verification.

## Exact Stage11 verification evidence

Exact implementation head: `592123dae33f0cfce2ecd36e9577764767faa95a`.

- **Stage 11 AI Contract Verification `34004445273` — SUCCESS**
  - API dependency install — PASS
  - AI lint — PASS
  - API strict typecheck — PASS
  - unit + golden/hardening tests — PASS
  - API build — PASS
- **OCR Foundation Verification `34004445384` — SUCCESS**
- **Stage 10 Media Pipeline `34004445278` — SUCCESS**
- **Stage 9 Content Import Verification `34004445277` — SUCCESS**
- **Rebuild Stage Verification `34004445394` — SUCCESS**
  - Stages 1–8 — PASS
  - API/Admin/Student builds — PASS
  - PostgreSQL migrations — PASS
  - Stage8 Chromium activation/returning-login/recovery/rebind E2E — PASS

## Stable lower-layer boundaries retained

- Student auth/device rules from Stage6/8 remain intact.
- Stage9 canonical source inventory remains 15 roots / 48 source documents / 5,552 images.
- Stage10 media identity/checksum/order remains authoritative source evidence.
- OCR remains derived from ready media and only reviewed/approved text is downstream approved evidence.
- OCR failure never changes a successful media asset into media failure.
- Tesseract remains only a verified OCR reference adapter, not a production provider lock-in.

## Deployment / Preview state

Development deployment remains intentionally postponed by Product Owner decision.

- no deployment was performed for Auth/Device/OCR/Stage11 work;
- hosted Student/Admin/API/media/OCR/AI runtime remains `NOT YET VERIFIED`;
- do not re-enable Git auto-deployment or publish a Preview without a new Product Owner instruction.

## Active next phase — Stage12 durable AI execution

Stage12 must reuse `database/migrations/0004_ai_and_sync.sql` durable job primitives where appropriate and connect them to the Stage11 contract layer instead of inventing a parallel orchestration system.

Required next work:

1. inspect the current `ai_jobs / ai_job_units / ai_outputs` schema and all execution callers before changing it;
2. define generation-plan → bounded source/page units using reviewed OCR text;
3. create `AiModelRouter` + provider adapter boundary without provider leakage into domain services;
4. implement bounded global/provider/project/model concurrency and backpressure;
5. deterministic per-unit idempotency and partial-success persistence;
6. classified retry/backoff/jitter/cooldown for retryable failures;
7. cancellation/resume/progress without giant in-memory batch state;
8. provider/model/credential health, budget ceilings and server-only secrets;
9. persist provider/model/prompt/source/validation/usage/latency/error/cost metadata;
10. model cascade only from benchmark-approved routes: cheap/fast approved first, stronger model only for failed/uncertain units;
11. never switch keys/providers to evade provider quotas or terms;
12. run provider/model benchmark evidence before selecting production defaults.

Live provider credentials, live pricing, production routing and real provider benchmark results remain **NOT YET VERIFIED**.

## Remaining ordered work

1. Stage12 durable provider/model-neutral high-throughput execution.
2. Curriculum structure extension and Stage13+ according to `MASTER_REBUILD_ROADMAP.md`.
3. Later explicit Question Bank persistence handling for `direct` extracted questions before publish workflows depend on it.
4. When Product Owner explicitly re-enables deployment: deliberately restore/sync a stable validated head and verify exact hosted commit/`READY`/Student/Admin/API/media/OCR/AI runtime before claiming PASS.

`PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remain hard gates before later Student/Admin feature closure. No valuable legacy capability may be removed without explicit Product Owner approval.

## Last build/test

**Stage11 exact implementation head `592123dae33f0cfce2ecd36e9577764767faa95a`: Stage11 + OCR + Stage10 + Stage9 + Full Rebuild/Chromium all SUCCESS.**

## Next step

Begin Stage12 with execution-schema/caller discovery, then implement the smallest durable provider-neutral router/worker path around the already-verified Stage11 contracts. Deployment remains deferred.
