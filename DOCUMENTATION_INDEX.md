# DOCUMENTATION INDEX — الوسيلة الذكية

> Official project memory map. A replacement engineer must be able to recover the current product/architecture state from repository evidence without prior chat memory.

Last synchronized: **2026-09-14 — Platform Architecture Rebuild / PA-00 ACTIVE.**

## 1. Source-of-truth precedence

When sources conflict:

1. current repository code + PostgreSQL migrations/schema + executable CI/test evidence;
2. verified live runtime evidence where the question is runtime-specific;
3. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`;
4. active platform architecture and UX/product authorities listed below;
5. `PROJECT_STATUS.md`;
6. `PROJECT_ENGINEERING_LOG.md`;
7. `PROJECT_HANDOFF.md` and resume/continuity docs;
8. specialized operations/content documents;
9. historical workstreams, roadmap and parity documents.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Mandatory startup order while Platform Architecture Rebuild is active

1. `README.md`
2. `DOCUMENTATION_INDEX.md`
3. `PROJECT_STATUS.md`
4. `PROJECT_ENGINEERING_LOG.md`
5. `docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`
6. `docs/workstreams/PLATFORM_ARCHITECTURE_DECISIONS_2026-09-14.md`
7. `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
8. `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md`
9. `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`
10. `docs/product/DESIGN_SYSTEM_SPEC.md`
11. `docs/product/CONTENT_LANGUAGE_RULES.md`
12. `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md`
13. `.agents/skills/alwaslh-product-engineering/SKILL.md`
14. `PROJECT_HANDOFF.md`
15. `PROJECT_RESUME_SNAPSHOT.md`
16. `PROJECT_INTEGRATION_CONTINUITY.md`
17. `PROJECT_EXECUTION_QUEUE.md`
18. `docs/workstreams/STAGE16_STUDENT_HANDOFF.md`
19. `docs/workstreams/STUDENT_PRODUCT_TRACK_STATUS.md`
20. `docs/operations/RAILWAY_LIVE_STATE.md`
21. `docs/content/LIVE_CONTENT_IMPORT_STATUS.md`
22. `MASTER_REBUILD_ROADMAP.md`
23. `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
24. `PRODUCT_FEATURE_PARITY_MATRIX.md`
25. live `main`, architecture branch/PR and Actions before mutation.

Then inspect the actual code/migrations/tests for the active batch. Live executable evidence always wins.

## 3. Current operating model

The active work is no longer the historical “AR-10 smallest polish only” loop.

The platform is under a **first-principles architecture rebuild** because current Student/Admin composition and ownership remain harder to extend than the product should require, even though substantial UX/parity work is already verified.

The architecture rebuild does **not** authorize blind rewriting of verified business/security behavior.

Migration rule:

`target boundary → replacement owner → contract/parity proof → composition switch → remove legacy owner → exact-head gates`

## 4. Active architecture authorities

| File | Authority |
|---|---|
| `docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md` | active platform-wide architecture diagnosis, target structure, scenarios, phases and gates |
| `docs/workstreams/PLATFORM_ARCHITECTURE_DECISIONS_2026-09-14.md` | binding ADRs: dependency direction, ownership, modular monolith, state/contracts, lazy routing, design architecture |
| `PROJECT_STATUS.md` | concise active phase and exact next execution point |
| `PROJECT_ENGINEERING_LOG.md` | evidence-backed findings, decisions, verified baselines and phase history |

## 5. UX/product authorities preserved and integrated

The architecture workstream **does not replace or duplicate** the existing UX/UI refoundation. It implements its product/design truths within a maintainable code architecture.

| File | Purpose |
|---|---|
| `docs/product/UX_UI_MASTER_AUDIT_2026-09-12.md` | source-backed Student/Admin UX inventory and KEEP/IMPROVE/REFACTOR/REBUILD/REMOVE findings |
| `docs/product/TARGET_INFORMATION_ARCHITECTURE.md` | binding Student route/screen tree and Admin user-job hierarchy |
| `docs/product/DESIGN_SYSTEM_SPEC.md` | canonical identity/tokens/components/state/RTL/a11y/responsive rules |
| `docs/product/CONTENT_LANGUAGE_RULES.md` | product-language and technical-copy boundaries |
| `docs/workstreams/UX_UI_REFOUNDATION_IMPLEMENTATION_ROADMAP.md` | historical/incremental UX execution evidence; must be reconciled with the active architecture phases |

External Product Design/Mobbin/Figma may support research but cannot override repository product authority.

## 6. Platform boundaries

- `apps/student-web` — Student PWA/product.
- `apps/admin-web` — Super Admin product.
- `apps/api` — Fastify API and server business authority.
- `database/migrations` — PostgreSQL schema/integrity authority.
- `packages/brand` — canonical identity/tokens.
- `packages/ui` — genuinely shared UI/presentation primitives.
- `packages/domain` — genuinely shared pure domain contracts only.
- `packages/validation` — shared boundary validation only.

The target is a modular monolith on the backend and feature-owned frontends with thin app composition roots.

## 7. Preserved security/business contracts

Architecture migration must not weaken:

- authentication/session/device rules;
- access/entitlement rules;
- publication + human-review authority;
- revision/provenance/audit requirements;
- server-owned assessment scoring/finalization;
- protected Reader/media authorization;
- offline signed authorization, integrity, device/session and lifecycle rules;
- `/v1` exclusion from Service Worker Cache API authority.

Database/schema changes require a real domain/integrity need, not folder refactoring.

## 8. Current verified baseline

Live `main` most recently checked for this architecture pivot:

`3053640cc5bb0699cfa7456cf646e8997f6aa81b`

Parallel Student/content work exists there and must not be overwritten by the architecture branch.

Super Admin baseline before the documentation pivot:

`302127c3223d00715f1d960f37c7d25044b6b20e`

Stage13G `34793896054` is fully green:

- Admin UI `103823172953` — SUCCESS;
- backend/integration `103823173114` — SUCCESS;
- Real API + PostgreSQL + Chromium `103823326277` — SUCCESS.

This is behavioral safety evidence, not approval of the current folder/composition architecture.

## 9. Active phase

`PA-00 — Architecture baseline and guardrails`.

PA-00 must establish/reconcile:

- ownership/classification map;
- architecture decisions;
- enforceable dependency rules;
- Student/Admin build/bundle baselines;
- branch strategy against refreshed live `main`;
- documentation agreement on one next execution point.

After PA-00: `PA-01 shared design/contract foundation → PA-02 app shells → PA-03 Admin slices → PA-04 Student slices → PA-05 backend boundaries → PA-06 design convergence → PA-07 performance → PA-08 legacy enforcement → PA-09 full verification`.

## 10. Historical continuity

`docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` preserves AR-01..AR-10 history but is **SUPERSEDED for future execution**.

Normal roadmap work after the architectural/refoundation program must still reconcile the previously documented Stage16 boundary and `STUDENT-016I` return point. The architecture workstream may reorganize existing capabilities; it must not silently implement or claim future roadmap capabilities without their own contracts/gates.

PR #52 remains Draft. No merge or auto-merge is authorized.