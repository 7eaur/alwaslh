# PROJECT HANDOFF — الوسيلة الذكية

> Source of truth: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → Product decisions → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → parity/coverage docs → roadmap. Repository + CI evidence are authoritative.

## Product / repository state

- Product: Arabic educational platform with independent Student PWA, Admin Web and Backend API.
- Repository: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`; draft PR #12.
- Exact latest verified executable head: `592123dae33f0cfce2ecd36e9577764767faa95a`.
- Stage11 Provider-Neutral AI Prompt / Output Contracts: **VERIFIED**.
- Stages 1–10 + OCR remain green under the same regression head.
- Active phase: **Stage12 Durable Provider-Neutral High-Throughput AI Execution**.
- Deployment: `DEFERRED BY PRODUCT OWNER`; Git auto-deploy remains disabled. Hosted behavior is not PASS until explicitly re-enabled and verified.

## Stable architecture

```text
Admin Web ──┐
            ├── apps/api ── private PostgreSQL
Student PWA ┘      │
                   ├── media storage abstraction / Stage10 media identity
                   ├── reviewed OCR text / OCR Foundation
                   ├── Stage11 provider-neutral AI contracts
                   ├── Stage12 durable AI execution
                   └── later TTS / notifications / offline sync
```

Hard boundaries:

- browser never receives DB credentials or performs authoritative business writes directly;
- auth/authorization/entitlements are server-owned;
- upload/media success is independent from OCR/AI/TTS;
- source media is canonical evidence;
- downstream AI book generation uses reviewed source/page evidence;
- no valuable legacy capability is removed without Product Owner approval.

## Verified lower-layer baseline

- Stage6/8: two-step activation, device-bound Student sessions, forced recovery and explicit P-256 reset/rebind — VERIFIED.
- Stage7: Full Code 6 digits / Class Code 7 digits, transactional/idempotent entitlement rules — VERIFIED.
- Stage9: 15 roots / 48 source documents / 5,552 images / deterministic re-import — VERIFIED.
- Stage10: deterministic Sharp/Poppler media variants/order/checksum/provenance/idempotency — VERIFIED.
- OCR Foundation: durable lease/retry/review/search layer over Stage10 media; only reviewed/approved OCR is downstream approved evidence — VERIFIED.

## Stage11 — what was implemented

`apps/api/src/ai` now contains:

- `contracts.ts` — Zod-backed provider-neutral request/output/source/question contracts;
- `prompt-registry.ts` — versioned Prompt Registry and provider-neutral prompt envelopes;
- `validators.ts` — schema/semantic/provenance/notation/count/duplicate validation;
- `benchmark.ts` — common provider-adapter benchmark harness and usage/result summaries.

Supported modes:

`lesson_summary`, `question_generation`, `comprehensive_lesson_content`, `multi_version_quiz`, `exact_question_extraction`, `exact_exam_extraction`, `replica_question_extraction`, `regenerate_question`, `page_detection`.

Legacy AI `extract_text` is intentionally replaced by the already-verified OCR Foundation rather than duplicating text extraction inside AI generation.

## Stage11 correctness rules

- inputs are bounded source/page chunks with checksum identity;
- approved OCR is the primary text path; vision fallback is explicit and review-gated;
- evidence outside the request source/page set is invalid;
- exact-source quotes must exist in reviewed OCR when text evidence exists;
- MCQ requires four options; T/F requires exactly `["صح", "خطأ"]`;
- requested counts/version counts are enforced;
- a known option answer requires exact agreement between index and answer text;
- uncertain answers cannot carry fabricated index/text;
- exact/exam/replica modes do **not** use external knowledge to manufacture an answer when source evidence is insufficient;
- exact/religious content requires review;
- Arabic/notation rules preserve scientific tokens such as `H2O` while validating visible numeral policy;
- exact duplicates are invalid for generated content;
- near-duplicates are `review_required` rather than auto-discarded;
- regeneration returns one changed question while preserving type/difficulty;
- output kind must match the registered mode.

## Direct-question boundary

Stage11 preserves legacy `direct` questions at the AI extraction contract so exact source/exam data is not lost. Current `0003_learning.sql` Question Bank supports only `multiple_choice | true_false`.

Therefore direct extraction is reviewable AI output but **not automatically publishable Question Bank data**. Stage11 did not widen the DB enum merely to pass tests. A later publish/persistence contract must resolve this explicitly.

## Exact Stage11 evidence

Exact head: `592123dae33f0cfce2ecd36e9577764767faa95a`.

- Stage11 AI Contract Verification `34004445273` — SUCCESS.
- OCR Foundation Verification `34004445384` — SUCCESS.
- Stage10 Media Pipeline `34004445278` — SUCCESS.
- Stage9 Content Import Verification `34004445277` — SUCCESS.
- Rebuild Stage Verification `34004445394` — SUCCESS, including Chromium activation/returning-login/recovery/rebind E2E.

Stage11 tests prove registry coverage/versioning, provider-neutral envelopes, chemistry notation, exact unresolved-answer review, exact quote rejection, religious review, exact duplicate rejection, wrong answer/index rejection, requested-count rejection, source/page provenance rejection, near-duplicate review and benchmark adapter failure/usage accounting.

No live provider/model quality claim was made; provider credentials/pricing/routing remain `NOT YET VERIFIED` until authorized benchmark execution.

## Architecture decisions added by Stage11

- **AD-080:** provider-neutral AI contracts; provider-specific payloads do not leak into domain services.
- **AD-081:** reviewed OCR + source/page/checksum evidence is the primary book-generation path; vision fallback is explicit/reviewed.
- **AD-082:** exact modes never invent certainty; unresolved answers remain unknown/review-required.
- **AD-083:** validators distinguish deterministic invalid output from human-review cases.
- **AD-084:** direct extraction is preserved but not silently persisted into the current Question Bank schema.
- **AD-085:** production routing/cascade requires benchmark evidence; Stage11 only supplies the common harness/contracts.

## Active Stage12 target

Do not create another orchestration architecture. Start by inspecting `database/migrations/0004_ai_and_sync.sql` and all AI job callers, then reuse/extend `ai_jobs`, `ai_job_units` and `ai_outputs` only where evidence requires it.

Target pipeline:

```text
Generation Plan
→ reviewed OCR source/page chunks
→ durable small units
→ scheduler/backpressure
→ AiModelRouter
→ provider/model adapter
→ Stage11 structured output
→ Stage11 validation
→ partial success persistence
→ Admin review
```

Stage12 requirements:

- deterministic per-unit idempotency;
- bounded global/provider/project/model concurrency;
- retry/backoff/jitter/cooldown by classified failure;
- partial success, cancel/resume/progress;
- no whole-book repeated prompts or giant in-memory batches;
- server-only provider configuration and budget ceilings;
- provider/model health and telemetry;
- prompt/source/model/token/latency/error/cost metadata;
- benchmark-approved cheap/fast → stronger-model cascade only for failed/uncertain units;
- never switch keys/projects to evade quotas or provider terms.

## Deployment / remaining work

Hosted Student/Admin/API/media/OCR/AI execution remains `NOT YET VERIFIED` while deployment is deferred. Do not publish or re-enable Git deployment without a new Product Owner instruction.

Ordered work:

1. Stage12 durable provider-neutral high-throughput AI execution.
2. Curriculum structure extension and Stage13+ from `MASTER_REBUILD_ROADMAP.md`.
3. Resolve direct-question publish persistence before Question Bank publishing depends on it.
4. Later restore/verify hosted runtime only when deployment is explicitly re-enabled.

## Continuation protocol

After every meaningful batch update Status, Engineering Log and Handoff; update specialized docs and parity evidence when affected; preserve exact commit/CI evidence; unexecuted work is `NOT YET VERIFIED`; never weaken tests/security/business rules for a green build.

## Current transition decision

**Stage11 is VERIFIED on `592123d…`; Stage11 + OCR + Stage10 + Stage9 + Full Rebuild/Chromium are green on that same executable head. Deployment remains deferred. Continue with Stage12 discovery and durable execution design.**
