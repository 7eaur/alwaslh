import assert from "node:assert/strict";
import test from "node:test";
import type { AiGenerationRequest } from "../../src/ai/contracts.js";
import { AiExecutionService } from "../../src/ai/execution-service.js";
import type {
  AiProviderAdapter,
  AiProviderGenerateInput,
  AiProviderGenerateResult,
} from "../../src/ai/provider.js";
import { AiModelRouter } from "../../src/ai/router.js";
import { createDatabase, type Database } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage12 lifecycle integration tests");

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

class FirstCallGateAdapter implements AiProviderAdapter {
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

  releaseFirst(): void {
    this.resolveRelease();
  }

  async generate(input: AiProviderGenerateInput): Promise<AiProviderGenerateResult> {
    this.calls.push(input);
    if (this.calls.length === 1) {
      this.resolveStarted();
      await this.releasePromise;
    }
    return { output: validOutput };
  }
}

function createRuntime(providerKey: string): {
  database: Database;
  adapter: FirstCallGateAdapter;
  service: AiExecutionService;
} {
  const database = createDatabase(databaseUrl);
  const adapter = new FirstCallGateAdapter(providerKey);
  const router = new AiModelRouter(
    [
      {
        routeKey: "pause-resume-route",
        providerKey: adapter.providerKey,
        modelKey: `${adapter.providerKey}-model`,
        benchmarkVersion: "stage12-pause-resume-v1",
        tier: 1,
        modes: ["question_generation"],
        capacity: { providerMaxConcurrent: 4, modelMaxConcurrent: 4 },
      },
    ],
    [adapter],
  );
  return {
    database,
    adapter,
    service: new AiExecutionService(
      database,
      router,
      { leaseSeconds: 60, maxAttempts: 3, retryBaseMs: 10, retryMaxMs: 100, globalMaxConcurrent: 4 },
      undefined,
      () => 0.5,
    ),
  };
}

test("Stage12 job pause/resume/progress preserves in-flight authority and durable unit progress", async () => {
  const { database, adapter, service } = createRuntime("pause-resume-provider");
  try {
    const job = await service.enqueue({
      idempotencyKey: "stage12-pause-resume-job",
      units: [
        { unitKey: "first", request },
        { unitKey: "second", request },
      ],
    });

    const pausedBeforeClaim = await service.pause(job.job.id);
    assert.equal(pausedBeforeClaim.status, "paused");
    assert.equal(pausedBeforeClaim.queuedUnits, 2);
    assert.equal(pausedBeforeClaim.runningUnits, 0);
    assert.equal(await service.processNext(), null);

    const unclaimed = await database.query<{ attempt_count: number }>(
      "select attempt_count from ai_job_units where job_id = $1 order by position",
      [job.job.id],
    );
    assert.deepEqual(
      unclaimed.map((row) => row.attempt_count),
      [0, 0],
    );

    const resumedBeforeClaim = await service.resume(job.job.id);
    assert.notEqual(resumedBeforeClaim.status, "paused");

    const firstRun = service.processNext();
    await adapter.started;

    const pausedInFlight = await service.pause(job.job.id);
    assert.equal(pausedInFlight.status, "paused");
    assert.equal(pausedInFlight.runningUnits, 1);
    assert.equal(pausedInFlight.queuedUnits, 1);
    assert.equal(pausedInFlight.settledUnits, 0);
    assert.equal(await service.processNext(), null);

    adapter.releaseFirst();
    assert.equal((await firstRun)?.status, "completed");

    const afterFirst = await service.progress(job.job.id);
    assert.equal(afterFirst.status, "paused");
    assert.equal(afterFirst.acceptedUnits, 1);
    assert.equal(afterFirst.completedUnits, 1);
    assert.equal(afterFirst.queuedUnits, 1);
    assert.equal(afterFirst.runningUnits, 0);
    assert.equal(afterFirst.progressPercent, 50);

    const resumed = await service.resume(job.job.id);
    assert.notEqual(resumed.status, "paused");
    assert.equal((await service.processNext())?.status, "completed");

    const completed = await service.progress(job.job.id);
    assert.equal(completed.status, "completed");
    assert.equal(completed.acceptedUnits, 2);
    assert.equal(completed.settledUnits, 2);
    assert.equal(completed.remainingUnits, 0);
    assert.equal(completed.progressPercent, 100);
    assert.equal(completed.pausedAt, null);

    const attempts = await database.query<{ attempt_count: number }>(
      "select attempt_count from ai_job_units where job_id = $1 order by position",
      [job.job.id],
    );
    assert.deepEqual(
      attempts.map((row) => row.attempt_count),
      [1, 1],
    );

    await assert.rejects(() => service.pause(job.job.id), /ai_job_not_pauseable:completed/);
    await assert.rejects(() => service.resume(job.job.id), /ai_job_not_resumable:completed/);
  } finally {
    await database.close();
  }
});

test("Stage12 expired in-flight lease is durably released while paused and resumes without retry loss", async () => {
  const { database, adapter, service } = createRuntime("pause-expiry-provider");
  try {
    const job = await service.enqueue({
      idempotencyKey: "stage12-pause-expired-lease",
      units: [{ unitKey: "only", request }],
    });

    const staleRun = service.processNext();
    await adapter.started;
    await service.pause(job.job.id);
    await database.query(
      "update ai_job_units set lease_expires_at = now() - interval '1 second' where job_id = $1",
      [job.job.id],
    );
    adapter.releaseFirst();
    await assert.rejects(staleRun, /ai_lease_lost/);

    assert.equal(await service.processNext(), null);
    const pausedRecovered = await service.progress(job.job.id);
    assert.equal(pausedRecovered.status, "paused");
    assert.equal(pausedRecovered.runningUnits, 0);
    assert.equal(pausedRecovered.retryingUnits, 1);

    const beforeResume = await database.query<{ attempt_count: number }>(
      "select attempt_count from ai_job_units where job_id = $1",
      [job.job.id],
    );
    assert.equal(beforeResume[0]?.attempt_count, 1);

    await service.resume(job.job.id);
    assert.equal((await service.processNext())?.status, "completed");

    const afterResume = await database.query<{ attempt_count: number }>(
      "select attempt_count from ai_job_units where job_id = $1",
      [job.job.id],
    );
    assert.equal(afterResume[0]?.attempt_count, 2);

    const attemptStates = await database.query<{ status: string; error_code: string | null }>(
      `select a.status, a.error_code
       from ai_execution_attempts a
       join ai_job_units u on u.id = a.job_unit_id
       where u.job_id = $1
       order by a.attempt_number`,
      [job.job.id],
    );
    assert.deepEqual(attemptStates, [
      { status: "failed", error_code: "lease_expired" },
      { status: "completed", error_code: null },
    ]);
  } finally {
    await database.close();
  }
});

test("Stage12 cancellation remains terminal and clears an active pause gate", async () => {
  const { database, service } = createRuntime("pause-cancel-provider");
  try {
    const job = await service.enqueue({
      idempotencyKey: "stage12-pause-cancel-job",
      units: [{ unitKey: "cancel-me", request }],
    });
    assert.equal((await service.pause(job.job.id)).status, "paused");
    assert.equal((await service.cancel(job.job.id)).status, "cancelled");

    const progress = await service.progress(job.job.id);
    assert.equal(progress.status, "cancelled");
    assert.equal(progress.pausedAt, null);
    assert.equal(progress.cancelledUnits, 1);
    await assert.rejects(() => service.resume(job.job.id), /ai_job_not_resumable:cancelled/);
  } finally {
    await database.close();
  }
});
