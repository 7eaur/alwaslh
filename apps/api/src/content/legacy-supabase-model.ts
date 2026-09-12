import { createHash } from "node:crypto";
import { z } from "zod";

const legacyIndexSchema = z
  .union([
    z.number().int(),
    z
      .string()
      .trim()
      .regex(/^\d+$/)
      .transform((value) => Number(value)),
  ])
  .nullable()
  .optional();

export const legacyQuestionSchema = z
  .object({
    type: z.string().trim().min(1),
    question: z.string().trim().min(1),
    options: z.array(z.string()),
    correct_option_index: legacyIndexSchema,
    difficulty: z.string().trim().min(1).optional(),
    explanation: z.string().nullable().optional(),
  })
  .passthrough();

export const legacyPageSchema = z.object({
  id: z.string().uuid(),
  subject_id: z.string().uuid(),
  title: z.string().trim().min(1),
  image_urls: z.array(z.string().url()),
  summary: z.string().nullable().optional(),
  ai_questions: z.array(z.unknown()).default([]),
  page_number: z.number().int().positive().nullable(),
  created_at: z.string().min(1),
  extracted_text: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
  ai_thumbnails: z.array(z.string()).nullable().optional(),
  content_type: z.enum(["lesson", "exam_model"]),
});

export type LegacyPage = z.infer<typeof legacyPageSchema>;
export type LegacyQuestion = z.infer<typeof legacyQuestionSchema>;

export interface LogicalLesson {
  sourceKey: string;
  slug: string;
  title: string;
  normalizedTitle: string;
  position: number;
  firstPageNumber: number;
  lastPageNumber: number;
  pages: LegacyPage[];
}

export interface UnresolvedPage {
  legacyPageId: string;
  reason: "missing_page_number" | "missing_image" | "multiple_images";
}

export interface LogicalLessonPlan {
  lessons: LogicalLesson[];
  unresolvedPages: UnresolvedPage[];
}

export type TargetQuestionType = "multiple_choice" | "true_false" | "direct";
export type TargetAnswerStatus = "known" | "unknown" | "review_required";
export type TargetDifficulty = "easy" | "medium" | "hard";

export interface TargetQuestion {
  prompt: string;
  type: TargetQuestionType;
  options: string[];
  correctOptionIndex: number | null;
  answerText: string | null;
  answerStatus: TargetAnswerStatus;
  difficulty: TargetDifficulty;
  explanation: string | null;
  method: null;
}

export type QuestionNormalizationResult =
  | {
      state: "ready";
      question: TargetQuestion;
      sourceType: string;
      inferredType: boolean;
    }
  | {
      state: "unresolved";
      reason:
        | "invalid_shape"
        | "invalid_difficulty"
        | "unsupported_question_type"
        | "unsupported_two_option_mcq";
      sourceType: string | null;
    };

function normalizeArabicDigits(value: string): string {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabic = "۰۱۲۳۴۵۶۷۸۹";
  return [...value]
    .map((char) => {
      const first = arabicIndic.indexOf(char);
      if (first >= 0) return String(first);
      const second = easternArabic.indexOf(char);
      if (second >= 0) return String(second);
      return char;
    })
    .join("");
}

