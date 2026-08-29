# PROJECT REBUILD BLUEPRINT

> Target architecture and product plan for rebuilding **الوسيلة الذكية** as a production-grade system while preserving feature parity.
>
> This is a controlled rebuild of unsafe/entangled boundaries, not a feature reset.

## 1. Product Principles

1. **Same product, stronger implementation.**
2. **No feature disappears without parity accounting.** See `PRODUCT_FEATURE_PARITY_MATRIX.md`.
3. **Admin and Student are different products surfaces** sharing one business/domain backend.
4. **Authentication is not entitlement.**
5. **Offline is a designed state, not a collection of fallbacks.**
6. **AI output is untrusted until validated.**
7. **Database migrations are the backend source of truth.**
8. **Server authorization is authoritative; UI locks are explanatory only.**
9. **Performance work is measured and budgeted, not decorative micro-optimization.**
10. **Identity/design is tokenized and functional before decorative.**

---

# 2. Recommended Repository Architecture

A workspace split is justified because Admin and Student have very different dependency, caching, security and UX needs.

```text
apps/
  admin-web/
    src/
      app/
      routes/
      features/
        dashboard/
        content/
        lessons/
        quizzes/
        ai-operations/
        students/
        entitlements/
        notifications/
        reports/
        settings/
      components/
  student-web/
    src/
      app/
      routes/
      features/
        auth/
        home/
        library/
        reader/
        practice/
        notes/
        notifications/
        progress/
        entitlements/
      offline/
      components/
packages/
  ui/
    tokens/
    primitives/
    admin/
    student/
  domain/
    auth/
    content/
    entitlements/
    quizzes/
    notifications/
    ai/
  data/
    supabase/
    repositories/
    generated-types/
  validation/
  ai-contracts/
supabase/
  migrations/
  functions/
    _shared/
    auth/
    entitlements/
    admin/
    ai/
  tests/
docs/
```

This does **not** mean two unrelated systems. It means two optimized frontends with shared contracts.

### Why separate apps instead of only route groups?

- Student bundle should not include admin XLSX/PDF/AI authoring dependencies.
- Admin does not need student IndexedDB/offline providers at startup.
- Student Service Worker can be optimized for offline learning without touching Admin.
- Admin can use dense tables/workbenches while Student uses touch-first learning components.
- Independent deployment/rollback reduces blast radius.
- Shared packages prevent business-rule duplication.

If deployment constraints later make two frontend deployments undesirable, the same feature/package boundaries can still be hosted under one domain/build. The architecture boundary matters more than the hostname.

---

# 3. Core Domain Model

## 3.1 Identity

Canonical identity:

```text
Supabase Auth user
  1 -> 1 profile
```

`profiles` should contain application metadata only:

- id UUID FK auth.users
- role (`admin` / `student`)
- username/display identifier
- status
- created_at
- last_login_at
- optional safe preferences/metadata

It must **not** contain:

- plaintext password;
- reversible password;
- authorization decisions duplicated from entitlement tables.

## 3.2 Entitlements

Replace overlapping access state with one normalized source of truth.

Suggested model:

```text
student_entitlements
- id
- student_id
- scope_type       // all_content | class
- class_id nullable
- source_type      // full_access_code | class_code | admin_grant | migration
- source_id nullable
- status           // active | expired | revoked
- starts_at
- expires_at nullable
- created_at
- revoked_at nullable
- metadata jsonb optional
```

A student can access content only if an active entitlement covers its class.

### Full access code

`access_codes` becomes issuance/redemption data, not authorization data itself.

```text
full_access_codes
- id
- code_hash / safe lookup representation or code with strict server exposure
- status
- expires_at
- redeemed_by_profile_id
- redeemed_at
- created_by
- created_at
```

### Class code

```text
class_access_codes
- id
- code
- class_id
- status
- expires_at
- redeemed_by_profile_id
- redeemed_at
- created_by
- created_at
```

