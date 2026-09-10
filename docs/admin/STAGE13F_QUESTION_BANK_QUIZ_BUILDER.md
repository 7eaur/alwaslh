# Stage13F — Question Bank / Quiz Builder / Publish Contract

Status: **IMPLEMENTED / VERIFIED / CLOSED**.

Verified runtime checkpoint: `afbe552710b3f1cf79ee70594f691fa836c05a45`.

Stage-specific evidence: backend/PostgreSQL run `34420441878` SUCCESS; Admin/PostgreSQL/real Chromium run `34420441837` SUCCESS.

Wider runtime verification-only PR #27 executed **13/13 SUCCESS** on the exact runtime head and was closed unmerged. The closure documentation checkpoint containing this file must also pass the same wider matrix before non-force promotion to `main`.

## 1. Product Boundary

Stage13F is the reviewed educational assessment authority between Stage13E-approved AI output and later Stage15 Student Practice/Assessment consumption:

```text
Stage11 typed generation + validation
→ Stage12 durable job/unit/output
→ Stage13E append-only human AI review
→ Stage13F Question Bank import/manual authoring
→ Question Bank Draft → Review → Published
→ Stage13F Quiz Builder / immutable version snapshots
→ Stage15 Student Practice/Assessment consumption
```

Stage13E approval is **eligibility to import**, not Question Bank publication. Raw/unreviewed provider output is never Question Bank/Student authority.

## 2. Repository Decisions / Classification

### Existing PostgreSQL learning foundation — KEEP + IMPROVE

Existing `quizzes`, `quiz_lessons`, `quiz_versions`, `questions`, `question_options` and attempt/practice tables remain useful delivery/assessment foundation.

They are not reused as canonical mutable Question Bank authoring identity.

### Canonical reusable Question Bank — REBUILD as explicit layer

Stage13F adds stable `question_bank_items` and append-only `question_bank_revisions` with lesson/source/import/event relations.

### Stage11 contracts — KEEP / reused

Question types, answer status, difficulty, source evidence, exact extraction and `regenerate_question` remain Stage11 authority.

### Stage12 execution — KEEP / reused

No second generation queue exists. Durable jobs/units/attempts/outputs remain Stage12 authority.

### Stage13E review — KEEP / reused

Only the latest terminal `approve` review revision may be imported/applied.

### Admin Question Bank / Quiz Builder — REBUILD explicit workspaces

Dedicated authenticated Admin workspaces were added instead of reviving browser-owned legacy state.

## 3. Canonical Question Bank Model

### Stable identity

Each item owns a stable UUID independent of quizzes and revisions.

### Immutable revisions

Question content is append-only by revision. Editing/regeneration never mutates a revision already published or snapshotted into a quiz.

### Lifecycle

```text
draft → review → published → archived historical revision
```

Rules:

- create/import/edit/regeneration creates Draft;
- submit-for-review is explicit;
- publish only from Review;
- a previously published revision remains authority while a replacement Draft/Review exists;
- when replacement publishes, old published revision becomes archived history;
- rejected Review returns to Draft with durable reason/event.

### Typed content

- `multiple_choice`: exactly four nonblank options;
- `true_false`: exact `["صح", "خطأ"]` shape;
- `direct`: no options;
- known option answers require matching selected option;
- known direct answer requires nonblank `answerText`;
- unknown/review-required answers cannot claim a correct answer.

PostgreSQL and service validation both protect the authority boundary.

## 4. Provenance

AI-derived revisions retain:

- `ai_output_id`;
- exact approved Stage13E review revision;
- deterministic question locator;
- prompt key/version and generation mode;
- class/subject scope;
- lesson IDs;
- media asset ID;
- page number;
- input checksum;
- OCR extraction/content source asset where present;
- source quote where present.

Raw provider responses/credentials are not copied into Question Bank.

## 5. AI Import / `AI-011-005`

`AI-011-005` is **FIXED + VERIFIED** for reviewed direct-question persistence and delivery authority.

Import transaction:

1. lock/read output and latest review;
2. require latest review action = `approve`;
3. parse reviewed output with Stage11 schema/validation;
4. reject non-question outputs;
5. map deterministic locators;
6. enforce idempotency `(ai_output_id, approved_review_revision, question_locator)`;
7. preserve source/checksum lineage;
8. create Draft items only.

`direct` questions are supported in both canonical bank revisions and immutable quiz delivery snapshots. Student direct-answer interaction remains Stage15.

## 6. Manual Authoring / Admin Question Bank

Verified Admin outcomes:

- list/search/filter/pagination;
- loading/error/empty states;
- manual MCQ/T-F/direct authoring;
- approved AI import;
- edit as new revision;
- submit/reject/publish;
- source/provenance/history/audit detail;
- session-expiry handling;
- responsive 390px behavior.

