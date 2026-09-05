# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, implementation history, verification evidence and remaining work. Read `PROJECT_HANDOFF.md`, then `PROJECT_STATUS.md`, then `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين رئيسيين:

- **Student PWA:** التفعيل/الدخول، المنهج، Reader، الملخصات، Practice/`اختبر نفسك`، الاختبارات والنماذج، الملاحظات، المفضلة، `يحتاج مراجعة`، التقدم والإنجازات الشخصية، Offline/PWA.
- **Admin Web:** الصفوف/المواد/الدروس/المحتوى، الرفع والمعالجة، OCR، الطلاب والوصول، AI authoring، Quiz/Content QA، النشر، Import/Export والتقارير.

### Product governance after Stage 10

الفكرة الأساسية ثابتة. التطبيق القديم reference/inventory للفكرة والمميزات والسيناريوهات والمشكلات، وليس specification للشاشات أو التقنية.

**قاعدة جديدة:** لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner. يمكن إعادة تنظيم/دمج آليات مكررة إذا بقيت النتيجة الوظيفية كاملة.

كل Feature/Flow/Business Rule رئيسي يصنف `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW`.

### Sources

- `7eaur/alwaslh`: legacy reference + rebuild repository.
- `7eaur/alwaslh-go`: canonical curriculum/media source input.
- pinned Stage 9 revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

## Architecture

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    ├── OCR extraction
                    └── background / AI workers
```

Rules:
- Browser never receives PostgreSQL credentials or connects directly to DB.
- Auth/Authorization/Entitlements server-owned.
- PostgreSQL clean-slate/migration-owned.
- Student/Admin separate UX/runtime concerns.
- media transforms server-owned/deterministic.
- OCR is a separate reusable extraction layer; upload does not depend on OCR/AI.
- Gemini secrets/execution are server-owned.
- Student Offline is account/device-scoped and must reduce repeated server requests.

## Implemented baseline — Stages 1–10

### Stage 1 Product Inventory — CLI PASS
Legacy feature/user-flow inventory, parity safety net and automated capability checks.

### Stage 2 Brand — CLI PASS
Owned teal/open-book identity, tokens/assets, Arabic typography, focus/reduced-motion/touch rules.

### Stage 3 UX Architecture — CLI PASS
Initial Admin/Student IA, states and critical flows. Product flows may be improved through the current review.

### Stage 4 PostgreSQL Data Platform — CLI/RUNTIME PASS
Clean PostgreSQL 16 schema and relational integrity.

### Stage 5 Engineering Foundation — CLI/RUNTIME PASS
API runtime, bounded DB pool/transactions, migration runner, env validation, logging/error envelope, strict TS/lint/unit/build, isolated Admin/Student builds.

### Stage 6 Auth & Authorization — CLI/RUNTIME PASS
Salted scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, DB lockout, reset-only recovery, explicit Admin bootstrap.

### Stage 7 Access Codes & Entitlements — CLI/RUNTIME PASS
Current baseline: Full Code 6 digits / Class Code 7 digits, crypto generation, Arabic/Persian normalization, row-locked transactional/idempotent redemption, renewal/no-waste/revoke/audit/concurrency tests.

### Stage 8 Student Activation & Account Flow — CLI/PostgreSQL/Chromium PASS
Baseline originally used Full Code + password in one activation request, then atomic profile/credential/entitlement/redemption/audit, returning login and reset-only recovery.

Chromium baseline proved:

```text
invalid code
→ activation
→ entitlement visible
→ logout
→ returning login
→ Admin recovery
→ password reset
→ old password rejected
→ new password accepted
```

Product decisions now partially reopen Stage 6/8 for two-step activation, temporary-password forced change and registered-device challenge/rebind.

### Stage 9 Content Model / deterministic `alwaslh-go` Import — CLI/PostgreSQL RUNTIME PASS

Verified source facts:

```text
15 subject roots
48 source documents
5,552 images
4,218 JPG
1,334 WEBP
86 recognized helper files
24 manifests
0 fatal inventory issues
100 duplicate blob groups / 201 paths retained for REVIEW
```

Canonical inventory SHA-256:
`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

Canonical DB: `content_import_runs`, `content_source_documents`, `content_source_assets`.

First clean import: 48 docs / 5,552 assets / `replayed=false`; identical import reused same run with `replayed=true`.

