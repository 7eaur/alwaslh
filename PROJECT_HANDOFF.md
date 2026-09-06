# PROJECT HANDOFF — الوسيلة الذكية

> Source of truth order: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → Product Decision docs → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → `PRODUCT_FEATURE_PARITY_MATRIX.md` → `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` → `MASTER_REBUILD_ROADMAP.md`. Repository + GitHub Actions + runtime evidence are authoritative; do not rely on chat memory.

## 1. Product direction

**الفكرة الأساسية ثابتة.** الوسيلة الذكية منصة تعليمية عربية بثلاثة أجزاء مستقلة وظيفيًا:

- `apps/student-web` — Student Web/PWA، mobile-first/offline-first، RTL، قابل للتثبيت ويعمل أيضًا من Browser، ولا يحتوي Admin navigation/functionality.
- `apps/admin-web` — Admin Web مستقل، Super Admin فقط حاليًا.
- `apps/api` — Backend API الوحيد للوصول إلى PostgreSQL وتطبيق Auth/Authorization/Entitlements والعمليات authoritative.

التطبيق القديم mandatory feature/scenario inventory وليس specification تقنية أو بصرية. **لا تُحذف Feature قديمة ذات قيمة بدون موافقة Product Owner صريحة.** استخدم `PRODUCT_FEATURE_PARITY_MATRIX.md` و`docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` قبل إغلاق Student/Admin feature stages.

Product Review Batches 01–06 حسمت Core Product. التفاصيل الروتينية تُختار هندسيًا وفق Correctness/Clarity/Maintainability/UX/Security دون Overengineering.

## 2. Branch / execution state

- Repository: `7eaur/alwaslh`.
- Branch: `planning/product-evolution-review`.
- Draft PR: #12.
- Latest exact verified implementation head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.
- Stage6/8 Auth/Activation/Device is VERIFIED and remains green under the OCR regression head.
- OCR Extraction Foundation is VERIFIED.
- Active next phase: **Stage11 Provider-Neutral AI Prompt / Output Contracts**.
- **Development deployment is `DEFERRED BY PRODUCT OWNER`.**
- Git-based automatic Vercel deployment remains intentionally disabled.
- Do not re-enable deployment or claim hosted PASS unless Product Owner explicitly changes this decision and hosted runtime verification is executed.

## 3. Stable verified baseline

### Stages 1–5

- Product inventory/parity safety net — PASS.
- Brand/tokens/accessibility direction — PASS.
- Admin/Student UX architecture contracts — PASS.
- migration-owned PostgreSQL16 platform — PASS.
- API/DB/config/logging/errors/strict TS/lint/tests/build/CI foundation — PASS.

### Stage6 — Auth & Authorization — VERIFIED

Student auth uses scrypt credentials + opaque HttpOnly sessions plus cryptographic application-device proof. Password-only Student sessions are blocked. Origin/role isolation/lockout/Admin bootstrap remain intact.

### Stage7 — Access Codes & Entitlements — VERIFIED

- Full Code = 6 digits.
- Class Code = 7 digits.
- crypto-secure generation.
- normalization of Arabic/Persian digits.
- transactional row-lock redemption.
- idempotency/race safety/renewal/no-waste/revoke/audit.
- multiple class entitlements remain a product requirement.

### Stage8 — Activation/Login/Recovery/Device — VERIFIED

Activation:

```text
6-digit Full Code
→ non-consuming eligibility verification
→ one-time activation ticket
→ mandatory password
→ P-256 device public key/proof
→ atomic profile + credential + entitlement + redemption + device + audit + code/ticket consumption
→ device-bound session
```

Returning login:

```text
identifier + password
→ purpose-bound registered-device challenge
→ valid P-256 signature
→ device-bound HttpOnly session
```

Recovery/rebind:

```text
Admin temporary password/reset
→ revoke sessions/challenges
→ forced private-password replacement
→ existing valid device OR explicit Admin reset
→ device_rebind challenge
→ NEW P-256 key
→ new device-bound session
```

Historical device-key reuse for the same profile is rejected. The browser stores a non-extractable private `CryptoKey` in account-scoped IndexedDB; only public SPKI/proof leave the browser.

### Stage9 — Content source import — VERIFIED

