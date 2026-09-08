import { AppError } from "../errors.js";
import type { AiGenerationOutput } from "./contracts.js";
import { validateAiGenerationOutput } from "./validators.js";

function reviewCandidateValidation(requestInput: unknown, candidateInput: unknown) {
  return validateAiGenerationOutput(requestInput, candidateInput);
}

export function isAdminApprovalCandidateAllowed(requestInput: unknown, candidateInput: unknown): boolean {
  const validation = reviewCandidateValidation(requestInput, candidateInput);
  return validation.status !== "invalid" && validation.output !== null;
}

function validateReviewCandidate(
  requestInput: unknown,
  candidateInput: unknown,
  errorCode: "BAD_REQUEST" | "CONFLICT",
  message: string,
  statusCode: 400 | 409,
): AiGenerationOutput {
  const validation = reviewCandidateValidation(requestInput, candidateInput);
  if (validation.status === "invalid" || !validation.output) {
    throw new AppError(errorCode, message, statusCode);
  }
  return validation.output;
}

export function validateAdminEditedOutput(
  requestInput: unknown,
  candidateInput: unknown,
): AiGenerationOutput {
  return validateReviewCandidate(
    requestInput,
    candidateInput,
    "BAD_REQUEST",
    "المخرج المعدل يخالف قواعد التحقق من محتوى الذكاء الاصطناعي",
    400,
  );
}

export function validateAdminApprovalOutput(
  requestInput: unknown,
  candidateInput: unknown,
): AiGenerationOutput {
  return validateReviewCandidate(
    requestInput,
    candidateInput,
    "CONFLICT",
    "يجب تصحيح المخرج قبل اعتماده",
    409,
  );
}
