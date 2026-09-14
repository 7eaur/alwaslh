# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Consolidated engineering truth. Repository code, PostgreSQL migrations/schema, executable CI and verified runtime evidence outrank prose. Historical detail remains preserved in Git history and specialized workstream documents.

Last consolidated: **2026-09-14 — platform architecture pivot initiated; PA-00 ACTIVE.**

## Platform authority invariants

- `apps/student-web` — Student product.
- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL schema/integrity authority.
- Browser state is never canonical business authority.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment authority remains server-owned.
- Tests represent production contracts; backend validation is never weakened to satisfy fixtures.
- Parallel Student/content work on live `main` must not be overwritten by architecture work from the Admin branch.

## Verified Super Admin history retained

- AR-01 — DONE / VERIFIED.
- AR-02 — DONE / VERIFIED.
- AR-03 — DONE / VERIFIED.
- AR-04 — DONE / VERIFIED.
- AR-05 — DONE / VERIFIED. `cda2c3a683c6101db12f0c7cfad772226c234e0d`; Frontend `34729512441`, Admin AI `34729512433`, Combined `34729512404` — SUCCESS.
- AR-06 — DONE / VERIFIED. `02cf24d5c3fda57f7270580d8c5ff137f7b8a2e1`; Frontend `34740148367`, Admin AI `34740148382`, Combined `34740148361` — SUCCESS.
- AR-07 — DONE / VERIFIED. `c5bf37d4d72e341817970c7f95ff25bd771f8e17`; Frontend `34750417663`, Admin AI `34750417642`, Combined `34750417627` — SUCCESS.
- AR-08 — DONE / VERIFIED. `20ed69e46d6693925be42464f0c9f85691cec203`; Frontend `34754057319`, Admin AI `34754057304`, Combined `34754057322`, Stage13G `34754057370` — SUCCESS.
- AR-09 — DONE / VERIFIED. `c755b209bfa67980afee0ed150bd43b3574b0a3b`; Frontend `34789114130`, Admin AI `34789114112`, Combined `34789114110`, Stage13G `34789114192` — SUCCESS.

AR-10 accessibility work remains valid history. It established focus/reduced-motion/browser checks and exposed a real session-transition focus defect. The defect was fixed at `302127c3223d00715f1d960f37c7d25044b6b20e`.

Stage13G run `34793896054` for that baseline completed fully green:
- Admin UI job `103823172953` — SUCCESS;
- backend job `103823173114` — SUCCESS;
- Real API + PostgreSQL + Chromium job `103823326277` — SUCCESS.

The former AR-10 rule requiring only the smallest polish and no redesign/rebuild is **superseded** by the architecture decision below.

# 2026-09-14 — Platform architecture audit / PA-00 initiation

## A. State inspected

- Live `main`: `3053640cc5bb0699cfa7456cf646e8997f6aa81b`.
- Architecture branch baseline before documentation pivot: `302127c3223d00715f1d960f37c7d25044b6b20e`.
- Draft PR #52: open, Draft, unmerged; no auto-merge authorized.
- Apps confirmed: `admin-web`, `student-web`, `api`.
- Shared packages confirmed: `brand`, `domain`, `ui`, `validation`.
- Representative composition roots, package coverage and runtime/build evidence were inspected.

## B. Evidence-backed findings

### `ARCH-001` — P1 — Frontend composition ownership

**Finding:** both frontend applications have oversized composition roots.

- Admin `App.tsx` coordinates auth/session, login/error states, shell/navigation/account behavior, route table and feature composition, while eagerly importing most major Admin workspaces.
- Student `App.tsx` is approximately 30 KB and mixes activation/login/recovery/device/session orchestration with common presentation and product-state concerns.

**Decision:** REBUILD composition boundaries. `app` must compose providers/router/layouts; feature logic belongs to feature owners.

### `ARCH-002` — P1 — Admin initial bundle

**Finding:** verified Admin production build emitted one main JS chunk around `968.58 kB` minified / `193.92 kB` gzip and Vite warned that the chunk exceeds 500 kB.

**Root cause:** major route workspaces are statically imported from the Admin composition root; there is no route-level lazy-loading architecture.

**Decision:** REBUILD route composition with feature-owned lazy boundaries. Do not hide the problem by raising Vite's warning limit.

### `ARCH-003` — P1 — Inconsistent feature/source ownership

**Finding:** Admin feature ownership has improved under `src/admin/<feature>`, but API adapters, tests, editors and CSS still coexist in the source root. Student source ownership is flatter still.

