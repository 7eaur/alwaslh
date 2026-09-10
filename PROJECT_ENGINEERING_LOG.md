# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Engineering source of truth for project understanding, architecture, audit findings, decisions, changes, verification and remaining work. Code/migrations + executable CI evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last consolidated: **2026-09-10 — Stage13F is canonical in main and regression-verified on the Student branch; Stage14 CLOSED / VERIFIED; Stage15 discovery ACTIVE.**

Historical detailed logs remain permanently available in Git history. This file is intentionally consolidated around current executable truth.

## 1. Project Understanding

**الوسيلة الذكية** منصة تعليمية عربية بواجهتي Student وSuper Admin فوق Fastify/PostgreSQL، مع مسار محتوى/وسائط/OCR وAI/Question Bank/Quiz Builder. الهدف هو الحفاظ على نفس Product Outcomes مع تنفيذ أوضح وأكثر أمانًا وقابلية للصيانة.

Runtime surfaces:

- `apps/student-web` — Student Web/PWA product.
- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify/TypeScript API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/*` — shared primitives.

Current execution model:

- **Track A**: API/Admin/DB/AI/Question Bank/Quiz Builder and Stage13G follow-on.
- **Track B**: Student Product on `parallel/stage14-student-product`.
- Issue #16 is the sole cross-track execution ledger.
- `main` is the verified shared-contract handoff point.
- No track may create a duplicate durable authority because another surface is missing.
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

- Browser is presentation/session UX, not canonical durable business state.
- Auth/devices/entitlements are server-owned.
- Full Code = 6 digits; Class Code = 7 digits.
- Curriculum = Class → Subject Offering → optional Section → Lesson.
- `media ready != published`; Student Reader requires explicit published lesson asset + ready media.
- raw/provider AI output never becomes Student authority.
- Stage13E approval is import eligibility, not Question Bank publication.
- reusable Question Bank identity is separate from quiz delivery snapshots.
- published Question Bank revisions and published quiz snapshots are immutable historical authority.
- Student assessment must consume published immutable quiz snapshots only.
- Student answer keys and scoring remain server-private/canonical.

## 3. Verified Product Flows

### Content / Reader

```text
Student session + bound device
→ active entitlement
→ entitled Curriculum
→ active/published Lesson
→ published Lesson asset
→ ready media
→ approved/not_required OCR where available
→ protected Reader media/text/search/TTS capability UX
```

Every protected media request rechecks Student authorization/publication and validates size/checksum before response.

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
→ Stage15 Student consumption
```

### Stage15 target runtime

```text
Student + entitlement
→ published quiz snapshot
→ immutable version/model
→ create/resume practice_session
→ freeze question/option presentation order
→ safe question payload without answer key
→ answer persistence
→ Practice feedback policy OR Test/Model withheld feedback
→ transactional finalization
→ server scoring
→ quiz_attempt history/provenance
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
| 15 Practice / Assessment | activate/harden existing runtime persistence | **DISCOVERY ACTIVE** |
| 16 Offline / PWA | later Student stage | BLOCKED by sequence |
| 17–25 | later product/hardening | NOT YET VERIFIED by sequence |
| 26–29 | release/deployment | FUTURE |

## 5. Architecture Decisions

Historical decisions remain in Git history. Current decisions relevant to Stage14/15:

- **AD-148** — Question Bank uses stable items + immutable revisions; old delivery `questions` rows are not reusable authoring authority.
- **AD-149** — Stage13E approve is import eligibility only; Stage13F import starts Draft.
- **AD-151** — quiz versions materialize exact published Question Bank revision IDs as immutable delivery snapshots.
- **AD-152** — direct questions are supported in Question Bank + delivery snapshots; Student answer persistence/scoring belongs to Stage15.
- **AD-156** — Review/Published quiz snapshots freeze structural mutation.
- **AD-158** — parallel Track A/B execution coordinates through Issue #16 and verified `main` contracts.
- **AD-159** — Student Reader consumes only server-authorized published assets backed by ready media; raw storage keys/non-approved OCR remain private.
- **AD-160** — Stage14 network loss may preserve in-session navigation context, but never implies current media authorization or offline-learning authority.
- **AD-161** — Stage14 does not add a router without a verified deep-link/history requirement.
- **AD-162** — canonical Stage13F main is integrated to Student through a real two-parent merge; neither history nor authority is flattened/duplicated.
- **AD-163** — Stage15 reuses `practice_sessions`, `practice_session_questions`, `practice_session_options`, `practice_answers` and `quiz_attempts`; a second attempt engine is forbidden.
- **AD-164** — Admin Question Bank/Quiz HTTP and `QuizBuilderService.detail()` are not Student delivery contracts because they expose answer correctness/direct answers/Admin audit data.
- **AD-165** — Stage15 requires a purpose-built Student-safe assessment read model and server-side scoring/finalization.

## 6. Audit Findings

| ID | Sev | Area | Problem / Evidence | Impact | Solution | Status |
|---|---:|---|---|---|---|---|
| `STUDENT-014-API-001` | P1 | Curriculum | no Student entitlement-safe Curriculum read contract | browser could not safely browse canonical content | authenticated server-filtered Student Curriculum API | **FIXED + VERIFIED** |
| `STUDENT-014-READER-001` | P1 | Reader | publication/media/OCR authority not exposed safely to Student | storage/authorization/content trust gap | protected Reader + media reauth/integrity + safe OCR | **FIXED + VERIFIED** |
| `STUDENT-014-UX-002` | P2 | UX | post-login hierarchy/copy was account/security-first | weak learning product hierarchy | study-first shell and product copy | **FIXED + VERIFIED** |
| `STUDENT-014-A11Y-003` | P2 | A11y | weak/diluted focus indicator | keyboard visibility risk | Student-local 3px teal-700 focus ring (~4.88:1 on white) | **FIXED + VERIFIED** |
| `STUDENT-014-QA-004` | P2 | QA | shared Reader API change lacked full API lint/unit regression | hidden integration drift | dedicated API regression workflow | **FIXED + VERIFIED** |
| `STUDENT-015-QB-001` | P1 | Dependency | Stage15 needed canonical Stage13F authority | risk of fake/duplicate assessment model | integrate verified main + same-head regressions | **RESOLVED / VERIFIED** |
| `STUDENT-015-API-002` | P1 | Assessment API | current Question Bank/Quiz HTTP is Admin-only; no Student-safe runtime API exists | Student cannot safely start/resume/answer/finalize | minimal Student assessment service/routes | **OPEN / DISCOVERY** |
| `STUDENT-015-DIRECT-003` | P1 | Persistence | `practice_answers` stores option selection only while Stage13F supports `direct` questions | direct answers cannot be represented | extend existing answer row with text-answer shape/invariants | **OPEN / PROVEN** |
| `AI-012-019` | P2 | Live AI | provider benchmark/routes/credentials/bootstrap not live-proven | production generation route unverified | future explicit runtime evidence | **OPEN / NOT YET VERIFIED** |
| `CI-001` | historical | Actions | hosted-runner allocation incident | historical evidence delay | later runners pass real matrices | NONBLOCKING |

No P0/P1 Stage14 finding remains open.

## 7. Changes Made — Student Track

### Stage14

- canonical Access UX + real class redemption;
- entitlement-safe Curriculum Student read model;
- class/subject/lesson learning navigation;
- protected Lesson Reader service/routes/UI;
- media integrity/authorization and OCR review filtering;
- Reader search/TTS capability/offline/error states;
- learning-first authenticated hierarchy/copy;
- keyboard focus return and focus contrast correction;
- dedicated Student + shared API CI gates.

### Stage13F integration

Canonical `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` was integrated through merge commit:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

Parents:

- `9ccfe1e6c6468a6b63cc91bc44311b65bdb067f7`
- `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

The branch update was non-force. `main` is the merge-base and Student is `behind_by=0`.

`apps/api/src/app.ts` conflict resolution kept both Student Reader wiring and Track A Question Bank/Quiz wiring.

## 8. Tests & Verification

### Stage14 closure runtime

Exact runtime HEAD:

`ac55f1435d232cadff334816407f1182125dda90`

- Student Product `34420993805` — **SUCCESS**.
- Student API Regression `34420993840` — **SUCCESS**.
- Student lint/typecheck/Vitest `12/12`/production build PASS.
- API Biome/typecheck/unit `46/46`/build PASS at Stage14 closure.
- clean PostgreSQL `0001`→`0018` PASS.
- Curriculum + Reader integration PASS.
- Chromium `2/2` PASS.
- responsive Reader path 390×844 / 768×1024 / 1366×900 PASS.

### Stage13F→Student integration runtime

Exact runtime HEAD:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

- Student API Regression `34422553459` — **SUCCESS**.
- Student Product `34422553405` — **SUCCESS**.
- Student quality PASS.
- API regression PASS.
- API/Student builds PASS.
- clean PostgreSQL `0001`→`0022` PASS.
- Student Curriculum + Reader integration PASS.
- Admin bootstrap PASS.
- real Chromium Student suite PASS.

This closes the Stage15 integration dependency. Later docs-only commits do not replace the runtime evidence above.

## 9. Stage15 Discovery Evidence

Inspected actual code/schema:

- `MASTER_REBUILD_ROADMAP.md` Stage15 contract.
- `apps/api/src/question-bank/http.ts` — Admin-only.
- `apps/api/src/quiz-builder/http.ts` — Admin-only.
- `apps/api/src/quiz-builder/service.ts` — Admin detail includes correctness/answer/audit data.
- `database/migrations/0003_learning.sql` — existing practice/session/attempt persistence.
- `0019_question_bank.sql` — stable Question Bank items/revisions/provenance.
- `0020_quiz_builder_enums.sql` — adds `review` quiz state + `direct` delivery type.
- `0021_quiz_builder.sql` — immutable published QB-backed snapshot constraints.
- `0022_question_bank_regeneration.sql` — same-item regeneration invariants.

Repository code search did not find an existing implementation consuming `practice_sessions`; final caller audit remains in progress, but the schema is real and should be activated rather than replaced.

## 10. Known Issues / Remaining Work

- define exact Stage15 direct-answer storage and invariant migration;
- define Student published-quiz catalog/entitlement rules;
- define version/model selection and persisted shuffle algorithm;
- define resume/restart/abandon behavior;
- define Practice feedback vs Test/Model withheld-feedback policy;
- define direct-answer normalization/scoring;
- define idempotent/concurrency-safe finalization;
- implement and verify Student API + UI + PostgreSQL + Chromium;
- Stage16–25 remain ordered after Stage15;
- production deployment/cutover remains future-only.

## 11. Exact Next Action

1. complete Stage15 schema/caller audit;
2. record shared DB/API change in Issue #16 before editing Track A-owned shared areas;
3. implement the smallest additive migration for direct-answer/finalization gaps;
4. build Student-safe assessment service/routes with PostgreSQL tests first;
5. then implement Practice/Test/Model Student UX;
6. verify exact-head quality + clean DB + integration + Chromium;
7. keep Stage16 blocked until Stage15 closes.

## 12. Documentation Continuity Contract

Every meaningful batch must synchronize Student Track Status, Project Status, Engineering Log, Resume/Continuity/Queue as applicable, and Issue #16. Never leave continuation-critical state only in Chat.
