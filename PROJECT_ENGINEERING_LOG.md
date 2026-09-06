# PROJECT ENGINEERING LOG

> Engineering source of truth for project understanding, architecture decisions, implementation history, verification evidence and remaining work. Repository + GitHub Actions + runtime evidence are authoritative; chat memory is not.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بثلاثة أسطح رئيسية:

- **Student Web/PWA (`apps/student-web`)**: Auth, curriculum, Reader, summaries, practice/tests/models, Notes, Favorites, Needs Review, progress/private achievements, notifications and Offline/PWA.
- **Admin Web (`apps/admin-web`)**: Super Admin only in current scope for curriculum/content/media/OCR/TTS/AI authoring/Question Bank/students/codes/recovery/device reset/notifications/import-export/reports/audit.
- **Backend API (`apps/api`)**: the only authoritative business-data path to private PostgreSQL.

Product governance:

- preserve the same product idea, core business outcomes and valuable legacy capabilities;
- legacy implementation is inventory/evidence, not a technical specification;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` are hard gates before later Student/Admin feature closure;
- unexecuted or unverified behavior is `NOT YET VERIFIED`;
- Product Review Batches 01–06 define the current Core Product.

Repository state:

- repo: `7eaur/alwaslh`;
- working branch: `planning/product-evolution-review` / draft PR #12;
- canonical Stage9 source: `7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`;
- exact latest verified executable head: `592123dae33f0cfce2ecd36e9577764767faa95a`;
- deployment: `DEFERRED BY PRODUCT OWNER`.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── private PostgreSQL
Student PWA ┘       │
                    ├── media/blob storage abstraction
                    ├── OCR extraction + reviewed searchable text
                    ├── Stage11 provider-neutral AI contracts
                    ├── Stage12 durable provider-neutral execution
                    ├── later TTS / notifications
                    └── account/device-scoped offline sync
```

Architecture rules:

- Browser never receives PostgreSQL/service credentials or performs authoritative business writes directly.
- Auth/Authorization/Entitlements are server-owned.
- Student and Admin are independent runtime surfaces.
- Final first activation state is atomic.
- Student device identity is cryptographic application-device proof, not IP/User-Agent/fingerprint.
- Upload/media success is independent from OCR/AI/TTS availability.
- Source media remains canonical evidence.
- Reviewed OCR text is the approved text evidence path.
- Provider/model-specific AI payloads stay behind adapters.
- Preview does not redefine Production architecture.
- Root-cause fixes are mandatory; no test/security/business-rule weakening for green CI.

## User Flows — Current Verified Infrastructure

### Student activation/login/recovery

```text
6-digit Full Code
→ non-consuming eligibility verification
→ one-time activation ticket
→ password + new P-256 device key/proof
→ atomic profile/credential/entitlement/redemption/device/audit finalization
→ device-bound HttpOnly session
```

Returning login requires password + one-time proof from the registered device key. Recovery revokes previous auth state, forces private-password replacement and retains device proof. Lost/replaced device requires explicit Admin reset/rebind and a NEW P-256 key; historical-key reuse is rejected.

### Content/media/OCR

```text
Stage9 canonical source inventory
→ Stage10 deterministic media variants/checksums/order
→ ready media AI variant
→ durable OCR lease/retry execution
→ raw + conservative normalized text
→ review gate
→ approved searchable/reusable text
```

### AI authoring contract

```text
reviewed OCR/source-page chunks
→ typed generation request
→ versioned Prompt Registry
→ provider-neutral envelope
→ structured output
→ schema/semantic/provenance/duplicate validation
→ valid | invalid | review_required
```

Actual durable routing/execution belongs to Stage12.

## Verified Engineering Baseline