Browser reloads canonical server state after mutations; local UI is never lifecycle authority.

## 7. Quiz Builder

Stage13F reuses `quizzes`, `quiz_lessons`, `quiz_versions` and materialized `questions` snapshots.

Verified rules:

- quiz owns class/subject and one/multiple lessons;
- candidate endpoint returns only **published** Question Bank revisions matching quiz scope;
- version/model has stable ID/number/label and option-shuffle setting;
- each selected bank revision is materialized into immutable delivery question/options rows;
- delivery snapshot retains `question_bank_item_id` + `question_bank_revision_id`;
- direct question delivery shape is explicit;
- Draft quiz versions may be changed;
- Review/Published quizzes freeze version mutation;
- publish/archive are explicit audited lifecycle actions.

Editing the Question Bank later never mutates historical/published quiz versions.

## 8. Regenerate One Question

Verified architecture:

```text
published sourced bank revision
→ Stage11 regenerate_question request
→ Stage12 output
→ Stage13E approve
→ explicit Stage13F apply
→ later Draft revision of SAME item UUID
```

The apply transaction verifies:

- no conflicting unrelated open Draft/Review;
- request mode is exactly `regenerate_question`;
- original prompt/type/difficulty matches the current published revision;
- request source set matches published revision source IDs/pages/checksums;
- approved output contains exactly one valid question;
- type/difficulty stay unchanged;
- regenerated prompt is actually different;
- exact output/review replay returns the same revision.

A database guard prevents generic import from using `regenerate_question` output to create a standalone new item. The replay lookup occurs before open-Draft rejection so retries are truly idempotent.

## 9. Export

Exact quiz/version server authority only.

Allowed status: `review | published`.

Draft export is rejected.

Current verified formats:

- UTF-8 BOM CSV suitable for Excel-compatible workflows;
- RTL print HTML suitable for browser printing / Save as PDF.

Current bundle includes question/order/type/options/correct answer/explanation/source page/source reference/Question Bank item/revision provenance.

This does not silently claim every historical PDF variant; missing variants remain explicit Legacy Coverage items for later Admin work.

## 10. Security / Integrity

- Admin-only authenticated API.
- unsafe mutations retain Origin protection.
- lifecycle/shape/idempotency invariants exist in PostgreSQL.
- browser never owns canonical status/revision/publication truth.
- no raw provider payloads/secrets in Admin Question Bank contract.
- no automatic Stage13E approve → Published transition.
- no update-in-place of published bank revisions or published quiz snapshots.
- concurrent/repeated approved imports converge idempotently.
- regeneration cannot change stable item identity.
- export never treats Draft as reviewed/published authority.

## 11. Verification Evidence

### Runtime checkpoint

`afbe552710b3f1cf79ee70594f691fa836c05a45`

Stage-specific:

- `34420441878` — API lint/typecheck/unit/build, migrations, Stage13F DB contracts, Question Bank integration, regeneration integration, Quiz Builder integration — SUCCESS.
- `34420441837` — Admin lint/typecheck/unit/build, real PostgreSQL/API, deterministic fixtures and real Chromium — SUCCESS.

### Wider runtime matrix / PR #27

13/13 SUCCESS:

- Stage9 `34420900598`
- Stage10 `34420900550`
- OCR `34420900527`
- Stage11 `34420900592`
- Stage12 `34420900501`
- Stage13 Admin `34420900492`
- Stage13D Content `34420900547`
- Stage13D Admin `34420900488`
- Stage13E Frontend Prep `34420900522`
- Stage13E Admin AI Ops `34420900503`
- Stage13F Backend `34420900520`
- Stage13F Admin/Chromium `34420900476`
- Rebuild `34420900482`

PR #27 was closed unmerged after success.

## 12. Legacy Coverage Outcome

Stage13F has executable evidence for the canonical Question Bank and core Quiz Builder outcomes. It does **not** claim every legacy Admin quiz-generation/export variant.

`docs/product/LEGACY_FEATURE_COVERAGE_GATE.md` records:

- rows promoted to `VERIFIED` by Stage13F;
- rows that are only `FOUNDATION VERIFIED` because Stage11/12/13E exists without a complete Admin trigger/user flow;
- rows remaining `NOT YET VERIFIED` for Stage13G/AI authoring.

No legacy capability is silently removed.

## 13. Closure / Promotion

Stage13F implementation is closed. The final documentation checkpoint must still run the wider pull-request matrix on its exact commit. The verification PR must be closed unmerged, then `main` may be non-force fast-forwarded to that exact commit after confirming `main` did not move.

After promotion:

- Track A starts Stage13G;
- Track B must incorporate the new `main` authority before Stage15;
- `AI-012-019` remains explicitly `NOT YET VERIFIED` until live provider runtime evidence exists.