export interface OcrProviderInput {
  bytes: Buffer;
  mimeType: string;
  languageHints: readonly string[];
  signal?: AbortSignal;
}

export interface OcrProviderResult {
  rawText: string;
  meanConfidence: number | null;
  metadata?: Record<string, unknown>;
}

export interface OcrProvider {
  readonly key: string;
  readonly version: string;
  extract(input: OcrProviderInput): Promise<OcrProviderResult>;
}

export class OcrProviderError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly retryable: boolean,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "OcrProviderError";
  }
}
