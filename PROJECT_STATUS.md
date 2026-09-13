# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current state

**ACTIVE TRACK: Student Library Overview Refinement**

The Student/UI workstream and Content Rebuild are independent parallel tracks. The content checkpoint below does not change Student publication or resume the paused backend roadmap by itself.

### Parallel Content Rebuild checkpoint — IMPORT-001

`BATCH-001-G9-EN-PB3-U1` remains **CLOSED / COMMITTED_STATE_VERIFIED** in modern PostgreSQL and intentionally unpublished.

Subsequent Content Rebuild checkpoints are now verified through import:

- `STRUCTURE-001 = DONE / SECTION_BOUNDARY_VERIFIED`
- `STRUCTURE-002 = DONE / SECTION_BOUNDARY_VERIFIED`
- `CURATION-001 = DONE / LESSON_BOUNDARY_VERIFIED`
- `CURATION-002 = DONE / LESSON_BOUNDARY_VERIFIED`
- `CONTENT-GAPS-001 = DONE / GAP_INVENTORY_VERIFIED`
- `MEDIA-001 = DONE / MEDIA_PROFILE_VERIFIED_PARTIAL_ACCEPTANCE`
- `IMPORT-001 = DONE / COMMITTED_STATE_VERIFIED`

IMPORT-001 closed only the already-reviewed CURATION-001 slice: Unit 2 lesson `Describing people and animals`, book pages `5..8` / source pages `9..12`.

Modern PostgreSQL committed state was independently verified after concurrent advancement:

- one target Unit 2 Section, ID `434f9978-efae-471e-b37d-6b151edecc5b`;
- one target curated Lesson, ID `1a6e3a6e-06e8-496e-8d18-c8d4545d1da9`;
- 4 exact reviewed Lesson Assets ordered `0..3`;
- 4 exact ready Media Assets with matching source paths/checksums;
- Lesson remains unpublished and all 4 Lesson Assets remain draft/unpublished;
- 0 unauthorized Question links were added to the curated Lesson;
- 4 legacy source Lessons remain active/unpublished/sectionless and now retain 0 of the reviewed page assets;
- exactly 12 legacy Question Revisions remain preserved and unpublished on the legacy Lessons.

The bounded apply runner did not overwrite concurrent state: deployment `efb92e21-e8df-4674-92d9-041321da9f92` failed closed before mutation because the target Section already existed. Independent exact-state verification then passed in deployment `3e1ce24a-39ca-498c-b219-8ceb895eda84` with marker `IMPORT001_POST_APPLY_VERIFY_PASS`. No duplicate apply, auto-publication, RAW mutation, media-binary mutation, question rewrite, anomaly deletion, or unrelated repair was performed by the closing run.

Grade 9 English retained corpus truth remains:

- RAW page candidates/images: `69 / 69`;
- legacy questions: `104`;
- recovered sections: `8`;
- reviewed Lesson-boundary coverage: `10` pages;
- unresolved boundary candidates: `59` pages;
- page 70 remains manifest-only evidence without a RAW identity;
- Grade 9 English duplicate page-number anomalies: `0`;
- corpus-wide duplicate-position anomalies remain preserved: `6`;
- historical `62 Draft lessons` remains reconciliation evidence only and is not used to derive `69 -> 62`.

MEDIA-001 evidence remains valid: only book page 5 q76 WebP passed all byte/PSNR/manual-legibility gates as a reproducible derived candidate; pages 6–8 remained rejected. IMPORT-001 did not push a new media binary.

Next Content Rebuild item: **`VERIFY-001` only**. Publication remains closed.

**ACTIVE PR: #55 — `refactor(student): redesign Library overview hierarchy`**

**ACTIVE BRANCH: `ux/student-library-overview`**

