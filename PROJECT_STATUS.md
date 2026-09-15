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

Canonical Admin Question Bank API/application ownership lives in `features/questions/question-bank-api.ts` behind `features/questions/public/index.ts`; backend canonical standard Question Bank ownership already exists under `apps/api/src/question-bank/*`.

Verification:
- Architecture Guard `34995311318` — SUCCESS exact-source.
- Frontend Preparation `34995311313` — SUCCESS exact-source.
- Admin AI `34995415758` — SUCCESS source-tree-equivalent.
- Combined Integration `34995415726` — SUCCESS source-tree-equivalent including real Admin Chromium.
- Stage13G `34995415760` — SUCCESS source-tree-equivalent including Real API + PostgreSQL + Chromium.

#### AB-03.4.2 Question Bank presentation ownership — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca`.

List/Create/Detail implementations now live under `features/questions`; page-specific public entry points preserve route-level lazy chunks; `AdminRoutes.tsx` composes them through the feature public boundary. Legacy `admin/questions/*` files remain compatibility re-exports pending closure cleanup.

Exact-head verification:
- Architecture Guard `34996490917` — SUCCESS.
- Frontend Preparation `34996491028` — SUCCESS.
- Admin AI `34996491040` — SUCCESS.
- Combined Integration `34996491059` — SUCCESS including real Admin Chromium.
- Stage13G `34996491115` — SUCCESS including Real API + PostgreSQL + Chromium.

#### AB-03.4.3 Question Bank regeneration/archive ownership — DONE / EXACT-HEAD VERIFIED

Executable/source checkpoint: `5ff7028cb069561c5eb45466e9a0fb882fbf9131` (`refactor(admin): feature-own Question Bank regeneration`).

Worker B sequence 82:
- added `features/questions/question-bank-authoring-api.ts` as canonical Admin owner of `enqueueQuestionRegeneration` and `archiveQuestionBankItem`;
- exported those actions through `features/questions/public`;
- consumed AI authoring contracts only through `features/ai/public`, satisfying cross-feature public-boundary rules;
- moved regeneration/archive tests into `features/questions/question-bank-authoring-api.test.ts` and preserved route, POST, credential and payload assertions;
- removed duplicate Question Bank implementations from root `admin-ai-authoring-api.ts` while keeping a temporary compatibility re-export because `AdminAiAuthoringWorkspace.tsx` is still a real consumer;
- left Quiz Builder specialized export/print implementation and types untouched;
- verified backend authority at `apps/api/src/ai/admin-authoring-http.ts`: admin authorization, Zod validation and existing service authority already protect the same regenerate/archive endpoints, so no backend/database mutation or main reconciliation was required.

Exact-head verification on `5ff7028c...`:
- Architecture Guard `34998332362` — SUCCESS.
- Frontend Preparation `34998332394` — SUCCESS: lint + strict typecheck + unit tests + build.
- Admin AI `34998332370` — SUCCESS: clean PostgreSQL migrations/contracts + authorization/observability/review/control + Stage12/auth security regressions.
- Combined Integration `34998332374` — SUCCESS including clean PostgreSQL, backend authority regressions and real Admin Chromium.
- Stage13G `34998332377` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### AB-03.4.4 Question Bank compatibility retirement + closure scan — NEXT

Fresh inspection after AB-03.4.3 found remaining compatibility debt rather than new business behavior:
- `AdminAiAuthoringWorkspace.tsx` still consumes Question Bank actions through root `admin-ai-authoring-api.ts`;
- feature-owned Question Bank pages still consume the root `question-bank-api.ts` facade inherited from their verbatim move;
- root `question-bank-api.ts` is a one-line re-export;
- legacy `admin/questions/*` page files are one-line re-exports and `AdminRoutes.tsx` no longer needs them.

Worker C must fresh-map all remaining consumers, retire only facades that become consumer-free, switch real consumers to `features/questions/public` or private same-feature ownership as appropriate, and perform a closure scan. Preserve UI/behavior and leave Quiz Builder ownership untouched. If the mixed authoring workspace makes a direct import-only change disproportionately risky, document evidence before retaining any compatibility boundary; do not retain dead facades by default.

## Remaining roadmap

Finish Question Bank closure → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
