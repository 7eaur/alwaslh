# Stage13E — Admin AI Operations / Review Contract

Status: Backend contract implemented on `backend/stage13e-ai-operations`; same-head GitHub Actions verification is currently blocked by hosted-runner provisioning and is therefore **NOT YET VERIFIED** for integration closure.

This document is the Frontend-facing contract for Stage13E. It builds on the existing Stage11 generation contracts and Stage12 durable execution/lifecycle. It does **not** create a second queue, browser-owned progress state, provider-specific execution contract, Question Bank persistence, or publication authority.

## 1. Authority boundaries

- PostgreSQL + Backend remain canonical for jobs, units, attempts, outputs, progress, pause/resume/cancel/retry, action availability and review history.
- All routes in this document are Admin-only and require a valid authenticated Admin session.
- Unsafe `/v1/*` requests continue to use the existing origin/CORS protection.
- The browser must not infer or persist canonical lifecycle/review state or action availability independently.
- Mutation endpoints remain authoritative even when a read model advertised an action moments earlier; a `409` requires refreshing canonical state.
- Stage13E review does not publish to Stage13F Question Bank and does not modify raw provider output in place.
- Admin edits/approvals remain subject to the same Stage11 semantic validation authority as provider-produced output. Human-review-only (`review_required`) findings may be accepted by Admin; semantic `invalid` findings may not.

## 2. Shared status/progress semantics

Job response fields expose both:

- `executionStatus`: underlying durable Stage12 job status: `queued | running | retrying | completed | failed | cancelled`.
- `status`: server-derived lifecycle status. For non-terminal jobs with `paused_at`, this is `paused`; otherwise it equals `executionStatus`.

`progress` is server-derived from durable unit rows and includes:

```ts
{
  totalUnits: number;
  acceptedUnits: number;       // completed + review_required
  completedUnits: number;
  reviewRequiredUnits: number;
  failedUnits: number;
  cancelledUnits: number;
  queuedUnits: number;
  runningUnits: number;
  retryingUnits: number;
  settledUnits: number;        // accepted + failed + cancelled
  remainingUnits: number;
  progressPercent: number;     // integer 0..100
}
```

The Frontend should refresh from the server after every mutation. While a job is non-terminal, bounded polling may be used by the client; there is no Stage13E streaming/SSE authority and no client-side lifecycle promotion.

## 3. List jobs

### Endpoint

`GET /v1/admin/ai/jobs`

### Authorization

Admin only.

### Query

```ts
{
  status?: "queued" | "running" | "retrying" | "completed" | "failed" | "cancelled" | "paused";
  jobType?: string;      // trimmed, 1..160 chars
  limit?: number;        // default 30, min 1, max 100
  offset?: number;       // default 0, min 0
}
```

### Response

```ts
{
  jobs: Array<{
    id: string;
    jobType: string;
    status: LifecycleStatus;
    executionStatus: ExecutionStatus;
    promptKey: string;
    promptVersion: string;
    requestedModel: string | null;
    priority: number;
    createdByProfileId: string | null;
    cancelRequestedAt: string | null;
    pausedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    progress: JobProgressWithoutIdentity;
  }>;
  pagination: { total: number; limit: number; offset: number };
}
```

Ordering is newest job first (`created_at DESC`, then id). `allowedActions` is intentionally a Job Detail field, not duplicated across the list payload.

## 4. Job detail + units

### Endpoint

`GET /v1/admin/ai/jobs/:jobId`

### Query

```ts
{
  unitLimit?: number;    // default 50, min 1, max 100
  unitOffset?: number;   // default 0, min 0
}
```

### Response

```ts
{
  job: JobListItem & {
    allowedActions: Array<"pause" | "resume" | "cancel" | "retry">;
  };
  units: Array<{
    id: string;
    jobId: string;
    unitKey: string;
    position: number;
    status: string;
    mode: string;
    subjectDomain: string;
    attemptCount: number;
    maxAttempts: number;
    nextAttemptAt: string | null;
    leaseExpiresAt: string | null;
    lastErrorCode: string | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    sourceProvenance: SourceProvenance[];
    latestAttempt: AttemptView | null;
    output: null | {
      id: string;
      validationStatus: string;
      reviewStatus: "pending" | "edited" | "approved" | "rejected";
      updatedAt: string;
    };
  }>;
  pagination: { total: number; limit: number; offset: number };
}
```