**BASE WHEN OPENED: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`**

PR #55 status in the prose below is historical to the Student workstream checkpoint; live GitHub refs/CI always outrank it.

Normal backend roadmap remains paused until the active Student UX batch is closed.

## Verified merged Student baseline

### PR #53 — Student Experience Rebuild

- MERGED / VERIFIED;
- exact accepted head `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- **23/23 workflows SUCCESS**;
- merge commit `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

### PR #54 — Future Student Surfaces

- MERGED / VERIFIED;
- exact accepted head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- **23/23 workflows SUCCESS**;
- phone/desktop Visual QA accepted;
- merge commit / current merged baseline at that checkpoint `c3734366c132ea3919a925bdd0dd37cfd5d82104`.

Merged Student foundation includes Welcome/Auth/Recovery/Help/Support, Home/Learn/Subject/Reader, Practice/Quiz/Assessment/Result, final primary navigation `الرئيسية / التعلّم / التدريب / مكتبتي`, Library/Notifications/Progress/Account prebuilt surfaces, learner-safe error copy, restrained/reduced motion, strong affordance and touch targets, destination-level lazy loading, and no fabricated future learner data.

## Performance state

Accepted Student feature-level code splitting reduced the initial main bundle from roughly `599.61 KB minified / 148.83 KB gzip` to roughly `225.89 KB minified / 71.24 KB gzip`.

Do not regress this by eagerly importing destination feature trees back into the Student shell.

## Student Library Overview workstream checkpoint

Approved hierarchy:

1. concise Library heading;
2. `ملخص مكتبتي` with honest statistics;
3. one `أقسام مكتبتي` destination grid;
4. child sections use one clear `العودة إلى مكتبتي` action.

Collections: التنزيلات، ملاحظاتي، المحفوظات، يحتاج مراجعة.

Statistics authority:

- Downloads count is real and read from the existing offline package store for the active profile/device.
- Browser acceptance saves a real lesson then requires Downloads count to change `٠ → ١`.
- Notes / Saved / Needs Review remain honest zero states until Stage17 authoritative repositories exist.
- No fake progress/activity/streak/recommendation/achievement/engagement metrics.

Visual rules:

- one quiet divided summary surface, not separate dashboard KPI cards;
- no decorative gradient;
- statistic cells are static/non-clickable;
- destination cards are clearly clickable;
- phone: compact 2×2 statistics + one-column destination list;
- desktop: one-glance summary + destination grid;
- duplicate Library tabs removed.

Canonical decision: `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`.

## Student verification checkpoint

Implementation-level evidence recorded:

- Student lint — SUCCESS;
- strict typecheck — SUCCESS;
- unit tests — **11 files / 41 tests SUCCESS**;
- production build — SUCCESS.

Earlier exact-head `aca9a2f72ecede120d1d87889f9a3fb0660ea712` produced **20/23 workflows SUCCESS** because a stale B02 browser expectation still asserted the intentionally removed Library heading. That test expectation was aligned to the approved new heading while preserving navigation/focus/history/offline/no-overflow assertions. Because the branch head moved afterward, fresh exact-head CI/Visual QA remained required at that checkpoint.

## Remaining roadmap after Student Library workstream

Return sequence:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

Still open:

- true cold-start offline Reader / remaining Stage16 authority;
- Stage17 Notes / Saved / Needs Review CRUD, provenance, ownership, offline/sync;
- Stage18 Notifications feed/unread/deep links/lifecycle;
- Stage19 trusted Progress/Statistics/Achievements;
- unsupported self-service Account security/preferences;
- Super Admin rebuild remains a separate workstream.

Content Rebuild continues independently in this order:

`VERIFY-001 → ROADMAP-RETURN`.

Completed before that return:
`BATCH-001 → STRUCTURE-001 → STRUCTURE-002 → CURATION-001 → CURATION-002 → CONTENT-GAPS-001 → MEDIA-001 → IMPORT-001`.

## Required startup for next conversation

Read in order:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

For Content Rebuild also read `content-staging/CONTENT_REBUILD_EXECUTION_STATUS.md` and `content-staging/CONTENT_REBUILD_HANDOFF.md` from the active content work branch/repository, then live-check repository heads before editing.
