# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose.

Last consolidated: **2026-09-13 — Grade 9 English full technical import completed and verified**.

## Stable architecture authority

- `apps/student-web` — Student Web/PWA
- `apps/admin-web` — Super Admin boundary
- `apps/api` — authoritative Fastify API
- `database/migrations` — PostgreSQL schema/integrity authority
- API + PostgreSQL own canonical business state
- `media ready != published`
- AI/legacy output never auto-publishes learner content/questions
- RAW/provenance/checksum authority must be preserved
- browser is not canonical durable business authority

## 2026-09-13 — Full Grade 9 English bulk import

User priority was explicitly switched from scheduled Student-roadmap continuation to the fastest safe complete Grade 9 English import. The hourly automation was disabled before the content work continued.

### Source authority

Grade 9 English source scope is the immutable legacy Supabase reconstruction for subject:

`1794eea5-4772-4c94-bd2b-b08e5815e733`

Canonical reconstruction manifest:

`7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/curated/grade-9/english/pupil-book-3/reconstruction-candidates.json`

The `alwaslh-go@master` tree inspected during this run contains a separate Third Secondary/Pupil's Book 6 corpus. It was not substituted as Grade 9 evidence.

### Execution

Content source commit:

`9e58ab3e882b883bddd016099949881801eedc28`

Railway deployment:

`de7f9883-b2f0-483d-a7c1-ffbfb15ac30c` — `SUCCESS`

Runtime sequence completed:

`inspect -> rollback-only transaction gate -> controlled apply -> committed-state verify`

Markers:

- `BULK_G9_EN_INSPECT_PASS`
- `BULK_G9_EN_TRANSACTION_GATE_PASS`
- `BULK_G9_EN_APPLY_PASS`
- `BULK_G9_EN_VERIFY_PASS`
- `BULK_G9_EN_RUNNER_PASS`

### Verified input scope

- 69 RAW-backed pages
- 69 RAW images
- 104 Question Revisions
- 8 recovered Units/Sections
- 1 source-manifest-only final page (page 70), retained as evidence-only because no RAW identity exists

Units:

1. Unit 1 - Revision
2. Unit 2 - Describing: Making plans
3. Unit 3 - Other countries
4. Unit 4 - Visiting Japan
5. Unit 5 - Safety
6. Unit 6 - Helping others
7. Unit 7 - Communications
8. Unit 8 - Winning medals

### Transaction result

Rollback gate proved the complete mutation before commit and rolled it back successfully.

Committed apply then produced and verifier confirmed:

- Sections verified: `8/8`
- missing Sections created: `6`
- existing Sections reused: `2`
- pages verified: `69/69`
- source identities: `69/69`
- RAW images verified by SHA-256: `69/69`
- ready Media Assets: `69/69`
- Lesson Assets: `69/69`
- involved live Lesson identities: `59`
- Lessons assigned to recovered Sections: `54`
- existing correct Lesson assignments reused: `5`
- Question Revisions preserved: `104/104`
- evidence-only page 70 preserved: `1`

Mutation isolation:

- RAW mutations: `0`
- media-binary mutations: `0`
- Question mutations: `0`
- publication changes: `0`
- unrelated mutations: `0`

Publication remains closed:

- published Lessons: `0`
- published Lesson Assets: `0`
- published Questions: `0`

### Lesson identity interpretation

The live `59` Lesson identities are not derived from the prohibited historical `69 -> 62` heuristic. They are the actual Lesson owners of the 69 verified Lesson Assets after earlier curation/reassignment. All 69 RAW-backed page/image identities remain represented exactly once.

The legacy extraction stores page rows as `content_type = lesson`. Modern curation can legitimately group several source pages under one Lesson while retaining each page as a separate Lesson Asset with immutable provenance.

Therefore the Grade 9 English **technical/data-completeness import is complete**. Further merge/rename decisions are pedagogical curation of already-imported material, not missing-content import work.

Detailed evidence:

`7eaur/alwaslh-go@content/legacy-staging-rebuild/content-staging/BULK_GRADE9_ENGLISH_IMPORT_REPORT.md`

## Content checkpoints retained

- BATCH-001 — DONE / COMMITTED_STATE_VERIFIED
- STRUCTURE-001 — DONE / SECTION_BOUNDARY_VERIFIED
- STRUCTURE-002 — DONE / SECTION_BOUNDARY_VERIFIED
- CURATION-001 — DONE / LESSON_BOUNDARY_VERIFIED
- CURATION-002 — DONE / LESSON_BOUNDARY_VERIFIED
- CONTENT-GAPS-001 — DONE / GAP_INVENTORY_VERIFIED
- MEDIA-001 — DONE / MEDIA_PROFILE_VERIFIED_PARTIAL_ACCEPTANCE
- IMPORT-001 — DONE / COMMITTED_STATE_VERIFIED
- VERIFY-001 — DONE / DELIVERY_ISOLATION_AND_PROVENANCE_VERIFIED
- ROADMAP-RETURN — DONE / STUDENT-016I_HANDOFF_VERIFIED
- FULL-GRADE9-ENGLISH-BULK-IMPORT — DONE / FULL_ASSET_COVERAGE_VERIFIED / UNPUBLISHED

## Student workstream retained

PR #57 remains a separate open Student Stage16 workstream for `STUDENT-016I`. Last live head inspected during this content run:

`ce97ef2524cd3735a0200ee0f15fa6e6e224e01e`

It was not merged or modified by the bulk content import.

When Student work resumes, re-fetch exact-head CI rather than relying on this log.

## Continuation rule

Do not rerun the Grade 9 bulk apply unless fresh drift invalidates the committed-state verifier.

Content next steps require an explicit product choice: pedagogical Lesson grouping/naming refinement and/or publication review. Neither permits RAW mutation, fabricated page 70, anomaly deletion, heuristic `69 -> 62`, or automatic publication.
