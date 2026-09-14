# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-01 — Shared foundations`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read in this order before mutation:

1. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`
2. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `PROJECT_HANDOFF.md`
5. `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`
6. `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`
7. active architecture/product docs listed by those authorities.

Workers A/B/C share one branch and ordered roadmap. If another worker is active, do not create overlapping mutations. Every run performs one smallest coherent increment and ends `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, or `COMPLETE`.

## Permanent rules

- PostgreSQL/API are canonical business authority.
- Backend stays one Fastify modular monolith; no microservices/DI/service locator without evidence.
- Admin `app` composes only; features own workflows and expose narrow public/routes boundaries.
- Feature internals stay private; shared cannot import app/features.
- No new global state/query framework or styling-stack rewrite without evidence.
- No fabricated metrics/outcomes/actions.
- Loading/Empty/Error/Permission/Conflict/Unavailable/Long-running/Success/Recovery are first-class states.
- Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are architecture requirements.
- Tests/security/validation are never weakened to make migration pass.
- No permanent dual ownership.

Migration law:

`job/use case → DB/API/security contracts → current owner → target owner → states/flow → backend seam correction → replacement → outcome verification → switch → legacy deletion → exact-head gates → documentation`

## Branch reconciliation

Current live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`, the Student Experience V2 merge checkpoint. It does not overlap the just-closed AB-01.4 API composition seams. Reconcile again at the next structural phase boundary.

## AB-00 — DONE

Ownership map, dependency inventory, Architecture Guard, measured baseline and readiness gate are closed.

Frozen baseline: Admin JS **968.68 kB / 193.92 kB gzip**, Admin CSS **91.38 kB / 13.68 kB gzip**, Admin unit **71/71**, API unit **66/66**, clean PostgreSQL 16 migrations green, baseline real Chromium **9/9**.

## AB-01 — ACTIVE

### AB-01.1 Shared API transport — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

### AB-01.2 Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, public boundary `features/auth/public/index.ts`.

### AB-01.3 Product-state primitive — DONE

Source checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

### AB-01.4 Backend app composition foundation — DONE

Closed bounded seams:

- CORS/preflight — source `dbdc9245f2d0e283d047d7e1254748e55f890a55`;
- health/readiness — source `a302871b3486ae95810cea40dccca68363a29055`;
- public not-found/error handling — source `001d45892bf4a17458f3beaeaaa1a7430be49b44`;
- Fastify instance construction/options — source `d8fdcbaf16a3ac07ac39412dfa916b7b7fa8979d`;
- database lifecycle registration — source+test `101f61a9c25e3de116d0074a3ef7e2f760eb98a7`.

Database lifecycle owner: `apps/api/src/app/plugins/database-lifecycle.ts`. `apps/api/src/app.ts` no longer embeds the database `onClose` hook; focused app test coverage proves `app.close()` delegates to the supplied `database.close()` exactly once.

Closure evidence for the fifth seam/source-equivalent tree:

- Architecture Guard `34825750566` — SUCCESS on source composition commit;
- compare `101f61a9c25e3de116d0074a3ef7e2f760eb98a7...e61400652267a4c836c40abf35a58a434b0fff08` changes only canonical documentation files;
- Admin AI `34826063345` — SUCCESS;
- Combined Integration `34826063326` — SUCCESS including API/Admin quality, clean PostgreSQL, database contract, backend authority/auth-security regressions and real Admin Chromium;
- Stage13G `34826063330` — SUCCESS including Admin UI quality, API lint/typecheck/unit/build, clean PostgreSQL, integration/auth regressions and real API + PostgreSQL + Chromium.

AB-01.4 closes here. Remaining broad service construction, cross-service composites, multi-consumer infrastructure construction and whole-product route registration stay in `app.ts` for now. Moving them wholesale would create a giant container/registry without evidence; workflow-driven normalization belongs in AB-03 and residual backend cleanup in AB-04.

### AB-01.5 Common backend technical ownership — NEXT

Normalize only proven cross-cutting technical concerns. Domain/business rules remain with module owners. Discovery must identify an actual duplicated/misowned technical concern before any extraction.

### AB-01.6 Foundation closure gate — PENDING

Requires one-owner foundations, no new dependency violations, bounded compatibility debt, Architecture Guard, Admin/API quality, clean PostgreSQL, relevant integration/security/auth and real API + PostgreSQL + Chromium evidence, with docs matching code.

## Remaining roadmap

- AB-02 — thin Admin shell/router/providers/layouts + substantial lazy routes
- AB-03 — vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence
- AB-06 — performance/delivery validation
- AB-07 — legacy removal + hard dependency enforcement
- AB-08 — final full verification + live-main reconciliation

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and state `COMPLETE`, disable all three scheduled workers.

## Immediate next action

Begin **AB-01.5 discovery only**: inspect currently duplicated/misowned cross-cutting backend technical concerns (HTTP/auth/error/db/observability/media infrastructure) and select at most one small evidence-backed ownership correction. Do not invent shared abstractions, containers or framework layers. If no AB-01.5 move is justified, document that and proceed to AB-01.6 rather than manufacturing work.