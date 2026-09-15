# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.5 Quiz Builder`.

## Scope / permanent rules

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. `apps/student-web` frontend implementation itself is excluded. PostgreSQL/API remain canonical authority; backend stays a Fastify modular monolith; Admin `app` composes only; features own workflows and expose narrow public boundaries; tests/security/validation are never weakened; no permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-00 — DONE
## AB-01 — DONE / EXACT-HEAD VERIFIED
## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

## AB-03 — ACTIVE
Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

### AB-03.4 Question Bank — DONE / EXACT-HEAD VERIFIED

- AB-03.4.1 feature-owner foundation — DONE / SOURCE-TREE-EQUIVALENT VERIFIED (`11fb063ebe513a6141bb67b6725b5f181d762907`).
- AB-03.4.2 presentation ownership — DONE / EXACT-HEAD VERIFIED (`26ca9ab2835f72a169a7e602c4fd0657cfbb1eca`).
- AB-03.4.3 regeneration/archive ownership — DONE / EXACT-HEAD VERIFIED (`5ff7028cb069561c5eb45466e9a0fb882fbf9131`).
- AB-03.4.4 compatibility retirement + closure scan — DONE / EXACT-HEAD VERIFIED (`a5e76461234bd42a29984ffb5d1a587bdbc3092a`).

AB-03.4.4 closure result:
- removed dead legacy `admin/questions/*` presentation facades;
- moved `question-bank-api.test.ts` into `features/questions` without behavior changes;
- retained only compatibility boundaries that still have real consumers; they contain no duplicate Question Bank implementation ownership;
- canonical frontend ownership is under `features/questions`, while backend authority remains under `apps/api/src/question-bank/*` plus the already-authoritative AI authoring endpoint module for regeneration/archive;
- no UI redesign, route/payload/auth change, backend mutation or PostgreSQL mutation was required.

Exact-head verification on `a5e76461234bd42a29984ffb5d1a587bdbc3092a`:
- Architecture Guard `34999311596` — SUCCESS.
- Frontend Preparation `34999311689` — SUCCESS.
- Admin AI `34999311651` — SUCCESS.
- Combined Integration `34999311611` — SUCCESS including real Admin Chromium.
- Stage13G `34999311628` — SUCCESS including backend/UI, clean PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

### AB-03.5 Quiz Builder — ACTIVE

#### AB-03.5.1 Quiz Builder feature-owner foundation — NEXT

Fresh topology confirms:
- canonical backend Quiz Builder ownership already exists under `apps/api/src/quiz-builder/*`, including authorization/validation/service/export boundaries;
- Admin frontend API/application ownership is still at root `apps/admin-web/src/quiz-builder-api.ts` with `quiz-builder-api.test.ts`;
- presentation remains under `admin/quizzes/*` and specialized export/print remains separate.

Next increment: move only Quiz Builder frontend API/application implementation + its tests into `features/quizzes`, expose a narrow public boundary, preserve the root path only as a temporary compatibility facade for real consumers, and leave presentation plus specialized export/print for later increments.

## Remaining roadmap

Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
