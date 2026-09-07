# PROJECT ENGINEERING LOG

> Engineering source of truth for project understanding, architecture decisions, implementation history, verification evidence and remaining work. Repository + GitHub Actions + runtime evidence are authoritative; chat memory is not.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بثلاثة أسطح رئيسية:

- **Student Web/PWA (`apps/student-web`)**: activation/auth, curriculum, Reader, summaries, practice/tests/models, Notes, Favorites, Needs Review, progress/private achievements, notifications and Offline/PWA.
- **Admin Web (`apps/admin-web`)**: Super Admin scope for curriculum/content/media/OCR/TTS/AI authoring/Question Bank/students/codes/recovery/device reset/notifications/import-export/reports/audit.
- **Backend API (`apps/api`)**: authoritative business-data path to private PostgreSQL and derived media/OCR/AI services.

Governance:

- preserve product idea, business outcomes, important user flows and valuable legacy capabilities;
- legacy implementation is evidence/inventory, not architecture specification;
- `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` are hard gates;
- unexecuted/unverified behavior is `NOT YET VERIFIED`;
- deployment remains `DEFERRED BY PRODUCT OWNER`.

Repository state:

- repo: `7eaur/alwaslh`;
- branch: `planning/product-evolution-review` / draft PR #12;
- latest fully verified executable baseline: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`;
- Stage12 execution core: **VERIFIED**;
- Stage12 distributed concurrency/backpressure: **VERIFIED**;
- Stage12 health/cooldown/Retry-After/budget controls: **VERIFIED**;
- Stage12 explicit job pause/resume/progress: **ACTIVE NEXT**;
- dedicated worker lifecycle: **NOT YET VERIFIED**.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── private PostgreSQL
Student PWA ┘       │
                    ├── Stage10 media/blob identity
                    ├── OCR extraction + reviewed searchable text
                    ├── Stage11 provider-neutral AI contracts
                    ├── Stage12 durable AI execution + distributed admission/control
                    ├── later TTS / notifications
                    └── account/device-scoped offline sync
```

Architecture rules:

- browser never receives PostgreSQL/service-provider credentials or performs authoritative business writes directly;
- auth/authorization/entitlements are server-owned;
- Student and Admin are independent runtime surfaces;
- upload/media success is independent from OCR/AI/TTS;
- source media remains canonical evidence;
- only reviewed/approved OCR is approved downstream text evidence;
- provider/model-specific payloads remain behind adapters;
- provider/network calls do not run inside long DB transactions;
- stale/expired/cancelled workers may not commit execution results or telemetry;
- distributed concurrency and operational controls are coordinated by PostgreSQL, not only process memory;
- route operational state is keyed by full route identity, not `route_key` alone;
- no credential/project switching to evade provider quotas/terms;
- root-cause fixes are required; no test/security/business-rule weakening for green CI.

## User Flows

### Student activation/login/recovery — VERIFIED

```text
6-digit Full Code
→ non-consuming eligibility verification
→ one-time activation ticket
→ password + new P-256 device key/proof
→ atomic profile/credential/entitlement/redemption/device/audit finalization
→ device-bound HttpOnly session
```

Returning login requires password + proof from the registered device key. Recovery revokes previous auth state, forces private-password replacement and retains device policy. Lost/replaced device requires explicit Admin reset/rebind and a NEW P-256 key; historical-key reuse is rejected.

### Content/media/OCR — VERIFIED

```text
Stage9 canonical source inventory
→ Stage10 deterministic media variants/checksums/order
→ ready media AI variant
→ durable OCR lease/retry execution
→ raw + conservative normalized text
→ review gate
→ approved searchable/reusable text
```

### AI execution — CORE + CAPACITY + OPERATIONAL CONTROLS VERIFIED

```text
reviewed OCR/source-page chunks
→ Stage11 typed generation request
→ durable ai_jobs / ai_job_units
→ short transactional claim + lease
→ distributed capacity + kill/cooldown/budget admission
→ AiModelRouter
→ provider adapter call OUTSIDE DB transaction
→ Stage11 structured validation
→ lease-protected attempt/output persistence
→ retry | review_required | completed | failed
→ job progress / partial success
```

Capacity/cooldown/budget pressure is operational, not semantic: the unit keeps its intended `resume_route_key`, does not consume another semantic retry, and does not silently jump to a more expensive route merely because it has capacity.

## Stage Classification

