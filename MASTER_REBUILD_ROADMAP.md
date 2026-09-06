# MASTER REBUILD ROADMAP — الوسيلة الذكية

> نبني أفضل نسخة من **فكرة الوسيلة الذكية**. التطبيق القديم مرجع شامل للمميزات والسيناريوهات؛ لا تُحذف Feature ذات قيمة بدون قرار صريح من Product Owner.

## القواعد الحاكمة

1. Correctness > Cleverness، Clarity > Complexity، Evidence > Assumptions.
2. Browser لا يتصل مباشرة بPostgreSQL.
3. Auth/Authorization/Entitlements server-owned.
4. Student PWA وAdmin Web سطحان مستقلان، يشتركان في Backend/Brand/Design System primitives فقط حيث يناسب.
5. Student يبقى Web/PWA قابلًا للتثبيت ويعمل أيضًا من Browser.
6. Upload/Media لا يعتمد على OCR/AI/TTS.
7. OCR/AI/TTS طبقات مشتقة مستقلة.
8. Student UX بسيط/أنيق/mobile-first مع الحفاظ على عمق الوظائف.
9. كل نص ظاهر Product-ready وتعليماته سياقية وفي مكانها.
10. Offline first-class مع account/device-scoped state، delta sync/outbox، و14-day max signed lease.
11. Student questions تأتي من Published Admin-reviewed Question Bank فقط.
12. Original ministerial models ≠ simulated models.
13. AI text-first افتراضيًا مع source/page provenance.
14. AI provider/model-neutral؛ لا hard lock-in إلى Gemini أو مزود واحد.
15. Large AI generation = durable chunked jobs + bounded concurrency/backpressure، وليس request ضخم واحد.
16. Admin product الحالي = Super Admin فقط؛ لا multi-role RBAC بلا حاجة.
17. Full Code 6 digits / Class Code 7 digits كلاهما Core Feature؛ multiple class entitlements مدعومة.
18. `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` hard coverage gate قبل إغلاق Student/Admin feature stages.
19. لا ترقيع كحل نهائي؛ root-cause fixes فقط، وPreview workaround يحتاج exit path.
20. Design System موحد/shared components؛ duplicate style/component audit قبل إغلاق Admin/Student.
21. بعد كل دفعة مستقرة: CI PASS → Preview sync → deploy/runtime verification → documentation evidence.
22. كل Stage لها executable DoD؛ unexecuted = `NOT YET VERIFIED`.

## Target Architecture

```text
Student PWA ─┐
             ├── Backend API ── PostgreSQL (private)
Admin Web ───┘       │
                     ├── media/object storage
                     ├── OCR extraction + text index
                     ├── cached/versioned TTS audio
                     ├── durable provider-neutral AI jobs/workers
                     ├── Web Push / notification delivery
                     └── account/device-scoped offline sync
```

Canonical documentation map: `DOCUMENTATION_INDEX.md`.
Development runtime/Preview policy: `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

---

# Verified baseline

## Stage 1 — Product Inventory ✅ CLI PASS
Legacy feature/user-flow inventory and parity safety net.

## Stage 2 — Brand Identity ✅ CLI PASS
Owned teal/open-book identity, Arabic typography/tokens/accessibility rules.

## Stage 3 — UX Architecture ✅ CLI PASS
Initial Admin/Student IA and critical states; later Product Decisions supersede weak flows explicitly.

## Stage 4 — PostgreSQL Data Platform ✅ CLI + RUNTIME PASS
Clean PostgreSQL16 data platform.

## Stage 5 — Engineering Foundation ✅ CLI + RUNTIME PASS
API, DB pool/transactions, migrations, config/logging/errors, strict TS/lint/tests/builds/CI.

## Stage 6 — Auth & Authorization ✅ BASELINE VERIFIED / PARTIAL REOPEN REQUIRED
Verified baseline: scrypt, opaque HttpOnly sessions, role isolation, Origin protection, lockout, reset-only recovery.

Reopen for:
- temporary-password forced change;
- registered device public key/challenge;
- Admin device reset/rebind;
- security tests.

## Stage 7 — Access Codes & Entitlements ✅ CLI + RUNTIME PASS
- Full Code 6 digits.
- Class Code 7 digits.
- crypto-secure generation.
- transactional/idempotent/race-safe redemption.
- renewal/no-waste/revoke/audit.

**Product decision:** Student may add more Class Codes after login and hold multiple class entitlements. Stage7 safety guarantees remain.

## Stage 8 — Student Activation & Account Flow ✅ BASELINE VERIFIED / REFACTOR REQUIRED

Final target:

```text
Welcome
├── لدي حساب بالفعل
│   → identifier + password
│   → registered-device challenge
│   → home
└── تفعيل جديد
    → 6-digit Full Code verification
    → one-time activation ticket
    → mandatory Create Password
    → atomic account + entitlement + redemption + audit
    → register device key
    → session
