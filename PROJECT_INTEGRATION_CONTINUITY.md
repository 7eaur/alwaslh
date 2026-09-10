# PROJECT INTEGRATION CONTINUITY — الوسيلة الذكية

> ذاكرة تشغيلية لأي محادثة هندسية بديلة. Current code + PostgreSQL migrations + executable CI أعلى من هذا الملف. أي شيء غير مفحوص/غير منفذ = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F main integrated; Stage14 CLOSED / VERIFIED; Stage15 CLOSED / VERIFIED; Stage16 next by sequence.**

## Resume Procedure

1. Confirm repo `7eaur/alwaslh` and branch `parallel/stage14-student-product`.
2. Read README, Documentation Index, Student Track Status, Handoff, Status, Resume Snapshot, Engineering Log, this file and Execution Queue.
3. Read latest Issue #16 body/comments.
4. Live-check `main`, Student branch and Actions.
5. Re-read Stage16 source-of-truth before any Stage16 edit.

## Operating Model

- Track A owns Backend/Admin/DB/AI/Question Bank/Quiz Builder and Stage13G follow-on.
- Track B owns Student Product from Stage14 onward.
- Issue #16 is the single shared execution ledger.
- `main` is the canonical verified contract handoff point.
- Track B consumes shared authority; it does not duplicate it.
- Production deployment/cutover remains future-only.

## Stable Architecture

- Browser is presentation/session UX, not durable authority.
- Auth, devices, entitlements, curriculum publication and assessment publication are server/PostgreSQL owned.
- Stage11 typed AI → Stage12 durable execution → Stage13E human review → Stage13F Question Bank/Quiz publication.
- Stage13E approve never auto-publishes a Question Bank revision.
- published Question Bank revisions are immutable.
- published quiz versions snapshot exact published bank revision IDs and are structurally immutable.
- Stage15 consumes published quiz snapshots only.
- Student answer keys/scoring/finalization are server authority.
- Student direct content/assessment access requires publication time to have arrived (`published_at <= now()`).
- transient offline UI is not Stage16 durable offline-learning authority.

## Canonical Checkpoints

- Stage13E verified runtime: `d5ebc7f25a369430387a758c7c0bb89350963d67`.
- Stage13F canonical promoted main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`.
- Stage14 Student verified runtime: `ac55f1435d232cadff334816407f1182125dda90`.
- Stage13F→Student integration runtime: `4a476e1f29cb605fce294d7c34fd68e8218a32e8`.
- **Stage15 Student verified runtime: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`.**

Later documentation commits do not replace exact runtime evidence.

## Stage13F → Student Integration

A real two-parent merge commit integrated canonical Stage13F:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

The additive `apps/api/src/app.ts` conflict resolution retained both Student Reader wiring and Stage13F Question Bank/Quiz wiring. No force update, history rewrite, fake API or duplicate Quiz/Question Bank store was introduced.

## Stage14 Closed Boundary

Stage14 provides:

- Auth/activation/recovery/device/session UX;
- entitlements/class redemption;
- class/subject/published lesson navigation;
- protected Reader/media/OCR/search/TTS capability;
- honest connectivity/session states;
- learning-first RTL shell;
- keyboard/focus and mobile/tablet/desktop evidence.

Stage14 does not own durable offline-learning/PWA authority.

## Stage15 Closed Boundary

### Canonical content authority

Stage15 consumes Stage13F authority:

- stable Question Bank item UUIDs;
- immutable published revisions;
- Published + known-answer requirement for quiz materialization;
- immutable QB-backed delivery snapshots;
- exact item/revision provenance;
- DB guards for scope/publication/answer state and post-publish mutation.

Admin Question Bank/Quiz HTTP remains Admin-only. `QuizBuilderService.detail()` remains unsafe as a Student payload because it includes correctness/direct-answer/admin detail.

### Durable assessment runtime

Stage15 reuses:

- `practice_sessions`;
- `practice_session_questions`;
- `practice_session_options`;
- `practice_answers`;
- `quiz_attempts`.

Migration `0023_student_assessment_runtime.sql` closes the direct-answer/runtime gap in the existing engine. No parallel attempt store was created.

Runtime behavior:

```text
Student auth/device
→ entitlement + publication check
→ published immutable quiz/version
→ create/resume practice_session
→ persist question/option presentation order once
→ safe answer-key-free payload
→ server answer write
→ Practice feedback OR Test withheld feedback
→ idempotent server finalize/score
→ quiz_attempt history
```

Resume keeps the selected version and presented ordering. Restart abandons the previous in-progress session before creating a new one.

### Shared files touched by Student Stage15

Shared API/DB changes that future Track A integration work must preserve:

- `database/migrations/0023_student_assessment_runtime.sql`;
- `apps/api/src/student-assessment/**`;
- `apps/api/src/app.ts` Student assessment registration;
- `apps/api/src/curriculum/student-reader.ts` publication-time tightening.

Likely manual conflict surfaces if Track A evolves the same registration area:

- `apps/api/src/app.ts`;
- route/service registration around Student runtime;
- future migrations after `0023`.

Conflict policy: resolve additively; preserve both canonical Track A services and Student Reader/Assessment services. Never replace Question Bank/Quiz authority with Student copies.

### P1 correctness boundaries closed

- Future-scheduled lesson bypass: Reader + Assessment now require `published_at <= now()`.
- Active-session entitlement loss: backend 404 is treated by Student Web as unavailable assessment; workspace is removed and permitted catalog reloaded.
- Student answer keys remain withheld according to Practice/Test policy.

## Stage15 Exact Verification

Runtime:

`9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`

Same-head runs:

- API Regression `34427900263` — SUCCESS — Biome 104 files, typecheck, API unit 46/46, build.
- Stage15 Assessment `34427900257` — SUCCESS — migrations `0001`→`0023`, assessment/publication integration, Chromium 1/1.
- Student Product `34427900209` — SUCCESS — Student 15/15, production build, migrations `0001`→`0023`, Curriculum/Reader integration 2/2, full Chromium 3/3.

Production Student bundle: JS 200.16 kB raw / 60.78 gzip; CSS 30.84 / 5.71 gzip.

## Integration Guidance After Stage15

When Track A or `main` moves forward:

1. inspect diff against Stage15 runtime `9a787b7...` before merging;
2. preserve migration ordering and avoid duplicate Student assessment tables;
3. preserve `app.ts` registrations for Reader + Assessment alongside new Track A registrations;
4. rerun Student API Regression + Student Product + relevant Track A regression after any shared merge;
5. treat documentation-only heads as documentation, not replacement runtime evidence.

## Open Boundaries

- Stage16 Service Worker / IndexedDB / durable offline content / sync authority — `NOT YET VERIFIED`.
- Stage17 Notes/Favorites/Needs Review — later by sequence.
- Stage18 Notifications — later.
- Stage19 Progress/Statistics/Achievements — later.
- `AI-012-019` live provider runtime remains `NOT YET VERIFIED`; it does not invalidate consumption of already-published assessment snapshots.
- Stage26–29 release/deployment remain future-only.

## Exact Continuation Action

1. re-read `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`, Student Track Status and latest Issue #16;
2. inspect actual Stage16 Service Worker / IndexedDB / sync code and contracts before edits;
3. classify Stage16 work KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
4. define entitlement-aware offline storage and revocation/sync behavior;
5. implement Stage16 incrementally with real browser/SW/IndexedDB evidence;
6. keep deployment deferred.
