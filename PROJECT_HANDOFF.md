# PROJECT HANDOFF — الوسيلة الذكية — Admin + Backend Rebuild

Date: **2026-09-15**  
Purpose: resume the scoped Super Admin + Backend rebuild without relying on chat memory.

## Mandatory startup

Confirm repo/branch and live branch + `main` HEAD; read shared execution state, status, engineering log, this handoff, autonomous protocol and active AB-03 record; inspect code/tests/CI; confirm no active-worker collision. Code/migrations/executable CI/runtime evidence outrank prose.

## Scope

Owned: complete Super Admin, full Fastify backend/API, PostgreSQL/migrations/integrity, server capabilities consumed by Admin/Student, relevant shared contracts, architecture documentation and required CI/security/integration/browser verification. Excluded only: structural/design implementation of `apps/student-web` frontend.

## Branch / PR

- branch: `rebuild/super-admin-foundation`;
- PR #52 stays Draft and is never auto-merged;
- never force-reset or force-push shared history;
- live `main`: `3646a63e36d9d9d967bdeb0c8a97ee65055cd672`;
- main reconciliation: `REQUIRED / DEFERRED` because main contains authoritative offline-content API/PostgreSQL changes. Reconcile before overlapping backend/database mutation and before AB-08 final verification.

## Current phase

- AB-00 — DONE
- AB-01 — DONE / EXACT-HEAD VERIFIED
- AB-02 — DONE / SOURCE-TREE-EQUIVALENT VERIFIED
- AB-03 — ACTIVE
  - AB-03.1 Overview + Operations — DONE / EXACT-SOURCE VERIFIED
  - AB-03.2 Curriculum + Content + OCR — **DONE / EXACT-HEAD VERIFIED**
  - AB-03.3 AI Jobs / Review / Authoring — **ACTIVE**
- AB-04..AB-08 — PENDING

## Latest verified result

AB-03.2 final executable/source checkpoint is `3a45d18d5e4e69ef77a818e4917450c9c2b94214`.

Final closure moved the two remaining real root implementations into their feature owners:

- lesson-content publication transport/test → `features/content/api`, exposed by `features/content/public`;
- lesson summary/export transport → `features/curriculum/api`, exposed by `features/curriculum/public`.

The transport moves were behavior-preserving renames with only shared-client import-path changes. Production consumers now use the public feature boundaries.

Exact-head green evidence:

- Architecture Guard `34964996524`;
- Frontend Preparation `34964996555`;
- Admin AI `34964996466`;
- Combined Integration `34964996488` including real Admin Chromium;
- Stage13G `34964996480` including Admin UI, backend, PostgreSQL/security integrations, and Real API + PostgreSQL + Chromium.

## Exact continuation

Begin **AB-03.3.1 — AI operations frontend ownership** as a separate coherent increment:

1. preserve current AI behavior/contracts and inspect all consumers/tests before mutation;
2. establish `features/ai` ownership for AI jobs/review API plus its adapter/view-model/test family rather than leaving split root implementation ownership;
3. expose only the narrow public surface needed by `AiOperationsPage` / review UI;
4. repoint legitimate consumers, then remove root files only when proven unused;
5. do not fold Question Bank or Quiz Builder transports into this increment—they have later canonical slices;
6. keep AI authoring-specific application hooks separate if they cannot be moved coherently without mixing later domain ownership;
7. run Architecture Guard, Admin quality, Admin AI, Combined and Stage13G/PostgreSQL/security/Chromium gates before declaring the increment closed.

## Remaining roadmap

AB-03.3 AI Jobs/Review/authoring → Question Bank → Quiz Builder → Students → Access Codes → AB-04 backend normalization → AB-05 UX/UI convergence → AB-06 performance/delivery → AB-07 legacy removal/hard enforcement → AB-08 final verification/reconciliation.

After verified AB-08 completion and shared state `COMPLETE`, disable all three scheduled workers.
