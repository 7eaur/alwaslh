# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, implementation history, verification evidence and remaining work. Start with `DOCUMENTATION_INDEX.md`, then `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, Product Decision docs, `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`, and legacy coverage/audit references.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بثلاثة أسطح/طبقات رئيسية:

- **Student Web/PWA (`apps/student-web`)**: Welcome/Auth، curriculum، Reader، summaries، practice/tests/models، Notes، Favorites، Needs Review، progress/private achievements، Notifications وOffline/PWA. Mobile-first، RTL، قابل للتثبيت ويعمل أيضًا من Browser.
- **Admin Web (`apps/admin-web`)**: Super Admin واحد حاليًا لإدارة curriculum/content/media/OCR/TTS/AI authoring/Question Bank/students/codes/recovery/device reset/notifications/import-export/reports/audit.
- **Backend API (`apps/api`)**: المسار الوحيد لبيانات PostgreSQL وتطبيق Auth/Authorization/Entitlements والعمليات authoritative.

### Product governance

- الفكرة الأساسية ثابتة؛ التطبيق القديم inventory إلزامي للمميزات والسيناريوهات والمشكلات وليس implementation specification.
- **لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner.**
- `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` hard gates قبل إغلاق Student/Admin feature stages.
- Product Review Batches 01–06 حسمت Core Product بما يكفي لاستمرار التنفيذ.
- أي شيء غير منفذ أو غير مختبر = `NOT YET VERIFIED`.
- Repository + GitHub Actions + runtime evidence هي ذاكرة المشروع الرسمية؛ chat memory ليست Source of Truth.

### Sources

- repo: `7eaur/alwaslh`.
- working branch: `planning/product-evolution-review` / draft PR #12.
- canonical curriculum/media source: `7eaur/alwaslh-go` pinned at `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23` for Stage9 inventory.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/blob storage abstraction
                    ├── OCR extraction + searchable approved text
                    ├── cached/versioned TTS
                    ├── provider/model-neutral AI contracts + durable jobs
                    ├── Web Push / In-App notifications
                    └── account/device-scoped offline sync
```

Rules:

- Browser never receives PostgreSQL credentials and never authorizes business operations through direct PostgREST access.
- Auth/Authorization/Entitlements are server-owned.
- Student and Admin are independent runtime surfaces.
- final activation account creation is one transaction.
- Student device identity is a cryptographic application-device key, not IP/User-Agent/browser fingerprint.
- upload/media processing is independent from OCR/AI/TTS availability.
- source media remains canonical evidence.
- OCR/AI/TTS use provider-neutral boundaries where applicable.
- Preview does not redefine Production architecture.
- root-cause fixes are mandatory; environment workarounds need an explicit exit path.

## Verified Engineering Baseline

### Stage 1 — Product Inventory — PASS
Legacy feature/user-flow inventory and parity safety net.

### Stage 2 — Brand — PASS
Owned brand/tokens/accessibility direction.

### Stage 3 — UX Architecture — PASS
Admin/Student IA and critical-state contracts.

### Stage 4 — PostgreSQL — PASS
Migration-owned PostgreSQL16 data platform.

### Stage 5 — Engineering Foundation — PASS
API runtime, bounded pool/transactions, config/logging/errors, strict TypeScript/lint/tests/build/CI.

### Stage 6 — Auth & Authorization — VERIFIED
scrypt credentials, opaque HttpOnly sessions, role isolation, Origin protection, lockout, registered-device Student authentication, forced recovery and explicit rebind.

### Stage 7 — Access Codes & Entitlements — VERIFIED

- Full Code = 6 digits.
- Class Code = 7 digits.
- crypto-secure generation.
- Arabic/Persian digit normalization.
- transactional row-lock redemption.
- idempotency/race safety/renewal/no-waste/revoke/audit.

### Stage 8 — Activation/Login/Recovery/Device — VERIFIED
Two-step activation, device challenge login, temporary-password forced change, session revocation, reset/rebind and browser key rotation are implemented and verified.

### Stage 9 — Deterministic source import — VERIFIED
Canonical inventory: 15 roots / 48 source documents / 5,552 images / 0 fatal inventory issues. Canonical digest: `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage 10 — Media Pipeline — VERIFIED
`0009_media_pipeline.sql` + media services retain deterministic storage/order/checksum/provenance/idempotency/cleanup and local Sharp/Poppler PDF-processing guarantees.

