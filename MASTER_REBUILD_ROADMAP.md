# MASTER REBUILD ROADMAP — الوسيلة الذكية

> الخطة التنفيذية الرسمية لبناء أفضل نسخة من نفس المنتج مع الحفاظ على الفكرة والسيناريوهات والـFeature Parity، لكن بتنفيذ جديد أقوى وأوضح وأسهل في التشغيل والصيانة.

## القواعد الحاكمة

1. نحافظ على **المنتج والسيناريوهات**، وليس على أخطاء التنفيذ القديم.
2. `alwaslh` مرجع للفكرة والـflows والميزات والمشكلات التي يجب ألا تتكرر.
3. `alwaslh-go` مرجع للمحتوى/الصور ويُدخل عبر Content Pipeline.
4. لا يوجد التزام بمطابقة قاعدة Supabase القديمة أو IDs القديمة أو RLS القديمة.
5. PostgreSQL الجديدة هي clean-slate source of truth.
6. كل مرحلة لها Definition of Done ولا نقفز للمرحلة التالية قبل إغلاقها.
7. أي Runtime gate لم يُشغل فعليًا يبقى `NOT YET VERIFIED`.
8. Correctness > Cleverness، وClarity > Complexity.

---

# Target Architecture

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

Runtime:

```text
Admin Web ──┐
            ├── Backend API ── PostgreSQL (same hosting, private)
Student PWA ┘       │
                    ├── media/object storage
                    └── background + AI workers
```

PostgreSQL لا تُفتح مباشرة للمتصفح.

---

# Stage 1 — Product Freeze & Feature Parity

## الهدف
تثبيت المنتج الذي سنبنيه قبل إعادة التنفيذ.

## يشمل
- Admin features.
- Student features.
- activation/login/recovery scenarios.
- lessons/reader/questions/quizzes/notes/saved questions.
- statistics/achievements/notifications.
- Offline/PWA.
- exports.
- كل AI generation modes وقواعدها.
- محتوى `alwaslh-go` المطلوب.

## المصدر
`PRODUCT_FEATURE_PARITY_MATRIX.md`

## Gate
**COMPLETE.**

---

# Stage 2 — Brand Identity

## الهدف
بناء هوية مملوكة للمنتج انطلاقًا من الشعار الأول teal/open-book.

## المخرجات
- Primary logo.
- mark.
- horizontal/inverse/monochrome variants.
- favicon/PWA icons.
- palette.
- Arabic typography.
- design tokens.
- iconography/imagery/accessibility rules.

## المصدر
`packages/brand/`

## Gate
**COMPLETE / PASS.**

---

# Stage 3 — UX Architecture

## Admin IA

```text
Overview
Content
  Classes & Subjects
  Lessons
  Upload & Processing
Assessment & AI
  Quizzes
  AI Operations
Students & Access
  Students
  Full Access Codes
  Class Codes
Communication
  Notifications
Reports
  Export History
System
  Settings
  Security
```

## Student IA

```text
Home
Lessons
Quizzes
Notes
More
```

More يحتوي الإحصائيات/الإنجازات/الإشعارات/التفعيل/الحساب/التثبيت/المساعدة.

## المخرجات
- IA.
- critical flows.
- legacy-to-target mapping.
- loading/error/offline/permission states.
- responsive/accessibility contracts.
- low-fidelity wireframes.

## المصدر
`docs/ux/`

## Gate
**COMPLETE / PASS.**

---

# Stage 4 — Clean-Slate PostgreSQL Data Platform

## القرار

**PostgreSQL ذاتية الاستضافة في نفس بيئة استضافة الـBackend.**

Supabase ليست Target Platform. لا نطابق schema أو IDs أو RLS القديمة.

## الحدود

```text
Browser -> Backend API -> PostgreSQL
```

لا يوجد browser -> database.

## النموذج الأساسي

### Identity
`profiles`

### Curriculum
`classes`, `subjects`, `subject_class_links`, `lessons`, `lesson_assets`

### Access
`full_access_codes`, `class_access_codes`, `access_redemptions`, `student_entitlements`

### Learning
`quizzes`, `quiz_lessons`, `quiz_versions`, `questions`, `question_options`, `practice_sessions`, `practice_session_questions`, `practice_session_options`, `practice_answers`, `quiz_attempts`, `saved_questions`, `achievement_definitions`, `student_achievements`, `notifications`, `notification_reads`

### AI
`ai_jobs`, `ai_job_units`, `ai_outputs`

### Offline sync
`content_revisions`, `content_tombstones`, `sync_checkpoints`

## قواعد ثابتة
- ownership = profile UUID.
- full code = 6 digits.
- class code = 7 digits.
- redemption transactional/idempotent.
- entitlement normalized.
- page/order explicit.
- stable question IDs.
- persisted question/option shuffle order.
- selected option must belong to the same question.
- score is not trusted from browser.
- deletions produce revision/tombstone.
- AI jobs durable.

