# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-14 — AR-01 through AR-09 DONE / VERIFIED. AR-10 NEXT / NOT STARTED.**

## Project and authority invariants

- `apps/student-web` — parallel Student product; not owned by this Admin workstream.
- `apps/admin-web` — Super Admin product under staged rebuild.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- Human review/publication/revision/provenance/audit authority remains server-owned.
- Student/audit work must not be overwritten by the Admin rebuild.
- Tests represent canonical production contracts; backend validation is never weakened to satisfy fixtures.

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
- AD-ADMIN-029 — once a route-specific Admin surface has an established feature owner and no compatibility caller requires a root seam, its implementation belongs under `apps/admin-web/src/admin/<feature>/`; relocation preserves behavior/contracts and removal waits until executable parity.

## Super Admin stage ledger

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — **DONE / VERIFIED** on `c755b209bfa67980afee0ed150bd43b3574b0a3b`; Frontend `34789114130`, Admin AI `34789114112`, Combined `34789114110`, Stage13G `34789114192` — SUCCESS.
- AR-10 — **NEXT / NOT STARTED**.

## AR-09 verified history summary

- Batch 1 — Quiz metadata ownership relocation — VERIFIED; checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review page ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum ownership + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review ownership + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.
- Batch 7A — Content ingestion ownership + root seam removal — VERIFIED; Frontend `34778944908`; descendant `803e9b55c2496998358cf257a959bc4a6799a90f` completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS.
- Batch 8A — Lesson Publication ownership + root seam removal — VERIFIED through descendant `998ab1efa5ede52cead73b075d890542e1d5adba`; Admin AI `34783495895`, Combined `34783495898`, Stage13G `34783495896` — SUCCESS.
- Batch 9A — AI Review presentation ownership + root seam removal — VERIFIED on `8c6a42923f93087dd3edfdaee6987f967530aabf`; Frontend `34786995492`, Admin AI `34786995470`, Combined `34786995525`, Stage13G `34786995546` — SUCCESS, including Real API + PostgreSQL + Chromium `103804299795`.

## 2026-09-14 — AR-09 Batch 10A caller-switch checkpoint

### A. State received from task A / prior continuation

The inherited documented production code-head was `8a5cbd680f74062acb47ec7244095e3881f6161c`, with Batch 10A feature-owner seam already verified and `App.tsx` switched to import `./admin/ai-authoring/AdminAiAuthoringWorkspace`. The only documented blocker was the still-running caller-switch matrix: Frontend `34787423102`, Admin AI `34787423098`, Combined `34787423110`, Stage13G `34787423158`.

Branch HEAD at start of that continuation was documentation descendant `dd0a12b758fe7a3e657d576a7441e19e58f898cb`. Live `main` was `43649391e7fc3526c0ef0a27720e50271fb52e9d`; parallel Student work was not modified.

### B. Verification performed before production mutation

The continuation re-read live `main`, Admin branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head Actions. Draft PR #52 remained open, Draft, unmerged, with no auto-merge action.

### C. Caller-switch exact-head result

All four exact production code-head workflows for `8a5cbd680f74062acb47ec7244095e3881f6161c` completed SUCCESS:
- Frontend `34787423102`;
- Admin AI `34787423098`;
- Combined `34787423110`;
- Stage13G `34787423158`.

Stage13G jobs: backend `103805322189`, Admin UI `103805322285`, Real API + PostgreSQL + Chromium `103805476116` — all SUCCESS.

Decision: **Batch 10A caller switch VERIFIED.**

### D. Classification after caller-switch proof

- **KEEP:** generation/regeneration/archive/export behavior, API contracts, auth/session, server/PostgreSQL authority, tests.
- **IMPROVE:** dependency direction and route-owned source placement.
- **REFACTOR:** relocate the real `AdminAiAuthoringWorkspace` implementation under `apps/admin-web/src/admin/ai-authoring/`, preserve root compatibility re-export temporarily, then remove it only after parity.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after relocation parity and caller proof.

## 2026-09-14 — AR-09 Batch 10A completion + final cleanup

### A. State inherited at this execution

The shared docs described Batch 10A caller switch as VERIFIED and implementation relocation as the first permitted production action. Branch documentation HEAD was `52bf059b882e0927cadbaf3b519f78625827eb52`. Its Admin AI, Combined and Stage13G gates were checked and green before mutation. Live `main` remained `43649391e7fc3526c0ef0a27720e50271fb52e9d` and was untouched.

### B. Implementation relocation decision and change

Classification remained KEEP behavior/contracts/server authority/tests, IMPROVE ownership/dependency direction, REFACTOR implementation placement, REMOVE only compatibility seams after proof.

