# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-06 Question Bank in progress. AR-01 through AR-05 are DONE / VERIFIED. AR-06 Batch 2B is VERIFIED.**

Branch: `rebuild/super-admin-foundation`

Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`

Latest live `main` observed during AR-06 Batch 2B: `343ff1fd7b3d64d7e990b72606695365f520fa58`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation. This workstream does not replace those sources.

## 0. Decision summary

The Admin is not being treated as a dashboard that needs polishing. The target is a smaller, task-oriented administrative product that preserves correct domain/security contracts while rebuilding navigation, information hierarchy and giant frontend compositions.

Binding decisions:

- KEEP the modular-monolith backend and server authority.
- KEEP correct publication, assessment, access, human-review and audit boundaries.
- REBUILD Admin information architecture and route ownership.
- REBUILD giant workspaces incrementally into pages/features/workflows.
- MOVE AI authoring into contextual actions rather than a permanent top-level workspace.
- SPLIT student support from bulk access-code management.
- FOLD Governance into Operations/Diagnostics.
- MAKE technical IDs, raw statuses, provider internals, hashes, storage paths and raw AI JSON advanced-only.
- ADD thin use-case backend commands only where the current UI is forced to understand pipeline internals.
- DO NOT mirror database tables or create a generic admin framework.
- DO NOT break or overwrite the parallel Student workstream.

## 1. Real Super Admin responsibilities

Repository evidence shows these essential jobs:

1. Maintain curriculum hierarchy and lesson scope.
2. Import/ingest lesson content and understand processing/review/readiness/publication/failure state.
3. Review OCR/source evidence before approval where human judgment is required.
4. Review AI output and approve/reject/edit it without understanding provider/runtime internals.
5. Maintain question lifecycle: draft → review → published.
6. Maintain quiz lifecycle and question composition.
7. Search a student and understand access/device/recovery state.
8. Manage bulk access codes separately from individual student support.
9. See failures/review queues requiring intervention.
10. Inspect audit evidence for sensitive operations.

Contextual capabilities include AI generation, history, exports and source/media evidence. Provider/model/runtime/storage/database internals are advanced diagnostics only.

## 2. Capability decisions

| Area | Real job | Decision |
|---|---|---|
| Overview | know what needs attention | REBUILD / attention-first |
| Curriculum | organize hierarchy | KEEP domain, REBUILD composition |
| Content | ingest/review/publish lesson content | REBUILD workflow + targeted backend use cases |
| OCR/source | inspect evidence | REBUILD review experience |
| AI review | human decision on generated result | KEEP state authority, REBUILD normal UI |
| AI authoring | contextual generation/application | REMOVE top-level, REBUILD contextually |
| Question Bank | create/edit/review/regenerate/history | REBUILD into route-owned list/detail/editor/review/history |
| Quiz Builder | compose/version/review/publish | REBUILD into list/detail/builder/review |
| Students | individual support | REBUILD focused support flow |
| Access Codes | bulk access lifecycle | SPLIT from Students |
| Operations | health/audit/diagnostics | REBUILD split |
| Reports | retrieve owning-workflow artifacts | REMOVE top-level; contextual links |

## 3. Data visibility rules

**Normal UI must show:** human names/titles, curriculum context, localized workflow status, review/publication state, actionable failure cause, student access/device/recovery state, question/quiz content and AI generated content during review.

**Contextual:** file/page metadata, OCR source quote/confidence, revision/event history.

**Advanced only:** UUIDs, revision IDs, job/unit/output IDs, provider/model/routing/tokens/cost, storage paths, MIME/hashes, raw JSON, technical error codes.

**Remove from production presentation:** stage/parity/repository/build labels and internal handoff IDs.

## 4. Target information architecture

Primary work areas:

1. **نظرة عامة** — `/app`
2. **المحتوى التعليمي**
   - `/app/curriculum`
   - `/app/content`
   - `/app/reviews`
3. **الأسئلة والاختبارات**
   - `/app/questions`
   - `/app/quizzes`
4. **الطلاب والوصول**
   - `/app/students`
   - `/app/access-codes`
5. **التشغيل**
   - `/app/operations`
   - `/app/operations/audit`
   - `/app/operations/diagnostics`

Important non-sidebar entity routes include:

- `/app/content/:lessonId`
- `/app/questions/:questionId`
- `/app/quizzes/:quizId`
- `/app/students/:profileId`

Create/Edit/View/Review/History are workflow-owned actions/screens, not sidebar destinations.

## 5. Target workflows

### Curriculum
Hierarchy browser → entity/children → contextual create/edit/lifecycle → history when needed.

### Content/OCR
Lesson/source → processing → source evidence review → ready → publish. Internal task/storage/checksum details remain advanced.

### AI
Contextual request → working → content-first human review → approve/edit/reject → contextual apply/import. No manual job/output-ID handoff.

### Questions
Question Bank list → route-owned question entity → editor/source evidence → review decision → history. State-dependent edit/submit/publish/return/regenerate actions remain server-authoritative.

### Quiz
List → detail → builder/version/settings → review → publish. Question candidate/publication authority remains server-owned.

### Students
Search/list → student detail → access/device/recovery/support activity → supported recovery actions.

### Access Codes
Batches/codes → import/generate/search/filter/state/revoke eligible codes → contextual export.

### Operations
Actionable health/problems → audit trail → advanced diagnostics.

## 6. Backend/security invariants

- Admin authorization is server-side.
- PostgreSQL is business authority.
- source access cannot expose private storage paths as browser authority.
- AI never auto-publishes.
- human review remains required.
- question publication requires a resolved correct answer.
- quiz/assessment authority remains server-owned.
- access/device/recovery authority remains server-owned.
- audit evidence is retained.

## 7. Frontend architecture rules

Target feature boundaries:

```text
src/admin/
  shell/
  overview/
  curriculum/
  content/
  reviews/
  questions/
  quizzes/
  students/
  access-codes/
  operations/
  shared/
  api/
  view-models/
