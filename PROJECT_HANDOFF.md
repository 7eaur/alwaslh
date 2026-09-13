# PROJECT HANDOFF — الوسيلة الذكية

> نقطة البداية للمحادثة الهندسية التالية. لا تعتمد على ذاكرة المحادثات السابقة بدل المستودع. الكود + PostgreSQL migrations + tests/CI + verified runtime + الوثائق الحالية هي Source of Truth.

Last synchronized: **2026-09-13 — Grade 9 English full technical import verified; publication closed**.

## 1. Mandatory startup

قبل أي تعديل:

1. live-check `7eaur/alwaslh@main`.
2. live-check `7eaur/alwaslh-go@content/legacy-staging-rebuild`.
3. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this handoff.
4. for Content Rebuild read the live `CONTENT_REBUILD_EXECUTION_STATUS.md` and `CONTENT_REBUILD_HANDOFF.md`.
5. inspect executable/runtime evidence before editing; anything not inspected = `NOT YET VERIFIED`.

## 2. Current Content truth — Grade 9 English

`FULL-GRADE9-ENGLISH-BULK-IMPORT = DONE / FULL_ASSET_COVERAGE_VERIFIED / UNPUBLISHED`

The complete RAW-backed Grade 9 English Pupil's Book 3 source corpus has been imported into modern PostgreSQL.

Verified:

- `69/69` RAW-backed pages
- `69/69` RAW images verified by SHA-256
- `69/69` content-source identities
- `69/69` ready Media Assets
- `69/69` Lesson Assets
- `8/8` Units/Sections
- `59` live Lesson identities own the 69 Lesson Assets
- `104/104` Question Revisions preserved
- source-manifest-only page 70 retained as evidence-only, not fabricated

Units:

1. `Unit 1 - Revision`
2. `Unit 2 - Describing: Making plans`
3. `Unit 3 - Other countries`
4. `Unit 4 - Visiting Japan`
5. `Unit 5 - Safety`
6. `Unit 6 - Helping others`
7. `Unit 7 - Communications`
8. `Unit 8 - Winning medals`

### Runtime evidence

Content commit:

`9e58ab3e882b883bddd016099949881801eedc28`

Railway deployment:

`de7f9883-b2f0-483d-a7c1-ffbfb15ac30c` — `SUCCESS`

Markers:

- `BULK_G9_EN_INSPECT_PASS`
- `BULK_G9_EN_TRANSACTION_GATE_PASS`
- `BULK_G9_EN_APPLY_PASS`
- `BULK_G9_EN_VERIFY_PASS`
- `BULK_G9_EN_RUNNER_PASS`

Committed mutation boundary:

- 6 Sections created
- 2 Sections reused
- 54 Lessons assigned to recovered Sections
- 5 Lesson assignments reused
- RAW mutations 0
- media-binary mutations 0
- Question mutations 0
- unrelated mutations 0
- publication changes 0

Published state remains:

- Lessons 0
- Lesson Assets 0
- Questions 0

Detailed report:

`7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/BULK_GRADE9_ENGLISH_IMPORT_REPORT.md`

## 3. Source authority / important correction

Do not use `alwaslh-go@master` as Grade 9 authority. It contains a separate Third Secondary/Pupil's Book 6 corpus.

Grade 9 authority for this import is:

- legacy subject `1794eea5-4772-4c94-bd2b-b08e5815e733`;
- branch `content/legacy-supabase-reconstruction`;
- immutable RAW extraction;
- `content-staging/curated/grade-9/english/pupil-book-3/reconstruction-candidates.json`.

The live `59` Lesson count is not the prohibited `69 -> 62` heuristic. It is the actual set of Lesson identities owning the 69 verified assets after earlier reviewed curation/reassignment. Every source page/image identity is represented exactly once.

## 4. Previous Content checkpoints

Retain as closed unless new evidence invalidates them:

- `BATCH-001 = DONE / COMMITTED_STATE_VERIFIED`
- `STRUCTURE-001 = DONE / SECTION_BOUNDARY_VERIFIED`
- `STRUCTURE-002 = DONE / SECTION_BOUNDARY_VERIFIED`
- `CURATION-001 = DONE / LESSON_BOUNDARY_VERIFIED`
- `CURATION-002 = DONE / LESSON_BOUNDARY_VERIFIED`
- `CONTENT-GAPS-001 = DONE / GAP_INVENTORY_VERIFIED`
- `MEDIA-001 = DONE / MEDIA_PROFILE_VERIFIED_PARTIAL_ACCEPTANCE`
- `IMPORT-001 = DONE / COMMITTED_STATE_VERIFIED`
- `VERIFY-001 = DONE / DELIVERY_ISOLATION_AND_PROVENANCE_VERIFIED`
- `ROADMAP-RETURN = DONE / STUDENT-016I_HANDOFF_VERIFIED`
- `FULL-GRADE9-ENGLISH-BULK-IMPORT = DONE / FULL_ASSET_COVERAGE_VERIFIED / UNPUBLISHED`

## 5. Student workstream remains separate

PR #57 — `feat(student): close cold-start offline Reader gap` remains open for `STUDENT-016I` on branch `stage16/student-016i`.

Last live head checked during the Content import run:

`ce97ef2524cd3735a0200ee0f15fa6e6e224e01e`

It was not merged or modified by this Content run. Re-fetch exact-head CI when Student work resumes.

Student roadmap after 016I remains:

`STUDENT-016R -> STUDENT-016S -> conditional STUDENT-016O -> STUDENT-016G -> Stage17 -> Stage18 -> Stage19`.

## 6. Next Content decision

Do not rerun bulk import: the technical/data-completeness import is complete.

Any next Content action must be explicitly one of:

- pedagogical refinement of grouping/naming of already-imported Lessons; or
- publication review/gate.

Do not publish merely because the import succeeded. Do not mutate RAW, delete anomalies, fabricate page 70, or use `69 -> 62` as curriculum truth.

## 7. Stable security/product boundaries

- API + PostgreSQL own canonical state.
- Auth/Authz/Entitlements remain server-owned.
- browser is not canonical durable business authority.
- `media ready != published`.
- AI output never auto-publishes learner content/questions.
- protected Reader/media remains server-authorized.
- Question Bank publication + immutable Quiz version remain delivery authority.
- `/v1` never becomes Service Worker cache authority.
