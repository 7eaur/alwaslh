import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLogicalLessonPlan,
  type LegacyPage,
  normalizeFingerprintText,
  normalizeLegacyQuestion,
  questionFingerprint,
  stableUuid,
} from "../src/content/legacy-supabase-model.js";

function page(id: string, pageNumber: number, title: string): LegacyPage {
  return {
    id,
    subject_id: "1794eea5-4772-4c94-bd2b-b08e5815e733",
    title,
    image_urls: [
      `https://zhbgbmqhonqmzpqfiehs.supabase.co/storage/v1/object/public/lesson_content/${id}.jpg`,
    ],
    ai_questions: [],
    page_number: pageNumber,
    created_at: `2026-01-01T00:00:${String(pageNumber).padStart(2, "0")}.000Z`,
    content_type: "lesson",
  };
}

test("legacy Supabase pages form logical lessons by title and contiguous page sequence", () => {
  const subjectId = "1794eea5-4772-4c94-bd2b-b08e5815e733";
  const input = [
    page("00000000-0000-4000-8000-000000000001", 1, "Lesson A"),
    page("00000000-0000-4000-8000-000000000002", 2, "Lesson A"),
    page("00000000-0000-4000-8000-000000000003", 3, "Lesson B"),
    page("00000000-0000-4000-8000-000000000004", 5, "Lesson B"),
  ];

  const plan = buildLogicalLessonPlan(subjectId, input);
  assert.equal(plan.unresolvedPages.length, 0);
  assert.equal(plan.lessons.length, 3);
  assert.deepEqual(
    plan.lessons.map((lesson) => [
      lesson.title,
      lesson.firstPageNumber,
      lesson.lastPageNumber,
      lesson.pages.length,
    ]),
    [
      ["Lesson A", 1, 2, 2],
      ["Lesson B", 3, 3, 1],
      ["Lesson B", 5, 5, 1],
    ],
  );
  assert.match(plan.lessons[0]?.slug ?? "", /^legacy-sb-[0-9a-f]{20}$/);
});

test("legacy Supabase grouping refuses ambiguous image/page shapes", () => {
  const source = page("00000000-0000-4000-8000-000000000005", 1, "Lesson");
  const plan = buildLogicalLessonPlan(source.subject_id, [
    { ...source, page_number: null },
    { ...source, id: "00000000-0000-4000-8000-000000000006", image_urls: [] },
    {
      ...source,
      id: "00000000-0000-4000-8000-000000000007",
      image_urls: [source.image_urls[0] ?? "", `${source.image_urls[0] ?? ""}?copy=1`],
    },
  ]);
  assert.equal(plan.lessons.length, 0);
  assert.deepEqual(plan.unresolvedPages.map((entry) => entry.reason).sort(), [
    "missing_image",
    "missing_page_number",
    "multiple_images",
  ]);
});

test("legacy true/false normalization canonicalizes order and recalculates answer index", () => {
  const normal = normalizeLegacyQuestion({
    type: "true_false",
    question: "Saleh is seventeen years old.",
    options: ["True", "False"],
    correct_option_index: 0,
    difficulty: "medium",
    explanation: "Source explanation",
  });
  assert.equal(normal.state, "ready");
  if (normal.state === "ready") {
    assert.deepEqual(normal.question.options, ["صح", "خطأ"]);
    assert.equal(normal.question.correctOptionIndex, 0);
    assert.equal(normal.question.answerText, "صح");
    assert.equal(normal.question.answerStatus, "known");
  }

  const reversed = normalizeLegacyQuestion({
    type: "true_false",
    question: "This statement is false.",
    options: ["False", "True"],
    correct_option_index: 0,
    difficulty: "medium",
    explanation: "Source explanation",
  });
  assert.equal(reversed.state, "ready");
  if (reversed.state === "ready") {
    assert.deepEqual(reversed.question.options, ["صح", "خطأ"]);
    assert.equal(reversed.question.correctOptionIndex, 1);
    assert.equal(reversed.question.answerText, "خطأ");
  }
});

test("legacy MCQ keeps explicit valid answer but does not invent an invalid one", () => {
  const valid = normalizeLegacyQuestion({
    type: "mcq",
    question: "How old is Saleh?",
    options: ["Seventeen", "Fourteen", "Fifteen", "Eighteen"],
    correct_option_index: 0,
    difficulty: "medium",
    explanation: "The source says Seventeen.",
  });
  assert.equal(valid.state, "ready");
  if (valid.state === "ready") {
    assert.equal(valid.question.type, "multiple_choice");
    assert.equal(valid.question.answerStatus, "known");
    assert.equal(valid.question.answerText, "Seventeen");
  }

  const invalid = normalizeLegacyQuestion({
    type: "mcq",
    question: "Question",
    options: ["A", "B", "C", "D"],
    correct_option_index: 8,
    difficulty: "medium",
    explanation: "Explanation",
  });
  assert.equal(invalid.state, "ready");
  if (invalid.state === "ready") {
    assert.equal(invalid.question.answerStatus, "review_required");
    assert.equal(invalid.question.correctOptionIndex, null);
    assert.equal(invalid.question.answerText, null);
  }
});

test("two-option non-boolean MCQ remains unresolved instead of being coerced", () => {
  const result = normalizeLegacyQuestion({
    type: "mcq",
    question: "Pick one",
    options: ["نعم", "لا"],
    correct_option_index: 0,
    difficulty: "medium",
    explanation: "Explanation",
  });
  assert.deepEqual(result, {
    state: "unresolved",
    reason: "unsupported_two_option_mcq",
    sourceType: "mcq",
  });
});

test("direct questions without a trusted answer remain unknown", () => {
  const result = normalizeLegacyQuestion({
    type: "direct",
    question: "Explain the rule",
    options: [],
    correct_option_index: null,
    difficulty: "hard",
    explanation: "Explanation only, not an answer.",
  });
  assert.equal(result.state, "ready");
  if (result.state === "ready") {
    assert.equal(result.question.answerStatus, "unknown");
    assert.equal(result.question.answerText, null);
  }
});

test("fingerprint normalization handles Arabic Unicode, digits and punctuation without altering stored copy", () => {
  assert.equal(normalizeFingerprintText("  أَلسؤال ١٢؟ "), "السؤال 12");

  const question = normalizeLegacyQuestion({
    type: "mcq",
    question: "سؤال؟",
    options: ["أ", "ب", "ج", "د"],
    correct_option_index: 0,
    difficulty: "easy",
    explanation: null,
  });
  assert.equal(question.state, "ready");
  if (question.state === "ready") {
    assert.equal(question.question.prompt, "سؤال؟");
    assert.equal(questionFingerprint("lesson-1", question.question).length, 64);
  }
});

test("stable UUIDs are deterministic and valid UUID-shaped identifiers", () => {
  const first = stableUuid("legacy-question:abc");
  assert.equal(first, stableUuid("legacy-question:abc"));
  assert.notEqual(first, stableUuid("legacy-question:def"));
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
