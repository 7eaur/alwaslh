import { afterEach, describe, expect, it, vi } from "vitest";
import {
  answerStudentAssessmentQuestion,
  finalizeStudentAssessment,
  getStudentAssessmentSession,
  listStudentAttempts,
  listStudentQuizzes,
  startStudentAssessment,
} from "./auth-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

function okJson(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Student assessment API contract", () => {
  it("reads only the authenticated Student quiz catalog", async () => {
    const quizzes = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        title: "اختبار الطاقة",
        description: null,
        classId: "22222222-2222-4222-8222-222222222222",
        className: "الصف الثالث",
        subjectId: "33333333-3333-4333-8333-333333333333",
        subjectName: "الفيزياء",
        shuffleVersions: true,
        versions: [{ id: "44444444-4444-4444-8444-444444444444", versionNumber: 1, label: "النموذج أ" }],
      },
    ];
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push([input, init]);
        return okJson({ quizzes });
      }),
    );

    await expect(listStudentQuizzes()).resolves.toEqual(quizzes);
    expect(calls[0]?.[0]).toBe("/v1/student/quizzes");
    expect(calls[0]?.[1]?.credentials).toBe("include");
    expect(JSON.stringify(quizzes)).not.toContain("isCorrect");
    expect(JSON.stringify(quizzes)).not.toContain("answerText");
  });

  it("uses canonical session transitions without browser-side scoring", async () => {
    const quizId = "11111111-1111-4111-8111-111111111111";
    const versionId = "44444444-4444-4444-8444-444444444444";
    const sessionId = "55555555-5555-4555-8555-555555555555";
    const questionId = "66666666-6666-4666-8666-666666666666";
    const assessment = {
      session: {
        id: sessionId,
        mode: "practice",
        status: "in_progress",
        currentQuestionId: questionId,
        startedAt: "2026-09-10T00:00:00.000Z",
        completedAt: null,
      },
      quiz: {
        id: quizId,
        title: "اختبار الطاقة",
        description: null,
        classId: "22222222-2222-4222-8222-222222222222",
        subjectId: "33333333-3333-4333-8333-333333333333",
      },
      version: { id: versionId, versionNumber: 1, label: "النموذج أ" },
      progress: { questionCount: 1, answeredCount: 0 },
      questions: [
        {
          id: questionId,
          position: 0,
          lessonId: null,
          type: "multiple_choice",
          prompt: "ما وحدة الطاقة؟",
          options: [
            { id: "77777777-7777-4777-8777-777777777777", label: "الجول", position: 0 },
            { id: "88888888-8888-4888-8888-888888888888", label: "المتر", position: 1 },
          ],
          sourcePage: null,
          questionBankItemId: null,
          questionBankRevisionId: null,
          answer: null,
          feedback: null,
        },
      ],
      attempt: null,
    };
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push([input, init]);
        return okJson({ assessment });
      }),
    );

    await startStudentAssessment(quizId, { mode: "practice", versionId });
    await getStudentAssessmentSession(sessionId);
    await answerStudentAssessmentQuestion(sessionId, questionId, {
      selectedOptionId: "77777777-7777-4777-8777-777777777777",
    });
    await finalizeStudentAssessment(sessionId);

    expect(calls.map((call) => call[0])).toEqual([
      `/v1/student/quizzes/${quizId}/sessions`,
      `/v1/student/assessment-sessions/${sessionId}`,
      `/v1/student/assessment-sessions/${sessionId}/questions/${questionId}/answer`,
      `/v1/student/assessment-sessions/${sessionId}/finalize`,
    ]);
    expect(calls[0]?.[1]?.method).toBe("POST");
    expect(calls[0]?.[1]?.body).toBe(JSON.stringify({ mode: "practice", versionId }));
    expect(calls[2]?.[1]?.method).toBe("PUT");
    expect(calls[2]?.[1]?.body).toBe(
      JSON.stringify({ selectedOptionId: "77777777-7777-4777-8777-777777777777" }),
    );
    expect(calls.every((call) => call[1]?.credentials === "include")).toBe(true);
  });

  it("reads server-derived attempt history", async () => {
    const attempts = [
      {
        id: "99999999-9999-4999-8999-999999999999",
        sessionId: "55555555-5555-4555-8555-555555555555",
        quizId: "11111111-1111-4111-8111-111111111111",
        quizTitle: "اختبار الطاقة",
        versionId: "44444444-4444-4444-8444-444444444444",
        versionLabel: "النموذج أ",
        mode: "test",
        correctCount: 8,
        questionCount: 10,
        scorePercent: 80,
        completedAt: "2026-09-10T00:00:00.000Z",
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => okJson({ attempts })),
    );

    await expect(listStudentAttempts(5)).resolves.toEqual(attempts);
    expect(fetch).toHaveBeenCalledWith(
      "/v1/student/attempts?limit=5",
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
