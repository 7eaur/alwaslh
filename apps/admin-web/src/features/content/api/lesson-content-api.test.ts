import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLessonContentState, transitionLessonContentPublication } from "./lesson-content-api";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lesson content api client", () => {
  it("loads publication state through the lesson use-case route", async () => {
    const content = {
      lessonId: "lesson-1",
      lessonTitle: "درس تجريبي",
      lessonStatus: "active",
      publishedAt: null,
      counts: { total: 2, draft: 2, review: 0, published: 0, reviewReady: 0, reviewBlocked: 0 },
    };
    const fetchMock = vi.fn().mockResolvedValue(response({ content }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchLessonContentState("lesson-1")).resolves.toEqual(content);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url, "http://admin.test").pathname).toBe("/v1/admin/lesson-content/lesson-1");
    expect(init.credentials).toBe("include");
  });

  it("transitions publication by lesson id rather than ingestion task id", async () => {
    const content = {
      lessonId: "lesson-1",
      lessonTitle: "درس تجريبي",
      lessonStatus: "active",
      publishedAt: null,
      counts: { total: 2, draft: 0, review: 2, published: 0, reviewReady: 2, reviewBlocked: 0 },
    };
    const fetchMock = vi.fn().mockResolvedValue(response({ content }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(transitionLessonContentPublication("lesson-1", "submit_review")).resolves.toEqual(content);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url, "http://admin.test").pathname).toBe(
      "/v1/admin/lesson-content/lesson-1/publication",
    );
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ action: "submit_review" }));
    expect(init.credentials).toBe("include");
  });
});
