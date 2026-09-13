# Super Admin Rebuild — 2026-09-13

Status: ACTIVE — architecture baseline approved by repository evidence; implementation starts incrementally on `rebuild/super-admin-foundation`.

Source baseline: `main@8d0676443aa7e186c41a79cc011f7f828d1290ef`.

## 0. Decision summary

The current Admin is not being treated as a set of screens to polish. The target is a smaller task-oriented administrative product that preserves valid domain/security contracts while rebuilding navigation, composition, information hierarchy, and selected backend use-case commands.

Primary architecture decision:

- KEEP the modular-monolith backend and server authority.
- KEEP correct publication, assessment, access, human-review, and audit boundaries.
- REBUILD Admin information architecture and route ownership.
- REBUILD giant workspace composition into pages/features/workflows.
- MOVE AI authoring into contextual actions instead of a permanent top-level workspace.
- SPLIT student support from bulk access-code management.
- FOLD Governance into Operations/Diagnostics; it is not a daily work area.
- MAKE technical IDs, raw statuses, provider internals, hashes, storage paths, and raw AI JSON advanced-only.
- ADD use-case backend commands where the current UI is forced to understand pipeline internals.
- DO NOT create a generic admin framework or mirror database tables.

## 1. Product understanding and real Admin responsibilities

The repository shows a student-facing learning product whose administered path is broadly:

1. Define curriculum hierarchy and lesson scope.
2. Bring source material into a lesson through ingestion/import.
3. Process media/OCR and review extracted content.
4. Use AI as an assisted authoring mechanism, never as autonomous publication authority.
5. Human-review generated output.
6. Create/review/publish questions.
7. Assemble/review/publish quizzes from published question-bank revisions.
8. Give students access through activation/access-code/entitlement rules.
9. Support individual students when account/device/access recovery needs intervention.
10. Monitor failures and inspect audit evidence when something goes wrong.

Therefore the real Super Admin responsibilities are:

### ESSENTIAL

- Maintain curriculum structure and lesson scope.
- Import/ingest lesson content and know whether it is processing, waiting for review, ready, published, or failed.
- Review OCR/source evidence before approval where human judgment is required.
- Review AI output and approve/reject/edit it without understanding provider/runtime internals.
- Maintain question-bank lifecycle: draft → review → published.
- Maintain quiz lifecycle and question composition.
- Search a student, understand current access/device/recovery state, and perform supported recovery actions.
- Manage bulk access codes separately from individual support.
- See failures/review queues that require intervention.
- Access an audit trail for sensitive/important operations.

### IMPORTANT

- Curriculum/content history.
- Question and quiz revision history.
- Export/print quiz artifacts.
- Access-code imports and batch operations.
- Operational health summaries.

### CONTEXTUAL

- AI generation for lesson/question/quiz: starts from the entity being authored, not a global authoring workspace.
- File/export reports: reached from the relevant access-code/quiz workflow.
- Source/media metadata: reached from lesson/content detail.
- Revision/event history: reached from detail pages.

### ADVANCED

- Provider/model/routing diagnostics.
- AI runtime control/budget state.
- Storage paths/checksums/internal IDs.
- Database/session/runtime diagnostics.
- Raw job metadata and raw JSON when troubleshooting.

### QUESTIONABLE / REMOVE FROM NORMAL IA

- Standalone "Governance" as a daily destination.
- Standalone "AI Authoring" destination.
- Standalone "Reports" destination when it only exposes artifacts belonging to another workflow.
- Stage/parity/repository/build labels in product UI.
- Generic metric cards that do not imply an action.

## 2. Current Admin capability inventory

| Current workspace | Current capability | Real job | Priority | Decision |
|---|---|---|---|---|
| Operations | generic metrics, recent notifications/activity | know what needs attention / recent operational events | ESSENTIAL but wrong emphasis | REBUILD |
| Governance | content/OCR/AI/QBank/quiz counts + runtime/security configuration | troubleshoot health/security/runtime | ADVANCED | REFACTOR into Operations |
| Curriculum | list/create/edit curriculum hierarchy and status | organize curriculum | ESSENTIAL | REBUILD composition; KEEP domain contracts |
| Content Ingestion | upload assets, process task, link draft, review/publish/history | get source content into a lesson | ESSENTIAL | REBUILD workflow + targeted backend refactor |
| Content Operations | source documents, media, OCR extraction/review | inspect/review source evidence | ESSENTIAL/CONTEXTUAL | REBUILD review experience |
| AI Operations | jobs/units/outputs/review + technical runtime data | review generated result / recover failed work | ESSENTIAL + ADVANCED mixed | REBUILD UI; KEEP controller/state mechanics |
| AI Authoring | lesson generation, quiz generation, question regeneration, apply output, exports | contextual authoring action | CONTEXTUAL | REMOVE as top-level; REBUILD contextually |
| Question Bank | list/create/edit/review/regenerate/history | maintain questions | ESSENTIAL | REBUILD into list/detail/editor/review |
| Quiz Builder | list/create/edit/version/question assembly/review/publish | build quizzes | ESSENTIAL | REBUILD into list/detail/builder/review |
| Students & Access | student support + recovery/device/entitlements + bulk codes | two different jobs | ESSENTIAL | SPLIT into Students and Access Codes |
| Reports | generated files/exports | retrieve artifact from its owning workflow | CONTEXTUAL | REMOVE as top-level; contextual links |

