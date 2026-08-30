# MASTER REBUILD ROADMAP — الوسيلة الذكية

> الخطة التنفيذية الرسمية لبناء أفضل نسخة من نفس المنتج مع الحفاظ على الفكرة والسيناريوهات والـFeature Parity، بتنفيذ جديد أقوى وأوضح وأسهل في التشغيل والصيانة.

## القواعد الحاكمة

1. نحافظ على **المنتج والسيناريوهات**، وليس على أخطاء التنفيذ القديم.
2. `alwaslh` مرجع للـBusiness Rules والـflows والميزات والمشكلات التي يجب ألا تتكرر.
3. `alwaslh-go` مرجع للمحتوى/الصور ويُدخل عبر deterministic Content Pipeline.
4. لا يوجد التزام بمطابقة Supabase schema/IDs/RLS القديمة.
5. PostgreSQL الجديدة clean-slate source of truth خلف Backend خاص.
6. كل Stage لها Definition of Done؛ لا تبدأ التالية قبل Integration Gate الحالية.
7. التوازي مسموح **داخل نفس Stage** فقط عندما تكون الحدود والعقود واضحة.
8. أي Runtime gate لم يُشغل فعليًا = `NOT YET VERIFIED`.
9. الحالات الرسمية: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`.
10. `PROJECT_HANDOFF.md` هو أول ملف لأي محادثة/مهندس جديد.
11. Correctness > Cleverness، Clarity > Complexity، Evidence > Assumptions.

## Target Architecture

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
                    └── background + AI workers
```

PostgreSQL لا تُفتح مباشرة للمتصفح.

---

# Stage 1 — Product Freeze & Feature Parity

## الهدف
تثبيت المنتج المطلوب قبل إعادة التنفيذ: Admin/Student flows، activation/login/recovery، reader/practice/quizzes/notes، notifications/statistics/achievements، Offline/PWA، exports، AI modes وقواعدها ومحتوى `alwaslh-go`.

## المصدر
`PRODUCT_FEATURE_PARITY_MATRIX.md`

## Gate
**COMPLETE / CLI PASS.**

---

# Stage 2 — Brand Identity

Owned identity مبنية على الشعار الأصلي teal/open-book: logo system، PWA/favicon assets، palette، Arabic typography، design tokens وaccessibility rules.

## المصدر
`packages/brand/`

## Gate
**COMPLETE / CLI PASS.**

---

# Stage 3 — UX Architecture

Admin IA: Overview → Content → Assessment & AI → Students & Access → Communication → Reports → System.

Student IA: Home → Lessons → Quizzes → Notes → More.

المخرجات: critical flows، legacy-to-target mapping، loading/error/offline/permission states، responsive/accessibility contracts، wireframes.

## المصدر
`docs/ux/`

## Gate
**COMPLETE / CLI PASS.**

---

# Stage 4 — Clean-Slate PostgreSQL Data Platform

Self-hosted PostgreSQL في نفس بيئة الـBackend، خاصة وغير مكشوفة للمتصفح. النموذج يغطي Identity، Curriculum، Access، Learning، durable AI jobs وOffline revisions/tombstones.

ثوابت: UUID ownership، 6/7-digit codes، explicit order، normalized entitlements، persisted practice order، cross-record constraints، client score غير موثوق.

## Gate
**COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

Actual-host tuning/network/load/backup-restore تبقى Release/Ops gates لاحقة.

---

# Stage 5 — Engineering Foundation

Real `apps/api`، strict TypeScript، PostgreSQL pool/transactions، migration runner، env validation، logging/error contract، test harness، Admin/Student isolated builds وCI. Production API build output يطابق `npm start` ولا يشحن test tree.

## Gate
**COMPLETE / CLI + RUNTIME PASS.**

---

# Stage 6 — Authentication & Authorization

- salted scrypt credentials؛
- opaque server sessions + HttpOnly cookie؛
- Student/Admin role isolation؛
- mutation Origin protection؛
- DB-backed login lockout؛
- recovery = one-time reset, never reveal؛
- explicit first-admin CLI bootstrap only.

## Gate
**COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

---

# Stage 7 — Access Codes & Entitlements

Full access: exactly 6 digits، crypto generation، duration/lifecycle، transactional single-use redemption، profile-bound idempotency، real renewal benefit.