Critical defects caught/fixed:
- 8 Arabic-key manifests would have omitted 772 images;
- helper baseline 76→86;
- third manifest schema `filename/pdf_page/book_page`;
- Python/JS `9.0` vs `9` digest mismatch.

### Stage 10 Media Pipeline — CLI/PostgreSQL/MEDIA RUNTIME PASS

Migration `0009_media_pipeline.sql` adds `media_assets`, `media_variants`, `media_asset_status`, `media_variant_kind`.

Implemented:
- exact source identity;
- deterministic trusted storage keys;
- safe filesystem/path traversal prevention;
- bounded concurrency 1..8 with stable input/page order;
- Sharp `source/display/thumbnail/ai` variants;
- SHA-256/byte sizes/dimensions from produced bytes;
- Stage 9 provenance linkage;
- source-byte/provenance-bound idempotency/conflict rejection;
- exact replay byte verification;
- storage/metadata/abort cleanup;
- Poppler `pdfinfo`/`pdftoppm` with scoped temp dirs and numeric page validation;
- malformed PDF produces zero successful media rows;
- real 2-page PDF E2E: order `[1,2]`, positions `[100,101]`, tested display long edge `1200..1800` px.

Final Stage 10 head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final CI:
- Stage10 `33302270707` SUCCESS;
- Stage9 regression `33302270692` SUCCESS;
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

Therefore Stage 10 is formally closed at `CLI + PostgreSQL + MEDIA RUNTIME PASS`.

## Product Decision Batches 01–02

Canonical file: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### PED-001 — Preserve idea, improve execution
Same product idea; legacy implementation/UI details are not binding.

### PED-002 — Welcome before auth
Student sees a polished welcome/introduction screen before entry. Visible copy must be final Product-ready Arabic.

### PED-003 — Two-step activation

```text
6-digit Full Code verification
→ one-time short-lived activation ticket
→ mandatory Create Password
→ atomic account + credential + entitlement + redemption + audit
→ session
```

First step must not create/consume a partial account.

### PED-004 — Admin-assisted recovery
Admin may create temporary reset credential/password, revoke sessions and set `must_change_password`; Student must choose a new private password after login. Admin never sees old password.

### PED-005 — Simple but feature-complete Student UX
Student UI remains elegant/mobile-first and low-clutter while retaining valuable curriculum, study and personal-learning capabilities.

### PED-006 / PED-010 — Upload independent from AI
Admin upload/process/store works even if OCR/Gemini is unavailable. OCR and AI are separate jobs/workflows.

### PED-007 / PED-008 — OCR extraction layer

```text
page/source
→ OcrProvider
→ raw extracted text + provenance + provider/version/confidence/status
→ reusable stored OCR result
→ AI receives selected text/context
```

Original image is source of truth. Religious exact text, formulas/chemistry/tables and low-confidence OCR require review/fallback.

### PED-009 — Durable Gemini scheduling
Server-only authorized credentials/projects with health, quota/rate awareness, cooldown, retry/backoff, failover and usage/error metadata.

### PED-011 — No silent feature loss
Tests, summaries, `اختبر نفسك`, models/ministerial exams, explanations, attempts, resume/restart, versions, notes, favorites, review-later, progress and other valuable legacy learning features remain by default. Removal requires explicit owner approval.

### PED-012 — Summary / Self Practice / Full Test are distinct
- Summary = lesson/source review content.
- Self Practice = quick repeatable feedback-driven practice.
- Full Test/Model = attempt/session/history/scoring flow.
- Ministerial/exam model = explicit exam metadata/source/version semantics.

### PED-013 — Returning Student path
Welcome/entry includes `لدي حساب بالفعل` → identifier/password → device check → home.

### PED-014 — Single registered application device
Business requirement: Student account normally opens on one registered device only.

Security implementation direction:
- first activation generates application device cryptographic keypair;
- server stores public key + display metadata;
- returning online login requires password + signed server challenge;
- another/lost device is rejected until Admin reset/rebind;
- IP/user-agent/device model/browser fingerprint are not security proof;
- Web/PWA limitation: this binds an application key, not guaranteed physical hardware identity; clearing local storage may require recovery.

**Impact:** Stage 6/8 partial reopen + device registry/challenge/rebind + security/browser E2E.

