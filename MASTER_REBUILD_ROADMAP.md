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
10. Upload/Media لا يعتمد على OCR/AI/TTS.
11. OCR وAI وTTS طبقات مشتقة مستقلة عن Upload؛ AI text-first افتراضيًا مع source/page provenance.
12. AI credentials/projects server-only مع health/rate/quota/cooldown/retry/failover.
13. Offline first-class requirement مع account/device-scoped state، delta sync/outbox، وعدم refetch المستمر.
14. Student account uses registered cryptographic application-device identity; fingerprint/IP/user-agent ليست security proof.
15. Student tests/practice consume Admin-reviewed **Published Question Bank** only; no live Gemini generation for Student sessions.
16. Original ministerial models and simulated models are distinct content types.
17. Protected Offline access uses maximum 14-day signed lease capped by real entitlement expiry.
18. `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/product/PRODUCT_EVOLUTION_REVIEW.md` هي مصادر الاستمرار.

## Target Architecture — revised

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    ├── OCR extraction + searchable text
                    ├── cached/versioned TTS audio
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

Product Review additions requiring partial reopen:
- temporary-password recovery + `must_change_password`;
- registered application-device public key;
- password + device challenge for returning online login;
- Admin device reset/rebind؛
- security tests proving fingerprint/IP/user-agent are not trusted identity.

# Stage 7 — Access Codes & Entitlements ✅ CLI + RUNTIME PASS
Current baseline: Full Code 6 digits / Class Code 7 digits, crypto generation, transactional/idempotent redemption, renewal/no-waste/revoke/audit/race tests. Exact expiry/renewal/multiple-class rules remain reviewable.

# Stage 8 — Student Activation & Account Flow ✅ BASELINE VERIFIED / REFACTOR REQUIRED

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
    → one-time activation ticket
    → mandatory Create Password
    → atomic profile + credential + entitlement + redemption + audit
    → register device public key
    → authenticated session
