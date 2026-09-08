# Stage13E — Admin AI Operations / Review Frontend Binding

**Status:** production Frontend binding implemented against the Backend Stage13E contract. Latest-head automated Frontend verification and combined Backend+Frontend Chromium remain **NOT YET VERIFIED** because GitHub hosted jobs are currently failing before checkout (`steps=[]`).

**Frontend branch:** `frontend/stage13e-ai-operations`

**Backend contract consumed:** `backend/stage13e-ai-operations` @ `348c02646d0ff873fd305beff16f41c46d9c0285`.

## 1. Authority boundary

Frontend is presentation and interaction only. PostgreSQL + Backend remain canonical for:

- job/unit/attempt/output state;
- `progressPercent` and all progress counts;
- pause/resume/cancel/retry eligibility;
- review eligibility;
- semantic validation and review concurrency;
- durable review history.

The browser consumes `job.allowedActions` and `output.allowedReviewActions` exactly as returned by the server. It never infers permissions from lifecycle enums. Mutation endpoints remain authoritative; `409 CONFLICT` triggers canonical refresh instead of an optimistic local transition.

## 2. Security / data-minimization boundary

The Stage13E Admin UI intentionally does **not** expose or retain:

- raw provider response;
- provider metadata/raw provider metadata;
- `credential_alias`;
- provider/internal error-message text.

Only `hasRawResponse`, safe operational identifiers, `errorCode`/`lastErrorCode`, normalized/reviewed educational output, validation data and source provenance are consumed.

Adapters also drop unexpected runtime `rawResponse` or `errorMessage` fields if they ever appear despite the server contract.

## 3. HTTP contract consumed

Authenticated Admin transport uses the existing shared `adminApiRequest` and these Backend-owned endpoints:

- `GET /v1/admin/ai/jobs`;
- `GET /v1/admin/ai/jobs/:jobId`;
- `GET /v1/admin/ai/units/:unitId`;
- `GET /v1/admin/ai/outputs/:outputId`;
- `POST /v1/admin/ai/jobs/:jobId/pause`;
- `POST /v1/admin/ai/jobs/:jobId/resume`;
- `POST /v1/admin/ai/jobs/:jobId/cancel`;
- `POST /v1/admin/ai/jobs/:jobId/retry`;
- `PATCH /v1/admin/ai/outputs/:outputId/review`.

Important exact read shapes:

- Job action authority lives at `job.allowedActions` in Job Detail; it is not duplicated in the list payload.
- Review authority lives at `output.allowedReviewActions`.
- Raw provider response is never returned; only `hasRawResponse` is returned.

## 4. Review mutation contract

Frontend emits only the strict Backend discriminated union:

```ts
type ReviewRequest =
  | { action: "edit"; editedOutput: AiGenerationOutput; note?: string }
  | { action: "approve"; note?: string }
  | { action: "reject"; note: string };
```

Behavior:

- edit works on the normalized/reviewed educational output only, never raw provider payload;
- reject requires a non-empty reason in the UI and on the server;
- approve sends no `editedOutput`;
- Stage11 semantic validation remains server authority;
- after success or `409`, Frontend reloads canonical job/unit/output state;
- Stage13E approval is explicitly presented as **review approval only** and does not publish to Stage13F Question Bank.

The transport strips presentation-only `quote: null` values before sending an edited output back into the strict Stage11 schema; meaningful nullable domain fields are preserved.

## 5. Runtime architecture

`AiOperationsPage.tsx` owns presentation/request state and maps network DTOs through `ai-operations-adapter.ts` into the workspace view model.

Implemented flow:

1. bounded initial jobs request (`limit=30`);
2. on-demand selected job detail;
3. on-demand selected unit attempts + output detail;
4. server-derived job/review action arrays;
5. bounded 5-second polling for the selected **non-terminal** job only;
6. no overlapping poll ticks;
7. canonical refresh after mutations/conflicts;
8. existing Admin session-expiry behavior reused.

