# PROJECT HANDOFF — الوسيلة الذكية

> نقطة البداية للمحادثة الهندسية التالية. Source of Truth = live repository + PostgreSQL migrations + executable tests/CI + verified runtime + current documentation.

Last synchronized: **2026-09-14 — Student Experience V2 active on Draft PR #58; architecture frozen, broad frontend migration underway, exact-head CI repair still active**.

## 1. Current priority

The active Student priority is:

**Student Experience V2 — clean, scalable, mobile-first Student UX + code foundation before unfinished backend-dependent capabilities are layered on top.**

Branch: `ux/student-experience-v2`

PR: `#58 — refactor(student): establish Student Experience V2 foundation` — **DRAFT / NOT MERGED**.

Do not mark V2 complete or merge until executable + browser/mobile visual gates pass.

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
- Home alone shows official الوسيلة الذكية logo + name in App Bar;
- other top-level pages show page title in App Bar;
- nested subject pages use the shared App Bar title channel instead of duplicating large in-page H1 structures;
- no assumed student name;
- no fixed grade on Home/account card;
- Home = learner overview, not duplicate navigation;
- real Library counters belong on Home; Library body = direct access;
- Learn scales through list/search/accordion patterns;
- Reader = focused/content-first;
- active assessment = focused task flow;
- Summary / Lesson Questions / Models / Notes / Saved / Review are architecturally reserved but never faked before real contracts/data exist.

## 4. Fixed visual decisions

- neutral-first composition;
- teal = brand/action/selected state, not every title/border;
- charcoal primary text + neutral gray secondary text;
- Cairo-first typography contract with 400/500/600/700 weights;
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
- `features/*` — feature pages/components/query adapters/state.

Mandatory rules:

- no giant flat file mixing routing + API + storage + cache + large JSX;
- no duplicated App Bar/Bottom Nav/icon implementations/common UI;
- page/orchestrator files stay thin;
- shared UI stays domain-agnostic;
- no feature-to-feature internals;
- no circular dependencies;
- migration is incremental, not Big Bang.

## 6. Data/cache architecture

Approved runtime cache:

- curriculum: 2 min memory TTL;
- quiz catalog: 1 min;
- recent attempts: 30 sec;
- profile-scoped;
- concurrent identical reads deduplicated;
- access changes invalidate curriculum/practice;
- future assessment completion should invalidate recent attempts/Home summary.

Stage16 verified offline package store remains the single lesson-download storage path.

Target local-first personal data when Stage17 contracts become authoritative:

- Notes;
- Saved/bookmarked items;
- Needs Review;
- safe reader/UI preferences.

Never persist plaintext passwords, reusable auth secrets, fabricated progress/entitlement authority, or arbitrary `/v1` responses as hidden backend state.

## 7. Current implementation state

Completed/implemented on PR #58 so far:

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
- Reader V2 visual layer;
- Practice V2 visual layer;
- Stage16 cold-start Offline Reader behavior reconciled into V2.

Important remaining structural debt:

- `student-assessment.tsx` is still too large and owns catalog + quiz detail + attempt workspace + network orchestration; split it before V2 is considered structurally complete;
- Reader implementation ownership is still partly legacy-flat and should be migrated only without weakening Stage16 offline integrity semantics;
- legacy duplicate CSS/files must be removed only after reference/test audit.

## 8. Stage16 offline boundary

The cold-start Offline Reader behavior from PR #57 has been reconciled into the V2 workstream.

Preserve:

- verified durable profile/device scope;
- signed/verified offline package semantics;
- tamper rejection;
- profile/device isolation;
- bounded time validity;
- no synthetic server session or fake entitlement while offline.

Do not replace the Stage16 package store with a second download cache.

## 9. Current CI truth

Earlier exact-head CI found frontend blockers before browser checks. The most recent concrete blocker was:

`StudentAccountExperience.tsx` unused `_profile` → ESLint failure.

That dependency has now been removed from the Account feature and caller.

A fresh exact-head CI run is required/active after the fix. Until relevant Student checks are green:

`V2 = NOT YET VERIFIED`

Do not confuse infrastructure queue/cancel events with successful verification.

## 10. Exact next implementation order

1. consume current exact-head CI feedback and fix blockers first;
2. close Learn/Reader compile + browser checks;
3. structurally split Practice into feature-owned catalog/detail/attempt modules;
4. route Practice catalog/attempt reads through shared cache where authoritative/safe;
5. complete focused attempt and result visual polish;
6. audit/clean legacy duplicates;
7. run phone/tablet/desktop, RTL, safe-area, focus/keyboard, reduced-motion, contrast and duplicate-network-read QA;
8. only then consider PR #58 ready for review/merge.

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
