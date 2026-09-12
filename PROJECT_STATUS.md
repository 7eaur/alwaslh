# PROJECT STATUS — الوسيلة الذكية

> Concise execution truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Anything not executed or inspected is `NOT YET VERIFIED`.

Last synchronized: **2026-09-13**.

## Current management state

**NORMAL ROADMAP: PAUSED**

**ACTIVE TRACK: STUDENT UX/UI REFOUNDATION / EXPERIENCE REBUILD**

**ACTIVE PR: #53 — `refactor(student): rebuild the learner experience end to end`**

**ADMIN B06–B14: DEFERRED.** The dedicated **Super Admin Product Rebuild** workstream owns Admin product architecture/IA/backend workflows/frontend/UX. Do not patch the old Admin batches from this branch.

Exact normal-roadmap return after Student/shared refoundation closes:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`

## Verified baseline

UX-B04 Student Practice / Assessment is **CLOSED / VERIFIED / MERGED**.

- final synchronized B04 head: `56f19b88169160c8edd90c9cad8cf129a834b76e`;
- final B04 matrix: **23/23 SUCCESS** after one same-SHA transient Chromium focus rerun;
- PR #47 merged;
- current Student branch started from live main `f44d5f72eaeb0acd8ca5c67d2816a56596761f21`.

The Full Product Architecture Audit / FPA-002 authorization repair, Legacy Content work and verified backend/security contracts on that baseline remain preserved.

## Binding Student product quality

Canonical architecture: `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`

Design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

Student production UI must expose learner concepts only. It must not expose crypto/cache/session/stage/roadmap/internal API language.

## Current implementation on PR #53

Implemented/refactored:

- first installed-app Welcome / first-run experience;
- activation, returning login and temporary-password recovery;
- `/help` instructions and `/support` support guidance;
- `App.tsx` reduced to session orchestration;
- old authenticated Account wrapper removed;
- unified Student shell/app-bar/adaptive navigation/mobile bottom navigation;
- normal online state no longer wastes space with permanent “متصل” chrome;
- Home simplified around real learner destinations;
- Learn → Subject → focused Reader hierarchy retained and visually rebuilt;
- Reader search now exposes result count and moves keyboard/screen-reader focus to the first result on request / Enter, closing the previous FPA-013 behavior;
- Practice/Assessment remains routed and focused while removing raw API-error presentation;
- Downloads rebuilt as learner-facing saved/available library while retaining Stage16 integrity/storage authority;
- Account is the visible owner of access/class-code/logout/help/support;
- `stage14.css` removed;
- obsolete `assessment-polish.css` removed and live integration rules separated;
- production-realistic browser fixtures replace Student-visible Stage/Reader fixture wording.

## Error / instruction architecture — active acceptance rule

A centralized Student error-copy layer now maps backend error **codes/status/context** to learner-facing guidance. Raw backend messages are not presentation contracts.

Every expected failure must answer:

1. **What happened?** in learner language.
2. **What can I do now?** with one realistic next action.
3. **What must not happen?** no technical/internal/admin detail leakage.

Covered scenarios include:

- incomplete/invalid/expired activation code;
- password mismatch;
- invalid login credentials;
- temporary-password change;
- device verification/rebind guidance;
- rate limit / service unavailable / offline entry;
- expired session;
- malformed/invalid class code;
- unavailable subject/lesson/quiz/attempt;
- Reader media/search/no-result states;
- offline Assessment write/finalize blocking and reconnect;
- storage budget/device quota/incomplete or untrusted download;
- empty/loading/error/offline states across Student destinations.

Unit tests protect the error mapper from leaking raw backend text. Browser tests verify important user outcomes rather than legacy banners/selectors.

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

## Current closure state

**NOT YET MERGED.** The implementation phase is now frozen for final verification unless CI identifies a real regression.

Before merge:

1. run exact-head lint/typecheck/unit/build and the complete triggered workflow matrix;
2. inspect any failure and distinguish real contract regression from stale browser expectation;
3. require Stage14/15/16 + B01–B05 + Rebuild browser coverage to pass;
4. inspect final phone + desktop Visual QA artifacts for changed Student surfaces;
5. keep production-copy scanner blocking implementation/stage/roadmap terminology;
6. update final engineering evidence and PR/Issue acceptance;
7. refresh live main and resync only if it moved materially;
8. merge PR #53 with exact expected-head guard.

## Explicit non-goals

- no premature Stage17 Notes/Favorites/Needs Review UI;
- no premature Stage18 Notifications UI;
- no premature Stage19 Progress/Statistics/Achievements UI;
- no silent implementation of remaining Stage16 cold-start offline Reader authority;
- no Admin rebuild from this branch.

## Immediate next action

Hold the current code steady, run the exact-head matrix, fix only evidence-backed regressions, inspect final Visual QA, then merge PR #53. After merge, synchronize with the dedicated Super Admin rebuild before shared final responsive/RTL/a11y/visual closure and return to `STUDENT-016I`.
