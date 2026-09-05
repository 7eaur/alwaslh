# MASTER REBUILD ROADMAP — الوسيلة الذكية

> الخطة التنفيذية لبناء أفضل نسخة من **فكرة الوسيلة الذكية**. التطبيق القديم مرجع للفكرة والمميزات والسيناريوهات والمشكلات، وليس مواصفة للشاشات أو التقنية. لا تُحذف Feature قديمة ذات قيمة بدون قرار صريح من Product Owner.

## القواعد الحاكمة

1. نحافظ على قيمة المنتج والسيناريوهات التعليمية والإدارية المهمة، لا على تفاصيل التنفيذ القديم.
2. كل Feature/Flow/Business Rule يصنف `KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW`.
3. إزالة Feature ذات قيمة تحتاج قرار Owner صريح وسبب/بديل موثق.
4. `alwaslh-go` مصدر canonical للمحتوى/الصور ويدخل عبر deterministic pipeline.
5. PostgreSQL clean-slate خلف Backend خاص؛ Browser لا يتصل مباشرة بقاعدة البيانات.
6. كل Stage لها Definition of Done؛ unexecuted = `NOT YET VERIFIED`.
7. Product Decision يغير Stage مغلقة → نعيد فتح الجزء المتأثر رسميًا مع impact analysis + regression gates.
8. Student UX بسيط/أنيق/mobile-first مع الحفاظ على عمق الوظائف.
9. لا placeholder copy؛ كل نص ظاهر Product-ready.
10. Upload/Media لا يعتمد على OCR/AI.
11. OCR وAI طبقتان منفصلتان عن Upload؛ AI text-first افتراضيًا مع source/page provenance.
12. AI credentials/projects server-only مع health/rate/quota/cooldown/retry/failover.
13. Offline first-class requirement مع account/device-scoped state، delta sync/outbox، وعدم refetch المستمر.
14. Student account uses registered cryptographic application-device identity; fingerprint/IP/user-agent ليست security proof.
15. `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md` هي مصادر الاستمرار.

## Target Architecture — revised

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    ├── OCR extraction jobs/provider adapter
                    ├── durable AI/background workers
                    └── account/device-scoped sync contracts
```

---

# Stage 1 — Product Inventory ✅ CLI PASS
Legacy feature/user-flow inventory and parity safety net. Matrix is decision inventory; no valuable feature is removed silently.

# Stage 2 — Brand Identity ✅ CLI PASS
Owned teal/open-book identity, Arabic typography/tokens/accessibility rules.

# Stage 3 — UX Architecture ✅ CLI PASS
Initial Admin/Student IA and critical state contracts. Product flows may be explicitly improved.

# Stage 4 — PostgreSQL Data Platform ✅ CLI + RUNTIME PASS
Clean PostgreSQL 16 data platform.

# Stage 5 — Engineering Foundation ✅ CLI + RUNTIME PASS
API, DB pool/transactions, migrations, config/logging/errors, strict TS/lint/tests/builds/CI.

# Stage 6 — Auth & Authorization ✅ BASELINE VERIFIED / PARTIAL REOPEN REQUIRED

Verified baseline:
- scrypt credentials؛
- opaque sessions + HttpOnly cookies؛
- role isolation؛
- Origin protection؛
- DB lockout؛
- reset-only recovery؛
- explicit Admin bootstrap.

**Product Review additions requiring partial reopen:**
- temporary-password recovery + `must_change_password`;
- registered application-device public key;
- password + device challenge for returning online login;
- Admin device reset/rebind؛
- security tests proving browser fingerprint/IP/user-agent are not trusted identity.

# Stage 7 — Access Codes & Entitlements ✅ CLI + RUNTIME PASS
Current baseline: Full Code 6 digits / Class Code 7 digits, crypto generation, transactional/idempotent redemption, renewal/no-waste/revoke/audit/race tests. Exact expiry/renewal/multiple-class product rules remain reviewable.

# Stage 8 — Student Activation & Account Flow ✅ BASELINE VERIFIED / REFACTOR REQUIRED

Verified old rebuilt baseline:
`Full Code + password → atomic activation → session`.

Final target:

```text
Welcome / Student entry
├── لدي حساب بالفعل
│   → identifier + password
│   → registered-device challenge
│   → session/home
└── تفعيل جديد
    → Enter 6-digit Full Code
    → verify eligibility
    → short-lived one-time activation ticket
    → mandatory Create Password
    → atomic profile + credential + entitlement + redemption + audit
    → register device public key
    → authenticated session
