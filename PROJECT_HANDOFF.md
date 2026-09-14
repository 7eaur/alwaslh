# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, code/tests and exact-head Actions;
6. confirm no active worker collision;
7. compare live `main` at structural phase boundaries or when overlapping scoped changes appear.

Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned here: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification.

Excluded only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

AB-02 → AB-03 phase-boundary reconciliation is complete. Live-main-only implementation changes are Student frontend/workflow and Student-specific CI/docs; no Admin/API/migration implementation overlap was found. Shared top-level docs diverge and remain subject to deliberate final reconciliation.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
  - AB-02.1 Global Admin shell/layout ownership — DONE
  - AB-02.2 Inner Admin route-table ownership — DONE
  - AB-02.3 Substantial workflow route lazy boundaries — DONE
  - AB-02.4 Auth login presentation ownership — DONE
  - Final shell/router/provider closure inspection — DONE
- AB-03 — NEXT / no source mutation started yet
- AB-04..AB-08 — PENDING

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-02 closure

The final live inspection confirms the target shell/router/provider architecture is sufficient:

- `App.tsx` composes `AdminSessionProvider`, session boundary, `LoginScreen`, `AdminShell`, and `AdminRoutes` only;
- `AdminShell` owns global chrome/navigation/account controls;
- `AdminRoutes` owns the inner route table, route-local wrappers/redirects/not-found and route-level lazy/Suspense boundaries;
- outer `router.tsx` owns `/app/*`, route focus and outer not-found behavior;
- auth session internals are feature-owned and exposed through `features/auth/public`;
- remaining legacy workflow pages under `src/admin/*` are intentionally migrated slice-by-slice in AB-03 and are not an AB-02 blocker.

No additional shell/router/provider abstraction is justified.

Latest source-tree-equivalent verification remains green:

- Architecture Guard `34853562192` — SUCCESS on source checkpoint `d4c3c7896043ea6b1cc4cac1dd404d7912131916`;
- Admin AI `34853935899` — SUCCESS;
- Combined Integration `34853935696` — SUCCESS on verification head `080b8e131da72b0795f647809239a815d4604210`;
- Stage13G `34853935720` — SUCCESS on the same verification head, including Admin/API quality, clean PostgreSQL migrations/contracts, auth/security/integration regressions and Real API + PostgreSQL + Chromium.

Compare from `080b8e...` through the AB-02 closure handoff chain shows documentation-only changes; no Admin/API/migration/test/workflow source changes.

## Exact continuation

Start **AB-03.1 — Overview + Operations** only.

The next worker must first inspect the current Overview/Operations frontend owners, related API routes/services, PostgreSQL authority, auth/security/audit contracts, existing integration tests and browser flows. Establish operator job → DB/API/security contract → current owner → target feature owner → parity/deletion condition before mutation.

Choose only one smallest coherent end-to-end correction inside this slice. Do not combine Curriculum/Content/OCR or any later AB-03 slice in the same increment. Do not redesign Student frontend.

## Remaining roadmap

AB-03 vertical slices in order: Overview + Operations → Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
