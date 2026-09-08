# Stage13E Promotion Manifest

> Purpose: promote the verified Stage13E Admin AI Operations / Review implementation onto the latest `main` without importing stale branch history or overwriting newer central documentation.
>
> This manifest is **promotion preparation only**. Stage13E remains `NOT YET VERIFIED` until the executable gates pass.

## Snapshot used for this audit

Initial audit snapshot:

- merge base: `1069aabc5a921b38ca6c8e4bb4bf801f83fc2455`
- audited `main`: `e10de6d7811ad04811e8a841628966a5269b1dfd`
- Stage13E candidate/docs: `c48d1e597497e6054340f71235c78937082b9371`
- Stage13E runtime/test beneath docs: `d60218b518fb0fe453c21386e77cd35a2228ad07`

Git comparison at the initial snapshot:

- candidate vs merge base: **53 commits ahead**;
- audited `main` vs merge base: **77 commits ahead**;
- candidate branch vs `main`: divergent;
- Stage13E candidate changes: **36 files**;
- `main` changes since the same merge base: **19 files**;
- intersection between those two changed-file sets: **0 files**.

Post-documentation revalidation:

- revalidated `main`: `646b3824e3f7fef05a916e394af56d0af9e02926`;
- `main` is now **84 commits ahead** of the same merge base;
- `main` changed-file set is now **20 files** because this promotion manifest itself was added;
- Stage13E candidate file set remains the same **36 files**;
- changed-file intersection remains **0 files**.

Therefore a historical branch merge/cherry-pick chain is unnecessary and creates avoidable governance/history risk. The safe strategy is AD-136 + AD-146 selective integration: promote the exact accepted Stage13E files onto the latest `main` tree and re-run exact-head verification.

## Exact Stage13E promotion file set

### GitHub Actions — 3 files

1. `.github/workflows/stage13e-ai-operations.yml`
2. `.github/workflows/stage13e-frontend-prep.yml`
3. `.github/workflows/stage13e-integration.yml`

### Admin Web runtime/tests — 14 files

4. `apps/admin-web/e2e/ai-operations.e2e.spec.mjs`
5. `apps/admin-web/e2e/stage13e-real-api.mjs`
6. `apps/admin-web/src/AiOperationsPage.tsx`
7. `apps/admin-web/src/AiOperationsWorkspace.tsx`
8. `apps/admin-web/src/App.tsx`
9. `apps/admin-web/src/ai-operations-adapter.test.ts`
10. `apps/admin-web/src/ai-operations-adapter.ts`
11. `apps/admin-web/src/ai-operations-api.test.ts`
12. `apps/admin-web/src/ai-operations-api.ts`
13. `apps/admin-web/src/ai-operations-pagination.test.ts`
14. `apps/admin-web/src/ai-operations-review.css`
15. `apps/admin-web/src/ai-operations-view-model.test.ts`
16. `apps/admin-web/src/ai-operations-view-model.ts`
17. `apps/admin-web/src/ai-operations.css`

### API runtime — 6 files

18. `apps/api/src/ai/admin-operations-http.ts`
19. `apps/api/src/ai/admin-operations.ts`
20. `apps/api/src/ai/execution-repository.ts`
21. `apps/api/src/ai/job-lifecycle.ts`
22. `apps/api/src/ai/review-validation.ts`
23. `apps/api/src/app.ts`

### API tests / real fixtures — 8 files

24. `apps/api/tests/ai-admin-job-list-query-shape.test.ts`
25. `apps/api/tests/ai-admin-output-detail-snapshot.test.ts`
26. `apps/api/tests/ai-admin-pagination-bounds.test.ts`
27. `apps/api/tests/ai-admin-read-snapshots.test.ts`
28. `apps/api/tests/ai-admin-review-validation.test.ts`
29. `apps/api/tests/fixtures/stage13e-e2e-seed.ts`
30. `apps/api/tests/integration/ai-admin-action-authority.integration.test.ts`
31. `apps/api/tests/integration/ai-admin-operations.integration.test.ts`

### PostgreSQL — 1 file

32. `database/migrations/0018_ai_admin_review.sql`

### Stage-specialized documentation — 4 files

33. `docs/admin/STAGE13E_AI_OPERATIONS_FRONTEND_PREP.md`
34. `docs/ai/STAGE13E_ADMIN_AI_HTTP_VALIDATION.md`
35. `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`
36. `docs/ai/STAGE13E_ADMIN_AI_PERFORMANCE.md`

## Files that must NOT be taken from the old candidate history

The latest central state on `main` is newer than the candidate branch and remains authoritative. In particular, do not overwrite current versions of:

- `DOCUMENTATION_INDEX.md`
- `MASTER_REBUILD_ROADMAP.md`
- `NEXT_CONVERSATION_PROMPT.md`
- `PROJECT_ENGINEERING_LOG.md`
- `PROJECT_EXECUTION_QUEUE.md`
- `PROJECT_HANDOFF.md`
- `PROJECT_INTEGRATION_CONTINUITY.md`
- `PROJECT_STATUS.md`
- `docs/product/CURRENT_PRODUCT_OVERRIDES.md`
- `docs/product/LEGACY_FEATURE_COVERAGE_GATE.md`
- `docs/workstreams/*`
- `docs/integration/STAGE13E_PROMOTION_MANIFEST.md`
- hosting/deployment portability files such as `render.yaml` and `docs/deployment/*`

Those files contain newer Single Owner governance, VPS-deferred policy and closure/promotion-readiness state.

## Promotion procedure after candidate executable PASS

Do **not** promote Stage13E merely because this manifest is clean.

1. Run the existing combined Stage13E gate successfully on the accepted candidate.
2. Run the required wider Stage9/10/OCR/11/12/13/13D/Full Rebuild regression matrix on that accepted candidate.
3. Live-check latest `main` and candidate heads again.
4. Re-run the two merge-base comparisons and verify the promotion file set still has no unexpected overlap with newer `main` runtime changes.
5. Create a short-lived `integration/stage13e-promotion` branch from the then-current `main`.
6. Overlay **only** the exact accepted 36 files above from the accepted Stage13E candidate.
7. Review the resulting diff: no central governance/hosting file may regress; no unrelated product file may appear.
8. Run the **combined Stage13E gate and required wider regression matrix again on this exact promotion HEAD**. This second execution is required because repository policy demands exact-head closure evidence; candidate PASS alone does not verify the new promotion commit SHA.
9. Any executed failure must be root-caused on the promotion branch. Do not weaken tests or silently drop files.
10. Only after exact promotion-head PASS, fast-forward/promote that branch to `main` if `main` has not moved. If `main` moved, rebuild the promotion branch from latest `main` and repeat exact-head verification.
11. Update central docs, Roadmap and Legacy Coverage; mark only actually proven candidate mappings VERIFIED; write Stage13E Closure Report in Issue #16.
12. Then begin Stage13F.

## Why no promotion branch is created now

Creating a promotion branch before the candidate can execute would add another unverified head and another failing hosted-runner trigger without increasing evidence. The manifest is enough to eliminate merge ambiguity today. The promotion branch should be created only after the current candidate has executable combined + wider PASS evidence.

## Current blocker

`CI-001` remains the sole proven Stage13E closure blocker at this snapshot. Latest candidate run `34283442253`, attempt `2`, job `102256556365`, terminated before checkout with `runner_id=0` and `steps=[]`.

Hosting/VPS is unrelated and remains outside the development gate.