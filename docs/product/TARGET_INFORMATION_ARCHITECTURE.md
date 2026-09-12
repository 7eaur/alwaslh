# TARGET INFORMATION ARCHITECTURE — الوسيلة الذكية

Date: **2026-09-12**  
Based on: `UX_UI_MASTER_AUDIT_2026-09-12.md` and live product contracts.

## 1. IA principles

1. **Dashboard ≠ entire product.**
2. Major user jobs receive real routes/screens.
3. Tabs are only for tightly related views of the same entity/workflow.
4. Dialogs/drawers are for short bounded actions, not page-sized workflows.
5. Student navigation is small and stable; Admin navigation is grouped by operational lifecycle.
6. Route structure reflects user/product concepts, not API modules or database entities.
7. Technical identifiers are route parameters internally but are not primary visible labels.
8. Browser back/history/deep links are first-class behavior after routing migration.
9. Existing backend contracts remain unchanged unless separately proven defective.
10. Future roadmap capabilities are not exposed as fake destinations before implementation.

---

# 2. Student IA

Student is an installed educational PWA/app experience.

## 2.1 Stable authenticated destinations

Initial stable navigation should contain **four learning destinations** plus Account access:

- **الرئيسية** — Home
- **التعلّم** — Subjects/Curriculum
- **التدريب** — Practice/Tests
- **بدون إنترنت** — Downloads/Offline library
- **الحساب** — profile/access entry, normally accessed from app header/profile action rather than forcing five bottom-nav items on narrow phones

Do **not** add Personal Learning or Progress to navigation before their roadmap stages exist.

### Mobile

Preferred shell:

- compact app header;
- 4-item bottom navigation for Home / Learn / Practice / Offline;
- Account from avatar/profile action;
- safe-area aware bottom padding;
- Reader/Assessment use focused shells and may hide the global bottom nav while active.

### Tablet/Desktop

- compact side rail or top/side app navigation;
- same destination semantics;
- wider browse layouts where useful;
- Reader retains controlled reading width rather than stretching to desktop viewport width.

## 2.2 Unauthenticated route tree

```text
/activate
/login
/recover
```

Responsibilities:

### `/activate`

- enter activation/access code;
- establish first-time identity/device binding through existing contract;
- explain only what the learner must do;
- route to authenticated Home after success.

### `/login`

- returning-student identifier/password/device proof;
- clear recovery path;
- no cryptography/storage explanation.

### `/recover`

- focused recovery operation;
- final copy explains the next user action, not implementation state.

Auth/session bootstrap/loading is an app state, not a user navigation destination.

## 2.3 Authenticated route tree

```text
/
├── learn
│   └── subjects/:subjectId
│       └── lessons/:lessonId
├── practice
│   ├── quizzes/:quizId
│   └── attempts/:attemptId
├── downloads
└── account
```

Canonical URL naming may be refined during implementation, but the **screen boundaries and ownership below are binding** unless code evidence requires a change.

## 2.4 Home `/`

Purpose: orientation and next useful action.

Allowed content:

- greeting/identity context if supported;
- subjects available to the learner;
- conditional “continue learning” only when reliable resume state exists;
- meaningful offline/download warning or readiness;
- access problem requiring attention;
- concise shortcuts to Learn / Practice / Downloads.

Forbidden:

- fake progress metrics;
- decorative KPIs;
- full curriculum tree;
- full quiz list;
- technical offline/security state;
- account-management forms.

If current data does not support a block, omit it rather than inventing it.

## 2.5 Learn `/learn`

Purpose: choose what to learn.

Content:

- entitled subjects grouped by class context when needed;
- clear subject identity/status;
- lightweight offline availability indicator if known.

No Reader content is rendered here.

## 2.6 Subject `/learn/subjects/:subjectId`

Purpose: navigate one subject.

Content:

- subject title/context;
- sections/lesson sequence from the canonical curriculum contract;
- lesson availability;
- offline/download indicator;
- clear “open lesson” actions.

Do not expose Draft/Review/publication internals. Unavailable content is expressed as learner-facing availability.

## 2.7 Reader `/learn/lessons/:lessonId`

Purpose: focused reading/learning.

Reader shell:

- clear Back target;
- lesson title and optional subject context;
- reading content/media;
- reader controls that directly help learning;
- optional download/offline status action;
- speech/read-aloud controls where supported;
- dedicated loading/error/offline/permission states.

Global bottom navigation may be suppressed while reading to reduce accidental navigation.

The Reader must preserve current server publication/entitlement/protected-media contracts.

`STUDENT-016I` cold-start offline Reader remains separate roadmap work and is not silently implemented by this IA change.

## 2.8 Practice `/practice`

Purpose: choose an available training/test activity.

Content:

- available published quizzes/assessments;
- subject/lesson context useful for selection;
- current actionable state only.

Do not explain server scoring, version/revision architecture or future offline roadmap.

