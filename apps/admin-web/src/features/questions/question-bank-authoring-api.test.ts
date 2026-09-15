import { afterEach, describe, expect, it, vi } from "vitest";
import { archiveQuestionBankItem, enqueueQuestionRegeneration } from "./public";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockJson(payload: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  globalThis.fetch = fetchMock;
  return fetchMock;
}

describe("Question Bank authoring API", () => {
  it("queues source-backed regeneration through the canonical authoring route", async () => {
    const fetchMock = mockJson(
      { jobId: "job-3", status: "queued", totalUnits: 1, replayed: false },
      202,
    );
    const itemId = "55555555-5555-4555-8555-555555555555";
    const clientRequestId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

    await enqueueQuestionRegeneration(itemId, {
      clientRequestId,
      subjectDomain: "general",
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain(`/v1/admin/authoring/question-bank/${itemId}/regenerate`);
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(JSON.parse(String(init?.body))).toEqual({
      clientRequestId,
      subjectDomain: "general",
    });
  });

  it("archives non-destructively through the canonical authoring route", async () => {
    const fetchMock = mockJson({ replayed: false });
    const itemId = "55555555-5555-4555-8555-555555555555";

    await archiveQuestionBankItem(itemId);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain(`/v1/admin/authoring/question-bank/${itemId}/archive`);
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
  });
});