## 3. KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE matrix

### KEEP

- Fastify modular-monolith application composition.
- PostgreSQL as business authority.
- Server-side `admin` authorization on Admin routes.
- Question lifecycle validation, including prohibition on publishing unresolved answers.
- Quiz lifecycle validation and published-question references.
- Human approval boundary for AI outputs.
- Existing audit/event records.
- Student/access service read snapshots, pagination, and server-calculated effective states.
- AI review controller mechanics for polling, conflict refresh, pagination, and server authority where behavior is already correct.

### IMPROVE

- Human-readable status/error mapping.
- Operational attention summaries.
- Search/filter ergonomics.
- Detail/history progressive disclosure.
- Empty/error/recovery states.
- Responsive/RTL/keyboard behavior.

### REFACTOR

- Operations backend response into attention-oriented summary plus diagnostics.
- Governance data into Operations > Diagnostics.
- Access UI around the already separate students and codes APIs.
- AI normal-view projection so it does not return/require technical data for ordinary review screens.
- Content publication API around a lesson/content use case rather than ingestion-task identity where source-imported assets have no task.

### REBUILD

- Admin shell and navigation.
- All giant workspace page composition.
- Overview.
- Curriculum page flow.
- Content/OCR review experience.
- AI human-review experience.
- Question Bank UI composition.
- Quiz Builder UI composition.
- Student support UI composition.
- Access-code UI composition.

### REMOVE FROM NORMAL PRODUCT UI

- Top-level Governance workspace.
- Top-level AI Authoring workspace.
- Top-level Reports workspace.
- Stage labels, parity panels, repository/build terminology.
- Raw UUIDs/job IDs/provider IDs/storage paths/checksums/raw enum strings/raw JSON by default.

Removal here does not mean deleting audit/diagnostic data from the system; advanced diagnostics remains available where justified.

## 4. Data visibility matrix

| Data | Classification | Target presentation |
|---|---|---|
| Human title/name/identifier | MUST SHOW | primary label |
| Curriculum path | MUST SHOW | breadcrumb/context |
| Human workflow status | MUST SHOW | localized badge + next action |
| Review/publication state | MUST SHOW | localized state, not raw enum |
| Failure requiring action | MUST SHOW | concise cause + recovery action |
| Student access/device/recovery state | MUST SHOW | support summary |
| Question prompt/type/difficulty/answer state | MUST SHOW | editor/review content |
| Quiz title/scope/version/question count/status | MUST SHOW | builder/detail |
| AI generated content | MUST SHOW in review | content-first review surface |
| Raw enums | HUMANIZE | Arabic labels |
| Technical error codes | HUMANIZE or ADVANCED | user-safe message; raw code in diagnostics |
| File name/size/page number | CONTEXTUAL | source detail/review |
| OCR confidence/source quote | CONTEXTUAL | evidence panel |
| Revision/event timestamps | CONTEXTUAL | history |
| UUIDs/internal revision IDs | ADVANCED | diagnostics/copy action only |
| AI provider/model/route/tokens/cost | ADVANCED | diagnostics |
| Storage/source paths, MIME, hashes | ADVANCED | diagnostics |
| Raw AI JSON | ADVANCED | diagnostics only |
| Internal job/unit/output IDs | ADVANCED | diagnostics; never workflow handoff |
| Cache/build/stage/parity/repository labels | HIDE/REMOVE | no production presentation |

## 5. Target Admin information architecture

Target Level 1 work areas: **5**.

### Sidebar

1. **نظرة عامة** — `/app`
2. **المحتوى التعليمي**
   - المنهج — `/app/curriculum`
   - المحتوى — `/app/content`
   - المراجعات — `/app/reviews`
