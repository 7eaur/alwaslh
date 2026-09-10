# STUDENT PRODUCT TRACK STATUS — Stage14+

> Branch-specific continuation checkpoint for the parallel Student Product track. Code/migrations + executable CI evidence outrank prose. Anything not inspected/executed = `NOT YET VERIFIED`.

Last synchronized: **2026-09-10 — Stage14 CLOSED / VERIFIED; Stage15 CLOSED / VERIFIED; Stage16 next by sequence and NOT YET STARTED.**

## Track Identity

- Repository: `7eaur/alwaslh`
- Branch: `parallel/stage14-student-product`
- Shared execution ledger: GitHub Issue #16
- Operating contract: `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`
- Stage14 verified runtime: `ac55f1435d232cadff334816407f1182125dda90`
- Canonical Stage13F main incorporated: `3aeca598759e31b4eddc5cb3535e00c11fc0f7d2`
- Stage13F→Student integration runtime: `4a476e1f29cb605fce294d7c34fd68e8218a32e8`
- **Stage15 verified runtime: `9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`**

Documentation commits after the verified runtime do not replace runtime evidence.

## Current Stage

**Stage15 — Practice / Assessment Engine**

State: **CLOSED / VERIFIED**

Stage16 — Offline / PWA is next by sequence, but remains **NOT YET STARTED** until its source-of-truth contract is re-read after this closure.

## Stage14 Closed Product Boundary

Stage14 remains verified for:

- activation, returning login, recovery, device/session restoration and rebind;
- canonical entitlement listing and seven-digit class redemption;
- server-authorized class → subject → ordered published lesson navigation;
- protected Lesson Reader with per-request entitlement/publication recheck;
- media byte-size + SHA-256 validation and no raw `storage_key` exposure;
- OCR only from completed `approved` / `not_required` authority;
- Reader search and browser TTS capability state;
- loading/error/empty/session-expired/offline/reconnect behavior;
- Arabic RTL learning-first shell;
- keyboard Reader entry + focus return;
- responsive/no-overflow evidence at 390×844, 768×1024 and 1366×900.

Stage14 does not claim Stage16 offline-learning/PWA authority.

## Stage13F → Student Integration — VERIFIED

Canonical Question Bank / Quiz Builder authority from `main @ 3aeca598759e31b4eddc5cb3535e00c11fc0f7d2` was integrated through real two-parent merge commit:

`4a476e1f29cb605fce294d7c34fd68e8218a32e8`

Stage15 consumes this authority rather than duplicating it:

- stable Question Bank item UUIDs;
- immutable published revisions;
- Published + known-answer requirement for quiz materialization;
- immutable quiz-version question/option snapshots;
- exact Question Bank item/revision provenance;
- DB guards against invalid/out-of-scope/unpublished snapshots and post-publish structural mutation.

Admin Question Bank/Quiz HTTP remains Admin-only.

## Stage15 Closed Product Boundary

### Canonical runtime

Stage15 reuses and hardens the existing assessment persistence instead of creating a parallel engine:

- `practice_sessions`;
- `practice_session_questions`;
- `practice_session_options`;
- `practice_answers`;
- `quiz_attempts`.

Migration `0023_student_assessment_runtime.sql` closes the narrow direct-answer/runtime gaps while keeping one durable authority.

### Student-safe API

A purpose-built Student assessment API now provides:

- entitlement-filtered published quiz catalog;
- immutable version/model selection;
- create/resume/restart session behavior;
- persisted question and option presentation order;
- answer writes through server authority;
- idempotent finalization;
- attempts/history;
- access recheck while a session is in progress.

The Student payload does **not** expose `is_correct`, correct-option authority, or direct answer keys before product policy permits feedback/result.

### Practice policy

- initial question payload is answer-key-free;
- after a Practice answer is submitted, server feedback may reveal correctness/explanation/method;
- after feedback has been revealed, the Practice answer cannot be changed;
- direct text answers are normalized conservatively server-side for scoring;
- final score/history comes from server authority.

### Test / Model policy

- answers can be edited while the test remains in progress;
- correctness, explanation, correct option and direct answer remain withheld before finalize;
- finalization is server-scored and idempotent;
- completed results may reveal feedback according to result policy.

### Resume / randomization

- version selection is persisted once per session;
- question/option presentation order is persisted;
- resume returns the same session/version/order rather than re-randomizing;
- restart abandons the previous in-progress session and creates a new one.

### Student UX

The authenticated learning hierarchy is now:

```text
Curriculum / Reader
→ Practice & Tests
→ Access management
```

The Assessment surface includes:

- quiz catalog and filters;
- explicit model/version selection;
- separate Practice and Test entry actions;
- question workspace with progress/navigation;
- server feedback in Practice;
- withheld-feedback messaging in Test;
- attempt result/history;
- offline state that disables answer/finalize writes rather than pretending they were saved;
- reconnect refresh from server authority;
- responsive no-overflow behavior at 390×844, 768×1024 and 1366×900.

## Stage15 Security / Correctness Findings Closed

### `STUDENT-015-ASSESSMENT-001` — P1 — RESOLVED / VERIFIED