Class access: exactly 7 digits، atomic redemption، class entitlement، no-waste when active Full access already covers Student.

Admin revoke/audit + concurrent race tests mandatory.

## Gate
**COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

---

# Stage 8 — Student Activation & Account Flow

## Product rule
First activation uses a **6-digit Full Access Code**. After success, the same normalized code becomes the Student returning **account identifier**, not an authentication secret.

```text
6-digit account identifier + password → server session
```

No fingerprint/device credential. Recovery resets password and never reveals it.

## Atomic backend flow

```text
validate + lock Full Code
→ Student profile
→ scrypt credential
→ all-content entitlement
→ bind/redeem code
→ redemption/idempotency
→ access/auth audit
→ COMMIT
→ canonical Auth login/session
```

## Integrated Student flow

- Arabic/Persian digit normalization؛
- invalid/expired/revoked/used code handling؛
- rollback on partial failure؛
- idempotent replay؛
- concurrent same-code race creates one account only؛
- returning login/logout؛
- reset-only recovery؛
- no browser password/code persistence؛
- loading/error/offline states؛
- RTL/mobile responsive UI.

Canonical API contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

Integrated source: `rebuild/student-activation-integration` / PR #7.

Verified code baseline: `829af003156f4c57ceea1cba2ebca12a4309177a`.

GitHub Actions run: `33292329935`.

Browser gate uses clean PostgreSQL 16 + built API + built Student Web + same-origin proxy + Chromium and verifies activation → entitlement → logout → returning login → recovery reset → old-password rejection → new-password login.

## Gate
**COMPLETE / CLI + PostgreSQL RUNTIME + Chromium BROWSER E2E PASS.**

---

# Stage 9 — Content Model & Deterministic `alwaslh-go` Import

## الهدف
تحويل curriculum/books/government exams من source repository إلى canonical content يمكن الوثوق بترتيبه واكتماله ومصدره.

```text
alwaslh-go
→ complete repository discovery/inventory
→ parse manifests/helper files/names
→ canonical taxonomy
→ normalize class/subject/book/exam/year/page
→ deterministic ordering
→ checksum + duplicate detection
→ canonical import manifest
→ repeatable/idempotent import batches
→ integrity report
```

## Required output

- real source inventory؛
- source taxonomy + parsing contract؛
- deterministic asset/page ordering؛
- checksums and duplicate detection؛
- expected/imported/missing/duplicate/order-error reporting؛
- provenance retained for every imported asset؛
- repeat-import determinism/idempotency or explicit reconciliation behavior؛
- CLI/runtime verification.

Raw repository never ships in frontend. Async completion order must never define page order.

## Gate
**CURRENT / IN PROGRESS.**

Do not start Stage 10 until Stage 9 import gate is green.

---

# Stage 10 — Media Pipeline

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

Requirements: bounded concurrency، abort/retry، no completion-order reordering، readable educational text، deterministic storage keys/checksums، reliable/self-hosted PDF worker strategy.

---

# Stage 11 — Gemini Prompt/Output Contracts

Versioned PromptRegistry لكل preserved mode: summaries/extraction/questions/MCQ/TF/mixed/image/version/regenerate/exam replica/exact/bulk.

```text
input schema
→ prompt version
→ structured output schema
→ semantic validator
→ renderer/persistence
```

Arabic/scientific/religious/source-exact rules لها golden regression tests.

---

# Stage 12 — Durable AI Execution

```text
Admin
→ API create ai_job
→ durable queue/job units
→ workers
→ Gemini project/credential scheduler
→ schema + semantic validation
→ save/review/publish
```

Support retries/backoff، 429 project cooldown، credential/project health، multiple projects/credentials، cancellation/resume، progress، prompt/model metadata، tokens/cost/latency، server-only secrets.

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

Stage 8 owns activation/login/recovery. Build post-auth learning product:
Home → classes/subjects/lessons → Reader → Summary/Practice → Notes/Saved → Quizzes/Attempts → Statistics/Achievements → Notifications → Class activation/account/help/install.

Mobile-first + reading-first.

---

# Stage 15 — Practice Engine

One deterministic shared state machine for lesson practice/quizzes. Persist session ID، stable questions، shuffled question/option order، answers، current question، completion. Resume/restart/bookmark/explanation/offline without index-identity bugs. Trusted completion is server-derived.

---

