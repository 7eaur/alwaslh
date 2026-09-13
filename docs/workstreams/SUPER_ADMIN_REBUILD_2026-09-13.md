# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-09 DONE / VERIFIED. AR-10 A11y / RTL / performance / visual QA is NEXT / NOT STARTED.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked this continuation: `43649391e7fc3526c0ef0a27720e50271fb52e9d` — parallel Student workstream, untouched.  
Verified AR-09 production exact-head: `c755b209bfa67980afee0ed150bd43b3574b0a3b`.

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
- AR-09 — Cleanup + architecture enforcement — **DONE / VERIFIED**.
- AR-10 — A11y/RTL/performance/visual QA — **NEXT / NOT STARTED**.

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
- Batch 9A — AI Review presentation ownership + root seam removal — VERIFIED on `8c6a42923f93087dd3edfdaee6987f967530aabf`: Frontend `34786995492`, Admin AI `34786995470`, Combined `34786995525`, Stage13G `34786995546`, including Real API + PostgreSQL + Chromium `103804299795`.

## AR-09 Batch 10A — AI Authoring route ownership — DONE / VERIFIED

### Classification

- **KEEP:** AI authoring, regeneration, archive, export behavior; API contracts; auth/session; server/PostgreSQL authority; tests.
- **IMPROVE:** route/feature ownership and dependency direction.
- **REFACTOR:** feature-owner seam → caller switch → implementation relocation → root seam removal, each behind executable parity.
- **REBUILD:** none.
- **REMOVE:** root compatibility seam only after executable proof.

### Feature-owner seam — VERIFIED

Commit `3d448c04bcfd9f65663044db1078a19095214cd4` added `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx` as a behavior-neutral re-export of the root implementation.

Exact-head verification:
- Frontend `34787244260` — SUCCESS;
- Admin AI `34787244406` — SUCCESS;
- Combined `34787244263` — SUCCESS;
- Stage13G `34787244262` — SUCCESS, including Admin UI `103804830646`, backend `103804830758`, and Real API + PostgreSQL + Chromium `103804959684`.

### Caller switch — VERIFIED

Commit `8a5cbd680f74062acb47ec7244095e3881f6161c` changed only the `App.tsx` import from root `./AdminAiAuthoringWorkspace` to `./admin/ai-authoring/AdminAiAuthoringWorkspace`.

Exact-head verification:
- Frontend `34787423102` — SUCCESS;
- Admin AI `34787423098` — SUCCESS;
- Combined `34787423110` — SUCCESS;
- Stage13G `34787423158` — SUCCESS, including backend `103805322189`, Admin UI `103805322285`, Real API + PostgreSQL + Chromium `103805476116`.

### Real implementation relocation — VERIFIED

Commit `a1d87bb31dd0cc36efb29854075fb9bd9abbd705` moved the real `AdminAiAuthoringWorkspace` implementation into `apps/admin-web/src/admin/ai-authoring/` and changed only the relative imports to existing shared modules/styles. The root file remained a temporary compatibility re-export.

Exact-head verification:
- Frontend `34788603353` — SUCCESS;
- Admin AI `34788603354` — SUCCESS;
- Combined `34788603377` — SUCCESS;
- Stage13G `34788603350` — SUCCESS, including backend `103808542366`, Admin UI `103808542497`, Real API + PostgreSQL + Chromium `103808700176`.

### Root compatibility seam removal — VERIFIED

After direct feature ownership was proven, commit `fdbbe7f6c06e2e6138c97793934d3f120f95604a` deleted only `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx`.

Exact-head verification:
- Frontend `34788799234` — SUCCESS;
- Admin AI `34788799271` — SUCCESS;
- Combined `34788799237` — SUCCESS;
- Stage13G `34788799243` — SUCCESS, including Admin UI `103809064466`, backend `103809064595`, Real API + PostgreSQL + Chromium `103809203781`.

## AR-09 fresh inventory + final root cleanup — VERIFIED

Fresh router/root inventory after Batch 10A proved three root workspace implementations were superseded by established feature owners and were no longer router callers:
- `apps/admin-web/src/AdminGovernanceWorkspace.tsx`;
- `apps/admin-web/src/AdminOperationsWorkspace.tsx`;
- `apps/admin-web/src/AiOperationsWorkspace.tsx`.

Classification: current feature routes/APIs/server/PostgreSQL authority/tests **KEEP**; the three dead legacy root implementations **REMOVE**; no REBUILD.

Commit `c755b209bfa67980afee0ed150bd43b3574b0a3b` removed only those three superseded files. No backend, migrations, API contracts, Student workstream or tests were modified.

Final AR-09 exact-head verification:
- Frontend `34789114130` — SUCCESS;
- Admin AI `34789114112` — SUCCESS;
- Combined `34789114110` — SUCCESS;
- Stage13G `34789114192` — SUCCESS;
  - backend `103809925133` — SUCCESS;
  - Admin UI `103809925136` — SUCCESS;
  - Real API + PostgreSQL + Chromium `103810061281` — SUCCESS.

Root `apps/admin-web/src/*Workspace.tsx` legacy ownership inventory is clean. **AR-09 is DONE / VERIFIED.**

## Explicit handoff — AR-10 next

1. Re-fetch live `main`, Admin branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-01 through AR-09 as DONE / VERIFIED; do not redo them without new evidence.
3. First close any CI still active on the latest documentation-only checkpoint head.
4. When exact-head is green, start **AR-10 only — A11y / RTL / performance / visual QA**.
5. Inspect the actual current Admin routes/components/styles/tests and verified runtime before changing anything; classify KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE.
6. Make the smallest reviewable AR-10 batch and run the appropriate lint/typecheck/unit/integration/build/real Chromium/visual-responsive checks.
7. Preserve Student isolation, backend/PostgreSQL authority and test strength.
8. Keep PR #52 Draft; no merge or auto-merge.
9. After AR-10 exact-head green, proceed to final verification only. When AR-01..AR-10 and final gates are all green, stop changes and leave clear review/merge readiness.

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
