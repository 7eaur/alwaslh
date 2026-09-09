# Stage13F — Question Bank / Quiz Builder / Publish Contract

Status: **CONTRACT FROZEN / IMPLEMENTATION STARTING / NOT YET VERIFIED**.

Baseline inspected before this decision: `main` tree `bcd433bd553b3e7eb539515cffd2a23a92f97192`; Stage13F branch starts from `5fdb23030c77cae9bff5f8c33d4be466427eb6e5`, which has that exact tree.

## 1. Product boundary

Stage13F creates the reviewed educational authority between Stage13E-approved AI output and later Student/Practice consumption:

```text
Stage11 typed generation + validation
→ Stage12 durable job/unit/output
→ Stage13E append-only human AI review
→ Stage13F Question Bank import/manual authoring
→ Question Bank Draft → Review → Published
→ Stage13F Quiz Builder / immutable version snapshots
→ later Stage15 Student Practice/Assessment consumption
```

Stage13E approval is **eligibility to import**, not Question Bank publication. Raw/unreviewed provider output is never eligible for Question Bank or Student authority.

## 2. Repository inventory and classification

### PostgreSQL learning foundation — KEEP + IMPROVE

`database/migrations/0003_learning.sql` already owns:

- `quizzes`;
- `quiz_lessons`;
- `quiz_versions`;
- `questions`;
- `question_options`;
- Practice/attempt/bookmark tables.

These tables are not replaced blindly. `quizzes`, `quiz_versions`, `quiz_lessons`, assessment snapshots and later Practice relations remain useful foundation.

Current limitations that Stage13F must fix deliberately:

- `question_type` supports only `multiple_choice | true_false`; Stage11 also supports `direct`;
- `questions` requires Lesson or Quiz Version context and therefore models delivered assessment questions, not an independent reusable reviewed Question Bank identity;
- no Question Bank Draft → Review → Published lifecycle exists;
- no immutable Question Bank revision history exists;
- no durable AI-output/review-revision → Question Bank provenance/idempotency boundary exists.

Classification: existing assessment schema **KEEP/IMPROVE**; canonical reusable Question Bank authority **REBUILD as a new explicit layer**, not by overloading delivery snapshots.

### Stage11 contracts — KEEP / authority reused

`apps/api/src/ai/contracts.ts` already defines:

- modes including question generation, multi-version quiz, exact extraction and single-question regeneration;
- question types `multiple_choice | true_false | direct`;
- typed answer status/difficulty;
- exact source evidence by media asset/page;
- direct-question `answerText`;
- multi-version outputs.

Stage13F reuses these contracts and Stage11 semantic validation. It does not create a parallel AI-question validator.

### Stage12 durable execution — KEEP / authority reused

`ai_jobs`, `ai_job_units`, `ai_execution_attempts`, `ai_outputs` remain the only durable AI execution authority. Stage13F must not create a second generation queue.

### Stage13E AI review — KEEP / authority reused

`ai_output_review_events` remains the Stage13E AI review authority. Only the canonical latest terminal `approve` revision may be imported into Question Bank. Stage13F does not reinterpret a historical review page or raw `ai_outputs.normalized_output` as approved authority.

### Current API — REBUILD Stage13F module

Current `apps/api/src/app.ts` registers Auth, Access, Curriculum, Content, Ingestion and Admin AI Operations only. There is no current Question Bank/Quiz Builder API module. Stage13F adds one explicit server-owned module rather than reviving browser/direct-database legacy flows.

### Current Admin Web — REBUILD Stage13F workspace

Current `apps/admin-web/src/App.tsx` exposes Curriculum, Content Ingestion, Media/OCR and AI Operations only. There is no current Question Bank/Quiz Builder workspace. Stage13F must add a dedicated workspace; Question Bank must not be hidden inside Stage13E AI Operations.

### Legacy Admin quiz surface — outcome evidence only

Legacy `src/pages/admin/Quizzes.tsx` proves valuable outcomes such as:

- quiz listing/create/edit/delete;
- class/subject/one-or-many lesson selection;
- MCQ/T-F counts and mixed generation;
- image/exact exam extraction;
- multiple models/versions;
- per-version source/count settings;
- edit/manual/remove/regenerate one question;
- exports and selected-version export.

Its browser-owned state, old API/direct data assumptions, caches and types are **not implementation authority**.

## 3. Canonical Question Bank model

### Stable item identity

A Question Bank item owns a stable UUID independent of any quiz version. It is reusable across quiz versions and remains stable across edits/regeneration.

### Immutable revisions

Question content is stored in append-only immutable revisions. A revision contains the typed question payload plus provenance. Editing/regenerating creates a new revision; it never mutates a revision already used by a published quiz version.

### Lifecycle

Question Bank lifecycle is:

```text
draft → review → published → archived
```

Rules:

- create/import/manual edit produces Draft;
- submit-for-review is explicit;
- publish is possible only from Review and records actor/time;
- changing a published question creates a new Draft revision while the previously published revision remains the published authority until the replacement is explicitly reviewed/published;
- archive is non-destructive;
- rejected review returns the item to Draft with a durable reason/event; no destructive deletion of audit/provenance.

### Content representation

Canonical Question Bank revisions support:

- `multiple_choice`;
- `true_false`;
- `direct`;
- prompt;
- options where applicable;
- correct option index where applicable;
- direct answer text where applicable;
- answer status;
- difficulty;
- explanation;
- method/solution method.

Stage11 shape validation remains authoritative for AI-derived payloads. Equivalent typed validation is reused for manual edits before persistence/publish.

