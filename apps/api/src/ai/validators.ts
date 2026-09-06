import type { ZodIssue } from "zod";
import {
  type AiGenerationOutput,
  aiGenerationOutputSchema,
  type AiGenerationRequest,
  aiGenerationRequestSchema,
  type AiQuestion,
  type AiQuestionTarget,
  type AiSourceChunk,
  type AiSourceEvidence,
} from "./contracts.js";
import { getPromptDefinition } from "./prompt-registry.js";

export type AiValidationStatus = "valid" | "invalid" | "review_required";
export type AiValidationSeverity = "error" | "review" | "warning";

export interface AiValidationIssue {
  code: string;
  severity: AiValidationSeverity;
  path: string;
  message: string;
}

export interface AiValidationResult {
  status: AiValidationStatus;
  output?: AiGenerationOutput;
  issues: readonly AiValidationIssue[];
}

const EXACT_MODES = new Set<AiGenerationRequest["mode"]>([
  "exact_question_extraction",
  "exact_exam_extraction",
  "replica_question_extraction",
]);

const GENERATED_QUESTION_MODES = new Set<AiGenerationRequest["mode"]>([
  "question_generation",
  "comprehensive_lesson_content",
  "multi_version_quiz",
  "regenerate_question",
]);

function zodIssues(scope: string, issues: readonly ZodIssue[]): AiValidationIssue[] {
  return issues.map((issue) => ({
    code: "schema_invalid",
    severity: "error",
    path: [scope, ...issue.path].join("."),
    message: issue.message,
  }));
}

function normalizeComparable(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ar")
    .replace(/[\p{P}\p{S}\s]+/gu, " ")
    .trim();
}

