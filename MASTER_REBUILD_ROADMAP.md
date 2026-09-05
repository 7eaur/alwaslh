# MASTER REBUILD ROADMAP — الوسيلة الذكية

> الخطة التنفيذية الرسمية لبناء أفضل نسخة من فكرة **الوسيلة الذكية**. التطبيق القديم مرجع للفكرة والاحتياجات والسيناريوهات والمشكلات، وليس مواصفة يجب نسخها. بعد Stage 10 دخل المشروع Product Evolution Review لإعادة مناقشة كل المميزات والـflows قبل تثبيت المراحل المنتجية المتبقية.

## القواعد الحاكمة

1. نحافظ على **قيمة المنتج واحتياجات المستخدم**، لا على أخطاء أو تفاصيل التنفيذ القديم.
2. `alwaslh` مرجع للـBusiness Rules والـflows والميزات التاريخية والمشكلات التي يجب ألا تتكرر؛ كل عنصر فيه قابل لـ`KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE` بعد نقاش صريح.
3. `alwaslh-go` مرجع للمحتوى/الصور ويُدخل عبر deterministic Content Pipeline.
4. لا يوجد التزام بمطابقة Supabase schema/IDs/RLS القديمة.
5. PostgreSQL clean-slate source of truth خلف Backend خاص.
6. كل Stage لها Definition of Done؛ لا تبدأ التالية قبل Integration Gate الحالية.
7. التوازي مسموح داخل نفس Stage عندما تكون الحدود والعقود واضحة.
8. أي Runtime gate لم يُشغل فعليًا = `NOT YET VERIFIED`.
9. الحالات الرسمية: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`.
10. `PROJECT_HANDOFF.md` هو أول ملف لأي محادثة/مهندس جديد.
11. `docs/product/PRODUCT_EVOLUTION_REVIEW.md` هو سجل القرارات المنتجية الجاري بناؤه.
12. Correctness > Cleverness، Clarity > Complexity، Evidence > Assumptions.
13. أي Product Decision يغير عقدًا من Stages 1–10 يفتح Impact Review وRefactor واضحًا بدل تعديل صامت.

## Target Architecture — verified direction

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    └── background + AI workers
```

Browser لا يتصل مباشرة بPostgreSQL.

---

# Stage 1 — Product Inventory / Initial Feature Parity ✅

تم تثبيت inventory شامل للـAdmin/Student flows والميزات القديمة حتى لا تضيع معرفة المنتج أثناء إعادة البناء.

**Important reinterpretation after Product Evolution Review:** هذه المصفوفة Decision Inventory وليست Automatic KEEP list.

**Gate: COMPLETE / CLI PASS.**

# Stage 2 — Brand Identity ✅

Owned teal/open-book identity: logo/PWA assets، palette، Arabic typography، tokens وaccessibility rules.

**Gate: COMPLETE / CLI PASS.**

# Stage 3 — UX Architecture ✅

Admin IA + Student IA + critical flows + loading/error/offline/permission states + responsive/accessibility contracts + wireframes.

هذه الـflows baseline مصممة ومختبرة، ويمكن مراجعتها Product-wise قبل تنفيذ الشاشات الكاملة.

**Gate: COMPLETE / CLI PASS.**

# Stage 4 — Clean-Slate PostgreSQL Data Platform ✅

Private PostgreSQL behind Backend. Identity/Curriculum/Access/Learning/AI/Sync relations constrained and migration-owned.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

# Stage 5 — Engineering Foundation ✅

Real `apps/api`، strict TypeScript، bounded PostgreSQL pool/transactions، migration runner، env validation، logging/error contract، tests، isolated Admin/Student builds وCI.

**Gate: COMPLETE / CLI + RUNTIME PASS.**

# Stage 6 — Authentication & Authorization ✅

scrypt credentials، opaque server sessions + HttpOnly cookie، Student/Admin isolation، Origin protection، DB lockout، reset-only recovery، explicit first-admin CLI bootstrap.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

# Stage 7 — Access Codes & Entitlements ✅

Current implemented contract: 6-digit Full / 7-digit Class، crypto generation، transactional row-locked redemption، profile-bound idempotency، renewal benefit، no-waste Class redemption، revoke/audit، concurrency tests.

هذه Business Rules قابلة لإعادة المناقشة Product-wise؛ أي تغيير يُعيد فتح العقد المتأثر رسميًا.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

# Stage 8 — Student Activation & Account Flow ✅

Current implemented contract: first activation uses 6-digit Full Code + password; normalized Full Code becomes returning identifier after success; password remains secret. Atomic profile/credential/entitlement/redemption/audit flow + returning login/logout + reset-only recovery + Student activation UI.