## Operations
- owner/migrator/app/readonly DB roles.
- DB private/no public 5432.
- version-controlled SQL migrations.
- off-host backups.
- restore drills.

## المصدر
- `DATABASE_PLATFORM_ARCHITECTURE.md`
- `database/migrations/`
- `database/SCHEMA.md`
- `database/BACKUP_RESTORE.md`
- `database/tests/schema_smoke.sql`
- `database/DATABASE_STAGE_DOD.md`

## Gate
**DESIGN/SCHEMA BASELINE COMPLETE / PASS.**

Real PostgreSQL execution remains a required pre-release runtime gate.

---

# Stage 5 — Engineering Foundation

## الهدف
إنشاء workspace قابل للبناء والاختبار قبل features.

## العمل
- root workspace/monorepo configuration.
- strict TypeScript.
- reproducible dependency versions/lockfile.
- real build scripts.
- `apps/api` backend runtime.
- DB driver + bounded pool.
- migration runner.
- environment schema validation.
- structured logging.
- common API error/result contract.
- test harness.
- lint/typecheck/unit/build scripts fail-fast.
- CI.

## Gate
- clean install works.
- Admin build passes.
- Student build passes.
- API typecheck/test passes.
- clean PostgreSQL migrations + smoke tests pass when DB runtime is available.

---

# Stage 6 — Authentication & Authorization

## Student
- secure account/session model.
- 6-digit activation remains business entry flow.
- no plaintext passwords.
- no reversible original-password retrieval.
- recovery = reset, not reveal.
- fingerprint/device ID is not credential proof.

## Admin
- explicit admin identity/role.
- no default admin credential.
- sensitive actions can require re-auth.

## Authorization
- backend policies/services own authorization.
- database runtime role is least privilege.
- Student A cannot read/update Student B.
- protected content requires entitlement.

## Tests
anonymous/studentA/studentB/admin matrices at API level.

---

# Stage 7 — Entitlement & Activation Service

## Full access
- exactly 6 digits.
- secure generation.
- atomic single-use redemption/lifecycle.
- search/pagination/import/export admin workflows preserved.

## Class access
- exactly 7 digits.
- atomic redemption.
- expiry/status checks.
- renewal updates/extends entitlement intentionally.

## Transaction

```text
validate
-> lock code
-> check lifecycle
-> create/update entitlement
-> bind redemption
-> commit
```

Concurrency/idempotency tests are mandatory.

---

# Stage 8 — Content Model & `alwaslh-go` Import

## الهدف
تحويل 5,000+ curriculum/exam images إلى canonical content.

```text
alwaslh-go
-> discover
-> parse manifests/names
-> normalize grade/subject/book/exam/year/page
-> deterministic ordering
-> checksum/dedupe
-> output import manifest
```

Import must report expected/imported/missing/duplicate/order errors.

---

# Stage 9 — Media Pipeline

```text
upload/source
-> validate
-> PDF page extraction if needed
-> stable ordering
-> optimize display variant
-> thumbnail
-> AI variant
-> storage
-> metadata transaction
```

Requirements:
- bounded concurrency;
- abort/retry;
- no completion-order reordering;
- readable educational text after compression;
- deterministic storage keys/checksums.

---

# Stage 10 — Gemini Prompt/Output Contracts

Versioned PromptRegistry for all preserved modes, including:
- summaries;
- extraction;
- lesson questions;
- MCQ/TF/mixed;
- image questions;
- quiz versions;
- regenerate;
- replica/exact-exam flows;
- bulk generation.

Each contract has:
`input schema -> prompt version -> output schema -> semantic validator -> renderer`.

Rules for Arabic/scientific/religious/source-exact content remain explicit and regression-tested.

---

# Stage 11 — Durable AI Execution

```text
Admin
-> API create ai_job
-> worker claims units
-> Gemini project/credential scheduler
-> validate
-> save output
-> review/publish
```

Support:
- queue/job state;
- retries/backoff;
- 429 project cooldown;
- credential health;
- multiple Gemini projects/credentials;
- cancellation;
- progress;
- prompt/model/version metadata;
- no secret values in DB/UI logs.

---

# Stage 12 — Admin Product

Implement in functional order:
1. auth/shell;
2. Overview;
3. Classes & Subjects;
4. Lessons;
5. Upload/Processing;
6. AI Operations;
7. Quiz Builder;
8. Students;
9. Full Access Codes;
10. Class Codes;
11. Notifications;
12. Reports/Export History;
13. Settings/Security.

Admin is data-dense and operational, not decorative dashboard cards.

---

# Stage 13 — Student Product

1. activation/login/recovery;
2. Home;
3. classes/subjects/lessons;
4. Reader;
5. Summary/Practice;
6. Notes/Saved;
7. Quizzes;
8. Attempts;
9. Statistics/Achievements;
10. Notifications;
11. Class activation;
12. Account/Help/Install.

