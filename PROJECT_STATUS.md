# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-14 — reviewed Grade 9 English Unit 2 Lessons published and runtime-verified**.

## Current state

**CURRENT USER PRIORITY: Content Rebuild — review and publish verified Grade 9 English content**

The hourly roadmap automation is disabled. Student PR #57 remains a separate workstream and was not merged as part of this content run.

### Grade 9 English — FULL TECHNICAL IMPORT COMPLETE / PARTIALLY PUBLISHED BY REVIEW

The full RAW-backed Grade 9 English Pupil's Book 3 corpus is present in modern PostgreSQL and previously passed inspect → rollback gate → controlled apply → committed-state verification.

Verified imported scope:

- RAW-backed pages: `69/69`
- RAW images verified by SHA-256: `69/69`
- content source identities: `69/69`
- ready Media Assets: `69/69`
- Lesson Assets: `69/69`
- recovered Units/Sections: `8/8`
- Question Revisions preserved: `104/104`
- manifest-only page 70: evidence-only because it has no RAW identity

Recovered Units:

1. `Unit 1 - Revision`
2. `Unit 2 - Describing: Making plans`
3. `Unit 3 - Other countries`
4. `Unit 4 - Visiting Japan`
5. `Unit 5 - Safety`
6. `Unit 6 - Helping others`
7. `Unit 7 - Communications`
8. `Unit 8 - Winning medals`

Bulk-import runtime evidence remains:

- content source commit: `9e58ab3e882b883bddd016099949881801eedc28`
- Railway deployment: `de7f9883-b2f0-483d-a7c1-ffbfb15ac30c` — `SUCCESS`
- markers: `BULK_G9_EN_INSPECT_PASS`, `BULK_G9_EN_TRANSACTION_GATE_PASS`, `BULK_G9_EN_APPLY_PASS`, `BULK_G9_EN_VERIFY_PASS`, `BULK_G9_EN_RUNNER_PASS`

Do not rerun the bulk import.

## Reviewed Unit 2 publication — DONE / COMMITTED_STATE_VERIFIED_AND_PUBLISHED

The user explicitly authorized publication only for the Lessons/questions that completed review.

Published Lesson 1:

- `curated-english9-pb3-u2-describing-people-and-animals`
- `Describing people and animals`
- pages `5..8`
- published Lesson Assets: `4`
- published reviewed Question Revisions: `12`

Published Lesson 2:

- `curated-english9-pb3-u2-time-and-meeting`
- `Telling time and arranging a meeting`
- pages `9..10`
- published Lesson Assets: `2`
- published reviewed Question Revisions: `7`

Question review result:

- reviewed: `19`
- approved unchanged: `18`
- corrected before publication: `1`

Corrected page-10 question now asks:

`When is Fuad helping Dad on Saturday?`

with answer `at six o'clock` and a matching reviewed explanation.

Publication runner evidence:

- publisher commit: `ea5a19b7086eb8779701be2b1f47fc073b38aa12`
- reviewed correction/final execution head: `7d17e19bef37835d500de492053e728f0cdb9f1b`
- Railway deployment: `5024b218-32e0-49fe-b9f8-20ee82c5bcd0` — `SUCCESS`
- markers: `G9_U2_PUBLISH_APPLY_PASS`, `G9_U2_PUBLISH_FULL_PASS`
- final status: `COMMITTED_STATE_VERIFIED_AND_PUBLISHED`

Verified Grade 9 English publication totals after this gate:

- published Lessons: `2`
- published Lesson Assets: `6`
- published Question Revisions: `19`
- target Reader-eligible assets: `6`
- target published/known Question Revisions eligible for Quiz Builder: `19`

Those exact totals prove the rest of the imported Grade 9 English corpus remains Draft/unpublished.

Student delivery semantics:

- the two reviewed Lessons satisfy Student Reader publication predicates, subject to normal auth/entitlement rules;
- their 19 reviewed Question Revisions are published in Question Bank and linked to the two modern Lessons (`12 + 7`);
- no standalone student Quiz/version is claimed to have been created or published by this gate. Quiz construction/publication is separate if required.

Isolation:

- RAW mutations: `0`
- media-binary mutations: `0`
- unrelated publication: `0`
- page 70 fabrication: `0`
- prohibited `69 -> 62` heuristic: not used

Canonical report:

`7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/GRADE9_UNIT2_REVIEWED_PUBLICATION_REPORT.md`

## Source authority clarification

The exact original Grade 9 reference exists in `7eaur/alwaslh-go@master` under `تاسع انجليزي/الانجليزي_تاسع` and may be used for structural/page/title cross-checking. `master` also contains unrelated corpora such as Third Secondary/Pupil's Book 6, so the exact Grade 9 path must be resolved before use.

Immutable RAW, the reconstruction manifest and live PostgreSQL remain the write/import authority. The legacy `69 -> 62` heuristic is prohibited.

## Content Rebuild checkpoints retained

- `BATCH-001 = DONE / COMMITTED_STATE_VERIFIED`
- `STRUCTURE-001 = DONE / SECTION_BOUNDARY_VERIFIED`
- `STRUCTURE-002 = DONE / SECTION_BOUNDARY_VERIFIED`
- `CURATION-001 = DONE / COMMITTED_STATE_VERIFIED / PUBLISHED`
- `CURATION-002 = DONE / COMMITTED_STATE_VERIFIED / PUBLISHED`
- `CONTENT-GAPS-001 = DONE / GAP_INVENTORY_VERIFIED`
- `MEDIA-001 = DONE / MEDIA_PROFILE_VERIFIED_PARTIAL_ACCEPTANCE`
- `IMPORT-001 = DONE / COMMITTED_STATE_VERIFIED`
- `VERIFY-001 = DONE / DELIVERY_ISOLATION_AND_PROVENANCE_VERIFIED`
- `ROADMAP-RETURN = DONE / STUDENT-016I_HANDOFF_VERIFIED`
- `FULL-GRADE9-ENGLISH-BULK-IMPORT = DONE / FULL_ASSET_COVERAGE_VERIFIED`
- `REVIEWED-UNIT2-PUBLICATION = DONE / COMMITTED_STATE_VERIFIED_AND_PUBLISHED`

## Student workstream retained

PR #57 — `feat(student): close cold-start offline Reader gap` remains a separate `STUDENT-016I` workstream on `stage16/student-016i`.

Last checked head in the prior Student run:

`ce97ef2524cd3735a0200ee0f15fa6e6e224e01e`

Do not infer current PR/CI state without re-fetching live exact-head evidence when Student work resumes.

Remaining Student roadmap stays repository-controlled; re-read live roadmap before continuing.

## Required startup / next Content action

Read live heads first, then `PROJECT_HANDOFF.md`, this file, `PROJECT_ENGINEERING_LOG.md`, relevant product docs, and the live Content Rebuild status/handoff in `alwaslh-go`.

For Content: do not republish these two Lessons or rerun the bulk import. Continue from the first unresolved evidence-backed pedagogical boundary; future Lessons/questions remain unpublished until they complete review and an explicit rollback-gated publication pass.