### OCR Extraction Foundation — VERIFIED
`0011_ocr_foundation.sql` + provider-neutral OCR service provide durable extraction/retry/lease/review/search behavior on top of Stage10 media identity.

## Product Review Closure — 2026-09-06

Exact docs-head `e293defdaf87169ddbed0cc0c7cae2c525464c23`:

- Stage10 `33999128114` — SUCCESS.
- Stage9 `33999128132` — SUCCESS.
- Full Rebuild `33999128111` — SUCCESS.

Result: Core Product Review closure = PASS. Only genuine Business Rule conflicts should reopen Product Review.

## Deployment State

Historical Stage10 Preview engineering work fixed the combined Vercel build/routing contract and applied `0009_media_pipeline.sql` plus additive browser-role lockdown to the temporary Supabase Preview. A fresh Vercel runtime later hit provider build-rate quota; no security/business workaround was introduced.

Product Owner then explicitly postponed development deployment.

Current rule:

- Preview/Vercel deployment = `DEFERRED BY PRODUCT OWNER`;
- Git auto-deployment intentionally disabled;
- hosted Student/Admin/API/media/Poppler/OCR remain `NOT YET VERIFIED`;
- old quota is historical evidence, not an engineering-order blocker;
- no deployment until Product Owner explicitly re-enables it.

## Stage6/8 Auth / Activation / Device Refactor — Closure

### Problem

The earlier baseline did not meet the final Product Review device/recovery contract: activation was not fully split into non-consuming verification + atomic finalization, Student login could be password-only, recovery did not enforce temporary credential → private password, and lost-device handling lacked explicit cryptographic rebind history.

### Solution

- `/v1/student/activation/verify`: validates 6-digit Full Code without consumption and issues a short-lived ticket.
- `/v1/student/activation/complete`: ticket + password + idempotency + P-256 public key/proof; one final transaction creates profile/credential/entitlement/redemption/device/audit and consumes code/ticket.
- Student login uses `/v1/student/login/start` → purpose-bound challenge → `/v1/student/login/complete`.
- `/v1/auth/login` does not create password-only Student sessions.
- Student sessions bind to `device_id`.
- Admin recovery issues a bounded temporary password, revokes old sessions/challenges and sets `must_change_password`.
- Student must replace it using the registered device before session creation.
- Admin device reset revokes active device/auth state and grants one rebind.
- rebind requires a new P-256 key; historical key reuse for the same profile is rejected.
- Student browser keeps a non-extractable private WebCrypto `CryptoKey` in account-scoped IndexedDB.

### Exact Stage6/8 evidence

Exact implementation head: `016546eca5696337b52063903bb5ba2fb9631c33`.

- Rebuild Stage Verification `34002283741` — SUCCESS including Chromium.
- Stage9 `34002283819` — SUCCESS.
- Stage10 `34002283817` — SUCCESS.

## OCR Extraction Foundation — Closure Batch

### Repository discovery

Stage10 already provided the correct provenance anchor:

- `media_assets.id`;
- optional `content_source_asset_id`;
- source position/page number;
- source checksum/bytes;
- independent `ready/failed` media state;
- deterministic `source/display/thumbnail/ai` variants with storage keys/checksums.

`0004_ai_and_sync.sql` was also inspected. Its AI jobs are tied to prompt/model generation, so OCR was not incorrectly stuffed into `ai_jobs`. Instead OCR reuses the same *durable execution principles* without duplicating the AI domain.

### Schema

`database/migrations/0011_ocr_foundation.sql` adds:

