# Full Product Architecture Inventory — 2026-09-12

Baseline: `3eb6b18ac5f403cb10463864c3c4b9e86f68b249`.

This is a complete lexical inventory of current application surfaces and executable declarations, not proof of exhaustive semantic or browser verification. Manual conclusions and `NOT YET VERIFIED` boundaries are in the main audit. Counts describe source declarations, not rendered instances. Evidence can be regenerated with `rg --files` and the patterns described in each section.

## Admin surfaces

| Surface | Lines | Forms | Inputs/selects/textareas | Buttons | State declarations |
| --- | ---: | ---: | ---: | ---: | ---: |
| `AdminAiAuthoringWorkspace.tsx` | 1057 | 2 | 16 | 13 | 23 |
| `AdminGovernanceWorkspace.tsx` | 462 | 1 | 2 | 6 | 10 |
| `AdminOperationsWorkspace.tsx` | 512 | 2 | 7 | 11 | 19 |
| `AdminReportsWorkspace.tsx` | 444 | 1 | 5 | 6 | 14 |
| `AdminStudentAccessWorkspace.tsx` | 989 | 3 | 13 | 14 | 31 |
| `AiOperationsPage.tsx` | 367 | 0 | 0 | 0 | 13 |
| `AiOperationsWorkspace.tsx` | 517 | 0 | 3 | 14 | 4 |
| `App.tsx` | 295 | 0 | 0 | 13 | 4 |
| `ContentIngestionWorkspace.tsx` | 591 | 1 | 3 | 10 | 10 |
| `ContentOperationsWorkspace.tsx` | 360 | 1 | 5 | 9 | 13 |
| `CurriculumWorkspace.tsx` | 1030 | 7 | 21 | 9 | 6 |
| `LessonAuthoringParityPanel.tsx` | 251 | 0 | 6 | 8 | 10 |
| `LoginScreen.tsx` | 73 | 1 | 2 | 1 | 2 |
| `QuestionBankWorkspace.tsx` | 986 | 5 | 20 | 22 | 18 |
| `QuizBuilderWorkspace.tsx` | 1135 | 3 | 15 | 24 | 23 |
| `QuizMetadataPanel.tsx` | 155 | 0 | 4 | 2 | 7 |
| `main.tsx` | 23 | 0 | 0 | 0 | 0 |
| `presentation-foundation.tsx` | 65 | 0 | 0 | 0 | 0 |
| `router.tsx` | 44 | 0 | 0 | 0 | 0 |

Each surface below records handler declarations, state identifiers, API modules and technical presentation signals. Full field semantics must be reviewed in its actual workflow; `rendered-field signals` are triage evidence rather than an automatic HIDE decision.

### AdminAiAuthoringWorkspace.tsx
- Source: `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx`.
- Actions/components: `AdminAiAuthoringWorkspace`, `CountField`, `DomainField`, `LessonGenerationPanel`, `LessonPicker`, `TargetFields`, `TargetNumber`, `VersionEditor`, `applyOutput`, `archiveQuestion`, `chooseExportQuiz`, `chooseQuiz`, `downloadCsv`, `messageFor`, `newVersion`, `onRemove`, `onSubmit`, `openPrint`, `patchVersion`, `regenerateQuestion`, `submitLessonGeneration`, `submitQuizGeneration`, `targetCount`.
- State: `curriculum`, `quizzes`, `questions`, `loading`, `busy`, `feedback`, `domain`, `classId`, `subjectId`, `lessonIds`, `lessonMode`, `lessonTarget`, `lessonExpectedCount`, `applyOutputId`, `quizId`, `quizDetail`, `quizMode`, `versionDrafts`, `questionId`, `exportQuizId`, `exportDetail`, `exportVersionIds`, `printVariant`, `curriculumResult`.
- API modules: `./admin-api`, `./admin-ai-authoring-api`, `./question-bank-api`, `./quiz-builder-api`.
- Rendered-field triage line locations: 203, 224, 237, 306, 327, 433, 459, 460, 463, 479, 501, 502, 510, 511, 518, 519, 541, 544, 627, 630, 631, 640, 641, 648, 649, 670, 671, 675, 713, 721, 724, 744, 745, 752, 791, 792, 822, 827, 836, 837, 842, 863, 868, 905, 914, 917, 943, 977, 978, 992.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### AdminGovernanceWorkspace.tsx
- Source: `apps/admin-web/src/AdminGovernanceWorkspace.tsx`.
- Actions/components: `AdminGovernanceWorkspace`, `AuditRow`, `CountRow`, `GovernanceSummary`, `ReportCard`, `SettingRow`, `applyAuditFilters`, `errorMessage`, `eventLabel`, `formatDate`, `numberLabel`, `sourceLabel`.
- State: `governanceState`, `auditState`, `governance`, `auditEntries`, `auditTotal`, `message`, `source`, `eventTypeInput`, `eventType`, `offset`.
- API modules: `./admin-api`, `./admin-operations-api`.
- Rendered-field triage line locations: 355, 369, 426, 435.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### AdminOperationsWorkspace.tsx
- Source: `apps/admin-web/src/AdminOperationsWorkspace.tsx`.
- Actions/components: `AdminOperationsWorkspace`, `NotificationsPanel`, `OperationsOverviewPanel`, `WorkspaceState`, `activityLabel`, `errorMessage`, `formatDate`, `onRetry`, `remove`, `severityLabel`, `submitCreate`.
- State: `tab`, `state`, `overview`, `message`, `searchInput`, `search`, `severity`, `offset`, `state`, `notifications`, `total`, `feedback`, `pendingDeleteId`, `title`, `body`, `createSeverity`, `actionPath`, `expiresLocal`, `submitting`.
- API modules: `./admin-api`, `./admin-operations-api`.
- Rendered-field triage line locations: 119, 148, 182, 213, 234, 252, 400, 448, 465, 469, 470.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### AdminReportsWorkspace.tsx
- Source: `apps/admin-web/src/AdminReportsWorkspace.tsx`.
- Actions/components: `AdminReportsWorkspace`, `codesForAction`, `downloadTemplate`, `downloadText`, `errorMessage`, `exportCsv`, `exportScope`, `loadSelection`, `preparePrint`, `readImportFile`, `runImport`, `statusLabel`, `toggleSelected`, `typeLabel`.
- State: `classes`, `feedback`, `selectedFileName`, `importRows`, `localErrors`, `serverErrors`, `importSummary`, `type`, `status`, `classId`, `scopeCodes`, `selectedIds`, `printCodes`, `printRequested`.
- API modules: `./admin-api`, `./admin-access-files-api`, `./admin-student-access-api`.
- Rendered-field triage line locations: 61, 99, 175, 176, 213, 298, 312, 365, 376, 379, 385, 388, 391, 401, 403, 410, 413, 414, 418, 430, 434, 437.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### AdminStudentAccessWorkspace.tsx
- Source: `apps/admin-web/src/AdminStudentAccessWorkspace.tsx`.
- Actions/components: `AccessCodesPanel`, `AdminStudentAccessWorkspace`, `DetailSection`, `Pagination`, `StudentsPanel`, `SummaryMetric`, `WorkspaceState`, `errorMessage`, `eventLabel`, `formatDate`, `generateCodes`, `issueTemporaryPassword`, `mutateStudent`, `onNext`, `onPrevious`, `refreshSelected`, `revokeSelected`, `selectStudent`, `statusLabel`.
- State: `tab`, `classes`, `searchInput`, `search`, `status`, `sort`, `offset`, `state`, `students`, `total`, `selectedId`, `detail`, `detailState`, `feedback`, `temporaryPassword`, `type`, `status`, `searchInput`, `search`, `classId`, `sort`, `offset`, `state`, `codes`, `total`, `selectedIds`, `feedback`, `generatedCodes`, `generateCount`, `durationDays`, `generateClassId`.
- API modules: `./admin-api`, `./admin-student-access-api`.
- Rendered-field triage line locations: 90, 98, 149, 180, 309, 345, 355, 357, 358, 359, 362, 363, 364, 367, 402, 403, 405, 434, 458, 466, 495, 500, 515, 533, 552, 588, 590, 656, 657, 658, 720, 736, 739, 783, 786, 839, 849, 850, 852, 860, 871, 876, 891, 901.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### AiOperationsPage.tsx
- Source: `apps/admin-web/src/AiOperationsPage.tsx`.
- Actions/components: `AiOperationsPage`, `messageFor`.
- State: `state`, `errorMessage`, `jobs`, `jobPagination`, `selectedJobId`, `selectedJobState`, `selectedJobError`, `selectedJob`, `selectedUnitId`, `selectedUnitState`, `selectedUnitError`, `isRefreshing`, `feedback`.
- API modules: `./admin-api`, `./ai-operations-api`.
- Rendered-field triage line locations: 356, 357, 358, 363.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### AiOperationsWorkspace.tsx
- Source: `apps/admin-web/src/AiOperationsWorkspace.tsx`.
- Actions/components: `AiOperationsWorkspace`, `AttemptCard`, `Evidence`, `Fact`, `IssueList`, `JobCard`, `JobDetail`, `Metric`, `OutputBody`, `PaginationControls`, `QuestionList`, `ReviewOutput`, `SourceProvenance`, `StatePanel`, `UnitDetail`, `formatDateTime`, `onRefresh`, `onSelect`, `openEdit`, `openReject`, `statusClass`, `submitEdit`, `submitReject`.
- State: `mode`, `editedJson`, `note`, `clientError`.
- API modules: `./ai-operations-api`.
- Rendered-field triage line locations: 116, 127, 152, 157, 196, 197, 210, 218, 229, 231, 254, 278, 280, 283, 285, 288, 294, 299, 300, 305, 318, 319, 330, 331, 400, 401, 408, 413, 414, 423, 448, 456, 489, 495, 500, 501, 503, 508, 511, 512.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### App.tsx
- Source: `apps/admin-web/src/App.tsx`.
- Actions/components: `AdminShell`, `App`, `BrandBlock`, `FullPageState`, `errorMessage`.
- State: `session`, `sessionState`, `sessionError`, `workspace`.
- API modules: `./admin-api`.
- Rendered-field triage line locations: 20, 71, 257.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### ContentIngestionWorkspace.tsx
- Source: `apps/admin-web/src/ContentIngestionWorkspace.tsx`.
- Actions/components: `ContentIngestionWorkspace`, `Metric`, `TaskDetail`, `WorkspaceState`, `errorMessage`, `formattedBytes`, `onArchive`, `onLink`, `onProcess`, `onPublish`, `onReturnDraft`, `onSubmitReview`, `publicationLabel`, `taskStatusLabel`, `validateFiles`.
- State: `curriculum`, `history`, `selectedTask`, `selectedLessonId`, `files`, `includeArchived`, `loadState`, `busyAction`, `feedback`, `uploadedFileCount`, `nextCurriculum`.
- API modules: `./admin-api`, `./content-ingestion-api`.
- Rendered-field triage line locations: 83, 150, 179, 190, 261, 279, 285, 301, 305, 306, 312, 435, 437, 439, 442, 494, 508, 515, 525, 532, 565.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### ContentOperationsWorkspace.tsx
- Source: `apps/admin-web/src/ContentOperationsWorkspace.tsx`.
- Actions/components: `ContentOperationsWorkspace`, `Metric`, `StatePanel`, `formatBytes`, `mediaLabel`, `messageFor`, `reviewLabel`, `submitFilters`.
- State: `overview`, `filters`, `appliedFilters`, `offset`, `state`, `error`, `detail`, `detailState`, `detailError`, `ocr`, `ocrState`, `ocrError`, `replacementText`.
- API modules: `./admin-api`, `./content-operations-api`.
- Rendered-field triage line locations: 198, 250, 265, 285, 289, 296, 301, 305, 306, 307, 326, 335, 342, 343.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### CurriculumWorkspace.tsx
- Source: `apps/admin-web/src/CurriculumWorkspace.tsx`.
- Actions/components: `CreateClassForm`, `CreateLessonForm`, `CreateOfferingForm`, `CreateSectionForm`, `CreateSubjectForm`, `CurriculumWorkspace`, `LessonList`, `Metric`, `MutationFeedback`, `OfferingWorkspace`, `PositionForm`, `RenameForm`, `SectionCard`, `StatusSelect`, `WorkspaceState`, `errorMessage`, `fieldNumber`, `fieldString`, `statusLabel`, `submit`.
- State: `snapshot`, `loadState`, `loadError`, `actionState`, `selectedClassId`, `selectedSubjectId`.
- API modules: `./admin-api`.
- Rendered-field triage line locations: 53, 60, 155, 179, 226, 228, 229, 237, 238, 243, 244, 255, 262, 265, 296, 297, 304, 309, 313, 320, 329, 338, 347, 379, 386, 416, 457, 482, 507, 516, 529, 601, 604, 610, 612, 616, 618, 638, 640, 643, 646, 664, 701, 754, 770, 817, 826, 828, 834, 840, 847, 878, 886, 891, 893, 899, 901, 907, 917, 923, 950, 953, 954, 984, 1019.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### LessonAuthoringParityPanel.tsx
- Source: `apps/admin-web/src/LessonAuthoringParityPanel.tsx`.
- Actions/components: `LessonAuthoringParityPanel`, `asIso`, `downloadText`, `exportBundle`, `message`, `saveSummary`.
- State: `lessons`, `lessonId`, `summary`, `historySource`, `eventType`, `from`, `to`, `state`, `notice`, `confirmClear`.
- API modules: `./admin-api`, `./lesson-authoring-parity-api`.
- Rendered-field triage line locations: 37, 143, 157, 159, 165, 185, 200, 236, 239, 242.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### LoginScreen.tsx
- Source: `apps/admin-web/src/LoginScreen.tsx`.
- Actions/components: `LoginScreen`, `errorMessage`, `formValue`, `submit`.
- State: `pending`, `message`.
- API modules: `./admin-api`.
- Rendered-field triage line locations: 15, 52.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### QuestionBankWorkspace.tsx
- Source: `apps/admin-web/src/QuestionBankWorkspace.tsx`.
- Actions/components: `EditorPanel`, `QuestionBankWorkspace`, `QuestionCard`, `QuestionDetail`, `QuestionFields`, `ScopeFields`, `StatePanel`, `answerStatusLabel`, `applyFilters`, `beginEdit`, `beginImport`, `beginManual`, `beginRegenerate`, `changeAnswerStatus`, `changeType`, `difficultyLabel`, `eventLabel`, `lifecycle`, `localDate`, `messageFor`, `normalizedDraft`, `onClose`, `onEdit`, `onOpen`, `onPublish`, `onRegenerate`, `onReject`, `onSubmit`, `originLabel`, `statusLabel`, `submitImport`, `submitQuestion`, `submitRegeneration`, `typeLabel`, `updateOption`, `validateDraft`.
- State: `curriculum`, `items`, `pagination`, `filters`, `appliedFilters`, `offset`, `state`, `error`, `detail`, `detailState`, `detailError`, `editorMode`, `questionDraft`, `scopeDraft`, `outputId`, `rejectNote`, `mutationState`, `mutationFeedback`.
- API modules: `./admin-api`, `./question-bank-api`.
- Rendered-field triage line locations: 118, 128, 159, 160, 162, 245, 251, 266, 288, 409, 435, 438, 442, 447, 449, 454, 504, 523, 544, 550, 563, 569, 576, 577, 578, 587, 592, 595, 597, 598, 599, 635, 638, 642, 644, 645, 646, 652, 658, 659, 660, 688, 695, 697, 699, 709, 712, 713, 725, 739, 742, 743, 771, 773, 778, 780, 785, 787, 790, 823, 829, 830, 832, 873, 924.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### QuizBuilderWorkspace.tsx
- Source: `apps/admin-web/src/QuizBuilderWorkspace.tsx`.
- Actions/components: `EditorPanel`, `QuizBuilderWorkspace`, `QuizDetail`, `StatePanel`, `applyFilters`, `changeCandidatePage`, `deleteVersion`, `difficultyLabel`, `exportVersion`, `lifecycle`, `localDate`, `messageFor`, `onAddVersion`, `onArchive`, `onClose`, `onPublish`, `onReject`, `onSubmit`, `openVersionEditor`, `refreshAfterMutation`, `searchCandidates`, `statusLabel`, `submitCreate`, `submitVersion`, `toggleCandidate`, `typeLabel`.
- State: `curriculum`, `items`, `pagination`, `filters`, `appliedFilters`, `offset`, `listState`, `listError`, `detail`, `detailState`, `detailError`, `createOpen`, `quizDraft`, `versionEditor`, `candidates`, `candidatePagination`, `candidateSearch`, `candidateOffset`, `candidateState`, `candidateError`, `rejectNote`, `mutationState`, `feedback`.
- API modules: `./admin-api`, `./quiz-builder-api`.
- Rendered-field triage line locations: 104, 154, 155, 156, 338, 360, 487, 524, 527, 532, 541, 542, 546, 555, 557, 601, 614, 623, 631, 636, 646, 649, 704, 717, 719, 720, 723, 772, 773, 774, 775, 776, 777, 778, 779, 826, 827, 834, 835, 848, 865, 870, 873, 875, 876, 878, 892, 899, 903, 904, 964, 965, 985, 1024, 1030, 1051, 1062, 1070, 1080, 1101, 1113.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### QuizMetadataPanel.tsx
- Source: `apps/admin-web/src/QuizMetadataPanel.tsx`.
- Actions/components: `QuizMetadataPanel`, `message`, `save`.
- State: `quizzes`, `quizId`, `title`, `description`, `shuffleVersions`, `state`, `notice`.
- API modules: `./admin-api`, `./quiz-builder-api`.
- Rendered-field triage line locations: 15, 97, 111, 113, 119, 146.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### main.tsx
- Source: `apps/admin-web/src/main.tsx`.
- Actions/components: none declared.
- State: none declared.
- API modules: none imported directly.
- Rendered-field triage line locations: none matched.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### presentation-foundation.tsx
- Source: `apps/admin-web/src/presentation-foundation.tsx`.
- Actions/components: `AdminProductShell`, `PageState`, `RouteFocus`.
- State: none declared.
- API modules: none imported directly.
- Rendered-field triage line locations: none matched.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