```

Rules:

- route owns page;
- feature owns workflow state;
- adapters translate server contracts;
- no component should own list + create + edit + review + export simultaneously;
- server state remains server-owned;
- deep links are mandatory;
- legacy workspaces may remain only as temporary parity adapters while ownership migrates.

## 8. Design-system rules

RTL-first; keyboard accessible; brand tokens; dense but readable; collections use appropriate list/table patterns; one obvious primary action; humanized statuses; filters near lists; decision-grouped forms; explicit loading/empty/error/retry states; reduced motion; usable focus/touch targets; deliberate mobile/tablet degradation; no decorative glass/glow/meaningless dashboard chrome.

## 9. Roadmap

- **AR-01 — Architecture baseline + route-driven shell** — DONE / VERIFIED.
- **AR-02 — Overview + Operations split** — DONE / VERIFIED.
- **AR-03 — Curriculum** — DONE / VERIFIED.
- **AR-04 — Content + OCR** — DONE / VERIFIED.
- **AR-05 — Reviews + AI** — DONE / VERIFIED.
- **AR-06 — Question Bank** — ACTIVE.
- **AR-07 — Quiz Builder** — NOT STARTED by this workstream.
- **AR-08 — Students + Access Codes** — NOT STARTED.
- **AR-09 — Cleanup + architecture enforcement** — NOT STARTED.
- **AR-10 — A11y/RTL/performance/visual QA** — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## 10. Execution checkpoints

### AR-05 — verified closure

Exact checkpoint: `cda2c3a683c6101db12f0c7cfad772226c234e0d`.

- Frontend `34729512441` — SUCCESS.
- Admin AI `34729512433` — SUCCESS.
- Combined `34729512404` — SUCCESS.

The combined gate covered API/Admin quality, clean PostgreSQL migrations/contracts, backend authority/security regressions, deterministic fixtures and real Chromium.

### AR-06 / Batch 1 — route-owned Question detail — VERIFIED

Inventory/classification:

- **KEEP:** Question Bank PostgreSQL/API lifecycle authority, revisions/events, publication validation, approved-AI import/regeneration provenance, filters/pagination and existing integration coverage.
- **IMPROVE:** human state/context, progressive history/source disclosure, error/retry and deep-link ergonomics.
- **REFACTOR:** route/feature ownership into list/detail/editor/review/history.
- **REBUILD:** giant `QuestionBankWorkspace.tsx` composition.
- **REMOVE from normal UX:** raw checksum/OCR/output/internal identifiers and pipeline/stage terminology, with advanced evidence retained only where justified.

Implemented:

- `QuestionBankDetailPage.tsx` owns canonical routed detail;
- `/app/questions/:questionId` is registered;
- detail reads existing canonical Question Bank + curriculum APIs;
- submit-review/publish/reject remain server-authoritative;
- source/revision/event evidence remains available without exposing implementation internals;
- legacy `/app/questions` remained temporarily mounted for create/import/edit/regeneration parity.

Verified code head: `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`.

- Frontend `34731668746` — SUCCESS.
- Combined `34731668810` — SUCCESS including API/Admin quality, clean PostgreSQL migrations/contracts, authority/security regressions, deterministic fixtures and real Chromium.

### AR-06 / Batch 2A — focused list + default entity routing — VERIFIED

#### State received

- Files re-read before editing: `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this workstream.
- Draft PR #52 remained draft.
- No parallel Student code was touched.

#### Evidence inspected before implementation

- `database/migrations/0019_question_bank.sql`;
- Question Bank HTTP/service lifecycle implementation;
- `apps/admin-web/src/question-bank-api.ts` and unit tests;
- legacy `QuestionBankWorkspace.tsx`;
- route-owned `QuestionBankDetailPage.tsx`;
- router/App composition and existing Question Bank styles.

The inspection confirmed the backend/domain is already mature: PostgreSQL/API enforce legal revision/lifecycle authority, open/published revision uniqueness, validation and provenance. The root problem is frontend composition/normal navigation, not missing backend CRUD.

#### Batch decision

- **KEEP:** all PostgreSQL/API lifecycle/mutation authority.
- **KEEP temporarily:** manual create, approved-AI import, edit and regeneration in the legacy workspace until route-owned replacements are individually verified.
- **IMPROVE/REFACTOR:** `/app/questions` list ownership and list→entity navigation.
- **REBUILD incrementally:** giant workspace composition without a flag-day rewrite.

