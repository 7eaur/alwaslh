import assert from "node:assert/strict";
import test from "node:test";
import { AiExecutionService } from "../../src/ai/execution-service.js";
import type {
  AiProviderAdapter,
  AiProviderGenerateInput,
  AiProviderGenerateResult,
} from "../../src/ai/provider.js";
import { AiProviderError } from "../../src/ai/provider.js";
import { type AiModelRoute, AiModelRouter } from "../../src/ai/router.js";
import { createDatabase } from "../../src/db.js";
import { AI_GOLDEN_FIXTURES } from "../fixtures/ai-golden.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage12 control integration tests");

const fixture = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === "science-mcq-valid-formula-digits");
if (!fixture) throw new Error("Stage12 control golden fixture is missing");
const request = fixture.request;
const validOutput = fixture.output;

class SequenceAdapter implements AiProviderAdapter {
  readonly calls: AiProviderGenerateInput[] = [];
  private position = 0;

  constructor(
    readonly providerKey: string,
    private readonly sequence: readonly (AiProviderGenerateResult | Error)[],
  ) {}

  async generate(input: AiProviderGenerateInput): Promise<AiProviderGenerateResult> {
    this.calls.push(input);
    const value = this.sequence[this.position++];
    if (!value) throw new Error("fake_ai_sequence_exhausted");
    if (value instanceof Error) throw value;
    return value;
  }
}

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
    return { output: validOutput, usage: { estimatedCostUsd: 0.0005 } };
  }
}

function route(routeKey: string, providerKey: string, modelKey: string): AiModelRoute {
  return {
    routeKey,
    providerKey,
    modelKey,
    benchmarkVersion: "stage12-control-v1",
    tier: 1,
    modes: ["question_generation"],
    capacity: { providerMaxConcurrent: 10, modelMaxConcurrent: 10 },
  };
}

function service(
  db: ReturnType<typeof createDatabase>,
  adapter: AiProviderAdapter,
  modelRoute: AiModelRoute,
): AiExecutionService {
  return new AiExecutionService(
    db,
    new AiModelRouter([modelRoute], [adapter]),
    {
      leaseSeconds: 60,
      maxAttempts: 2,
      retryBaseMs: 25,
      retryMaxMs: 100,
      globalMaxConcurrent: 10,
      capacityBackoffMs: 10,
      operationalBackoffMs: 10,
    },
    undefined,
    () => 0.5,
  );
}

async function resetGlobalControl(db: ReturnType<typeof createDatabase>): Promise<void> {
  await db.query(
    `update ai_execution_runtime_control
     set kill_switch = false,
         budget_limit_usd_micros = null,
         budget_window_started_at = null,
         budget_window_ends_at = null,
         budget_reservation_usd_micros = 0,
         updated_at = now()
     where singleton = true`,
  );
}