- `ocr_extraction_status`: `queued / running / retrying / completed / failed`;
- `ocr_review_status`: `not_required / pending / approved / rejected`;
- `ocr_extractions` bound to `input_media_variant_id` + input checksum;
- provider key/version + extraction profile key;
- attempt/max-attempt/next-attempt state;
- UUID lease token + expiry;
- raw/normalized text;
- mean confidence + provider metadata;
- review reason/reviewer/time;
- bounded error fields;
- natural uniqueness + explicit idempotency key;
- ready/review/search indexes including approved-text GIN search.

### Service/repository behavior

- enqueue only accepts a `ready` media asset with the expected deterministic AI variant;
- idempotency hash includes variant id + checksum + provider key/version + profile key;
- claims use `FOR UPDATE SKIP LOCKED`;
- expired final attempts are failed safely;
- expired running work under max attempts can be reclaimed;
- completion requires current matching lease token **and unexpired lease**;
- failure/retry updates also require current matching **unexpired** lease;
- therefore a stale worker cannot overwrite the state of a newer attempt;
- claimed input is reloaded only if media is still `ready` and checksum still matches;
- stored bytes are checked for byte length and SHA-256 before provider execution;
- provider failure/retry never marks the Stage10 media asset failed;
- exponential retry delay is bounded;
- Admin-only review approves/rejects pending text and may replace normalized text;
- approved search only sees completed `not_required` or `approved` rows.

### Text quality/review behavior

Normalization is intentionally conservative: raw provider text remains evidence and normalization avoids aggressive source rewriting.

Review reasons:

- normalized text empty → `empty_text`;
- profile explicitly sensitive/exact (`requiresReview`) → `profile_requires_review`;
- provider confidence missing → `provider_confidence_unavailable`;
- confidence below profile threshold → `low_confidence`.

This prevents high-confidence OCR alone from bypassing review for exact/sensitive source modes.

### Provider boundary

`OcrProvider` is provider-neutral.

`TesseractOcrProvider` is a verified reference adapter:

- accepts image input only;
- validates language hints;
- shells to `tesseract` with bounded timeout/output and abort handling;
- parses TSV, preserves line order and calculates weighted confidence;
- CI installs `tesseract-ocr-ara` and `tesseract-ocr-eng` and executes a real smoke extraction.

It is **not** a production-provider lock-in or proof that Tesseract is best for Arabic/scientific source material. Provider-quality selection still requires the benchmark dataset.

### Root-cause fixes found by CI

- initial OCR changes hit Biome formatting/import-order failures only; fixed without behavior changes.
- OCR workflow PostgreSQL contract check failed because the shell assertion itself contained an extra `)` after `relkind='r'`; migration had already applied successfully. The workflow SQL syntax was corrected rather than changing the schema.
- additional engineering review found and fixed three correctness risks before closure:
  1. stale worker failure writes after lease expiry;
  2. processing media that stopped being `ready` after enqueue;
  3. empty/sensitive text bypassing review under high confidence.

### Exact OCR verification evidence

Exact implementation head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

- **OCR Foundation Verification `34003439653` — SUCCESS**
  - Tesseract Arabic/English runtime — PASS;
  - lint/typecheck/unit/build — PASS;
  - migrations through `0011` — PASS;
  - PostgreSQL table/index/constraint contracts — PASS;
  - durable enqueue/replay — PASS;
  - retry/backoff — PASS;
  - concurrent claims — PASS;
  - low-confidence review — PASS;
  - approved-only search — PASS;
  - empty-output review — PASS;
  - sensitive-profile forced review — PASS;
  - execution-time media-ready guard — PASS;
  - stale-lease rejection — PASS;
  - media-success independence — PASS;
  - real Tesseract extraction — PASS.
- **Stage9 Content Import Verification `34003439660` — SUCCESS.**
- **Stage10 Media Pipeline `34003439659` — SUCCESS.**
- **Rebuild Stage Verification `34003439669` — SUCCESS**, including Stage8 Chromium activation/returning-login/recovery/rebind E2E.

**Conclusion:** OCR Extraction Foundation is `VERIFIED`.

