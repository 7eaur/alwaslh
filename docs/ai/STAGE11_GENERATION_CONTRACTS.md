# STAGE 11 — PROVIDER-NEUTRAL AI GENERATION CONTRACTS

> Scope: Stage11 contract foundation only. Live provider credentials, production routing, durable scheduler/backpressure/cascade execution belong to later verification/Stage12 unless explicitly needed by a contract test.

## Goal

Replace the legacy monolithic provider-specific `analyze-lesson` prompt branches with reproducible, provider-neutral educational generation contracts that can be validated before any output becomes an Admin-reviewable draft.

The core pipeline is:

```text
approved OCR/source evidence
→ typed generation request
→ versioned Prompt Registry
→ provider-neutral prompt envelope
→ provider adapter (benchmark/execution boundary)
→ typed structured output
→ schema + semantic + provenance + duplicate validators
→ valid | review_required | invalid
→ Admin review/persistence in later product flow
```

## Legacy capability inventory and mapping

| Legacy capability/task | Stage11 mode | Classification | Notes |
|---|---|---|---|
| `generate_summary` | `lesson_summary` | REBUILD | Approved OCR text/source evidence first. |
| `generate_questions` | `question_generation` | REBUILD | Exact requested MCQ/T/F/direct counts are contract fields. |
| `generate_lesson_content` | `comprehensive_lesson_content` | REBUILD | Summary + questions from one bounded source set. |
| `generate_multi_version_quiz` / version generation | `multi_version_quiz` | REBUILD | Exact version/count contracts + cross-version duplicate validation. |
| `extract_questions_from_images` | `exact_question_extraction` | REBUILD | Exact-source extraction; no unsupported answer invention. |
| `exam_paper_exact` | `exact_exam_extraction` | REBUILD | Preserve source order/type/options and unknown-answer state. |
| `replica` | `replica_question_extraction` | REBUILD | Exact extraction/replica contract, not creative generation. |
| `regenerate_question` | `regenerate_question` | REBUILD | One question, same type/difficulty/source scope, genuinely different wording. |
| `detect_pages` | `page_detection` | REBUILD | Unknown page remains `null`; no invented number. |
| `extract_text` | OCR Foundation | REPLACE | Stage11 does not recreate AI OCR. `0011_ocr_foundation.sql` owns extraction/review/search. |

No valuable legacy generation capability is intentionally removed by this mapping.

## Prompt Registry

`apps/api/src/ai/prompt-registry.ts` owns prompt identity and mode requirements.

Each definition has:

- stable `promptKey`;
- semantic `promptVersion`;
- generation mode;
- expected output kind;
- exact-source flag;
- human-review requirement;
- provider-neutral instructions.

Current first versions:

```text
lesson.summary@1.0.0
questions.generate@1.0.0
lesson.comprehensive@1.0.0
quiz.multi_version@1.0.0
questions.extract_exact@1.0.0
exam.extract_exact@1.0.0
questions.replica_exact@1.0.0
question.regenerate@1.0.0
page.detect@1.0.0
```

The prompt envelope does not contain a provider or model choice. Provider/model routing is a separate adapter/router concern.

## Source/provenance contract

Book/source generation consumes bounded `AiSourceChunk` records.

Primary path:

```text
media_asset/page
→ approved OCR extraction
→ approved text + OCR id + media checksum
→ generation request
```

Each question/source-dependent output must point back to the actual `mediaAssetId` and `pageNumber`. OCR identity is carried when applicable.

Rules:

- `approved_ocr` input requires approved/review-cleared OCR text;
- pending/rejected OCR is not a valid Stage11 source chunk;
- `vision_fallback` can be represented but always causes `review_required` before publish;
- exact-source evidence should include a quote when approved text is available;
- an exact quote that is not present in approved source text is invalid;
- evidence outside the request source set is invalid.

## Question/output contract

Stage11 supports AI-domain question types:

- `multiple_choice`;
- `true_false`;
- `direct`.

`direct` is required to preserve legacy exam/extraction capability. The current Published Question Bank DB enum in `0003_learning.sql` supports only `multiple_choice | true_false`.

