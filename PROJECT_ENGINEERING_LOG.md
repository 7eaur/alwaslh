# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX-B03 verified/merged; UX-B04 Student Practice / Assessment active from refreshed live main.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an **installed educational app experience**, not a dashboard. Current refoundation flow:

`Activation/Login → Home → Learn → Subject → Lesson/Reader`

with separate `Practice`, `Downloads`, and `Account` destinations. B04 now owns `Practice → Quiz choice → Focused Attempt → Result/Review`.

The current visual UI is evidence for behavior and product contracts only. From B04 onward the implementing engineer/designer owns final ship quality and may rebuild visual composition when needed while preserving approved identity and domain authority.

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

Stable destinations:

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

A route identifier is not trusted as authorization. Subject/lesson context is first resolved from the canonical server-filtered curriculum before Reader access.

### Student Practice / Assessment — B04 active

Target route ownership:

- `/app/practice` — Practice library and recent attempts;
- `/app/practice/quizzes/:quizId` — one quiz detail, learner-facing question-set choice and Practice/Test mode choice;
- `/app/practice/attempts/:sessionId` — focused in-progress attempt or completed result/review.

Navigation state is URL state. `sessionId` is not trusted as scoring authority: attempt state is restored through `/v1/student/assessment-sessions/:sessionId` and all answer/finalize behavior remains API-owned.

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
- **AD-217..223** — B02 Student shell/navigation, adaptive composition, connectivity state, and access-state reuse remain binding.
- **AD-224..229** — B03 URL-owned learning hierarchy, catalog-authorized deep links, focused Reader, parity-preserving copy cleanup, no cold-offline scope expansion, and legacy curriculum removal remain binding.

B04 decisions:

- **AD-230 — existing visuals are not a preservation contract.** Starting B04, current screens are functional evidence only; layout/composition may be rebuilt to product quality while approved identity and product contracts remain fixed.
- **AD-231 — Practice is a route hierarchy, not one dashboard surface.** Catalog, quiz decision, attempt and result/review have separate responsibilities and URLs.
- **AD-232 — explicit question-set choice is retained but humanized.** Stage15 proves version selection is a real behavior contract; Student UI presents it as “مجموعة الأسئلة” and removes server/version implementation language.
- **AD-233 — active Assessment is a focused learning task.** Global Student navigation is visually suppressed while solving/reviewing an attempt; the attempt uses a constrained single-column composition with visible progress and strong answer ergonomics.
- **AD-234 — Practice/Test feedback timing is preserved.** Practice shows immediate answer feedback; Test defers feedback until server finalize.
- **AD-235 — attempt deep links restore from API authority.** React `activeAssessment` is removed as navigation authority; refresh/direct attempt routes call the canonical session endpoint.
- **AD-236 — no decorative performance debt.** B04 uses existing React/CSS/router primitives and design tokens; no animation library, large asset, extra polling system or new network endpoint is introduced.

## Design Research / Tool Evidence

- repository skill `alwaslh-product-engineering` remains binding source-backed product guidance;
- Product Design installed skill states full Product Design workflows are not supported in standard chat mode, so no unsupported workflow was claimed;
- Mobbin flow research was attempted but connector returned a paid-plan requirement; no Mobbin result was treated as evidence;
- Figma FigJam flow `Alwaslh Student Practice Flow — UX-B04`, diagram ID `48e1f36b-f638-45d5-8b79-aa03ea0c2eaa`, was created to validate Practice library → quiz choice → focused Practice/Test → result/review → leave/resume structure;
- external educational products were used only as pattern references for one-task-at-a-time focus, progress visibility and feedback timing; Alwaslh contracts remain source of truth.

## Audit Findings

| ID | Severity | Area | Problem | Solution / Evidence | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route-based navigation | BrowserRouter + route foundation | FIXED / B01 VERIFIED+MERGED |
| `UX-IA-102` | P1 | Student shell | authenticated Student was one aggregate surface | stable shell + destination-owned mounting | FIXED / B02 VERIFIED+MERGED |
| `UX-IA-104` | P1 | Learn | subject/lesson navigation lived in component state | real Learn/Subject/Lesson routes | FIXED / B03 VERIFIED+MERGED |
| `UX-IA-105` | P1 | Reader | Reader embedded inside curriculum surface | dedicated focused Reader shell | FIXED / B03 VERIFIED+MERGED |
| `UX-IA-106` | P1 | Practice | quiz catalog, version choice, attempt, result and history shared one state-driven surface | routed library/detail/attempt hierarchy | IMPLEMENTED / VERIFYING B04 |
| `UX-VIS-101` | P1 | Product quality | legacy UI risked being treated as required visual baseline | product-quality ownership gate in roadmap §2.1 | ACTIVE / BINDING B04+ |
| `UX-COPY-103` | P1 | Assessment | Student saw server/version/roadmap language | learner-facing question-set/offline/result copy | IMPLEMENTED / VERIFYING B04 |
| `UX-A11Y-102` | P2 | Assessment | active attempt competed with global navigation | focused attempt composition + route semantics | IMPLEMENTED / VERIFYING B04 |
| `UX-COPY-101` | P1 | Student offline/account | technical offline/device copy remains elsewhere | B05 | OPEN / PARTIAL |
| `UX-IA-103` | P1 | Admin | flat/mixed Admin workspace | B06+ | OPEN |
| `STUDENT-016I` | P1 | Offline/PWA | true cold-start offline Reader not closed | resume only after B17 | PAUSED / NOT TOUCHED |
| `AI-012..AI-019` | P2 | AI | live provider readiness not proven | separate live verification | NOT YET VERIFIED |

