# Admin + Backend Architecture Decision Review — 2026-09-14

Status: **REVIEWED / BINDING CHECKPOINT**

## 1. Ownership boundary — clarified

This workstream is responsible for the project’s **full backend/server architecture and the entire Super Admin product**.

Owned here:

- Super Admin frontend, UX/UI, IA, routing, accessibility, performance and design consistency;
- complete Fastify API and PostgreSQL-backed backend;
- all server-side business/security capabilities whether consumed by Admin, Student, or both;
- auth/session/device, access/entitlements, curriculum/publication, content/media/OCR, AI/human review, Question Bank, Quiz Builder, assessment/scoring, offline authorization/integrity, notifications and operations on the server side;
- database integrity/migrations, API contracts, backend performance, security, tests/CI and cross-module architecture;
- genuinely shared packages required by those contracts.

The **only product area structurally excluded** from this workstream is the Student frontend implementation itself (`apps/student-web` UI/shell/routes/components/visual structure), because it is owned by the separate Student conversation/branch.

Student frontend tests/code remain valid consumer evidence whenever this workstream changes a shared backend contract. Student-facing backend behavior is not excluded.

Observed separate Student continuation at this review: PR #57 / `stage16/student-016i`, latest observed head `ce97ef2524cd3735a0200ee0f15fa6e6e224e01e`.

## 2. Why this review exists

Before structural implementation, the current plan, dependency audit, target IA, design-system authority, project-specific engineering rules, branch state, Student refoundation principles and exact-head CI were re-reviewed against repository evidence.

The purpose is to catch a wrong architectural decision **before** it becomes a large migration.

Anything outside inspected evidence remains `NOT YET VERIFIED` until its owning batch.

## 3. Cross-product rules adopted from Student refoundation

The Student workstream is implementation-isolated, but its strongest verified product/engineering principles are useful across the platform and are now adopted here.

Binding order:

**Clarity → Ease of use → Flow → Visual comfort → Consistency → Polish**

Adopted rules:

- one shell/route/workflow owner per responsibility;
- preserve verified contracts and business authority, not old presentation debt;
- no fake metrics, counts, progress, health, outcomes or actions;
- loading/empty/error/permission/conflict/unavailable/success/recovery are first-class product states;
- interactive affordance must be obvious; static content must not mimic actions;
- lazy loading at substantial route/workflow boundaries, not artificial tiny chunks;
- browser tests prove outcomes/contracts rather than obsolete text/DOM shape;
- old UI is not retained solely because historical tests referenced it;
- historical override chains/compatibility bridges have explicit deletion conditions;
- motion is functional and reduced-motion-safe;
- UI architecture completion and backend capability completion are separate claims;
- backend/security authority remains server-owned even when a UI surface exists before integration.

These principles are adapted to Admin/backend needs. Student UI code/structure is not copied into this workstream.

## 4. Branch divergence decision

Repository comparison established that the Admin/backend branch and `main` have diverged substantially, but the inspected `main`-only implementation work at the checkpoint was Student frontend/workflow and documentation work rather than Admin/API/migrations/scoped-shared implementation changes.

Decision:

**CONTINUE this scoped Admin/backend branch without importing Student frontend implementation into it.**

Do not merge/rebase merely to make commit counts look aligned while the Student frontend workstream is active separately.

However:

1. live `main` must be re-compared before every structural phase boundary;
2. if `main` gains changes under Admin/API/migrations/shared-contract paths, structural work pauses until reconciled;
3. before PR #52 becomes review/merge-ready, reconcile current `main` and resolve documentation conflicts explicitly;
4. no divergence is treated as harmless without path-level comparison.

## 5. Decision review matrix

