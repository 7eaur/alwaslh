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

It may include:

- content/OCR waiting for review;
- AI outputs waiting for human review;
- question/quiz review queues;
- failed ingestion/OCR/AI jobs;
- student/access exceptions needing intervention;
- recent high-value operational activity.

Generic row counts are secondary and must not dominate.

## 6. Target workflows

### Curriculum

Entry: Curriculum list/tree.
List: class/subject/offering/section/lesson hierarchy with human names and statuses.
Detail: selected entity and children.
Primary actions: create child, edit metadata, change supported lifecycle state.
History: contextual only.
Failure: inline validation and conflict refresh.

### Content

Entry: lesson/content list or curriculum lesson action.
Normal lifecycle presentation: **Source → Processing → Review → Ready → Publish** only where backed by actual domain state.
Detail: lesson, source files/pages, processing outcome, review readiness, publication state.
Primary action: import/upload or review/publish as allowed.
Advanced diagnostics: ingestion task IDs, asset IDs, source paths, MIME, hashes, raw error codes.

### OCR / source review

Entry: review queue or lesson content detail.
Review surface must show the source page/image beside extracted/editable text whenever the source can be rendered.
Primary actions: approve/edit/reject/retry as supported by server contracts.

### AI

Entry: contextual action from lesson/question/quiz OR central Reviews queue for pending result.
Normal flow: request → working → review result → edit if allowed → approve/reject → apply/import.
No manual job/output-ID handoff.
Provider/runtime details live only under Operations > Diagnostics.

### Questions

Entry: Question Bank list.
List: prompt preview, scope, type, difficulty, origin, human lifecycle status.
Detail/editor: content + lesson/source evidence.
Review: focused decision surface.
Primary actions depend on state: edit, submit for review, publish, return/reject, regenerate contextually.
History: revisions/events drawer/tab.

### Quiz

Entry: quiz list.
Detail: scope/title/status/version summary.
Builder: select published question candidates, arrange versions, shuffle options/settings.
Review: final quiz/version composition before publication.
Exports: contextual after/within quiz detail, not global Reports.

### Students

Entry: searchable/paginated student list.
Detail: identity, current access summary, device/recovery state, recent support-relevant activity.
Primary actions: supported recovery/device/access actions only.
Technical entitlement/source IDs are contextual/advanced.

### Access Codes

Entry: code batches/codes list.
Primary jobs: import/generate where supported, search/filter, inspect state, revoke eligible unused codes.
Bulk selection and export belong here; do not mix with student support detail.

### Operations

Health: actionable failures and attention queues.
Audit: filterable audit trail with human actor/resource labels.
Diagnostics: runtime/config/session/AI routing/provider/internal identifiers.

## 7. Backend changes required

### B1 — Admin attention summary

Add/reshape a use-case endpoint for Overview that returns actionable queue counts/items rather than only generic metrics. Existing metrics may remain diagnostics/secondary.

### B2 — Lesson/content publication command

The current publication route is ingestion-task-bound while source-imported lesson assets can exist without an ingestion task. Introduce a lesson/content publication use-case command that resolves internal task/assets/revisions server-side and enforces the existing publication authority. Do not ask the UI to synthesize internal IDs.

### B3 — OCR review projection

Expose a renderable source reference/preview contract for the review surface without leaking storage paths. Preserve authorization and media-access boundaries.

### B4 — AI apply/import commands

Replace manual cross-workspace `jobId`/`outputId` handoffs with contextual commands/actions from an approved result. Preserve idempotency, provenance, review revision, and validation internally.

### B5 — Humanized Admin read models

Where ordinary screens currently need multiple lookups or raw IDs, add thin Admin read models/use-case responses with human labels and next-action state. Do not duplicate business authority in the frontend.

No microservices or new generic backend layer is justified.

## 8. Frontend architecture

Target boundaries:

```text
src/admin/
  shell/
    AdminShell.tsx
    admin-navigation.ts
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
    StatusBadge.tsx
    DataTable.tsx
    FilterBar.tsx
    EmptyState.tsx
    ErrorState.tsx
    ConfirmDialog.tsx
  api/
    adapters by feature/use case
  view-models/
    feature-specific projections only
```

Rules:

- Route owns the page.
- Feature owns its workflow state.
- API adapters translate server contracts; components do not assemble pipeline internals.
- Reusable primitives are extracted only when semantics match.
- No component owns list + create + edit + review + export simultaneously.
- Server state remains server-owned; local state is for transient UI/editor state.
- Deep links are mandatory for primary destinations and entity detail.

During incremental migration, old workspaces may be mounted behind target routes strictly as parity adapters; each is removed as its target feature is rebuilt.

## 9. Admin design-system rules

