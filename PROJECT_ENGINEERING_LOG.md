# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–6A VERIFIED; Batch 7A is the next justified cleanup seam.**

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
- AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; relocation must preserve behavior/contracts and removal waits until executable parity.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **ACTIVE**. Batches 1, 2, 3, 4A, 5A and 6A VERIFIED; Batch 7A next.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata feature ownership relocation — VERIFIED. Checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum route + implementation ownership relocation and root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review route + real implementation ownership relocation and root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.

## AR-09 Batch 6A — Content review ownership relocation — DONE / VERIFIED

### 1. State read and reconciled before code changes

The run explicitly refreshed and read the live repository before mutation:

1. live `main` = `3fe51062aa9c5ed0c39682f0da8e814ece0b0c62`;
2. inherited branch HEAD = `0846aa2cebde010dd1544e3361c4089ae72a0da2`;
3. `PROJECT_STATUS.md`;
4. `PROJECT_ENGINEERING_LOG.md`;
5. `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
6. recent commits;
7. Draft PR #52, which remained open + Draft + unmerged;
8. exact-head CI for the inherited documentation checkpoint.

Inherited exact-head evidence on `0846aa2cebde010dd1544e3361c4089ae72a0da2`:
- Admin AI `34770167069` — SUCCESS;
- Combined `34770166985` — SUCCESS;
- Stage13G `34770167023` — SUCCESS.

Therefore no unresolved ACTIVE/RUNNING batch or newer undocumented mutation blocked continuation.

### 2. Contracts and implementation inspected

The run inspected:
- `apps/admin-web/src/App.tsx` route ownership;
- root `apps/admin-web/src/ContentOperationsWorkspace.tsx`;
- temporary `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` adapter;
- the existing Reviews feature boundary;
- exact-head CI authority for the route seam.

The root component was confirmed to be the real route-specific content/OCR human-review implementation: overview/detail fetch, filters/pagination, source preview, OCR extraction loading, replacement text, human approve/reject, session-expiry handling and server refresh. It consumed existing `admin-api` and `content-operations-api` contracts. No schema/backend change was needed.

### 3. Classification and decision

- **KEEP:** route behavior, OCR review semantics, filters/pagination, detail/source flow, session handling, API/PostgreSQL authority and tests.
- **IMPROVE:** implementation ownership under the established Reviews domain.
- **REFACTOR:** relocate the real implementation with relative import/export adjustments only.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after executable parity.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

Root cause: route ownership had already moved to `admin/reviews`, but the actual orchestration implementation still lived at app root behind a temporary adapter.

### 4. Real implementation relocation

Commit `b3580fcac2a8f9536e86d993e035af1262b34ca4` — `refactor(admin): relocate content review implementation`:

- replaced the temporary feature adapter with the full implementation in `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx`;
- adjusted imports from root-relative paths to `../../...` paths required by the new location;
- renamed the exported component to `ContentOperationsPage`;
- deliberately kept `apps/admin-web/src/ContentOperationsWorkspace.tsx` during this first parity run;
- changed no API, backend, migration, Student or test assertion.

Exact-head matrix on `b3580fcac2a8f9536e86d993e035af1262b34ca4`:
- Frontend Preparation `34771348426` — SUCCESS;
- Admin AI Operations `34771348425` — SUCCESS;
- Combined Integration `34771348397` — SUCCESS;
- Stage13G Admin Operations `34771348464` — SUCCESS.

### 5. Root compatibility seam removal

Only after the relocation matrix became fully green, commit `2a958723d434e10755d35299ba509f69fc411bb3` — `refactor(admin): remove content review root seam` deleted:

- `apps/admin-web/src/ContentOperationsWorkspace.tsx`.

No other code or contract changed in that commit.

Second exact-head matrix on `2a958723d434e10755d35299ba509f69fc411bb3`:
- Frontend Preparation `34771526703` — SUCCESS;
- Admin AI Operations `34771526711` — SUCCESS;
- Combined Integration `34771526699` — SUCCESS;
- Stage13G Admin Operations `34771526724` — SUCCESS.

This satisfies the parity-first removal rule. Batch 6A is **DONE / VERIFIED**.

### 6. Files changed in Batch 6A finalization

- `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` — temporary adapter replaced by real implementation.
- `apps/admin-web/src/ContentOperationsWorkspace.tsx` — removed only after exact-head parity.

No backend, database migration, Student, auth/security or test file changed.

## Fresh AR-09 inventory after Batch 6A

After the second exact-head matrix became green, the run re-inventoried app-root route owners and `App.tsx` instead of assuming AR-09 was complete.

Confirmed route-owned feature surfaces already under feature owners include Reviews, Curriculum, Question Bank, Quiz Builder, Students, Access Codes and Operations. However `/app/content` still imports `ContentIngestionWorkspace` directly from app root:

- route: `apps/admin-web/src/App.tsx` → `<ContentIngestionWorkspace ... />`;
- implementation: `apps/admin-web/src/ContentIngestionWorkspace.tsx`;
- established feature owner: `apps/admin-web/src/admin/content/`.

The first section of the implementation confirms it owns server-backed content-ingestion orchestration: curriculum fetch, ingestion history/task fetch, upload/process/link/archive operations, validation and lesson-publication composition. This is a route-specific Content surface rather than a shared shell primitive.

### Next-batch classification

- **KEEP:** `/app/content` semantics, file validation, task lifecycle, history/detail behavior, upload/process/link/archive flows, lesson publication, session expiry, API/PostgreSQL authority and tests.
- **IMPROVE:** Content feature ownership.
- **REFACTOR:** parity-first owner introduction, route wiring, real implementation relocation.
- **REBUILD:** none identified.
- **REMOVE:** app-root compatibility seam only after green exact-head parity.
- **NO CHANGE:** backend, migrations, Student workstream, auth/security and test strength.

The smallest justified next work is **AR-09 Batch 7A — Content ingestion ownership relocation**. It was intentionally not started in this run because Batch 6A itself was the small reviewable code batch and its final documentation/CI checkpoint must be established first.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI.
2. Confirm the Batch 6A documentation checkpoint is current and there is no newer ACTIVE/RUNNING work.
3. Do not redo Batch 6A; its final verified code-head is `2a958723d434e10755d35299ba509f69fc411bb3`.
4. Begin **AR-09 Batch 7A only** by inspecting the complete `ContentIngestionWorkspace` implementation, its callers, tests, APIs and `LessonPublicationPanel` dependency.
5. Establish a Content-owned seam under `apps/admin-web/src/admin/content/` and require exact-head parity before route switching/implementation removal, following AD-ADMIN-029.
6. Preserve server/PostgreSQL authority, Student isolation and test strength.
7. After Batch 7A is verified, perform another fresh AR-09 inventory; do not start AR-10 until AR-09 is formally DONE / VERIFIED.
8. Keep PR #52 Draft; no merge or auto-merge.

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
| `ADMIN-008` | P1 | Question Bank | giant owner | FIXED / AR-06 |
| `ADMIN-009` | P1 | Quiz Builder | giant owner | FIXED / AR-07 |
| `ADMIN-010` | P1 | Students + Access | duplicated giant workspace | FIXED / AR-08 |
| `ADMIN-011` | P2 | Admin architecture | route-owned components outside established feature ownership | ACTIVE / AR-09; Curriculum + Content Review fixed; Content Ingestion is next justified seam |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
