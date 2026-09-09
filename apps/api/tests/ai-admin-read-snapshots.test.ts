import assert from "node:assert/strict";
import test from "node:test";
import type { QueryResultRow } from "pg";
import { AdminAiOperationsService } from "../src/ai/admin-operations.js";
import type { Database, QueryExecutor } from "../src/db.js";
import { AI_GOLDEN_FIXTURES } from "./fixtures/ai-golden.js";

const fixture = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === "science-mcq-valid-formula-digits");
if (!fixture) throw new Error("Stage13E admin read snapshot fixture is missing");

function asRows<T extends QueryResultRow>(rows: readonly QueryResultRow[]): readonly T[] {
  return rows as unknown as readonly T[];
}

test("Stage13E multi-query admin read models use repeatable PostgreSQL snapshots", async () => {
  const jobId = "20000000-0000-4000-8000-000000000001";
  const unitId = "20000000-0000-4000-8000-000000000002";
  const timestamp = new Date("2026-09-08T21:00:00.000Z");
  const outsideQueries: string[] = [];
  const transactionQueries: string[][] = [];

  const jobRow = {
    id: jobId,
    job_type: "stage13e_snapshot",
    status: "running",
    prompt_key: "snapshot.prompt",
    prompt_version: "1",
    requested_model: null,
    priority: 1,
    created_by_profile_id: null,
    cancel_requested_at: null,
    paused_at: null,
    started_at: timestamp,
    completed_at: null,
    created_at: timestamp,
    updated_at: timestamp,
    total: 1,
    completed: 0,
    review_required: 0,
    failed: 0,
    cancelled: 0,
    queued: 1,
    running: 0,
    retrying: 0,
  };

  const unitRow = {
    id: unitId,
    job_id: jobId,
    unit_key: "snapshot-unit",
    position: 1,
    status: "queued",
    input_payload: fixture.request,
    attempt_count: 0,
    max_attempts: 3,
    next_attempt_at: null,
    lease_expires_at: null,
    last_error_code: null,
    started_at: null,
    completed_at: null,
    created_at: timestamp,
    updated_at: timestamp,
    output_id: null,
    output_validation_status: null,
    output_updated_at: null,
    latest_review_action: null,
    attempt_id: null,
    attempt_number: null,
    attempt_provider_key: null,
    attempt_provider_project_alias: null,
    attempt_model_used: null,
    attempt_route_key: null,
    attempt_benchmark_version: null,
    attempt_status: null,
    attempt_validation_status: null,
    attempt_retryable: null,
    attempt_input_tokens: null,
    attempt_output_tokens: null,
    attempt_latency_ms: null,
    attempt_estimated_cost_usd_micros: null,
    attempt_error_code: null,
    attempt_started_at: null,
    attempt_completed_at: null,
  };

  const database: Database = {
    async ping() {},
    async query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      _values: readonly unknown[] = [],
    ): Promise<readonly T[]> {
      outsideQueries.push(text.trim().replace(/\s+/g, " "));
      throw new Error("admin_read_query_outside_snapshot");
    },
    async transaction<T>(work: (tx: QueryExecutor) => Promise<T>): Promise<T> {
      const queries: string[] = [];
      transactionQueries.push(queries);
      const tx: QueryExecutor = {
        async query<R extends QueryResultRow = QueryResultRow>(
          text: string,
          _values: readonly unknown[] = [],
        ): Promise<readonly R[]> {
          const normalized = text.trim().replace(/\s+/g, " ");
          queries.push(normalized);

          if (normalized === "set transaction isolation level repeatable read") return asRows<R>([]);
          if (normalized.includes("order by j.created_at desc, j.id desc")) return asRows<R>([]);
          if (normalized.startsWith("select count(*) from ai_jobs j where"))
            return asRows<R>([{ count: "0" }]);
          if (
            normalized.includes("select j.id, j.status, j.paused_at, j.cancel_requested_at") &&
            normalized.includes("exhausted_failed_units")
          ) {
            return asRows<R>([
              {
                id: jobId,
                status: "running",
                paused_at: null,
                cancel_requested_at: null,
                failed_units: 0,
                exhausted_failed_units: 0,
              },
            ]);
          }
          if (normalized.includes("where j.id = $1 group by j.id")) return asRows<R>([jobRow]);
          if (normalized.includes("where u.job_id = $1 order by u.position, u.id")) return asRows<R>([]);
          if (normalized.includes("from ai_job_units u") && normalized.includes("where u.id = $1")) {
            return asRows<R>([unitRow]);
          }
          if (normalized.startsWith("select id, attempt_number, provider_key")) return asRows<R>([]);
          if (normalized.startsWith("select count(*) from ai_execution_attempts")) {
            return asRows<R>([{ count: "0" }]);
          }

          throw new Error(`unexpected_admin_snapshot_query:${normalized}`);
        },
      };
      return work(tx);
    },
    async close() {},
  };

  const service = new AdminAiOperationsService(database);

  const listed = await service.listJobs({ limit: 30, offset: 0 });
  const job = await service.jobDetail(jobId, 50, 0);
  const unit = await service.unitDetail(unitId, 50, 0);

  assert.deepEqual(outsideQueries, []);
  assert.equal(transactionQueries.length, 3);
  for (const queries of transactionQueries) {
    assert.equal(queries[0], "set transaction isolation level repeatable read");
  }
  assert.deepEqual(listed.pagination, { total: 0, limit: 30, offset: 0 });
  assert.deepEqual(job.job.allowedActions, ["pause", "cancel"]);
  assert.deepEqual(job.pagination, { total: 1, limit: 50, offset: 0 });
  assert.deepEqual(unit.attemptPagination, { total: 0, limit: 50, offset: 0 });
  assert.equal(unit.unit.unitKey, "snapshot-unit");
});