- **Stage1 Product Inventory** — PASS.
- **Stage2 Brand** — PASS.
- **Stage3 UX Architecture** — PASS.
- **Stage4 PostgreSQL** — PASS.
- **Stage5 Engineering Foundation** — PASS.
- **Stage6 Auth & Authorization** — VERIFIED.
- **Stage7 Access Codes & Entitlements** — VERIFIED.
- **Stage8 Activation/Login/Recovery/Device** — VERIFIED.
- **Stage9 Deterministic Source Import** — VERIFIED; 15 roots / 48 source docs / 5,552 images / canonical digest `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.
- **Stage10 Media Pipeline** — VERIFIED.
- **OCR Extraction Foundation** — VERIFIED.
- **Stage11 Provider-Neutral AI Prompt / Output Contracts** — VERIFIED.

## Changes Made

### Stage6/8 Auth / Activation / Device

- two-step non-consuming Full Code verification;
- atomic activation finalization;
- password-only Student session bypass removed;
- purpose-bound registered-device challenge login;
- device-bound sessions;
- temporary-password recovery + forced private replacement;
- explicit Admin reset/rebind;
- historical device-key reuse rejection;
- non-extractable WebCrypto P-256 key stored in account-scoped IndexedDB.

Exact historical closure head: `016546eca5696337b52063903bb5ba2fb9631c33`.

### OCR Extraction Foundation

- `database/migrations/0011_ocr_foundation.sql`;
- durable `queued/running/retrying/completed/failed` work;
- `FOR UPDATE SKIP LOCKED` claims;
- UUID lease token + expiry;
- stale-worker completion/failure write rejection;
- execution-time media-ready/checksum/byte verification;
- raw text retention + conservative normalization;
- low-confidence/empty/sensitive review reasons;
- approved-only downstream search;
- provider-neutral `OcrProvider`;
- Tesseract CLI/TSV reference adapter with Arabic/English runtime smoke test.

Exact OCR closure head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

### Stage11 Provider-Neutral AI Contracts

Discovery inspected actual legacy `analyze-lesson` behavior, `0004_ai_and_sync.sql`, Product decisions, parity requirements and provider strategy before implementation.

Implemented `apps/api/src/ai`:

- `contracts.ts` — typed/Zod request, source, evidence, question and output contracts;
- `prompt-registry.ts` — complete versioned registry + provider-neutral prompt envelope;
- `validators.ts` — schema/semantic/provenance/count/notation/duplicate/review policy;
- `benchmark.ts` — common provider benchmark adapter interface and usage/result aggregation.

Supported modes:

- lesson summary;
- question generation;
- comprehensive lesson content;
- multi-version quiz;
- exact question extraction;
- exact exam extraction;
- replica question extraction;
- regenerate one question;
- page detection.

Legacy `extract_text` outcome is now provided by OCR Foundation instead of duplicating text extraction inside AI generation.

Stage11 correctness behavior:

- approved OCR + source/page/checksum chunks are the primary book-generation input;
- explicit vision fallback is review-gated;
- evidence outside the requested media/page set is invalid;
- exact-source quote mismatch is invalid;
- MCQ option count, T/F options, requested counts and version counts are deterministic checks;
- `answerText` must match `options[correctOptionIndex]` for known option answers;
- unknown/review answers cannot claim answer index/text;
- exact/exam/replica extraction may not use external model knowledge to manufacture certainty;
- exact/religious modes are review-gated;
- Arabic visible numeral policy preserves scientific tokens such as `H2O`/`Fe3O4`;
- exact duplicates are invalid in generated content;
- near-duplicates are review-required;
- regeneration must return one changed question while preserving type/difficulty;
- provider/model fields are not part of the domain prompt envelope.

Stage11 intentionally preserves `direct` extracted questions at the AI boundary, while current Question Bank persistence still supports only `multiple_choice | true_false`. No silent DB widening was performed.

## Architecture Decisions

Historical AD-064–068: Preview/build/TLS/media durability/provider quota decisions remain valid.

- **AD-069** — Student sessions are device-bound; password alone cannot create a Student session.
- **AD-070** — activation eligibility verification is non-consuming; final state changes are atomic.
- **AD-071** — recovery revokes old auth state and forces private-password replacement.
- **AD-072** — device rebind requires explicit Admin reset; historical key reuse is rejected.
- **AD-073** — Student private device key remains browser-local and non-extractable.
- **AD-074** — deployment may remain deferred while CI/PostgreSQL/browser verification continues; deferred hosted runtime is never PASS.
- **AD-075** — OCR is derived state and cannot redefine media success.
- **AD-076** — OCR provenance is Stage10 media/checksum-bound; no competing source/page model.
- **AD-077** — OCR durable work is lease-protected against stale writers.
- **AD-078** — downstream approved text/search/generation consumes reviewed OCR only.
- **AD-079** — Tesseract is a reference OCR adapter, not production lock-in.
- **AD-080** — AI domain contracts are provider/model-neutral; provider payloads stay inside adapters.
- **AD-081** — reviewed OCR + source/page/checksum evidence is the primary book-generation path; vision fallback is explicit/reviewed.
- **AD-082** — exact modes never invent certainty; unresolved answers remain unknown/review-required.
- **AD-083** — deterministic violations are `invalid`; uncertainty/sensitivity/near-duplicate cases may be `review_required`.
- **AD-084** — direct extracted questions are preserved but not silently persisted into the current Question Bank schema.
- **AD-085** — production routing/cascade requires benchmark evidence; Stage11 only defines the common harness/contracts.

## Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | legacy audit | account/security compromise | private Backend authorization | FIXED Stage6 |
| AUTH-006-004 | P1 | Student Auth | password-only Student session bypassed device policy | baseline behavior | device policy bypass | registered-device challenge + device-bound session | FIXED + VERIFIED |
| AUTH-006-005 | P1 | Recovery | recovery did not force private credential replacement | baseline/Product Review | weaker recovery | temporary password + revoke + forced change | FIXED + VERIFIED |
| AUTH-006-006 | P1 | Device | no explicit cryptographic reset/rebind history | baseline/Product Review | uncontrolled device movement | P-256 registry + reset + historical-key rejection | FIXED + VERIFIED |
| DATA-015 | P0 | Activation | partial/premature code consumption risk | baseline audit | partial account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Class Codes | racy redemption | Stage7 tests | double redemption/no-waste violation | row locks + transaction + idempotency | FIXED Stage7 |
| CONTENT-009-* | P1/P2 | Content | source completeness/order/digest defects | Stage9 inventory/tests | wrong/missing import | deterministic audited importer | FIXED + VERIFIED |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | Stage10 tests | corrupt/non-repeatable media | deterministic media pipeline | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable extraction/result contract | roadmap/discovery | no canonical reviewed text | `0011` + durable provider-neutral OCR | FIXED + VERIFIED |
| OCR-011-002 | P1 | OCR Concurrency | stale worker could overwrite newer state | implementation review | corrupt retry/result state | unexpired lease required for writes | FIXED + VERIFIED |
| OCR-011-003 | P1 | OCR Integrity | queued work could process media no longer ready | implementation review | invalid derived text | execution-time ready/checksum/byte guard | FIXED + VERIFIED |
| OCR-011-004 | P1 | OCR Review | high confidence could bypass empty/sensitive review | implementation review | unsafe downstream evidence | explicit empty/sensitive review gates | FIXED + VERIFIED |
| AI-011-001 | P1 | AI Architecture | legacy generation coupled prompts/provider/parsing/business modes | legacy `analyze-lesson` | lock-in and weak validation | Stage11 provider-neutral domain contracts | FIXED + VERIFIED |
| AI-011-002 | P1 | Exact Source | exact modes allowed external-knowledge answer guessing | legacy exact/replica prompts | fabricated educational certainty | unknown/review answer contract | FIXED + VERIFIED |
| AI-011-003 | P1 | Provenance | generated output lacked one authoritative source/page validation boundary | parity + legacy behavior | untraceable questions | source chunk/evidence validator | FIXED + VERIFIED |
| AI-011-004 | P2 | Duplication | exact duplicate handling did not cover near-duplicates | Stage11 hardening review | repetitive Question Bank output | exact duplicate invalid + near-duplicate review | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | AI exact extraction supports direct questions but current DB enum does not | `contracts.ts` vs `0003_learning.sql` | cannot safely auto-publish direct extraction | preserve reviewable output; later explicit persistence rule | OPEN / NOT YET VERIFIED |
| AI-NEW-002 | P1 | AI Scale | giant provider requests lose progress and overload systems | Product Review/roadmap | brittle expensive generation | durable units/scheduler/backpressure/cascade | ACTIVE Stage12 |
| PREVIEW-010-002 | P2 | Hosted Media/AI | durable hosted media/Poppler/OCR/AI execution unproven | runtime state | cannot claim hosted pipeline | verify later when deployment re-enabled | NOT YET VERIFIED |
| DOC-001 | P2 | Continuity | chat-memory dependency | governance audit | repeated/contradictory work | repository Status/Log/Handoff | CONTROLLED |

## Tests & Verification

### Stage6/8 historical closure

Exact head `016546eca5696337b52063903bb5ba2fb9631c33`:

- Rebuild `34002283741` — SUCCESS including Chromium.
- Stage9 `34002283819` — SUCCESS.
- Stage10 `34002283817` — SUCCESS.

### OCR closure

Exact head `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`:

- OCR `34003439653` — SUCCESS.
- Stage9 `34003439660` — SUCCESS.
- Stage10 `34003439659` — SUCCESS.
- Full Rebuild `34003439669` — SUCCESS including Chromium.

### Stage11 closure

Exact executable head `592123dae33f0cfce2ecd36e9577764767faa95a`:

- **Stage11 AI Contract Verification `34004445273` — SUCCESS**: lint, strict typecheck, golden/hardening tests, API build.
- **OCR Foundation Verification `34004445384` — SUCCESS**.
- **Stage10 Media Pipeline `34004445278` — SUCCESS**.
- **Stage9 Content Import Verification `34004445277` — SUCCESS**.
- **Rebuild Stage Verification `34004445394` — SUCCESS**, including Stage8 Chromium activation/returning-login/recovery/rebind E2E.

Golden/hardening coverage includes registry completeness/version identity, provider-neutral envelope, formula numeral exception, visible-digit rejection, unresolved exact answer review, exact quote mismatch, religious review, exact duplicate rejection, wrong index/answer rejection, count mismatch, provenance-outside-request rejection, near-duplicate review, adapter failure recording and usage/cost aggregation.

## Known Issues / Remaining Risk

- Development deployment = `DEFERRED BY PRODUCT OWNER`.
- Hosted Student/Admin/API/Poppler/durable media/OCR/AI workers = `NOT YET VERIFIED`.
- Durable hosted media adapter/runtime is not implemented/verified.
- Production OCR-provider quality benchmark is not executed.
- Live AI provider/model benchmark, credentials, production routing and cost evidence are not executed.
- Direct extracted-question persistence into the Question Bank is not resolved.
- Stage12 durable AI router/scheduler/cascade is not implemented yet.
- Reader Text/Search/TTS product surface is not implemented.
- Final Student PWA install/update/offline authorization lease is not runtime-verified.
- Published Question Bank practice/test engine is not implemented.
- Notes media, Favorites/Needs Review automation, Push and progress/weak-area pipelines remain.
- Later Admin/Student product, security/performance/accessibility/load/release/ops gates remain.

## Remaining Work — Ordered

1. **Stage12 Durable Provider-Neutral High-Throughput AI Execution**.
2. Curriculum structure extension and Stage13+ from `MASTER_REBUILD_ROADMAP.md` with parity/design-system gates.
3. Resolve direct-question publish persistence before Admin Question Bank publishing depends on it.
4. When Product Owner explicitly re-enables deployment, deliberately restore deployment and verify exact hosted Student/Admin/API/media/OCR/AI runtime before claiming PASS.

## Stage12 Active Scope

Do not invent another queue. First inspect `0004_ai_and_sync.sql` and all current/legacy AI job callers, then reuse/extend `ai_jobs`, `ai_job_units`, `ai_outputs` only where needed.

Target:

```text
Generation Plan
→ reviewed OCR source/page chunks
→ durable bounded units
→ scheduler/backpressure
→ AiModelRouter
→ provider/model adapter
→ Stage11 output contract
→ Stage11 validation
→ partial success persistence
→ Admin review
```

Required properties:

- deterministic per-unit idempotency;
- bounded global/provider/project/model concurrency;
- classified retry/backoff/jitter/cooldown;
- partial success, cancel/resume/progress;
- server-only provider configuration and budget ceilings;
- provider/model health/telemetry;
- prompt/source/model/token/latency/error/cost metadata;
- no whole-book repeated prompts or giant in-memory state;
- benchmark-approved cheap/fast → stronger model cascade only for failed/uncertain units;
- no switching credentials/projects to evade provider limits or terms.

## Documentation / Continuity Protocol

After every meaningful batch:

- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when architecture/branch/CI/Preview state changes;
- update specialized docs and parity evidence when affected;
- retain exact commit/CI/runtime evidence;
- unexecuted = `NOT YET VERIFIED`.

## Current State

**Stage11 Provider-Neutral AI Prompt / Output Contracts is VERIFIED on exact executable head `592123d…`; Stage11, OCR, Stage10, Stage9 and Full Rebuild/Chromium are all green on that same head. Deployment remains intentionally deferred. Current engineering phase is Stage12 Durable Provider-Neutral High-Throughput AI Execution.**
