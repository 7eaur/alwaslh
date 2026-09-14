# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-14 — Student Experience V2 implementation advanced through Auth / Shell / Home / Learn / Reader visual foundation / secondary surfaces; CI repair active on PR #58**.

## Current state

**CURRENT USER PRIORITY: Student Experience V2 — establish the clean, scalable Student UI/UX and frontend architecture before layering unfinished backend-dependent capabilities.**

Active branch: `ux/student-experience-v2`

Active PR: `#58 — refactor(student): establish Student Experience V2 foundation` — **DRAFT / NOT MERGED**.

Current exact head at this synchronization: `8f0ad2d718191e3c9b8263384eb6b645ac61e2b9`.

Authoritative V2 docs:

- `docs/product/STUDENT_EXPERIENCE_V2.md`
- `docs/product/STUDENT_EXPERIENCE_V2_EXECUTION_PLAN.md`
- `docs/product/STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`
- `docs/product/STUDENT_V2_IMPLEMENTATION_RULES.md`
- `docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`
- `docs/workstreams/STUDENT_V2_EXECUTION_LOG.md`

## V2 execution checkpoint

- `V2-00 Architecture Freeze = DONE`
- Foundation/theme/tokens = implemented on branch
- App Shell / App Bar / Bottom Nav / Desktop Nav extraction = implemented
- Home V2 = implemented using available real data only
- Welcome / Activation / Login / Recovery / Help / Support = migrated to modular V2 feature ownership
- Account / Library / Notifications / Progress = migrated to focused V2 feature ownership
- Learn landing + scalable Subject hierarchy = implemented on V2 branch
- Reader V2 visual layer = started and wired
- Practice V2 visual layer = started
- Stage16 cold-start Offline Reader work from PR #57 = reconciled into V2 behavior instead of being overwritten
- exact-head CI = **ACTIVE / NOT GREEN YET**

## Fixed Student V2 decisions

- phone navigation remains exactly: Home / Learn / Practice / Library;
- Home alone shows official الوسيلة الذكية mark + name;
- other top-level pages show page title in App Bar;
- nested Learn subject title can be supplied through shared App Bar context instead of page-owned duplicate headers;
- no assumed learner name and no fixed learner grade on Home/account card;
- Home is an overview using authoritative available data, not a duplicate menu;
- Library body is direct access, while useful real Library counts belong on Home;
- Learn scales through lists/search/accordion rather than card nesting;
- Reader and active assessment use focused UI patterns;
- Summary / Lesson Questions / Models / Notes / Saved / Review have reserved architecture but are not fabricated before their authoritative contracts/data exist;
- no fake progress/streak/completion/ranking values.

## Frontend architecture now enforced

Target ownership:

- `app/layout` — shell/appbar/bottom-nav/desktop navigation;
- `app/routing` / `app/session` — app-level routing/session composition;
- `shared/ui` — reusable primitives;
- `shared/icons` / `shared/brand` — one reusable visual boundary;
- `shared/data` — runtime read-through cache + invalidation;
- `shared/storage` — scoped persistence adapters;
- `features/*` — feature-owned pages/components/state/query adapters.

Rules remain mandatory:

- no giant page files mixing routing + API + cache + storage + large JSX;
- no duplicated app chrome, icon implementations, common rows/buttons/empty states;
- pages compose shared components;
- no feature-to-feature internals;
- incremental migration, not Big Bang rewrite.

## Data/cache truth

Current runtime cache behavior:

- curriculum: 2 min memory TTL;
- quiz catalog: 1 min;
- recent attempts: 30 sec;
- profile-scoped;
- concurrent duplicate reads deduplicated;
- access changes invalidate affected curriculum/practice read models.

Stage16 offline package storage remains the single lesson-download authority.

Notes / Saved / Needs Review remain targeted for account-scoped local-first persistence when Stage17 ownership and synchronization contracts become authoritative. Do not persist passwords, reusable auth tokens, synthetic entitlements, or arbitrary `/v1` responses as business authority.

## Stage16 reconciliation

PR #57 previously owned the cold-start Offline Reader gap. Its important behavior has now been reconciled into Student V2 rather than ignored:

- bounded startup from verified durable offline profile/device scope;
- verified stored lesson package path;
- direct opening from Downloads;
- integrity/tamper/isolation/time-bound acceptance remains required;
- offline startup never creates synthetic server authorization.

Do not weaken these semantics while polishing Reader V2.

## CI truth at current checkpoint

Previous exact-head runs exposed frontend quality failures before browser verification. One concrete lint blocker was an unused Account profile dependency; the dependency has now been removed from `StudentAccountExperience` and its caller.

The new exact-head CI triggered after that fix is still running. Therefore:

`STUDENT V2 RELEASE READINESS = NOT YET VERIFIED`

Do not merge PR #58 until relevant Student workflows are green and mobile/RTL/safe-area visual verification is complete.

## Grade 9 English content truth retained

The RAW-backed Grade 9 English Pupil's Book 3 import and reviewed Unit 2 publication remain closed technical checkpoints.

Retained verified publication totals:

- published Lessons: `2`
- Lesson Assets: `6`
- published Question Revisions: `19`

Do not rerun the completed Grade 9 bulk import or republish those closed review checkpoints.

## Stable system boundaries

- API + PostgreSQL own canonical business state.
- Auth/Authz/Entitlements remain server-owned.
- browser storage is not hidden backend authority.
- `media ready != published`.
- AI/legacy output never auto-publishes learner content/questions.
- Question Bank publication + immutable Quiz version remain assessment delivery authority.
- `/v1` never becomes Service Worker business-cache authority.

## Exact next Student action

1. wait for the current exact-head compile/lint/test feedback and repair blockers before new large refactors;
2. complete Learn/Reader executable verification;
3. split Practice ownership away from the remaining large `student-assessment.tsx` monolith into feature-level catalog/detail/attempt units without changing assessment business contracts;
4. connect Practice reads to the shared profile-scoped cache where safe;
5. finish Reader/Practice mobile visual polish;
6. remove obsolete legacy duplicates only after reference/test audit;
7. run full phone/tablet/desktop RTL + safe-area + a11y + network-read QA before PR #58 leaves Draft.
