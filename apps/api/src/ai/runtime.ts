import type { AppConfig } from "../config.js";
import type { Database } from "../db.js";
import type { MediaStorage } from "../media/public.js";
import { AiExecutionService } from "./execution-service.js";
import { GeminiGatewayProvider } from "./gemini-gateway-provider.js";
import { AiModelRouter } from "./router.js";
import { AiWorkerRuntime } from "./worker-runtime.js";

const GEMINI_ROUTE_KEY = "gemini-gateway-primary";
const GEMINI_BENCHMARK_VERSION = "generation-contract-v1.2-direct-image";

export function createConfiguredAiWorker(
  config: AppConfig,
  database: Database,
  mediaStorage: MediaStorage,
): AiWorkerRuntime | null {
  if (!config.INTEGRATIONS_API_KEY) return null;

  const provider = new GeminiGatewayProvider(database, mediaStorage, {
    apiKey: config.INTEGRATIONS_API_KEY,
    baseUrl: config.AI_GATEWAY_BASE_URL,
    timeoutMs: config.AI_PROVIDER_TIMEOUT_MS,
    maxInlineBytes: config.AI_PROVIDER_MAX_INLINE_BYTES,
  });
  const router = new AiModelRouter(
    [
      {
        routeKey: GEMINI_ROUTE_KEY,
        providerKey: provider.providerKey,
        modelKey: config.AI_GEMINI_MODEL,
        benchmarkVersion: GEMINI_BENCHMARK_VERSION,
        tier: 1,
        capacity: {
          providerMaxConcurrent: config.AI_WORKER_CONCURRENCY,
          modelMaxConcurrent: config.AI_WORKER_CONCURRENCY,
        },
      },
    ],
    [provider],
  );
  const execution = new AiExecutionService(database, router, {
    leaseSeconds: 120,
    maxAttempts: 3,
    retryBaseMs: 2_000,
    retryMaxMs: 30_000,
    globalMaxConcurrent: config.AI_WORKER_CONCURRENCY,
    capacityBackoffMs: 500,
    operationalBackoffMs: 30_000,
  });
  return new AiWorkerRuntime(execution, {
    concurrency: config.AI_WORKER_CONCURRENCY,
  });
}
