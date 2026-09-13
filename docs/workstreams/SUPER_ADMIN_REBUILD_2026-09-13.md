# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–9A VERIFIED; Batch 10A AI Authoring route ownership ACTIVE with caller switch VERIFIED and implementation relocation next.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked this continuation: `43649391e7fc3526c0ef0a27720e50271fb52e9d` — parallel Student workstream, untouched.  
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
- Batch 9A — AI Review presentation ownership + root seam removal — VERIFIED on `8c6a42923f93087dd3edfdaee6987f967530aabf`: Frontend `34786995492`, Admin AI `34786995470`, Combined `34786995525`, Stage13G `34786995546`, including Real API + PostgreSQL + Chromium `103804299795`.

## AR-09 Batch 10A — AI Authoring route ownership — ACTIVE

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

The route path, props, UI behavior, APIs, backend, migrations, Student workstream and tests remain unchanged.

Exact production code-head verification completed fully green:
- Frontend `34787423102` — SUCCESS;
- Admin AI `34787423098` — SUCCESS;
- Combined `34787423110` — SUCCESS;
- Stage13G `34787423158` — SUCCESS;
  - Admin operations backend `103805322189` — SUCCESS;
  - Admin UI quality `103805322285` — SUCCESS;
  - Real API + PostgreSQL + Chromium `103805476116` — SUCCESS.

Therefore the caller-switch parity barrier is closed.

## Explicit handoff — continue Batch 10A only

1. Re-fetch live `main`, Admin branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–9A as DONE / VERIFIED; do not redo them.
3. Treat Batch 10A feature-owner seam and caller switch as VERIFIED.
4. First production action only: relocate the real `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx` implementation into `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx`.
5. Adjust only relative imports to the existing root shared modules/styles; preserve behavior and contracts.
6. Keep root `apps/admin-web/src/AdminAiAuthoringWorkspace.tsx` temporarily as a compatibility re-export.
7. Run exact-head Frontend + Admin AI + Combined + Stage13G parity before deleting root.
8. Delete root seam only after callers are proven local and relocation parity is green; then run exact-head parity again.
9. Perform a fresh AR-09 inventory. If no justified established-owner seam remains, run final AR-09 exact-head verification and close AR-09.
10. Only then start AR-10.
11. Keep PR #52 Draft; no merge or auto-merge.

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
