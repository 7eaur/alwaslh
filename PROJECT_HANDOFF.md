# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-15**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Confirm repo/branch and live branch + `main` HEAD; read shared execution state, status, engineering log, this handoff, autonomous protocol and active AB-03 record; inspect code/tests/CI; confirm no active-worker collision. Code/migrations/executable CI/runtime evidence outrank prose.

## Scope / governance

Owned: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts and required CI/security/integration/browser verification. Excluded only: structural/design implementation of `apps/student-web` frontend. Branch is `rebuild/super-admin-foundation`; PR #52 stays Draft/unmerged/no auto-merge; never force-reset or force-push shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. Main reconciliation is `REQUIRED / DEFERRED` because main contains authoritative offline-content API/PostgreSQL changes. Reconcile before overlapping backend/database mutation and before AB-08 final verification.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
  - AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
  - AB-03.4 Question Bank — DONE / EXACT-HEAD VERIFIED
  - AB-03.5 Quiz Builder — ACTIVE
    - AB-03.5.1 feature-owner foundation — DONE / EXACT-HEAD VERIFIED
    - AB-03.5.2 presentation ownership — NEXT
- AB-04..AB-08 — PENDING

## Latest verified result

Worker A sequence 84 completed **AB-03.5.1 — Quiz Builder feature-owner foundation**.

Executable/source checkpoint: `2254cc8121fd319b17cbd626d683352b23dda229`.

Verified result:
- `features/quizzes/quiz-builder-api.ts` now owns the frontend Quiz Builder API/application implementation;
- `features/quizzes/quiz-builder-api.test.ts` owns its tests with the same contract assertions;
- `features/quizzes/public/index.ts` exposes the feature boundary;
- root `quiz-builder-api.ts` is compatibility-only for existing consumers;
- backend `apps/api/src/quiz-builder/*` remained unchanged because its authorization/validation/service ownership was already canonical;
- no UI, route, payload, auth, backend or PostgreSQL behavior changed.

Exact-head evidence on `2254cc81...`:
- Architecture Guard `35015668415` — SUCCESS.
- Frontend Preparation `35015668182` — SUCCESS.
- Admin AI `35015668395` — SUCCESS.
- Combined Integration `35015668029` — SUCCESS including real Admin Chromium.
- Stage13G `35015667909` — SUCCESS including Real API + PostgreSQL + Chromium.

PR #52 remains Draft / unmerged / no auto-merge.

## Exact continuation

Next worker is **B**. Execute one smallest coherent increment: **AB-03.5.2 — Quiz Builder presentation ownership**.

1. Re-read live branch/state/main and prove no collision.
2. Move the implementations of `QuizBuilderListPage.tsx`, `QuizBuilderCreatePage.tsx`, `QuizBuilderDetailPage.tsx` and `QuizMetadataPanel.tsx` into `features/quizzes` with behavior/UI/copy/CSS preserved.
3. Add page-specific public entry points so route-level lazy chunks remain separate.
4. Change only the four `AdminRoutes.tsx` lazy import paths to consume feature public entries.
5. Keep old `admin/quizzes/*` files as one-line compatibility re-exports until the closure scan proves them dead.
6. Do not move specialized export/print in this increment.
7. Do not redesign UX/UI or change routes/actions/copy.
8. Run Architecture Guard + Frontend Preparation + Admin AI + Combined Integration + Stage13G exact-head verification before closure.

## Remaining roadmap

Finish Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