Canonical API contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME + Chromium BROWSER E2E PASS.**

# Stage 9 — Content Model & Deterministic `alwaslh-go` Import ✅

```text
alwaslh-go pinned revision
→ complete repository inventory
→ manifest/helper/name parsing
→ canonical source taxonomy
→ textbook/exam/year/track normalization
→ deterministic page ordering
→ provenance/checksum/duplicate report
→ canonical source documents/assets
→ transactional repeatable import
→ identical re-import proof
```

Verified source revision:
`f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23`

Verified facts:

- 15 subject roots؛
- 48 source documents؛
- 5,552 images؛
- 4,218 JPG + 1,334 WEBP؛
- 86 recognized helper files؛
- 24 manifests؛
- 0 fatal/manifest/order/unmapped/unparsed/classification/expected-count errors؛
- 100 duplicate blob groups / 201 paths retained as REVIEW evidence؛
- canonical inventory SHA-256 `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

Canonical DB layer:
`content_import_runs` + `content_source_documents` + `content_source_assets`.

No Lesson inference from filenames. Raw repository never ships in frontend. Async completion order never defines source order.

Runtime proof on clean PostgreSQL 16: migrations `0001→0008`, first import 48/5552, identical re-import same run with `replayed=true`, presence/position uniqueness assertions PASS.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

# Stage 10 — Media Pipeline ✅

```text
upload/source
→ validate exact source identity
→ stable page/source position
→ Sharp image pipeline OR Poppler PDF extraction
→ bounded ordered transforms
→ source/display/thumbnail/AI variants
→ checksums/dimensions/bytes
→ trusted deterministic storage keys
→ storage
→ PostgreSQL metadata transaction
```

Verified requirements:
- bounded concurrency 1..8؛
- abort/retry؛
- no completion-order reordering؛
- source-byte/provenance-bound idempotency؛
- exact ready replay validates stored SHA/size؛
- deterministic keys/checksums/dimensions؛
- safe filesystem traversal boundary؛
- storage/metadata/abort cleanup؛
- local/server-owned Poppler PDF runtime؛
- Stage 9 provenance survives processing؛
- real two-page PDF end-to-end runtime proof؛
- malformed PDF creates zero successful media rows.

Final documentation head:
`27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final same-head evidence:
- Stage 10 dedicated `33302270707` — SUCCESS؛
- Stage 9 regression `33302270692` — SUCCESS؛
- full rebuild regression `33302270695` — SUCCESS including Chromium E2E.

**Gate: COMPLETE / CLI + PostgreSQL + MEDIA RUNTIME PASS.**

---

# PRODUCT EVOLUTION REVIEW CHECKPOINT — CURRENT

قبل Stage 11 وما بعدها، المنتج يدخل مراجعة شاملة مع product owner.

الهدف ليس إضافة features عشوائيًا، بل مناقشة كل محور واختيار الطريقة الأنسب لنا الآن:

- product audience/value proposition؛
- accounts/activation/access؛
- curriculum/content structure؛
- Student home/navigation؛
- Reader؛
- Practice/quizzes؛
- Student AI؛
- notes/saved/highlights؛
- statistics/achievements/gamification؛
- notifications؛
- Offline/PWA؛
- Admin roles؛
- Admin content/media workflow؛
- Admin AI authoring؛
- Quiz Builder/content QA؛
- students/codes/support؛
- reports/export؛
- search/discovery؛
- content publishing/version lifecycle؛
- new product ideas.

Canonical decision log:
`docs/product/PRODUCT_EVOLUTION_REVIEW.md`

**Gate to leave this checkpoint:**
- كل محور يؤثر على المرحلة التالية لديه Decision واضح؛
- القرارات موثقة مع reasons/impact؛
- `PRODUCT_FEATURE_PARITY_MATRIX.md` محدث كـdecision inventory؛
- roadmap revised from decisions؛
- affected Stages 1–10 identified and reopened only if necessary؛
- no unresolved contradiction between product decisions and data/API contracts.

---

# Provisional post-review stages

> المراحل التالية هي **initial engineering plan** وليست نهائية حتى ننهي Product Evolution Review. يمكن دمجها أو تقسيمها أو إعادة ترتيبها حسب قراراتنا.

# Stage 11 — AI Prompt/Output Contracts — PROVISIONAL

Versioned prompt/contracts، typed request/output schemas، semantic validators، golden tests، source-exact/religious/scientific/Arabic rules. Exact modes are decided during Product Review.

# Stage 12 — Durable AI Execution — PROVISIONAL

Durable AI jobs/workers، provider scheduling، retries/backoff، 429 cooldown، health/failover، cancellation/resume، progress، prompt/model/tokens/cost/latency metadata، server-only secrets.

