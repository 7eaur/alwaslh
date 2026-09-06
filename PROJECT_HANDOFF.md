# PROJECT HANDOFF — الوسيلة الذكية

> Source of truth order: `DOCUMENTATION_INDEX.md` → this file → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → Product Decision docs → `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` → `PRODUCT_FEATURE_PARITY_MATRIX.md` → `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` → `MASTER_REBUILD_ROADMAP.md` → engineering/Preview runbooks. Repository + GitHub Actions + runtime evidence are authoritative; do not rely on chat memory.

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
- Stage6/8 exact verified implementation head: `016546eca5696337b52063903bb5ba2fb9631c33`.
- Documentation closure continues after that verified implementation head.
- **Development deployment is currently `DEFERRED BY PRODUCT OWNER`.**
- Git-based automatic Vercel deployment is intentionally disabled during this period so ordinary commits/CI do not publish.
- Do not re-enable deployment or claim hosted PASS unless Product Owner explicitly changes this decision and runtime verification is executed.

## 3. Product Review closure — VERIFIED

Product Review documentation closure was verified earlier on exact head `e293defdaf87169ddbed0cc0c7cae2c525464c23`:

- Stage10 docs-head `33999128114` — SUCCESS.
- Stage9 docs-head `33999128132` — SUCCESS.
- Full Rebuild `33999128111` — SUCCESS.

No routine Product Review discussion is required before implementation. Genuine Business Rule conflicts may reopen a decision explicitly.

## 4. Stable Stage1–10 baseline

Original Stage10 stable head: `27c6a2ef1118ee44d2e63471e4f925e1296283e0`.

Original final CI:

- Stage10 `33302270707` — SUCCESS.
- Stage9 regression `33302270692` — SUCCESS.
- Full Rebuild `33302270695` — SUCCESS including Chromium E2E.

Key baseline outcomes:

- private PostgreSQL behind API;
- scrypt credentials + opaque HttpOnly sessions;
- Full Code 6 digits / Class Code 7 digits;
- transactional/idempotent access baseline;
- Stage9 5,552-image deterministic source inventory/import;
- Stage10 deterministic Sharp/Poppler media pipeline with provenance/order/idempotency/cleanup.

## 5. Historical Stage10 Preview engineering work

Stage10 Preview engineering integration previously culminated in `68be2f5e750ba3d53bf31fae1641182f29516627` and passed:

- Stage10 `34000105615` — SUCCESS.
- Stage9 `34000105600` — SUCCESS.
- Full Rebuild `34000105608` — SUCCESS.

Supabase Preview received canonical `0009_media_pipeline` plus additive Preview lockdown. Direct Browser business-data access remained prohibited.

The prior Vercel build-rate quota prevented a fresh hosted runtime verification. That remains historical evidence, but **it is no longer an engineering-order blocker because Product Owner explicitly postponed deployment**. Hosted Student/Admin/API/media/Poppler behavior remains `NOT YET VERIFIED` rather than being reported as PASS.

Stage10 runtime contract remains repository-owned (`vercel.json`, combined build/routing), but Git auto-deployment is currently disabled intentionally.

## 6. Stage6/8 Auth / Activation / Device Refactor — VERIFIED

### Final product flow implemented

#### Activation

```text
6-digit Full Code
→ eligibility verification without consumption
→ short-lived one-time activation ticket
→ mandatory password creation
→ P-256 device public key + proof
→ one final transaction:
   profile + credential + entitlement + redemption + device + audit + code/ticket consumption
→ device-bound authenticated session
```

No partial account and no code consumption before successful finalization.

#### Returning Student login

```text
identifier + password
→ one-time challenge for the registered application-device key
→ valid cryptographic signature
→ device-bound HttpOnly session
```

`/v1/auth/login` does not create Student password-only sessions.

#### Recovery

```text
Admin temporary password
→ revoke existing Student sessions/challenges
→ must_change_password = true
→ Student password + registered-device challenge
→ mandatory private password replacement
→ new device-bound session
```

#### Lost/replaced device

```text
Admin device reset
→ revoke active device + sessions/challenges
→ one rebind permission
→ Student password
→ device_rebind challenge
→ generate/register NEW P-256 key
→ device-bound session
```

A historical key already used by the same profile cannot be reused for rebind.

### Browser key contract

`apps/student-web` uses WebCrypto ECDSA P-256. The private key is non-extractable and stored as a `CryptoKey` in account-scoped IndexedDB. Only the public SPKI and challenge signature leave the browser. IP/User-Agent/browser fingerprint are not device identity.

### Database contract

`database/migrations/0010_student_auth_device.sql` owns:

- `must_change_password` / temporary-password state;
- device rebind state;
- `student_devices` with one active device per Student and historical fingerprint protection;
- Student session `device_id` binding;
- one-time device challenges;
- one-time activation tickets;
- relevant auth audit event types/indexes/constraints.

### Exact verification evidence

Exact implementation head: `016546eca5696337b52063903bb5ba2fb9631c33`.

- **Rebuild Stage Verification `34002283741` — SUCCESS**
  - Stage1–5 — PASS.
  - Stage6 Auth & authorization — PASS including PostgreSQL registered-device/recovery/rebind security lifecycle.
  - Stage7 Access codes & entitlements — PASS; existing renewal/no-waste/idempotency/race rules retained under device-bound sessions.
  - Stage8 activation backend — PASS including atomicity/replay/session/race.
  - Stage8 Chromium browser E2E — PASS.