export function normalizeFingerprintText(value: string): string {
  return normalizeArabicDigits(value.normalize("NFKC"))
    .replace(/[\u0640\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/\p{P}+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizedLessonTitle(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(object)
        .sort()
        .map((key) => [key, canonicalize(object[key])]),
    );
  }
  return value;
}

export function canonicalDigest(value: unknown): string {
  return sha256(JSON.stringify(canonicalize(value)));
}

export function stableUuid(seed: string): string {
  const bytes = createHash("sha256").update(seed).digest().subarray(0, 16);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function buildLogicalLessonPlan(
  legacySubjectId: string,
  input: readonly LegacyPage[],
): LogicalLessonPlan {
  const pages = [...input].sort((left, right) => {
    const leftPage = left.page_number ?? Number.MAX_SAFE_INTEGER;
    const rightPage = right.page_number ?? Number.MAX_SAFE_INTEGER;
    if (leftPage !== rightPage) return leftPage - rightPage;
    if (left.created_at !== right.created_at) return left.created_at.localeCompare(right.created_at);
    return left.id.localeCompare(right.id);
  });

  const unresolvedPages: UnresolvedPage[] = [];
  const eligible: LegacyPage[] = [];
  for (const page of pages) {
    if (page.page_number === null) {
      unresolvedPages.push({ legacyPageId: page.id, reason: "missing_page_number" });
      continue;
    }
    if (page.image_urls.length === 0) {
      unresolvedPages.push({ legacyPageId: page.id, reason: "missing_image" });
      continue;
    }
    if (page.image_urls.length > 1) {
      unresolvedPages.push({ legacyPageId: page.id, reason: "multiple_images" });
      continue;
    }
    eligible.push(page);
  }

  const lessons: LogicalLesson[] = [];
  let current: LegacyPage[] = [];
  let currentTitle = "";

  const flush = () => {
    const first = current[0];
    const last = current[current.length - 1];
    if (!first || !last || first.page_number === null || last.page_number === null) return;
    const sourceKey = `${legacySubjectId}:${first.id}`;
    lessons.push({
      sourceKey,
      slug: `legacy-sb-${sha256(sourceKey).slice(0, 20)}`,
      title: normalizedLessonTitle(first.title),
      normalizedTitle: currentTitle,
      position: lessons.length,
      firstPageNumber: first.page_number,
      lastPageNumber: last.page_number,
      pages: current,
    });
    current = [];
  };

  for (const page of eligible) {
    const title = normalizedLessonTitle(page.title);
    const previous = current[current.length - 1];
    const contiguous =
      previous?.page_number !== null &&
      previous?.page_number !== undefined &&
      page.page_number !== null &&
      page.page_number === previous.page_number + 1;
    if (current.length > 0 && (title !== currentTitle || !contiguous)) flush();
    if (current.length === 0) currentTitle = title;
    current.push(page);
  }
  flush();

  return { lessons, unresolvedPages };
}

function difficulty(value: string | undefined): TargetDifficulty | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "easy" || normalized === "medium" || normalized === "hard") return normalized;
  return null;
}

function booleanSemantic(value: string): boolean | null {
  const normalized = normalizeFingerprintText(value);
  if (normalized === "true" || normalized === "صح" || normalized === "صحيح") return true;
  if (normalized === "false" || normalized === "خطا" || normalized === "خطأ") return false;
  return null;
}

