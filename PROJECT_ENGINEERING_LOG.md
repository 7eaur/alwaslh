# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs and specialized workstream documents.

Last consolidated: **2026-09-13 — Student Library Overview / PR #55.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an installed educational application, not a dashboard. Its UI must remain learner-facing, Arabic/RTL-first, calm, clear and responsive. Admin is a separate product workstream and is not modified by this Student batch.

Canonical Student documents include:

- `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
- `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

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
- media-ready does not mean published;
- AI never auto-publishes learner content/questions;
- Assessment scoring/finalization remains server-owned;
- published immutable quiz-version authority remains server-owned;
- `/v1` is never Service Worker Cache authority;
- offline signing/integrity/device/session rules remain unchanged;
- no password/session token/device private key is persisted as offline learning content.

## Architecture / Product Decisions

- **AD-230** — legacy visual presentation is not a preservation contract; preserve valid behavior/contracts.
- **AD-239** — mobile primary navigation is bounded to four destinations.
- **AD-240** — `مكتبتي` owns learner personal/offline collections; `/app/downloads` remains a compatibility route.
- **AD-242** — Student copy never exposes implementation/security/storage/stage/roadmap jargon.
- **AD-245** — Account owns normal visible access/class-code/logout/help responsibilities.
- **AD-246** — one Student shell owns global chrome.
- **AD-248** — backend error truth is mapped to learner explanation + next action; raw API messages are not UI copy.
- **AD-249** — invalid/offline/expired/unavailable/storage states are first-class acceptance scenarios.
- **AD-250** — motion is restrained and always honors reduced motion.
- **AD-251** — approved future Student surfaces may exist before backend integration when they remain honest zero-data surfaces.
- **AD-252** — no fabricated learner data, unread counts, progress, statistics, scores, achievements, ranking, streaks or recommendations.
- **AD-253** — final Student IA uses `الرئيسية / التعلّم / التدريب / مكتبتي`; Notifications is secondary global action; Progress is a secondary route.
- **AD-254** — destination-level code splitting prevents future surfaces from accumulating in one initial bundle.
- **AD-255** — clickable elements must look clickable before interaction; static information must not visually compete with actions.
- **AD-256 — Library overview is summary-first, not duplicated navigation.** `/app/library` owns a concise heading, one honest summary/statistics region and one destination grid. Horizontal tabs that repeat the same four destinations are removed. Child Library sections expose one explicit back-to-overview action.
- **AD-257 — Library statistics are informational.** They use a single quiet divided surface rather than separate KPI cards. Only real values are connected; Downloads reads the existing local offline package repository, while Stage17-owned Notes/Saved/Needs Review remain honest zero states until their authoritative repositories exist.

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance target:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

## Verified Merged Student Baseline

### PR #53 — Student Experience Rebuild

**MERGED / VERIFIED**

- accepted head `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- exact-head matrix **23/23 SUCCESS**;
- established Welcome/Auth/Help/Support, unified shell, Home/Learn/Reader/Practice/Assessment/Downloads/Account, learner error copy, reduced motion and FPA-013 repair.

### PR #54 — Future Student Surfaces

**MERGED / VERIFIED**

- accepted head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- exact-head matrix **23/23 SUCCESS**;
- live main after merge `c3734366c132ea3919a925bdd0dd37cfd5d82104`;
- final four-item Student navigation;
- Library/Notifications/Progress future-complete surfaces;
- interaction affordance layer and >=44px touch targets;
- destination-level lazy loading;
- phone/desktop Visual QA accepted.

## Active Work — PR #55 Library Overview Refinement

Branch: `ux/student-library-overview`

Base: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`

### Finding `UX-LIBRARY-101`

