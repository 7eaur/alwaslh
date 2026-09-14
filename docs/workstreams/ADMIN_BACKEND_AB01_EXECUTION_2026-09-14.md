# AB-01 — Admin + Backend Foundation Execution

Date: **2026-09-14**  
Status: **ACTIVE / BINDING**

AB-01 creates only structural foundations required for later slices. No business-workflow redesign, framework ceremony, tuning mixed with ownership extraction, or folder movement for appearance.

Root-fix law:

`use case → authority/contract → owner → replacement → verification → switch → legacy removal condition`

## AB-01.1 — Shared API transport — DONE

Owner: `apps/admin-web/src/shared/api/client.ts`.

## AB-01.2 — Auth/session ownership — DONE

Owner: `apps/admin-web/src/features/auth/` with API, SessionProvider and public entry point. Root `LoginScreen.tsx` remains transitional presentation debt for AB-02.

## AB-01.3 — Product-state primitive — DONE

Source checkpoint `cfa2016e056f6dc4f9669236414a7acbd9551011`; shared Admin loading/error/retry presentation is owned by `shared/ui` while feature state machines and server truth remain feature-owned.

## AB-01.4 — Backend app composition foundation — DONE

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_4_COMPOSITION_DISCOVERY_2026-09-14.md`.

Closed bounded seams:

1. CORS/preflight — `apps/api/src/app/plugins/cors.ts`;
2. health/readiness — `apps/api/src/app/http/health.ts`;
3. public not-found/error handling — `apps/api/src/app/http/public-errors.ts`;
4. Fastify instance construction/options — `apps/api/src/app/create-fastify-instance.ts`;
5. database lifecycle registration — `apps/api/src/app/plugins/database-lifecycle.ts`.

Source+test checkpoint for the fifth seam: `101f61a9c25e3de116d0074a3ef7e2f760eb98a7`.

Closure evidence includes Architecture Guard `34825750566`, Admin AI `34826063345`, Combined `34826063326`, and Stage13G `34826063330` — SUCCESS. Broad service construction/route composition intentionally remains for workflow-driven AB-03/AB-04 work; no giant service container or route registry is authorized.

## AB-01.5 — Common backend technical ownership — IMPLEMENTED / WAITING FOR EXACT-HEAD CI

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_5_TECHNICAL_OWNERSHIP_DISCOVERY_2026-09-14.md`.

The one authorized correction is implemented: generic Zod request validation formerly exported as `parseBody` from private Auth HTTP is now owned by:

`apps/api/src/shared/http/request-validation.ts`

The first attempted placement under `app/http` was rejected by Architecture Guard because backend modules may not depend on app composition internals. The final shared HTTP owner is therefore intentional architecture, not a guard exception.

The contract remains unchanged: `safeParse` input, return parsed data on success, and throw `AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400)` on failure. `currentProfile`, `sessionToken`, authentication/session/cookie/role behavior remain Auth-owned.

Exact-head CI on intermediate checkpoint `cba5de4bd37c9382efff91820866e7c3c2937915` exposed an incomplete caller audit: eight additional modules still imported `parseBody` from Auth and failed TypeScript compilation. Those compiler-proven imports were migrated without altering schemas or behavior. Complete source implementation checkpoint:

`d0352917f9df83dd15f9fbd7994ad79c1b9447dd`

Current source-head evidence:

- Architecture Guard `34834714337` — SUCCESS;
- Stage13G `34834714355` — running; Admin lint/typecheck/unit and API lint/typecheck/unit already green;
- Admin AI `34834714335` — running;
- Combined Integration / real-browser `34834714325` — running.

Explicit non-goals remain unchanged: no auth/session/cookie/role redesign; no schema registry; no AppError move; no root config/db/media/observability folder normalization; no Question Bank/AI contract correction; no broad module HTTP rewrite.

Once the remaining exact-head PostgreSQL/integration/security/Chromium gates are green, mark AB-01.5 DONE and **stop foundation extraction**. Proceed directly to AB-01.6.

## AB-01.6 — Foundation closure gate — PENDING

Requires one-owner foundations, no new dependency violations, bounded compatibility debt, Architecture Guard, Admin/API quality, clean PostgreSQL, relevant integration/security/auth and real API + PostgreSQL + Chromium evidence, with docs matching code.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/layouts/lazy routes → AB-03 vertical slices → AB-04 remaining backend normalization → AB-05 design/interaction convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.