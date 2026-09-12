# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX-B04 final resync with Full Product Architecture Audit main.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an installed educational app experience. Current Student product flow is:

`Activation/Login → Home → Learn → Subject → Lesson/Reader`

with separate `Practice`, `Downloads`, and `Account` destinations.

Student refoundation ownership currently ends at B05. Admin B06–B14 are **not active here**; a dedicated **Super Admin Product Rebuild** workstream owns Admin responsibilities, backend workflow mapping, IA, navigation, frontend architecture, UX/UI and Admin design-system decisions. Its Architecture Decision may supersede the legacy B06–B14 plan.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin; rebuild decisions currently delegated to the dedicated Admin workstream.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/design tokens.
- `packages/ui` — framework-neutral shared presentation foundation.

Stable authority contracts:

- browser is not canonical business authority;
- API + PostgreSQL own canonical state;
- Auth/Authorization and Entitlements remain server-owned;
- `media ready != published`;
- AI output never auto-publishes Student content/questions;
- human review remains mandatory;
- Assessment scoring/finalization remains server-owned;
- immutable/published quiz-version snapshot authority remains server-owned;
- `/v1` is never Service Worker Cache API authority;
- signed offline authorization, integrity and device/session rules remain unchanged;
- no password/session token/device private key is persisted as offline learning content.

## Binding product-quality decision

- **AD-230 — legacy visuals are not a preservation contract.** Existing screens are evidence for functions/flows only. Layout, composition, typography, navigation, spacing, density and interaction patterns may be rebuilt while preserving identity and correct contracts.
- Acceptance from B04 onward is: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.
- Student must feel like a modern Arabic-first/RTL-first educational app, not a dashboard.

## Student User Flows

### B02 — shell/navigation — integrated

Top-level destinations:

`Home | Learn | Practice | Downloads` + `Account`

### B03 — learning hierarchy/Reader — integrated

- `/app/learn`
- `/app/learn/subjects/:subjectId`
- `/app/learn/lessons/:lessonId`

Direct subject/lesson routes resolve only through server-authorized curriculum. Reader remains a focused learning screen.

### B04 — Practice / Assessment — final resync

- `/app/practice` — library + recent attempts.
- `/app/practice/quizzes/:quizId` — quiz detail + learner-facing question-set + Practice/Test choice.
- `/app/practice/attempts/:sessionId` — focused attempt or result/review.

B04 decisions:

- **AD-231** — Practice is a route hierarchy, not one dashboard surface.
- **AD-232** — real question-set selection stays, but Student sees humanized “مجموعة الأسئلة” language rather than server/version terminology.
- **AD-233** — active Assessment is a focused learning task; distracting global Student navigation is suppressed.
- **AD-234** — Practice immediate feedback / Test deferred feedback remains unchanged.
- **AD-235** — attempt deep links restore from canonical API session authority; React local state is not navigation authority.
- **AD-236** — no decorative performance debt: no new animation library, large asset, polling system or duplicate endpoint.
- **AD-237** — completion transition resets viewport to result start and moves programmatic focus to the result heading, improving mobile continuity and screen-reader orientation.

## Parallel architecture/security audit integration

The latest B04 resync starts from live main:

`8d0676443aa7e186c41a79cc011f7f828d1290ef`

This main contains Full Product Architecture Audit closure evidence and the independent SEC-01 / `FPA-002` Assessment authorization repair.

Preserved audit facts:

- Audit PR #49 merged as `4249c91e434994343bfe3bd685af6d101c987dc1`.
- `FPA-002` repair PR #50 merged at `f60f263f9fecfa33a3876ef7df6334c222c7cf3a`.
- The repair closes abandoned Assessment-session authorization leakage with PostgreSQL/Chromium evidence.
- Railway deployment `1e5a749a-10ac-47fd-99d8-e2653fce154b` reported SUCCESS.
- `FPA-013` remains open: Reader active-search-match DOM focus finding.
- Authenticated production-path verification remains `NOT YET VERIFIED` where explicitly recorded by the audit.

B04 did not overwrite any API/audit fix. Conservative final resync commit before doc reconciliation:

`90f93904c2fd9969559fa3bfee9e9b94cf7820ab`

Its first parent is audit/live main `8d067644...`; its second parent is previously accepted B04 docs head `ee0007d...`. The tree is based on live main and overlays only the eight B04 Student/workflow/roadmap files, leaving API/tests/audit/Legacy Content from main intact.

## Audit Findings

