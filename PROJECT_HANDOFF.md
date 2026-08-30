# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** نقطة البداية الإلزامية لأي محادثة/مهندس جديد. اقرأ هذا الملف أولًا، ثم `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `PRODUCT_FEATURE_PARITY_MATRIX.md`, `MASTER_REBUILD_ROADMAP.md`, ثم عقد/DoD المرحلة الحالية. المستودع ونتائج CLI/CI هي المصدر الأعلى للحقيقة؛ لا تعتمد على ذاكرة المحادثة.

## 1. Product

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين منفصلين منطقيًا:

- **Student PWA:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، ملخص/Practice، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات/إنجازات، Offline/PWA.
- **Admin Web:** محتوى ورفع ومعالجة، Gemini/AI generation، Quiz Builder، الطلاب، Full/Class access codes، الإشعارات، التقارير، التصدير والإعدادات.

الهدف: نفس الفكرة والسيناريوهات والنتائج للمستخدم بتنفيذ أقوى وأوضح وأكثر أمانًا وقابلية للصيانة. Feature parity تقاس بالنتيجة لا بطريقة التنفيذ القديمة.

## 2. Source repositories

- `7eaur/alwaslh`: المنتج المرجعي + إعادة البناء الجديدة.
- `7eaur/alwaslh-go`: مصدر curriculum/books/images/government exams؛ يدخل عبر deterministic content pipeline ولا يُشحن raw إلى frontend.
- Stage 9 pinned source revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

## 3. Non-negotiable architecture decisions

1. PostgreSQL ذاتية الاستضافة، خاصة، خلف Backend API في الإنتاج النهائي.
2. Browser لا يتصل مباشرة بقاعدة البيانات.
3. Clean-slate schema/data؛ legacy Supabase schema/data ليست compatibility target.
4. Admin وStudent تطبيقان منفصلان في UX/runtime concerns حتى لو اشتركا مؤقتًا في Preview deployment.
5. Auth/Authorization/Entitlements server-side.
6. لا plaintext/reversible passwords ولا device fingerprint كدليل مصادقة.
7. Full access code = **6 digits**؛ Class access code = **7 digits**.
8. Redemption/activation transactional + idempotent + race-safe.
9. بعد أول تفعيل، Full Code يصبح معرّف حساب الطالب؛ كلمة المرور تبقى السر.
10. Recovery = reset ولا يعرض السر الأصلي.
11. Student offline data لاحقًا account-scoped مع revisions/tombstones/outbox.
12. Gemini keys server-only؛ durable execution في Stage 12.
13. `alwaslh-go` Content Source فقط؛ importer يحفظ source/order/provenance/checksum metadata ولا يستنتج Lessons من filenames.
14. لا Stage تُغلق بلا executable evidence. الحالات الرسمية: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; غير المنفذ = `NOT YET VERIFIED`.
15. لا نبدأ Stage التالية قبل إغلاق Integration Gate للمرحلة الحالية.
16. ترتيب الصفحات/الأصول source-derived deterministic؛ async completion order لا يملك معنى business.
17. كل Stage مستقرة يجب أن تُزامن مع بيئة Preview المؤقتة Supabase/Vercel وتتحقق هناك قبل متابعة المرحلة التالية، مع توثيق أي limitations للمنصة المؤقتة.

## 4. Verified stages

### Stage 1 — Product Contract ✅ CLI PASS
Feature-preservation contract + automated parity checks.

### Stage 2 — Brand Identity ✅ CLI PASS
Owned teal/open-book identity تحت `packages/brand`.

### Stage 3 — UX Architecture ✅ CLI PASS
Admin/Student IA + critical states/flows + responsive/accessibility contracts.

### Stage 4 — PostgreSQL Data Platform ✅ CLI/RUNTIME PASS
Clean PostgreSQL 16 migrations and relational integrity.

### Stage 5 — Engineering Foundation ✅ CLI/RUNTIME PASS
API, DB pool/transactions, migration runner, config/logging/errors, strict TS/lint/unit/build, isolated app builds and CI.

### Stage 6 — Auth & Authorization ✅ CLI/RUNTIME PASS
Salted scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, DB lockout, reset-only recovery, explicit Admin bootstrap.

### Stage 7 — Access Codes & Entitlements ✅ CLI/RUNTIME PASS
Crypto-secure 6/7-digit codes, Arabic/Persian normalization, transactional/idempotent redemption, renewal/no-waste/revoke/audit/race tests.

### Stage 8 — Student Activation & Account Flow ✅ CLI/RUNTIME/BROWSER E2E PASS
Atomic Full-Code activation → profile/credential/entitlement/redemption/audit → canonical login/session. Returning login + reset-only recovery verified in Chromium.

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

### Stage 10 — Media Pipeline ✅ CODE HEAD CLI/PostgreSQL/MEDIA RUNTIME PASS

**Branch / PR:** `rebuild/media-pipeline` / PR #11.

**Final executable code head before documentation closure:**
`f9f58ed4b9cf599d992a08b9c9eb33d3ae1a17c3`

Evidence:
- Stage 10 dedicated run `33302062208` — **SUCCESS**.
- Stage 9 import regression `33302062209` — **SUCCESS**.
- Complete rebuild regression `33302062216` — **SUCCESS**, including Chromium E2E.

Stage 10 implementation:

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

