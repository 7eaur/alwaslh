# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-02 — Thin Admin shell + routing`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read in this order before mutation:

1. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`
2. `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_PROTOCOL_2026-09-14.md`
3. `PROJECT_ENGINEERING_LOG.md`
4. `PROJECT_HANDOFF.md`
5. `docs/workstreams/ADMIN_BACKEND_AB01_EXECUTION_2026-09-14.md`
6. active architecture/product docs listed by those authorities.

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

## Branch reconciliation

Live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`. Compared with the prior reconciled main checkpoint `3053640cc5bb0699cfa7456cf646e8997f6aa81b`, the only new commit is the Student Experience V2 merge. No `apps/api`, `apps/admin-web`, or `database/migrations` path appears in that main-only delta. No scoped reconciliation is required before AB-02 discovery unless `main` moves again.

## AB-00 — DONE

Ownership map, dependency inventory, Architecture Guard, measured baseline and readiness gate are closed.

Frozen baseline: Admin JS **968.68 kB / 193.92 kB gzip**, Admin CSS **91.38 kB / 13.68 kB gzip**, Admin unit **71/71**, API unit **66/66**, clean PostgreSQL 16 migrations green, baseline real Chromium **9/9**.

## AB-01 — DONE / EXACT-HEAD VERIFIED

### AB-01.1 Shared API transport — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

### AB-01.2 Auth/session ownership — DONE

Owners: `features/auth/api/admin-auth-api.ts`, `features/auth/model/AdminSessionProvider.tsx`, public boundary `features/auth/public/index.ts`.

### AB-01.3 Product-state primitive — DONE

Source checkpoint: `cfa2016e056f6dc4f9669236414a7acbd9551011`.

### AB-01.4 Backend app composition foundation — DONE

Five bounded technical app seams are closed: CORS, health/readiness, public errors, Fastify construction/options and database lifecycle. Broad service/module composition remains for AB-03/AB-04 rather than a giant container/registry abstraction.

### AB-01.5 Common backend technical ownership — DONE

Generic request validation owner:

`apps/api/src/shared/http/request-validation.ts`

Complete implementation checkpoint: `d0352917f9df83dd15f9fbd7994ad79c1b9447dd`.

Verification HEAD `16c7ac34078d75b990422374954f30631ebbee45` differs from that source checkpoint only by documentation. Evidence:

- Architecture Guard `34834714337` — SUCCESS;
- Stage13E Admin AI `34834945644` — SUCCESS;
- Stage13E Combined Integration `34834945655` — SUCCESS;
- Stage13G `34834945649` — SUCCESS.

Stage13G proves Admin/API quality, clean PostgreSQL migrations, database contract, relevant integration/security/auth regressions and real API + PostgreSQL + Chromium.

### AB-01.6 Foundation closure gate — PASS / DONE

No further shared-foundation extraction is authorized. Foundation ownership is sufficiently explicit and guarded for the next phase.

## AB-02 — ACTIVE

Goal: thin Admin bootstrap/providers/router/layouts + one shell/navigation owner + feature public route boundaries + substantial route lazy loading, while preserving authentication/session outcomes and route behavior.

AB-02 must begin with discovery rather than blind moves. Inspect current `apps/admin-web/src/App.tsx`, route/shell/navigation/session ownership, feature public/routes entries, route-focus/history/deep-link behavior, current tests and bundle composition. Do not redesign business workflows here; those belong to AB-03 vertical slices.

## Remaining roadmap

- AB-02 — thin Admin shell/router/providers/layouts + substantial lazy routes — **ACTIVE**
- AB-03 — vertical slices: Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes
- AB-04 — remaining backend modular-monolith normalization
- AB-05 — Admin design/interaction convergence
- AB-06 — performance/delivery validation
- AB-07 — legacy removal + hard dependency enforcement
- AB-08 — final full verification + live-main reconciliation

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and state `COMPLETE`, disable all three scheduled workers.

## Immediate next action

Perform AB-02 discovery only: inspect current Admin root composition/router/shell and current bundle/test/runtime evidence, define the smallest target seam and its parity gates, then implement no more than one coherent AB-02 increment.