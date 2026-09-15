import type { Database } from "../db.js";
import type { MediaStorage } from "../media/public.js";
import type {
  AiGenerationMode,
  AiGenerationOutputKind,
  AiPromptEnvelope,
  AiSourceChunk,
} from "./contracts.js";
import {
  type AiProviderAdapter,
  AiProviderError,
  type AiProviderGenerateInput,
  type AiProviderGenerateResult,
} from "./provider.js";

interface GeminiGatewayProviderOptions {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  maxInlineBytes: number;
}

interface MediaVariantRow {
  storage_key: string;
  mime_type: string;
  byte_size: string;
}

interface GeminiGatewayResponse {
  responseId?: string;
  modelVersion?: string;
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function temperatureFor(mode: AiGenerationMode): number {
  if (
    mode === "exact_question_extraction" ||
    mode === "exact_exam_extraction" ||
    mode === "replica_question_extraction"
  ) {
    return 0;
  }
  if (
    mode === "question_generation" ||
    mode === "comprehensive_lesson_content" ||
    mode === "multi_version_quiz" ||
    mode === "regenerate_question"
  ) {
    return 0.3;
  }
  return 0.7;
}

function outputContract(kind: AiGenerationOutputKind): string {
  if (kind === "summary") {
    return '{"kind":"summary","summary":"...","sourceEvidence":[{"mediaAssetId":"uuid","pageNumber":1,"ocrExtractionId":"uuid-or-omit","quote":"optional exact source quote"}]}';
  }
  if (kind === "question_set") {
    return '{"kind":"question_set","questions":[{"prompt":"...","type":"multiple_choice|true_false|direct","options":["..."],"correctOptionIndex":0,"answerText":"...","answerStatus":"known|unknown|review_required","difficulty":"easy|medium|hard","explanation":"...","method":"...","sourceEvidence":[{"mediaAssetId":"uuid","pageNumber":1,"ocrExtractionId":"uuid-or-omit","quote":"optional source quote"}]}]}';
  }
  if (kind === "multi_version_quiz") {
    return '{"kind":"multi_version_quiz","versions":[{"label":"...","questions":[{"prompt":"...","type":"multiple_choice|true_false|direct","options":["..."],"correctOptionIndex":0,"answerText":"...","answerStatus":"known|unknown|review_required","difficulty":"easy|medium|hard","explanation":"...","method":"...","sourceEvidence":[{"mediaAssetId":"uuid","pageNumber":1,"quote":"optional source quote"}]}]}]}';
  }
  if (kind === "lesson_content") {
    return '{"kind":"lesson_content","summary":"...","summaryEvidence":[{"mediaAssetId":"uuid","pageNumber":1,"quote":"optional source quote"}],"questions":[{"prompt":"...","type":"multiple_choice|true_false|direct","options":["..."],"correctOptionIndex":0,"answerText":"...","answerStatus":"known|unknown|review_required","difficulty":"easy|medium|hard","explanation":"...","method":"...","sourceEvidence":[{"mediaAssetId":"uuid","pageNumber":1,"quote":"optional source quote"}]}]}';
  }
  return '{"kind":"page_detection","title":"...","pageNumber":1,"contentPreview":"...","sourceEvidence":[{"mediaAssetId":"uuid","pageNumber":1,"quote":"optional source quote"}]}';
}

function sourceManifest(source: AiSourceChunk): Record<string, unknown> {
  return {
    mediaAssetId: source.mediaAssetId,
    pageNumber: source.pageNumber,
    inputChecksumSha256: source.inputChecksumSha256,
    inputKind: source.inputKind,
    ocrExtractionId: source.ocrExtractionId,
    contentSourceAssetId: source.contentSourceAssetId ?? null,
    ...(source.inputKind === "approved_ocr" ? { approvedText: source.approvedText } : {}),
  };
}

function renderPrompt(envelope: AiPromptEnvelope): string {
  const manifest = envelope.request.sourceChunks.map(sourceManifest);
  return [
    `PROMPT_ID: ${envelope.promptKey}@${envelope.promptVersion}`,
    `MODE: ${envelope.mode}`,
    "SYSTEM_RULES:",
    ...envelope.systemInstructions.map((instruction, index) => `${index + 1}. ${instruction}`),
    "",
    "OUTPUT_CONTRACT:",
    outputContract(envelope.outputKind),
    "",
    "STRICT_OUTPUT_RULES:",
    "- Return one raw JSON object only. No markdown fences and no prose outside JSON.",
    "- Copy mediaAssetId/pageNumber/ocrExtractionId in sourceEvidence exactly from SOURCE_MANIFEST; never invent identifiers.",
    "- For a known multiple-choice or true/false answer: answerText MUST exactly equal options[correctOptionIndex].",
    "- For direct questions: options MUST be [] and correctOptionIndex MUST be null.",
    "- If the source does not prove an answer, use answerStatus=unknown or review_required and set answerText/correctOptionIndex to null.",
    "- Every generated/extracted question must include at least one sourceEvidence entry from the supplied sources.",
    "",
    "REQUEST_SETTINGS_JSON:",
    JSON.stringify(
      Object.fromEntries(Object.entries(envelope.request).filter(([key]) => key !== "sourceChunks")),
    ),
    "",
    "SOURCE_MANIFEST:",
    JSON.stringify(manifest),
    "",
    "Images tagged as SOURCE_IMAGE below are canonical ai media variants for vision_fallback sources.",
  ].join("\n");
}

function extractJsonText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function parseRetryAfterMs(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const date = Date.parse(value);
  if (!Number.isFinite(date)) return undefined;
  return Math.max(0, date - Date.now());
}

function providerErrorForStatus(status: number, retryAfter: string | null): AiProviderError {
  const retryable = status === 408 || status === 429 || status >= 500;
  return new AiProviderError(
    `gemini_gateway_http_${status}`,
    `Gemini gateway request failed with HTTP ${status}`,
    retryable,
    retryable ? parseRetryAfterMs(retryAfter) : undefined,
  );
}

export class GeminiGatewayProvider implements AiProviderAdapter {
  readonly providerKey = "gemini-gateway";
  private readonly baseUrl: string;

