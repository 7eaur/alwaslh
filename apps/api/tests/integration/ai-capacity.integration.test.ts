import assert from "node:assert/strict";
import test from "node:test";
import { AiExecutionService } from "../../src/ai/execution-service.js";
import type {
  AiProviderAdapter,
  AiProviderGenerateInput,
  AiProviderGenerateResult,
} from "../../src/ai/provider.js";
import { AiModelRouter, type AiModelRoute } from "../../src/ai/router.js";
import { createDatabase } from "../../src/db.js";
import { AI_GOLDEN_FIXTURES } from "../fixtures/ai-golden.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage12 capacity integration tests");

const fixture = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === "science-mcq-valid-formula-digits");
if (!fixture) throw new Error("Stage12 capacity golden fixture is missing");
const request = fixture.request;
const validOutput = fixture.output;

class DeferredAdapter implements AiProviderAdapter {
  readonly started: Promise<void>;
  readonly calls: AiProviderGenerateInput[] = [];
  private resolveStarted!: () => void;
  private releasePromise: Promise<void>;
  private resolveRelease!: () => void;

  constructor(readonly providerKey: string) {
    this.started = new Promise((resolve) => {
      this.resolveStarted = resolve;
    });
    this.releasePromise = new Promise((resolve) => {
      this.resolveRelease = resolve;
    });
  }

  release(): void {
    this.resolveRelease();
  }

  async generate(input: AiProviderGenerateInput): Promise<AiProviderGenerateResult> {
    this.calls.push(input);
    this.resolveStarted();
    await this.releasePromise;
    return { output: validOutput };
  }
}

class ImmediateAdapter implements AiProviderAdapter {
  readonly calls: AiProviderGenerateInput[] = [];

  constructor(readonly providerKey: string) {}

  async generate(input: AiProviderGenerateInput): Promise<AiProviderGenerateResult> {
    this.calls.push(input);
    return { output: validOutput };
  }
}

function route(
  routeKey: string,
  providerKey: string,
  modelKey: string,
  capacity: AiModelRoute["capacity"],
  projectAlias?: string,
): AiModelRoute {
  return {
    routeKey,
    providerKey,
    modelKey,
    benchmarkVersion: "stage12-capacity-v1",
    tier: 1,
    modes: ["question_generation"],
    capacity,
    ...(projectAlias ? { projectAlias } : {}),
  };
}

function service(
  db: ReturnType<typeof createDatabase>,
  adapter: AiProviderAdapter,
  modelRoute: AiModelRoute,
  globalMaxConcurrent: number,
): AiExecutionService {
  return new AiExecutionService(
    db,
    new AiModelRouter([modelRoute], [adapter]),
    {
      leaseSeconds: 60,
      maxAttempts: 1,
      retryBaseMs: 50,
      retryMaxMs: 500,
      globalMaxConcurrent,
      capacityBackoffMs: 10,
    },
    undefined,
    () => 0.5,
  );
}

