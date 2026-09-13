# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current state

**ACTIVE TRACK: Student Stage16 — `STUDENT-016I` cold-start offline Reader**

The Student/UI workstream and Content Rebuild are independent parallel tracks. Content publication remains closed.

### Parallel Content Rebuild checkpoint — ROADMAP-RETURN CLOSED

The requested Content Rebuild execution sequence is complete through roadmap return:

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

ROADMAP-RETURN was reconciled against live GitHub state, not the stale Library prose that remained on `main`:

- PR #55 is already **MERGED**, accepted head `8ceb4d5a5f70f7896f6cb358e05605479942d442`, merge commit `343ff1fd7b3d64d7e990b72606695365f520fa58`;
- current Student architecture still names `STUDENT-016I` as the first unfinished Stage16 item;
- concurrent execution already opened PR #57 for exactly that scope, so no duplicate 016I branch/implementation is allowed from Content Rebuild;
- no Content Rebuild RAW/media/question/publication mutation occurred during roadmap return.

`BATCH-001-G9-EN-PB3-U1` remains **CLOSED / COMMITTED_STATE_VERIFIED** and intentionally unpublished.

VERIFY-001 retained evidence for CURATION-001 (`Describing people and animals`, book pages `5..8` / source pages `9..12`):

- verifier source commit `12fb1a5268e97f0a0d70eee4d33322c139e3deb5` in `7eaur/alwaslh-go`;
- Railway deployment `e5e8fef8-f8e7-467e-b3d8-60529c1a652a` — SUCCESS;
- marker `VERIFY001_PASS`;
- exact Section count 1, exact Lesson count 1;
- 4/4 Lesson Assets and 4/4 ready Media Assets with exact provenance;
- Lesson/assets remain unpublished;
- Student Reader eligible Lesson rows = 0 and publication-guard eligible Asset rows = 0;
- unauthorized Question links = 0;
- 12 legacy Question Revisions preserved unpublished;
- publication/RAW/media-binary/question mutation counts = 0.

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

## Active Student checkpoint

**ACTIVE PR: #57 — `feat(student): close cold-start offline Reader gap`**

**ACTIVE BRANCH: `stage16/student-016i`**

**EXACT HEAD OBSERVED: `4624dcc824555c1d29e9d697a7474bf76223468b`**

**BASE WHEN OPENED: `main@343ff1fd7b3d64d7e990b72606695365f520fa58`**

PR #57 explicitly owns `STUDENT-016I`: a previously saved, still-authorized lesson must remain safely readable after browser/app restart while the network is unavailable, using durable non-secret scope recovery plus existing signed package/blob integrity authority.

Current exact-head CI is **NOT GREEN** at this checkpoint. At least `Stage 8 · Student activation browser E2E` is failing on head `4624dcc...`; other checks include successes. Do not merge PR #57 until the exact-head matrix and Stage16 real Chromium acceptance are green. This failure belongs to the Student workstream and does not reopen Content Rebuild.

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
- merge commit `c3734366c132ea3919a925bdd0dd37cfd5d82104`.

### PR #55 — Library Overview Refinement

- MERGED;
- accepted head `8ceb4d5a5f70f7896f6cb358e05605479942d442`;
- merge commit `343ff1fd7b3d64d7e990b72606695365f520fa58`.

The merged Student foundation includes Welcome/Auth/Recovery/Help/Support, Home/Learn/Subject/Reader, Practice/Quiz/Assessment/Result, final primary navigation `الرئيسية / التعلّم / التدريب / مكتبتي`, Library/Notifications/Progress/Account prebuilt surfaces, learner-safe error copy, restrained/reduced motion, destination-level lazy loading, and no fabricated future learner data.

Library hierarchy after PR #55:

1. concise Library heading;
2. `ملخص مكتبتي` with honest statistics;
3. one `أقسام مكتبتي` destination grid;
4. child sections use one clear `العودة إلى مكتبتي` action.

Downloads count is real from the existing offline package store; Notes/Saved/Needs Review remain honest zero states until Stage17 authoritative repositories exist.

## Performance state

Accepted Student feature-level code splitting reduced the initial main bundle from roughly `599.61 KB minified / 148.83 KB gzip` to roughly `225.89 KB minified / 71.24 KB gzip`.

Do not regress this by eagerly importing destination feature trees back into the Student shell.

## Remaining roadmap

Current sequence:

`STUDENT-016I [IN PROGRESS / PR #57] → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

Still open after 016I:

- `016R` reconnect revalidation/purge;
- `016S` revision/tombstone/cursor/delta synchronization;
- conditional `016O` bounded outbox only if later offline writes require it;
- `016G` Stage16 closure matrix;
- Stage17 Notes / Saved / Needs Review CRUD, provenance, ownership, offline/sync;
- Stage18 Notifications feed/unread/deep links/lifecycle;
- Stage19 trusted Progress/Statistics/Achievements;
- unsupported self-service Account security/preferences;
- Super Admin rebuild remains a separate workstream.

## Required startup for next conversation

Read in order:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

For Content Rebuild also read `content-staging/CONTENT_REBUILD_EXECUTION_STATUS.md` and `content-staging/CONTENT_REBUILD_HANDOFF.md` from `7eaur/alwaslh-go@content/legacy-staging-rebuild`, then live-check both repository heads before editing.
