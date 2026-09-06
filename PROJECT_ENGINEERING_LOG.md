# PROJECT ENGINEERING LOG

> Engineering source of truth for project understanding, architecture decisions, implementation history, verification evidence and remaining work. Repository + GitHub Actions + runtime evidence are authoritative; chat memory is not.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بثلاثة أسطح رئيسية:

- **Student Web/PWA (`apps/student-web`)**: auth, curriculum, Reader, summaries, practice/tests/models, Notes, Favorites, Needs Review, progress/private achievements, notifications and Offline/PWA.
- **Admin Web (`apps/admin-web`)**: Super Admin scope for curriculum/content/media/OCR/TTS/AI authoring/Question Bank/students/codes/recovery/device reset/notifications/import-export/reports/audit.
- **Backend API (`apps/api`)**: the authoritative business-data path to private PostgreSQL.

Governance:

- preserve the same product idea, business outcomes, important user flows and valuable legacy capabilities;
- legacy implementation is evidence/inventory, not the architecture specification;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` remain hard gates;
- unexecuted/unverified behavior is `NOT YET VERIFIED`;
- deployment remains `DEFERRED BY PRODUCT OWNER`.

Repository state:

- repo: `7eaur/alwaslh`;
- branch: `planning/product-evolution-review` / draft PR #12;
- latest fully verified executable baseline: `592123dae33f0cfce2ecd36e9577764767faa95a`;
- current Stage12 executable fix head: `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6`;
- documentation updated during Stage12 work; current Stage12 remains **ACTIVE / NOT YET VERIFIED**.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── private PostgreSQL
Student PWA ┘       │
                    ├── Stage10 media/blob identity
                    ├── OCR extraction + reviewed searchable text
                    ├── Stage11 provider-neutral AI contracts
                    ├── Stage12 durable AI execution
                    ├── later TTS / notifications
                    └── account/device-scoped offline sync
```

Architecture rules:

- browser never receives PostgreSQL/service credentials or performs authoritative business writes directly;
- auth/authorization/entitlements are server-owned;
- Student and Admin are independent runtime surfaces;
- upload/media success is independent from OCR/AI/TTS;
- source media remains canonical evidence;
- only reviewed/approved OCR is approved downstream text evidence;
- provider/model-specific AI payloads remain behind adapters;
- network/provider calls do not run inside long DB transactions;
- stale workers may not commit after lease expiry/cancellation;
- Preview does not redefine Production architecture;
- root-cause fixes are mandatory; no test/security/business-rule weakening for green CI.

## User Flows — Verified Infrastructure

### Student activation/login/recovery

```text
6-digit Full Code
→ non-consuming eligibility verification
→ one-time activation ticket
→ password + new P-256 device key/proof
→ atomic profile/credential/entitlement/redemption/device/audit finalization
→ device-bound HttpOnly session
```

Returning login requires password + proof from the registered device key. Recovery revokes previous auth state, forces private-password replacement and retains device policy. Lost/replaced device requires explicit Admin reset/rebind and a NEW P-256 key; historical-key reuse is rejected.

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

### AI execution

```text
reviewed OCR/source-page chunks
→ Stage11 typed generation request
→ durable ai_jobs / ai_job_units
→ short transactional claim + lease
→ AiModelRouter
→ provider adapter call outside DB transaction
→ Stage11 structured validation
→ lease-protected output/attempt persistence
→ retry | review_required | completed | failed
→ job progress / partial success
```

## Verified Engineering Baseline

