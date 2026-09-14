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

Latest live-main reconciliation: compared prior checkpoint `3053640cc5bb0699cfa7456cf646e8997f6aa81b` to current main. The only main-only commit is Student Experience V2; no `apps/api`, `apps/admin-web`, or `database/migrations` path appears in the delta. No scoped reconciliation is required before the current AB-01.5 correction.

## Execution governance

Workers A/B/C share one branch and roadmap in serial order. Shared state is `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`. If another worker is active, do not mutate overlapping work. Each run performs one smallest coherent increment and leaves exact HEAD, CI evidence, next step and one of `READY_FOR_NEXT`, `WAITING_FOR_CI`, `BLOCKED`, `COMPLETE`.

## Current phase

- AB-00 — DONE
- AB-01 — ACTIVE
- AB-01.1 — DONE
- AB-01.2 — DONE
- AB-01.3 — DONE
- AB-01.4 — DONE
- AB-01.5 — **DISCOVERY COMPLETE / IMPLEMENTATION NEXT**
- AB-01.6 — PENDING

## AB-01.5 selected correction

Canonical discovery:

`docs/architecture/ADMIN_BACKEND_AB01_5_TECHNICAL_OWNERSHIP_DISCOVERY_2026-09-14.md`

Current evidence:

- `apps/api/src/auth/http.ts` owns generic `parseBody(...)` Zod request validation even though that helper performs no authentication/session behavior;
- `apps/api/src/question-bank/http.ts` imports it from private Auth HTTP for params/query/body validation;
- `apps/api/src/quiz-builder/http.ts` imports it likewise;
- `currentProfile(...)` is intentionally excluded because it authenticates through AuthService/session and remains Auth-owned.

Target owner:

`apps/api/src/app/http/request-validation.ts`

Required behavior remains exactly:

- `schema.safeParse(input)`;
- return parsed data on success;
- on failure throw `AppError("BAD_REQUEST", "البيانات المرسلة غير صالحة", 400)`.

Before changing code, search the current branch for all real `parseBody` callers/imports. Migrate those callers only. Do not combine this with session, role authorization, cookie, AppError, config/db/media/observability or domain-schema changes.

## Verification required after implementation

- Architecture Guard/self-test;
- API lint + strict typecheck + unit + build;
- auth/security regressions;
- Question Bank + Quiz Builder affected integration/contract paths;
- clean PostgreSQL/DB gates as exercised by canonical workflows;
- Combined/Stage13G real API + PostgreSQL + Chromium evidence.

If exact-head gates are still running, leave `WAITING_FOR_CI`, not DONE.

## Stop rule

After this **single** request-validation correction is implemented and exact-head green, stop AB-01.5. Do not normalize root `config`, `db`, `errors`, media or observability merely to match the folder model. Move directly to AB-01.6 Foundation Closure Gate.

## Remaining roadmap

AB-02 thin Admin shell/router/providers/lazy routes → AB-03 vertical slices Overview+Operations → Curriculum+Content+OCR → AI → Question Bank → Quiz Builder → Students → Access Codes → AB-04 remaining backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final full verification and live-main reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.