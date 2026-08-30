# MASTER REBUILD ROADMAP — الوسيلة الذكية

> الخطة التنفيذية الرسمية لبناء أفضل نسخة من نفس المنتج مع الحفاظ على الفكرة والسيناريوهات والـFeature Parity، لكن بتنفيذ جديد أقوى وأوضح وأسهل في التشغيل والصيانة.

## القواعد الحاكمة

1. نحافظ على **المنتج والسيناريوهات**، وليس على أخطاء التنفيذ القديم.
2. `alwaslh` مرجع للفكرة والـflows والميزات والمشكلات التي يجب ألا تتكرر.
3. `alwaslh-go` مرجع للمحتوى/الصور ويُدخل عبر Content Pipeline.
4. لا يوجد التزام بمطابقة قاعدة Supabase القديمة أو IDs/RLS القديمة.
5. PostgreSQL الجديدة هي clean-slate source of truth وتعمل خلف Backend خاص.
6. كل مرحلة لها Definition of Done ولا نقفز للمرحلة التالية قبل إغلاقها.
7. التوازي مسموح **داخل نفس المرحلة** عندما تكون الحدود والعقود واضحة، لكن لا نبدأ المرحلة التالية قبل Integration Gate للمرحلة الحالية.
8. أي Runtime gate لم يُشغل فعليًا يبقى `NOT YET VERIFIED`.
9. الحالات الرسمية: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`.
10. `PROJECT_HANDOFF.md` هو أول ملف لأي محادثة/مهندس جديد.
11. Correctness > Cleverness، وClarity > Complexity، وEvidence > Assumptions.

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

يشمل Admin/Student flows، activation/login/recovery، الدروس والقارئ والاختبارات والملاحظات، الإحصائيات/الإنجازات/الإشعارات، Offline/PWA، exports، كل AI modes وقواعدها، ومحتوى `alwaslh-go` المطلوب.

## المصدر
`PRODUCT_FEATURE_PARITY_MATRIX.md`

## Gate
**COMPLETE / CLI PASS.**

---

# Stage 2 — Brand Identity

Owned identity مبنية على الشعار الأصلي teal/open-book: logo system، favicon/PWA icons، palette، Arabic typography، design tokens، iconography/accessibility rules.

## المصدر
`packages/brand/`

## Gate
**COMPLETE / CLI PASS.**

---

# Stage 3 — UX Architecture

## Admin IA
Overview → Content → Assessment & AI → Students & Access → Communication → Reports → System.

## Student IA
Home → Lessons → Quizzes → Notes → More.

المخرجات: IA، critical flows، legacy-to-target mapping، states، responsive/accessibility contracts، low-fidelity wireframes.

## المصدر
`docs/ux/`

## Gate
**COMPLETE / CLI PASS.**

---

# Stage 4 — Clean-Slate PostgreSQL Data Platform

## القرار
**PostgreSQL ذاتية الاستضافة في نفس بيئة الـBackend**، خاصة وغير مكشوفة للمتصفح. Supabase ليست Target Platform ولا نطابق schema/IDs/RLS القديمة.

النموذج الأساسي يغطي Identity، Curriculum، Access، Learning، AI durable jobs وOffline revisions/tombstones.

قواعد ثابتة: UUID ownership، 6/7-digit codes، explicit order، normalized entitlements، persisted practice order، cross-record constraints، client score غير موثوق، durable AI jobs.

## Gate
**COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

Actual-host tuning/network/load/backup restore تبقى Release/Ops gates لاحقة.

---

# Stage 5 — Engineering Foundation

Real `apps/api`، strict TypeScript، PostgreSQL pool/transactions، migration runner، env validation، logging/error contract، unit harness، Admin/Student isolated builds وCI.

## Gate
**COMPLETE / CLI + RUNTIME PASS.**

---

# Stage 6 — Authentication & Authorization

- salted scrypt credentials؛
- opaque server sessions؛
- HttpOnly cookies؛
- Student/Admin role isolation؛
- mutation Origin protection؛
- DB-backed login lockout؛
- recovery = one-time reset, never reveal؛
- explicit first-admin CLI bootstrap only.

## Gate
**COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

---

# Stage 7 — Access Codes & Entitlements

## Full access
- exactly 6 digits؛
- cryptographically secure generation؛
- duration/lifecycle؛
- transactional single-use redemption؛
- profile-bound idempotency؛
- renewal extends real benefit.

## Class access
- exactly 7 digits؛
- atomic redemption؛
- class entitlement؛
- no-waste rule when active Full access already covers student.

Admin revoke/audit and concurrent races are required.

## Gate
**COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

---

# Stage 8 — Student Activation & Account Flow

## Product rule
First activation uses a **6-digit Full Access code**. After successful activation, the same normalized code becomes the Student's returning **account identifier**, not an authentication secret.

Returning login:

```text
6-digit account identifier + password -> server session
```

No fingerprint/device credential. Recovery resets password and never reveals it.

## Backend transaction

```text
validate/lock Full code
-> create Student profile
-> create scrypt credential
-> create all-content entitlement
-> mark/bind code redeemed
-> create redemption/idempotency
-> access/auth audit
-> COMMIT
-> canonical Auth login/session
```

Required behavior:
- Arabic/Persian digit normalization؛
- invalid/expired/revoked/used code handling؛
- rollback on any partial failure؛
- activation idempotent replay؛
- concurrent same-code race creates one account only؛
- returning login؛
- logout/recovery states؛
- no password storage in browser.

Canonical API contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

## Parallel workstreams

```text
rebuild/student-activation-backend
rebuild/student-activation-ui
```

Backend is already **CLI/RUNTIME PASS**. Stage 8 is not COMPLETE until UI + integrated browser/API E2E are green.

## Gate
**IN PROGRESS — Backend PASS; UI + integrated E2E pending.**

---

# Stage 9 — Content Model & Deterministic `alwaslh-go` Import

حوّل curriculum/exam source إلى canonical content عبر:

```text
alwaslh-go
-> full discovery/inventory
-> parse manifests/names
-> normalize grade/subject/book/exam/year/page
-> deterministic ordering
-> checksum/dedupe
-> canonical import manifest
-> transactional/import batches
```

Must report expected/imported/missing/duplicate/order errors. Raw repository never ships in frontend.

---

# Stage 10 — Media Pipeline

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

Requirements: bounded concurrency، abort/retry، no completion-order reordering، readable educational text، deterministic keys/checksums، self-hosted/reliable PDF worker strategy.

---

# Stage 11 — Gemini Prompt/Output Contracts

Versioned PromptRegistry لكل preserved mode: summaries/extraction/questions/MCQ/TF/mixed/image/version/regenerate/exam replica/exact/bulk.

كل contract:

```text
input schema
-> prompt version
-> structured output schema
-> semantic validator
-> renderer/persistence
```

Arabic/scientific/religious/source-exact rules لها golden regression tests.

---

# Stage 12 — Durable AI Execution

```text
Admin
-> API create ai_job
-> durable queue/job units
-> workers
-> Gemini project/credential scheduler
-> structured + semantic validation
-> save/review/publish
```

Support retries/backoff، 429 project cooldown، credential/project health، multiple projects/credentials، cancellation/resume، progress، prompt/model metadata، tokens/cost/latency، secrets server-only.

---

# Stage 13 — Admin Product

Functional order:
1. auth/shell؛
2. Overview؛
3. Classes & Subjects؛
4. Lessons؛
5. Upload/Processing؛
6. AI Operations؛
7. Quiz Builder؛
8. Students؛
9. Full Access Codes؛
10. Class Codes؛
11. Notifications؛
12. Reports/Exports؛
13. Settings/Security.

Admin data-dense/operational، لا decorative dashboard spam.

---

# Stage 14 — Student Learning Product

Stage 8 owns activation/login/recovery. This stage builds the post-auth learning product:
1. Home؛
2. classes/subjects/lessons؛
3. Reader؛
4. Summary/Practice؛
5. Notes/Saved؛
6. Quizzes/Attempts؛
7. Statistics/Achievements؛
8. Notifications؛
9. Class activation/account/help/install.

Mobile-first + reading-first.

---

# Stage 15 — Practice Engine

One shared deterministic state machine for lesson practice and quizzes. Persist session ID, stable questions, shuffled question/option order, answers, current question and completion. Support resume/restart/bookmark/explanation/offline without index identity bugs. Trusted completion is server-derived.

---

# Stage 16 — Offline / PWA

Server canonical + account-scoped IndexedDB replica:

```text
revision request
-> authorized changes
-> upserts
-> tombstones/deletes
-> bounded media update
-> checkpoint only after required success
```

Student owns Service Worker. Cache app shell/static/media only; no generic Auth/API caching. Add attempt outbox/idempotency and update lifecycle verification.

---

# Stage 17 — Notes & Saved Questions

Preserve text/image/capture/audio scenarios where still valuable. Local-first may remain account-scoped. Saved questions use real stable question IDs/provenance. Bound media storage; no unbounded base64.

---

# Stage 18 — Notifications

Admin audience/severity/action/publish/expiry; Student real read state/category/priority/deep-link/offline awareness. No fake unread state.

---

# Stage 19 — Statistics / Achievements

Server derives attempts/scores/awards/ranking; browser never supplies authoritative achievement/score/rank state.

---

# Stage 20 — Export System

Preserve required PDF/Excel/quiz/code-card/history/image exports with sanitization، Arabic-safe fonts، new brand، explicit scopes/options، lazy heavy libraries، large-export strategy and no silent truncation.

---

# Stage 21 — Performance Engineering

Student must not ship Admin/AI/XLSX/PDF-authoring dependencies. Measure bundle sizes، Core Web Vitals، API/query latency، images، cache/sync bytes، offline startup، AI/upload/export latency/memory. Optimize only from evidence.

---

# Stage 22 — Security Hardening

Audit and test secrets، DB networking، authorization/IDOR، activation/login rate limits، validation، uploads، storage، CSP/CORS/headers، CSRF/session behavior، dependencies، audit logs and backup access.

The 6-digit activation business rule has limited entropy, so real reverse-proxy/API perimeter rate limiting is a mandatory security/release gate.

---

# Stage 23 — Automated Tests & CI Expansion

Unit، DB migrations/constraints/concurrency، Auth/Activation/Access integration، content/media tests، AI golden/retry tests، Practice/Offline tests، Admin/Student E2E and regression coverage for legacy critical defects.

CI blocks deployment on failed gates.

---

# Stage 24 — Accessibility / Device QA

RTL، keyboard/focus/screen reader، 200% zoom، contrast، reduced motion، 44px touch targets، Android/iPhone/tablet/desktop، slow network/offline.

---

# Stage 25 — Initial Data / Content Load

No legacy DB migration dependency. Initialize secure Admin, canonical curriculum from `alwaslh-go`, and quiz/AI content through new contracts. Selective legacy import only if explicitly useful later.

---

# Stage 26 — Staging

Fresh environment from repository only:

```text
PostgreSQL provision
-> migrations
-> app config/secrets
-> content import
-> API/workers
-> Admin
-> Student
-> full staged test suite
```

If staging cannot be reproduced, release is blocked.

---

# Stage 27 — Release Gate

Required before production:
- P0/P1 blockers cleared/explicitly accepted؛
- real-host DB migrations + connectivity/load/network checks؛
- backup restore drill؛
- Auth/authorization/activation/access concurrency pass؛
- Admin/Student E2E؛
- Offline/PWA pass؛
- AI golden/retry/failover pass؛
- performance/accessibility/security budgets pass؛
- Feature Parity coverage evidenced.

---

# Stage 28 — Production Cutover

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

Rollback is prepared/tested before cutover.

---

# Stage 29 — Monitoring & Operations

Monitor login/activation/code failures، authorization، DB pool/query/locks، backups، AI quota/errors/jobs، sync، JS/runtime، media/storage growth and PWA updates. Maintain incident/runbook documentation.

---

# Current Progress

| Stage | Status |
|---|---|
| 1 Product Freeze | COMPLETE / CLI PASS |
| 2 Brand Identity | COMPLETE / CLI PASS |
| 3 UX Architecture | COMPLETE / CLI PASS |
| 4 PostgreSQL Data Platform | COMPLETE / CLI + RUNTIME PASS |
| 5 Engineering Foundation | COMPLETE / CLI + RUNTIME PASS |
| 6 Auth & Authorization | COMPLETE / CLI + RUNTIME PASS |
| 7 Access Codes & Entitlements | COMPLETE / CLI + RUNTIME PASS |
| 8 Student Activation & Account Flow | IN PROGRESS — Backend CLI/RUNTIME PASS; parallel UI + integrated E2E pending |
| 9–29 | NOT STARTED / later gates |

Latest verified Stage 8 Backend baseline: `rebuild/student-activation-backend` commit `a87c7f766481708e018dcaa1ae6e6643c0667fef`, GitHub Actions run `33289741640`, full Stages 1–8 backend jobs **SUCCESS**.

**Do not start Stage 9 until Stage 8 UI and integrated E2E gate are green.**
