# STUDENT PRODUCT TRACK STATUS — Stage14+

> Branch-specific continuation checkpoint for the parallel Student Product track. Code/migrations + executable CI evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage14 CLOSED / VERIFIED; Stage13F main integrated and regression-verified; Stage15 discovery ACTIVE.**

## Track Identity

- Repository: `7eaur/alwaslh`
- Branch: `parallel/stage14-student-product`
- Shared execution ledger: GitHub Issue #16
- Operating contract: `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
- Stage14 verified runtime: `ac55f1435d232cadff334816407f1182125dda90`
- Canonical Stage13F main incorporated: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`
- Verified history-preserving integration HEAD: `4a476e1f29cb605fce294d7c34fd68e8218a32e8`

## Current Stage

**Stage15 — Practice / Assessment Engine**

State: **DISCOVERY / ARCHITECTURE ACTIVE — IMPLEMENTATION NOT YET VERIFIED**

Stage14 remains **CLOSED / VERIFIED**. The former Stage15 dependency block is resolved: canonical Stage13F Question Bank / Quiz Builder authority is in `main`, has been merged into this Student branch with a real two-parent merge commit, and the merged runtime passed Student/API/PostgreSQL/Chromium regression.

## Stage14 Closed Product Boundary

Verified Student foundation:

- activation, returning login, recovery, device/session restoration and rebind;
- canonical entitlement listing and seven-digit class redemption;
- server-authorized class → subject → ordered published lesson navigation;
- protected Lesson Reader with per-request entitlement/publication recheck;
- media byte-size + SHA-256 validation and no raw `storage_key` exposure;
- OCR only from completed `approved` / `not_required` authority;
- Reader search and browser TTS capability state;
- explicit loading/error/empty/session-expired/offline/reconnect behavior;
- Arabic RTL learning-first shell;
- keyboard Reader entry + focus return;
- responsive/no-overflow evidence at 390×844, 768×1024 and 1366×900.

Stage14 exact evidence:

- Student Product run `34420993805` — **SUCCESS**.
- API Regression run `34420993840` — **SUCCESS**.
- Student lint / strict typecheck / Vitest `12/12` / production build — PASS.
- API Biome / strict typecheck / unit `46/46` / build — PASS at Stage14 runtime.
- clean PostgreSQL `0001`→`0018`, Curriculum + Reader integration — PASS.
- real Chromium `2/2` — PASS.

Stage14 offline behavior preserves only in-session context. It does not claim Stage16 offline-learning/PWA authority.

## Stage13F → Student Integration — VERIFIED

Integration commit:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

Parents:

1. Student documentation/runtime lineage `9ccfe1e6c6468a6b63cc91bc44311b65bdb067f7`
2. canonical `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

The branch ref was advanced with **non-force** update. Compare against main reports `behind_by = 0`; merge-base is the exact Stage13F main checkpoint.

Conflict resolution was additive and narrow:

- kept Student `StudentReaderService` + Student Curriculum/Reader route registration;
- kept canonical Stage13F Question Bank, regeneration, Quiz Builder, candidate and export services/routes;
- reconciled project status/resume from newer main truth plus verified Stage14 closure;
- no duplicate Question Bank/Quiz model, no history rewrite and no fake Student API.

Integration evidence on exact HEAD `4a476e1f...`:

- Stage14 Student API Regression `34422553459` — **SUCCESS**.
- Stage14 Student Product `34422553405` — **SUCCESS**.
- Student quality job — PASS.
- API regression job — PASS.
- API + Student runtime build — PASS.
- clean PostgreSQL migrations `0001`→`0022` — PASS.
- Student Curriculum + Reader PostgreSQL integrations — PASS.
- recovery-support Admin bootstrap — PASS.
- real Chromium Auth/Access/Curriculum/Reader — PASS.

Decision: **Stage15 dependency gate is RESOLVED.**

## Stage15 Discovery — Verified So Far

### Canonical Question / Quiz authority — KEEP / CONSUME

Stage13F is authoritative for assessment authoring/publication:

- `question_bank_items` = stable reusable item identity;
- `question_bank_revisions` = immutable authoring revisions;
- only Published + known-answer revisions may be materialized into quiz snapshots;
- `quiz_versions` + `questions` + `question_options` are immutable delivery snapshots once quiz is published;
- snapshot rows retain exact Question Bank item/revision provenance;
- DB guards reject out-of-scope, unpublished or unknown-answer bank revisions;
- published quiz structure mutation is DB-blocked.

Student Stage15 must consume **published quiz snapshots**, never mutable Question Bank authoring rows.

### Existing HTTP surface — KEEP ADMIN-ONLY

Inspected:

- `apps/api/src/question-bank/http.ts`
- `apps/api/src/quiz-builder/http.ts`

Both are explicitly Admin-only via `adminActor` and `/v1/admin/...` routes. They must remain Admin-only. Stage15 requires separate Student-safe contracts that never reveal answer authority before allowed feedback/finalization.

### Existing assessment persistence — KEEP / IMPROVE

Inspected `database/migrations/0003_learning.sql` and Stage13F extensions `0019`–`0022`.

Existing durable runtime tables already include:

- `practice_sessions`;
- `practice_session_questions`;
- `practice_session_options`;
- `practice_answers`;
- `quiz_attempts`;
- stable profile/session and quiz/version foreign keys;
- current-question pointer;
- session status `in_progress | completed | abandoned`;
- attempt status `completed | invalidated`;
- deterministic stored `correct_count`, `question_count`, generated `score_percent`;
- history index by profile/completion.

Therefore a second attempt/session store would be a regression. Stage15 should activate and harden this existing schema.

### Confirmed Stage15 schema gap — IMPROVE

`practice_answers` currently stores only `selected_option_id`; Stage13F added delivery question type `direct` plus `questions.answer_text`.

A direct-answer attempt cannot be represented correctly by the current answer row. This is a proven narrow schema gap. Any migration must extend existing attempt persistence rather than create parallel tables.

### QuizBuilderService — KEEP ADMIN AUTHORING; DO NOT EXPOSE DIRECTLY

`QuizBuilderService.detail()` includes option correctness, direct answer text and authoring/audit data. Reusing it directly for Student delivery would leak answers and Admin metadata. Stage15 needs a purpose-built Student read model that selects only safe question presentation fields and performs scoring server-side.

## Stage15 Architecture Decision — ACTIVE

Target flow:

```text
Student authenticated session + device
→ entitlement check for quiz class
→ published quiz only
→ select immutable published quiz version/model
→ create/resume durable practice_session
→ freeze question order + option order in practice_session_* tables
→ return Student-safe question payload without answer key
→ persist answer idempotently
→ Practice: server may return feedback only under Practice rules
→ Test/Model: withhold correctness/answer until finalization
→ finalize transactionally
→ calculate from immutable snapshot + presented options
→ create one durable quiz_attempt
→ expose score/history/provenance from server authority
```

Principles:

- no browser scoring authority;
- no correct-option flags or direct `answer_text` in pre-feedback Student payloads;
- shuffle once when session is created and persist resulting order;
- resume uses persisted order, not a new randomization;
- stable IDs remain UUIDs from quiz/version/question/option snapshots;
- finalization must be idempotent/concurrency-safe;
- entitlement and publication are rechecked at appropriate boundaries;
- exact source/page and Question Bank revision provenance can be exposed safely without exposing answer keys;
- Practice and Test/Model share one engine but differ in feedback/finalization policy, not duplicate persistence.

## Component Classification — Stage15

| Area | Classification | Decision |
|---|---|---|
| Stage13F Question Bank | KEEP | canonical authoring/publication authority |
| Stage13F quiz snapshots | KEEP | canonical immutable assessment content |
| Admin Question Bank/Quiz HTTP | KEEP | stay Admin-only |
| `practice_sessions` persistence | KEEP / IMPROVE | activate existing durable session authority |
| presented question/option order | KEEP / IMPROVE | persist once; resume exact order |
| `practice_answers` | IMPROVE | add safe direct-answer representation + invariants |
| `quiz_attempts` | KEEP / IMPROVE | transactional idempotent finalization/history |
| Student assessment API | REBUILD / NEW MINIMAL SURFACE | purpose-built safe read/write contracts |
| Student Practice UI | REBUILD | immediate-feedback learning flow |
| Student Test/Model UI | REBUILD | no answer leakage before finalize |
| browser scoring/state authority | REMOVE / FORBIDDEN | server remains canonical |

## NOT YET VERIFIED

- exact migration shape for direct answers / finalization invariants;
- existing callers of `practice_sessions` outside schema — repository search found no implementation, but final code-path audit continues;
- Student published-quiz catalog query and entitlement rules;
- deterministic version selection when `shuffle_versions = true`;
- exact option-shuffle algorithm and reproducibility rule;
- resume/restart/abandon semantics;
- Practice feedback policy vs Test/Model policy;
- direct-answer normalization/scoring rule;
- finalization concurrency/idempotency behavior;
- Student Stage15 UI / responsive / accessibility;
- Stage15 PostgreSQL/API/Chromium evidence.

## Sequence Boundary

- Stage15 — **ACTIVE discovery; implementation next after the above contracts are closed incrementally.**
- Stage16 — Offline/PWA only after Stage15 closure.
- Stage17 — Notes/Favorites/Needs Review.
- Stage18 — Notifications.
- Stage19 — Progress/statistics/private achievements.
- Stage20+ — ordered roadmap/hardening.

## Exact Next Action

1. finish Stage15 backend/schema caller audit and define minimal direct-answer/finalization migration;
2. document shared DB/API change in Issue #16 before editing Track A-owned shared areas;
3. implement Student-safe assessment service/routes incrementally with PostgreSQL tests first;
4. add typed Student Web client and Practice/Test/Model UX only after backend contracts pass;
5. verify lint/typecheck/unit/build + clean migrations + PostgreSQL integration + real Chromium + responsive/keyboard behavior on exact heads;
6. keep Stage16 blocked until Stage15 is closed.
