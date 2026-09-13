# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-09 DONE / VERIFIED. AR-10 A11y / RTL / performance / visual QA ACTIVE.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked this continuation: `3053640cc5bb0699cfa7456cf646e8997f6aa81b` — parallel Student/content workstream, untouched.  
Verified AR-09 production exact-head: `c755b209bfa67980afee0ed150bd43b3574b0a3b`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## Product and architecture rules

- KEEP modular-monolith backend and server authority.
- KEEP publication, assessment, access, human-review, revision, provenance and audit boundaries.
- KEEP the route-owned Admin architecture proven through AR-09.
- KEEP technical IDs/provider/runtime/storage/database details advanced-only.
- DO NOT break or overwrite the parallel Student/audit/content workstreams.
- Test fixtures must satisfy production contracts; backend validation is never weakened for E2E.
- AR-10 changes are evidence-driven accessibility/RTL/performance/visual-quality work, not a redesign.

## Roadmap

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED.
- AR-06 — DONE / VERIFIED.
- AR-07 — DONE / VERIFIED.
- AR-08 — DONE / VERIFIED.
- AR-09 — Cleanup + architecture enforcement — DONE / VERIFIED.
- AR-10 — A11y/RTL/performance/visual QA — **ACTIVE**.

No final verification starts before AR-10 is verified and documented.

## AR-09 closure

AR-09 route/feature ownership cleanup is complete. Final production exact-head `c755b209bfa67980afee0ed150bd43b3574b0a3b` passed Frontend `34789114130`, Admin AI `34789114112`, Combined `34789114110`, Stage13G `34789114192`, including backend `103809925133`, Admin UI `103809925136`, and Real API + PostgreSQL + Chromium `103810061281`. Root `apps/admin-web/src/*Workspace.tsx` legacy ownership inventory is clean.

## AR-10 Batch 1 — accessibility baseline — ACTIVE

### Pre-mutation verification

Inherited docs head `fdc6a4ed2a3de8f7481b7522d1f14907a0018219` was closed before AR-10 mutation:
- Admin AI `34789354837` — SUCCESS;
- Combined `34789354801` — SUCCESS;
- Stage13G `34789354857` — SUCCESS.

### Inspection / classification

- **KEEP:** `AdminProductShell` RTL ownership (`dir="rtl"`), skip link, route-content landmark/focus target, `RouteFocus`, semantic navigation labels, current responsive shell breakpoints, logical inline CSS, existing Stage13G real Chromium/PostgreSQL coverage.
- **IMPROVE:** shared keyboard focus coverage and reduced-motion support.
- **REFACTOR/REBUILD/REMOVE:** none in this batch.
- **KEEP untouched:** backend, migrations, API contracts, Student workstream and existing tests.

### Production change

Commit `1d3fd708bb913f4363721b17e4d78c90d02b8ddc` changes only `apps/admin-web/src/styles.css`:
- expands `:focus-visible` coverage to anchors, buttons, inputs, textarea, select, summary and programmatic `[tabindex]` targets;
- strengthens focus-ring visibility;
- adds a `prefers-reduced-motion: reduce` fallback for nonessential motion/smooth scrolling.

This is an accessibility baseline fix only; it does not alter product behavior, server authority or route ownership.

### Exact-head verification

For production code-head `1d3fd708bb913f4363721b17e4d78c90d02b8ddc`:
- Frontend `34791103952` — ACTIVE at last check;
- Admin AI `34791103945` — ACTIVE/queued at last check;
- Combined `34791103997` — ACTIVE at last check;
- Stage13G `34791104004` — ACTIVE/queued at last check.

Batch 1 remains **ACTIVE / NOT VERIFIED** until the exact-head matrix is green.

## Explicit handoff

1. Re-fetch live `main`, Admin branch HEAD, all three continuity files, Draft PR #52 and exact-head CI.
2. Close the Batch 1 production matrix above before any further production mutation. Documentation descendants may trigger newer CI; do not confuse them with the production code-head evidence.
3. If Batch 1 is green, mark it VERIFIED and continue AR-10 only.
4. Next AR-10 work must be derived from actual runtime evidence: keyboard navigation/focus, RTL directionality, responsive widths/no horizontal overflow, real Chromium flows, and performance/visual sanity.
5. Make only the smallest evidence-driven fix/test; do not redesign already-correct surfaces.
6. Preserve Student isolation, backend/PostgreSQL authority and test strength.
7. Keep PR #52 Draft; no merge or auto-merge.
8. AR-10 closes only after accessibility + RTL + performance + visual/responsive QA are exact-head green. Then run final verification only and stop changes when review/merge readiness is proven.

## Quality gate for AR-10 / final verification

- lint;
- strict typecheck;
- unit/integration tests;
- production build;
- backend/auth/security regressions where applicable;
- real Chromium flows;
- keyboard/focus evidence;
- RTL directionality evidence;
- responsive/no-overflow evidence;
- performance/visual sanity;
- final exact-head matrix before closure.

Acceptance: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.
