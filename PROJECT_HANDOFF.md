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
  - AB-03.2 Curriculum + Content + OCR — ACTIVE / DISCOVERY COMPLETE
  - next increment: AB-03.2.1 Curriculum frontend API ownership
- AB-04..AB-08 — PENDING

Canonical AB-03 record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

## Latest result

Worker C sequence 44 completed the required AB-03.2 discovery without touching production source, tests or migrations.

Direct evidence:

- `apps/admin-web/src/admin/curriculum/CurriculumWorkspace.tsx` consumes Curriculum types and mutations from root `apps/admin-web/src/admin-api.ts`.
- `admin-api.ts` owns the full Curriculum snapshot/record types plus `/v1/admin/curriculum*` requests while also re-exporting generic transport/auth contracts, so Curriculum frontend ownership is still mixed at the root.
- `apps/admin-web/src/admin/content/ContentIngestionWorkspace.tsx` also consumes Curriculum from that root facade and Content ingestion from root `content-ingestion-api.ts`.
- `content-ingestion-api.ts` unnecessarily obtains `adminApiRequest` through `admin-api.ts` instead of the canonical shared API client.
- Backend already has bounded Curriculum and Content modules; PostgreSQL already has explicit learning/content/media/OCR migration history, and no schema/backend mutation was justified by this discovery.
- Curriculum has a server-side `student-reader.ts`; Student frontend remains out of scope and its server contract must stay compatible.

## Exact continuation

Execute **AB-03.2.1 Curriculum frontend API ownership only**:

1. fetch branch/main/state and confirm no active worker collision;
2. move only Curriculum-specific types/request functions from root `apps/admin-web/src/admin-api.ts` to `apps/admin-web/src/features/curriculum/api/admin-curriculum-api.ts`;
3. create/use `apps/admin-web/src/features/curriculum/public/index.ts` as the narrow consumer boundary;
4. update Curriculum consumers and legitimate Content ingestion Curriculum imports to that public boundary;
5. keep generic transport owned by `shared/api/client` and preserve endpoint/payload/session/UI semantics;
6. do not combine root `content-ingestion-api.ts` migration, page/folder moves, CSS changes, OCR/AI redesign, backend service changes or PostgreSQL migrations;
7. verify with Architecture Guard, Admin quality/unit/build, relevant Curriculum/API/PostgreSQL integrations, Combined real Chromium and Stage13G real API + PostgreSQL + Chromium;
8. if required exact-head CI remains running, hand off `WAITING_FOR_CI` rather than claiming DONE.

## Verification state

Worker C sequence 44 was documentation-only. Existing executable evidence remains green:

- Architecture Guard `34876404251` — SUCCESS on executable checkpoint `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`;
- Combined Integration `34880448851` — SUCCESS on documentation-equivalent head `694473bfbc8754ac46578214087e6ed8c6219641`;
- Stage13G Admin Operations `34880448862` — SUCCESS on the same documentation-equivalent head;
- Admin AI Operations `34880448853` — SUCCESS on the same documentation-equivalent head.

Fresh verification is mandatory after AB-03.2.1 executable mutation.

## Main reconciliation need

`NOT REQUIRED NOW`. Live `main` remained `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`; no fresh overlapping scoped implementation change was observed in Worker C sequence 44.

## Remaining roadmap

Curriculum + Content + OCR → AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
