import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addQuizVersion,
  createQuiz,
  fetchQuiz,
  fetchQuizzes,
  publishQuiz,
  rejectQuizReview,
  replaceQuizVersionQuestions,
  submitQuizForReview,
} from "./quiz-builder-api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockJson(payload: unknown, status = 200) {
  const fetchMock = vi.fn(async () =>
    new Response(status === 204 ? null : JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  globalThis.fetch = fetchMock as typeof fetch;
  return fetchMock;
}

describe("quiz builder admin API", () => {
  it("serializes bounded list filters and uses the shared authenticated transport", async () => {
    const fetchMock = mockJson({ items: [], pagination: { total: 0, limit: 20, offset: 40 } });
    await fetchQuizzes({
      classId: "11111111-1111-4111-8111-111111111111",
      subjectId: "22222222-2222-4222-8222-222222222222",
      status: "published",
      search: " طاقة ",
      limit: 20,
      offset: 40,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain("/v1/admin/quizzes?");
    expect(String(url)).toContain("status=published");
    expect(String(url)).toContain("search=%D8%B7%D8%A7%D9%82%D8%A9");
    expect((init as RequestInit).credentials).toBe("include");
  });

  it("uses the canonical detail and create/version routes", async () => {
    const fetchMock = mockJson({ quizId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }, 201);
    await createQuiz({
      classId: "11111111-1111-4111-8111-111111111111",
      subjectId: "22222222-2222-4222-8222-222222222222",
      lessonIds: ["33333333-3333-4333-8333-333333333333"],
      title: "اختبار الطاقة",
    });
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({ title: "اختبار الطاقة" });

    const detailFetch = mockJson({ quiz: { id: "a" }, lessons: [], versions: [], events: [] });
    await fetchQuiz("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(String(detailFetch.mock.calls[0]?.[0])).toContain("/v1/admin/quizzes/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");

    const versionFetch = mockJson({ versionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }, 201);
    await addQuizVersion("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", {
      label: "النموذج أ",
      questions: [
        {
          questionBankItemId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          questionBankRevisionId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        },
      ],
    });
    expect(String(versionFetch.mock.calls[0]?.[0])).toContain("/versions");
  });

  it("uses explicit replace and lifecycle mutation routes", async () => {
    const fetchMock = mockJson(undefined, 204);
    const quizId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const versionId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const refs = [
      {
        questionBankItemId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        questionBankRevisionId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      },
    ];
    await replaceQuizVersionQuestions(quizId, versionId, refs);
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("PUT");

    await submitQuizForReview(quizId);
    await rejectQuizReview(quizId, " يحتاج ضبط ");
    await publishQuiz(quizId);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/submit-review");
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain("/reject");
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({ note: "يحتاج ضبط" });
    expect(String(fetchMock.mock.calls[3]?.[0])).toContain("/publish");
  });
});
