# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history, merged work and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–2 VERIFIED.**

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
- AR-09 — **ACTIVE**. Batch 1 VERIFIED; Batch 2 VERIFIED; AR-10 remains blocked.
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

### Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED

#### 1. Source-of-truth reconciliation before mutation

This run did not trust prior chat state. It fetched live `main`, current feature HEAD, `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`, recent commits, Draft PR #52 and current exact-head CI first.

- live `main` checked: `c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`.
- inherited feature HEAD: `8e0f46b6cdc5425d2b86bc772e54070be63d7986`.
- PR #52 was confirmed open, Draft and unmerged.
- inherited Batch 1 documentation CI was reconciled through the newest exact head. `8e0f46b...` had successful Admin AI, Combined and Stage13G evidence, including Real API + PostgreSQL + Chromium, so no ACTIVE/RUNNING blocker remained before Batch 2 started.

#### 2. Contracts/callers/tests inspected

Before changing code, the run inspected:
- `apps/admin-web/src/App.tsx` — `/app/content/lesson-tools` directly rendered root `LessonAuthoringParityPanel`.
- `apps/admin-web/src/LessonAuthoringParityPanel.tsx` — uses existing `fetchAdminCurriculum`, `updateLessonSummary`, and `exportLessonAuthoring` contracts; it owns UI state/presentation, not canonical backend authority.
- `apps/admin-web/e2e/admin-parity-closure.e2e.spec.mjs` — real Chromium contract verifies the lesson-tools route, selects a real lesson, saves a summary and checks `contentRevision + 1`, downloads content/history CSV, clears the summary, and checks another revision increment.

No migrations, backend route/service, PostgreSQL constraint, auth/security rule or Student surface needed modification for this ownership cleanup.

#### 3. Classification and decision

- **KEEP:** `/app/content/lesson-tools`, summary edit/save/clear behavior, export behavior, existing server/API contracts and revision authority.
- **IMPROVE:** none required in this batch; this was intentionally ownership-only.
- **REFACTOR:** physical ownership of `LessonAuthoringParityPanel` into `apps/admin-web/src/admin/content/`.
- **REBUILD:** none.
- **REMOVE:** obsolete root implementation only after `App.tsx` pointed at the feature-owned implementation.
- **NO CHANGE:** migrations, backend, PostgreSQL authority, authentication/security, Student workstream.

Root cause addressed: a route-specific content workflow still lived as a root-level seam despite having a clear content feature owner, violating the architecture rule established in AD-ADMIN-029.

#### 4. Files changed and why

Implementation chain:
1. `6f4638deddc57e3c5c2e1185c57054e39f4fbc86` — created `apps/admin-web/src/admin/content/LessonAuthoringParityPanel.tsx`; behavior was preserved byte-for-byte in logic/markup, with only relative imports adjusted for the new owner.
2. `ec7ed60aa106767dddfb423e7c626d93a3fa2cea` — updated `apps/admin-web/src/App.tsx` so `/app/content/lesson-tools` imports the content-owned panel.
3. `d1bf7101135516c751c02d269a384015f9e3a132` — deleted obsolete `apps/admin-web/src/LessonAuthoringParityPanel.tsx` after the route no longer depended on it.

No test was relaxed, skipped or rewritten to make the refactor pass.

#### 5. Exact-head tests and results

Exact code-head: `d1bf7101135516c751c02d269a384015f9e3a132`.

- Frontend Preparation `34759439669` — SUCCESS.
- Admin AI Operations `34759439651` — SUCCESS.
- Combined Integration `34759439615` — SUCCESS.
- Stage13G Admin Operations `34759439612` — SUCCESS.
- Stage13G continues to include Admin UI quality, backend operations, and Real API + PostgreSQL + Chromium verification.

No failing gate remained on the exact code-head.

**Decision: AR-09 Batch 2 = VERIFIED. AR-09 remains ACTIVE.**

#### 6. Documentation and non-overlap checkpoint

The Batch 2 status update begins at documentation commit `bf79dd10dbe019b88e283cf6881a844093cacf50` (`PROJECT_STATUS.md`). Subsequent continuity-file updates advance HEAD and may supersede earlier documentation-only workflow runs. Per the non-overlap rule, no Batch 3 code is allowed until the final documentation HEAD and its exact-head CI are reconciled.

### Remaining cleanup inventory

`App.tsx` still references route-owned root surfaces such as `AdminAiAuthoringWorkspace`, `AdminReportsWorkspace`, `AiOperationsPage`, `ContentIngestionWorkspace`, `ContentOperationsWorkspace`, and `CurriculumWorkspace`. Their root location is not by itself evidence that they should move or be removed.

For the next batch, callers, E2E coverage, API contracts and feature/domain ownership must be inspected first; then select exactly one smallest safe seam.

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

1. Fetch live `main`, current feature HEAD, the three continuity files, recent commits, Draft PR #52 and exact-head CI before any mutation.
2. Reconcile every CI run triggered by the Batch 2 documentation commits; if ACTIVE/RUNNING, do not start code in parallel.
3. If any exact-head gate fails, inspect the failing job/log and fix the root cause without weakening tests, API authority or PostgreSQL/security contracts.
4. If documentation-head gates are green, re-inventory the remaining root route-owned surfaces and inspect callers/tests/contracts for each plausible candidate.
5. Select exactly one smallest safe ownership cleanup; classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE before modifying it.
6. Run exact-head applicable Frontend/Admin AI/Combined/Stage13G verification and document the result before another seam.
7. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
8. PR #52 remains Draft. No merge or auto-merge.
