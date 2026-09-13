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

#### State inherited

The previous checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c` documented Batch 1 as ACTIVE because its earlier code-head still had long-running CI. Fresh reconciliation began by fetching live `main`, current branch HEAD, all three continuity files, Draft PR #52, original run IDs and current-checkpoint checks before any new mutation.

Received implementation chain:
1. `adc85a6c21eece93560a85febdb2c37e64fe3727` — created feature-owned `apps/admin-web/src/admin/quizzes/QuizMetadataPanel.tsx` with behavior preserved and relative imports adjusted.
2. `6a6360f5c37f96984fe95907783a5ab6e4962557` — `App.tsx` switched `/app/quizzes/metadata` to the feature-owned component.
3. `20c128bb4a2b7166ad1d04d24e4672c93422d38e` — deleted obsolete root `apps/admin-web/src/QuizMetadataPanel.tsx`.
4. `07de0e24475b8af410bf2c213ede2a334062b30c` — documentation checkpoint only; no production-code change.

Classification remains:
- **KEEP:** route `/app/quizzes/metadata`, metadata UX, quiz API calls, lifecycle/status authority.
- **REFACTOR:** physical ownership under `admin/quizzes`.
- **REMOVE:** obsolete root seam.
- **NO CHANGE:** migrations, backend, PostgreSQL, auth/security, Student workstream and quiz business rules.

#### CI reconciliation and blocker resolution

Original exact code-head `20c128bb4a2b7166ad1d04d24e4672c93422d38e`:
- Frontend `34756904661` — SUCCESS.
- Admin AI `34756904665` — SUCCESS.
- Combined `34756904664` — CANCELLED because a newer documentation commit superseded the branch while it was running.
- Stage13G `34756904668` — CANCELLED for the same superseding documentation push.

No failure was found in those cancelled runs. The immediately following current checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c` contains the same production tree plus documentation changes and completed the missing executable evidence:
- Admin AI `34757034197` — SUCCESS.
- Combined `34757034226` — SUCCESS.
- Stage13G `34757034179` — SUCCESS.
- Stage13G checks include Admin UI quality, Admin operations backend, and Real API + PostgreSQL + Chromium — all SUCCESS.

This establishes executable parity for the exact current branch state while preserving the earlier Frontend success on the code-head. No test was removed, skipped or weakened and no backend contract was relaxed.

**Decision: AR-09 Batch 1 = VERIFIED. AR-09 remains ACTIVE.**

### Post-Batch-1 inventory

Current `App.tsx` still has root-owned route surfaces: `AdminAiAuthoringWorkspace`, `AdminReportsWorkspace`, `AiOperationsPage`, `ContentIngestionWorkspace`, `ContentOperationsWorkspace`, `CurriculumWorkspace`, and `LessonAuthoringParityPanel`. Their root placement is an architecture smell but not proof they are dead or safely movable.

For the next candidate, `/app/content/lesson-tools` directly renders `LessonAuthoringParityPanel`. Inspection of that file shows it owns lesson-summary and export UI while using the existing `fetchAdminCurriculum`, `updateLessonSummary` and `exportLessonAuthoring` contracts; it does not itself own PostgreSQL/business authority. Candidate classification before any mutation is therefore pending caller/test confirmation:
- likely **KEEP** behavior/contracts;
- likely **REFACTOR** physical ownership into `admin/content`;
- potential **REMOVE** of the root seam only after route import and executable parity;
- **NO CHANGE** to backend/migrations/Student workstream.

No Batch 2 code is started in this checkpoint because documentation closure itself must settle first under the non-overlap rule.

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

1. Fetch branch HEAD and reconcile any newer commits before mutation.
2. Reconcile CI triggered by the documentation checkpoint that marks Batch 1 VERIFIED. If any required gate is ACTIVE/RUNNING, do not start another seam.
3. If green, confirm all callers/tests for `LessonAuthoringParityPanel` and `/app/content/lesson-tools`.
4. If exclusively route-owned, relocate it under `apps/admin-web/src/admin/content/`, update `App.tsx`, remove the root seam, and preserve API/PostgreSQL/security/Student contracts.
5. Require applicable lint/typecheck/unit/build/Combined/real Chromium exact-head green before calling that batch VERIFIED.
6. Continue one cleanup seam at a time. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
7. PR #52 remains Draft. No merge or auto-merge.
