import assert from "node:assert/strict";
import test from "node:test";
import type { QueryResultRow } from "pg";
import { AdminAiOperationsService } from "../src/ai/admin-operations.js";
import type { Database, QueryExecutor } from "../src/db.js";

function asRows<T extends QueryResultRow>(rows: readonly QueryResultRow[]): readonly T[] {
  return rows as unknown as readonly T[];
}

test("Stage13E job list pages jobs before aggregating their units", async () => {
  const outsideQueries: string[] = [];
  const transactionQueries: Array<{ sql: string; values: readonly unknown[] }> = [];

  const database: Database = {
    async ping() {},
    async query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      _values: readonly unknown[] = [],
    ): Promise<readonly T[]> {
      outsideQueries.push(text.trim().replace(/\s+/g, " "));
      throw new Error("admin_job_list_query_outside_snapshot");
    },
    async transaction<T>(work: (tx: QueryExecutor) => Promise<T>): Promise<T> {
      const tx: QueryExecutor = {
        async query<R extends QueryResultRow = QueryResultRow>(
          text: string,
          values: readonly unknown[] = [],
        ): Promise<readonly R[]> {
          const sql = text.trim().replace(/\s+/g, " ");
          transactionQueries.push({ sql, values });
          if (sql === "set transaction isolation level repeatable read") return asRows<R>([]);
          if (sql.startsWith("with page as (")) return asRows<R>([]);
          if (sql.startsWith("select count(*) from ai_jobs j where")) return asRows<R>([{ count: "0" }]);
          throw new Error(`unexpected_admin_job_list_query:${sql}`);
        },
      };
      return work(tx);
    },
    async close() {},
  };

  const service = new AdminAiOperationsService(database);
  const result = await service.listJobs({
    status: "running",
    jobType: "question_generation",
    limit: 30,
    offset: 60,
  });

  assert.deepEqual(outsideQueries, []);
  assert.deepEqual(result, {
    jobs: [],
    pagination: { total: 0, limit: 30, offset: 60 },
  });
  assert.equal(transactionQueries[0]?.sql, "set transaction isolation level repeatable read");

  const pageQuery = transactionQueries[1];
  assert.ok(pageQuery);
  assert.deepEqual(pageQuery.values, ["running", "question_generation", 30, 60]);
  assert.ok(pageQuery.sql.startsWith("with page as ( select j.id"));
  assert.ok(pageQuery.sql.includes("cross join lateral"));
  assert.ok(pageQuery.sql.includes("from ai_job_units u where u.job_id = p.id"));
  assert.equal(pageQuery.sql.includes("left join ai_job_units u on u.job_id = j.id"), false);

  const pageLimit = pageQuery.sql.indexOf("limit $3 offset $4");
  const unitAggregation = pageQuery.sql.indexOf("from ai_job_units u");
  assert.ok(pageLimit >= 0, "job page must have a LIMIT/OFFSET boundary");
  assert.ok(unitAggregation > pageLimit, "unit aggregation must happen only after the job page is bounded");

  assert.equal(transactionQueries.length, 3);
  assert.ok(transactionQueries[2]?.sql.startsWith("select count(*) from ai_jobs j where"));
});
