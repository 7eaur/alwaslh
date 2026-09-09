# Stage13E — Admin AI Operations Performance Hardening

Status: **FIXED + VERIFIED / PROMOTED**.

Verified runtime/application SHA: `d5ebc7f25a369430387a758c7c0bb89350963d67`.

## AI-013E-PERF-007 — P2 Job List Aggregation

### Problem

`AdminAiOperationsService.listJobs()` originally joined/aggregated Unit history for all matching Jobs and only then applied `LIMIT/OFFSET`. A 30-row Admin page could therefore perform work proportional to complete durable history before discarding most rows.

### Root cause

HTTP pagination bounded returned rows, but the expensive aggregation happened before the page boundary.

### Root fix

The list query now:

1. selects/filters/orders the `ai_jobs` page first;
2. applies `LIMIT/OFFSET` before Unit aggregation;
3. calculates Unit status counts only for Jobs in that page through a correlated `LATERAL` aggregate;
4. preserves the separate total count inside the same short `REPEATABLE READ` snapshot;
5. preserves `created_at DESC, id DESC` ordering and zero-Unit semantics.

No speculative index, materialized view or denormalized counter was added. Query shape was the proven root cause.

### Regression

`apps/api/tests/ai-admin-job-list-query-shape.test.ts` verifies:

- list reads remain inside the Stage13E repeatable-read snapshot;
- filters/limit/offset are preserved;
- Job page selection occurs before Unit aggregation;
- Unit aggregation is correlated to the selected page;
- the old global Job→Unit aggregation shape is absent;
- total pagination count remains independent.

## Related read-model performance/correctness boundaries

Stage13E List Jobs, Job Detail, Unit Detail and Output Detail use short read-only `REPEATABLE READ` snapshots for coupled reads. These transactions contain bounded PostgreSQL reads only; no provider/network call or write lock is introduced.

Review History and operational histories are server-paginated with max page size 100. Canonical latest review uses a bounded one-row query independent from the selected audit page.

## Executable verification

Accepted candidate `72ead8446af237392dc6d953c8e0c2382f468286` passed the full required candidate matrix.

Selective promotion `d5ebc7f25a369430387a758c7c0bb89350963d67` passed **12/12** exact-head workflows including Combined `34401502463`, Stage13E standalone `34401549935`, Rebuild `34401550016`, and the Stage9/10/OCR/11/12/13/13D regression set.

Therefore `AI-013E-PERF-007` and the Stage13E read-snapshot/query-shape performance boundary are **FIXED + VERIFIED**.

## Carry-forward performance policy

- bounded API pagination should also bound expensive database work where practical;
- fix proven query-shape causes before adding indexes/caches/denormalization;
- add indexes only with plan/benchmark evidence when needed;
- durable histories remain completely reachable through bounded pages;
- provider calls stay outside database read/write transactions;
- do not trade correctness/audit reachability for superficial speed.
