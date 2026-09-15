import assert from "node:assert/strict";
import test from "node:test";
import type { AiGenerationRequest } from "../src/ai/contracts.js";
import { GeminiGatewayProvider } from "../src/ai/gemini-gateway-provider.js";
import { buildPromptEnvelope } from "../src/ai/prompt-registry.js";
import { AiProviderError } from "../src/ai/provider.js";
import type { Database, QueryExecutor } from "../src/db.js";
import type { MediaStorage } from "../src/media/public.js";

function fakeDatabase(
  queryImpl: (text: string, values: readonly unknown[]) => Promise<readonly Record<string, unknown>[]>,
): Database {
  const executor: QueryExecutor = {
    async query<T>(text: string, values: readonly unknown[] = []) {
      return (await queryImpl(text, values)) as readonly T[];
    },
  };
  return {
    ...executor,
    async ping() {},
    async transaction<T>(work: (tx: QueryExecutor) => Promise<T>) {
      return work(executor);
    },
    async close() {},
  };
}

function fakeStorage(readImpl: (key: string) => Promise<Buffer>): MediaStorage {
  return {
    async put() {},
    read: readImpl,
    async exists() {
      return true;
    },
    async remove() {},
  };
}

function generatedOutput() {
  return {
    kind: "question_set",
    questions: [
      {
        prompt: "ما الصيغة الكيميائية للماء؟",
        type: "multiple_choice",
        options: ["H2O", "CO2", "N2", "O2"],
        correctOptionIndex: 0,
        answerText: "H2O",
        answerStatus: "known",
        difficulty: "easy",
        explanation: "الإجابة الصحيحة هي H2O لأنها الصيغة المذكورة في المصدر.",
        method: "١- نرجع إلى المصدر. ٢- نحدد الصيغة.",
        sourceEvidence: [
          {
            mediaAssetId: "11111111-1111-4111-8111-111111111111",
            pageNumber: 12,
            quote: "الماء صيغته H2O",
          },
        ],
      },
    ],
  };
}

function request(sourceKind: "approved_ocr" | "vision_fallback"): AiGenerationRequest {
  const common = {
    mediaAssetId: "11111111-1111-4111-8111-111111111111",
    pageNumber: 12,
    inputChecksumSha256: "a".repeat(64),
    contentSourceAssetId: null,
  };
  return {
    mode: "question_generation",
    language: "ar",
    subjectDomain: "chemistry",
    sourceSensitivity: "standard",
    notationPolicy: "arabic_visible_numerals",
    sourceChunks:
      sourceKind === "approved_ocr"
        ? [
            {
              ...common,
              inputKind: "approved_ocr",
              ocrExtractionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              approvedText: "الماء صيغته H2O.",
              ocrReviewStatus: "approved",
            },
          ]
        : [
            {
              ...common,
              inputKind: "vision_fallback",
              ocrExtractionId: null,
              approvedText: null,
              ocrReviewStatus: null,
            },
          ],
    target: { multipleChoice: 1, trueFalse: 0, direct: 0 },
  };
}

function mediaDatabase(onRead?: () => void): Database {
  return fakeDatabase(async (text, values) => {
    onRead?.();
    assert.match(text, /kind = 'ai'/);
    assert.deepEqual(values, ["11111111-1111-4111-8111-111111111111", "a".repeat(64)]);
    return [
      {
        storage_key: "media/source/ai-v1.webp",
        mime_type: "image/webp",
        byte_size: "3",
      },
    ];
  });
}

function mediaStorage(onRead?: (key: string) => void): MediaStorage {
  return fakeStorage(async (key) => {
    onRead?.(key);
    return Buffer.from([1, 2, 3]);
  });
}

