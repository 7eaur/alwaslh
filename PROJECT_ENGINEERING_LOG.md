# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Current consolidated engineering truth. Code, PostgreSQL migrations, executable CI and live runtime evidence outrank prose. Historical detail remains in Git history, merged PRs, Issue #16 and specialized workstream documents.

Last consolidated: **2026-09-12 — UX-B02 verified/merged; UX-B03 Student Learning Hierarchy and Reader Shell active from refreshed live main.**

## Project Understanding

الوسيلة الذكية منصة تعليمية عربية تتكون من Student Web/PWA + Super Admin Web فوق Fastify/PostgreSQL.

Student is an **installed educational app experience**. Current target learning flow is now implemented incrementally as:

`Activation/Login → Home → Learn → Subject → Lesson/Reader`

with separate `Practice`, `Downloads`, and `Account` destinations.

B03 owns the Learn/Subject/Reader hierarchy only. Assessment remains B04, Downloads/Account cleanup B05, Admin B06+.

## Architecture

- `apps/student-web` — Student Web/PWA.
- `apps/admin-web` — Super Admin.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical brand/design tokens.
- `packages/ui` — framework-neutral shared presentation semantics/styles from B01.
- `apps/*/src/presentation-foundation.tsx` — thin app-local React presentation adapters.

Stable authority contracts:

- browser is not canonical business authority;
- API + PostgreSQL own canonical state;
- Auth/Authorization and Entitlements remain server-owned;
- `media ready != published`;
- protected Reader/media remain publication + entitlement controlled;
- AI output never auto-publishes Student content/questions;
- human review remains mandatory;
- assessment scoring/finalization remains server-owned;
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

### Student learning hierarchy — B03

Binding route ownership:

- `/app/learn` — choose an entitled subject, grouped by class context;
- `/app/learn/subjects/:subjectId` — one subject curriculum/lesson sequence;
- `/app/learn/lessons/:lessonId` — focused Reader.

A route identifier is not trusted as authorization. Subject/lesson context is first resolved from `/v1/student/curriculum`, which is already entitlement/publication filtered by server authority. Only then does the Reader call `/v1/student/lessons/:lessonId/reader`.

The Reader suppresses global Student navigation while active, preserves a clear subject back target, and keeps a controlled reading width across phone/tablet/desktop.

### Admin target hierarchy

`Overview → Curriculum → Content/Ingestion/OCR → AI Jobs/Human Review → Question Bank/Quizzes → Students/Access → Operations/Audit`

Admin migration starts at B06 and is untouched by B03.

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
- **AD-204** — Reader and active Assessment become focused screens in B03/B04.
- **AD-211** — BrowserRouter is the shared routing base.
- **AD-213** — shared UI package remains framework-neutral and owns no domain authority.
- **AD-214** — route changes focus the labeled route-content region.
- **AD-217..223** — B02 Student shell/navigation, adaptive composition, connectivity state, and access-state reuse remain binding.

B03 decisions:

- **AD-224 — Learn selection state becomes URL state.** Subject and lesson selection are real browser routes, not `selectedSubjectId` / `selectedLesson` component state.
- **AD-225 — authorized catalog resolves deep links.** A direct subject/lesson route must exist in the canonical Student curriculum response before its page can render; URL knowledge alone grants nothing.
- **AD-226 — Reader is a focused product screen.** Bottom/rail navigation is suppressed during reading; only learning context, connectivity status, back target and reader controls remain.
- **AD-227 — Reader capability parity is preserved without legacy copy.** Protected media, retry, speech, search, loading/error/session behavior stay functional while Student-facing publication/review/MIME implementation language is removed.
- **AD-228 — B03 does not implement cold-start offline Reader.** Offline Reader states remain honest and direct students to Downloads; `STUDENT-016I` remains paused until UX-B17 closes.
- **AD-229 — legacy giant curriculum composition is removed.** The old `student-curriculum.tsx` local-state browser/Reader surface is deleted rather than retained beneath new routes.

## Audit Findings

