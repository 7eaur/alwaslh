# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-14**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Before mutation:

1. confirm repo `7eaur/alwaslh` and branch `rebuild/super-admin-foundation`;
2. fetch live branch HEAD and live `main` HEAD;
3. read `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md` first;
4. read `PROJECT_STATUS.md`, `PROJECT_ENGINEERING_LOG.md`, this file and the autonomous protocol;
5. inspect active phase docs, code/tests and exact-head Actions;
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
- live `main` latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — ACTIVE
  - current increment: AB-03.2.1 remaining Content-ingestion Curriculum consumer migration — IMPLEMENTED / WAITING_FOR_CI
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest result

Worker B sequence 46 completed only the intended consumer migration:

- `ContentIngestionWorkspace.tsx` now imports `AdminCurriculumSnapshot` and `fetchAdminCurriculum` from `features/curriculum/public`;
- it imports `ApiRequestError` and `isMissingSessionError` directly from `shared/api/client`;
- root `content-ingestion-api.ts` transport was not moved;
- endpoints, payloads, auth/session semantics, UI behavior, backend, PostgreSQL, security and Student frontend were untouched.

An attempted removal of the root Curriculum compatibility facade at `af4a131b1b039883a318ebb41b7ec5e5146f126d` was rejected by executable evidence: Stage13G `34886697753` failed Admin strict typecheck because Curriculum subcomponents, Access Codes, AI authoring, Question Bank, Quiz Builder and `admin-api.test.ts` still legitimately import Curriculum symbols from the root facade. The backend/PostgreSQL Stage13G job passed on that same source. Rather than widening this increment across later roadmap slices or weakening tests, the root compatibility re-exports were restored while the Curriculum implementation remains owned by `features/curriculum`.

Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Architecture Guard `34887051028` is green on that corrected exact source. Frontend Preparation `34887051091`, Admin AI `34887051031`, Combined Integration `34887051068`, and Stage13G `34887051059` had not all settled green at the latest observation, so the increment remains `WAITING_FOR_CI`.

## Exact continuation

Do not open another source seam yet.

1. verify the corrected source checkpoint `4cd3daf...` or a documentation-only source-tree-equivalent descendant;
2. require green Admin quality/build, relevant API/PostgreSQL/integration evidence, Combined real Admin Chromium, and Stage13G real API + PostgreSQL + Chromium;
3. if those are all green, close this bounded consumer migration;
4. only then perform fresh AB-03.2 discovery and choose one smallest Content/OCR/Curriculum ownership correction based on live code evidence;
5. do not bulk-migrate Access Codes/AI/Question Bank/Quiz Builder consumers simply to remove the compatibility facade, because those belong to later canonical slices;
6. preserve backend/API/PostgreSQL authority and do not touch Student frontend structure.

## Main reconciliation need

`NOT REQUIRED NOW`. Live `main` remained `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`; no fresh overlapping scoped implementation change was observed at sequence 46 startup.

## Remaining roadmap

Finish Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.