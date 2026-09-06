import assert from "node:assert/strict";
import test from "node:test";
import type { AiGenerationRequest } from "../src/ai/contracts.js";
import type { AiProviderAdapter } from "../src/ai/provider.js";
import { AiModelRouter } from "../src/ai/router.js";

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
      approvedText: "الماء صيغته H2O.",
      ocrReviewStatus: "approved",
    },
  ],
  target: { multipleChoice: 1, trueFalse: 0, direct: 0 },
};

const adapter: AiProviderAdapter = {
  providerKey: "fake",
  async generate() {
    throw new Error("not used");
  },
};

test("Stage12 router filters by task policy and orders benchmark-approved tiers", () => {
  const router = new AiModelRouter(
    [
      {
        routeKey: "strong",
        providerKey: "fake",
        modelKey: "strong-model",
        benchmarkVersion: "bench-v1",
        tier: 2,
        modes: ["question_generation"],
      },
      {
        routeKey: "cheap",
        providerKey: "fake",
        modelKey: "cheap-model",
        benchmarkVersion: "bench-v1",
        tier: 1,
        modes: ["question_generation"],
        subjectDomains: ["chemistry"],
      },
      {
        routeKey: "disabled",
        providerKey: "fake",
        modelKey: "disabled-model",
        benchmarkVersion: "bench-v1",
        tier: 3,
        enabled: false,
      },
    ],
    [adapter],
  );

  assert.deepEqual(
    router.routesFor(request).map((route) => route.routeKey),
    ["cheap", "strong"],
  );
});

test("Stage12 router refuses routes whose provider adapter is missing", () => {
  assert.throws(
    () =>
      new AiModelRouter(
        [
          {
            routeKey: "missing",
            providerKey: "missing-provider",
            modelKey: "model",
            benchmarkVersion: "bench-v1",
            tier: 1,
          },
        ],
        [adapter],
      ),
    /ai_route_provider_missing/,
  );
});