- RTL-first and keyboard accessible.
- Cairo/brand tokens from `@alwaslh/brand`/`@alwaslh/ui`; no new unrelated visual identity.
- Dense but readable administration UI.
- Tables/lists for operational collections; cards only when they add hierarchy, not as a default container.
- One obvious primary action per screen/context.
- Secondary/destructive actions de-emphasized and confirmed when needed.
- Statuses use a shared humanized mapping and consistent semantic treatment.
- Filters stay near their list and are URL/search-param friendly when useful.
- Forms group fields by user decision, not database table columns.
- Dialogs for short, reversible/confirmatory tasks; pages/routes for complex editable workflows; drawers for contextual history/detail when they do not need independent deep linking.
- Loading/empty/error/success/retry states are first-class.
- No gradients/glass/glow/decorative animation.
- Respect reduced motion.
- Minimum practical touch/focus targets and visible `:focus-visible` states.
- Mobile/tablet: sidebar collapses to a usable navigation control; tables degrade deliberately instead of horizontal chaos.

## 10. Implementation roadmap

### AR-01 — Architecture baseline + route-driven shell

- Freeze this target architecture document.
- Replace local workspace `useState` navigation with real routes/links.
- Reduce sidebar to target work areas/destinations.
- Preserve parity by mounting legacy workspace adapters under temporary target routes.
- Remove stage/parity/debug panels from normal shell.
- Add route/deep-link tests.

Verification: lint, typecheck, unit, build, route tests, visual/keyboard smoke test.

### AR-02 — Overview + Operations split

- Build attention-first Overview.
- Move governance to Diagnostics.
- Separate Health / Audit / Diagnostics.
- Add backend attention-summary projection.

### AR-03 — Curriculum

- Split giant workspace into hierarchy browser + entity editor/actions.
- Keep existing curriculum domain contracts unless a tested use-case gap is proven.

### AR-04 — Content + OCR

- Build lesson/content list/detail.
- Build source/OCR visual review.
- Introduce lesson/content publication command and safe source-preview contract.

### AR-05 — Reviews + AI

- Build human review queue.
- Keep proven polling/conflict/retry mechanics.
- Remove provider/job internals from normal review.
- Add contextual apply/import actions.

### AR-06 — Question Bank

- Split list/detail/editor/review/history.
- Preserve server lifecycle rules and revision evidence.

### AR-07 — Quiz Builder

- Split list/detail/builder/review.
- Keep question-candidate and publication authority server-side.
- Move exports into quiz context.

### AR-08 — Students + Access Codes

- Separate student support and code management routes.
- Humanize entitlement/device/recovery data.
- Move reports/files into owning access-code context.

### AR-09 — Cleanup + architecture enforcement

- Delete legacy top-level workspaces once parity is verified.
- Remove orphan API/UI adapters.
- Add duplication/route/status-map regression coverage.

### AR-10 — A11y/RTL/performance/visual QA

- keyboard/focus/deep-link pass;
- responsive RTL pass;
- request/pagination/polling payload audit;
- Playwright visual workflow smoke tests;
- final parity matrix and removal decisions.

## 11. Explicit backend/security invariants

Must remain server-authoritative unless separately proven wrong:

- Admin authorization is not a frontend-only check.
- Media/source access cannot expose private storage paths as public authority.
- AI output does not publish automatically.
- Human review remains required where current domain rules require it.
- Question publication requires a resolved/known correct answer.
- Quiz publication and assessment authority remain server-controlled.
- Access entitlement/device/recovery rules remain server-controlled.
- Audit evidence is retained for sensitive changes.

## 12. Complexity audit

Confirmed root causes:

1. `/app/*` is routed to one `App`, while real workspace navigation is local `useState`; deep links do not exist.
2. Giant workspaces combine unrelated list/create/edit/review/history/export responsibilities.
3. Normal screens expose implementation details (IDs, hashes, paths, raw statuses, provider/runtime data).
4. AI authoring requires cross-workspace technical handoff (`jobId` / `outputId`).
5. OCR review does not show the visual source beside extracted text.
6. Student support and bulk code operations share one workspace despite being distinct jobs.
7. Generic Overview metrics reflect data counts more than actionable attention.
8. Content publication is coupled to ingestion task identity, which does not cover all imported lesson assets.

## 13. Verification state at architecture freeze

Verified from source:

- live `main` and head SHA;
- Admin router/App/workspaces;
- Fastify application wiring;
- Admin access authorization and read models;
- content ingestion publication contract;
- Question Bank lifecycle API/service;
- Quiz Builder lifecycle API;
- Operations overview/governance/audit contract;
- brand/admin UX guidance and prior audit evidence.

NOT YET VERIFIED for this rebuild branch:

- runtime visual QA after AR-01 changes;
- branch CI after AR-01 changes;
- production AI worker wiring re-audit;
- final exact source-preview transport contract;
- final exact lesson-level publication endpoint shape;
- full old-to-new parity after later batches.

These items must not be treated as complete until their implementing batch is verified.