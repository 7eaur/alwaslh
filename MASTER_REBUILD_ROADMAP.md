# MASTER REBUILD ROADMAP — الوسيلة الذكية

> الخطة التنفيذية لبناء أفضل نسخة من **فكرة الوسيلة الذكية**. التطبيق القديم مرجع للفكرة والاحتياجات والمميزات والمشكلات، وليس مواصفة يجب نسخها. بعد Stage 10 دخل المشروع Product Evolution Review لإعادة مناقشة الـflows والمميزات قبل تثبيت مراحل المنتج المتبقية.

## القواعد الحاكمة

1. نحافظ على قيمة المنتج واحتياجات المستخدم، لا على تفاصيل التنفيذ القديم.
2. كل Feature/Flow/Business Rule قابل لـ`KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE / NEW` بعد نقاش صريح.
3. `alwaslh-go` مرجع canonical للمحتوى/الصور ويدخل عبر deterministic pipeline.
4. PostgreSQL clean-slate خلف Backend خاص؛ Browser لا يتصل مباشرة بقاعدة البيانات.
5. كل Stage لها Definition of Done؛ unexecuted = `NOT YET VERIFIED`.
6. Product Decision يغير Stage مغلقة → نعيد فتح الجزء المتأثر رسميًا مع impact analysis + regression gates.
7. Student UX بسيط/أنيق/mobile-first؛ Admin عملي ومباشر ويقلل العمل المتكرر.
8. لا placeholder copy في الواجهة النهائية؛ كل نص ظاهر Product-ready.
9. Upload/Media لا يعتمد على AI.
10. OCR وAI منفصلان عن Media upload؛ AI text-first افتراضيًا مع source provenance.
11. AI credentials/projects server-only وتدار بجدولة/health/rate/cooldown/failover مصرح بها.
12. `PROJECT_HANDOFF.md` و`PROJECT_STATUS.md` و`PROJECT_ENGINEERING_LOG.md` و`docs/product/PRODUCT_EVOLUTION_REVIEW.md` هي مصادر الاستمرار.

## Target Architecture — revised direction

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (private)
Student PWA ┘       │
                    ├── media/object storage
                    ├── OCR extraction jobs/provider adapter
                    └── durable AI/background workers
