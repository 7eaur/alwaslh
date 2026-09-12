import { describe, expect, it } from "vitest";
import type { OperationsAttentionSummary } from "../../admin-operations-api";
import {
  attentionTotal,
  buildAttentionItems,
  eventLabel,
  resourceLabel,
} from "./operations-model";

const summary: OperationsAttentionSummary = {
  review: { contentAssets: 2, ocr: 0, ai: 3, questions: 1, quizzes: 0 },
  failures: { ingestion: 1, ocr: 0, ai: 2 },
  support: { lockedLogins: 0, pendingRecovery: 1, forcedPasswordChanges: 0 },
  recentActivity: [],
};

describe("operations presentation model", () => {
  it("projects only actionable non-zero attention items", () => {
    const items = buildAttentionItems(summary);
    expect(items.map((item) => item.key)).toEqual([
      "content-review",
      "ai-review",
      "question-review",
      "ingestion-failure",
      "ai-failure",
      "pending-recovery",
    ]);
    expect(items.every((item) => item.count > 0 && item.to.startsWith("/app/"))).toBe(true);
    expect(attentionTotal(summary)).toBe(10);
  });

  it("does not expose unknown backend enum keys as product copy", () => {
    expect(eventLabel("new_backend_event_that_ui_does_not_know")).toBe("حدث تشغيلي");
    expect(resourceLabel("internal_table_row")).toBe("عنصر تشغيلي");
  });
});