function normalizeQuote(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function containsArabic(value: string): boolean {
  return /\p{Script=Arabic}/u.test(value);
}

function visibleWesternDigitCount(value: string): number {
  const withoutScientificTokens = value.replace(
    /\b(?=[A-Za-z0-9]*[A-Za-z])(?=[A-Za-z0-9]*\d)[A-Za-z][A-Za-z0-9]*(?:[()+\-./][A-Za-z0-9]+)*\b/g,
    "",
  );
  return (withoutScientificTokens.match(/[0-9]/g) ?? []).length;
}

function outputKindMatches(request: AiGenerationRequest, output: AiGenerationOutput): boolean {
  return getPromptDefinition(request.mode).outputKind === output.kind;
}

function flattenQuestions(output: AiGenerationOutput): readonly AiQuestion[] {
  if (output.kind === "question_set") return output.questions;
  if (output.kind === "lesson_content") return output.questions;
  if (output.kind === "multi_version_quiz") return output.versions.flatMap((version) => version.questions);
  return [];
}

function sourceKey(source: Pick<AiSourceChunk, "mediaAssetId" | "pageNumber">): string {
  return `${source.mediaAssetId}:${source.pageNumber}`;
}

function findSource(
  request: AiGenerationRequest,
  evidence: AiSourceEvidence,
): AiSourceChunk | undefined {
  return request.sourceChunks.find((source) => sourceKey(source) === sourceKey(evidence));
}

function pushIssue(
  issues: AiValidationIssue[],
  code: string,
  severity: AiValidationSeverity,
  path: string,
  message: string,
): void {
  issues.push({ code, severity, path, message });
}

function validateEvidence(
  request: AiGenerationRequest,
  evidence: readonly AiSourceEvidence[],
  path: string,
  issues: AiValidationIssue[],
  exactMode: boolean,
): void {
  if (evidence.length === 0) {
    pushIssue(issues, "provenance_missing", "error", path, "source/page provenance is required");
    return;
  }

  for (const [index, item] of evidence.entries()) {
    const itemPath = `${path}.${index}`;
    const source = findSource(request, item);
    if (!source) {
      pushIssue(
        issues,
        "provenance_outside_request",
        "error",
        itemPath,
        "evidence references a media/page outside the request source set",
      );
      continue;
    }

    if (item.ocrExtractionId && source.ocrExtractionId && item.ocrExtractionId !== source.ocrExtractionId) {
      pushIssue(
        issues,
        "provenance_ocr_mismatch",
        "error",
        `${itemPath}.ocrExtractionId`,
        "evidence OCR extraction does not match the approved source chunk",
      );
    }

    if (source.inputKind === "vision_fallback") {
      pushIssue(
        issues,
        "vision_fallback_review",
        "review",
        itemPath,
        "vision fallback evidence requires human review before publish",
      );
    }

    if (exactMode) {
      if (!item.quote?.trim()) {
        pushIssue(
          issues,
          "exact_quote_missing",
          "review",
          `${itemPath}.quote`,
          "exact-source output must carry a source quote when text evidence is available",
        );
      } else if (source.approvedText) {
        const sourceText = normalizeQuote(source.approvedText);
        const quote = normalizeQuote(item.quote);
        if (!sourceText.includes(quote)) {
          pushIssue(
            issues,
            "exact_quote_not_in_source",
            "error",
            `${itemPath}.quote`,
            "exact-source quote is not present in the approved OCR source text",
          );
        }
      }
    }
  }
}

function validateQuestionShape(question: AiQuestion, path: string, issues: AiValidationIssue[]): void {
  if (question.type === "multiple_choice" && question.options.length !== 4) {
    pushIssue(issues, "mcq_option_count", "error", `${path}.options`, "MCQ requires exactly four options");
  }
  if (
    question.type === "true_false" &&
    (question.options.length !== 2 || question.options[0] !== "صح" || question.options[1] !== "خطأ")
  ) {
    pushIssue(
      issues,
      "true_false_options",
      "error",
      `${path}.options`,
      'True/False options must be exactly ["صح", "خطأ"]',
    );
  }
  if (question.type === "direct" && question.options.length !== 0) {
    pushIssue(issues, "direct_options_present", "error", `${path}.options`, "direct questions must have no options");
  }

  if (question.answerStatus === "known") {
    if (question.type === "direct") {
      if (question.correctOptionIndex !== null) {
        pushIssue(
          issues,
          "direct_correct_index",
          "error",
          `${path}.correctOptionIndex`,
          "direct questions cannot have a correct option index",
        );
      }
      if (!question.answerText?.trim()) {
        pushIssue(issues, "known_answer_missing", "error", `${path}.answerText`, "known direct answer requires answerText");
      }
    } else {
      if (question.correctOptionIndex === null || question.correctOptionIndex >= question.options.length) {
        pushIssue(
          issues,
          "correct_index_invalid",
          "error",
          `${path}.correctOptionIndex`,
          "known option-based answer requires a valid option index",
        );
      } else {
        const selected = question.options[question.correctOptionIndex];
        if (!question.answerText || selected !== question.answerText) {
          pushIssue(
            issues,
            "answer_option_mismatch",
            "error",
            `${path}.answerText`,
            "answerText must exactly equal options[correctOptionIndex]",
          );
        }
      }
    }
  } else {
    if (question.correctOptionIndex !== null || question.answerText !== null) {
      pushIssue(
        issues,
        "uncertain_answer_claimed",
        "error",
        path,
        "unknown/review-required answers must not claim a correct option or answer text",
      );
    }
  }
}

function validateQuestionLanguageAndNotation(
  request: AiGenerationRequest,
  question: AiQuestion,
  path: string,
  issues: AiValidationIssue[],
  exactMode: boolean,
): void {
  const visibleFields = [question.prompt, ...question.options];
  if (question.explanation) visibleFields.push(question.explanation);
  if (question.method) visibleFields.push(question.method);

  if (!containsArabic(question.prompt)) {
    pushIssue(
      issues,
      "arabic_output_missing",
      exactMode ? "review" : "error",
      `${path}.prompt`,
      "Arabic educational question text is required",
    );
  }

  if (request.notationPolicy === "arabic_visible_numerals" && !exactMode) {
    const violations = visibleFields.reduce((sum, value) => sum + visibleWesternDigitCount(value), 0);
    if (violations > 0) {
      pushIssue(
        issues,
        "western_visible_digits",
        "error",
        path,
        "visible Arabic output contains Western digits outside scientific/formula tokens",
      );
    }
  }
}

function validateQuestion(
  request: AiGenerationRequest,
  question: AiQuestion,
  path: string,
  issues: AiValidationIssue[],
): void {
  const exactMode = EXACT_MODES.has(request.mode);
  validateQuestionShape(question, path, issues);
  validateEvidence(request, question.sourceEvidence, `${path}.sourceEvidence`, issues, exactMode);
  validateQuestionLanguageAndNotation(request, question, path, issues, exactMode);

  if (GENERATED_QUESTION_MODES.has(request.mode) && question.answerStatus !== "known") {
    pushIssue(
      issues,
      "generated_answer_uncertain",
      "review",
      `${path}.answerStatus`,
      "generated questions with an uncertain answer cannot be accepted without review",
    );
  }
  if (exactMode && question.answerStatus !== "known") {
    pushIssue(
      issues,
      "exact_answer_unproven",
      "review",
      `${path}.answerStatus`,
      "exact extraction correctly leaves an unproven answer unresolved",
    );
  }
  if (question.answerStatus === "known" && !question.explanation?.trim() && request.mode !== "exact_question_extraction") {
    pushIssue(
      issues,
      "explanation_missing",
      "review",
      `${path}.explanation`,
      "known educational answers should include an explanation before publish",
    );
  }
}

function questionCounts(questions: readonly AiQuestion[]): AiQuestionTarget {
  return {
    multipleChoice: questions.filter((question) => question.type === "multiple_choice").length,
    trueFalse: questions.filter((question) => question.type === "true_false").length,
    direct: questions.filter((question) => question.type === "direct").length,
  };
}

function validateTarget(
  questions: readonly AiQuestion[],
  target: AiQuestionTarget,
  path: string,
  issues: AiValidationIssue[],
): void {
  const actual = questionCounts(questions);
  for (const key of ["multipleChoice", "trueFalse", "direct"] as const) {
    if (actual[key] !== target[key]) {
      pushIssue(
        issues,
        "requested_count_mismatch",
        "error",
        path,
        `${key} requested ${target[key]} but received ${actual[key]}`,
      );
    }
  }
}

function validateRequestedCounts(
  request: AiGenerationRequest,
  output: AiGenerationOutput,
  issues: AiValidationIssue[],
): void {
  if (request.mode === "question_generation" && output.kind === "question_set") {
    validateTarget(output.questions, request.target, "questions", issues);
  }
  if (request.mode === "comprehensive_lesson_content" && output.kind === "lesson_content") {
    validateTarget(output.questions, request.target, "questions", issues);
  }
  if (request.mode === "multi_version_quiz" && output.kind === "multi_version_quiz") {
    if (output.versions.length !== request.versionCount) {
      pushIssue(
        issues,
        "version_count_mismatch",
        "error",
        "versions",
        `requested ${request.versionCount} versions but received ${output.versions.length}`,
      );
    }
    for (const [index, version] of output.versions.entries()) {
      validateTarget(version.questions, request.targetPerVersion, `versions.${index}.questions`, issues);
    }
  }
  if (
    (request.mode === "exact_question_extraction" ||
      request.mode === "exact_exam_extraction" ||
      request.mode === "replica_question_extraction") &&
    output.kind === "question_set" &&
    request.expectedQuestionCount !== undefined &&
    output.questions.length !== request.expectedQuestionCount
  ) {
    pushIssue(
      issues,
      "exact_question_count_mismatch",
      "error",
      "questions",
      `expected ${request.expectedQuestionCount} source questions but received ${output.questions.length}`,
    );
  }
  if (request.mode === "regenerate_question" && output.kind === "question_set") {
    if (output.questions.length !== 1) {
      pushIssue(issues, "regenerate_count", "error", "questions", "regenerate mode must return exactly one question");
      return;
    }
    const regenerated = output.questions[0];
    if (!regenerated) return;
    if (regenerated.type !== request.originalQuestion.type) {
      pushIssue(issues, "regenerate_type_changed", "error", "questions.0.type", "regeneration must preserve question type");
    }
    if (regenerated.difficulty !== request.originalQuestion.difficulty) {
      pushIssue(
        issues,
        "regenerate_difficulty_changed",
        "error",
        "questions.0.difficulty",
        "regeneration must preserve difficulty",
      );
    }
    if (normalizeComparable(regenerated.prompt) === normalizeComparable(request.originalQuestion.prompt)) {
      pushIssue(
        issues,
        "regenerate_not_changed",
        "error",
        "questions.0.prompt",
        "regenerated question must differ from the original wording",
      );
    }
  }
}

function validateDuplicates(
  request: AiGenerationRequest,
  output: AiGenerationOutput,
  issues: AiValidationIssue[],
): void {
  const seen = new Map<string, number>();
  const questions = flattenQuestions(output);
  const exactMode = EXACT_MODES.has(request.mode);
  for (const [index, question] of questions.entries()) {
    const normalized = normalizeComparable(question.prompt);
    const prior = seen.get(normalized);
    if (prior !== undefined) {
      pushIssue(
        issues,
        "duplicate_question",
        exactMode ? "review" : "error",
        `questions.${index}.prompt`,
        `question duplicates question ${prior + 1}`,
      );
    } else {
      seen.set(normalized, index);
    }
  }
}

function validateSummaryEvidence(
  request: AiGenerationRequest,
  output: AiGenerationOutput,
  issues: AiValidationIssue[],
): void {
  if (output.kind === "summary") {
    validateEvidence(request, output.sourceEvidence, "sourceEvidence", issues, false);
    if (!containsArabic(output.summary)) {
      pushIssue(issues, "arabic_output_missing", "error", "summary", "Arabic summary text is required");
    }
  }
  if (output.kind === "lesson_content") {
    validateEvidence(request, output.summaryEvidence, "summaryEvidence", issues, false);
    if (!containsArabic(output.summary)) {
      pushIssue(issues, "arabic_output_missing", "error", "summary", "Arabic summary text is required");
    }
  }
  if (output.kind === "page_detection") {
    validateEvidence(request, output.sourceEvidence, "sourceEvidence", issues, false);
  }
}

export function validateAiGenerationOutput(
  requestInput: unknown,
  outputInput: unknown,
): AiValidationResult {
  const requestResult = aiGenerationRequestSchema.safeParse(requestInput);
  if (!requestResult.success) {
    return { status: "invalid", issues: zodIssues("request", requestResult.error.issues) };
  }
  const outputResult = aiGenerationOutputSchema.safeParse(outputInput);
  if (!outputResult.success) {
    return { status: "invalid", issues: zodIssues("output", outputResult.error.issues) };
  }

  const request = requestResult.data;
  const output = outputResult.data;
  const issues: AiValidationIssue[] = [];
  const definition = getPromptDefinition(request.mode);

  if (!outputKindMatches(request, output)) {
    pushIssue(
      issues,
      "output_kind_mismatch",
      "error",
      "kind",
      `${request.mode} requires output kind ${definition.outputKind}`,
    );
  }

  const questions = flattenQuestions(output);
  for (const [index, question] of questions.entries()) {
    validateQuestion(request, question, `questions.${index}`, issues);
  }
  validateRequestedCounts(request, output, issues);
  validateDuplicates(request, output, issues);
  validateSummaryEvidence(request, output, issues);

  if (definition.requiresHumanReview || request.sourceSensitivity === "exact_source") {
    pushIssue(
      issues,
      "mode_requires_human_review",
      "review",
      "mode",
      "this mode/source sensitivity requires Admin review before publish",
    );
  }
  if (request.subjectDomain === "religious" && EXACT_MODES.has(request.mode)) {
    pushIssue(
      issues,
      "religious_exact_review",
      "review",
      "subjectDomain",
      "exact religious/source text requires human review",
    );
  }

  const hasError = issues.some((issue) => issue.severity === "error");
  const hasReview = issues.some((issue) => issue.severity === "review");
  return {
    status: hasError ? "invalid" : hasReview ? "review_required" : "valid",
    output,
    issues,
  };
}
