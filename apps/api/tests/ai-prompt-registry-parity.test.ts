import assert from "node:assert/strict";
import test from "node:test";
import type { AiGenerationRequest } from "../src/ai/contracts.js";
import { buildPromptEnvelope, getPromptDefinition } from "../src/ai/prompt-registry.js";

const request: AiGenerationRequest = {
  mode: "question_generation",
  language: "ar",
  subjectDomain: "mathematics",
  sourceSensitivity: "standard",
  notationPolicy: "arabic_visible_numerals",
  sourceChunks: [
    {
      mediaAssetId: "11111111-1111-4111-8111-111111111111",
      pageNumber: 4,
      inputChecksumSha256: "b".repeat(64),
      inputKind: "approved_ocr",
      ocrExtractionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      approvedText: "محتوى درس معتمد.",
      ocrReviewStatus: "approved",
    },
  ],
  target: { multipleChoice: 2, trueFalse: 1, direct: 1 },
};

test("question generation prompt keeps legacy quality rules inside the grounded contract", () => {
  const definition = getPromptDefinition("question_generation");
  assert.equal(definition.version, "1.1.0");

  const envelope = buildPromptEnvelope(request);
  const rules = envelope.systemInstructions.join("\n");
  assert.match(rules, /المفاهيم والتعريفات والحقائق والأمثلة/);
  assert.match(rules, /correctOptionIndex/);
  assert.match(rules, /answerText/);
  assert.match(rules, /جا وجتا وظا/);
  assert.match(rules, /لا تخترع معلومة أو إجابة غير مدعومة بالمصدر/);
});
