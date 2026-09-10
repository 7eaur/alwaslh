# PROJECT HANDOFF — الوسيلة الذكية

> أي محادثة هندسية بديلة يجب أن تستطيع استئناف المشروع بالكامل من GitHub بدون ذاكرة Chat سابقة.

Last synchronized: **2026-09-10 — Stage13F implementation VERIFIED/CLOSED; final closure checkpoint requires exact-head PR matrix then non-force fast-forward to main.**

## Mandatory startup

1. Confirm repository `7eaur/alwaslh`.
2. Read `README.md` and `DOCUMENTATION_INDEX.md`.
3. Read this file, `PROJECT_STATUS.md`, `PROJECT_RESUME_SNAPSHOT.md`, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_INTEGRATION_CONTINUITY.md`, `PROJECT_EXECUTION_QUEUE.md`.
4. Read `docs/product/CURRENT_PRODUCT_OVERRIDES.md` and the latest Issue #16 body/comments.
5. If working Track B, also read `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md` and `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md` from its branch.
6. Live-check `main`, current branch HEAD and Actions before any conclusion.

Code/migrations/executable evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

## Operating model

Issue #16 defines the current **parallel two-track** model:

- Track A: Backend/Admin/AI/Question Bank/Quiz Builder; current next stage after promotion is Stage13G.
- Track B: Student Product on `parallel/stage14-student-product`.
- Shared backend contracts become Student authority only after verified promotion through `main`.
- No force-push/history rewrite, duplicate authority, auth bypass, fake API or test weakening.
- Production deployment/cutover remains future-only. Stage13F required no deployment.

## Stable architecture / business rules

- Browser does not own canonical durable state.
- Full Code = 6 digits; Class Code = 7 digits.
- Returning Student requires password + registered P-256 device proof.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- `media ready != published`; publication is Draft → Review → Published.
- raw AI/provider output never becomes Student/Question Bank authority.
- Stage11 owns typed AI contracts/validation.
- Stage12 owns durable execution/jobs/units/attempts/outputs.
- Stage13E owns append-only human AI review.
- Stage13E `approve` is import eligibility, not Question Bank publication.
- Stage13F Question Bank owns stable reusable item UUID + immutable revisions + Draft/Review/Published.
- Quiz Builder selects published Question Bank revisions and materializes immutable delivery snapshots.
- published snapshots are later Student Stage15 authority.

## Stage13F verified runtime authority

Runtime HEAD:

`afbe552710b3f1cf79ee70594f691fa836c05a45`

Stage-specific evidence:

- backend/PostgreSQL `34420441878` — SUCCESS;
- Admin/PostgreSQL/real Chromium `34420441837` — SUCCESS.

Wider verification-only PR `#27` ran **13/13 SUCCESS** on the same runtime HEAD and was closed unmerged:

`34420900598`, `34420900550`, `34420900527`, `34420900592`, `34420900501`, `34420900492`, `34420900547`, `34420900488`, `34420900522`, `34420900503`, `34420900520`, `34420900476`, `34420900482`.

## Stage13F closed scope

- reusable canonical Question Bank separate from delivery rows;
- immutable revisions and stable item identity;
- MCQ / T-F / direct questions and typed answers;
- source/page/checksum/OCR/content-source + AI review/prompt provenance;
- latest-approve-only AI import as Draft with idempotent concurrency behavior;
- manual authoring/edit/review/reject/publish;
- dedicated Admin Question Bank UI;
- Quiz Builder with class/subject/multi-lesson scope, multiple versions/models and published candidates;
- immutable quiz delivery snapshots retaining Question Bank item/revision refs;
- review/publish/archive lifecycle;
- approved regenerate-one applied as a later Draft revision of the same item only;
- reviewed/published exact-version Excel-compatible CSV and print/PDF template;
- real Chromium lifecycle/session/responsive evidence.

## Important open boundaries

- `AI-012-019` — live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED`.
- Stage13F does **not** claim every legacy `QADMIN-001..033` row. Remaining direct generation orchestration and specialized export variants are explicit Stage13G/AI-authoring work in `LEGACY_FEATURE_COVERAGE_GATE.md`.
- Track B Stage14: Access/Curriculum/Reader verified; final learning-first shell/copy/a11y closure still active in its branch.
- Stage15 must not begin against stale main; Track B must first incorporate the exact Stage13F closure checkpoint after promotion.

## Git / incident notes

- Runtime verification PR #27 was verification-only and is closed unmerged.
- The accidental `.noop` create/delete before Stage13F had no final tree/runtime effect. Cleanup `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5` restored exact tree `bcd433bd553b3e7eb539515cffd2a23a92f97192`. Treat as resolved P3 history noise; do not rewrite history.

## Exact continuation

For the Stage13F closure owner:

1. run the wider PR matrix on the documentation checkpoint containing this file;
2. close that verification PR unmerged;
3. re-check live `main` is still the Stage13F base;
4. fast-forward `main` non-force to the exact verified closure checkpoint;
5. post final Stage13F EXECUTION REPORT on Issue #16.

Then:

- Track A begins Stage13G from the new `main` authority;
- Track B incorporates the new `main` before Stage15;
- keep `AI-012-019` open until real provider evidence exists.

Never infer completion from this prose alone; verify branch/main and Actions first.