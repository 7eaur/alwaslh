# AB-01 — Admin + Backend Foundation Execution

Date: **2026-09-14**  
Status: **DONE / EXACT-HEAD VERIFIED**

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

## AB-01.5 — Common backend technical ownership — DONE

Canonical discovery: `docs/architecture/ADMIN_BACKEND_AB01_5_TECHNICAL_OWNERSHIP_DISCOVERY_2026-09-14.md`.

The one authorized correction is closed: generic Zod request validation formerly exported as `parseBody` from private Auth HTTP is now owned by:

`apps/api/src/shared/http/request-validation.ts`

The first attempted placement under `app/http` was rejected by Architecture Guard because backend modules may not depend on app composition internals. The final shared HTTP owner is intentional architecture, not a guard exception.

The contract remains unchanged: `safeParse` input, return parsed data on success, and throw `AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400)` on failure. `currentProfile`, `sessionToken`, authentication/session/cookie/role behavior remain Auth-owned.

Exact-head CI on intermediate checkpoint `cba5de4bd37c9382efff91820866e7c3c2937915` exposed an incomplete caller audit. Eight additional compiler-proven imports were migrated without altering schemas or behavior. Complete source implementation checkpoint:

`d0352917f9df83dd15f9fbd7994ad79c1b9447dd`

The five commits from that source checkpoint to verification HEAD `16c7ac34078d75b990422374954f30631ebbee45` changed canonical documentation only, so source-tree behavior is equivalent.

Closure evidence:

- Architecture Guard `34834714337` — SUCCESS on source checkpoint;
- Stage13E Admin AI `34834945644` — SUCCESS on verification HEAD;
- Stage13E Combined Integration `34834945655` — SUCCESS on verification HEAD;
- Stage13G Admin Operations `34834945649` — SUCCESS on verification HEAD.

Stage13G explicitly proves Admin lint/typecheck/unit/build, API lint/typecheck/unit/build, clean PostgreSQL migrations, database contract, Accounts/Access, Notifications/Operations, Reports/Settings/Security/Audit, AI authoring, Access/Auth regression and real API + PostgreSQL + Chromium.

Explicit non-goals remain unchanged: no auth/session/cookie/role redesign; no schema registry; no AppError move; no root config/db/media/observability folder normalization; no Question Bank/AI contract correction; no broad module HTTP rewrite.

## AB-01.6 — Foundation closure gate — PASS / DONE

Foundation closure is accepted because:

- the new foundations have single intentional owners;
- Architecture Guard reports no new boundary violation;
- compatibility debt remains bounded and assigned to later roadmap phases rather than duplicated ownership;
- Admin and API quality gates are green;
- clean PostgreSQL migration and database-contract verification are green;
- relevant integration/security/auth regressions are green;
- real API + PostgreSQL + Chromium Admin verification is green;
- documentation is reconciled to the code and evidence;
- no Student frontend implementation was modified;
- PR #52 remains Draft/unmerged.

No further AB-01 foundation extraction is authorized. Broad workflow/module ownership corrections belong to AB-02/AB-03/AB-04 according to their actual use cases.

## Exact continuation

AB-02 is now the only active next phase: thin Admin shell/router/providers/layouts + substantial lazy route boundaries.

AB-02 must begin with live evidence of current `App.tsx`, shell/router/session ownership, route graph, feature public/routes entry points, route focus/history/deep-link behavior and bundle composition before mutation. Do not redesign business workflows in AB-02; preserve auth/session outcomes and defer vertical workflow corrections to AB-03.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/layouts/lazy routes → AB-03 vertical slices → AB-04 remaining backend normalization → AB-05 design/interaction convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

PR #52 remains Draft until AB-08 is complete and live `main` is reconciled again.