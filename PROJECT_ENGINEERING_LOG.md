# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-15 — Worker A sequence 87 closed Quiz Builder compatibility debt and exact-head verification.**

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
Source: `a5e76461234bd42a29984ffb5d1a587bdbc3092a`.

### AB-03.5 Quiz Builder — DONE / EXACT-HEAD VERIFIED
Final source: `f60a4b279fad9a011f9188005dd3ad075c7e3f00`.

#### Sequence 84 — feature-owner foundation
Source `2254cc8121fd319b17cbd626d683352b23dda229` moved the Quiz Builder frontend API/application implementation and tests under `features/quizzes`, exposing a narrow public boundary while keeping root compatibility for live consumers.

#### Sequence 85 — presentation ownership
Source `4c389e87872621dd70781401d85fadc7df6338b6` moved List/Create/Detail/Metadata presentation implementations to `features/quizzes`, preserved route-level lazy entry points and changed only router import ownership.

#### Sequence 86 — specialized export/print ownership
Source `da083efb41a08103edb402b4021ccfb792077384` moved Quiz Builder specialized export/print types, transport and test coverage into the feature. Backend specialized routes were already canonical and were not rewritten.

#### Sequence 87 — compatibility retirement + closure — DONE / EXACT-HEAD VERIFIED
Source `f60a4b279fad9a011f9188005dd3ad075c7e3f00` (`refactor(admin): retire dead Quiz Builder page facades`).

Fresh closure scan proved:
- router no longer consumed `admin/quizzes/*`;
- the four old page paths were one-line compatibility re-exports and had no remaining consumers;
- root `quiz-builder-api.ts` still had real consumers from the four feature-owned pages, so it was retained as compatibility-only rather than introducing churn;
- mixed root `admin-ai-authoring-api.ts` still had a real `AdminAiAuthoringWorkspace` consumer and was retained as compatibility-only;
- retained facades contain no Quiz Builder implementation ownership.

Closure mutation deleted only the four dead page facades; compare showed four one-line deletions and no additions or behavior changes.

Exact-head CI on `f60a4b279fad9a011f9188005dd3ad075c7e3f00`:
- Architecture Guard `35022098967` — SUCCESS.
- Frontend Preparation `35022099016` — SUCCESS.
- Admin AI `35022098946` — SUCCESS.
- Combined Integration `35022098947` — SUCCESS including clean PostgreSQL/backend/security regressions and real Admin Chromium.
- Stage13G `35022099002` — SUCCESS including Admin backend/UI and Real API + PostgreSQL + Chromium.

## Exact next vertical slice — AB-03.6 Students

Fresh pre-scan:
- presentation: `apps/admin-web/src/admin/students/AdminStudentsPage.tsx`;
- mixed frontend owner: `apps/admin-web/src/admin-student-access-api.ts`, which combines Student and Access Code contracts/actions;
- mixed unit test similarly combines two Access Code tests and two Student tests;
- backend `apps/api/src/admin-access/http.ts` already protects Student list/detail with admin authorization and bounded Zod pagination/UUID validation;
- recovery/device-rebind/entitlement mutation authority already lives in existing auth/access backend services and Stage13G access/auth regressions are green.

Smallest coherent next increment: **AB-03.6.1 Students feature-owner foundation**. Split only Student-owned frontend contracts/actions and Student-specific test blocks into `features/students`; expose a narrow public boundary; preserve Access Code implementation/tests in the existing mixed root until its own slice; leave backend/database unchanged absent new evidence.