## Architecture Decisions

Historical AD-064–068 remain valid for Preview build/TLS/DB hardening/media durability/quota behavior.

- **AD-069 — Device-bound Student sessions:** Student authentication requires registered cryptographic device proof.
- **AD-070 — Two-step activation:** verification is non-consuming; final account/code/device changes are atomic.
- **AD-071 — Temporary-password recovery:** old auth state is revoked and a private password replacement is mandatory.
- **AD-072 — Explicit rebind with key history:** Admin reset enables rebind; historical key reuse is rejected.
- **AD-073 — Browser-local non-extractable key:** private Student device key remains in account-scoped IndexedDB.
- **AD-074 — Deployment deferral:** Product Owner may defer hosted Preview while CI/PostgreSQL/browser engineering continues.
- **AD-075 — OCR is derived, not authoritative media state:** OCR failure cannot turn a successful upload/media asset into failure.
- **AD-076 — OCR provenance is Stage10 media/checksum-bound:** do not duplicate curriculum/source/page identity into a competing OCR provenance model.
- **AD-077 — OCR uses lease-protected durable work:** stale workers cannot complete or fail/retry after lease loss.
- **AD-078 — Downstream searchable/generation text is reviewed OCR only:** pending/rejected OCR is not approved evidence.
- **AD-079 — OCR provider-neutral boundary:** Tesseract is a reference implementation, not a hard dependency for final provider choice.

## Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged mutation | legacy audit | account/security compromise | private Backend authorization | FIXED Stage6 |
| AUTH-006-004 | P1 | Student Auth | password-only session bypassed device policy | pre-refactor behavior | device policy bypass | challenge login + device-bound session | FIXED + VERIFIED |
| AUTH-006-005 | P1 | Recovery | recovery did not force private replacement | Product Review/baseline | weaker account recovery | temporary password + revoke + forced change | FIXED + VERIFIED |
| AUTH-006-006 | P1 | Device | no explicit cryptographic rebind history | Product Review/baseline | uncontrolled device movement | P-256 registry + reset + historical-key rejection | FIXED + VERIFIED |
| DATA-015 | P0 | Activation | partial/prematurely consuming activation risk | legacy/baseline audit | partial account/code loss | non-consuming verify + atomic finalization | FIXED + VERIFIED |
| DATA-018 | P0 | Class Codes | racy redemption | Stage7 audit/tests | double redemption/no-waste violation | row locks + transaction + idempotency | FIXED Stage7 |
| CONTENT-009-* | P1/P2 | Content | source completeness/order/digest defects | Stage9 tests | wrong/missing source import | deterministic audited importer | FIXED Stage9 |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | Stage10 tests | corrupt/non-repeatable variants | deterministic media pipeline | FIXED Stage10 |
| OCR-011-001 | P1 | OCR | no durable extraction/result contract | roadmap + discovery | Reader/search/text-first AI lacked canonical text | `0011` + durable provider-neutral OCR | FIXED + VERIFIED `34003439653` |
| OCR-011-002 | P1 | OCR Concurrency | stale worker could potentially overwrite newer state | implementation review | race/corrupt retry state | lease token + unexpired-lease condition on complete/fail | FIXED + VERIFIED |
| OCR-011-003 | P1 | OCR Integrity | queued work could process media no longer ready | implementation review | derived text from invalidated media | execution-time ready/checksum/byte guard | FIXED + VERIFIED |
| OCR-011-004 | P1 | OCR Review | high confidence could bypass review for empty/sensitive content | implementation review | unsafe downstream evidence | explicit empty/sensitive review reasons | FIXED + VERIFIED |
| PREVIEW-010-002 | P2 | Hosted Media | durable hosted storage/Poppler unproven | media code inspection | cannot claim hosted pipeline | durable adapter/runtime verification later | NOT YET VERIFIED |
| PRODUCT-006 | P1 | Assessment | Student live/unreviewed AI undesirable | Product Review | unreviewed questions | Published Question Bank only | DECIDED; implementation pending |
| AI-NEW-002 | P1 | AI Scale | giant generation requests lose progress/overload providers | Product Review | brittle expensive generation | durable chunks/queue/backpressure | PENDING Stage12 |
| DOC-001 | P2 | Continuity | chat-memory dependency | governance audit | repeated/contradictory work | repository Status/Log/Handoff | CONTROLLED |

