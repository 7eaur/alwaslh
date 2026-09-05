# MASTER REBUILD ROADMAP — الوسيلة الذكية

> نبني أفضل نسخة من **فكرة الوسيلة الذكية**. التطبيق القديم مرجع شامل للمميزات والسيناريوهات؛ لا تُحذف Feature ذات قيمة بدون قرار صريح من Product Owner.

## القواعد الحاكمة

1. Correctness > Cleverness، Clarity > Complexity، Evidence > Assumptions.
2. Browser لا يتصل مباشرة بPostgreSQL.
3. Auth/Authorization/Entitlements server-owned.
4. Upload/Media لا يعتمد على OCR/AI/TTS.
5. OCR/AI/TTS طبقات مشتقة مستقلة.
6. Student UX بسيط/أنيق/mobile-first مع الحفاظ على عمق الوظائف.
7. كل نص ظاهر Product-ready وتعليماته سياقية وفي مكانها.
8. Offline first-class مع account/device-scoped state، delta sync/outbox، و14-day max signed lease.
9. Student questions تأتي من Published Admin-reviewed Question Bank فقط.
10. Original ministerial models ≠ simulated models.
11. AI text-first افتراضيًا مع source/page provenance.
12. Large AI generation = durable chunked jobs + bounded concurrency/backpressure، وليس request ضخم واحد.
13. Admin product الحالي = Super Admin فقط؛ لا multi-role RBAC بلا حاجة.
14. Full Code 6 digits / Class Code 7 digits كلاهما Core Feature؛ multiple class entitlements مدعومة.
15. `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` hard coverage gate قبل إغلاق Student/Admin feature stages.
16. كل Stage لها executable DoD؛ unexecuted = `NOT YET VERIFIED`.

## Target Architecture

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    ├── OCR extraction + text index
                    ├── cached/versioned TTS audio
                    ├── durable AI jobs/workers
                    └── account/device-scoped offline sync
```

---

# Verified baseline

## Stage 1 — Product Inventory ✅ CLI PASS
Legacy feature/user-flow inventory and parity safety net.

## Stage 2 — Brand Identity ✅ CLI PASS
Owned teal/open-book identity, Arabic typography/tokens/accessibility rules.

## Stage 3 — UX Architecture ✅ CLI PASS
Initial Admin/Student IA and critical states; later product decisions explicitly supersede weak flows.

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

**New delivery requirement:** Student gets optimized display/thumbnail/offline variants, not large originals by default; browser readability/quality limits require later runtime verification.

---

# PRODUCT EVOLUTION REVIEW — CURRENT

Canonical decisions: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

Batches 01–04 fixed the core direction for:
- Welcome/auth/device/recovery;
- Full/Class Codes and multiple class access;
- flexible curriculum without mandatory annual versions;
- Reader page/text/search/TTS;
- summaries/Practice/Tests/models;
- Published Question Bank-only Student sessions;
- Offline downloads + 14-day lease;
- Super Admin-only Admin scope;
- OCR/text-first AI;
- required provenance/source page;
- high-throughput generation architecture;
- contextual instructions;
- Import/Export and Draft/Review/Published.

Remaining Product Review: Notes launch media types، Notifications، mastery/recommendations، exact Quiz Builder UX، exact Import/Export/report formats، Student direct AI scope.

---

# Mandatory bridge/refactor work

## Bridge A — Auth/Activation/Device Refactor
Implement Stage6/8 decisions with migrations/API/UI/security/Chromium E2E.

## Bridge B — Stage10 Preview Sync
- apply `0009` to temporary Supabase Preview;
- lock down new tables;
- reconcile Vercel build/routing;
- verify Student optimized media delivery;
- document Vercel serverless limitations.

## Bridge C — OCR Extraction Foundation

```text
media page
→ durable OCR job
→ OcrProvider
→ raw text + optional normalized text
→ confidence/status/provider/version/provenance
→ PostgreSQL
→ searchable/reusable text
```

Must support retry/idempotency and never block normal upload.

## Bridge D — Curriculum Structure Extension
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

# Stage 11 — AI Prompt / Output Contracts — REQUIRED

- preserve all valuable legacy generation modes;
- Prompt Registry/versioning;
- typed inputs/outputs;
- OCR text + provenance primary input;
- source/page mandatory for book-generated questions;
- semantic validators;
- Arabic/Fusha/scientific/chemistry/exact religious/source-text rules;
- duplicate/near-duplicate rules;
- explicit uncertainty/failure behavior;
- golden regression tests;
- no silent answer invention/defaulting.

# Stage 12 — Durable High-Throughput AI Execution — REQUIRED

Goal: maximize accepted useful content per token/time without overload.

```text
Generation Plan
→ source/page chunks
→ durable units
→ queue
→ scheduler/backpressure
→ healthy authorized Gemini project/key
→ structured result
→ validate/dedupe/provenance
→ persist partial success
→ Admin review
```

Requirements:
- OCR text reuse;
- bounded worker/provider concurrency;
- no whole-book repeated prompts;
- per-unit idempotency;
- retries/backoff/jitter/cooldown;
- partial success persistence;
- cancel/resume/progress;
- no huge in-memory batches;
- token/latency/model/prompt/error/cost metrics;
- server-only secrets.

# Stage 13 — Super Admin Product — REQUIRED

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

# Stage 14 — Student Learning Product — REQUIRED

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
```

