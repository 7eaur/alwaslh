import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudentLessonReader, listStudentCurriculum, studentAssetContentUrl } from "./auth-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Student curriculum API contract", () => {
  it("reads the canonical Student curriculum with the authenticated session", async () => {
    const curriculum = {
      classes: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          slug: "grade-12",
          name: "الصف الثالث الثانوي",
          description: null,
          position: 0,
          subjects: [
            {
              id: "22222222-2222-4222-8222-222222222222",
              slug: "physics",
              name: "الفيزياء",
              description: null,
              position: 0,
              unsectionedLessons: [],
              sections: [],
            },
          ],
        },
      ],
    };
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push([input, init]);
        return new Response(JSON.stringify({ curriculum }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    await expect(listStudentCurriculum()).resolves.toEqual(curriculum);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[0]).toBe("/v1/student/curriculum");
    expect(calls[0]?.[1]?.credentials).toBe("include");
    expect(calls[0]?.[1]?.method).toBeUndefined();
  });

  it("reads Reader metadata through the authenticated API without exposing storage paths", async () => {
    const lessonId = "33333333-3333-4333-8333-333333333333";
    const assetId = "44444444-4444-4444-8444-444444444444";
    const reader = {
      lesson: {
        id: lessonId,
        title: "قوانين نيوتن",
        summary: "ملخص منشور",
        contentRevision: 2,
        publishedAt: "2026-09-10T00:00:00.000Z",
      },
      assets: [
        {
          id: assetId,
          kind: "image",
          position: 0,
          mimeType: "image/webp",
          byteSize: 1200,
          width: 900,
          height: 1200,
          checksumSha256: "a".repeat(64),
          sourcePageNumber: 1,
          text: "نص معتمد للطالب",
        },
      ],
    };
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push([input, init]);
        return new Response(JSON.stringify({ reader }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    await expect(getStudentLessonReader(lessonId)).resolves.toEqual(reader);
    expect(calls[0]?.[0]).toBe(`/v1/student/lessons/${lessonId}/reader`);
    expect(calls[0]?.[1]?.credentials).toBe("include");
    expect(JSON.stringify(reader)).not.toContain("storageKey");
    expect(studentAssetContentUrl(assetId)).toBe(`/v1/student/lesson-assets/${assetId}/content`);
  });
});
