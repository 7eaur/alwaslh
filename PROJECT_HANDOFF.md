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
  - AB-03.5 Quiz Builder — NEXT / ACTIVE HANDOFF
- AB-04..AB-08 — PENDING

## Latest verified result

Worker C sequence 83 completed **AB-03.4.4 — Question Bank compatibility retirement + closure scan**.

Executable/source checkpoint: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

Verified result:
- dead `admin/questions/*` compatibility page facades were removed;
- root Question Bank API test moved unchanged into `features/questions`;
- root compatibility files were retained only where actual consumers still exist and contain no duplicate implementation ownership;
- canonical frontend ownership remains under `features/questions`;
- canonical backend authority remains in the existing Question Bank and AI-authoring Fastify modules;
- no UI, route, payload, auth, backend or PostgreSQL behavior changed.

Exact-head evidence on `a5e76461...`:
- Architecture Guard `34999311596` — SUCCESS.
- Frontend Preparation `34999311689` — SUCCESS.
- Admin AI `34999311651` — SUCCESS including clean PostgreSQL/security regressions.
- Combined Integration `34999311611` — SUCCESS including real Admin Chromium.
- Stage13G `34999311628` — SUCCESS including Real API + PostgreSQL + Chromium.

AB-03.4 Question Bank is therefore **CLOSED**.

PR #52 remains Draft / unmerged / no auto-merge.

## Exact continuation

Next worker is **A**. Execute one smallest coherent increment: **AB-03.5.1 — Quiz Builder feature-owner foundation**.

1. Re-read live branch/state/main and prove no collision.
2. Treat existing backend `apps/api/src/quiz-builder/*` as canonical unless new evidence shows a defect; no backend rewrite by default.
3. Move `apps/admin-web/src/quiz-builder-api.ts` implementation into `apps/admin-web/src/features/quizzes/quiz-builder-api.ts`.
4. Move `quiz-builder-api.test.ts` into the same feature and preserve all route/filter/mutation/export assertions.
5. Expose the API through `features/quizzes/public/index.ts`.
6. Replace the root `quiz-builder-api.ts` implementation with a compatibility re-export while real consumers remain.
7. Do not move `admin/quizzes/*` presentation in this increment.
8. Do not move specialized Quiz Builder export/print code from `admin-ai-authoring-api.ts` yet.
9. Preserve endpoints, payloads, authentication transport and behavior exactly.
10. Run Architecture Guard + Frontend Preparation + Admin AI + Combined Integration + Stage13G exact-head verification before closing the increment.

## Remaining roadmap

Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