### PED-015 — Offline is core and should reduce server load
- account/device-scoped local cache;
- explicit bounded downloads;
- revision/delta sync, not full refetch;
- local outbox for Student mutable data;
- signed offline entitlement snapshot bounded by real entitlement expiry;
- no generic auth API caching in Service Worker;
- server remains authority for trusted finalization/redemption/publish.

Exact offline lease duration/download granularity remain pending.

### PED-016 — Notes / Favorites / Needs Review remain separate
Semantics stay separate even if storage infrastructure is shared. Each item keeps stable provenance to lesson/page/question/model when applicable.

### PED-017 — Private achievements only
Keep personal achievements/progress; Global Leaderboard not required.

### PED-018 — Flexible explicit curriculum hierarchy
Direction:

```text
Curriculum/Year
→ Class/Grade
→ Subject Offering
→ optional Unit/Section
→ Lesson
→ Content/pages/resources
```

Units optional; explicit stable ordering; subject may link across offerings/classes; no filename inference. Exact year/version/archive schema pending.

### PED-019 — Admin Import/Export required
Module-scoped import/export with validation, preview/result reporting and fit-for-data formats (CSV/XLSX/PDF/structured package where appropriate).

### PED-020 — Draft → Review → Published
All AI outputs are Draft. Admin reviews/edits/validates before publish. Content lifecycle supports at least Draft/Published and later archive/replace/version semantics.

### PED-021 — Preserve legacy AI generation outcomes
At least: summaries, question generation, MCQ, T/F, mixed, extraction/source, selected page/image, regenerate, alternate version, exam/model, exact/replica where applicable, bulk generation, and source/page/answer/explanation/method/difficulty metadata where applicable.

Each mode requires versioned prompt, typed input/output schema, semantic validator and golden tests. OCR text + provenance is default input; vision fallback only when required.

## Architecture Decisions

- **AD-001** Preserve product value, not legacy mistakes.
- **AD-002** Security/data integrity before feature velocity.
- **AD-003** Version-controlled migrations canonical.
- **AD-004** Separate Admin/Student runtime concerns.
- **AD-005** Server-owned authorization/entitlements.
- **AD-006** AI secrets/durable execution server-side.
- **AD-007** Provider scheduling/failover belongs in workers.
- **AD-008** Offline sync is account-scoped with revisions/tombstones/outbox.
- **AD-009** `alwaslh-go` is source pipeline, not frontend assets.
- **AD-012** Private PostgreSQL behind Backend.
- **AD-013** Clean-slate data model.
- **AD-015** Executable verification mandatory for Stage PASS.
- **AD-016** Repository-owned handoff/status/log mandatory.
- **AD-018** Final activation account creation remains one transaction.
- **AD-023** Source/page order deterministic and independent from async completion.
- **AD-028** Canonical media processing server-owned.
- **AD-029** Media idempotency bound to exact source provenance+bytes.
- **AD-030** Supabase/Vercel Preview does not redefine final architecture.
- **AD-031** Legacy parity is decision inventory; no valuable feature removal without explicit owner decision.
- **AD-032** Product decision may reopen verified stage only with impact analysis + executable regression.
- **AD-033** Two-step activation uses temporary verification ticket while final write remains atomic.
- **AD-034** Normal Admin upload cannot depend on AI/OCR availability.
- **AD-035** OCR is provider-abstracted reusable extraction layer.
- **AD-036** AI generation text-first by default; original source remains authoritative evidence/fallback.
- **AD-037** AI credentials/projects scheduled server-side with health/rate/cooldown/failover.
- **AD-038** Student account uses registered cryptographic application-device identity, never browser fingerprint as sole proof.
- **AD-039** Offline is first-class; local account/device-scoped data + delta sync/outbox reduce server traffic while authority remains server-side.
- **AD-040** Notes, Favorites and Needs Review are separate product semantics.
- **AD-041** Public/global student leaderboard is not required; achievements are private/personal.
- **AD-042** Content/AI lifecycle requires human review before publish.
- **AD-043** Curriculum hierarchy should be explicit/flexible, not arbitrary generic tree or filename-derived.

## Audit Findings

