# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Live main reviewed:** `3053640cc5bb0699cfa7456cf646e8997f6aa81b`.  
**Pre-review exact-head green checkpoint:** `f7c56628bc89e1a534c24bd2ba4771b61313664b`.  
**Current stage:** `AB-00 — Architecture baseline & guardrails`.

## Binding scope

This workstream owns:

- Super Admin frontend: `apps/admin-web`;
- full Fastify backend/API: `apps/api`;
- PostgreSQL/migrations;
- shared packages only where genuinely required by Admin/API contracts or cross-product design semantics;
- Admin product architecture, IA, UX/UI, routing, data flow, RTL, accessibility, responsive behavior and performance.

`apps/student-web` implementation is **out of scope** and remains owned by its separate workstream (`stage16/student-016i` / PR #57 at the latest reconciliation). Existing Student tests may be used only as consumer-regression evidence when a shared API/security contract changes.

## Canonical active authorities

Read in this order for this workstream:

1. `docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`
2. `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`
3. `docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`
4. `docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`
5. `docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`
6. `docs/architecture/ADMIN_BACKEND_AB00_REVIEW_CHECKLIST_2026-09-14.md`
7. `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
8. `docs/product/DESIGN_SYSTEM_SPEC.md`
9. `.agents/skills/alwaslh-product-engineering/SKILL.md`

The older `PLATFORM_ARCHITECTURE_*` documents are historical rationale only and are superseded for execution by the scoped AB workstream.

## Branch reconciliation finding

Compared from merge-base `8d0676443aa7e186c41a79cc011f7f828d1290ef`:

- architecture branch: 284 commits ahead of live `main` at the review checkpoint;
- architecture branch: 170 commits behind live `main`;
- inspected `main`-only files are Student frontend/workflow + documentation changes;
- no `main`-only changes were found under current Admin/API/migrations/shared implementation paths at that checkpoint.

Decision: continue isolated Admin/backend work **without importing Student implementation**, but re-compare live `main` before every structural phase boundary. If `main` gains Admin/API/migrations/shared-contract changes, pause and reconcile first. Reconcile current `main` again before PR #52 becomes review/merge-ready.

## Binding decision order

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

with:

- correct ownership before convenience;
- verified contracts before visual preservation;
- no abstraction without demonstrated ownership/test/reuse/framework-decoupling value.

Acceptance target:

**Functional + Clear + Easy + Predictable + Comfortable + Consistent + Fast + Maintainable + Professional**

## Permanent architecture/product rules

- PostgreSQL/API remain canonical business authority.
- Backend remains one Fastify modular monolith; no microservices are authorized.
- Admin `app` composes only; features own workflows/routes/API adapters/models/tests.
- Feature internals are private; cross-feature work uses a narrow `public` contract or app orchestration.
- `packages/ui` owns genuinely cross-product primitives/semantics; Admin `shared/ui` owns Admin-only reusable patterns. Do not duplicate the same primitive in both.
- `shared` never becomes a dumping ground.
- No new feature files in Admin root `src/`.
- Major workflow route modules lazy-load by default; do not split tiny components merely to create chunks.
- One Admin shell owns global chrome/navigation.
- Keep verified `/app` as Admin base route unless deployment/runtime evidence justifies changing it; migrate child routes toward target user-job IA.
- No new global state/query framework without evidence after ownership cleanup.
- No Tailwind/CSS-in-JS/styling-stack rewrite without evidence; keep approved brand/tokens and repair ownership.
- Backend module layers are a dependency model, not mandatory empty folders/interfaces.
- No DI framework/service locator/interface ceremony without evidence.
- Database schema changes require domain/integrity need, never folder restructuring.
- Overview is attention-first and uses authoritative real values only.
- Loading/empty/error/permission/conflict/unavailable/success/recovery are first-class product states.
- Technical IDs/provider/runtime/storage/raw JSON are progressive/advanced details unless needed for the operator decision.
- RTL/a11y/responsive/reduced-motion are architecture requirements.
- Browser tests validate operator outcomes/contracts, not obsolete copy/selectors/DOM shape.
- Tests/security/validation are never weakened to make migration pass.
- No permanent dual ownership: replacement closes with legacy deletion or an explicit bounded removal condition.

Migration law:

`operator job → API/DB contracts → current owner → target owner → states/actions/flow → replacement → outcome verification → switch → legacy deletion → exact-head gates → documentation`

## AB-00 state

- **AB-00.1 Ownership & boundary map — DONE**
- **AB-00.2 Current-file + dependency inventory — DONE**
- **AB-00.3 Architecture Guard — IMPLEMENTED / strengthened; exact-head verification after review reconciliation required**
- **AB-00.4 Admin bundle/runtime + backend composition baseline — NEXT**
- **AB-00.5 Foundation readiness — PENDING**

The first Architecture Guard implementation passed run `34797219591`. The reviewed guard now also checks dynamic imports and app→private feature/module imports, and its frozen baseline must advance after accepted exact-head-green cleanup batches.

## Pre-review exact-head verification

On `f7c56628bc89e1a534c24bd2ba4771b61313664b`:

- Architecture Guard `34797219591` — SUCCESS;
- Admin AI Operations `34797219497` — SUCCESS;
- Combined Integration `34797219488` — SUCCESS;
- Stage13G Admin Operations `34797219505` — SUCCESS.

These prove behavioral safety of the checkpoint; the strengthened guard/current docs require a fresh exact-head check before AB-00.3 is declared closed.

## Roadmap

- `AB-00` baseline + guardrails — ACTIVE
- `AB-01` Admin shared system foundation + API presentation/session boundary
- `AB-02` thin shell/router/providers/layouts + lazy route boundaries
- `AB-03` Admin vertical-slice rebuild by operator workflow
- `AB-04` backend modular-monolith boundary standardization
- `AB-05` final Admin design/interaction convergence audit
- `AB-06` performance/delivery validation + budgets
- `AB-07` legacy removal + hard dependency enforcement
- `AB-08` final Admin + Backend verification

## Immediate next action

1. verify strengthened Architecture Guard/current exact head;
2. execute **AB-00.4** baseline measurement;
3. execute **AB-00.5** readiness review;
4. only then start AB-01.

PR #52 stays Draft. Never auto-merge.
