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
    - AB-03.5.2 presentation ownership — DONE / EXACT-HEAD VERIFIED
    - AB-03.5.3 specialized export/print ownership — NEXT
- AB-04..AB-08 — PENDING

## Latest verified result

Worker B sequence 85 completed **AB-03.5.2 — Quiz Builder presentation ownership**.

Executable/source checkpoint: `4c389e87872621dd70781401d85fadc7df6338b6`.

Verified result:
- `QuizBuilderListPage`, `QuizBuilderCreatePage`, `QuizBuilderDetailPage` and `QuizMetadataPanel` now live under `features/quizzes` using their existing implementation blobs;
- page-specific public entries preserve route-level lazy loading;
- `AdminRoutes.tsx` changed only the four Quiz Builder lazy import paths;
- old `admin/quizzes/*` page paths are compatibility-only pending closure cleanup;
- no UX/UI/copy/CSS/route/backend/PostgreSQL behavior changed.

Exact-head evidence on `4c389e87...`:
- Architecture Guard `35020423714` — SUCCESS.
- Frontend Preparation `35020423729` — SUCCESS.
- Admin AI `35020423669` — SUCCESS.
- Combined Integration `35020423630` — SUCCESS including clean PostgreSQL/security regressions and real Admin Chromium.
- Stage13G `35020423618` — SUCCESS including Real API + PostgreSQL + Chromium.

PR #52 remains Draft / unmerged / no auto-merge.

## Exact continuation

Next worker is **C**. Execute one smallest coherent increment: **AB-03.5.3 — Quiz Builder specialized export/print ownership**.

1. Re-read live branch/state/main and prove no collision.
2. Fresh-scan `admin-ai-authoring-api.ts`, its test, `AdminAiAuthoringWorkspace` and the Quiz Builder public boundary.
3. Move Quiz Builder-specific `QuizPrintVariant`, `SpecializedExportBundle`, `fetchSpecializedQuizExport` and `specializedQuizPrintUrl` into a feature-owned Quiz Builder API module.
4. Preserve exact specialized export/print route and query serialization semantics.
5. Move/split only the corresponding specialized transport test coverage into the Quiz Builder feature.
6. Expose the specialized contracts/actions through `features/quizzes/public`.
7. Keep any root compatibility re-export only while a real consumer still exists; do not move unrelated AI or Question Bank ownership.
8. Do not redesign `AdminAiAuthoringWorkspace`, change its behavior, or mutate backend/database without new evidence.
9. Run Architecture Guard + Frontend Preparation + Admin AI + Combined Integration + Stage13G exact-head verification before closure.

## Remaining roadmap

Finish Quiz Builder specialized ownership + compatibility closure → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