- **Severity:** P2
- **Area:** Student / Library / Information Architecture
- **Problem:** `/app/library` repeated Downloads/Notes/Saved/Needs Review as both horizontal tabs and large destination cards.
- **Evidence:** actual `student-future-surfaces.tsx` rendered both navigation systems on the same overview; browser/visual evidence from PR #54 confirmed both were visible.
- **Impact:** unnecessary visual weight, repeated choices, weaker overview semantics and less elegant mobile composition.
- **Solution:** remove duplicate tabs, make Library summary-first, keep one destination grid, and use a single back-to-Library action in child sections.
- **Status:** FIXED IN PR #55 / FINAL VERIFICATION PENDING.

### Finding `UX-LIBRARY-102`

- **Severity:** P2
- **Area:** Student / Library / Product truth
- **Problem:** user requested overview statistics, but future personal-learning repositories are not yet implemented.
- **Evidence:** Downloads already has real IndexedDB-backed offline packages; Notes/Saved/Needs Review are Stage17-owned and currently only pre-integration surfaces.
- **Impact:** a naive redesign could fabricate metrics and violate the product truth rule.
- **Solution:** show real saved-download count from `listOfflineLessonPackages`; show honest zero values for not-yet-integrated collections and document the Stage17 replacement requirement.
- **Status:** IMPLEMENTED / STAGE17 DATA CONNECTION PENDING.

### Finding `UX-LIBRARY-103`

- **Severity:** P3
- **Area:** Student / Visual hierarchy
- **Problem:** an initial redesign draft represented each statistic as a separate card and used a decorative gradient, risking another dashboard/card-wall feel.
- **Evidence:** pre-verification code review of `student-library-overview.css`.
- **Impact:** would contradict the Student product character and create unnecessary visual competition with real clickable collection cards.
- **Solution:** one flat white summary panel with internal separators; only destination cards retain stronger interactive surfaces.
- **Status:** FIXED BEFORE FINAL ACCEPTANCE.

### Implementation

- `student-future-surfaces.tsx`
  - added `LibraryOverview`;
  - real download count from active offline scope;
  - concise Library heading;
  - one statistics summary;
  - one collection destination grid;
  - child-section return bar;
  - removed repeated tabs.
- `student-library-overview.css`
  - responsive summary composition;
  - desktop 4-cell / narrower 2×2 stat layout;
  - quiet informational stat styling;
  - refined destination cards and return bar;
  - no decorative gradient.
- `student-b05.e2e.spec.mjs`
  - asserts summary/statistics presence;
  - asserts duplicate Library tabs are absent;
  - asserts four destination cards;
  - performs a real lesson download and requires Downloads statistic to update to `١`.
- `offline-download.e2e.spec.mjs`
  - updated stale navigation selector to use the new Library destination card;
  - preserved manifest/signature/checksum/tamper/removal/logout integrity coverage.

## Verification Evidence — PR #55

Verified before the latest test/documentation commits:

- Student lint — SUCCESS;
- Student typecheck — SUCCESS;
- Student unit tests — **11 files / 41 tests SUCCESS**;
- Student build — SUCCESS.

First B05 Chromium run on the redesigned UI:

- 3 tests passed;
- 1 legacy `offline-download.e2e.spec.mjs` test failed because it still searched for the intentionally removed exact `التنزيلات` tab and old Library heading;
- failure was test-contract drift, not a runtime/download-integrity failure;
- the stale test has now been updated to the new Library IA.

Final exact-head CI and regenerated Visual QA are **PENDING** because the branch head moved after the test and documentation fixes.

## Open / Deferred Product Work

- `UX-OFFLINE-104` — true cold-start offline Reader remains at `STUDENT-016I`.
- Stage17 — Notes / Saved / Needs Review authoritative data, CRUD, provenance, ownership, offline/sync.
- Stage18 — Notifications feed/unread/deep-link lifecycle.
- Stage19 — trusted Progress/Statistics/Achievements.
- Admin redesign remains owned by the dedicated Super Admin workstream.

Normal roadmap return remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17 → Stage18 → Stage19`
