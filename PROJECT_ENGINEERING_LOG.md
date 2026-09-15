# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker B sequence 82 moved Question Bank regeneration/archive ownership into `features/questions` and passed exact-head verification.**

## Durable invariants

- `apps/admin-web` — Super Admin product.
- `apps/api` — authoritative Fastify API.
- `database/migrations` — PostgreSQL integrity authority.
- `apps/student-web` frontend implementation remains separate; Student-facing backend contracts remain owned here.
- Auth/authorization/entitlement/publication/revision/provenance/audit/assessment/offline authority stays server-owned.
- Never weaken tests/security/validation to satisfy a migration.

## Governance

Branch `rebuild/super-admin-foundation`; PR #52 remains Draft. Workers A/B/C use the autonomous execution state as serial handoff authority. Never auto-merge or rewrite shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. It contains authoritative offline-content API/PostgreSQL changes; reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification.

## AB-03 — ACTIVE

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Final executable/source checkpoint: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

### AB-03.4 Question Bank — ACTIVE

#### Sequence 80 — AB-03.4.1 feature-owner foundation — DONE
Source commit: `11fb063ebe513a6141bb67b6725b5f181d762907`.

`features/questions/question-bank-api.ts` became the canonical Admin Question Bank API/application owner; root `question-bank-api.ts` became compatibility-only. Backend standard Question Bank ownership already existed in `apps/api/src/question-bank/*`; no backend/database mutation was required.

#### Sequence 81 — AB-03.4.2 presentation ownership — DONE / EXACT-HEAD VERIFIED
Source commit: `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca`.

The three page implementations moved to `features/questions`, route composition switched to page-specific feature public entries, and legacy page paths became one-line compatibility re-exports. UI, routes, Arabic copy, CSS, accessibility and behavior were preserved.

Exact-head CI:
- Architecture Guard `34996490917` — SUCCESS.
- Frontend Preparation `34996491028` — SUCCESS.
- Admin AI `34996491040` — SUCCESS.
- Combined Integration `34996491059` — SUCCESS including real Chromium.
- Stage13G `34996491115` — SUCCESS including Real API + PostgreSQL + Chromium.

#### Sequence 82 — AB-03.4.3 regeneration/archive ownership — DONE / EXACT-HEAD VERIFIED

Source commit: `5ff7028cb069561c5eb45466e9a0fb882fbf9131` (`refactor(admin): feature-own Question Bank regeneration`).

Fresh evidence before mutation:
- root `admin-ai-authoring-api.ts` implemented `enqueueQuestionRegeneration` and `archiveQuestionBankItem` even though both are Question Bank responsibilities;
- the real consumer was the mixed `AdminAiAuthoringWorkspace.tsx`;
- backend endpoints already existed in `apps/api/src/ai/admin-authoring-http.ts` with admin authorization, Zod validation and authoring service authority;
- no backend/database correction was required.

Completed source work:
1. Added `features/questions/question-bank-authoring-api.ts` as the sole implementation owner for regeneration/archive frontend application calls.
2. The Question Bank feature imports `AiAuthoringSubjectDomain` / `AuthoringPlanResult` only through `features/ai/public`, satisfying the cross-feature architecture rule.
3. Added a feature-owned test file asserting canonical regenerate/archive URLs, POST method, credentials and exact regeneration payload.
4. Exported the two actions through `features/questions/public`.
5. Removed their implementation and corresponding test block from root `admin-ai-authoring-api.*`.
6. Kept only a temporary root compatibility re-export because `AdminAiAuthoringWorkspace.tsx` remains a real consumer; no duplicate implementation exists.
7. Quiz Builder specialized export/print code and types remained untouched.
8. No UI, copy, route, backend, database or security behavior changed.

Exact-head CI on `5ff7028cb069561c5eb45466e9a0fb882fbf9131`:
- Architecture Guard `34998332362` — SUCCESS.
- Frontend Preparation `34998332394` — SUCCESS: Admin lint + strict typecheck + unit tests + build.
- Admin AI `34998332370` — SUCCESS: lint/type/unit/build, clean PostgreSQL migrations/contracts, authorization/observability/review/control, Stage12 and auth security regression.
- Combined Integration `34998332374` — SUCCESS including clean PostgreSQL, backend authority regressions, deterministic browser fixture and real Admin Chromium.
- Stage13G `34998332377` — SUCCESS across Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

#### Exact next increment — AB-03.4.4 Question Bank compatibility retirement + closure scan

Fresh post-source inspection found compatibility seams that must be evaluated before declaring Question Bank closed:
- root `question-bank-api.ts` is a one-line re-export and feature-owned pages still reference it from their inherited imports;
- `AdminAiAuthoringWorkspace.tsx` still takes Question Bank actions/API through root compatibility facades;
- `admin/questions/{List,Create,Detail}` are one-line presentation re-exports while `AdminRoutes.tsx` already consumes feature public page entry points.

Worker C must fresh-map all consumers, switch safe consumers to canonical Question Bank ownership, delete only genuinely dead compatibility files/exports, and then perform a full Question Bank closure scan. Preserve behavior and keep all Quiz Builder concerns outside this increment. A compatibility boundary may remain only with documented real-consumer justification; do not retain dead facades for convenience.