Redemption creates/renews `student_entitlements` in one transaction.

## 3.3 Content

```text
classes
subjects
subject_class_links   // primary/extra if business needs multi-class subjects
lessons
lesson_assets
```

Avoid storing order-sensitive media only as an uncontrolled URL array where richer metadata is needed.

Suggested `lesson_assets`:

- id
- lesson_id
- kind (`page_image`, etc.)
- storage_path
- order_index
- source_file_name
- width/height/size/mime
- created_at

This makes page order explicit and allows optimized thumbnails/AI variants.

## 3.4 Quiz/Question model

Preferred normalization:

```text
quizzes
quiz_lessons
quiz_versions
questions
question_options
```

A practical compromise can retain question JSON snapshots for immutable attempt history, but canonical editable content should have stable IDs and validation.

Each question needs explicit provenance:

- source lesson ID
- source asset/page ID
- source page number
- source reference
- generation job ID/prompt version when AI-generated.

## 3.5 Practice sessions and attempts

Separate **in-progress state** from **completed attempt**.

```text
practice_sessions
- id UUID
- student_id
- context_type lesson|quiz
- lesson_id/quiz_id
- version_id
- status in_progress|completed|abandoned
- current_position / answer map
- question_snapshot
- created_at/updated_at

quiz_attempts
- id UUID
- student_id
- session_id unique
- score
- total_questions
- answer_snapshot
- question_snapshot
- trust_state synced|validated / local_practice where applicable
- completed_at
```

The UI state machine should store answers by stable question ID, not positional append-only arrays.

## 3.6 Achievements

```text
achievement_definitions
student_achievements
```

Award rules run server-side from a trusted event/result. Use an idempotency key such as:

```text
(student_id, achievement_definition_id, qualifying_context_id)
```

## 3.7 Notifications

Start with current global broadcast parity but use extensible shape:

```text
notifications
- id
- title
- message
- audience_type all|class|student
- audience_id nullable
- severity/info type
- action_type/action_target nullable
- published_at
- expires_at nullable
```

Read state can be server-side or lightweight `last_seen_at` depending product need/scale.

---

# 4. Authentication / Recovery Architecture

## Student activation

```text
Student enters full-access code
-> server endpoint validates format/rate limit
-> transaction/claim guarantees code not already redeemed
-> create or prepare Auth account safely
-> create profile
-> create all-content entitlement
-> bind code redemption to profile
-> establish session
-> return safe account/entitlement projection
```

Every step must be idempotent or compensated if an external Auth operation fails.

## Returning login

Use Supabase Auth normally. Device information can be recorded as safe session metadata but not used as password replacement.

## Recovery

Replace “retrieve old password” with:

- reset credential/token workflow;
- administrator can initiate reset, not view password;
- one-time token expires and is single-use;
- rate limited and audited.

If the product cannot use email/phone recovery, a product-specific recovery code can be issued at activation, but it should still support **reset**, not password disclosure.

## Admin

- explicit admin identity/profile;
- no default password in source;
- no “first user becomes admin” bootstrap;
- admin password changes through authenticated re-authenticated server flow;
- consider MFA once baseline is stable if operationally acceptable.

---

# 5. Authorization / RLS Matrix

All DB operations must be reviewed by role.

## Role principles

### anon
Allowed only to:
- call narrowly scoped activation/login public endpoints;
- retrieve public app metadata if any.

No direct table access to:
- codes;
- student data;
- admin tasks;
- content requiring entitlement.

### authenticated student
Allowed only to:
- read own safe profile projection;
- read content covered by active entitlement;
- read/write own session/attempt data as specifically allowed;
- read relevant notifications;
- redeem class code only through server endpoint;
- never mutate admin content/jobs/codes.

### admin
Allowed to:
- manage content/quizzes/codes/accounts/notifications/jobs through admin policies/endpoints.

