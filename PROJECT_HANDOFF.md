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
  - current increment: AB-03.2.1 Curriculum frontend API ownership — PARTIAL / WAITING_FOR_CI
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest result

Worker A sequence 45 established the Curriculum feature owner without changing behavior:

- new owner: `features/curriculum/api/admin-curriculum-api.ts`;
- public boundary: `features/curriculum/public/index.ts`;
- `CurriculumWorkspace.tsx` now consumes Curriculum through the public boundary and generic API errors/session handling from `shared/api/client`;
- root `admin-api.ts` no longer implements Curriculum; it temporarily re-exports the feature contract so the not-yet-migrated Content ingestion consumer remains compatible;
- backend/API/PostgreSQL/security/Student frontend were untouched.

Source implementation checkpoint: `ee58ffe125da9e550b97965976f47240a7f35d68`.

## Exact continuation

Do not open another slice. First inspect the source-checkpoint gates. If green/source-tree-equivalent, continue only the remaining AB-03.2.1 compatibility cleanup:

1. migrate `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` Curriculum imports (`AdminCurriculumSnapshot`, `fetchAdminCurriculum`) to `features/curriculum/public`;
2. keep `ApiRequestError` and `isMissingSessionError` on canonical `shared/api/client` rather than root `admin-api.ts`;
3. remove the temporary Curriculum re-exports from root `admin-api.ts` once no legitimate consumer requires them;
4. do NOT migrate root `content-ingestion-api.ts` transport in the same increment;
5. preserve endpoints/payload/session/UI behavior;
6. verify Architecture Guard, Admin quality/build, relevant Curriculum/API/PostgreSQL integrations, Combined real Chromium and Stage13G real API + PostgreSQL + Chromium;
7. use `WAITING_FOR_CI` if those gates are still running.

## Verification state

Fresh source-checkpoint workflows were started on `ee58ffe...`; at the last observation they were still pending/running, including Frontend Preparation `34884252963` and Admin AI `34884253074`. Do not claim AB-03.2.1 DONE before the required green evidence exists.

## Main reconciliation need

`NOT REQUIRED NOW`. Live `main` remained `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`; no fresh overlapping scoped implementation change was observed.

## Remaining roadmap

Finish Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.