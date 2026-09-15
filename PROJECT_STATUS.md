# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.3 AI Jobs / Review / Authoring`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Permanent rules

- PostgreSQL/API are canonical business authority.
- Backend stays one Fastify modular monolith; no microservices/DI/service locator without evidence.
- Admin `app` composes only; features own workflows and expose narrow public/routes boundaries.
- Feature internals stay private; shared cannot import app/features.
- No new global state/query framework or styling-stack rewrite without evidence.
- No fabricated metrics/outcomes/actions.
- Product states, Arabic-first RTL, keyboard/focus, responsive/no-overflow and reduced-motion are first-class requirements.
- Tests/security/validation are never weakened.
- No permanent dual implementation ownership.

## Branch reconciliation

Live `main` latest observation: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672` (`feat(stage16): add authoritative offline content delta`). Main contains authoritative offline-content API/PostgreSQL changes, so reconciliation is `REQUIRED / DEFERRED` before overlapping backend/database mutation and before AB-08 final verification. Current frontend ownership work does not mutate those backend/database areas.

## AB-00 — DONE

## AB-01 — DONE / EXACT-HEAD VERIFIED

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

### AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED

Final executable/source checkpoint: `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

### AB-03.3 AI Jobs / Review / Authoring — ACTIVE

- **AB-03.3.1 AI operations feature-owner foundation — DONE / EXACT-HEAD VERIFIED.** AI jobs/review application capability, transport, adapter, view-model and tests live under `features/ai/operations`.
- **AB-03.3.2 AI review presentation ownership transfer — DONE / EXACT-HEAD VERIFIED.** Review page/workspace moved into the AI feature without behavior drift.
- **AB-03.3.3 compatibility-facade retirement + direct-owner consumption — DONE / EXACT-HEAD VERIFIED.** Root AI operations facades were removed. `AiStructuredOutputEditor.tsx`, review UI and their CSS were relocated under `features/ai/operations` as 100% renames; two one-line internal bridges preserve generic API-error and approved-output application dependencies without reintroducing root ownership. Executable/source checkpoint: `d1e11bc7b99b50dff480e8f830812492a390983c`.
- **AB-03.3.4 approved-output application ownership — NEXT.** Extract only the AI-owned approved lesson/quiz output application contracts/functions from mixed root `admin-ai-authoring-api.ts` into `features/ai`; keep Question Bank/Quiz Builder generation/export ownership in their later slices. Remove compatibility only after consumer proof.

Exact-head evidence on `d1e11bc7...`:

- Architecture Guard `34990715628` — SUCCESS.
- Frontend Preparation `34990715697` — SUCCESS: lint + strict typecheck + unit tests + build.
- Admin AI `34990715543` — SUCCESS: clean migrations + PostgreSQL contracts + authorization/observability/review-race/control + Stage12/auth regressions.
- Combined Integration `34990715804` — SUCCESS including deterministic fixture and real Admin Chromium.
- Stage13G `34990715570` — SUCCESS across Admin UI, backend, PostgreSQL/security/integrations and Real API + PostgreSQL + Chromium.

No endpoint, payload, backend, PostgreSQL, authorization, route behavior, product copy, JSX behavior or styling behavior changed in AB-03.3.3.

## Remaining roadmap

AB-03.3 AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
