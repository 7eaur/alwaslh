import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createContentIngestionTask,
  fetchContentIngestionHistory,
  transitionContentPublication,
  uploadContentIngestionItem,
} from "./content-ingestion-api";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("content ingestion api client", () => {
  it("loads durable history through the authenticated transport", async () => {
    const history = { tasks: [], total: 0 };
    const fetchMock = vi.fn().mockResolvedValue(response({ history }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchContentIngestionHistory({ includeArchived: true, limit: 25 })).resolves.toEqual(history);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsed = new URL(url, "http://admin.test");
    expect(parsed.pathname).toBe("/v1/admin/content-ingestions");
    expect(parsed.searchParams.get("includeArchived")).toBe("true");
    expect(parsed.searchParams.get("limit")).toBe("25");
    expect(init.credentials).toBe("include");
  });

  it("creates an ordered task without changing file descriptors", async () => {
    const task = { id: "task-1", items: [] };
    const fetchMock = vi.fn().mockResolvedValue(response({ task }));
    vi.stubGlobal("fetch", fetchMock);

    const input = {
      lessonId: "lesson-1",
      clientRequestId: "request-1",
      items: [
        { filename: "01.jpg", mimeType: "image/jpeg", byteSize: 100 },
        { filename: "02.pdf", mimeType: "application/pdf", byteSize: 200 },
      ],
    };
    await createContentIngestionTask(input);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url, "http://admin.test").pathname).toBe("/v1/admin/content-ingestions");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual(input);
  });

  it("uploads raw file bytes as application/octet-stream", async () => {
    const task = { id: "task-1", items: [] };
    const fetchMock = vi.fn().mockResolvedValue(response({ task }));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File([new Uint8Array([1, 2, 3])], "page.jpg", { type: "image/jpeg" });

    await uploadContentIngestionItem("task-1", "item-1", file);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url, "http://admin.test").pathname).toBe(
      "/v1/admin/content-ingestions/task-1/items/item-1/content",
    );
    expect(init.method).toBe("PUT");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/octet-stream");
    expect(init.body).toBe(file);
  });

  it("publishes only through the explicit publication transition", async () => {
    const task = { id: "task-1", lessonAssets: [] };
    const fetchMock = vi.fn().mockResolvedValue(response({ task }));
    vi.stubGlobal("fetch", fetchMock);

    await transitionContentPublication("task-1", "publish");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url, "http://admin.test").pathname).toBe(
      "/v1/admin/content-ingestions/task-1/publication",
    );
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ action: "publish" }));
  });
});
