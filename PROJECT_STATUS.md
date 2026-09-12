# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-12**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: UX/UI REFOUNDATION + DESIGN SYSTEM + STUDENT/ADMIN EXPERIENCE REMEDIATION**

**CURRENT UX BATCH: `UX-B04 — Student Practice / Assessment`**

**EXACT RETURN POINT AFTER THIS TRACK: `STUDENT-016I — True cold-start offline Reader`**

Canonical roadmap: `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`.

## Live main baseline

UX-B00, UX-B01, UX-B02 and UX-B03 are closed and integrated. Do not redo them unless a real regression is proven.

### UX-B03 final acceptance

- PR #46 final head: `42bf4e28b448ee27dff628c43e6db8ce564db805`
- exact-head workflows: **21/21 SUCCESS**
- key runs:
  - `UX B03 Student Learning and Reader` `34713062100` — SUCCESS
  - `Stage14 Student Product` `34713062118` — SUCCESS
  - `Stage15 Student Assessment` `34713062147` — SUCCESS
  - `Stage16 Student PWA` `34713062156` — SUCCESS
  - `UX B02 Student Shell and Navigation` `34713062114` — SUCCESS
  - `Stage 13 Admin Product Verification` `34713062178` — SUCCESS
  - `Stage 13G Admin Operations Verification` `34713062137` — SUCCESS
  - `Rebuild Stage Verification` `34713062125` — SUCCESS after rerunning only the transient failed browser job; rerun job `103606082888` — SUCCESS
- PR #46 merge commit: `56ee51ab0d5669b4a38f9efec991ea79971d3503`
- verified live `main`: `56ee51ab0d5669b4a38f9efec991ea79971d3503`

The initial Rebuild browser failure was one Assessment assertion while Stage14 and Stage15 passed the same Assessment behavior on the same exact head. Rerunning only that browser job passed without code changes, so it is recorded as transient timing rather than a product regression.

## Binding design-quality rule from UX-B04 onward

The current UI is **functional evidence, not a required visual reference**. The responsible engineer/designer owns the final ship quality and may rebuild composition, hierarchy, spacing, typography, navigation, density, component patterns, data presentation and interaction patterns when that produces a better Alwaslh product while preserving identity and contracts.

A batch is not complete at “functional”. Changed screens must be:

**Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.

Student must feel like a modern Arabic educational app, not a dashboard. Admin may be dense, but dense must not become crowded. See §2.1 of the UX/UI refoundation roadmap for the binding design gate.

## UX-B04 current state

Branch: `ux/student-practice`

Base: `main@56ee51ab0d5669b4a38f9efec991ea79971d3503`

Status: **IMPLEMENTATION IN PROGRESS / EXACT-HEAD VERIFICATION NOT YET RUN**.

Target route boundaries:

- `/app/practice` — focused Practice library;
- `/app/practice/quizzes/:quizId` — one quiz detail with learner-facing question-set choice and Practice/Test mode decision;
- `/app/practice/attempts/:sessionId` — focused active attempt or completed result/review.

Implemented on the branch so far:

- roadmap updated with binding product-quality design ownership gate;
- FigJam flow established for Practice library → quiz choice → focused attempt → result/review → resume/back;
- Mobbin research attempted but connector is blocked by paid-plan requirement; no Mobbin result was treated as evidence;
- current Assessment card-grid + embedded workspace replaced with route-driven `StudentAssessmentExperience`;
- active attempt state is no longer the navigation authority: direct attempt URLs restore the session from the API;
- quiz detail keeps explicit question-set selection because Stage15 proves it is a real current contract, but learner copy no longer exposes server/version implementation language;
- Practice and Test remain distinct: Practice gives immediate feedback, Test defers feedback until finalize;
- result/review becomes a dedicated completion composition;
- active assessment uses a focused phone-first layout and suppresses distracting Student global navigation through the existing `:has()` shell architecture;
- Assessment CSS rebuilt around list/detail/focused-attempt/result composition rather than repeating cards;
- Stage15 Playwright contract migrated to real quiz/attempt routes, direct completed-attempt refresh, resume by same session, offline/reconnect and unavailable-session states;
- dedicated `UX B04 Student Practice and Assessment` CI workflow added.

## UX-B04 explicit non-goals

Not part of this batch:

- new Assessment backend/scoring/publication rules;
- offline assessment support;
- `STUDENT-016I` or any new Stage16 capability;
- Downloads/Account cleanup — UX-B05;
- Admin refoundation — UX-B06+.

## Product contracts preserved

- API/PostgreSQL remain canonical authority;
- Auth/Authorization remain server-owned;
- Entitlements remain authoritative;
- `media ready != published`;
- AI never auto-publishes;
- human review chain remains mandatory;
- Assessment scoring/finalization remains server-owned;
- published quiz/version snapshot behavior remains server-owned;
- `/v1` is not Service Worker Cache API authority;
- signed offline authorization/integrity/device/session rules remain unchanged.

## Stage ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 | VERIFIED |
| Stage12 | VERIFIED backend/runtime; `AI-012..AI-019` live provider readiness OPEN |
| Stage13A–G | VERIFIED / CLOSED / integrated |
| Stage14 Student | CLOSED / VERIFIED |
| Stage15 Practice/Assessment | CLOSED / VERIFIED baseline; UX-B04 presentation migration active |
| **Stage16 Offline/PWA** | **OPEN / PARTIALLY VERIFIED — paused during UX refoundation** |
| Stage17 | BLOCKED BY Stage16 closure |
| Stage18–29 | pending in roadmap order |

`STUDENT-016H`: **DONE / VERIFIED / MERGED**.

Exact normal-roadmap continuation after UX-B17 remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

## UX-B04 verification required before acceptance

- Student lint;
- strict typecheck;
- unit tests;
- production build;
- clean API build + PostgreSQL migrations;
- Practice library → quiz detail → attempt route in real Chromium;
- direct authorized attempt refresh/deep-link;
- explicit question-set selection remains bound to the server-created session;
- Practice immediate feedback and Test deferred feedback;
- server-owned finalize/result parity;
- leave → restart same quiz/mode/version resumes the same in-progress session;
- offline disables writes and reconnect refreshes the session;
- unavailable session produces a clear recovery path;
- focused attempt hides distracting global navigation;
- phone/tablet/desktop no-overflow;
- RTL/keyboard/focus checks for changed flow;
- Stage14/15/16 + B02/B03 regressions;
- Rebuild regression;
- exact-head full path-triggered GitHub Actions matrix.

Current result: **NOT YET VERIFIED — implementation branch exists; PR/exact-head CI pending.**

## Known open items outside B04

- Student hosted live authenticated same-origin E2E after PR #39 — `NOT YET VERIFIED` as a hosted-runtime item.
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`.
- Downloads/Account and technical offline-copy closure — B05.
- Admin grouped IA/workflow migration — B06–B15.
- final responsive/RTL/accessibility closure — B16.
- final visual/regression/refoundation closure — B17.
- Stage28 Production Cutover — not complete.

## Next action

Open the independent UX-B04 PR, run exact-head quality + Chromium + full regression matrix, fix any real failure at root cause, and do not start UX-B05 until B04 is accepted and integrated.