| Stage | Classification | State |
|---|---|---|
| 1 Product Inventory | KEEP | VERIFIED |
| 2 Brand | KEEP / IMPROVE later in product surfaces | VERIFIED |
| 3 UX Architecture | KEEP / EVOLVE by product decisions | VERIFIED baseline |
| 4 PostgreSQL Platform | KEEP / additive migrations | VERIFIED |
| 5 Engineering Foundation | KEEP | VERIFIED |
| 6 Auth & Authorization | REFACTOR completed | VERIFIED |
| 7 Access Codes & Entitlements | KEEP | VERIFIED |
| 8 Activation/Login/Recovery/Device | REFACTOR completed | VERIFIED |
| 9 Source Import | KEEP | VERIFIED |
| 10 Media Pipeline | KEEP | VERIFIED |
| OCR Foundation | KEEP | VERIFIED |
| 11 AI Contracts | KEEP | VERIFIED |
| 12 AI Execution | REBUILD execution layer over existing durable tables | CORE + CAPACITY + CONTROLS VERIFIED; PAUSE/RESUME ACTIVE NEXT |

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

Rules verified:

- approved OCR + source/page/checksum is the primary generation evidence path;
- evidence outside request source set is invalid;
- exact-source quote mismatch is invalid;
- requested counts/version counts are enforced;
- MCQ requires four options and T/F exactly `["صح", "خطأ"]`;
- known answer index/text must agree;
- unresolved/exact-source answers may remain `unknown`/`review_required` and may not be fabricated;
- exact/religious modes remain review-gated;
- Arabic visible numeral policy preserves scientific tokens such as `H2O`/`Fe3O4`;
- exact duplicates are invalid, near-duplicates are review-required;
- regeneration returns exactly one materially changed question preserving type/difficulty;
- provider/model fields do not enter the Stage11 domain envelope.

Stage11 preserves `direct` extracted questions at the AI boundary while current Question Bank persistence still supports only `multiple_choice | true_false`; no silent schema widening was performed.

Original Stage11 closure head: `592123dae33f0cfce2ecd36e9577764767faa95a`.

### Stage12 Discovery — 2026-09-06

Source/caller inspection before implementation found:

- `database/migrations/0004_ai_and_sync.sql` already defines `ai_jobs`, `ai_job_units`, `ai_outputs`;
- `apps/api/src/app.ts` registered auth/activation/access, no AI execution route;
- `apps/api/src/server.ts` starts HTTP only;
- `apps/api/package.json` had no AI worker command;
- `apps/api/src/ai` contained Stage11 contracts/registry/validators/benchmark only;
- integration tests had no AI execution lifecycle coverage;
- Admin exposed an AI operations shell but no authoritative execution API.

Decision: **REUSE/IMPROVE existing durable AI tables.** A parallel queue/orchestration system was rejected.

### Stage12 Durable Execution Core — VERIFIED

Initial implementation commit: `9f44881a24cc30fed958f72f6f5bbc1fc4f9b1a8`.
Final verified execution-core head: `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`.

Implemented:

- additive `database/migrations/0012_ai_execution.sql`;
- lease/max-attempt execution fields on existing AI units;
- `ai_execution_attempts` history/telemetry;
- `AiProviderAdapter` / provider error classification boundary;
- `AiModelRouter` route abstraction;
- `AiExecutionRepository` for idempotent plan persistence, leases, attempt telemetry, outputs, cancellation and aggregate reconciliation;
- `AiExecutionService` for plan validation/fingerprinting, provider execution, Stage11 validation, cascade/retry and durable completion;
- Stage12 PostgreSQL integration tests;
- Stage12 GitHub Actions verification workflow.

Execution invariants verified:

1. claim/lease is a short DB transaction;
2. provider/network call happens outside the transaction;
3. running unit state requires lease token + lease expiry and non-running state requires neither;
4. attempt success/failure itself requires the current unexpired lease;
5. completion/failure/output persistence requires the same current lease;
6. cancellation removes execution authority before a late provider response can commit;
7. same idempotency key + changed plan fingerprint is rejected;
8. route attempt count is independent from unit execution retry count, allowing bounded cascade inside a claim;
9. provider secrets are never stored; aliases/metadata only;
10. Stage11 validation remains authoritative;
11. invalid output retries only within bounded `maxAttempts`;
12. `review_required` is durable review state, not fabricated certainty;
13. partial success updates aggregate job counters instead of losing completed units;
14. cancellation and attempt completion use compatible unit→attempt lock ordering.

### Stage12 Distributed Concurrency / Backpressure — VERIFIED

Final verified head: `881102ff94711f908104cd068a003ad598609944`.

Implemented:

