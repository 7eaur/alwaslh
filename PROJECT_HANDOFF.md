# PROJECT HANDOFF — الوسيلة الذكية

> نقطة البداية للمحادثة الهندسية التالية. Source of Truth = live repository + PostgreSQL migrations + executable tests/CI + verified runtime + current documentation.

Last synchronized: **2026-09-14 — Student Experience V2 core implementation verified on exact head `1dd6222...`; PR #58 still Draft pending final documentation-head CI and merge readiness.**

## 1. Current priority

The active Student priority is now closure, not redesign:

**Finish exact-head verification/documentation for Student Experience V2, then resume the roadmap from the next unclosed Student item without rebuilding the approved foundation.**

Branch: `ux/student-experience-v2`

PR: `#58 — refactor(student): establish Student Experience V2 foundation` — **DRAFT / NOT MERGED**.

Last fully verified implementation head before documentation-only synchronization:

`1dd6222bc21cab615ca9b93416666bfa16d1bf04`

## 2. Mandatory startup

Before changing Student V2:

1. live-check `main`;
2. live-check PR #58 exact head / mergeability / CI;
3. read:
   - `PROJECT_STATUS.md`
   - `PROJECT_HANDOFF.md`
   - `docs/product/STUDENT_EXPERIENCE_V2.md`
   - `docs/product/STUDENT_EXPERIENCE_V2_EXECUTION_PLAN.md`
   - `docs/product/STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`
   - `docs/product/STUDENT_V2_IMPLEMENTATION_RULES.md`
   - `docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`
   - `docs/workstreams/STUDENT_V2_EXECUTION_LOG.md`
4. inspect executable evidence before claiming completion.

Anything not executed/verified remains `NOT YET VERIFIED`.

## 3. Fixed product/UX decisions

- phone primary navigation: `الرئيسية / التعلم / التدريب / مكتبتي` only;
- Home alone shows official الوسيلة الذكية mark + name in App Bar;
- other top-level pages show page title in App Bar;
- nested subject pages use the shared App Bar title channel;
- no assumed student name;
- no fixed permanent grade identity on Home/account card;
- Home = learner overview, not duplicate navigation;
- real Library counters belong on Home; Library body = direct access;
- Learn scales through list/search/accordion patterns;
- Reader = focused/content-first;
- active assessment = focused task flow;
- real quiz versions are learner-facing `نماذج`, not a fabricated second backend entity;
- Summary / Lesson Questions / Notes / Saved / Needs Review remain reserved but never faked before real contracts/data exist.

## 4. Fixed visual decisions

- neutral-first composition;
- teal = brand/action/selected state, not every title/border;
- charcoal primary text + neutral gray secondary text;
- Cairo-first typography contract;
- unified outline icon registry;
- restrained radius/shadows;
- no gradient/glow/glass/3D functional chrome;
- short functional motion only;
- `prefers-reduced-motion` mandatory;
- touch targets >=44px;
- safe areas owned by App Shell.

## 5. Fixed code architecture

Direction:

`app → features → shared`

Ownership:

- `app/layout` — App Shell / App Bar / Bottom Nav / Desktop Nav / safe area;
- `app/routing` + `app/session` — app-level composition;
- `shared/ui` — reusable presentation primitives;
- `shared/icons` + `shared/brand` — shared visual assets/boundaries;
- `shared/data` — runtime cache/read-through/invalidation;
- `shared/storage` — scoped persistence adapters;
- `features/*` — feature pages/components/query boundaries/state.

Mandatory rules:

- no giant flat file mixing routing + API + storage + cache + large JSX;
- no duplicated App Bar/Bottom Nav/icon implementations/common UI;
- page/orchestrator files stay thin;
- shared UI stays domain-agnostic;
- no feature-to-feature private internals;
- no circular dependencies;
- migration is incremental and must preserve executable gates.

## 6. Data/cache architecture

Approved runtime cache:

- curriculum: 2 min memory TTL;
- quiz catalog: 1 min;
- recent attempts: 30 sec;
- profile-scoped;
- concurrent identical reads deduplicated;
- access changes invalidate curriculum/practice;
- successful assessment completion invalidates attempt summaries;
- Downloads reuses the shared curriculum cache rather than issuing its own catalog request path.

