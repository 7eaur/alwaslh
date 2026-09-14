# Admin + Backend Architecture Decision Review — 2026-09-14

Status: **REVIEWED / BINDING CHECKPOINT**

Scope: Super Admin frontend + full backend/API/PostgreSQL + genuinely shared packages required by those surfaces. Student frontend remains owned by its separate branch/workstream.

## 1. Why this review exists

Before structural implementation, the current plan, dependency audit, target IA, design-system authority, project-specific engineering rules, branch state and exact-head CI were re-reviewed against repository evidence.

The purpose is to catch a wrong architectural decision **before** it becomes a large migration.

## 2. Evidence reviewed

- live `main`: `3053640cc5bb0699cfa7456cf646e8997f6aa81b`;
- Admin architecture branch before this review: `f7c56628bc89e1a534c24bd2ba4771b61313664b`;
- Draft PR #52;
- `PROJECT_STATUS.md`;
- `PROJECT_ENGINEERING_LOG.md`;
- `PROJECT_HANDOFF.md`;
- `DOCUMENTATION_INDEX.md`;
- `ADMIN_BACKEND_ARCHITECTURE_REBUILD_2026-09-14.md`;
- `ADMIN_BACKEND_MIGRATION_INVENTORY_2026-09-14.md`;
- `ADMIN_BACKEND_DEPENDENCY_AUDIT_2026-09-14.md`;
- `ADMIN_PRODUCT_DESIGN_ARCHITECTURE_RULES_2026-09-14.md`;
- `TARGET_INFORMATION_ARCHITECTURE.md`;
- `DESIGN_SYSTEM_SPEC.md`;
- Alwaslh project skill and focused Admin/frontend/backend/project guardrails;
- current Admin `App.tsx`, router/navigation and representative feature pages;
- current API `app.ts` and representative Question Bank/AI boundaries;
- architecture-guard code/workflow;
- exact-head workflows for `f7c56628...`.

Anything outside that evidence remains `NOT YET VERIFIED` until its owning batch.

## 3. Branch divergence decision

Repository comparison shows:

- architecture branch is **284 commits ahead** of `main`;
- architecture branch is **170 commits behind** `main`;
- merge-base is `8d0676443aa7e186c41a79cc011f7f828d1290ef`.

The 170 `main`-only commits inspected from merge-base to live `main` affect **Student frontend/workflows and project/product documentation**, not:

- `apps/admin-web`;
- `apps/api`;
- `database/migrations`;
- the shared packages used by the current Admin/backend implementation.

### Decision

**CONTINUE this scoped Admin/backend branch without importing Student implementation into it.**

Do **not** merge/rebase `main` merely to make commit counts look aligned while Student work is active separately.

However:

1. live `main` must be re-compared before every structural phase boundary;
2. if `main` gains changes under Admin/API/migrations/shared contract paths, structural work pauses until those changes are reconciled;
3. before PR #52 becomes review/merge-ready, the branch must reconcile current `main` and resolve documentation conflicts explicitly;
4. no branch divergence claim may be treated as harmless without a path-level comparison.

This is controlled isolation, not permission to ignore `main`.

## 4. Decision review matrix

| Decision | Verdict | Review adjustment |
|---|---|---|
| Backend stays one Fastify modular monolith | **KEEP** | Correct. No evidence supports microservices. |
| PostgreSQL/API remain canonical business authority | **KEEP** | Security/business authority stays server-owned. |
| Admin becomes `app / features / shared` | **KEEP** | Correct ownership model. `app` composes only. |
| Feature owns pages/components/API adapter/model/tests | **KEEP** | Correct; do not move giant legacy files unchanged. |
| Cross-feature collaboration through public contract/app orchestration | **KEEP** | Architecture Guard must enforce it. |
| Route-level code splitting | **KEEP / REFINE** | Lazy-load major workflow route modules; do not split tiny components simply to increase chunk count. |
| One shell owns global navigation | **KEEP** | Session/shell/router ownership is centralized without turning app state into business authority. |
| Session invalidation moves out of every feature page | **KEEP** | Central lifecycle boundary; feature errors remain meaningful domain/transport errors. |
| `packages/ui` + Admin `shared/ui` | **REFINE** | `packages/ui` owns genuinely cross-product primitives/semantics; Admin `shared/ui` owns Admin-only reusable patterns/composition helpers. Do not duplicate the same primitive in both. |
| Shared domain/validation packages expand | **REFINE** | Only for genuinely shared stable contracts. Feature/module-private types remain local. |
| Target backend module folders `domain/application/infrastructure/http/tests` | **KEEP / REFINE** | Dependency model only. Never create empty layers/interfaces for ceremony. |
| Introduce generic repositories/services/interfaces everywhere | **REJECT** | Abstraction requires ownership/test/reuse/framework-decoupling value. |
| Add a new global frontend state/query library now | **NOT AUTHORIZED** | Existing evidence does not justify it yet. Evaluate only if repeated server-state orchestration remains after feature ownership is corrected. |
| Replace CSS stack/Tailwind/CSS-in-JS wholesale | **REJECT** | Keep approved tokens and CSS foundation; repair ownership and reusable patterns instead of creating a second styling architecture. |
| Target IA user-job hierarchy | **KEEP** | Binding screen/task boundaries remain valid. |
| Literal `/admin` prefix from Target IA | **REFINE** | The Admin is already a separate app and `/app` is verified runtime/deep-link behavior. Preserve `/app` as canonical base unless deployment/runtime evidence proves a need to change it; migrate child route semantics to the target IA and provide bounded redirects for superseded routes. |
| Overview attention-first | **KEEP** | Real actionable values only; no decorative KPI/navigation duplication. |
| Progressive disclosure for IDs/raw provider/runtime data | **KEEP** | Normal operator flows stay decision-focused. |
| Design rules applied only in final polish | **REJECT** | UX/a11y/RTL/responsive/state rules apply during every vertical slice. AB-05 is convergence audit only. |
| Big-bang rewrite | **REJECT** | Controlled replacement slice-by-slice with old-owner deletion after parity. |
| Patch current pages indefinitely | **REJECT** | Current code is behavior evidence, not target architecture. |

