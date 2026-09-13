# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–9A VERIFIED; Batch 10A AI Authoring route ownership ACTIVE at caller-switch exact-head verification.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked this continuation: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — Student workstream advance, untouched.  
Current Batch 10A production code-head: `8a5cbd680f74062acb47ec7244095e3881f6161c`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## Product and architecture rules

- KEEP modular-monolith backend and server authority.
- KEEP publication, assessment, access, human-review, revision, provenance and audit boundaries.
- REBUILD Admin information architecture and route ownership incrementally.
- MOVE contextual workflows into focused route-owned surfaces.
- SPLIT individual Student support from bulk Access Code management.
- KEEP technical IDs/provider/runtime/storage/database details advanced-only.
- DO NOT break or overwrite the parallel Student/audit workstream.
- Test fixtures must satisfy production contracts; backend validation is never weakened for E2E.
- Legacy aliases/workspaces may exist only as temporary parity seams and are removed after executable replacement parity.
- Route/feature-specific components with established owners move under `src/admin/<feature>/` once parity and caller proof permit it.

## Roadmap

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED.
- AR-06 — DONE / VERIFIED.
- AR-07 — DONE / VERIFIED.
- AR-08 — DONE / VERIFIED.
- AR-09 — Cleanup + architecture enforcement — **ACTIVE**.
- AR-10 — A11y/RTL/performance/visual QA — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## Verified AR-09 checkpoints

- Batch 1 — Quiz metadata ownership relocation — VERIFIED.
- Batch 2 — Lesson authoring tools ownership relocation — VERIFIED.
- Batch 3 — Access-code reports ownership relocation — VERIFIED.
- Batch 4A — AI review page ownership relocation — VERIFIED.
- Batch 5A — Curriculum ownership + root seam removal — VERIFIED.
- Batch 6A — Content review ownership + root seam removal — VERIFIED.
- Batch 7A — Content ingestion ownership + root seam removal — VERIFIED.
- Batch 8A — Lesson Publication ownership + root seam removal — VERIFIED.
- Batch 9A — AI Review presentation ownership + root seam removal — VERIFIED on exact production head `8c6a42923f93087dd3edfdaee6987f967530aabf`:
  - Frontend `34786995492` — SUCCESS;
  - Admin AI `34786995470` — SUCCESS;
  - Combined `34786995525` — SUCCESS;
  - Stage13G `34786995546` — SUCCESS, including Real API + PostgreSQL + Chromium `103804299795`.

## AR-09 Batch 10A — AI Authoring route ownership — ACTIVE

### Inventory evidence

Fresh AR-09 inventory after Batch 9A found one remaining justified route-owned root surface:
- `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx` directly backs `/app/tools/ai-authoring`;
- no `admin/ai-authoring/` owner existed before this batch;
- root shared API/view-model/infrastructure modules were not classified as cleanup merely because of location.

Classification:
- **KEEP:** AI authoring, regeneration, archive, export behavior; API contracts; auth/session; server/PostgreSQL authority; tests.
- **IMPROVE:** route/feature ownership.
- **REFACTOR:** feature-owner seam → caller switch → implementation relocation → root seam removal, with parity between steps.
- **REBUILD:** none.
- **REMOVE:** root seam only after executable proof.

### Feature-owner seam — VERIFIED

Commit `3d448c04bcfd9f65663044db1078a19095214cd4` added only:
- `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx`

as a behavior-neutral re-export of the root implementation.

Exact-head verification:
- Frontend `34787244260` — SUCCESS;
- Admin AI `34787244406` — SUCCESS;
- Combined `34787244263` — SUCCESS, including real Admin Chromium;
- Stage13G `34787244262` — SUCCESS, including Admin UI `103804830646`, backend `103804830758`, and Real API + PostgreSQL + Chromium `103804959684`.

### Caller switch — CURRENT CHECKPOINT

Commit `8a5cbd680f74062acb47ec7244095e3881f6161c` changed only the `App.tsx` import:
- from root `./AdminAiAuthoringWorkspace`;
- to `./admin/ai-authoring/AdminAiAuthoringWorkspace`.

The route path, component props and behavior are unchanged. Backend, migrations, API authority, Student workstream and tests are unchanged.

Exact-head runs are active at checkpoint:
- Frontend `34787423102` — IN PROGRESS;
- Admin AI `34787423098` — IN PROGRESS;
- Combined `34787423110` — IN PROGRESS;
- Stage13G `34787423158` — IN PROGRESS.

Therefore Batch 10A is **ACTIVE / CALLER SWITCHED / PARITY PENDING**. No implementation relocation or root deletion is allowed yet.

## Explicit handoff — finish Batch 10A first, no parallel work

1. Re-fetch live `main`, Admin branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–9A as DONE / VERIFIED; do not redo them.
3. Resolve exact caller-switch code-head `8a5cbd680f74062acb47ec7244095e3881f6161c` first: Frontend `34787423102`, Admin AI `34787423098`, Combined `34787423110`, Stage13G `34787423158`.
4. If continuity commits supersede/cancel runs, reconcile only against a descendant carrying the identical production tree.
5. Only after green caller-switch parity, relocate the real `AdminAiAuthoringWorkspace` implementation into `admin/ai-authoring/`, keeping the root file as a compatibility re-export and adjusting only relative imports.
6. Run a new exact-head matrix before deleting the root seam.
7. Delete the root seam only after callers are proven local and relocation parity is green; run exact-head parity again.
8. Perform fresh AR-09 inventory. If no justified established-owner seam remains, run final AR-09 exact-head verification and close AR-09.
9. Only then start AR-10.
10. Keep PR #52 Draft; no merge or auto-merge.

## Quality gate for remaining stages

- lint;
- strict typecheck;
- unit/integration tests;
- production build;
- clean PostgreSQL migrations/contracts where relevant;
- backend authority/auth/security regressions;
- real Chromium flows;
- responsive/no-overflow evidence for changed surfaces;
- final exact-head matrix before stage closure.

Acceptance: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.
