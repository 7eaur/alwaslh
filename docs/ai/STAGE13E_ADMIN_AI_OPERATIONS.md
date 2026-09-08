# Stage13E — Admin AI Operations / Review Contract

Status: **COMBINED INTEGRATION CANDIDATE / NOT YET VERIFIED**.

Current combined branch is documented in `PROJECT_EXECUTION_QUEUE.md` and `PROJECT_INTEGRATION_CONTINUITY.md`. Stage13E extends the verified Stage11 generation contracts and Stage12 durable execution lifecycle. It does **not** create a second queue, browser-owned progress authority, provider-specific execution contract, Question Bank persistence, or publication authority.

## 1. Authority boundaries

- PostgreSQL + Backend own jobs, units, attempts, outputs, progress, pause/resume/cancel/retry, action availability and review history.
- All `/v1/admin/ai/*` routes are authenticated Admin-only.
- Unsafe requests keep the existing origin/CORS protection.
- Browser must not infer canonical lifecycle/review state or action availability independently.
- Mutation endpoints are authoritative even if an earlier read advertised an action; `409` means refresh canonical state.
- Stage13E review does not publish into Stage13F Question Bank and does not mutate raw provider output in place.
- Admin edits/approvals pass the same Stage11 semantic authority as provider output.
- `review_required` may be accepted by the human Admin review authority; semantic `invalid` may not.

## 2. Job lifecycle / progress

Execution status remains Stage12:

`queued | running | retrying | completed | failed | cancelled`

Admin lifecycle view additionally exposes `paused` when a non-terminal job has `paused_at`.

Server-derived progress contains:

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
  settledUnits: number;
  remainingUnits: number;
  progressPercent: number;     // 0..100
}
```

Frontend refreshes from server after mutations. Bounded polling is presentation only; no client-side lifecycle promotion exists.

## 3. List jobs

`GET /v1/admin/ai/jobs`

Admin only.

Query:

```ts
{
  status?: "queued" | "running" | "retrying" | "completed" | "failed" | "cancelled" | "paused";
  jobType?: string; // trimmed 1..160
  limit?: number;   // default 30, 1..100
  offset?: number;  // default 0
}
```

Response:

```ts
{
  jobs: JobListItem[];
  pagination: { total: number; limit: number; offset: number };
}
```

Jobs are ordered `created_at DESC, id DESC`. `allowedActions` is intentionally a detail field.

## 4. Job detail / server action authority

`GET /v1/admin/ai/jobs/:jobId`

Query: `unitLimit` default 50/max 100, `unitOffset` default 0.

Response:

```ts
{
  job: JobListItem & {
    allowedActions: Array<"pause" | "resume" | "cancel" | "retry">;
  };
  units: UnitView[];
  pagination: { total: number; limit: number; offset: number };
}
```

Server rules:

- non-terminal, unpaused → `pause`, `cancel`;
- non-terminal, paused → `resume`, `cancel`;
- failed → `retry` only if at least one failed unit exists, no cancellation request exists and no failed unit reached `attemptCount >= 20`;
- completed/cancelled/exhausted failed/no-failed-unit/cancellation-requested failed → no actions.

The array is current-state advice, not a reservation; concurrent state change may still make the mutation return `409`.

## 5. Unit detail / attempts

`GET /v1/admin/ai/units/:unitId`

Query: `attemptLimit` default 50/max 100, `attemptOffset` default 0.

Response:

```ts
{
  unit: UnitView;
  attempts: AttemptView[];
  attemptPagination: { total: number; limit: number; offset: number };
}
```

Attempts newest first.

Operational fields include provider key, project alias, model, route, benchmark, validation status, retryability, token counts, latency, cost micros and safe error code.

### Secret boundary

The Admin contract never exposes:

- `credential_alias`;
- provider/raw provider metadata;
- raw provider response;
- provider/internal error-message text.

## 6. Provenance

Unit/output detail derives source provenance from canonical Stage11 request payload:

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

Browser displays provenance but never rewrites the canonical source association.

## 7. Output detail / review action authority

`GET /v1/admin/ai/outputs/:outputId`

Important fields:

```ts
{
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
  reviewHistory: ReviewEvent[]; // newest first, max 100
}
```

`raw_response` is never returned; only `hasRawResponse`.

Effective reviewed output:

- pending → normalized output;
- latest edit → edited draft;
- approve → approved candidate;
- reject → `null`.

Review actions:

- terminal approve/reject → `[]`;
- open review → edit + reject;
- approve only when current candidate passes Stage11 semantic authority (`valid` or `review_required`, never `invalid`).

## 8. Job controls

All are Admin-only unsafe requests and return `{ progress: AiJobProgress }`.

### Pause

`POST /v1/admin/ai/jobs/:jobId/pause`

- non-terminal only;
- repeated pause is safe;
- gates future claims without stealing an active Stage12 lease;
- terminal → `409`.

### Resume

`POST /v1/admin/ai/jobs/:jobId/resume`

- non-terminal only;
- repeated resume is safe;
- terminal → `409`.

### Cancel

`POST /v1/admin/ai/jobs/:jobId/cancel`

- non-terminal only;
- reuses Stage12 cancellation authority;
- atomically clears `paused_at`;
- cancellation is terminal and cannot be reopened by retry;
- terminal → `409`.

### Retry

`POST /v1/admin/ai/jobs/:jobId/retry`

- only underlying `failed` job;
- no cancellation request;
- at least one failed unit;
- any failed unit at `attemptCount >= 20` rejects retry with `409` and no mutation;
- each failed unit gets exactly one new allowed attempt: `maxAttempts = attemptCount + 1`;
- historical attempts remain intact;
- lease/resume/error fields clear for the new retry;
- job returns to existing durable Stage12 `retrying` state.

## 9. Review mutation

`PATCH /v1/admin/ai/outputs/:outputId/review`

Strict discriminated HTTP union:

```ts
type ReviewRequest =
  | { action: "edit"; editedOutput: AiGenerationOutput; note?: string }
  | { action: "approve"; note?: string }
  | { action: "reject"; note: string };
