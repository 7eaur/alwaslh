# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> ذاكرة تشغيلية لأي محادثة هندسية بديلة. Current code + PostgreSQL migrations + executable CI أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F main is integrated and regression-verified on Student branch; Stage15 discovery ACTIVE.**

## Resume Procedure

1. Confirm repo `7eaur/alwaslh` and branch `parallel/stage14-student-product`.
2. Read README, Documentation Index, Student Track Status, Handoff, Status, Resume Snapshot, Engineering Log, this file and Execution Queue.
3. Read latest Issue #16 body/comments.
4. Live-check `main`, Student branch and Actions.
5. Read current Stage15 schema/services/tests before editing.

## Operating Model

- Track A owns Backend/Admin/DB/AI/Question Bank/Quiz Builder and Stage13G follow-on.
- Track B owns Student Product from Stage14 onward.
- Issue #16 is the single shared execution ledger.
- `main` is the canonical verified contract handoff point.
- Track B must consume shared authority, not duplicate it.
- Production deployment/cutover remains future-only.

## Stable Architecture

- Browser is presentation/session UX, not durable authority.
- Auth, devices, entitlements, curriculum publication and assessment publication are server/PostgreSQL owned.
- Stage11 typed AI → Stage12 durable execution → Stage13E human review → Stage13F Question Bank/Quiz publication.
- Stage13E approve never auto-publishes a Question Bank revision.
- published Question Bank revisions are immutable.
- published quiz versions snapshot exact published bank revision IDs and are structurally immutable.
- Student Stage15 consumes published quiz snapshots only.
- Student answer keys/scoring/finalization are server authority.

## Canonical Checkpoints

- Stage13E verified runtime: `d5ebc7f25a369430387a758c7c0bb89350963d67`.
- Stage13F canonical promoted main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage14 Student verified runtime: `ac55f1435d232cadff334816407f1182125dda90`.
- Stage13F→Student verified integration runtime: `4a476e1f29cb605fce294d7c34fd68e8218a32e8`.

Later documentation/discovery commits do not replace exact runtime evidence.

## Stage13F → Student Integration

A real two-parent merge commit was created:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

Parents:

1. Student lineage `9ccfe1e6c6468a6b63cc91bc44311b65bdb067f7`
2. canonical main `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`

The branch ref moved non-force. Compare to main reports `behind_by=0` and main itself as merge-base.

Resolved overlap:

- `apps/api/src/app.ts`: additive merge retaining both Student Reader wiring and Stage13F Question Bank/Quiz wiring.
- `PROJECT_STATUS.md` / `PROJECT_RESUME_SNAPSHOT.md`: newer main truth reconciled with verified Student closure.

No force update, history rewrite, fake API, temporary Question Bank store or duplicate Quiz model.

## Integration Verification

Exact runtime HEAD `4a476e1f...`:

- Student API Regression `34422553459` — SUCCESS.
- Student Product `34422553405` — SUCCESS.
- Student quality PASS.
- API regression PASS.
- API + Student builds PASS.
- clean PostgreSQL migrations `0001`→`0022` PASS.
- Student Curriculum + Reader PostgreSQL integrations PASS.
- Admin bootstrap PASS.
- real Chromium Student Auth/Access/Curriculum/Reader PASS.

Therefore the former Stage15 dependency block is **RESOLVED**.

## Stage14 Closed Boundary

Stage14 is CLOSED / VERIFIED and provides:

- Auth/activation/recovery/device/session UX;
- entitlements/class redemption;
- class/subject/published lesson navigation;
- protected Reader/media/OCR/search/TTS capability;
- honest connectivity/session states;
- learning-first RTL shell;
- keyboard/focus and mobile/tablet/desktop evidence.

Stage14 does not own offline-learning PWA authority; Stage16 remains later.

## Stage15 Discovery Truth

### Existing canonical content authority

Stage13F:

- stable Question Bank item UUIDs;
- immutable revisions;
- exact lesson/source/AI provenance;
- Published + known-answer requirement for quiz materialization;
- immutable QB-backed delivery `questions` snapshots;
- DB guards for scope/publication/answer state;
- DB guards against post-publish quiz structure mutation.

### Existing runtime persistence

`database/migrations/0003_learning.sql` already provides:

- `practice_sessions`;
- `practice_session_questions`;
- `practice_session_options`;
- `practice_answers`;
- `quiz_attempts`.

Reuse these tables. Do not create a second Student attempt engine.

### Proven gap

Stage13F `0020` adds `direct` to delivery `question_type`, while `practice_answers` stores only `selected_option_id`. Direct Student answers cannot be persisted correctly yet.

### Unsafe reuse to avoid

Admin Question Bank/Quiz HTTP remains Admin-only. `QuizBuilderService.detail()` exposes correctness/direct answer/audit data and must not be returned to Student.

Stage15 requires a Student-safe read model that never sends answer keys before the product policy permits feedback/result.

## Stage15 Target Runtime

```text
Student auth/device
→ entitlement
→ published quiz
→ immutable model/version
→ create/resume practice_session
→ persist question/option presentation order
→ safe question payload
→ answer write
→ Practice feedback OR Test/Model withheld feedback
→ transactional finalize
→ server score
→ quiz_attempt history/provenance
```

Invariants:

- shuffle once and persist;
- resume keeps exact order;
- browser never scores canonically;
- finalize idempotently/concurrency-safely;
- published snapshot IDs remain stable;
- Practice/Test/Model policies share persistence instead of creating separate engines.

## Open Boundaries

- `STUDENT-015-API-002` P1 — Student-safe assessment API absent.
- `STUDENT-015-DIRECT-003` P1 — direct answer persistence gap.
- exact version selection/shuffle/restart/finalize/feedback rules remain `NOT YET VERIFIED` until implementation/tests.
- `AI-012-019` live provider runtime remains `NOT YET VERIFIED`; it does not block already-published quiz consumption.
- Stage16–25 remain ordered after Stage15.
- Stage26–29 release/deployment remain future-only.

## Exact Continuation Action

1. finish Stage15 table/service caller audit;
2. document shared migration/API plan in Issue #16 before editing Track A-owned shared areas;
3. implement only the minimal extension to existing assessment persistence;
4. add Student-safe service/routes and PostgreSQL integration tests;
5. then add Student Practice/Test/Model UI;
6. rerun exact-head quality/DB/Chromium gates;
7. keep Stage16 blocked until Stage15 closure.