| ID | Severity | Area | Problem | Evidence / Solution | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route-based navigation | BrowserRouter + route foundation | FIXED / B01 |
| `UX-IA-102` | P1 | Student shell | authenticated Student was one aggregate surface | stable shell + destination routing | FIXED / B02 |
| `UX-IA-104` | P1 | Learn | subject/lesson state was local component navigation | real route hierarchy | FIXED / B03 |
| `UX-IA-105` | P1 | Reader | Reader embedded inside curriculum browser | focused Reader screen | FIXED / B03 |
| `UX-IA-106` | P1 | Practice | catalog/detail/attempt/result shared dashboard-like state | routed Practice hierarchy | FIXED / B04, final resync verifying |
| `UX-COPY-103` | P1 | Assessment | implementation/version language exposed to Student | learner-facing copy | FIXED / B04 |
| `UX-A11Y-102` | P2 | Assessment | focused attempt competed with global chrome / completion orientation | focused shell + result scroll/focus | FIXED / B04 |
| `FPA-002` | P1 | Assessment authz | abandoned-session authorization omission | independent server repair + PostgreSQL/Chromium proof | FIXED / MERGED |
| `FPA-013` | P2 | Reader a11y | active search match does not move DOM focus | audit evidence | OPEN |
| `UX-COPY-101` | P1 | Downloads/Account | technical/offline/device copy and fragmented states remain | UX-B05 | OPEN |
| `UX-IA-103` | P1 | Admin | Admin product/IA needs dedicated rebuild | Super Admin Product Rebuild workstream | DELEGATED / WAIT FOR ADR |
| `STUDENT-016I` | P1 | Offline/PWA | true cold-start offline Reader not closed | resume after UX closure | PAUSED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | separate live verification | NOT YET VERIFIED |

## Changes Made — UX Refoundation

### UX-B00 — DONE / VERIFIED / MERGED

PR #42, final head `203882a934dfcb68df4a1e1e4f972583317cabf1`, **15/15 SUCCESS**.

### UX-B01 — DONE / VERIFIED / MERGED

PR #43, final head `781e70eb31a48b76e50a1bad490f7aa947d2d7ce`, **20/20 SUCCESS**.

### UX-B02 — DONE / VERIFIED / MERGED

PR #44, final head `b956248418303618120d02cda562bf179cd7071b`, **20/20 SUCCESS**, merge `ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`.

### UX-B03 — DONE / VERIFIED / MERGED

PR #46, accepted exact head `42bf4e28b448ee27dff628c43e6db8ce564db805`, **21/21 SUCCESS**, merge `56ee51ab0d5669b4a38f9efec991ea79971d3503`.

### UX-B04 — implementation complete / final synchronized CI pending

PR #47 replaces the old Assessment card-grid/embedded workspace with routed library/detail/focused attempt/result composition.

Before the latest audit-main resync, docs head:

`ee0007d553cd6b351b263a6fc86e4a3333288e9f`

passed **22/22 triggered workflows**. Key runs:

- B04 `34717052253` — SUCCESS
- Stage14 `34717052270` — SUCCESS
- Stage15 `34717052276` — SUCCESS
- Stage16 `34717052304` — SUCCESS
- B03 `34717052258` — SUCCESS
- B02 `34717052244` — SUCCESS
- B01 `34717052303` — SUCCESS
- Rebuild `34717052226` — SUCCESS
- Stage9 Content Import `34717052290` — SUCCESS

Final B04 Visual QA was inspected manually on phone and desktop for Library, Quiz Detail, Attempt and Result. Findings discovered through visual inspection—not merely DOM tests—were fixed before acceptance: duplicate Practice chrome, duplicated online status, mobile bottom-nav clearance, inappropriate focused skip-link visibility, and completion retaining the previous question scroll position.

Because live main moved afterward for the audit/FPA-002 work, B04 was resynchronized again. The newly synchronized exact head must pass its own complete triggered workflow matrix before merge; earlier green evidence is historical evidence only.

## Tests & Verification Policy

For every final candidate:

- lint;
- strict typecheck;
- unit tests;
- production builds;
- clean PostgreSQL migrations/contracts where triggered;
- real Chromium flows;
- responsive/no-overflow evidence;
- Visual QA for changed Student product surfaces;
- complete exact-head triggered GitHub Actions matrix.

A green build alone is not product acceptance.

## B05 scope after B04 merge

UX-B05 owns:

- Student Downloads;
- Student Account;
- learner-facing copy closure;
- loading / empty / error / offline / reconnect states;
- mobile/touch ergonomics;
- RTL and accessibility polish;
- consistency with the B01–B04 Student design foundation.

B05 must **not** implement `STUDENT-016I`, change signed offline authority/integrity contracts, or begin Admin redesign.

## Admin governance after B05

After B05 is accepted and merged:

1. record Student Refoundation core B01–B05 complete;
2. stop before legacy B06–B14;
3. wait for the dedicated Super Admin Product Rebuild Architecture Decision;
4. preserve shared brand/UI foundations and backend contracts for that stream;
5. when the Admin rebuild is integrated, resynchronize the UX roadmap and execute shared final closure work: cross-product cleanup, responsive/RTL/accessibility closure, visual/regression/refoundation closure.

## Remaining Work

- finish exact-head CI for the synchronized B04 head, merge PR #47, verify live main;
- complete and merge UX-B05;
- `FPA-013` Reader focus finding remains open and should be included in the appropriate accessibility closure unless fixed earlier by evidence;
- Admin B06–B14: **do not start here**;
- after Admin integration: shared cleanup/a11y/visual closure;
- resume normal roadmap at `STUDENT-016I` only after UX refoundation closure;
- `AI-012..AI-019` live provider readiness remains `NOT YET VERIFIED`;
- Stage28 Production Cutover is not complete.