Problem: no Student-safe runtime contract existed; Admin Quiz detail exposes correctness/direct answers/audit data.

Solution: dedicated Student assessment service/routes over immutable published quiz snapshots, server-owned scoring/session/finalization, no browser scoring authority.

### `STUDENT-015-PUBLISH-002` — P1 — RESOLVED / VERIFIED

Problem: direct Reader/Assessment paths could treat a lesson with future `published_at` as available because some checks required only non-null publication time.

Solution: Student Reader and Assessment now enforce the same canonical Curriculum boundary: `published_at <= now()`. Regression coverage is in `student-publication-time.integration.test.ts`.

### `STUDENT-015-ACCESS-004` — P1 — RESOLVED / VERIFIED

Problem: when entitlement disappeared during an in-progress assessment, backend correctly returned 404, but reconnect UX could leave stale workspace visible.

Solution: Student Web treats `NOT_FOUND` as resource unavailability, exits the workspace, reloads permitted catalog state, and does not incorrectly log the student out.

### `STUDENT-015-UX-003` — P2 — RESOLVED / VERIFIED

Problem: Assessment needed to fit the learning-first hierarchy without turning the account screen into a dashboard.

Solution: Assessment sits after Curriculum and before Access management with explicit Practice/Test policies and honest connectivity states.

### `STUDENT-015-QA-005` — P2 — RESOLVED / VERIFIED

Problem: full-suite integration introduced selector ambiguity and a stale-locator race after React model-selection rerender.

Solution: scope Access refresh selector to its labeled surface and re-resolve the Assessment card/action after model-selection state settles. Standalone and full-suite Chromium now both pass.

## Stage15 Exact Verification

Verified runtime HEAD:

`9a787b7c0f6bd3ed12f24de92546c33fcc21e26d`

Exact same-head runs:

- **Stage14 Student API Regression `34427900263` — SUCCESS**
  - Biome: **104 files checked**, no errors/fixes;
  - API strict typecheck — PASS;
  - API unit: **46/46 PASS**;
  - API build — PASS.
- **Stage15 Student Assessment `34427900257` — SUCCESS**
  - clean PostgreSQL migrations `0001`→`0023` — PASS;
  - Student assessment + future-publication PostgreSQL integration — PASS;
  - real Chromium Stage15 acceptance: **1/1 PASS**.
- **Stage14 Student Product `34427900209` — SUCCESS**
  - Student lint + strict typecheck — PASS;
  - Student Vitest: **15/15 PASS**;
  - production build — PASS;
  - full PostgreSQL migrations `0001`→`0023` — PASS;
  - Curriculum + Reader integration: **2/2 PASS**;
  - full real Chromium suite: **3/3 PASS**.

Production Student bundle from the exact-head Student quality job:

- JS: **200.16 kB raw / 60.78 kB gzip**;
- CSS: **30.84 kB raw / 5.71 kB gzip**;
- index: **0.67 kB raw / 0.40 kB gzip**.

Browser jobs run under `NODE_ENV=test`; their larger Vite bundle is not production bundle evidence.

## Component Classification — Stage15 Closure

| Area | Classification | Closure decision |
|---|---|---|
| Stage13F Question Bank | KEEP | canonical authoring/publication authority |
| Stage13F quiz snapshots | KEEP | canonical immutable assessment content |
| Admin Question Bank/Quiz HTTP | KEEP | remains Admin-only |
| existing practice/session tables | KEEP / IMPROVE | activated as single Student runtime authority |
| `practice_answers` | IMPROVE | direct-answer runtime support added without second store |
| Student assessment API | REBUILD / NEW MINIMAL SURFACE | implemented as safe purpose-built contract |
| Student Practice UI | REBUILD | implemented with server feedback policy |
| Student Test/Model UI | REBUILD | implemented with withheld feedback until finalize |
| browser scoring authority | REMOVE / FORBIDDEN | server remains canonical |

## NOT YET VERIFIED

- Stage16 Offline/PWA durable offline-learning behavior, Service Worker, IndexedDB and sync authority;
- Stage17 Notes/Favorites/Needs Review;
- Stage18 Notifications;
- Stage19 Progress/statistics/private achievements;
- later Stage20+ roadmap work;
- production deployment/cutover.

## Sequence Boundary

- Stage14 — **CLOSED / VERIFIED**.
- Stage15 — **CLOSED / VERIFIED**.
- Stage16 — **NEXT / NOT YET STARTED**.
- Stage17–19 — required later by sequence.
- deployment — deferred.

## Exact Next Action

1. re-read `docs/workstreams/STAGE14_PLUS_STUDENT_TRACK.md`, this status file and latest Issue #16 after Stage15 closure;
2. inspect actual Stage16 offline/PWA contracts and existing service-worker/IndexedDB/sync code before changing anything;
3. classify Stage16 pieces KEEP / IMPROVE / REFACTOR / REBUILD / REMOVE;
4. do not infer offline authority from Stage14/15 temporary network-loss UX;
5. begin Stage16 incrementally only after the source-of-truth boundary is verified.