### service_role
Used only inside server functions/workers; never accepted from browser and never substitutes caller authorization.

## Required RLS tests

For every table/view/action:

```text
anon
student A
student B
admin
service function
```

Negative tests are mandatory: student A cannot read/write student B, student cannot mutate admin tables, anon cannot enumerate codes/content.

---

# 6. Student Offline Architecture

Offline must be designed around a server-generated **authorized content manifest**.

## 6.1 Source of truth

Online server = canonical content/entitlements.

Student IndexedDB = local replica of data the account was authorized to download at a known revision.

## 6.2 Account-scoped local schema

Every private/student row includes account ID.

Example stores:

```text
metadata
contentManifest
classes
subjects
lessons
lessonAssets
quizzes
practiceSessions
attemptOutbox
notes
savedQuestions
mediaCacheMetadata
```

## 6.3 Sync checkpoint

Key by:

```text
account_id + entitlement_revision + content_revision
```

Do not use one global `initial=true` flag.

## 6.4 Sync algorithm

```text
1. read local manifest -> show UI immediately
2. when backend reachable, fetch account entitlement/content revision
3. if unchanged: no broad sync
4. if changed: fetch delta/manifest
5. apply additions/updates/deletions transactionally in IndexedDB
6. download media using bounded concurrency and storage budget
7. record checkpoint only after required data succeeds
8. expose partial-media availability separately from metadata completion
```

## 6.5 Deletions

Server must communicate tombstones/revision scope. Empty server result must be able to delete old local rows.

## 6.6 Entitlement changes

When a class entitlement is revoked/expired:
- prevent new server reads;
- remove or lock local cached protected content according to business/licensing rule;
- update manifest atomically.

## 6.7 Offline attempts

If attempts affect server history/rank, use an outbox:

```text
attempt_id UUID generated once
payload
created_at
sync_status
retry_count
last_error
```

Server insert is idempotent by attempt ID.

## 6.8 Notes/bookmarks

Current product decision is local-only. Preserve that until explicitly changed.

- store Blobs directly for media;
- account namespace;
- optional export/backup can be added later without fake “pending sync” structures.

---

# 7. PWA / Service Worker

Student app only should own the full offline service worker.

## Cache policy

### Precache
- versioned app shell/static assets only.

### Media
- runtime cache only for actual media;
- LRU/max-age/max-size policy;
- no authenticated API JSON in image cache.

### API
- do not blindly cache Supabase REST/Auth responses through Service Worker;
- offline data comes from IndexedDB repository.

### Updates
- new build installs safely;
- show a subtle “new version available” action if reload is required;
- do not unregister Service Worker on every load;
- do not clear user data on generic frontend errors.

### Manifest
- local icons;
- maskable icons;
- correct theme/background;
- version-independent start route;
- browser-specific installation instructions.

---

# 8. Admin Information Architecture

Recommended navigation:

## Overview
- Dashboard

## Content
- Classes & Subjects
- Lessons
- Uploads / Processing

## Assessment & AI
- Quizzes
- AI Operations

## Students & Access
- Student Accounts
- Full Access Codes
- Class Codes / Entitlements

## Communication
- Notifications

## Reports
- Export History / optional analytics

## System
- Security
- Settings
- Audit/diagnostics as needed

This gives the admin a professional operational mental model rather than a flat list of unrelated screens.

---

# 9. Admin Dashboard Design

The dashboard should answer “what needs my attention?” rather than decorate counts.

## Top summary

- active students/accounts
- classes/subjects/lessons published
- quizzes
- available/used access codes
- AI jobs running/failed

## Operational panels

### Recent activity
- lesson uploaded/edited
- quiz published
- code redeemed
- account reset/deleted
- notification sent

### AI health
- queued/running/failed jobs
- average duration
- latest failures
- credential/project health status without secrets

### Content health
- lessons missing summary/questions
- uploads awaiting review
- quizzes with validation warnings