```

Recovery = temporary password/reset → revoke old sessions → must change password → optional device rebind.

## Stage 9 — Content Model / `alwaslh-go` Import ✅ CLI + PostgreSQL RUNTIME PASS
Verified 15 roots / 48 docs / 5,552 images / 0 fatal inventory issues.

## Stage 10 — Media Pipeline ✅ CLI + PostgreSQL + MEDIA RUNTIME PASS
Sharp + Poppler, deterministic ordering/keys/checksums, idempotency, safe storage boundary, cleanup, real PDF E2E.

Final head `27c6a2ef1118ee44d2e63471e4f925e1296283e0`:
- Stage10 `33302270707` SUCCESS.
- Stage9 regression `33302270692` SUCCESS.
- Full Rebuild `33302270695` SUCCESS including Chromium E2E.

**Delivery requirement:** Student gets optimized display/thumbnail/offline variants, not large originals by default; browser readability/quality limits require runtime verification during Student/Preview integration.

---

# PRODUCT EVOLUTION REVIEW — CORE DECISIONS COMPLETE / DOCS-HEAD CI CLOSURE REQUIRED

Canonical records:
- `docs/product/PRODUCT_EVOLUTION_REVIEW.md` — Batches 01–04.
- `docs/product/PRODUCT_DECISIONS_BATCH_05.md`.
- `docs/product/PRODUCT_DECISIONS_BATCH_06.md`.
- `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`.

Batches 01–06 fixed the core direction for:
- Welcome/auth/device/recovery؛
- Full/Class Codes and multiple class access؛
- Student installable PWA + separate Admin Web؛
- flexible curriculum without mandatory annual versions؛
- Reader page/text/search/TTS؛
- summaries/Practice/Tests/models؛
- Notes text/image/capture/audio؛
- Favorites + Needs Review + repeated-error automation؛
- server-derived progress/weak areas/private achievements؛
- Push/In-App notifications with gentle reminders؛
- Published Question Bank-only Student sessions؛
- Offline downloads + 14-day lease؛
- Super Admin-only Admin scope؛
- OCR/text-first AI + source/page provenance؛
- provider/model-neutral AI benchmark/routing؛
- high-throughput durable generation architecture؛
- contextual instructions؛
- Import/Export and Draft/Review/Published؛
- root-cause/no-patching governance؛
- unified Design System؛
- continuous temporary Preview deployment during development؛
- repository-owned continuity/documentation.

No further routine Product discussion is required before implementation. Only genuine Business Rule conflicts reopen Product Review.

---

# Immediate implementation bridges — EXECUTE IN THIS ORDER

## Bridge 1 — Stage10 Preview Sync

Current highest-priority implementation bridge.

- apply `0009_media_pipeline.sql` to temporary Supabase Preview؛
- enable/reapply Preview lockdown for new tables so browser roles have no direct access؛
- reconcile `preview/supabase-vercel` with Stage10 stable code؛
- fix Vercel build/routing/output mismatch from root cause؛
- verify Student/Admin/API surfaces as applicable؛
- verify optimized Student media delivery where Preview supports it؛
- document Vercel/serverless limitations honestly as `NOT YET VERIFIED` where applicable؛
- record commit/deployment/runtime evidence.

## Bridge 2 — Auth/Activation/Device Refactor
Implement Stage6/8 decisions with migrations/API/UI/security/Chromium E2E:

- two-step activation ticket؛
- mandatory password creation؛
- temporary-password forced change؛
- registered application-device key/challenge؛
- wrong-device rejection؛
- Admin reset/rebind؛
- session revocation/recovery؛
- new Student welcome/entry flow؛
- Preview sync after gates pass.

## Bridge 3 — OCR Extraction Foundation

```text
media page
→ durable OCR job
→ OcrProvider
→ raw text + optional normalized text
→ confidence/status/provider/version/provenance
→ PostgreSQL
→ searchable/reusable text
```

Requirements:
- retry/idempotency؛
- source/page identity؛
- original image remains evidence؛
- low-confidence/sensitive/exact content review/fallback؛
- upload succeeds if OCR fails؛
- provider benchmark dataset.

## Bridge 4 — Curriculum Structure Extension
Minimal explicit model:

```text
Class
→ Subject Offering
→ optional Unit/Section
→ Lesson
→ Content
```

No mandatory annual curriculum version lifecycle. Optional source year/edition metadata only where needed.

---

# Stage 11 — Provider-Neutral AI Prompt / Output Contracts — REQUIRED

- preserve all valuable legacy generation modes؛
- Prompt Registry/versioning؛
- typed provider-neutral inputs/outputs؛
- OCR text + provenance primary input؛
- source/page mandatory for book-generated questions؛
- semantic validators؛
- Arabic/Fusha/scientific/chemistry/exact religious/source-text rules؛
- duplicate/near-duplicate rules؛
- explicit uncertainty/failure behavior؛
- golden regression tests؛
- no silent answer invention/defaulting؛
- benchmark harness comparing approved providers/models on the same source-controlled dataset.

Canonical routing strategy: `docs/ai/AI_PROVIDER_MODEL_STRATEGY.md`.

# Stage 12 — Durable Provider-Neutral High-Throughput AI Execution — REQUIRED

Goal: maximize accepted useful content per cost/token/time without overload.

```text
Generation Plan
→ source/page chunks
→ durable units
→ queue
→ scheduler/backpressure
→ AiModelRouter
→ provider/model adapter
→ structured result
→ validate/dedupe/provenance
→ persist partial success
→ Admin review
```

Requirements:
- OCR text reuse؛
- bounded global/provider/model concurrency؛
- no whole-book repeated prompts؛
- per-unit idempotency؛
- retries/backoff/jitter/cooldown؛
- provider/model health and budget ceilings؛
- partial success persistence؛
- cancel/resume/progress؛
- no huge in-memory batches؛
- token/latency/model/prompt/error/cost metrics؛
- server-only secrets؛
- benchmark-based model cascade: cheap/fast approved first, stronger model only for failed/uncertain units؛
- no switching keys/providers to evade provider limits/terms.

# Stage 13 — Super Admin Product — REQUIRED

Separate `apps/admin-web` surface:

```text
Auth/Shell
→ Overview
→ Classes/Subjects/Optional Units/Lessons
→ Upload/Media Processing
→ OCR status/review
→ TTS derived audio state
→ AI Generation Plans/Jobs
→ Draft Question Bank/Summaries
→ Review/Edit/QA
→ Publish
→ Students/Full Codes/Class Codes/Recovery/Device Rebind
→ Notifications
→ Import/Export/Reports
→ Settings/Audit
```

Only Super Admin role in current scope.

DoD includes unified Design System, no duplicated page-specific primitives, contextual instructions, legacy coverage evidence, tests, and Preview sync.

# Stage 14 — Student Web/PWA Product — REQUIRED

Separate `apps/student-web` surface; installable Web/PWA and browser-usable:

```text
Welcome
→ Activate | لدي حساب بالفعل
→ Home / Continue Learning
→ My Classes / Add Class Code
→ Subjects / Lessons
→ Reader
   ├── optimized page view
   ├── Text View
   ├── Search
   ├── Listen/TTS
   ├── Summary
   ├── Notes
   ├── Favorite
   └── Needs Review