## 4. Provenance

Every AI-imported Question Bank item records enough durable provenance to answer where the educational content came from:

- originating `ai_output_id`;
- exact approved Stage13E review revision;
- stable question locator inside the approved output;
- Stage11 prompt key/version and generation mode through the owning AI job/unit;
- provider/model/route execution evidence remains referenced through existing Stage12 attempt history rather than duplicated into Question Bank;
- class/subject offering scope;
- source Lesson relation(s) where determinable/selected;
- media asset ID;
- source page;
- source checksum from the original Stage11 request chunk;
- OCR extraction ID / content source asset ID where available;
- source quote where Stage11 output supplied one.

Question Bank must not copy raw provider response or credentials.

## 5. AI import and `AI-011-005`

`AI-011-005` root gap is explicit:

- Stage11 validates `direct` questions with `answerText`;
- old PostgreSQL assessment enum has no `direct` value;
- Stage13E can approve typed output but has no durable Question Bank transfer.

Stage13F resolves it by importing approved `multiple_choice`, `true_false` **and `direct`** questions into the canonical bank revision model.

Import rules:

1. lock/read the owning output and canonical latest Stage13E review;
2. require latest action = `approve`;
3. parse the approved `reviewed_output` using Stage11 `aiGenerationOutputSchema`;
4. accept only output kinds carrying questions;
5. map each question with a deterministic output locator;
6. enforce idempotency on `(ai_output_id, approved_review_revision, question_locator)`;
7. preserve source evidence/checksum mapping from the original Stage11 request;
8. create Question Bank Draft items; do **not** publish automatically.

Re-import of the same approved revision is idempotent and returns the same item mappings.

## 6. Manual authoring

Manual questions use the same Question Bank item/revision/lifecycle model and typed question validation. They have no fabricated AI provenance. Author/actor/time remain durable.

## 7. Quiz Builder boundary

Existing `quizzes`, `quiz_lessons` and `quiz_versions` remain the base builder/domain tables.

A quiz version selects **published Question Bank revisions** and materializes immutable assessment snapshots into the existing `questions`/`question_options` delivery layer. Each delivery snapshot retains a reference to its source Question Bank item/revision.

This boundary is intentional:

- editing a bank item never mutates a historical/published quiz version;
- quiz attempts remain reproducible;
- multiple versions/models can share or diverge from stable bank identities;
- later Stage15 Practice consumes delivery snapshots, not mutable authoring rows.

Direct-question delivery support will extend the old assessment representation explicitly before Student direct-answer interaction is enabled; Stage15 still owns Student answer/session behavior.

## 8. Regenerate one question

Single-question regeneration reuses Stage11 `regenerate_question` + Stage12 durable execution. The result goes through Stage13E approval and then creates a **new revision of the same stable Question Bank item** only after explicit Stage13F import/apply. Unrelated bank items or quiz-version snapshots are not replaced.

No synchronous browser→provider regeneration path is allowed.

## 9. Quiz/version lifecycle and publication

Quiz authoring must not expose an unreviewed mutable version as Student authority.

Stage13F will add an explicit review/publish state for the authoring/version boundary. Export/print is permitted only from reviewed/published version authority, with an explicit draft preview path if later required by product UX; draft preview must be clearly labelled and never treated as published Student content.

## 10. Legacy coverage target

Stage13F is responsible for explicit evidence against QADMIN-001..033 where implemented in this stage and for Question Bank/editor portions of LES-A-022..033. Stage11/12/13E foundation alone does not close these rows.

Student `QUIZ-S-*` execution remains Stage15 except where Stage13F must create the published data contract those flows will consume.

## 11. Security and integrity rules

- Admin-only authenticated API; unsafe requests retain Origin protection.
- PostgreSQL owns lifecycle and uniqueness invariants.
- browser never owns canonical status/revision/publish truth.
- no raw provider payloads/secrets in Question Bank responses.
- no automatic Stage13E approve → Published transition.
- no update-in-place of published revisions or published quiz snapshots.
- source/provenance rows are non-destructive.
- imported AI output must be terminally approved at transaction time, not based on stale UI state.
- concurrent duplicate imports serialize/idempotently converge.

## 12. Incremental execution plan

### Stage13F-A — Question Bank DB/API foundation

- migration for stable items, revisions, provenance, lifecycle events/import idempotency;
- approved AI import incl. direct questions;
- manual create/edit;
- list/detail/filter/pagination;
- submit/reject/publish lifecycle;
- PostgreSQL/API unit+integration evidence.

### Stage13F-B — Admin Question Bank workspace

- dedicated navigation/workspace;
- list/filter/detail/editor;
- import approved AI output;
- lifecycle actions/history/provenance;
- loading/empty/error/session-expiry/stale conflict/responsive/accessibility states;
- real Chromium.

### Stage13F-C — Quiz Builder / version snapshots

- reuse quizzes/quiz_lessons/quiz_versions;
- select published bank revisions;
- stable version identities/order/settings;
- materialized question snapshots with bank provenance;
- single-question regeneration workflow linkage;
- review/publish version authority.

### Stage13F-D — Export / closure

- safe Excel/PDF/print variants from approved/published authority;
- exact selected-version scope;
- same-head wider regressions;
- Legacy Coverage/Roadmap/central docs/Issue #16 closure.

## 13. Verification status

This document freezes the inspected architecture/product contract only. Stage13F implementation remains `NOT YET VERIFIED` until executable PostgreSQL/API/Admin/Chromium and wider same-head gates pass.