## 5. Admin UI ownership refinement

Target relationship:

```text
packages/brand
  ↓
packages/ui                 # cross-product primitives/semantics only
  ↓
apps/admin-web/src/shared   # Admin-only reusable patterns/adapters
  ↓
apps/admin-web/src/features # business workflow composition
  ↓
apps/admin-web/src/app      # composition/router/providers/layout only
```

Dependency direction is conceptual; `app` composes feature public route modules and shared layers, but features never import app internals.

Do not create a duplicate Button/Input/Status primitive locally if `packages/ui` already owns the semantic primitive. Conversely, do not push Admin-only dense tables/review workflow composition into `packages/ui` merely to call it shared.

## 6. Route decision

The **IA semantics** in `TARGET_INFORMATION_ARCHITECTURE.md` are binding; the literal root prefix is not worth breaking verified runtime for by itself.

Current verified Admin shell uses `/app/*`.

Target child semantics should evolve toward clear job routes beneath that base, for example:

```text
/app
/app/curriculum/...
/app/content/library/...
/app/content/ingestion/...
/app/content/ocr/...
/app/ai/jobs/...
/app/ai/review/...
/app/questions/...
/app/quizzes/...
/app/students/...
/app/access/codes/...
/app/operations/...
```

Old routes may redirect during a bounded migration window, with an explicit deletion condition.

## 7. Backend boundary refinement

Target backend layering is intentionally selective.

Rules:

- HTTP parses/adapts and delegates; it does not become a second application layer.
- Application owns use-case orchestration and transaction boundaries where needed.
- Domain owns durable business rules only when a real domain concept exists.
- Infrastructure owns DB/provider/filesystem adapters.
- A small module may remain compact if these responsibilities are obvious without artificial folders/classes.
- Cross-module calls use narrow public application contracts/ports only where a genuine dependency exists.
- Do not create an interface solely because Clean Architecture diagrams usually contain one.

## 8. Architecture Guard review

Initial guard is a good direction and exact-head run `34797219591` passed.

Review found two missing protections and one operational limitation:

1. dynamic `import()` must be inspected because route lazy loading will use it;
2. `app` must not bypass feature/module public entry points and import private internals directly;
3. the frozen-baseline ratchet must be **advanced after accepted exact-head-green cleanup batches**; otherwise an old baseline exception could remain implicitly permitted forever.

The guard is being strengthened before AB-00.3 is considered final.

AB-07 will later replace transitional ratchet behavior with hard target-architecture enforcement after legacy owners are removed.

## 9. Exact-head verification reviewed

For `f7c56628bc89e1a534c24bd2ba4771b61313664b`:

- Architecture Guard `34797219591` — **SUCCESS**;
- Admin AI Operations `34797219497` — **SUCCESS**;
- Combined Integration `34797219488` — **SUCCESS**;
- Stage13G Admin Operations `34797219505` — **SUCCESS**.

Therefore the pre-review architecture checkpoint is behaviorally green.

## 10. Documentation defects found

The following were stale/inconsistent and must be corrected before implementation proceeds:

- PR #52 still described platform-wide Student + Admin `PA-*` execution;
- `DOCUMENTATION_INDEX.md` still pointed to platform-wide PA documents as active authority;
- `PROJECT_ENGINEERING_LOG.md` still listed Student architecture migration and PA phases;
- `PROJECT_STATUS.md` still described AB-00.2 active / AB-00.3 pending after both had progressed;
- `PROJECT_HANDOFF.md` remained a broad unified-main/Stage16 handoff rather than a usable handoff for this scoped Admin/backend branch.

Canonical execution authority is now the **AB** workstream, not PA.

The older `PLATFORM_ARCHITECTURE_*` documents remain historical rationale only where their general decisions are still compatible with this review.

## 11. Correct next gate

Do **not** start AB-01 yet.

Finish AB-00 in this order:

1. finalize strengthened AB-00.3 guard and verify exact-head;
2. AB-00.4 record reproducible Admin bundle/runtime and backend-composition baseline;
3. reconcile active documentation/PR/handoff to the same AB execution point;
4. AB-00.5 readiness review confirms no unresolved scope/authority/baseline contradiction;
5. then begin AB-01.

This preserves the user's requirement: **build correctly from the root, not patch quickly.**
