import { afterEach, describe, expect, it, vi } from "vitest";
import { listStudentCurriculum } from "./auth-api";

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
});
