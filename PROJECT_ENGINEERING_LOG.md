# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–5A VERIFIED; Batch 6A ACTIVE.**

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
- AR-09 — **ACTIVE**. Batches 1, 2, 3, 4A and 5A VERIFIED; Batch 6A ACTIVE.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata feature ownership relocation — VERIFIED. Unchanged-production checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum route + implementation ownership relocation and root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.

## AR-09 Batch 5A — Curriculum ownership relocation — DONE / VERIFIED

The previous task reconciled the inherited Curriculum adapter state, relocated the actual route orchestration into `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx`, proved exact-head parity on `c06f9dc0a58203f3a5f70f9f47641eadcbd71464`, then removed the root compatibility seam on `d40c71192f513f18d69b0e67be408e6f146a3ec5`. The final matrix was Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — all SUCCESS. No backend, migration, Student or test-strength change was made.

## AR-09 Batch 6A — Content review ownership relocation — ACTIVE

### 1. State received from task A / previous checkpoint

Before mutation this run explicitly refreshed and read:

1. live `main` = `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`;
2. inherited branch HEAD = `be4ee52aa99440b591930f37f35586c99324cc85`;
3. `PROJECT_STATUS.md`;
4. `PROJECT_ENGINEERING_LOG.md`;
5. `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
6. recent commits and Draft PR #52, which remained open + Draft + unmerged;
7. exact-head CI for the inherited checkpoint.

The inherited checkpoint CI was confirmed fully green before code work. Therefore there was no ACTIVE/RUNNING batch, no unresolved newer commit and no unfinished task-A mutation to reconcile.

### 2. Fresh AR-09 inventory and contracts inspected

The fresh root/route inventory inspected `apps/admin-web/src/App.tsx`, `apps/admin-web/src/ContentOperationsWorkspace.tsx`, the established `apps/admin-web/src/admin/reviews/` owner and existing CI/test authority.

Finding: `/app/reviews/content` still directly imported the root `ContentOperationsWorkspace`, even though Reviews already had an established feature owner. The root implementation is route-specific and owns UI orchestration for server-backed content/OCR review: content overview/detail loading, filtering/pagination, OCR extraction loading, human approve/reject, replacement text, session-expiry handling and server refresh. It uses existing `admin-api` / `content-operations-api` contracts and does not require any schema/backend change.

No migration, backend authority or Student-workstream change was justified.

### 3. Classification and decision

- **KEEP:** `/app/reviews/content`, current UX semantics, OCR human-review decisions, source/detail flows, filter/pagination behavior, session expiry, server refresh, API/PostgreSQL authority and tests.
- **IMPROVE:** ownership under the existing Reviews feature boundary.
- **REFACTOR:** introduce a parity adapter, route through that owner, then relocate the real implementation only after executable parity.
- **REBUILD:** none.
- **REMOVE:** the app-root compatibility seam only after the relocated implementation passes exact-head gates.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

Root cause: AR-05 established Reviews as a route-owned feature, but one content-review orchestration surface remained app-root-owned while the AI-review sibling had already moved under `src/admin/reviews/`.

### 4. Adapter-first implementation

Commit `a8efe7d7c0a811d0b03e25741c1881d87874b79b` — `refactor(admin): add content review feature ownership adapter`:

- added `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx`;
- exported the existing root `ContentOperationsWorkspace` through a temporary Reviews-owned adapter;
- changed no runtime behavior, backend contract, migration, Student code or test assertion.

### 5. Adapter exact-head parity proof

For `a8efe7d7c0a811d0b03e25741c1881d87874b79b`:

- Frontend Preparation `34769685084` — SUCCESS;
- Admin AI Operations `34769685033` — SUCCESS;
- Combined Integration `34769685141` — SUCCESS;
- Stage13G Admin Operations `34769685089` — SUCCESS.

Only after this matrix became green was route wiring changed.

### 6. Route ownership wiring

Commit `a22795d1ebfee861e3ca6e8d0a1502e09206ee9d` — `refactor(admin): route content reviews through feature owner`:

- `App.tsx` now imports `ContentOperationsPage` from `./admin/reviews/ContentOperationsPage`;
- `/app/reviews/content` renders that feature-owned entry point;
- the direct root import from `App.tsx` was removed;
- the root implementation was deliberately retained as the adapter target until a separate relocation parity proof exists.

### 7. Route-wiring exact-head verification

For `a22795d1ebfee861e3ca6e8d0a1502e09206ee9d`:

- Frontend Preparation `34769885941` — SUCCESS;
- Admin AI Operations `34769885857` — SUCCESS;
- Combined Integration `34769885894` — SUCCESS;
- Stage13G Admin Operations `34769885845` — SUCCESS.

This proves the feature route seam without weakening any production rule or test.

### 8. Files affected in this code batch

- `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` — new temporary parity adapter.
- `apps/admin-web/src/App.tsx` — route/import ownership only.

No backend, migration, database, Student, auth/security or test file was changed.

### 9. Current phase state / blocker

**AR-09 Batch 6A remains ACTIVE, not COMPLETE.** There is no failing test blocker. The intentional remaining seam is `apps/admin-web/src/ContentOperationsWorkspace.tsx`, which still contains the real implementation. It must not be deleted until the implementation is moved into the Reviews owner and the moved implementation passes an exact-head matrix.

### 10. Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity docs, Draft PR #52 and exact-head CI.
2. Confirm no concurrent commit or active run supersedes the documented state.
3. Continue **this same Batch 6A only**: replace the adapter in `apps/admin-web/src/admin/reviews/ContentOperationsPage.tsx` with the real content-review implementation, adjusting relative imports only and preserving behavior/contracts.
4. Keep the root `ContentOperationsWorkspace.tsx` temporarily during this parity step.
5. Run the full exact-head Frontend/Admin AI/Combined/Stage13G matrix; do not remove the root seam until green.
6. After green parity, delete the root compatibility file and run a second exact-head matrix.
7. Then perform a fresh root/route ownership inventory. If no justified AR-09 seam remains, formally close AR-09 on exact-head green before AR-10.
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
| `ADMIN-011` | P2 | Admin architecture | route-owned components outside established feature ownership | ACTIVE / AR-09; Curriculum fixed; Content Review route ownership established in Batch 6A, real implementation relocation pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
