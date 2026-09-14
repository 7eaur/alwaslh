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
6. `docs/architecture/ADMIN_BACKEND_AB01_5_TECHNICAL_OWNERSHIP_DISCOVERY_2026-09-14.md`
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

## Branch reconciliation

Live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`. Compared with the prior reconciled main checkpoint `3053640cc5bb0699cfa7456cf646e8997f6aa81b`, the only new commit is the Student Experience V2 merge. No `apps/api`, `apps/admin-web`, or `database/migrations` path appears in that main-only delta. No scoped reconciliation is required before AB-01.5 implementation.

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

Five bounded technical app seams are closed: CORS, health/readiness, public errors, Fastify construction/options and database lifecycle. Fifth seam source+test checkpoint: `101f61a9c25e3de116d0074a3ef7e2f760eb98a7`; Architecture Guard, Admin AI, Combined and Stage13G closure evidence are green. Broad service/module composition remains for AB-03/AB-04 rather than a giant container/registry abstraction.

### AB-01.5 Common backend technical ownership — DISCOVERY COMPLETE / IMPLEMENTATION NEXT

Selected single correction: move the generic request-validation adapter (`parseBody`) out of private `auth/http.ts` ownership into:

`apps/api/src/app/http/request-validation.ts`

Evidence: Question Bank and Quiz Builder currently import this generic Zod→`AppError(BAD_REQUEST)` helper from Auth HTTP. The helper does not perform authentication/session behavior. `currentProfile` is explicitly excluded from this correction because it invokes AuthService/session authentication and remains Auth-owned.

Implementation contract: preserve `safeParse` semantics and exact invalid-input mapping `AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400)`; migrate every real current caller and nothing more. No auth/session/authorization redesign, no AppError/config/db/media move, no schema registry, no broad HTTP rewrite.

After exact-head verification of this one correction, AB-01.5 stops and AB-01.6 begins.

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

Implement **only** the AB-01.5 request-validation ownership correction documented in `docs/architecture/ADMIN_BACKEND_AB01_5_TECHNICAL_OWNERSHIP_DISCOVERY_2026-09-14.md`: search all current branch callers, create the small `app/http/request-validation.ts` owner, switch real callers, remove `parseBody` ownership from Auth HTTP, then run Architecture Guard + API quality + relevant auth/Question Bank/Quiz Builder/PostgreSQL/integration/Chromium gates. Do not start AB-01.6 until that exact-head evidence is green.