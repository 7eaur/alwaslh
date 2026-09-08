# Stage13E — Admin AI Operations / Review Frontend Binding

**Status:** production binding is an Integration Candidate. The bounded browser-regression preparation requested by the latest Integration Review is implemented. Current-head quality gates and real combined Chromium execution remain **NOT YET VERIFIED** because GitHub hosted jobs still fail before checkout.

**Frontend branch:** `frontend/stage13e-ai-operations`

**Latest bounded browser-regression commits:**

- `ab12430acf1fbed6b10577fb2afd66d3286e8b81` — `test(admin): cover Stage13E auth expiry and review conflict`;
- `7bf2f8c32907032551aace9f3aa27681040c4b0f` — `test(admin): add real Stage13E E2E API helper`.

## 1. Authority boundary

Frontend remains presentation/interaction only. Backend + PostgreSQL remain canonical for job state, progress, action eligibility, review eligibility, semantic validation, review concurrency and durable review history.

The browser consumes `job.allowedActions` and `output.allowedReviewActions` exactly as returned by the server. A mutation `409 CONFLICT` causes canonical refresh; no optimistic lifecycle/review promotion is performed.

## 2. Security / data-minimization boundary

The UI does not expose or retain raw provider response, credentials, provider metadata or provider/internal error-message text. Only `hasRawResponse`, safe operational identifiers/codes, normalized/effective reviewed educational output and source provenance are used.

The real-browser regression helper follows the same rule: it uses only documented Admin APIs and the already-authenticated browser session. It introduces no mock route, request interception, fake API, test-only product endpoint or browser-owned authority.

## 3. Existing production binding

Authenticated Stage13E transport uses the shared Admin session/origin behavior for:

- `GET /v1/admin/ai/jobs`;
- `GET /v1/admin/ai/jobs/:jobId`;
- `GET /v1/admin/ai/units/:unitId`;
- `GET /v1/admin/ai/outputs/:outputId`;
- `POST /v1/admin/ai/jobs/:jobId/pause|resume|cancel|retry`;
- `PATCH /v1/admin/ai/outputs/:outputId/review`.

Review bodies remain the strict discriminated union: edit requires `editedOutput`, approve sends no `editedOutput`, reject requires non-empty `note`.

Stage13E approval is review approval only and does not publish to Stage13F Question Bank.

## 4. Bounded browser-regression preparation

The existing happy/reload/390px flow is preserved unchanged in intent. Two deterministic real-backend paths were added.

### 4.1 Real session expiry / auth boundary

`ai-operations.e2e.spec.mjs` now:

1. authenticates the seeded Admin through the real UI;
2. opens AI Operations;
3. invalidates the same real session through `POST /v1/auth/logout` using `page.context().request`, which shares the browser context cookies;
4. triggers the normal **تحديث الحالة** UI action;
5. proves the Stage13E request follows existing session-expiry handling back to **دخول المدير** and removes the signed-in Admin navigation.

No cookie is manually edited and no network response is mocked.

### 4.2 Real 409 stale-review race

A separate fixture is required via:

`STAGE13E_E2E_RACE_JOB_TYPE`

Integration must seed that job so it is:

- a real Admin AI job visible in the first bounded job/detail page;
- terminal at the execution layer (`completed | failed | cancelled`) so background polling cannot erase the stale UI state during the race;
- contains an open output whose server `allowedReviewActions` includes `approve`.

The test then:

1. authenticates normally;
2. resolves the exact output through real Stage13E reads using the same browser session;
3. opens the matching unit/output in the UI and confirms the server-advertised approve button is present;
4. completes a terminal `reject` out-of-band through the real `PATCH .../review` endpoint using the same browser context;
5. submits the now-stale UI approve action;
6. proves the browser receives the real `409`, shows the existing safe conflict feedback, refreshes canonical state, renders **مرفوض**, and exposes no remaining approve/reject actions.

The helper fails immediately with a fixture-contract message if the race job is missing, non-terminal or lacks an open approvable output. It does not use sleeps/timeouts to manufacture the race.

## 5. Real E2E helper contract

New file: `apps/admin-web/e2e/stage13e-real-api.mjs`.

It uses `page.context().request`, which shares the BrowserContext cookie jar, against the real API base. Defaults:

- `STAGE13E_E2E_API_BASE_URL=http://127.0.0.1:3000`;
- `STAGE13E_E2E_ADMIN_ORIGIN=http://127.0.0.1:5175`.

Unsafe requests send the real Admin origin and JSON content type. Non-2xx or non-JSON contract failures are surfaced as hard test failures with bounded response text.

No Backend/product contract was changed for this regression batch.

## 6. Chromium scenarios now prepared

With `STAGE13E_E2E=1`, the suite prepares four real-browser scenarios:

1. login → AI workspace → pause/resume → approve → reload durability;
2. real session invalidation → Stage13E refresh → signed-out/login state;
3. real out-of-band terminal review → stale UI approve → `409` canonical refresh/no actions;
4. 390×844 no-horizontal-overflow assertion.

Required fixture environment:

- `STAGE13E_E2E_JOB_TYPE` — existing happy/390px fixture;
- `STAGE13E_E2E_RACE_JOB_TYPE` — separate terminal/open-review race fixture;
- optional Admin/API/origin overrides documented above.

Missing required fixture variables are hard failures when Stage13E E2E is enabled, not silent skips.

## 7. Verification evidence

Latest browser-regression product HEAD: `7bf2f8c32907032551aace9f3aa27681040c4b0f`.

GitHub Actions run `34189236669` on that HEAD concluded failure before checkout. Job `101943693820` has no executable steps (`steps=null`). Therefore no repository lint/typecheck/unit/build command ran on this HEAD, and the workflow conclusion is not product-code PASS/FAIL evidence.

The same hosted-runner provisioning condition existed before this bounded batch. No test was weakened or skipped to work around it.

A local syntax-only `node --check` of the new real-API helper passed; this is not a substitute for repository quality gates or Chromium execution.

## 8. Root-cause record

**Symptom:** current Frontend workflow finishes failure immediately without checkout or repository commands.

**Root cause:** hosted runner provisioning has not allocated an executable runner; latest job exposes no steps.

**Affected flow/contract:** verification evidence only. No Stage13E runtime defect is established by this failure.

**Blast radius:** current-head lint/typecheck/unit/build and combined real Chromium remain unverified.

**Correct fix location:** hosted-runner infrastructure / unchanged workflow rerun. Product behavior, test assertions, timeouts and fixture strictness must not be weakened.

**Regression protection:** the new auth-expiry and 409 race tests use real session/API state and hard fixture preconditions, preserving the exact production boundary Integration requested.

## 9. NOT YET VERIFIED

- latest-head Frontend lint/typecheck/unit/build;
- real execution of all four Stage13E Chromium scenarios on a seeded combined Backend+Frontend head;
- actual session-expiry browser result;
- actual 409 stale-review browser result;
- actual 390px result;
- same-head Stage13E Integration / Stage PASS.

**Ready for integration:** **NO** until executable quality gates run green.

## 10. Exact next action

Integration should seed both Stage13E fixtures, set `STAGE13E_E2E=1`, run the unchanged combined Chromium suite and same-head quality gates when runner allocation works, then issue the next Integration Review. Frontend should change product/test code only if that real execution exposes a reproducible defect.
