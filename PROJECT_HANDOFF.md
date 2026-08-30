# PROJECT HANDOFF — الوسيلة الذكية

> **Purpose:** نقطة البداية الإلزامية لأي محادثة/مهندس جديد. اقرأ هذا الملف أولًا، ثم `PROJECT_STATUS.md` و`PROJECT_ENGINEERING_LOG.md` و`PRODUCT_FEATURE_PARITY_MATRIX.md` و`MASTER_REBUILD_ROADMAP.md`. المستودع ونتائج CLI/CI هي المصدر الأعلى للحقيقة؛ لا تعتمد على ذاكرة المحادثة.

## 1. Product

**الوسيلة الذكية** منصة تعليمية عربية بمنتجين منفصلين منطقيًا:

- **Student PWA:** تفعيل/دخول، صفوف ومواد ودروس، قارئ، ملخص/Practice، اختبارات، ملاحظات وأسئلة محفوظة، إشعارات، إحصائيات/إنجازات، Offline/PWA.
- **Admin Web:** محتوى ورفع ومعالجة، Gemini/AI generation، Quiz Builder، الطلاب، Full/Class access codes، الإشعارات، التقارير، التصدير والإعدادات.

الهدف: **نفس الفكرة والسيناريوهات والنتائج للمستخدم، بتنفيذ أقوى وأوضح وأكثر أمانًا وقابلية للصيانة.** Feature parity تقاس بالنتيجة وليس بطريقة التنفيذ القديمة.

## 2. Source repositories

- `7eaur/alwaslh`: مرجع Business Rules / User Flows / legacy behavior والمشكلات التي يجب ألا تتكرر. ليس مرجعًا للبنية الداخلية أو DB الجديدة.
- `7eaur/alwaslh-go`: مصدر curriculum/books/images/government exams. يدخل عبر deterministic content pipeline؛ لا يُشحن raw إلى frontend.
- Stage 9 pinned source revision: `f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`.

## 3. Non-negotiable architecture decisions

1. PostgreSQL ذاتية الاستضافة، خاصة، خلف Backend API.
2. Browser لا يتصل مباشرة بقاعدة البيانات.
3. Clean-slate schema/data؛ Supabase ليست Target Platform ولا نطابق RLS/IDs القديمة.
4. Admin وStudent تطبيقان منفصلان في runtime/bundle/UX.
5. Auth/Authorization/Entitlements server-side.
6. لا plaintext/reversible passwords ولا device fingerprint كدليل مصادقة.
7. Full access code = **6 digits**؛ Class access code = **7 digits**.
8. Redemption/activation transactional + idempotent + race-safe.
9. بعد أول تفعيل، Full Code يصبح **معرّف حساب الطالب** للدخول اللاحق؛ ليس سرًا ولا يكفي بدون كلمة المرور.
10. Recovery = reset، ولا يعرض السر الأصلي.
11. Student offline data لاحقًا account-scoped مع revisions/tombstones/outbox.
12. Gemini keys server-only؛ AI jobs durable في backend/workers.
13. `alwaslh-go` Content Source فقط؛ importer يحفظ source/order/provenance/checksum metadata.
14. Stage 9 لا يستنتج Lessons من أسماء صور/ملفات المصدر. Source documents/assets محفوظة canonical أولًا، والربط بالدروس لاحقًا صريح.
15. لا Stage تُغلق بلا دليل executable. الحالات الرسمية: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`; غير المنفذ = `NOT YET VERIFIED`.
16. لا نبدأ Stage التالية قبل إغلاق Integration Gate للمرحلة الحالية.
17. أي ترتيب صفحات/أصول يجب أن يكون source-derived deterministic؛ async completion order لا يملك أي معنى business.

## 4. Target tree / runtime

```text
apps/
  admin-web/
  student-web/
  api/
  workers/
packages/
  brand/
  ui/
  domain/
  data/
  validation/
  ai-contracts/
  testing/
database/
  migrations/
  tests/
  deploy/
content/
  import-contracts/
  manifests/
  tooling/
```

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    └── background / AI workers
```

## 5. Verified stages

### Stage 1 — Product Contract ✅ CLI PASS
`PRODUCT_FEATURE_PARITY_MATRIX.md` + automated product contract checks.

### Stage 2 — Brand Identity ✅ CLI PASS
Owned teal/open-book identity under `packages/brand`; no TailAdmin/Miaoda production identity dependency.

### Stage 3 — UX Architecture ✅ CLI PASS
Admin/Student IA, critical flows/states, responsive/accessibility contracts and wireframes.

### Stage 4 — PostgreSQL Data Platform ✅ CLI/RUNTIME PASS
Canonical migrations currently:

- `0001_core.sql`
- `0002_access.sql`
- `0003_learning.sql`
- `0004_ai_and_sync.sql`
- `0005_auth.sql`
- `0006_access_contract.sql`
- `0007_activation_contract.sql`
- `0008_content_source_import.sql`

### Stage 5 — Engineering Foundation ✅ CLI/RUNTIME PASS
Real `apps/api`, bounded PostgreSQL pool/transactions, migration runner, env validation, logging/public errors, strict TypeScript/lint/unit/build, isolated Admin/Student builds and CI. Production API emits runtime-only `dist/server.js` matching `npm start`.

### Stage 6 — Auth & Authorization ✅ CLI/RUNTIME PASS
Salted scrypt credentials, opaque sessions with only SHA-256 digest persisted, HttpOnly cookie, Student/Admin role isolation, mutation Origin protection, DB lockout, one-time reset-only recovery/session invalidation and explicit first-Admin CLI bootstrap.

### Stage 7 — Access Codes & Entitlements ✅ CLI/RUNTIME PASS
Crypto-secure 6/7-digit codes, Arabic/Persian digit normalization, row-locked transactional redemption, profile-bound idempotency, renewal with real benefit, no-waste Class redemption under Full access, revoke/audit and race tests.

### Stage 8 — Student Activation & Account Flow ✅ CLI/RUNTIME/BROWSER E2E PASS
Canonical API contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

```text
6-digit Full Code + password + idempotency key
→ validate/lock code
→ Student profile
→ scrypt credential
→ all-content entitlement
→ redemption/audit
→ COMMIT
→ canonical Auth login
→ HttpOnly session
```

Returning login uses the original six-digit identifier + password. Recovery resets password and never reveals it. Chromium E2E verifies activation → entitlement → logout → return login → recovery reset → old-password rejection → new-password login.

### Stage 9 — Content Model & deterministic `alwaslh-go` Import ✅ CLI/PostgreSQL RUNTIME PASS

**Verified code baseline:**

- Branch: `rebuild/content-import`
- PR: #8
- Code commit: `30d12d24be93bf306a9da5fffcfb45ea9317a186`
- Dedicated Stage 9 run: `33294631418` — **SUCCESS**
- Full regression run on same commit: `33294631419` — **SUCCESS**

Pinned source:

`7eaur/alwaslh-go@f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Verified inventory:

```text
15 subject roots
48 source documents
5,552 images
4,218 JPG
1,334 WEBP
86 recognized helper files
24 manifest files
0 fatal issues
0 manifest errors
0 order errors
0 unmapped images
0 unparsed assets
0 classification errors
0 expected-count errors
```

Canonical inventory SHA-256:

`7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`

Duplicate evidence is retained: **100 duplicate Git-blob groups / 201 asset paths**. This is REVIEW evidence, not automatically fatal, because repeated educational pages can be intentional.

Runtime import on clean PostgreSQL 16:

```text
migrations 0001 → 0008
first import       → 48 documents / 5,552 assets / replayed=false
identical reimport → same run / 48 documents / 5,552 assets / replayed=true
DB assertions      → 1 run, 48 present docs, 5,552 present assets,
                     zero absent rows, zero duplicate present positions
