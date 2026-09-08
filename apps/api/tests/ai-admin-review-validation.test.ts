import assert from "node:assert/strict";
import test from "node:test";
import { validateAdminApprovalOutput, validateAdminEditedOutput } from "../src/ai/review-validation.js";
import { AppError } from "../src/errors.js";
import { AI_GOLDEN_FIXTURES } from "./fixtures/ai-golden.js";

function fixture(id: string) {
  const value = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === id);
  if (!value) throw new Error(`missing AI golden fixture: ${id}`);
  return value;
}

function assertAppError(error: unknown, code: "BAD_REQUEST" | "CONFLICT", statusCode: number): boolean {
  assert.ok(error instanceof AppError);
  assert.equal(error.code, code);
  assert.equal(error.statusCode, statusCode);
  return true;
}

test("Stage13E Admin review preserves Stage11 semantic validation authority", () => {
  const valid = fixture("science-mcq-valid-formula-digits");
  assert.deepEqual(validateAdminEditedOutput(valid.request, valid.output), valid.output);

  const semanticInvalid = fixture("generated-visible-western-digit-invalid");
  assert.throws(
    () => validateAdminEditedOutput(semanticInvalid.request, semanticInvalid.output),
    (error) => assertAppError(error, "BAD_REQUEST", 400),
  );

  const humanReviewRequired = fixture("exact-exam-unproven-answer-review");
  assert.deepEqual(
    validateAdminApprovalOutput(humanReviewRequired.request, humanReviewRequired.output),
    humanReviewRequired.output,
  );

  const invalidApproval = fixture("exact-quote-mismatch-invalid");
  assert.throws(
    () => validateAdminApprovalOutput(invalidApproval.request, invalidApproval.output),
    (error) => assertAppError(error, "CONFLICT", 409),
  );
});