## 2.9 Quiz intro `/practice/quizzes/:quizId`

Use only if the current contract supplies enough meaningful pre-attempt context. Otherwise the list may start an attempt directly.

Potential content:

- title;
- scope/context;
- number of questions if authoritative;
- start action;
- availability/error state.

No fake duration/difficulty unless real data exists.

## 2.10 Active assessment `/practice/attempts/:attemptId`

Purpose: one assessment attempt.

Focused shell:

- question progress;
- question body/options;
- save/next/previous behavior per existing contract;
- explicit finish confirmation;
- recoverable error state;
- result/finalization state from server authority.

Avoid global navigation during active work unless leaving is explicitly handled.

## 2.11 Downloads `/downloads`

Purpose: manage learning content available without internet.

Content:

- downloaded lessons by human title/context;
- download/update/remove actions;
- storage/availability states expressed in user language;
- offline use entry into Reader where supported.

Never display SHA-256, Service Worker, Cache API, signature, revision or storage-key implementation details.

## 2.12 Account `/account`

Purpose: identity/access/recovery-related user tasks.

Content from currently implemented contracts only:

- learner display identity where supported;
- access/class-code operations;
- account/device recovery actions when actually available;
- logout.

Entitlement internals become user concepts such as “الوصول إلى الصف” / “الوصول ساري” / “انتهت صلاحية الوصول”.

---

# 3. Super Admin IA

Super Admin is an operational workspace. Global navigation is grouped by operator job/lifecycle rather than one flat list.

## 3.1 Global navigation groups

```text
Overview

Curriculum
  ├─ Classes & Subjects
  └─ Lessons (contextual/detail-driven)

Content
  ├─ Library
  ├─ Ingestion
  └─ OCR Review

AI & Review
  ├─ AI Jobs
  └─ AI Review Queue

Questions & Tests
  ├─ Question Bank
  └─ Quizzes

Students & Access
  ├─ Students
  └─ Access Codes

Operations
  ├─ Notifications
  ├─ Audit
  └─ System Status (only actionable technical diagnostics)
```

Top-level UI labels should remain concise. Group labels may collapse on narrower desktop layouts but destinations keep the same URL semantics.

## 3.2 Route tree

```text
/admin
├── curriculum
│   ├── classes
│   │   └── :classId
│   ├── offerings/:offeringId
│   └── lessons/:lessonId
├── content
│   ├── library
│   │   └── :documentId
│   ├── ingestion
│   │   ├── new
│   │   └── :taskId
│   └── ocr
│       └── :reviewItemId
├── ai
│   ├── jobs
│   │   └── :jobId
│   └── review
│       └── :outputId
├── questions
│   ├── new
│   └── :questionId
├── quizzes
│   ├── new
│   └── :quizId
│       └── versions/:versionId/edit
├── students
│   └── :studentId
├── access
│   └── codes
│       └── files
└── operations
    ├── notifications
    ├── audit
    └── status
```

Exact route params must use existing canonical IDs internally. URLs do not authorize access; API authorization remains server-owned.

## 3.3 Admin dashboard `/admin`

Purpose: “What needs my attention now?”

Allowed blocks:

- review queues requiring action;
- failed/blocked ingestion or AI jobs;
- recent meaningful operational changes;
- access/account problems requiring attention;
- concise shortcuts to frequent workflows;
- health/capacity only when actionable.

Not allowed:

- all forms;
- full curriculum browser;
- Question Bank table;
- full student table;
- configuration dump;
- decorative metrics;
- stage/build/repository/cache commentary.

## 3.4 Curriculum

### Classes `/admin/curriculum/classes`

- class list/search/status;
- create class as short dialog/page;
- subject/offering summary;
- select class into detail.

### Class detail `/admin/curriculum/classes/:classId`

- class metadata/status;
- offerings/subjects;
- ordering/configuration relevant to this class;
- lessons/sections summarized contextually.

### Offering detail `/admin/curriculum/offerings/:offeringId`

- subject-in-class configuration;
- sections/order;
- lesson list;
- create lesson action.

### Lesson detail `/admin/curriculum/lessons/:lessonId`

Canonical owner of lesson-level operations:

- title/summary/content metadata;
- publication-related state from existing contracts;
- linked source/media summary;
- contextual AI generation entry;
- contextual content/history export;
- editing capabilities currently stranded in `LessonAuthoringParityPanel`.

“Lesson parity” must disappear after migration.

## 3.5 Content

### Library `/admin/content/library`

- document list/filter/search;
- readiness/publication-relevant human status;
- source/context needed for content management.

### Document detail `/admin/content/library/:documentId`

- document identity/context;
- media/assets;
- linked lesson/content status;
- technical source path/MIME only under advanced details if needed.

### Ingestion `/admin/content/ingestion`

- task list with meaningful states;
- create/import action;
- failures needing attention.

### New ingestion `/admin/content/ingestion/new`

- source/file selection;
- upload/task creation;
- clear statement that upload/ready does not publish content.

