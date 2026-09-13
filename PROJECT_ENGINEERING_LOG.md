# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs and specialized workstream documents.

Last consolidated: **2026-09-13 — Student Library Overview / PR #55 exact-head closure**.

## 1. Project understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من:

- Student Web/PWA;
- Super Admin Web;
- Fastify API;
- PostgreSQL;
- content/media/OCR/AI/question-bank/assessment/offline authorities.

Student is an **installed educational application**, not a dashboard. It must remain learner-facing, Arabic/RTL-first, clear, calm, responsive, accessible and visually comfortable.

Admin is a separate product workstream and is not owned by the current Student branch.

Canonical Student documents:

- `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
- `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

Canonical continuation docs:

- `PROJECT_HANDOFF.md`
- `PROJECT_STATUS.md`
- `PROJECT_ENGINEERING_LOG.md`

## 2. Stable architecture / authority

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin boundary.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/tokens.
- `packages/ui` — shared presentation primitives.

Stable contracts:

- API + PostgreSQL own canonical business state;
- browser is not canonical durable business authority;
- Auth/Authz/Entitlements remain server-owned;
- Full Code = 6 digits; Class Code = 7 digits;
- `media ready != published`;
- AI output never auto-publishes Student content/questions;
- protected Reader/media remains server-authorized;
- Question Bank publication + immutable Quiz version remain Student delivery authority;
- Assessment scoring/finalization/history remain server-owned;
- `/v1` is never Service Worker Cache authority;
- offline signing/integrity/device/session rules remain unchanged;
- no password/session token/device private key is persisted as offline learning data.

## 3. Binding product/design decisions

- **AD-230** — legacy visual presentation is not a preservation contract; preserve valid behavior/contracts, not presentation debt.
- **AD-239** — mobile primary navigation is intentionally bounded.
- **AD-240** — `مكتبتي` owns learner personal/offline collections; `/app/downloads` remains compatibility-only.
- **AD-242** — Student copy never exposes implementation/security/storage/stage/roadmap jargon.
- **AD-243** — Help/Support surfaces must not invent phone/email/WhatsApp/contact channels.
- **AD-244** — Welcome is a first-installed/standalone-app experience, not a forced page on every anonymous web visit.
- **AD-245** — Account owns normal visible access/class-code/logout/help responsibilities.
- **AD-246** — one Student shell owns global chrome.
- **AD-247** — browser tests assert user outcomes rather than preserve obsolete copy/selectors.
- **AD-248** — backend error truth is mapped to learner explanation + next action; raw API messages are not presentation copy.
- **AD-249** — invalid/offline/expired/unavailable/storage scenarios are first-class product states and acceptance cases.
- **AD-250** — motion is restrained functional affordance and always honors reduced motion.
- **AD-251** — approved future Student surfaces may exist before backend integration when they remain honest zero-data surfaces.
- **AD-252** — no fabricated notes, unread counts, progress, scores, statistics, achievements, rankings, streaks, recommendations or business outcomes.
- **AD-253** — final Student IA primary navigation is `الرئيسية / التعلّم / التدريب / مكتبتي`; Notifications is secondary global; Progress is secondary route.
- **AD-254** — destination-level code splitting prevents future feature accumulation in the initial Student bundle.
- **AD-255** — clickable elements must look clickable before interaction; static information must not visually compete with actions; touch targets >=44px where interactive.
- **AD-256** — Library overview is summary-first, not duplicated navigation. `/app/library` owns a concise heading, one honest summary/statistics region and one destination grid. Child sections expose one explicit return-to-overview action.
- **AD-257** — Library statistics are informational. Use one quiet divided surface, not separate KPI cards. Only real values are connected; Downloads reads the existing local offline package repository, while Stage17-owned Notes/Saved/Needs Review remain honest zero states until their repositories exist.
- **AD-258** — continuation authority is explicit. A new conversation must start from `PROJECT_HANDOFF.md` → `PROJECT_STATUS.md` → `PROJECT_ENGINEERING_LOG.md` → the three canonical Student product docs, then live-check GitHub refs/CI before editing. Historical stage prose must not override newer explicit Product Owner decisions.

Binding design order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Acceptance target:

**Functional + Clear + Easy + Comfortable + Consistent + Fast + Maintainable + Professional**

## 4. Verified merged Student baseline

### PR #53 — Student Experience Rebuild

**MERGED / VERIFIED**

- accepted head `4c94063c5f09934353f5dbe1e2bb9509286e2812`;
- exact-head matrix **23/23 SUCCESS**;
- merge commit `d8ccb0b7ba004618cbcbdd96937d5cded47161dc`.

Established Welcome/Auth/Recovery/Help/Support, unified shell, Home/Learn/Reader, Practice/Assessment/Result, Downloads/Account, learner-safe errors, reduced-motion-safe interactions and Reader focus repair.

### PR #54 — Future Student Surfaces

**MERGED / VERIFIED**

- accepted head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- exact-head matrix **23/23 SUCCESS**;
- merge commit `c3734366c132ea3919a925bdd0dd37cfd5d82104`;
- phone/desktop Visual QA accepted.

Established final four-item Student primary navigation, Library/Notifications/Progress prebuilt surfaces, Account personal-management hub, affordance rules, >=44px targets, lazy destination loading and no fabricated future data.

### Performance result

Feature-level lazy loading reduced initial Student JS from approximately `599.61 KB / 148.83 KB gzip` to `225.89 KB / 71.24 KB gzip`.

## 5. Active work — PR #55 Library Overview Refinement