Unit ordering is deterministic by `position`, then id.

`allowedActions` is server-derived from the same `AiJobLifecycleRepository` authority used by mutations:

- non-terminal + not paused: `pause`, `cancel`;
- non-terminal + paused: `resume`, `cancel`;
- failed: `retry` only when there is at least one failed unit, no cancellation request exists, and no failed unit has reached the hard attempt ceiling (`attemptCount >= 20`);
- completed/cancelled, exhausted failed jobs, failed jobs with no failed units, or cancellation-requested failed jobs: no actions.

The array is advisory current-state authority, not a reservation. A concurrent worker/Admin mutation can make an advertised action invalid before use; mutation endpoints remain authoritative and may return `409`.

## 5. Unit detail + attempts

### Endpoint

`GET /v1/admin/ai/units/:unitId`

### Query

```ts
{
  attemptLimit?: number;   // default 50, min 1, max 100
  attemptOffset?: number;  // default 0, min 0
}
```

### Response

```ts
{
  unit: UnitView;
  attempts: AttemptView[];
  attemptPagination: { total: number; limit: number; offset: number };
}
```

`AttemptView`:

```ts
{
  id: string;
  attemptNumber: number;
  providerKey: string;
  providerProjectAlias: string | null;
  modelUsed: string;
  routeKey: string;
  benchmarkVersion: string;
  status: "running" | "completed" | "failed" | "cancelled";
  validationStatus: "pending" | "valid" | "invalid" | "review_required" | null;
  retryable: boolean | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  estimatedCostUsdMicros: number | null;
  errorCode: string | null;
  startedAt: string;
  completedAt: string | null;
}
```

Attempts are newest attempt number first.

### Secret boundary

The Admin contract intentionally does **not** expose:

- `credential_alias`;
- provider metadata/raw provider metadata;
- raw provider response;
- provider/internal error message text.

Only operationally useful non-secret identifiers and `errorCode` are exposed.

## 6. Source provenance

Every unit/output detail derives provenance from the canonical Stage11 request payload:

```ts
{
  mediaAssetId: string;
  pageNumber: number;
  inputChecksumSha256: string;
  inputKind: "approved_ocr" | "vision_fallback";
  ocrExtractionId: string | null;
  contentSourceAssetId: string | null;
}
```

The browser must display/use these values as provenance only; it does not rewrite the canonical request/source association.

## 7. Output detail

### Endpoint

`GET /v1/admin/ai/outputs/:outputId`

### Response

```ts
{
  output: {
    id: string;
    jobId: string;
    jobUnitId: string;
    unitKey: string;
    validationStatus: string;
    normalizedOutput: AiGenerationOutput | null;
    validationErrors: unknown;
    semanticWarnings: unknown;
    hasRawResponse: boolean;
    reviewStatus: "pending" | "edited" | "approved" | "rejected";
    allowedReviewActions: Array<"edit" | "approve" | "reject">;
    effectiveReviewedOutput: AiGenerationOutput | null;
    reviewedByProfileId: string | null;
    reviewedAt: string | null;
    sourceProvenance: SourceProvenance[];
    reviewHistory: ReviewEvent[]; // newest first, bounded to 100 events
    createdAt: string;
    updatedAt: string;
  }
}
```

`raw_response` is never returned; only `hasRawResponse` is exposed.

`effectiveReviewedOutput` semantics:

- no review: normalized output;
- latest action `edit`: edited review draft;
- latest action `approve`: approved reviewed output;
- latest action `reject`: `null`.

`allowedReviewActions` is also server-derived:

- after terminal `approve` or `reject`: `[]`;
- while review is open: `edit` and `reject` are available;
- `approve` is advertised only when the current candidate (latest edit, otherwise normalized output) passes the same Stage11 semantic authority used by the approve mutation (`valid` or `review_required`, never `invalid`).

The mutation remains authoritative; callers must refresh after any `409` rather than deriving a new review state locally.

## 8. Job controls

All control endpoints are Admin-only unsafe requests and return:

```ts
{ progress: AiJobProgress }
```

### Pause

`POST /v1/admin/ai/jobs/:jobId/pause`

- Allowed for non-terminal jobs.
- Repeating pause on an already paused non-terminal job is safe and returns current progress.
- Pause gates future claims; it does not invent a second lease mechanism or silently steal a valid in-flight Stage12 lease.
- Terminal `completed | failed | cancelled` -> `409 CONFLICT`.

