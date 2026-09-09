# Stage13E — Admin AI Operations Performance Hardening

Status: **COMBINED INTEGRATION CANDIDATE / NOT YET VERIFIED**.

This document records performance findings that are part of Stage13E correctness/operability. It does not relax the Stage13E verification gate and does not add deployment scope.

## AI-013E-PERF-007 — P2 Admin Job List Aggregates Before Pagination

### Problem

`AdminAiOperationsService.listJobs()` originally built every list page from `ai_jobs LEFT JOIN ai_job_units`, grouped all matching Jobs and their Units, sorted the grouped result, and only then applied `LIMIT/OFFSET`.

A request for 30 Admin rows could therefore aggregate Unit history for the complete matching durable Job history before discarding all but the requested page.

### Evidence

Original query shape:

```sql
select ... count(u.id) ...
from ai_jobs j
left join ai_job_units u on u.job_id = j.id
where ...
group by j.id
order by j.created_at desc, j.id desc
limit $3 offset $4
```

This is a Stage13E operational-performance defect rather than data corruption. Cost grows with durable history even though the HTTP contract has a bounded page size.

### Root cause

The Backend had bounded API pagination, but pagination was applied to the **aggregated join result** instead of to the owning `ai_jobs` rows before Unit aggregation.

The bounded HTTP contract therefore did not imply bounded aggregation work.

### Correct fix

Commit `8501d2e0317c0e1e4eb83b72c997e321ee79fe81` changes only `listJobs()`:

1. a `page` CTE selects/filter/orders `ai_jobs` and applies `LIMIT/OFFSET` first;
2. a correlated `LATERAL` aggregate computes Unit status counts only for Jobs in that page;
3. the existing separate total count remains in the same Stage13E `REPEATABLE READ` snapshot;
4. ordering and response semantics stay `created_at DESC, id DESC`;
5. a Job with zero Units still receives zero counts because the lateral aggregate always returns one row.

No speculative index or denormalized counter was added. Existing Job→Unit indexes remain reusable for the bounded `u.job_id = p.id` lookups. Further indexing requires executable `EXPLAIN`/benchmark evidence rather than assumption.

### Regression

Commit `6efce1510231de5d569c4b96dbdffa3d4d488b31` adds:

`apps/api/tests/ai-admin-job-list-query-shape.test.ts`

The regression proves:

- no list query escapes the repeatable-read snapshot;
- Job filters/limit/offset parameters are preserved;
- the list SQL starts from a bounded Job page;
- `LIMIT $3 OFFSET $4` appears before Unit aggregation;
- Unit aggregation is correlated to `p.id` after the page boundary;
- the old global `LEFT JOIN ai_job_units ... GROUP BY` list shape is absent;
- total pagination count remains independent and bounded to `ai_jobs`.

### Verification state

`FIXED IN CANDIDATE / EXECUTION PENDING`.

Latest code/test HEAD for this finding:

`6efce1510231de5d569c4b96dbdffa3d4d488b31`

GitHub Actions run `34281631521`, job `102247518121`, terminated before checkout with no executable steps. Therefore lint/typecheck/unit/PostgreSQL execution remains `NOT YET VERIFIED`; this run is not evidence of a product/test failure.

## Performance policy carried forward

- bounded HTTP pagination must also bound expensive database work where practical;
- do not add indexes without query-plan/benchmark evidence when query shape itself is the root cause;
- durable histories remain server-paginated and fully reachable;
- read responses remain snapshot-consistent;
- provider/network calls never occur inside Admin read snapshots;
- Stage13E remains outside `main` until the unchanged executable gate passes.