### router.tsx
- Source: `apps/admin-web/src/router.tsx`.
- Actions/components: `AdminAppRoute`, `AdminNotFoundRoute`, `AdminRouter`.
- State: none declared.
- API modules: none imported directly.
- Rendered-field triage line locations: none matched.
- Exhaustive live forms/dialogs/focus/visual verification: **NOT YET VERIFIED**.

## Student surfaces

| Source | Lines | Forms | State declarations |
| --- | ---: | ---: | ---: |
| `apps/student-web/src/App.tsx` | 828 | 4 | 20 |
| `apps/student-web/src/main.tsx` | 28 | 0 | 0 |
| `apps/student-web/src/presentation-foundation.tsx` | 65 | 0 | 0 |
| `apps/student-web/src/router.tsx` | 45 | 0 | 0 |
| `apps/student-web/src/student-access.tsx` | 528 | 1 | 7 |
| `apps/student-web/src/student-assessment.tsx` | 657 | 0 | 12 |
| `apps/student-web/src/student-learning.tsx` | 310 | 0 | 1 |
| `apps/student-web/src/student-offline-downloads.tsx` | 342 | 0 | 5 |
| `apps/student-web/src/student-reader.tsx` | 251 | 0 | 5 |

## API route declarations

Pattern: `app.(get|post|put|patch|delete)` including multiline arguments. Authorization is assessed in handler/service context, not inferred from URL prefix.

