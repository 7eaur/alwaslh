# PROJECT RESUME SNAPSHOT — الوسيلة الذكية

> Latest continuation checkpoint for replacement engineering conversations. Code, migrations and executable CI evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage13F integrated; Stage14 CLOSED / VERIFIED; Stage15 CLOSED / VERIFIED; Stage16 next / NOT YET STARTED.**

## Operating model

- Repo: `7eaur/alwaslh`.
- Student branch: `parallel/stage14-student-product`.
- Issue #16 = sole cross-track execution ledger.
- Track A owns Backend/Admin/AI/Question Bank/Quiz Builder and Stage13G follow-on.
- Track B owns Student Product from Stage14 onward.
- `main` is the verified shared-contract handoff point.
- No duplicate durable authority across tracks.
- Production cutover remains future-only.

## Canonical checkpoints

- Stage13E runtime: `d5ebc7f25a369430387a758c7c0bb89350963d67` — VERIFIED / CLOSED.
- Stage13F canonical promoted main: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` — VERIFIED / CLOSED / PROMOTED.
- Stage14 Student runtime: `ac55f1435d232cadff334816407f1182125dda90` — CLOSED / VERIFIED.
- Stage13F→Student integration runtime: `4a476e1f29cb605fce294d7c34fd68e8218a32e8` — VERIFIED.
- **Stage15 Student runtime: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d` — CLOSED / VERIFIED.**

Documentation commits after `9a787b7...` do not replace that runtime evidence.

## Stage14 closure

Verified:

- activation/login/recovery/device/session;
- entitlements + class redemption;
- class→subject→ordered published lessons;
- protected Reader/media/OCR/search/TTS capability;
- honest loading/error/offline/session UX;
- learning-first Arabic RTL shell;
- keyboard focus and responsive 390/768/1366 evidence.

Stage14 does not claim durable offline-learning/PWA authority.

## Stage15 closure

### Authority consumed

Stage15 consumes canonical Stage13F:

```text
Question Bank stable item
→ immutable Published revision
→ immutable quiz-version question snapshot
→ exact QB item/revision provenance
→ Published quiz
→ Student assessment runtime
```

Admin Question Bank/Quiz routes remain Admin-only. Student does not consume `QuizBuilderService.detail()` because that authoring detail contains correctness/direct-answer/admin data.

### Runtime persistence

Existing assessment persistence remains canonical:

- `practice_sessions`
- `practice_session_questions`
- `practice_session_options`
- `practice_answers`
- `quiz_attempts`

Migration `0023_student_assessment_runtime.sql` extends the existing engine for Stage15 direct-answer/runtime needs. No parallel attempt engine exists.

### Verified behavior

- entitlement-filtered published quiz catalog;
- immutable version/model selection;
- create/resume/restart/abandon;
- persisted version/question/option presentation;
- Student-safe payload without premature answer keys;
- Practice reveals server feedback after answer and locks the answered question;
- Test withholds correctness until finalize and permits edits before finalize;
- direct and choice scoring are server-owned;
- finalization is idempotent;
- attempt history is durable;
- in-progress access is rechecked;
- future publication uses `published_at <= now()` consistently across Curriculum/Reader/Assessment;
- entitlement loss on reconnect exits stale Assessment workspace and reloads permitted catalog;
- offline state blocks writes/finalize rather than pretending to persist;
- learning hierarchy = Curriculum → Assessment → Access;
- responsive checks cover 390×844, 768×1024, 1366×900.

## Stage15 exact evidence

Runtime:

`9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`

- API Regression `34427900263` — SUCCESS
  - Biome 104 files;
  - API typecheck;
  - API unit 46/46;
  - build.
- Stage15 Assessment `34427900257` — SUCCESS
  - clean migrations `0001`→`0023`;
  - assessment + future-publication integration;
  - Chromium 1/1 PASS.
- Student Product `34427900209` — SUCCESS
  - lint/typecheck;
  - Student unit 15/15;
  - production build;
  - migrations `0001`→`0023`;
  - Curriculum + Reader integration 2/2;
  - full Chromium 3/3 PASS.

Production bundle:

- JS 200.16 kB raw / 60.78 kB gzip;
- CSS 30.84 kB raw / 5.71 kB gzip;
- index 0.67 / 0.40 kB gzip.

## Closed Stage15 findings

- `STUDENT-015-QB-001` P1 — canonical Stage13F dependency — RESOLVED / VERIFIED.
- `STUDENT-015-ASSESSMENT-001` P1 — Student-safe runtime absent — FIXED / VERIFIED.
- `STUDENT-015-DIRECT-003` P1 — direct answer persistence gap — FIXED / VERIFIED via `0023`.
- `STUDENT-015-PUBLISH-002` P1 — future publication bypass in direct Student read paths — FIXED / VERIFIED.
- `STUDENT-015-ACCESS-004` P1 — stale Assessment workspace after entitlement loss/reconnect — FIXED / VERIFIED.
- `STUDENT-015-UX-003` P2 — Practice/Test learning-first product hierarchy — FIXED / VERIFIED.
- `STUDENT-015-QA-005` P2 — selector ambiguity/stale locator in combined E2E — FIXED / VERIFIED.

No P0/P1 Student Stage14/15 implementation blocker remains open.

## Stage16 boundary

Stage16 is **NEXT / NOT YET STARTED**.

Do not infer Stage16 readiness from Stage14/15 transient network-loss behavior. Stage16 must explicitly verify:

- Service Worker lifecycle/cache policy;
- IndexedDB/offline data model;
- entitlement-aware offline content scope;
- revocation/expiry behavior;
- durable sync queue/conflict rules;
- offline attempt/learning behavior if allowed by contract;
- reconnect reconciliation;
- privacy/security of cached protected content;
- real browser SW/IndexedDB tests.

## Deferred by sequence

- Stage17 Notes/Favorites/Needs Review.
- Stage18 Notifications.
- Stage19 Progress/Statistics/Achievements.
- later roadmap hardening.
- deployment/production cutover future-only.

## Mandatory next startup

`README.md → DOCUMENTATION_INDEX.md → docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md → docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md → PROJECT_HANDOFF.md → PROJECT_STATUS.md → PROJECT_RESUME_SNAPSHOT.md → PROJECT_ENGINEERING_LOG.md → PROJECT_INTEGRATION_CONTINUITY.md → PROJECT_EXECUTION_QUEUE.md → docs/product/CURRENT_PRODUCT_OVERRIDES.md → latest Issue #16 → live branch/main/Actions → actual Stage16 SW/IndexedDB/sync code`.
