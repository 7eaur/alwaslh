# Stage13E — Admin AI Operations / Review Contract

Status: **VERIFIED / PROMOTED TO MAIN / CLOSED**.

Verified runtime/application SHA:

`d5ebc7f25a369430387a758c7c0bb89350963d67`

Accepted candidate SHA:

`72ead8446af237392dc6d953c8e0c2382f468286`

Stage13E extends verified Stage11 generation contracts and Stage12 durable execution. It does **not** create a second queue, browser-owned progress authority, provider-specific execution contract, Question Bank persistence, or publication authority.

## 1. Authority boundaries

- PostgreSQL + Backend own jobs, units, attempts, outputs, progress, pause/resume/cancel/retry, allowed actions and review history.
- `/v1/admin/ai/*` routes are authenticated Admin-only.
- unsafe requests retain existing origin/CORS protection.
- browser does not infer canonical lifecycle/review state or actions.
- `409 CONFLICT` means reload canonical state.
- Stage13E review never publishes directly into Stage13F Question Bank.
- Admin edits/approvals pass Stage11 semantic validation.
- human review mutation is allowed only for execution-stable unit states `completed | review_required`.
- non-stable outputs remain inspection-only.
- paginated history is audit presentation only; selected historical page never defines current review authority.
- coupled multi-query Admin read models use one short PostgreSQL `REPEATABLE READ` snapshot.

## 2. Job lifecycle and progress

Stage12 execution states remain authoritative:

`queued | running | retrying | completed | failed | cancelled`

Admin additionally exposes `paused` when a non-terminal job has `paused_at`.

Progress is server-derived from durable Unit states; Frontend polling is presentation only.

## 3. Admin read APIs

### List Jobs

`GET /v1/admin/ai/jobs`

- optional `status`, `jobType`;
- `limit` default 30, max 100;
- `offset` default 0;
- ordered by `created_at DESC, id DESC`;
- page + total read inside one short repeatable-read snapshot;
- Job rows are paged before expensive Unit aggregation.

### Job Detail

`GET /v1/admin/ai/jobs/:jobId`

- `unitLimit` / `unitOffset`;
- returns bounded Unit page, pagination, server-derived progress and `allowedActions`;
- progress/Units/action advice share one read snapshot.

Action rules reuse Stage12 authority: eligible non-terminal jobs can pause/cancel, paused jobs can resume/cancel, eligible failed jobs can retry, terminal/exhausted/invalid states expose no action.

### Unit Detail

`GET /v1/admin/ai/units/:unitId`

- `attemptLimit` / `attemptOffset`;
- newest attempts first;
- unit/latest-attempt/page/total share one snapshot.

### Output Detail

`GET /v1/admin/ai/outputs/:outputId`

- `reviewLimit` / `reviewOffset`, max 100;
- returns normalized output, semantic validation state, safe provenance, paginated review history, review pagination, canonical review status/effective reviewed output/reviewer metadata and server-derived review actions.

`raw_response` is not returned; only safe indicators such as `hasRawResponse`.

## 4. Secret / data-minimization boundary

Admin browser contracts exclude:

- credential aliases;
- raw provider metadata;
- raw provider response;
- provider/internal error-message text;
- any secret needed to invoke a provider.

Safe operational identifiers, route/model/project references, bounded metrics and provenance may be exposed when durable Stage12 data exists.

## 5. Provenance

Output/unit detail preserves canonical Stage11 source references, including media asset, page number, input checksum, input kind and OCR/source-asset references where present.

Browser displays provenance but does not rewrite canonical source association.

## 6. Canonical review authority vs paginated audit

Output Detail reads in one repeatable-read transaction:

1. output + owning unit state;
2. requested review-history page;
3. total review count;
4. canonical latest review revision.

The transaction ends before schema/provenance mapping. No provider call or write lock is introduced into this read snapshot.

`reviewStatus`, `allowedReviewActions` and `effectiveReviewedOutput` derive only from canonical latest revision, never `reviewHistory[0]` of the selected page.

Consequences:

- old audit pages remain reachable;
- opening an old page cannot re-enable review actions;
- terminal approve/reject remains terminal;
- reviewer/time/current state/page/total in one response describe one committed snapshot.

## 7. Job controls

Admin-only unsafe endpoints:

- `POST /v1/admin/ai/jobs/:jobId/pause`
- `POST /v1/admin/ai/jobs/:jobId/resume`
- `POST /v1/admin/ai/jobs/:jobId/cancel`
- `POST /v1/admin/ai/jobs/:jobId/retry`

They delegate to Stage12 lifecycle authority. Retry preserves attempt history and hard attempt ceilings.

