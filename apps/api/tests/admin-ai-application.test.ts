import assert from "node:assert/strict";
import test from "node:test";
import { projectAdminAiApplication } from "../src/ai/admin-application.js";
import type { AiGenerationOutput } from "../src/ai/contracts.js";

const summary: AiGenerationOutput = {
  kind: "summary",
  summary: "ملخص معتمد",
  sourceEvidence: [],
};

const questionSet: AiGenerationOutput = {
  kind: "question_set",
  questions: [],
};

const pageDetection: AiGenerationOutput = {
  kind: "page_detection",
  title: "صفحة",
  pageNumber: 1,
  contentPreview: "محتوى",
  sourceEvidence: [],
};

test("approved lesson authoring outputs expose lesson application capability", () => {
  assert.deepEqual(projectAdminAiApplication("lesson:lesson-1", "approve", 4, summary), {
    kind: "lesson",
    reviewRevision: 4,
  });
  assert.deepEqual(projectAdminAiApplication("lesson:lesson-1", "approve", 5, questionSet), {
    kind: "lesson",
    reviewRevision: 5,
  });
});

test("approved quiz question output exposes quiz application capability", () => {
  assert.deepEqual(projectAdminAiApplication("quiz-version:version-a", "approve", 2, questionSet), {
    kind: "quiz",
    reviewRevision: 2,
  });
});

test("pending, rejected and unsupported output contexts expose no application", () => {
  assert.equal(projectAdminAiApplication("lesson:lesson-1", null, null, summary), null);
  assert.equal(projectAdminAiApplication("lesson:lesson-1", "reject", 3, summary), null);
  assert.equal(projectAdminAiApplication("question-bank:item-1", "approve", 3, questionSet), null);
  assert.equal(projectAdminAiApplication("lesson:lesson-1", "approve", 3, pageDetection), null);
  assert.equal(projectAdminAiApplication("quiz-version:version-a", "approve", 3, summary), null);
});
