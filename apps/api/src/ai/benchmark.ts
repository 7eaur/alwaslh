import type { AiGenerationRequest, AiPromptEnvelope } from "./contracts.js";
import { buildPromptEnvelope } from "./prompt-registry.js";
import { type AiValidationResult, validateAiGenerationOutput } from "./validators.js";

export interface AiBenchmarkUsage {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
}

export interface AiBenchmarkProviderResult {
  output: unknown;
  usage?: AiBenchmarkUsage;
}

export interface AiBenchmarkAdapter {
  providerKey: string;
  modelKey: string;
  generate(envelope: AiPromptEnvelope): Promise<AiBenchmarkProviderResult>;
}

export interface AiBenchmarkCase {
  id: string;
  request: AiGenerationRequest;
}

export interface AiBenchmarkResult {
  caseId: string;
  providerKey: string;
  modelKey: string;
  promptKey: string;
  promptVersion: string;
  validation: AiValidationResult;
  latencyMs: number;
  usage: AiBenchmarkUsage;
  errorCode?: string;
  errorMessage?: string;
}

function classifyBenchmarkError(error: unknown): { code: string; message: string } {
  if (error instanceof Error) return { code: "adapter_error", message: error.message };
  return { code: "adapter_error", message: String(error) };
}

export async function runAiBenchmark(
  cases: readonly AiBenchmarkCase[],
  adapters: readonly AiBenchmarkAdapter[],
): Promise<readonly AiBenchmarkResult[]> {
  const results: AiBenchmarkResult[] = [];
  for (const benchmarkCase of cases) {
    const envelope = buildPromptEnvelope(benchmarkCase.request);
    for (const adapter of adapters) {
      const startedAt = Date.now();
      try {
        const providerResult = await adapter.generate(envelope);
        results.push({
          caseId: benchmarkCase.id,
          providerKey: adapter.providerKey,
          modelKey: adapter.modelKey,
          promptKey: envelope.promptKey,
          promptVersion: envelope.promptVersion,
          validation: validateAiGenerationOutput(benchmarkCase.request, providerResult.output),
          latencyMs: Math.max(0, Date.now() - startedAt),
          usage: providerResult.usage ?? {},
        });
      } catch (error) {
        const classified = classifyBenchmarkError(error);
        results.push({
          caseId: benchmarkCase.id,
          providerKey: adapter.providerKey,
          modelKey: adapter.modelKey,
          promptKey: envelope.promptKey,
          promptVersion: envelope.promptVersion,
          validation: {
            status: "invalid",
            issues: [
              {
                code: classified.code,
                severity: "error",
                path: "adapter",
                message: classified.message,
              },
            ],
          },
          latencyMs: Math.max(0, Date.now() - startedAt),
          usage: {},
          errorCode: classified.code,
          errorMessage: classified.message,
        });
      }
    }
  }
  return results;
}

export interface AiBenchmarkSummary {
  total: number;
  valid: number;
  reviewRequired: number;
  invalid: number;
  schemaOrSemanticAcceptanceRate: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCostUsd: number;
}

export function summarizeAiBenchmark(results: readonly AiBenchmarkResult[]): AiBenchmarkSummary {
  const total = results.length;
  const valid = results.filter((result) => result.validation.status === "valid").length;
  const reviewRequired = results.filter((result) => result.validation.status === "review_required").length;
  const invalid = total - valid - reviewRequired;
  const accepted = valid + reviewRequired;
  return {
    total,
    valid,
    reviewRequired,
    invalid,
    schemaOrSemanticAcceptanceRate: total === 0 ? 0 : accepted / total,
    totalInputTokens: results.reduce((sum, result) => sum + (result.usage.inputTokens ?? 0), 0),
    totalOutputTokens: results.reduce((sum, result) => sum + (result.usage.outputTokens ?? 0), 0),
    estimatedCostUsd: results.reduce((sum, result) => sum + (result.usage.estimatedCostUsd ?? 0), 0),
  };
}