Canonical pinned source inventory remains:

- 15 subject roots;
- 48 source documents;
- 5,552 images;
- 0 fatal inventory issues;
- deterministic inventory/import and idempotent re-import.

### Stage10 — Media Pipeline — VERIFIED

Stage10 retains deterministic Sharp/Poppler processing, source/display/thumbnail/AI variants, stable order/storage keys/checksums, provenance, idempotency, cleanup/abort/retry behavior and real PDF runtime tests.

## 4. OCR Extraction Foundation — VERIFIED

### Architecture

OCR is a derived layer and **not** an upload/media dependency:

```text
ready media asset + deterministic AI image variant
→ durable ocr_extractions row
→ OcrProvider abstraction
→ raw provider text
→ conservative normalized text
→ confidence/provider/version metadata
→ review gate where required
→ approved searchable/reusable text
```

`database/migrations/0011_ocr_foundation.sql` owns the durable OCR state. OCR references Stage10 media variant/checksum identity instead of copying curriculum/source/page state into a competing provenance model.

### Durable execution contract

- statuses: `queued / running / retrying / completed / failed`;
- natural identity + explicit idempotency key;
- claim through PostgreSQL `FOR UPDATE SKIP LOCKED`;
- UUID lease token + expiry per running attempt;
- exponential retry delay controlled by extraction profile/service;
- final expired attempts fail safely;
- expired non-final running attempts can be reclaimed;
- stale workers cannot write completion **or failure/retry** after lease loss;
- worker re-checks that media is still `ready`;
- byte size + media variant checksum + extraction checksum are verified before provider execution;
- OCR failure never changes a successful `media_assets.status = ready` into media failure.

### Text/review contract

- raw OCR text is retained;
- normalization preserves Arabic/source characters and only applies conservative whitespace/text cleanup;
- confidence must be null or in `[0,100]`;
- empty normalized output → `pending` review with `empty_text`;
- unavailable confidence → `pending` with `provider_confidence_unavailable`;
- low confidence → `pending` with `low_confidence`;
- exact/sensitive extraction profiles can set `requiresReview: true` → `pending` with `profile_requires_review` even at high confidence;
- only completed `not_required` or Admin-`approved` text appears in approved search;
- Admin review can approve/reject and optionally replace normalized text.

### Provider boundary

`OcrProvider` is provider-neutral. `TesseractOcrProvider` is the verified reference adapter only:

- image-only input boundary;
- sanitized language hints;
- CLI timeout/abort/output-size safety;
- TSV parser reconstructs line order and weighted confidence;
- CI installs and runs `ara` + `eng` language packs;
- no architecture assumption that Tesseract is the final production provider.

### Exact verification evidence

Exact implementation head: `befdb8e5bd02aa33b12ce1098fac2678fe15acdd`.

- OCR Foundation Verification `34003439653` — **SUCCESS**.
- Stage9 Content Import Verification `34003439660` — **SUCCESS**.
- Stage10 Media Pipeline `34003439659` — **SUCCESS**.
- Rebuild Stage Verification `34003439669` — **SUCCESS**, including Stage8 Chromium activation/returning-login/recovery/rebind E2E.

OCR workflow proves:

- lint/typecheck/unit/build;
- clean migrations through `0011`;
- PostgreSQL table/index/constraint contracts;
- enqueue/replay idempotency;
- retry and concurrent claim isolation;
- low-confidence/empty/sensitive review gates;
- approved-only search;
- media-success independence;
- execution-time media-ready guard;
- stale-lease rejection;
- real Tesseract extraction with Arabic/English runtime installed.

## 5. Current architecture decisions

Historical Preview decisions AD-064–068 remain valid.