3. **الأسئلة والاختبارات**
   - بنك الأسئلة — `/app/questions`
   - الاختبارات — `/app/quizzes`
4. **الطلاب والوصول**
   - الطلاب — `/app/students`
   - أكواد الوصول — `/app/access-codes`
5. **التشغيل**
   - الحالة والمشكلات — `/app/operations`
   - سجل التدقيق — `/app/operations/audit`
   - التشخيص المتقدم — `/app/operations/diagnostics`

### Non-sidebar routes

- `/app/content/:lessonId`
- `/app/questions/:questionId`
- `/app/quizzes/:quizId`
- `/app/students/:profileId`
- workflow-scoped create/edit/review routes or dialogs where URL ownership is useful.

Create/Edit/View/Review/History are actions/screens inside a workflow, not sidebar entries.

### Overview rule

Overview answers only: **"ما الذي يحتاج انتباهي الآن؟"**

It may include content/OCR waiting for review, AI outputs waiting for human review, question/quiz review queues, failed jobs, student/access exceptions and recent high-value activity. Generic row counts are secondary.

## 6. Target workflows

### Curriculum
Entry: Curriculum list/tree. List hierarchy with human names/statuses. Detail selected entity/children. Primary actions create child/edit/change supported lifecycle. History contextual.

### Content
Entry: lesson/content list or curriculum lesson action. Normal lifecycle presentation: **Source → Processing → Review → Ready → Publish** where backed by state. Detail owns lesson/source/review/publication. Advanced diagnostics own internal IDs/paths/hashes.

### OCR / source review
Entry: review queue or lesson detail. Review shows source page/image beside extracted/editable text where renderable. Actions approve/edit/reject/retry as supported.

### AI
Entry: contextual action from lesson/question/quiz OR central Reviews queue. Normal flow: request → working → review result → edit if allowed → approve/reject → apply/import. No manual job/output-ID handoff.

### Questions
Entry: Question Bank list. List prompt preview/scope/type/difficulty/origin/human status. Detail/editor content + lesson/source evidence. Review focused decision surface. Actions state-dependent edit/submit/publish/return/regenerate contextually. History revisions/events.

### Quiz
Entry list. Detail scope/title/status/version. Builder selects published question candidates and arranges versions/settings. Review final composition. Exports contextual.

### Students
Entry searchable/paginated list. Detail identity/access/device/recovery/support activity. Supported recovery/device/access actions only.

### Access Codes
Entry code batches/codes list. Import/generate/search/filter/state/revoke eligible unused codes. Bulk/export belongs here.

### Operations
Health actionable failures/queues. Audit filterable trail. Diagnostics runtime/config/session/AI internals.

## 7. Backend changes required

### B1 — Admin attention summary
Add/reshape use-case endpoint for actionable Overview queues rather than generic metrics.

### B2 — Lesson/content publication command
Introduce lesson/content publication use-case resolving internal task/assets/revisions server-side; UI must not synthesize IDs.

### B3 — OCR review projection
Expose renderable source reference/preview without storage-path leakage.

### B4 — AI apply/import commands
Replace manual `jobId`/`outputId` handoffs with contextual commands from approved results, preserving idempotency/provenance/review/validation.

### B5 — Humanized Admin read models
Where ordinary screens need multiple lookups/raw IDs, add thin Admin use-case read models with human labels/next action. No duplicate frontend authority.

## 8. Frontend architecture

Target boundaries:

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

Rules: route owns page; feature owns workflow state; adapters translate server contracts; no component owns list+create+edit+review+export simultaneously; server state remains server-owned; deep links mandatory. Old workspaces may remain temporarily as parity adapters during migration.

## 9. Admin design-system rules

RTL-first, keyboard accessible, brand tokens, dense/readable, list/table for collections, one obvious primary action, humanized statuses, filters near list, decision-grouped forms, loading/empty/error/retry states, no decorative gradient/glass/glow, reduced motion, usable focus/touch targets, deliberate mobile/tablet degradation.

## 10. Implementation roadmap

### AR-01 — Architecture baseline + route-driven shell
Route/deep-link shell and target navigation, parity adapters, remove normal debug/stage surfaces.

### AR-02 — Overview + Operations split
Attention-first Overview; Governance → Diagnostics; Health/Audit/Diagnostics; backend attention projection.

### AR-03 — Curriculum
Hierarchy browser + entity editor/actions while preserving valid domain contracts.

### AR-04 — Content + OCR
Lesson/content list/detail; source/OCR visual review; lesson publication command; safe source preview.