### Access health
- expiring entitlements/codes if operationally relevant
- unusual reset/failure events

Use compact tables/lists; cards only for key numbers/states.

---

# 10. Admin Feature Architecture

## Classes & Subjects

```text
features/content-taxonomy/
  queries
  mutations
  ClassTree
  ClassForm
  SubjectForm
  SubjectClassLinks
```

## Lessons

```text
features/lessons/
  LessonList
  LessonFilters
  LessonEditor
  LessonPreview
  upload/
    UploadWorkbench
    MediaPipeline
    DetectionReview
  ai/
    LessonAIActions
  export/
```

## Quizzes

```text
features/quizzes/
  QuizList
  QuizBuilder
  VersionBuilder
  QuestionEditor
  SourceSelector
  ExportDialog
```

The giant pages become composition shells rather than business-logic containers.

---

# 11. Student Information Architecture / UX

Primary bottom navigation should remain minimal. Recommended:

- الرئيسية
- الدروس
- الاختبارات
- ملاحظاتي
- المزيد / الحساب

“المزيد” can expose:
- الإشعارات
- الإحصائيات
- التفعيل/الاشتراك
- المساعدة
- account/session controls.

If product priorities prefer direct Statistics/Activate buttons, test with real user flows; avoid six equally loud bottom actions.

## Student home

Priority order:
1. Continue learning.
2. Activated classes.
3. Recent/next practice.
4. Compact progress.
5. Important notification if any.

Avoid giant decorative hero areas consuming the first viewport.

---

# 12. Student Lesson Reader Design

Reader should feel like a reading tool, not a control panel.

## Header
- back
- lesson title/page
- optional more menu

## Main tabs
- الدرس
- الملخص
- اختبر نفسك
- ملاحظاتي

## Reader controls
Move into compact “عرض” sheet/menu:
- font size
- theme
- alignment where relevant
- reset view

Image zoom controls can appear only while viewing image content.

## Content
- maximize page/content area;
- predictable next/previous navigation;
- stable reserved image dimensions;
- no stacked decorative cards around every block.

---

# 13. Shared Practice Engine

One state machine serves:
- lesson interactive questions;
- standalone quizzes.

Suggested state:

```ts
PracticeSession {
  sessionId
  context
  questionIds
  shuffledOptionOrderByQuestion
  answersByQuestionId
  currentQuestionId
  completedAt?
}
```

Actions:

```text
START
RESTORE
ANSWER
NEXT
PREVIOUS (if product allows)
RESTART
COMPLETE
BOOKMARK
```

Score is derived from answer map + question snapshot, not maintained as a separate mutable counter.

Persistence adapter differs:
- online/server synced attempt;
- offline local/outbox.

Tests cover:
- duplicate option text;
- resume at every position;
- last-question completion;
- random version;
- offline completion then sync;
- double click/retry idempotency.

---

# 14. AI Generation Architecture

## 14.1 Preserve prompts as product assets

Create a versioned PromptRegistry:

```text
packages/ai-contracts/
  prompt-rules/
    arabic-style.ts
    scientific-notation.ts
    source-fidelity.ts
  prompts/
    summary.v1.ts
    lesson-questions.v1.ts
    extract-text.v1.ts
    extract-questions.v1.ts
    quiz-versions.v1.ts
    image-question.v1.ts
    regenerate-question.v1.ts
    replica.v1.ts
    exact-exam.v1.ts
  schemas/
  validators/
```

Each job records prompt version.

## 14.2 Durable AI jobs

Suggested tables:

```text
ai_jobs
- id
- type
- status queued|running|retry_wait|completed|failed|cancelled
- priority
- created_by
- source_revision
- prompt_version
- model
- provider
- total_units
- completed_units
- attempts
- next_attempt_at
- error_code/error_message
- created_at/started_at/completed_at

ai_job_units
- id
- job_id
- source id/page/chunk
- status
- attempt_count
- result jsonb
- validation jsonb
```

