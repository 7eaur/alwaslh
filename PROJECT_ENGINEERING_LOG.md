# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX-B04 Student Practice / Assessment code + visual acceptance complete; final documentation-head CI pending before merge.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an **installed educational app experience**, not a dashboard. Current refoundation flow:

`Activation/Login → Home → Learn → Subject → Lesson/Reader`

with separate `Practice`, `Downloads`, and `Account` destinations. B04 owns:

`Practice Library → Quiz Decision → Focused Attempt → Result/Review`.

The legacy visual UI is evidence for behavior and product contracts only. From B04 onward the implementing engineer/designer owns final ship quality and may rebuild visual composition when needed while preserving approved identity and domain authority.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/design tokens.
- `packages/ui` — framework-neutral shared presentation semantics/styles.

Stable authority contracts:

- browser is not canonical business authority;
- API + PostgreSQL own canonical state;
- Auth/Authorization and Entitlements remain server-owned;
- `media ready != published`;
- protected Reader/media remain publication + entitlement controlled;
- AI output never auto-publishes Student content/questions;
- human review remains mandatory;
- Assessment scoring/finalization remains server-owned;
- published quiz/version snapshot behavior remains server-owned;
- `/v1` is never Service Worker Cache API authority;
- signed offline authorization, integrity and device/session rules remain unchanged.

## User Flows

### Student shell — B02 integrated

`Home | Learn | Practice | Downloads` + `Account`

Top-level routes:

- `/app/home`
- `/app/learn`
- `/app/practice`
- `/app/downloads`
- `/app/account`

### Student learning hierarchy — B03 integrated

- `/app/learn` — choose an entitled subject;
- `/app/learn/subjects/:subjectId` — one subject curriculum/lesson sequence;
- `/app/learn/lessons/:lessonId` — focused Reader.

### Student Practice / Assessment — B04 accepted

- `/app/practice` — Practice library, filters and recent attempts;
- `/app/practice/quizzes/:quizId` — quiz detail, learner-facing question-set choice and Practice/Test mode choice;
- `/app/practice/attempts/:sessionId` — focused in-progress attempt or completed result/review.

Navigation state is URL state. `sessionId` is never trusted as scoring authority: attempt state is restored through `/v1/student/assessment-sessions/:sessionId`, while answer/finalize/score remain API-owned.

### Admin target hierarchy

`Overview → Curriculum → Content/Ingestion/OCR → AI Jobs/Human Review → Question Bank/Quizzes → Students/Access → Operations/Audit`

Admin migration starts at B06.

## Architecture Decisions

Retained decisions:

- **AD-170** — Service Worker caches shell/static assets only; `/v1` excluded.
- **AD-175** — no password/session token/device private key in offline storage.
- **AD-185/186/188** — cold-offline authorization/integrity remains server-signed and browser-verified.
- **AD-190** — new work starts from refreshed live `main` on short-lived branches.
- **AD-194/215** — browser API authority remains same-origin `/v1`.
- **AD-195** — normal roadmap paused before `STUDENT-016I` for UX refoundation.
- **AD-202** — route/history is a product contract.
- **AD-203** — Student navigation exposes implemented capabilities only.
- **AD-204** — Reader and active Assessment are focused screens.
- **AD-211** — BrowserRouter is the shared routing base.
- **AD-213** — shared UI package remains framework-neutral and owns no domain authority.
- **AD-214** — route changes focus the labeled route-content region.
- **AD-217..223** — B02 Student shell/navigation and adaptive composition decisions remain binding.
- **AD-224..229** — B03 URL-owned learning hierarchy, catalog-authorized deep links and focused Reader remain binding.

B04 decisions:

- **AD-230 — existing visuals are not a preservation contract.** Current screens are functional evidence only; layout/composition may be rebuilt to product quality while identity and product contracts remain fixed.
- **AD-231 — Practice is a route hierarchy, not one dashboard surface.** Catalog, quiz decision, attempt and result/review own separate responsibilities and URLs.
- **AD-232 — explicit question-set choice is retained but humanized.** Stage15 proves version selection is a real behavior contract; Student UI presents it as “مجموعة الأسئلة” and removes server/version implementation language.
- **AD-233 — active Assessment is a focused learning task.** Global Student navigation is suppressed while solving/reviewing an attempt; the attempt uses a constrained task composition with visible progress and strong answer ergonomics.
- **AD-234 — Practice/Test feedback timing is preserved.** Practice shows immediate feedback; Test defers feedback until server finalize.
- **AD-235 — attempt deep links restore from API authority.** React local `activeAssessment` is removed as navigation authority.
- **AD-236 — no decorative performance debt.** B04 introduces no animation library, large visual asset, polling system or product endpoint.
- **AD-237 — focused Assessment removes redundant global skip chrome only while global navigation is itself suppressed.** The general product skip link remains elsewhere; focused attempt/review does not expose a misleading floating action.
- **AD-238 — completion is a real interaction transition.** When finalize changes the same route from active attempt to result/review, viewport resets to the result start and focus moves programmatically to the result heading so visual and assistive-technology users enter the new state coherently.

## Design Research / Tool Evidence

- repository skill `alwaslh-product-engineering` remains binding source-backed product guidance;
- Product Design full workflows are not supported in this standard chat mode, so no unsupported execution was claimed;
- Mobbin research was attempted but the connector required a paid plan; no Mobbin result was treated as evidence;
- Figma FigJam flow `Alwaslh Student Practice Flow — UX-B04`, diagram ID `48e1f36b-f638-45d5-8b79-aa03ea0c2eaa`, was created before implementation;
- external educational products were pattern references only; Alwaslh code/contracts remained source of truth.

## Audit Findings

| ID | Severity | Area | Problem | Solution / Evidence | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route-based navigation | BrowserRouter + route foundation | FIXED / B01 MERGED |
| `UX-IA-102` | P1 | Student shell | authenticated Student was one aggregate surface | stable shell + destination ownership | FIXED / B02 MERGED |
| `UX-IA-104` | P1 | Learn | subject/lesson navigation lived in component state | real Learn/Subject/Lesson routes | FIXED / B03 MERGED |
| `UX-IA-105` | P1 | Reader | Reader embedded inside curriculum surface | dedicated focused Reader | FIXED / B03 MERGED |
| `UX-IA-106` | P1 | Practice | catalog/version/attempt/result/history shared one state-driven surface | routed library/detail/attempt hierarchy | FIXED / B04 ACCEPTED |
| `UX-VIS-101` | P1 | Product quality | legacy UI risked becoming visual baseline | binding ship-quality gate | ACTIVE / BINDING B04+ |
| `UX-COPY-103` | P1 | Assessment | server/version language leaked to Student | learner-facing copy | FIXED / B04 ACCEPTED |
| `UX-A11Y-102` | P2 | Assessment | active attempt competed with global navigation / result transition | focused composition + semantic headings + result focus | FIXED / B04 ACCEPTED |
| `UX-COPY-101` | P1 | Student offline/account | technical offline/device copy remains elsewhere | B05 | OPEN / PARTIAL |
| `UX-IA-103` | P1 | Admin | flat/mixed Admin workspace | B06+ | OPEN |
| `STUDENT-016I` | P1 | Offline/PWA | true cold-start offline Reader not closed | resume only after B17 | PAUSED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | separate live verification | NOT YET VERIFIED |

## Changes Made — 2026-09-12

### UX-B00 — DONE / VERIFIED / MERGED

PR #42 final head `203882a934dfcb68df4a1e1e4f972583317cabf1`; **15/15 SUCCESS**; merge commit `3997ac94b47100bc1557b7622ae3c6d47058d25d`.

### UX-B01 — DONE / VERIFIED / MERGED

PR #43 final exact head `781e70eb31a48b76e50a1bad490f7aa947d2d7ce`; **20/20 SUCCESS**; merge `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`.

### UX-B02 — DONE / VERIFIED / MERGED

PR #44 final head `b956248418303618120d02cda562bf179cd7071b`; **20/20 SUCCESS**; merge `ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`.

### UX-B03 — DONE / VERIFIED / MERGED

PR #46 final head `42bf4e28b448ee27dff628c43e6db8ce564db805`; **21/21 SUCCESS**; merge/live main `56ee51ab0d5669b4a38f9efec991ea79971d3503`.

