# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** نقطة البداية الإلزامية لأي محادثة/مهندس جديد. اقرأ هذا الملف أولًا، ثم `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`, ثم عقد/DoD المرحلة ذات الصلة. المستودع ونتائج CLI/CI هي المصدر الأعلى للحقيقة؛ لا تعتمد على ذاكرة المحادثة.

## 1. Product

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين منفصلين منطقيًا:

- **Student PWA:** تجربة الطالب للدخول والوصول للمحتوى والتعلّم والمراجعة والممارسة.
- **Admin Web:** إدارة المحتوى والطلاب والوصول والـAI والتشغيل والتقارير.

المنتج القديم ليس مواصفة ملزمة. هو مرجع لـ:

- الفكرة الأساسية؛
- الاحتياجات والسيناريوهات التي أثبتت قيمة؛
- المحتوى والبيانات المرجعية؛
- الأخطاء المعمارية/الأمنية/المنتجية التي يجب ألا تتكرر.

من الآن فصاعدًا كل Feature/Flow/Business Rule رئيسي يُناقش مع product owner ويصنف `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW` قبل تثبيت الخطة النهائية للمراحل المتبقية.

## 2. Source repositories

- `7eaur/alwaslh`: المنتج المرجعي + إعادة البناء الجديدة.
- `7eaur/alwaslh-go`: مصدر curriculum/books/images/government exams؛ يدخل عبر deterministic content pipeline ولا يُشحن raw إلى frontend.
- Stage 9 pinned source revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

## 3. Non-negotiable engineering decisions currently verified

هذه القرارات هي baseline هندسية مثبتة. إذا قرر Product Review تغيير Business Rule مبني عليها، يُعاد فتح الجزء المتأثر رسميًا مع impact analysis وtests؛ لا يتم كسر العقد بصمت.

1. PostgreSQL خاصة خلف Backend API في الإنتاج النهائي؛ Browser لا يتصل مباشرة بقاعدة البيانات.
2. Clean-slate schema/data؛ legacy Supabase schema/data ليست compatibility target.
3. Admin وStudent منفصلان في UX/runtime concerns حتى لو اشتركا مؤقتًا في Preview deployment.
4. Auth/Authorization/Entitlements server-side.
5. لا plaintext/reversible passwords ولا device fingerprint كدليل مصادقة.
6. current Full access code contract = **6 digits**؛ current Class access code contract = **7 digits**.
7. Redemption/activation transactional + idempotent + race-safe.
8. current Student activation contract: Full Code + password، وبعد التفعيل يصبح Full Code المطبّع current returning identifier وليس secret.
9. Recovery = reset ولا يعرض السر الأصلي.
10. `alwaslh-go` Content Source فقط؛ importer يحفظ source/order/provenance/checksum ولا يستنتج Lessons من filenames.
11. ترتيب الصفحات/الأصول source-derived deterministic؛ async completion order لا يملك معنى business.
12. media processing server-owned؛ Sharp للصور وPoppler للـPDF في runtime المثبت.
13. لا Stage تُغلق بلا executable evidence. الحالات الرسمية: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; غير المنفذ = `NOT YET VERIFIED`.
14. كل Stage مستقرة يجب أن تُزامن مع Preview المؤقتة وتتحقق هناك قبل الاعتماد العملي عليها، مع توثيق platform limitations.

## 4. Verified stages

### Stage 1 — Product Contract ✅ CLI PASS
Legacy/product inventory + feature-preservation safety net. بعد قرار Product Evolution Review، هذه المصفوفة تُعامل كـdecision inventory وليست إلزامًا بالحفاظ على كل legacy behavior.

### Stage 2 — Brand Identity ✅ CLI PASS
Owned teal/open-book identity تحت `packages/brand`.

### Stage 3 — UX Architecture ✅ CLI PASS
Admin/Student IA + critical states/flows + responsive/accessibility contracts. يمكن تعديل الـflows في Product Review إذا اتخذ قرار أفضل.

### Stage 4 — PostgreSQL Data Platform ✅ CLI/RUNTIME PASS
Clean PostgreSQL 16 migrations and relational integrity.

### Stage 5 — Engineering Foundation ✅ CLI/RUNTIME PASS
API, DB pool/transactions, migration runner, config/logging/errors, strict TS/lint/unit/build, isolated app builds and CI.

### Stage 6 — Auth & Authorization ✅ CLI/RUNTIME PASS
Salted scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, DB lockout, reset-only recovery, explicit Admin bootstrap.

