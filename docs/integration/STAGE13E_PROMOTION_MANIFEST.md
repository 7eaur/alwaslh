# Stage13E Promotion Manifest — COMPLETED

> Purpose: record the exact selective Stage13E Admin AI Operations / Review promotion and its executable evidence without importing stale candidate history or overwriting newer central documentation.

Status: **COMPLETED / VERIFIED / PROMOTED TO MAIN**.

## Accepted candidate

Candidate branch final accepted HEAD:

`72ead8446af237392dc6d953c8e0c2382f468286`

Candidate required matrix: **12/12 SUCCESS on exact same HEAD**.

Verification-only PR #24 was closed **unmerged** after evidence capture.

## Promotion base and result

Latest `main` inspected before assembly:

`e304d61286b9ca120db2dad695d29f4f1642e733`

The commits that had advanced `main` from the older Stage13E common history were inspected by changed files. They were central documentation/continuity updates and had no overlap with the accepted Stage13E 36-file runtime/test/specialized-doc manifest.

Selective promotion commit:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Properties:

- direct parent: `e304d61286b9ca120db2dad695d29f4f1642e733`;
- one atomic promotion commit;
- exactly **36 changed files**;
- no merge commit;
- no divergent candidate history;
- latest central documentation from `main` preserved;
- no hosting/deployment change.

Verification-only PR #25 represented exactly that promotion diff, reported one commit / 36 changed files, and was closed **unmerged**.

## Exact promoted file set

### GitHub Actions — 3

1. `.github/workflows/stage13e-ai-operations.yml`
2. `.github/workflows/stage13e-frontend-prep.yml`
3. `.github/workflows/stage13e-integration.yml`

### Admin Web runtime/tests — 14

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

### API runtime — 6

18. `apps/api/src/ai/admin-operations-http.ts`
19. `apps/api/src/ai/admin-operations.ts`
20. `apps/api/src/ai/execution-repository.ts`
21. `apps/api/src/ai/job-lifecycle.ts`
22. `apps/api/src/ai/review-validation.ts`
23. `apps/api/src/app.ts`

### API tests / real fixtures — 8

24. `apps/api/tests/ai-admin-job-list-query-shape.test.ts`
25. `apps/api/tests/ai-admin-output-detail-snapshot.test.ts`
26. `apps/api/tests/ai-admin-pagination-bounds.test.ts`
27. `apps/api/tests/ai-admin-read-snapshots.test.ts`
28. `apps/api/tests/ai-admin-review-validation.test.ts`
29. `apps/api/tests/fixtures/stage13e-e2e-seed.ts`
30. `apps/api/tests/integration/ai-admin-action-authority.integration.test.ts`
31. `apps/api/tests/integration/ai-admin-operations.integration.test.ts`

### PostgreSQL — 1

32. `database/migrations/0018_ai_admin_review.sql`

### Specialized Stage13E documentation — 4

33. `docs/admin/STAGE13E_AI_OPERATIONS_FRONTEND_PREP.md`
34. `docs/ai/STAGE13E_ADMIN_AI_HTTP_VALIDATION.md`
35. `docs/ai/STAGE13E_ADMIN_AI_OPERATIONS.md`
36. `docs/ai/STAGE13E_ADMIN_AI_PERFORMANCE.md`

## Promotion exact-head verification

All workflows below completed **SUCCESS** on exact promotion SHA `d5ebc7f25a369430387a758c7c0bb89350963d67`:

| Gate | Run |
|---|---:|
| Stage13E Combined Integration | `34401502463` |
| Stage13E Admin AI Operations | `34401549935` |
| Stage13E Frontend Preparation | `34401549849` |
| Rebuild Stage Verification | `34401550016` |
| Stage13 Admin Product | `34401549835` |
| Stage9 Content Import | `34401549851` |
| Stage10 Media Pipeline | `34401549989` |
| OCR Foundation | `34401549910` |
| Stage11 AI Contracts | `34401549927` |
| Stage12 AI Execution | `34401549964` |
| Stage13D Content Ingestion | `34401550065` |
| Stage13D Admin Upload UI | `34401549903` |

Combined execution included real runner checkout/setup, API/Admin lint/type/unit/build, clean PostgreSQL migrations through `0018`, current DB contract assertions, Stage13E authority/review/concurrency regressions, isolated Stage12/auth regressions, real Super Admin bootstrap, deterministic DB fixtures and real Chromium Admin flows.

## Final integration

Immediately before integration, `main` was re-read and remained at the promotion base. `main` was then moved non-force/fast-forward to `d5ebc7f25a369430387a758c7c0bb89350963d67`.

Later documentation-only commits may advance `main`; they do not replace the executable runtime evidence attached to `d5ebc7f...`.

## Closed CI drift

`CI-013E-009` was fixed before candidate acceptance:

- standalone workflow shell quoting corrected;
- all current four review constraints asserted;
- intentionally removed redundant latest-review index no longer required;
- legitimate current index/DB checks preserved.

A subsequent Stage12 regression failure was correctly classified as suite state pollution and fixed by resetting/reapplying migrations between Stage13E and Stage12/auth groups. No production lifecycle behavior or test expectation was weakened.

## Result

Stage13E is **VERIFIED / PROMOTED / CLOSED**.

Stage13F Question Bank / Quiz Builder / Publish is **READY / NOT STARTED**.

Hosting/VPS remains outside current development scope until explicitly reopened.
