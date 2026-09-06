import type { AiGenerationRequest } from "../../src/ai/contracts.js";
import type { AiValidationStatus } from "../../src/ai/validators.js";

const MEDIA_A = "11111111-1111-4111-8111-111111111111";
const MEDIA_B = "22222222-2222-4222-8222-222222222222";
const OCR_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OCR_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const CHECKSUM_A = "a".repeat(64);
const CHECKSUM_B = "b".repeat(64);

const scienceSource = {
  mediaAssetId: MEDIA_A,
  pageNumber: 12,
  inputChecksumSha256: CHECKSUM_A,
  inputKind: "approved_ocr" as const,
  ocrExtractionId: OCR_A,
  approvedText: "الماء مركب كيميائي صيغته H2O، ويتكون من ذرتي هيدروجين وذرة أكسجين.",
  ocrReviewStatus: "approved" as const,
};

const exactSource = {
  mediaAssetId: MEDIA_B,
  pageNumber: 21,
  inputChecksumSha256: CHECKSUM_B,
  inputKind: "approved_ocr" as const,
  ocrExtractionId: OCR_B,
  approvedText: "اختر الإجابة الصحيحة: المادة التي لا يمكن قراءة إجابتها بوضوح من المصدر.",
  ocrReviewStatus: "approved" as const,
};

export interface AiGoldenFixture {
  id: string;
  request: AiGenerationRequest;
  output: unknown;
  expectedStatus: AiValidationStatus;
  expectedIssueCodes?: readonly string[];
}