### AR-05 — Reviews + AI
Human review queue; preserve proven polling/conflict/retry; remove provider/job internals; contextual apply/import.

### AR-06 — Question Bank
Split list/detail/editor/review/history. Preserve lifecycle rules and revision evidence.

### AR-07 — Quiz Builder
Split list/detail/builder/review. Keep candidate/publication authority server-side; contextual exports.

### AR-08 — Students + Access Codes
Separate support/code management; humanize entitlement/device/recovery; contextual files/reports.

### AR-09 — Cleanup + architecture enforcement
Delete verified legacy top-level workspaces, orphan adapters; add duplication/route/status-map coverage.

### AR-10 — A11y/RTL/performance/visual QA
Keyboard/focus/deep-link; responsive RTL; request/pagination/polling audit; Playwright visual smoke; final parity/removal matrix.

## 11. Explicit backend/security invariants

Admin authorization remains server-side; source access cannot expose private storage paths; AI never auto-publishes; human review remains required; question publication requires resolved correct answer; quiz/assessment authority server-controlled; access/device/recovery server-controlled; audit evidence retained.

## 12. Complexity audit

Confirmed root causes include state-driven routing, giant workspaces, implementation details in normal screens, technical AI handoffs, missing source beside OCR, mixed student/code jobs, generic Overview metrics, and task-ID-coupled content publication.

## 13. Verification state at architecture freeze

Verified from source: live main/head, Admin router/workspaces, Fastify composition, Admin auth/read models, content publication contract, Question Bank lifecycle API/service, Quiz lifecycle API, operations contract, brand/admin UX guidance.

Items remain `NOT YET VERIFIED` until implementing batch evidence proves them.

## 14. Execution checkpoints

### AR-06 / Batch 1 — route-owned Question detail — VERIFIED, AR-06 remains ACTIVE

State received:

- AR-05 already DONE / VERIFIED.
- Admin branch started this batch at `2ab2e8c8c16deb26eb8c922d884413244e0813aa`.
- live main was newer because Student work continued independently; no Student/main work was overwritten.
- no previous Admin CI/batch was active before AR-06 changes.

Inventory/classification:

- **KEEP** Question Bank PostgreSQL/API lifecycle authority, revisions/events, publication validation, approved-AI import/regeneration provenance, filters/pagination and existing integration coverage.
- **IMPROVE** human state/context, progressive history/source disclosure, error/retry and deep-link ergonomics.
- **REFACTOR** route/feature ownership into list/detail/editor/review/history.
- **REBUILD** giant `QuestionBankWorkspace.tsx` composition.
- **REMOVE from normal UX** raw checksum/OCR/output/internal identifiers and pipeline/stage terminology, while retaining advanced evidence only where justified.

Implemented:

- new route-owned `apps/admin-web/src/admin/questions/QuestionBankDetailPage.tsx`;
- new `/app/questions/:questionId` route;
- route detail reads existing canonical Question Bank + curriculum APIs;
- submit-review, publish and reject remain server-authoritative;
- normal source evidence shows page/quote/human context rather than checksum/OCR/internal IDs;
- revision and event histories remain available;
- legacy `/app/questions` workspace intentionally remains as a temporary parity adapter until create/import/edit/regenerate ownership is migrated.

Code commits:

- `b52147c8a070a2a7e018562b8d80a62fb4a66023` — add route-owned question detail page.
- `1677770dc6402e4b2825c1b8dd50f546fdf74d0c` — register entity route.

Exact code-head verification on `1677770dc6402e4b2825c1b8dd50f546fdf74d0c`:

- Stage 13E Frontend Preparation `34731668746` — SUCCESS: lint/typecheck/unit/build.
- Stage 13E Combined Integration `34731668810` — SUCCESS: API/Admin quality, clean PostgreSQL migrations, DB contracts, backend authority/security regressions, deterministic fixtures and real Chromium.

Resume point for the next Admin run:

1. Re-read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this checkpoint, then confirm current branch HEAD/CI before editing.
2. Continue AR-06 only; do **not** start AR-07.
3. Make `/app/questions/:questionId` the normal navigation path from the Question Bank list.
4. Incrementally move editor/review/history ownership out of `QuestionBankWorkspace.tsx`, preserving manual create, approved AI import, edit and regeneration parity.
5. Eliminate normal manual technical-ID handoff only when contextual behavior is available; preserve server contracts/authority.
6. Add direct deep-link + routed lifecycle browser coverage.
7. Require exact-head verification before closing AR-06.