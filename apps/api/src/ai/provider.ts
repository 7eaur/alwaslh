import type { AiPromptEnvelope } from "./contracts.js";

export interface AiProviderUsage {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
}

export interface AiProviderGenerateInput {
  envelope: AiPromptEnvelope;
  modelKey: string;
  projectAlias: string | undefined;
  credentialAlias: string | undefined;
}

export interface AiProviderGenerateResult {
  output: unknown;
  usage?: AiProviderUsage;
  providerRequestId?: string;
  metadata?: Record<string, unknown>;
}

export interface AiProviderAdapter {
  providerKey: string;
  generate(input: AiProviderGenerateInput): Promise<AiProviderGenerateResult>;
}

export class AiProviderError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly retryAfterMs: number | undefined;

  constructor(code: string, message: string, retryable: boolean, retryAfterMs?: number) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
    this.retryable = retryable;
    this.retryAfterMs = retryAfterMs;
  }
}

export function classifyAiProviderError(error: unknown): AiProviderError {
  if (error instanceof AiProviderError) return error;
  if (error instanceof Error) return new AiProviderError("provider_error", error.message, false);
  return new AiProviderError("provider_error", String(error), false);
}