## Stage11 — Active Discovery / Contract Scope

Next phase is **Provider-Neutral AI Prompt / Output Contracts**.

Boundary:

- Stage11 defines prompt registry, typed inputs/outputs, provenance and validators, plus a golden benchmark harness.
- Stage12 owns scheduler/backpressure/cascade/live high-throughput execution.
- existing `ai_jobs / ai_job_units / ai_outputs` from `0004_ai_and_sync.sql` should be reused where appropriate, not duplicated.
- approved OCR text is the primary book-generation source; pending/rejected OCR must not become generation evidence.
- book-generated questions require source/page provenance.
- no silent answer invention/defaulting.
- exact religious/source text, formulas/tables and uncertain OCR require stricter evidence/review behavior.
- live provider credentials/pricing/routing remain `NOT YET VERIFIED` until explicitly configured and benchmarked.

Before implementation, inventory actual AI code/schema/tests and relevant legacy generation modes from parity/audit docs.

## Legacy Feature Coverage Impact

Auth/device and OCR implement approved infrastructure/product outcomes and remove no valuable legacy capability. Stage13/14+ still require explicit row-by-row parity/coverage evidence before feature-stage closure.

## Known Issues / Remaining Risk

- development deployment = `DEFERRED BY PRODUCT OWNER`;
- hosted Student/Admin/API/Poppler/durable media/OCR = `NOT YET VERIFIED`;
- durable hosted media adapter/runtime not implemented;
- production OCR-provider quality benchmark not executed;
- Stage11 AI contracts/golden benchmark not implemented yet;
- Stage12 durable provider routing/scheduler/cascade not implemented;
- Reader Text/Search/TTS product surface not implemented;
- final Student PWA install/update/offline lease not runtime-verified;
- Published Question Bank practice/test engine not implemented;
- Notes media sync, Favorites/Needs Review automation, Push and progress/weak-area pipelines remain;
- Admin/Student complete product stages and later performance/security/accessibility/load/release/ops gates remain.

## Remaining Work — Ordered

1. Stage11 provider/model-neutral AI prompt/output contracts + golden benchmark/provenance/validators.
2. Stage12 durable provider/model-neutral high-throughput execution.
3. Curriculum structure extension and Stage13+ from `MASTER_REBUILD_ROADMAP.md` with parity/design-system gates.
4. When Product Owner explicitly re-enables deployment, deliberately restore deployment, sync a stable validated head and verify exact hosted commit/`READY`/Student/Admin/API/media/OCR runtime before claiming PASS.

## Tests & Verification — Current

### Exact latest implementation head

`befdb8e5bd02aa33b12ce1098fac2678fe15acdd`

- OCR Foundation Verification `34003439653` — SUCCESS.
- Stage9 Content Import Verification `34003439660` — SUCCESS.
- Stage10 Media Pipeline `34003439659` — SUCCESS.
- Rebuild Stage Verification `34003439669` — SUCCESS, including Chromium.

Documentation-only commits after this head do not supersede that exact executable implementation evidence unless they change executable code.

## Documentation / Continuity Protocol

After every meaningful batch:

- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when architecture/branch/CI/Preview state changes;
- update specialized Product/AI/Preview docs;
- update parity/coverage evidence when actual features land;
- retain exact commit/CI/runtime evidence;
- unexecuted = `NOT YET VERIFIED`.

## Current State

**OCR Extraction Foundation is VERIFIED on exact head `befdb8e5…`; OCR, Stage9, Stage10 and Full Rebuild are all green on that same head. Deployment remains intentionally deferred by Product Owner. Current engineering phase is Stage11 Provider-Neutral AI Prompt / Output Contracts.**