## Changes Made — 2026-09-12

### UX-B00 — DONE / VERIFIED / MERGED

PR #42 final head `203882a934dfcb68df4a1e1e4f972583317cabf1`; **15/15 SUCCESS**; merge commit `3997ac94b47100bc1557b7622ae3c6d47058d25d`.

### UX-B01 — DONE / VERIFIED / MERGED

PR #43 final exact head `781e70eb31a48b76e50a1bad490f7aa947d2d7ce`; **20/20 SUCCESS**; merge/live main `9866e3b3c332d4c83b15c6e20b4cfd2972008f1b`.

### UX-B02 — DONE / VERIFIED / MERGED

PR #44 final head `b956248418303618120d02cda562bf179cd7071b`; **20/20 SUCCESS**; merge `ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`.

### UX-B03 — DONE / VERIFIED / MERGED

PR #46:

- final head `42bf4e28b448ee27dff628c43e6db8ce564db805`;
- exact-head workflows **21/21 SUCCESS**;
- direct B03 gate `34713062100` — SUCCESS;
- Stage14 `34713062118` — SUCCESS;
- Stage15 `34713062147` — SUCCESS;
- Stage16 `34713062156` — SUCCESS;
- B02 regression `34713062114` — SUCCESS;
- Admin Product `34713062178` — SUCCESS;
- Admin Operations `34713062137` — SUCCESS;
- Rebuild `34713062125` — SUCCESS after rerunning the one transient failed browser job only; rerun job `103606082888` — SUCCESS;
- merge/live main `56ee51ab0d5669b4a38f9efec991ea79971d3503`.

### UX-B04 — Student Practice / Assessment

Branch: `ux/student-practice`

Base: `main@56ee51ab0d5669b4a38f9efec991ea79971d3503`.

Implemented before CI acceptance:

- roadmap §2.1 product-quality visual ownership gate;
- route-driven `StudentAssessmentExperience` for Practice library / quiz detail / attempt;
- direct session restoration from API on attempt URLs;
- learner-facing “مجموعة الأسئلة” instead of implementation-oriented version/server copy;
- focused Practice/Test attempt layout with progress, touch-friendly choices and quiet chrome;
- dedicated result/review composition;
- Practice immediate feedback and Test deferred feedback preserved;
- CSS rebuilt from list/detail/task composition rather than two-column card grid;
- focused attempt/review suppresses Student global navigation through existing `:has()` shell architecture;
- Stage15 E2E migrated to new routes, direct completed-attempt reload, same-session resume, offline/reconnect and unavailable-session recovery;
- `.github/workflows/ux-b04-student-practice.yml` direct B04 gate added.

Explicitly unchanged:

- Assessment API/database/scoring/finalization/publication rules;
- Stage16 offline/PWA capability;
- Downloads/Account — B05;
- Admin — B06+.

## Tests & Verification

### B03 final acceptance

Final PR #46 head `42bf4e28b448ee27dff628c43e6db8ce564db805`: **21/21 SUCCESS**, then merged as `56ee51ab0d5669b4a38f9efec991ea79971d3503`.

### B04 required acceptance

Pending exact-head CI:

- Student lint/typecheck/unit/build;
- clean API typecheck/build/migrations;
- Practice → quiz detail → attempt in real Chromium;
- explicit question-set binding;
- Practice immediate feedback / Test deferred feedback;
- direct completed-attempt refresh;
- server-owned finalize/result;
- same-session resume;
- offline write block + reconnect refresh;
- unavailable-session recovery;
- focused navigation suppression;
- phone/tablet/desktop no horizontal overflow;
- Stage14/15/16 and B02/B03 regressions;
- Rebuild regression;
- full path-triggered exact-head matrix.

Current B04 state: **IMPLEMENTED / VERIFICATION PENDING**.

Local container checkout remains unavailable because this execution environment cannot resolve `github.com`; GitHub Actions is the executable verification source.

## Known Issues / Remaining Work

- verify B04 exact-head CI and fix real regressions at root cause;
- Downloads/Account/offline technical-copy cleanup — B05;
- Admin refoundation — B06+;
- cross-product cleanup — B15;
- responsive/RTL/accessibility closure — B16;
- visual/regression/refoundation closure — B17;
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`;
- Stage28 Production Cutover — not complete.

Normal roadmap remains paused until UX-B17. Exact return sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`.