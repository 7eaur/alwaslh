# Super Admin Rebuild — 2026-09-13

Status: **ACTIVE — AR-01 through AR-08 DONE / VERIFIED. AR-09 Cleanup / architecture enforcement ACTIVE; Batches 1–8A VERIFIED; Batch 9A AI review presentation ownership ACTIVE at caller-switch exact-head verification.**

Branch: `rebuild/super-admin-foundation`  
Draft PR: `#52 — refactor(admin): rebuild Super Admin foundation`  
Latest live `main` checked: `5b6fbfecade3abd52a5c4203e47c4f5b69444a86` — Student workstream advance, untouched.  
Current Batch 9A production code-head: `00b35eed478cd49da75784d61775ebb0f7b5df81`.

> Source of truth order: repository code + PostgreSQL migrations + executable tests/CI + verified runtime + canonical project documentation.

## Product and architecture rules

- KEEP modular-monolith backend and server authority.
- KEEP publication, assessment, access, human-review, revision, provenance and audit boundaries.
- REBUILD Admin information architecture and route ownership incrementally.
- MOVE contextual workflows into focused route-owned surfaces.
- SPLIT individual Student support from bulk Access Code management.
- KEEP technical IDs/provider/runtime/storage/database details advanced-only.
- DO NOT break or overwrite the parallel Student/audit workstream.
- Test fixtures must satisfy production contracts; backend validation is never weakened for E2E.
- Legacy aliases/workspaces may exist only as temporary parity seams and are removed after executable replacement parity.
- Route/feature-specific components with established owners move under `src/admin/<feature>/` once parity and caller proof permit it.

## Roadmap

- AR-01 — Architecture baseline + route-driven shell — DONE / VERIFIED.
- AR-02 — Overview + Operations split — DONE / VERIFIED.
- AR-03 — Curriculum — DONE / VERIFIED.
- AR-04 — Content + OCR — DONE / VERIFIED.
- AR-05 — Reviews + AI — DONE / VERIFIED.
- AR-06 — Question Bank — DONE / VERIFIED.
- AR-07 — Quiz Builder — DONE / VERIFIED.
- AR-08 — Students + Access Codes — DONE / VERIFIED.
- AR-09 — Cleanup + architecture enforcement — **ACTIVE**.
- AR-10 — A11y/RTL/performance/visual QA — NOT STARTED.

No later AR stage starts before the current stage is verified and documented.

## Verified AR-09 checkpoints

- Batch 1: Quiz metadata ownership relocation — VERIFIED.
- Batch 2: Lesson authoring tools ownership relocation — VERIFIED.
- Batch 3: Access-code reports ownership relocation — VERIFIED.
- Batch 4A: AI review page ownership relocation — VERIFIED.
- Batch 5A: Curriculum ownership + root seam removal — VERIFIED.
- Batch 6A: Content review ownership + root seam removal — VERIFIED.
- Batch 7A: Content ingestion ownership + root seam removal — VERIFIED.
- Batch 8A: Lesson Publication ownership + root seam removal — VERIFIED through descendant `998ab1efa5ede52cead73b075d890542e1d5adba`; Admin AI `34783495895`, Combined `34783495898`, Stage13G `34783495896` — SUCCESS, with earlier caller-switch Frontend verification successful.

## AR-09 Batch 9A — AI Review presentation ownership — ACTIVE

### Current ownership evidence

- `/app/reviews/ai` is owned by `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx`.
- `AiReviewWorkspace` is presentation for that Reviews route and belongs behind `admin/reviews/`.
- Backend, migrations, API contracts, server/PostgreSQL authority and Student workstream do not need changes for this cleanup.

Classification:
- **KEEP:** AI review/polling/review/apply behavior, API contracts, auth/session behavior, server/PostgreSQL authority and current tests.
- **IMPROVE:** Reviews dependency direction.
- **REFACTOR:** adapter → caller switch → real implementation relocation → root seam removal, with parity after each step.
- **REBUILD:** none.
- **REMOVE:** root seam only after executable proof.

### Adapter parity reconciled this continuation

Adapter production commit `24b066cbfa846fc789da01929f495bdc267d96c0` added only `apps/admin-web/src/admin/reviews/AiReviewWorkspace.tsx` as a parity re-export.

Verification:
- Frontend `34784977628` — SUCCESS on the adapter code-head.
- Admin AI `34784977631` — cancelled by subsequent continuity commits, not by test failure.
- documentation descendant `a62ca65d6430e68b076f5cebed3105d7f28df88a` carries the same production adapter tree and completed:
  - Admin AI `34785102555` — SUCCESS;
  - Combined `34785102557` — SUCCESS;
  - Stage13G `34785102562` — SUCCESS, including Real API + PostgreSQL + Chromium job `103799147288`.

### Caller switch performed

Commit `00b35eed478cd49da75784d61775ebb0f7b5df81` — `refactor(admin): route ai review through reviews owner`.

Changed only:
- `apps/admin-web/src/admin/reviews/AiOperationsPage.tsx`
  - import from `../../AiReviewWorkspace`
  - to `./AiReviewWorkspace`.

No behavior/API/backend/migration/auth/Student/test change.

### Exact-head verification now

Caller-switch exact-head runs on `00b35eed478cd49da75784d61775ebb0f7b5df81`:
- Admin AI `34786308544` — IN PROGRESS at checkpoint;
- Combined `34786308488` — IN PROGRESS at checkpoint;
- Stage13G `34786308533` — IN PROGRESS at checkpoint;
- Frontend/Admin Web quality checks on the same commit are also active.

Therefore Batch 9A remains **ACTIVE / CALLER SWITCHED / PARITY PENDING**. No real implementation relocation or root deletion is allowed yet.

## Explicit handoff — finish Batch 9A first, no parallel work

1. Re-fetch live `main`, Admin branch HEAD, all three continuity files, recent commits, Draft PR #52 and exact-head CI.
2. Treat AR-09 Batches 1–8A as DONE / VERIFIED.
3. Resolve caller-switch production code-head `00b35eed478cd49da75784d61775ebb0f7b5df81` first: Admin AI `34786308544`, Combined `34786308488`, Stage13G `34786308533`, plus Frontend/Admin Web quality checks.
4. If documentation descendants supersede/cancel runs, reconcile only a descendant carrying the identical production tree.
5. After green caller-switch parity, relocate the real `AiReviewWorkspace` implementation to `admin/reviews/`, keeping the root file as a compatibility re-export.
6. Run exact-head parity before deleting the root seam.
7. Delete the root seam only after callers are proven local and relocation parity is green; run exact-head parity again.
8. After Batch 9A closes, perform fresh AR-09 inventory. If no justified established-owner seam remains, run final AR-09 exact-head verification and close AR-09.
9. Only then start AR-10.
10. Keep PR #52 Draft; no merge or auto-merge.

## Quality gate for remaining stages

- lint;
- strict typecheck;
- unit/integration tests;
- production build;
- clean PostgreSQL migrations/contracts where relevant;
- backend authority/auth/security regressions;
- real Chromium flows;
- responsive/no-overflow evidence for changed surfaces;
- final exact-head matrix before stage closure.

Acceptance: **Functional + Clear + Elegant + Consistent + Fast + Maintainable + Professional**.
