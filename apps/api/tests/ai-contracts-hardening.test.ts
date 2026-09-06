import assert from "node:assert/strict";
import test from "node:test";
import { validateAiGenerationOutput } from "../src/ai/validators.js";

const MEDIA_A = "11111111-1111-4111-8111-111111111111";
const MEDIA_B = "22222222-2222-4222-8222-222222222222";
const OCR_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CHECKSUM_A = "a".repeat(64);

const source = {
  mediaAssetId: MEDIA_A,
  pageNumber: 12,
  inputChecksumSha256: CHECKSUM_A,
  inputKind: "approved_ocr" as const,
  ocrExtractionId: OCR_A,
  approvedText: "الماء مركب كيميائي صيغته H2O، ويتكون من ذرتي هيدروجين وذرة أكسجين.",
  ocrReviewStatus: "approved" as const,
};

function validQuestion(prompt = "ما الصيغة الكيميائية للماء؟") {
  return {
    prompt,
    type: "multiple_choice" as const,
    options: ["CO2", "H2O", "N2", "NaCl"],
    correctOptionIndex: 1,
    answerText: "H2O",
    answerStatus: "known" as const,
    difficulty: "easy" as const,
    explanation: "الإجابة الصحيحة هي H2O لأنها الصيغة الواردة في المصدر.",
    method: "١- نحدد المادة المطلوبة. ٢- نطابق الصيغة مع المصدر.",
    sourceEvidence: [{ mediaAssetId: MEDIA_A, pageNumber: 12, ocrExtractionId: OCR_A }],
  };
}

function request(target = { multipleChoice: 1, trueFalse: 0, direct: 0 }) {
  return {
    mode: "question_generation" as const,
    language: "ar" as const,
    subjectDomain: "chemistry" as const,
    sourceSensitivity: "scientific" as const,
    notationPolicy: "arabic_visible_numerals" as const,
    sourceChunks: [source],
    target,
  };
}

test("Stage11 rejects an answerText that disagrees with correctOptionIndex", () => {
  const question = { ...validQuestion(), correctOptionIndex: 0 };
  const validation = validateAiGenerationOutput(request(), {
    kind: "question_set",
    questions: [question],
  });

  assert.equal(validation.status, "invalid");
  assert.ok(validation.issues.some((issue) => issue.code === "answer_option_mismatch"));
});

test("Stage11 rejects generated output that misses the requested question count", () => {
  const validation = validateAiGenerationOutput(
    request({ multipleChoice: 2, trueFalse: 0, direct: 0 }),
    {
      kind: "question_set",
      questions: [validQuestion()],
    },
  );

  assert.equal(validation.status, "invalid");
  assert.ok(validation.issues.some((issue) => issue.code === "requested_count_mismatch"));
});

test("Stage11 rejects provenance outside the request source/page set", () => {
  const question = {
    ...validQuestion(),
    sourceEvidence: [{ mediaAssetId: MEDIA_B, pageNumber: 13 }],
  };
  const validation = validateAiGenerationOutput(request(), {
    kind: "question_set",
    questions: [question],
  });

  assert.equal(validation.status, "invalid");
  assert.ok(validation.issues.some((issue) => issue.code === "provenance_outside_request"));
});

test("Stage11 sends near-duplicate generated questions to review without treating them as exact duplicates", () => {
  const validation = validateAiGenerationOutput(
    request({ multipleChoice: 2, trueFalse: 0, direct: 0 }),
    {
      kind: "question_set",
      questions: [
        validQuestion("ما الصيغة الكيميائية التي تمثل الماء في هذا الدرس؟"),
        validQuestion("ما الصيغة الكيميائية التي تمثل الماء في الدرس؟"),
      ],
    },
  );

  assert.equal(validation.status, "review_required");
  assert.ok(validation.issues.some((issue) => issue.code === "near_duplicate_question"));
  assert.equal(validation.issues.some((issue) => issue.code === "duplicate_question"), false);
});
