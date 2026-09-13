# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-13 — AR-01 through AR-08 DONE / VERIFIED. AR-09 ACTIVE; Batches 1–7A VERIFIED; Batch 8A Lesson Publication ownership relocation ACTIVE with caller switched and exact-head parity running.**

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
- AR-09 — **ACTIVE**. Batches 1–7A VERIFIED; Batch 8A ACTIVE.
- AR-10 — NOT STARTED.

## AR-09 verified history summary

- Batch 1 — Quiz metadata ownership relocation — VERIFIED; checkpoint `07de0e24475b8af410bf2c213ede2a334062b30c`; Admin AI `34757034197`, Combined `34757034226`, Stage13G `34757034179` — SUCCESS.
- Batch 2 — Lesson authoring tools ownership relocation — VERIFIED on `d1bf7101135516c751c02d269a384015f9e3a132`; Frontend `34759439669`, Admin AI `34759439651`, Combined `34759439615`, Stage13G `34759439612` — SUCCESS.
- Batch 3 — Access-code reports ownership relocation — VERIFIED on `3b1eb104fef1ac70035dcd9875d9807f95bf2009`; Frontend `34762225733`, Admin AI `34762225735`, Combined `34762225728`, Stage13G `34762225748` — SUCCESS.
- Batch 4A — AI review ownership relocation — VERIFIED on `141e3e7912171c10356b8d32a268ddcbfda267f3`; Frontend `34765398964`, Admin AI `34765398992`, Combined `34765398969`, Stage13G `34765398946` — SUCCESS.
- Batch 5A — Curriculum ownership + root seam removal — VERIFIED on `d40c71192f513f18d69b0e67be408e6f146a3ec5`; Frontend `34768283004`, Admin AI `34768282985`, Combined `34768283077`, Stage13G `34768282982` — SUCCESS.
- Batch 6A — Content review ownership + root seam removal — VERIFIED on `2a958723d434e10755d35299ba509f69fc411bb3`; Frontend `34771526703`, Admin AI `34771526711`, Combined `34771526699`, Stage13G `34771526724` — SUCCESS.
- Batch 7A — Content ingestion ownership + root seam removal — VERIFIED. Frontend `34778944908` on seam-removal code-head `7b4106f82ab6f1c152ac20caf11c70779224acde`; documentation descendant `803e9b55c2496998358cf257a959bc4a6799a90f` completed Admin AI `34779021476`, Combined `34779021471`, Stage13G `34779021457` — SUCCESS.

## 2026-09-13 — AR-09 Batch 8A — Lesson Publication ownership relocation

### A. State inherited from task A/B before this continuation

At the beginning of this continuation the repository was reconciled from live evidence rather than chat memory:

- live `main`: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86`;
- Admin branch inherited HEAD: `0550ab688dc8909d3690a3dce54173d58f5d6aa2`;
- Draft PR #52: open and Draft, not merged;
- AR-01..AR-08: DONE / VERIFIED;
- AR-09 Batches 1–7A: DONE / VERIFIED;
- Batch 8A: ACTIVE at first relocation parity;
- AR-10: NOT STARTED.

The three continuity files, recent commits, Draft PR and exact-head Actions were read before any new mutation. The live-main advance is Student workstream activity and was not modified.

### B. Inherited blocker closed before mutation

The inherited documentation HEAD `0550ab688dc8909d3690a3dce54173d58f5d6aa2` was verified green:

- Admin AI `34780605238` — SUCCESS;
- Combined `34780605257` — SUCCESS;
- Stage13G `34780605241` — SUCCESS;
- Stage13G Real API + PostgreSQL + Chromium job — SUCCESS;
- Stage13G Admin UI quality — SUCCESS;
- Stage13G Admin operations backend — SUCCESS.

The earlier first-relocation code had already moved the real implementation to `apps/admin-web/src/admin/content/LessonPublicationPanel.tsx`; therefore the inherited parity blocker was resolved before touching the caller.

### C. Caller and contract verification

Files inspected:

- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx`;
- `apps/admin-web/src/LessonPublicationPanel.tsx`;
- `apps/admin-web/src/admin/content/LessonPublicationPanel.tsx` from the inherited implementation move;
- current continuity docs and exact-head checks.