#### Implemented

1. `931254e3b62d4cc8465f0bf7cd503ba1e32ae54c` — focused `QuestionBankListPage.tsx` and entity navigation.
2. `09a84c95b2de59ea318ff43171883756a776a79b` — `/app/questions` uses focused list; `/app/questions/:questionId` remains detail; `/app/questions/manage` preserves mutation parity.
3. `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac` — shared styles/types alignment.
4. No backend, migration or Student mutation occurred.

#### Exact code-head verification

Exact verified code head: `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac`.

- Stage 13E Admin AI Operations `34733273139` — SUCCESS.
- Stage 13E Frontend Preparation `34733273136` — SUCCESS.
- Stage 13E Combined Integration `34733273134` — SUCCESS.

### AR-06 / Batch 2B — route-owned current-revision editor — VERIFIED, AR-06 remains ACTIVE

#### State received and reconciliation

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this workstream before editing.
2. Received Admin documentation head: `fec394af52bcd205e260de76ef5e89eff87cef7c`.
3. Fetched live `main@343ff1fd7b3d64d7e990b72606695365f520fa58`; Student PR #55 had merged independently and was preserved.
4. Confirmed Draft PR #52 remains open and draft.
5. Closed the received-head CI before code mutation:
   - Admin AI `34733490675` — SUCCESS;
   - Combined `34733490658` — SUCCESS.
6. Inspected route-owned detail, legacy editor behavior and `question-bank-api.ts` before modifying ownership.

#### Classification/decision

- **KEEP:** existing PATCH edit command, PostgreSQL revision/history authority and review-state restrictions.
- **REFACTOR:** edit ownership into `QuestionBankDetailPage`.
- **IMPROVE:** route-local feedback, validation and canonical reload after mutation.
- **KEEP temporarily:** approved regeneration and manual create/import in `/app/questions/manage`.
- **NO CHANGE:** backend lifecycle, migrations and Student code.

#### Implemented

Commit `43162f9b4f0468af96ae726f16054a868aff605a` — `refactor(admin): move question editing into routed detail`.

- route-owned detail now exposes the current-revision editor when the question is not in review;
- validation preserves the existing question contract for MCQ, true/false, direct-answer and answer-state behavior;
- normalized edits flow through `editQuestionBankItem`;
- save creates a new server-owned revision and reloads canonical detail/history;
- published history is not rewritten by the browser;
- review-state edit remains unavailable.

#### Exact code-head verification

Exact verified code head: `43162f9b4f0468af96ae726f16054a868aff605a`.

- Stage 13E Frontend Preparation `34733906701` — SUCCESS.
- Stage 13E Admin AI Operations `34733906692` — SUCCESS.
- Stage 13E Combined Integration `34733906716` — SUCCESS.

Combined passed API/Admin quality, clean PostgreSQL migrations/contracts, backend authority/security regressions and the real Chromium regression suite.

#### Not yet done — do not overstate Batch 2B

- dedicated browser coverage for the new routed editor is still required; existing Combined Chromium being green proves regression safety, not explicit routed-editor ownership coverage;
- approved regeneration is still legacy-owned;
- manual create/import remain in `/app/questions/manage`;
- legacy workspace cannot be removed yet;
- AR-06 remains ACTIVE.

#### Documentation sequence for Batch 2B

- `PROJECT_STATUS.md` checkpoint: `ed8c20e250c2a95cc36568cd1f32543de832e50c`.
- `PROJECT_ENGINEERING_LOG.md` checkpoint: `4379e1449e16131fcb3f02e27b665a102ee84fae`.
- This workstream write is the final canonical handoff document update for this batch; its resulting commit is the documentation HEAD that the next task must verify before new code changes.

## 11. Exact handoff for the next A/B task

1. Fetch live `main`, branch HEAD, Draft PR #52 and latest exact-head CI.
2. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this workstream; treat the final documentation HEAD as the received shared state.
3. If CI triggered by the documentation sequence is active, close/record it before changing code. Do not create a parallel batch.
4. Continue **AR-06 only**; do not start AR-07.
5. Next coherent mutation: move approved question regeneration contextually into `QuestionBankDetailPage`, preserving server approval, provenance, idempotency and source/current-published-revision validation.
6. Keep manual create/import in `/app/questions/manage` until focused ownership is implemented and verified.
7. Add explicit browser coverage for:
   - direct `/app/questions/:questionId` deep link;
   - `/app/questions` list → entity detail;
   - routed edit lifecycle;
   - routed regeneration lifecycle;
   - existing submit-review/publish/reject authority.
8. Do not remove the legacy workspace until manual create/import/edit/regeneration parity is proven under the new composition.
9. Require exact-head Frontend + API/PostgreSQL/Chromium evidence explicitly covering routed workflows before declaring AR-06 COMPLETE.
10. Keep PR #52 draft; do not merge automatically.
11. Before eventual merge, resynchronize conservatively with live main `343ff1fd7b3d64d7e990b72606695365f520fa58` or newer and preserve concurrent Student/audit work.