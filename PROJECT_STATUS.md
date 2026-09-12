# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: STUDENT UX/UI REFOUNDATION / EXPERIENCE REBUILD**

**ACTIVE PR: #53 — `refactor(student): rebuild the learner experience end to end`**

**ADMIN B06–B14: DEFERRED / SUPERSEDED PENDING ARCHITECTURE DECISION.** The dedicated **Super Admin Product Rebuild** workstream owns Admin product responsibilities, backend workflows, IA, navigation, frontend architecture and UX/UI. Do not patch or execute the old Admin batches in parallel.

Exact normal-roadmap return after Student/shared refoundation closes remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

## Verified baseline

UX-B04 Student Practice / Assessment is **CLOSED / VERIFIED / MERGED**.

- final synchronized B04 head: `56f19b88169160c8edd90c9cad8cf129a834b76e`;
- final B04 matrix: **23/23 SUCCESS** after one same-SHA transient Chromium focus rerun;
- PR #47 merged;
- live `main` used to start the current Student branch: `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`.

Existing verified backend/domain/security contracts remain preserved, including the Full Product Architecture Audit / FPA-002 authorization repair and Legacy Content work already present on the baseline.

## Current Student product architecture

Canonical Student architecture:

`docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance bar:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

Future-complete mobile navigation is intentionally limited to four primary destinations:

- الرئيسية
- التعلّم
- التدريب
- مكتبتي

`مكتبتي` is the future owner of Downloads + Stage17 Notes/Saved/Needs Review. Notifications remain an app-bar secondary action when Stage18 exists. Progress/Statistics/Achievements receive their own route when Stage19 exists. Unimplemented destinations must remain hidden until real contracts and behavior exist.

## Current implementation state on PR #53

Implemented/refactored in the active branch:

- first installed-app launch / Welcome experience;
- activation and returning login rebuilt around learner-facing copy;
- recovery guidance;
- reusable Help / Instructions route (`/help`);
- reusable Support / Contact guidance route (`/support`) without invented contact details;
- removal of normal Student-visible cryptography/cache/session/roadmap jargon;
- `App.tsx` reduced to session orchestration rather than owning every screen;
- account wrapper removed from all authenticated destinations;
- unified Student app bar / adaptive navigation / four-item mobile bottom navigation;
- connection state shown only when degraded/actionable;
- Home simplified around real available destinations rather than fake metrics;
- Learn / Subject hierarchy preserved with calmer presentation;
- focused Reader presentation rebuilt without obsolete AccountPage CSS coupling;
- Downloads rebuilt as saved + available learner library while preserving current Stage16 materialization/integrity authority;
- Account is the single visible owner for access/class-code/logout/help tasks;
- Stage14 stale presentation stylesheet removed;
- historical `assessment-polish.css` removed and replaced with owned Assessment integration styling;
- Stage14 browser assertions updated to verify real learner outcomes instead of legacy copy/chrome.

## Not yet closed

The Student rebuild is **NOT YET COMPLETE / NOT YET MERGED**.

Still required before closure:

1. finish exact-head regression feedback for Stage14/B01/B02/B03/B04/B05/Stage15/Stage16/Rebuild and all triggered workflows;
2. correct any real browser regressions at root cause;
3. finish Practice/Assessment integration cleanup where old shell selectors remain;
4. continue removal/consolidation of dead legacy CSS in `styles.css` only after executable parity proves it safe;
5. inspect phone + desktop Visual QA artifacts for Welcome/Auth/Help/Support/Home/Learn/Reader/Practice/Downloads/Account where fixtures permit;
6. keep production-copy scan blocking implementation/stage/roadmap terminology;
7. update `PROJECT_ENGINEERING_LOG.md` with final findings/decisions/tests;
8. synchronize with any movement of live `main` before merge;
9. merge PR #53 only with exact-head guard after functional + visual acceptance.

## Explicit non-goals in this refoundation

- do not implement Stage17 Notes/Favorites/Needs Review prematurely;
- do not implement Stage18 Notifications prematurely;
- do not implement Stage19 Progress/Statistics/Achievements prematurely;
- do not silently implement remaining Stage16 cold-start offline Reader authority inside presentation work;
- do not modify the dedicated Super Admin rebuild.

## Preserved authority

- API/PostgreSQL canonical;
- Auth/Authz/Entitlements server-owned;
- media ready ≠ published;
- AI never auto-publishes;
- Question Bank / published immutable Quiz version authority unchanged;
- Assessment scoring/finalization server-owned;
- `/v1` excluded from Service Worker Cache authority;
- signed offline authorization/integrity/device/session contracts unchanged;
- no password/session token/device private key stored as offline product data.

## Immediate next action

Stabilize the current Student experience head through real Chromium regression + Visual QA, finish the remaining presentation-debt cleanup without changing deferred business contracts, then close/merge PR #53. After that, synchronize with the dedicated Super Admin rebuild before shared final responsive/RTL/a11y/visual-regression closure and return to `STUDENT-016I`.