# Stage 13 — Admin Product — PROVISIONAL

Admin flows/roles/modules will be rebuilt from Product Review decisions rather than legacy screen parity.

# Stage 14 — Student Learning Product — PROVISIONAL

Student post-auth learning UX will be rebuilt from Product Review decisions, mobile-first and reading-first where still appropriate.

# Stage 15 — Practice / Assessment Engine — PROVISIONAL

Deterministic/trusted question and attempt state. Exact modes, scoring, history and resume behavior depend on Product Review.

# Stage 16 — Offline / PWA — PROVISIONAL

If retained: account-scoped IndexedDB replica, revision/tombstone/outbox model, bounded cache/media lifecycle and explicit offline contract.

# Stage 17 — Personal Learning Data — PROVISIONAL

Notes/saved/highlights/media forms according to Product Review decisions.

# Stage 18 — Notifications — PROVISIONAL

Admin/Student notification model according to decided value and channels.

# Stage 19 — Statistics / Progress / Achievements — PROVISIONAL

Server-derived trusted progress/attempt metrics; gamification/leaderboards only if explicitly retained.

# Stage 20 — Export / Reporting — PROVISIONAL

Only outputs with clear Admin/Student value; sanitization and Arabic-safe rendering remain mandatory.

# Stage 21 — Performance Engineering

Measure and enforce bundle/API/query/media/cache/sync/AI/upload/export budgets.

# Stage 22 — Security Hardening

Secrets، DB networking، authorization/IDOR، perimeter rate limits، validation، uploads/storage، CSP/CORS/headers، CSRF/session، dependencies، audit logs، backup access.

# Stage 23 — Automated Tests & CI Expansion

Unit، DB/concurrency، Auth/Access، content/media، AI، learning/offline، Admin/Student E2E and critical regression coverage.

# Stage 24 — Accessibility / Device QA

RTL، keyboard/focus/screen reader، 200% zoom، contrast، reduced motion، 44px targets، Android/iPhone/tablet/desktop، slow network/offline.

# Stage 25 — Initial Data / Content Load

Secure initialization and canonical curriculum/content load through the final decided contracts.

# Stage 26 — Staging

Fresh reproducible environment: PostgreSQL → migrations → config/secrets → content → API/workers → Admin → Student → staged tests.

# Stage 27 — Release Gate

No unresolved/unaccepted P0/P1، real-host DB/network/load، backup restore drill، Auth/authorization/access concurrency، Admin/Student E2E، Offline if retained، AI if retained، performance/accessibility/security budgets and product-decision evidence.

# Stage 28 — Production Cutover

Provision → backup/checkpoint → migrations → content load → backend/workers → Admin → Student → smoke tests. Rollback tested/prepared.

# Stage 29 — Monitoring & Operations

Monitor auth/access، DB، backups، AI/jobs where applicable، sync، frontend/runtime، media/storage growth and PWA update health. Maintain runbooks/incidents.

---

# Current Progress

| Stage | Status |
|---|---|
| 1 Product Inventory | COMPLETE / CLI PASS |
| 2 Brand Identity | COMPLETE / CLI PASS |
| 3 UX Architecture | COMPLETE / CLI PASS |
| 4 PostgreSQL Data Platform | COMPLETE / CLI + RUNTIME PASS |
| 5 Engineering Foundation | COMPLETE / CLI + RUNTIME PASS |
| 6 Auth & Authorization | COMPLETE / CLI + RUNTIME PASS |
| 7 Access Codes & Entitlements | COMPLETE / CLI + RUNTIME PASS |
| 8 Student Activation & Account Flow | COMPLETE / CLI + PostgreSQL RUNTIME + Chromium BROWSER E2E PASS |
| 9 Content Model & `alwaslh-go` Import | COMPLETE / CLI + PostgreSQL RUNTIME PASS |
| 10 Media Pipeline | COMPLETE / CLI + PostgreSQL + MEDIA RUNTIME PASS / final docs-head verified |
| Product Evolution Review | **CURRENT / IN PROGRESS** |
| 11–20 | PROVISIONAL / pending product decisions |
| 21–29 | PLANNED / later engineering and release gates |

## Preview integration status

Temporary Preview is still pre-Stage-10. The known READY Vercel deployment answers `/api/health` with HTTP 200, but direct Stage 10 branch deployments currently fail because the Vercel project expects `dist` output. Stage 10 sync to Supabase/Vercel remains pending and will occur after the Product Evolution Review produces the stable next baseline.

**Current rule:** do not start a feature-heavy Stage 11+ from the old roadmap assumptions. First discuss and record product decisions, update the roadmap, then implement from the revised plan.