No new state/caching library and no browser-owned durable lifecycle were introduced.

## 6. UX / accessibility / responsive behavior

The Admin shell now has an active **عمليات AI والمراجعة** destination.

The workspace includes:

- loading/error/retry/empty states;
- job/unit/detail loading states;
- mutation pending/success/conflict feedback;
- authoritative progress and effective/underlying status;
- jobs → units → attempts → output review hierarchy;
- provider/model/project/route/benchmark/token/cost/latency/error-code observability without secrets;
- validation issues and semantic warnings;
- page/media/checksum/OCR/source-asset provenance;
- normalized output rendering for all Stage11 output kinds;
- edit/approve/reject UI driven only by server action arrays;
- append-only review-history presentation;
- semantic buttons/progressbar/labels, visible text status, long-ID wrapping and RTL logical CSS;
- responsive collapse at desktop/tablet/mobile breakpoints.

A dedicated 390×844 Chromium assertion is prepared for the combined real-server fixture.

## 7. Regression coverage added

Unit/transport/adapter tests cover:

- using server `progressPercent` without browser recalculation;
- keeping `paused` separate from underlying `executionStatus`;
- action availability consumed only from server arrays;
- no raw provider output in the view model;
- no provider/internal error-message text in the view model;
- unexpected runtime raw/error fields are discarded;
- strict edit/approve/reject HTTP payload shapes;
- presentation-only `quote:null` is not sent into the strict Stage11 schema;
- `409` remains an explicit canonical-refresh signal;
- authenticated query paths/pagination parameters.

Prepared Chromium spec `apps/admin-web/e2e/ai-operations.e2e.spec.mjs` covers on a combined Stage13E fixture:

- Admin login;
- opening AI Operations;
- server-advertised pause/resume;
- unit/output review approval;
- terminal review actions disappearing;
- reload durability;
- 390px horizontal-overflow check.

When `STAGE13E_E2E=1`, a missing fixture causes a hard failure instead of a silent skip.

## 8. Verification / blocker record

Batch1 preparation was previously green on GitHub Actions run `34184228250` (lint, typecheck, 19/19 unit tests, build), but that evidence predates production binding.

All product-binding runs currently fail before repository checkout:

- run `34187450894` @ `79330380...`;
- run `34187905811` @ `afad78e...`;
- run `34188105821` @ `15827725...`;
- run `34188173087` @ `f649a9a...`.

Observed jobs have `steps=[]` / no executable steps. Re-running the first binding job produced the same result. No repository command executed, so this is **not** application PASS/FAIL evidence.

Root-cause record:

- **Symptom:** workflow concludes failure immediately without checkout/lint/typecheck/tests/build.
- **Root cause:** GitHub hosted runner provisioning did not allocate an executable runner/job; the same infrastructure condition is affecting Backend Stage13E.
- **Affected invariant:** current-head verification evidence only.
- **Blast radius:** latest Frontend lint/typecheck/unit/build and combined Chromium cannot be claimed.
- **Correct fix location:** runner infrastructure / future rerun, not product code or test weakening.
- **Regression protection:** unchanged quality gates and strict E2E fixture requirements remain enabled.

## 9. NOT YET VERIFIED

- current-head Frontend lint/typecheck/unit/build after production binding;
- real combined Backend+Frontend Stage13E Chromium flow;
- real browser `409` race/conflict refresh;
- real permission/error paths;
- 390px assertion against the combined server fixture;
- same-head cross-boundary Stage13E integration / Stage PASS.

## 10. Exact next action

When a GitHub runner executes jobs again, run the unchanged Frontend quality workflow on the latest product head. Then Integration must combine latest accepted Backend and Frontend Stage13E heads, seed the explicit AI fixture, run the prepared Chromium flow + 390px assertion and review same-head evidence before any Stage13E acceptance.
