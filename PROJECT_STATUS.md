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

Motion is a launch-quality requirement: interaction should feel alive without becoming decorative or distracting. Transitions are short, restrained and accessibility-safe.

## PR #53 implementation

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
- Reader search exposes result count and moves keyboard/screen-reader focus to the first result on request / Enter, closing FPA-013 behavior;
- Practice/Assessment remains routed and focused while removing raw API-error presentation;
- Downloads rebuilt as learner-facing saved/available library while retaining Stage16 integrity/storage authority;
- Account is the visible owner of access/class-code/logout/help/support;
- `stage14.css` removed;
- obsolete `assessment-polish.css` removed and live integration rules separated;
- production-realistic browser fixtures replace Student-visible Stage/Reader fixture wording;
- `student-motion.css` adds subtle surface-entry motion, feedback appearance, press/hover affordances and lightweight depth/borders without an animation library;
- motion uses short opacity/transform transitions and honors `prefers-reduced-motion`;
- B05 browser acceptance verifies reduced-motion behavior.

## Error / instruction architecture

A centralized Student error-copy layer maps backend error **codes/status/context** to learner-facing guidance. Raw backend messages are not presentation contracts.

Every expected failure answers:

1. **What happened?** in learner language.
2. **What can I do now?** with one realistic next action.
3. **What must not happen?** no technical/internal/admin detail leakage.

Covered scenarios include invalid/expired activation, password mismatch, invalid login, temporary password, device verification/rebind, rate limit/service unavailable/offline entry, expired session, invalid class code, unavailable subject/lesson/quiz/attempt, Reader media/search/no-result states, offline Assessment write/finalize blocking, storage/device quota, incomplete/untrusted download, and empty/loading/error/offline states.

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

## Final verification evidence before documentation head

On code head `17b1c43915eb5b3c279b91727fc8f1c3bc4e1ca8`:

- UX B01 — SUCCESS;
- UX B02 — SUCCESS;
- UX B03 — SUCCESS;
- UX B04 — SUCCESS;
- UX B05 — SUCCESS;
- Stage15 Student Assessment — SUCCESS;
- Stage16 PWA shell — SUCCESS;
- Stage16 PostgreSQL offline contracts — SUCCESS;
- Stage16 lifecycle/materialization Chromium — SUCCESS;
- B05 quality/migrations/Chromium/visual artifact — SUCCESS;
- B05 Visual QA artifact `10307419204`, digest `sha256:4fb6af5dd071d7dbf30bdfeea7704db9917a9185766ea8288aba526f6313405d`;
- 16 B05 screenshots were manually inspected across Activation, Welcome, Help, Support, Downloads library/saved/offline and Account on phone + desktop; no launch-blocking visual issue was found;
- Stage14 quality/build/migrations/contracts passed, while its browser suite exposed one final stale timing assumption around session expiry detection; that test was corrected to observe the entitlements `401` before entering Account instead of waiting for a refresh control after the app had already handled expiry.

No backend/security/business contract was weakened by the browser-test corrections.

## Current closure state

**NOT YET MERGED.** The branch now contains the final Stage14 timing correction plus this documentation. The next branch head is the intended final acceptance head and must pass its own exact-head workflow matrix before merge.

Before merge:

1. require the complete exact-head workflow matrix to finish SUCCESS;
2. require Stage14/15/16 + B01–B05 + Rebuild browser coverage to pass;
3. keep production-copy scanner blocking implementation/stage/roadmap terminology;
4. retain `prefers-reduced-motion` browser acceptance;
5. preserve B05 manual Visual QA acceptance;
6. verify live `main` has not moved materially;
7. update PR #53 / Issue #16 with final evidence;
8. merge PR #53 only with the exact expected-head guard.

## Known non-blocking debt

- Student production JS bundle remains approximately `568.80 kB` minified / `144.88 kB` gzip and Vite warns above 500 kB. This is a real performance debt for later route-level code-splitting evaluation, but current browser acceptance does not show it as a launch blocker for this refoundation batch.
- true cold-start offline Reader authority remains intentionally deferred to `STUDENT-016I`; do not fake completion here.

## Explicit non-goals

- no premature Stage17 Notes/Favorites/Needs Review UI;
- no premature Stage18 Notifications UI;
- no premature Stage19 Progress/Statistics/Achievements UI;
- no silent implementation of remaining Stage16 cold-start offline Reader authority;
- no Admin rebuild from this branch;
- no heavy animation framework, continuous decorative motion, bounce/glow effects or motion that obscures state/focus.

## Immediate next action

Run the complete exact-head CI matrix on the documentation-complete branch head. If all workflows are green, verify PR head/base/mergeability, record final acceptance in PR #53 and Issue #16, merge with exact expected-head guard, verify live main, then synchronize with the dedicated Super Admin rebuild before returning to `STUDENT-016I`.
