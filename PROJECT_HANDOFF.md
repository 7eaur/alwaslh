# PROJECT HANDOFF — الوسيلة الذكية

> نقطة البداية للمحادثة الهندسية التالية. Source of Truth = live repository + PostgreSQL migrations + executable tests/CI + verified runtime + current documentation.

Last synchronized: **2026-09-14 — Student Experience V2 approved and active on PR #58**.

## 1. Current priority

The user explicitly switched the active Student priority to:

**Student Experience V2 — establish a clean, scalable, mobile-first Student UI/UX and code foundation before layering unfinished backend-dependent capabilities.**

Work branch:

`ux/student-experience-v2`

Draft PR:

`#58 — refactor(student): establish Student Experience V2 foundation`

Do not merge PR #58 until executable + visual gates pass.

## 2. Mandatory startup for Student V2

Before editing:

1. live-check `main`;
2. live-check PR #58 exact head and CI;
3. live-check PR #57 exact head/state because it overlaps Student Learn/Reader files;
4. read:
   - `PROJECT_STATUS.md`
   - `PROJECT_HANDOFF.md`
   - `docs/product/STUDENT_EXPERIENCE_V2.md`
   - `docs/product/STUDENT_EXPERIENCE_V2_EXECUTION_PLAN.md`
   - `docs/product/STUDENT_FRONTEND_CODE_ARCHITECTURE_V2.md`
   - `docs/product/STUDENT_V2_IMPLEMENTATION_RULES.md`
   - `docs/product/STUDENT_DATA_RESIDENCY_AND_CACHE_V2.md`
   - `docs/workstreams/STUDENT_V2_EXECUTION_LOG.md`
5. inspect executable evidence before claiming completion; anything unverified stays `NOT YET VERIFIED`.

## 3. Fixed V2 product decisions

- phone primary navigation: `الرئيسية / التعلم / التدريب / مكتبتي` only;
- Home alone shows official الوسيلة الذكية logo + name in App Bar;
- other top-level pages show page title in App Bar;
- nested pages use back + current entity title;
- no assumed student name;
- no fixed student grade on Home/account summary;
- Home is an overview, not a duplicate navigation menu;
- Library statistics live on Home when backed by real data;
- Library body becomes direct access to Downloads / Notes / Saved / Needs Review;
- Learn scales to many classes/subjects/units/lessons using progressive disclosure;
- Reader and active Assessment use focused shell variants;
- Summary / Lesson Questions / Models / Notes / Saved / Review are placed in the architecture but never fabricated before their contracts/data exist.

## 4. Fixed V2 visual decisions

- neutral-first composition;
- teal = brand/action/selected state, not every title/border;
- primary text = charcoal; secondary text = neutral gray;
- Cairo-first typography contract; approved weights 400/500/600/700;
- unified outline icon registry;
- restrained radius/shadows;
- no gradient/glow/glass/3D functional chrome;
- short functional motion only;
- `prefers-reduced-motion` mandatory;
- touch targets >=44px;
- safe areas owned by App Shell, not patched per page.

## 5. Fixed V2 code architecture

Mandatory direction:

`app → features → shared`

Target ownership:

- `app/layout` — App Shell/App Bar/Bottom Nav/Desktop Nav/safe areas;
- `shared/ui` — domain-agnostic reusable UI primitives;
- `shared/icons` — one icon registry;
- `shared/data` — runtime cache/read-through/invalidation;
- `shared/storage` — scoped storage adapters;
- `features/*` — feature-owned pages/components/query adapters/state.

Rules:

- no giant flat files mixing routing + API + storage + cache + large JSX;
- no duplicated App Bar/Bottom Nav/icons/common button/empty state/search/list row;
- pages compose; they do not own every layer;
- shared UI remains domain-agnostic;
- no feature-to-feature internal imports;
- no circular dependencies;
- no stage-number CSS in final product UI;
- migration is incremental, not Big Bang.

## 6. Data/cache architecture

Current approved runtime cache:

- curriculum: 2 min memory TTL;
- quiz catalog: 1 min;
- recent attempts: 30 sec;
- profile-scoped;
- concurrent identical reads deduplicated;
- access changes invalidate curriculum/practice;
- quiz completion invalidates attempt/Home summary;
- logout/session expiry clears active profile cache in final integration.

Stage16 verified offline lesson packages remain the only lesson-download storage path.

Target local-first datasets when Stage17 ownership rules are ready:

- Notes;
- Saved/bookmarked items;
- Needs Review;
- safe reader/UI preferences.

Do not persist plaintext passwords, reusable auth secrets, fake progress/entitlement authority, or arbitrary `/v1` responses as business cache.

## 7. Current V2 implementation state

`V2-00 Architecture Freeze = DONE`

`V2-01 Foundation / Shell / Home = IN PROGRESS`

Already started on PR #58:

- V2 visual/theme foundation;
- unified Student icon registry;
- profile-scoped runtime cache;
- App Bar contract;
- safe-area aware four-item Bottom Nav;
- Home rebuilt with real curriculum/quiz/attempt/download data;
- duplicated Home destination-card wall removed;
- relevant read-model invalidation started.

Next implementation order:

1. shared layout/navigation extraction;
2. shared reused UI primitives extraction;
3. Welcome/Auth V2;
4. reconcile PR #57;
5. Learn/Subject scalable hierarchy;
6. Reader;
7. Practice/Models/Results;
8. Library/Account/Notifications/Progress/Help;
9. Notes/Saved/Review local repositories when allowed;
10. persistent read-model snapshots only after revision/delta contracts;
11. full visual/performance/accessibility QA.

## 8. PR #57 overlap boundary

PR #57:

`feat(student): close cold-start offline Reader gap`

branch:

`stage16/student-016i`

last checked head:

`ce97ef2524cd3735a0200ee0f15fa6e6e224e01e`

It overlaps Student files including `App.tsx`, `student-learning.tsx`, `student-reader.tsx`.

Do not broadly rewrite Learn/Reader on V2 until #57 is explicitly reconciled. Preserve its signed-manifest / lease / integrity / offline authorization behavior.

## 9. Quality gate

No V2 batch is `DONE` from appearance alone.

Required as relevant:

- lint;
- typecheck;
- tests;
- build;
- route smoke;
- mobile browser verification;
- iPhone safe area;
- Android Chrome;
- RTL;
- focus/keyboard;
- reduced motion;
- contrast/readability;
- duplicate-network-read check;
- visual QA against V2 architecture.

## 10. Content work retained but not current priority

Grade 9 English technical import remains completed and partially published by review.

Verified retained publication totals:

- published Lessons: `2`;
- Lesson Assets: `6`;
- published Question Revisions: `19`.

Do not rerun the completed Grade 9 bulk import or republish closed reviewed Unit 2 checkpoints.

## 11. Stable system boundaries

- API + PostgreSQL own canonical business state.
- Auth/Authz/Entitlements remain server-owned.
- browser storage is not hidden backend authority.
- `media ready != published`.
- AI/legacy output never auto-publishes learner content/questions.
- Question Bank publication + immutable Quiz version remain assessment delivery authority.
- `/v1` never becomes Service Worker business-cache authority.