- **AD-069 — Device-bound Student sessions:** password alone cannot create a Student session.
- **AD-070 — Two-step activation:** eligibility verification does not consume the code; final state changes are atomic.
- **AD-071 — Forced recovery:** temporary credential + auth-state revocation + mandatory private-password replacement.
- **AD-072 — Explicit device rebind:** only Admin reset permits rebind; historical key reuse is rejected.
- **AD-073 — Browser-local private key:** non-extractable WebCrypto key remains in account-scoped IndexedDB.
- **AD-074 — Deployment deferral:** CI/PostgreSQL/browser development continues while hosted deployment is explicitly deferred.
- **AD-075 — OCR is derived from ready media:** OCR status cannot redefine media/upload success.
- **AD-076 — OCR provenance is checksum-bound to Stage10 media identity:** no duplicate source/page provenance model.
- **AD-077 — OCR work uses durable leases:** stale workers cannot overwrite a newer attempt.
- **AD-078 — Search/generation consume reviewed OCR only:** pending/rejected OCR text is not approved downstream evidence.
- **AD-079 — Tesseract is a reference adapter, not a provider lock-in.**

## 6. Hosted/deployment boundary

Development deployment remains intentionally deferred.

Historical Stage10 Preview/Supabase/Vercel work remains evidence only. No Auth/Device/OCR deployment was performed in these batches.

Still `NOT YET VERIFIED` while deployment is deferred:

- hosted Student `/`;
- hosted Admin `/admin`;
- hosted API health/readiness;
- durable hosted media storage;
- hosted Poppler;
- hosted OCR worker/runtime/provider behavior.

Do not turn Vercel ephemeral filesystem behavior into Production architecture.

## 7. Active next phase — Stage11 Provider-Neutral AI Contracts

Stage11 is **contracts + validation + golden benchmark structure**, not the Stage12 high-throughput worker/scheduler implementation.

Before changing code:

1. inspect all existing AI source/schema/tests and legacy generation modes;
2. inspect `database/migrations/0004_ai_and_sync.sql` and current callers;
3. use `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` as the routing/provider-neutral contract;
4. trace relevant legacy rows in `PRODUCT_FEATURE_PARITY_MATRIX.md` and audit docs.

Required Stage11 outcomes:

- versioned Prompt Registry;
- typed provider-neutral generation inputs/outputs;
- approved OCR text as primary book-source input;
- mandatory source/page provenance for book-generated questions;
- schema validators;
- semantic validators;
- Arabic/Fusha/scientific/chemistry/exact-source rules;
- duplicate/near-duplicate rules;
- explicit uncertainty/failure/review-required states;
- no silent answer invention/defaulting;
- source-controlled golden regression cases;
- benchmark harness that can run identical cases through approved provider adapters and record quality/usage metadata.

Do **not** overbuild Stage12 in Stage11. Durable `ai_jobs/ai_job_units/ai_outputs` schema already exists and should be reused where appropriate; scheduler/backpressure/cascade/production provider execution belongs to Stage12.

Live provider credentials, pricing choices, production routing and real provider benchmark results remain `NOT YET VERIFIED` until explicitly executed with authorized configuration.

## 8. Ordered roadmap

1. Stage11 provider/model-neutral AI prompt/output contracts + golden benchmark/provenance/validators.
2. Stage12 durable provider/model-neutral high-throughput execution.
3. Curriculum structure extension and Stage13+ from `MASTER_REBUILD_ROADMAP.md`.
4. When Product Owner explicitly re-enables deployment, deliberately restore/sync a stable validated head and execute hosted runtime verification before calling it PASS.

Keep all approved Product decisions: Reader page + reviewed text/search/TTS, Published Question Bank only for Student tests, original ministerial provenance, Notes text/image/capture/audio, Favorites separate from Needs Review, repeated-error automation, Push gentle limits, signed max-14-day Offline lease, multiple Class Codes/entitlements, Super Admin only, unified Design System and no valuable legacy feature removal without approval.

## 9. Mandatory continuation protocol

After every meaningful batch:

- update `PROJECT_STATUS.md`;
- update `PROJECT_ENGINEERING_LOG.md`;
- update this Handoff when architecture/branch/CI/Preview state changes;
- update specialized docs;
- update parity/coverage evidence when actual features change;
- retain exact commit/CI/runtime evidence;
- unexecuted = `NOT YET VERIFIED`;
- never weaken tests/security/business rules merely to obtain green CI.

## Current transition decision

**OCR Extraction Foundation is VERIFIED on exact implementation head `befdb8e5…`; OCR, Stage9, Stage10 and Full Rebuild are all green on that same head. Deployment remains deferred by Product Owner. The active engineering phase is Stage11 Provider-Neutral AI Prompt / Output Contracts.**