Commit `a1d87bb31dd0cc36efb29854075fb9bd9abbd705`:
- moved the real implementation into `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx`;
- changed only relative imports to existing root shared API/style modules;
- kept `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx` temporarily as a compatibility re-export;
- changed no routes, behavior, backend, migrations, API contracts, Student code or tests.

Exact-head relocation parity:
- Frontend `34788603353` — SUCCESS;
- Admin AI `34788603354` — SUCCESS;
- Combined `34788603377` — SUCCESS;
- Stage13G `34788603350` — SUCCESS.

Stage13G jobs: backend `103808542366`, Admin UI `103808542497`, Real API + PostgreSQL + Chromium `103808700176` — SUCCESS.

### C. Root AI Authoring seam removal

After green relocation parity and proof that `App.tsx` imports the feature owner directly, commit `fdbbe7f6c06e2e6138c97793934d3f120f95604a` deleted only `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx`.

Exact-head seam-removal parity:
- Frontend `34788799234` — SUCCESS;
- Admin AI `34788799271` — SUCCESS;
- Combined `34788799237` — SUCCESS;
- Stage13G `34788799243` — SUCCESS.

Stage13G jobs: Admin UI `103809064466`, backend `103809064595`, Real API + PostgreSQL + Chromium `103809203781` — SUCCESS.

Decision: **Batch 10A DONE / VERIFIED.**

### D. Fresh AR-09 inventory

A fresh root/router inventory was performed after Batch 10A. It confirmed current routes are feature-owned under `src/admin/*`, while three remaining root implementations were no longer imported by the router and had established replacements:
- `AdminGovernanceWorkspace.tsx` — superseded by focused Operations/Settings/Security feature routes;
- `AdminOperationsWorkspace.tsx` — superseded by `admin/operations/*` owners;
- `AiOperationsWorkspace.tsx` — superseded by `admin/reviews/AiOperationsPage.tsx` + local `AiReviewWorkspace`.

Classification:
- **KEEP:** feature-owned route surfaces, shared APIs/styles, backend/PostgreSQL authority, tests.
- **REMOVE:** the three superseded root workspace implementations as dead legacy.
- **REBUILD:** none.

Commit `c755b209bfa67980afee0ed150bd43b3574b0a3b` removed only those three root files. No backend, migration, Student or test source was changed.

Post-change root inventory contains no remaining root `*Workspace.tsx` route-owner files; remaining root modules are shared/bootstrap/API/style/test components.

### E. Final AR-09 exact-head verification

Production exact-head `c755b209bfa67980afee0ed150bd43b3574b0a3b` completed the full required matrix green:
- Frontend `34789114130` — SUCCESS;
- Admin AI `34789114112` — SUCCESS;
- Combined `34789114110` — SUCCESS;
- Stage13G `34789114192` — SUCCESS.

Stage13G evidence:
- backend `103809925133` — SUCCESS: API lint, strict typecheck, unit tests, build, clean PostgreSQL migrations, DB contracts, integrations and auth regression;
- Admin UI `103809925136` — SUCCESS: Admin lint, strict typecheck, unit tests and production build;
- Real API + PostgreSQL + Chromium `103810061281` — SUCCESS: verified source builds, clean migrations, deterministic fixtures and real Admin Chromium suite.

Decision: **AR-09 DONE / VERIFIED.** `ADMIN-011` is closed. No test weakening or Student regression was introduced.

### F. Documentation/transition state

`PROJECT_STATUS.md`, this log and `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` are being synchronized to the verified AR-09 result. Because documentation writes create a newer docs-only branch head, AR-10 must not begin until the next task first closes the exact-head CI for that documentation checkpoint.

### G. Explicit resume point for task A

1. Re-fetch live `main`, `rebuild/super-admin-foundation` HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-01 through AR-09 as DONE / VERIFIED; do not redo AR-09 without new evidence.
3. First close any CI still active on the latest documentation-only head.
4. If that exact-head is green, begin **AR-10 only — A11y / RTL / performance / visual QA**.
5. Derive AR-10 work from actual current UI/tests/contracts, classify before mutation, and make the smallest reviewable batch.
6. Preserve Student isolation, backend/PostgreSQL authority and test strength.
7. Keep PR #52 Draft; no merge or auto-merge.
8. After AR-10 exact-head green, proceed to final verification only; after all final gates are green, stop changes and mark review/merge-ready.

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
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | FIXED / AR-09 — exact-head `c755b209bfa67980afee0ed150bd43b3574b0a3b` green |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
