# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-13 — Student Future Surfaces / PR #54.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an installed educational application, not a dashboard. The final product includes current learning/assessment/offline/access flows plus planned personal-learning, notification and progress capabilities.

The Product Owner has confirmed that no production learner will use the app until the remaining roadmap is complete. Therefore final Student UI/IA may be prebuilt before backend integration so later stages connect real contracts into stable product locations instead of repeatedly restructuring navigation.

Canonical Student documents:

- `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
- `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`

Admin legacy B06–B14 remain outside this branch. Dedicated Super Admin Product Rebuild owns Admin architecture/UX.

## Stable Architecture / Authority

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin workstream boundary.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — brand/tokens.
- `packages/ui` — shared presentation primitives.

Stable contracts:

- API + PostgreSQL own canonical state;
- browser is not business authority;
- Auth/Authz/Entitlements remain server-owned;
- `media ready != published`;
- AI never auto-publishes learner content/questions;
- Assessment scoring/finalization remains server-owned;
- published immutable quiz-version authority remains server-owned;
- `/v1` is never Service Worker Cache authority;
- offline signing/integrity/device/session rules remain unchanged;
- no password/session token/device private key is persisted as offline learning content.

## Key Architecture / Product Decisions

- **AD-230** — legacy visual presentation is not a preservation contract; preserve valid behavior/contracts.
- **AD-239** — mobile primary navigation is bounded to four destinations.
- **AD-240** — `مكتبتي` owns learner personal/offline collections; `/app/downloads` remains compatibility route.
- **AD-242** — Student copy never exposes implementation/security/storage/stage/roadmap jargon.
- **AD-243** — support UI does not invent contact channels.
- **AD-244** — installed Welcome is first-run/standalone behavior, not a forced page every visit.
- **AD-245** — Account owns normal visible access/class-code/logout/help responsibilities.
- **AD-246** — one Student shell owns global chrome.
- **AD-248** — Student presentation maps backend error truth to learner explanation + next action; raw API message is not UI copy.
- **AD-249** — predictable invalid/offline/expired/unavailable/storage states are first-class acceptance scenarios.
- **AD-250** — motion is restrained interaction affordance and always honors reduced motion.
- **AD-251 — future-surface prebuild authorized.** Because no production learners use the app before completion, approved future Student surfaces may be implemented before their backend service is connected.
- **AD-252 — no fabricated learner data.** Prebuilt surfaces may render honest empty states but never fake notes, unread counts, progress, statistics, scores, achievements, rankings, streaks or recommendations.
- **AD-253 — final Student IA is active now.** Mobile navigation is `الرئيسية / التعلّم / التدريب / مكتبتي`; Notifications is app-bar secondary action; Progress is Home/Account/desktop secondary route.
- **AD-254 — destination-level code splitting.** New features must not accumulate in the initial Student bundle. Learn/Reader, Practice/Assessment, Library/personal surfaces and Account load through `React.lazy`; Home/Shell stays immediate.

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

## Merged Student Refoundation Baseline

PR #53 — `refactor(student): rebuild the learner experience end to end` — **MERGED / VERIFIED**.

- exact accepted head: `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- exact-head matrix: **23/23 SUCCESS**;
- merged main: `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`;
- phone/desktop Visual QA accepted;
- Stage14/15/16 and B01–B05 verified.

That baseline contains Welcome/Auth/Help/Support, unified shell, Home/Learn/Reader/Practice/Assessment/Downloads/Account, centralized learner error copy, motion/reduced-motion behavior and FPA-013 Reader search-focus repair.

## Active Work — PR #54 Future Student Surfaces

Branch: `ux/student-future-surfaces`

Base: `main@d8ccb0b7ba004618cbcbdd96937d5cded47161dc`

### Product surfaces implemented

- `/app/library` — Library orientation.
- `/app/library/downloads` — existing Stage16 Downloads embedded without duplicated business logic.
- `/app/library/notes` — honest zero-data Notes surface.
- `/app/library/saved` — honest zero-data Saved/Bookmarks surface.
- `/app/library/review` — honest zero-data Needs Review surface.
- `/app/downloads` — retained compatibility route.
- `/app/notifications` — designed zero-data notification feed state; no fake unread badge.
- `/app/progress` — designed Learning/Practice/Achievements structure with no invented metrics.
- Home — Learn/Practice/Library primary destinations + Progress/Notifications secondary links.
- Account — current access/class-code/help/support/logout plus personal links to Library/Progress/Notifications.