### UX-B04 — IMPLEMENTED / CODE+VISUAL ACCEPTED / FINAL DOCS-HEAD CI PENDING

Branch: `ux/student-practice`

PR: #47

Live-main synchronization:

- PR #48 Legacy Content moved `main` to `d113dc02212884b93fa0cd2ac8f75aae6bdb7258` during B04;
- safe merge commit `3082984ce5b4fa02bad98eb91d73d0a206342c6d` was constructed with prior B04 head + new live main as parents;
- comparison `d113dc... → 3082984...` contained only B04 files;
- comparison `597f363... → 3082984...` contained only Legacy Content files;
- `apps/api/src/server.ts`, guarded Legacy startup runtime, tests and runbooks were therefore preserved.

B04 product implementation:

- route-driven `StudentAssessmentExperience` for library / quiz detail / attempt;
- canonical API session restore on direct attempt URL;
- learner-facing question-set choice;
- Practice immediate feedback / Test deferred feedback;
- focused attempt progress and touch-friendly answer choices;
- dedicated result/review composition;
- same-session resume and reconnect refresh;
- unavailable-session recovery;
- Arabic option markers;
- duplicate Practice heading/network chrome removed;
- safe mobile clearance above fixed bottom navigation;
- attempt title and result title use real heading semantics;
- result transition resets scroll and focuses its heading;
- dedicated visual QA matrix for four states on phone and desktop.

Visual QA findings fixed during acceptance:

1. duplicate Practice heading + duplicate connectivity state;
2. mobile content clearance around fixed navigation;
3. ambiguous question-set accessible naming in browser test;
4. non-semantic attempt title;
5. direct-attempt reconnect path;
6. focused result exposing the global skip-link as a floating pill;
7. same-route result opening at the previous question scroll position.

No backend Assessment authority or Stage16 capability was changed.

## Tests & Verification

### UX-B04 accepted code head

Accepted functional/visual code head before documentation sync:

`6bef406fdc00f0c3e127e6d5b418b18a8561b28e`

Exact-head result: **22/22 SUCCESS**.

Key runs:

- `34716757907` — UX B04 Student Practice and Assessment — SUCCESS;
- `34716757865` — Stage14 Student Product — SUCCESS;
- `34716757890` — Stage15 Student Assessment — SUCCESS, including PostgreSQL contracts + real Chromium 390px;
- `34716757918` — Stage16 Student PWA — SUCCESS;
- `34716757874` — UX B03 Student Learning and Reader — SUCCESS;
- `34716757979` — UX B02 Student Shell and Navigation — SUCCESS;
- `34716757924` — UX B01 Shared Frontend Foundation — SUCCESS;
- `34716757929` — Rebuild Stage Verification — SUCCESS;
- `34716757904` — Stage 9 Content Import Verification — SUCCESS;
- all remaining Admin/AI/OCR/Media/Question Bank/combined-integration workflows on this exact head — SUCCESS.

B04 visual evidence:

- run `34716757907`;
- artifact `10305050307` (`ux-b04-visual-qa`);
- eight viewport screenshots inspected manually:
  - Library phone + desktop;
  - Quiz detail phone + desktop;
  - Active attempt phone + desktop;
  - Result/review phone + desktop.

Final visual result meets the B04 acceptance bar: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional** for the changed flow. Result phone begins from score/title after finalize; no duplicate chrome or floating skip action remains; focused attempt stays focused; RTL and density are coherent; no horizontal overflow is present.

This documentation synchronization changes the PR head. The resulting docs-synchronized head must pass its own triggered exact-head CI before merge. The `6bef406...` executable evidence remains the accepted code/visual baseline because the subsequent changes are documentation-only.

## Known Issues / Remaining Work

- final docs-head CI + PR #47 merge — current B04 closure step;
- UX-B05 Downloads/Account/offline technical-copy cleanup — **NOT STARTED until B04 merge**;
- Admin refoundation — B06+;
- cross-product cleanup — B15;
- responsive/RTL/accessibility closure — B16;
- visual/regression/refoundation closure — B17;
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`;
- Stage28 Production Cutover — not complete.

Normal roadmap remains paused until UX-B17. Exact return sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`.