Key invariants now executable:
- media idempotency key is bound to exact provenance/position/filename/MIME/page/source SHA-256/byte size; mismatched reuse → `idempotency_conflict` before retry mutation;
- exact ready replay validates stored bytes against DB SHA/size;
- optional `content_source_asset_id` preserves Stage 9 provenance without mutating source inventory into lessons;
- concurrency limited to 1..8 and result order is input/page order, never completion order;
- filesystem storage rejects traversal and leaves no temp residue after successful atomic write;
- storage failure / metadata failure / abort clean all objects written by that attempt and leave observable failed state;
- PDF uses `pdfinfo`/`pdftoppm` via argument arrays, scoped temp directories and numeric 1..N validation;
- real 2-page PDF passed extraction → transforms → storage → DB → exact replay with page order `[1,2]` and positions `[100,101]`;
- malformed PDF creates zero media rows;
- real PDF display variant long edge verified inside `1200..1800` px.

**Closure status:** Stage 10 code is green. Documentation closure CI must pass on the latest documentation head before the Stage is formally closed and Preview sync begins.

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
- **`rebuild/media-pipeline` / PR #11 (Stage 10 source of truth)**

## 7. Temporary Supabase/Vercel Preview

Purpose: let the user continuously test the evolving application before final hosting.

- Supabase project: `linksoftt` — temporary PostgreSQL/testing platform only.
- Vercel project: `alwaslh` under team `wasl`.
- Preview branch: `preview/supabase-vercel`.
- Single Vercel project routes Student `/`, Admin `/admin`, API `/api/*`.
- Application tables are not intended for browser/PostgREST access; API is the data boundary.
- Stage 1–9-era preview deployment successfully reached Vercel API `/api/health` with 200 after configuring pooled `DATABASE_URL`.
- Stage 10 still needs to be mirrored into Preview after documentation closure: apply migration `0009`, lock down the two new media tables in Supabase, reconcile Stage10 code with Vercel-specific config, deploy, then verify build/API.
- **Preview limitation:** Vercel serverless filesystem is ephemeral and Poppler availability is not assumed. Do not claim Stage 10 full media runtime on Vercel until explicitly tested/solved. Admin media upload endpoint belongs to later Admin work and is not yet live.

## 8. Important defects caught by executable gates

- Legacy root PostCSS/Tailwind leakage into new apps.
- Auth strict TypeScript / scrypt boundary defects.
- Stage 7 enum/JSON/default typing, audit atomicity and idempotency ownership issues.
- Stage 8 test isolation and production API build/start mismatch.
- Stage 9 eight Arabic-key manifests would have omitted 772 images; helper count drift; third manifest schema; Python/JS canonical digest drift.
- Stage 10 lint/exact-optional fixture defects were caught before runtime.
- Stage 10 design review caught weak idempotency ownership and bound it to exact source bytes/provenance.
- Stage 10 failure injection proved storage/metadata/abort cleanup rather than assuming it.

## 9. Business rules/features that must remain preserved

- Full code exactly 6 digits; Class code exactly 7 digits.
- Multiple class entitlements where valid; renewal must add real benefit; Full access covers all classes.
- Student cannot forge entitlement/score/achievement/rank from browser.
- Recovery resets secret and never reveals it.
- Reader later preserves image/zoom-pan/summary/practice/notes/settings/navigation.
- Notes parity: text/image/capture/audio unless explicitly changed with documented reason.
- Quiz parity: filters, multi-lesson/version, shuffle/random, explanation/images/bookmark/resume/restart/attempt/offline/achievements.
- Admin parity: content CRUD, PDF/image/mixed upload, AI generation, Quiz Builder, students/codes, notifications/exports.
- AI correctness: Fusha, numerals, chemistry/scientific notation, exact Quran/Hadith/source text, answer/explanation/method/difficulty/source/page/counts/duplicates/versions/exact-exam/unknown-answer behavior.

## 10. Next required sequence

1. Finish Stage 10 documentation-head CI.
2. Sync Stage 10 stable migration/code to `linksoftt` + `preview/supabase-vercel`; verify Vercel build/API and document platform limitations.
3. Only then begin **Stage 11 — Gemini Prompt/Output Contracts**.
4. After Stage 11 executable + Preview gates, proceed Stage 12 — Durable AI Execution.

Stage 11 scope is contracts only: versioned prompt registry, typed request/output schema, semantic validators and golden tests. Provider orchestration/queue/failover belongs to Stage 12.

## 11. NOT YET VERIFIED / remaining release risks

- final Stage 10 documentation-head workflows;
- Stage 10 temporary Preview synchronization;
- production media volume durability/backup/load/Poppler environment;
- Gemini prompt/semantic/golden contracts and durable execution runtime;
- complete Admin and Student learning products;
- Practice Engine / trusted scoring;
- Offline replica/outbox/service-worker lifecycle;
- full performance/security/accessibility/device/staging/rollback/release gates.

## 12. Mandatory continuation protocol

At every meaningful batch:
- update `PROJECT_ENGINEERING_LOG.md`;
- update `PROJECT_STATUS.md`;
- update this handoff when baseline/architecture/business rules/branches/Preview status changes;
- keep exact run/commit evidence;
- unexecuted = `NOT YET VERIFIED`;
- transition report: `المرحلة الحالية → ما تم → ما لم يتم → Definition of Done → هل ننتقل أم لا.`
