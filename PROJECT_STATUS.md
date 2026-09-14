# PROJECT STATUS — الوسيلة الذكية

> Source of truth: repository code + PostgreSQL migrations/schema + executable CI/tests + verified runtime + active scoped documentation.

**Active branch:** `rebuild/super-admin-foundation`  
**Draft PR:** #52 — Draft / unmerged / no auto-merge.  
**Current stage:** `AB-03 — End-to-end Admin vertical slices` — ACTIVE at `AB-03.2 Curriculum + Content + OCR`.

## Scope

This workstream owns the complete Super Admin plus full Fastify backend/API, PostgreSQL/migrations/integrity, security and server/shared contracts consumed by Admin or Student. The only structural exclusion is `apps/student-web` frontend implementation itself.

## Continuation authority

Read first: `docs/workstreams/ADMIN_BACKEND_AUTONOMOUS_EXECUTION_STATE.md`, then the autonomous protocol, `PROJECT_ENGINEERING_LOG.md`, `PROJECT_HANDOFF.md`, and the active workstream record.

Workers A/B/C share one branch and ordered roadmap. Never overlap an active worker. Every run performs one smallest coherent increment.

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

Live `main` latest observation: `62a148e76bd15f52c7e2b05d325cf0a1d6ac8cd0`.

AB-02 → AB-03 phase-boundary reconciliation is complete. No new overlapping Admin/API/PostgreSQL/shared-contract implementation change was observed through Worker B sequence 46 startup.

## AB-00 — DONE

Architecture baseline, inventories, guardrails and readiness gate are closed.

## AB-01 — DONE / EXACT-HEAD VERIFIED

Shared Admin transport/session/product-state foundations, bounded backend app-composition seams and shared request-validation ownership are closed.

## AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB02_EXECUTION_2026-09-14.md`.

## AB-03 — ACTIVE

Canonical record: `docs/workstreams/ADMIN_BACKEND_AB03_EXECUTION_2026-09-14.md`.

### AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED

Final executable source checkpoint: `7eda86fbbd7cbdcd5f2197ef35db7557c0d210dc`.

Authoritative green evidence: Architecture Guard `34876404251`; Frontend Preparation `34876404345`; Admin AI Operations `34876404287`; Combined Integration `34876404314`; Stage13G Admin Operations `34876404237`.

### AB-03.2 Curriculum + Content + OCR — ACTIVE

Worker B sequence 46 performed only the remaining bounded Content-ingestion Curriculum consumer migration:

- `ContentIngestionWorkspace.tsx` now consumes `AdminCurriculumSnapshot` and `fetchAdminCurriculum` from `features/curriculum/public`;
- generic `ApiRequestError` and `isMissingSessionError` now come directly from canonical `shared/api/client`;
- endpoint, payload, session/UI behavior, backend, PostgreSQL, security, OCR, AI and Student frontend behavior were unchanged;
- root `content-ingestion-api.ts` was intentionally not migrated.

An attempted deletion of the root Curriculum compatibility re-exports at `af4a131b1b039883a318ebb41b7ec5e5146f126d` exposed real remaining consumers through Stage13G strict typecheck (`34886697753`): Curriculum subcomponents plus Access Codes, AI authoring, Question Bank, Quiz Builder and the root transport test still consume the facade. The backend/PostgreSQL Stage13G job itself stayed green. The correct smallest fix was therefore to restore only the compatibility re-export facade while keeping Curriculum implementation ownership in `features/curriculum` and keeping the Content-ingestion consumer migrated.

Corrected executable source checkpoint: `4cd3daf2408d91c5bafaaec559220d402ee169bb`.

Architecture Guard `34887051028` is green on that corrected exact source HEAD. Frontend Preparation `34887051091`, Admin AI `34887051031`, Combined Integration `34887051068`, and Stage13G `34887051059` were still pending/in progress at the last observation, so this increment remains `WAITING_FOR_CI` rather than falsely DONE.

**Exact next smallest step:** verification/closure only for the corrected source checkpoint. Do not start another AB-03.2 concern until Admin quality/build, relevant API/PostgreSQL/integration, Combined Chromium and Stage13G real API + PostgreSQL + Chromium are green. After closure, perform fresh AB-03.2 discovery; do not mass-migrate later-slice facade consumers merely to delete a compatibility export.

## Remaining roadmap

AB-03 slices in canonical order: Curriculum + Content + OCR → AI → Question Bank → Quiz Builder → Students → Access Codes. Then AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy deletion/hard enforcement → AB-08 final verification + live-main reconciliation.

No merge/readiness before AB-08 exact-head green. After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.