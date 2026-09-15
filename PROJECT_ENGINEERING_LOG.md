# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker C sequence 86 feature-owned Quiz Builder specialized export/print and passed exact-head verification.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains separate; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use the autonomous execution state as serial handoff authority. Never auto-merge or rewrite shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. Reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-03 — ACTIVE

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Source: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Source: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Source: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

### AB-03.4 Question Bank — DONE / EXACT-HEAD VERIFIED
Final source: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

### AB-03.5 Quiz Builder — ACTIVE

#### Sequence 84 — AB-03.5.1 feature-owner foundation — DONE / EXACT-HEAD VERIFIED
Source commit: `2254cc8121fd319b17cbd626d683352b23dda229`.

#### Sequence 85 — AB-03.5.2 presentation ownership — DONE / EXACT-HEAD VERIFIED
Source commit: `4c389e87872621dd70781401d85fadc7df6338b6`.

#### Sequence 86 — AB-03.5.3 specialized export/print ownership — DONE / EXACT-HEAD VERIFIED
Source commit: `da083efb41a08103edb402b4021ccfb792077384` (`refactor(admin): feature-own Quiz Builder specialized export`).

Fresh evidence before mutation:
- mixed root `admin-ai-authoring-api.ts` still directly owned Quiz Builder-specific `QuizPrintVariant`, `SpecializedExportBundle`, `fetchSpecializedQuizExport` and `specializedQuizPrintUrl`;
- `AdminAiAuthoringWorkspace` was a real consumer through the mixed root facade;
- the specialized URL/query assertion still lived in the mixed root test;
- backend `apps/api/src/quiz-builder/specialized-export-http.ts` already enforced admin authorization, UUID/Zod validation, bounded version IDs and secure print headers, so backend/database mutation was not justified.

Completed source work:
1. Added `features/quizzes/quiz-builder-specialized-export-api.ts` as canonical frontend owner for the specialized Quiz Builder transport/types.
2. Added `features/quizzes/quiz-builder-specialized-export-api.test.ts` with the specialized export/print route and query serialization assertions.
3. Exported the specialized contracts/actions from `features/quizzes/public/index.ts`.
4. Replaced root specialized implementation with compatibility re-exports from the Quiz Builder public boundary because the mixed AI-authoring workspace remains a real consumer.
5. Removed the specialized test block/imports from root `admin-ai-authoring-api.test.ts`, leaving unrelated AI authoring tests unchanged.
6. Made no UI, route behavior, backend or PostgreSQL mutation.

Exact-head CI on `da083efb41a08103edb402b4021ccfb792077384`:
- Architecture Guard `35021257562` — SUCCESS.
- Frontend Preparation `35021257744` — SUCCESS.
- Admin AI `35021257706` — SUCCESS.
- Combined Integration `35021257480` — SUCCESS including clean PostgreSQL/backend/security regressions and real Admin Chromium.
- Stage13G `35021257700` — SUCCESS including Admin backend/UI and Real API + PostgreSQL + Chromium.

#### Exact next increment — AB-03.5.4 Quiz Builder compatibility retirement + closure scan

Fresh pre-scan found the four Quiz Builder feature presentation files still import canonical Quiz Builder API through root `../../quiz-builder-api`, while old `admin/quizzes/*` page files are compatibility-only after router imports moved to feature public entries. The next worker must re-map consumers on the live branch, switch only feature-internal imports to their local owner where safe, delete only dead compatibility page/API facades proven unused, retain any mixed facade with a real consumer, then run exact-head CI and mark AB-03.5 fully done only if no duplicate implementation ownership remains.
