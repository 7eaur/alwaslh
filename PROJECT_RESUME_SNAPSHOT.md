# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Latest continuation checkpoint for replacement engineering conversations. Code, migrations and executable CI evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F integrated and regression-verified on Student branch; Stage14 CLOSED / VERIFIED; Stage15 discovery ACTIVE.**

## Operating model

- Repo: `7eaur/alwaslh`.
- Issue #16 = sole cross-track execution ledger.
- Track A owns Backend/Admin/AI/Question Bank/Quiz Builder and Stage13G follow-on.
- Track B owns Student Product on `parallel/stage14-student-product`.
- `main` is the verified shared-contract handoff point.
- No duplicate durable authority across tracks.
- Production cutover remains future-only.

## Canonical checkpoints

- Stage13E runtime: `d5ebc7f25a369430387a758c7c0bb89350963d67` — VERIFIED / CLOSED.
- Stage13F canonical promoted main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — VERIFIED / CLOSED / PROMOTED.
- Stage14 Student runtime: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F→Student verified integration runtime: `4a476e1f29cb605fce294d7c34fd68e8218a32e8`.

Current branch may contain later documentation/discovery commits; do not treat docs-only HEADs as new runtime evidence.

## Verified Stage13F → Student integration

Merge commit:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

Parents:

- Student lineage `9ccfe1e6c6468a6b63cc91bc44311b65bdb067f7`
- canonical `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

The branch was advanced with `force=false`. Compare to main: `behind_by = 0`, merge-base = exact Stage13F main checkpoint.

The only material runtime conflict was `apps/api/src/app.ts`; resolution preserved both:

- Student Curriculum/Reader service wiring;
- canonical Question Bank/regeneration/Quiz Builder/candidate/export wiring.

No duplicate authority and no history rewrite.

Exact integration evidence:

- Student API Regression `34422553459` — SUCCESS.
- Student Product `34422553405` — SUCCESS.
- Student lint/typecheck/unit/build — PASS.
- API lint/typecheck/unit/build — PASS.
- clean PostgreSQL `0001`→`0022` — PASS.
- Curriculum + Reader integrations — PASS.
- Admin bootstrap — PASS.
- real Chromium Student suite — PASS.

Stage15 is no longer dependency-blocked.

## Stage14 closure

Verified Student outcomes:

- activation/login/recovery/device/session;
- entitlements + seven-digit class redemption;
- class→subject→ordered published lessons;
- protected Reader/media/OCR/search/TTS capability;
- explicit loading/error/empty/session/offline states;
- learning-first Arabic RTL shell;
- keyboard Reader entry/focus return;
- 390×844 / 768×1024 / 1366×900 responsive evidence.

Closure evidence:

- Student Product `34420993805` — SUCCESS.
- API Regression `34420993840` — SUCCESS.
- Student Vitest `12/12` and API unit `46/46` at closure.
- clean PostgreSQL through `0018`, Curriculum/Reader integrations, Chromium `2/2` PASS.

Stage16 offline-learning/PWA authority was intentionally not implemented.

## Stage15 current understanding

### Keep canonical assessment content authority

Stage13F provides:

```text
Question Bank stable item UUID
→ immutable revision
→ Draft/Review/Published
→ published known-answer revision only
→ immutable quiz-version question snapshot
→ exact QB item/revision provenance
→ published quiz snapshot
```

Student Stage15 consumes published quiz snapshots only. It does not query mutable authoring rows as attempt authority.

### Keep Admin HTTP Admin-only

`apps/api/src/question-bank/http.ts` and `apps/api/src/quiz-builder/http.ts` require Admin role. Keep them that way.

`QuizBuilderService.detail()` contains option correctness, direct answers and Admin audit data. Do **not** reuse it as Student delivery response.

### Reuse existing attempt persistence

`database/migrations/0003_learning.sql` already has:

- `practice_sessions`
- `practice_session_questions`
- `practice_session_options`
- `practice_answers`
- `quiz_attempts`

These are the canonical base for Stage15. Do not add a parallel attempt engine.

Stage13F migrations:

- `0019_question_bank.sql`
- `0020_quiz_builder_enums.sql`
- `0021_quiz_builder.sql`
- `0022_question_bank_regeneration.sql`

`0020` adds delivery question type `direct`; `0021` links materialized snapshot questions to exact Question Bank item/revision and DB-blocks invalid/unpublished/out-of-scope snapshots and post-publish mutation.

### Proven schema gap

Current `practice_answers` can persist only `selected_option_id`. It cannot represent a direct text answer. This is a proven Stage15 schema gap and should be fixed by extending the existing table, not creating another answer store.

## Stage15 target architecture

```text
Student session/device
→ entitlement check
→ published quiz
→ immutable version/model selection
→ durable practice_session
→ persisted question + option presentation order
→ answer-key-free Student payload
→ idempotent answer write
→ policy: Practice feedback vs Test/Model withheld feedback
→ transactional idempotent finalize
→ server scoring from immutable snapshot
→ quiz_attempt history + provenance
```

Required properties:

- browser never owns scoring authority;
- correct option / direct answer stays server-private until policy allows feedback/result;
- question/option shuffle happens once per session and persisted order drives resume;
- stable UUIDs are preserved;
- server computes scores;
- finalization is concurrency-safe/idempotent;
- exact source/page/QB revision provenance remains traceable;
- one engine supports Practice and Test/Model policies without duplicate persistence.

## Current findings

- `STUDENT-015-QB-001` P1 — Stage13F dependency — RESOLVED / INTEGRATED / VERIFIED.
- `STUDENT-015-API-002` P1 — Student-safe assessment API absent — OPEN.
- `STUDENT-015-DIRECT-003` P1 — direct answer cannot be represented in `practice_answers` — OPEN / PROVEN.
- `AI-012-019` P2 — live provider runtime remains `NOT YET VERIFIED`; this does not block consumption of already-published quiz snapshots.

## Exact next work

1. inspect remaining callers/constraints around practice session tables and quiz snapshot services;
2. define minimal direct-answer + finalization migration/invariants;
3. record shared DB/API change in Issue #16 before editing Track A-owned shared areas;
4. implement Student assessment service/routes with PostgreSQL integration tests first;
5. then implement typed Student Web Practice/Test/Model UX;
6. run lint/typecheck/unit/build + clean migrations + PostgreSQL + real Chromium + responsive/keyboard gates on exact heads;
7. keep Stage16 blocked until Stage15 closes.

## Deferred by sequence

- Stage16 Offline/PWA.
- Stage17 Notes/Favorites/Needs Review.
- Stage18 Notifications.
- Stage19 Progress/Statistics/Achievements.
- deployment/production cutover future-only.

## Mandatory startup

`README.md → DOCUMENTATION_INDEX.md → docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md → docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → docs/product/CURRENT_PRODUCT_OVERRIDES.md → latest Issue #16 → live main/branch/Actions → Stage15 code/migrations/tests`.