→ Practice / Tests / Models
→ Progress / Private Achievements
→ Notifications
```

All instructions short/contextual/product-ready.

DoD includes installability, responsive/a11y, unified Design System, legacy coverage evidence, browser E2E and Preview verification.

# Stage 15 — Practice / Assessment Engine — REQUIRED

- Published Question Bank only.
- immediate feedback for `اختبر نفسك`.
- full Test/Model result/review at end.
- custom lesson(s)/count/types.
- stable question/option/version identity.
- safe random/shuffle.
- explanations/images.
- resume/restart/attempt history.
- repeated wrong-answer events feed Needs Review.
- original ministerial exact provenance.
- simulated model distinct/deferred until explicitly enabled.
- server-trusted finalization.
- offline draft/outbox where applicable.

# Stage 16 — Offline / PWA — REQUIRED

- Student-owned Service Worker؛
- account/device-scoped IndexedDB؛
- signed max 14-day lease capped by entitlement expiry؛
- Lesson + Subject + explicit Book downloads؛
- optimized media/audio/text variants؛
- Download Manager/storage budgets/eviction؛
- revisions/tombstones/outbox/delta sync؛
- local search for downloaded text where practical؛
- no generic authenticated API caching؛
- clear offline/backend-unreachable/sync-pending states؛
- safe PWA update lifecycle؛
- installability verified.

# Stage 17 — Personal Learning Data — REQUIRED

- Notes text + image + capture + audio؛
- Favorites separate؛
- Needs Review separate؛
- stable lesson/page/question/model provenance؛
- binary media in proper media/blob storage, not base64 DB payloads؛
- account/device-scoped sync/conflict handling؛
- manual + repeated-error Needs Review.

# Stage 18 — Notifications — REQUIRED

- Web Push where platform supports and user grants permission؛
- In-App Notification Center fallback؛
- gentle study reminders: default max 3/week and never >1/day؛
- quiet hours + opt-out؛
- useful Admin/content/access messages؛
- no spammy engagement notifications؛
- Offline/push subscription lifecycle and security tests.

# Stage 19 — Progress / Statistics / Achievements — REQUIRED

- server-derived progress/tracking؛
- weak-area recommendations only with sufficient repeated evidence؛
- explainable Needs Review suggestions؛
- private achievements؛
- no Global Leaderboard؛
- no client-authoritative score/rank/achievement state.

# Stage 20 — Import / Export / Reporting — REQUIRED

Module-scoped safe Import/Export with validation/preview/result reports:
- curriculum data where useful؛
- question bank؛
- codes؛
- reports؛
- printable outputs؛
- structured packages only with explicit manifest/version contracts.

Choose CSV/XLSX/PDF/package by data type; no blind generic importer.

# Stage 21 — Performance Engineering
Budgets/measurement for bundle, API, DB, media bytes, OCR, TTS, AI throughput/tokens, cache/sync, upload/export and request reduction.

# Stage 22 — Security Hardening
Authorization/IDOR, rate limits, device challenge/rebind abuse cases, upload/storage/OCR/AI secrets, CSP/CORS/session/CSRF, dependencies, audit, backup access.

# Stage 23 — Automated Tests & CI Expansion
Unit/DB/Auth/Device/Access/Content/Media/OCR/TTS/AI/Practice/Offline/Admin/Student E2E and legacy feature-coverage regression.

# Stage 24 — Accessibility / Device QA
RTL, keyboard/focus/screen reader, 200% zoom, contrast, reduced motion, 44px targets, Android/iPhone/tablet/desktop, PWA install/update, slow/offline, device-reset scenarios.

# Stage 25 — Initial Data / Content Load
Canonical curriculum/content through final pipelines.

# Stage 26 — Staging
Fresh reproducible environment from repository on production-like infrastructure.

# Stage 27 — Release Gate
No unresolved/unaccepted P0/P1; real-host DB/storage/OCR/TTS/AI; backup restore; Auth/device/access concurrency; Admin/Student E2E; Offline/PWA; performance/security/a11y; legacy feature coverage complete.

# Stage 28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke tests → rollback readiness.

# Stage 29 — Monitoring & Operations
Auth/access/device reset, DB/backups, media/OCR/TTS/AI jobs, offline sync, Push, client/runtime, storage growth, PWA/update health, runbooks/incidents.

---

# Temporary development Preview — applies throughout implementation

Canonical policy: `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