All instructions short/contextual/product-ready.

# Stage 15 — Practice / Assessment Engine — REQUIRED

- Published Question Bank only.
- immediate feedback for `اختبر نفسك`.
- full Test/Model result/review at end.
- custom lesson(s)/count/types.
- stable question/option/version identity.
- safe random/shuffle.
- explanations/images.
- resume/restart/attempt history.
- original ministerial exact provenance.
- simulated model distinct/deferred until explicitly enabled.
- server-trusted finalization.
- offline draft/outbox where applicable.

# Stage 16 — Offline / PWA — REQUIRED

- account/device-scoped IndexedDB.
- signed max 14-day lease capped by entitlement expiry.
- Lesson + Subject + explicit Book downloads.
- optimized media/audio/text variants.
- Download Manager/storage budgets/eviction.
- revisions/tombstones/outbox/delta sync.
- local search for downloaded text where practical.
- no generic authenticated API caching.
- clear offline/backend-unreachable/sync-pending states.

# Stage 17 — Personal Learning Data — REQUIRED
Notes / Favorites / Needs Review separate with stable provenance and sync. Exact note media types pending Product Review.

# Stage 18 — Notifications — REQUIRED SCOPE PENDING
Useful Admin announcements/content/access reminders only after exact categories/channels are decided.

# Stage 19 — Progress / Statistics / Achievements — REQUIRED
Personal progress/private achievements; server-derived assessment metrics. No Global Leaderboard. Mastery/weak-area recommendations pending Product Review.

# Stage 20 — Import / Export / Reporting — REQUIRED
Module-scoped safe Import/Export with validation/preview/result reports. Exact CSV/XLSX/PDF/package scopes finalized per module.

# Stage 21 — Performance Engineering
Budgets/measurement for bundle, API, DB, media bytes, OCR, TTS, AI throughput/tokens, cache/sync, upload/export and request reduction.

# Stage 22 — Security Hardening
Authorization/IDOR, rate limits, device challenge/rebind abuse cases, upload/storage/OCR/AI secrets, CSP/CORS/session/CSRF, dependencies, audit, backup access.

# Stage 23 — Automated Tests & CI Expansion
Unit/DB/Auth/Device/Access/Content/Media/OCR/TTS/AI/Practice/Offline/Admin/Student E2E and legacy feature-coverage regression.

# Stage 24 — Accessibility / Device QA
RTL, keyboard/focus/screen reader, 200% zoom, contrast, reduced motion, 44px targets, Android/iPhone/tablet/desktop, slow/offline, device-reset scenarios.

# Stage 25 — Initial Data / Content Load
Canonical curriculum/content through final pipelines.

# Stage 26 — Staging
Fresh reproducible environment from repository.

# Stage 27 — Release Gate
No unresolved/unaccepted P0/P1; real-host DB/storage/OCR/TTS/AI; backup restore; Auth/device/access concurrency; Admin/Student E2E; Offline; performance/security/a11y; legacy feature coverage complete.

# Stage 28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke tests → rollback readiness.

# Stage 29 — Monitoring & Operations
Auth/access/device reset, DB/backups, media/OCR/TTS/AI jobs, offline sync, client/runtime, storage growth, PWA/update health, runbooks/incidents.

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
| Product Evolution Review | **CURRENT / IN PROGRESS** |
| Auth/Activation/Device Refactor | DECIDED / NOT YET IMPLEMENTED |
| OCR Extraction Foundation | DECIDED / NOT YET IMPLEMENTED |
| Student optimized media delivery | DECIDED / NOT YET VERIFIED |
| Stage11–20 | REVISED from Product decisions |
| Stage21–29 | PLANNED engineering/release gates |

**Current rule:** finish remaining product decisions, then implement in the revised sequence. Before Admin/Student stages close, every valuable legacy capability must map to a target implementation/test or explicit owner-approved removal.