### Resume

`POST /v1/admin/ai/jobs/:jobId/resume`

- Allowed for non-terminal jobs.
- Repeating resume when already unpaused is safe and returns current progress.
- Terminal jobs -> `409 CONFLICT`.

### Cancel

`POST /v1/admin/ai/jobs/:jobId/cancel`

- Allowed only while the job is non-terminal.
- Uses the existing Stage12 cancellation authority, including unit/attempt cleanup semantics.
- Cancellation clears `ai_jobs.paused_at` in the owning cancellation transaction, so a terminal cancelled job cannot retain a stale pause gate.
- `completed | failed | cancelled` -> `409 CONFLICT`.
- Cancellation is terminal; it is not reopened by retry.

### Retry failed job

`POST /v1/admin/ai/jobs/:jobId/retry`

- Allowed only when underlying job `executionStatus === "failed"`.
- Job must not have a cancellation request.
- At least one failed unit must exist.
- If any failed unit already has `attemptCount >= 20`, retry is rejected with `409` and state remains unchanged.
- Each failed unit is moved to `retrying` and receives exactly **one** additional allowed attempt (`maxAttempts = attemptCount + 1`).
- Historical `ai_execution_attempts` rows are preserved.
- Unit lease fields/resume route/error fields are cleared for the new retry attempt.
- Job returns to durable `retrying`; this is the existing Stage12 queue/lifecycle, not a new Admin queue.

## 9. Output review mutation

### Endpoint

`PATCH /v1/admin/ai/outputs/:outputId/review`

### Body

The HTTP body is a strict discriminated union:

```ts
type ReviewRequest =
  | {
      action: "edit";
      editedOutput: AiGenerationOutput;
      note?: string; // trimmed, max 4000 chars
    }
  | {
      action: "approve";
      note?: string; // trimmed, max 4000 chars
    }
  | {
      action: "reject";
      note: string; // trimmed, non-empty, max 4000 chars
    };
```

Contract implications:

- `approve` with `editedOutput` -> `400 BAD_REQUEST`;
- `edit` without a non-`undefined` `editedOutput` -> `400 BAD_REQUEST`;
- `reject` with missing or blank-after-trim `note` -> `400 BAD_REQUEST`;
- unknown extra fields are rejected with `400 BAD_REQUEST` for every variant;
- rejected request bodies do not create review events.

### Shared semantic guard

The review mutation locks the owning `ai_outputs` row, reads the canonical `ai_job_units.input_payload`, and applies the existing Stage11 `validateAiGenerationOutput` authority **inside the same transaction before writing a review event**.

- `invalid` semantic validation is never review-approvable.
- `review_required` is allowed to proceed because Stage13E Admin review is the human-review authority requested by those findings/modes.
- This prevents a schema-valid manual edit from bypassing source provenance, requested-count, answer-shape, notation, duplicate, exact-source and related Stage11 rules.

### Edit

- `editedOutput` is required.
- It must match the Stage11 `AiGenerationOutput` schema.
- If the stored normalized output is schema-valid, edit cannot change its output `kind`.
- It is then revalidated against the canonical Stage11 request; semantic `invalid` -> `400 BAD_REQUEST` and no review revision is written.
- A semantic `valid` or `review_required` edit creates a new append-only review revision.
- It does not mutate `raw_response` or `normalized_output`.

### Approve

- Uses the latest edited draft when one exists; otherwise uses the stored normalized output.
- The selected candidate is revalidated against the canonical Stage11 request in the same locked transaction.
- Semantic `invalid` (including schema-invalid) -> `409 CONFLICT`; no terminal approval event is written.
- `valid` and `review_required` candidates are approvable by Admin.
- Creates a terminal `approve` review event.
- Stage13E approval **does not publish** the result into Question Bank/Stage13F.

### Reject

- A non-empty `note` is required; missing/blank reason -> `400`.
- Creates a terminal `reject` review event with no reviewed output payload.
- `effectiveReviewedOutput` becomes `null`.

### Review concurrency / audit

- Review mutation locks the owning `ai_outputs` row before deciding the next revision or semantic candidate.
- Review history is append-only in `ai_output_review_events`.
- `(ai_output_id, revision)` is unique in PostgreSQL.
- Once latest action is `approve` or `reject`, any later edit/approve/reject returns `409`.
- Concurrent terminal review requests serialize; at most one succeeds.
- Actor profile, revision, action, reviewed output (where applicable), note and timestamp are durable.

