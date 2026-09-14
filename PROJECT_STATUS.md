# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-14 — Student Experience V2 reached green exact-head Student gates after architecture migration, Stage16 reconciliation, Practice split, visual QA fixes and legacy cleanup.**

## Current state

**CURRENT USER PRIORITY: close Student Experience V2 safely, then return to the roadmap without rebuilding the approved Student foundation.**

Active branch: `ux/student-experience-v2`

Active PR: `#58 — refactor(student): establish Student Experience V2 foundation` — **DRAFT / NOT MERGED**.

Last fully verified implementation head before this documentation synchronization:

`1dd6222bc21cab615ca9b93416666bfa16d1bf04`

Authoritative V2 docs:

- `docs/product/STUDENT_EXPERIENCE_V2.md`
- `docs/product/STUDENT_EXPERIENCE_V2_EXECUTION_PLAN.md`
- `docs/product/STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`
- `docs/product/STUDENT_V2_IMPLEMENTATION_RULES.md`
- `docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`
- `docs/workstreams/STUDENT_V2_EXECUTION_LOG.md`

## V2 execution checkpoint

- `V2-00 Architecture Freeze = DONE`
- Foundation/theme/tokens = implemented
- App Shell / App Bar / Bottom Nav / Desktop Nav = implemented
- Home V2 = implemented using authoritative available data only
- Welcome / Activation / Login / Recovery / Help / Support = modularized
- Account / Library / Notifications / Progress = feature-owned V2 surfaces
- Learn landing + scalable Subject hierarchy = implemented
- Reader V2 visual/focused behavior = implemented while preserving Stage16 integrity semantics
- Practice/Models = split into feature-owned Catalog / Quiz Detail / Attempt orchestration; old assessment monolith removed
- Stage16 cold-start Offline Reader behavior from PR #57 = reconciled into V2
- Downloads now reuse the shared profile-scoped curriculum read-through cache
- Reader and Downloads expose feature boundaries under `features/*` while security-critical legacy internals remain unchanged
- obsolete Library overview stylesheet removed; future-surface stylesheet pruned to live selectors
- phone Practice visual QA was reviewed from exact-head artifacts and the attempt/result action layout overlap was fixed

## Exact-head Student verification

On implementation head `1dd6222bc21cab615ca9b93416666bfa16d1bf04`, the following completed successfully:

- `UX B01 Shared Frontend Foundation`
- `UX B02 Student Shell and Navigation`
- `UX B03 Student Learning and Reader`
- `UX B04 Student Practice and Assessment`
- `UX B05 Student Downloads and Account`
- `Stage14 Student Product`
- `Stage15 Student Assessment`
- `Stage16 Student PWA`

Stage14 Student lint/typecheck/unit/build passed, followed by the real Chromium auth/access/curriculum suite at `390px`.

The latest B04 visual artifact was manually inspected. Phone attempt/result layouts no longer show the previous overlap between previous/next controls, remaining-question status and finish action.

A prior Stage12 AI-control failure was unrelated to Student UI and passed on a later exact-head run without Student business-rule changes.

`STUDENT V2 CORE IMPLEMENTATION = VERIFIED ON 1dd6222...`

Any documentation-only commit after that head must still receive normal CI before PR #58 is merged.

## Fixed Student V2 decisions

- phone navigation is exactly: Home / Learn / Practice / Library;
- Home alone shows official الوسيلة الذكية mark + name;
- other top-level pages show page title in App Bar;
- nested Learn subject title uses shared App Bar context;
- no assumed learner name and no fixed permanent grade on Home/account card;
- Home is an overview, not duplicate navigation;
- Library is direct access, not a dashboard article;
- Learn scales through compact lists/search/accordion rather than nested card walls;
- Reader and active assessment use focused UI patterns;
- quiz versions are presented as learner-facing Models without inventing a second backend authority;
- Summary / Lesson Questions / Notes / Saved / Needs Review remain honest until authoritative contracts/data exist;
- no fabricated progress/streak/completion/ranking values.

## Frontend architecture now enforced

Direction: `app → features → shared`.

Ownership:

- `app/layout` — shell/appbar/bottom-nav/desktop navigation;
- `app/routing` / `app/session` — app-level routing/session composition;
- `shared/ui` — reusable primitives;
- `shared/icons` / `shared/brand` — one visual boundary;
- `shared/data` — runtime read-through cache + invalidation;
- `shared/storage` — scoped persistence adapters;
- `features/*` — feature pages/components/state/query boundaries.

Rules remain mandatory:

- no giant page files mixing routing + API + cache + storage + large JSX;
- no duplicated app chrome, icon implementations, common rows/buttons/empty states;
- shared UI stays domain-agnostic;
- no feature-to-feature private internals;
- incremental migration only when executable gates remain green.

## Data/cache truth

Runtime read-through cache:

- curriculum: 2 min memory TTL;
- quiz catalog: 1 min;
- recent attempts: 30 sec;
- profile-scoped;
- duplicate concurrent reads deduplicated;
- access changes invalidate affected curriculum/practice read models;
- assessment completion invalidates attempt summaries;
- Downloads reuses the same curriculum cache instead of creating a second catalog request path.

Stage16 offline package storage remains the single lesson-download authority.

Notes / Saved / Needs Review remain targeted for account-scoped local-first persistence only when Stage17 ownership and synchronization contracts become authoritative. Do not persist passwords, reusable auth tokens, synthetic entitlements, or arbitrary `/v1` responses as hidden business authority.

## Stage16 reconciliation

Preserved behavior from the separate PR #57 workstream:

- bounded startup from verified durable profile/device scope;
- verified stored lesson package path;
- direct opening from Downloads;
- signature/integrity/tamper/profile-device/time-bound checks;
- cold-start Reader acceptance;
- no synthetic server session or fake offline authorization authority.

Do not weaken these semantics while moving remaining Reader internals.

## Remaining V2 closure work

The large product redesign/migration is no longer the blocker. Remaining work is closure-only:

1. let CI complete on the documentation synchronization head;
2. inspect any final exact-head failure rather than assuming green from the previous head;
3. keep security-critical Reader/Offline internals stable unless there is evidence-driven reason to move them;
4. finish final documentation/PR readiness synchronization;
5. when all required checks are green, take PR #58 out of Draft and merge through the repository's normal protected flow if permissions/tools permit;
6. after merge, resume the product roadmap from the next unclosed Student item instead of redesigning V2 again.

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