Stage16 verified offline package store remains the single lesson-download storage path.

Target local-first personal data only when Stage17 contracts become authoritative:

- Notes;
- Saved/bookmarked items;
- Needs Review;
- safe reader/UI preferences.

Never persist plaintext passwords, reusable auth secrets, fabricated progress/entitlement authority, or arbitrary `/v1` responses as hidden backend state.

## 7. Current implementation state

Implemented on PR #58:

- V2 architecture/docs;
- V2 theme and visual foundation;
- shared icon/brand boundaries;
- shared App Shell / App Bar / Bottom Nav / Desktop Nav;
- shared UI primitives;
- profile-scoped read-through cache;
- Home V2 using available real curriculum/quiz/attempt/download data;
- modular Welcome / Activation / Login / Recovery / Help / Support;
- V2 Account / Library / Notifications / Progress ownership;
- Learn landing / subject hierarchy with search and units/lessons progressive disclosure;
- dynamic subject title through shared App Bar context;
- Reader V2 focused visual layer;
- Practice/Models modularized into feature-owned catalog/detail/attempt flow;
- old `student-assessment.tsx` monolith removed;
- Stage16 cold-start Offline Reader behavior reconciled into V2;
- Reader consumed through `features/reader` boundary;
- Downloads consumed through `features/library` boundary;
- obsolete Library overview CSS removed;
- old future-surface CSS pruned to live loading/nav/download rules;
- latest Practice phone visual artifact reviewed and overlap in attempt completion controls fixed.

Remaining structural debt is intentionally bounded:

- security-critical Reader/Offline implementation internals still live partly in root modules; do not move them merely for folder aesthetics if Stage16 risk outweighs value;
- some legacy CSS still exists because current B03/B05/Stage16 surfaces consume selectors from it; remove only with reference/browser evidence.

## 8. Stage16 offline boundary

Preserve:

- verified durable profile/device scope;
- signed/verified offline package semantics;
- tamper rejection;
- profile/device isolation;
- bounded time validity;
- cold-start Reader support;
- no synthetic server session or fake entitlement while offline.

Do not replace the Stage16 package store with a second download cache.

## 9. Exact-head CI truth

On implementation head `1dd6222bc21cab615ca9b93416666bfa16d1bf04`, all primary Student gates completed successfully:

- `UX B01 Shared Frontend Foundation`
- `UX B02 Student Shell and Navigation`
- `UX B03 Student Learning and Reader`
- `UX B04 Student Practice and Assessment`
- `UX B05 Student Downloads and Account`
- `Stage14 Student Product`
- `Stage15 Student Assessment`
- `Stage16 Student PWA`

Stage14 Student lint/typecheck/unit/build succeeded and its real Chromium auth/access/curriculum suite at `390px` succeeded.

The B04 exact-head visual artifact was manually inspected. The prior phone overlap between step navigation, remaining-question copy and finish action is gone.

A previously observed Stage12 AI-control failure was outside Student V2 and passed on a later exact-head run without Student contract changes.

Documentation-only commits after `1dd6222...` still need the normal exact-head CI cycle before merge.

## 10. Exact next implementation order

1. consume exact-head CI for the documentation synchronization commits;
2. fix only evidence-backed regressions if any appear;
3. do not reopen the Student redesign or perform speculative Reader/Offline refactors;
4. synchronize final PR/readiness documentation;
5. if all required checks are green, move PR #58 out of Draft and merge through the repository's normal protected flow when the connected GitHub permissions/tooling permit;
6. after merge, resume the Student roadmap from the next unclosed product/backend stage.

## 11. Content work retained but not current priority

Grade 9 English technical import remains completed and partially published by review.

Retained published totals:

- Lessons: `2`;
- Lesson Assets: `6`;
- Question Revisions: `19`.

Do not rerun the completed bulk import or republish closed Unit 2 checkpoints.

## 12. Stable boundaries

- API + PostgreSQL own canonical business state.
- Auth/Authz/Entitlements remain server-owned.
- browser storage is not hidden backend authority.
- `media ready != published`.
- AI/legacy output never auto-publishes learner content/questions.
- Question Bank publication + immutable Quiz version remain assessment delivery authority.
- `/v1` never becomes Service Worker business-cache authority.