- **Stage1 Product Inventory** — PASS.
- **Stage2 Brand** — PASS.
- **Stage3 UX Architecture** — PASS.
- **Stage4 PostgreSQL** — PASS.
- **Stage5 Engineering Foundation** — PASS.
- **Stage6 Auth & Authorization** — VERIFIED.
- **Stage7 Access Codes & Entitlements** — VERIFIED.
- **Stage8 Activation/Login/Recovery/Device** — VERIFIED.
- **Stage9 Deterministic Source Import** — VERIFIED; 15 roots / 48 source documents / 5,552 images / canonical digest `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.
- **Stage10 Media Pipeline** — VERIFIED.
- **OCR Extraction Foundation** — VERIFIED.
- **Stage11 Provider-Neutral AI Prompt / Output Contracts** — VERIFIED.
- **Stage12 Durable Provider-Neutral AI Execution** — ACTIVE / NOT YET VERIFIED.

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

Historical closure head: `016546eca5696337b52063903bb5ba2fb9631c33`.

### OCR Extraction Foundation

- `database/migrations/0011_ocr_foundation.sql`;
- durable `queued/running/retrying/completed/failed` work;
- `FOR UPDATE SKIP LOCKED` claim;
- UUID lease token + expiry;
- stale-worker completion/failure rejection;
- execution-time media-ready/checksum/byte verification;
- raw text + conservative normalization;
- low-confidence/empty/sensitive review gates;
- approved-only downstream search;
- provider-neutral `OcrProvider`;
- Tesseract Arabic/English reference adapter/runtime smoke.

Historical closure head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

### Stage11 Provider-Neutral AI Contracts

Implemented under `apps/api/src/ai`:

- `contracts.ts` — typed/Zod request/source/evidence/question/output contracts;
- `prompt-registry.ts` — versioned registry + provider-neutral prompt envelope;
- `validators.ts` — schema/semantic/provenance/count/notation/duplicate/review policy;
- `benchmark.ts` — provider-neutral benchmark adapter/result/usage abstraction.

Important Stage11 rules:

- approved OCR + source/page/checksum is the primary generation evidence path;
- evidence outside the request source set is invalid;
- exact-source quote mismatch is invalid;
- requested counts/version counts are enforced;
- MCQ requires four options and T/F requires exactly `["صح", "خطأ"]`;
- known answer index/text must agree;
- uncertain/exact-source answers may remain `unknown`/`review_required` and may not be fabricated;
- exact/religious modes remain review-gated;
- Arabic visible numeral policy preserves scientific tokens such as `H2O`/`Fe3O4`;
- exact duplicates are invalid, near-duplicates are review-required;
- regeneration returns exactly one materially changed question preserving type/difficulty;
- provider/model fields do not enter the Stage11 domain envelope.

Stage11 preserves `direct` extracted questions at the AI boundary, while current Question Bank persistence still supports only `multiple_choice | true_false`. No silent DB widening was performed.

Exact verified Stage11 head: `592123dae33f0cfce2ecd36e9577764767faa95a`.

### Stage12 Discovery — 2026-09-06

Actual repository inspection completed before implementation:

- `database/migrations/0004_ai_and_sync.sql` already defines `ai_jobs`, `ai_job_units` and `ai_outputs`;
- current `apps/api/src/app.ts` registered auth/activation/access routes, with no AI execution route;
- current `apps/api/src/server.ts` starts only the HTTP API, with no AI worker lifecycle;
- current `apps/api/package.json` had no AI worker command;
- `apps/api/src/ai` contained Stage11 contracts/registry/validators/benchmark only;
- integration tests had no AI execution lifecycle coverage;
- Admin exposed an AI operations shell but no authoritative execution API.

Conclusion: `0004` was durable-schema foundation not yet connected to a current worker. **REUSE/IMPROVE** was chosen; creating a parallel queue/orchestration system was rejected.

### Stage12 Durable Execution — First Implementation Batch

Initial implementation commit: `9f44881a24cc30fed958f72f6f5bbc1fc4f9b1a8` with formatter follow-ups through `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6`.

Implemented:

- additive `database/migrations/0012_ai_execution.sql`;
- lease/attempt execution fields on existing durable AI units;
- `ai_execution_attempts` history/telemetry;
- `AiProviderAdapter` / provider error classification boundary;
- `AiModelRouter` route abstraction;
- `AiExecutionRepository` for idempotent plan persistence, lease claims, attempt telemetry, outputs, cancellation and job reconciliation;
- `AiExecutionService` for plan validation/fingerprinting, provider execution, Stage11 validation, cascade/retry and durable completion;
- Stage12 PostgreSQL integration tests;
- Stage12 GitHub Actions verification workflow.

Execution correctness invariants:

1. claim/lease is a short DB transaction;
2. provider/network call happens outside the transaction;
3. completion/failure/output write requires the current unexpired lease token;
4. cancellation clears execution authority so a late provider response cannot commit;
5. same idempotency key + changed plan fingerprint is rejected;
6. route attempt history is independent from unit retry count, allowing bounded cascade attempts inside one claimed execution;
7. provider secrets are never stored; aliases/metadata only;
8. Stage11 validation remains authoritative before durable output status is accepted;
9. invalid output may retry only within bounded `maxAttempts`;
10. `review_required` is durable review state, not fabricated certainty;
11. partial success updates aggregate job counters instead of losing already completed units.

Telemetry currently stores when available:

- provider key;
- model used;
- project/credential aliases (not secret values);
- route key / benchmark version;
- provider request id;
- input/output token counts;
- latency;
- optional estimated cost in USD micros;
- validation status;
- retryability/error code/message;
- provider metadata.

Current intentional limits / NOT YET VERIFIED:

- no production provider credential/configuration;
- no real provider benchmark route selection;
- no global/provider/project/model concurrency limiter yet beyond durable claim safety;
- no health/cooldown/budget eligibility policy yet;
- no dedicated long-running worker entrypoint yet;
- no Admin execution/query/cancel surface yet;
- deployment remains deferred.

## Architecture Decisions

Historical AD-064–079 remain valid for Preview/build/TLS/media/auth/OCR boundaries.

- **AD-080** — AI domain contracts are provider/model-neutral; provider payloads stay inside adapters.
- **AD-081** — reviewed OCR + source/page/checksum evidence is the primary book-generation path; vision fallback is explicit/reviewed.
- **AD-082** — exact modes never invent certainty; unresolved answers remain unknown/review-required.
- **AD-083** — deterministic violations are `invalid`; uncertainty/sensitivity/near-duplicate cases may be `review_required`.
- **AD-084** — direct extracted questions are preserved but not silently persisted into the current Question Bank schema.
- **AD-085** — production routing/cascade requires benchmark evidence.
- **AD-086** — Stage12 reuses/extents `ai_jobs`, `ai_job_units`, `ai_outputs`; no second queue/orchestration model.
- **AD-087** — AI provider calls occur outside DB transactions; DB work is claim/attempt/finalization only.
- **AD-088** — AI writes are lease-protected; stale/expired/cancelled workers cannot commit results.
- **AD-089** — provider/model/project/credential are adapter/router metadata; secrets are server-only and never persisted in execution rows.
- **AD-090** — model cascade is bounded to configured/benchmark-approved routes and must not rotate credentials/projects to evade quotas or terms.
- **AD-091** — partial success is a first-class durable outcome; one failed unit must not erase completed units.

## Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | legacy anonymous privileged mutation | legacy audit | account/security compromise | private Backend authorization | FIXED Stage6 |
| AUTH-006-004 | P1 | Student Auth | password-only Student session bypassed device policy | baseline behavior | device policy bypass | registered-device challenge + device-bound session | FIXED + VERIFIED |
| AUTH-006-005 | P1 | Recovery | recovery did not force private credential replacement | baseline/Product Review | weaker recovery | temporary password + revoke + forced change | FIXED + VERIFIED |
| AUTH-006-006 | P1 | Device | no explicit cryptographic reset/rebind history | baseline/Product Review | uncontrolled device movement | P-256 registry + reset + historical-key rejection | FIXED + VERIFIED |
| DATA-015 | P0 | Activation | partial/premature code consumption risk | baseline audit | partial account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Class Codes | racy redemption | Stage7 tests | double redemption/no-waste violation | row locks + transaction + idempotency | FIXED + VERIFIED |
| CONTENT-009-* | P1/P2 | Content | source completeness/order/digest defects | Stage9 inventory/tests | wrong/missing import | deterministic audited importer | FIXED + VERIFIED |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | Stage10 tests | corrupt/non-repeatable media | deterministic media pipeline | FIXED + VERIFIED |
| OCR-011-001 | P1 | OCR | no durable extraction/result contract | roadmap/discovery | no canonical reviewed text | `0011` + durable provider-neutral OCR | FIXED + VERIFIED |
| OCR-011-002 | P1 | OCR Concurrency | stale worker could overwrite newer state | implementation review | corrupt retry/result state | unexpired lease required for writes | FIXED + VERIFIED |
| OCR-011-003 | P1 | OCR Integrity | queued work could process media no longer ready | implementation review | invalid derived text | execution-time ready/checksum/byte guard | FIXED + VERIFIED |
| OCR-011-004 | P1 | OCR Review | confidence could bypass empty/sensitive review | implementation review | unsafe downstream evidence | explicit review gates | FIXED + VERIFIED |
| AI-011-001 | P1 | AI Architecture | legacy generation coupled prompts/provider/parsing/business modes | legacy audit | lock-in/weak validation | Stage11 provider-neutral contracts | FIXED + VERIFIED |
| AI-011-002 | P1 | Exact Source | external-knowledge answer guessing | legacy exact prompts | fabricated certainty | unknown/review contract | FIXED + VERIFIED |
| AI-011-003 | P1 | Provenance | no authoritative source/page validation boundary | parity/legacy | untraceable output | evidence validator | FIXED + VERIFIED |
| AI-011-004 | P2 | Duplication | no near-duplicate handling | Stage11 hardening | repetitive bank output | exact invalid + near-duplicate review | FIXED + VERIFIED |
| AI-011-005 | P2 | Question Bank | AI supports `direct`, DB bank enum does not | contracts vs `0003_learning.sql` | unsafe auto-publish | preserve reviewable output; later explicit rule | OPEN / NOT YET VERIFIED |
| AI-012-001 | P1 | AI Execution | `0004` durable tables had no current worker/caller | Stage12 discovery | no durable execution path | reuse/extend tables + execution service | IMPLEMENTED / VERIFYING |
| AI-012-002 | P1 | AI Concurrency | stale worker could commit late provider result | Stage12 design review | corrupted output/retry state | UUID lease + expiry + lease-protected writes | IMPLEMENTED / VERIFYING |
| AI-012-003 | P1 | AI Transactions | provider call inside transaction would hold DB resources | architecture review | contention/timeouts | provider call outside DB transaction | IMPLEMENTED / VERIFYING |
| AI-012-004 | P1 | AI Idempotency | same request key could represent changed plan | execution review | duplicate/wrong plan replay | canonical plan fingerprint conflict check | IMPLEMENTED / VERIFYING |
| AI-012-005 | P1 | AI Cancellation | late worker could commit after cancel | execution review | cancelled job resurrected | clear lease + stale-write rejection | IMPLEMENTED / VERIFYING |
| AI-012-006 | P1 | AI Scale | no bounded global/provider/project/model concurrency policy yet | Stage12 scope | provider/DB overload risk | add explicit backpressure/limits after core verification | OPEN |
| AI-012-007 | P1 | AI Operations | no health/cooldown/budget policy yet | Stage12 scope | uncontrolled route eligibility/cost | bounded router policy + telemetry | OPEN |
| AI-012-008 | P2 | AI Worker | HTTP server is not a worker lifecycle | code inventory | no production polling/shutdown path | dedicated worker entrypoint after core stability | OPEN |
| PREVIEW-010-002 | P2 | Hosted Media/AI | hosted durable media/OCR/AI runtime unproven | deployment deferred | cannot claim hosted pipeline | verify later when deployment re-enabled | NOT YET VERIFIED |
| DOC-001 | P2 | Continuity | chat-memory dependency | governance audit | repeated/contradictory work | Status/Log/Handoff maintained in repo | CONTROLLED |

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

- Stage11 `34004445273` — SUCCESS: lint, strict typecheck, golden/hardening tests, API build.
- OCR `34004445384` — SUCCESS.
- Stage10 `34004445278` — SUCCESS.
- Stage9 `34004445277` — SUCCESS.
- Full Rebuild `34004445394` — SUCCESS including Stage8 Chromium E2E.

### Stage12 current verification history

Initial execution batch: `9f44881a24cc30fed958f72f6f5bbc1fc4f9b1a8`.

Early Stage11/Stage12 runs exposed Biome-only formatting/non-null-assertion issues; fixes were applied without weakening execution semantics.

Exact head `00c1affe9e7fb1fce4d9e305e7bd650beb8c4e9b` then triggered six failures at the same API lint gate. Stage12 run `34005458936` showed the sole remaining error: Biome requested one import line in `apps/api/src/ai/execution-service.ts` to be collapsed. TypeScript, unit tests, build, migrations and PostgreSQL integration were skipped because lint failed first.

Affected runs on that same head:

- Stage12 `34005458936` — FAILURE at shared lint.
- Stage11 `34005458938` — FAILURE at shared lint.
- Rebuild `34005458950` — FAILURE at shared lint.
- OCR `34005458953` — FAILURE at shared lint.
- Stage9 `34005458943` — FAILURE at shared lint.
- Stage10 `34005458954` — FAILURE at shared lint.

The final requested Biome import format was applied in executable fix commit `cc2e2b6696c0a0b02b18f4d14e3c3cb39b0397e6`.

**Current verification status: NOT YET VERIFIED.** A new same-head run must reach and pass TypeScript, unit tests, build, clean migrations, Stage12 PostgreSQL lifecycle tests and all lower-layer regressions before Stage12 can be closed.

## Known Issues / Remaining Risk

- deployment remains `DEFERRED BY PRODUCT OWNER`;
- hosted Student/Admin/API/media/OCR/AI workers remain `NOT YET VERIFIED`;
- production OCR quality benchmark remains unexecuted;
- live AI provider/model benchmark, credentials, pricing, production routing and cost evidence are unexecuted;
- direct extracted-question persistence into Question Bank remains unresolved;
- Stage12 explicit concurrency/backpressure, health/cooldown/budget policy and dedicated worker lifecycle remain open after core verification;
- Admin AI operations surface is not connected yet;
- Reader Text/Search/TTS product surface is not implemented;
- final Student PWA install/update/offline authorization lease is not runtime-verified;
- published Question Bank practice/test engine and later product surfaces remain.

## Remaining Work — Ordered

1. Make Stage12 execution core same-head green: lint → typecheck → unit → build → migrations → PostgreSQL lifecycle → lower-layer regressions.
2. Add bounded global/provider/project/model concurrency/backpressure.
3. Add health/cooldown/budget route eligibility and cost controls.
4. Add dedicated worker lifecycle with graceful shutdown/bounded polling.
5. Add authenticated Admin execution/query/cancel/review APIs/UI only after core service is stable.
6. Run real benchmark evidence before production provider/model defaults.
7. Curriculum structure extension and Stage13+ from `MASTER_REBUILD_ROADMAP.md`.
8. Resolve direct-question publish persistence before Question Bank publish workflows depend on it.
9. Restore/verify hosted deployment only when Product Owner explicitly re-enables it.

## Documentation / Continuity Protocol

After every meaningful batch:

- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when architecture/branch/CI state changes;
- update specialized docs/parity evidence when affected;
- retain exact commit/CI/runtime evidence;
- unexecuted = `NOT YET VERIFIED`.

## Current State

**Stage11 remains VERIFIED on executable baseline `592123d…`. Stage12 execution core is implemented but NOT YET VERIFIED. Discovery proved the correct architecture is to reuse/extend the existing `ai_jobs / ai_job_units / ai_outputs` foundation. Current executable fix head is `cc2e2b6…`; the immediately previous head failed only at a shared Biome lint gate before deeper tests ran. Deployment remains deferred.**
