# Stage13E — Admin AI Operations / Review Frontend Binding

**Status:** combined Integration Candidate on `integration/stage13e-ai-operations`. Product/runtime code remains outside `main` and **NOT YET VERIFIED** because GitHub hosted jobs still terminate before checkout.

Current authority is the combined branch + `PROJECT_EXECUTION_QUEUE.md` + Issue #16. Historical Frontend source commits remain evidence only.

## 1. Authority boundary

Frontend remains presentation/interaction only. Backend + PostgreSQL remain canonical for:

- job/unit/attempt/output state;
- progress and lifecycle actions;
- review eligibility/current review state;
- semantic validation and concurrency;
- pagination totals/offsets and append-only review history.

The browser consumes `job.allowedActions` and `output.allowedReviewActions` exactly as returned by the server. `409 CONFLICT` triggers canonical refresh. No optimistic lifecycle/review promotion exists.

**Important:** a paginated historical review page is never review authority. Current review status/output/actions always come from the Backend's independently resolved latest revision.

Stage13E approval is review approval only; it does not publish to Stage13F Question Bank.

## 2. Security / data minimization

The UI does not expose or retain raw provider response, credential aliases, provider metadata, or provider/internal error-message text. Only safe operational identifiers/codes, normalized/effective reviewed educational output, `hasRawResponse`, and provenance are used.

Browser regressions use the real authenticated BrowserContext and documented Admin APIs only. No request interception, fake API, test-only Backend endpoint, cookie forgery, or sleep-based race.

## 3. Production binding

Authenticated Stage13E transport:

- `GET /v1/admin/ai/jobs` — `limit/offset`;
- `GET /v1/admin/ai/jobs/:jobId` — `unitLimit/unitOffset`;
- `GET /v1/admin/ai/units/:unitId` — `attemptLimit/attemptOffset`;
- `GET /v1/admin/ai/outputs/:outputId` — `reviewLimit/reviewOffset`;
- `POST /v1/admin/ai/jobs/:jobId/pause|resume|cancel|retry`;
- `PATCH /v1/admin/ai/outputs/:outputId/review`.

All server page sizes are bounded to 100. Admin UI uses 30 Jobs, 50 Units, 50 Attempts, and 50 Review Events per page.

Review mutation bodies remain strict: edit requires `editedOutput`; approve sends no edited output; reject requires nonblank note.

## 4. Real auth and conflict regressions

### Session expiry

Real UI login → AI Operations → same BrowserContext `POST /v1/auth/logout` → UI refresh → returns to **دخول المدير** and removes signed-in navigation.

### Stale-review 409

A separate terminal/open-review fixture is mutated out-of-band with a real reject. The stale UI approve then receives real `409`, refreshes to **مرفوض**, and exposes no further review actions.

## 5. AI-013E-OPS-003 — complete Jobs / Units / Attempts history

### Root defect

Backend already returned pagination metadata, but Frontend exposed only first 30 Jobs / 50 Units / 50 Attempts. Durable operational records beyond those first pages were unreachable.

### Fix

Frontend preserves independent server offsets and renders accessible Previous/Next controls. Changing a parent page clears only lower-level selection; polling/refresh remain on currently opened pages; no unbounded history is loaded.

Real fixture proves:

- second Jobs page contains a deliberately old marker;
- Happy Job has 51 Units, exposing Unit 51 on page two;
- review Unit has 51 Attempts, exposing Attempt 1 on page two.

## 6. AI-013E-OPS-004 — complete Review History without historical-page authority

### Symptom

`GET /v1/admin/ai/outputs/:outputId` originally returned only the newest 100 review events and Frontend displayed them as the entire append-only audit. There was no total/offset navigation.

### Root cause

Review history was modeled as a bounded display array instead of durable paginated audit state. Also, Backend originally derived `reviewStatus`, effective output, and allowed actions from `history[0]`; simply adding `offset` would make an old page incorrectly define current authority.

### Root fix

Backend now returns:

```ts
reviewHistory: ReviewEvent[];
reviewPagination: { total: number; limit: number; offset: number };
```

