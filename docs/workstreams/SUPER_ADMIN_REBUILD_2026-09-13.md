# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-06 Question Bank in progress. AR-01 through AR-05 are DONE / VERIFIED. AR-06 Batch 2C is VERIFIED.**

Branch: `rebuild/super-admin-foundation`

Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`

Latest live `main` re-verified during AR-06 Batch 2C: `343ff1fd7b3d64d7e990b72606695365f520fa58`.

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

Implemented `QuestionBankDetailPage.tsx`, `/app/questions/:questionId`, server-canonical detail/review/history and retained legacy mutation parity.

Verified code head `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`:

- Frontend `34731668746` — SUCCESS.
- Combined `34731668810` — SUCCESS including clean migrations, DB contracts, authority/security regressions, deterministic fixtures and real Chromium.

### AR-06 / Batch 2A — focused list + default entity routing — VERIFIED

Evidence inspected before implementation included `0019_question_bank.sql`, Question Bank HTTP/service lifecycle, `question-bank-api.ts`, unit tests, legacy workspace, routed detail, App routing and styles.

Decision:

- **KEEP:** all PostgreSQL/API lifecycle/mutation authority.
- **KEEP temporarily:** manual create, approved-AI import, edit and regeneration in legacy workspace.
- **IMPROVE/REFACTOR:** `/app/questions` list ownership and list→entity navigation.
- **REBUILD incrementally:** giant workspace composition.

Implemented:

1. `931254e3b62d4cc8465f0bf7cd503ba1e32ae54c` — focused list and entity navigation.
2. `09a84c95b2de59ea318ff43171883756a776a79b` — routed list/detail + `/app/questions/manage` parity adapter.
3. `ed40fafd74baba3934e2ee4834bc0b61c2fe70ac` — shared styles/types alignment.

Verification:

- Admin AI `34733273139` — SUCCESS.
- Frontend `34733273136` — SUCCESS.
- Combined `34733273134` — SUCCESS.

### AR-06 / Batch 2B — route-owned current-revision editor — VERIFIED

State received/reconciled: canonical docs reread; live main and PR #52 inspected; received documentation-head CI closed green; route-owned detail, legacy editor and frontend API contract inspected.

Classification:

- **KEEP:** existing PATCH edit command, PostgreSQL revision/history authority and review-state restriction.
- **REFACTOR:** edit ownership into `QuestionBankDetailPage`.
- **IMPROVE:** route-local feedback, validation and canonical reload.
- **KEEP temporarily:** approved regeneration and manual create/import in `/app/questions/manage`.
- **NO CHANGE:** backend lifecycle, migrations and Student code.

Commit `43162f9b4f0468af96ae726f16054a868aff605a` moved editing into routed detail, preserved validation and historical revision authority, and reloads canonical detail after save.

Verification:

- Frontend `34733906701` — SUCCESS.
- Admin AI `34733906692` — SUCCESS.
- Combined `34733906716` — SUCCESS.

### AR-06 / Batch 2C — route-owned approved regeneration — VERIFIED, AR-06 remains ACTIVE

#### State received and reconciliation

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this workstream before code mutation.
2. Received shared Admin documentation head `332bd77e88ad7fd93d67c8527dd04c1b0cea3489`.
3. Re-verified live `main@343ff1fd7b3d64d7e990b72606695365f520fa58`; parallel Student work was preserved.
4. Confirmed Draft PR #52 remains open/draft.
5. Closed the received-head CI and confirmed no prior batch was ACTIVE/RUNNING.
6. Inspected routed `QuestionBankDetailPage.tsx`, legacy `QuestionBankWorkspace.tsx` regeneration behavior and `question-bank-api.ts` before mutation.
7. Confirmed `applyApprovedQuestionRegeneration(itemId, outputId)` and `/v1/admin/question-bank/:itemId/regenerate-ai/:outputId` already provide the canonical server command. No backend CRUD or migration gap existed.

#### Classification / decision

- **KEEP:** existing API/service/PostgreSQL regeneration contract and server authority for approval, provenance, source/current-published-revision matching and idempotency.
- **REFACTOR:** human approved-regeneration action into route-owned question detail.
- **IMPROVE:** route-local mutation/replay feedback and canonical reload.
- **KEEP temporarily:** the duplicate legacy regeneration affordance until explicit routed browser parity is verified.
- **KEEP temporarily:** manual create/import under `/app/questions/manage`.
- **NO CHANGE:** backend, migrations and Student code.

#### Implemented

Commit `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e` — `feat(admin): move approved question regeneration to detail route`.

- `QuestionBankDetailPage` exposes regeneration only for the current `published` revision with source evidence;
- edit and regeneration panels do not compete for page ownership;
- the existing server command decides whether the supplied regenerate output is approved and compatible;
- successful first application creates a Draft revision for the same question identity and reloads canonical detail/history;
- replayed application reports idempotent success without duplicate revision creation;
- no API, migration or Student code was changed.

#### Exact code-head verification

Exact verified code head: `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`.

- Stage 13E Frontend Preparation `34735333581` — SUCCESS.
- Stage 13E Admin AI Operations `34735333557` — SUCCESS.
- Stage 13E Combined Integration `34735333555` — SUCCESS.

Combined passed API/Admin quality gates, all clean PostgreSQL migrations/contracts, backend authority/security regressions, Stage12/Auth regressions, deterministic real browser fixtures and the real Admin Chromium suite.

#### What is intentionally not claimed

- the existing Combined Chromium suite being green proves no regression, but dedicated new assertions are still required for routed Question Bank deep-link/navigation/edit/regeneration/lifecycle ownership;
- manual create/import remain under `/app/questions/manage`;
- the legacy workspace/parity adapter cannot yet be removed;
- AR-06 remains ACTIVE and AR-07 must not start.

#### Documentation sequence for Batch 2C

- code head: `60cb917e88e92ae8c3e3b64c6a5c8b8e7eb2928e`;
- `PROJECT_STATUS.md` update: `c1108a2d6dbf79fc3daf07ca421f34440f7d8d37`;
- `PROJECT_ENGINEERING_LOG.md` update: `fcca34d769ed4b113624079efb3ed9fd31190cc6`;
- this workstream update is the final canonical handoff write for Batch 2C; its resulting commit becomes the documentation HEAD that the next A/B task must verify before a new code mutation.

## 11. Exact handoff for the next A/B task

1. Fetch live `main`, branch HEAD, Draft PR #52 and latest exact-head CI.
2. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this workstream; treat the final documentation HEAD as shared state.
3. If CI triggered by this documentation sequence is active, close/record it before changing code. Do not create a parallel batch.
4. Continue **AR-06 only**; do not start AR-07.
5. Next coherent batch: add explicit Browser E2E coverage for:
   - direct `/app/questions/:questionId` deep link;
   - `/app/questions` list → entity detail;
   - routed edit lifecycle;
   - routed approved-regeneration lifecycle, including replay/idempotency where practical;
   - existing submit-review/publish/reject authority.
6. Keep manual create/import under `/app/questions/manage` during routed parity proof.
7. After explicit routed E2E is green, decompose manual create/import into focused route/workflow ownership and only then remove duplicate legacy detail/edit/regeneration responsibilities.
8. Do not remove `/app/questions/manage` until manual create/import/edit/regeneration parity is proven.
9. Require exact-head Frontend + API/PostgreSQL/Chromium evidence explicitly covering routed workflows before declaring AR-06 COMPLETE.
10. Keep PR #52 draft; do not merge automatically.
11. Before eventual merge, resynchronize conservatively with live main `343ff1fd7b3d64d7e990b72606695365f520fa58` or newer and preserve concurrent Student/audit work.