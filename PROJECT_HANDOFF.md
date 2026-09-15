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
  - AB-03.4 Question Bank — ACTIVE
    - AB-03.4.1 feature-owner foundation — **DONE / SOURCE-TREE-EQUIVALENT VERIFIED**
    - AB-03.4.2 presentation ownership — **NEXT**
- AB-04..AB-08 — PENDING

## Latest verified result

Worker C sequence 80 completed **AB-03.4.1 — Question Bank feature-owner foundation**.

Executable/source checkpoint: `11fb063ebe513a6141bb67b6725b5f181d762907`.

Verified result:
- `features/questions/question-bank-api.ts` is the canonical Admin Question Bank API/application owner;
- `features/questions/public/index.ts` is the narrow public boundary;
- root `question-bank-api.ts` is compatibility only;
- backend was inspected and already has canonical modular ownership under `apps/api/src/question-bank/*`;
- no backend/database change, route change, auth change, UI change, copy change or CSS change occurred;
- Question Bank regeneration/archive and Quiz Builder export/print remain separate later responsibilities.

Verification evidence:
- Architecture Guard `34995311318` — SUCCESS on exact source `11fb063e...`;
- Frontend Preparation `34995311313` — SUCCESS on exact source `11fb063e...`;
- Admin AI `34995415758` — SUCCESS on source-tree-equivalent docs-only head `c6d36a2...`;
- Combined Integration `34995415726` — SUCCESS on source-tree-equivalent `c6d36a2...`, including real Admin Chromium;
- Stage13G `34995415760` — SUCCESS on source-tree-equivalent `c6d36a2...`, including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

The exact-source Stage13G run `34995311535` was cancelled only because GitHub concurrency superseded it after the docs-only WAITING state commit; it was not a source failure.

PR #52 was rechecked and remains open, Draft, unmerged, with no auto-merge action taken.

## Exact continuation

Next worker is **A**. Execute one smallest coherent increment: **AB-03.4.2 — Question Bank presentation ownership**.

1. Re-read live branch/state/main and prove no worker collision.
2. Fresh-check the three page implementations and router consumers:
   - `admin/questions/QuestionBankListPage.tsx`;
   - `admin/questions/QuestionBankCreatePage.tsx`;
   - `admin/questions/QuestionBankDetailPage.tsx`;
   - `app/router/AdminRoutes.tsx`.
3. Move the page implementations behind `features/questions` ownership with the smallest coherent structure.
4. Expose only the page entry points needed by app composition through the feature public boundary or the architecture-guard-approved feature entry point.
5. Switch the app router away from implementation ownership under `admin/questions/*`.
6. Preserve existing routes, props, lazy-loading behavior, loading/error/empty/success states, Arabic copy, CSS, accessibility and responsive behavior. This is ownership migration, not redesign.
7. Do **not** move `enqueueQuestionRegeneration` or `archiveQuestionBankItem` in this increment; those belong to a separate Question Bank application-action slice.
8. Do not touch Quiz Builder export/print or speculative backend/database concerns.
9. Run the verification gates required by the touched surface; do not claim completion while CI is pending.
10. After verified closure, update canonical docs/state and hand off the next Question Bank increment to Worker B per A → B → C rotation.

## Remaining roadmap

Finish Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