| Method | Route | Source |
| --- | --- | --- |
| POST | `/v1/admin/access/full-codes` | `apps/api/src/access/http.ts:33` |
| POST | `/v1/admin/access/class-codes` | `apps/api/src/access/http.ts:44` |
| POST | `/v1/student/access/redeem` | `apps/api/src/access/http.ts:56` |
| GET | `/v1/student/access/entitlements` | `apps/api/src/access/http.ts:63` |
| POST | `/v1/admin/access/entitlements/:entitlementId/revoke` | `apps/api/src/access/http.ts:69` |
| POST | `/v1/student/activation/verify` | `apps/api/src/activation/http.ts:27` |
| POST | `/v1/student/activation/complete` | `apps/api/src/activation/http.ts:32` |
| GET | `/v1/admin/access/codes` | `apps/api/src/admin-access/http.ts:98` |
| POST | `/v1/admin/access/codes/revoke` | `apps/api/src/admin-access/http.ts:114` |
| POST | `/v1/admin/access/full-codes/import` | `apps/api/src/admin-access/http.ts:120` |
| GET | `/v1/admin/students` | `apps/api/src/admin-access/http.ts:126` |
| GET | `/v1/admin/students/:profileId` | `apps/api/src/admin-access/http.ts:140` |
| GET | `/v1/admin/operations/overview` | `apps/api/src/admin-operations/http.ts:31` |
| GET | `/v1/admin/operations/governance` | `apps/api/src/admin-operations/http.ts:38` |
| GET | `/v1/admin/operations/audit` | `apps/api/src/admin-operations/http.ts:43` |
| POST | `/v1/admin/authoring/lessons/generate` | `apps/api/src/ai/admin-authoring-http.ts:103` |
| POST | `/v1/admin/authoring/outputs/:outputId/apply-lesson` | `apps/api/src/ai/admin-authoring-http.ts:118` |
| POST | `/v1/admin/authoring/outputs/:outputId/apply-quiz` | `apps/api/src/ai/admin-authoring-http.ts:124` |
| POST | `/v1/admin/quizzes/:quizId/generate` | `apps/api/src/ai/admin-authoring-http.ts:130` |
| POST | `/v1/admin/authoring/question-bank/:itemId/regenerate` | `apps/api/src/ai/admin-authoring-http.ts:151` |
| POST | `/v1/admin/authoring/question-bank/:itemId/archive` | `apps/api/src/ai/admin-authoring-http.ts:163` |
| POST | `/v1/admin/authoring/quizzes/:quizId/archive` | `apps/api/src/ai/admin-authoring-http.ts:169` |
| GET | `/v1/admin/ai/jobs` | `apps/api/src/ai/admin-operations-http.ts:86` |
| GET | `/v1/admin/ai/jobs/:jobId` | `apps/api/src/ai/admin-operations-http.ts:97` |
| GET | `/v1/admin/ai/units/:unitId` | `apps/api/src/ai/admin-operations-http.ts:104` |
| GET | `/v1/admin/ai/outputs/:outputId` | `apps/api/src/ai/admin-operations-http.ts:111` |
| POST | `/v1/admin/ai/jobs/:jobId/pause` | `apps/api/src/ai/admin-operations-http.ts:124` |
| POST | `/v1/admin/ai/jobs/:jobId/resume` | `apps/api/src/ai/admin-operations-http.ts:130` |
| POST | `/v1/admin/ai/jobs/:jobId/cancel` | `apps/api/src/ai/admin-operations-http.ts:136` |
| POST | `/v1/admin/ai/jobs/:jobId/retry` | `apps/api/src/ai/admin-operations-http.ts:142` |
| PATCH | `/v1/admin/ai/outputs/:outputId/review` | `apps/api/src/ai/admin-operations-http.ts:148` |
| GET | `/health` | `apps/api/src/app.ts:132` |
| GET | `/ready` | `apps/api/src/app.ts:137` |
| POST | `/v1/auth/login` | `apps/api/src/auth/http.ts:88` |
| POST | `/v1/student/login/start` | `apps/api/src/auth/http.ts:95` |
| POST | `/v1/student/login/complete` | `apps/api/src/auth/http.ts:100` |
| POST | `/v1/auth/logout` | `apps/api/src/auth/http.ts:113` |
| GET | `/v1/auth/me` | `apps/api/src/auth/http.ts:119` |
| GET | `/v1/admin/me` | `apps/api/src/auth/http.ts:123` |
| GET | `/v1/student/me` | `apps/api/src/auth/http.ts:129` |
| POST | `/v1/admin/auth/temporary-password` | `apps/api/src/auth/http.ts:135` |
| POST | `/v1/admin/auth/device-rebind` | `apps/api/src/auth/http.ts:142` |
| GET | `/v1/admin/content-operations` | `apps/api/src/content/admin-operations-http.ts:46` |
| GET | `/v1/admin/content-operations/documents/:documentId` | `apps/api/src/content/admin-operations-http.ts:61` |
| GET | `/v1/admin/content-operations/ocr/:extractionId` | `apps/api/src/content/admin-operations-http.ts:70` |
| PATCH | `/v1/admin/content-operations/ocr/:extractionId/review` | `apps/api/src/content/admin-operations-http.ts:76` |
| GET | `/v1/admin/content-ingestions` | `apps/api/src/content/ingestion-http.ts:62` |
| GET | `/v1/admin/content-ingestions/:taskId` | `apps/api/src/content/ingestion-http.ts:76` |
| POST | `/v1/admin/content-ingestions` | `apps/api/src/content/ingestion-http.ts:82` |
| PUT | `/v1/admin/content-ingestions/:taskId/items/:itemId/content` | `apps/api/src/content/ingestion-http.ts:94` |
| POST | `/v1/admin/content-ingestions/:taskId/process` | `apps/api/src/content/ingestion-http.ts:107` |
| POST | `/v1/admin/content-ingestions/:taskId/link` | `apps/api/src/content/ingestion-http.ts:113` |
| PATCH | `/v1/admin/content-ingestions/:taskId/publication` | `apps/api/src/content/ingestion-http.ts:119` |
| PATCH | `/v1/admin/content-ingestions/:taskId/archive` | `apps/api/src/content/ingestion-http.ts:128` |
| GET | `/v1/student/curriculum` | `apps/api/src/curriculum/http.ts:150` |
| GET | `/v1/student/lessons/:lessonId/reader` | `apps/api/src/curriculum/http.ts:156` |
| GET | `/v1/student/lesson-assets/:assetId/content` | `apps/api/src/curriculum/http.ts:162` |
| GET | `/v1/admin/curriculum` | `apps/api/src/curriculum/http.ts:175` |
| POST | `/v1/admin/curriculum/classes` | `apps/api/src/curriculum/http.ts:180` |
| PATCH | `/v1/admin/curriculum/classes/:classId` | `apps/api/src/curriculum/http.ts:187` |
| POST | `/v1/admin/curriculum/subjects` | `apps/api/src/curriculum/http.ts:194` |
| PATCH | `/v1/admin/curriculum/subjects/:subjectId` | `apps/api/src/curriculum/http.ts:201` |
| POST | `/v1/admin/curriculum/offerings` | `apps/api/src/curriculum/http.ts:208` |
| PATCH | `/v1/admin/curriculum/offerings/:classId/:subjectId` | `apps/api/src/curriculum/http.ts:215` |
| POST | `/v1/admin/curriculum/sections` | `apps/api/src/curriculum/http.ts:224` |
| PATCH | `/v1/admin/curriculum/sections/:sectionId` | `apps/api/src/curriculum/http.ts:231` |
| POST | `/v1/admin/curriculum/lessons` | `apps/api/src/curriculum/http.ts:238` |
| PATCH | `/v1/admin/curriculum/lessons/:lessonId` | `apps/api/src/curriculum/http.ts:245` |
| POST | `/v1/admin/curriculum/lesson-authoring-export` | `apps/api/src/curriculum/lesson-authoring-export-http.ts:38` |
| GET | `/v1/admin/notifications` | `apps/api/src/notifications/http.ts:47` |
| POST | `/v1/admin/notifications` | `apps/api/src/notifications/http.ts:59` |
| DELETE | `/v1/admin/notifications/:notificationId` | `apps/api/src/notifications/http.ts:75` |
| GET | `/v1/student/notifications` | `apps/api/src/notifications/http.ts:83` |
| POST | `/v1/student/notifications/:notificationId/read` | `apps/api/src/notifications/http.ts:93` |
| GET | `/v1/student/offline/lease` | `apps/api/src/offline/http.ts:26` |
| GET | `/v1/student/offline/lessons/:lessonId/manifest` | `apps/api/src/offline/http.ts:36` |
| GET | `/v1/student/offline/lessons/:lessonId/assets/:assetId` | `apps/api/src/offline/http.ts:50` |
| GET | `/v1/admin/question-bank` | `apps/api/src/question-bank/http.ts:61` |
| GET | `/v1/admin/question-bank/:itemId` | `apps/api/src/question-bank/http.ts:75` |
| POST | `/v1/admin/question-bank/manual` | `apps/api/src/question-bank/http.ts:88` |
| POST | `/v1/admin/question-bank/import-ai/:outputId` | `apps/api/src/question-bank/http.ts:95` |
| PATCH | `/v1/admin/question-bank/:itemId` | `apps/api/src/question-bank/http.ts:106` |
| POST | `/v1/admin/question-bank/:itemId/submit-review` | `apps/api/src/question-bank/http.ts:113` |
| POST | `/v1/admin/question-bank/:itemId/reject` | `apps/api/src/question-bank/http.ts:120` |
| POST | `/v1/admin/question-bank/:itemId/publish` | `apps/api/src/question-bank/http.ts:128` |
| POST | `/v1/admin/question-bank/:itemId/regenerate-ai/:outputId` | `apps/api/src/question-bank/regeneration-http.ts:17` |
| GET | `/v1/admin/quizzes/:quizId/versions/:versionId/export` | `apps/api/src/quiz-builder/export-http.ts:17` |
| GET | `/v1/admin/quizzes` | `apps/api/src/quiz-builder/http.ts:77` |
| GET | `/v1/admin/quizzes/:quizId` | `apps/api/src/quiz-builder/http.ts:90` |
| GET | `/v1/admin/quizzes/:quizId/candidates` | `apps/api/src/quiz-builder/http.ts:96` |
| POST | `/v1/admin/quizzes` | `apps/api/src/quiz-builder/http.ts:107` |
| PATCH | `/v1/admin/quizzes/:quizId` | `apps/api/src/quiz-builder/http.ts:122` |
| POST | `/v1/admin/quizzes/:quizId/versions` | `apps/api/src/quiz-builder/http.ts:134` |
| PUT | `/v1/admin/quizzes/:quizId/versions/:versionId/questions` | `apps/api/src/quiz-builder/http.ts:147` |
| DELETE | `/v1/admin/quizzes/:quizId/versions/:versionId` | `apps/api/src/quiz-builder/http.ts:155` |
| POST | `/v1/admin/quizzes/:quizId/submit-review` | `apps/api/src/quiz-builder/http.ts:162` |
| POST | `/v1/admin/quizzes/:quizId/reject` | `apps/api/src/quiz-builder/http.ts:169` |
| POST | `/v1/admin/quizzes/:quizId/publish` | `apps/api/src/quiz-builder/http.ts:177` |
| POST | `/v1/admin/quizzes/:quizId/archive` | `apps/api/src/quiz-builder/http.ts:184` |
| GET | `/v1/admin/quizzes/:quizId/specialized-export` | `apps/api/src/quiz-builder/specialized-export-http.ts:47` |
| GET | `/v1/admin/quizzes/:quizId/specialized-print` | `apps/api/src/quiz-builder/specialized-export-http.ts:54` |
| GET | `/v1/admin/quizzes/:quizId/export-assets/:assetId` | `apps/api/src/quiz-builder/specialized-export-http.ts:67` |
| GET | `/v1/student/quizzes` | `apps/api/src/student-assessment/http.ts:53` |
| POST | `/v1/student/quizzes/:quizId/sessions` | `apps/api/src/student-assessment/http.ts:63` |
| GET | `/v1/student/assessment-sessions/:sessionId` | `apps/api/src/student-assessment/http.ts:75` |
| PUT | `/v1/student/assessment-sessions/:sessionId/questions/:questionId/answer` | `apps/api/src/student-assessment/http.ts:81` |
| POST | `/v1/student/assessment-sessions/:sessionId/finalize` | `apps/api/src/student-assessment/http.ts:94` |
| POST | `/v1/student/assessment-sessions/:sessionId/abandon` | `apps/api/src/student-assessment/http.ts:100` |
| GET | `/v1/student/attempts` | `apps/api/src/student-assessment/http.ts:107` |

## Migration entity definitions

All 27 SQL migration files inspected; table definitions alone do not prove a delivered feature. `ALTER`, constraints and triggers must be interpreted with later migrations.

| Migration | Tables introduced |
| --- | --- |
| `0001_core.sql` | `profiles`, `classes`, `subjects`, `subject_class_links`, `lessons`, `lesson_assets` |
| `0002_access.sql` | `full_access_codes`, `class_access_codes`, `student_entitlements`, `access_redemptions` |
| `0003_learning.sql` | `quizzes`, `quiz_lessons`, `quiz_versions`, `questions`, `question_options`, `practice_sessions`, `practice_session_questions`, `practice_session_options`, `practice_answers`, `quiz_attempts`, `saved_questions`, `achievement_definitions`, `student_achievements`, `notifications`, `notification_reads` |
| `0004_ai_and_sync.sql` | `ai_jobs`, `ai_job_units`, `ai_outputs`, `content_revisions`, `content_tombstones`, `sync_checkpoints` |
| `0005_auth.sql` | `auth_credentials`, `auth_sessions`, `auth_password_reset_tokens`, `auth_login_guards`, `auth_events` |
| `0006_access_contract.sql` | `access_events` |
| `0007_activation_contract.sql` | Alters existing schema / invariants |
| `0008_content_source_import.sql` | `content_import_runs`, `content_source_documents`, `content_source_assets` |
| `0009_media_pipeline.sql` | `media_assets`, `media_variants` |
| `0010_student_auth_device.sql` | `student_devices`, `auth_device_challenges`, `student_activation_tickets` |
| `0011_ocr_foundation.sql` | `ocr_extractions` |
| `0012_ai_execution.sql` | `ai_execution_attempts` |
| `0013_ai_capacity_control.sql` | Alters existing schema / invariants |
| `0014_ai_execution_controls.sql` | `ai_execution_runtime_control`, `ai_route_runtime_state` |
| `0015_ai_job_lifecycle.sql` | Alters existing schema / invariants |
| `0016_curriculum_structure.sql` | `curriculum_sections`, `curriculum_events` |
| `0017_content_ingestion_publication.sql` | `content_ingestion_tasks`, `content_ingestion_items`, `content_ingestion_media` |
| `0018_ai_admin_review.sql` | `ai_output_review_events` |
| `0019_question_bank.sql` | `question_bank_items`, `question_bank_revisions`, `question_bank_revision_lessons`, `question_bank_revision_sources`, `question_bank_ai_imports`, `question_bank_events` |
| `0020_quiz_builder_enums.sql` | Alters existing schema / invariants |
| `0021_quiz_builder.sql` | `quiz_builder_events` |
| `0022_question_bank_regeneration.sql` | Alters existing schema / invariants |
| `0023_admin_access_operations.sql` | Alters existing schema / invariants |
| `0023_student_assessment_runtime.sql` | Alters existing schema / invariants |
| `0024_stage13g_admin_ai_authoring.sql` | Alters existing schema / invariants |
| `0025_lesson_summary_content_revision.sql` | Alters existing schema / invariants |
| `0026_legacy_supabase_import_support.sql` | Alters existing schema / invariants |