Evidence:

- root `LessonPublicationPanel.tsx` contains only `export { LessonPublicationPanel } from "./admin/content/LessonPublicationPanel";`;
- `admin/content/ContentIngestionWorkspace.tsx` was importing `LessonPublicationPanel` through that root compatibility seam;
- its rendered use remains the lesson publication decision surface within the Content workflow;
- backend, PostgreSQL, auth/security and Student contracts are unrelated to this import-path ownership cleanup and were not changed.

### D. Classification and decision

- **KEEP:** publication behavior, confirmation, review-blocking rules, session handling, canonical server state, PostgreSQL authority and current tests.
- **IMPROVE:** feature ownership and dependency direction.
- **REFACTOR:** Content caller imports its Content-owned panel directly.
- **REBUILD:** none.
- **REMOVE:** root compatibility re-export only after caller-switch exact-head parity succeeds.
- **NO CHANGE:** backend, migrations, API contracts, auth/security, Student workstream and test strength.

Root cause remains ownership drift; there is no evidence of a publication business-rule defect.

### E. Mutation performed in this continuation

#### Commit `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4`
`refactor(admin): use content-owned lesson publication panel`

Changed only:
- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx`

Exact change:
- from `import { LessonPublicationPanel } from "../../LessonPublicationPanel";`
- to `import { LessonPublicationPanel } from "./LessonPublicationPanel";`

No rendering behavior, props, publication commands, backend code, migration, API contract, Student code or test was changed. Root `apps/admin-web/src/LessonPublicationPanel.tsx` remains present intentionally until parity is green.

### F. Verification results and current blocker

The caller-switch code-head `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4` triggered the required matrix:

- Frontend `34782291937` — IN PROGRESS at checkpoint;
- Admin AI `34782291934` — IN PROGRESS at checkpoint;
- Combined `34782291938` — IN PROGRESS at checkpoint;
- Stage13G `34782291927` — IN PROGRESS at checkpoint.

No failure was observed before documentation. Because these gates are ACTIVE, no second production mutation was made: the root seam was not deleted, no parallel AR-09 cleanup was opened, and AR-10 was not started.

### G. Stage state

- AR-09 Batch 8A — **ACTIVE / CALLER SWITCHED / EXACT-HEAD PARITY PENDING**.
- AR-09 — ACTIVE.
- AR-10 — NOT STARTED.
- Draft PR #52 must remain Draft; no merge or auto-merge.

## Explicit resume point for the next task A/B

1. Re-fetch live `main`, branch HEAD, these three continuity docs, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–7A as DONE / VERIFIED; do not redo them.
3. Treat Batch 8A as ACTIVE at caller-switch parity.
4. Production code-head to verify first: `e5d3ebc837284e8f185e0d2e8c422e88be2a1db4`.
5. Resolve Frontend `34782291937`, Admin AI `34782291934`, Combined `34782291938`, Stage13G `34782291927` before any production mutation.
6. If and only if all are green, re-prove no remaining legitimate caller needs root `apps/admin-web/src/LessonPublicationPanel.tsx` and delete that compatibility re-export.
7. Run a fresh exact-head matrix after root deletion. Batch 8A becomes DONE / VERIFIED only when that deletion head is green.
8. After Batch 8A closes, run a fresh AR-09 inventory. Do not open speculative cross-feature cleanup without established ownership evidence.
9. Close AR-09 only when no justified ownership seam remains and final exact-head gates are green.
10. Only after formal AR-09 closure may AR-10 begin.
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
| `ADMIN-011` | P2 | Admin architecture | route/feature-owned components outside established feature ownership | ACTIVE / AR-09; Batch 8A caller-switch parity pending |
| `FPA-013` | P2 | Student Reader | active search match lacks DOM focus | OPEN / Student-audit track; out of Admin scope |