### Stage17–19 integration specification

`STUDENT_FUTURE_SURFACES_SPEC.md` defines now, before backend implementation:

- Note creation from Reader and all-notes Library flow;
- note source provenance and source-unavailable behavior;
- saved-question idempotent UX;
- Needs Review placement;
- notification unread/deep-link behavior;
- Progress page hierarchy and authoritative-metric rules;
- Account future security/preferences reservation;
- loading/empty/error/offline/denied matrix;
- phone/tablet/desktop behavior;
- Stage17/18/19 backend integration gates.

### Performance work

Before code splitting, adding the future surfaces increased the monolithic production JS to approximately:

- `599.61 kB` minified;
- `148.83 kB` gzip.

Rather than raising Vite’s warning limit, PR #54 now lazy-loads destination feature modules with `React.lazy` + `Suspense`.

Immediate Shell/Home remains synchronous. Lazy destinations:

- Learn/Reader;
- Practice/Assessment;
- Library/personal surfaces;
- Account.

Loading state uses learner copy `جاري فتح الصفحة`, and reduced-motion disables its spinner animation.

Final production-build output after this split is **PENDING exact-head verification**.

## Current Verification Evidence

On an intermediate pre-split PR #54 head:

- Student lint/typecheck/unit/build — SUCCESS;
- 11 Student test files / 41 unit tests — SUCCESS;
- PostgreSQL migrations — SUCCESS;
- expanded B05 Chromium + Visual QA — SUCCESS;
- B02 desktop navigation — SUCCESS;
- B02 mobile failed only because Playwright’s non-exact `الإشعارات` locator matched both the app-bar bell and Home secondary card. The test now targets the exact app-bar accessible name.

This is not final acceptance because code splitting and documentation changed the branch afterward.

## Findings Register

| ID | Severity | Area | Problem | Evidence / Solution | Status |
|---|---:|---|---|---|---|
| `UX-IA-102` | P1 | Student Shell | historical aggregate/account-wrapped UI | single shell from PR #53 | FIXED |
| `UX-IA-104` | P1 | Learn | local/non-routed hierarchy | routed Learn/Subject/Reader | FIXED |
| `UX-IA-106` | P1 | Practice | dashboard-like attempt flow | routed focused Assessment | FIXED |
| `UX-COPY-105` | P1 | Error UX | raw API messages could reach learner | centralized contextual mapper | FIXED |
| `FPA-013` | P2 | Reader a11y | search result did not receive DOM focus | explicit jump/Enter focus | FIXED |
| `UX-MOTION-101` | P2 | Interaction | static-feeling surfaces | restrained shared motion/depth | FIXED |
| `UX-FUTURE-101` | P1 | Future IA | Notes/Notifications/Progress would force later navigation rewrites | final surfaces/placement prebuilt | FIXED / DATA CONNECTION PENDING |
| `UX-DATA-102` | P1 | Product truth | risk of placeholder/fake future metrics | zero-data-only pre-integration policy | FIXED / GOVERNANCE |
| `PERF-STUDENT-101` | P2 | Frontend bundle | future screens pushed main JS to ~599.61 kB | destination-level dynamic imports | IN VERIFICATION |
| `UX-OFFLINE-104` | P1 | Reader | true cold-start offline Reader not complete | return to `STUDENT-016I` | OPEN / ROADMAP |
| `UX-IA-103` | P1 | Admin | Admin requires independent rebuild | dedicated Super Admin workstream | DELEGATED |

## Acceptance Required Before PR #54 Merge

- exact-head lint/typecheck/unit/build;
- production build proves meaningful initial-bundle reduction and emitted lazy chunks;
- B01/B02/B03/B04/B05 Chromium regressions;
- Stage14/15/16 + Rebuild verification;
- all other triggered workflows green;
- phone/desktop Visual QA for Library overview/downloads/notes/saved/review, Notifications, Progress and Account;
- no horizontal overflow;
- learner-copy scan clean;
- reduced-motion acceptance preserved;
- exact head/base/mergeability checked before merge.

## Roadmap State After Surface Prebuild

PR #54 does **not** implement Stage17–19 data/services. Backend return remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`

At those stages, authoritative contracts should connect into the already-established Student UI rather than changing top-level IA again.