- additive `database/migrations/0013_ai_capacity_control.sql`;
- route capacity policy for provider/project/model;
- service-level global capacity;
- PostgreSQL transaction-scoped advisory lock serializes only admission + attempt insert, never provider calls;
- running attempt counts enforce global/provider/project/model ceilings across worker processes;
- `resume_route_key` preserves the intended route when capacity is full;
- `capacity_deferred_count` records operational deferrals;
- repeated capacity deferrals do not increment `attempt_count` again;
- capacity pressure does not trigger route cascade;
- race tests prove two simultaneous workers cannot over-admit a global/provider/project/model limit.

Verification:

- Stage12 `34007356406` — SUCCESS.
- Stage11 `34007356417` — SUCCESS.
- OCR `34007356407` — SUCCESS.
- Stage10 `34007356429` — SUCCESS.
- Stage9 `34007356442` — SUCCESS.
- Full Rebuild `34007356410` — SUCCESS including Chromium.

### Stage12 Health / Cooldown / Budget Controls — VERIFIED

Final verified head: `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`.

Implemented:

- additive `database/migrations/0014_ai_execution_controls.sql`;
- `AiExecutionControl` as a separate distributed operational-admission module;
- singleton global kill switch;
- route runtime state keyed by full route identity;
- route kill switch;
- persisted cooldown state;
- provider Retry-After → distributed cooldown;
- consecutive retryable-failure health counter + threshold cooldown;
- optional global + route budget windows;
- pre-call global/route budget reservations persisted on each attempt;
- budget admission under the same advisory transaction lock as capacity;
- usage calculation uses `max(configured reservation, reported estimated cost)` inside the active window;
- `control_deferred_count` + explicit operational reason;
- operational deferral keeps `resume_route_key` and does not consume another semantic retry;
- PostgreSQL integration tests for global/route kill switches, cooldown/Retry-After, race-safe global budget admission and route budget ceiling.

Route runtime identity invariant:

```text
route_key
+ provider_key
+ provider_project_alias
+ credential_alias
+ model_used
```

`route_key` alone is not globally unique. Migration `0014` uses a surrogate UUID PK plus `UNIQUE NULLS NOT DISTINCT` over the full identity. All health/cooldown/budget reads/writes and route-budget attempt aggregation use the same full identity.

Budget control is a **configured reservation ceiling**, not proof of actual provider invoice accuracy. Live pricing, token ceilings, provider billing and reconciliation remain `NOT YET VERIFIED`.

Verification:

- Stage12 `34086168715` — SUCCESS including lifecycle, capacity and control tests.
- Stage11 `34086168704` — SUCCESS.
- OCR `34086168712` — SUCCESS.
- Stage10 `34086168727` — SUCCESS.
- Stage9 `34086168687` — SUCCESS.
- Full Rebuild `34086168772` — SUCCESS including Chromium.

## Architecture Decisions

Historical AD-064–079 remain valid for Preview/build/TLS/media/auth/OCR boundaries.

