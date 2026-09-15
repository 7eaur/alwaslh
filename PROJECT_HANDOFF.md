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
  - AB-03.3 AI Jobs / Review / Authoring — **DONE / EXACT-SOURCE VERIFIED**
  - AB-03.4 Question Bank — **NEXT**
- AB-04..AB-08 — PENDING

## Latest verified result

Worker B sequence 79 completed **AB-03.3.6 — AI slice closure scan** without source mutation.

Final AB-03.3 executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

Closure scan verified:

- `features/ai/operations` owns jobs/review/application capability, approved-output application, review editor/UI and supporting contracts/tests;
- `features/ai/authoring/ai-generation-api.ts` owns lesson/quiz generation request contracts/functions;
- `features/ai/public` exposes the narrow AI operations/generation surface;
- root `admin-ai-authoring-api.ts` only re-exports AI-owned generation/application symbols while retaining actual later-domain Question Bank regeneration/archive and Quiz Builder specialized export/print implementations;
- `admin/reviews/AiOperationsPage.tsx` is a one-line compatibility re-export into the feature, not a duplicate owner;
- `AdminAiAuthoringWorkspace.tsx` remains a mixed orchestration consumer and does not justify a risky import-only JSX rewrite;
- remaining root `ai-operations*.css` assets do not constitute application ownership.

Exact-source green evidence on `9b38c9d2...`:

- Architecture Guard `34993541544`;
- Frontend Preparation `34993541613`;
- Admin AI `34993541626`;
- Combined Integration `34993541546` including real Admin Chromium;
- Stage13G `34993541607` including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

## Exact continuation

Next worker is **C**. Execute one smallest coherent increment: **AB-03.4.1 — Question Bank feature-owner foundation**.

1. Re-read live branch/state/main and prove no worker collision.
2. Fresh-map Question Bank topology and consumers, including:
   - `admin/questions/*`;
   - root `question-bank-api.ts` + tests;
   - Question Bank regeneration/archive functions currently inside root `admin-ai-authoring-api.ts`;
   - app-router Question Bank routes;
   - relevant API/backend/security contracts and tests.
3. Confirm whether the first increment can remain frontend ownership-only. If a backend/database change is actually required and overlaps main, reconcile live main before mutation.
4. Establish the smallest coherent `features/questions` owner, starting with the Question Bank API/application boundary and a narrow public export, while preserving endpoints/payloads/authorization/behavior.
5. Do not mix Quiz Builder ownership, UI redesign, styles/copy changes, or unrelated backend/database work into this increment.
6. Run the verification gates required by the actual touched surface; do not claim completion while exact-head CI is pending.
7. After verified closure, update canonical docs/state and hand off the next Question Bank increment to Worker A per A → B → C rotation.

## Remaining roadmap

Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
