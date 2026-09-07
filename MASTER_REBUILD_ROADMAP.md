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
14. AI provider/model-neutral؛ لا hard lock-in إلى مزود واحد.
15. Large AI generation = durable chunked jobs + bounded concurrency/backpressure.
16. Admin product الحالي = Super Admin فقط؛ لا multi-role RBAC بلا حاجة.
17. Full Code 6 digits / Class Code 7 digits كلاهما Core Feature؛ multiple class entitlements مدعومة.
18. `PRODUCT_FEATURE_PARITY_MATRIX.md` + `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` hard coverage gate قبل إغلاق Student/Admin feature stages.
19. لا ترقيع كحل نهائي؛ root-cause fixes فقط.
20. Design System موحد/shared components؛ duplicate style/component audit قبل إغلاق Admin/Student.
21. كل Stage لها executable DoD؛ unexecuted = `NOT YET VERIFIED`.
22. Deployment/Preview verification ينفذ فقط عندما يكون النشر مفعّلًا بقرار Product Owner؛ القرار الحالي هو `DEFERRED BY PRODUCT OWNER`.
23. قاعدة البيانات القديمة ليست dependency حالية للتطوير؛ repository migrations/tests/current PostgreSQL contracts هي السلطة التنفيذية الحالية.

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
Development runtime policy: `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

---

# Verified baseline

## Stage 1 — Product Inventory ✅ VERIFIED
Legacy feature/user-flow inventory and parity safety net.

## Stage 2 — Brand Identity ✅ VERIFIED
Owned identity, Arabic typography/tokens/accessibility rules.

## Stage 3 — UX Architecture ✅ VERIFIED BASELINE
Admin/Student IA and critical states; later Product Decisions supersede weak flows explicitly.

## Stage 4 — PostgreSQL Data Platform ✅ VERIFIED
Clean PostgreSQL16 data platform and additive migrations.

## Stage 5 — Engineering Foundation ✅ VERIFIED
API, DB pool/transactions, migrations, config/logging/errors, strict TS/lint/tests/builds/CI.

## Stage 6 — Auth & Authorization ✅ VERIFIED
Final verified scope includes server sessions, role isolation, Origin protection, lockout, temporary-password forced replacement and registered-device boundaries.

## Stage 7 — Access Codes & Entitlements ✅ VERIFIED
Full Code 6 digits, Class Code 7 digits, crypto-secure generation, transactional/idempotent/race-safe redemption, renewal/no-waste/revoke/audit and multiple class entitlements.

## Stage 8 — Student Activation / Login / Recovery / Device ✅ VERIFIED

```text
Welcome
├── لدي حساب بالفعل
│   → identifier + password
│   → registered-device challenge
│   → session
└── تفعيل جديد
    → 6-digit Full Code verification
    → one-time activation ticket
    → mandatory Create Password
    → atomic account + entitlement + redemption + audit
    → register P-256 device key
    → session