Use Supabase Queues/pgmq or another durable queue appropriate to deployment. Browser does not execute the job.

## 14.3 Provider adapter

```ts
interface AIProvider {
  generateStructured<T>(request, schema): Promise<ProviderResult<T>>
}
```

Keep Gemini baseline initially. Provider/model upgrades happen through golden tests.

## 14.4 Credential/project pool

Never store secret values in tables/frontend.

Store safe metadata:

```text
ai_provider_projects
- alias
- provider
- enabled
- weight
- concurrency_limit
- cooldown_until
- health
- last_error_code

ai_credentials
- alias
- project_alias
- secret_name/reference
- enabled
- health
```

Important Gemini rule: quota is project-level. Several keys from one project do **not** create extra RPM/TPM. Scheduler therefore groups limits by project.

### Scheduling

1. choose healthy project with capacity;
2. choose healthy credential for that project;
3. invoke provider;
4. classify response:
   - success -> validate;
   - 429 -> project cooldown/backoff;
   - 503 -> transient retry;
   - 401/403 -> disable credential and alert;
   - schema/semantic invalid -> retry/regenerate or require review;
5. persist metrics.

## 14.5 Work splitting

Large lesson/exam:

```text
source manifest
-> deterministic chunks/pages
-> parallel bounded child jobs
-> coverage verification
-> merge/deduplicate
-> semantic validation
-> publish/review result
```

Never silently use only the first N pages.

## 14.6 Structured output

Use Gemini structured output/JSON schema where supported and still run local Zod validation.

Validation categories:
- structural;
- requested count/type;
- correct answer in bounds;
- exact source rules;
- notation rules;
- source page/ref valid;
- no placeholder/fallback invented option;
- duplicate detection;
- explanation answer consistency.

## 14.7 Golden test set

Representative fixtures:
- Arabic literature;
- math equations;
- physics variables;
- chemistry formulas;
- biology;
- Quran/Hadith exact text;
- image MCQ;
- T/F;
- mixed lesson pages;
- exact exam paper;
- long lesson with > current image/text caps.

Metrics:
- schema pass;
- requested count pass;
- source coverage;
- exact-copy accuracy where applicable;
- answer correctness manual sample;
- latency/token/cost.

---

# 15. Media Pipeline

Create one ordered processor.

```text
selected files with original index
-> validate
-> PDF page extraction preserving file/page order
-> image normalize/orientation
-> create display variant
-> create AI/OCR variant
-> upload with deterministic metadata/order
```

Requirements:
- bounded concurrency;
- AbortSignal;
- progress by file/page;
- no result-order race;
- no external PDF worker dependency;
- explicit max size/dimensions;
- retry uploads idempotently;
- stable storage paths/IDs.

---

# 16. Export Architecture

Admin-only feature, lazy loaded.

```text
export/
  models
  templates
    quiz-print
    answer-key
    code-cards
  renderers
    html-print
    pdf
    xlsx
  sanitizer
```

Rules:
- all user/AI text escaped;
- brand assets local;
- RTL and Arabic fonts defined centrally;
- export scope explicit;
- no silent first-two-images behavior;
- export history records options/version/source revision;
- export libraries not in Student bundle.

---

# 17. Design System / New Identity

Identity creation should happen before page implementation but after information architecture.

## Foundation

### Brand
- new logo mark and wordmark;
- self-hosted assets;
- app icon/maskable icon;
- monochrome/print variants.

### Typography
Arabic-first family and scale. Avoid tiny helper text.

Suggested semantic scale (final px values chosen after visual design):
- display
- h1
- h2
- h3
- body-lg
- body
- body-sm
- label
- caption (still readable)

### Color
Do not hardwire subjects/classes to arbitrary decorative colors as core identity.

