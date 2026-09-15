import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyApprovedQuestionRegeneration,
  createManualQuestion,
  editQuestionBankItem,
  fetchQuestionBank,
  fetchQuestionBankItem,
  importApprovedAiQuestions,
  publishQuestion,
  rejectQuestionReview,
  submitQuestionForReview,
} from "./question-bank-api";

function response(body: unknown, status = 200): Response {
  return new Response(body === undefined ? undefined : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const question = {
  prompt: "ما تعريف الطاقة؟",
  type: "direct" as const,
  options: [],
  correctOptionIndex: null,
  answerText: "القدرة على بذل شغل",
  answerStatus: "known" as const,
  difficulty: "easy" as const,
  explanation: "تعريف أساسي",
  method: null,
};

const scope = {
  classId: "11111111-1111-4111-8111-111111111111",
  subjectId: "22222222-2222-4222-8222-222222222222",
  lessonIds: ["33333333-3333-4333-8333-333333333333"],
};

const itemId = "44444444-4444-4444-8444-444444444444";
const outputId = "55555555-5555-4555-8555-555555555555";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("question bank api client", () => {
  it("encodes bounded list filters through the shared authenticated transport", async () => {
    const payload = { items: [], pagination: { total: 0, limit: 30, offset: 60 } };
    const fetchMock = vi.fn().mockResolvedValue(response(payload));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchQuestionBank({
        classId: scope.classId,
        subjectId: scope.subjectId,
        origin: "ai",
        status: "review",
        search: "  طاقة  ",
        limit: 30,
        offset: 60,
      }),
    ).resolves.toEqual(payload);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsed = new URL(url, "http://admin.test");
    expect(parsed.pathname).toBe("/v1/admin/question-bank");
    expect(parsed.searchParams.get("classId")).toBe(scope.classId);
    expect(parsed.searchParams.get("subjectId")).toBe(scope.subjectId);
    expect(parsed.searchParams.get("origin")).toBe("ai");
    expect(parsed.searchParams.get("status")).toBe("review");
    expect(parsed.searchParams.get("search")).toBe("طاقة");
    expect(parsed.searchParams.get("offset")).toBe("60");
    expect(init.credentials).toBe("include");
  });

  it("loads detail with independent revision and event pagination", async () => {
    const payload = {
      item: { id: itemId },
      revisions: [],
      revisionPagination: { total: 0, limit: 10, offset: 20 },
      events: [],
      eventPagination: { total: 0, limit: 15, offset: 30 },
      aiImports: [],
    };
    const fetchMock = vi.fn().mockResolvedValue(response(payload));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchQuestionBankItem(itemId, {
        revisionLimit: 10,
        revisionOffset: 20,
        eventLimit: 15,
        eventOffset: 30,
      }),
    ).resolves.toEqual(payload);

    const parsed = new URL(fetchMock.mock.calls[0]?.[0] as string, "http://admin.test");
    expect(parsed.pathname).toBe(`/v1/admin/question-bank/${itemId}`);
    expect(parsed.searchParams.get("revisionLimit")).toBe("10");
    expect(parsed.searchParams.get("revisionOffset")).toBe("20");
    expect(parsed.searchParams.get("eventLimit")).toBe("15");
    expect(parsed.searchParams.get("eventOffset")).toBe("30");
  });

  it("keeps manual create, approved AI import, stable regeneration and edit contracts explicit", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ itemId, revisionId: "rev-1" }, 201))
      .mockResolvedValueOnce(response({ imports: [], replayed: false }, 201))
      .mockResolvedValueOnce(response({ itemId, revisionId: "rev-2", replayed: false }, 201))
      .mockResolvedValueOnce(response({ revisionId: "rev-3" }));
    vi.stubGlobal("fetch", fetchMock);

    await createManualQuestion({ ...scope, question });
    await importApprovedAiQuestions(outputId, scope);
    await applyApprovedQuestionRegeneration(itemId, outputId);
    await editQuestionBankItem(itemId, { ...question, prompt: "ما تعريف الشغل؟" });

    const [, createInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(createInit.method).toBe("POST");
    expect(createInit.body).toBe(JSON.stringify({ ...scope, question }));

    const [importUrl, importInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(new URL(importUrl, "http://admin.test").pathname).toBe(
      `/v1/admin/question-bank/import-ai/${outputId}`,
    );
    expect(importInit.method).toBe("POST");
    expect(importInit.body).toBe(JSON.stringify(scope));

    const [regenerateUrl, regenerateInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(new URL(regenerateUrl, "http://admin.test").pathname).toBe(
      `/v1/admin/question-bank/${itemId}/regenerate-ai/${outputId}`,
    );
    expect(regenerateInit.method).toBe("POST");

    const [editUrl, editInit] = fetchMock.mock.calls[3] as [string, RequestInit];
    expect(new URL(editUrl, "http://admin.test").pathname).toBe(`/v1/admin/question-bank/${itemId}`);
    expect(editInit.method).toBe("PATCH");
    expect(editInit.body).toBe(JSON.stringify({ question: { ...question, prompt: "ما تعريف الشغل؟" } }));
  });

  it("uses distinct lifecycle routes and trims rejection evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(undefined, 204));
    vi.stubGlobal("fetch", fetchMock);

    await submitQuestionForReview(itemId);
    await rejectQuestionReview(itemId, "  يحتاج تصحيح الإجابة  ");
    await publishQuestion(itemId);

    const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
    expect(new URL(calls[0]?.[0] ?? "", "http://admin.test").pathname).toBe(
      `/v1/admin/question-bank/${itemId}/submit-review`,
    );
    expect(new URL(calls[1]?.[0] ?? "", "http://admin.test").pathname).toBe(
      `/v1/admin/question-bank/${itemId}/reject`,
    );
    expect(calls[1]?.[1].body).toBe(JSON.stringify({ note: "يحتاج تصحيح الإجابة" }));
    expect(new URL(calls[2]?.[0] ?? "", "http://admin.test").pathname).toBe(
      `/v1/admin/question-bank/${itemId}/publish`,
    );
  });
});