Branch: `ux/student-library-overview`

Base when opened: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`

PR: `#55 — refactor(student): redesign Library overview hierarchy`

### Finding `UX-LIBRARY-101`

- **Severity:** P2
- **Area:** Student / Library / IA
- **Problem:** `/app/library` repeated Downloads/Notes/Saved/Needs Review as both horizontal tabs and destination cards.
- **Impact:** repeated choices, visual weight and weaker overview semantics.
- **Solution:** summary-first overview, one destination grid, one return-to-Library action in child sections.
- **Status:** FIXED IN PR #55 / FINAL EXACT-HEAD VERIFICATION PENDING.

### Finding `UX-LIBRARY-102`

- **Severity:** P2
- **Area:** Student / Library / product truth
- **Problem:** useful statistics were requested before Stage17 repositories exist.
- **Solution:** real offline-package count for Downloads; honest zero states for Notes/Saved/Needs Review until Stage17 owns those records.
- **Status:** IMPLEMENTED / FUTURE DATA CONNECTION PENDING.

### Finding `UX-LIBRARY-103`

- **Severity:** P3
- **Area:** Student / visual hierarchy
- **Problem:** separate KPI-card/gradient treatment would recreate dashboard/card-wall styling.
- **Solution:** one quiet divided informational summary; stronger treatment reserved for clickable destination cards.
- **Status:** FIXED BEFORE FINAL ACCEPTANCE.

### Finding `QA-STUDENT-104`

- **Severity:** P2
- **Area:** Student / browser acceptance
- **Problem:** after the approved Library redesign, `student-shell-navigation.e2e.spec.mjs` still asserted the old heading `كل ما يخص تعلمك في مكان واحد`.
- **Evidence:** exact-head `aca9a2f72ecede120d1d87889f9a3fb0660ea712` produced **20/23 workflow SUCCESS**; B02 failed only in its Playwright shell step after quality/build/migrations/Chromium setup passed. Stage14 quality passed but its full `npm run test:e2e` failed; Rebuild backend/build/migration jobs passed but its Stage8 full `npm run test:e2e` failed. The full suites necessarily include the stale B02 spec.
- **Impact:** exact-head matrix was red even though the failure contradicted the newly approved copy/IA rather than exposing a product regression.
- **Solution:** update only the obsolete heading expectation to `محتواك الشخصي، مرتب في مكان واحد`; preserve navigation/focus/history/offline/no-overflow assertions and all offline integrity tests.
- **Status:** FIXED ON PR #55; fresh exact-head matrix required.

### Implementation ownership

- `apps/student-web/src/student-future-surfaces.tsx` — overview hierarchy, real Downloads count, child return action.
- `apps/student-web/src/student-library-overview.css` — responsive quiet summary/destination composition.
- `apps/student-web/e2e/student-b05.e2e.spec.mjs` — summary, no duplicate tabs, destination and real count acceptance.
- `apps/student-web/e2e/offline-download.e2e.spec.mjs` — new IA navigation while retaining integrity/tamper/removal/logout assertions.
- `apps/student-web/e2e/student-shell-navigation.e2e.spec.mjs` — stale Library heading expectation aligned with approved overview.
- `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md` — canonical decision.

## 6. PR #55 verification evidence

Implementation-level evidence already obtained:

- Student lint — SUCCESS;
- strict typecheck — SUCCESS;
- unit tests — **11 files / 41 tests SUCCESS**;
- production build — SUCCESS.

Exact-head `aca9a2f72ecede120d1d87889f9a3fb0660ea712`:

- **20/23 workflows SUCCESS**;
- failures: B02, Stage14, Rebuild;
- B02 stale heading expectation proven directly;
- Stage14 and Rebuild aggregate browser jobs execute the full Playwright suite containing that stale test;
- API/build/migrations and unrelated backend stage jobs passed.

The selector fix moved the branch head. Therefore old exact-head evidence is not merge evidence.

**FINAL REQUIRED GATE:** fresh exact-head workflow matrix + exact-head B05 phone/desktop Visual QA.

## 7. Exact continuation for PR #55

Do not redesign the Library again without new product evidence.

1. live-fetch final PR #55 head and `main`;
2. require B01/B02/B03/B04/B05 + Stage14/15/16 + Rebuild and all other triggered workflows SUCCESS on that exact head;
3. inspect B05 Visual QA artifact for phone and desktop;
4. confirm duplicate tabs absent, real saved-download count `0 → 1`, stat cells static, destination cards obvious, no overflow, learner-safe copy and reduced-motion behavior;
5. update final evidence;
6. merge with expected-head SHA guard only after all gates pass;
7. then resume normal roadmap at `STUDENT-016I`.

## 8. Open / deferred product work

### Stage16

`UX-OFFLINE-104` / true cold-start offline Reader remains open.

Normal return starts at `STUDENT-016I`, then `STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G`.

### Stage17

Connect authoritative Notes CRUD/provenance, Saved questions, Needs Review and ownership/offline/sync/conflict rules.

### Stage18

Connect Notifications feed, unread/last-seen, deep links and approved lifecycle behavior.

### Stage19

Connect trusted server-defined Progress/Statistics/Achievements; no client-invented mastery.

### Admin

Admin redesign remains owned by the dedicated Super Admin workstream. Do not restart legacy B06–B14 from this Student branch.

## 9. Documentation precedence for new conversations

For current Student continuation, read:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
5. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
6. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
7. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

Then live-check PR #55, `main` and CI. Anything uninspected is `NOT YET VERIFIED`.
