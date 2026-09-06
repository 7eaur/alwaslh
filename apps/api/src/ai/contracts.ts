import { z } from "zod";

export const aiGenerationModeSchema = z.enum([
  "lesson_summary",
  "question_generation",
  "comprehensive_lesson_content",
  "multi_version_quiz",
  "exact_question_extraction",
  "exact_exam_extraction",
  "replica_question_extraction",
  "regenerate_question",
  "page_detection",
]);

export type AiGenerationMode = z.infer<typeof aiGenerationModeSchema>;

export const aiQuestionTypeSchema = z.enum(["multiple_choice", "true_false", "direct"]);
export type AiQuestionType = z.infer<typeof aiQuestionTypeSchema>;

export const aiDifficultySchema = z.enum(["easy", "medium", "hard"]);
export type AiDifficulty = z.infer<typeof aiDifficultySchema>;

export const aiAnswerStatusSchema = z.enum(["known", "unknown", "review_required"]);
export type AiAnswerStatus = z.infer<typeof aiAnswerStatusSchema>;

export const aiSubjectDomainSchema = z.enum([
  "general",
  "arabic_language",
  "religious",
  "mathematics",
  "physics",
  "chemistry",
  "biology",
  "history",
  "geography",
  "other",
]);
export type AiSubjectDomain = z.infer<typeof aiSubjectDomainSchema>;

export const aiSourceSensitivitySchema = z.enum(["standard", "scientific", "exact_source"]);
export type AiSourceSensitivity = z.infer<typeof aiSourceSensitivitySchema>;

export const aiNotationPolicySchema = z.enum(["arabic_visible_numerals", "preserve_source_exactly"]);
export type AiNotationPolicy = z.infer<typeof aiNotationPolicySchema>;

const checksumSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const aiSourceChunkSchema = z
  .object({
    mediaAssetId: z.string().uuid(),
    pageNumber: z.number().int().positive(),
    inputChecksumSha256: checksumSchema,
    inputKind: z.enum(["approved_ocr", "vision_fallback"]),
    ocrExtractionId: z.string().uuid().nullable(),
    approvedText: z.string().min(1).max(100_000).nullable(),
    ocrReviewStatus: z.enum(["not_required", "approved"]).nullable(),
    contentSourceAssetId: z.string().uuid().nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.inputKind === "approved_ocr") {
      if (!value.ocrExtractionId || !value.approvedText || !value.ocrReviewStatus) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "approved_ocr requires extraction id, approved text and approved review state",
        });
      }
    }
  });

export type AiSourceChunk = z.infer<typeof aiSourceChunkSchema>;

export const aiQuestionTargetSchema = z
  .object({
    multipleChoice: z.number().int().min(0).max(500),
    trueFalse: z.number().int().min(0).max(500),
    direct: z.number().int().min(0).max(500),
  })
  .refine((value) => value.multipleChoice + value.trueFalse + value.direct > 0, {
    message: "at least one requested question is required",
  });

export type AiQuestionTarget = z.infer<typeof aiQuestionTargetSchema>;

const requestBaseSchema = z.object({
  language: z.literal("ar"),
  subjectDomain: aiSubjectDomainSchema,
  sourceSensitivity: aiSourceSensitivitySchema,
  notationPolicy: aiNotationPolicySchema,
  sourceChunks: z.array(aiSourceChunkSchema).min(1).max(64),
});

