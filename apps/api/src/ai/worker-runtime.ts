export interface AiWorkerProcessor {
  processNext(): Promise<unknown | null>;
}

export interface AiWorkerRuntimeOptions {
  concurrency: number;
  idlePollMinMs: number;
  idlePollMaxMs: number;
  idleBackoffFactor: number;
}

export type AiWorkerSleeper = (delayMs: number, signal: AbortSignal) => Promise<void>;

export const DEFAULT_AI_WORKER_RUNTIME_OPTIONS: Readonly<AiWorkerRuntimeOptions> = Object.freeze({
  concurrency: 4,
  idlePollMinMs: 100,
  idlePollMaxMs: 2_000,
  idleBackoffFactor: 2,
});

function resolveWorkerOptions(options: Partial<AiWorkerRuntimeOptions>): Readonly<AiWorkerRuntimeOptions> {
  const resolved = Object.freeze({ ...DEFAULT_AI_WORKER_RUNTIME_OPTIONS, ...options });

  if (!Number.isInteger(resolved.concurrency) || resolved.concurrency < 1 || resolved.concurrency > 64) {
    throw new Error("ai_worker_concurrency_invalid");
  }
  if (
    !Number.isInteger(resolved.idlePollMinMs) ||
    resolved.idlePollMinMs < 10 ||
    resolved.idlePollMinMs > 60_000
  ) {
    throw new Error("ai_worker_idle_poll_min_invalid");
  }
  if (
    !Number.isInteger(resolved.idlePollMaxMs) ||
    resolved.idlePollMaxMs < resolved.idlePollMinMs ||
    resolved.idlePollMaxMs > 300_000
  ) {
    throw new Error("ai_worker_idle_poll_max_invalid");
  }
  if (
    !Number.isFinite(resolved.idleBackoffFactor) ||
    resolved.idleBackoffFactor <= 1 ||
    resolved.idleBackoffFactor > 4
  ) {
    throw new Error("ai_worker_idle_backoff_factor_invalid");
  }

  return resolved;
}

export function abortableWorkerSleep(delayMs: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();

  return new Promise((resolve) => {
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export class AiWorkerRuntime {
  private readonly options: Readonly<AiWorkerRuntimeOptions>;
  private readonly idleAbortController = new AbortController();
  private started = false;
  private stopping = false;

  constructor(
    private readonly processor: AiWorkerProcessor,
    options: Partial<AiWorkerRuntimeOptions> = {},
    private readonly sleeper: AiWorkerSleeper = abortableWorkerSleep,
  ) {
    this.options = resolveWorkerOptions(options);
  }

  get isStopping(): boolean {
    return this.stopping;
  }

  requestStop(): void {
    if (this.stopping) return;
    this.stopping = true;
    this.idleAbortController.abort();
  }

  async run(): Promise<void> {
    if (this.started) throw new Error("ai_worker_already_started");
    this.started = true;

    let failed = false;
    let firstError: unknown;
    const slots = Array.from({ length: this.options.concurrency }, () =>
      this.runSlot().catch((error: unknown) => {
        if (!failed) {
          failed = true;
          firstError = error;
          this.requestStop();
        }
      }),
    );

    await Promise.all(slots);
    if (failed) throw firstError;
  }

  private async runSlot(): Promise<void> {
    let idleDelayMs = this.options.idlePollMinMs;

    while (!this.stopping) {
      const processed = await this.processor.processNext();
      if (this.stopping) return;

      if (processed !== null) {
        idleDelayMs = this.options.idlePollMinMs;
        continue;
      }

      await this.sleeper(idleDelayMs, this.idleAbortController.signal);
      if (this.stopping) return;

      idleDelayMs = Math.min(
        this.options.idlePollMaxMs,
        Math.max(this.options.idlePollMinMs, Math.ceil(idleDelayMs * this.options.idleBackoffFactor)),
      );
    }
  }
}

export interface RunAiWorkerProcessInput {
  runtime: AiWorkerRuntime;
  shutdownSignal: AbortSignal;
  closeDatabase: () => Promise<void>;
}

export async function runAiWorkerProcess(input: RunAiWorkerProcessInput): Promise<void> {
  const requestStop = () => input.runtime.requestStop();
  input.shutdownSignal.addEventListener("abort", requestStop, { once: true });
  if (input.shutdownSignal.aborted) input.runtime.requestStop();

  let runFailed = false;
  let runError: unknown;
  try {
    await input.runtime.run();
  } catch (error) {
    runFailed = true;
    runError = error;
  } finally {
    input.shutdownSignal.removeEventListener("abort", requestStop);
  }

  let closeFailed = false;
  let closeError: unknown;
  try {
    await input.closeDatabase();
  } catch (error) {
    closeFailed = true;
    closeError = error;
  }

  if (runFailed && closeFailed) {
    throw new AggregateError([runError, closeError], "ai_worker_run_and_close_failed");
  }
  if (runFailed) throw runError;
  if (closeFailed) throw closeError;
}
