import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyApprovedLessonOutput,
  applyApprovedQuizOutput,
  archiveQuestionBankItem,
  enqueueLessonGeneration,
  enqueueQuestionRegeneration,
  enqueueQuizGeneration,
  fetchSpecializedQuizExport,
  specializedQuizPrintUrl,
} from "./admin-ai-authoring-api";

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

describe("G-D Admin AI authoring API", () => {
  it("queues selected lessons through the canonical authoring route", async () => {
    const fetchMock = mockJson({ jobId: "job-1", status: "queued", totalUnits: 2, replayed: false }, 202);
    await enqueueLessonGeneration({
      lessonIds: ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222"],
      mode: "question_generation",
      subjectDomain: "mathematics",
      target: { multipleChoice: 2, trueFalse: 1, direct: 0 },
      clientRequestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain("/v1/admin/authoring/lessons/generate");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      mode: "question_generation",
      subjectDomain: "mathematics",
      target: { multipleChoice: 2, trueFalse: 1, direct: 0 },
    });
  });

  it("keeps per-version quiz sources and settings independent", async () => {
    const fetchMock = mockJson({ jobId: "job-2", status: "queued", totalUnits: 2, replayed: false }, 202);
    await enqueueQuizGeneration("33333333-3333-4333-8333-333333333333", {
      mode: "question_generation",
      subjectDomain: "general",
      clientRequestId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      versions: [
        {
          key: "a",
          label: "النموذج أ",
          lessonIds: ["11111111-1111-4111-8111-111111111111"],
          shuffleOptions: true,
          target: { multipleChoice: 2, trueFalse: 0, direct: 0 },
        },
        {
          key: "b",
          label: "النموذج ب",
          lessonIds: ["22222222-2222-4222-8222-222222222222"],
          shuffleOptions: false,
          target: { multipleChoice: 0, trueFalse: 2, direct: 0 },
        },
      ],
    });

    const [, init] = fetchMock.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body));
    expect(body.versions).toHaveLength(2);
    expect(body.versions[0].lessonIds).not.toEqual(body.versions[1].lessonIds);
    expect(body.versions[0].shuffleOptions).toBe(true);
    expect(body.versions[1].shuffleOptions).toBe(false);
  });

  it("applies reviewed lesson and quiz outputs through separate safe boundaries", async () => {
    const fetchMock = mockJson({});
    const outputId = "44444444-4444-4444-8444-444444444444";
    await applyApprovedLessonOutput(outputId);
    await applyApprovedQuizOutput(outputId);

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(`/outputs/${outputId}/apply-lesson`);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(`/outputs/${outputId}/apply-quiz`);
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("POST");
  });

  it("uses explicit source-backed regeneration and non-destructive archive routes", async () => {
    const fetchMock = mockJson({ jobId: "job-3", status: "queued", totalUnits: 1, replayed: false }, 202);
    const itemId = "55555555-5555-4555-8555-555555555555";
    await enqueueQuestionRegeneration(itemId, {
      clientRequestId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      subjectDomain: "general",
    });
    mockJson({ replayed: false });
    await archiveQuestionBankItem(itemId);

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(`/question-bank/${itemId}/regenerate`);
  });

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