| ID | Severity | Area | Problem | Solution / Status |
|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged mutation | FIXED Stage 6 |
| SEC-002..011 | P0 | Authorization | public/browser DB privilege paths | ELIMINATED by private backend architecture |
| DATA-015 | P0 | Activation | legacy partial/nontransactional activation | FIXED baseline; two-step refactor must preserve final atomic transaction |
| DATA-018 | P0 | Class Codes | racy redemption | FIXED Stage 7 |
| SEC-015..018 | P1 | Credentials | plaintext/reversible recovery | FIXED; Admin reset only |
| DATA-025 | P1 | Assessment | client-trusted score/rank | REMAINING later trusted Practice/attempt engine |
| OFF-* | P1/P2 | Offline | global/stale/cross-account cache risk | REBUILD required by PED-015 |
| AI-* | P1/P2 | AI | browser-owned jobs/weak validation | REBUILD required by PED-007/009/021 |
| CONTENT-009-* | P1/P2 | Content | manifest/helper/digest completeness defects | FIXED Stage 9 |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | FIXED Stage 10 runtime |
| PREVIEW-010-001 | P2 | Vercel | Stage10 direct deploy expects root `dist` | OPEN; Preview reconciliation required |
| PREVIEW-010-002 | P2 | Preview Media | serverless FS ephemeral/Poppler unproven | NOT YET VERIFIED |
| PRODUCT-001 | P1 | Product Strategy | blind legacy parity risks wrong UX | IN PROGRESS review; preserve outcomes, improve organization |
| PRODUCT-002 | P1 | Activation UX | baseline combines code+password | DECIDED refactor pending |
| PRODUCT-003 | P1 | Device Policy | password-only login does not enforce requested one-device policy | DECIDED architecture; implementation pending |
| PRODUCT-004 | P1 | Offline/Load | repeated server fetches conflict with offline/low-load requirement | DECIDED architecture; implementation pending |
| AI-NEW-001 | P1 | AI Cost | repeated image-to-Gemini use wastes tokens | DECIDED OCR text-first path pending |

## Temporary Preview

- Supabase `linksoftt` temporary only.
- migrations through `0008` applied; `0009` still pending there.
- Preview RLS/revokes block direct `anon`/`authenticated` table access.
- Vercel team `wasl15`, project `alwaslh`.
- preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`.
- READY deployment and `/api/health` HTTP 200 verified.
- Preview remains pre-Stage-10.
- direct Stage10 branch deployment error: `No Output Directory named "dist" found after the Build completed.`
- Vercel filesystem/Poppler durability is NOT YET VERIFIED.

## Current Roadmap Impact

Before feature-heavy implementation:

1. finish Product Evolution Review for Reader, Practice details, curriculum versioning, Offline details, Admin roles and QA;
2. partially reopen Stage 6/8 for two-step activation, forced password change, registered device challenge and rebind;
3. sync Stage 10 stable baseline into Preview and fix Vercel build/routing;
4. add OCR Extraction Foundation independent from upload;
5. Stage 11 AI contracts preserve all agreed generation modes using OCR text + provenance;
6. Stage 12 durable AI implements jobs/scheduler/retry/cooldown/failover/metrics/idempotency;
7. Admin Product implements flexible curriculum, independent upload, OCR states, review/publish, AI review, import/export;
8. Student Product implements Welcome/login, curriculum/Reader, summaries, practice, tests/models, notes/favorites/review-later, progress/private achievements;
9. Offline/PWA is mandatory and account/device-scoped with low-request delta sync.

## Remaining Product Decisions

- Reader detailed UX/search/highlights/page jump/settings.
- Practice/Test question types/timing/review/scoring/attempts/ministerial semantics.
- Curriculum year/version/archive/replacement.
- Offline download scopes + authorization lease duration.
- Admin roles/permissions.
- Notes media types + sync conflict UX.
- notifications/search/exact reports/import/export scopes.

## Documentation / Continuity Protocol

After every meaningful batch:
- update this log;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` when business/roadmap/baseline changes;
- update `docs/product/PRODUCT_EVOLUTION_REVIEW.md`;
- update `PRODUCT_FEATURE_PARITY_MATRIX.md` / `MASTER_REBUILD_ROADMAP.md` when decisions alter scope;
- retain exact CI evidence;
- mark unexecuted work `NOT YET VERIFIED`.

## Current State

**Stages 1–10 have verified technical gates. Product Evolution Review Batches 01–02 are recorded. Stage 6/8 require a deliberate auth/device refactor before final Student Product; Stage 10 still needs Preview sync; OCR/text-first AI, feature-complete learning flows, flexible curriculum, Admin review/publish, Import/Export and first-class Offline are now explicit product requirements.**