## 10. Error contract

All errors use the existing public envelope:

```ts
{ error: { code: string; message: string } }
```

Expected Stage13E HTTP classes:

- `400 BAD_REQUEST`: invalid UUID/query/body, pagination outside bounds, ambiguous/extra review fields, missing edit payload, missing/blank reject reason, invalid edited output shape/kind, or semantically invalid Admin edit.
- `401 UNAUTHORIZED`: no valid session.
- `403 FORBIDDEN`: authenticated non-Admin caller or origin policy rejection.
- `404 NOT_FOUND`: unknown job/unit/output.
- `409 CONFLICT`: lifecycle action not allowed in current state, retry attempt ceiling, no retryable failed unit, semantically invalid approval candidate, or invalid/finished review transition.
- `500 INTERNAL_ERROR`: stored durable data violates a Backend invariant/contract.

Frontend must not convert a `409` into a local optimistic state transition; refresh canonical server state instead.

## 11. PostgreSQL additions

Migration: `database/migrations/0018_ai_admin_review.sql`

Adds:

- enum `ai_output_review_action ('edit','approve','reject')`;
- append-only `ai_output_review_events`;
- FK to `ai_outputs` and actor `profiles`;
- unique `(ai_output_id, revision)`;
- DB payload-shape and note-length constraints;
- latest-output and actor audit indexes.

No Stage12 lifecycle table is duplicated.

## 12. Security / performance notes

- List/detail pagination is bounded to 100 rows.
- Job/unit list responses do not include large raw provider payloads.
- Attempt observability intentionally omits credentials and provider metadata.
- Output detail returns normalized/reviewed educational data but never raw provider response.
- Provider/network calls are not introduced in Admin DB transactions.
- Review mutation is a short DB transaction and locks only the reviewed `ai_outputs` row while deriving and validating the candidate.
- Action availability is derived from durable server state; no presentation strings or browser authority are persisted.

## 13. Verification state

Implemented test/workflow coverage includes intended checks for:

- Admin-only authorization and anonymous rejection;
- bounded pagination;
- credential/provider metadata/raw response non-leakage;
- source page/checksum provenance;
- edit/approve/reject persistence;
- review race serialization;
- semantic Admin review guard: valid edit accepted, Stage11 `invalid` edit rejected, `review_required` candidate approvable by Admin, invalid approval rejected;
- exact strict review-body matrix (`approve + editedOutput`, missing edit output, missing/blank reject reason, unknown fields) with no review-event side effects;
- server-derived job action availability, including paused/resumed/cancelled state and retry exclusion for attempt ceiling/cancellation/no failed units;
- server-derived output review actions and empty actions after terminal approve/reject;
- failed-job retry history + one-attempt extension + hard ceiling;
- pause/resume/cancel behavior including `pause -> cancel` clearing `paused_at`;
- Stage12 durable execution/capacity/control/lifecycle regressions;
- auth security regression;
- clean migrations/schema assertions;
- lint/typecheck/unit/build.

Current blocker: the initial Stage13E CI run `34184515829` allocated a runner and exposed Biome formatting/import hygiene; that source issue was fixed in `0b617538c84c4722c289ddbf6186d12c5ab6c27b` without weakening CI. Subsequent runs/attempts repeatedly failed before any hosted runner was provisioned. Integration Review confirmed run `34186560937` on `27da24b8...` was also infrastructure-blocked before checkout (`runner_id=0`, empty runner name, `steps=[]`).

The new action-authority/strict-body regression is wired into the unchanged Stage13E full workflow; its execution result on the latest head must still be established. Therefore latest-head lint/typecheck/unit/build, clean migration, Stage13E integration and Stage12/auth regression execution remain **NOT YET VERIFIED** until a runner actually executes the workflow, and Stage13E is **not yet Ready for integration**.

## 14. Explicit non-goals / still open

- Stage13F Question Bank persistence/publication: not implemented here.
- Live production provider adapter/benchmark/bootstrap: NOT YET VERIFIED.
- Deployment: not part of this Stage13E command.
- Frontend visual/UX decisions: owned by Frontend; this document supplies server authority and transport semantics only.
