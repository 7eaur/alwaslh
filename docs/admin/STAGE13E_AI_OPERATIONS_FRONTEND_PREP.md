# Stage13E — Admin AI Operations / Review Frontend Binding

**Status:** combined Integration Candidate on `integration/stage13e-ai-operations`. Product/runtime code remains outside `main` and **NOT YET VERIFIED** because GitHub hosted jobs still terminate before checkout.

This document now reflects Single Owner integration work. Historical Frontend source commits remain evidence, but current authority is the combined branch + `PROJECT_EXECUTION_QUEUE.md` + Issue #16.

## 1. Authority boundary

Frontend remains presentation/interaction only. Backend + PostgreSQL remain canonical for:

- job/unit/attempt/output state;
- progress;
- lifecycle action eligibility;
- review eligibility;
- semantic validation;
- review concurrency/history;
- pagination totals/offsets.

The browser consumes `job.allowedActions` and `output.allowedReviewActions` exactly as returned by the server. A mutation `409 CONFLICT` causes canonical refresh; no optimistic lifecycle/review promotion exists.

Stage13E approval is review approval only and does not publish to Stage13F Question Bank.

## 2. Security / data minimization

The UI does not expose or retain:

- raw provider response;
- credentials / credential aliases;
- raw provider metadata;
- provider/internal error-message text.

Only `hasRawResponse`, safe operational identifiers/codes, normalized/effective reviewed educational output and source provenance are used.

The browser helper uses the real authenticated BrowserContext/session and documented Admin APIs only. There is no route interception, fake API, test-only Backend endpoint, cookie forgery or sleep-based race.

## 3. Production binding

Authenticated Stage13E transport uses:

- `GET /v1/admin/ai/jobs`;
- `GET /v1/admin/ai/jobs/:jobId`;
- `GET /v1/admin/ai/units/:unitId`;
- `GET /v1/admin/ai/outputs/:outputId`;
- `POST /v1/admin/ai/jobs/:jobId/pause|resume|cancel|retry`;
- `PATCH /v1/admin/ai/outputs/:outputId/review`.

Pagination parameters are server-owned and bounded:

- Jobs: `limit/offset`;
- Units: `unitLimit/unitOffset`;
- Attempts: `attemptLimit/attemptOffset`.

Review bodies remain strict discriminated union:

- edit requires `editedOutput`;
- approve sends no `editedOutput`;
- reject requires non-empty `note`.

## 4. Real session-expiry regression

`ai-operations.e2e.spec.mjs`:

1. signs in through the real UI;
2. opens AI Operations;
3. invalidates the same session through `POST /v1/auth/logout` using `page.context().request`;
4. triggers **تحديث الحالة**;
5. proves the UI returns to **دخول المدير** and authenticated navigation disappears.

## 5. Real stale-review 409 regression

`STAGE13E_E2E_RACE_JOB_TYPE` identifies a terminal execution job with an open approvable output.

The test:

1. resolves that output through real Stage13E reads;
2. opens it in the UI;
3. completes a terminal reject out-of-band through the real API using the same BrowserContext;
4. submits the now-stale UI approve;
5. proves real `409`, safe conflict feedback, canonical refresh to **مرفوض**, and no remaining review actions.

## 6. Durable-history pagination hardening — AI-013E-OPS-003

### Symptom

Backend already returned pagination metadata, but the Stage13E UI hard-coded and discarded it:

- first 30 jobs only;
- first 50 units only;
- first 50 attempts only.

Stage12 supports up to 5,000 units in one plan and durable attempt history can exceed one page. Therefore valid jobs/units/attempts could exist in PostgreSQL yet be unreachable from Admin UI.

### Root cause

Transport supported bounded server pagination, but Frontend view models/controller did not preserve `total/limit/offset`, and Workspace rendered no navigation controls.

### Correct fix

Server-side pagination is retained as canonical. Frontend now:

