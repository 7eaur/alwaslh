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
  - AB-03.3 AI Jobs / Review / Authoring — **ACTIVE; closure scan next**
- AB-04..AB-08 — PENDING

## Latest verified result

Worker A sequence 78 completed **AB-03.3.5 — AI lesson/quiz generation request ownership**.

Latest executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

Current AI authoring ownership:

- `features/ai/operations` owns jobs/review/application capability, approved-output application, review editor/UI and supporting contracts/tests;
- `features/ai/authoring/ai-generation-api.ts` owns lesson/quiz generation request contracts/functions;
- `features/ai/public` exposes the narrow AI operations/generation surface;
- root `admin-ai-authoring-api.ts` only re-exports AI-owned generation/application symbols while retaining actual later-domain Question Bank regeneration/archive and Quiz Builder specialized export/print implementations;
- `AdminAiAuthoringWorkspace.tsx` remains a mixed orchestration consumer and was not rewritten solely to split imports, avoiding unnecessary JSX drift.

Exact-head green evidence on `9b38c9d2...`:

- Architecture Guard `34993541544`;
- Frontend Preparation `34993541613`;
- Admin AI `34993541626`;
- Combined Integration `34993541546` including real Admin Chromium;
- Stage13G `34993541607` including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

## Exact continuation

Next worker is **B**. Execute one smallest coherent increment: **AB-03.3.6 — AI slice closure scan**.

1. Re-read live branch/state/main and prove no worker collision.
2. Fresh-scan residual AI/root files and consumers, including root `admin-ai-authoring-api.ts`, `admin/ai-authoring/AdminAiAuthoringWorkspace.tsx`, the old review route facade and any remaining root `ai-*` modules.
3. Distinguish real implementation ownership from compatibility re-exports and from actual Question Bank / Quiz Builder implementations that intentionally remain for later slices.
4. Do not manufacture a risky large-file import rewrite solely to delete a harmless compatibility edge.
5. If no genuine AI-owned implementation remains outside `features/ai`, close AB-03.3 at executable checkpoint `9b38c9d2...`, update canonical docs/state, and select the first Question Bank increment from the live topology. If a real AI ownership seam remains, fix only the smallest proven seam and rerun the required gates.
6. Do not start broad Question Bank source mutation in the same worker if this increment is used to close AI; hand off a precise next step.

## Remaining roadmap

AI closure scan → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
