# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker C sequence 83 closed Question Bank after compatibility cleanup and exact-head verification.**

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
Final source: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
Final source: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
Final source: `9b38c9d2f803e220874a40e71ac06399e78435a3`.

### AB-03.4 Question Bank — DONE / EXACT-HEAD VERIFIED

#### Sequence 80 — AB-03.4.1 feature-owner foundation — DONE
Source: `11fb063ebe513a6141bb67b6725b5f181d762907`.

#### Sequence 81 — AB-03.4.2 presentation ownership — DONE / EXACT-HEAD VERIFIED
Source: `26ca9ab2835f72a169a7e602c4fd0657cfbb1eca`.

#### Sequence 82 — AB-03.4.3 regeneration/archive ownership — DONE / EXACT-HEAD VERIFIED
Source: `5ff7028cb069561c5eb45466e9a0fb882fbf9131`.

#### Sequence 83 — AB-03.4.4 compatibility retirement + closure scan — DONE / EXACT-HEAD VERIFIED
Source: `a5e76461234bd42a29984ffb5d1a587bdbc3092a` (`refactor(admin): retire dead Question Bank compatibility`).

Fresh consumer mapping before cleanup established:
- the legacy `admin/questions/{List,Create,Detail}` files were no longer consumed by the router and were dead one-line re-exports;
- root `question-bank-api.ts` and Question Bank re-exports in `admin-ai-authoring-api.ts` still had real consumers, so deleting them would create churn without changing canonical ownership;
- the Question Bank API test itself still lived at root.

Completed source work:
1. Removed the three dead legacy presentation facades under `admin/questions/*`.
2. Moved `question-bank-api.test.ts` unchanged into `features/questions/question-bank-api.test.ts`.
3. Kept root compatibility boundaries only where real consumers remain; they contain no Question Bank implementation logic.
4. Confirmed canonical Question Bank implementations remain feature-owned in `features/questions` and backend-owned in the existing Fastify Question Bank/AI-authoring modules.
5. No route, payload, auth, UI, CSS, copy, backend or database behavior changed.

Exact-head CI on `a5e76461234bd42a29984ffb5d1a587bdbc3092a`:
- Architecture Guard `34999311596` — SUCCESS.
- Frontend Preparation `34999311689` — SUCCESS.
- Admin AI `34999311651` — SUCCESS including clean PostgreSQL/security regressions.
- Combined Integration `34999311611` — SUCCESS including real Admin Chromium.
- Stage13G `34999311628` — SUCCESS including Admin UI, backend, PostgreSQL/security integrations and Real API + PostgreSQL + Chromium.

Closure decision: **AB-03.4 Question Bank is closed.** No genuine implementation owner remains outside the canonical frontend/backend boundaries; remaining root files are compatibility-only real-consumer boundaries, not duplicate owners.

### AB-03.5 Quiz Builder — ACTIVE

#### Exact next increment — AB-03.5.1 Quiz Builder feature-owner foundation

Fresh inspection shows:
- backend canonical ownership already exists under `apps/api/src/quiz-builder/{http,service,candidates,export,specialized-export,...}` with admin authorization and Zod validation in the HTTP boundary;
- root `apps/admin-web/src/quiz-builder-api.ts` owns the frontend API/application contracts and implementation;
- root `quiz-builder-api.test.ts` verifies list filters, candidates, detail/create/version routes, replace/review/publish mutations and version export;
- presentation remains in `admin/quizzes/*` and must not be mixed into the foundation increment;
- specialized export/print ownership must remain separate until its dedicated increment.

Worker A should move only the root Quiz Builder API/application implementation and its tests to `features/quizzes`, expose a public boundary, and leave a temporary root compatibility re-export for real consumers. No backend/database mutation is indicated by current evidence.
