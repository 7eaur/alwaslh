# PROJECT HANDOFF — الوسيلة الذكية

> نقطة البداية للمحادثة الهندسية التالية. لا تعتمد على ذاكرة المحادثات السابقة بدل المستودع. الكود + PostgreSQL migrations + tests/CI + verified runtime + الوثائق الحالية هي Source of Truth.

Last synchronized: **2026-09-14 — Grade 9 English full technical import verified; reviewed Unit 2 pages 5..10 published**.

## 1. Mandatory startup

قبل أي تعديل:

1. live-check `7eaur/alwaslh@main`.
2. live-check `7eaur/alwaslh-go@content/legacy-staging-rebuild`.
3. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md` and this handoff.
4. for Content Rebuild read live `CONTENT_REBUILD_EXECUTION_STATUS.md` and `CONTENT_REBUILD_HANDOFF.md`.
5. inspect executable/runtime evidence before editing; anything not inspected = `NOT YET VERIFIED`.

## 2. Current Content truth — Grade 9 English

`FULL-GRADE9-ENGLISH-BULK-IMPORT = DONE / FULL_ASSET_COVERAGE_VERIFIED`

The complete RAW-backed Grade 9 English Pupil's Book 3 source corpus is present in modern PostgreSQL.

Verified imported scope:

- `69/69` RAW-backed pages
- `69/69` RAW images / SHA-256
- `69/69` content-source identities
- `69/69` ready Media Assets
- `69/69` Lesson Assets
- `8/8` Units/Sections
- `104/104` Question Revisions preserved
- page 70 remains evidence-only because no RAW identity exists

Bulk runtime evidence:

- source commit `9e58ab3e882b883bddd016099949881801eedc28`
- Railway deployment `de7f9883-b2f0-483d-a7c1-ffbfb15ac30c`
- `BULK_G9_EN_INSPECT_PASS`
- `BULK_G9_EN_TRANSACTION_GATE_PASS`
- `BULK_G9_EN_APPLY_PASS`
- `BULK_G9_EN_VERIFY_PASS`
- `BULK_G9_EN_RUNNER_PASS`

Do not rerun the full import.

## 3. Reviewed content now published

`REVIEWED-UNIT2-PUBLICATION = DONE / COMMITTED_STATE_VERIFIED_AND_PUBLISHED`

The user explicitly authorized publication of only the Lessons/questions that had completed review.

### Published Lesson A

- slug `curated-english9-pb3-u2-describing-people-and-animals`
- title `Describing people and animals`
- source book pages `5..8`
- published Lesson Assets `4`
- published reviewed Question Revisions `12`

### Published Lesson B

- slug `curated-english9-pb3-u2-time-and-meeting`
- title `Telling time and arranging a meeting`
- source book pages `9..10`
- published Lesson Assets `2`
- published reviewed Question Revisions `7`

Question review:

- total reviewed `19`
- approved unchanged `18`
- corrected before publication `1`

Corrected page-10 item now asks `When is Fuad helping Dad on Saturday?`, with answer `at six o'clock` and matching reviewed explanation.

Publication runtime evidence:

- publisher commit `ea5a19b7086eb8779701be2b1f47fc073b38aa12`
- final reviewed execution head `7d17e19bef37835d500de492053e728f0cdb9f1b`
- Railway deployment `5024b218-32e0-49fe-b9f8-20ee82c5bcd0` — `SUCCESS`
- `G9_U2_PUBLISH_APPLY_PASS`
- `G9_U2_PUBLISH_FULL_PASS`
- final status `COMMITTED_STATE_VERIFIED_AND_PUBLISHED`

Post-verify Grade 9 English publication totals:

- Lessons `2`
- Lesson Assets `6`
- Question Revisions `19`

Those exact totals prove the rest of the imported Grade 9 English corpus remains Draft/unpublished.

Student delivery meaning:

- both Lessons satisfy Student Reader publication predicates, subject to normal auth/entitlement rules;
- all 19 reviewed questions are published/known Question Bank revisions and linked to the two modern Lessons (`12 + 7`), so they are available to Quiz Builder;
- no standalone student Quiz/version was created or published by this gate. Build/publish a Quiz separately only when product scope requires it.

Canonical report:

`7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/GRADE9_UNIT2_REVIEWED_PUBLICATION_REPORT.md`

After post-verification the Railway content service was returned to an idle start command so later documentation commits cannot replay publication logic.

## 4. Source authority

Grade 9 authority includes:

- legacy subject `1794eea5-4772-4c94-bd2b-b08e5815e733`
- branch `content/legacy-supabase-reconstruction`
- immutable RAW extraction
- `content-staging/curated/grade-9/english/pupil-book-3/reconstruction-candidates.json`
- exact original Grade 9 reference on `alwaslh-go@master`: `تاسع انجليزي/الانجليزي_تاسع`

`master` also contains unrelated corpora, including Third Secondary/Pupil's Book 6. Resolve the exact Grade 9 path before using it as reference evidence.

Immutable RAW + reconstruction manifest + PostgreSQL are write/import authority. Do not use the prohibited `69 -> 62` heuristic.

## 5. Content checkpoints retained

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

Do not repeat closed checkpoints unless fresh evidence invalidates them.

## 6. Student workstream remains separate

PR #57 — `feat(student): close cold-start offline Reader gap` remains a separate `STUDENT-016I` workstream on `stage16/student-016i`.

Last previously checked head:

`ce97ef2524cd3735a0200ee0f15fa6e6e224e01e`

It was not merged by this Content publication run. Re-fetch live PR/exact-head CI when Student work resumes.

## 7. Exact Content resume rule

Do not rerun the Grade 9 bulk import or republish CURATION-001/002.

The remaining Grade 9 English corpus is imported but unpublished. Continue from the first unresolved evidence-backed pedagogical boundary and only publish future Lessons/questions after explicit review + rollback gate + committed-state post-verification.

Never mutate RAW, delete anomalies, fabricate page 70, use `69 -> 62` as curriculum truth, or auto-publish unreviewed legacy/AI content.

## 8. Stable security/product boundaries

- API + PostgreSQL own canonical state.
- Auth/Authz/Entitlements remain server-owned.
- browser is not canonical durable business authority.
- `media ready != published`.
- AI output never auto-publishes learner content/questions.
- protected Reader/media remains server-authorized.
- Question Bank publication + immutable Quiz version remain delivery authority.
- `/v1` never becomes Service Worker cache authority.