```

Recovery:

```text
Student contacts Admin
→ Admin issues temporary password
→ revoke old sessions
→ optional device reset/rebind
→ must_change_password=true
→ Student creates new private password
```

First verification never creates/consumes partial account. Final write remains transactional/race-safe/idempotent.

**New gate:** API/unit/PostgreSQL/concurrency/security + Chromium E2E for activation, returning login, recovery, wrong-device rejection and device reset/rebind.

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

## Decisions fixed through Batch 03

### Student/account
- Welcome before auth.
- `تفعيل جديد` + `لدي حساب بالفعل`.
- two-step activation.
- Admin temporary-password recovery + forced password change.
- one registered application device per Student account; different/lost device requires Admin rebind.

### Student learning
Preserve/improve:
- curriculum/classes/subjects/lessons;
- Reader;
- summaries;
- quick `اختبر نفسك` Practice;
- full tests/custom tests;
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

### Reader
- original page/image is visual source of truth؛
- optional OCR/published Text View؛
- Arabic-aware book/lesson search mapped to exact page/source؛
- `استماع للدرس` via Arabic TTS provider abstraction؛
- TTS generated/cached by published content revision, not per playback؛
- optional Offline audio download؛
- no separate Highlight feature now.

### Practice/Test/Models
- Student can choose subject/lesson(s), count and available question types for custom sessions؛
- all questions come only from Published Admin-reviewed Question Bank؛
- no live Gemini generation for Student testing؛
- original ministerial models remain exact/provenanced؛
- simulation is a separate future type with explicit label.

### Admin/content
- multiple classes/grades and multiple subjects;
- flexible hierarchy: `Curriculum/Year → Class → Subject Offering → optional Unit → Lesson → Content`;
- normal upload independent from OCR/AI/TTS;
- asynchronous OCR;
- Draft → Review → Published;
- Admin review of AI generation mandatory;
- Import/Export required.

### AI
Preserve legacy generation outcomes: summaries, questions, MCQ, T/F, mixed, source/extraction, selected page/image, regenerate, alternate version, exam/model, exact/replica where applicable, bulk generation, source/page/answer/explanation/method/difficulty metadata.

Default input is OCR text + provenance; vision fallback only when required.

### Offline/performance
- Offline mandatory؛
- lesson + subject downloads؛
- explicit full-book download when storage budget permits؛
- no automatic full curriculum download؛
- account/device-scoped cache/state؛
- revision/delta sync + outbox؛
- Download Manager with size/progress/retry/cancel/remove؛
- maximum signed authorization lease 14 days, capped by entitlement expiry؛
- server authority retained for trusted finalization/redemption/publishing.

## Gate to leave Product Review

- Practice feedback/scoring/timing/review behavior decided enough for engine contracts؛
- curriculum year/version/archive semantics decided enough for schema؛
- Admin role baseline decided؛
- Quiz Builder/Content QA baseline decided؛
- no contradiction with verified contracts؛
- roadmap/decision inventory updated؛
- affected verified stages explicitly reopened.

---

# Mandatory bridge/refactor work before feature-heavy stages

## Bridge A — Auth/Activation/Device Refactor
Reopen Stage 6/8 for two-step activation, forced password change, device key/challenge/rebind and E2E/security gates.

## Bridge B — Stage 10 Preview Sync
Apply `0009` to temporary Supabase Preview, lock down new tables, reconcile Preview branch/Vercel build/routing and verify deployment.

## Bridge C — OCR Extraction Foundation

```text
media asset/page
→ OCR job
→ provider adapter
→ raw text
→ optional approved/normalized text
→ confidence/status/provider/version/provenance
→ PostgreSQL persistence
→ search/AI/TTS consumers
```

Requirements:
- upload succeeds if OCR fails؛
- retry/idempotency؛
- provider abstraction؛
- page/source provenance؛
- original image remains source of truth؛
- low-confidence/sensitive-content review/fallback؛
- reusable for AI/search/accessibility/TTS.

## Bridge D — Curriculum Structure Extension
After year/version/archive rules are settled, extend current class/subject/lesson model minimally for optional Unit/Section, Subject Offering and version semantics without generic-tree overengineering.

---

# Stage 11 — AI Prompt / Output Contracts — REVISED

- preserve all agreed generation modes؛
- versioned Prompt Registry؛
- typed request/output schemas؛
- semantic validators؛
- Arabic/Fusha rules؛
- source/page evidence؛
- scientific/chemistry notation؛
- exact religious/source-text handling؛
- golden regression tests؛
- explicit uncertainty/failure behavior؛
- no silent defaulting/invention؛
- OCR text + provenance primary input, vision fallback explicit.

# Stage 12 — Durable AI Execution — REVISED

- durable jobs/units/workers؛
- credential/project scheduler؛
- health + quota/rate awareness؛
- retry/backoff/cooldown/failover؛
- idempotency؛
- cancellation/resume/progress؛
- prompt/model/tokens/latency/error/cost metadata؛
- server-only secrets؛
- AI failure never blocks normal upload.

# Stage 13 — Admin Product — REVISED

```text
Auth/Shell
→ Overview
→ Curriculum/Years/Classes/Subjects/Units/Lessons
→ Upload/Media Processing
→ OCR status/review
→ TTS derived-audio status where enabled
→ AI generation Drafts
→ Question Bank / Quiz Builder / Content QA
→ Review & Publish
→ Students/Codes/Recovery/Device Rebind
→ Notifications
→ Import/Export/Reports
→ Settings/Audit
```

# Stage 14 — Student Learning Product — REVISED

```text
Welcome
→ Activate new | لدي حساب بالفعل
→ Home / Continue Learning
→ Curriculum
→ Subject / Lesson
→ Reader
├── Page View ↔ Text View
├── Search
├── Listen / TTS
├── Summary
├── اختبر نفسك
├── Notes
├── Favorite
└── Needs Review
→ Tests / Original Models
→ Progress / Private Achievements
```

Must stay low-clutter/mobile-first and use only Product-ready Arabic copy.

# Stage 15 — Practice / Assessment Engine — REQUIRED

One deterministic/trusted engine supporting:
- quick Practice;
- full/custom Tests؛
- Models/ministerial exams؛
- **Published Question Bank only** for Student sessions؛
- stable question/option/version identity؛
- safe random/shuffle؛
- multi-lesson filters؛
- explanations/images؛
- resume/restart؛
- attempt history/review؛
- server-trusted finalization؛
- Offline drafts/outbox where applicable؛
- original ministerial source type separate from simulated model type.

Open product detail: immediate vs end-of-set Practice feedback.

# Stage 16 — Offline / PWA — REQUIRED

- Student-owned Service Worker؛
- account/device-scoped IndexedDB؛
- signed offline entitlement snapshot؛
- **14-day maximum lease capped by entitlement expiry**؛
- revisions/tombstones/outbox؛
- explicit lesson/subject downloads؛
- explicit full-book download when size budget permits؛
- optional TTS audio download؛
- Download Manager؛
- bounded storage/eviction؛
- offline notes/favorites/review-items/attempt drafts؛
- delta sync؛
- no generic auth/API caching؛
- clear offline/backend-unavailable/sync-pending states.

# Stage 17 — Personal Learning Data — REQUIRED

Separate concepts:
- Notes؛
- Favorites؛
- Needs Review؛
- stable question/page/lesson provenance؛
- no Highlight system in current target؛
- media note types according to final decision؛
- account/device-scoped sync.

# Stage 18 — Notifications — PROVISIONAL
Useful categories/channels only.

# Stage 19 — Progress / Statistics / Achievements — REVISED

- personal progress/tracking;
- private achievements;
- server-derived authoritative assessment metrics;
- no Global Leaderboard requirement;
- mastery/weak-area recommendations only if confirmed.

# Stage 20 — Import / Export / Reporting — REQUIRED

Admin module-scoped import/export with validation and safe formats:
- curriculum data where needed؛
- question bank؛
- codes؛
- reports؛
- printable/export outputs؛
- structured content packages only with explicit manifest/version contracts.

# Stage 21 — Performance Engineering
Measure/enforce bundle/API/query/media/OCR/TTS/AI/cache/sync/upload/export budgets and request reduction.

# Stage 22 — Security Hardening
Authorization/IDOR, rate limits, registered-device challenge/rebind abuse cases, uploads/storage/OCR/TTS/AI secrets, CSP/CORS/session/CSRF, dependencies, audit, backup access.

# Stage 23 — Automated Tests & CI Expansion
Unit/DB/Auth/Device/Access/content/media/OCR/TTS/AI/Practice/Offline/Admin/Student E2E and regressions.

# Stage 24 — Accessibility / Device QA
RTL, keyboard/focus/screen reader, 200% zoom, contrast, reduced motion, 44px targets, Android/iPhone/tablet/desktop, slow/offline, device-reset and audio controls.

# Stage 25 — Initial Data / Content Load
Canonical curriculum and derived content through final pipelines.

# Stage 26 — Staging
Fresh reproducible environment from repository.

# Stage 27 — Release Gate
No unresolved/unaccepted P0/P1, real-host DB/storage/OCR/TTS/AI, backup restore, Auth/device/access concurrency, Admin/Student E2E, Offline, security/perf/a11y and product-decision evidence.

# Stage 28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke tests → rollback readiness.

# Stage 29 — Monitoring & Operations
Auth/access/device reset, DB/backups, media/OCR/TTS/AI jobs, offline sync, client/runtime, storage growth, PWA/update health, runbooks/incidents.

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
| Reader Text/Search/TTS | DECIDED / NOT YET IMPLEMENTED |
| Published Question Bank-only Student tests | DECIDED / NOT YET IMPLEMENTED |
| Offline 14-day lease/download policy | DECIDED / NOT YET IMPLEMENTED |
| Curriculum Structure Extension | DIRECTION DECIDED / schema details PENDING |
| Stages 11–20 | REVISED / some detailed decisions still pending |
| Stages 21–29 | PLANNED later engineering/release gates |

**Current rule:** continue Product Evolution Review until Practice behavior, curriculum versioning, Admin roles and Quiz Builder/QA are settled enough to implement safely. Preserve valuable legacy capabilities; improve organization and implementation instead of reducing the product.
