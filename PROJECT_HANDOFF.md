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
    - AB-03.4.1 feature-owner foundation — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
    - AB-03.4.2 presentation ownership — DONE / EXACT-HEAD VERIFIED
    - AB-03.4.3 regeneration/archive ownership — NEXT
- AB-04..AB-08 — PENDING

## Latest verified result

Worker A sequence 81 completed **AB-03.4.2 — Question Bank presentation ownership**.

Executable/source checkpoint: `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca`.

Verified result:
- List/Create/Detail implementations now live under `features/questions`;
- page-specific public entry points preserve route-level lazy loading;
- `AdminRoutes.tsx` composes the Question Bank pages through feature-owned public boundaries;
- old `admin/questions/*` files are compatibility re-exports only;
- the actual page code was moved without changing JSX, Arabic copy, state handling, CSS, accessibility, props, routes or behavior;
- no backend/database/security mutation was made;
- Question Bank regeneration/archive and Quiz Builder export/print remain separate responsibilities.

Exact-head evidence on `26ca9ab2...`:
- Architecture Guard `34996490917` — SUCCESS.
- Frontend Preparation `34996491028` — SUCCESS.
- Admin AI `34996491040` — SUCCESS.
- Combined Integration `34996491059` — SUCCESS including real Admin Chromium.
- Stage13G `34996491115` — SUCCESS including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

PR #52 remains Draft, open, unmerged, with no auto-merge action.

## Exact continuation

Next worker is **B**. Execute one smallest coherent increment: **AB-03.4.3 — Question Bank regeneration/archive ownership**.

1. Re-read live branch/state/main and prove no worker collision.
2. Fresh-check:
   - `apps/admin-web/src/admin-ai-authoring-api.ts`;
   - `apps/admin-web/src/admin/ai-authoring/AdminAiAuthoringWorkspace.tsx`;
   - `features/questions/public`;
   - `features/ai/public` for any needed narrow AI contract dependency;
   - relevant frontend tests and authoritative backend Question Bank regeneration/archive endpoints/tests.
3. Move only `enqueueQuestionRegeneration` and `archiveQuestionBankItem` plus necessary Question Bank-side contracts to `features/questions` ownership.
4. Preserve exact endpoint paths, payload shapes, response shapes, client-request semantics, authorization expectations and workspace behavior.
5. Prefer narrow public-contract imports for any cross-feature AI types; do not create circular feature dependencies or move shared types without evidence.
6. Keep root compatibility exports only if a real consumer still requires them; otherwise retire dead compatibility after consumer switch.
7. Do **not** touch `fetchSpecializedQuizExport`, `specializedQuizPrintUrl`, `QuizPrintVariant`, `SpecializedExportBundle`, Quiz Builder UI, Question Bank redesign, or backend/database code unless fresh evidence proves a correction is required.
8. If backend/database overlap becomes necessary, reconcile live main before mutation.
9. Run Architecture Guard, Frontend Preparation/Admin quality, Admin AI, Combined Integration and Stage13G as appropriate; do not close while CI is pending.
10. After verified closure, synchronize canonical docs/state and hand off the next smallest Question Bank increment to Worker C.

## Remaining roadmap

Finish Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