- **AD-080** — AI domain contracts are provider/model-neutral; provider payloads stay inside adapters.
- **AD-081** — reviewed OCR + source/page/checksum evidence is the primary book-generation path; vision fallback is explicit/reviewed.
- **AD-082** — exact modes never invent certainty; unresolved answers remain unknown/review-required.
- **AD-083** — deterministic violations are `invalid`; uncertainty/sensitivity/near-duplicate cases may be `review_required`.
- **AD-084** — direct extracted questions are preserved but not silently persisted into current Question Bank schema.
- **AD-085** — production routing/cascade requires benchmark evidence.
- **AD-086** — Stage12 reuses/extends `ai_jobs`, `ai_job_units`, `ai_outputs`; no second queue/orchestration model.
- **AD-087** — AI provider calls occur outside DB transactions; DB work is claim/attempt/finalization only.
- **AD-088** — AI attempt/unit/output writes are lease-protected; stale/expired/cancelled workers cannot commit.
- **AD-089** — provider/model/project/credential are adapter/router metadata; secrets are server-only and never persisted in execution rows.
- **AD-090** — cascade is bounded to explicitly configured routes and must not rotate credentials/projects to evade quotas or terms.
- **AD-091** — partial success is first-class; one failed unit does not erase completed units.
- **AD-092** — distributed throughput limits must be database-coordinated, not only process-local, because multiple worker processes may run concurrently.
- **AD-093** — capacity/control pressure is operational state: preserve `resume_route_key`, defer without another semantic retry, and never escalate solely because the intended route is temporarily blocked.
- **AD-094** — global/route kill switch, cooldown and budget admission are PostgreSQL-coordinated and checked before attempt insertion/provider execution.
- **AD-095** — budget admission uses conservative configured reservations; actual provider billing remains a separate unverified evidence layer.
- **AD-096** — route operational state is keyed by full route identity; `route_key` is not strengthened into a global uniqueness contract.
- **AD-097** — explicit job pause/resume must be modeled separately from internal `resume_route_key`; cancellation remains terminal.
- **AD-098** — the AI worker runtime must be a process separate from the HTTP server; Fastify is not the queue poller.

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
| AI-012-001 | P1 | AI Execution | `0004` durable tables had no current worker/caller | Stage12 discovery | no durable execution path | reuse/extend tables + execution service | FIXED + VERIFIED core |
| AI-012-002 | P1 | AI Concurrency | stale worker could commit late provider result | Stage12 design review | corrupted output/retry state | UUID lease + expiry + lease-protected writes | FIXED + VERIFIED |
| AI-012-003 | P1 | AI Transactions | provider call inside transaction would hold DB resources | architecture review | contention/timeouts | provider call outside DB transaction | FIXED + VERIFIED |
| AI-012-004 | P1 | AI Idempotency | same request key could represent changed plan | execution review | duplicate/wrong plan replay | canonical plan fingerprint conflict check | FIXED + VERIFIED |
| AI-012-005 | P1 | AI Cancellation | late worker could commit after cancel | execution review | cancelled job resurrected | clear lease + stale-write rejection | FIXED + VERIFIED |
| AI-012-006 | P1 | AI Scale | no bounded distributed global/provider/project/model concurrency policy | Stage12 requirements | provider/DB overload risk | DB-coordinated capacity/backpressure | FIXED + VERIFIED |
| AI-012-007 | P1 | AI Operations | no distributed health/cooldown/budget/kill-switch policy | Stage12 requirements | uncontrolled route eligibility/cost | PostgreSQL runtime controls + tests | FIXED + VERIFIED |
| AI-012-008 | P2 | AI Worker | HTTP server is not a worker lifecycle | code inventory | no production polling/shutdown path | dedicated worker process/runtime | OPEN |
| AI-012-009 | P1 | AI Lease Telemetry | stale worker could finalize attempt telemetry after lease expiry | static review before CI closure | misleading telemetry + stale state transition | lease-protect attempt completion + strong running-lease constraint | FIXED + VERIFIED |
| AI-012-010 | P3 | Stage12 Test | joined lifecycle test used ambiguous unqualified `status` | run `34006606146`, PostgreSQL `42702` | false-negative verification | qualify `a.status` / `a.attempt_number` | FIXED + VERIFIED |
| AI-012-011 | P3 | Stage12 Capacity Validation | initial capacity head failed shared Biome formatting/import ordering | head `0091ba…` | blocked runtime signal | formatter-only correction, assertions unchanged | FIXED + VERIFIED |
| AI-012-012 | P2 | AI Budget Evidence | configured reservation ceiling is not actual provider billing evidence | no live provider/pricing yet | false cost certainty if overstated | keep billing/pricing explicitly NOT YET VERIFIED | CONTROLLED / OPEN EVIDENCE |
| AI-012-013 | P1 | AI Route Runtime Identity | control state assumed `route_key` globally unique and broke existing routers that reuse keys | Stage12 run `34085847128` lifecycle failure | regression + possible cooldown/budget cross-talk | surrogate PK + full-identity `UNIQUE NULLS NOT DISTINCT`; all state/budget queries use full identity | FIXED + VERIFIED |
| AI-012-014 | P2 | AI Job Lifecycle | `resume_route_key` is internal route continuation, not explicit job pause/resume | `0004` + Stage12 requirements | missing operator pause/resume contract | explicit durable pause/resume/progress semantics | ACTIVE NEXT |
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

- Stage11 `34004445273` — SUCCESS.
- OCR `34004445384` — SUCCESS.
- Stage10 `34004445278` — SUCCESS.
- Stage9 `34004445277` — SUCCESS.
- Full Rebuild `34004445394` — SUCCESS including Chromium.

### Stage12 execution-core closure

Intermediate head `592e3848fc347ef7aeca9c9de75d4519e2d9433b`:

- Stage12 `34006606146` passed lint, strict typecheck, all unit tests, API build, clean PostgreSQL migrations and DB constraint verification.
- Lifecycle test then failed with PostgreSQL `42702` because the **test query** used ambiguous unqualified `status` after joining `ai_execution_attempts` and `ai_job_units`.
- This was not a production execution failure. The query was corrected without weakening assertions.

Final executable core head `dfd9a45618e42c2e657dad0ba7b2c2f17e2b8fbf`:

