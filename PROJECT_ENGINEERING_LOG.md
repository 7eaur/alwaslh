# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–5A VERIFIED.**

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
- AR-09 — **ACTIVE**. Batches 1, 2, 3, 4A and 5A VERIFIED.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata feature ownership relocation — VERIFIED. Unchanged-production checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools feature ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports feature ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review route + implementation ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum route + implementation ownership relocation and root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.

## AR-09 Batch 5A — Curriculum ownership relocation — DONE / VERIFIED

### 1. State read before mutation

The run explicitly refreshed and read:

1. live `main` = `0c7c9f9c5e4ec6ae020484a9a4892eaf3b8b5194`;
2. inherited branch HEAD = `7b77037d1906418a6713eef191706deed29ddf09`;
3. `PROJECT_STATUS.md`;
4. `PROJECT_ENGINEERING_LOG.md`;
5. `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
6. recent commits and Draft PR #52, which remained open + Draft + unmerged;
7. exact-head CI for the inherited Batch 5A adapter state.

### 2. CI reconciliation before code

The inherited adapter code-head `39da6e1ea0bb542e2d23f15d8e4c119cdb3c2022` had:

- Frontend `34766693628` — SUCCESS;
- Admin AI `34766693635` — SUCCESS;
- Combined `34766693638` — SUCCESS;
- Stage13G `34766693674` — CANCELLED because the branch advanced to documentation, not because a quality test failed.

The successor exact documentation-head `7b77037d1906418a6713eef191706deed29ddf09` was then inspected and its replacement matrix was green, including Admin AI `34766824063`, Combined `34766824029`, and Stage13G `34766824068` with real API/PostgreSQL/Chromium coverage. This resolved the inherited ACTIVE/RUNNING ambiguity before code work.

### 3. Contracts/callers inspected

The root `apps/admin-web/src/CurriculumWorkspace.tsx` and the feature adapter `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx` were read. The implementation was confirmed to orchestrate existing server-backed curriculum contracts only: snapshot fetch; class/subject/offering/section/lesson create/update; session-expiry handling; server refresh after mutation. Existing feature children (`CurriculumCreateActions`, `CurriculumStructure`, `curriculum-ui`, `curriculum.css`) already lived under `src/admin/curriculum/`.

No migration or backend contract needed modification. Student code was out of scope and untouched.

### 4. Classification and decision

- **KEEP:** route, CRUD semantics, state/selection flow, session handling, server refresh, API/PostgreSQL authority and tests.
- **IMPROVE:** route-level implementation ownership.
- **REFACTOR:** relocate implementation under established Curriculum feature owner.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam after parity only.
- **NO CHANGE:** backend, migrations, auth/security, Student workstream and test strength.

Root cause: the Curriculum presentation pieces had already become feature-owned, but the route-level orchestration implementation remained app-root-owned.

### 5. Implementation relocation

Commit `c06f9dc0a58203f3a5f70f9f47641eadcbd71464` — `refactor(admin): move curriculum workspace into feature owner`:

- replaced the feature adapter with the real `CurriculumWorkspace` implementation at `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx`;
- changed only relative import paths needed by the relocation;
- intentionally left `apps/admin-web/src/CurriculumWorkspace.tsx` intact as a temporary compatibility/parity seam;
- changed no backend, migration, Student, CSS behavior, business rule or test assertion.

### 6. First exact-head parity proof

For `c06f9dc0a58203f3a5f70f9f47641eadcbd71464`:

- Frontend `34768120218` — SUCCESS;
- Admin AI `34768120359` — SUCCESS;
- Combined `34768120260` — SUCCESS;
- Stage13G `34768120244` — SUCCESS.

Only after this full matrix became green was root-seam removal allowed.

### 7. Compatibility seam removal

Commit `d40c71192f513f18d69b0e67be408e6f146a3ec5` — `refactor(admin): remove root curriculum compatibility seam`:

- deleted `apps/admin-web/src/CurriculumWorkspace.tsx`;
- left the route and canonical implementation owned by `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx`;
- made no other production behavior change.

### 8. Second exact-head verification

For final Batch 5A code-head `d40c71192f513f18d69b0e67be408e6f146a3ec5`:

- Frontend Preparation `34768283004` — SUCCESS;
- Admin AI Operations `34768282985` — SUCCESS;
- Combined Integration `34768283077` — SUCCESS;
- Stage13G Admin Operations `34768282982` — SUCCESS, including the existing backend/admin UI and real-browser coverage.

Result: **AR-09 Batch 5A DONE / VERIFIED.**

### 9. Explicit resume point

1. Re-fetch live `main`, branch HEAD, the three continuity docs, Draft PR #52 and exact-head CI.
2. Confirm this documentation checkpoint has no unresolved CI/state newer than the verified code-head.
3. Run a fresh AR-09 inventory of remaining app-root route-owned Admin surfaces plus callers/tests/contracts.
4. Do not assume a Batch 5B exists. If no justified architecture seam remains, move directly to final AR-09 verification and formal closure.
5. If one justified seam remains, take only the smallest reviewable one and preserve server/PostgreSQL/Student/test authority.
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
| `ADMIN-011` | P2 | Admin architecture | route-owned components outside established feature ownership | ACTIVE / AR-09; Curriculum Batch 5A fixed, fresh inventory required |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