Current environment:
- Supabase `linksoftt` = temporary PostgreSQL/testing host؛
- Vercel project `alwaslh`, team `wasl15` = temporary web/runtime host؛
- integration branch `preview/supabase-vercel`.

Every stable batch that affects the runnable product must follow:

```text
implementation branch
→ required CI/runtime gate PASS
→ sync preview/supabase-vercel
→ apply safe Preview migration/config
→ deploy
→ health/readiness/feature smoke or E2E
→ record exact evidence
```

Preview does not redefine final Production architecture. Unsupported/untested Preview behavior = `NOT YET VERIFIED`.

---

# Current Progress

| Area | Status |
|---|---|
| Stages 1–5 | COMPLETE at documented gates |
| Stage6 baseline | COMPLETE / partial device+recovery refactor required |
| Stage7 | COMPLETE / multiple Class Code access retained |
| Stage8 baseline | COMPLETE / Chromium PASS / final activation+device refactor required |
| Stage9 | COMPLETE / PostgreSQL RUNTIME PASS |
| Stage10 | COMPLETE / MEDIA RUNTIME PASS / Preview sync pending |
| Product Evolution Review core decisions | **COMPLETE / Batches 01–06 recorded** |
| Product Review docs-head CI closure | PENDING on current planning HEAD |
| Stage10 Preview Sync | **NEXT IMPLEMENTATION** |
| Auth/Activation/Device Refactor | DECIDED / NOT YET IMPLEMENTED |
| OCR Extraction Foundation | DECIDED / NOT YET IMPLEMENTED |
| Student optimized media delivery | DECIDED / NOT YET VERIFIED |
| Stage11–20 | REVISED / REQUIRED according to Product decisions |
| Stage21–29 | PLANNED engineering/release gates |

**Current rule:** verify Product Review documentation HEAD in CI, then execute Bridge 1 (Stage10 Preview Sync) without more routine product discussion. After every stable batch, synchronize and verify the temporary Preview. Before Admin/Student stages close, every valuable legacy capability must map to implementation/test evidence or explicit owner-approved removal.
