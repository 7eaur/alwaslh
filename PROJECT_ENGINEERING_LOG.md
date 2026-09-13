# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–4A VERIFIED; Batch 5A ACTIVE.**

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
- AR-09 — **ACTIVE**. Batch 1 VERIFIED; Batch 2 VERIFIED; Batch 3 VERIFIED; Batch 4A VERIFIED; Batch 5A ACTIVE.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata feature ownership relocation — VERIFIED. Unchanged-production checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.

## AR-09 Batch 5A — Curriculum route ownership adapter — ACTIVE

### 1. State inherited from task A/B

Before mutation this run:

- live `main` was refreshed to `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`;
- branch HEAD was `faec80191b56833118eda050d19d3b1bb79f7141`;
- `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` were read literally;
- Draft PR #52 was inspected and remained open + Draft, unmerged, with no auto-merge;
- latest branch CI was reconciled before selecting a new cleanup target;
- prior Batch 4A remained fully verified.

### 2. Fresh inventory and evidence

The route table in `apps/admin-web/src/App.tsx` was inspected against root-level Admin surfaces and established feature folders. The fresh inventory found a real architecture seam: `/app/curriculum` still imported `./CurriculumWorkspace`, while `apps/admin-web/src/admin/curriculum/` already exists and owns `CurriculumCreateActions`, `CurriculumStructure`, `curriculum-ui` and curriculum styling.

The root `CurriculumWorkspace.tsx` was inspected. Its behavior is a server-backed orchestration layer over existing curriculum APIs: fetch snapshot, create/update classes, subjects, offerings, sections and lessons, with session-expiry handling and server refresh after mutations. No backend/migration/Student change is required for ownership relocation.

### 3. Classification and decision

- **KEEP:** current route, CRUD semantics, server refresh behavior, selection state, session handling, existing APIs/tests.
- **IMPROVE:** route ownership should resolve through the established Curriculum feature boundary.
- **REFACTOR:** adapter-first ownership only in this batch.
- **REBUILD:** none.
- **REMOVE:** none until parity; root implementation is intentionally retained.
- **NO CHANGE:** migrations, backend authority, PostgreSQL rules, auth/security, Student workstream, test strength.

Root cause: curriculum presentation components had already moved into a feature folder, but the route-level orchestration owner remained app-root-owned.

### 4. Changes made

Commit `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022` — `refactor(admin): route curriculum through feature owner`:

- added `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx` as a temporary adapter re-exporting the root implementation;
- changed `App.tsx` to import `CurriculumWorkspace` from `./admin/curriculum/CurriculumWorkspace`;
- intentionally did not move implementation or delete root `CurriculumWorkspace.tsx` before parity.

Affected files:
- `apps/admin-web/src/App.tsx`
- `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx`

No backend, migration, Student, CSS or test file changed.

### 5. Verification state

Exact code-head: `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022`.

- Frontend Preparation `34766693628` — **SUCCESS**.
- Admin AI Operations `34766693635` — **IN PROGRESS** at checkpoint.
- Combined Integration `34766693638` — **IN PROGRESS** at checkpoint.
- Stage13G Admin Operations `34766693674` — **IN PROGRESS** at checkpoint.

No stage or batch completion is claimed. CI is the current blocker.

### 6. Explicit resume point

1. Re-fetch live `main`, branch HEAD, all continuity docs, PR #52 and exact-head CI.
2. Reconcile `34766693635`, `34766693638`, `34766693674` before any code mutation.
3. If all green, continue the same Curriculum seam only: move the real implementation under `src/admin/curriculum/` with relative-import changes only, retaining root compatibility until exact-head parity.
4. After implementation parity, remove the root seam only after a second exact-head green matrix.
5. If any CI fails, diagnose/root-fix without weakening tests, API contracts or PostgreSQL authority.
6. AR-10 remains blocked until AR-09 is DONE / VERIFIED.
7. Keep PR #52 Draft; no merge or auto-merge.

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
| `ADMIN-011` | P2 | Admin architecture | route-owned components outside established feature ownership | ACTIVE / AR-09; Curriculum seam now in parity-first Batch 5A |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