## 8. Review mutation

`PATCH /v1/admin/ai/outputs/:outputId/review`

Strict union:

```ts
type ReviewRequest =
  | { action: "edit"; editedOutput: AiGenerationOutput; note?: string }
  | { action: "approve"; note?: string }
  | { action: "reject"; note: string };
```

Rules:

- owning unit must be execution-stable (`completed | review_required`), otherwise `409` and no event;
- edit requires edited output;
- reject requires a nonblank reason;
- unknown fields are rejected;
- edits/approvals pass Stage11 validation;
- transaction locks output + owning unit, resolves current candidate and appends a new review revision only if allowed;
- after terminal approve/reject, later review mutations return `409`;
- concurrent terminal requests serialize and at most one succeeds.

## 9. PostgreSQL authority

Migration `0018_ai_admin_review.sql` adds append-only `ai_output_review_events` with:

- unique `(ai_output_id, revision)`;
- payload/note consistency constraints;
- durable nonblank reject-note requirement;
- actor/time audit;
- safe foreign keys.

The unique revision btree also supports canonical latest-revision lookup; a redundant latest-review index is intentionally unnecessary.

## 10. Closed Stage13E findings

### `AI-013E-DB-001` P1 — VERIFIED
Reject reason is enforced at PostgreSQL boundary, not caller validation only.

### `AI-013E-REVIEW-002` P1 — VERIFIED
Human review is bound to execution-stable output; output + unit locking prevents stale review authority across retry replacement.

### `AI-013E-OPS-003` P1 — VERIFIED
Jobs/Units/Attempts complete durable history is reachable through bounded pagination; real fixture covers later pages.

### `AI-013E-OPS-004` P1 — VERIFIED
Review History is fully pageable while canonical latest review remains independent from selected historical page. Backend large-history and real Chromium regressions prove it.

### `AI-013E-OPS-005` P2 — VERIFIED
Output Detail coupled reads use a single repeatable-read snapshot.

### `AI-013E-OPS-006` P2 — VERIFIED
List Jobs, Job Detail, Unit Detail and Output Detail share the Stage13E read-snapshot policy.

### `AI-013E-PERF-007` P2 — VERIFIED
List Jobs pages Jobs before correlated Unit aggregation, bounding expensive work to selected page.

### `AI-013E-API-008` P2 — VERIFIED
All Stage13E offsets are limited to non-negative safe JavaScript integers before service/DB execution.

### `CI-013E-009` P1 — VERIFIED
Standalone workflow assertion drift/quoting was synchronized to current migration/Combined contract without weakening any DB/test rule.

## 11. Frontend / Chromium contract

Verified real Admin Chromium covers:

- Jobs/Units/Attempts later-page navigation;
- >100 review-revision history and canonical-latest isolation;
- pause/resume;
- approve and reload durability;
- real session expiry/logout behavior;
- real stale-review `409` canonical refresh;
- 390×844 horizontal-overflow guard.

No request interception, fake API, test-only Backend endpoint, cookie forgery or sleep-based race is used for Stage13E acceptance.

## 12. Executable closure evidence

Accepted candidate `72ead8446af237392dc6d953c8e0c2382f468286`: required candidate matrix **12/12 SUCCESS**; PR #24 closed unmerged.

Selective promotion `d5ebc7f25a369430387a758c7c0bb89350963d67`: required promotion matrix **12/12 SUCCESS**; PR #25 closed unmerged.

Promotion runs:

- Combined `34401502463`
- Stage13E standalone `34401549935`
- Stage13E Frontend Prep `34401549849`
- Rebuild `34401550016`
- Stage13 Admin `34401549835`
- Stage9 `34401549851`
- Stage10 `34401549989`
- OCR `34401549910`
- Stage11 `34401549927`
- Stage12 `34401549964`
- Stage13D Content `34401550065`
- Stage13D Admin `34401549903`

All are SUCCESS on the exact promotion SHA. Combined executed real API/Admin quality, clean PostgreSQL, Stage13E and Stage12/auth regressions, deterministic fixtures and real Chromium.

## 13. Closure boundary

Stage13E is **VERIFIED / PROMOTED / CLOSED**.

Stage13F Question Bank / Quiz Builder / Publish is **READY / NOT STARTED**. `AI-011-005` and reviewed Question Bank persistence/publication are Stage13F responsibilities.

`AI-012-019` live provider benchmark/routes/credentials/bootstrap remains `NOT YET VERIFIED` and is not implied by Stage13E closure.

Hosting/deployment remains deferred until VPS + explicit Product Owner reopening.
