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
Final executable/source checkpoint: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

### AB-03.5 Quiz Builder — ACTIVE

#### AB-03.5.1 Quiz Builder feature-owner foundation — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `2254cc8121fd319b17cbd626d683352b23dda229`.

#### AB-03.5.2 Quiz Builder presentation ownership — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `4c389e87872621dd70781401d85fadc7df6338b6`.

#### AB-03.5.3 Quiz Builder specialized export/print ownership — DONE / EXACT-HEAD VERIFIED
Executable/source checkpoint: `da083efb41a08103edb402b4021ccfb792077384` (`refactor(admin): feature-own Quiz Builder specialized export`).

Completed:
- created `features/quizzes/quiz-builder-specialized-export-api.ts` as the canonical Admin owner of `QuizPrintVariant`, `SpecializedExportBundle`, `fetchSpecializedQuizExport` and `specializedQuizPrintUrl`;
- split the specialized URL/query contract coverage into `features/quizzes/quiz-builder-specialized-export-api.test.ts`;
- exposed the specialized transport/contracts through `features/quizzes/public/index.ts`;
- removed direct specialized implementation from mixed root `admin-ai-authoring-api.ts`, leaving compatibility re-exports because `AdminAiAuthoringWorkspace` remains a real consumer;
- removed the specialized test block from the mixed root test while keeping unrelated AI tests unchanged;
- preserved exact specialized export/print URLs, `versionIds` serialization and `variant` semantics;
- verified the backend specialized route already has canonical admin authorization, UUID/Zod validation, bounded version selection and print security headers, so no backend/PostgreSQL mutation was justified.

Exact-head verification on `da083efb41a08103edb402b4021ccfb792077384`:
- Architecture Guard `35021257562` — SUCCESS.
- Frontend Preparation `35021257744` — SUCCESS.
- Admin AI `35021257706` — SUCCESS.
- Combined Integration `35021257480` — SUCCESS including clean PostgreSQL/security regressions and real Admin Chromium.
- Stage13G `35021257700` — SUCCESS including Admin backend/UI and Real API + PostgreSQL + Chromium.

#### AB-03.5.4 Quiz Builder compatibility retirement + closure scan — NEXT

Fresh pre-scan already confirms the four feature-owned Quiz Builder presentation files still import their API through root `../../quiz-builder-api`, while the old `admin/quizzes/*` page paths are compatibility-only after router ownership moved to feature public entries. The closure increment must fresh-map all current consumers, switch only feature-internal consumers to the local canonical API where safe, delete only facades proven dead, preserve the mixed AI-authoring facade where a real consumer still requires it, and then run exact-head gates before marking AB-03.5 fully done.

## Remaining roadmap

Finish Quiz Builder closure → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
