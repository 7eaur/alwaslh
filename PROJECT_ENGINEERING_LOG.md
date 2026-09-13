# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–2 VERIFIED; Batch 3A ACTIVE pending exact-head Combined + Stage13G.**

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
- AR-09 — **ACTIVE**. Batch 1 VERIFIED; Batch 2 VERIFIED; Batch 3A ACTIVE.
- AR-10 — NOT STARTED.

## AR-09 — Cleanup / architecture enforcement

### Batch 1 — Quiz metadata feature ownership relocation — VERIFIED

Implementation chain: `adc85a6c21eece93560a85febdb2c37e64fe3727` → `6a6360f5c37f96984fe95907783a5ab6e4962557` → `20c128bb4a2b7166ad1d04d24e4672c93422d38e`. Unchanged-production checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c` completed Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS. No backend/migration/Student authority changed.

### Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED

Implementation chain: `6f4638deddc57e3c5c2e1185c57054e39f4fbc86` → `ec7ed60aa106767dddfb423e7c626d93a3fa2cea` → `d1bf7101135516c751c02d269a384015f9e3a132`. Exact-head Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS, including real API + PostgreSQL + Chromium. No tests were weakened and no backend/migration/Student files changed.

### Batch 3A — Access-code reports route ownership adapter — ACTIVE

#### 1. State inherited from task A and reconciliation

The run began from documentation HEAD `1b2915c00ee8818d467e1ef7fdc114366efdfb43`, after fetching live `main` (`c5ccbc9b0d0e88ef8798bbae6a3cc0bf933b5a7e`), branch HEAD, all three continuity files, recent state, Draft PR #52 and exact-head CI.

Inherited documentation said AR-09 Batches 1–2 were VERIFIED and explicitly blocked new mutation until these documentation-head runs were reconciled. Fresh verification established:
- Admin AI `34759659708` — SUCCESS.
- Combined `34759659619` — SUCCESS.
- Stage13G `34759659630` — SUCCESS.

PR #52 was confirmed open, Draft and unmerged. No active inherited CI blocker remained before Batch 3A was selected.

#### 2. Inventory, callers, tests and contracts inspected

The remaining root route-owned inventory included `AdminAiAuthoringWorkspace`, `AdminReportsWorkspace`, `AiOperationsPage`, `ContentIngestionWorkspace`, `ContentOperationsWorkspace`, and `CurriculumWorkspace`. Root location alone was not treated as evidence for removal.

`AdminReportsWorkspace` was selected only after inspection because it is a small, bounded access-code feature seam:
- `App.tsx` routed only `/app/access-codes/reports` to the root workspace.
- the workspace calls existing `fetchAdminCurriculum`, `fetchAllAccessCodesForExport`, and `importFullAccessCodes` contracts and existing CSV helpers; canonical access-code authority remains server/PostgreSQL-owned.
- `apps/admin-web/e2e/admin-reports.e2e.spec.mjs` already provides real Stage13G browser parity: row-level CSV import validation, selected-code export, print selection, 390px no-overflow, and session-expiry behavior.

No migration, backend route/service, PostgreSQL constraint, auth/security contract or Student surface required modification.

#### 3. Classification and decision

- **KEEP:** `/app/access-codes/reports`, import/export/print behavior, session-expiry handling, API/PostgreSQL authority, and existing E2E contract.
- **IMPROVE:** make the route owner explicit under `admin/access-codes`.
- **REFACTOR:** `App.tsx` route ownership through a feature-owned page adapter first, before moving the full implementation.
- **REBUILD:** none.
- **REMOVE:** root `AdminReportsWorkspace.tsx` only after executable parity proves the feature owner and the full implementation is relocated safely.
- **NO CHANGE:** migrations, backend authority, PostgreSQL integrity, auth/security, Student workstream, test strength.

Root cause addressed in this sub-batch: the access-code reports route was still directly coupled from `App.tsx` to a root implementation instead of having a feature owner consistent with AD-ADMIN-029.

#### 4. Changes made and why

Exact code-head: `6e7e43e17651d54413ccf6cc234f4e1457942a25` (`refactor(admin): route access-code reports through feature owner`).

Files affected:
1. `apps/admin-web/src/admin/access-codes/AdminAccessCodeReportsPage.tsx` — added as a temporary feature-owned route adapter exporting the existing `AdminReportsWorkspace` implementation under access-code ownership.
2. `apps/admin-web/src/App.tsx` — removed the direct root `AdminReportsWorkspace` import, imported `AdminAccessCodeReportsPage`, and routed `/app/access-codes/reports` through it.

Deliberately unchanged:
- root `AdminReportsWorkspace.tsx` remains the compatibility implementation for this checkpoint;
- `admin-reports.e2e.spec.mjs` was not weakened or altered;
- no backend/migration/PostgreSQL/Student files changed.

This staging is intentional: route ownership is established first, exact-head parity is required, then the implementation may be physically relocated and the root seam removed in the next sub-batch.

#### 5. Exact-head tests and current results

For `6e7e43e17651d54413ccf6cc234f4e1457942a25`:
- Frontend Preparation `34761018736` — SUCCESS.
- Admin AI Operations `34761018755` — SUCCESS.
- Combined Integration `34761018762` — IN PROGRESS at the last check.
- Stage13G Admin Operations `34761018720` — QUEUED at the last check.

There is no observed failing gate at this checkpoint, but the exact-head matrix is not complete. Therefore **Batch 3A remains ACTIVE and must not be declared VERIFIED**.

#### 6. Non-overlap decision

No further code mutation was performed after `6e7e43e...` because Combined and Stage13G are still active/not completed. The root compatibility seam was intentionally retained. AR-10 remains blocked.

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

## Explicit resume point — AR-09 Batch 3A only

1. Fetch live `main`, current feature HEAD, the three continuity files, recent commits, Draft PR #52 and exact-head CI before mutation.
2. Reconcile Combined `34761018762` and Stage13G `34761018720` for exact code-head `6e7e43e17651d54413ccf6cc234f4e1457942a25`; Frontend `34761018736` and Admin AI `34761018755` are already SUCCESS.
3. If a remaining gate fails, inspect its exact job/log and repair root cause without weakening tests or server/PostgreSQL authority.
4. If all four gates are green, record Batch 3A VERIFIED, then continue the same access-code reports seam only: relocate the actual implementation (and route-specific CSS only if ownership inspection confirms it is exclusive) under `src/admin/access-codes/`, adjust relative imports, remove the root compatibility file only after callers are clean, and run exact-head Frontend/Admin AI/Combined/Stage13G including real reports Chromium parity.
5. Do not choose another cleanup candidate before the current reports seam is closed.
6. AR-10 remains blocked until AR-09 is fully DONE / VERIFIED.
7. PR #52 remains Draft; no merge or auto-merge.
