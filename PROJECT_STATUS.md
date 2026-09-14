# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-14 — Student Experience V2 is merged; the follow-up full visual-parity rollout is functionally green and has completed artifact-backed visual QA on the verified implementation head.**

## Current state

**CURRENT USER PRIORITY: close the approved Student visual parity safely, merge it, then resume the roadmap without rebuilding the Student foundation.**

Merged foundation:
- PR `#58 — refactor(student): establish Student Experience V2 foundation`
- merged to `main` as `258c5bc2c09a049afb57c0593b5b6ca9db532c62`

Active visual branch: `fix/student-reader-visual-parity`

Active PR: `#60 — feat(student): full visual parity rollout` — **DRAFT / NOT MERGED** at the time of this documentation commit.

Last fully verified implementation head before this documentation-only synchronization:

`ebb0434b80c192c610731a946ceaeb563683b15c`

Visual source of truth:
- `docs/product/STUDENT_VISUAL_SOURCE_OF_TRUTH.md`
- `docs/workstreams/STUDENT_VISUAL_PARITY_PLAN.md`
- `docs/workstreams/STUDENT_VISUAL_PARITY_EXECUTION_LOG.md`

## Visual parity checkpoint

Implemented V01–V09 and closed V10 visual defects found during artifact review:
- shared canvas/App Bar/bottom-nav/desktop-rail visual family;
- Home reference-style hierarchy using authoritative data only;
- Welcome / Activation / Login visual alignment;
- Learn subject rows and scalable hierarchy;
- Subject hero + compact lesson rows; empty units no longer dominate the screen;
- focused Reader with no heavy canonical-media card framing;
- Practice/catalog/detail/attempt visual family;
- Library grouped-list visual family;
- Account/Help/Notifications/Progress alignment without fabricated data;
- fixed a real 390px Welcome horizontal overflow;
- fixed a real phone bottom-navigation positioning regression introduced by a visual layer;
- removed unintended tablet-only `تقدمي / الحساب` adaptive-nav links while retaining them in the desktop rail;
- B03 now captures repeatable Subject + Reader screenshots at phone/tablet/desktop sizes.

## Exact-head verification

On implementation head `ebb0434b80c192c610731a946ceaeb563683b15c`, all returned PR-triggered workflows completed successfully, including:

- `UX B01 Shared Frontend Foundation`
- `UX B02 Student Shell and Navigation`
- `UX B03 Student Learning and Reader`
- `UX B04 Student Practice and Assessment`
- `UX B05 Student Downloads and Account`
- `Stage14 Student Product`
- `Stage15 Student Assessment`
- `Stage16 Student PWA`
- `Rebuild Stage Verification`
- Stage 9–13 verification workflows triggered for the PR

Exact-head visual artifacts were manually inspected:
- B03: Subject + Reader at `390x844`, `768x1024`, `1366x900`;
- B04: Practice attempt/result/catalog/detail phone + desktop;
- B05: Welcome/Auth/Library/Account/secondary surfaces phone + desktop.

Verified visual outcomes:
- phone bottom navigation is fixed at the bottom and does not float over Subject content;
- tablet adaptive navigation contains the four primary destinations only;
- desktop rail contains the primary destinations plus secondary `تقدمي / الحساب` links;
- focused Reader hides global navigation and decorative app-shell botanical framing;
- canonical lesson media remains backend-published authority and is not replaced by decorative mockups;
- Practice phone attempt/result controls do not overlap;
- Welcome no longer horizontally overflows at 390px.

`STUDENT VISUAL PARITY IMPLEMENTATION = VERIFIED ON ebb0434...`

This documentation synchronization occurs after that verified implementation head and does not change Student runtime behavior.

## Fixed Student decisions

- phone navigation is exactly: `الرئيسية / التعلم / التدريب / مكتبتي`;
- Account is an App Bar action, not a fifth bottom destination;
- Home alone shows the official الوسيلة الذكية brand lockup;
- no assumed learner name or fabricated permanent grade identity;
- Learn uses compact list/search/disclosure patterns;
- Reader and active assessment are focused experiences;
- real quiz versions are learner-facing `نماذج`;
- Notes / Saved / Needs Review / Notifications / Progress stay honest until authoritative contracts/data exist;
- no fabricated progress, streak, completion, mastery or ranking values.

## Frontend architecture

Direction remains mandatory: `app → features → shared`.

- `app/layout` owns shared chrome/safe areas;
- `app/routing` + `app/session` own app-level composition;
- `shared/ui`, `shared/icons`, `shared/brand`, `shared/data`, `shared/storage` remain centralized reusable boundaries;
- `features/*` owns feature composition/data/state.

No page may collapse routing + API + cache + storage + icons + large JSX into a new monolith.

## Data/offline boundaries

- API + PostgreSQL own canonical business state.
- Auth/Authz/Entitlements remain server-owned.
- Stage16 verified offline package store remains the single lesson-download authority.
- Downloads reuse the profile-scoped curriculum cache.
- no synthetic offline server session/entitlement authority.
- `/v1` responses never become hidden Service Worker business authority.

## Remaining closure work

1. synchronize PR #60 body with final implementation/verification evidence;
2. move PR #60 out of Draft when repository state still matches the verified implementation;
3. merge through the normal protected flow using expected-head protection;
4. verify resulting `main` SHA/state;
5. resume the next unclosed Student roadmap item; do not reopen this redesign without new evidence.

## Grade 9 English content truth retained

The technical RAW-backed import remains a separate content workstream and must not be inferred complete from the UI.

Retained published totals from the closed reviewed checkpoint:
- published Lessons: `2`
- Lesson Assets: `6`
- published Question Revisions: `19`

Do not rerun the completed bulk import or republish closed review checkpoints merely because the visual rollout is closing.
