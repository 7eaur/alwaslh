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
- Human review mutation is available only for **execution-stable unit outputs**: `completed | review_required`.
- Outputs attached to `queued | running | retrying | failed | cancelled` units remain observable for diagnosis/provenance but are **inspection-only** and expose no review mutation authority.
- Paginated history is presentation/audit navigation only. The currently opened history page never defines current review state or action authority.
- One Output Detail response is assembled from one short PostgreSQL repeatable-read snapshot so actor/time/output/history/count/latest authority cannot come from mixed committed states.

## 2. Job lifecycle / progress

Execution status remains Stage12:

`queued | running | retrying | completed | failed | cancelled`

Admin lifecycle view additionally exposes `paused` when a non-terminal job has `paused_at`.

Server-derived progress contains:

```ts
{
  totalUnits: number;
  acceptedUnits: number;
  completedUnits: number;
  reviewRequiredUnits: number;
  failedUnits: number;
  cancelledUnits: number;
  queuedUnits: number;
  runningUnits: number;
  retryingUnits: number;
  settledUnits: number;
  remainingUnits: number;
  progressPercent: number;
}
```

Frontend refreshes from server after mutations. Bounded polling is presentation only; no client-side lifecycle promotion exists.

## 3. List jobs

`GET /v1/admin/ai/jobs`

Query:

```ts
{
  status?: "queued" | "running" | "retrying" | "completed" | "failed" | "cancelled" | "paused";
  jobType?: string;
  limit?: number;   // default 30, 1..100
  offset?: number;  // default 0
}
```

Response includes `pagination: { total, limit, offset }`. Jobs are ordered `created_at DESC, id DESC`.

## 4. Job detail / server action authority

`GET /v1/admin/ai/jobs/:jobId`

Query: `unitLimit` default 50/max 100, `unitOffset` default 0.

Response includes units plus `pagination: { total, limit, offset }` and server-derived `allowedActions`.

Rules:

- non-terminal, unpaused → `pause`, `cancel`;
- non-terminal, paused → `resume`, `cancel`;
- failed → `retry` only if at least one failed unit exists, no cancellation request exists and no failed unit reached `attemptCount >= 20`;
- completed/cancelled/exhausted failed/no-failed-unit/cancellation-requested failed → no actions.

The array is current-state advice, not a reservation; concurrent state change may still make mutation return `409`.

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

Attempts are newest first. Admin-visible telemetry is bounded to safe operational identifiers and metrics.

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

Browser displays provenance but never rewrites canonical source association.

## 7. Output detail / review action authority

`GET /v1/admin/ai/outputs/:outputId`

Query:

```ts
{
  reviewLimit?: number;  // default Backend 100, max 100; Admin UI uses 50
  reviewOffset?: number; // default 0
}
```

