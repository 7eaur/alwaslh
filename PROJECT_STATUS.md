# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-13 — Grade 9 English full technical import verified**.

## Current state

**CURRENT USER PRIORITY: Content Rebuild — Grade 9 English full import**

The hourly roadmap automation is disabled. Student PR #57 remains a separate open workstream and was not merged as part of this content run.

### Grade 9 English — FULL IMPORT COMPLETE / UNPUBLISHED

The full RAW-backed Grade 9 English Pupil's Book 3 source corpus is now present in modern PostgreSQL and has passed inspect → rollback-only gate → controlled apply → committed-state verification.

Verified scope:

- RAW-backed pages: `69/69`
- RAW images verified by SHA-256: `69/69`
- content source identities: `69/69`
- ready Media Assets: `69/69`
- Lesson Assets: `69/69`
- recovered Units/Sections: `8/8`
- live Lesson identities owning the 69 assets: `59`
- Question Revisions preserved: `104/104`
- manifest-only final page 70: `1`, preserved as evidence-only because it has no RAW identity

Recovered Units:

1. `Unit 1 - Revision`
2. `Unit 2 - Describing: Making plans`
3. `Unit 3 - Other countries`
4. `Unit 4 - Visiting Japan`
5. `Unit 5 - Safety`
6. `Unit 6 - Helping others`
7. `Unit 7 - Communications`
8. `Unit 8 - Winning medals`

Bulk mutation boundary:

- missing Sections created: `6`
- existing Sections reused: `2`
- Lessons assigned to recovered Section: `54`
- existing correct Lesson assignments reused: `5`
- RAW mutations: `0`
- media-binary mutations: `0`
- Question mutations: `0`
- unrelated mutations: `0`
- publication changes: `0`

Publication state remains intentionally closed:

- published Lessons: `0`
- published Lesson Assets: `0`
- published Questions: `0`

Runtime evidence:

- content source commit: `9e58ab3e882b883bddd016099949881801eedc28`
- Railway deployment: `de7f9883-b2f0-483d-a7c1-ffbfb15ac30c` — `SUCCESS`
- markers: `BULK_G9_EN_INSPECT_PASS`, `BULK_G9_EN_TRANSACTION_GATE_PASS`, `BULK_G9_EN_APPLY_PASS`, `BULK_G9_EN_VERIFY_PASS`, `BULK_G9_EN_RUNNER_PASS`
- canonical report: `7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/BULK_GRADE9_ENGLISH_IMPORT_REPORT.md`

### Source authority clarification

`7eaur/alwaslh-go@master` contains a different Third Secondary/Pupil's Book 6 corpus and was not used as Grade 9 authority.

Grade 9 English authority for this import is the immutable legacy Supabase reconstruction plus `content-staging/curated/grade-9/english/pupil-book-3/reconstruction-candidates.json`.

The count `59` is the observed live Lesson identity count after prior reviewed curation/reassignment. It is **not** derived using the prohibited `69 -> 62` heuristic. Every RAW-backed page/image remains represented exactly once.

The technical/data-completeness import is complete. A later pedagogical cleanup may merge/rename already-imported Lesson identities, but that is semantic refinement rather than missing content/media import work.

## Content Rebuild checkpoints retained

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

## Student workstream retained

PR #57 — `feat(student): close cold-start offline Reader gap` remains open on branch `stage16/student-016i`.

Last live head checked during this content run:

`ce97ef2524cd3735a0200ee0f15fa6e6e224e01e`

It is not merged. Do not infer current CI state without re-fetching exact-head checks when Student work resumes.

## Remaining roadmap

Student roadmap remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

Content publication is a separate explicit gate. Do not expose the imported Grade 9 English content to students merely because the technical import is complete.

## Required startup

Read live heads first, then:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. relevant product architecture documents
5. for Content Rebuild, the live `CONTENT_REBUILD_EXECUTION_STATUS.md` and `CONTENT_REBUILD_HANDOFF.md` in `7eaur/alwaslh-go@content/legacy-staging-rebuild`