## Executable test inventory

Fresh execution in this audit: API unit 62; Student unit 37; Admin unit 63. Integration/browser files listed below were inventoried, not all rerun.

| Test file | Lines | Named scenarios / skip signal |
| --- | ---: | --- |
| `apps/api/tests/access-service.test.ts` | 8 | test("access codes normalize Arabic digits, Eastern Arabic digits, spaces and hyphens", () => { |
| `apps/api/tests/ai-admin-job-list-query-shape.test.ts` | 73 | test("Stage13E job list pages jobs before aggregating their units", async () => { |
| `apps/api/tests/ai-admin-output-detail-snapshot.test.ts` | 122 | test("Stage13E output detail reads one repeatable PostgreSQL snapshot", async () => { |
| `apps/api/tests/ai-admin-pagination-bounds.test.ts` | 82 | test("Stage13E rejects unsafe pagination offsets before service execution", async () => { |
| `apps/api/tests/ai-admin-read-snapshots.test.ts` | 159 | test("Stage13E multi-query admin read models use repeatable PostgreSQL snapshots", async () => { |
| `apps/api/tests/ai-admin-review-validation.test.ts` | 41 | test("Stage13E Admin review preserves Stage11 semantic validation authority", () => { |
| `apps/api/tests/ai-contracts-hardening.test.ts` | 97 | test("Stage11 rejects an answerText that disagrees with correctOptionIndex", () => {; test("Stage11 rejects generated output that misses the requested question count", () => {; test("Stage11 rejects provenance outside the request source/page set", () => {; test("Stage11 sends near-duplicate generated questions to review without treating them as exact duplicates", () => { |
| `apps/api/tests/ai-contracts.test.ts` | 110 | test("Stage11 prompt registry covers every generation mode with unique versioned identities", () => {; test("Stage11 golden fixtures enforce schema, provenance, answer, notation and review rules", () => {; test("exact extraction never needs a fabricated answer to satisfy the contract", () => {; test("prompt envelope is provider-neutral and keeps reproducible key/version metadata", () => {; test("benchmark harness compares adapters on the same contract and records failure without hiding it", async () => { |
| `apps/api/tests/ai-execution.test.ts` | 89 | test("Stage12 router filters by task policy and orders benchmark-approved tiers", () => {; test("Stage12 router refuses routes whose provider adapter is missing", () => { |
| `apps/api/tests/ai-worker.test.ts` | 158 | test("AI worker bounds concurrent slots and drains in-flight work before database close", async () => {; test("AI worker idle polling backs off to a configured ceiling", async () => {; test("AI worker resets idle backoff after useful work", async () => {; test("AI worker fails fast on an unexpected processor error and still closes the database", async () => {; test("AI worker rejects unbounded or invalid runtime settings", () => { |
| `apps/api/tests/app.test.ts` | 95 | test("GET /health is process health only", async () => {; test("GET /ready returns 200 when PostgreSQL is reachable", async () => {; test("GET /ready returns 503 when PostgreSQL is unavailable", async () => {; test("allowed CORS preflight is explicit and credential-safe", async () => {; test("unknown CORS origins are rejected", async () => {; test("unknown routes use the public error envelope", async () => { |
| `apps/api/tests/auth-crypto.test.ts` | 32 | test("password hashes are salted scrypt values and verify correctly", async () => {; test("opaque session tokens are random and persisted form is SHA-256", () => {; test("account identifiers normalize Arabic and Eastern Arabic digits", () => { |
| `apps/api/tests/browser-auth-fixture.ts` | 39 | SQL/fixture/helper; inspect executable assertions |
| `apps/api/tests/config.test.ts` | 47 | test("loadConfig accepts a PostgreSQL URL and secure deployment defaults", () => {; test("loadConfig accepts bounded preview database settings", () => {; test("loadConfig rejects missing database URL", () => {; test("loadConfig rejects non-PostgreSQL protocols", () => {; test("loadConfig rejects excessive database pools", () => { |
| `apps/api/tests/content-source-import.test.ts` | 102 | test("valid inventory passes digest and count checks", () => {; test("tampered inventory is rejected by digest verification", () => {; test("fatal inventory issues block database import", () => {; test("payload counts must match actual documents and assets", () => { |
| `apps/api/tests/device-test-key.ts` | 21 | SQL/fixture/helper; inspect executable assertions |
| `apps/api/tests/fixtures/ai-golden.ts` | 292 | SQL/fixture/helper; inspect executable assertions |
| `apps/api/tests/fixtures/stage13e-e2e-seed.ts` | 241 | SQL/fixture/helper; inspect executable assertions |
| `apps/api/tests/fixtures/stage13f-question-bank-e2e-seed.ts` | 206 | SQL/fixture/helper; inspect executable assertions |
| `apps/api/tests/fixtures/stage13g-admin-access-e2e-seed.ts` | 77 | SQL/fixture/helper; inspect executable assertions |
| `apps/api/tests/fixtures/stage13g-ai-authoring-e2e-seed.ts` | 170 | SQL/fixture/helper; inspect executable assertions |
| `apps/api/tests/integration/access.integration.test.ts` | 241 | test("code generation, renewal, idempotency, no-waste and concurrent redemption", async () => { |
| `apps/api/tests/integration/activation.integration.test.ts` | 408 | test("two-step activation verifies without consumption then commits account, device and access atomically", async () => { |
| `apps/api/tests/integration/admin-ai-authoring.integration.test.ts` | 574 | test("G-D reuses canonical AI jobs and preserves review/provenance boundaries", async () => { |
| `apps/api/tests/integration/admin-ai-quiz-application.integration.test.ts` | 253 | test("approved quiz AI output waits for Question Bank publication then materializes once", async () => { |
| `apps/api/tests/integration/admin-governance.integration.test.ts` | 283 | test("G-C2 projects reports/settings/security/audit from canonical authorities without exposing secrets", async () => { |
| `apps/api/tests/integration/admin-notifications-operations.integration.test.ts` | 277 | test("Admin notifications share one authority with Student visibility and the operations dashboard", async () => { |
| `apps/api/tests/integration/admin-student-access.integration.test.ts` | 303 | test("Stage13G Admin access inventory and Student read model preserve canonical access/auth authority", async () => { |
| `apps/api/tests/integration/ai-admin-action-authority.integration.test.ts` | 313 | test("Stage13E exposes authoritative job/review actions and strict review bodies", async () => { |
| `apps/api/tests/integration/ai-admin-operations.integration.test.ts` | 465 | test("Stage13E Admin AI operations are durable, authorized, secret-safe and race-safe", async () => { |
| `apps/api/tests/integration/ai-capacity.integration.test.ts` | 297 | test("Stage12 distributed backpressure is race-safe and bounds global/provider/project/model concurrency", async () => { |
| `apps/api/tests/integration/ai-control.integration.test.ts` | 343 | test("Stage12 operational controls enforce kill switches, cooldown and race-safe budget ceilings", async () => { |
| `apps/api/tests/integration/ai-execution.integration.test.ts` | 367 | test("Stage12 execution is durable, leased, retryable, cancellable and partial-success safe", async () => { |
| `apps/api/tests/integration/ai-job-lifecycle.integration.test.ts` | 281 | test("Stage12 job pause/resume/progress preserves in-flight authority and durable unit progress", async () => {; test("Stage12 expired in-flight lease is durably released while paused and resumes without retry loss", async () => {; test("Stage12 cancellation remains terminal and clears an active pause gate", async () => { |
| `apps/api/tests/integration/auth.integration.test.ts` | 401 | test("student auth requires registered-device proof, forced password change and explicit rebind", async () => { |
| `apps/api/tests/integration/content-ingestion.integration.test.ts` | 263 | test("Admin mixed ingestion preserves order, keeps ready media unpublished, then links and publishes explicitly", async () => { |
| `apps/api/tests/integration/content-operations.integration.test.ts` | 259 | test("Admin content operations preserve source order and provide OCR review without creating a second pipeline", async () => { |
| `apps/api/tests/integration/curriculum.integration.test.ts` | 255 | test("admin curriculum API preserves explicit offering scope and optional sections", async () => { |
| `apps/api/tests/integration/lesson-authoring-parity.integration.test.ts` | 221 | test("lesson parity keeps summary revisions consistent and exports safe canonical history", async () => { |
| `apps/api/tests/integration/media.integration.test.ts` | 311 | test("media processing binds idempotency to source bytes and preserves Stage 9 provenance", async () => {; test("transient storage failure cleans partial objects and same-input retry succeeds", async () => {; test("abort and metadata commit failures clean stored objects and remain observable", async () => { |
| `apps/api/tests/integration/ocr.integration.test.ts` | 329 | test("OCR foundation is durable, review-aware, retryable and independent from media success", async () => { |
| `apps/api/tests/integration/question-bank-regeneration.integration.test.ts` | 289 | test("Stage13F regeneration creates an approved draft revision under the same stable Question Bank item", async () => { |
| `apps/api/tests/integration/question-bank.integration.test.ts` | 361 | test("Stage13F Question Bank imports approved direct questions idempotently and preserves publish history", async () => { |
| `apps/api/tests/integration/quiz-builder.integration.test.ts` | 193 | test("Stage13F Quiz Builder snapshots only published Question Bank revisions and freezes published versions", {; skip: !databaseUrl, |
| `apps/api/tests/integration/student-assessment.integration.test.ts` | 544 | test("Stage15 Student assessment runtime is entitlement-safe, answer-safe, resumable and deterministic", {; skip: !databaseUrl, |
| `apps/api/tests/integration/student-curriculum.integration.test.ts` | 255 | test("Student curriculum is session-protected, entitlement-filtered and publication-safe", async () => { |
| `apps/api/tests/integration/student-offline-download.integration.test.ts` | 236 | test("Student offline lesson manifest is device-bound, publication-safe and revision-bound", async () => { |
| `apps/api/tests/integration/student-offline.integration.test.ts` | 182 | test("Student offline lease is session/device-bound, bounded and entitlement-safe", async () => { |
| `apps/api/tests/integration/student-publication-time.integration.test.ts` | 151 | test("Student Reader and assessment reject lessons scheduled for future publication", {; skip: !databaseUrl, |
| `apps/api/tests/integration/student-reader.integration.test.ts` | 343 | test("Student Reader enforces entitlement, publication, ready media and safe OCR", async () => { |
| `apps/api/tests/legacy-subject-bootstrap.test.ts` | 80 | test("legacy subject bootstrap validates exact contiguous manifest order", () => {; test("legacy subject bootstrap parses the canonical Stage9 filename families", () => {; test("legacy subject bootstrap preserves source-authored section order", () => { |
| `apps/api/tests/legacy-supabase-model.test.ts` | 194 | test("legacy Supabase pages form logical lessons by title and contiguous page sequence", () => {; test("legacy Supabase grouping refuses ambiguous image/page shapes", () => {; test("legacy true/false normalization canonicalizes order and recalculates answer index", () => {; test("legacy MCQ keeps explicit valid answer but does not invent an invalid one", () => {; test("two-option non-boolean MCQ remains unresolved instead of being coerced", () => {; test("direct questions without a trusted answer remain unknown", () => {; test("fingerprint normalization handles Arabic Unicode, digits and punctuation without altering stored copy", () => {; test("stable UUIDs are deterministic and valid UUID-shaped identifiers", () => { |
| `apps/api/tests/legacy-supabase-startup.test.ts` | 126 | test("production legacy startup requires the single explicit bounded flag", () => {; test("production legacy startup refuses source drift from the approved 69/62/104 contract", () => {; test("replay must reuse the same run and create no media duplicates", () => { |
| `apps/api/tests/media-pdf-smoke.ts` | 98 | SQL/fixture/helper; inspect executable assertions |
| `apps/api/tests/media.test.ts` | 84 | test("ordered concurrency preserves input order even when completion order is reversed", async () => {; test("filesystem storage rejects traversal and writes atomically under its root", async () => {; test("image processor creates deterministic source/display/thumbnail/AI variants", async () => { |
| `apps/api/tests/ocr.test.ts` | 36 | test("OCR normalization is conservative and preserves Arabic/source characters", () => {; test("Tesseract TSV parser preserves line order and calculates weighted confidence", () => {; test("Tesseract TSV parser treats missing provider confidence as unknown", () => { |
| `apps/api/tests/offline-signing.test.ts` | 73 | test("offline authorization signer is test-only by default and emits verifiable canonical ES256", () => {; test("production and development never fall back to the public test signing key", () => { |
| `apps/admin-web/e2e/admin-ai-authoring.e2e.spec.mjs` | 160 | test("G-D queues selected lessons and independent quiz versions through the real API", async ({ page }) => {; /\/v1\/admin\/quizzes\/[0-9a-f-]+$/i.test(new URL(response.url()).pathname) &&; /\/v1\/admin\/quizzes\/[0-9a-f-]+\/generate$/i.test(new URL(response.url()).pathname) &&; test("G-D exports only selected versions and opens the authenticated print view", async ({ page }) => {; /\/v1\/admin\/quizzes\/[0-9a-f-]+$/i.test(new URL(response.url()).pathname) &&; test("G-D stays responsive and returns to login after the real Admin session expires", async ({ page }) => { |
| `apps/admin-web/e2e/admin-governance.e2e.spec.mjs` | 107 | test("Governance reads safe live projections and filters the canonical audit feed", async ({ page }) => {; test("Governance returns to login when the real Admin session expires", async ({ page }) => {; test("Governance and audit stay within a 390px viewport", async ({ page }) => { |
| `apps/admin-web/e2e/admin-operations.e2e.spec.mjs` | 77 | test("Operations dashboard uses real metrics/activity and manages a global notification end to end", async ({ page }) => {; test("Operations dashboard returns to login after the real Admin session expires", async ({ page }) => {; test("Operations and notifications stay within a 390px viewport", async ({ page }) => { |
| `apps/admin-web/e2e/admin-parity-closure.e2e.spec.mjs` | 62 | test("Stage13G closure edits lesson summaries, exports history, and updates draft quiz metadata", async ({ page }) => { |
| `apps/admin-web/e2e/admin-reports.e2e.spec.mjs` | 129 | test("Files workspace imports row-by-row and exports only explicitly selected codes when selection exists", async ({ page }) => {; test("Files workspace prints only selected cards and stays within a 390px viewport", async ({ page }) => {; test("Files workspace returns to login after the real Admin session expires", async ({ page }) => { |
| `apps/admin-web/e2e/admin-student-access.e2e.spec.mjs` | 112 | test("Student access workspace performs recovery, device rebind and entitlement revoke through the real API", async ({; test("Access-code workspace generates and non-destructively revokes unused codes", async ({ page }) => {; test("Student access workspace returns to login after the real Admin session expires", async ({ page }) => {; test("Student access workspace stays within a 390px viewport", async ({ page }) => { |
| `apps/admin-web/e2e/ai-operations.e2e.spec.mjs` | 193 | test("Admin AI operations navigate complete durable job, unit and attempt history", async ({ page }) => {; test("Admin AI operations keep canonical review authority while navigating the full audit and survive reload", async ({ page }) => {; test("Admin AI operations return to login after the real Admin session expires", async ({ page }) => {; test("Admin AI operations refresh canonical review state after a real 409 race", async ({ page }) => {; test("Admin AI operations stay within a 390px viewport", async ({ page }) => { |
| `apps/admin-web/e2e/content-ingestion.e2e.spec.mjs` | 114 | test("admin preserves mixed file order, processes, reviews, publishes and keeps durable history", async ({ page }) => {; test("content ingestion workspace remains usable at a narrow viewport", async ({ page }) => { |
| `apps/admin-web/e2e/curriculum.e2e.spec.mjs` | 158 | test("admin signs in and manages the curriculum hierarchy without destructive deletes", async ({ page }) => {; test("admin reviews source media and pending OCR through the operations workspace", async ({ page }) => {; test("admin curriculum remains usable at a narrow viewport", async ({ page }) => { |
| `apps/admin-web/e2e/question-bank.e2e.spec.mjs` | 216 | test("Question Bank reaches later pages and publishes a reviewed durable question", async ({ page }) => {; test("Question Bank creates, reviews and publishes a manual direct question through the real API", async ({ page }) => {; test("Question Bank imports only the pre-approved AI fixture as a draft with provenance", async ({ page }) => {; test("Question Bank returns to login after the real Admin session expires", async ({ page }) => {; test("Question Bank stays within a 390px viewport", async ({ page }) => {; test("Quiz Builder creates a model from published Question Bank revisions and publishes immutable snapshots", async ({; test("Quiz Builder stays within a 390px viewport", async ({ page }) => { |
| `apps/admin-web/e2e/routing-foundation.e2e.spec.mjs` | 21 | test("Admin shell supports direct URLs, RTL, route focus and browser history", async ({ page }) => {; test("Admin root resolves to the canonical app route", async ({ page }) => { |
| `apps/admin-web/e2e/stage13e-real-api.mjs` | 87 | SQL/fixture/helper; inspect executable assertions |
| `apps/student-web/e2e/access-fixture.ts` | 198 | SQL/fixture/helper; inspect executable assertions |
| `apps/student-web/e2e/activation.e2e.spec.mjs` | 252 | test("student activation, recovery, device access and canonical curriculum work at 390px", async ({ page }) => { |
| `apps/student-web/e2e/assessment-fixture.ts` | 189 | SQL/fixture/helper; inspect executable assertions |
| `apps/student-web/e2e/assessment.e2e.spec.mjs` | 191 | test("Student Practice/Test uses published snapshots, server feedback, resume and responsive UX", async ({ page }) => { |
| `apps/student-web/e2e/offline-download.e2e.spec.mjs` | 160 | test("protected lesson download verifies server authorization and bytes, commits atomically, rejects tampering and cleans up", async ({ page }) => { |
| `apps/student-web/e2e/offline-lease.e2e.spec.mjs` | 339 | if (!/\/app\/account$/.test(page.url())) {; test("offline lease persists and cleanup stays scoped across logout and device rebind", async ({ page, context }) => {; test("server-side session expiry removes only the active lease scope", async ({ page }) => {; test("clock rollback beyond tolerance is rejected by the real offline-store module in Chromium", async ({ page }) => { |
| `apps/student-web/e2e/pwa-shell.e2e.spec.mjs` | 60 | test("Student app shell installs safely and reloads offline without caching protected API", async ({ page, context }) => { |
| `apps/student-web/e2e/reader-fixture.ts` | 164 | SQL/fixture/helper; inspect executable assertions |
| `apps/student-web/e2e/reader.e2e.spec.mjs` | 140 | test("authorized Learn hierarchy opens a focused protected Reader with direct-route parity", async ({ page }) => { |
| `apps/student-web/e2e/routing-foundation.e2e.spec.mjs` | 22 | test("Student shell supports direct URLs, route focus and browser history", async ({ page }) => {; test("Student root resolves to the canonical home route", async ({ page }) => { |
| `apps/student-web/e2e/student-shell-navigation.e2e.spec.mjs` | 99 | test("Student shell provides stable mobile destinations, focus, history and offline status", async ({ page }) => {; test("Student shell adapts navigation for tablet and desktop without overflow", async ({ page }) => { |
| `database/tests/run.sh` | 80 | SQL/fixture/helper; inspect executable assertions |
| `database/tests/schema_smoke.sql` | 123 | SQL/fixture/helper; inspect executable assertions |

## Workflow inventory

| Workflow | Executable gate signals |
| --- | --- |
| `.github/workflows/ocr-foundation.yml` | name: OCR Foundation Verification; name: OCR · Durable extraction foundation; - name: Install PostgreSQL and Tesseract Arabic/English runtime; - name: Install API dependencies; - name: Lint, typecheck, unit test and build OCR source; - name: Apply all migrations on clean PostgreSQL; - name: Verify OCR PostgreSQL contracts; - name: Run PostgreSQL OCR lifecycle, retry, review, concurrency and real Tesseract tests |
| `.github/workflows/rebuild-stage-verification.yml` | name: Rebuild Stage Verification; name: Stage 1 · Product contract; - name: Verify product feature contract; name: Stage 2 · Brand identity; - name: Verify canonical brand assets; name: Stage 3 · UX architecture; - name: Verify UX contracts and parity coverage; name: Stage 4 · PostgreSQL clean build; - name: Install PostgreSQL CLI; - name: Apply migrations and run database contract tests; name: Stage 5 · Engineering foundation; - name: Install API dependencies; - name: Lint API; - name: Typecheck API; - name: Test API; - name: Build API; - name: Run migration runner on clean PostgreSQL; - name: Re-run migrations to prove idempotent skip behavior; - name: Verify applied migration count; - name: Install and build Admin; - name: Install and build Student; name: Stage 6 · Auth & authorization; - name: Install API dependencies; - name: Lint and typecheck auth source; - name: Run unit tests including auth cryptography; - name: Apply all migrations; - name: Verify explicit first-admin bootstrap and refusal on repeat; - name: Run PostgreSQL auth lifecycle and role-isolation integration tests; name: Stage 7 · Access codes & entitlements; - name: Install API dependencies; - name: Lint, typecheck and unit test access source; - name: Apply migrations on clean PostgreSQL; - name: Verify PostgreSQL access constraints; - name: Run access lifecycle, renewal and race integration tests; name: Stage 8 · Student activation backend; - name: Install API dependencies; - name: Lint, strict typecheck and unit tests; - name: Apply migrations on clean PostgreSQL; - name: Verify activation database invariants; - name: Run activation atomicity, replay, session and race integration tests; name: Stage 8 · Student activation browser E2E; - name: Install API and Student dependencies; - name: Lint, typecheck, unit test and build integration apps; - name: Apply migrations and seed deterministic browser scenario; - name: Create explicit E2E admin for recovery support flow; - name: Install Chromium; - name: Run real browser activation, returning-login and recovery flow |
| `.github/workflows/stage10-media-pipeline.yml` | name: Stage 10 Media Pipeline; name: Stage 10 · Media pipeline; - name: Install media runtime and PostgreSQL CLI; - name: Install API dependencies; - name: Lint, typecheck, unit test and build; - name: Apply migrations through media schema; - name: Verify media schema constraints; - name: Run PostgreSQL provenance, idempotency, cleanup, abort and retry tests; - name: Generate a real two-page PDF fixture; - name: Verify real PDF extraction, transforms, storage, replay and stable order |
| `.github/workflows/stage11-ai-contracts.yml` | name: Stage 11 AI Contract Verification; name: Stage 11 · Provider-neutral AI contracts; - name: Install API dependencies; - name: Lint AI contracts and tests; - name: Typecheck API; - name: Run unit tests including Stage11 golden contracts; - name: Build API |
| `.github/workflows/stage12-ai-execution.yml` | name: Stage 12 AI Execution Verification; name: Stage 12 · Durable provider-neutral AI execution; - name: Install PostgreSQL client; - name: Install API dependencies; - name: Lint, typecheck, unit test and build AI execution source; - name: Apply all migrations on clean PostgreSQL; - name: Verify Stage12 PostgreSQL execution contracts; - name: Run bounded polling and graceful worker lifecycle tests; - name: Run PostgreSQL idempotency, lease, cascade, retry, cancellation and partial-success tests; - name: Run PostgreSQL distributed global, provider, project and model capacity tests; - name: Run PostgreSQL kill-switch, cooldown, Retry-After and budget ceiling tests; - name: Run PostgreSQL job pause, resume, progress and paused-lease recovery tests |
| `.github/workflows/stage13-curriculum-backend.yml` | name: Stage 13 Admin Product Verification; name: Stage 13 · Curriculum + content operations backend; - name: Install PostgreSQL client; - name: Install API dependencies; - name: Lint, typecheck, unit test and build API; - name: Apply all migrations on clean PostgreSQL; - name: Verify curriculum and processing PostgreSQL contracts; - name: Run Admin curriculum and content operations API tests; name: Stage 13 · Admin browser E2E; - name: Install PostgreSQL client; - name: Install API and Admin dependencies; - name: Verify API and Admin builds; - name: Apply migrations on clean PostgreSQL; - name: Create explicit E2E Super Admin; - name: Seed content operations browser fixture; - name: Install Chromium; - name: Run real browser Admin flows |
| `.github/workflows/stage13d-admin-ui.yml` | name: Stage 13D Admin Upload UI Verification; name: Stage 13D · Admin upload + publication browser; - name: Install media runtime and PostgreSQL client; - name: Install API and Admin dependencies; - name: Verify API and Admin quality gates; - name: Apply all migrations on clean PostgreSQL; - name: Create explicit E2E Super Admin; - name: Seed explicit Stage13D curriculum fixture; - name: Install Chromium; - name: Run Stage13D real browser flow |
| `.github/workflows/stage13d-content-ingestion.yml` | name: Stage 13D Content Ingestion Verification; name: Stage 13D · Ingestion + publication backend; - name: Install media runtime and PostgreSQL client; - name: Install API dependencies; - name: Lint, typecheck, unit test and build API; - name: Apply all migrations on clean PostgreSQL; - name: Verify ingestion and publication schema; - name: Run durable mixed ingestion and publication integration test |
| `.github/workflows/stage13e-ai-operations.yml` | name: Stage 13E Admin AI Operations Verification; name: Stage 13E · Admin AI operations and review authority; - name: Install PostgreSQL client; - name: Install API dependencies; - name: Lint, typecheck, unit test and build; - name: Apply all migrations on clean PostgreSQL; - name: Verify Stage13E PostgreSQL contracts; - name: Run Stage13E authorization, observability, review race and control tests; - name: Reset PostgreSQL before wider Stage12 and auth regressions; - name: Re-run Stage12 durable execution regressions; - name: Re-run auth security regression |
| `.github/workflows/stage13e-frontend-prep.yml` | name: Stage 13E Frontend Preparation Verification; name: Stage 13E · Admin Web quality; - name: Install Admin dependencies; - name: Lint Admin Web; - name: Typecheck Admin Web; - name: Unit test Admin Web; - name: Build Admin Web |
| `.github/workflows/stage13e-integration.yml` | name: Stage 13E Combined Integration Verification; name: Stage 13E · Backend + Admin real-browser integration; - name: Install system runtime dependencies; - name: Install API and Admin dependencies; - name: Run API and Admin quality gates; - name: Apply all migrations on clean PostgreSQL; - name: Verify Stage13E database contract; - name: Run Stage13E Backend authority regressions; - name: Reset PostgreSQL before wider Stage12 and auth regressions; - name: Re-run Stage12 and auth security regressions; - name: Reset PostgreSQL for deterministic browser fixture; - name: Create explicit Stage13E E2E Super Admin; - name: Seed real Stage13E browser fixtures; - name: Verify browser fixture invariants; - name: Install Chromium; - name: Run Stage13E real Admin Chromium suite |
| `.github/workflows/stage13f-admin-question-bank.yml` | name: Stage 13F Admin Question Bank Verification; name: Stage 13F · Admin Question Bank UI quality; - name: Install Admin dependencies; - name: Admin lint; - name: Admin strict typecheck; - name: Admin unit tests; - name: Admin build; name: Stage 13F · Real API + PostgreSQL + Chromium; - name: Install PostgreSQL client; - name: Install API and Admin dependencies; - name: API quality and build; - name: Admin build from verified source; - name: Apply all migrations on clean PostgreSQL; - name: Verify Stage13F database contract; - name: Run Stage13F backend authority regression; - name: Reset PostgreSQL for deterministic browser fixture; - name: Create explicit Stage13F E2E Super Admin; - name: Seed real Stage13F browser fixtures; - name: Verify browser fixture invariants; - name: Install Chromium; - name: Run Stage13F real Admin Chromium suite |
| `.github/workflows/stage13f-question-bank.yml` | name: Stage 13F Question Bank Verification; name: Stage 13F · Question Bank + Quiz Builder authority; - name: Install PostgreSQL client; - name: Install API dependencies; - name: Lint, typecheck, unit test and build; - name: Apply all migrations on clean PostgreSQL; - name: Verify Stage13F PostgreSQL contracts; - name: Run Stage13F Question Bank integration; - name: Run Stage13F stable regeneration integration; - name: Run Stage13F Quiz Builder integration |
| `.github/workflows/stage13g-admin-operations.yml` | name: Stage 13G Admin Operations Verification; name: Stage 13G · Admin operations backend; - name: Install PostgreSQL client; - name: Install API dependencies; - name: API lint; - name: API strict typecheck; - name: API unit tests; - name: API build; - name: Apply all migrations on clean PostgreSQL; - name: Verify Stage13G database contract; - name: Run Stage13G Accounts + Access integration; - name: Run Stage13G Notifications + Operations integration; - name: Run Stage13G Reports + Settings + Security + Audit integration; - name: Run Stage13G AI authoring integration; - name: Run Access and Auth regression; name: Stage 13G · Admin UI quality; - name: Install Admin dependencies; - name: Admin lint; - name: Admin strict typecheck; - name: Admin unit tests; - name: Admin build; name: Stage 13G · Real API + PostgreSQL + Chromium; - name: Install PostgreSQL client; - name: Install API and Admin dependencies; - name: Build API and Admin from verified source; - name: Apply all migrations on clean PostgreSQL; - name: Create explicit Stage13G E2E Super Admin; - name: Seed deterministic Stage13G browser fixtures; - name: Verify browser fixture invariants; - name: Install Chromium; - name: Run Stage13G real Admin Chromium suite |
| `.github/workflows/stage14-student-api-quality.yml` | name: Stage14 Student API Regression; name: API lint · typecheck · unit · build; - name: Install API dependencies; - name: Run API regression gates |
| `.github/workflows/stage14-student-product.yml` | name: Stage14 Student Product; name: Student lint · typecheck · unit · build; - name: Install Student dependencies; - name: Run Student quality gates; name: Real Chromium · auth/access/curriculum · 390px; - name: Install API and Student dependencies; - name: Build runtime applications; - name: Apply clean PostgreSQL migrations; - name: Verify Student curriculum and Reader contracts; - name: Seed activation codes; - name: Create recovery-support Admin fixture; - name: Install Chromium; - name: Run real Student browser suite |
| `.github/workflows/stage15-student-assessment.yml` | name: Stage15 Student Assessment; name: Student assessment · PostgreSQL contracts; - name: Install API dependencies; - name: Apply clean PostgreSQL migrations; - name: Verify Student assessment and publication-time integration; name: Student assessment · real Chromium · 390px; - name: Install API and Student dependencies; - name: Build runtime applications; - name: Apply clean PostgreSQL migrations; - name: Install Chromium; - name: Run Stage15 Student browser acceptance |
| `.github/workflows/stage16-student-pwa.yml` | name: Stage16 Student PWA; name: Student offline · PostgreSQL lease/download contracts; - name: Install API dependencies; - name: Verify API signing unit policy; - name: Apply clean PostgreSQL migrations; - name: Verify bounded Student offline lease and protected download contracts; name: Student offline · lifecycle/materialization · real Chromium; - name: Install API and Student dependencies; - name: Build runtime applications; - name: Apply clean PostgreSQL migrations; - name: Seed isolated offline acceptance codes; - name: Install Chromium; - name: Verify IndexedDB lease lifecycle and protected materialization; name: Student PWA · app shell · real Chromium; - name: Install Student dependencies; - name: Build Student app; - name: Install Chromium; - name: Verify installable offline-safe app shell |
| `.github/workflows/stage9-content-import.yml` | name: Stage 9 Content Import Verification; name: Stage 9 · Full source inventory and PostgreSQL import; - name: Install API dependencies and PostgreSQL client; - name: Verify Stage 9 unit contracts; - name: Fetch pinned alwaslh-go Git source without materializing image bytes; - name: Build and validate complete 5,552-image inventory; - name: Apply migrations on clean PostgreSQL; - name: Import canonical source inventory; - name: Re-import identical inventory to prove idempotency; - name: Verify database import counts, presence and uniqueness |
| `.github/workflows/ux-b01-shared-foundation.yml` | name: UX B01 Shared Frontend Foundation; name: Student 390px + Admin desktop routing foundation; - name: Install API, Student and Admin dependencies; - name: Build runtime applications; - name: Apply PostgreSQL migrations; - name: Install Chromium; - name: Verify Student routing at 390px; - name: Verify Admin routing at desktop width |
| `.github/workflows/ux-b02-student-shell.yml` | name: UX B02 Student Shell and Navigation; name: Student installed-app shell · phone tablet desktop; - name: Install API and Student dependencies; - name: Verify API and Student quality; - name: Apply PostgreSQL migrations; - name: Install Chromium; - name: Verify Student shell across phone tablet and desktop |
| `.github/workflows/ux-b03-student-learning.yml` | name: UX B03 Student Learning and Reader; name: Learn hierarchy and focused Reader · real Chromium; - name: Install API and Student dependencies; - name: Verify API and Student quality; - name: Apply PostgreSQL migrations; - name: Install Chromium; - name: Verify Learn hierarchy and focused Reader |

## Source coverage ledger

All listed files were inventoried and fingerprinted. **NOT YET VERIFIED** means exhaustive semantic review is not claimed by this ledger; use the main report for explicitly inspected functions and executed evidence.

| Source | Lines | SHA-256 (prefix) |
| --- | ---: | --- |
| `apps/api/src/access/http.ts` | 76 | `c1ea9ff4d816971f` |
| `apps/api/src/access/import-service.ts` | 148 | `d89bfb9bccd6436f` |
| `apps/api/src/access/service.ts` | 493 | `e469d17fa2aac7af` |
| `apps/api/src/activation/http.ts` | 60 | `16070ffaf0588b13` |
| `apps/api/src/activation/service.ts` | 368 | `9920730ac21ffa08` |
| `apps/api/src/admin-access/http.ts` | 152 | `b55f113ac9d1dc5e` |
| `apps/api/src/admin-access/service.ts` | 694 | `d8383cfe74c89e2b` |
| `apps/api/src/admin-operations/http.ts` | 54 | `b2adca464e5c414c` |
| `apps/api/src/admin-operations/service.ts` | 519 | `92251f6a07e5db17` |
| `apps/api/src/ai/admin-authoring-http.ts` | 174 | `9dfdb944eb8c12fa` |
| `apps/api/src/ai/admin-authoring.ts` | 844 | `a86aa51d96002733` |
| `apps/api/src/ai/admin-operations-http.ts` | 161 | `db2efbb36fd14dce` |
| `apps/api/src/ai/admin-operations.ts` | 884 | `6c92dce5c8323e78` |
| `apps/api/src/ai/benchmark.ts` | 123 | `78fe63b97c43ec7c` |
| `apps/api/src/ai/contracts.ts` | 209 | `cba1c54c37c1af30` |
| `apps/api/src/ai/execution-control.ts` | 320 | `7ab67fa7a1d883c1` |
| `apps/api/src/ai/execution-repository.ts` | 575 | `d22f6785da1dd8ac` |
| `apps/api/src/ai/execution-service.ts` | 396 | `b9db26f5abe1f0c0` |
| `apps/api/src/ai/job-lifecycle.ts` | 303 | `4774b81ea541efba` |
| `apps/api/src/ai/prompt-registry.ts` | 175 | `35be2397a9f22ed8` |
| `apps/api/src/ai/provider.ts` | 46 | `169039ce19bbe0a8` |
| `apps/api/src/ai/review-validation.ts` | 52 | `4a9d737a07532f76` |
| `apps/api/src/ai/router.ts` | 104 | `ce79a019a8cb9d94` |
| `apps/api/src/ai/validators.ts` | 588 | `6a73974b53157e28` |
| `apps/api/src/ai/worker-runtime.ts` | 171 | `76fc737600893aa4` |
| `apps/api/src/app.ts` | 164 | `0f10524186f3c876` |
| `apps/api/src/auth/create-admin.ts` | 39 | `e7d207f098830fa4` |
| `apps/api/src/auth/crypto.ts` | 97 | `4b0f938501d66eec` |
| `apps/api/src/auth/device-crypto.ts` | 85 | `39635377ba4ab6fa` |
| `apps/api/src/auth/http.ts` | 149 | `9e677714607ab143` |
| `apps/api/src/auth/service.ts` | 663 | `0ef08d7c9d350ea3` |
| `apps/api/src/config.ts` | 51 | `f29a359cae85f370` |
| `apps/api/src/content/admin-operations-http.ts` | 89 | `6becb8e08d2aa078` |
| `apps/api/src/content/admin-operations.ts` | 613 | `1fd6a73943ed5979` |
| `apps/api/src/content/bootstrap-legacy-subject-cli.ts` | 42 | `ae0c28b46b956538` |
| `apps/api/src/content/import-source-cli.ts` | 21 | `250bfce5f27dbca7` |
| `apps/api/src/content/ingestion-http.ts` | 133 | `49abe3bf704ab72d` |
| `apps/api/src/content/ingestion-service.ts` | 1063 | `a4a4161e8ead928e` |
| `apps/api/src/content/legacy-content-reset.ts` | 413 | `4d67de980eb18f56` |
| `apps/api/src/content/legacy-subject-bootstrap.ts` | 709 | `77ef3be21e4331c3` |
| `apps/api/src/content/legacy-supabase-client.ts` | 160 | `91541261dc389036` |
| `apps/api/src/content/legacy-supabase-import-cli.ts` | 139 | `9e6c867924cc1e77` |
| `apps/api/src/content/legacy-supabase-importer.ts` | 1170 | `ac647edb3d3e3fe9` |
| `apps/api/src/content/legacy-supabase-model.ts` | 398 | `295c8ffe65d1427b` |
| `apps/api/src/content/legacy-supabase-startup.ts` | 653 | `c561760771438b2b` |
| `apps/api/src/content/legacy-supabase-verifier.ts` | 396 | `00d016351af48eaf` |
| `apps/api/src/content/source-import.ts` | 285 | `3687a42c77ca105b` |
| `apps/api/src/curriculum/http.ts` | 251 | `03a66c0d04f44072` |
| `apps/api/src/curriculum/lesson-authoring-export-http.ts` | 49 | `abf67ca5b9aec699` |
| `apps/api/src/curriculum/lesson-authoring-export.ts` | 290 | `5a36f8d0d253000c` |
| `apps/api/src/curriculum/service.ts` | 918 | `e194e1d2ef169609` |
| `apps/api/src/curriculum/student-reader.ts` | 257 | `ec425b68ce9da099` |
| `apps/api/src/db.ts` | 68 | `d5334eb223506310` |
| `apps/api/src/errors.ts` | 40 | `b817b3417b28a068` |
| `apps/api/src/media/image-processor.ts` | 96 | `91555982a4026250` |
| `apps/api/src/media/media-types.ts` | 45 | `6b8ce8ce2b72e475` |
| `apps/api/src/media/ordered-concurrency.ts` | 27 | `c41267cea0b394e4` |
| `apps/api/src/media/pdf-processor.ts` | 97 | `a2d0ce67ec87a18c` |
| `apps/api/src/media/repository.ts` | 170 | `9c7588d55caa416b` |
| `apps/api/src/media/service.ts` | 216 | `34aa27943e729d43` |
| `apps/api/src/media/storage.ts` | 86 | `1bd2d39a824e473d` |
| `apps/api/src/migrate.ts` | 60 | `4ff7aa0b480719f4` |
| `apps/api/src/notifications/http.ts` | 100 | `15265e676f9f6547` |
| `apps/api/src/notifications/service.ts` | 310 | `a504a8c97d84e24f` |
| `apps/api/src/ocr/normalize.ts` | 11 | `5be2731586cad338` |
| `apps/api/src/ocr/provider.ts` | 30 | `71ced1102df43c2e` |
| `apps/api/src/ocr/repository.ts` | 396 | `7dd0f3444bdc96ca` |
| `apps/api/src/ocr/service.ts` | 263 | `5bc9b61b3b339514` |
| `apps/api/src/ocr/tesseract-provider.ts` | 207 | `ac25fcfebc89d71a` |
| `apps/api/src/offline/download.ts` | 162 | `cbd759fb332854b1` |
| `apps/api/src/offline/http.ts` | 70 | `e398cab8165de530` |
| `apps/api/src/offline/service.ts` | 109 | `26cab6a9f1ec66af` |
| `apps/api/src/offline/signing.ts` | 141 | `fb5e9d42d2dcc704` |
| `apps/api/src/question-bank/http.ts` | 134 | `88db7d6bc7def6ad` |
| `apps/api/src/question-bank/regeneration-http.ts` | 24 | `3c80b61bcd2ccbd8` |
| `apps/api/src/question-bank/regeneration.ts` | 291 | `7dd33d2d1d1c6b8d` |
| `apps/api/src/question-bank/service.ts` | 974 | `c557c18fc0ede1d3` |
| `apps/api/src/quiz-builder/candidates.ts` | 93 | `c8765e351282205e` |
| `apps/api/src/quiz-builder/export-http.ts` | 23 | `51895b3b28eda9fa` |
| `apps/api/src/quiz-builder/export.ts` | 154 | `70545fa63b931792` |
| `apps/api/src/quiz-builder/http.ts` | 190 | `1c86ee0c82043ef1` |
| `apps/api/src/quiz-builder/service.ts` | 716 | `6319600ab253ddb7` |
| `apps/api/src/quiz-builder/specialized-export-http.ts` | 75 | `22682aa1fe7aa8fc` |
| `apps/api/src/quiz-builder/specialized-export.ts` | 270 | `df95fc5c61c10a82` |
| `apps/api/src/server.ts` | 37 | `1169a2f47fcd17c4` |
| `apps/api/src/student-assessment/http.ts` | 112 | `e7c6e9e28b5d6cb2` |
| `apps/api/src/student-assessment/service.ts` | 808 | `f910f6b0674a7448` |
| `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx` | 1057 | `e11ba3e53a7dd1bb` |
| `apps/admin-web/src/AdminGovernanceWorkspace.tsx` | 462 | `57cc35c087ec0ab6` |
| `apps/admin-web/src/AdminOperationsWorkspace.tsx` | 512 | `9c9402f0bc3af334` |
| `apps/admin-web/src/AdminReportsWorkspace.tsx` | 444 | `79586c591c6738b0` |
| `apps/admin-web/src/AdminStudentAccessWorkspace.tsx` | 989 | `4ca56bd9d4d17c7f` |
| `apps/admin-web/src/AiOperationsPage.tsx` | 367 | `c4bd10c7c4688c5f` |
| `apps/admin-web/src/AiOperationsWorkspace.tsx` | 517 | `346bcb9362e9ba4f` |
| `apps/admin-web/src/App.tsx` | 295 | `522db42a054c9375` |
| `apps/admin-web/src/ContentIngestionWorkspace.tsx` | 591 | `d5a287d6c7004af7` |
| `apps/admin-web/src/ContentOperationsWorkspace.tsx` | 360 | `98083c8e8899cfee` |
| `apps/admin-web/src/CurriculumWorkspace.tsx` | 1030 | `7151f8e0dfbb359a` |
| `apps/admin-web/src/LessonAuthoringParityPanel.tsx` | 251 | `2048c5f7ac4e598b` |
| `apps/admin-web/src/LoginScreen.tsx` | 73 | `99dbb3b0aeb5293d` |
| `apps/admin-web/src/QuestionBankWorkspace.tsx` | 986 | `79b996b5389ee023` |
| `apps/admin-web/src/QuizBuilderWorkspace.tsx` | 1135 | `f78ff85fa630b93d` |
| `apps/admin-web/src/QuizMetadataPanel.tsx` | 155 | `e3547b447b1cafe8` |
| `apps/admin-web/src/access-code-files.test.ts` | 87 | `1e31a915215b18ad` |
| `apps/admin-web/src/access-code-files.ts` | 145 | `666804916047ed20` |
| `apps/admin-web/src/admin-access-files-api.test.ts` | 75 | `5268e16ee091e4ea` |
| `apps/admin-web/src/admin-access-files-api.ts` | 92 | `bb31fa49187859d0` |
| `apps/admin-web/src/admin-ai-authoring-api.test.ts` | 127 | `2aa3ef242b118725` |
| `apps/admin-web/src/admin-ai-authoring-api.ts` | 158 | `aa57ddd4b3a395c8` |
| `apps/admin-web/src/admin-api.test.ts` | 112 | `3b3c844530aeae9c` |
| `apps/admin-web/src/admin-api.ts` | 295 | `84613d84a2b4a9e8` |
| `apps/admin-web/src/admin-operations-api.test.ts` | 120 | `c21e27a503d5234f` |
| `apps/admin-web/src/admin-operations-api.ts` | 204 | `fbaa22f1462116a3` |
| `apps/admin-web/src/admin-student-access-api.test.ts` | 147 | `9f48beb2d3c4b992` |
| `apps/admin-web/src/admin-student-access-api.ts` | 245 | `02b1b6f75c55e9d1` |
| `apps/admin-web/src/ai-operations-adapter.test.ts` | 106 | `2026ee65f6a4bf52` |
| `apps/admin-web/src/ai-operations-adapter.ts` | 232 | `38a8e0199215b1f8` |
| `apps/admin-web/src/ai-operations-api.test.ts` | 111 | `9fa12ea9103ea671` |
| `apps/admin-web/src/ai-operations-api.ts` | 257 | `8c49e3cdfb0950e4` |
| `apps/admin-web/src/ai-operations-pagination.test.ts` | 33 | `044e93c1ae5305af` |
| `apps/admin-web/src/ai-operations-view-model.test.ts` | 83 | `e138e8b250468383` |
| `apps/admin-web/src/ai-operations-view-model.ts` | 311 | `1d6bf2717581cea0` |
| `apps/admin-web/src/content-ingestion-api.test.ts` | 88 | `55b27ec9aff7e592` |
| `apps/admin-web/src/content-ingestion-api.ts` | 156 | `74deffb89c34a8b0` |
| `apps/admin-web/src/content-operations-api.test.ts` | 90 | `20391321bee08680` |
| `apps/admin-web/src/content-operations-api.ts` | 191 | `2778175b1790c94b` |
| `apps/admin-web/src/lesson-authoring-parity-api.ts` | 35 | `cbd2640adfacc0c4` |
| `apps/admin-web/src/main.tsx` | 23 | `e167a4f9f4a216c6` |
| `apps/admin-web/src/presentation-foundation.tsx` | 65 | `de08e9e73d2ca253` |
| `apps/admin-web/src/question-bank-api.test.ts` | 162 | `b562c589f0a8d842` |
| `apps/admin-web/src/question-bank-api.ts` | 221 | `81e384d55fc5af62` |
| `apps/admin-web/src/quiz-builder-api.test.ts` | 134 | `71c67aa0da97f7fe` |
| `apps/admin-web/src/quiz-builder-api.ts` | 212 | `7f1aa4ca44287cf2` |
| `apps/admin-web/src/router.tsx` | 44 | `8b28078b278b76c3` |
| `apps/admin-web/src/vite-env.d.ts` | 9 | `0209610c59ec3f55` |
| `apps/student-web/src/App.tsx` | 828 | `a1586c02c0ac5311` |
| `apps/student-web/src/api-errors.ts` | 20 | `9065ce8aee210118` |
| `apps/student-web/src/assessment-api.test.ts` | 154 | `950f8c6fe39b5258` |
| `apps/student-web/src/auth-api.test.ts` | 223 | `923a6a068fe57bab` |
| `apps/student-web/src/auth-api.ts` | 494 | `5e332f444c6e82a3` |
| `apps/student-web/src/curriculum-api.test.ts` | 95 | `c15fad18769fe2fd` |
| `apps/student-web/src/device-key.ts` | 117 | `b4cfd841680e1bcb` |
| `apps/student-web/src/main.tsx` | 28 | `34380162ab141049` |
| `apps/student-web/src/offline-api.test.ts` | 42 | `a3aa78884e745cbb` |
| `apps/student-web/src/offline-api.ts` | 64 | `02f0be8ad4ce6f1d` |
| `apps/student-web/src/offline-authorization.test.ts` | 119 | `cd9fc0c64421333c` |
| `apps/student-web/src/offline-authorization.ts` | 161 | `639f5266c6b5f147` |
| `apps/student-web/src/offline-content-store.test.ts` | 189 | `b06b561f4bef1fd9` |
| `apps/student-web/src/offline-content-store.ts` | 420 | `c007be91fa02a64d` |
| `apps/student-web/src/offline-download-api.ts` | 121 | `62a82eb1652719ba` |
| `apps/student-web/src/offline-materialization.ts` | 91 | `56a437566d6b6042` |
| `apps/student-web/src/offline-session.test.ts` | 93 | `56d57b6a708df974` |
| `apps/student-web/src/offline-session.ts` | 120 | `88bdf65cb65ff256` |
| `apps/student-web/src/offline-store.test.ts` | 76 | `99b2620a569b88e9` |
| `apps/student-web/src/offline-store.ts` | 207 | `857b6d37027cf65b` |
| `apps/student-web/src/presentation-foundation.tsx` | 65 | `64655bc59c836829` |
| `apps/student-web/src/pwa.test.ts` | 35 | `916c46f83c879f2c` |
| `apps/student-web/src/pwa.ts` | 57 | `d518212bd6bf319f` |
| `apps/student-web/src/router.tsx` | 45 | `f2f399a492c8b66b` |
| `apps/student-web/src/student-access.tsx` | 528 | `96d287bd4d39f848` |
| `apps/student-web/src/student-assessment.tsx` | 657 | `c422f515c65c7437` |
| `apps/student-web/src/student-learning-model.test.ts` | 84 | `47732c7beee750f7` |
| `apps/student-web/src/student-learning-model.ts` | 59 | `fbd7b564f0002909` |
| `apps/student-web/src/student-learning.tsx` | 310 | `2414d2d3207ba8b2` |
| `apps/student-web/src/student-offline-downloads.tsx` | 342 | `e49e90ab50529700` |
| `apps/student-web/src/student-reader.tsx` | 251 | `146995c5279c24d7` |
| `apps/student-web/src/vite-env.d.ts` | 9 | `0209610c59ec3f55` |
| `packages/ui/src/index.tsx` | 89 | `275bd728615f4e72` |
| `database/migrations/0001_core.sql` | 132 | `92964db10ff75e94` |
| `database/migrations/0002_access.sql` | 113 | `15c690e0186bbfe7` |
| `database/migrations/0003_learning.sql` | 249 | `ffa2b2611676ed05` |
| `database/migrations/0004_ai_and_sync.sql` | 114 | `14444040f64b0aa8` |
| `database/migrations/0005_auth.sql` | 87 | `1b9957c32effeb0a` |
| `database/migrations/0006_access_contract.sql` | 46 | `951d48810b3c91fe` |
| `database/migrations/0007_activation_contract.sql` | 32 | `2db5f81d15d08a0a` |
| `database/migrations/0008_content_source_import.sql` | 116 | `97927d36d3b0b8ff` |
| `database/migrations/0009_media_pipeline.sql` | 71 | `82ee602350efb6aa` |
| `database/migrations/0010_student_auth_device.sql` | 94 | `435e52625268899c` |
| `database/migrations/0011_ocr_foundation.sql` | 90 | `b20c659b89acc633` |
| `database/migrations/0012_ai_execution.sql` | 71 | `fef90c90a3983265` |
| `database/migrations/0013_ai_capacity_control.sql` | 19 | `e4697cf9dcb4674e` |
| `database/migrations/0014_ai_execution_controls.sql` | 118 | `51264b1734d84194` |
| `database/migrations/0015_ai_job_lifecycle.sql` | 12 | `62ef6d8ca147cfb8` |
| `database/migrations/0016_curriculum_structure.sql` | 70 | `a791f9ed838773eb` |
| `database/migrations/0017_content_ingestion_publication.sql` | 164 | `61c1d30dba9eab7c` |
| `database/migrations/0018_ai_admin_review.sql` | 33 | `84f3916da298e6b1` |
| `database/migrations/0019_question_bank.sql` | 233 | `4cc9c74d742a2721` |
| `database/migrations/0020_quiz_builder_enums.sql` | 3 | `49ac403072afe3e2` |
| `database/migrations/0021_quiz_builder.sql` | 220 | `5917dc7cde101077` |
| `database/migrations/0022_question_bank_regeneration.sql` | 34 | `ce12cfc57864a9d9` |
| `database/migrations/0023_admin_access_operations.sql` | 1 | `44522223f96e0781` |
| `database/migrations/0023_student_assessment_runtime.sql` | 63 | `5b9870f59bfbaee3` |
| `database/migrations/0024_stage13g_admin_ai_authoring.sql` | 1 | `9e30a1951e0630d5` |
| `database/migrations/0025_lesson_summary_content_revision.sql` | 22 | `886a38d161206ec8` |
| `database/migrations/0026_legacy_supabase_import_support.sql` | 17 | `e0f87166a0ba3fc8` |
| `.github/workflows/ocr-foundation.yml` | 68 | `57eab23332c47fea` |
| `.github/workflows/rebuild-stage-verification.yml` | 338 | `e1be4a175d97d3c4` |
| `.github/workflows/stage10-media-pipeline.yml` | 87 | `c9f9d028a2b28ef8` |
| `.github/workflows/stage11-ai-contracts.yml` | 33 | `eb65be8c7b1e5cd1` |
| `.github/workflows/stage12-ai-execution.yml` | 80 | `f66756f8b426502b` |
| `.github/workflows/stage13-curriculum-backend.yml` | 196 | `e2e656eca88c7a64` |
| `.github/workflows/stage13d-admin-ui.yml` | 103 | `c05117ff67f9df1c` |
| `.github/workflows/stage13d-content-ingestion.yml` | 68 | `49b5abbe529d24ca` |
| `.github/workflows/stage13e-ai-operations.yml` | 87 | `a10f4766f8526170` |
| `.github/workflows/stage13e-frontend-prep.yml` | 39 | `c7a7768b7e1c97b7` |
| `.github/workflows/stage13e-integration.yml` | 155 | `9516976891f495ae` |
| `.github/workflows/stage13f-admin-question-bank.yml` | 136 | `2e5a674ae278288f` |
| `.github/workflows/stage13f-question-bank.yml` | 78 | `684ff8c097e21c81` |
| `.github/workflows/stage13g-admin-operations.yml` | 204 | `424df5b015ab76c2` |
| `.github/workflows/stage14-student-api-quality.yml` | 48 | `cf5b4078ac9963a2` |
| `.github/workflows/stage14-student-product.yml` | 117 | `9507b7c03e53fa41` |
| `.github/workflows/stage15-student-assessment.yml` | 129 | `4adce8d8c4367d2e` |
| `.github/workflows/stage16-student-pwa.yml` | 151 | `30a674767dd13531` |
| `.github/workflows/stage9-content-import.yml` | 121 | `2d2569a32c918b3f` |
| `.github/workflows/ux-b01-shared-foundation.yml` | 82 | `009f8c56c8319756` |
| `.github/workflows/ux-b02-student-shell.yml` | 76 | `682b6418969fe3a5` |
| `.github/workflows/ux-b03-student-learning.yml` | 75 | `3b95355835a71cd2` |