- Stage12 AI Execution Verification `34006710501` — SUCCESS.
- Stage11 AI Contract Verification `34006710456` — SUCCESS.
- OCR Foundation Verification `34006710511` — SUCCESS including real Tesseract.
- Stage10 Media Pipeline `34006710490` — SUCCESS including real PDF lifecycle.
- Stage9 Content Import Verification `34006710461` — SUCCESS including complete 5,552-image inventory + re-import.
- Rebuild Stage Verification `34006710470` — SUCCESS including Stage8 Chromium.

### Stage12 distributed capacity closure

Exact executable head `881102ff94711f908104cd068a003ad598609944`:

- Stage12 AI Execution Verification `34007356406` — SUCCESS, including distributed global/provider/project/model capacity tests and race-safe admission.
- Stage11 AI Contract Verification `34007356417` — SUCCESS.
- OCR Foundation Verification `34007356407` — SUCCESS.
- Stage10 Media Pipeline `34007356429` — SUCCESS.
- Stage9 Content Import Verification `34007356442` — SUCCESS.
- Rebuild Stage Verification `34007356410` — SUCCESS including Chromium.

### Stage12 operational controls closure

Controls implementation head `8e525cc57f63caf806cae6ba17a43e26506191f6` initially failed shared Biome formatting/import ordering before runtime.

Formatting-only head `3b4b98cbb7bb60a92146bb817d90df458e3862f4` then proved:

- Stage11 lint/typecheck/unit/build SUCCESS;
- Stage12 lint/typecheck/unit/build SUCCESS;
- clean migrations through `0014` SUCCESS;
- Stage12 PostgreSQL schema contracts SUCCESS;
- existing lifecycle exposed `AI-012-013`: `ai_route_runtime_identity_mismatch:route-1`.

Root-cause repair preserved the unchanged lifecycle test and changed runtime state identity instead of forcing a new global route-key contract.

Final executable head `7c3c5645d28479ae2305b4fd9ee47cb1754eb8a1`:

- Stage12 AI Execution Verification `34086168715` — **SUCCESS** including existing lifecycle, distributed capacity race tests, global/route kill switches, Retry-After cooldown, global budget race and route budget ceiling.
- Stage11 AI Contract Verification `34086168704` — **SUCCESS**.
- OCR Foundation Verification `34086168712` — **SUCCESS** including real Tesseract.
- Stage10 Media Pipeline `34086168727` — **SUCCESS**.
- Stage9 Content Import Verification `34086168687` — **SUCCESS** including complete inventory/import/idempotency verification.
- Rebuild Stage Verification `34086168772` — **SUCCESS** including Chromium.

**Result:** Stage12 durable core + distributed capacity/backpressure + distributed operational controls are VERIFIED on one exact executable head.

## Known Issues / Remaining Risk

- deployment remains `DEFERRED BY PRODUCT OWNER`;
- hosted Student/Admin/API/media/OCR/AI workers remain `NOT YET VERIFIED`;
- production OCR quality benchmark remains unexecuted;
- live AI provider/model benchmark, credentials, current pricing, production routing and actual billing evidence are unexecuted;
- direct extracted-question persistence into Question Bank remains unresolved;
- explicit job pause/resume/progress is not yet implemented;
- dedicated AI worker lifecycle remains open;
- Admin AI operations integration belongs to Stage13 after backend stability;
- Reader Text/Search/TTS product surface is not implemented;
- final Student PWA install/update/offline authorization lease is not runtime-verified;
- published Question Bank practice/test engine and later product surfaces remain.

## Remaining Work — Ordered

1. Implement + verify explicit Stage12 job pause/resume/progress semantics without weakening cancellation or lease behavior.
2. Add dedicated AI worker process/runtime with bounded polling, bounded worker slots and graceful drain; keep it separate from Fastify HTTP runtime.
3. Run real benchmark evidence before production provider/model defaults.
4. Proceed to curriculum structure extension / Stage13+ according to `MASTER_REBUILD_ROADMAP.md` once Stage12 DoD is closed.
5. Resolve direct-question publish persistence before Question Bank publish workflows depend on it.
6. Restore/verify hosted deployment only when Product Owner explicitly re-enables it.

## Documentation / Continuity Protocol

After every meaningful batch:

- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when architecture/branch/CI state changes;
- update `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` and parity evidence when affected;
- retain exact commit/CI/runtime evidence;
- unexecuted = `NOT YET VERIFIED`.

## Current State

**Stage12 execution core + distributed capacity/backpressure + distributed operational controls are VERIFIED on `7c3c5645…` with Stage12 + Stage11 + OCR + Stage10 + Stage9 + Full Rebuild/Chromium all green on the same executable head. Explicit job pause/resume/progress is the active next batch; worker lifecycle follows. Deployment remains deferred.**