Therefore:

**Direct-question persistence into the Published Question Bank is `NOT YET VERIFIED`.** Stage11 deliberately represents the extraction truth without silently extending the learning schema. A later explicit persistence/translation decision must either extend the Question Bank contract or keep direct extracted material in a review/import state until supported.

Question fields include:

- prompt/type/options;
- nullable correct option index;
- nullable answer text;
- `answerStatus = known | unknown | review_required`;
- difficulty;
- explanation/method;
- source evidence.

## Exact-source rule — no fabricated answers

The legacy `replica` / `exam_paper_exact` prompts contained a conflict: they demanded literal copying but allowed the model to use outside knowledge when no answer mark/evidence existed.

The rebuilt rule follows `AIRULE-021`:

```text
source proves answer
→ answerStatus=known + consistent answer/index

source does not prove answer
→ answerStatus=unknown or review_required
→ correctOptionIndex=null
→ answerText=null
→ Admin review
```

No validator or adapter may silently convert uncertainty into a guessed educational answer.

## Validator pipeline

`apps/api/src/ai/validators.ts` validates:

1. request schema;
2. output schema;
3. mode/output-kind match;
4. option shape and answer/index consistency;
5. exact requested question/version counts;
6. source/page provenance;
7. OCR/source evidence consistency;
8. exact quote membership where applicable;
9. Arabic output and visible-number policy;
10. scientific/chemical Western digit exceptions such as `H2O` / `Fe3O4`;
11. duplicate questions across a batch/versions;
12. regenerate-one-question type/difficulty/change contract;
13. exact/sensitive/religious review requirements.

Result states:

- `valid` — deterministic checks passed and no forced review rule applies;
- `review_required` — structurally usable but human review is mandatory;
- `invalid` — must not be accepted as an educational draft without correction/regeneration.

Malformed provider output is not repaired into a fabricated valid question.

## Golden regression dataset

`apps/api/tests/fixtures/ai-golden.ts` is source-controlled and currently covers:

- chemistry formula digit preservation;
- Western visible digit rejection outside scientific tokens;
- exact exam unknown-answer behavior;
- exact quote/source mismatch;
- cross-version duplicate detection;
- religious exact-source mandatory review;
- validated source-backed summary.

The fixture set is expected to grow with mathematics, physics notation, Arabic prose, noisy OCR, tables, longer lessons and additional legacy modes as real benchmark data is curated.

## Benchmark harness

`apps/api/src/ai/benchmark.ts` provides a provider-neutral comparison harness:

```text
same golden case
→ adapter A / model A
→ shared validator
→ validation + latency + usage

same golden case
→ adapter B / model B
→ shared validator
→ validation + latency + usage
```

It records adapter failures explicitly rather than hiding them.

Metrics supported by the first contract:

- valid/review/invalid counts;
- schema/semantic acceptance rate;
- input/output tokens when supplied;
- estimated cost when supplied;
- latency;
- adapter error state.

## Current verification boundary

This Stage11 foundation does **not** claim that any production provider/model is approved.

Still `NOT YET VERIFIED`:

- live Google/Groq/OpenRouter/other adapters;
- live source-controlled multi-provider benchmark results;
- provider pricing/privacy/rate-limit suitability at deployment time;
- production model routing/cascade;
- credential health/cooldown/budget management;
- durable worker scheduling/backpressure/cancel/resume execution;
- persistence of `direct` questions into the Published Question Bank.

These cannot be faked with embedded credentials or provider-specific shortcuts.

## Stage12 boundary

Stage12 owns:

- durable plan/unit creation around existing `ai_jobs / ai_job_units / ai_outputs`;
- scheduler/backpressure;
- per-provider/model concurrency;
- retries/cooldowns/jitter;
- cancel/resume/progress;
- model cascade/escalation;
- production provider adapters/authorized credentials;
- usage/cost/health telemetry.

Stage11 contracts and validators must remain reusable by Stage12 rather than being duplicated inside workers.
