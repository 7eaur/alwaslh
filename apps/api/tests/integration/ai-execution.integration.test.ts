import assert from "node:assert/strict";
import test from "node:test";
import type { AiGenerationRequest } from "../../src/ai/contracts.js";
import type {
  AiProviderAdapter,
  AiProviderGenerateInput,
  AiProviderGenerateResult,
} from "../../src/ai/provider.js";
import { AiProviderError } from "../../src/ai/provider.js";
import { AiModelRouter } from "../../src/ai/router.js";
import { AiExecutionService } from "../../src/ai/execution-service.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage12 integration tests");

const request: AiGenerationRequest = {
  mode: "question_generation",
  language: "ar",
  subjectDomain: "chemistry",
  sourceSensitivity: "scientific",
  notationPolicy: "arabic_visible_numerals",
  sourceChunks: [
    {
      mediaAssetId: "11111111-1111-4111-8111-111111111111",
      pageNumber: 12,
      inputChecksumSha256: "a".repeat(64),
      inputKind: "approved_ocr",
      ocrExtractionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      approvedText: "الماء مركب كيميائي صيغته H2O، ويتكون من ذرتي هيدروجين وذرة أكسجين.",
      ocrReviewStatus: "approved",
    },
  ],
  target: { multipleChoice: 1, trueFalse: 0, direct: 0 },
};

const validOutput = {
  kind: "question_set",
  questions: [
    {
      prompt: "ما الصيغة الكيميائية للماء؟",
      type: "multiple_choice",
      options: ["CO2", "H2O", "N2", "NaCl"],
      correctOptionIndex: 1,
      answerText: "H2O",
      answerStatus: "known",
      difficulty: "easy",
      explanation: "الإجابة الصحيحة هي H2O لأنها الصيغة الواردة في المصدر.",
      method: "١- نحدد المادة المطلوبة. ٢- نطابق الصيغة مع المصدر.",
      sourceEvidence: [
        {
          mediaAssetId: "11111111-1111-4111-8111-111111111111",
          pageNumber: 12,
          ocrExtractionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        },
      ],
    },
  ],
};

class SequenceAdapter implements AiProviderAdapter {
  private position = 0;
  readonly calls: AiProviderGenerateInput[] = [];

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

  async generate(_input: AiProviderGenerateInput): Promise<AiProviderGenerateResult> {
    this.resolveStarted();
    await this.releasePromise;
    return { output: validOutput, usage: { inputTokens: 120, outputTokens: 45, estimatedCostUsd: 0.0012 } };
  }
}

function routerFor(adapter: AiProviderAdapter, routeKey = "route-1", tier = 1): AiModelRouter {
  return new AiModelRouter(
    [
      {
        routeKey,
        providerKey: adapter.providerKey,
        modelKey: `${adapter.providerKey}-model`,
        benchmarkVersion: "stage12-test-v1",
        tier,
        modes: ["question_generation"],
      },
    ],
    [adapter],
  );
}

const profile = {
  leaseSeconds: 60,
  maxAttempts: 3,
  retryBaseMs: 100,
  retryMaxMs: 1_000,
};

