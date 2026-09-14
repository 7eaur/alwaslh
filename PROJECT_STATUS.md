# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-14 — Student Experience V2 architecture approved and execution started on PR #58**.

## Current state

**CURRENT USER PRIORITY: Student Experience V2 — rebuild the Student UI/UX foundation before expanding unfinished backend-dependent surfaces.**

Active Student branch: `ux/student-experience-v2`

Active Student PR: `#58` — `refactor(student): establish Student Experience V2 foundation` — **DRAFT / NOT MERGED**.

Authoritative V2 docs:

- `docs/product/STUDENT_EXPERIENCE_V2.md`
- `docs/product/STUDENT_EXPERIENCE_V2_EXECUTION_PLAN.md`
- `docs/product/STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`
- `docs/product/STUDENT_V2_IMPLEMENTATION_RULES.md`
- `docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`
- `docs/workstreams/STUDENT_V2_EXECUTION_LOG.md`

Current V2 checkpoint:

- `V2-00 Architecture Freeze = DONE`
- `V2-01 Foundation / Shell / Home = IN PROGRESS`
- next: shared layout/primitives extraction, then Welcome/Auth
- Learn/Reader broad refactor remains blocked on explicit reconciliation with PR #57 because of overlapping Student files.

### Student V2 decisions now fixed

- phone bottom navigation remains exactly: Home / Learn / Practice / Library;
- Home alone shows official الوسيلة الذكية mark + name;
- other top-level pages show page title in App Bar;
- no assumed learner name and no fixed learner grade on Home/account card;
- Home is an overview using real data, not a duplicate menu;
- Library statistics move to Home when backed by real data;
- Learn must scale to many subjects/units/lessons;
- Reader/Assessment use focused shell variants;
- no fake progress/streak/completion/notes/saved/review values;
- shared code/layout/cache/storage boundaries are mandatory;
- no giant page files mixing routing + API + cache + storage + UI;
- no duplicate App Bar/Bottom Nav/icons/common UI primitives;
- runtime read models use profile-scoped memory cache + request deduplication;
- durable curriculum/quiz snapshots are deferred until authoritative revision/delta semantics exist;
- Stage16 remains the single verified offline lesson-package storage path.

### Current implementation already started on PR #58

- Student V2 visual/theme foundation;
- unified Student icon registry;
- profile-scoped runtime read-through cache;
- refined App Bar contract;
- safe-area aware four-item Bottom Navigation;
- Home rebuilt around real curriculum/quiz/attempt/download data;
- duplicate Home destination-card wall removed;
- access changes invalidate relevant read models.

Nothing in PR #58 is release-ready until lint/typecheck/tests/build and browser/mobile visual QA are green.

## Student Stage16 overlap

PR #57 — `feat(student): close cold-start offline Reader gap` remains a separate `STUDENT-016I` workstream on `stage16/student-016i`.

Last live-checked head: `ce97ef2524cd3735a0200ee0f15fa6e6e224e01e`.

It changes overlapping Student files including `App.tsx`, `student-learning.tsx`, `student-reader.tsx` and must be reconciled before V2 broadly rewrites Learn/Reader.

Do not weaken its offline authorization/integrity semantics during UX migration.

## Grade 9 English content truth retained

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

Reviewed/published Unit 2 scope remains exactly:

- published Lessons: `2`
- published Lesson Assets: `6`
- published Question Revisions: `19`

Do not rerun the bulk import or republish those closed publication checkpoints.

## Stable security/product boundaries

- API + PostgreSQL own canonical state.
- Auth/Authz/Entitlements remain server-owned.
- browser is not canonical durable business authority.
- `media ready != published`.
- AI output never auto-publishes learner content/questions.
- protected Reader/media remains server-authorized.
- Question Bank publication + immutable Quiz version remain delivery authority.
- `/v1` never becomes Service Worker cache authority.

## Exact next Student action

Continue `V2-01` in small reviewable batches:

1. extract shared layout/navigation ownership from flat Student files;
2. extract shared UI primitives actually reused by multiple Student surfaces;
3. keep Home on shared cached read models;
4. rebuild Welcome/Auth on the same design system;
5. re-fetch/reconcile PR #57 before Learn/Reader migration;
6. run executable gates after every batch.