export const AI_GOLDEN_FIXTURES: readonly AiGoldenFixture[] = [
  {
    id: "science-mcq-valid-formula-digits",
    request: {
      mode: "question_generation",
      language: "ar",
      subjectDomain: "chemistry",
      sourceSensitivity: "scientific",
      notationPolicy: "arabic_visible_numerals",
      sourceChunks: [scienceSource],
      target: { multipleChoice: 1, trueFalse: 0, direct: 0 },
    },
    output: {
      kind: "question_set",
      questions: [
        {
          prompt: "ما الصيغة الكيميائية للماء؟",
          type: "multiple_choice",
          options: ["CO2", "H2O", "N2", "NaCl"],
          correctOptionIndex: 1,
          answerText: "H2O",
          answerStatus: "known",
          difficulty: "easy",
          explanation: "الإجابة الصحيحة هي H2O لأنها الصيغة الواردة في المصدر.",
          method: "١- نحدد المادة المطلوبة. ٢- نطابق الصيغة مع المصدر.",
          sourceEvidence: [{ mediaAssetId: MEDIA_A, pageNumber: 12, ocrExtractionId: OCR_A }],
        },
      ],
    },
    expectedStatus: "valid",
  },
  {
    id: "generated-visible-western-digit-invalid",
    request: {
      mode: "question_generation",
      language: "ar",
      subjectDomain: "general",
      sourceSensitivity: "standard",
      notationPolicy: "arabic_visible_numerals",
      sourceChunks: [scienceSource],
      target: { multipleChoice: 1, trueFalse: 0, direct: 0 },
    },
    output: {
      kind: "question_set",
      questions: [
        {
          prompt: "كم عدد ذرات الهيدروجين في جزيء الماء؟",
          type: "multiple_choice",
          options: ["1", "٢", "٣", "٤"],
          correctOptionIndex: 1,
          answerText: "٢",
          answerStatus: "known",
          difficulty: "easy",
          explanation: "الإجابة الصحيحة هي ٢ كما يوضح المصدر.",
          method: "١- نقرأ الصيغة H2O. ٢- نحدد عدد ذرات الهيدروجين.",
          sourceEvidence: [{ mediaAssetId: MEDIA_A, pageNumber: 12, ocrExtractionId: OCR_A }],
        },
      ],
    },
    expectedStatus: "invalid",
    expectedIssueCodes: ["western_visible_digits"],
  },
  {
    id: "exact-exam-unproven-answer-review",
    request: {
      mode: "exact_exam_extraction",
      language: "ar",
      subjectDomain: "general",
      sourceSensitivity: "exact_source",
      notationPolicy: "preserve_source_exactly",
      sourceChunks: [exactSource],
      expectedQuestionCount: 1,
    },
    output: {
      kind: "question_set",
      questions: [
        {
          prompt: "اختر الإجابة الصحيحة: المادة التي لا يمكن قراءة إجابتها بوضوح من المصدر.",
          type: "direct",
          options: [],
          correctOptionIndex: null,
          answerText: null,
          answerStatus: "unknown",
          difficulty: "medium",
          explanation: null,
          method: null,
          sourceEvidence: [
            {
              mediaAssetId: MEDIA_B,
              pageNumber: 21,
              ocrExtractionId: OCR_B,
              quote: "اختر الإجابة الصحيحة: المادة التي لا يمكن قراءة إجابتها بوضوح من المصدر.",
            },
          ],
        },
      ],
    },
    expectedStatus: "review_required",
    expectedIssueCodes: ["exact_answer_unproven", "mode_requires_human_review"],
  },
  {
    id: "exact-quote-mismatch-invalid",
    request: {
      mode: "exact_question_extraction",
      language: "ar",
      subjectDomain: "general",
      sourceSensitivity: "exact_source",
      notationPolicy: "preserve_source_exactly",
      sourceChunks: [exactSource],
      expectedQuestionCount: 1,
    },
    output: {
      kind: "question_set",
      questions: [
        {
          prompt: "سؤال من المصدر",
          type: "direct",
          options: [],
          correctOptionIndex: null,
          answerText: null,
          answerStatus: "review_required",
          difficulty: "medium",
          explanation: null,
          method: null,
          sourceEvidence: [
            {
              mediaAssetId: MEDIA_B,
              pageNumber: 21,
              ocrExtractionId: OCR_B,
              quote: "هذا الاقتباس غير موجود في النص المعتمد",
            },
          ],
        },
      ],
    },
    expectedStatus: "invalid",
    expectedIssueCodes: ["exact_quote_not_in_source"],
  },
  {
    id: "multi-version-duplicate-invalid",
    request: {
      mode: "multi_version_quiz",
      language: "ar",
      subjectDomain: "chemistry",
      sourceSensitivity: "scientific",
      notationPolicy: "arabic_visible_numerals",
      sourceChunks: [scienceSource],
      versionCount: 2,
      targetPerVersion: { multipleChoice: 1, trueFalse: 0, direct: 0 },
    },
    output: {
      kind: "multi_version_quiz",
      versions: [
        {
          label: "النموذج أ",
          questions: [
            {
              prompt: "ما الصيغة الكيميائية للماء؟",
              type: "multiple_choice",
              options: ["CO2", "H2O", "N2", "NaCl"],
              correctOptionIndex: 1,
              answerText: "H2O",
              answerStatus: "known",
              difficulty: "easy",
              explanation: "الإجابة الصحيحة هي H2O.",
              method: "١- نطابق الصيغة مع المصدر.",
              sourceEvidence: [{ mediaAssetId: MEDIA_A, pageNumber: 12, ocrExtractionId: OCR_A }],
            },
          ],
        },
        {
          label: "النموذج ب",
          questions: [
            {
              prompt: "ما الصيغة الكيميائية للماء؟",
              type: "multiple_choice",
              options: ["CO2", "H2O", "N2", "NaCl"],
              correctOptionIndex: 1,
              answerText: "H2O",
              answerStatus: "known",
              difficulty: "easy",
              explanation: "الإجابة الصحيحة هي H2O.",
              method: "١- نطابق الصيغة مع المصدر.",
              sourceEvidence: [{ mediaAssetId: MEDIA_A, pageNumber: 12, ocrExtractionId: OCR_A }],
            },
          ],
        },
      ],
    },
    expectedStatus: "invalid",
    expectedIssueCodes: ["duplicate_question"],
  },
  {
    id: "religious-exact-known-still-review",
    request: {
      mode: "exact_question_extraction",
      language: "ar",
      subjectDomain: "religious",
      sourceSensitivity: "exact_source",
      notationPolicy: "preserve_source_exactly",
      sourceChunks: [
        {
          ...exactSource,
          approvedText: "السؤال: أكمل النص الآتي كما ورد في المصدر. الخيار الصحيح: الصبر.",
        },
      ],
      expectedQuestionCount: 1,
    },
    output: {
      kind: "question_set",
      questions: [
        {
          prompt: "السؤال: أكمل النص الآتي كما ورد في المصدر.",
          type: "multiple_choice",
          options: ["الصبر", "العلم", "العمل", "الصدق"],
          correctOptionIndex: 0,
          answerText: "الصبر",
          answerStatus: "known",
          difficulty: "medium",
          explanation: "الإجابة الصحيحة هي الصبر كما ورد في المصدر.",
          method: "١- نرجع إلى النص الأصلي. ٢- نطابق الخيار حرفياً.",
          sourceEvidence: [
            {
              mediaAssetId: MEDIA_B,
              pageNumber: 21,
              ocrExtractionId: OCR_B,
              quote: "السؤال: أكمل النص الآتي كما ورد في المصدر. الخيار الصحيح: الصبر.",
            },
          ],
        },
      ],
    },
    expectedStatus: "review_required",
    expectedIssueCodes: ["mode_requires_human_review", "religious_exact_review"],
  },
  {
    id: "summary-valid",
    request: {
      mode: "lesson_summary",
      language: "ar",
      subjectDomain: "chemistry",
      sourceSensitivity: "scientific",
      notationPolicy: "arabic_visible_numerals",
      sourceChunks: [scienceSource],
      lessonTitle: "الماء",
    },
    output: {
      kind: "summary",
      summary: "الماء مركب كيميائي صيغته H2O، ويتكون من الهيدروجين والأكسجين.",
      sourceEvidence: [{ mediaAssetId: MEDIA_A, pageNumber: 12, ocrExtractionId: OCR_A }],
    },
    expectedStatus: "valid",
  },
];