test("Stage12 operational controls enforce kill switches, cooldown and race-safe budget ceilings", async () => {
  const db = createDatabase(databaseUrl);
  try {
    await resetGlobalControl(db);

    const globalKillRoute = route("stage12-control-global-kill", "global-kill-provider", "global-kill-model");
    const globalKillAdapter = new SequenceAdapter(globalKillRoute.providerKey, [{ output: validOutput }]);
    const globalKillService = service(db, globalKillAdapter, globalKillRoute);
    const globalKillJob = await globalKillService.enqueue({
      idempotencyKey: "stage12-control-global-kill-job",
      units: [{ unitKey: "global-kill", request }],
    });
    await db.query("update ai_execution_runtime_control set kill_switch = true where singleton = true");
    const globalBlocked = await globalKillService.processNext();
    assert.equal(globalBlocked?.status, "retrying");
    assert.equal(globalKillAdapter.calls.length, 0);
    const globalBlockedState = await db.query<{
      attempt_count: number;
      control_deferred_count: number;
      resume_route_key: string | null;
      last_error_code: string | null;
    }>(
      `select attempt_count, control_deferred_count, resume_route_key, last_error_code
       from ai_job_units where job_id = $1`,
      [globalKillJob.job.id],
    );
    assert.equal(globalBlockedState[0]?.attempt_count, 1);
    assert.equal(globalBlockedState[0]?.control_deferred_count, 1);
    assert.equal(globalBlockedState[0]?.resume_route_key, globalKillRoute.routeKey);
    assert.equal(globalBlockedState[0]?.last_error_code, "global_kill_switch");
    await resetGlobalControl(db);
    await db.query("update ai_job_units set next_attempt_at = now() where job_id = $1", [
      globalKillJob.job.id,
    ]);
    assert.equal((await globalKillService.processNext())?.status, "completed");
    assert.equal(globalKillAdapter.calls.length, 1);
    const globalKillCompleted = await db.query<{ attempt_count: number }>(
      "select attempt_count from ai_job_units where job_id = $1",
      [globalKillJob.job.id],
    );
    assert.equal(globalKillCompleted[0]?.attempt_count, 1);

    const routeKillRoute = route("stage12-control-route-kill", "route-kill-provider", "route-kill-model");
    const routeKillAdapter = new SequenceAdapter(routeKillRoute.providerKey, [{ output: validOutput }]);
    const routeKillService = service(db, routeKillAdapter, routeKillRoute);
    await db.query(
      `insert into ai_route_runtime_state (route_key, provider_key, model_used, kill_switch)
       values ($1, $2, $3, true)`,
      [routeKillRoute.routeKey, routeKillRoute.providerKey, routeKillRoute.modelKey],
    );
    const routeKillJob = await routeKillService.enqueue({
      idempotencyKey: "stage12-control-route-kill-job",
      units: [{ unitKey: "route-kill", request }],
    });
    const routeBlocked = await routeKillService.processNext();
    assert.equal(routeBlocked?.status, "retrying");
    assert.equal(routeKillAdapter.calls.length, 0);
    await db.query("update ai_route_runtime_state set kill_switch = false where route_key = $1", [
      routeKillRoute.routeKey,
    ]);
    await db.query("update ai_job_units set next_attempt_at = now() where job_id = $1", [
      routeKillJob.job.id,
    ]);
    assert.equal((await routeKillService.processNext())?.status, "completed");

    const cooldownRoute = route("stage12-control-retry-after", "cooldown-provider", "cooldown-model");
    const cooldownAdapter = new SequenceAdapter(cooldownRoute.providerKey, [
      new AiProviderError("rate_limited", "retry later", true, 60_000),
      { output: validOutput },
    ]);
    const cooldownService = service(db, cooldownAdapter, cooldownRoute);
    const cooldownFirst = await cooldownService.enqueue({
      idempotencyKey: "stage12-control-cooldown-first",
      units: [{ unitKey: "cooldown-first", request }],
    });
    assert.equal((await cooldownService.processNext())?.status, "retrying");
    const cooldownState = await db.query<{
      cooldown_until: Date | null;
      consecutive_failures: number;
      last_error_code: string | null;
    }>(
      `select cooldown_until, consecutive_failures, last_error_code
       from ai_route_runtime_state where route_key = $1`,
      [cooldownRoute.routeKey],
    );
    assert.ok(cooldownState[0]?.cooldown_until);
    assert.equal(cooldownState[0]?.consecutive_failures, 1);
    assert.equal(cooldownState[0]?.last_error_code, "rate_limited");

    const cooldownSecond = await cooldownService.enqueue({
      idempotencyKey: "stage12-control-cooldown-second",
      units: [{ unitKey: "cooldown-second", request }],
    });
    const coolingBlocked = await cooldownService.processNext();
    assert.equal(coolingBlocked?.status, "retrying");
    assert.equal(cooldownAdapter.calls.length, 1);
    const coolingUnit = await db.query<{ last_error_code: string | null; attempt_count: number }>(
      "select last_error_code, attempt_count from ai_job_units where job_id = $1",
      [cooldownSecond.job.id],
    );
    assert.equal(coolingUnit[0]?.last_error_code, "route_cooldown");
    assert.equal(coolingUnit[0]?.attempt_count, 1);
    await db.query(
      "update ai_route_runtime_state set cooldown_until = now() - interval '1 second' where route_key = $1",
      [cooldownRoute.routeKey],
    );
    await db.query("update ai_job_units set next_attempt_at = now() where job_id = $1", [
      cooldownSecond.job.id,
    ]);
    assert.equal((await cooldownService.processNext())?.status, "completed");
    assert.equal(cooldownAdapter.calls.length, 2);
    await cooldownService.cancel(cooldownFirst.job.id);

    const budgetRoute = route("stage12-control-global-budget", "budget-provider", "budget-model");
    const budgetAdapter = new DeferredAdapter(budgetRoute.providerKey);
    const budgetService = service(db, budgetAdapter, budgetRoute);
    await db.query(
      `update ai_execution_runtime_control
       set budget_limit_usd_micros = 1000,
           budget_window_started_at = clock_timestamp(),
           budget_window_ends_at = clock_timestamp() + interval '1 hour',
           budget_reservation_usd_micros = 1000,
           updated_at = now()
       where singleton = true`,
    );
    const budgetJob = await budgetService.enqueue({
      idempotencyKey: "stage12-control-global-budget-race",
      units: [
        { unitKey: "budget-a", request },
        { unitKey: "budget-b", request },
      ],
    });
    const budgetA = budgetService.processNext();
    const budgetB = budgetService.processNext();
    await budgetAdapter.started;
    const budgetFirstSettled = await Promise.race([budgetA, budgetB]);
    assert.equal(budgetFirstSettled?.status, "retrying");
    assert.equal(budgetAdapter.calls.length, 1);
    budgetAdapter.release();
    const budgetResults = await Promise.all([budgetA, budgetB]);
    assert.deepEqual(budgetResults.map((result) => result?.status).sort(), ["completed", "retrying"]);
    const budgetUnits = await db.query<{
      status: string;
      attempt_count: number;
      control_deferred_count: number;
      last_error_code: string | null;
    }>(
      `select status, attempt_count, control_deferred_count, last_error_code
       from ai_job_units where job_id = $1 order by position`,
      [budgetJob.job.id],
    );
    const globalBudgetBlocked = budgetUnits.find((unit) => unit.status === "retrying");
    assert.ok(globalBudgetBlocked);
    assert.equal(globalBudgetBlocked.attempt_count, 1);
    assert.equal(globalBudgetBlocked.control_deferred_count, 1);
    assert.equal(globalBudgetBlocked.last_error_code, "global_budget_exhausted");
    const budgetAttempts = await db.query<{
      global_budget_reservation_usd_micros: string;
      estimated_cost_usd_micros: string | null;
    }>(
      `select global_budget_reservation_usd_micros, estimated_cost_usd_micros
       from ai_execution_attempts where route_key = $1`,
      [budgetRoute.routeKey],
    );
    assert.equal(budgetAttempts.length, 1);
    assert.equal(budgetAttempts[0]?.global_budget_reservation_usd_micros, "1000");
    await resetGlobalControl(db);
    await db.query(
      "update ai_job_units set next_attempt_at = now() where job_id = $1 and status = 'retrying'",
      [budgetJob.job.id],
    );
    assert.equal((await budgetService.processNext())?.status, "completed");

    const routeBudgetRoute = route(
      "stage12-control-route-budget",
      "route-budget-provider",
      "route-budget-model",
    );
    const routeBudgetAdapter = new SequenceAdapter(routeBudgetRoute.providerKey, [
      { output: validOutput },
      { output: validOutput },
    ]);
    const routeBudgetService = service(db, routeBudgetAdapter, routeBudgetRoute);
    await db.query(
      `insert into ai_route_runtime_state (
         route_key, provider_key, model_used,
         budget_limit_usd_micros, budget_window_started_at, budget_window_ends_at,
         budget_reservation_usd_micros
       ) values ($1, $2, $3, 1000, clock_timestamp(), clock_timestamp() + interval '1 hour', 1000)`,
      [routeBudgetRoute.routeKey, routeBudgetRoute.providerKey, routeBudgetRoute.modelKey],
    );
    const routeBudgetFirst = await routeBudgetService.enqueue({
      idempotencyKey: "stage12-control-route-budget-first",
      units: [{ unitKey: "route-budget-first", request }],
    });
    assert.equal((await routeBudgetService.processNext())?.status, "completed");
    const routeBudgetSecond = await routeBudgetService.enqueue({
      idempotencyKey: "stage12-control-route-budget-second",
      units: [{ unitKey: "route-budget-second", request }],
    });
    const routeBudgetBlocked = await routeBudgetService.processNext();
    assert.equal(routeBudgetBlocked?.status, "retrying");
    assert.equal(routeBudgetAdapter.calls.length, 1);
    const routeBudgetState = await db.query<{ last_error_code: string | null; attempt_count: number }>(
      "select last_error_code, attempt_count from ai_job_units where job_id = $1",
      [routeBudgetSecond.job.id],
    );
    assert.equal(routeBudgetState[0]?.last_error_code, "route_budget_exhausted");
    assert.equal(routeBudgetState[0]?.attempt_count, 1);
    await db.query(
      `update ai_route_runtime_state
       set budget_limit_usd_micros = null,
           budget_window_started_at = null,
           budget_window_ends_at = null,
           budget_reservation_usd_micros = 0
       where route_key = $1`,
      [routeBudgetRoute.routeKey],
    );
    await db.query("update ai_job_units set next_attempt_at = now() where job_id = $1", [
      routeBudgetSecond.job.id,
    ]);
    assert.equal((await routeBudgetService.processNext())?.status, "completed");
    assert.equal(routeBudgetAdapter.calls.length, 2);
    assert.equal(routeBudgetFirst.job.status, "queued");
  } finally {
    await resetGlobalControl(db).catch(() => undefined);
    await db.close();
  }
});