async function assertBackpressureCase(
  db: ReturnType<typeof createDatabase>,
  input: {
    id: string;
    expectedDimension: "global" | "provider" | "project" | "model";
    globalMaxConcurrent: number;
    firstRoute: AiModelRoute;
    secondRoute: AiModelRoute;
  },
): Promise<void> {
  const firstAdapter = new DeferredAdapter(input.firstRoute.providerKey);
  const secondAdapter = new ImmediateAdapter(input.secondRoute.providerKey);
  const firstService = service(db, firstAdapter, input.firstRoute, input.globalMaxConcurrent);
  const secondService = service(db, secondAdapter, input.secondRoute, input.globalMaxConcurrent);

  const firstJob = await firstService.enqueue({
    idempotencyKey: `stage12-capacity-${input.id}-first`,
    units: [{ unitKey: `${input.id}-first`, request }],
  });
  const firstRun = firstService.processNext();
  await firstAdapter.started;

  const secondJob = await secondService.enqueue({
    idempotencyKey: `stage12-capacity-${input.id}-second`,
    units: [{ unitKey: `${input.id}-second`, request }],
  });
  const blocked = await secondService.processNext();
  assert.equal(blocked?.status, "retrying");
  assert.equal(blocked?.routeKey, input.secondRoute.routeKey);
  assert.equal(secondAdapter.calls.length, 0);

  const blockedState = await db.query<{
    status: string;
    attempt_count: number;
    resume_route_key: string | null;
    capacity_deferred_count: number;
    last_error_message: string | null;
  }>(
    `select status, attempt_count, resume_route_key, capacity_deferred_count, last_error_message
     from ai_job_units where job_id = $1`,
    [secondJob.job.id],
  );
  assert.equal(blockedState[0]?.status, "retrying");
  assert.equal(blockedState[0]?.attempt_count, 1);
  assert.equal(blockedState[0]?.resume_route_key, input.secondRoute.routeKey);
  assert.equal(blockedState[0]?.capacity_deferred_count, 1);
  assert.match(blockedState[0]?.last_error_message ?? "", new RegExp(`capacity ${input.expectedDimension}`));

  await db.query("update ai_job_units set next_attempt_at = now() where job_id = $1", [secondJob.job.id]);
  const blockedAgain = await secondService.processNext();
  assert.equal(blockedAgain?.status, "retrying");
  const deferredAgain = await db.query<{ attempt_count: number; capacity_deferred_count: number }>(
    "select attempt_count, capacity_deferred_count from ai_job_units where job_id = $1",
    [secondJob.job.id],
  );
  assert.equal(deferredAgain[0]?.attempt_count, 1);
  assert.equal(deferredAgain[0]?.capacity_deferred_count, 2);

  firstAdapter.release();
  assert.equal((await firstRun)?.status, "completed");
  await db.query("update ai_job_units set next_attempt_at = now() where job_id = $1", [secondJob.job.id]);
  assert.equal((await secondService.processNext())?.status, "completed");
  assert.equal(secondAdapter.calls.length, 1);

  const completed = await db.query<{ status: string; attempt_count: number; resume_route_key: string | null }>(
    "select status, attempt_count, resume_route_key from ai_job_units where job_id = $1",
    [secondJob.job.id],
  );
  assert.equal(completed[0]?.status, "completed");
  assert.equal(completed[0]?.attempt_count, 1);
  assert.equal(completed[0]?.resume_route_key, null);

  const firstState = await db.query<{ status: string }>("select status from ai_jobs where id = $1", [firstJob.job.id]);
  assert.equal(firstState[0]?.status, "completed");
}

test("Stage12 distributed backpressure bounds global/provider/project/model concurrency without consuming retries", async () => {
  const db = createDatabase(databaseUrl);
  try {
    await assertBackpressureCase(db, {
      id: "global",
      expectedDimension: "global",
      globalMaxConcurrent: 1,
      firstRoute: route(
        "global-a",
        "global-provider-a",
        "global-model-a",
        { providerMaxConcurrent: 5, modelMaxConcurrent: 5 },
      ),
      secondRoute: route(
        "global-b",
        "global-provider-b",
        "global-model-b",
        { providerMaxConcurrent: 5, modelMaxConcurrent: 5 },
      ),
    });

    await assertBackpressureCase(db, {
      id: "provider",
      expectedDimension: "provider",
      globalMaxConcurrent: 10,
      firstRoute: route(
        "provider-a",
        "shared-provider",
        "provider-model-a",
        { providerMaxConcurrent: 1, modelMaxConcurrent: 5 },
      ),
      secondRoute: route(
        "provider-b",
        "shared-provider",
        "provider-model-b",
        { providerMaxConcurrent: 1, modelMaxConcurrent: 5 },
      ),
    });

    await assertBackpressureCase(db, {
      id: "project",
      expectedDimension: "project",
      globalMaxConcurrent: 10,
      firstRoute: route(
        "project-a",
        "project-provider",
        "project-model-a",
        { providerMaxConcurrent: 5, projectMaxConcurrent: 1, modelMaxConcurrent: 5 },
        "project-one",
      ),
      secondRoute: route(
        "project-b",
        "project-provider",
        "project-model-b",
        { providerMaxConcurrent: 5, projectMaxConcurrent: 1, modelMaxConcurrent: 5 },
        "project-one",
      ),
    });

    await assertBackpressureCase(db, {
      id: "model",
      expectedDimension: "model",
      globalMaxConcurrent: 10,
      firstRoute: route(
        "model-a",
        "model-provider",
        "shared-model",
        { providerMaxConcurrent: 5, modelMaxConcurrent: 1 },
      ),
      secondRoute: route(
        "model-b",
        "model-provider",
        "shared-model",
        { providerMaxConcurrent: 5, modelMaxConcurrent: 1 },
      ),
    });
  } finally {
    await db.close();
  }
});