Tokens:
- primary
- secondary/accent
- neutral surfaces
- text strong/muted
- success
- warning
- danger
- info
- focus

### Spacing
4/8-based coherent scale.

### Radius
Small/medium/large only; giant 40px radii reserved for exceptional brand moments if any.

### Elevation
Very limited shadow levels.

### Motion
- short functional transitions;
- no animation for every list item;
- reduced motion support;
- no global will-change.

## Admin visual language
- compact;
- precise;
- tables/lists/side panels;
- strong status hierarchy;
- keyboard/focus friendly.

## Student visual language
- warmer/calm;
- generous reading space;
- touch targets;
- simple navigation;
- progress/encouragement without visual overload.

Both share brand/tokens/components but not identical density.

---

# 18. Accessibility Baseline

Mandatory release conditions:

- browser zoom allowed;
- keyboard navigation for all controls;
- visible focus;
- semantic labels;
- no color-only state;
- target sizes appropriate for touch;
- adequate Arabic font sizes/line height;
- contrast checks;
- reduced motion;
- dialogs trap/restore focus correctly;
- tables usable with keyboard/screen reader;
- images have meaningful alt where content-bearing;
- quiz correctness conveyed textually/icon + color;
- RTL ordering verified visually and semantically.

---

# 19. Performance Targets

Set measurable budgets once first rebuilt shell exists.

## Student

Goals:
- minimal initial JS;
- cached launch visibly fast on common Android devices;
- no Admin/export/AI-authoring libraries;
- lazy route bundles;
- image thumbnails/variants;
- no broad full-content refresh when revision unchanged;
- bounded media download/storage.

Measure:
- LCP
- INP
- CLS
- JS transfer/parse
- IndexedDB query latency
- sync network bytes
- memory on long lesson/quiz
- offline startup.

## Admin

Goals:
- server-side paging;
- no 100k row in-memory tables;
- dynamic import heavy export/PDF tooling;
- virtualize only where data size justifies;
- query caching with invalidation by domain;
- no repeated first-N “load more”.

Measure:
- page interactive time;
- table query latency;
- AI job UI responsiveness;
- upload memory/CPU;
- export time.

---

# 20. Observability

## Frontend
- structured error reporting;
- app version/release;
- route + operation context without private content leakage;
- offline/sync errors.

## Backend
- Edge Function request ID;
- authenticated caller role/id where safe;
- operation/job ID;
- error code, not only free text;
- latency.

## AI
- job/unit ID;
- provider/model;
- project/credential alias (not secret);
- prompt version;
- retries/error code;
- token usage/cost where available;
- validation failures.

## Audit log
Critical admin actions:
- account deletion/reset;
- code batch create/delete/revoke;
- entitlement grant/revoke;
- content delete/publish;
- notification publish;
- security change.

---

# 21. Testing Strategy

## Unit
- code format validators;
- entitlement resolution;
- quiz/practice state machine;
- score calculation;
- scientific notation renderer;
- AI semantic validators;
- CSV/export escaping;
- sync diff logic.

## Database / RLS integration
- clean migration reset;
- anon/studentA/studentB/admin matrix;
- code redemption race;
- expiry/revocation;
- account deletion cleanup;
- idempotency.

## Edge/Backend integration
- auth/recovery;
- AI job enqueue/worker/retry/cancel;
- provider 429/503/invalid JSON simulation;
- media upload authorization.

## E2E Admin
- login;
- class/subject CRUD;
- upload pages in order;
- AI generation survives navigation;
- quiz create/version/edit/regenerate;
- code import/generation/export;
- account reset/delete;
- notification publish.

## E2E Student
- first activation;
- returning login;
- class redemption/renewal;
- browse content;
- reader controls;
- notes media;
- practice resume/restart;
- quiz offline completion/sync;
- notifications;
- statistics;
- account reset while offline/then online;
- PWA upgrade.

## AI golden tests
Run before changing prompt/model/provider.

