# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> ذاكرة تشغيلية لأي محادثة هندسية بديلة. Current code + PostgreSQL migrations + executable CI أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F runtime exact-head matrix 13/13 SUCCESS; closure docs require their own exact-head matrix before fast-forward to main.**

## Resume Procedure

1. Confirm `7eaur/alwaslh`.
2. Read `README.md`, `DOCUMENTATION_INDEX.md`, Handoff, Status, Resume Snapshot, Engineering Log, this file and Execution Queue.
3. Read latest Issue #16 body/comments.
4. Live-check `main`, the active branch and Actions.
5. Read current-stage specialized contract/tests before editing.

## Operating Model

Current Issue #16 authority is parallel two-track execution:

- Track A owns API/Admin/DB/AI/Question Bank/Quiz Builder and Stage13G follow-on.
- Track B owns Student Product from Stage14 onward on `parallel/stage14-student-product`.
- `main` is the shared verified contract handoff point.
- Track B must adapt to canonical backend contracts; it must never duplicate Auth/Access/Content/AI/Question Bank/Quiz authority.
- Production deployment/cutover remains future work; no deployment was needed for Stage13F.

## Stable Architecture

- Browser is presentation/session UX, not durable authority.
- Auth, devices, entitlements, curriculum publication and assessment publication are server/PostgreSQL owned.
- Stage9 source + Stage10 media + OCR retain provenance; ready media is not published Lesson content.
- Stage11 owns typed generation contracts and prompt versions.
- Stage12 owns durable execution lifecycle.
- Stage13E owns append-only human output review.
- Stage13F owns Question Bank reusable identity/revisions/publication and Quiz Builder immutable snapshots.
- Stage13E `approve` never auto-publishes a bank question.
- published Question Bank revisions remain immutable while a new Draft may exist.
- Quiz versions snapshot exact published bank revision IDs; later bank edits never mutate historical/published quiz versions.
- Student Stage15 consumes published snapshots only.

## Stage13F Runtime Git State

Branch runtime checkpoint:

`integration/stage13f-question-bank @ afbe552710b3f1cf79ee70594f691fa836c05a45`

Stage-specific runs:

- Backend/PostgreSQL `34420441878` — SUCCESS.
- Admin/PostgreSQL/Chromium `34420441837` — SUCCESS.

Runtime verification-only Draft PR #27 targeted `main @ 5fdb23030c77cae9bff5f8c33d4be466427eb6e5`, executed **13/13 SUCCESS**, and was closed unmerged.

Run set:

- Stage9 `34420900598`
- Stage10 `34420900550`
- OCR `34420900527`
- Stage11 `34420900592`
- Stage12 `34420900501`
- Stage13 Admin `34420900492`
- Stage13D Content `34420900547`
- Stage13D Admin `34420900488`
- Stage13E Frontend Prep `34420900522`
- Stage13E Admin AI Ops `34420900503`
- Stage13F Backend `34420900520`
- Stage13F Admin/Chromium `34420900476`
- Rebuild `34420900482`

Rebuild passed Stages1–8 foundations, clean PostgreSQL/migrations, API/Admin/Student builds and real Student activation/returning-login/recovery browser E2E.

## Stage13F Implemented Authority

### Question Bank

- `question_bank_items` stable UUID identity.
- immutable `question_bank_revisions`.
- lesson/source/AI-import/event provenance.
- typed `multiple_choice | true_false | direct`.
- latest-approve-only Stage13E import.
- idempotent `(ai_output_id, approved_review_revision, question_locator)` import.
- manual create/edit and Draft → Review → Published.
- previously published revision archived only when replacement explicitly publishes.

### Quiz Builder

- reuse `quizzes`, `quiz_lessons`, `quiz_versions`.
- server-scoped published Question Bank candidates.
- one/multiple lessons and multiple models/versions.
- materialized immutable delivery `questions`/options with Question Bank item/revision provenance.
- direct-question delivery shape.
- Draft mutation only; Review/Published freeze version changes.
- publish/archive audit events.

### Regenerate One

- consumes only Stage11 `regenerate_question` output that passed Stage12 and latest Stage13E approve.
- verifies original question type/difficulty/prompt and published source set.
- produces one different Draft revision under the same stable item.
- replay returns the same revision.
- generic AI import cannot turn regeneration into a new item; PostgreSQL also rejects invalid identity mapping.

### Export

- exact quiz/version scope.
- Review/Published only.
- UTF-8 BOM CSV suitable for Excel workflows.
- RTL print HTML suitable for browser printing / Save as PDF.
- includes answer/explanation/source page and Question Bank provenance.
- Draft rejected server-side.

## Root-Cause History in Stage13F

- separate authoring vs delivery identity was required; old delivery table was not overloaded as bank authority.
- Stage13F initially hit only quality/test defects after implementation: Biome order/format, strict fixture narrowing and ambiguous Playwright locators; all were fixed at source without disables or weaker assertions.
- regenerate replay order revealed a real service defect and was changed to check exact prior import before rejecting an open Draft.
- invalid nested form in Quiz Builder candidate search was removed.
- accidental pre-branch `.noop` write was cleaned on `main`; cleanup SHA `5fdb2303...` has tree `bcd433bd...`, exactly restoring the prior tree. No runtime/config/doc effect remains.

## Cross-Track Dependency

Track B latest verified Reader runtime is recorded in its own status file as `0d0a1778b0525560ec288dbfc612bbfa0efa9a6d`; Stage14 final shell/copy/a11y closure remains active.

Stage15 dependency rule:

```text
Stage13F closure docs exact-head matrix PASS
→ close verification PR unmerged
→ re-check main
→ fast-forward main to exact Stage13F closure checkpoint
→ Track B merge/rebase verified main
→ only then Stage15 assessment consumption
```

## Remaining Open Boundaries

- `AI-012-019`: live provider benchmark/routes/credentials/bootstrap = `NOT YET VERIFIED`.
- remaining QADMIN generation orchestration and specialized export variants are not silently closed; Stage13G/AI authoring owns them.
- remaining Admin accounts/codes/recovery/notifications/reports/settings/security/audit dashboard = Stage13G.
- Stage16–25 remain ordered work.
- Stage26–29 release/deployment remain future-only.

## Closure Procedure

The documentation checkpoint containing this file must be verified by a second verification-only PR with the wider matrix. After SUCCESS:

1. close PR unmerged;
2. ensure `main` still equals the Stage13F base;
3. update `main` ref by non-force fast-forward to the exact closure commit;
4. post final Stage13F EXECUTION REPORT in Issue #16;
5. start Stage13G / unblock Track B integration.

No merge commit, force update or history rewrite is authorized.