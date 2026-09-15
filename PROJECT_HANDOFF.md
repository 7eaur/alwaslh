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
    - AB-03.5.3 specialized export/print ownership — DONE / EXACT-HEAD VERIFIED
    - AB-03.5.4 compatibility retirement + closure scan — NEXT
- AB-04..AB-08 — PENDING

## Latest verified result

Worker C sequence 86 completed **AB-03.5.3 — Quiz Builder specialized export/print ownership**.

Executable/source checkpoint: `da083efb41a08103edb402b4021ccfb792077384`.

Verified result:
- Quiz Builder specialized export/print contracts and transport now live under `features/quizzes/quiz-builder-specialized-export-api.ts`;
- specialized URL/query unit coverage now lives in the Quiz Builder feature;
- `features/quizzes/public/index.ts` exports those contracts/actions;
- mixed root `admin-ai-authoring-api.ts` no longer implements the Quiz Builder specialized transport and only compatibility-reexports it for the still-real workspace consumer;
- backend specialized routes were inspected and already had canonical admin auth, validation, bounded selected versions and print security headers;
- no UI/backend/PostgreSQL behavior changed.

Exact-head evidence on `da083efb41a08103edb402b4021ccfb792077384`:
- Architecture Guard `35021257562` — SUCCESS.
- Frontend Preparation `35021257744` — SUCCESS.
- Admin AI `35021257706` — SUCCESS.
- Combined Integration `35021257480` — SUCCESS including clean PostgreSQL/security regressions and real Admin Chromium.
- Stage13G `35021257700` — SUCCESS including Real API + PostgreSQL + Chromium.

PR #52 remains Draft / unmerged / no auto-merge.

## Exact continuation

Next worker is **A**. Execute one smallest coherent increment: **AB-03.5.4 — Quiz Builder compatibility retirement + closure scan**.

1. Re-read live branch/state/main and prove no collision.
2. Fresh-map every remaining Quiz Builder compatibility consumer on the branch.
3. The four feature-owned presentation files currently still import Quiz Builder API through root `../../quiz-builder-api`; switch them to the local canonical feature API only if the live scan confirms no boundary reason to keep root indirection.
4. The old `admin/quizzes/*` page paths appear compatibility-only after router migration; delete them only if the live scan proves no consumers.
5. Retire root `quiz-builder-api.ts` only if no real consumer remains after feature-internal import cleanup.
6. Preserve mixed `admin-ai-authoring-api.ts` compatibility where `AdminAiAuthoringWorkspace` remains a real consumer; do not create unrelated AI churn just to delete a facade.
7. Confirm there is no duplicate Quiz Builder implementation ownership and no backend/database defect.
8. Run Architecture Guard + Frontend Preparation + Admin AI + Combined Integration + Stage13G exact-head verification.
9. Only then mark AB-03.5 Quiz Builder fully DONE and hand off to Students.

## Remaining roadmap

Finish Quiz Builder closure → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
