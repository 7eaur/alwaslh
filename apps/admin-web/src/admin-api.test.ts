import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createCurriculumLesson,
  fetchAdminCurriculum,
  loginAdmin,
  restoreAdminSession,
  updateCurriculumLesson,
} from "./admin-api";

function response(body: unknown, status = 200): Response {
  return new Response(body === undefined ? undefined : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requestPath(url: string): string {
  return new URL(url, "http://admin.test").pathname;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin api client", () => {
  it("restores the admin session with credential cookies enabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({ profile: { id: "admin-1", role: "admin", displayName: "مدير" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(restoreAdminSession()).resolves.toEqual({
      id: "admin-1",
      role: "admin",
      displayName: "مدير",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestPath(url)).toBe("/v1/admin/me");
    expect(init.credentials).toBe("include");
  });

  it("posts admin credentials using the public auth contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({ profile: { id: "admin-2", role: "admin", displayName: null } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await loginAdmin("admin-user", "StrongPassword123!");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestPath(url)).toBe("/v1/auth/login");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ identifier: "admin-user", password: "StrongPassword123!" }));
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("returns the authoritative curriculum snapshot", async () => {
    const curriculum = { classes: [], subjects: [], offerings: [], sections: [], lessons: [] };
    const fetchMock = vi.fn().mockResolvedValue(response({ curriculum }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchAdminCurriculum()).resolves.toEqual(curriculum);
  });

  it("keeps lesson creation and movement on the documented routes", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => response({}));
    vi.stubGlobal("fetch", fetchMock);

    await createCurriculumLesson({
      classId: "11111111-1111-4111-8111-111111111111",
      subjectId: "22222222-2222-4222-8222-222222222222",
      sectionId: null,
      slug: "lesson-one",
      title: "الدرس الأول",
      position: 3,
    });
    await updateCurriculumLesson("33333333-3333-4333-8333-333333333333", { sectionId: null, position: 4 });

    expect(requestPath(fetchMock.mock.calls[0]?.[0] as string)).toBe("/v1/admin/curriculum/lessons");
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBe("POST");
    expect(requestPath(fetchMock.mock.calls[1]?.[0] as string)).toBe(
      "/v1/admin/curriculum/lessons/33333333-3333-4333-8333-333333333333",
    );
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).method).toBe("PATCH");
  });

  it("converts network failures into an explicit service-unavailable error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(fetchAdminCurriculum()).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      status: 0,
    });
  });

  it("preserves the backend public error code and message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({ error: { code: "CONFLICT", message: "السجل موجود بالفعل" } }, 409),
      ),
    );

    await expect(fetchAdminCurriculum()).rejects.toMatchObject({
      code: "CONFLICT",
      message: "السجل موجود بالفعل",
      status: 409,
    });
  });
});