- preserves Jobs pagination metadata;
- preserves per-Job Unit pagination metadata;
- preserves per-Unit Attempt pagination metadata;
- renders Previous/Next controls with accessible navigation labels;
- clears only lower-level selection when a parent page changes;
- keeps polling/refresh on the currently selected server pages;
- never loads unbounded history into browser memory.

Main implementation lineage:

- `92f4d0f8d78697a717efc486420db336534bcc69` — pagination view contract/helpers;
- `8b932faa2d1989e5144e5ea29f84273511347736` — preserve API pagination in adapter;
- `0974142fd71c8cfd5c847c699f10e5ab9de51f7b` — controller/page-offset authority;
- `3411c1fdceae76fadb8ad3fad190b9fbe21f29d9` — Jobs/Units/Attempts navigation UI;
- `382726705724a2130381e7be9ec56bf54c4fc6dc` — responsive pagination layout;
- `3ab137c96bacaacd23191afc152c013ce46fec6d` — pagination boundary unit tests;
- `27de2d6f550508ac88eeacb355e3b6a0d9eff994` — adapter pagination regression;
- `8dd1d712f1bd644c332ea26c4cf3b3c989425fd1` — attempt pagination transport regression.

### Real-browser fixture

The combined fixture now seeds:

- Happy Job with **51 units**;
- its review unit with **51 durable attempt records**;
- one deliberately old Pagination Marker Job;
- 30 newer filler jobs so the marker is guaranteed onto the second Jobs page;
- existing Race fixture unchanged in purpose.

Fixture/workflow/browser commits:

- `66ac7bd31763c8313299a8179f7afe327b88ea55` — real pagination fixture;
- `a9e97e3470396edadab13e21ca76b3c71a68965f` — workflow fixture invariants;
- `c3420181380e0af4cff835504044b5b0c1df679f` — real Chromium Jobs/Units/Attempts navigation;
- `ae772db53e218037a2b140e9dc08e6528f1a1ac8` — explicit SQL casts/column aliases for deterministic fixture parsing.

The browser regression proves:

1. second Jobs page is reachable and contains the old marker;
2. Happy Job Unit page 2 exposes Unit 51;
3. selected review Unit Attempt page 2 exposes Attempt 1;
4. existing happy/review/session-expiry/409/390px flows remain in the same suite.

## 7. Current Chromium scenarios

With `STAGE13E_E2E=1` the combined suite now covers:

1. complete durable Jobs/Units/Attempts pagination;
2. login → pause/resume → approve → reload durability;
3. real session invalidation → signed-out state;
4. real stale-review `409` → canonical refresh/no actions;
5. 390×844 no-horizontal-overflow.

Required fixture environment:

- `STAGE13E_E2E_JOB_TYPE`;
- `STAGE13E_E2E_RACE_JOB_TYPE`;
- `STAGE13E_E2E_PAGINATION_JOB_TYPE`;
- Admin/API/origin variables from the combined workflow.

Missing required variables are hard failures, not silent skips.

## 8. Verification evidence

Latest pagination fixture/runtime HEAD at this documentation update:

`ae772db53e218037a2b140e9dc08e6528f1a1ac8`

Latest run:

- run `34249182219`;
- job `102138902680`;
- `runner_id=0`;
- `runner_name=""`;
- `steps=[]`;
- no checkout, lint, typecheck, unit, build, PostgreSQL or Chromium command executed.

Therefore this batch is **FIXED IN CANDIDATE / EXECUTION PENDING**, not PASS.

## 9. NOT YET VERIFIED

- current-head Admin lint/typecheck/unit/build;
- pagination fixture insertion on clean PostgreSQL;
- real Jobs/Units/Attempts Chromium navigation;
- existing happy/session-expiry/stale-409/390px paths on the latest head;
- same-head Stage13E Integration PASS.

## 10. Exact next action

Keep Stage13E outside `main`. Re-run the unchanged combined gate when a real runner is allocated. Any executed failure must be fixed in its owning layer with regression coverage. Combined PASS then triggers the wider regression matrix and Stage13E closure before Stage13F begins.
