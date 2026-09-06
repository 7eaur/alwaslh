# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, implementation history, verification evidence and remaining work. Start with `DOCUMENTATION_INDEX.md`, then `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, Product Decision docs, `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`, and legacy coverage/audit references.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بسطحين مستقلين لنفس المنتج:

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
                    ├── durable provider/model-neutral AI workers/jobs
                    ├── Web Push / In-App notifications
                    └── account/device-scoped offline sync
```

Rules:

- Browser never receives PostgreSQL credentials and never authorizes business operations through direct PostgREST access.
- Auth/Authorization/Entitlements are server-owned.
- Student and Admin are independent deployable/runtime surfaces.
- final activation account creation is one transaction.
- Student device identity is a cryptographic application-device key, not IP/User-Agent/browser fingerprint.
- upload/media processing must remain independent from OCR/AI/TTS availability.
- source media remains canonical evidence.
- OCR/AI/TTS use provider-neutral boundaries where applicable.
- Preview is temporary supervision/runtime evidence and does not redefine Production architecture.
- root-cause fixes are mandatory; environment workarounds need an explicit exit path.

## Verified Engineering Baseline

### Stage 1 — Product Inventory — PASS
Legacy feature/user-flow inventory and parity safety net.

### Stage 2 — Brand — PASS
Owned brand/tokens/accessibility direction.

### Stage 3 — UX Architecture — PASS
Admin/Student IA and critical state contracts; later Product decisions refine flows explicitly.

### Stage 4 — PostgreSQL — PASS
Migration-owned PostgreSQL16 data platform.

### Stage 5 — Engineering Foundation — PASS
API runtime, bounded pool/transactions, config/logging/errors, strict TS/lint/tests/build/CI.

### Stage 6 — Auth & Authorization — VERIFIED
Baseline scrypt/opaque sessions/role isolation/Origin protection/lockout plus the completed cryptographic Student device/recovery refactor. Exact closure evidence is recorded below.

### Stage 7 — Access Codes & Entitlements — PASS

- Full Code = 6 digits.
- Class Code = 7 digits.
- crypto-secure generation.
- Arabic/Persian digit normalization.
- transactional row-lock redemption.
- idempotency/race safety/renewal/no-waste/revoke/audit.
- remains green with device-bound Student sessions.

### Stage 8 — Activation/Login/Recovery — VERIFIED
Two-step activation, registered-device challenge login, temporary-password forced change, session revocation, explicit reset/rebind and browser key rotation are implemented and verified.

### Stage 9 — Deterministic source import — PASS
Canonical inventory remains 15 roots / 48 source documents / 5,552 images / 0 fatal inventory issues. Canonical digest: `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

### Stage 10 — Media Pipeline — PASS
`0009_media_pipeline.sql` + media services retain deterministic storage/order/checksum/provenance/idempotency/cleanup and local Sharp/Poppler PDF processing guarantees.

## Product Review Closure — 2026-09-06

Exact docs-head `e293defdaf87169ddbed0cc0c7cae2c525464c23`:

- Stage10 `33999128114` — SUCCESS.
- Stage9 `33999128132` — SUCCESS.
- Full Rebuild `33999128111` — SUCCESS.

Result: Core Product Review closure = PASS. Only genuine Business Rule conflicts should reopen Product Review.

## Historical Stage10 Preview Engineering Batch

Stage10 Preview engineering work previously fixed the combined Vercel build/routing contract, applied `0009_media_pipeline.sql` to temporary Supabase Preview and added browser-role lockdown for media tables. Exact implementation head `68be2f5e750ba3d53bf31fae1641182f29516627` passed Stage10 `34000105615`, Stage9 `34000105600` and Full Rebuild `34000105608`.

A fresh Vercel deployment was later blocked by provider build-rate quota. No auth/security/business workaround was introduced. Hosted media durability and Poppler remained `NOT YET VERIFIED`.

### Current deployment decision

Product Owner subsequently instructed engineering to **postpone development deployment and continue building/testing without publishing**.

Therefore:

- Preview/Vercel deployment is `DEFERRED BY PRODUCT OWNER`;
- Git auto-deployment is intentionally disabled while this decision remains active;
- the old provider quota is historical evidence, not an engineering-order blocker;
- hosted routes/runtime/media/Poppler remain `NOT YET VERIFIED`, never PASS;
- no deployment should occur until Product Owner explicitly re-enables it.

## Stage6/8 Auth / Activation / Device Refactor — Closure Batch

### Problem set

The verified baseline still allowed a weaker final product flow than Product Review required:

1. activation combined code/password rather than separating eligibility from final consumption;
2. password-only Student login could create a session without registered-device proof;
3. recovery used reset-token behavior rather than a temporary credential with forced private-password replacement;
4. lost-device handling lacked explicit Admin reset/rebind and session invalidation;
5. browser device state had no cryptographic application-device contract.

### Implementation

#### Two-step activation

- `/v1/student/activation/verify` validates the 6-digit Full Code without consuming it and issues a short-lived activation ticket.
- `/v1/student/activation/complete` requires ticket + password + idempotency key + P-256 public key + challenge proof.
- final transaction creates Student profile, credential, all-content entitlement, access redemption, registered device and audit events, then consumes the code/ticket.
- a Student session is created only after successful device registration.
- replay keeps byte/request identity constraints and validates password, ticket and device fingerprint.

#### Device-bound Student login

- `/v1/auth/login` is not a Student password-only session path.
- Student login is `/v1/student/login/start` → one-time purpose-bound challenge → `/v1/student/login/complete`.
- session row is bound to `device_id` and authentication requires that device to remain active.
- ECDSA P-256 signatures are verified using a purpose/token-bound message.
- wrong-device proof is rejected.
- role mismatch responses are generic credential failures where appropriate to reduce account-role disclosure.

#### Recovery

- Admin recovery issues a generated temporary password with bounded lifetime.
- old Student sessions and outstanding device challenges are revoked/consumed.
- `must_change_password=true` is authoritative server state.
- Student completes a `password_change` device challenge using the existing valid device and must choose a private password before session creation.
- temporary credential is not reusable after successful replacement.

#### Device reset/rebind

- Admin reset revokes the active Student device and active auth state, then enables explicit rebind.
- Student re-authenticates with the private password and receives a `device_rebind` challenge.
- rebind requires a new P-256 key.
- a key previously registered for the same profile cannot be reused as the replacement key.
- successful rebind clears the rebind permission and binds the new session to the new device.

#### Browser contract

- `apps/student-web/src/device-key.ts` uses WebCrypto ECDSA P-256.
- private key is non-extractable and persisted as `CryptoKey` in account-scoped IndexedDB.
- only public SPKI + proof leave the browser.
- activation, returning login, forced password change and rebind UI use the same API contract.
- offline/unavailable states remain explicit; auth data is not silently sent while offline.

#### Database contract

`database/migrations/0010_student_auth_device.sql` owns the new server state:

- forced-password and temporary-password fields;
- explicit rebind state;
- `student_devices` history/active-device constraints;
- Student session `device_id`;
- purpose-bound one-time device challenges;
- one-time activation tickets;
- auth audit event types/indexes/check constraints;
- historical profile/key uniqueness for rebind protection.

### Root-cause fixes found by CI

- Biome-only formatting failures were corrected without behavior changes.
- TypeScript `readonly` query-result mismatch in rebind was corrected locally without weakening the `QueryExecutor` contract.
- PostgreSQL could not infer prepared-statement types inside `jsonb_build_object`; audit metadata parameters were explicitly cast to `text` instead of changing transactional behavior.
- first Chromium failure was an ambiguous test selector after successful API verification; selector was narrowed to the actual success status rather than changing UI behavior.

### Chromium recovery/rebind test boundary

The expanded browser scenario needs support state changes after activating a real browser account. To avoid embedded Admin credentials or a test-only HTTP endpoint:

- `apps/api/tests/browser-auth-fixture.ts` runs only in test context against the E2E PostgreSQL database;
- it creates a test Admin actor in DB and invokes the same production `AuthService.issueTemporaryPassword` / `resetStudentDevice` methods;
- Admin HTTP authorization/recovery/rebind routes remain independently exercised by `auth.integration.test.ts`.

This preserves production routing and avoids credential coupling in Playwright.

## Exact Stage6/8 Verification Evidence

Exact implementation head: `016546eca5696337b52063903bb5ba2fb9631c33`.

### Rebuild Stage Verification `34002283741` — SUCCESS

- Stage1 Product contract — PASS.
- Stage2 Brand — PASS.
- Stage3 UX — PASS.
- Stage4 PostgreSQL clean build — PASS.
- Stage5 Engineering foundation — PASS:
  - API lint/typecheck/unit/build;
  - migrations clean + idempotent rerun/count;
  - Admin build;
  - Student lint/unit/typecheck/build.
- Stage6 Auth & authorization — PASS:
  - scrypt/session/Origin/role isolation;
  - password-only Student bypass rejection;
  - registered-device challenge;
  - wrong-device rejection;
  - temporary-password forced change;
  - old-session revocation;
  - reset/rebind;
  - historical-key rejection and new-key success.
