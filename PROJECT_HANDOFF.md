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
  - AB-03.5 Quiz Builder — DONE / EXACT-HEAD VERIFIED
  - AB-03.6 Students — NEXT
- AB-04..AB-08 — PENDING

## Latest verified result

Worker A sequence 87 completed **AB-03.5.4 — Quiz Builder compatibility retirement + closure scan** and therefore closed **AB-03.5 Quiz Builder**.

Final executable/source checkpoint: `f60a4b279fad9a011f9188005dd3ad075c7e3f00`.

Closure result:
- four dead `admin/quizzes/*` page compatibility re-exports were deleted;
- root `quiz-builder-api.ts` was retained because the feature-owned Quiz Builder pages still consume it; it is compatibility-only and owns no implementation;
- mixed `admin-ai-authoring-api.ts` was retained because `AdminAiAuthoringWorkspace` remains a real consumer; Quiz Builder specialized implementation already lives in the feature;
- no duplicate Quiz Builder implementation ownership remains;
- no UX/UI/copy/CSS/route/backend/PostgreSQL behavior changed.

Exact-head evidence on `f60a4b279fad9a011f9188005dd3ad075c7e3f00`:
- Architecture Guard `35022098967` — SUCCESS.
- Frontend Preparation `35022099016` — SUCCESS.
- Admin AI `35022098946` — SUCCESS.
- Combined Integration `35022098947` — SUCCESS including clean PostgreSQL/security regressions and real Admin Chromium.
- Stage13G `35022099002` — SUCCESS including Admin backend/UI and Real API + PostgreSQL + Chromium.

PR #52 remains Draft / unmerged / no auto-merge.

## Exact continuation

Next worker is **B**. Execute one smallest coherent increment: **AB-03.6.1 — Students feature-owner foundation**.

1. Re-read live branch/state/main and prove no collision.
2. Fresh-scan `admin-student-access-api.ts`, its mixed test, `AdminStudentsPage`, `admin-access` backend and relevant auth/access mutation routes.
3. Split only Student-owned contracts/actions out of the mixed root API into `features/students/admin-student-api.ts` (or equally narrow feature-local name).
4. Move only the two Student-specific test groups: list/detail pagination and recovery/device-rebind/entitlement revoke.
5. Expose a narrow `features/students/public` boundary.
6. Preserve Access Code contracts/actions and their two tests in the current root owner for the later Access Codes slice.
7. Keep root compatibility re-exports for Student symbols while `AdminStudentsPage` remains a real consumer in this increment.
8. Preserve all URLs, query serialization, credentials, payloads and backend authority behavior.
9. Do not redesign the Students UI or mutate backend/database absent new evidence.
10. Run exact-head Architecture Guard + Frontend Preparation + Admin AI + Combined Integration + Stage13G before closure.

## Remaining roadmap

Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