```

Rules:

- approve + `editedOutput` → `400`;
- edit without `editedOutput` → `400`;
- reject missing/blank-after-trim note → `400`;
- unknown fields → `400`;
- rejected request bodies create no review event.

### Shared semantic guard

Review transaction:

1. locks owning `ai_outputs` row;
2. reads canonical `ai_job_units.input_payload`;
3. chooses normalized/latest-edited candidate;
4. executes Stage11 `validateAiGenerationOutput` inside the same transaction;
5. writes append-only review revision only if allowed.

This prevents schema-valid human edits from bypassing provenance, requested count, answer shape, notation, duplicate, exact-source and other Stage11 rules.

### Edit

- output must match Stage11 schema;
- cannot change output `kind` when stored normalized output is schema-valid;
- semantic `invalid` → `400`, no revision;
- `valid` or `review_required` → append edit revision;
- raw/normalized provider output remains untouched.

### Approve

- uses latest edit, otherwise normalized output;
- candidate revalidated inside locked transaction;
- schema/semantic invalid → `409`, no terminal revision;
- `valid` and `review_required` are approvable by Admin;
- creates terminal approve event;
- does **not** publish to Question Bank.

### Reject

- non-empty reason required;
- creates terminal reject event with no reviewed output;
- `effectiveReviewedOutput = null`.

### Concurrency / audit

- owning output row is locked before next revision decision;
- `(ai_output_id, revision)` is unique;
- after approve/reject all later review mutations return `409`;
- concurrent terminal requests serialize and at most one succeeds;
- actor/revision/action/output/note/timestamp are durable.

## 10. Error contract

Existing envelope:

```ts
{ error: { code: string; message: string } }
```

Expected classes:

- `400 BAD_REQUEST`: invalid params/query/body, strict-union violation, missing edit output/reject reason, invalid edited shape/kind or semantic edit failure;
- `401 UNAUTHORIZED`: no valid session;
- `403 FORBIDDEN`: non-Admin or origin-policy failure;
- `404 NOT_FOUND`: unknown resource;
- `409 CONFLICT`: stale/illegal lifecycle action, retry ceiling/no failed unit, invalid approval candidate or finished review;
- `500 INTERNAL_ERROR`: durable data violates stored contract/invariant.

Frontend must refresh canonical state on `409`, not invent an optimistic replacement state.

## 11. PostgreSQL authority

Migration: `database/migrations/0018_ai_admin_review.sql`.

Adds:

- enum `ai_output_review_action ('edit','approve','reject')`;
- append-only `ai_output_review_events`;
- FK to `ai_outputs` and actor `profiles`;
- unique `(ai_output_id, revision)`;
- payload-shape constraint;
- note length `<= 4000`;
- **durable reject-reason constraint**: reject requires non-null, nonblank `note` at the database boundary;
- actor/time audit index.

The unique `(ai_output_id, revision)` btree also serves latest-revision lookup with a backward scan. A separate duplicate latest-output index was removed during static audit.

### Static audit finding — AI-013E-DB-001

**Severity:** P1 Data/Audit integrity.

**Symptom:** HTTP/service rejected missing or blank reject reasons, but the original migration allowed a direct/future DB writer to persist `action='reject'` with `note IS NULL` or whitespace.

**Root cause:** a durable business/audit invariant existed only at caller validation, not at PostgreSQL authority.

**Blast radius:** any future writer bypassing the current HTTP service could create an incomplete terminal rejection audit event.

**Fix location:** PostgreSQL migration `0018`, because reject-reason presence is a durable row invariant independent of transport.

**Fix:** `ai_output_review_events_reject_note_required` check constraint; redundant latest-output index removed.

**Regression:** `ai-admin-action-authority.integration.test.ts` directly attempts NULL and blank reject inserts and expects the DB constraint to reject both, while existing HTTP 400 coverage remains.

**Execution state:** code/migration/test changes exist on the combined branch but remain `NOT YET VERIFIED` because current GitHub hosted jobs terminate before checkout.

## 12. Security / performance

- pagination bounded to 100;
- list/detail avoid raw provider payloads;
- credentials/provider metadata/internal error text are excluded;
- provider/network calls are not introduced in Admin transactions;
- review transaction is short and row-scoped;
- action availability is server-derived;
- no second lifecycle/queue;
- no duplicate latest-review index beyond the unique revision index.

## 13. Verification contract

Combined Stage13E workflow is expected to execute:

1. API lint/typecheck/unit/build;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + Stage13E DB contract;
4. Admin authorization/secret/provenance/review/action/retry/race integration tests;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth regression;
7. fresh DB reset;
8. real Admin bootstrap + deterministic Stage13E fixtures;
9. real Chromium happy path, pause/resume, approve/reload, session expiry, stale-review 409 and 390px.

Latest combined HEAD after the durable reject-reason static-audit fix:

`bc1bf508897796d0a74d22126094e83180b7ec79`

Latest run:

`34197629003`

Job:

`101968795653`

Observed: job ended before checkout with no executable steps. Therefore the latest migration/code/test state remains **NOT YET VERIFIED** and Stage13E is not closed.

## 14. Non-goals / open work

- Stage13F Question Bank persistence/publication is not implemented here.
- `AI-011-005` direct generated-question persistence remains Stage13F work.
- live provider benchmark/routes/credentials/production bootstrap remain `NOT YET VERIFIED`.
- hosting/deployment is fully deferred until VPS and is not a Stage13E gate.
