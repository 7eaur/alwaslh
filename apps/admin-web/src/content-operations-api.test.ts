import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchContentDocument,
  fetchContentOperations,
  reviewOcrExtraction,
} from "./content-operations-api";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("content operations api client", () => {
  it("encodes filters without bypassing the shared authenticated transport", async () => {
    const operations = {
      summary: {
        documentCount: 0,
        assetCount: 0,
        mediaCount: 0,
        readyMediaCount: 0,
        failedMediaCount: 0,
        pendingOcrCount: 0,
      },
      facets: { classes: [], subjects: [] },
      documents: [],
      pagination: { total: 0, limit: 30, offset: 0 },
    };
    const fetchMock = vi.fn().mockResolvedValue(response({ operations }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchContentOperations({
        classSlug: "grade-3",
        subjectSlug: "physics",
        kind: "textbook",
        query: "كتاب فيزياء",
        limit: 30,
        offset: 60,
      }),
    ).resolves.toEqual(operations);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsed = new URL(url, "http://admin.test");
    expect(parsed.pathname).toBe("/v1/admin/content-operations");
    expect(parsed.searchParams.get("classSlug")).toBe("grade-3");
    expect(parsed.searchParams.get("subjectSlug")).toBe("physics");
    expect(parsed.searchParams.get("kind")).toBe("textbook");
    expect(parsed.searchParams.get("q")).toBe("كتاب فيزياء");
    expect(parsed.searchParams.get("offset")).toBe("60");
    expect(init.credentials).toBe("include");
  });

  it("loads one source document through the documented paged route", async () => {
    const detail = {
      document: { id: "doc-1" },
      assets: [],
      pagination: { total: 0, limit: 25, offset: 5 },
    };
    const fetchMock = vi.fn().mockResolvedValue(response({ detail }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchContentDocument("doc-1", 25, 5)).resolves.toEqual(detail);

    const url = new URL(fetchMock.mock.calls[0]?.[0] as string, "http://admin.test");
    expect(url.pathname).toBe("/v1/admin/content-operations/documents/doc-1");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.get("offset")).toBe("5");
  });

  it("submits OCR review with correction only when supplied", async () => {
    const extraction = { id: "ocr-1", reviewStatus: "approved" };
    const fetchMock = vi.fn().mockResolvedValue(response({ extraction }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(reviewOcrExtraction("ocr-1", "approved", "نص مصحح")).resolves.toEqual(extraction);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url, "http://admin.test").pathname).toBe(
      "/v1/admin/content-operations/ocr/ocr-1/review",
    );
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ decision: "approved", replacementText: "نص مصحح" }));
  });
});