```

Recovery uses temporary password + session revocation + forced private replacement; device loss uses Admin reset/rebind.

## Stage 9 — Content Source Import ✅ VERIFIED
Canonical `alwaslh-go` inventory: 15 roots / 48 docs / 5,552 images / 0 fatal inventory issues. Source inventory is provenance evidence, not curriculum authority.

## Stage 10 — Media Pipeline ✅ VERIFIED
Sharp + Poppler, deterministic ordering/keys/checksums, idempotency, storage abstraction, cleanup, source/display/thumbnail/ai variants and real PDF coverage.

## OCR Foundation ✅ VERIFIED
Durable OCR queue/leases/retry, provider-neutral adapter, conservative normalization, review gates, approved-only search and real Tesseract wiring.

## Stage 11 — Provider-Neutral AI Contracts ✅ VERIFIED
Typed provider-neutral inputs/outputs, Prompt Registry/versioning, source/page evidence, semantic/provenance/count/notation validators, uncertainty behavior and golden benchmark harness.

## Stage 12 — Durable Provider-Neutral AI Execution ✅ VERIFIED BACKEND LIFECYCLE/RUNTIME

```text
Generation Plan
→ source/page units
→ ai_jobs / ai_job_units
→ bounded worker slots
→ leases
→ distributed capacity + operational controls
→ AiModelRouter
→ provider call outside DB transaction
→ validation
→ durable attempt/output
→ partial success/retry/review/failure
```

Verified: global/provider/project/model capacity, cooldown/Retry-After/kill/budget controls, route identity, cancellation, pause/resume/progress, stale-worker rejection, single lifecycle owner and dedicated bounded worker runtime.

Live provider adapters/credentials/benchmark/production routes remain `NOT YET VERIFIED`.

## Stage 13A — Curriculum Structure Backend ✅ VERIFIED

```text
Class
→ Subject Offering (`subject_class_links`)
→ optional Unit/Section
→ Lesson
→ Content
```

One optional Section layer only; lesson/section same-offering scope is DB-enforced; Admin curriculum mutations are audited; Stage9 source folders never define curriculum hierarchy.

## Stage 13B — Admin Curriculum Web ✅ VERIFIED

Server-backed Admin login/session restore/logout + real curriculum operations. Chromium proves create Class/Subject/Offering/Section/Lesson, Lesson move/detach, rename/status, reload/session restore, logout and narrow responsive behavior.

Latest exact executable closure for the current verified product baseline:

`d3e621e6f60cc56ee3838b7df36a86ebafa37524`

- Stage13 `34168788666` SUCCESS;
- Stage12 `34168788667` SUCCESS;
- Stage11 `34168788661` SUCCESS;
- OCR `34168788704` SUCCESS;
- Stage10 `34168788646` SUCCESS;
- Stage9 `34168788663` SUCCESS;
- Full Rebuild `34168788747` SUCCESS.

---

# Current implementation sequence

## Stage 13C — Admin Content / Media / OCR Operations — CURRENT

Repository authorities already exist:

```text
Stage9 source documents/assets
→ Stage10 media assets/variants
→ OCR extractions/review
```

Current gaps to close in order:

1. Admin read model for source document list/search/filter and processing summaries.
2. Ordered source-asset detail with linked media/variant state.
3. OCR extraction metadata/detail and pending review list.
4. Admin approve/reject/correct review actions using existing OCR lifecycle/repository rules.
5. Admin “الوسائط وOCR” workspace with loading/error/empty/search/filter/detail/review states.
6. API/PostgreSQL/unit/Chromium verification and parity evidence.

Hard boundaries:

- no second OCR/media queue;
- no browser worker execution;
- no direct DB access;
- source labels are source facets, not curriculum hierarchy;
- Stage10 media/OCR does not become published Lesson content automatically;
- `lesson_assets` linking/publication must be an explicit verified contract.

## Stage 13D — Upload / Processing History / Publication Linking — REQUIRED NEXT WITH EXPLICIT CONTRACT

Legacy parity requires:

- ordered image upload;
- PDF extraction;
- mixed PDF/image order preservation;
- media processing/compression variants;
- durable upload/progress/history behavior;
- explicit reviewed save/link to curriculum Lesson content.

Do not fake upload task history with unrelated processing rows. Add a durable task model only if the workflow requires it.

## Stage 13E — Admin AI Operations / Review — REQUIRED

Use existing Stage12 queue/runtime only:

- generation plans/jobs/units/progress;
- retry/cancel/pause/resume;
- route/provider health without secrets;
- outputs needing review;
- approved source/OCR provenance;
- no client-owned progress or second queue.

## Stage 13F — Question Bank / Review / Publish — REQUIRED

- Draft → Review → Published;
- manual/edit/generated content in one validated schema;
- resolve `direct` persistence before publish depends on it;
- Student sessions consume Published reviewed content only.

## Stage 13G — Students / Codes / Operations — REQUIRED

- students/accounts;
- Full/Class Codes;
- recovery/device rebind;
- notifications;
- import/export/reports;
- settings/security/audit.

Stage13 closes only when parity mapping is complete or an explicit owner-approved disposition exists for every valuable Admin capability.

---

# Stage 14 — Student Web/PWA Product — REQUIRED

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

Auth/device foundation is already verified; remaining Student product stages must preserve it.

# Stage 15 — Practice / Assessment Engine — REQUIRED

- Published Question Bank only;
- immediate feedback for `اختبر نفسك`;
- final Test/Model result/review;
- custom lesson(s)/count/types;
- stable question/option/version identity;
- safe random/shuffle;
- explanations/images;
- resume/restart/attempt history;
- repeated wrong-answer events feed Needs Review;
- original ministerial exact provenance;
- server-trusted finalization;
- offline outbox where applicable.

# Stage 16 — Offline / PWA — REQUIRED

Account/device-scoped IndexedDB, signed entitlement lease, resumable downloads, optimized media/audio/text, storage budgets, revisions/tombstones/outbox/delta sync, safe SW updates and clear offline/backend/sync states.

# Stage 17 — Personal Learning Data — REQUIRED

Notes text/image/capture/audio, Favorites, Needs Review, stable provenance and proper binary storage/sync/conflict behavior.

# Stage 18 — Notifications — REQUIRED

Web Push where supported, In-App fallback, gentle reminders/quiet hours/opt-out and secure subscription lifecycle.

# Stage 19 — Progress / Statistics / Achievements — REQUIRED

Server-derived progress, explainable weak-area suggestions, private achievements, no global leaderboard and no client-authoritative awards.

# Stage 20 — Import / Export / Reporting — REQUIRED

Module-scoped validated import/export for curriculum/question bank/codes/reports/print; no blind generic importer.

# Stage 21 — Performance Engineering
Bundle/API/DB/media/OCR/TTS/AI/cache/upload/export budgets and measurement.

# Stage 22 — Security Hardening
Authorization/IDOR, rates, device/rebind abuse, upload/storage/OCR/AI secrets, CSP/CORS/session/CSRF, dependencies, audit and backups.

# Stage 23 — Automated Tests & CI Expansion
Unit/DB/Auth/Device/Access/Content/Media/OCR/TTS/AI/Practice/Offline/Admin/Student E2E + legacy coverage regression.

# Stage 24 — Accessibility / Device QA
RTL, keyboard/focus/screen reader, 200% zoom, contrast, reduced motion, targets, mobile/tablet/desktop/PWA/offline/device-reset scenarios.

# Stage 25 — Initial Data / Content Load
Canonical curriculum/content through final pipelines.

# Stage 26 — Staging
Fresh reproducible production-like environment.

# Stage 27 — Release Gate
No unresolved/unaccepted P0/P1; real-host DB/storage/OCR/TTS/AI; backup restore; Auth/device/access concurrency; Admin/Student E2E; Offline/PWA; performance/security/a11y; legacy coverage complete.

# Stage 28 — Production Cutover
Provision → migrations → content → backend/workers → Admin → Student → smoke → rollback readiness.

# Stage 29 — Monitoring & Operations
Auth/access/device reset, DB/backups, media/OCR/TTS/AI jobs, offline sync, Push, storage/PWA/runtime health, runbooks/incidents.

---

# Deployment / Preview status

Canonical policy: `docs/engineering/DEVELOPMENT_RUNTIME_AND_PREVIEW_POLICY.md`.

Current Product Owner decision: **deployment is deferred during development**.

Therefore the old roadmap rule “stable batch → Preview sync/deploy” is suspended. Current stable-batch rule is:

```text
implementation
→ local/CI/runtime gates available in repository
→ exact-head SUCCESS evidence
→ documentation closure
→ next isolated batch
```

Hosted Student/Admin/API/media/OCR/AI runtime remains `NOT YET VERIFIED`. Do not re-enable Git deployment or publish until explicit Product Owner instruction.

---

# Current Progress

| Area | Status |
|---|---|
| Stages 1–5 | VERIFIED |
| Stage6 Auth/Authorization | VERIFIED final refactor |
| Stage7 Access/Entitlements | VERIFIED |
| Stage8 Activation/Login/Recovery/Device | VERIFIED incl. Chromium |
| Stage9 Source Import | VERIFIED |
| Stage10 Media Pipeline | VERIFIED |
| OCR Foundation | VERIFIED |
| Stage11 AI Contracts | VERIFIED |
| Stage12 AI durable execution/runtime | VERIFIED backend lifecycle/runtime |
| Stage13 Curriculum Structure backend | VERIFIED |
| Stage13 Admin Curriculum Web | **VERIFIED** |
| Stage13 Content/Media/OCR Operations | **CURRENT IMPLEMENTATION** |
| Stage13 upload/history/publication linking | REQUIRED NEXT / NOT YET VERIFIED |
| Stage13 AI Operations / Question Bank / remaining Admin modules | REQUIRED / NOT YET VERIFIED |
| Stage14–20 | REQUIRED according to Product decisions |
| Stage21–29 | PLANNED engineering/release gates |
| Hosted deployment | **DEFERRED BY PRODUCT OWNER** |

**Current rule:** continue Stage13 incrementally from repository evidence. Do not reopen completed Product Review unless a genuine Business Rule conflict appears. Before Admin/Student stages close, every valuable legacy capability must map to implementation/test evidence or explicit owner-approved removal.