| ID | Severity | Area | Problem | Solution / Evidence | Status |
|---|---:|---|---|---|
| `UX-IA-101` | P1 | Routing | apps lacked route-based navigation | BrowserRouter + route foundation | FIXED / B01 VERIFIED+MERGED |
| `UX-IA-102` | P1 | Student shell | authenticated Student was one aggregate surface | B02 stable shell + destination-owned mounting | FIXED / B02 VERIFIED+MERGED |
| `UX-IA-104` | P1 | Learn | subject/lesson navigation lived in component state | real Learn/Subject/Lesson routes | IMPLEMENTED / VERIFYING B03 |
| `UX-IA-105` | P1 | Reader | Reader embedded inside curriculum surface | dedicated focused Reader shell | IMPLEMENTED / VERIFYING B03 |
| `UX-COPY-102` | P1 | Reader | Student saw publication/review/MIME internals | learner-facing Reader copy | IMPLEMENTED / VERIFYING B03 |
| `UX-A11Y-101` | P2 | Student navigation | state-only navigation weakened history/focus | semantic links + route focus/history | B02 VERIFIED; B03 descendants VERIFYING |
| `UX-RESP-102` | P1 | Student | no installed-app adaptive navigation | phone bottom nav + tablet/desktop adaptation | VERIFIED B02 |
| `UX-PERF-101` | P2 | Student access | navigation could refetch loaded entitlements | reuse access state, direct-entry load retained | FIXED / VERIFIED B02 |
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

PR #44:

- final head `b956248418303618120d02cda562bf179cd7071b`;
- exact-head workflows **20/20 SUCCESS**;
- B02 run `34711941779` — SUCCESS;
- Stage14 `34711941781` — SUCCESS after rerunning one transient timed-out Chromium job only;
- Stage15 `34711941813` — SUCCESS;
- Stage16 `34711941769` — SUCCESS;
- Admin Product `34711941728` — SUCCESS;
- Admin Operations `34711941761` — SUCCESS;
- Rebuild `34711941790` — SUCCESS;
- merge/live main `ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`.

### UX-B03 — Student Learning Hierarchy and Reader Shell

Branch: `ux/student-learning`

Base: `main@ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`.

Implemented before CI acceptance:

- `student-learning-model.ts` — curriculum-derived route/view lookup helpers;
- `student-learning-model.test.ts` — unit coverage for authorized subject/lesson resolution;
- `student-learning.tsx` — Learn landing + Subject page + lesson-route composition;
- `student-reader.tsx` — focused Reader shell preserving protected media/search/speech/retry/session behavior;
- `student-learning.css` — hierarchy/Reader responsive layouts;
- `student-access.tsx` — mounts learning hierarchy by URL and suppresses global nav during Reader;
- deleted legacy `student-curriculum.tsx` giant local-state surface;
- updated Reader and activation Playwright contracts for real semantic links/routes;
- added `.github/workflows/ux-b03-student-learning.yml` direct B03 quality + Chromium gate.

Explicitly unchanged:

- Reader backend/API/publication/entitlement contracts;
- Stage16 signed offline authorization/materialization/Service Worker authority;
- Assessment internals/routes — B04;
- Downloads/Account cleanup — B05;
- Admin — B06+.

## Tests & Verification

### B02 final acceptance

Final PR #44 head `b956248418303618120d02cda562bf179cd7071b`: **20/20 SUCCESS**, then merged as `ced57cb4dd45daedbe9a95c4897d1b073ec9e4e9`.

### B03 required acceptance

Pending exact-head CI:

- Student lint/typecheck/unit/build;
- B03 model unit tests;
- clean API build/migrations;
- real Chromium Learn → Subject → Reader hierarchy;
- authorized direct Reader deep link;
- protected media response/security parity;
- search/speech/error/offline honesty;
- Reader global-nav suppression;
- browser route focus/back/history;
- phone/tablet/desktop overflow checks;
- Stage14/15/16 + Rebuild regressions;
- full path-triggered workflow matrix.

Current B03 state: **IMPLEMENTED / VERIFICATION PENDING**.

Local container checkout is unavailable because this execution environment cannot resolve `github.com`; GitHub Actions is the executable verification source.

Manual screenshot/art-direction closure remains assigned to B16/B17; B03 requires executable responsive/browser evidence now.

## Known Issues / Remaining Work

- verify B03 exact-head CI and fix real regressions at root cause;
- remove any obsolete legacy curriculum CSS during final cleanup if no longer referenced — B15 unless required earlier by evidence;
- Assessment focused routes/shell — B04;
- Downloads/Account/offline technical-copy cleanup — B05;
- Admin refoundation — B06+;
- `AI-012..AI-019` live provider readiness — `NOT YET VERIFIED`;
- Stage28 Production Cutover — not complete.

Normal roadmap remains paused until UX-B17. Exact return sequence remains:

`STUDENT-016I → STUDENT-016R → STUDENT-016S → conditional STUDENT-016O → STUDENT-016G → Stage17`
