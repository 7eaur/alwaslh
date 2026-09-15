# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.4 Question Bank`.

## Scope / permanent rules

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. `apps/student-web` frontend implementation itself is excluded. PostgreSQL/API remain canonical authority; backend stays a Fastify modular monolith; Admin `app` composes only; features own workflows and expose narrow public boundaries; tests/security/validation are never weakened; no permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-00 — DONE
## AB-01 — DONE / EXACT-HEAD VERIFIED
## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical AB-02 record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED

Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

Exact-source evidence:
- Architecture Guard `34993541544` — SUCCESS.
- Frontend Preparation `34993541613` — SUCCESS.
- Admin AI `34993541626` — SUCCESS.
- Combined Integration `34993541546` — SUCCESS including real Admin Chromium.
- Stage13G `34993541607` — SUCCESS including Real API + PostgreSQL + Chromium.

### AB-03.4 Question Bank — ACTIVE

#### AB-03.4.1 Question Bank feature-owner foundation — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Executable/source checkpoint: `11fb063ebe513a6141bb67b6725b5f181d762907`.

Worker C sequence 80:
- created canonical `features/questions/question-bank-api.ts` owner for all existing Admin Question Bank frontend contracts and API/application functions;
- added narrow `features/questions/public/index.ts` boundary;
- reduced root `question-bank-api.ts` to a compatibility re-export;
- preserved all endpoints, payloads, response shapes, authorization behavior, routes, UI, copy and CSS;
- verified that backend Question Bank ownership already exists under `apps/api/src/question-bank/*`, so no backend/database mutation or main reconciliation was required for this increment;
- kept Question Bank regeneration/archive and Quiz Builder export/print outside this slice.

Verification:
- Architecture Guard `34995311318` — SUCCESS on exact source `11fb063e...`.
- Frontend Preparation `34995311313` — SUCCESS on exact source `11fb063e...`.
- Admin AI `34995415758` — SUCCESS on source-tree-equivalent docs-only head `c6d36a2...`.
- Combined Integration `34995415726` — SUCCESS on source-tree-equivalent `c6d36a2...`, including real Admin Chromium.
- Stage13G `34995415760` — SUCCESS on source-tree-equivalent `c6d36a2...`, including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

The source-head Stage13G run `34995311535` was cancelled by GitHub concurrency after the docs-only WAITING state commit superseded it; it was not a source failure.

#### AB-03.4.2 Question Bank presentation ownership — NEXT

The three Question Bank pages still live under `admin/questions/*`, and `AdminRoutes.tsx` lazy-loads those legacy locations. Worker A must move only presentation ownership to `features/questions`, expose a narrow route/page boundary, and switch app composition while preserving routes, props, UI states, copy, CSS and behavior. Question regeneration/archive ownership remains a separate later increment.

## Remaining roadmap

Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
