import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSpecializedQuizExport, specializedQuizPrintUrl } from "./quiz-builder-specialized-export-api";

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

describe("Quiz Builder specialized export API", () => {
  it("builds bounded selected-version export and print URLs", async () => {
    const fetchMock = mockJson({ filenameBase: "quiz", csv: "csv", printHtml: "<html></html>" });
    const quizId = "66666666-6666-4666-8666-666666666666";
    const versions = [
      "77777777-7777-4777-8777-777777777777",
      "88888888-8888-4888-8888-888888888888",
    ];
    await fetchSpecializedQuizExport(quizId, versions, "answer_key");
    const exportUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(exportUrl).toContain(`/v1/admin/quizzes/${quizId}/specialized-export?`);
    expect(exportUrl).toContain("variant=answer_key");
    expect(decodeURIComponent(exportUrl)).toContain(versions.join(","));

    const printUrl = specializedQuizPrintUrl(quizId, versions, "questions_only");
    expect(printUrl).toContain(`/v1/admin/quizzes/${quizId}/specialized-print?`);
    expect(printUrl).toContain("variant=questions_only");
  });
});