**Decision:** MOVE/REBUILD into feature-local boundaries. Root-level feature dumping becomes prohibited after migration.

### `ARCH-004` — P2 — Shared contract coverage

**Finding:** `packages/domain/src` currently covers only a small subset of domains and `packages/validation/src` is narrower. The package concept is sound, but it does not yet represent the platform's contract boundaries.

**Decision:** STANDARDIZE gradually. Promote code to shared packages only when genuinely shared by multiple owners; never use shared packages as a dumping ground.

### `ARCH-005` — P2 — Backend modular-monolith consistency

**Finding:** backend grouping by business area is structurally sound and should be preserved. However, `apps/api/src/app.ts` manually constructs/registers every service and module, while internal naming/layer conventions vary by module.

**Decision:** KEEP modular monolith/business rules; STANDARDIZE app composition and module internals/dependency direction. No microservice conversion.

### `ARCH-006` — P1 — Design-system ownership

**Finding:** brand/UI foundations exist, but feature/app CSS and interaction patterns are distributed. Accessibility/RTL improvements have been added, but consistency is not yet enforced as a complete design architecture.

**Decision:** establish `tokens → primitives → components → patterns → feature compositions`, with Arabic-first RTL, keyboard, reduced-motion and responsive behavior defined centrally where generic.

### `ARCH-007` — P1 — Architecture gates

**Finding:** executable functional gates are strong (unit/integration/PostgreSQL/Chromium), but dependency-boundary and performance architecture are not yet first-class gates.

**Decision:** add deterministic architecture/dependency checks and evidence-based bundle/runtime budgets during PA-00/PA-07.

## C. Target architecture decision

Canonical plan created:

`docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`

Migration rule:

`define target boundary → build new owner → prove contract/parity → switch composition/route → remove old owner → exact-head gates`

This is deliberately different from both patching and a big-bang rewrite. Existing code is not the target architecture, but it remains executable behavioral evidence until its replacement is verified.

## D. Active phase ledger

- PA-00 — Architecture baseline + guardrails — **ACTIVE**.
- PA-01 — Shared design + contract foundation — PENDING.
- PA-02 — Thin frontend app shells/router/providers/layouts + lazy route boundaries — PENDING.
- PA-03 — Admin vertical-slice migration — PENDING.
- PA-04 — Student vertical-slice migration against refreshed live `main` — PENDING.
- PA-05 — Backend modular-monolith boundary standardization — PENDING.
- PA-06 — Design/interaction convergence — PENDING.
- PA-07 — Performance/delivery architecture — PENDING.
- PA-08 — Legacy removal + dependency enforcement — PENDING.
- PA-09 — Full platform verification — PENDING.

## E. Explicit next execution point

Continue PA-00 only:

1. produce current ownership/classification maps for Admin, Student, API and packages;
2. create ADRs for frontend feature boundaries, backend module boundaries, canonical data flow and design-system layers;
3. define import/dependency rules that can be enforced automatically;
4. capture current build/bundle/runtime baseline per app;
5. decide branch strategy after reconciling current architecture branch with refreshed live `main` without discarding parallel work;
6. after PA-00 gate, start PA-01 then PA-02 before migrating business slices.

Keep PR #52 Draft. Never auto-merge.

## Findings register

| ID | Severity | Area | Problem | Status |
|---|---:|---|---|---|
| `ADMIN-001..011` | P1/P2 | Super Admin | prior IA/parity/ownership defects | FIXED / verified history |
| `ADMIN-012` | P2 | Accessibility | focus/reduced-motion/runtime focus gaps | FIXED / verified at `302127c3`, Stage13G `34793896054` |
| `ARCH-001` | P1 | Frontend | oversized composition roots | OPEN / PA-00→PA-02 |
| `ARCH-002` | P1 | Performance | Admin eager route bundle ~968.58 kB minified | OPEN / PA-02→PA-07 |
| `ARCH-003` | P1 | Ownership | inconsistent source/feature ownership | OPEN / PA-00→PA-04 |
| `ARCH-004` | P2 | Contracts | incomplete shared domain/validation boundary | OPEN / PA-01 |
| `ARCH-005` | P2 | Backend | composition/module conventions not fully standardized | OPEN / PA-05 |
| `ARCH-006` | P1 | Design system | distributed patterns/CSS ownership | OPEN / PA-01→PA-06 |
| `ARCH-007` | P1 | Quality | architecture/performance gates not first-class | OPEN / PA-00→PA-09 |
| `FPA-013` | P2 | Student Reader | existing separate Student audit finding | remains owned by Student track until PA-04 reconciliation |