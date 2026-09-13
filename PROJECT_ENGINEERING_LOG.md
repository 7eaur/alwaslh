# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs and specialized workstream documents.

Last consolidated: **2026-09-13 — Student Library Overview / PR #55**.

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

Established:

- Welcome / Activation / Login / Recovery;
- Help / Support;
- unified Student shell;
- Home / Learn / Subject / Reader;
- Practice / Quiz / Assessment / Result;
- Downloads / Account;
- learner-safe error copy;
- reduced-motion-safe micro-interactions;
- Reader search focus repair (`FPA-013`).

### PR #54 — Future Student Surfaces

**MERGED / VERIFIED**

- accepted head `4b6f24c5cb9bd0da525ecfebc59b1ebbf156c903`;
- exact-head matrix **23/23 SUCCESS**;
- merge commit `c3734366c132ea3919a925bdd0dd37cfd5d82104`;
- phone/desktop Visual QA accepted.

Established:

- final four-item Student primary navigation;
- `/app/library` + Downloads / Notes / Saved / Needs Review prebuilt surfaces;
- `/app/notifications` prebuilt honest zero state;
- `/app/progress` prebuilt honest zero state;
- Account personal-management hub;
- interaction-affordance layer;
- >=44px touch-target acceptance;
- destination-level lazy loading;
- no fabricated future learner data.

### Performance result

Feature-level lazy loading reduced the initial main Student bundle from approximately:

- `599.61 KB minified / 148.83 KB gzip`

to approximately:

- `225.89 KB minified / 71.24 KB gzip`.

Learn, Assessment, Library/personal surfaces and Account are emitted as separate on-demand chunks.

## 5. Active work — PR #55 Library Overview Refinement

Branch: `ux/student-library-overview`

Base when opened: `main@c3734366c132ea3919a925bdd0dd37cfd5d82104`

PR: `#55 — refactor(student): redesign Library overview hierarchy`

Latest live inspection before this documentation sync: PR OPEN / mergeable. Live-check again before merge.

### Finding `UX-LIBRARY-101`

- **Severity:** P2
- **Area:** Student / Library / IA
- **Problem:** `/app/library` repeated Downloads/Notes/Saved/Needs Review as both horizontal tabs and large destination cards.
- **Evidence:** merged `student-future-surfaces.tsx` rendered both controls on the same overview.
- **Impact:** repeated choices, unnecessary visual weight, weaker overview semantics, less elegant phone composition.
- **Solution:** remove duplicate tabs; make Library summary-first; keep one destination grid; child sections expose a single back-to-Library action.
- **Status:** FIXED IN PR #55 / FINAL EXACT-HEAD VERIFICATION PENDING.

### Finding `UX-LIBRARY-102`

- **Severity:** P2
- **Area:** Student / Library / product truth
- **Problem:** Product Owner requested a useful overview with statistics while Stage17 personal-learning repositories do not yet exist.
- **Evidence:** Downloads already has real IndexedDB-backed offline packages; Notes/Saved/Needs Review are pre-integrated surfaces only.
- **Impact:** naive UI could fabricate metrics and violate AD-252.
- **Solution:** real saved-download count from existing offline package store; honest zero values for Notes/Saved/Needs Review until Stage17 repositories land; explicit Stage17 replacement requirement.
- **Status:** IMPLEMENTED / FUTURE DATA CONNECTION PENDING.

### Finding `UX-LIBRARY-103`

- **Severity:** P3
- **Area:** Student / visual hierarchy
- **Problem:** an early design direction risked separate KPI cards/gradient treatment and another dashboard/card-wall feel.
- **Solution:** one flat quiet divided summary surface; only destination cards carry stronger interactive treatment.
- **Status:** FIXED BEFORE FINAL ACCEPTANCE.

### Implementation

`apps/student-web/src/student-future-surfaces.tsx`

- Library overview hierarchy rebuilt;
- honest summary/statistics;
- real download count reads active offline package scope;
- duplicate tabs removed;
- child-section return control added.

