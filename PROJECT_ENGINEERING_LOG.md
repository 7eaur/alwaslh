# PROJECT ENGINEERING LOG

> Engineering source of truth for product understanding, architecture decisions, implementation history, verification evidence and remaining work. Read `PROJECT_HANDOFF.md` first, then `PROJECT_STATUS.md` and `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

## Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين رئيسيين:

- **Student PWA:** التفعيل/الدخول، الوصول للمنهج، الدراسة، النماذج/الاختبارات، الملاحظات، المفضلة/الحفظ، التقدم وبقية الأدوات المفيدة.
- **Admin Web:** إدارة الصفوف/المواد/الدروس/المحتوى، الرفع والمعالجة، الطلاب والوصول، AI authoring، الجودة والتقارير.

### Product governance after Stage 10

الفكرة الأساسية لا تتغير. التطبيق القديم هو reference/inventory للفكرة والمميزات والسيناريوهات والمشكلات، وليس specification ملزمة. كل Feature/Flow/Business Rule رئيسي يناقش ويصنف `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW`.

`PRODUCT_FEATURE_PARITY_MATRIX.md` هو inventory لمنع إسقاط المعرفة بالخطأ، وليس Automatic KEEP list.

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
- OCR is a separate extraction layer; upload does not depend on AI.
- Gemini secrets/execution are server-owned.

## Implemented baseline — Stages 1–10

### Stage 1 Product Inventory — CLI PASS
Legacy feature/user-flow inventory, initial parity safety net and automated capability checks.

### Stage 2 Brand — CLI PASS
Owned teal/open-book identity, canonical tokens/assets, Arabic typography, focus/reduced-motion/touch rules.

### Stage 3 UX Architecture — CLI PASS
Initial Admin/Student IA, states and critical flows. These may be improved through the active Product Evolution Review.

### Stage 4 PostgreSQL Data Platform — CLI/RUNTIME PASS
Clean PostgreSQL 16 schema and relational integrity.

### Stage 5 Engineering Foundation — CLI/RUNTIME PASS
Real API runtime, bounded DB pool/transactions, migration runner, env validation, logging/error envelope, strict TS/lint/unit/build, isolated app builds.

### Stage 6 Auth & Authorization — CLI/RUNTIME PASS
Salted scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, DB lockout, reset-only recovery, explicit Admin bootstrap.

### Stage 7 Access Codes & Entitlements — CLI/RUNTIME PASS
Current baseline: 6-digit Full Code / 7-digit Class Code, crypto generation, Arabic/Persian normalization, row-locked transactional/idempotent redemption, renewal/no-waste/revoke/audit/concurrency tests.

### Stage 8 Student Activation & Account Flow — CLI/PostgreSQL/Chromium PASS
Verified baseline originally used Full Code + password in one activation request, then atomic profile/credential/entitlement/redemption/audit, returning identifier/password login and reset-only recovery.

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

**Product Decision PED-003 now explicitly reopens this UX/API contract**: final product will use code verification first, then mandatory password creation, while retaining atomic final account creation.

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

Defects caught/fixed:
- 8 Arabic-key manifests would have omitted 772 images;
- helper baseline 76→86;
- third manifest schema `filename/pdf_page/book_page`;
- Python/JS `9.0` vs `9` digest mismatch.

### Stage 10 Media Pipeline — CLI/PostgreSQL/MEDIA RUNTIME PASS

Migration `0009_media_pipeline.sql` adds `media_assets`, `media_variants`, `media_asset_status`, `media_variant_kind`.

Implemented:
- exact source identity;
- deterministic trusted relative storage keys;
- safe filesystem adapter/path traversal prevention;
- bounded concurrency 1..8 with stable input/page order;
- Sharp `source/display/thumbnail/ai` variants;
- SHA-256/byte sizes/dimensions from produced bytes;
- Stage 9 provenance linkage;
- source-byte/provenance-bound idempotency/conflict rejection;
- exact replay byte verification;
- storage/metadata/abort cleanup;
- Poppler `pdfinfo`/`pdftoppm` with scoped temp dirs and numeric page validation;
- malformed PDF produces zero successful media rows;
- real 2-page PDF E2E: order `[1,2]`, positions `[100,101]`, display long edge inside tested `1200..1800` px.

Final Stage 10 head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final CI:
- Stage 10 `33302270707` SUCCESS;
- Stage 9 regression `33302270692` SUCCESS;
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

Therefore Stage 10 is formally closed at `CLI + PostgreSQL + MEDIA RUNTIME PASS`.

## Product Decision Batch 01

Canonical file: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

### PED-001 — Preserve idea, improve product
Same product idea; legacy details are not binding.

### PED-002 — Welcome/education before Student auth
Student sees an elegant welcome/introduction experience before login/activation. All visible copy must be final Product-ready Arabic, no placeholder/dev text.

### PED-003 — Two-step first activation

Final target UX:

```text
Enter 6-digit Full Code
→ server verifies eligibility
→ mandatory Create Password screen
→ atomic account + credential + entitlement + redemption + audit
→ authenticated session
```

Engineering rule: first step must not create a partial account or consume the code permanently. Use a short-lived one-time activation ticket bound to the code. Final account creation remains transactional/idempotent/race-safe.

**Impact:** reopen Stage 8 API/UI/browser E2E before final Student Product.

### PED-004 — Admin-assisted recovery
Student contacts Admin and provides code/account identifier. Admin can reset but never reveal existing password.

Preferred implementation:
- Admin creates temporary reset password/credential;
- set `must_change_password=true`;
- revoke existing sessions;
- student must choose a new password after next login;
- audit every reset.

Temporary-password vs one-time reset-code detail still needs final product confirmation.

### PED-005 — Student UX
Student UI must be elegant, ordered, mobile-first and low-clutter. Preserve curriculum, models/quizzes, notes, favorites/saved items, progress/tracking and other useful legacy capabilities after explicit review.

### PED-006 / PED-010 — Upload independent from AI
Admin can add classes/subjects/lessons and upload images/PDF normally. Media validation/process/store succeeds without Gemini. OCR is separate; AI generation only starts on explicit workflow/request.

### PED-007 / PED-008 — OCR extraction layer

Target:

```text
page image/source
→ OCR provider abstraction
→ extracted text + source/page provenance + provider/version/confidence/status
→ persist reusable OCR result
→ Gemini consumes selected compact text/context
```

Original source image remains source of truth. Low-confidence OCR, religious exact text, formulas/chemistry/tables require review/fallback.

Expected benefits:
- fewer repeated multimodal tokens;
- lower latency/cost;
- cheaper retries;
- reusable searchable text;
- easier prompt/golden testing.

### PED-009 — Durable Gemini credential/project scheduling
All secrets server-only. Durable AI stage must support configured authorized credentials/projects with:
- health state;
- quota/rate awareness;
- cooldown;
- retry/backoff;
- failover;
- prompt/model/token/latency/error metadata.

Key switching is for reliability/load distribution within authorized provider resources, never to bypass provider terms or limits.

## Architecture Decisions

- **AD-001** Preserve product value, not legacy mistakes.
- **AD-002** Security/data integrity before feature velocity.
- **AD-003** Version-controlled migrations canonical.
- **AD-004** Separate Admin/Student runtime concerns.
- **AD-005** Server-owned authorization/entitlements.
- **AD-006** AI secrets/durable execution server-side.
- **AD-007** Provider scheduling/failover belongs in workers.
- **AD-008** If Offline retained, sync must be account-scoped with revisions/tombstones/outbox.
- **AD-009** `alwaslh-go` is source pipeline, not frontend assets.
- **AD-012** Private PostgreSQL behind Backend.
- **AD-013** Clean-slate data model.
- **AD-015** Executable verification mandatory for Stage PASS.
- **AD-016** Repository-owned handoff/status/log mandatory.
- **AD-018** Final activation account creation must remain one transaction.
- **AD-023** Source/page order is deterministic and independent from async completion.
- **AD-028** Canonical media processing server-owned.
- **AD-029** Media idempotency bound to exact source provenance+bytes.
- **AD-030** Supabase/Vercel Preview does not redefine final architecture.
- **AD-031** Legacy feature parity is decision inventory, not immutable contract.
- **AD-032** Recorded product decision may reopen a verified stage only with impact analysis + executable regression.
- **AD-033** Student first activation UX is two-step; temporary verification ticket bridges steps while final write remains atomic.
- **AD-034** Normal Admin upload cannot depend on AI availability.
- **AD-035** OCR is a provider-abstracted reusable extraction layer between media and AI authoring.
- **AD-036** AI generation is text-first by default; source image remains authoritative evidence/fallback.
- **AD-037** AI credentials/projects are scheduled server-side with health/rate/cooldown/failover controls.

## Audit Findings

| ID | Severity | Area | Problem | Solution / Status |
|---|---|---|---|---|
| SEC-001 | P0 | Admin Auth | Legacy anonymous privileged mutation | FIXED Stage 6 |
| SEC-002..011 | P0 | Authorization | public/browser DB privilege paths | ELIMINATED by private backend architecture |
| DATA-015 | P0 | Activation | legacy partial/nontransactional activation | FIXED Stage 8 baseline; two-step UX refactor must retain atomic final transaction |
| DATA-018 | P0 | Class Codes | racy redemption | FIXED Stage 7 |
| SEC-015..018 | P1 | Credentials | plaintext/reversible recovery | FIXED Stages 6–8; Admin recovery may reset only |
| DATA-025 | P1 | Assessment | client-trusted score/rank | REMAINING product review/later engine |
| OFF-* | P1/P2 | Offline | global/stale/cross-account cache risk | REMAINING if Offline retained |
| AI-* | P1/P2 | AI | browser-owned jobs/weak validation | REMAINING; PED-007/009 define new direction |
| CONTENT-009-* | P1/P2 | Content | manifest/helper/digest completeness defects | FIXED Stage 9 |
| MEDIA-010-* | P1/P2 | Media | order/idempotency/failure/PDF defects | FIXED Stage 10 runtime |
| PREVIEW-010-001 | P2 | Vercel | Stage10 direct deploy expects root `dist` | OPEN; Preview sync/build config reconciliation required |
| PREVIEW-010-002 | P2 | Preview Media | serverless FS ephemeral/Poppler unproven | NOT YET VERIFIED |
| PRODUCT-001 | P1 | Product Strategy | blind legacy parity risks weak UX/complexity | IN PROGRESS Product Evolution Review |
| PRODUCT-002 | P1 | Activation UX | baseline combines code+password, product now requires two steps | DECIDED; Stage 8 refactor pending |
| AI-NEW-001 | P1 | AI Cost/Throughput | repeated image-to-Gemini generation wastes tokens and couples upload/AI | DECIDED; OCR text layer + text-first generation pending implementation |

## Temporary Preview

- Supabase project `linksoftt` temporary only.
- canonical migrations through `0008` applied; `0009` still pending there.
- Preview-only RLS/revokes block direct `anon`/`authenticated` application-table access.
- Vercel team `wasl15`, project `alwaslh`.
- preview branch `preview/supabase-vercel` at `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`.
- READY deployment exists and `/api/health` returned HTTP 200.
- Preview remains pre-Stage-10.
- direct Stage10 branch deployments fail with `No Output Directory named "dist" found after the Build completed.`
- Vercel filesystem is ephemeral; live durable media/Poppler there is NOT YET VERIFIED.

## Current Roadmap Impact

Before feature-heavy Stage 11+ implementation:

1. continue Product Evolution Review and settle core Student/Admin/learning decisions;
2. reopen Stage 8 for two-step activation flow + new browser E2E;
3. sync Stage 10 stable baseline into Preview and fix Vercel build/routing configuration;
4. add OCR Extraction Layer after Media Pipeline, independent from upload success;
5. Stage 11 prompt/output contracts consume OCR text + provenance and enforce semantic/golden validation;
6. Stage 12 durable AI execution implements jobs, scheduler, retries/cooldown/failover and usage telemetry;
7. Admin/Student product stages implement the agreed flows, not copied legacy screens.

## Remaining Product Decisions

Still to discuss explicitly:
- Class Code/full access expiry/renewal/transfer/revoke details;
- Student Home/navigation;
- Reader/search/highlights/reading settings;
- Practice vs Quiz vs models/ministerial exams;
- notes/saved/folders/tags/sync;
- progress/mastery/achievements/rank;
- notifications;
- Offline/PWA/download policy;
- Admin roles/permissions;
- content draft/review/publish/versioning;
- AI authoring modes/human review;
- Quiz Builder/content QA;
- reports/export;
- search/discovery;
- support/account/code operations.

## Documentation / Continuity Protocol

After every meaningful decision/implementation batch:
- update this log;
- update `PROJECT_STATUS.md`;
- update `PROJECT_HANDOFF.md` for business-rule/roadmap/baseline changes;
- update `docs/product/PRODUCT_EVOLUTION_REVIEW.md` for every Product decision;
- revise `PRODUCT_FEATURE_PARITY_MATRIX.md` / `MASTER_REBUILD_ROADMAP.md` when decisions alter scope;
- retain exact CI evidence;
- mark unexecuted work `NOT YET VERIFIED`.

## Current State

**Stages 1–10 have verified technical gates. The active phase is Product Evolution Review. Batch 01 is recorded. Stage 8 activation requires a deliberate refactor before final Student Product, Stage 10 still needs Preview sync, and OCR/text-first AI architecture is now an explicit requirement before full Gemini authoring.**