and independently resolves the canonical latest review revision. The selected audit page never drives current status/output/actions.

Frontend now:

- preserves `reviewPagination` through API → adapter → view model;
- maintains `reviewOffsetRef` independently from Job/Unit/Attempt offsets;
- renders accessible `صفحات سجل مراجعة مخرج AI` navigation;
- preserves both Attempt and Review pages during background polling, refresh, and 409 canonical reload;
- resets review page only when changing the selected Unit;
- shows total review event count rather than current-page length;
- displays revision number with each audit event.

Implementation/test lineage for this root fix:

- `d242e0542df4402392780098418cdd015cb11107` — Backend paged history + canonical-latest separation;
- `f04fe2beeff79dea0353f69fbe5e2774fe5703ea` — bounded HTTP `reviewLimit/reviewOffset`;
- `e33d43c19c8b954429036bba24ca0f3c72d0ba15` — 105-revision Backend regression proving old page cannot redefine authority;
- `9c18826acbc8f2deeb42f70b2e0f651321504f94` — Frontend transport contract;
- `2c82e8790b066a2ac035f8eee8c172136a0ed28a` — view model pagination;
- `72711ec8aaefc09fa4e2979008b0be03beb526c3` — adapter preservation;
- `de3a9dc260871ab913bd9d60350479b60de708b9` — independent controller review offset;
- `bf782c92bd74436831e74391768c53c9cd9cb075` — Review History navigation UI;
- `d7830d187e89bb16619234609f8480c5bec070cf` — transport regression;
- `f64419fa20c930ac0bbd641ba63c229dc9db9605` — adapter regression;
- `a1ef3d7a824d1e8c7503ecb3203df3bebe850619` — real fixture with 101 review edits;
- `f95c1a9ee5e800125bdcc665c5a64d0fe10a1fd9` — real Chromium audit navigation/current-authority regression;
- `6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b` — workflow fixture invariants.

### Real Chromium contract

Happy fixture contains 101 append-only edit revisions. Browser proves:

1. review pages `1–50`, `51–100`, and `101–101` are reachable;
2. revision 1 note is visible on the oldest page;
3. while the oldest page is displayed, **اعتماد بعد المراجعة** remains governed by the canonical latest revision and stays valid;
4. approving adds revision 102, removes further actions, and current old-page range becomes `101–102 من 102`;
5. reload restores canonical approved state and first review page.

## 7. Current real Chromium suite

With `STAGE13E_E2E=1`:

1. Jobs/Units/Attempts complete pagination;
2. Review History >100 complete pagination + latest-authority isolation;
3. pause/resume + approve + reload durability;
4. real session expiry;
5. real stale-review `409` canonical refresh;
6. 390×844 horizontal-overflow guard.

Required variables are explicit in the combined workflow and missing fixtures fail hard.

## 8. Verification evidence

Current runtime/test candidate HEAD before this documentation commit:

`6a9e9df01ecdab8a6298f0a47c05001d4cb8dd6b`

Latest run:

- run `34275316004`;
- job `102226771007`;
- `runner_id=0`;
- `runner_name=""`;
- `steps=[]`;
- no checkout/lint/typecheck/unit/build/PostgreSQL/Chromium command executed.

Therefore OPS-003 and OPS-004 are **FIXED IN CANDIDATE / EXECUTION PENDING**, not executable PASS.

## 9. NOT YET VERIFIED

- current-head Admin/API lint/typecheck/unit/build;
- 101-review fixture insertion on clean PostgreSQL;
- real Review History >100 Chromium navigation and latest-authority isolation;
- existing Jobs/Units/Attempts, session-expiry, stale-409, pause/resume, approval/reload and 390px flows on current head;
- same-head Stage13E Integration PASS.

## 10. Exact next action

Keep Stage13E outside `main`. Re-run the unchanged combined gate when GitHub allocates a real runner. Any executed failure must be root-caused in its owning layer with regression coverage. Only combined PASS + wider same-head regressions may close Stage13E and unblock Stage13F.
