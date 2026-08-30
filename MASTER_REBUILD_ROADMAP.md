# MASTER REBUILD ROADMAP — الوسيلة الذكية

> الخطة التنفيذية الرسمية لبناء أفضل نسخة من نفس المنتج مع الحفاظ على الفكرة والسيناريوهات والـFeature Parity، بتنفيذ جديد أقوى وأوضح وأسهل في التشغيل والصيانة.

## القواعد الحاكمة

1. نحافظ على **المنتج والسيناريوهات**، وليس على أخطاء التنفيذ القديم.
2. `alwaslh` مرجع للـBusiness Rules والـflows والميزات والمشكلات التي يجب ألا تتكرر.
3. `alwaslh-go` مرجع للمحتوى/الصور ويُدخل عبر deterministic Content Pipeline.
4. لا يوجد التزام بمطابقة Supabase schema/IDs/RLS القديمة.
5. PostgreSQL clean-slate source of truth خلف Backend خاص.
6. كل Stage لها Definition of Done؛ لا تبدأ التالية قبل Integration Gate الحالية.
7. التوازي مسموح **داخل نفس Stage** فقط عندما تكون الحدود والعقود واضحة.
8. أي Runtime gate لم يُشغل فعليًا = `NOT YET VERIFIED`.
9. الحالات الرسمية: `DESIGN PASS` / `CLI PASS` / `RUNTIME PASS` / `RELEASE PASS`.
10. `PROJECT_HANDOFF.md` هو أول ملف لأي محادثة/مهندس جديد.
11. Correctness > Cleverness، Clarity > Complexity، Evidence > Assumptions.

## Target Architecture

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

تثبيت Admin/Student flows، activation/login/recovery، reader/practice/quizzes/notes، notifications/statistics/achievements، Offline/PWA، exports، AI modes وقواعدها ومحتوى `alwaslh-go`.

**Gate: COMPLETE / CLI PASS.**

# Stage 2 — Brand Identity

Owned teal/open-book identity: logo/PWA assets، palette، Arabic typography، tokens وaccessibility rules.

**Gate: COMPLETE / CLI PASS.**

# Stage 3 — UX Architecture

Admin IA + Student IA + critical flows + loading/error/offline/permission states + responsive/accessibility contracts + wireframes.

**Gate: COMPLETE / CLI PASS.**

# Stage 4 — Clean-Slate PostgreSQL Data Platform

Self-hosted private PostgreSQL behind Backend. Identity/Curriculum/Access/Learning/AI/Sync relations constrained and migration-owned.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

# Stage 5 — Engineering Foundation

Real `apps/api`، strict TypeScript، bounded PostgreSQL pool/transactions، migration runner، env validation، logging/error contract، tests، isolated Admin/Student builds وCI.

**Gate: COMPLETE / CLI + RUNTIME PASS.**

# Stage 6 — Authentication & Authorization

scrypt credentials، opaque server sessions + HttpOnly cookie، Student/Admin isolation، Origin protection، DB lockout، reset-only recovery، explicit first-admin CLI bootstrap.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

# Stage 7 — Access Codes & Entitlements

6-digit Full / 7-digit Class، crypto generation، transactional row-locked redemption، profile-bound idempotency، renewal benefit، no-waste Class redemption، revoke/audit، concurrency tests.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME PASS.**

# Stage 8 — Student Activation & Account Flow

First activation uses 6-digit Full Code. After success the normalized code becomes returning account identifier, not authentication secret. Password remains required. Atomic profile/credential/entitlement/redemption/audit flow + returning login/logout + recovery + Student activation UI.

Canonical API contract: `docs/api/STUDENT_ACTIVATION_CONTRACT.md`.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME + Chromium BROWSER E2E PASS.**

# Stage 9 — Content Model & Deterministic `alwaslh-go` Import

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

Evidence:
- code commit `30d12d24be93bf306a9da5fffcfb45ea9317a186`;
- dedicated run `33294631418` SUCCESS؛
- full regression run `33294631419` SUCCESS.

**Gate: COMPLETE / CLI + PostgreSQL RUNTIME PASS at code baseline. Documentation-head re-verification is the final closure check before Stage 10 implementation starts.**

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

Requirements:
- bounded concurrency؛
- abort/retry؛
- no completion-order reordering؛
- readable educational text before aggressive compression؛
- deterministic storage keys/checksums؛
- reliable/self-hosted PDF worker strategy؛
- Stage 9 source provenance/order survives processing؛
- object/media storage runtime verified, not assumed.

**Gate: NEXT after Stage 9 documentation-head CI is green.**

---

# Stage 11 — Gemini Prompt/Output Contracts