### Ingestion task `/admin/content/ingestion/:taskId`

- progress/status;
- validation/linking results;
- errors/recovery;
- publication transition only through existing safe contract.

### OCR review `/admin/content/ocr`

- review queue/filter;
- clear source/page/lesson context;
- confidence/status only when useful;
- row opens focused review item.

## 3.6 AI & Human Review

### Jobs `/admin/ai/jobs`

- bounded paginated job list;
- state/filter/attention indicators;
- no raw provider response.

### Job detail `/admin/ai/jobs/:jobId`

- human-readable task context;
- units/attempts/output state;
- technical metadata in a collapsed diagnostics area only when required.

### Review queue `/admin/ai/review`

- outputs needing human decision;
- filters by useful domain context/status;
- row/detail opens review item.

### Review detail `/admin/ai/review/:outputId`

- generated content/question output;
- provenance and source context sufficient for trust;
- approve/reject actions according to current contract;
- next transition explained in domain language;
- never implies approval equals publication.

### Contextual authoring

The catch-all `AdminAiAuthoringWorkspace` should not remain a first-class destination after migration.

- Lesson generation belongs on Lesson detail;
- Quiz generation belongs on Quiz flow;
- Question regeneration belongs on Question detail;
- job execution/review belongs under AI & Review.

## 3.7 Question Bank

### List `/admin/questions`

- table/list;
- search/filter/sort/pagination;
- statuses mapped to product language;
- create question action.

### New `/admin/questions/new`

- focused creation form.

### Detail `/admin/questions/:questionId`

- question content/options/answer/domain context;
- revision/review lifecycle represented as product states;
- edit where allowed;
- submit/reject/publish actions;
- contextual AI regeneration action;
- raw output IDs not required from normal user flow.

## 3.8 Quizzes

### List `/admin/quizzes`

- search/filter/status;
- create quiz;
- row to detail.

### New `/admin/quizzes/new`

- focused metadata + curriculum scope selection.

### Detail `/admin/quizzes/:quizId`

- title/description/status;
- lifecycle actions;
- version list;
- metadata editing currently handled by `QuizMetadataPanel` when draft;
- contextual AI generation where contract allows.

### Version editor `/admin/quizzes/:quizId/versions/:versionId/edit`

- candidate question search;
- selected question order/contents;
- shuffle option;
- save/replace operation.

Published immutable version contracts remain unchanged.

## 3.9 Students & Access

### Students `/admin/students`

- search/status/sort;
- table/list optimized for scan;
- flags for access/recovery attention;
- open student detail.

### Student detail `/admin/students/:studentId`

- identity/account status;
- active access;
- device/recovery state;
- temporary password/rebind/revoke actions with explicit confirmation/recovery;
- event history only when useful to this student.

### Access codes `/admin/access/codes`

- list/filter/status/type;
- generation/revocation;
- class context when applicable.

### Access files `/admin/access/codes/files`

Moves current `AdminReportsWorkspace` capability here:

- CSV template;
- import and row errors;
- export;
- print cards.

The top-level “الملفات والتقارير” destination is removed.

## 3.10 Operations

### Notifications `/admin/operations/notifications`

- operational notification list/actions from existing contract.

### Audit `/admin/operations/audit`

- actor/domain/event/date filters using human labels;
- audit rows optimized for investigation;
- raw IDs/event keys available only as secondary technical detail when needed.

### System status `/admin/operations/status`

Only actionable diagnostics required by the operational owner.

Do not make database SSL/pool/cookie SameSite/config dumps the default page. Diagnostics that cannot produce an operator decision should not be displayed.

---

# 4. Contextual navigation rules

## Breadcrumbs

Use only when there is real depth, e.g.:

`المناهج / الصف التاسع / اللغة الإنجليزية / الدرس`

Avoid breadcrumbs for one-level destinations such as Dashboard or Student Home.

## Tabs

Allowed examples:

- same Student detail: Overview / Access / Events, only if each view remains the same student job context;
- same Lesson detail: Content / Media / History, if the data volume justifies it.

Not allowed:

- Students vs Access Codes;
- Dashboard vs Notifications;
- Curriculum vs AI;
- unrelated creation/review flows grouped because they share a backend module.

## Dialogs

Good uses:

- confirm destructive archive/revoke;
- short create/rename operation;
- choose a small set of options.

Bad uses:

- full ingestion workflow;
- full question editor;
- quiz version builder;
- OCR/AI review of substantial content.

---

# 5. Migration rule

The target IA will be introduced incrementally. Existing APIs/controllers remain usable while screen boundaries move.

Order:

1. routing + shells;
2. Student aggregate page split;
3. Admin global nav grouping;
4. object/detail route extraction by workflow family;
5. contextual migration of parity/AI-authoring operations;
6. remove legacy surfaces only after E2E parity is proven.

No route migration is accepted if it breaks security, publication, assessment or offline authority contracts.