function cleanExplanation(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function validIndex(index: number | null | undefined, length: number): index is number {
  return index !== null && index !== undefined && Number.isInteger(index) && index >= 0 && index < length;
}

function normalizeTrueFalse(
  parsed: LegacyQuestion,
  sourceType: string,
  inferredType: boolean,
): QuestionNormalizationResult {
  if (parsed.options.length !== 2) {
    return { state: "unresolved", reason: "invalid_shape", sourceType };
  }
  const semantics = parsed.options.map(booleanSemantic);
  if (semantics[0] === null || semantics[1] === null || semantics[0] === semantics[1]) {
    return { state: "unresolved", reason: "invalid_shape", sourceType };
  }
  const resolvedDifficulty = difficulty(parsed.difficulty);
  if (!resolvedDifficulty) return { state: "unresolved", reason: "invalid_difficulty", sourceType };

  let correctOptionIndex: number | null = null;
  let answerText: string | null = null;
  let answerStatus: TargetAnswerStatus = inferredType ? "review_required" : "known";
  if (!validIndex(parsed.correct_option_index, parsed.options.length)) {
    answerStatus = "review_required";
  } else if (!inferredType) {
    const selected = semantics[parsed.correct_option_index];
    if (selected === true) {
      correctOptionIndex = 0;
      answerText = "صح";
    } else if (selected === false) {
      correctOptionIndex = 1;
      answerText = "خطأ";
    } else {
      answerStatus = "review_required";
    }
  }

  return {
    state: "ready",
    sourceType,
    inferredType,
    question: {
      prompt: parsed.question.trim(),
      type: "true_false",
      options: ["صح", "خطأ"],
      correctOptionIndex,
      answerText,
      answerStatus,
      difficulty: resolvedDifficulty,
      explanation: cleanExplanation(parsed.explanation),
      method: null,
    },
  };
}

export function normalizeLegacyQuestion(input: unknown): QuestionNormalizationResult {
  const parsedResult = legacyQuestionSchema.safeParse(input);
  if (!parsedResult.success) return { state: "unresolved", reason: "invalid_shape", sourceType: null };
  const parsed = parsedResult.data;
  const sourceType = parsed.type.trim().toLowerCase();
  const resolvedDifficulty = difficulty(parsed.difficulty);
  if (!resolvedDifficulty) return { state: "unresolved", reason: "invalid_difficulty", sourceType };

  if (sourceType === "true_false") return normalizeTrueFalse(parsed, sourceType, false);

  if (sourceType === "direct") {
    if (parsed.options.length !== 0) return { state: "unresolved", reason: "invalid_shape", sourceType };
    return {
      state: "ready",
      sourceType,
      inferredType: false,
      question: {
        prompt: parsed.question.trim(),
        type: "direct",
        options: [],
        correctOptionIndex: null,
        answerText: null,
        answerStatus: "unknown",
        difficulty: resolvedDifficulty,
        explanation: cleanExplanation(parsed.explanation),
        method: null,
      },
    };
  }

  if (sourceType === "mcq") {
    if (parsed.options.length === 2) {
      const semantics = parsed.options.map(booleanSemantic);
      if (semantics.every((value) => value !== null) && semantics[0] !== semantics[1]) {
        return normalizeTrueFalse(parsed, sourceType, true);
      }
      return { state: "unresolved", reason: "unsupported_two_option_mcq", sourceType };
    }
    if (parsed.options.length !== 4 || parsed.options.some((option) => option.trim().length === 0)) {
      return { state: "unresolved", reason: "invalid_shape", sourceType };
    }
    const index = parsed.correct_option_index;
    const known = validIndex(index, parsed.options.length);
    return {
      state: "ready",
      sourceType,
      inferredType: false,
      question: {
        prompt: parsed.question.trim(),
        type: "multiple_choice",
        options: parsed.options.map((option) => option.trim()),
        correctOptionIndex: known ? index : null,
        answerText: known ? (parsed.options[index]?.trim() ?? null) : null,
        answerStatus: known ? "known" : "review_required",
        difficulty: resolvedDifficulty,
        explanation: cleanExplanation(parsed.explanation),
        method: null,
      },
    };
  }

  if (
    (sourceType === "easy" || sourceType === "medium" || sourceType === "hard") &&
    parsed.options.length === 4 &&
    parsed.options.every((option) => option.trim().length > 0)
  ) {
    return {
      state: "ready",
      sourceType,
      inferredType: true,
      question: {
        prompt: parsed.question.trim(),
        type: "multiple_choice",
        options: parsed.options.map((option) => option.trim()),
        correctOptionIndex: null,
        answerText: null,
        answerStatus: "review_required",
        difficulty: resolvedDifficulty,
        explanation: cleanExplanation(parsed.explanation),
        method: null,
      },
    };
  }

  return { state: "unresolved", reason: "unsupported_question_type", sourceType };
}

export function questionFingerprint(logicalLessonSourceKey: string, question: TargetQuestion): string {
  return canonicalDigest({
    lesson: logicalLessonSourceKey,
    prompt: normalizeFingerprintText(question.prompt),
    type: question.type,
    options: question.options.map(normalizeFingerprintText),
    correctAnswer:
      question.answerStatus === "known"
        ? question.type === "direct"
          ? normalizeFingerprintText(question.answerText ?? "")
          : question.correctOptionIndex
        : null,
  });
}
