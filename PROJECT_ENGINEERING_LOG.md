# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged work and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batch 1 VERIFIED.**

## Project and authority invariants

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- Human review/publication/revision/provenance/audit authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.
- Tests must represent canonical production contracts; backend validation is never weakened to satisfy fixtures.

## Binding Admin architecture decisions

- AD-ADMIN-001 — primary work is route-owned and deep-linkable.
- AD-ADMIN-002 — Overview is attention-first.
- AD-ADMIN-003 — Operations owns Health/Audit/Diagnostics.
- AD-ADMIN-004 — technical IDs/provider/runtime/storage/hash/raw JSON are advanced-only.
- AD-ADMIN-005..015 — content/question publication, OCR evidence, contextual AI and Question Bank route ownership remain server-authoritative and parity-first.
- AD-ADMIN-016..025 — Quiz Builder decomposition preserves lifecycle/version/export authority and removes legacy seams only after executable parity.
- AD-ADMIN-026 — Students and Access Codes are separate task owners.
- AD-ADMIN-027 — obsolete Students/Access compatibility aliases are removed after focused parity.
- AD-ADMIN-028 — stage closure requires route ownership plus exact-head executable parity.
- AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; ownership relocation must preserve behavior/contracts and removal waits until the route imports the feature-owned implementation.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **ACTIVE**. Batch 1 VERIFIED; AR-10 remains blocked.
- AR-10 — NOT STARTED.

## AR-09 — Cleanup / architecture enforcement

### Batch 1 — Quiz metadata feature ownership relocation — VERIFIED

#### State inherited and reconciliation

The run began by fetching live `main` (`c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`), branch HEAD (`07de0e24475b8af410bf2c213ede2a334062b30c`), the three continuity files, recent commits, Draft PR #52 and all exact-head quality gates before mutation.

The inherited implementation chain was:
1. `adc85a6c21eece93560a85febdb2c37e64fe3727` — create feature-owned `apps/admin-web/src/admin/quizzes/QuizMetadataPanel.tsx`.
2. `6a6360f5c37f96984fe95907783a5ab6e4962557` — switch `App.tsx` to the feature owner.
3. `20c128bb4a2b7166ad1d04d24e4672c93422d38e` — remove obsolete root `QuizMetadataPanel.tsx`.
4. `07de0e24475b8af410bf2c213ede2a334062b30c` — documentation-only checkpoint.

Classification:
- **KEEP:** `/app/quizzes/metadata`, metadata UX, quiz API calls and lifecycle/status authority.
- **REFACTOR:** physical ownership under `admin/quizzes`.
- **REMOVE:** obsolete root seam.
- **NO CHANGE:** migrations, backend, PostgreSQL, auth/security, Student workstream and quiz business rules.

#### Verification performed

Original code-head `20c128bb4a2b7166ad1d04d24e4672c93422d38e`:
- Frontend `34756904661` — SUCCESS.
- Admin AI `34756904665` — SUCCESS.
- Combined `34756904664` — CANCELLED after the newer documentation push superseded it.
- Stage13G `34756904668` — CANCELLED for the same superseding push.

No failing job was found. Current unchanged-production-code checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c` completed the missing evidence:
- Admin AI `34757034197` — SUCCESS.
- Combined `34757034226` — SUCCESS.
- Stage13G `34757034179` — SUCCESS.
- Stage13G includes Admin UI quality, Admin operations backend, and Real API + PostgreSQL + Chromium — SUCCESS.

No production code, test contract, backend validation, migration or Student code was changed during closure.

**Decision: AR-09 Batch 1 = VERIFIED.**

#### Documentation checkpoint and current blocker

`61ab697e4ddcc263330c0826e0c127594712ca53` recorded the closure across all three continuity files and updated Draft PR #52. That documentation push triggered:
- Stage 13E Admin AI Operations `34758285729` — IN PROGRESS at handoff.
- Stage 13E Combined Integration `34758285717` — IN PROGRESS at handoff.
- Stage 13G Admin Operations `34758285875` — IN PROGRESS at handoff.

Per the non-overlap rule, **no AR-09 Batch 2 code was started** while these gates were active.

### Next candidate inventory

Current `App.tsx` still references several root route owners. The next smallest candidate inspected is `LessonAuthoringParityPanel`, rendered directly by `/app/content/lesson-tools`. It uses existing `fetchAdminCurriculum`, `updateLessonSummary` and `exportLessonAuthoring` contracts and does not define backend authority itself.

Candidate classification remains conditional on caller/test confirmation:
- **KEEP:** summary/export behavior and server contracts.
- **REFACTOR:** physical ownership into `apps/admin-web/src/admin/content/` if exclusive.
- **REMOVE:** root seam only after route import moves and replacement parity is executable.
- **NO CHANGE:** backend/migrations/security/Student workstream.

## Findings register

| ID | Severity | Area | Problem | Status |
|---|---:|---|---|---|
| `ADMIN-001` | P1 | Admin IA | no durable route ownership | FIXED / AR-01 |
| `ADMIN-002` | P1 | Overview | generic metrics vs attention | FIXED / AR-02 |
| `ADMIN-003` | P1 | Curriculum | giant composition | FIXED / AR-03 |
| `ADMIN-004` | P1 | Content publication | task-ID-coupled UI | FIXED / AR-04 |
| `ADMIN-005` | P1 | OCR review | missing visible evidence | FIXED / AR-04 |
| `ADMIN-006` | P1 | AI review | pipeline internals in normal UX | FIXED / AR-05 |
| `ADMIN-007` | P1 | AI authoring | manual internal-ID handoff | FIXED / AR-05 |
| `ADMIN-008` | P1 | Question Bank | giant list/create/edit/review/history owner | FIXED / AR-06 |
| `ADMIN-009` | P1 | Quiz Builder | giant list/create/detail/version/lifecycle/export owner | FIXED / AR-07 |
| `ADMIN-010` | P1 | Students + Access | duplicated giant workspace under two routes | FIXED / AR-08 |
| `ADMIN-011` | P2 | Admin architecture | root-level route-owned components remain outside feature ownership | ACTIVE / AR-09 |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |

## Explicit resume point — AR-09 only

1. Fetch current HEAD and reconcile any newer commit.
2. Reconcile `34758285729`, `34758285717`, and `34758285875` before mutation.
3. On failure, inspect exact failing jobs/logs and fix root cause without weakening tests or server authority.
4. On all-green, inspect all callers/tests for `LessonAuthoringParityPanel` and `/app/content/lesson-tools`.
5. Only if exclusive, relocate it under `apps/admin-web/src/admin/content/`, update `App.tsx`, remove the root seam, and require exact-head executable parity.
6. Continue one cleanup seam at a time. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
7. PR #52 remains Draft. No merge or auto-merge.