Versioned PromptRegistry لكل preserved mode: summaries/extraction/questions/MCQ/TF/mixed/image/version/regenerate/exam replica/exact/bulk.

```text
input schema → prompt version → structured output schema → semantic validator → persistence/rendering
```

Arabic/scientific/religious/source-exact rules require golden regression tests.

# Stage 12 — Durable AI Execution

Durable `ai_job`/units + workers + Gemini project/credential scheduler + retries/backoff + 429 project cooldown + health/failover + cancellation/resume + progress + prompt/model/tokens/cost/latency metadata + server-only secrets.

# Stage 13 — Admin Product

Functional order: auth/shell → Overview → Classes/Subjects → Lessons → Upload/Processing → AI Operations → Quiz Builder → Students → Full Codes → Class Codes → Notifications → Reports/Exports → Settings/Security.

# Stage 14 — Student Learning Product

Post-auth product: Home → classes/subjects/lessons → Reader → Summary/Practice → Notes/Saved → Quizzes/Attempts → Statistics/Achievements → Notifications → Class activation/account/help/install. Mobile-first + reading-first.

# Stage 15 — Practice Engine

One deterministic shared state machine. Persist stable questions/options/order/answers/current/completion. Resume/restart/bookmark/explanation/offline without index-identity bugs. Trusted completion server-derived.

# Stage 16 — Offline / PWA

Account-scoped IndexedDB replica driven by revisions/tombstones/outbox. Student owns SW. Cache shell/static/media only, never generic Auth/API responses. Bounded media/cache lifecycle and attempt idempotency.

# Stage 17 — Notes & Saved Questions

Preserve text/image/capture/audio where valuable. Account-scoped local-first is acceptable. Stable question provenance, bounded media, no unbounded base64.

# Stage 18 — Notifications

Admin audience/severity/action/publish/expiry. Student real read state/category/priority/deep-link/offline awareness. No fake unread state.

# Stage 19 — Statistics / Achievements

Server derives attempts/scores/awards/ranking. Browser never supplies authoritative score/achievement/rank state.

# Stage 20 — Export System

Required PDF/Excel/quiz/code-card/history/image exports with sanitization، Arabic-safe fonts، new brand، explicit scopes، lazy heavy libraries، large-export strategy and no silent truncation.

# Stage 21 — Performance Engineering

Measure/enforce Student bundle isolation، JS size، LCP/INP/CLS، API/query latency، media bytes، cache/sync size/time، offline startup and AI/upload/export latency/memory.

# Stage 22 — Security Hardening

Secrets، DB networking، authorization/IDOR، activation/login perimeter rate limits، validation، uploads/storage، CSP/CORS/headers، CSRF/session، dependencies، audit logs، backup access.

# Stage 23 — Automated Tests & CI Expansion

Unit، DB migrations/constraints/concurrency، Auth/Activation/Access integration، content/media، AI golden/retry، Practice/Offline، Admin/Student E2E and critical legacy regression coverage.

# Stage 24 — Accessibility / Device QA

RTL، keyboard/focus/screen reader، 200% zoom، contrast، reduced motion، 44px targets، Android/iPhone/tablet/desktop، slow network/offline.

# Stage 25 — Initial Data / Content Load

Secure Admin initialization، canonical curriculum from `alwaslh-go`، quiz/AI content through new contracts. No legacy DB migration dependency.

# Stage 26 — Staging

Fresh environment reproducible from repository: PostgreSQL → migrations → config/secrets → content import → API/workers → Admin → Student → full staged tests.

# Stage 27 — Release Gate

No unresolved/unaccepted P0/P1، real-host DB/network/load، backup restore drill، Auth/authorization/access concurrency، Admin/Student E2E، Offline/PWA، AI golden/retry/failover، performance/accessibility/security budgets and parity evidence.

# Stage 28 — Production Cutover

Provision → backup/checkpoint → migrations → content load → backend/workers → Admin → Student → smoke tests. Rollback tested/prepared.

# Stage 29 — Monitoring & Operations

Monitor login/activation/code failures، authorization، DB pool/query/locks، backups، AI quota/errors/jobs، sync، JS/runtime، media/storage growth and PWA update health. Maintain runbooks/incidents.

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
| 9 Content Model & `alwaslh-go` Import | COMPLETE / CLI + PostgreSQL RUNTIME PASS; final docs-head CI pending |
| 10 Media Pipeline | NEXT; do not start until final Stage 9 closure CI is green |
| 11–29 | NOT STARTED / later gates |

**Current rule:** do not implement Stage 10 until both the Stage 9 dedicated workflow and full regression workflow pass on the final Stage 9 documentation head.