  constructor(
    private readonly database: Database,
    private readonly mediaStorage: MediaStorage,
    private readonly options: GeminiGatewayProviderOptions,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    if (!options.apiKey.trim()) throw new Error("ai_gateway_api_key_required");
    if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 1_000) {
      throw new Error("ai_gateway_timeout_invalid");
    }
    if (!Number.isInteger(options.maxInlineBytes) || options.maxInlineBytes < 1) {
      throw new Error("ai_gateway_inline_limit_invalid");
    }
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
  }

  async generate(input: AiProviderGenerateInput): Promise<AiProviderGenerateResult> {
    const parts: GeminiPart[] = [{ text: renderPrompt(input.envelope) }];
    let inlineBytes = 0;

    for (const source of input.envelope.request.sourceChunks) {
      if (source.inputKind !== "vision_fallback") continue;
      const rows = await this.database.query<MediaVariantRow>(
        `select storage_key, mime_type, byte_size
         from media_variants
         where media_asset_id = $1
           and kind = 'ai'
           and checksum_sha256 = $2
         order by profile_version desc
         limit 1`,
        [source.mediaAssetId, source.inputChecksumSha256],
      );
      const variant = rows[0];
      if (!variant) {
        throw new AiProviderError(
          "ai_source_media_missing",
          `AI media variant is missing for source ${source.mediaAssetId} page ${source.pageNumber}`,
          false,
        );
      }
      const declaredBytes = Number(variant.byte_size);
      if (!Number.isSafeInteger(declaredBytes) || declaredBytes < 0) {
        throw new AiProviderError("ai_source_media_size_invalid", "AI media variant size is invalid", false);
      }
      if (inlineBytes + declaredBytes > this.options.maxInlineBytes) {
        throw new AiProviderError(
          "ai_source_payload_too_large",
          "AI vision source payload exceeds the configured inline byte limit",
          false,
        );
      }
      const bytes = await this.mediaStorage.read(variant.storage_key);
      if (bytes.byteLength !== declaredBytes) {
        throw new AiProviderError(
          "ai_source_media_size_mismatch",
          "AI media variant size does not match its persisted metadata",
          false,
        );
      }
      inlineBytes += bytes.byteLength;
      parts.push({
        text: `SOURCE_IMAGE ${JSON.stringify({
          mediaAssetId: source.mediaAssetId,
          pageNumber: source.pageNumber,
          inputChecksumSha256: source.inputChecksumSha256,
        })}`,
      });
      parts.push({
        inlineData: {
          mimeType: variant.mime_type,
          data: bytes.toString("base64"),
        },
      });
    }

    const endpoint = `${this.baseUrl}/models/${encodeURIComponent(input.modelKey)}:generateContent`;
    let response: Response;
    try {
      response = await this.fetcher(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gateway-Authorization": `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: temperatureFor(input.envelope.mode),
            maxOutputTokens: 65_536,
            response_mime_type: "application/json",
          },
        }),
        signal: AbortSignal.timeout(this.options.timeoutMs),
      });
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      const name = error instanceof Error ? error.name : "";
      const retryable = name === "TimeoutError" || name === "AbortError";
      throw new AiProviderError(
        retryable ? "gemini_gateway_timeout" : "gemini_gateway_network",
        retryable ? "Gemini gateway request timed out" : "Gemini gateway network request failed",
        true,
      );
    }

    if (!response.ok) {
      throw providerErrorForStatus(response.status, response.headers.get("retry-after"));
    }

    let payload: GeminiGatewayResponse;
    try {
      payload = (await response.json()) as GeminiGatewayResponse;
    } catch {
      throw new AiProviderError(
        "gemini_gateway_response_invalid",
        "Gemini gateway returned a non-JSON response",
        false,
      );
    }

    const text = payload.candidates?.[0]?.content?.parts?.find((part) => typeof part.text === "string")?.text;
    if (!text) {
      throw new AiProviderError(
        "gemini_gateway_output_missing",
        "Gemini gateway response did not contain generated JSON text",
        false,
      );
    }

    let output: unknown;
    try {
      output = JSON.parse(extractJsonText(text));
    } catch {
      throw new AiProviderError(
        "gemini_gateway_output_invalid_json",
        "Gemini gateway generated invalid JSON",
        false,
      );
    }

    const inputTokens = payload.usageMetadata?.promptTokenCount;
    const outputTokens = payload.usageMetadata?.candidatesTokenCount;
    const usage =
      inputTokens !== undefined || outputTokens !== undefined
        ? {
            ...(inputTokens !== undefined ? { inputTokens } : {}),
            ...(outputTokens !== undefined ? { outputTokens } : {}),
          }
        : undefined;

    return {
      output,
      ...(usage ? { usage } : {}),
      ...(payload.responseId ? { providerRequestId: payload.responseId } : {}),
      ...(payload.modelVersion ? { metadata: { modelVersion: payload.modelVersion } } : {}),
    };
  }
}