```

Stage 9 canonical data layer:

- `content_import_runs`
- `content_source_documents`
- `content_source_assets`

Primary source files:

- `ALWASLH_GO_IMPORT_CONTRACT.md`
- `content/import-contracts/alwaslh-go-source-map.json`
- `content/tooling/alwaslh_go_inventory.py`
- `content/tooling/alwaslh_go_manifest_compat.py`
- `apps/api/src/content/source-import.ts`
- `apps/api/src/content/import-source-cli.ts`
- `database/migrations/0008_content_source_import.sql`
- `.github/workflows/stage9-content-import.yml`

## 6. Stage 9 defects found by executable gates

Do not erase this history:

1. Parallel source audit discovered eight Arabic-key `manifest.json` files using fields such as `م` and `اسم الصورة`; the original parser would have omitted **772 images** while the top-level Git-tree count still looked correct. Fixed with explicit schema support plus a canonical payload asset-count invariant.
2. Helper baseline drift: expected 76, actual **86 recognized helpers** (27 TXT guides + 27 XLSX guides + 24 manifests + 8 processing reports). Contract updated to evidence.
3. A third real manifest shape in `اللغة العربية ثالث ثانوي/كتاب القراءة` used `filename`, `pdf_page`, `book_page`, `title`, dimensions and byte size. It caused 65 unsupported entries plus two derived manifest errors. Added explicit compatibility normalization and tests.
4. First real DB import exposed cross-language digest drift: Python serialized integral float `9.0`, JavaScript `JSON.stringify` serialized it as `9`. Canonical digest now normalizes integral floats to integer JSON form before SHA-256.
5. Importer/unit formatting and strict-type issues found earlier were fixed at source; tests were not weakened.

## 7. Current branch / PR coordination

Existing stack:

- `rebuild/foundation` / PR #2
- `rebuild/auth-authorization` / PR #3
- `rebuild/access-entitlements` / PR #4
- `rebuild/student-activation-ui` / PR #5
- `rebuild/student-activation-backend` / PR #6
- `rebuild/student-activation-integration` / PR #7
- **Stage 9 source of truth:** `rebuild/content-import` / PR #8
- Parallel audit evidence: `rebuild/content-source-audit` / PR #9

The source-audit branch intentionally did not own migration/importer logic. Its findings were reconciled into the Stage 9 implementation branch.

## 8. Business rules/features that must remain preserved

- Full code exactly 6 digits; Class code exactly 7 digits.
- Multiple class entitlements where valid.
- Renewal adds real benefit; never consume a code without extending access.
- Full access covers all classes.
- Student cannot forge entitlement/score/achievement/rank from browser.
- Recovery resets secret and never reveals original password.
- Reader later preserves images/zoom-pan/summary/practice/notes/settings/prev-next.
- Notes parity includes text/image/capture/audio unless explicitly changed with documented reason.
- Quiz parity includes filters, multi-lesson/version, shuffle/random, explanation/images/bookmark/resume/restart/attempt/offline/achievements.
- Admin parity includes content CRUD, PDF/image/mixed upload, AI generation modes, Quiz Builder, students/access codes/class codes, notifications and exports.
- AI rules preserve Arabic/Fusha, numerals, chemistry/scientific notation, exact Quran/Hadith/source text, correct options/explanation/method/difficulty/source/page/counts/duplicates/versions/exact-exam/unknown-answer behavior.

## 9. NEXT: Stage 10 — Media Pipeline

**Do not implement Stage 10 until the documentation-only Stage 9 closure commits have passed both the Stage 9 dedicated CI and full regression CI.**

Once that closure gate is green, Stage 10 is the only active implementation stage.

Roadmap contract:

```text
upload/source
→ validate
→ PDF page extraction if needed
→ stable ordering
→ optimize display variant
→ thumbnail
→ AI variant
→ storage
→ metadata transaction
```

Required principles:

- bounded concurrency;
- abort/retry;
- no completion-order page reordering;
- educational text readability before aggressive compression;
- deterministic storage keys/checksums;
- reliable/self-hosted PDF worker strategy;
- source provenance/order from Stage 9 must survive media processing;
- storage runtime and actual media bytes are `NOT YET VERIFIED` until Stage 10 tests execute.

## 10. Later roadmap order

After Stage 10:

1. Stage 11 Gemini Prompt/Output Contracts.
2. Stage 12 Durable AI Execution.
3. Stage 13 Admin Product.
4. Stage 14 Student Learning Product.
5. Stage 15 Practice Engine.
6. Stage 16 Offline/PWA.
7. Stage 17 Notes & Saved Questions.
8. Stage 18 Notifications.
9. Stage 19 Statistics/Achievements.
10. Stage 20 Export System.
11. Stage 21 Performance Engineering.
12. Stage 22 Security Hardening.
13. Stage 23 Automated Tests/CI Expansion.
14. Stage 24 Accessibility/Device QA.
15. Stage 25 Initial Data/Content Load.
16. Stage 26 Staging.
17. Stage 27 Release Gate.
18. Stage 28 Production Cutover.
19. Stage 29 Monitoring & Operations.

## 11. NOT YET VERIFIED / remaining release risk

- current documentation-only Stage 9 closure head CI until it completes;
- production-host PostgreSQL network/pool/load tuning;
- real-host backup + restore drill;
- reverse-proxy/API perimeter rate limiting and final security audit;
- object/media storage runtime + PDF/media pipeline;
- Gemini prompt/golden/failover/worker runtime;
- complete Admin product;
- post-auth Student learning product;
- Practice Engine/trusted scoring;
- Offline replica/outbox/service-worker lifecycle;
- production performance/security/accessibility/device/staging/rollback/release gates.

## 12. Mandatory continuation protocol

At every meaningful batch:

- update `PROJECT_ENGINEERING_LOG.md` with decisions/findings/changes/failures/fixes;
- update `PROJECT_STATUS.md` with current stage, completed/remaining work, blockers, last verification and next step;
- update this handoff when verified baseline, architecture/business rules, branches/PRs or active stage changes;
- keep exact run/commit evidence;
- never represent an unexecuted check as PASS;
- at transition report: `المرحلة الحالية → ما تم → ما لم يتم → Definition of Done → هل ننتقل أم لا.`