| Decision | Verdict | Review adjustment |
|---|---|---|
| Backend stays one Fastify modular monolith | **KEEP** | Correct. No evidence supports microservices. |
| PostgreSQL/API remain canonical business authority | **KEEP** | Security/business authority stays server-owned. |
| Full backend ownership includes Student-facing contracts | **KEEP / CLARIFIED** | Student frontend is separate; server capabilities are owned here. |
| Admin becomes `app / features / shared` | **KEEP** | Correct ownership model. `app` composes only. |
| Feature owns pages/components/API adapter/model/tests | **KEEP** | Correct; do not move giant legacy files unchanged. |
| Preserve old `reviews` / `ai-authoring` as permanent top-level features | **REFINE / REJECT AS TARGET** | OCR review belongs to Content; AI jobs/review belong to AI; contextual authoring belongs to Lesson/Question/Quiz workflows. |
| Cross-feature collaboration through public contract/app orchestration | **KEEP** | Architecture Guard enforces it. |
| Route-level code splitting | **KEEP / REFINE** | Lazy-load major workflow route modules; do not split tiny components simply to increase chunk count. |
| One shell owns global navigation | **KEEP** | Session/shell/router ownership is centralized without turning app state into business authority. |
| Session invalidation moves out of every feature page | **KEEP** | Central lifecycle boundary; feature errors remain meaningful domain/transport errors. |
| `packages/ui` + Admin `shared/ui` | **REFINE** | `packages/ui` owns cross-product primitives/semantics; Admin `shared/ui` owns Admin-only reusable patterns. |
| Shared domain/validation packages expand | **REFINE** | Only genuinely shared stable contracts. Feature/module-private types remain local. |
| Target backend module folders `domain/application/infrastructure/http/tests` | **KEEP / REFINE** | Dependency model only. Never create empty layers/interfaces for ceremony. |
| Introduce generic repositories/services/interfaces everywhere | **REJECT** | Abstraction requires ownership/test/reuse/framework-decoupling value. |
| Add a new global frontend state/query library now | **NOT AUTHORIZED** | Correct ownership first; add only on evidence. |
| Replace CSS stack/Tailwind/CSS-in-JS wholesale | **REJECT** | Preserve approved tokens/CSS architecture; repair ownership. |
| Target IA user-job hierarchy | **KEEP** | Binding screen/task boundaries remain valid. |
| Literal `/admin` prefix from Target IA | **REFINE** | Preserve verified `/app` base unless runtime evidence justifies change; fix child route semantics. |
| Overview attention-first | **KEEP** | Real actionable values only; no decorative KPI/navigation duplication. |
| Progressive disclosure for IDs/raw provider/runtime data | **KEEP** | Normal operator flows stay decision-focused. |
| Design rules applied only in final polish | **REJECT** | UX/a11y/RTL/responsive/state rules apply during every vertical slice. |
| Build all Admin UI slices before correcting backend seams | **REJECT** | Rebuild each slice end-to-end through required backend/API/Admin layers; finish remaining backend normalization afterward. |
| Big-bang rewrite | **REJECT** | Controlled replacement slice-by-slice with old-owner deletion after parity. |
| Patch current pages indefinitely | **REJECT** | Current code is behavioral evidence, not target architecture. |

## 6. Admin UI ownership refinement

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

Target top-level feature concepts follow operator jobs:

```text
auth
overview
curriculum
content        # library, ingestion, OCR review
ai             # jobs + human review
questions
quizzes
students
access-codes
operations
```

Contextual AI authoring is owned by the domain workflow that invokes it rather than a permanent catch-all top-level workspace.

Do not create duplicate Button/Input/Status primitives locally if `packages/ui` owns them. Conversely, do not push Admin-only dense table/review workflow composition into `packages/ui` merely to call it shared.

## 7. Route decision

IA semantics in `TARGET_INFORMATION_ARCHITECTURE.md` are binding; the literal root prefix is not worth breaking verified runtime by itself.

Current verified Admin shell uses `/app/*`.

Target child semantics evolve under it:

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

## 8. Backend boundary refinement

Target backend layering is intentionally selective.

Rules:

- HTTP parses/adapts and delegates; it does not become a second application layer.
- Application owns use-case orchestration and transaction boundaries where needed.
- Domain owns durable business rules only when a real domain concept exists.
- Infrastructure owns DB/provider/filesystem adapters.
- A small module may remain compact if responsibilities are obvious without artificial folders/classes.
- Cross-module calls use narrow public application contracts where a genuine dependency exists.
- Do not create an interface solely because Clean Architecture diagrams usually contain one.
- server-side Student security/business authority is preserved even though Student frontend structure is handled elsewhere.

## 9. Architecture Guard review

The guard direction is correct. It must:

1. detect static and dynamic imports relevant to architectural boundaries;
2. prevent app composition from bypassing feature/module public entry points;
3. operate as a ratchet during migration;
4. advance its frozen legacy baseline only after accepted exact-head-green cleanup batches;
5. become hard target-architecture enforcement after legacy owners are removed.

## 10. Execution-order correction

A major review adjustment is now binding:

Do **not** finish the whole Admin frontend and postpone backend structure until afterward.

Correct order:

1. AB-00 — baseline/guard/readiness;
2. AB-01 — minimal shared Admin + backend app/transport/auth/error foundations;
3. AB-02 — thin Admin shell/router/lazy route architecture;
4. AB-03 — end-to-end vertical slices; each slice may correct its backend contracts/module seams and Admin ownership together;
5. AB-04 — remaining backend modular-monolith normalization not naturally closed by slices;
6. AB-05..08 — convergence, performance, legacy deletion, final verification.

This prevents building a clean UI over backend seams we already know are structurally wrong.

## 11. Correct next gate

Do **not** start broad feature rebuilding yet.

Finish AB-00 in this order:

1. keep strengthened architecture guard exact-head green;
2. AB-00.4 record reproducible Admin bundle/runtime and backend-composition baseline;
3. AB-00.5 readiness confirms scope, ownership, branch evidence and architecture decisions are coherent;
4. then begin the minimal AB-01 foundation.

This preserves the Product Owner requirement: **rebuild correctly from the root, not patch quickly.**