- Stage7 Access/Entitlements — PASS with renewal/no-waste/race/idempotency intact.
- Stage8 activation backend — PASS with atomicity/replay/device-session/race guarantees.
- Stage8 Chromium — PASS:
  - invalid and valid activation verification;
  - final activation/entitlement;
  - P-256 browser key generation;
  - IndexedDB persistence across logout/returning login;
  - temporary-password forced private password change with the same device key;
  - session invalidation;
  - explicit rebind;
  - new browser key differs from historical key;
  - successful session with new device;
  - mobile overflow guard.

### Cross-stage regressions on the same head

- Stage9 Content Import Verification `34002283819` — SUCCESS.
- Stage10 Media Pipeline `34002283817` — SUCCESS.

**Conclusion:** Stage6/8 refactor is `VERIFIED`.

## Architecture Decisions

Historical decisions AD-064–068 remain valid for Preview build/TLS/DB hardening/media durability/quota behavior.

New authoritative decisions:

- **AD-069 — Device-bound Student sessions:** Student authentication requires registered cryptographic application-device proof; password alone cannot create a Student session.
- **AD-070 — Two-step non-consuming verification:** Full Code eligibility verification does not consume the code; final account/code/device state changes happen atomically.
- **AD-071 — Temporary-password recovery:** recovery revokes old auth state and forces a private password replacement before a new Student session.
- **AD-072 — Explicit rebind with key history:** Admin reset is required for rebind; historical device keys cannot be reused by the same profile as a replacement.
- **AD-073 — Browser-local non-extractable key:** private application-device key remains a non-extractable WebCrypto `CryptoKey` in account-scoped IndexedDB; server stores public material only.
- **AD-074 — Deployment deferral:** Product Owner may defer Preview publishing while engineering continues through local/CI/PostgreSQL/security/Chromium gates; deferred hosted runtime is not PASS.

## Audit Findings

| ID | Severity | Area | Problem | Evidence | Impact | Solution | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged mutation | legacy audit | account/security compromise | private Backend authorization | FIXED Stage6 |
| AUTH-006-004 | P1 | Student Auth | password-only Student session bypassed registered-device policy | pre-refactor `/v1/auth/login` behavior | device policy could be bypassed | separate Student challenge login + device-bound sessions | FIXED + VERIFIED `34002283741` |
| AUTH-006-005 | P1 | Recovery | reset-token flow did not enforce temporary credential/private replacement | Product Review + baseline code | weaker recovery lifecycle | Admin temporary password + revoke + forced change | FIXED + VERIFIED |
| AUTH-006-006 | P1 | Device | no explicit cryptographic reset/rebind history contract | Product Review + baseline | uncontrolled device movement/reuse | P-256 device registry + Admin reset + historical-key rejection | FIXED + VERIFIED |
| DATA-015 | P0 | Activation | partial/nontransactional or prematurely consuming activation risk | legacy/baseline audit | partial account/code loss | non-consuming verify + one atomic final transaction | FIXED + VERIFIED Stage8 |
| DATA-018 | P0 | Class Codes | racy redemption | Stage7 audit/tests | double redemption/no-waste violation | row locks + transaction + idempotency | FIXED Stage7 |
| PRODUCT-002 | P1 | Activation UX | baseline combined code/password | PED-003 | final product flow mismatch | two-step ticket + mandatory password + device | FIXED + VERIFIED |
| PRODUCT-003 | P1 | Device Policy | registered-device enforcement missing | PED-014/AD-038 | account portability bypass | cryptographic device challenge/rebind | FIXED + VERIFIED |
| CONTENT-009-* | P1/P2 | Content | source completeness/order/digest defects | Stage9 inventory/tests | missing/wrong source import | deterministic audited importer | FIXED Stage9 |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | Stage10 tests | corrupt/non-repeatable variants | deterministic media pipeline | FIXED Stage10 |
| PREVIEW-010-001 | P2 | Preview Build | Vercel expected wrong output directory | historical build logs | deployment failure | root combined build contract | FIXED IN REPO |
| PREVIEW-010-002 | P2 | Preview Media | hosted durable storage/Poppler unproven | actual media code inspection | cannot claim hosted media processing | durable adapter/runtime verification | NOT YET VERIFIED |
| PREVIEW-010-003 | P3 | Deployment | prior provider quota blocked a fresh deployment | historical Vercel status | hosted evidence unavailable | no workaround; deployment later deferred by owner | HISTORICAL / CURRENTLY DEFERRED |
| OCR-011-001 | P1 | OCR | no durable OCR extraction/result contract yet | roadmap + repository discovery | Reader text/search and text-first AI cannot rely on canonical OCR | build OCR Foundation on media identity | OPEN — CURRENT PHASE |
| PRODUCT-006 | P1 | Assessment | live unreviewed Student AI would raise cost/uncertainty | Product Review | unsafe/unreviewed questions | Published Question Bank only | DECIDED; implementation pending |
| AI-NEW-002 | P1 | AI Scale | giant requests lose progress and overload providers | Product Review | brittle expensive generation | durable chunks/queue/backpressure | PENDING Stage12 |
| DOC-001 | P2 | Continuity | chat-memory dependency | governance audit | repeated/contradictory work | repository Status/Log/Handoff | CONTROLLED |