### Stage 7 — Access Codes & Entitlements ✅ CLI/RUNTIME PASS
Crypto-secure 6/7-digit codes, Arabic/Persian normalization, transactional/idempotent redemption, renewal/no-waste/revoke/audit/race tests.

### Stage 8 — Student Activation & Account Flow ✅ CLI/RUNTIME/BROWSER E2E PASS
Atomic activation → profile/credential/entitlement/redemption/audit → canonical login/session. Returning login + reset-only recovery verified in Chromium.

### Stage 9 — Content Model & deterministic `alwaslh-go` Import ✅ CLI/PostgreSQL RUNTIME PASS

Verified inventory:

```text
15 subject roots
48 source documents
5,552 images
4,218 JPG
1,334 WEBP
86 recognized helper files
24 manifests
0 fatal inventory issues
```

Canonical inventory SHA-256:
`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

Clean PostgreSQL import proves first import `replayed=false`, identical reimport `replayed=true`, exactly 48 present documents / 5,552 present assets / unique positions.

Critical Stage 9 defects caught before closure included:
- 8 Arabic-key manifests that otherwise omitted 772 images؛
- helper baseline drift 76→86؛
- third `filename/pdf_page/book_page` manifest schema؛
- Python/JS `9.0` vs `9` canonical digest mismatch.

### Stage 10 — Media Pipeline ✅ CLI/PostgreSQL/MEDIA RUNTIME PASS / FINAL DOC-HEAD VERIFIED

**Branch / PR:** `rebuild/media-pipeline` / PR #11.

**Final Stage 10 documentation head:**
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final same-head evidence:
- Stage 10 dedicated run `33302270707` — **SUCCESS**.
- Stage 9 import regression `33302270692` — **SUCCESS**.
- Complete rebuild regression `33302270695` — **SUCCESS**, including Chromium E2E.

Earlier executable code-head evidence:
- code head `f9f58ed4b9cf599d992a08b9c9eb33d3ae1a17c3`;
- dedicated run `33302062208` — SUCCESS;
- Stage 9 regression `33302062209` — SUCCESS;
- full regression `33302062216` — SUCCESS.

Stage 10 pipeline:

```text
source/upload bytes
→ validate exact source identity
→ stable source/page position
→ Sharp image pipeline OR local Poppler PDF extraction
→ bounded ordered transforms
→ source/display/thumbnail/AI variants
→ SHA-256 + dimensions + byte sizes
→ deterministic trusted storage keys
→ storage writes
→ PostgreSQL metadata transaction
```

Canonical data model added by `0009_media_pipeline.sql`:
- `media_assets`
- `media_variants`
- enums `media_asset_status`, `media_variant_kind`.

Verified invariants:
- exact source-byte/provenance-bound idempotency;
- conflicting key ownership rejected;
- exact ready replay validates stored bytes against DB SHA/size;
- optional `content_source_asset_id` preserves Stage 9 provenance;
- bounded concurrency 1..8 with input/page order independent from completion order;
- path traversal rejected;
- storage/metadata/abort failures clean partial objects and retain observable failed state;
- scoped Poppler temp dirs + numeric page validation;
- real 2-page PDF passed extraction → transforms → storage → PostgreSQL → exact replay with order `[1,2]` and positions `[100,101]`;
- malformed PDF creates zero media rows;
- no successful temp residue;
- tested display long edge stayed within `1200..1800` px.

## 5. Canonical migrations

`0001_core.sql` → `0002_access.sql` → `0003_learning.sql` → `0004_ai_and_sync.sql` → `0005_auth.sql` → `0006_access_contract.sql` → `0007_activation_contract.sql` → `0008_content_source_import.sql` → `0009_media_pipeline.sql`.

## 6. Branch / PR stack

- `rebuild/foundation` / PR #2
- `rebuild/auth-authorization` / PR #3
- `rebuild/access-entitlements` / PR #4
- `rebuild/student-activation-ui` / PR #5
- `rebuild/student-activation-backend` / PR #6
- `rebuild/student-activation-integration` / PR #7
- `rebuild/content-import` / PR #8
- `rebuild/content-source-audit` / PR #9 (audit-only)
- `preview/supabase-vercel` / PR #10 (temporary running test environment)
- `rebuild/media-pipeline` / PR #11 (Stage 10 source of truth; draft/open)
- **`planning/product-evolution-review` — current planning/decision branch created from final Stage 10 head.**

## 7. Temporary Supabase/Vercel Preview

Purpose: let the product owner test the evolving application before final hosting.

- Supabase project: `linksoftt` — temporary PostgreSQL/testing platform only.
- Vercel project: `alwaslh` under team `wasl15`.
- Preview branch: `preview/supabase-vercel`.
- Current Preview head: `1eb623ef0cd3f7b47af7aa6add08c87d88f84f81`.
- A deployment of that head is `READY`.
- `/api/health` was rechecked and returned HTTP 200 with `{"status":"ok","service":"alwaslh-api"}`.
- Preview is still pre-Stage-10; migration `0009` and Stage 10 code are not synchronized there yet.
- Direct Vercel builds from `rebuild/media-pipeline` currently fail with `No Output Directory named "dist" found after the Build completed`; this is a Vercel project/branch build configuration mismatch, not a failure of Stage 10 GitHub CI/runtime.
- Browser/PostgREST access to application tables is intentionally blocked; Backend API remains the boundary.
- Vercel serverless filesystem is ephemeral and Poppler/media upload behavior there remains `NOT YET VERIFIED`.

## 8. Important defects caught and fixed

- Legacy public/admin-insecure DB paths and browser-direct privilege assumptions removed by target architecture.
- Legacy plaintext/reversible credential/recovery patterns replaced by scrypt/session/reset-only contracts.
- root PostCSS/Tailwind leakage into new apps.
- Auth strict TypeScript/scrypt boundary defects.
- Stage 7 enum/JSON/default typing, audit atomicity and idempotency ownership issues.
- Stage 8 DB test isolation / runner discovery / production API build-start mismatch.
- Stage 9 incomplete manifest compatibility and cross-language digest defects.
- Stage 10 original legacy completion-order page reorder risk eliminated with stable preassigned positions.
- Stage 10 design review strengthened idempotency ownership to exact source bytes/provenance.
- Stage 10 failure injection proved storage/metadata/abort cleanup.

## 9. Product Evolution Review — CURRENT WORK

The product owner explicitly decided that remaining development must not blindly inherit the old application. We will re-evaluate **all product features and scenarios** and select the best approach for the current product.

Canonical review file:
`docs/product/PRODUCT_EVOLUTION_REVIEW.md`

Topics include:
- product audience/value;
- account/access/activation;
- curriculum/navigation;
- Student home/reader;
- Practice/quizzes;
- Student AI;
- notes/saved/highlights;
- statistics/achievements/gamification;
- notifications;
- Offline/PWA;
- Admin roles;
- content workflow/media;
- Admin AI authoring;
- Quiz Builder/QA;
- students/codes/support;
- reports/export;
- search/discovery;
- publishing/version lifecycle;
- new product ideas.

Each decision records legacy behavior, user need, options, chosen approach, classification, business/UX/data/security/offline/AI impact, stages affected and DoD/tests.

## 10. Roadmap governance from this point

- Stages 1–10 remain verified baseline until a recorded product decision explicitly reopens part of them.
- Stage 11–29 scope/order may change after Product Evolution Review.
- `PRODUCT_FEATURE_PARITY_MATRIX.md` is a decision inventory, not an automatic KEEP list.
- No new feature-heavy stage begins while core product decisions that affect it are still pending.
- Preview synchronization remains required after the resulting stable baseline is decided.

## 11. NOT YET VERIFIED / remaining release risks

- Stage 10 temporary Preview synchronization;
- production media volume durability/backup/load/Poppler environment;
- final product decisions for remaining Admin/Student features;
- Gemini prompt/semantic/golden contracts and durable execution runtime;
- complete Admin and Student learning products;
- Practice Engine / trusted scoring;
- Offline replica/outbox/service-worker lifecycle;
- full performance/security/accessibility/device/staging/rollback/release gates.

## 12. Next required sequence

1. Conduct Product Evolution Review with the product owner and record decisions in `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.
2. Update `PRODUCT_FEATURE_PARITY_MATRIX.md` and `MASTER_REBUILD_ROADMAP.md` from decisions, not assumptions.
3. Reopen any affected Stage 1–10 contract only if a recorded decision requires it; rerun affected executable gates.
4. Synchronize the resulting stable baseline into `linksoftt` + `preview/supabase-vercel`; fix Vercel build/routing configuration and verify deployment.
5. Begin the revised next implementation stage.

## 13. Mandatory continuation protocol

At every meaningful implementation/decision batch:
- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_STATUS.md`;
- update this handoff when baseline/architecture/business rules/branches/Preview status changes;
- update `docs/product/PRODUCT_EVOLUTION_REVIEW.md` for product decisions;
- keep exact run/commit evidence;
- unexecuted = `NOT YET VERIFIED`;
- transition report: `المرحلة الحالية → ما تم → ما لم يتم → Definition of Done → هل ننتقل أم لا.`
