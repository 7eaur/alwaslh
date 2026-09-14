# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, current code/tests/migrations and exact-head Actions;
6. confirm no active worker collision;
7. compare live `main` at structural phase boundaries or when overlapping scoped changes appear.

Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned here: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification.

Excluded only: structural/design implementation of `apps/student-web` frontend. Student-facing backend remains in scope.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `258c5bc2c09a049afb57c0593b5b6ca9db532c62`.

Latest live-main reconciliation: compared prior checkpoint `3053640cc5bb0699cfa7456cf646e8997f6aa81b` to current main. The only main-only commit is Student Experience V2; no `apps/api`, `apps/admin-web`, or `database/migrations` path appears in the delta. No scoped reconciliation is required before closing the current AB-01.5 correction.

## Execution governance

Workers A/B/C share one branch and roadmap in serial order. Shared state is `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. If another worker is active, do not mutate overlapping work. Each run performs one smallest coherent increment and leaves exact HEAD, CI evidence, next step and one of `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, `COMPLETE`.

## Current phase

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 — DONE
- AB-01.2 — DONE
- AB-01.3 — DONE
- AB-01.4 — DONE
- AB-01.5 — **IMPLEMENTED / WAITING FOR EXACT-HEAD CI**
- AB-01.6 — PENDING

## AB-01.5 implemented correction

Generic `parseBody(...)` request validation is now owned by:

`apps/api/src/shared/http/request-validation.ts`

Architecture Guard rejected the earlier `app/http` placement, so the final owner is generic shared HTTP infrastructure. Auth retains `currentProfile`, `sessionToken` and all session/cookie/role/authentication responsibilities. Validation behavior is unchanged.

Exact-head CI on intermediate HEAD `cba5de4bd37c9382efff91820866e7c3c2937915` exposed eight remaining callers importing `parseBody` from private Auth HTTP. Worker C migrated only those imports and committed the complete caller migration at:

`d0352917f9df83dd15f9fbd7994ad79c1b9447dd`

No business logic, schema behavior, migrations or Student frontend implementation changed.

## Verification state

For source checkpoint `d0352917...`:

- Architecture Guard `34834714337` — SUCCESS;
- Stage13G `34834714355` — running; Admin lint/typecheck/unit and API lint/typecheck/unit already green;
- Stage13E Admin AI `34834714335` — running;
- Stage13E Combined Integration / real-browser `34834714325` — running.

Do not mark AB-01.5 DONE while PostgreSQL/integration/security/Chromium evidence is still pending.

## Exact continuation

1. Inspect runs `34834714355`, `34834714335`, `34834714325` for source HEAD `d0352917...`.
2. If a run fails, fix only a root cause attributable to request-validation ownership; do not weaken tests/security/Architecture Guard.
3. If all required gates close green, mark **AB-01.5 DONE** across state/status/log/handoff/canonical AB-01 docs.
4. Then start only **AB-01.6 Foundation Closure Gate**.
5. Do not invent another shared-infrastructure extraction.

## Stop rule

After AB-01.5 is exact-head green, move directly to AB-01.6. Do not normalize root `config`, `db`, `errors`, media or observability merely to match a folder model.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.