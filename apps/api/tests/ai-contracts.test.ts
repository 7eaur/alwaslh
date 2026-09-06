import assert from "node:assert/strict";
import test from "node:test";
import {
  type AiBenchmarkAdapter,
  runAiBenchmark,
  summarizeAiBenchmark,
} from "../src/ai/benchmark.js";
import { aiGenerationModeSchema } from "../src/ai/contracts.js";
import {
  buildPromptEnvelope,
  getPromptDefinition,
  listPromptDefinitions,
} from "../src/ai/prompt-registry.js";
import { validateAiGenerationOutput } from "../src/ai/validators.js";
import { AI_GOLDEN_FIXTURES } from "./fixtures/ai-golden.js";

test("Stage11 prompt registry covers every generation mode with unique versioned identities", () => {
  const definitions = listPromptDefinitions();
  assert.equal(definitions.length, aiGenerationModeSchema.options.length);
  assert.deepEqual(
    new Set(definitions.map((definition) => definition.mode)),
    new Set(aiGenerationModeSchema.options),
  );
  assert.equal(
    new Set(definitions.map((definition) => `${definition.key}@${definition.version}`)).size,
    definitions.length,
  );

  for (const mode of aiGenerationModeSchema.options) {
    const definition = getPromptDefinition(mode);
    assert.equal(definition.mode, mode);
    assert.match(definition.key, /^[a-z0-9_.-]+$/);
    assert.match(definition.version, /^\d+\.\d+\.\d+$/);
    assert.ok(definition.instructions.length > 0);
  }
});

test("Stage11 golden fixtures enforce schema, provenance, answer, notation and review rules", () => {
  for (const fixture of AI_GOLDEN_FIXTURES) {
    const validation = validateAiGenerationOutput(fixture.request, fixture.output);
    assert.equal(validation.status, fixture.expectedStatus, fixture.id);
    for (const expectedCode of fixture.expectedIssueCodes ?? []) {
      assert.ok(
        validation.issues.some((issue) => issue.code === expectedCode),
        `${fixture.id}: missing ${expectedCode}; got ${validation.issues.map((issue) => issue.code).join(", ")}`,
      );
    }
  }
});

test("exact extraction never needs a fabricated answer to satisfy the contract", () => {
  const fixture = AI_GOLDEN_FIXTURES.find((item) => item.id === "exact-exam-unproven-answer-review");
  assert.ok(fixture);
  const validation = validateAiGenerationOutput(fixture.request, fixture.output);
  assert.equal(validation.status, "review_required");
  assert.equal(validation.output?.kind, "question_set");
  if (validation.output?.kind !== "question_set") return;
  const question = validation.output.questions[0];
  assert.equal(question?.answerStatus, "unknown");
  assert.equal(question?.correctOptionIndex, null);
  assert.equal(question?.answerText, null);
});

test("prompt envelope is provider-neutral and keeps reproducible key/version metadata", () => {
  const fixture = AI_GOLDEN_FIXTURES.find((item) => item.id === "science-mcq-valid-formula-digits");
  assert.ok(fixture);
  const envelope = buildPromptEnvelope(fixture.request);
  assert.equal(envelope.promptKey, "questions.generate");
  assert.equal(envelope.promptVersion, "1.0.0");
  assert.equal(envelope.mode, "question_generation");
  assert.equal(envelope.outputKind, "question_set");
  assert.ok(envelope.systemInstructions.some((instruction) => instruction.includes("لا تخترع")));
  assert.equal("provider" in envelope, false);
  assert.equal("model" in envelope, false);
});

test("benchmark harness compares adapters on the same contract and records failure without hiding it", async () => {
  const fixture = AI_GOLDEN_FIXTURES.find((item) => item.id === "science-mcq-valid-formula-digits");
  assert.ok(fixture);

  const adapters: AiBenchmarkAdapter[] = [
    {
      providerKey: "fixture-provider",
      modelKey: "valid-model",
      async generate() {
        return {
          output: fixture.output,
          usage: { inputTokens: 100, outputTokens: 60, estimatedCostUsd: 0.001 },
        };
      },
    },
    {
      providerKey: "fixture-provider",
      modelKey: "failing-model",
      async generate() {
        throw new Error("synthetic provider failure");
      },
    },
  ];

  const results = await runAiBenchmark([{ id: fixture.id, request: fixture.request }], adapters);
  assert.equal(results.length, 2);
  assert.equal(results[0]?.validation.status, "valid");
  assert.equal(results[1]?.validation.status, "invalid");
  assert.equal(results[1]?.errorCode, "adapter_error");

  const summary = summarizeAiBenchmark(results);
  assert.equal(summary.total, 2);
  assert.equal(summary.valid, 1);
  assert.equal(summary.invalid, 1);
  assert.equal(summary.totalInputTokens, 100);
  assert.equal(summary.totalOutputTokens, 60);
  assert.equal(summary.estimatedCostUsd, 0.001);
});
