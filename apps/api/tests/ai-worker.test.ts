import assert from "node:assert/strict";
import test from "node:test";
import {
  AiWorkerRuntime,
  runAiWorkerProcess,
  type AiWorkerProcessor,
  type AiWorkerSleeper,
} from "../src/ai/worker-runtime.js";

const baseOptions = {
  concurrency: 1,
  idlePollMinMs: 10,
  idlePollMaxMs: 25,
  idleBackoffFactor: 2,
};

test("AI worker bounds concurrent slots and drains in-flight work before database close", async () => {
  let calls = 0;
  let active = 0;
  let maxActive = 0;
  let resolveTwoStarted!: () => void;
  const twoStarted = new Promise<void>((resolve) => {
    resolveTwoStarted = resolve;
  });
  const releases: Array<() => void> = [];

  const processor: AiWorkerProcessor = {
    async processNext() {
      calls += 1;
      active += 1;
      maxActive = Math.max(maxActive, active);
      if (calls === 2) resolveTwoStarted();
      await new Promise<void>((resolve) => releases.push(resolve));
      active -= 1;
      return { processed: true };
    },
  };

  const runtime = new AiWorkerRuntime(
    processor,
    { ...baseOptions, concurrency: 2 },
    async () => {
      throw new Error("ai_worker_unexpected_idle_sleep");
    },
  );
  const shutdown = new AbortController();
  let closed = false;
  let activeAtClose = -1;

  const running = runAiWorkerProcess({
    runtime,
    shutdownSignal: shutdown.signal,
    closeDatabase: async () => {
      activeAtClose = active;
      closed = true;
    },
  });

  await twoStarted;
  assert.equal(calls, 2);
  assert.equal(maxActive, 2);
  assert.equal(releases.length, 2);

  shutdown.abort();
  for (const release of releases) release();
  await running;

  assert.equal(runtime.isStopping, true);
  assert.equal(calls, 2);
  assert.equal(activeAtClose, 0);
  assert.equal(closed, true);
});

test("AI worker idle polling backs off to a configured ceiling", async () => {
  const delays: number[] = [];
  const processor: AiWorkerProcessor = {
    async processNext() {
      return null;
    },
  };

  let runtime!: AiWorkerRuntime;
  const sleeper: AiWorkerSleeper = async (delayMs) => {
    delays.push(delayMs);
    if (delays.length === 3) runtime.requestStop();
  };
  runtime = new AiWorkerRuntime(processor, baseOptions, sleeper);

  await runtime.run();
  assert.deepEqual(delays, [10, 20, 25]);
});

test("AI worker resets idle backoff after useful work", async () => {
  const outcomes: Array<unknown | null> = [null, null, { processed: true }, null];
  let position = 0;
  const delays: number[] = [];
  const processor: AiWorkerProcessor = {
    async processNext() {
      const outcome = outcomes[position] ?? null;
      position += 1;
      return outcome;
    },
  };

  let runtime!: AiWorkerRuntime;
  const sleeper: AiWorkerSleeper = async (delayMs) => {
    delays.push(delayMs);
    if (delays.length === 3) runtime.requestStop();
  };
  runtime = new AiWorkerRuntime(processor, baseOptions, sleeper);

  await runtime.run();
  assert.deepEqual(delays, [10, 20, 10]);
});

test("AI worker fails fast on an unexpected processor error and still closes the database", async () => {
  const failure = new Error("ai_worker_processor_failed");
  const processor: AiWorkerProcessor = {
    async processNext() {
      throw failure;
    },
  };
  const runtime = new AiWorkerRuntime(processor, baseOptions);
  const shutdown = new AbortController();
  let closed = false;

  await assert.rejects(
    () =>
      runAiWorkerProcess({
        runtime,
        shutdownSignal: shutdown.signal,
        closeDatabase: async () => {
          closed = true;
        },
      }),
    (error) => error === failure,
  );
  assert.equal(runtime.isStopping, true);
  assert.equal(closed, true);
});

test("AI worker rejects unbounded or invalid runtime settings", () => {
  const processor: AiWorkerProcessor = {
    async processNext() {
      return null;
    },
  };

  assert.throws(() => new AiWorkerRuntime(processor, { concurrency: 0 }), /ai_worker_concurrency_invalid/);
  assert.throws(
    () => new AiWorkerRuntime(processor, { idlePollMinMs: 5 }),
    /ai_worker_idle_poll_min_invalid/,
  );
  assert.throws(
    () => new AiWorkerRuntime(processor, { idlePollMinMs: 100, idlePollMaxMs: 50 }),
    /ai_worker_idle_poll_max_invalid/,
  );
  assert.throws(
    () => new AiWorkerRuntime(processor, { idleBackoffFactor: 1 }),
    /ai_worker_idle_backoff_factor_invalid/,
  );
});