- **Stage9 Content Import Verification `34002283819` — SUCCESS.**
- **Stage10 Media Pipeline `34002283817` — SUCCESS.**

Chromium proves:

- invalid/valid activation verification;
- final activation and entitlement;
- browser P-256 key creation;
- IndexedDB key persistence;
- returning challenge login with the same key;
- temporary-password forced private-password replacement without rotating the valid device;
- session invalidation;
- device reset/rebind;
- rotation to a different P-256 key;
- successful login with the rebound device;
- no mobile horizontal overflow in the tested viewport.

The browser recovery/rebind E2E changes support state through a **test-only production-AuthService fixture against the E2E PostgreSQL DB**, not through a test HTTP route or embedded Admin credentials. Admin HTTP authorization/recovery/rebind endpoints are independently verified by the Stage6 integration suite.

## 7. Architecture decisions now authoritative

- **AD-069 — Device-bound Student sessions:** Student authentication requires a registered cryptographic application-device key; password-only Student sessions are forbidden.
- **AD-070 — Two-step activation:** eligibility verification is non-consuming; account/code/device finalization stays one atomic transaction.
- **AD-071 — Forced recovery:** recovery uses temporary credential + session/challenge revocation + mandatory private password replacement.
- **AD-072 — Explicit device reset/rebind:** only Admin reset enables rebind; the same historical device key cannot be reused for that profile.
- **AD-073 — Browser-local private key:** Student private device key is non-extractable WebCrypto state in account-scoped IndexedDB; server stores public material only.
- **AD-074 — Deployment deferral:** Product Owner may temporarily defer Preview deployment while CI/PostgreSQL/security/Chromium development continues; deferred runtime is never labeled PASS.

## 8. Current next bridge — OCR Extraction Foundation

Do not build OCR as an upload dependency or duplicate Stage10 provenance.

Existing Stage10 media identity already provides:

- `media_asset_id`;
- `content_source_asset_id` where applicable;
- source position and page number;
- source checksum/byte identity;
- deterministic `source/display/thumbnail/ai` variants;
- independent media ready/failed state.

Target:

```text
ready media page / media_asset
→ durable OCR job
→ OcrProvider
→ raw text + optional normalized text
→ confidence/status/provider/version/provenance
→ PostgreSQL
→ searchable/reusable text
```

Required behavior:

- OCR failure does not make upload/media processing fail;
- retry/idempotency and bounded execution;
- media/source/page/checksum provenance;
- original image remains canonical evidence;
- raw text retained and normalization traceable;
- low-confidence/sensitive/exact-source review/fallback state;
- provider-neutral interface, no hard lock-in;
- approved searchable/reusable text;
- executable PostgreSQL/integration tests;
- provider benchmark dataset before provider quality claims.

Before choosing schema/worker details, inspect existing job/sync patterns (especially `0004_ai_and_sync.sql`) and `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md` so OCR shares simple durable patterns rather than inventing a second orchestration architecture.

## 9. Stage10 hosted media boundary retained

Actual Stage10 code still proves only:

- storage domain behind `MediaStorage`;
- concrete verified implementation = `FileSystemMediaStorage`;
- local PDF extraction through Poppler;
- no durable hosted media runtime proof yet.

Therefore:

- Vercel filesystem is not accepted as durable media storage;
- hosted Poppler = `NOT YET VERIFIED`;
- OCR must depend on storage abstraction/media identity, not on a serverless filesystem assumption;
- do not invent a temporary hosted workaround as Production architecture.

## 10. Ordered roadmap after OCR

1. OCR Extraction Foundation.
2. Stage11 provider/model-neutral AI prompt/output contracts + benchmark/provenance/validators.
3. Stage12 durable provider/model-neutral high-throughput execution.
4. Curriculum structure extension and Stage13+ from `MASTER_REBUILD_ROADMAP.md`.
5. When Product Owner explicitly re-enables deployment, deliberately restore/sync a stable Preview and execute hosted runtime verification before calling it PASS.

Keep all Product decisions: Reader page + approved text/search/TTS, Published Question Bank only for Student tests, original ministerial provenance, Notes text/image/capture/audio, Favorites separate from Needs Review, repeated-error automation, Push gentle limits, signed max-14-day Offline lease, multiple Class Codes/entitlements, Super Admin only, unified Design System and no valuable legacy feature removal without approval.

## 11. Mandatory continuation protocol

After every meaningful batch:

- update `PROJECT_STATUS.md`;
- update `PROJECT_ENGINEERING_LOG.md`;
- update this Handoff when architecture/branch/CI/Preview state changes;
- update specialized docs;
- update parity/coverage evidence when actual feature implementation changes;
- retain exact commit/CI/deployment/runtime evidence;
- unexecuted = `NOT YET VERIFIED`;
- never weaken tests/security/business rules to obtain a green environment.

## Current transition decision

**Stage6/8 Auth/Activation/Device Refactor is VERIFIED. Stage9 and Stage10 regressions are green on the same implementation head. Development deployment is intentionally deferred by Product Owner and is not a blocker. The active engineering transition is now OCR Extraction Foundation.**
