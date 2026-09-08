import { describe, expect, it } from "vitest";
import {
  actionIsAllowed,
  answerStatusLabel,
  describeProgress,
  formatCost,
  formatLatency,
  generationModeLabel,
  jobStatusLabel,
  validationStatusLabel,
  type AiActionAvailability,
  type AiJobAction,
  type AiJobProgressView,
} from "./ai-operations-view-model";

function progress(overrides: Partial<AiJobProgressView> = {}): AiJobProgressView {
  return {
    jobId: "job-1",
    status: "running",
    executionStatus: "running",
    pausedAt: null,
    totalUnits: 10,
    acceptedUnits: 2,
    completedUnits: 1,
    reviewRequiredUnits: 1,
    failedUnits: 1,
    cancelledUnits: 0,
    queuedUnits: 3,
    runningUnits: 2,
    retryingUnits: 2,
    settledUnits: 3,
    remainingUnits: 7,
    progressPercent: 37,
    ...overrides,
  };
}

describe("Stage13E AI operations view model", () => {
  it("uses the server-derived progress percentage instead of recalculating it in the browser", () => {
    expect(describeProgress(progress())).toBe("37% · 3 من 10 وحدات مستقرة · 7 متبقية");
  });

  it("keeps pause separate from the underlying execution status", () => {
    const paused = progress({ status: "paused", executionStatus: "retrying", pausedAt: "2026-09-08T04:00:00Z" });
    expect(jobStatusLabel(paused.status)).toBe("متوقفة مؤقتًا");
    expect(jobStatusLabel(paused.executionStatus)).toBe("إعادة محاولة");
  });

  it("takes action availability from the supplied server-adapter view state and never infers lifecycle rules", () => {
    const actions: readonly AiActionAvailability<AiJobAction>[] = [
      { action: "pause", allowed: true, reason: null },
      { action: "resume", allowed: false, reason: "غير متاح وفق الحالة authoritative" },
      { action: "cancel", allowed: false, reason: "قرار الخادم" },
      { action: "retry", allowed: true, reason: null },
    ];

    expect(actionIsAllowed(actions, "pause")).toBe(true);
    expect(actionIsAllowed(actions, "resume")).toBe(false);
    expect(actionIsAllowed(actions, "retry")).toBe(true);
  });

  it("covers the exact Stage11 generation modes needed by Admin review", () => {
    expect(generationModeLabel("lesson_summary")).toBe("ملخص درس");
    expect(generationModeLabel("question_generation")).toBe("توليد أسئلة");
    expect(generationModeLabel("exact_exam_extraction")).toBe("استخراج اختبار مطابق للمصدر");
    expect(generationModeLabel("page_detection")).toBe("اكتشاف صفحة/حدود");
  });

  it("keeps uncertainty and human-review states explicit in Arabic copy", () => {
    expect(answerStatusLabel("unknown")).toBe("الإجابة غير مثبتة من المصدر");
    expect(answerStatusLabel("review_required")).toBe("الإجابة تحتاج مراجعة");
    expect(validationStatusLabel("review_required")).toBe("تحتاج مراجعة بشرية");
    expect(validationStatusLabel("invalid")).toBe("غير صالحة");
  });

  it("formats optional operational telemetry without exposing credentials", () => {
    expect(formatLatency(null)).toBe("—");
    expect(formatLatency(480)).toBe("480 مللي ثانية");
    expect(formatLatency(1_250)).toBe("1.3 ثانية");
    expect(formatCost(null)).toBe("—");
    expect(formatCost(0.001234)).toBe("$0.001234");
  });
});
