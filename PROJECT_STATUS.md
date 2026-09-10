# PROJECT STATUS — الوسيلة الذكية

> الحالة التنفيذية المختصرة. Code/migrations + executable CI evidence أعلى من prose. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F promoted and integrated into Student branch; Stage14 CLOSED / VERIFIED; Stage15 discovery ACTIVE.**

## Current Position

- Repository: `7eaur/alwaslh`.
- Shared execution ledger: GitHub Issue `#16`.
- Operating model: **parallel two-track execution**.
  - Track A: Backend/Admin/AI/Question Bank/Quiz Builder and Stage13G follow-on.
  - Track B: Student Product on `parallel/stage14-student-product`.
- Production deployment/cutover remains future-only.
- Stage13E runtime authority: `d5ebc7f25a369430387a758c7c0bb89350963d67` — VERIFIED / CLOSED.
- Stage13F canonical promoted main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — VERIFIED / CLOSED / PROMOTED.
- Stage14 Student verified runtime: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F→Student verified integration runtime: `4a476e1f29cb605fce294d7c34fd68e8218a32e8`.
- Current Student documentation/discovery HEAD may be later than the verified integration runtime; docs-only commits are not new runtime evidence.

## Verified Stage13F → Student Integration

A real history-preserving merge commit integrated canonical Stage13F main into the Student branch:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

Parents:

1. Student lineage `9ccfe1e6c6468a6b63cc91bc44311b65bdb067f7`
2. canonical `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

The branch ref was advanced non-force. Compare against main reports `behind_by = 0` with merge-base equal to the canonical main checkpoint.

Runtime resolution preserved both authorities:

- Student `StudentReaderService` + Student Curriculum/Reader routes;
- Stage13F Question Bank, regeneration, Quiz Builder, candidates and export routes/services.

No Question Bank/Quiz authority was duplicated and no history rewrite occurred.

Exact integration evidence on `4a476e1f...`:

- Stage14 Student API Regression `34422553459` — **SUCCESS**.
- Stage14 Student Product `34422553405` — **SUCCESS**.
- Student lint/typecheck/unit/build — PASS.
- API lint/typecheck/unit/build regression — PASS.
- clean PostgreSQL migrations `0001`→`0022` — PASS.
- Student Curriculum + Reader PostgreSQL integrations — PASS.
- Admin bootstrap — PASS.
- real Chromium Auth/Access/Curriculum/Reader — PASS.

Decision: **the Stage15 dependency gate is resolved.**

## Stage14 — CLOSED / VERIFIED

Verified Student outcomes:

- activation/login/recovery/device/session;
- canonical entitlements and seven-digit class redemption;
- server-authorized class → subject → ordered published lessons;
- protected Reader with per-request access/publication checks;
- media integrity validation and no raw storage-key exposure;
- approved/not-required OCR only;
- Reader search + TTS capability UX;
- explicit loading/error/empty/session-expired/offline/reconnect states;
- learning-first Arabic RTL shell;
- keyboard Reader entry + focus return;
- responsive/no-overflow evidence 390×844, 768×1024 and 1366×900.

Stage14 exact closure evidence:

- Student Product `34420993805` — SUCCESS.
- Student API Regression `34420993840` — SUCCESS.
- Student Vitest `12/12` at closure.
- API unit `46/46` at closure.
- clean migrations through `0018` + Student Curriculum/Reader integrations + Chromium `2/2` — PASS.

Stage14 does not claim Stage16 offline-learning/PWA authority.

## Stage15 — Practice / Assessment Engine

State: **DISCOVERY / ARCHITECTURE ACTIVE; IMPLEMENTATION NOT YET VERIFIED**.

Verified discovery so far:

- Stage13F authoring/publication authority is canonical and must be consumed, not duplicated.
- Student must consume **published immutable quiz snapshots**, not mutable Question Bank rows.
- Admin Question Bank/Quiz endpoints remain Admin-only and must not be exposed to Student.
- Existing `QuizBuilderService.detail()` contains answer keys/correctness and Admin audit detail; it is unsafe as a Student read model.
- `database/migrations/0003_learning.sql` already contains durable assessment runtime persistence:
  - `practice_sessions`;
  - `practice_session_questions`;
  - `practice_session_options`;
  - `practice_answers`;
  - `quiz_attempts`.
- Stage13F `0020` adds `direct` delivery question type, and `0021` materializes immutable published Question Bank snapshots with item/revision provenance.
- DB guards require materialized bank revisions to be Published + known-answer + in quiz scope and block published quiz snapshot mutation.
- Confirmed narrow schema gap: `practice_answers` can store only `selected_option_id`, so direct-question answers are not representable yet.

Architecture direction:

```text
authenticated Student + device
→ entitlement + published quiz check
→ immutable published version/model
→ create/resume practice_session
→ persist one shuffled question/option order
→ Student-safe payload without answer key
→ idempotent server-side answer persistence
→ Practice feedback policy OR Test/Model withheld feedback
→ transactional idempotent finalization
→ server scoring from immutable snapshot
→ quiz_attempt history + exact provenance
```

No browser scoring authority and no second attempt store.

## Stage Ledger

| Stage | State |
|---|---|
| Stage1–10 + OCR | VERIFIED |
| Stage11 AI Contracts | VERIFIED |
| Stage12 Durable AI Execution | VERIFIED backend/runtime; live provider bootstrap `NOT YET VERIFIED` |
| Stage13A–E | VERIFIED / CLOSED |
| Stage13F Question Bank / Quiz Builder | **VERIFIED / CLOSED / PROMOTED + INTEGRATED TO STUDENT** |
| Stage13G Remaining Admin | Track A follow-on |
| Stage14 Student Product | **CLOSED / VERIFIED** |
| Stage15 Practice / Assessment | **ACTIVE DISCOVERY** |
| Stage16 Offline / PWA | BLOCKED by Stage15 sequence |
| Stage17 Personal Learning Data | REQUIRED after Stage16 |
| Stage18 Notifications | REQUIRED later |
| Stage19 Progress / Statistics / Achievements | REQUIRED later |
| Stage20–25 | REQUIRED by roadmap |
| Stage26–29 | future release/deployment track |

## Findings / Authority Boundaries

- `STUDENT-014-API-001` P1 — Student Curriculum read contract — FIXED / VERIFIED.
- `STUDENT-014-READER-001` P1 — protected Reader publication/media/OCR authority — FIXED / VERIFIED.
- `STUDENT-014-UX-002` P2 — learning-first shell/copy/a11y closure — FIXED / VERIFIED.
- `STUDENT-015-QB-001` P1 — Stage15 dependency on Stage13F — **RESOLVED / INTEGRATED / VERIFIED**.
- `STUDENT-015-API-002` P1 — Student-safe assessment delivery/runtime contract absent — **OPEN / DISCOVERY**.
- `STUDENT-015-DIRECT-003` P1 — direct answers cannot be represented by current `practice_answers` — **OPEN / PROVEN**.
- `AI-012-019` P2 — live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED` and is not a blocker for consuming already-published assessment snapshots.

## Exact Next Work

1. finish Stage15 caller/schema/service audit;
2. define the smallest migration that extends existing attempt persistence for direct answers and finalization invariants;
3. record the shared DB/API change in Issue #16 before editing shared Track A-owned areas;
4. implement Student-safe assessment service/routes with PostgreSQL integration tests;
5. implement typed Student Web Practice/Test/Model UX only after backend contracts pass;
6. verify same-head Student/API/migrations/PostgreSQL/Chromium/responsive/accessibility gates;
7. do not begin Stage16 until Stage15 closes.
