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
    - AB-03.4.3 regeneration/archive ownership — DONE / EXACT-HEAD VERIFIED
    - AB-03.4.4 compatibility retirement + closure scan — NEXT
- AB-04..AB-08 — PENDING

## Latest verified result

Worker B sequence 82 completed **AB-03.4.3 — Question Bank regeneration/archive ownership**.

Executable/source checkpoint: `5ff7028cb069561c5eb45466e9a0fb882fbf9131`.

Verified result:
- `features/questions/question-bank-authoring-api.ts` now owns `enqueueQuestionRegeneration` and `archiveQuestionBankItem`;
- its cross-feature AI types come only from `features/ai/public`;
- feature-owned tests preserve regeneration/archive route, POST, credentials and regeneration payload contracts;
- root `admin-ai-authoring-api.ts` no longer implements those actions and only re-exports them temporarily because the mixed authoring workspace remains a real consumer;
- Quiz Builder specialized export/print ownership remained untouched;
- backend endpoints were inspected in `apps/api/src/ai/admin-authoring-http.ts` and already enforce admin authorization, Zod validation and service authority, so no backend/database mutation or live-main reconciliation was required.

Exact-head evidence on `5ff7028c...`:
- Architecture Guard `34998332362` — SUCCESS.
- Frontend Preparation `34998332394` — SUCCESS.
- Admin AI `34998332370` — SUCCESS including clean PostgreSQL and security regressions.
- Combined Integration `34998332374` — SUCCESS including real Admin Chromium.
- Stage13G `34998332377` — SUCCESS including Real API + PostgreSQL + Chromium.

PR #52 remains Draft / unmerged / no auto-merge.

## Exact continuation

Next worker is **C**. Execute one smallest coherent increment: **AB-03.4.4 — Question Bank compatibility retirement + closure scan**.

1. Re-read live branch/state/main and prove no collision.
2. Fresh-map all references to:
   - root `question-bank-api.ts`;
   - root Question Bank re-exports in `admin-ai-authoring-api.ts`;
   - legacy `admin/questions/QuestionBank{List,Create,Detail}Page.tsx` facades;
   - `features/questions/*` imports;
   - `AdminAiAuthoringWorkspace.tsx` Question Bank imports.
3. Switch same-feature Question Bank pages away from root compatibility and onto their canonical same-feature API owner.
4. Switch the mixed authoring workspace's Question Bank API/actions to `features/questions/public` when the import-only change is safe; do not rewrite its JSX or redesign its flow.
5. Delete or retire root/legacy facades only after proving no real consumers remain. Keep a facade only if a real consumer/evidence justifies it.
6. Do not move Quiz Builder export/print or unrelated AI ownership into this increment.
7. Perform a fresh closure scan after cleanup. If no genuine Question Bank ownership remains outside `features/questions` and backend canonical boundaries, close AB-03.4 and hand off Quiz Builder to Worker A. If real debt remains, document and take the next smallest Question Bank increment instead.
8. Run Architecture Guard + Admin quality and any broader integration/Chromium gates appropriate to the changed source. Do not claim closure while CI is pending.

## Remaining roadmap

Finish Question Bank closure → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
