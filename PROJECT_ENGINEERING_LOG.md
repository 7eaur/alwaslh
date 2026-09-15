# PROJECT ENGINEERING LOG — الوسيلة الذكية

> Repository code, PostgreSQL migrations/schema, executable CI/tests and verified runtime evidence outrank prose.

Last consolidated: **2026-09-16 — owner-directed pause before Students source mutation; AI generation operational closure opened.**

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

## AB-03 — ACTIVE / ORDERED ROADMAP PAUSED BEFORE AB-03.6.1 SOURCE MUTATION

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

## Sequence 88 — AB-03.6.1 Students opening — DEFERRED BEFORE SOURCE MUTATION

Sequence 88 opened `AB-03.6.1 — Students feature-owner foundation` and recorded a frontend-only extraction plan. No Student implementation source commit followed the sequence-open documentation commit `6bb1c0390e3b4e6bf39647421ac9da4b175d828d`. The owner explicitly paused this slice on 2026-09-16 so AI question generation can be operationally completed first.

This is a priority pause, not a roadmap deletion. Exact resume point after generation closure: **AB-03.6.1 Students feature-owner foundation**.

## Sequence 89 — AI generation operational closure — ACTIVE

Purpose: verify and, where evidence requires, complete the existing lesson/content-to-question generation path instead of continuing structural roadmap work while generation remains operationally uncertain.

Acceptance boundary:
- inspect Admin lesson/content context and linked-question observability;
- trace generation request from Admin through API/job/worker/provider;
- prove whether runtime binds a real AI provider and identify required config without exposing secrets;
- inspect prompt registry, grounding rules, output schemas/parsers and validation;
- search repository/history/available legacy evidence for the old/original prompt and question-generation rules, then compare parity rather than assuming it;
- trace result/review/adoption into canonical Question Bank/PostgreSQL persistence and lesson/content linkage;
- verify authorization, provenance/audit, idempotency/transaction behavior as applicable;
- run focused unit/integration/security/PostgreSQL/browser evidence and exact-head CI.

At sequence open, the architecture for AI authoring had prior green evidence, but **real provider runtime execution/config** and **exact old/original prompt/rule parity** are `NOT YET VERIFIED`. Therefore prior AB-03.3 architecture closure must not be confused with end-to-end production/development readiness of generation.

Before any overlapping backend/database change, compare the live-main authoritative offline/content delta and reconcile deliberately. No backend/schema mutation is justified solely by this documentation pivot.

## Exact roadmap resume after generation closure

`AB-03.6.1 Students feature-owner foundation` → remaining Students → Access Codes → AB-04 → AB-05 → AB-06 → AB-07 → AB-08.