## OCR Foundation — Discovery So Far

Current code was inspected before design:

### Stage10 identity available for reuse

`media_assets` already contains:

- `id` (`media_asset_id`);
- optional `content_source_asset_id`;
- `source_position`;
- optional `source_page_number`;
- source MIME/filename;
- `source_checksum_sha256` and byte size;
- processing status/attempt metadata.

`media_variants` already stores deterministic `source/display/thumbnail/ai` variant identities/checksums/storage keys.

`MediaPipelineService` is independent from OCR and marks media ready without any OCR dependency. PDF pages become individual media assets with source page numbers. This is the correct provenance anchor.

### Architectural implication

OCR should reference `media_asset_id` and reuse Stage10 source/page/checksum provenance rather than copy source identifiers into a competing model. OCR status must be independent of `media_assets.status` so OCR failure never changes a successful upload/media result into failure.

Target remains:

```text
ready media asset/page
→ durable OCR work item
→ OcrProvider abstraction
→ raw text + optional normalized text
→ confidence/provider/version/review state
→ PostgreSQL
→ searchable/reusable approved text
```

Before committing the schema, inspect existing job/sync structures (especially `0004_ai_and_sync.sql`) and the provider-neutral AI strategy to reuse a simple durable execution pattern.

## Legacy Feature Coverage Impact

The Stage6/8 batch implements the already-approved activation/login/recovery/device outcomes. It does not remove a legacy capability. Stage13/14+ still require explicit row-by-row parity/coverage evidence before feature-stage closure.

## Known Issues / Remaining Risk

- development Preview deployment = `DEFERRED BY PRODUCT OWNER`;
- hosted Student/Admin/API/Poppler/durable media = `NOT YET VERIFIED`;
- durable hosted media adapter/runtime not implemented;
- OCR Extraction Foundation not implemented yet;
- final Student PWA install/update/offline lease not runtime-verified;
- Reader Text/Search/TTS not implemented;
- Published Question Bank practice/test engine not implemented;
- Notes media sync, Favorites/Needs Review automation, Push and progress/weak-area pipelines remain;
- Stage11 provider-neutral AI contracts/benchmark and Stage12 durable router/scheduler/cascade remain;
- Admin/Student complete product stages and later performance/security/accessibility/load/release/ops gates remain.

## Remaining Work — Ordered

1. OCR Extraction Foundation.
2. Stage11 provider/model-neutral AI prompt/output contracts + golden benchmark/provenance/validators.
3. Stage12 durable provider/model-neutral high-throughput execution.
4. Curriculum structure extension and Stage13+ from `MASTER_REBUILD_ROADMAP.md` with parity/design-system gates.
5. When Product Owner explicitly re-enables deployment, deliberately restore the deployment path, sync a stable validated head and verify exact hosted commit/`READY`/Student/Admin/API/media runtime before claiming PASS.

## Tests & Verification — Current

### Exact Stage6/8 implementation head

`016546eca5696337b52063903bb5ba2fb9631c33`

- Rebuild Stage Verification `34002283741` — SUCCESS.
- Stage9 Content Import Verification `34002283819` — SUCCESS.
- Stage10 Media Pipeline `34002283817` — SUCCESS.

Documentation-only commits after this head require their own CI confirmation, but they do not supersede the exact implementation evidence above until executable changes land.

## Documentation / Continuity Protocol

After every meaningful batch:

- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when architecture/branch/CI/Preview state changes;
- update specialized Product/AI/Preview docs;
- update parity/coverage evidence when actual features land;
- retain exact commit/CI/deployment/runtime evidence;
- unexecuted = `NOT YET VERIFIED`.

## Current State

**Stage6/8 Auth/Activation/Device Refactor is VERIFIED on exact implementation head `016546e…`; Stage9 and Stage10 regressions are green on that same head. Deployment is intentionally deferred by Product Owner and Git auto-deploy remains disabled. Current engineering phase is OCR Extraction Foundation.**
