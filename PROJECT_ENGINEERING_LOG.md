# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture, audit findings, decisions, changes, verification and remaining work. Code/migrations + executable CI evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-10 — Stage13F canonical/integrated; Stage14 CLOSED / VERIFIED; Stage15 CLOSED / VERIFIED; Stage16 next by sequence.**

Historical detailed logs remain permanently available in Git history. This file is intentionally consolidated around current executable truth.

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بواجهتي Student وSuper Admin فوق Fastify/PostgreSQL، مع مسار محتوى/وسائط/OCR وAI/Question Bank/Quiz Builder. Browser surfaces are UX/presentation; durable auth, entitlement, curriculum, publication and assessment state remain server/PostgreSQL authority.

Runtime surfaces:

- `apps/student-web` — Student product.
- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify/TypeScript API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/*` — shared primitives.

Operating model:

- **Track A**: API/Admin/DB/AI/Question Bank/Quiz Builder and Stage13G follow-on.
- **Track B**: Student Product on `parallel/stage14-student-product`.
- Issue #16 is the cross-track execution ledger.
- `main` is the verified shared-contract handoff point.
- No duplicate durable authority is allowed because another UI is missing.
- Production deployment/cutover remains future-only.

## 2. Architecture

```text
Student Web ─┐
             ├── Fastify API ── PostgreSQL
Admin Web ───┘       │
                     ├── Auth / Activation / Access
                     ├── Curriculum / Lesson publication
                     ├── Source / Media / OCR
                     ├── Stage11 typed AI contracts
                     ├── Stage12 durable AI execution
                     ├── Stage13E human AI review
                     ├── Stage13F Question Bank revisions
                     ├── Stage13F immutable Quiz snapshots
                     └── Stage15 durable Student assessment runtime
```

Stable rules:

- Browser is not canonical business state.
- Auth/devices/entitlements are server-owned.
- Full Code = 6 digits; Class Code = 7 digits.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- `media ready != published`.
- Student content requires publication time to have arrived: `published_at <= now()`.
- raw/provider AI output never becomes Student authority.
- Stage13E approval is import eligibility, not Question Bank publication.
- published Question Bank revisions and published quiz snapshots are immutable historical authority.
- Student assessment consumes published immutable quiz snapshots only.
- answer keys/scoring/finalization remain server-private/canonical until product policy permits result feedback.

## 3. Verified Product Flows

### Content / Reader

```text
Student session + bound device
→ active entitlement
→ entitled Curriculum
→ active/published Lesson whose publish time has arrived
→ published Lesson asset
→ ready media
→ approved/not_required OCR where available
→ protected Reader media/text/search/TTS UX
```

Every protected media request rechecks Student authorization/publication and validates size/checksum.

### Reviewed AI → Question Bank → Quiz

```text
Stage11 typed generation
→ Stage12 durable execution
→ Stage13E human approve
→ Stage13F import as Draft
→ Question Bank Review → Published immutable revision
→ Quiz Builder selects published revision
→ immutable quiz-version delivery snapshot
→ Quiz Review → Published
→ Stage15 Student assessment consumption
```

### Stage15 runtime — VERIFIED

```text
Student session/device
→ entitlement + published quiz/lesson checks
→ immutable quiz version/model
→ create/resume practice_session
→ freeze question/option presentation order
→ safe payload without answer key
→ server answer persistence
→ Practice: reveal feedback after answer and lock that answer
   Test: withhold correctness until finalize; allow edits before finalize
→ idempotent server finalization/scoring
→ durable quiz_attempt history
```

## 4. Stage Ledger

| Stage / Area | Classification | State |
|---|---|---|
| 1–10 + OCR | KEEP/EVOLVE | VERIFIED |
| 11 AI Contracts | provider-neutral authority | VERIFIED |
| 12 Durable AI Execution | worker/runtime authority | VERIFIED backend/runtime |
| 13A–E | canonical Admin/backend foundations | VERIFIED / CLOSED |
| 13F Question Bank / Quiz Builder | canonical authoring + immutable delivery | VERIFIED / CLOSED / PROMOTED |
| 13G Remaining Admin | incremental completion | Track A follow-on |
| 14 Student Product | learning product foundation | **CLOSED / VERIFIED** |
| 15 Practice / Assessment | durable Student assessment engine | **CLOSED / VERIFIED** |
| 16 Offline / PWA | next Student stage | NOT YET STARTED |
| 17–25 | later product/hardening | NOT YET VERIFIED by sequence |
| 26–29 | release/deployment | FUTURE |

## 5. Architecture Decisions

Historical decisions remain in Git history. Current relevant decisions:

- **AD-148** — Question Bank uses stable items + immutable revisions; delivery rows are not reusable authoring authority.
- **AD-151** — quiz versions materialize exact published Question Bank revision IDs as immutable delivery snapshots.
- **AD-152** — direct questions are supported; Student direct-answer persistence/scoring belongs to Stage15.
- **AD-156** — Review/Published quiz snapshots freeze structural mutation.
- **AD-158** — parallel Track A/B execution coordinates through Issue #16 and verified `main` contracts.
- **AD-159** — Student Reader consumes only server-authorized published assets backed by ready media; raw storage keys/non-approved OCR remain private.
- **AD-160** — transient network loss may preserve in-session context but never claims durable offline authority.
- **AD-162** — canonical Stage13F main was integrated through a real two-parent merge; authority/history was not duplicated.
- **AD-163** — Stage15 reuses `practice_sessions`, `practice_session_questions`, `practice_session_options`, `practice_answers`, `quiz_attempts`; a second attempt engine is forbidden.
- **AD-164** — Admin Question Bank/Quiz HTTP and `QuizBuilderService.detail()` are not Student delivery contracts because they expose answer/admin data.
- **AD-165** — Student assessment uses a purpose-built safe read/write model with server scoring/finalization.
- **AD-166** — Practice and Test share one durable engine but differ in feedback policy: Practice may reveal after answer; Test withholds until finalize.
- **AD-167** — random version/question/option presentation is chosen once and persisted; resume never re-randomizes.
- **AD-168** — Student Reader/Assessment direct paths use the same publication-time rule as Curriculum: non-null is insufficient; `published_at <= now()` is required.
- **AD-169** — 404 during active assessment access means the assessment resource is no longer available; Student UI exits stale workspace/reloads catalog rather than misclassifying it as auth logout.

## 6. Audit Findings

| ID | Sev | Area | Problem / Evidence | Impact | Solution | Status |
|---|---:|---|---|---|---|---|
| `STUDENT-014-API-001` | P1 | Curriculum | no Student entitlement-safe Curriculum read contract | unsafe canonical browsing gap | authenticated server-filtered Student Curriculum API | **FIXED + VERIFIED** |
| `STUDENT-014-READER-001` | P1 | Reader | publication/media/OCR authority not exposed safely | storage/authorization/content trust gap | protected Reader + media reauth/integrity + safe OCR | **FIXED + VERIFIED** |
| `STUDENT-014-UX-002` | P2 | UX | post-login hierarchy was account/security-first | weak learning hierarchy | study-first shell | **FIXED + VERIFIED** |
| `STUDENT-014-A11Y-003` | P2 | A11y | weak focus indicator | keyboard visibility risk | 3px teal-700 focus ring | **FIXED + VERIFIED** |
| `STUDENT-014-QA-004` | P2 | QA | shared Reader API lacked full API regression | hidden drift risk | dedicated API regression workflow | **FIXED + VERIFIED** |
| `STUDENT-015-QB-001` | P1 | Dependency | Stage15 required canonical Stage13F authority | duplicate/fake assessment risk | integrate verified main authority | **RESOLVED + VERIFIED** |
| `STUDENT-015-ASSESSMENT-001` | P1 | Assessment API | only Admin-facing quiz detail existed and exposed answer/audit authority | Student delivery would leak answers/admin metadata | dedicated Student-safe service/routes over immutable snapshots | **FIXED + VERIFIED** |
| `STUDENT-015-DIRECT-003` | P1 | Persistence | original `practice_answers` could not represent direct text answers | direct questions unusable safely | migration `0023` extends existing runtime rather than adding a second store | **FIXED + VERIFIED** |
| `STUDENT-015-PUBLISH-002` | P1 | Publication | Reader/Assessment direct paths accepted future-scheduled lessons when publication was merely non-null | early content/assessment exposure | enforce `published_at <= now()` + dedicated regression | **FIXED + VERIFIED** |
| `STUDENT-015-ACCESS-004` | P1 | Access/UX | backend 404 after entitlement loss could leave stale assessment workspace on reconnect | stale inaccessible assessment remained visible | exit workspace, show unavailable message, reload permitted catalog | **FIXED + VERIFIED** |
| `STUDENT-015-UX-003` | P2 | UX | Practice/Test needed clear product policy inside learning-first shell | confusing assessment mental model | Curriculum → Assessment → Access hierarchy and explicit policy copy | **FIXED + VERIFIED** |
| `STUDENT-015-QA-005` | P2 | QA | full-suite added selector ambiguity and stale-locator race | flaky integration evidence | scope selectors and re-resolve DOM after React model-selection rerender | **FIXED + VERIFIED** |
| `AI-012-019` | P2 | Live AI | live provider benchmark/routes/credentials/bootstrap not live-proven | production generation path unverified | future explicit runtime evidence | **OPEN / NOT YET VERIFIED** |

No open P0/P1 Student Stage14/15 implementation blocker remains.

## 7. Changes Made — Stage15

Backend/runtime:

- added `0023_student_assessment_runtime.sql` as the minimal existing-engine extension;
- implemented Student assessment service/routes;
- added entitlement/publication filtering and active-session rechecks;
- persisted version/question/option presentation decisions;
- implemented Practice/Test feedback policies;
- implemented direct/choice server scoring, finalization and attempt history;
- aligned Reader and Assessment future-publication checks.

Student Web:

- added typed Assessment API client/DTOs;
- added assessment catalog/filter/version selection;
- added Practice/Test workspace, feedback/results/history/resume/restart;
- added offline write blocking + reconnect refresh;
- fixed access-loss reconnect to remove stale workspace;
- placed Assessment after Curriculum and before Access;
- kept RTL/mobile-first responsive behavior.

QA:

- added assessment API unit contracts;
- added PostgreSQL assessment acceptance;
- added future-publication regression;
- added real Chromium assessment fixture/spec using canonical QuestionBankService + QuizBuilderService publication lifecycle;
- fixed selector ambiguity/stale-locator races uncovered only by the full suite;
- added exact same-head closure verification across API, Student and Assessment workflows.

## 8. Tests & Verification

### Stage14 closure runtime

`ac55f1435d232cadff334816407f1182125dda90`

- Student Product `34420993805` — SUCCESS.
- Student API Regression `34420993840` — SUCCESS.
- Student `12/12`, API `46/46`, migrations through `0018`, Chromium `2/2`.

### Stage13F→Student integration runtime

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

- Student API Regression `34422553459` — SUCCESS.
- Student Product `34422553405` — SUCCESS.
- migrations `0001`→`0022`, Student Curriculum/Reader and Chromium PASS.

### Stage15 closure runtime

Exact runtime HEAD:

`9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`

Same-head evidence:

- **API Regression `34427900263` — SUCCESS**
  - Biome **104 files**;
  - strict typecheck PASS;
  - unit **46/46 PASS**;
  - build PASS.
- **Stage15 Assessment `34427900257` — SUCCESS**
  - clean migrations `0001`→`0023` PASS;
  - assessment + future-publication PostgreSQL integration PASS;
  - Chromium **1/1 PASS** in 5.8s.
- **Student Product `34427900209` — SUCCESS**
  - lint/typecheck PASS;
  - Vitest **15/15 PASS**;
  - production build PASS;
  - clean migrations `0001`→`0023` PASS;
  - Curriculum + Reader integration **2/2 PASS**;
  - full Chromium **3/3 PASS** in 10.4s.

Production bundle:

- JS **200.16 kB raw / 60.78 kB gzip**;
- CSS **30.84 kB raw / 5.71 kB gzip**;
- index **0.67 kB raw / 0.40 kB gzip**.

Browser jobs use `NODE_ENV=test`; larger browser-job bundle sizes are not production evidence.

## 9. Known Issues / Remaining Work

- Stage16 offline/PWA authority is **NOT YET VERIFIED** and must not be inferred from transient offline UI already present.
- Stage17 Notes/Favorites/Needs Review remains later by sequence.
- Stage18 Notifications remains later.
- Stage19 Progress/Statistics/Achievements remains later.
- live AI provider runtime `AI-012-019` remains NOT YET VERIFIED outside the Student Stage15 closure.
- production deployment/cutover remains future-only.

## 10. Exact Next Action

1. re-read Stage16 source-of-truth and latest Issue #16;
2. inspect actual service-worker/IndexedDB/sync/offline code before changes;
3. classify Stage16 pieces KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
4. define entitlement-aware offline data/security boundary;
5. implement incrementally with SW/IndexedDB/sync tests and real browser evidence;
6. keep deployment deferred.