`apps/student-web/src/student-library-overview.css`

- dedicated responsive overview composition;
- one quiet statistics surface;
- desktop/narrow 4-cell → 2×2 behavior;
- destination card hierarchy;
- return-bar styling;
- no decorative gradient.

`apps/student-web/e2e/student-b05.e2e.spec.mjs`

- requires summary/statistics;
- requires duplicate tabs absent;
- requires four destination cards;
- downloads a real lesson then requires Downloads stat `٠ → ١`;
- preserves clickability/static-information acceptance.

`apps/student-web/e2e/offline-download.e2e.spec.mjs`

- stale old navigation selector updated to the new Library IA;
- manifest/signature/checksum/tamper/removal/logout integrity coverage remains intact.

`docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

- canonical product/design decision for this batch.

## 6. PR #55 verification evidence

Verified on the current implementation before the last documentation/test-sync commits:

- Student lint — SUCCESS;
- strict typecheck — SUCCESS;
- unit tests — **11 files / 41 tests SUCCESS**;
- production build — SUCCESS.

First B05 Chromium run:

- 3 tests passed;
- 1 old `offline-download.e2e.spec.mjs` assertion failed because it still expected the removed exact `التنزيلات` tab/old heading;
- this was test-contract drift, not a runtime/download-integrity failure;
- stale selector was updated to the new Library destination while preserving integrity assertions.

Because test and documentation commits changed the branch head afterward:

**FINAL EXACT-HEAD WIDE CI + REGENERATED PHONE/DESKTOP VISUAL QA ARE STILL REQUIRED BEFORE MERGE.**

## 7. Exact continuation for PR #55

Do not redesign the Library again unless new evidence proves a problem.

Next steps:

1. live-fetch PR #55 head + live `main`;
2. inspect triggered exact-head workflow matrix;
3. require B01/B02/B03/B04/B05 + Stage14/15/16 + Rebuild and all other triggered workflows to succeed;
4. inspect B05 Visual QA artifact for phone and desktop;
5. verify no duplicate Library tabs;
6. verify saved-download statistic updates `0 → 1` after a real download;
7. verify statistics remain non-clickable;
8. verify collection cards remain unmistakably clickable;
9. verify no horizontal overflow, learner-safe copy and reduced-motion behavior;
10. if all green and visuals accepted, update final evidence and merge PR #55 with expected-head SHA guard;
11. if a failure appears, classify product regression vs stale test before changing UI.

## 8. Open / deferred product work

### Stage16

`UX-OFFLINE-104` / true cold-start offline Reader remains open.

Normal return starts at:

`STUDENT-016I`

Then:

`STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G`.

### Stage17

Connect authoritative Personal Learning Data to the prebuilt Library:

- Notes CRUD/provenance;
- Saved/bookmarked questions;
- Needs Review;
- ownership/offline/sync/conflict rules.

### Stage18

Connect Notifications:

- feed;
- unread/last-seen;
- deep-link contract;
- lifecycle/quiet-hours/opt-out/Web Push where approved.

### Stage19

Connect trusted Progress/Statistics/Achievements:

- server-defined metrics only;
- no client-invented mastery;
- privacy-safe achievement/ranking behavior.

### Admin

Admin redesign remains owned by the dedicated Super Admin workstream. Do not restart legacy B06–B14 from this Student branch.

## 9. Documentation precedence for new conversations

For current Student continuation, read:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STATUS.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `docs/product/STUDENT_PRODUCT_ARCHITECTURE.md`
5. `docs/product/STUDENT_FUTURE_SURFACES_SPEC.md`
6. `docs/product/STUDENT_LIBRARY_OVERVIEW_REDESIGN.md`

Then live-check PR #55, `main` and CI.

For broad historical recovery only after that, use:

- `docs/workstreams/UNIFIED_PROJECT_RESUME_PROTOCOL.md`
- `MASTER_REBUILD_ROADMAP.md`
- `PRODUCT_FEATURE_PARITY_MATRIX.md`
- specialized Railway/content/AI docs as relevant.
