# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-16**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Confirm repo/branch and live branch + `main` HEAD; read shared execution state, status, engineering log, this handoff, autonomous protocol and active AB-03 record; inspect code/tests/CI; confirm no active-worker collision. Code/migrations/executable CI/runtime evidence outrank prose.

## Scope / governance

Owned: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts and required CI/security/integration/browser verification. Excluded only: structural/design implementation of `apps/student-web` frontend. Branch is `rebuild/super-admin-foundation`; PR #52 stays Draft/unmerged/no auto-merge; never force-reset or force-push shared history.

Live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`. Main reconciliation is `REQUIRED / DEFERRED` because main contains authoritative offline-content API/PostgreSQL changes. Reconcile before overlapping backend/database mutation and before AB-08 final verification.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE / ORDERED ROADMAP TEMPORARILY PAUSED
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — DONE / EXACT-HEAD VERIFIED
  - AB-03.3 AI Jobs / Review / Authoring — DONE / EXACT-SOURCE VERIFIED
  - AB-03.4 Question Bank — DONE / EXACT-HEAD VERIFIED
  - AB-03.5 Quiz Builder — DONE / EXACT-HEAD VERIFIED
  - AB-03.6.1 Students feature-owner foundation — **DEFERRED BEFORE SOURCE MUTATION; EXACT RESUME POINT**
- Owner-priority temporary workstream — **AI generation operational closure — ACTIVE**
- AB-04..AB-08 — PENDING

## Last fully verified roadmap result

Worker A sequence 87 completed **AB-03.5.4 — Quiz Builder compatibility retirement + closure scan** and therefore closed **AB-03.5 Quiz Builder**.

Final executable/source checkpoint: `f60a4b279fad9a011f9188005dd3ad075c7e3f00`.

Exact-head evidence on that source:
- Architecture Guard `35022098967` — SUCCESS.
- Frontend Preparation `35022099016` — SUCCESS.
- Admin AI `35022098946` — SUCCESS.
- Combined Integration `35022098947` — SUCCESS including clean PostgreSQL/security regressions and real Admin Chromium.
- Stage13G `35022099002` — SUCCESS including Admin backend/UI and Real API + PostgreSQL + Chromium.

## Roadmap pause checkpoint

Worker B sequence 88 opened `AB-03.6.1 — Students feature-owner foundation`, but no Students implementation source commit followed. The branch only received the sequence-open documentation commit `6bb1c0390e3b4e6bf39647421ac9da4b175d828d`. On 2026-09-16 the owner explicitly redirected priority to finishing AI question generation operationally before continuing the remaining roadmap.

Do not interpret the pause as completion of Students. After generation closure, resume exactly at **AB-03.6.1 — Students feature-owner foundation**.

## Active continuation — Worker C sequence 89

Goal: close the complete generation loop needed for development:

`Admin content/lesson context → linked existing questions → generation request → real provider execution → structured generated result → validation/review → adopt/save → canonical PostgreSQL Question Bank linkage → Admin re-observation`.

Required work, in order:
1. Fresh-map the existing Admin pages/features for curriculum/content, AI authoring/review and Question Bank; do not redesign them by default.
2. Trace the API/job/worker/provider runtime from generation request to result. Distinguish real provider implementation/config from fake/test adapters.
3. Trace PostgreSQL schema/migrations for jobs/requests/results/question persistence, linkage, provenance and audit.
4. Inspect prompt registry/templates, lesson grounding assembly, output schema/parser and question rules.
5. Search repository/history/available legacy/original evidence for the previous generation prompt/rules and compare behavior. Do not claim parity without evidence.
6. Verify how an operator sees questions already linked to a selected lesson/content and how generated candidates are surfaced for review.
7. Close only missing seams with the smallest coherent implementation increments; reuse existing AI/Content/Question Bank owners rather than creating a parallel subsystem.
8. Before overlapping backend/database mutation, compare/reconcile live-main authoritative offline/content changes.
9. Test the focused flow with unit/integration/security/PostgreSQL evidence and real Admin Chromium; execute a real provider smoke only when runtime credentials/config are actually available.
10. Run exact-head Architecture Guard + Frontend Preparation + Admin AI + Combined Integration + Stage13G before declaring generation operationally closed.

At sequence open:
- previous AI architecture/ownership has green evidence;
- real external-provider runtime binding/execution is **NOT YET VERIFIED**;
- exact old/original prompt/rule parity is **NOT YET VERIFIED**;
- therefore generation must not yet be described as fully ready merely because the API/prompt/job abstractions exist.

PR #52 remains Draft / unmerged / no auto-merge.

## Remaining roadmap after generation closure

Resume exactly at: `AB-03.6.1 Students feature-owner foundation` → remaining Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
