import { describe, expect, it } from "vitest";
import type { AiAttemptApi, AiJobDetailResponse, AiOutputDetailApi } from "./ai-operations-api";
import { mapAiAttempt, mapAiJobDetail, mapAiOutputDetail } from "./ai-operations-adapter";

describe("Stage13E AI operations adapter", () => {
  it("drops provider-internal error text even if an unexpected runtime field is present", () => {
    const attempt = {
      id: "attempt-1",
      attemptNumber: 2,
      providerKey: "provider-a",
      providerProjectAlias: "project-a",
      modelUsed: "model-a",
      routeKey: "route-a",
      benchmarkVersion: "bench-1",
      status: "failed",
      validationStatus: null,
      retryable: true,
      inputTokens: 10,
      outputTokens: 5,
      latencyMs: 1200,
      estimatedCostUsdMicros: 250,
      errorCode: "capacity_backpressure",
      errorMessage: "provider secret/internal text",
      startedAt: "2026-09-08T01:00:00Z",
      completedAt: "2026-09-08T01:00:02Z",
    } as AiAttemptApi & { errorMessage: string };

    const view = mapAiAttempt(attempt);
    expect(view.errorCode).toBe("capacity_backpressure");
    expect("errorMessage" in view).toBe(false);
  });

  it("drops an unexpected raw response and exposes only hasRawResponse", () => {
    const output = {
      id: "output-1",
      jobId: "job-1",
      jobUnitId: "unit-1",
      unitKey: "unit-key",
      validationStatus: "review_required",
      normalizedOutput: null,
      validationErrors: [],
      semanticWarnings: [],
      hasRawResponse: true,
      rawResponse: { providerSecret: true },
      reviewStatus: "pending",
      allowedReviewActions: ["edit", "approve", "reject"],
      effectiveReviewedOutput: null,
      reviewedByProfileId: null,
      reviewedAt: null,
      sourceProvenance: [],
      reviewHistory: [],
      createdAt: "2026-09-08T01:00:00Z",
      updatedAt: "2026-09-08T01:00:00Z",
    } as AiOutputDetailApi & { rawResponse: unknown };

    const view = mapAiOutputDetail(output);
    expect(view.hasRawResponse).toBe(true);
    expect("rawResponse" in view).toBe(false);
    expect(view.allowedReviewActions).toEqual(["edit", "approve", "reject"]);
  });

  it("preserves server-derived job actions and unit pagination without deriving client authority", () => {
    const response: AiJobDetailResponse = {
      job: {
        id: "job-1",
        jobType: "lesson",
        status: "failed",
        executionStatus: "failed",
        promptKey: "prompt",
        promptVersion: "v1",
        requestedModel: null,
        priority: 5,
        createdByProfileId: null,
        cancelRequestedAt: null,
        pausedAt: null,
        startedAt: "2026-09-08T01:00:00Z",
        completedAt: "2026-09-08T01:01:00Z",
        createdAt: "2026-09-08T01:00:00Z",
        updatedAt: "2026-09-08T01:01:00Z",
        allowedActions: ["retry"],
        progress: {
          totalUnits: 75,
          acceptedUnits: 0,
          completedUnits: 0,
          reviewRequiredUnits: 0,
          failedUnits: 75,
          cancelledUnits: 0,
          queuedUnits: 0,
          runningUnits: 0,
          retryingUnits: 0,
          settledUnits: 75,
          remainingUnits: 0,
          progressPercent: 100,
        },
      },
      units: [],
      pagination: { total: 75, limit: 50, offset: 50 },
    };

    const mapped = mapAiJobDetail(response);
    expect(mapped.allowedActions).toEqual(["retry"]);
    expect(mapped.unitPagination).toEqual({ total: 75, limit: 50, offset: 50 });
  });
});
