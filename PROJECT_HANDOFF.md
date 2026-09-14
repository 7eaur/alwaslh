# PROJECT HANDOFF — الوسيلة الذكية

> نقطة البداية للمحادثة الهندسية التالية. Source of Truth = live repository + PostgreSQL migrations + executable tests/CI + verified runtime + current documentation.

Last synchronized: **2026-09-14 — Student Experience V2 is merged; PR #60 visual parity is at final closure with exact-head functional gates green and artifact-backed visual QA completed on implementation head `ebb0434...`.**

## 1. Current priority

Do not redesign the Student foundation again.

**Close PR #60 safely, verify `main`, then continue the next unclosed Student roadmap item.**

Merged foundation:
- PR `#58`
- merge SHA `258c5bc2c09a049afb57c0593b5b6ca9db532c62`

Active branch: `fix/student-reader-visual-parity`

Active PR: `#60 — feat(student): full visual parity rollout` — **DRAFT / NOT MERGED** at this documentation point.

Last fully verified implementation head:

`ebb0434b80c192c610731a946ceaeb563683b15c`

## 2. Mandatory startup

Before changing or merging Student visual parity:
1. live-check `main`;
2. live-check PR #60 head / mergeability / exact-head checks;
3. read:
   - `PROJECT_STATUS.md`
   - `PROJECT_HANDOFF.md`
   - `docs/product/STUDENT_VISUAL_SOURCE_OF_TRUTH.md`
   - `docs/workstreams/STUDENT_VISUAL_PARITY_PLAN.md`
   - `docs/workstreams/STUDENT_VISUAL_PARITY_EXECUTION_LOG.md`
4. inspect executable evidence before claiming completion.

Anything not executed/verified remains `NOT YET VERIFIED`.

## 3. Fixed product / UX decisions

- phone primary navigation: `الرئيسية / التعلم / التدريب / مكتبتي` only;
- Account stays in App Bar, never a fifth phone destination;
- tablet adaptive navigation uses the four primary destinations only;
- desktop rail may expose secondary `تقدمي / الحساب` links;
- Home alone shows official الوسيلة الذكية mark + name;
- no assumed student display name;
- no fabricated permanent grade identity;
- Home = learner overview;
- Library = direct-access surface, not a stats dashboard;
- Learn scales through compact rows/search/disclosure;
- Reader = focused/content-first;
- active assessment = focused task flow;
- real quiz versions are learner-facing `نماذج`;
- Summary / Lesson Questions / Notes / Saved / Needs Review / Progress / Notifications are never faked before authoritative contracts/data exist.

## 4. Visual source of truth

The approved Student references are codified in:
- `docs/product/STUDENT_VISUAL_SOURCE_OF_TRUTH.md`
- `docs/workstreams/STUDENT_VISUAL_PARITY_PLAN.md`

Implemented visual family:
- calm light canvas;
- restrained teal/mint accents;
- botanical artwork only as decoration, never content authority;
- grouped white surfaces with light borders/shadows;
- compact icon wells;
- Cairo-first typography contract;
- no gradient/glow/glass/3D functional chrome;
- short motion only + `prefers-reduced-motion`;
- touch targets >=44px;
- safe areas owned by App Shell.

## 5. Code architecture remains mandatory

Direction: `app → features → shared`.

- `app/layout`: App Shell / App Bar / Bottom Nav / Desktop Nav / safe area;
- `app/routing` + `app/session`: app-level composition;
- `shared/*`: reusable UI/icons/brand/data/storage;
- `features/*`: feature-owned composition/data/state.

Do not reintroduce giant root page monoliths or duplicate shared chrome/components.

## 6. Verified visual-parity implementation

V01–V09 implemented; V10 artifact review found and fixed real defects:
- Welcome 390px horizontal overflow fixed;
- phone bottom-nav positioning regression fixed;
- tablet `تقدمي / الحساب` leakage removed;
- desktop secondary rail links retained;
- Reader decorative shell framing removed in focused mode;
- Reader canonical media no longer sits in a heavy card frame;
- Subject mobile layout no longer shows the bottom nav floating over content;
- Subject hierarchy avoids empty-unit card walls;
- Practice phone completion controls remain non-overlapping.

B03 now uploads repeatable Subject + Reader screenshots for:
- phone `390x844`;
- tablet `768x1024`;
- desktop `1366x900`.

## 7. Exact-head CI and visual evidence

On `ebb0434b80c192c610731a946ceaeb563683b15c`, all returned PR-triggered workflows completed successfully, including:
- UX B01
- UX B02
- UX B03
- UX B04
- UX B05
- Stage14 Student Product
- Stage15 Student Assessment
- Stage16 Student PWA
- Rebuild Stage Verification
- triggered Stage 9–13 verification workflows

Manually inspected exact-head artifacts:
- B03 Subject/Reader phone + tablet + desktop;
- B04 Practice attempt/result/detail/library phone + desktop;
- B05 Welcome/Auth/Library/Account/secondary phone + desktop.

Observed final state from those artifacts:
- phone bottom nav fixed correctly at viewport bottom;
- tablet primary nav contains four destinations only;
- desktop rail carries secondary links;
- focused Reader has no global nav/botanical shell decoration;
- no 390px Welcome overflow;
- no Practice phone completion-control overlap.

The documentation synchronization commits after `ebb0434...` do not modify Student runtime behavior. If they trigger checks, consume them before merge; do not reinterpret a docs-only SHA as a new runtime implementation baseline.

## 8. Offline/security boundary

Preserve Stage16 behavior:
- durable profile/device scope;
- signed verified offline packages;
- tamper rejection;
- profile/device isolation;
- bounded validity;
- cold-start Reader support;
- no synthetic server session or fake entitlement authority.

Do not replace the Stage16 package store with a second download cache.

## 9. Exact next order

1. synchronize PR #60 description with final visual/CI evidence;
2. confirm no unresolved review blockers;
3. mark PR #60 ready for review;
4. merge with expected-head protection if repository policy permits;
5. verify merged `main` and post-merge checks/state;
6. continue the next unclosed Student roadmap item rather than reopening visual parity.

## 10. Content work is separate

Do not infer book/content completeness from the redesigned UI.

Retained reviewed publication checkpoint:
- Lessons: `2`
- Lesson Assets: `6`
- Question Revisions: `19`

The Grade 9 English corpus reconstruction/publication work remains a separate content workstream and must be verified from its own manifests/reports before claiming full book/page coverage.
