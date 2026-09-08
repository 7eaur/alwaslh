import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "./admin-api";
import {
  fetchAiJobDetail,
  fetchAiJobs,
  fetchAiOutputDetail,
  fetchAiUnitDetail,
  isAiConflictError,
  reviewAiOutput,
  type AiGenerationOutputApi,
} from "./ai-operations-api";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe("Stage13E AI operations API transport", () => {
  it("encodes bounded job filters through the shared authenticated transport", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ jobs: [], pagination: { total: 0, limit: 30, offset: 60 } }));
    vi.stubGlobal("fetch", fetchMock);
    await fetchAiJobs({ status: "retrying", jobType: "lesson", limit: 30, offset: 60 });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsed = new URL(url, "http://admin.test");
    expect(parsed.pathname).toBe("/v1/admin/ai/jobs");
    expect(parsed.searchParams.get("status")).toBe("retrying");
    expect(parsed.searchParams.get("jobType")).toBe("lesson");
    expect(parsed.searchParams.get("limit")).toBe("30");
    expect(parsed.searchParams.get("offset")).toBe("60");
    expect(init.credentials).toBe("include");
  });

  it("uses the documented job detail pagination query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ job: { id: "job-1" }, units: [], pagination: { total: 0, limit: 25, offset: 50 } }));
    vi.stubGlobal("fetch", fetchMock);
    await fetchAiJobDetail("job-1", 25, 50);
    const url = new URL(fetchMock.mock.calls[0]?.[0] as string, "http://admin.test");
    expect(url.pathname).toBe("/v1/admin/ai/jobs/job-1");
    expect(url.searchParams.get("unitLimit")).toBe("25");
    expect(url.searchParams.get("unitOffset")).toBe("50");
  });

  it("uses the documented attempt pagination query", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      unit: { id: "unit-1" },
      attempts: [],
      attemptPagination: { total: 51, limit: 50, offset: 50 },
    }));
    vi.stubGlobal("fetch", fetchMock);
    await fetchAiUnitDetail("unit-1", 50, 50);
    const url = new URL(fetchMock.mock.calls[0]?.[0] as string, "http://admin.test");
    expect(url.pathname).toBe("/v1/admin/ai/units/unit-1");
    expect(url.searchParams.get("attemptLimit")).toBe("50");
    expect(url.searchParams.get("attemptOffset")).toBe("50");
  });

  it("reads only the documented output envelope and never requests a raw-response route", async () => {
    const output = { id: "output-1", hasRawResponse: true, rawResponse: { secret: "must-not-be-used" } };
    const fetchMock = vi.fn().mockResolvedValue(response({ output }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchAiOutputDetail("output-1");
    expect(result.id).toBe("output-1");
    expect(result.hasRawResponse).toBe(true);
    expect(new URL(fetchMock.mock.calls[0]?.[0] as string, "http://admin.test").pathname).toBe("/v1/admin/ai/outputs/output-1");
  });

  it("sends the strict discriminated review payloads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ output: { id: "output-1" } }));
    vi.stubGlobal("fetch", fetchMock);
    const editedOutput: AiGenerationOutputApi = { kind: "summary", summary: "ملخص", sourceEvidence: [] };
    await reviewAiOutput("output-1", { action: "edit", editedOutput, note: "مراجعة" });
    await reviewAiOutput("output-1", { action: "approve" });
    await reviewAiOutput("output-1", { action: "reject", note: "المصدر غير كافٍ" });
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).body).toBe(JSON.stringify({ action: "edit", editedOutput, note: "مراجعة" }));
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).body).toBe(JSON.stringify({ action: "approve" }));
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBe(JSON.stringify({ action: "reject", note: "المصدر غير كافٍ" }));
  });

  it("does not send presentation-only null source quotes back to the strict Stage11 schema", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ output: { id: "output-1" } }));
    vi.stubGlobal("fetch", fetchMock);
    const editedOutput = {
      kind: "summary",
      summary: "ملخص",
      sourceEvidence: [{ mediaAssetId: "asset-1", pageNumber: 1, quote: null }],
    } as unknown as AiGenerationOutputApi;
    await reviewAiOutput("output-1", { action: "edit", editedOutput });
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).body).toBe(JSON.stringify({
      action: "edit",
      editedOutput: { kind: "summary", summary: "ملخص", sourceEvidence: [{ mediaAssetId: "asset-1", pageNumber: 1 }] },
    }));
  });

  it("preserves 409 as a canonical-refresh conflict signal", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ error: { code: "CONFLICT", message: "تغيرت الحالة" } }, 409));
    vi.stubGlobal("fetch", fetchMock);
    let caught: unknown;
    try { await reviewAiOutput("output-1", { action: "approve" }); } catch (error) { caught = error; }
    expect(caught).toBeInstanceOf(ApiRequestError);
    expect(isAiConflictError(caught)).toBe(true);
  });
});