---

# 22. CI / Git / Release

Required scripts:

```text
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:integration
pnpm test:rls
pnpm test:e2e
```

GitHub Actions:

```text
install locked deps
-> typecheck
-> lint
-> unit tests
-> DB reset/migrations
-> RLS/integration tests
-> build admin
-> build student
-> E2E smoke on preview/staging where practical
```

Protect `main`:
- PR required;
- required CI checks;
- no direct force pushes;
- migration changes reviewed carefully.

Release:
- semantic/versioned release;
- migration plan;
- preview/staging;
- smoke tests;
- monitored rollout;
- rollback plan.

---

# 23. Rebuild Phases

## Phase A — Freeze product contract

- finish feature parity matrix;
- freeze current generation rules into fixtures;
- confirm unresolved business rules (local-only notes, entitlement expiry/renewal, full-access code lifecycle).

## Phase B — Backend foundation / security

- new canonical schema/ownership/entitlement design;
- safe migrations from current data;
- RLS matrix;
- atomic code redemption;
- safe Auth/recovery;
- delete/revoke semantics;
- tests first.

## Phase C — AI job platform

- PromptRegistry;
- structured schemas;
- durable queue;
- provider adapter;
- credential/project pool;
- retry/cooldown/idempotency;
- AI Operations API/tests.

## Phase D — Shared design/domain packages

- new identity/tokens;
- UI primitives;
- domain schemas/types;
- generated Supabase types;
- error model.

## Phase E — Admin web

1. shell + dashboard;
2. classes/subjects;
3. lesson list/upload/workbench;
4. AI Operations;
5. quiz builder;
6. accounts/entitlements/codes;
7. notifications;
8. exports/settings/security.

## Phase F — Student web/PWA

1. auth/activation;
2. shell/home;
3. entitlement-aware library;
4. offline sync;
5. reader;
6. PracticeEngine;
7. quizzes;
8. notes/bookmarks;
9. notifications/progress;
10. install/update/offline polish.

## Phase G — Data migration / parity / staging

- migrate production data to canonical schema;
- dual-read or controlled cutover if needed;
- run parity matrix;
- browser/device/performance/accessibility testing.

## Phase H — Release

- final security review;
- recovery/rollback rehearsal;
- monitored production cutover;
- remove compatibility code after migration window.

---

# 24. What We Will Not Do

- We will not repaint the current UI and call it a rebuild.
- We will not preserve unsafe password retrieval because it is “a feature”; we preserve recovery outcome safely.
- We will not use UI locks as authorization.
- We will not add five cache layers to make the app “fast”.
- We will not rotate several Gemini keys from one project pretending that creates quota.
- We will not change Gemini model/prompt rules without golden regression evidence.
- We will not put admin export/AI dependencies into the student bundle.
- We will not delete legacy code until its callers/data migration are verified.
- We will not optimize by silently truncating educational source content.
- We will not mark work “done” because build succeeds without scenario tests.

---

# 25. Definition of the New Product

The rebuilt **الوسيلة الذكية** should feel like one coherent platform with two specialized surfaces:

**Admin:** a professional, fast operations/content/AI dashboard that makes the state of the system obvious and supports bulk work safely.

**Student:** a calm, lightweight Arabic-first learning PWA that opens quickly, works reliably on weak networks, preserves personal notes/practice state, and never overwhelms the learner with controls.

Both should be backed by a database/security model that can be explained simply:

```text
Who are you?
-> What are you entitled to?
-> What data do you own?
-> What operation are you allowed to perform?
```

And by an AI system that can be explained simply:

```text
What source must be covered?
-> Which versioned prompt/rules apply?
-> Which durable job performs it?
-> Which healthy provider project has capacity?
-> Did the result pass schema + semantic validation?
-> Can the admin review/retry/audit it?
```

That is the target standard for signing the rebuilt product as production-ready.
