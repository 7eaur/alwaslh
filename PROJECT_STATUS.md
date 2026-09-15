# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.3 AI Jobs / Review / Authoring`.

## Scope / permanent rules

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. `apps/student-web` frontend implementation itself is excluded. PostgreSQL/API remain canonical authority; backend stays a Fastify modular monolith; Admin `app` composes only; features own workflows and expose narrow public boundaries; tests/security/validation are never weakened; no permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main reconciliation remains `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification. Current work is frontend ownership only.

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

### AB-03.3 AI Jobs / Review / Authoring — ACTIVE

- **AB-03.3.1 AI operations feature-owner foundation — DONE / EXACT-HEAD VERIFIED.**
- **AB-03.3.2 AI review presentation ownership transfer — DONE / EXACT-HEAD VERIFIED.**
- **AB-03.3.3 compatibility-facade retirement + direct-owner consumption — DONE / EXACT-HEAD VERIFIED** at `d1e11bc7b99b50dff480e8f830812492a390983c`.
- **AB-03.3.4 approved-output application ownership — DONE / EXACT-HEAD VERIFIED** at `26e461407d1508d86fc76b8a3b0151fab83531f9`.
- **AB-03.3.5 AI lesson/quiz generation request ownership — DONE / EXACT-HEAD VERIFIED** at `9b38c9d2f803e220874a40e71ac06399e78435a3`.
  - `features/ai/authoring/ai-generation-api.ts` now owns `AiAuthoringSubjectDomain`, lesson/quiz generation modes, `AiQuestionTarget`, `AuthoringPlanResult`, `enqueueLessonGeneration` and `enqueueQuizGeneration`.
  - root `admin-ai-authoring-api.ts` now re-exports those AI generation symbols instead of implementing them; it retains only later-domain Question Bank / Quiz Builder implementations plus compatibility exports.
  - `features/ai/public` exposes the generation owner.
  - no workspace JSX, endpoint, payload, backend, PostgreSQL, authorization, route, copy or styling behavior changed.
- **AB-03.3.6 AI slice closure scan — NEXT.** Perform a fresh live-head scan of residual AI/root consumers and distinguish harmless compatibility re-exports from actual later-domain Question Bank/Quiz Builder ownership. If no AI-owned implementation remains outside `features/ai`, close AB-03.3 without manufacturing cleanup solely to remove legitimate transitional imports, then select the first Question Bank increment.

Exact-head evidence on `9b38c9d2...`:

- Architecture Guard `34993541544` — SUCCESS.
- Frontend Preparation `34993541613` — SUCCESS: lint + strict typecheck + unit tests + build.
- Admin AI `34993541626` — SUCCESS: clean migrations + PostgreSQL contracts + authorization/observability/review-race/control + Stage12/auth regressions.
- Combined Integration `34993541546` — SUCCESS including deterministic fixture and real Admin Chromium.
- Stage13G `34993541607` — SUCCESS across Admin UI, backend, PostgreSQL/security/integrations and Real API + PostgreSQL + Chromium.

## Remaining roadmap

AI closure scan → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