test("Stage12 execution is durable, leased, retryable, cancellable and partial-success safe", async () => {
  const db = createDatabase(databaseUrl);
  try {
    const basicAdapter = new SequenceAdapter("basic-provider", [
      { output: validOutput, usage: { inputTokens: 100, outputTokens: 40, estimatedCostUsd: 0.001 } },
    ]);
    const basic = new AiExecutionService(db, routerFor(basicAdapter), profile, undefined, () => 0.5);
    const first = await basic.enqueue({
      idempotencyKey: "stage12-basic-idempotency",
      units: [{ unitKey: "page-12", request }],
    });
    assert.equal(first.replayed, false);
    const replay = await basic.enqueue({
      idempotencyKey: "stage12-basic-idempotency",
      units: [{ unitKey: "page-12", request }],
    });
    assert.equal(replay.replayed, true);
    assert.equal(replay.job.id, first.job.id);
    await assert.rejects(
      () =>
        basic.enqueue({
          idempotencyKey: "stage12-basic-idempotency",
          units: [{ unitKey: "different-unit", request }],
        }),
      /ai_idempotency_conflict/,
    );

    const completed = await basic.processNext();
    assert.equal(completed?.status, "completed");
    assert.equal(completed?.routeKey, "route-1");
    const basicJob = await db.query<{ status: string; completed_units: number; failed_units: number }>(
      "select status, completed_units, failed_units from ai_jobs where id = $1",
      [first.job.id],
    );
    assert.equal(basicJob[0]?.status, "completed");
    assert.equal(basicJob[0]?.completed_units, 1);
    assert.equal(basicJob[0]?.failed_units, 0);
    const basicAttempts = await db.query<{
      status: string;
      input_tokens: number | null;
      output_tokens: number | null;
      estimated_cost_usd_micros: string | null;
    }>(
      "select status, input_tokens, output_tokens, estimated_cost_usd_micros from ai_execution_attempts where job_unit_id = $1",
      [completed?.unitId],
    );
    assert.equal(basicAttempts[0]?.status, "completed");
    assert.equal(basicAttempts[0]?.input_tokens, 100);
    assert.equal(basicAttempts[0]?.output_tokens, 40);
    assert.equal(basicAttempts[0]?.estimated_cost_usd_micros, "1000");

    const cheap = new SequenceAdapter("cheap-provider", [
      new AiProviderError("provider_busy", "cheap route busy", true, 50),
    ]);
    const strong = new SequenceAdapter("strong-provider", [{ output: validOutput }]);
    const cascadeRouter = new AiModelRouter(
      [
        {
          routeKey: "cheap",
          providerKey: cheap.providerKey,
          modelKey: "cheap-model",
          benchmarkVersion: "stage12-test-v1",
          tier: 1,
          modes: ["question_generation"],
        },
        {
          routeKey: "strong",
          providerKey: strong.providerKey,
          modelKey: "strong-model",
          benchmarkVersion: "stage12-test-v1",
          tier: 2,
          modes: ["question_generation"],
        },
      ],
      [cheap, strong],
    );
    const cascade = new AiExecutionService(db, cascadeRouter, profile, undefined, () => 0.5);
    const cascadeJob = await cascade.enqueue({
      idempotencyKey: "stage12-cascade-failover",
      units: [{ unitKey: "cascade", request }],
    });
    const cascadeResult = await cascade.processNext();
    assert.equal(cascadeResult?.status, "completed");
    assert.equal(cascadeResult?.routeKey, "strong");
    const cascadeAttempts = await db.query<{ status: string; provider_key: string; retryable: boolean | null }>(
      `select status, provider_key, retryable
       from ai_execution_attempts a
       join ai_job_units u on u.id = a.job_unit_id
       where u.job_id = $1 order by attempt_number`,
      [cascadeJob.job.id],
    );
    assert.deepEqual(
      cascadeAttempts.map((row) => [row.provider_key, row.status, row.retryable]),
      [
        ["cheap-provider", "failed", true],
        ["strong-provider", "completed", false],
      ],
    );

    const flaky = new SequenceAdapter("flaky-provider", [
      new AiProviderError("rate_limited", "try later", true, 10),
      { output: validOutput },
    ]);
    const retryService = new AiExecutionService(db, routerFor(flaky), profile, undefined, () => 0.5);
    const retryJob = await retryService.enqueue({
      idempotencyKey: "stage12-retryable-unit",
      units: [{ unitKey: "retry", request }],
    });
    const retryFirst = await retryService.processNext();
    assert.equal(retryFirst?.status, "retrying");
    const retryState = await db.query<{ status: string; attempt_count: number }>(
      "select status, attempt_count from ai_job_units where job_id = $1",
      [retryJob.job.id],
    );
    assert.equal(retryState[0]?.status, "retrying");
    assert.equal(retryState[0]?.attempt_count, 1);
    await db.query("update ai_job_units set next_attempt_at = now() where job_id = $1", [retryJob.job.id]);
    const retrySecond = await retryService.processNext();
    assert.equal(retrySecond?.status, "completed");

    const deferred = new DeferredAdapter("deferred-provider");
    const concurrentService = new AiExecutionService(db, routerFor(deferred), profile, undefined, () => 0.5);
    await concurrentService.enqueue({
      idempotencyKey: "stage12-concurrent-claim",
      units: [{ unitKey: "only-unit", request }],
    });
    const running = concurrentService.processNext();
    await deferred.started;
    const competing = await concurrentService.processNext();
    assert.equal(competing, null);
    deferred.release();
    assert.equal((await running)?.status, "completed");

    const stale = new DeferredAdapter("stale-provider");
    const staleService = new AiExecutionService(db, routerFor(stale), profile, undefined, () => 0.5);
    const staleJob = await staleService.enqueue({
      idempotencyKey: "stage12-stale-lease",
      units: [{ unitKey: "stale", request }],
    });
    const staleRun = staleService.processNext();
    await stale.started;
    await db.query(
      "update ai_job_units set lease_expires_at = now() - interval '1 second' where job_id = $1",
      [staleJob.job.id],
    );
    stale.release();
    await assert.rejects(staleRun, /ai_lease_lost/);
    const staleState = await db.query<{ status: string; attempt_count: number }>(
      "select status, attempt_count from ai_job_units where job_id = $1",
      [staleJob.job.id],
    );
    assert.equal(staleState[0]?.status, "running");
    assert.equal(staleState[0]?.attempt_count, 1);

    const cancelling = new DeferredAdapter("cancel-provider");
    const cancelService = new AiExecutionService(db, routerFor(cancelling), profile, undefined, () => 0.5);
    const cancelJob = await cancelService.enqueue({
      idempotencyKey: "stage12-cancel-running",
      units: [{ unitKey: "cancel", request }],
    });
    const cancelRun = cancelService.processNext();
    await cancelling.started;
    const cancelled = await cancelService.cancel(cancelJob.job.id);
    assert.equal(cancelled.status, "cancelled");
    cancelling.release();
    await assert.rejects(cancelRun, /ai_attempt_not_running|ai_lease_lost/);
    const cancelledUnit = await db.query<{ status: string; lease_token: string | null }>(
      "select status, lease_token from ai_job_units where job_id = $1",
      [cancelJob.job.id],
    );
    assert.equal(cancelledUnit[0]?.status, "cancelled");
    assert.equal(cancelledUnit[0]?.lease_token, null);

    const partialAdapter = new SequenceAdapter("partial-provider", [
      { output: validOutput },
      new AiProviderError("bad_request", "non retryable unit", false),
    ]);
    const partialProfile = { ...profile, maxAttempts: 1 };
    const partialService = new AiExecutionService(
      db,
      routerFor(partialAdapter),
      partialProfile,
      undefined,
      () => 0.5,
    );
    const partialJob = await partialService.enqueue({
      idempotencyKey: "stage12-partial-success",
      units: [
        { unitKey: "accepted", request },
        { unitKey: "failed", request },
      ],
    });
    assert.equal((await partialService.processNext())?.status, "completed");
    assert.equal((await partialService.processNext())?.status, "failed");
    const partialState = await db.query<{
      status: string;
      completed_units: number;
      failed_units: number;
      total_units: number;
    }>("select status, completed_units, failed_units, total_units from ai_jobs where id = $1", [partialJob.job.id]);
    assert.equal(partialState[0]?.status, "completed");
    assert.equal(partialState[0]?.completed_units, 1);
    assert.equal(partialState[0]?.failed_units, 1);
    assert.equal(partialState[0]?.total_units, 2);
  } finally {
    await db.close();
  }
});