```

---

# Stage 1 — Product Inventory ✅ CLI PASS
Legacy feature/user-flow inventory and initial parity safety net. Matrix is now Decision Inventory, not automatic KEEP list.

# Stage 2 — Brand Identity ✅ CLI PASS
Owned teal/open-book identity, Arabic typography/tokens/accessibility rules.

# Stage 3 — UX Architecture ✅ CLI PASS
Initial Admin/Student IA and critical state contracts. Flows may be product-refactored explicitly.

# Stage 4 — PostgreSQL Data Platform ✅ CLI + RUNTIME PASS
Clean PostgreSQL 16 data platform.

# Stage 5 — Engineering Foundation ✅ CLI + RUNTIME PASS
API, DB pool/transactions, migration runner, config/logging/errors, strict TS/lint/tests/builds/CI.

# Stage 6 — Auth & Authorization ✅ CLI + RUNTIME PASS
scrypt credentials, opaque sessions, HttpOnly cookies, role isolation, Origin protection, lockout, reset-only recovery, Admin bootstrap.

# Stage 7 — Access Codes & Entitlements ✅ CLI + RUNTIME PASS
Current baseline: 6-digit Full / 7-digit Class, crypto generation, transactional/idempotent redemption, renewal/no-waste/revoke/audit/race tests. Exact expiry/renewal/product rules remain under review.

# Stage 8 — Student Activation & Account Flow ✅ BASELINE VERIFIED / REFACTOR REQUIRED

Verified baseline was:
`Full Code + password → atomic activation → session`.

**New Product Decision PED-003 changes final UX to:**

```text
Welcome / Student entry
→ Enter 6-digit Full Code
→ server verifies eligibility
→ short-lived one-time activation ticket
→ mandatory Create Password screen
→ atomic profile + credential + entitlement + redemption + audit
→ authenticated session
```

First verification must not create a partial account or permanently consume the code. Final write remains one transaction.

**Required new gate before final Student Product:** API/unit/PostgreSQL/concurrency + Chromium E2E for the two-step flow.

# Stage 9 — Content Model & Deterministic `alwaslh-go` Import ✅ CLI + PostgreSQL RUNTIME PASS

Verified source:
- 15 subject roots;
- 48 source documents;
- 5,552 images;
- 4,218 JPG + 1,334 WEBP;
- 86 helpers;
- 24 manifests;
- 0 fatal inventory issues;
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
- Stage10 `33302270707` SUCCESS;
- Stage9 regression `33302270692` SUCCESS;
- Full rebuild `33302270695` SUCCESS including Chromium E2E.

---

# PRODUCT EVOLUTION REVIEW — CURRENT

Canonical decision log: `docs/product/PRODUCT_EVOLUTION_REVIEW.md`.

## Recorded Batch 01

- PED-001 same product idea, better execution.
- PED-002 elegant Welcome/Introduction before Student auth.
- PED-003 two-step activation; Stage 8 refactor required.
- PED-004 Admin-assisted recovery; old password never revealed; preferred temporary reset + forced password change + audit/session revocation.
- PED-005 Student UI simple/elegant with curriculum, models/quizzes, notes, favorites/saved and progress.
- PED-006/PED-010 Admin upload independent from AI.
- PED-007/PED-008 reusable provider-abstracted OCR text layer.
- PED-009 durable server-side Gemini credential/project scheduler with health/rate/cooldown/retry/failover.

## Gate to leave Product Review

- core flows affecting immediate implementation have explicit decisions;
- no contradiction between product decisions and API/data contracts;
- affected closed stages identified for deliberate refactor;
- roadmap + decision inventory updated;
- required prototypes/unknowns called out explicitly.

---

# Mandatory bridge work before feature-heavy AI/Admin/Student stages

## Bridge A — Stage 8 Activation Refactor
Implement PED-002/PED-003/PED-004 as finalized: Welcome/entry, code verification ticket, mandatory password creation, Admin-assisted reset behavior, new browser E2E.

## Bridge B — Stage 10 Preview Sync
Apply `0009` to temporary Supabase Preview, lock down new tables, reconcile Preview branch with Vercel routing/build config and verify deployment. Preview limitations do not redefine final architecture.

## Bridge C — OCR Extraction Layer

```text
media asset/page
→ OCR queue/job
→ provider adapter
→ raw extracted text
→ optional normalized text
→ confidence/status/provider/version/provenance
→ PostgreSQL persistence
```

Requirements:
- upload succeeds even if OCR fails;
- OCR retry/idempotency;
- provider abstraction;
- page/source provenance;
- original image remains source of truth;
- low-confidence/sensitive-content review/fallback;
- extracted text reusable for generation and future search/accessibility.

---

# Stage 11 — AI Prompt / Output Contracts — REVISED PROVISIONAL

Inputs are primarily OCR/source text + source/page provenance, not repeated raw-image payloads by default.

Requirements:
- versioned Prompt Registry;
- typed request/output schemas;
- semantic validators;
- Arabic/Fusha rules;
- source/page evidence;
- scientific/chemistry notation;
- exact religious/source-text handling;
- golden regression tests;
- explicit failure when required facts are uncertain;
- no silent defaulting/invention.

# Stage 12 — Durable AI Execution — REVISED PROVISIONAL

- durable AI jobs/units/workers;
- configured credential/project scheduler;
- health state + quota/rate awareness;
- retry/backoff/cooldown/failover;
- idempotency;
- cancellation/resume/progress;
- prompt/model/tokens/latency/error/cost metadata;
- server-only secrets;
- AI failure cannot corrupt or block normal content upload.

# Stage 13 — Admin Product — PROVISIONAL

Functional direction:
`auth/shell → curriculum → lessons/content → upload/process → OCR status/review → AI generation/review → Quiz Builder → students/codes/support → notifications/reports/settings`.

Exact roles/modules remain under Product Review.

# Stage 14 — Student Learning Product — PROVISIONAL

Direction:
`Welcome → activation/login → Home → curriculum → subject/lesson → Reader → models/practice → notes/saved → progress`.

Home/Reader/navigation details remain under Product Review. UI must stay low-clutter and production-copy only.

# Stage 15 — Practice / Assessment Engine — PROVISIONAL
Deterministic question/session/attempt engine with server-trusted completion. Exact practice/quiz/model/ministerial exam behavior pending discussion.

# Stage 16 — Offline / PWA — PROVISIONAL
If retained: account-scoped IndexedDB, revisions/tombstones/outbox, explicit download/cache lifecycle.

# Stage 17 — Personal Learning Data — PROVISIONAL
Notes/saved/highlights/favorites according to decided UX and sync model.

# Stage 18 — Notifications — PROVISIONAL
Only useful categories/channels retained.

# Stage 19 — Progress / Statistics / Achievements — PROVISIONAL
Progress/tracking is required in principle; exact mastery/gamification/rank model pending discussion.

# Stage 20 — Export / Reporting — PROVISIONAL
Only outputs with clear operational/product value.

# Stage 21 — Performance Engineering
Measure/enforce bundle/API/query/media/OCR/AI/cache/upload/export budgets.

# Stage 22 — Security Hardening
Authorization/IDOR, rate limits, uploads/storage/OCR/AI secrets, CSP/CORS/session/CSRF, dependencies, audit, backup access.

# Stage 23 — Automated Tests & CI Expansion
Unit/DB/Auth/Access/content/media/OCR/AI/learning/Admin/Student E2E and regressions.

# Stage 24 — Accessibility / Device QA
RTL, keyboard/focus/screen reader, 200% zoom, contrast, reduced motion, 44px targets, Android/iPhone/tablet/desktop, slow/offline.

# Stage 25 — Initial Data / Content Load
Canonical curriculum and derived content through final pipelines.

# Stage 26 — Staging
Fresh reproducible environment from repository.

# Stage 27 — Release Gate
No unresolved/unaccepted P0/P1, real-host DB/storage/OCR/AI where applicable, backup restore, E2E, security/perf/a11y/product-decision evidence.

# Stage 28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke tests → rollback readiness.

# Stage 29 — Monitoring & Operations
Auth/access, DB/backups, media/OCR/AI jobs, client/runtime, storage growth, PWA/update health, runbooks/incidents.

---

# Current Progress

| Area | Status |
|---|---|
| Stages 1–7 | COMPLETE at documented gates |
| Stage 8 baseline | COMPLETE / Chromium PASS, **final UX refactor required** |
| Stage 9 | COMPLETE / PostgreSQL RUNTIME PASS |
| Stage 10 | COMPLETE / MEDIA RUNTIME PASS / final docs-head verified |
| Product Evolution Review | **CURRENT / IN PROGRESS** |
| Stage 8 Activation Refactor | DECIDED / NOT YET IMPLEMENTED |
| Stage 10 Preview Sync | PENDING |
| OCR Extraction Layer | DECIDED architecture / provider + implementation PENDING |
| Stages 11–20 | PROVISIONAL / being refined from decisions |
| Stages 21–29 | PLANNED later engineering/release gates |

**Current rule:** continue the Product Evolution Review and record decisions before implementing feature-heavy Stage 11+. Do not copy legacy behavior by default; do not silently break verified engineering guarantees.
