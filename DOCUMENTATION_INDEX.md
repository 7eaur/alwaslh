# DOCUMENTATION INDEX — الوسيلة الذكية

> Recovery map for the current **Super Admin + Backend Architecture Rebuild**. Code/migrations/executable CI/runtime evidence outrank prose.

Last synchronized: **2026-09-14 — scoped AB architecture review completed; AB-00 active.**

## 1. Source-of-truth precedence

When sources conflict:

1. current repository code + PostgreSQL migrations/schema + executable tests/CI;
2. verified runtime evidence for runtime-specific claims;
3. current explicit Product Owner direction;
4. scoped active Admin/backend authorities below;
5. approved product/IA/design-system authorities;
6. `PROJECT_STATUS.md`;
7. `PROJECT_ENGINEERING_LOG.md`;
8. `PROJECT_HANDOFF.md`;
9. historical workstreams/roadmaps.

Anything not inspected/executed = `NOT YET VERIFIED`.

## 2. Mandatory startup order for this branch/workstream

1. live-check `main` and `rebuild/super-admin-foundation` HEADs;
2. `PROJECT_STATUS.md`;
3. `PROJECT_ENGINEERING_LOG.md`;
4. `docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md`;
5. `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`;
6. `docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`;
7. `docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`;
8. `docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`;
9. `docs/architecture/ADMIN_BACKEND_AB00_REVIEW_CHECKLIST_2026-09-14.md`;
10. `docs/product/TARGET_INFORMATION_ARCHITECTURE.md`;
11. `docs/product/DESIGN_SYSTEM_SPEC.md`;
12. `docs/product/CONTENT_LANGUAGE_RULES.md`;
13. `.agents/skills/alwaslh-product-engineering/SKILL.md` and only the focused references needed by the batch;
14. `PROJECT_HANDOFF.md`;
15. inspect actual current code/migrations/tests/workflows for the batch;
16. check exact-head GitHub Actions before mutation/closure.

For backend changes that affect Student-consumed contracts, also read/run only the necessary Student consumer contract evidence. Do not migrate Student frontend here.

## 3. Active scope

Execution target:

- `apps/admin-web`;
- `apps/api`;
- `database/migrations`;
- genuinely relevant shared packages.

Student frontend is a separate workstream (`stage16/student-016i` / PR #57 at latest reconciliation).

## 4. Active architecture authorities

| File | Authority |
|---|---|
| `docs/architecture/ADMIN_BACKEND_ARCHITECTURE_REVIEW_2026-09-14.md` | latest smart review of decisions, branch isolation, refinements and rejected overengineering |
| `docs/workstreams/ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md` | binding scoped roadmap, target structure, gates and migration law |
| `docs/product/ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md` | binding Admin UX/IA/design/useability rules |
| `docs/architecture/ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md` | current→target ownership/classification/removal map |
| `docs/architecture/ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md` | evidence-backed dependency/coupling findings |
| `docs/architecture/ADMIN_BACKEND_AB00_REVIEW_CHECKLIST_2026-09-14.md` | readiness checklist before AB-01 |
| `PROJECT_STATUS.md` | concise active state/next action |
| `PROJECT_ENGINEERING_LOG.md` | verified history + current decisions/evidence |

## 5. Product/design authorities reused, not duplicated

| File | Purpose |
|---|---|
| `docs/product/TARGET_INFORMATION_ARCHITECTURE.md` | user-job/screen hierarchy; child route semantics |
| `docs/product/DESIGN_SYSTEM_SPEC.md` | brand/tokens/components/state/RTL/a11y/responsive authority |
| `docs/product/CONTENT_LANGUAGE_RULES.md` | human-facing language/technical-detail boundary |
| `packages/brand/*` | canonical identity/tokens/assets |

Important review refinement: Target IA's literal `/admin` prefix is **not** a mandate to break the verified separate Admin runtime. `/app` remains the current canonical base unless deployment/runtime evidence proves otherwise; user-job child-route semantics remain binding.

## 6. Shared UI ownership

- `packages/brand` — identity/tokens.
- `packages/ui` — genuinely cross-product primitives/semantic behavior.
- `apps/admin-web/src/shared` — Admin-only reusable patterns/adapters.
- `features/*` — business workflow composition/vocabulary.
- `app/*` — composition/router/providers/layout only.

Do not duplicate the same primitive across shared layers.

## 7. Backend authority

Backend remains one Fastify modular monolith over PostgreSQL.

Conceptual dependency model:

`HTTP → Application → Domain`, with Infrastructure adapters.

This does not require every small module to have empty folders/interfaces. No microservices, DI framework or repository/interface ceremony without evidence.

## 8. Historical / superseded execution documents

The following preserve rationale/history but are **not active execution authorities**:

- `docs/workstreams/PLATFORM_ARCHITECTURE_REBUILD_2026-09-14.md`;
- `docs/workstreams/PLATFORM_ARCHITECTURE_DECISIONS_2026-09-14.md`;
- `docs/workstreams/PLATFORM_ARCHITECTURE_EXECUTION_RULES_2026-09-14.md`;
- `docs/architecture/PLATFORM_OWNERSHIP_BOUNDARIES_2026-09-14.md`;
- `docs/workstreams/SUPER_ADMIN_REBUILD_2026-09-13.md` (AR history).

The original platform-wide concept was narrowed by Product Owner direction because Student frontend is being rebuilt independently. Use Git history for the former detailed PA rationale if needed.

## 9. Current verified baseline

Pre-review exact-head `f7c56628bc89e1a534c24bd2ba4771b61313664b`:

- Architecture Guard `34797219591` SUCCESS;
- Admin AI Operations `34797219497` SUCCESS;
- Combined Integration `34797219488` SUCCESS;
- Stage13G Admin Operations `34797219505` SUCCESS.

Latest review strengthened the guard and reconciled architecture decisions; fresh exact-head verification is required before AB-00.3 closes.

## 10. Active execution point

`AB-00.4 — Admin bundle/runtime + backend composition baseline` is next **after strengthened AB-00.3 exact-head verification**.

Do not begin AB-01 until AB-00.5 readiness confirms:

- one scope;
- one documentation authority;
- green architecture guard;
- reproducible baselines;
- no unresolved `main` changes in scoped implementation paths.

PR #52 remains Draft. No merge/auto-merge.