# Stage 16 — Offline / PWA

Account-scoped IndexedDB replica driven by server revisions/tombstones:

```text
revision request
→ authorized changes
→ upserts
→ tombstones/deletes
→ bounded media update
→ checkpoint after required success only
```

Student owns Service Worker. Cache shell/static/media only; never generic Auth/API responses. Add attempt outbox/idempotency/update lifecycle.

---

# Stage 17 — Notes & Saved Questions

Preserve text/image/capture/audio scenarios where valuable. Local-first may remain account-scoped. Saved questions use stable question IDs/provenance. Bound media storage; no unbounded base64.

---

# Stage 18 — Notifications

Admin audience/severity/action/publish/expiry. Student real read state/category/priority/deep-link/offline awareness. No fake unread state.

---

# Stage 19 — Statistics / Achievements

Server derives attempts/scores/awards/ranking. Browser never supplies authoritative achievement/score/rank state.

---

# Stage 20 — Export System

Preserve required PDF/Excel/quiz/code-card/history/image exports with sanitization، Arabic-safe fonts، new brand، explicit scopes، lazy heavy libraries، large-export strategy and no silent truncation.

---

# Stage 21 — Performance Engineering

Student must not ship Admin/AI/XLSX/PDF-authoring dependencies. Measure JS size، LCP/INP/CLS، API/query latency، media bytes، cache/sync size/time، offline startup and AI/upload/export latency/memory.

---

# Stage 22 — Security Hardening

Audit/test secrets، DB networking، authorization/IDOR، activation/login rate limits، validation، uploads، storage، CSP/CORS/headers، CSRF/session behavior، dependencies، audit logs، backup access.

6-digit activation has limited entropy; real reverse-proxy/API perimeter rate limiting is mandatory before release.

---

# Stage 23 — Automated Tests & CI Expansion

Unit، DB migration/constraint/concurrency، Auth/Activation/Access integration، content/media tests، AI golden/retry tests، Practice/Offline tests، Admin/Student E2E and regression coverage for critical legacy defects.

---

# Stage 24 — Accessibility / Device QA

RTL، keyboard/focus/screen reader، 200% zoom، contrast، reduced motion، 44px touch targets، Android/iPhone/tablet/desktop، slow network/offline.

---

# Stage 25 — Initial Data / Content Load

No legacy DB migration dependency. Initialize secure Admin، canonical curriculum from `alwaslh-go`، and quiz/AI content through new contracts. Selective legacy import only when explicitly useful.

---

# Stage 26 — Staging

Fresh environment from repository only:

```text
PostgreSQL provision
→ migrations
→ app config/secrets
→ content import
→ API/workers
→ Admin
→ Student
→ full staged test suite
```

If staging cannot be reproduced, release is blocked.

---

# Stage 27 — Release Gate

Required before production:

- no unresolved/ununaccepted P0/P1؛
- real-host DB migration/connectivity/load/network checks؛
- backup restore drill؛
- Auth/authorization/activation/access concurrency pass؛
- Admin/Student E2E؛
- Offline/PWA pass؛
- AI golden/retry/failover pass؛
- performance/accessibility/security budgets؛
- Feature Parity evidence.

---

# Stage 28 — Production Cutover

```text
provision
→ backup/checkpoint
→ migrations
→ content load
→ backend/workers deploy
→ Admin deploy
→ Student deploy
→ smoke tests
```

Rollback prepared/tested before cutover.

---

# Stage 29 — Monitoring & Operations

Monitor login/activation/code failures، authorization، DB pool/query/locks، backups، AI quota/errors/jobs، sync، JS/runtime، media/storage growth and PWA update health. Maintain incident/runbook documentation.

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
| 8 Student Activation & Account Flow | COMPLETE / CLI + PostgreSQL RUNTIME + Chromium BROWSER E2E PASS |
| 9 Content Model & `alwaslh-go` Import | CURRENT / IN PROGRESS |
| 10–29 | NOT STARTED / later gates |

Latest fully verified Stage 8 code baseline: `rebuild/student-activation-integration` commit `829af003156f4c57ceea1cba2ebca12a4309177a`, GitHub Actions run `33292329935`, all Stages 1–8 including Chromium browser E2E **SUCCESS**.

**Stage 9 is now active. Do not start Stage 10 until the deterministic content-import gate is green.**
