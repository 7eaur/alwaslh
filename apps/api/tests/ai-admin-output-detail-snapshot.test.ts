import assert from "node:assert/strict";
import test from "node:test";
import type { QueryResultRow } from "pg";
import { AdminAiOperationsService } from "../src/ai/admin-operations.js";
import type { Database, QueryExecutor } from "../src/db.js";
import { AI_GOLDEN_FIXTURES } from "./fixtures/ai-golden.js";

const fixture = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === "science-mcq-valid-formula-digits");
if (!fixture) throw new Error("Stage13E output-detail snapshot fixture is missing");

function asRows<T extends QueryResultRow>(rows: readonly QueryResultRow[]): readonly T[] {
  return rows as unknown as readonly T[];
}

test("Stage13E output detail reads one repeatable PostgreSQL snapshot", async () => {
  const outputId = "10000000-0000-4000-8000-000000000001";
  const unitId = "10000000-0000-4000-8000-000000000002";
  const jobId = "10000000-0000-4000-8000-000000000003";
  const actorId = "10000000-0000-4000-8000-000000000004";
  const eventId = "10000000-0000-4000-8000-000000000005";
  const timestamp = new Date("2026-09-08T20:00:00.000Z");
  const outsideQueries: string[] = [];
  const transactionQueries: string[] = [];

  const transactionExecutor: QueryExecutor = {
    async query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      _values: readonly unknown[] = [],
    ): Promise<readonly T[]> {
      const normalized = text.trim().replace(/\s+/g, " ");
      transactionQueries.push(normalized);

      if (normalized === "set transaction isolation level repeatable read") return asRows<T>([]);

      if (normalized.includes("from ai_outputs o join ai_job_units u")) {
        return asRows<T>([
          {
            id: outputId,
            job_unit_id: unitId,
            validation_status: "valid",
            raw_response: { fixture: true },
            normalized_output: fixture.output,
            validation_errors: [],
            semantic_warnings: [],
            reviewed_by_profile_id: actorId,
            reviewed_at: timestamp,
            created_at: timestamp,
            updated_at: timestamp,
            input_payload: fixture.request,
            unit_key: "snapshot-unit",
            unit_status: "review_required",
            job_id: jobId,
          },
        ]);
      }

      if (normalized.includes("select count(*) from ai_output_review_events")) {
        return asRows<T>([{ count: "1" }]);
      }

      if (normalized.includes("order by e.revision desc limit $2 offset $3")) {
        return asRows<T>([
          {
            id: eventId,
            revision: 1,
            action: "approve",
            actor_profile_id: actorId,
            actor_display_name: "مدير Snapshot",
            reviewed_output: fixture.output,
            note: "اعتماد",
            created_at: timestamp,
          },
        ]);
      }

      if (normalized.includes("order by e.revision desc limit 1")) {
        return asRows<T>([
          {
            id: eventId,
            revision: 1,
            action: "approve",
            actor_profile_id: actorId,
            actor_display_name: "مدير Snapshot",
            reviewed_output: fixture.output,
            note: "اعتماد",
            created_at: timestamp,
          },
        ]);
      }

      throw new Error(`unexpected_snapshot_query:${normalized}`);
    },
  };

  const database: Database = {
    async ping() {},
    async query<T extends QueryResultRow = QueryResultRow>(
      text: string,
      _values: readonly unknown[] = [],
    ): Promise<readonly T[]> {
      outsideQueries.push(text.trim().replace(/\s+/g, " "));
      throw new Error("output_detail_query_outside_snapshot");
    },
    async transaction<T>(work: (tx: QueryExecutor) => Promise<T>): Promise<T> {
      return work(transactionExecutor);
    },
    async close() {},
  };

  const service = new AdminAiOperationsService(database);
  const detail = await service.outputDetail(outputId, 50, 0);

  assert.deepEqual(outsideQueries, []);
  assert.equal(transactionQueries[0], "set transaction isolation level repeatable read");
  assert.equal(detail.reviewStatus, "approved");
  assert.deepEqual(detail.allowedReviewActions, []);
  assert.equal(detail.reviewHistory[0]?.revision, 1);
  assert.deepEqual(detail.reviewPagination, { total: 1, limit: 50, offset: 0 });
  assert.equal(detail.reviewedByProfileId, actorId);
  assert.equal(detail.reviewedAt?.toISOString(), timestamp.toISOString());
  assert.deepEqual(detail.effectiveReviewedOutput, fixture.output);
});