function successResponse() {
  return new Response(
    JSON.stringify({
      responseId: "response-1",
      modelVersion: "gemini-2.5-flash",
      candidates: [{ content: { parts: [{ text: JSON.stringify(generatedOutput()) }] } }],
      usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 30 },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

test("Gemini gateway provider sends canonical image directly even when approved OCR exists", async () => {
  let databaseReads = 0;
  let storageReads = 0;
  let capturedBody = "";
  const provider = new GeminiGatewayProvider(
    mediaDatabase(() => {
      databaseReads += 1;
    }),
    mediaStorage(() => {
      storageReads += 1;
    }),
    {
      apiKey: "secret-test-key",
      baseUrl: "https://gateway.example/v1beta/",
      timeoutMs: 10_000,
      maxInlineBytes: 1_048_576,
    },
    async (_url, init) => {
      capturedBody = String(init?.body ?? "");
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("X-Gateway-Authorization"), "Bearer secret-test-key");
      return successResponse();
    },
  );

  const result = await provider.generate({
    envelope: buildPromptEnvelope(request("approved_ocr")),
    modelKey: "gemini-2.5-flash",
    projectAlias: undefined,
    credentialAlias: undefined,
  });

  assert.equal(databaseReads, 1);
  assert.equal(storageReads, 1);
  assert.match(capturedBody, /GROUNDING_MODE: direct_canonical_images/);
  assert.match(capturedBody, /SOURCE_IMAGE/);
  assert.match(capturedBody, /AQID/);
  assert.match(capturedBody, /image\/webp/);
  assert.doesNotMatch(capturedBody, /الماء صيغته H2O\./);
  assert.doesNotMatch(capturedBody, /ocrExtractionId/);
  assert.deepEqual(result.output, generatedOutput());
  assert.deepEqual(result.usage, { inputTokens: 20, outputTokens: 30 });
  assert.equal(result.providerRequestId, "response-1");
});

test("Gemini gateway provider resolves canonical ai media bytes for vision fallback", async () => {
  let storageKey = "";
  let capturedBody = "";
  const provider = new GeminiGatewayProvider(
    mediaDatabase(),
    mediaStorage((key) => {
      storageKey = key;
    }),
    {
      apiKey: "secret-test-key",
      baseUrl: "https://gateway.example/v1beta",
      timeoutMs: 10_000,
      maxInlineBytes: 1_048_576,
    },
    async (_url, init) => {
      capturedBody = String(init?.body ?? "");
      return successResponse();
    },
  );

  await provider.generate({
    envelope: buildPromptEnvelope(request("vision_fallback")),
    modelKey: "gemini-2.5-flash",
    projectAlias: undefined,
    credentialAlias: undefined,
  });

  assert.equal(storageKey, "media/source/ai-v1.webp");
  assert.match(capturedBody, /SOURCE_IMAGE/);
  assert.match(capturedBody, /AQID/);
  assert.match(capturedBody, /image\/webp/);
});

test("Gemini gateway provider de-duplicates identical source images before sending them", async () => {
  let databaseReads = 0;
  let capturedBody = "";
  const duplicateRequest = request("vision_fallback");
  const firstSource = duplicateRequest.sourceChunks[0];
  assert.ok(firstSource);
  duplicateRequest.sourceChunks.push({ ...firstSource });
  const provider = new GeminiGatewayProvider(
    mediaDatabase(() => {
      databaseReads += 1;
    }),
    mediaStorage(),
    {
      apiKey: "secret-test-key",
      baseUrl: "https://gateway.example/v1beta",
      timeoutMs: 10_000,
      maxInlineBytes: 1_048_576,
    },
    async (_url, init) => {
      capturedBody = String(init?.body ?? "");
      return successResponse();
    },
  );

  await provider.generate({
    envelope: buildPromptEnvelope(duplicateRequest),
    modelKey: "gemini-2.5-flash",
    projectAlias: undefined,
    credentialAlias: undefined,
  });

  assert.equal(databaseReads, 1);
  assert.equal((capturedBody.match(/inlineData/g) ?? []).length, 1);
});

test("Gemini gateway provider classifies throttling as retryable without exposing credentials", async () => {
  const provider = new GeminiGatewayProvider(
    mediaDatabase(),
    mediaStorage(),
    {
      apiKey: "super-secret-value",
      baseUrl: "https://gateway.example/v1beta",
      timeoutMs: 10_000,
      maxInlineBytes: 1_048_576,
    },
    async () =>
      new Response("rate limited", {
        status: 429,
        headers: { "retry-after": "2" },
      }),
  );

  await assert.rejects(
    provider.generate({
      envelope: buildPromptEnvelope(request("approved_ocr")),
      modelKey: "gemini-2.5-flash",
      projectAlias: undefined,
      credentialAlias: undefined,
    }),
    (error: unknown) => {
      assert.ok(error instanceof AiProviderError);
      assert.equal(error.code, "gemini_gateway_http_429");
      assert.equal(error.retryable, true);
      assert.equal(error.retryAfterMs, 2_000);
      assert.doesNotMatch(error.message, /super-secret-value/);
      return true;
    },
  );
});

test("Gemini gateway provider treats authentication failure as non-retryable and secret-safe", async () => {
  const provider = new GeminiGatewayProvider(
    mediaDatabase(),
    mediaStorage(),
    {
      apiKey: "super-secret-value",
      baseUrl: "https://gateway.example/v1beta",
      timeoutMs: 10_000,
      maxInlineBytes: 1_048_576,
    },
    async () => new Response("unauthorized", { status: 401 }),
  );

  await assert.rejects(
    provider.generate({
      envelope: buildPromptEnvelope(request("approved_ocr")),
      modelKey: "gemini-2.5-flash",
      projectAlias: undefined,
      credentialAlias: undefined,
    }),
    (error: unknown) => {
      assert.ok(error instanceof AiProviderError);
      assert.equal(error.code, "gemini_gateway_http_401");
      assert.equal(error.retryable, false);
      assert.doesNotMatch(error.message, /super-secret-value/);
      return true;
    },
  );
});
