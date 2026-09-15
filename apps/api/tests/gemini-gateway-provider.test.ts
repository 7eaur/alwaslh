import assert from "node:assert/strict";
import test from "node:test";
import type { AiGenerationRequest } from "../src/ai/contracts.js";
import { GeminiGatewayProvider } from "../src/ai/gemini-gateway-provider.js";
import { buildPromptEnvelope } from "../src/ai/prompt-registry.js";
import { AiProviderError } from "../src/ai/provider.js";
import type { Database, QueryExecutor } from "../src/db.js";
import type { MediaStorage } from "../src/media/storage.js";

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
            ocrExtractionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
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

test("Gemini gateway provider sends approved OCR grounding without loading image bytes", async () => {
  let databaseReads = 0;
  let storageReads = 0;
  let capturedBody = "";
  const database = fakeDatabase(async () => {
    databaseReads += 1;
    return [];
  });
  const storage = fakeStorage(async () => {
    storageReads += 1;
    return Buffer.alloc(0);
  });
  const provider = new GeminiGatewayProvider(
    database,
    storage,
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
      return new Response(
        JSON.stringify({
          responseId: "response-1",
          modelVersion: "gemini-2.5-flash",
          candidates: [{ content: { parts: [{ text: JSON.stringify(generatedOutput()) }] } }],
          usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 30 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );

  const result = await provider.generate({
    envelope: buildPromptEnvelope(request("approved_ocr")),
    modelKey: "gemini-2.5-flash",
    projectAlias: undefined,
    credentialAlias: undefined,
  });

  assert.equal(databaseReads, 0);
  assert.equal(storageReads, 0);
  assert.match(capturedBody, /الماء صيغته H2O/);
  assert.doesNotMatch(capturedBody, /```/);
  assert.deepEqual(result.output, generatedOutput());
  assert.deepEqual(result.usage, { inputTokens: 20, outputTokens: 30 });
  assert.equal(result.providerRequestId, "response-1");
});

test("Gemini gateway provider resolves canonical ai media bytes for vision fallback", async () => {
  let storageKey = "";
  let capturedBody = "";
  const database = fakeDatabase(async (text, values) => {
    assert.match(text, /kind = 'ai'/);
    assert.deepEqual(values, ["11111111-1111-4111-8111-111111111111", "a".repeat(64)]);
    return [
      {
        storage_key: "media/source/ai-v1.png",
        mime_type: "image/png",
        byte_size: "3",
      },
    ];
  });
  const storage = fakeStorage(async (key) => {
    storageKey = key;
    return Buffer.from([1, 2, 3]);
  });
  const provider = new GeminiGatewayProvider(
    database,
    storage,
    {
      apiKey: "secret-test-key",
      baseUrl: "https://gateway.example/v1beta",
      timeoutMs: 10_000,
      maxInlineBytes: 1_048_576,
    },
    async (_url, init) => {
      capturedBody = String(init?.body ?? "");
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify(generatedOutput()) }] } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  );

  await provider.generate({
    envelope: buildPromptEnvelope(request("vision_fallback")),
    modelKey: "gemini-2.5-flash",
    projectAlias: undefined,
    credentialAlias: undefined,
  });

  assert.equal(storageKey, "media/source/ai-v1.png");
  assert.match(capturedBody, /SOURCE_IMAGE/);
  assert.match(capturedBody, /AQID/);
  assert.match(capturedBody, /image\/png/);
});

test("Gemini gateway provider classifies throttling as retryable without exposing credentials", async () => {
  const provider = new GeminiGatewayProvider(
    fakeDatabase(async () => []),
    fakeStorage(async () => Buffer.alloc(0)),
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
    fakeDatabase(async () => []),
    fakeStorage(async () => Buffer.alloc(0)),
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
