# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-14 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE. Batches 1–9A VERIFIED. Batch 10A AI Authoring ownership ACTIVE; caller switch VERIFIED; implementation relocation is next.**

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
- AR-09 — **ACTIVE**. Batches 1–9A VERIFIED; Batch 10A caller switch VERIFIED, implementation relocation pending.
- AR-10 — NOT STARTED.

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

## 2026-09-14 — AR-09 Batch 10A continuation

### A. State received from task A / prior continuation

The inherited documented production code-head was `8a5cbd680f74062acb47ec7244095e3881f6161c`, with Batch 10A feature-owner seam already verified and `App.tsx` switched to import `./admin/ai-authoring/AdminAiAuthoringWorkspace`. The only documented blocker was the still-running caller-switch matrix: Frontend `34787423102`, Admin AI `34787423098`, Combined `34787423110`, Stage13G `34787423158`.

Branch HEAD at start of this continuation was documentation descendant `dd0a12b758fe7a3e657d576a7441e19e58f898cb`. Live `main` had advanced independently to `43649391e7fc3526c0ef0a27720e50271fb52e9d`; this is parallel Student work and was not modified.

### B. Verification performed before any production mutation

The continuation re-read, before mutation:
- live `main` and Admin branch HEAD;
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md`;
- recent commits;
- Draft PR #52;
- exact-head Actions for the documented caller switch.

Draft PR #52 remained open, Draft, unmerged, and with no auto-merge action performed.

### C. Caller-switch exact-head result

All four exact production code-head workflows for `8a5cbd680f74062acb47ec7244095e3881f6161c` completed SUCCESS:
- Frontend `34787423102` — SUCCESS;
- Admin AI `34787423098` — SUCCESS;
- Combined `34787423110` — SUCCESS;
- Stage13G `34787423158` — SUCCESS.

Stage13G job evidence:
- Admin operations backend `103805322189` — SUCCESS, including API lint, strict typecheck, unit tests, build, clean PostgreSQL migrations, DB contract checks, AI authoring integration and access/auth regression;
- Admin UI quality `103805322285` — SUCCESS, including Admin lint, strict typecheck, unit tests and build;
- Real API + PostgreSQL + Chromium `103805476116` — SUCCESS, including clean migrations and the real Admin Chromium suite.

Decision: **Batch 10A caller switch is VERIFIED.** The previous CI blocker is closed.

### D. Classification after caller-switch proof

- **KEEP:** generation/regeneration/archive/export behavior, API contracts, auth/session, server/PostgreSQL authority, tests.
- **IMPROVE:** dependency direction and route-owned source placement.
- **REFACTOR:** relocate the real `AdminAiAuthoringWorkspace` implementation under `apps/admin-web/src/admin/ai-authoring/`, preserve root compatibility re-export temporarily, then remove it only after parity.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after relocation parity and caller proof.

### E. Changes made this continuation

No production code was changed after the exact-head caller-switch verification. This continuation intentionally stopped at the parity boundary and updated shared continuity truth only, so the next task can perform the implementation relocation as one reviewable production batch without mixing verification closure and relocation in the same undocumented step.

Continuity files updated:
- `PROJECT_STATUS.md` — caller-switch marked VERIFIED; relocation made explicit next step.
- `PROJECT_ENGINEERING_LOG.md` — this checkpoint.
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` — synchronized checkpoint.
- Draft PR #52 — synchronized to the caller-switch VERIFIED state.

### F. Explicit resume point for task A/B

1. Re-fetch live `main`, branch HEAD, all three continuity files, recent commits, Draft PR #52 and current exact-head CI.
2. Treat AR-09 Batches 1–9A as DONE / VERIFIED.
3. Treat Batch 10A feature-owner seam and caller switch as VERIFIED; do not redo them.
4. First production action only: relocate the real implementation from `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx` into `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx`.
5. Adjust only relative imports (`../../admin-api`, `../../admin-ai-authoring-api`, `../../question-bank-api`, `../../quiz-builder-api`, `../../admin-ai-authoring.css` or equivalent correct paths); preserve behavior and contracts.
6. Convert the root `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx` to a temporary compatibility re-export.
7. Run exact-head Frontend + Admin AI + Combined + Stage13G parity before deleting the root seam.
8. After green relocation parity, prove no caller needs root, remove the root seam, then run exact-head parity again.
9. Perform one fresh AR-09 inventory; if no justified route-owned seam remains, run final AR-09 gates and formally close AR-09.
10. Start AR-10 only after formal AR-09 closure.
11. Preserve Student isolation, backend/PostgreSQL authority and current test strength.
12. Keep PR #52 Draft; no merge or auto-merge.

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
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | ACTIVE / AR-09; Batch 10A caller switch VERIFIED, implementation relocation pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