Mobile-first and reading-first.

---

# Stage 14 — Practice Engine

One shared state machine for lesson practice and quizzes.

Persist:
- session ID;
- stable questions;
- shuffled question order;
- shuffled option order;
- answer per question;
- current question;
- completion.

Support resume/restart/bookmark/explanation/offline without index-based identity bugs.

---

# Stage 15 — Offline / PWA

Server canonical, account-scoped IndexedDB replica.

```text
revision request
-> authorized changes
-> upserts
-> tombstones/deletes
-> bounded media update
-> checkpoint only after required success
```

Service worker caches app shell/static/media only; never DB/Auth/API responses as generic images.

---

# Stage 16 — Notes & Saved Questions

Preserve text/image/capture/audio note scenarios. Current local-first notes can remain account-scoped local data unless product decision later adds cloud sync.

Saved questions use real `question_id`, not array index/student code.

---

# Stage 17 — Notifications

Admin: audience/severity/action/publish/expiry.  
Student: read state, category/priority, deep link, offline awareness.

---

# Stage 18 — Statistics / Achievements

Server derives attempts/scores/awards/ranking. Browser displays results and never supplies trusted achievement/score state.

---

# Stage 19 — Export System

Preserve required PDF/Excel/quiz/code-card/history/image exports with:
- sanitization;
- Arabic-safe fonts;
- new brand assets;
- explicit scopes/options;
- lazy loading of heavy libraries;
- no silent `first 2 images` truncation.

---

# Stage 20 — Performance Engineering

Student must not ship Admin/AI/XLSX/PDF authoring dependencies. Admin heavy tools lazy-load.

Measure:
- JS size;
- LCP/INP/CLS;
- API/query latency;
- image bytes;
- IndexedDB/media cache size;
- sync bytes/time;
- offline startup;
- AI/upload/export latency/memory.

---

# Stage 21 — Security Hardening

Audit:
- secrets;
- DB networking;
- authorization;
- rate limits;
- validation;
- file upload;
- storage access;
- CSP/CORS/headers;
- dependencies;
- admin audit events;
- backup access.

---

# Stage 22 — Automated Tests

### Unit
validation, entitlement, PracticeEngine, scoring, AI validators, content ordering, sync diff.

### Database
migrations, constraints, concurrent code redemption, transaction/idempotency.

### Integration
Auth, activation, recovery, content, AI retries, media processing.

### E2E Admin/Student
all critical flows and error/offline variants.

---

# Stage 23 — Accessibility / Device QA

RTL, keyboard, focus, screen reader, 200% zoom, contrast, reduced motion, Android/iPhone/tablet/desktop, slow network/offline.

---

# Stage 24 — Initial Data / Content Load

Because old DB data is not required, production initialization focuses on:
- admin bootstrap through secure provisioning;
- canonical curriculum/content import from `alwaslh-go`;
- quiz/AI content generated or imported through the new contracts;
- optional selective imports only when explicitly useful.

No legacy DB migration is a release dependency.

---

# Stage 25 — Staging

Fresh environment from repository only:

```text
PostgreSQL provision
-> migrations
-> app config
-> content import
-> Admin
-> Student
-> workers/AI
-> test suite
```

If staging cannot be reproduced, release is blocked.

---

# Stage 26 — Release Gate

Required before production:
- no P0/P1 blocker;
- DB migrations/smoke pass on real PostgreSQL;
- backup restore verified;
- Auth/authorization tests pass;
- code concurrency/idempotency pass;
- Admin/Student E2E pass;
- Offline pass;
- AI golden tests pass;
- performance/accessibility budgets pass;
- Feature Parity implementation coverage accepted.

---

# Stage 27 — Production Cutover

```text
provision
-> backup/checkpoint
-> migrations
-> content load
-> backend/workers deploy
-> Admin deploy
-> Student deploy
-> smoke tests
```

Rollback procedure is prepared before cutover.

---

# Stage 28 — Monitoring & Operations

Monitor:
- login/activation failures;
- code redemption;
- authorization errors;
- DB connection/query/lock health;
- backups;
- AI 429/503/job failures;
- sync failures;
- JS/runtime errors;
- media/storage growth;
- PWA update failures.

---

# Current Progress

| Stage | Status |
|---|---|
| 1 Product Freeze | COMPLETE |
| 2 Brand Identity | COMPLETE / PASS |
| 3 UX Architecture | COMPLETE / PASS |
| 4 PostgreSQL Data Platform | COMPLETE / PASS design/schema baseline; runtime PostgreSQL verification pending pre-release |
| 5 Engineering Foundation | NEXT |
| 6–28 | NOT STARTED / later gates |

We do not move to Stage 6 before Stage 5 is closed.