export const aiGenerationRequestSchema = z.discriminatedUnion("mode", [
  requestBaseSchema.extend({
    mode: z.literal("lesson_summary"),
    lessonTitle: z.string().min(1).max(500).optional(),
  }),
  requestBaseSchema.extend({
    mode: z.literal("question_generation"),
    target: aiQuestionTargetSchema,
  }),
  requestBaseSchema.extend({
    mode: z.literal("comprehensive_lesson_content"),
    lessonTitle: z.string().min(1).max(500).optional(),
    target: aiQuestionTargetSchema,
  }),
  requestBaseSchema.extend({
    mode: z.literal("multi_version_quiz"),
    versionCount: z.number().int().min(1).max(20),
    targetPerVersion: aiQuestionTargetSchema,
  }),
  requestBaseSchema.extend({
    mode: z.literal("exact_question_extraction"),
    expectedQuestionCount: z.number().int().positive().max(500).optional(),
  }),
  requestBaseSchema.extend({
    mode: z.literal("exact_exam_extraction"),
    expectedQuestionCount: z.number().int().positive().max(500).optional(),
  }),
  requestBaseSchema.extend({
    mode: z.literal("replica_question_extraction"),
    expectedQuestionCount: z.number().int().positive().max(500).optional(),
  }),
  requestBaseSchema.extend({
    mode: z.literal("regenerate_question"),
    originalQuestion: z.object({
      prompt: z.string().min(1).max(10_000),
      type: aiQuestionTypeSchema,
      difficulty: aiDifficultySchema,
    }),
  }),
  requestBaseSchema.extend({
    mode: z.literal("page_detection"),
  }),
]);

export type AiGenerationRequest = z.infer<typeof aiGenerationRequestSchema>;

export const aiSourceEvidenceSchema = z.object({
  mediaAssetId: z.string().uuid(),
  pageNumber: z.number().int().positive(),
  ocrExtractionId: z.string().uuid().nullable().optional(),
  quote: z.string().min(1).max(8_000).optional(),
});

export type AiSourceEvidence = z.infer<typeof aiSourceEvidenceSchema>;

export const aiQuestionSchema = z.object({
  prompt: z.string().min(1).max(20_000),
  type: aiQuestionTypeSchema,
  options: z.array(z.string().min(1).max(5_000)).max(8),
  correctOptionIndex: z.number().int().min(0).nullable(),
  answerText: z.string().min(1).max(10_000).nullable(),
  answerStatus: aiAnswerStatusSchema,
  difficulty: aiDifficultySchema,
  explanation: z.string().min(1).max(30_000).nullable(),
  method: z.string().min(1).max(30_000).nullable(),
  sourceEvidence: z.array(aiSourceEvidenceSchema).max(16),
});

export type AiQuestion = z.infer<typeof aiQuestionSchema>;

export const aiGenerationOutputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("summary"),
    summary: z.string().min(1).max(100_000),
    sourceEvidence: z.array(aiSourceEvidenceSchema).min(1).max(64),
  }),
  z.object({
    kind: z.literal("question_set"),
    questions: z.array(aiQuestionSchema).max(1_000),
  }),
  z.object({
    kind: z.literal("multi_version_quiz"),
    versions: z
      .array(
        z.object({
          label: z.string().min(1).max(200),
          questions: z.array(aiQuestionSchema).max(500),
        }),
      )
      .max(20),
  }),
  z.object({
    kind: z.literal("lesson_content"),
    summary: z.string().min(1).max(100_000),
    summaryEvidence: z.array(aiSourceEvidenceSchema).min(1).max(64),
    questions: z.array(aiQuestionSchema).max(1_000),
  }),
  z.object({
    kind: z.literal("page_detection"),
    title: z.string().min(1).max(500),
    pageNumber: z.number().int().positive().nullable(),
    contentPreview: z.string().min(1).max(2_000),
    sourceEvidence: z.array(aiSourceEvidenceSchema).min(1).max(4),
  }),
]);

export type AiGenerationOutput = z.infer<typeof aiGenerationOutputSchema>;

export type AiGenerationOutputKind = AiGenerationOutput["kind"];

export interface AiPromptEnvelope {
  promptKey: string;
  promptVersion: string;
  mode: AiGenerationMode;
  outputKind: AiGenerationOutputKind;
  systemInstructions: readonly string[];
  request: AiGenerationRequest;
}