```

Recovery target:

```text
Student contacts Admin with identifier/code
→ Admin issues temporary password/reset credential
→ revoke old sessions
→ optional device reset/rebind as needed
→ must_change_password=true
→ Student logs in and creates new private password
```

First verification must not create/consume a partial account. Final write remains transactional/race-safe/idempotent.

**New gate:** API/unit/PostgreSQL/concurrency/security + Chromium E2E for activation, returning login, recovery, wrong device rejection and device reset/rebind.

# Stage 9 — Content Model & deterministic `alwaslh-go` Import ✅ CLI + PostgreSQL RUNTIME PASS

Verified:
- 15 subject roots؛
- 48 source documents؛
- 5,552 images؛
- 4,218 JPG + 1,334 WEBP؛
- 86 helpers؛
- 24 manifests؛
- 0 fatal inventory issues؛
- canonical SHA-256 `7b6c6e1e79d90cf68a72bc473c12ce23bf39c462708dcd10bc313fd535fbe729`.

# Stage 10 — Media Pipeline ✅ CLI + PostgreSQL + MEDIA RUNTIME PASS

```text
upload/source
→ validate exact source identity
→ stable page/source position
→ Sharp image OR Poppler PDF
→ bounded ordered transforms
→ source/display/thumbnail/AI variants
→ checksums/dimensions/bytes
→ storage
→ PostgreSQL metadata transaction
```

Final head: `27c6a2ef1118ee44d2e63471e4f925e1296283e0`

Final CI:
- Stage10 `33302270707` SUCCESS؛
- Stage9 regression `33302270692` SUCCESS؛
- Full rebuild `33302270695` SUCCESS including Chromium E2E.

---

# PRODUCT EVOLUTION REVIEW — CURRENT

Canonical log: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

## Decisions already fixed

### Student/account
- Welcome before auth.
- `تفعيل جديد` + `لدي حساب بالفعل`.
- two-step activation.
- Admin temporary-password recovery + forced password change.
- one registered application device per Student account; different/lost device requires Admin rebind.

### Student learning
Preserve/improve legacy outcomes:
- curriculum/classes/subjects/lessons;
- Reader;
- summaries;
- quick `اختبر نفسك` Practice;
- full tests;
- models/ministerial exams;
- filters/multi-lesson/versions/randomization/shuffle;
- explanations/question images/resume/restart/attempts;
- notes;
- favorites;
- Needs Review;
- progress/tracking;
- private achievements;
- Offline/PWA.

Summary, Practice and Full Test/Model are separate concepts.

### Admin/content
- multiple classes/grades and multiple subjects;
- flexible ordered hierarchy direction: `Curriculum/Year → Class → Subject Offering → optional Unit → Lesson → Content`;
- normal upload independent from OCR/AI;
- asynchronous OCR;
- Draft → Review → Published;
- Admin review of AI generation mandatory;
- Import/Export required.

### AI
Preserve generation outcomes/modes from legacy: summaries, questions, MCQ, T/F, mixed, source/extraction, selected page/image, regenerate, alternate version, exam/model, exact/replica where applicable, bulk generation, source/page/answer/explanation/method/difficulty metadata.

Default input is OCR text + provenance; vision fallback only when required.

### Offline/performance
- Offline mandatory.
- account/device-scoped cache/state;
- explicit bounded downloads;
- revision/delta sync;
- local outbox;
- no generic authenticated API-response SW caching;
- server remains authority for trusted finalization/redemption/publishing.

## Gate to leave Product Review

- Reader detailed flow decided;
- Practice/Test detailed rules decided;
- curriculum year/version/archive semantics decided enough for schema;
- Offline download scope + authorization lease decided;
- Admin role baseline decided;
- no contradiction with verified contracts;
- roadmap/decision inventory updated;
- affected verified stages explicitly reopened.

---

# Mandatory bridge/refactor work before feature-heavy stages

## Bridge A — Auth/Activation/Device Refactor
Reopen affected Stage 6/8 contracts for two-step activation, forced password change, device key/challenge/rebind and E2E/security gates.

## Bridge B — Stage 10 Preview Sync
Apply `0009` to temporary Supabase Preview, lock down new tables, reconcile Preview branch/Vercel build/routing and verify deployment. Preview does not redefine final architecture.

## Bridge C — OCR Extraction Foundation

```text
media asset/page
→ OCR queue/job
→ provider adapter
→ raw text
→ optional normalized text
→ confidence/status/provider/version/provenance
→ PostgreSQL persistence
```

Requirements:
- upload succeeds if OCR fails؛
- retry/idempotency؛
- provider abstraction؛
- page/source provenance؛
- original image remains source of truth؛
- low-confidence/sensitive-content review/fallback؛
- reusable for AI/search/accessibility.

## Bridge D — Curriculum Structure Extension
Only after product review finalizes year/version/archive rules, extend current class/subject/lesson model minimally to support optional Unit/Section, Subject Offering and explicit ordering/version semantics without generic-tree overengineering.

---

# Stage 11 — AI Prompt / Output Contracts — REVISED

Requirements:
- preserve all PED-021 generation modes;
- versioned Prompt Registry;
- typed request/output schemas;
- semantic validators;
- Arabic/Fusha rules;
- source/page evidence;
- scientific/chemistry notation;
- exact religious/source-text handling;
- golden regression tests;
- explicit uncertainty/failure behavior;
- no silent defaulting/invention;
- OCR text + provenance primary input, vision fallback explicit.

# Stage 12 — Durable AI Execution — REVISED

- durable jobs/units/workers;
- configured credential/project scheduler;
- health + quota/rate awareness;
- retry/backoff/cooldown/failover;
- idempotency;
- cancellation/resume/progress;
- prompt/model/tokens/latency/error/cost metadata;
- server-only secrets;
- AI failure never blocks normal upload.

# Stage 13 — Admin Product — REVISED

Functional direction:

```text
Auth/Shell
→ Overview
→ Curriculum/Years/Classes/Subjects/Units/Lessons
→ Upload/Media Processing
→ OCR status/review
→ AI generation Drafts
→ Content/Quiz review & publish
→ Students/Codes/Recovery/Device Rebind
→ Notifications
→ Import/Export/Reports
→ Settings/Audit
```

Admin baseline must support multiple classes/subjects, flexible ordering, Draft/Review/Published and generation review before publish.

# Stage 14 — Student Learning Product — REVISED

```text
Welcome
→ Activate new | لدي حساب بالفعل
→ Home / Continue Learning
→ Curriculum
→ Subject / Lesson
→ Reader
├── Summary
├── اختبر نفسك
├── Notes
├── Favorite
└── Needs Review
→ Tests / Models / Ministerial
→ Progress / Private Achievements
```

Must remain low-clutter/mobile-first while preserving all agreed capabilities.

# Stage 15 — Practice / Assessment Engine — REQUIRED

One deterministic/trusted engine supporting:
- quick Practice;
- full Tests;
- Models/ministerial exams;
- question types decided in product review;
- stable question/option identity;
- safe random/shuffle;
- multi-lesson filters/versions;
- explanations/images;
- resume/restart;
- attempt history/review;
- server-trusted finalization;
- Offline drafts/outbox where applicable.

# Stage 16 — Offline / PWA — REQUIRED

- Student-owned Service Worker;
- account/device-scoped IndexedDB;
- signed offline entitlement snapshot;
- revisions/tombstones/outbox;
- explicit lesson/material/book downloads according to final decision;
- bounded storage/eviction;
- offline notes/favorites/review-items/attempt drafts;
- delta sync;
- no generic auth/API caching;
- clear offline/backend-unavailable/sync-pending states.

# Stage 17 — Personal Learning Data — REQUIRED

Separate concepts:
- Notes;
- Favorites;
- Needs Review;
- stable question/page/lesson provenance;
- media note types according to final product decision;
- account/device-scoped sync.

# Stage 18 — Notifications — PROVISIONAL
Useful categories/channels only.

# Stage 19 — Progress / Statistics / Achievements — REVISED

- personal progress/tracking;
- private achievements;
- server-derived authoritative assessment metrics;
- no Global Leaderboard requirement;
- mastery/weak-area recommendations only if product review confirms value.

# Stage 20 — Import / Export / Reporting — REQUIRED

Admin module-scoped import/export with validation and safe formats:
- curriculum structures/data where needed;
- question bank;
- codes;
- reports;
- printable/export outputs;
- content packages only with explicit manifest/version contracts.

# Stage 21 — Performance Engineering
Measure/enforce bundle/API/query/media/OCR/AI/cache/sync/upload/export budgets and server request reduction.

# Stage 22 — Security Hardening
Authorization/IDOR, rate limits, registered-device challenge/rebind abuse cases, uploads/storage/OCR/AI secrets, CSP/CORS/session/CSRF, dependencies, audit, backup access.

# Stage 23 — Automated Tests & CI Expansion
Unit/DB/Auth/Device/Access/content/media/OCR/AI/Practice/Offline/Admin/Student E2E and regressions.

# Stage 24 — Accessibility / Device QA
RTL, keyboard/focus/screen reader, 200% zoom, contrast, reduced motion, 44px targets, Android/iPhone/tablet/desktop, slow/offline and device-reset scenarios.

# Stage 25 — Initial Data / Content Load
Canonical curriculum and derived content through final pipelines.

# Stage 26 — Staging
Fresh reproducible environment from repository.

# Stage 27 — Release Gate
No unresolved/unaccepted P0/P1, real-host DB/storage/OCR/AI, backup restore, Auth/device/access concurrency, Admin/Student E2E, Offline, security/perf/a11y and product-decision evidence.

# Stage 28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke tests → rollback readiness.

# Stage 29 — Monitoring & Operations
Auth/access/device reset, DB/backups, media/OCR/AI jobs, offline sync, client/runtime, storage growth, PWA/update health, runbooks/incidents.

---

# Current Progress

| Area | Status |
|---|---|
| Stages 1–5 | COMPLETE at documented gates |
| Stage 6 baseline | COMPLETE / partial device+recovery refactor required |
| Stage 7 | COMPLETE / product rules still reviewable |
| Stage 8 baseline | COMPLETE / Chromium PASS / final activation+device refactor required |
| Stage 9 | COMPLETE / PostgreSQL RUNTIME PASS |
| Stage 10 | COMPLETE / MEDIA RUNTIME PASS / final docs-head verified |
| Product Evolution Review | **CURRENT / IN PROGRESS** |
| Auth/Activation/Device Refactor | DECIDED / NOT YET IMPLEMENTED |
| Stage 10 Preview Sync | PENDING |
| OCR Extraction Foundation | DECIDED architecture / implementation PENDING |
| Curriculum Structure Extension | DIRECTION DECIDED / schema details PENDING |
| Stages 11–20 | REVISED / some detailed decisions still pending |
| Stages 21–29 | PLANNED later engineering/release gates |

**Current rule:** continue Product Evolution Review until Reader, Practice details, curriculum versioning and Offline details are settled enough to implement safely. Preserve valuable legacy capabilities; improve organization and implementation instead of reducing the product.