Important response fields:

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
  reviewHistory: ReviewEvent[]; // requested page, newest first
  reviewPagination: { total: number; limit: number; offset: number };
}
```

`raw_response` is never returned; only `hasRawResponse`.

### Canonical-latest versus paginated history

Within one short `REPEATABLE READ` transaction, the service reads:

1. output + owning unit state;
2. requested review-history page;
3. total review-event count;
4. canonical latest review revision.

The transaction is closed before schema/provenance mapping. No write lock is introduced and no provider/network call occurs inside it.

`reviewStatus`, `allowedReviewActions`, and `effectiveReviewedOutput` are derived only from the canonical latest revision. Therefore opening page 3 of the audit history cannot make revision 1 appear to be the current review or re-enable actions after a later terminal approve/reject. The repeatable-read snapshot additionally guarantees that `reviewedByProfileId/reviewedAt`, page/count and canonical latest revision come from one committed database snapshot.

Effective reviewed output:

- pending → normalized output;
- latest edit → edited draft;
- approve → approved candidate;
- reject → `null`.

Review actions:

- unit status outside `completed | review_required` → `[]`;
- terminal approve/reject → `[]`;
- open stable review → edit + reject;
- approve only when current candidate passes Stage11 semantic authority.

## 8. Job controls

All are Admin-only unsafe requests and return `{ progress: AiJobProgress }`.

### Pause
`POST /v1/admin/ai/jobs/:jobId/pause`

### Resume
`POST /v1/admin/ai/jobs/:jobId/resume`

### Cancel
`POST /v1/admin/ai/jobs/:jobId/cancel`

### Retry
`POST /v1/admin/ai/jobs/:jobId/retry`

Retry remains Stage12 authority, preserves historical attempts, and cannot exceed the hard attempt ceiling.

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

- owning unit must be `completed` or `review_required`; otherwise `409` and no review event;
- edit requires `editedOutput`;
- reject requires nonblank reason;
- unknown fields are rejected;
- Admin edits/approvals are validated by Stage11 semantic authority.

Review transaction locks owning output + unit, verifies execution stability, selects normalized/latest-edited candidate, validates it, and appends a new review revision only if allowed.

After approve/reject, every later review mutation returns `409`. Concurrent terminal requests serialize and at most one succeeds.

## 10. Error contract

Existing envelope:

```ts
{ error: { code: string; message: string } }
```

Expected classes:

- `400 BAD_REQUEST`: invalid params/query/body, including review pagination >100;
- `401 UNAUTHORIZED`: no valid session;
- `403 FORBIDDEN`: non-Admin or origin-policy failure;
- `404 NOT_FOUND`: unknown resource;
- `409 CONFLICT`: stale/illegal lifecycle/review action;
- `500 INTERNAL_ERROR`: durable data violates stored contract/invariant.

Frontend refreshes canonical state on `409`; it never invents an optimistic replacement state.

## 11. PostgreSQL authority

Migration `0018_ai_admin_review.sql` adds append-only `ai_output_review_events`, unique `(ai_output_id, revision)`, payload/note constraints, durable nonblank reject reason, actor/time audit, and safe foreign keys.

The unique `(ai_output_id, revision)` btree serves canonical latest-revision lookup with a backward scan and bounded history pages.

### AI-013E-DB-001 — P1 Data/Audit integrity

Reject reason existed only in caller validation. Fixed by PostgreSQL `ai_output_review_events_reject_note_required` plus direct DB regression. Execution remains pending because hosted runner still does not reach checkout.

### AI-013E-REVIEW-002 — P1 Data/Review integrity

Human review was not bound to execution-stable unit state even though Stage12 can replace output during retry. Fixed by stable-unit gating and output+unit row locks. Failed/retrying outputs remain inspectable but not review-mutable.

### AI-013E-OPS-003 — P1 Durable operational history

Frontend originally exposed only first 30 Jobs / 50 Units / 50 Attempts although Backend already paginated them. Fixed with independent bounded server pagination, controller offsets and real Chromium fixtures (51 Units / 51 Attempts / second Jobs page).

### AI-013E-OPS-004 — P1 Review audit completeness / authority isolation

**Symptom:** output detail returned only the newest 100 append-only review events with no `total` or `offset`; older audit revisions were unreachable in Admin.

**Root cause:** review history was treated as a bounded display list rather than durable navigable audit authority. The original implementation also derived current review state from `history[0]`, so a naive offset addition would make current authority depend on the historical page being viewed.

**Impact:** long-lived outputs could hide old human decisions. A naive pagination patch could incorrectly re-enable review actions or show stale reviewed content while browsing an old page.

**Correct fix:** bounded `reviewLimit/reviewOffset` + `reviewPagination`, while canonical latest review is queried independently and exclusively drives `reviewStatus`, `allowedReviewActions`, and `effectiveReviewedOutput`.

**Backend regression:** seeds 105 review revisions, requests offset 100 (revisions 5..1), and proves current state still comes from revision 105 (`approved`, no actions, latest reviewed output).

**Frontend/Chromium regression:** real fixture seeds 101 edit revisions, navigates all three history pages, confirms revision 1 is reachable, confirms approve authority still comes from latest revision while the oldest page is displayed, then approves and proves history grows to 102 and survives reload.

**Execution state:** FIXED IN CANDIDATE / `NOT YET VERIFIED`. Runtime/test candidate later advanced to `9d59f84fb516db5cfaf89382f548c3eea595e365`; executable runner remains unavailable before checkout.

### AI-013E-OPS-005 — P2 Review detail snapshot consistency

**Symptom:** after OPS-004, output row, audit page, count and canonical latest revision were still read by separate top-level queries under PostgreSQL `READ COMMITTED`.

**Root cause:** current authority was separated correctly from the selected page, but the complete Output Detail response did not yet have a single read-snapshot boundary.

**Impact:** if another Admin review committed between those reads, one HTTP response could combine a new `reviewStatus` with older `reviewedByProfileId/reviewedAt`, page or total metadata. No durable corruption occurs, but the audit/read model can become internally inconsistent.

**Correct fix:** execute the four database reads inside one short `REPEATABLE READ` transaction, then close the transaction before JSON/schema/provenance mapping. No write locks or provider calls are added.

**Regression:** `tests/ai-admin-output-detail-snapshot.test.ts` fails any future output-detail read that escapes the transaction and asserts the isolation command is the first transaction operation, while preserving canonical approved state, actor/time and pagination mapping.

**Commit:** `9d59f84fb516db5cfaf89382f548c3eea595e365`.

**Execution state:** FIXED IN CANDIDATE / `NOT YET VERIFIED`. Run `34277281675`, job `102233304479`, ended before checkout with `runner_id=0`, `steps=[]`.

## 12. Security / performance

- Jobs/Units/Attempts/Review History use bounded server pagination; max page size 100.
- canonical latest review query is independent and bounded to one row.
- Output Detail uses a short repeatable-read snapshot across four local PostgreSQL reads; parsing/mapping occurs after commit.
- no write lock or provider/network call is introduced by the read snapshot.
- list/detail avoid raw provider payloads and credentials/internal errors.
- review mutation transaction remains short and row-scoped.
- action availability remains server-derived.
- no second lifecycle/queue and no duplicate latest-review index.

## 13. Verification contract

Combined Stage13E workflow must execute:

1. API lint/typecheck/unit/build, including Output Detail snapshot regression;
2. Admin lint/typecheck/unit/build;
3. clean PostgreSQL migrations + Stage13E DB contract;
4. Admin authorization/secret/provenance/review/action/retry/concurrency/stable-review/review-history pagination regressions;
5. Stage12 execution/capacity/control/lifecycle regressions;
6. auth regression;
7. fresh DB reset;
8. real Admin bootstrap + deterministic Stage13E fixtures;
9. fixture invariants including 51 Units, 51 Attempts, 101 review revisions and second Jobs page;
10. real Chromium Jobs/Units/Attempts/Review History pagination, pause/resume, approve/reload, session expiry, stale-review 409 and 390px.

Current runtime/test candidate HEAD before this documentation commit:

`9d59f84fb516db5cfaf89382f548c3eea595e365`

Latest run: `34277281675`; job: `102233304479`.

Observed: no runner allocated (`runner_id=0`) and no executable steps (`steps=[]`). Therefore Stage13E remains **NOT YET VERIFIED** and stays outside `main`.

## 14. Non-goals / open work

- Stage13F Question Bank persistence/publication is not implemented here.
- `AI-011-005` direct generated-question persistence remains Stage13F work.
- live provider benchmark/routes/credentials/production bootstrap remain `NOT YET VERIFIED`.
- hosting/deployment is fully deferred until VPS and is not a Stage13E gate.
